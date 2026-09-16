/* Nuri DS app wired to the live MCP: auto-connect on launch, home renders real
   get_account_status/cards/activity data, one-tap card+euro provisioning,
   human error messages. Session token is captured by live.js and never rendered. */
const h = React.createElement;
const N = window.Nuri;
const Live = window.NuriLive;
const {
  NuriRoot, Screen, Header, Footer, Topbar, TopbarLeading, TopbarTrailing,
  TopbarTitle, TopbarContent, IconButton, NuriIcon, Text, View, Scroll, Button,
  TabBar, TabBarItem, TabBarItemIcon, TabBarItemLabel,
  List, ListAction, ListActionLeadingAvatar, ListActionText, ListActionTextMuted,
  ListActionTrailingText, ListActionTrailIcon,
  TextField, TextFieldLabel, SelectField, SelectFieldLabel, SelectFieldValue, SelectFieldChevron,
  BottomSheet, BottomSheetPanel, Alert, AlertIcon,
} = N;

/* ---------- live data helpers (defensive: server shapes evolve) ---------- */
function scan(node, pred) {
  if (!node || typeof node !== 'object') return null;
  if (pred(node)) return node;
  for (const v of Object.values(node)) {
    const hit = scan(v, pred);
    if (hit) return hit;
  }
  return null;
}
function scanAll(node, pred, out = []) {
  if (!node || typeof node !== 'object') return out;
  if (pred(node)) out.push(node);
  for (const v of Object.values(node)) scanAll(v, pred, out);
  return out;
}
const eur = (n) => '€' + Number(n).toLocaleString('en-IE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function findBalance(d) {
  const hit = scan(d, (o) =>
    /^(EUR|euro)/i.test(String(o.currency || o.asset || '')) &&
    typeof +(o.balance ?? o.amount ?? o.value) === 'number' && !Number.isNaN(+(o.balance ?? o.amount ?? o.value)));
  return hit ? eur(+(hit.balance ?? hit.amount ?? hit.value)) : null;
}
function findIban(d) {
  const hit = scan(d, (o) => typeof o.iban === 'string' && o.iban.replace(/\s/g, '').length >= 15);
  if (hit) return hit.iban;
  const s = scan(d, (o) => Object.values(o).some((v) => typeof v === 'string' && /[A-Z]{2}\d{2}( ?[A-Z0-9]{4}){3,}/.test(v)));
  const m = s && Object.values(s).find((v) => typeof v === 'string' && /[A-Z]{2}\d{2}( ?[A-Z0-9]{4}){3,}/.test(v));
  return m ? m.match(/[A-Z]{2}\d{2}( ?[A-Z0-9]{4}){3,}/)[0] : null;
}
function findCard(d) {
  const hit = scan(d, (o) => (o.last4 || o.last_four || (typeof o.masked_pan === 'string')) && typeof o === 'object');
  if (!hit) return null;
  return {
    label: hit.label || hit.name || 'Virtual card',
    last4: String(hit.last4 || hit.last_four || String(hit.masked_pan).slice(-4)),
    holder: hit.holder || hit.cardholder || '',
    state: hit.status || hit.state || 'Active',
  };
}
function findActivity(d) {
  return scanAll(d, (o) => typeof +(o.amount ?? o.value) === 'number' && (o.description || o.title || o.merchant || o.counterparty || o.name))
    .slice(0, 8)
    .map((t, i) => {
      const amt = +(t.amount ?? t.value);
      return {
        id: t.id || 'tx' + i,
        icon: amt >= 0 ? 'arrow-down' : 'arrow-up',
        title: String(t.description || t.title || t.merchant || t.counterparty || t.name),
        when: String(t.date || t.when || t.created_at || '').slice(0, 10),
        amount: (amt >= 0 ? '+' : '-') + eur(Math.abs(amt)).slice(0),
      };
    });
}

/* Human message from a tool payload or thrown error. */
function human(err) {
  const raw = String(err?.message || err || '');
  const cleaned = raw.replace(/^[a-z_]+:\s*/i, '').replace(/RPC -?\d+:\s*/, '').trim();
  if (!cleaned || /fetch|network|failed to/i.test(raw)) return 'Cannot reach the service right now. Check your connection and try again.';
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

/* ---------- routing ---------- */
const ROUTES = ['home', 'send', 'provision', 'account'];
function routeFromHash() {
  const r = location.hash.replace(/^#\/?/, '');
  return ROUTES.includes(r) ? r : 'home';
}
function go(route) { location.hash = '#/' + route; }

/* ---------- shared bits ---------- */
const ConnCtx = React.createContext({ state: 'connecting' }); // connecting | connected | offline

function connPill(state) {
  const label = state === 'connected' ? 'Connected' : state === 'offline' ? 'Offline' : 'Connecting…';
  const cls = state === 'connected' ? 'app-pill app-pill--ready' : 'app-pill';
  return h('span', { className: cls }, label);
}

function flowTopbar(title) {
  const { state } = React.useContext(ConnCtx);
  return h(Header, { safeAreaTop: true, chrome: 'canvas' },
    h(Topbar, null,
      h(TopbarLeading, null,
        h(IconButton, { icon: 'chevron-left', variant: 'soft', accessibilityLabel: 'Back', onPress: () => go('home') })),
      h(TopbarContent, null, h(TopbarTitle, null, title)),
      h(TopbarTrailing, null, connPill(state))));
}

function ErrorAlert({ message, onRetry }) {
  if (!message) return null;
  return h(Alert, { accent: 'orange', variant: 'soft' },
    h(AlertIcon, { name: 'alert-circle' }),
    h(View, { direction: 'column', align: 'stretch', gap: 'xs' },
      h(Text, null, message),
      onRetry ? h(Button, { variant: 'soft', onPress: onRetry }, 'Try again') : null));
}

function field(label, props) {
  return h(TextField, props, h(TextFieldLabel, null, label));
}

function Sheet({ open, onClose, title, children }) {
  return h(BottomSheet, { open, onOpenChange: (v) => { if (!v) onClose(); } },
    h(BottomSheetPanel, null,
      h(View, { direction: 'column', align: 'stretch', gap: 'md', padding: 'lg' },
        h(Text, { size: 'lg', emphasis: true }, title),
        children)));
}

/* ---------- home: real MCP data ---------- */
function HomeScreen() {
  const { state } = React.useContext(ConnCtx);
  const [home, setHome] = React.useState(null); // {status,balance,iban,card,activity}
  const [approval, setApproval] = React.useState(null); // {url}
  const [error, setError] = React.useState(null);
  const [copied, setCopied] = React.useState(false);

  const load = React.useCallback(async () => {
    setError(null);
    try {
      const status = await Live.call('get_account_status', {});
      if (status.error && /not_approved|connect/i.test(status.error)) throw Object.assign(new Error(status.error), { requestId: status.request_id });
      if (status.status === 'connect_required' || status.status === 'approval_required') throw Object.assign(new Error(status.error || 'connect_required'), { requestId: status.request_id });
      const settled = (p) => p.catch(() => null);
      const [cards, balances, statement] = await Promise.all([
        settled(Live.call('cards', { action: 'list' })),
        settled(Live.call('bank', { action: 'balances' })),
        settled(Live.call('bank', { action: 'statement' })),
      ]);
      setHome({
        status: status.next_step?.label || status.message || (status.status ? String(status.status).replace(/_/g, ' ') : 'Account ready'),
        balance: findBalance(balances) || findBalance(status),
        iban: findIban(status),
        card: findCard(cards) || findCard(status),
        activity: findActivity(statement),
      });
      setApproval(null);
    } catch (e) {
      // Wallet not connected yet: start/resume the approval flow.
      try {
        const w = await Live.call('connect_wallet', e.requestId ? { request_id: e.requestId } : {});
        if (w.status === 'approval_required' && (w.approval_url || w.next_action?.url)) {
          setApproval({ url: w.approval_url || w.next_action.url, requestId: w.request_id });
          return;
        }
        if (w.error) throw new Error(w.error);
        // connected: try again
        return load();
      } catch (e2) {
        setError(human(e2));
      }
    }
  }, []);

  React.useEffect(() => { if (state === 'connected') load(); }, [state, load]);

  // Poll while approval is pending.
  React.useEffect(() => {
    if (!approval) return;
    const t = setInterval(async () => {
      try {
        const w = await Live.call('connect_wallet', approval.requestId ? { request_id: approval.requestId } : {});
        if (w.status && w.status !== 'approval_required') { setApproval(null); load(); }
      } catch { /* keep polling */ }
    }, 5000);
    return () => clearInterval(t);
  }, [approval, load]);

  const copyIban = () => {
    if (home?.iban && navigator.clipboard) navigator.clipboard.writeText(home.iban);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const body = state !== 'connected' && !home
    ? h(View, { direction: 'column', align: 'center', gap: 'md', paddingY: 'xl' },
        h(Text, { muted: true }, state === 'offline' ? 'Cannot reach the service right now.' : 'Connecting…'))
    : approval
      ? h(View, { direction: 'column', align: 'stretch', gap: 'md' },
          h(Alert, { accent: 'lilac', variant: 'soft' },
            h(AlertIcon, { name: 'info' }),
            h(Text, null, 'One more step: approve the connection to load your account.')),
          h(Button, { variant: 'primary', onPress: () => window.open(approval.url, '_blank') }, 'Approve connection'),
          h(Text, { muted: true }, 'This page continues by itself once you approved.'))
      : error
        ? h(React.Fragment, null,
            h(ErrorAlert, { message: error, onRetry: load }),
            h(Button, { variant: 'soft', onPress: load }, 'Try again'))
        : !home
          ? h(View, { direction: 'column', align: 'center', gap: 'md', paddingY: 'xl' },
              h(Text, { muted: true }, 'Loading your account…'))
          : h(React.Fragment, null,
              h('div', { className: 'app-hero' },
                h('span', { className: 'app-pill app-pill--ready' }, home.status),
                home.balance ? h('div', { className: 'app-hero-balance' }, home.balance) : null,
                h('div', { className: 'app-hero-sub' }, 'Total balance · Euro account')),
              home.card
                ? h('div', { className: 'app-card-widget' },
                    h('div', { className: 'app-card-top' }, h('span', null, home.card.label), h(NuriIcon, { name: 'card' })),
                    h('div', { className: 'app-card-number' }, '•••• ' + home.card.last4),
                    h('div', { className: 'app-card-bottom' }, h('span', null, home.card.holder), h('span', null, home.card.state)))
                : h(Button, { variant: 'primary', onPress: () => go('provision') }, 'Set up your card and euro account'),
              home.iban
                ? h(List, null,
                    h(ListAction, { onPress: copyIban, accessibilityLabel: 'Copy your IBAN' },
                      h(ListActionLeadingAvatar, { name: 'euro' }),
                      h(ListActionText, null, 'Your IBAN'),
                      h(ListActionTextMuted, null, home.iban),
                      copied ? h(ListActionTrailingText, null, 'Copied') : h(ListActionTrailIcon, { name: 'copy' })))
                : null,
              h(Button, { variant: 'primary', onPress: () => go('send') }, 'Send money'),
              home.activity.length
                ? h(View, { direction: 'column', align: 'stretch', gap: 'sm' },
                    h(Text, { size: 'lg', emphasis: true }, 'Activity'),
                    h(List, null, home.activity.map((a) =>
                      h(ListAction, { key: a.id, accessibilityLabel: a.title },
                        h(ListActionLeadingAvatar, { name: a.icon }),
                        h(ListActionText, null, a.title),
                        h(ListActionTextMuted, null, a.when),
                        h(ListActionTrailingText, null, a.amount),
                        h(ListActionTrailIcon, { name: 'chevron-right' })))))
                : null);

  return h(Screen, null,
    h(Header, { safeAreaTop: true, chrome: 'canvas' },
      h(Topbar, null,
        h(TopbarLeading, null, h(NuriIcon, { name: 'nuri' }), h(Text, { size: 'lg', emphasis: true }, 'Nuri')),
        h(TopbarTrailing, null, connPill(state)))),
    h(Scroll, null,
      h(View, { direction: 'column', align: 'stretch', gap: 'lg', paddingX: 'lg', paddingY: 'md' }, body)),
    h(Footer, { safeAreaBottom: true, chrome: 'canvas' },
      h(TabBar, null,
        h(TabBarItem, { selected: true, onPress: () => go('home') },
          h(TabBarItemIcon, { name: 'bank' }), h(TabBarItemLabel, null, 'Home')),
        h(TabBarItem, { selected: false, onPress: () => go('provision') },
          h(TabBarItemIcon, { name: 'card' }), h(TabBarItemLabel, null, 'Card')),
        h(TabBarItem, { selected: false, onPress: () => go('account') },
          h(TabBarItemIcon, { name: 'settings' }), h(TabBarItemLabel, null, 'Account')))));
}

/* ---------- send money (live payouts) ---------- */
function SendScreen() {
  const [step, setStep] = React.useState('form'); // form | quote | sent
  const [amount, setAmount] = React.useState('');
  const [iban, setIban] = React.useState('');
  const [name, setName] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const ready = amount.trim() && iban.trim() && name.trim();
  const quote = [
    ['You send', '€' + (amount || '0.00')],
    ['They receive', '€' + (amount || '0.00')],
    ['Our fee', '€0.00'],
    ['Arrives', 'Within one business day'],
  ];
  const send = async () => {
    setConfirmOpen(false);
    setBusy(true);
    setError(null);
    try {
      const r = await Live.call('payouts', { amount, iban, recipient_name: name, confirmed: true });
      if (r.error) throw new Error(r.error);
      setStep('sent');
    } catch (e) {
      setError(human(e));
    } finally {
      setBusy(false);
    }
  };
  return h(Screen, null,
    flowTopbar('Send money'),
    h(Scroll, null,
      h(View, { direction: 'column', align: 'stretch', gap: 'lg', paddingX: 'lg', paddingY: 'md' },
        step === 'sent'
          ? h(View, { direction: 'column', align: 'center', gap: 'md', paddingY: 'xl' },
              h(NuriIcon, { name: 'check-circle' }),
              h(Text, { size: 'xl', emphasis: true }, 'Money on its way'),
              h(Text, { muted: true }, '€' + amount + ' to ' + name + '.'),
              h(Button, { variant: 'primary', onPress: () => go('home') }, 'Back home'))
          : step === 'form'
            ? h(React.Fragment, null,
                h(ErrorAlert, { message: error }),
                h(View, { direction: 'column', align: 'stretch', gap: 'lg' },
                  field('Amount to send', { value: amount, onChangeText: setAmount, placeholder: 'e.g. 100.00', inputMode: 'decimal' }),
                  field('Their account number (IBAN)', { value: iban, onChangeText: setIban, placeholder: 'e.g. DE44 5001 0517 5407 3249 31' }),
                  field('Their full name', { value: name, onChangeText: setName, placeholder: 'e.g. Maria Schmidt' })),
                h(View, { paddingTop: 'md' },
                  h(Button, { variant: 'primary', disabled: !ready, onPress: () => setStep('quote') }, 'Continue')))
            : h(React.Fragment, null,
                h(Text, { size: 'lg', emphasis: true }, 'Your quote'),
                h('div', null, quote.map(([k, v]) =>
                  h('div', { key: k, className: 'app-quote-row' },
                    h('span', { className: 'app-quote-label' }, k),
                    h('span', { className: 'app-quote-value' }, v)))),
                h(ErrorAlert, { message: error }),
                h(View, { direction: 'column', align: 'stretch', gap: 'sm', paddingTop: 'md' },
                  h(Button, { variant: 'primary', disabled: busy, onPress: () => setConfirmOpen(true) }, busy ? 'Sending…' : 'Confirm and send'),
                  h(Button, { variant: 'soft', onPress: () => setStep('form') }, 'Back'))))),
    h(Sheet, { open: confirmOpen, onClose: () => setConfirmOpen(false), title: 'Confirm payment' },
      h('div', null, quote.map(([k, v]) =>
        h('div', { key: k, className: 'app-quote-row' },
          h('span', { className: 'app-quote-label' }, k),
          h('span', { className: 'app-quote-value' }, v)))),
      h(Text, { muted: true }, 'To ' + (name || '—') + ' · ' + (iban || '—')),
      h(Button, { variant: 'primary', onPress: send }, 'Confirm and send'),
      h(Button, { variant: 'soft', onPress: () => setConfirmOpen(false) }, 'Cancel')));
}

/* ---------- card + euro account provisioning (live, one tap) ---------- */
const PROVISION_STEPS = [
  { key: 'check', label: 'Checking your account' },
  { key: 'card', label: 'Creating your virtual card' },
  { key: 'euro', label: 'Opening your euro account' },
  { key: 'done', label: 'All set' },
];

function ProvisionScreen() {
  const [phase, setPhase] = React.useState('idle'); // idle | running | done
  const [active, setActive] = React.useState(0);
  const [result, setResult] = React.useState(null); // {message} | {error}
  const doneRef = React.useRef(false);

  React.useEffect(() => {
    if (phase !== 'running') return;
    if (active >= PROVISION_STEPS.length - 1 && doneRef.current) { setPhase('done'); return; }
    if (active >= PROVISION_STEPS.length - 1) return; // hold on last step until the call resolves
    const t = setTimeout(() => setActive(active + 1), 900);
    return () => clearTimeout(t);
  }, [phase, active, result]);

  const run = async () => {
    setActive(0);
    setPhase('running');
    setResult(null);
    doneRef.current = false;
    try {
      const r = await Live.call('provision_virtual_card_and_bank_account', {});
      if (r.error) throw new Error(r.error);
      const card = findCard(r);
      const iban = findIban(r);
      setResult({
        message: r.message ||
          'Your virtual card' + (card ? ' •• ' + card.last4 : '') + (iban ? ' and your IBAN are' : ' is') + ' ready on Home.',
      });
    } catch (e) {
      setResult({ error: human(e) });
    } finally {
      doneRef.current = true;
      setActive(PROVISION_STEPS.length - 1);
      setPhase('done');
    }
  };

  const rowState = (i) => phase === 'done' || i < active ? 'done' : phase === 'running' && i === active ? 'active' : 'pending';
  const rowIcon = (s) => s === 'done' ? 'check-circle' : s === 'active' ? 'spinner' : 'ring';
  return h(Screen, null,
    flowTopbar('Your card and euro account'),
    h(Scroll, null,
      h(View, { direction: 'column', align: 'stretch', gap: 'lg', paddingX: 'lg', paddingY: 'md' },
        phase === 'idle'
          ? h(React.Fragment, null,
              h(Text, { size: 'lg' }, 'Get a virtual card and your own euro account in one tap.'),
              h(Text, { muted: true }, 'No paperwork. You can use the card right away.'),
              h(Button, { variant: 'primary', onPress: run }, 'Set up your card and euro account'))
          : h(React.Fragment, null,
              h('div', null, PROVISION_STEPS.map((s, i) => {
                const st = rowState(i);
                return h('div', { key: s.key, className: 'app-progress-row app-progress-row--' + st },
                  h('span', { className: st === 'active' ? 'app-spin' : undefined, style: { display: 'inline-flex' } },
                    h(NuriIcon, { name: rowIcon(st) })),
                  s.label);
              })),
              phase === 'done'
                ? h(View, { direction: 'column', align: 'stretch', gap: 'sm', paddingTop: 'md' },
                    result?.error
                      ? h(React.Fragment, null,
                          h(ErrorAlert, { message: result.error }),
                          h(Button, { variant: 'primary', onPress: run }, 'Try again'),
                          h(Button, { variant: 'soft', onPress: () => go('home') }, 'Back home'))
                      : h(React.Fragment, null,
                          h(Alert, { accent: 'lilac', variant: 'soft' },
                            h(AlertIcon, { name: 'check-circle' }),
                            h(Text, null, result?.message || 'All set.')),
                          h(Button, { variant: 'primary', onPress: () => go('home') }, 'Back home')))
                : h(Text, { muted: true }, 'One moment…')))));
}

/* ---------- account setup (live create_account) ---------- */
function AccountScreen() {
  const [email, setEmail] = React.useState('');
  const [country, setCountry] = React.useState('');
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const [error, setError] = React.useState(null);
  const countries = ['Germany', 'Spain', 'France', 'Netherlands', 'Italy'];
  const ready = /.+@.+\..+/.test(email) && country;
  const create = async () => {
    setBusy(true);
    setError(null);
    try {
      const r = await Live.call('create_account', { email, country });
      if (r.error) throw new Error(r.error);
      setDone(true);
    } catch (e) {
      setError(human(e));
    } finally {
      setBusy(false);
    }
  };
  return h(Screen, null,
    flowTopbar('Set up your account'),
    h(Scroll, null,
      h(View, { direction: 'column', align: 'stretch', gap: 'lg', paddingX: 'lg', paddingY: 'md' },
        done
          ? h(View, { direction: 'column', align: 'center', gap: 'md', paddingY: 'xl' },
              h(NuriIcon, { name: 'check-circle' }),
              h(Text, { size: 'xl', emphasis: true }, 'Account created'),
              h(Text, { muted: true }, 'We sent your login link to ' + email + '.'),
              h(Button, { variant: 'primary', onPress: () => go('home') }, 'Back home'))
          : h(React.Fragment, null,
              h(Text, { muted: true }, 'One email address and your country. That is all we need to start.'),
              h(ErrorAlert, { message: error }),
              field('Email address', { value: email, onChangeText: setEmail, placeholder: 'you@example.com', inputMode: 'email' }),
              h(SelectField, { onPress: () => setPickerOpen(true), accessibilityLabel: 'Country you live in' },
                h(SelectFieldLabel, null, 'Country you live in'),
                h(SelectFieldValue, null, country || 'e.g. Germany'),
                h(SelectFieldChevron, null)),
              h(Button, { variant: 'primary', disabled: !ready || busy, onPress: create }, busy ? 'One moment…' : 'Create my account')))),
    h(Sheet, { open: pickerOpen, onClose: () => setPickerOpen(false), title: 'Country you live in' },
      h(List, null, countries.map((c) =>
        h(ListAction, { key: c, onPress: () => { setCountry(c); setPickerOpen(false); }, accessibilityLabel: c },
          h(ListActionText, null, c),
          c === country ? h(ListActionTrailIcon, { name: 'check-circle' }) : null)))));
}

/* ---------- app root: auto-connect on launch ---------- */
function App() {
  const [route, setRoute] = React.useState(routeFromHash());
  const [conn, setConn] = React.useState('connecting');
  React.useEffect(() => {
    const onHash = () => setRoute(routeFromHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  React.useEffect(() => {
    const off = Live.onState((s) => setConn(s.connected ? 'connected' : 'offline'));
    Live.connect().catch(() => {});
    return off;
  }, []);
  const screen = route === 'send' ? h(SendScreen)
    : route === 'provision' ? h(ProvisionScreen)
    : route === 'account' ? h(AccountScreen)
    : h(HomeScreen);
  return h(NuriRoot, { mode: 'light', accent: 'lilac' },
    h(ConnCtx.Provider, { value: { state: conn } },
      React.cloneElement(screen, { key: route })));
}

ReactDOM.createRoot(document.getElementById('ds-root')).render(h(App));
