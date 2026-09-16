/* Nuri DS app screens: home dashboard + 3 flows (account setup, card/euro provisioning, send money).
   Hash routing, one screen per route. Mock data only. Mounted from the plain bundle, no build step. */
const h = React.createElement;
const N = window.Nuri;
const {
  NuriRoot, Screen, Header, Footer, Topbar, TopbarLeading, TopbarTrailing,
  TopbarTitle, TopbarContent, IconButton, NuriIcon, Text, View, Scroll, Button,
  TabBar, TabBarItem, TabBarItemIcon, TabBarItemLabel,
  List, ListAction, ListActionLeadingAvatar, ListActionText, ListActionTextMuted,
  ListActionTrailingText, ListActionTrailIcon,
  TextField, TextFieldLabel, SelectField, SelectFieldLabel, SelectFieldValue, SelectFieldChevron,
  BottomSheet, BottomSheetPanel,
} = N;

/* ---------- mock data ---------- */
const mock = {
  balance: '€2,840.50',
  status: 'Account ready',
  iban: 'DE44 5001 0517 5407 3249 31',
  card: { label: 'Virtual card', last4: '4821', holder: 'J. DOE', state: 'Active' },
  activity: [
    { id: 'a1', icon: 'arrow-down', title: 'Salary — Studio Kraft', when: 'Today', amount: '+€2,400.00' },
    { id: 'a2', icon: 'arrow-up', title: 'Maria Schmidt', when: 'Yesterday', amount: '-€85.20' },
    { id: 'a3', icon: 'card', title: 'Card purchase — REWE', when: 'Mon', amount: '-€23.41' },
  ],
  accounts: ['Euro account · €2,840.50', 'Savings pocket · €1,150.00'],
  countries: ['Germany', 'Spain', 'France', 'Netherlands', 'Italy'],
};

const PROVISION_STEPS = [
  { key: 'check', label: 'Checking your account' },
  { key: 'card', label: 'Creating your virtual card' },
  { key: 'euro', label: 'Opening your euro account' },
  { key: 'done', label: 'All set' },
];

/* ---------- routing ---------- */
const ROUTES = ['home', 'send', 'provision', 'account'];
function routeFromHash() {
  const r = location.hash.replace(/^#\/?/, '');
  return ROUTES.includes(r) ? r : 'home';
}
function go(route) { location.hash = '#/' + route; }

/* ---------- shared bits ---------- */
function flowTopbar(title) {
  return h(Header, { safeAreaTop: true, chrome: 'canvas' },
    h(Topbar, null,
      h(TopbarLeading, null,
        h(IconButton, { icon: 'chevron-left', variant: 'soft', accessibilityLabel: 'Back', onPress: () => go('home') })),
      h(TopbarContent, null, h(TopbarTitle, null, title))));
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

/* ---------- home ---------- */
function HomeScreen() {
  const [copied, setCopied] = React.useState(false);
  const copyIban = () => {
    if (navigator.clipboard) navigator.clipboard.writeText(mock.iban);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };
  return h(Screen, null,
    h(Header, { safeAreaTop: true, chrome: 'canvas' },
      h(Topbar, null,
        h(TopbarLeading, null, h(NuriIcon, { name: 'nuri' }), h(Text, { size: 'lg', emphasis: true }, 'Nuri')),
        h(TopbarTrailing, null,
          h(IconButton, { icon: 'settings', variant: 'soft', accessibilityLabel: 'Account settings', onPress: () => go('account') })))),
    h(Scroll, null,
      h(View, { direction: 'column', align: 'stretch', gap: 'lg', paddingX: 'lg', paddingY: 'md' },
        // status hero
        h('div', { className: 'app-hero' },
          h('span', { className: 'app-pill app-pill--ready' }, mock.status),
          h('div', { className: 'app-hero-balance' }, mock.balance),
          h('div', { className: 'app-hero-sub' }, 'Total balance · Euro account')),
        // card widget
        h('div', { className: 'app-card-widget' },
          h('div', { className: 'app-card-top' },
            h('span', null, mock.card.label),
            h(NuriIcon, { name: 'card' })),
          h('div', { className: 'app-card-number' }, '•••• ' + mock.card.last4),
          h('div', { className: 'app-card-bottom' },
            h('span', null, mock.card.holder),
            h('span', null, mock.card.state))),
        // IBAN row with copy affordance
        h(List, null,
          h(ListAction, { onPress: copyIban, accessibilityLabel: 'Copy your IBAN' },
            h(ListActionLeadingAvatar, { name: 'euro' }),
            h(ListActionText, null, 'Your IBAN'),
            h(ListActionTextMuted, null, mock.iban),
            copied
              ? h(ListActionTrailingText, null, 'Copied')
              : h(ListActionTrailIcon, { name: 'copy' }))),
        h(Button, { variant: 'primary', onPress: () => go('send') }, 'Send money'),
        // activity
        h(View, { direction: 'column', align: 'stretch', gap: 'sm' },
          h(Text, { size: 'lg', emphasis: true }, 'Activity'),
          h(List, null,
            mock.activity.map((a) =>
              h(ListAction, { key: a.id, accessibilityLabel: a.title },
                h(ListActionLeadingAvatar, { name: a.icon }),
                h(ListActionText, null, a.title),
                h(ListActionTextMuted, null, a.when),
                h(ListActionTrailingText, null, a.amount),
                h(ListActionTrailIcon, { name: 'chevron-right' }))))))),
    h(Footer, { safeAreaBottom: true, chrome: 'canvas' },
      h(TabBar, null,
        h(TabBarItem, { selected: true, onPress: () => go('home') },
          h(TabBarItemIcon, { name: 'bank' }), h(TabBarItemLabel, null, 'Home')),
        h(TabBarItem, { selected: false, onPress: () => go('provision') },
          h(TabBarItemIcon, { name: 'card' }), h(TabBarItemLabel, null, 'Card')),
        h(TabBarItem, { selected: false, onPress: () => go('account') },
          h(TabBarItemIcon, { name: 'settings' }), h(TabBarItemLabel, null, 'Account')))));
}

/* ---------- send money ---------- */
function SendScreen() {
  const [step, setStep] = React.useState('form'); // form | quote | sent
  const [amount, setAmount] = React.useState('');
  const [iban, setIban] = React.useState('');
  const [name, setName] = React.useState('');
  const [account, setAccount] = React.useState(mock.accounts[0]);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const ready = amount.trim() && iban.trim() && name.trim();
  const quote = [
    ['You send', '€' + (amount || '0.00')],
    ['They receive', '€' + (amount || '0.00')],
    ['Our fee', '€0.00'],
    ['Arrives', 'Within one business day'],
  ];
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
                h(View, { direction: 'column', align: 'stretch', gap: 'lg' },
                  field('Amount to send', { value: amount, onChangeText: setAmount, placeholder: 'e.g. 100.00', inputMode: 'decimal' }),
                  field('Their account number (IBAN)', { value: iban, onChangeText: setIban, placeholder: 'e.g. DE44 5001 0517 5407 3249 31' }),
                  field('Their full name', { value: name, onChangeText: setName, placeholder: 'e.g. Maria Schmidt' }),
                  h(SelectField, { onPress: () => setPickerOpen(true), accessibilityLabel: 'From account' },
                    h(SelectFieldLabel, null, 'From account'),
                    h(SelectFieldValue, null, account),
                    h(SelectFieldChevron, null))),
                h(View, { paddingTop: 'md' },
                  h(Button, { variant: 'primary', disabled: !ready, onPress: () => setStep('quote') }, 'Continue')))
            : h(React.Fragment, null,
                h(Text, { size: 'lg', emphasis: true }, 'Your quote'),
                h('div', null, quote.map(([k, v]) =>
                  h('div', { key: k, className: 'app-quote-row' },
                    h('span', { className: 'app-quote-label' }, k),
                    h('span', { className: 'app-quote-value' }, v)))),
                h(View, { direction: 'column', align: 'stretch', gap: 'sm', paddingTop: 'md' },
                  h(Button, { variant: 'primary', onPress: () => setConfirmOpen(true) }, 'Confirm and send'),
                  h(Button, { variant: 'soft', onPress: () => setStep('form') }, 'Back'))))),
    // confirm as BottomSheet
    h(Sheet, { open: confirmOpen, onClose: () => setConfirmOpen(false), title: 'Confirm payment' },
      h('div', null, quote.map(([k, v]) =>
        h('div', { key: k, className: 'app-quote-row' },
          h('span', { className: 'app-quote-label' }, k),
          h('span', { className: 'app-quote-value' }, v)))),
      h(Text, { muted: true }, 'To ' + (name || '—') + ' · ' + (iban || '—')),
      h(Button, { variant: 'primary', onPress: () => { setConfirmOpen(false); setStep('sent'); } }, 'Confirm and send'),
      h(Button, { variant: 'soft', onPress: () => setConfirmOpen(false) }, 'Cancel')),
    // account picker
    h(Sheet, { open: pickerOpen, onClose: () => setPickerOpen(false), title: 'From account' },
      h(List, null, mock.accounts.map((a) =>
        h(ListAction, { key: a, onPress: () => { setAccount(a); setPickerOpen(false); }, accessibilityLabel: a },
          h(ListActionLeadingAvatar, { name: 'euro-wallet' }),
          h(ListActionText, null, a),
          a === account ? h(ListActionTrailIcon, { name: 'check-circle' }) : null)))));
}

/* ---------- card + euro account provisioning ---------- */
function ProvisionScreen() {
  const [phase, setPhase] = React.useState('idle'); // idle | running | done
  const [active, setActive] = React.useState(0);
  React.useEffect(() => {
    if (phase !== 'running') return;
    if (active >= PROVISION_STEPS.length) { setPhase('done'); return; }
    const t = setTimeout(() => setActive(active + 1), 900);
    return () => clearTimeout(t);
  }, [phase, active]);
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
              h(Button, { variant: 'primary', onPress: () => { setActive(0); setPhase('running'); } }, 'Set up my card and account'))
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
                    h(Text, { size: 'lg', emphasis: true }, 'All set'),
                    h(Text, { muted: true }, 'Your virtual card •• ' + mock.card.last4 + ' and your IBAN are ready on Home.'),
                    h(Button, { variant: 'primary', onPress: () => go('home') }, 'Back home'))
                : h(Text, { muted: true }, 'One moment…')))));
}

/* ---------- account setup ---------- */
function AccountScreen() {
  const [email, setEmail] = React.useState('');
  const [country, setCountry] = React.useState('');
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const ready = /.+@.+\..+/.test(email) && country;
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
              field('Email address', { value: email, onChangeText: setEmail, placeholder: 'you@example.com', inputMode: 'email' }),
              h(SelectField, { onPress: () => setPickerOpen(true), accessibilityLabel: 'Country you live in' },
                h(SelectFieldLabel, null, 'Country you live in'),
                h(SelectFieldValue, null, country || 'e.g. Germany'),
                h(SelectFieldChevron, null)),
              h(Button, { variant: 'primary', disabled: !ready, onPress: () => setDone(true) }, 'Create my account')))),
    h(Sheet, { open: pickerOpen, onClose: () => setPickerOpen(false), title: 'Country you live in' },
      h(List, null, mock.countries.map((c) =>
        h(ListAction, { key: c, onPress: () => { setCountry(c); setPickerOpen(false); }, accessibilityLabel: c },
          h(ListActionText, null, c),
          c === country ? h(ListActionTrailIcon, { name: 'check-circle' }) : null)))));
}

/* ---------- app root ---------- */
function App() {
  const [route, setRoute] = React.useState(routeFromHash());
  React.useEffect(() => {
    const onHash = () => setRoute(routeFromHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  const screen = route === 'send' ? h(SendScreen)
    : route === 'provision' ? h(ProvisionScreen)
    : route === 'account' ? h(AccountScreen)
    : h(HomeScreen);
  return h(NuriRoot, { mode: 'light', accent: 'lilac' },
    // one screen per route: key forces a full remount on navigation
    React.cloneElement(screen, { key: route }));
}

ReactDOM.createRoot(document.getElementById('ds-root')).render(h(App));
