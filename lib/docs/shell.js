/* ──────────────────────────────────────────────────────────────
 * NURI DESIGN SYSTEM · DOCS SHELL
 * Custom elements that compose the documentation chrome.
 * Vanilla, no deps. Each page imports this once.
 *
 * Elements:
 *   <nuri-shell active="...">   wraps a page with sidebar + topbar + content
 *   <nuri-page eyebrow="..." title="..." lead="..." status="...">
 *
 * The early theme/neutral bootstrap (reading localStorage and setting
 * data-* attributes on <html>) is centralised in lib/docs/state.js, loaded
 * synchronously in each page's <head> before stylesheets — no flash
 * on reload. shell.js only reads from / writes to NuriState; it never
 * touches localStorage directly.
 * ────────────────────────────────────────────────────────────── */

(() => {
  const SCRIPT = document.currentScript;
  // Two levels up from lib/docs/shell.js (decision 26).
  const ROOT = new URL('../../', SCRIPT.src).href;

  // ── Nav structure ────────────────────────────────────────────
  const NAV = [
    {
      group: 'Get started',
      items: [
        { id: 'principles',           label: 'Principles',           href: 'pages/principles.html' },
        { id: 'implementation-guide', label: 'Implementation guide', href: 'pages/implementation-guide.html' },
        { id: 'changelog',            label: 'Changelog',            placeholder: true },
      ],
    },
    {
      group: 'Foundations',
      items: [
        // "Colour" is a non-clickable section header (decision 23) — the
        // sub-pages below are the real destinations. header: true renders
        // as a non-interactive label, not a link. Order is canonical
        // (primitive → semantic → exploration), NOT alphabetical: it
        // reflects layer dependency and importance, matching the prose
        // in decisionlog.md decision 23.
        { id: 'foundations/colour',             label: 'Colour',      header: true },
        { id: 'foundations/colour/primitive',   label: 'Primitive',   href: 'pages/foundations/colour/primitive.html',   nested: true },
        { id: 'foundations/colour/semantic',    label: 'Semantic',    href: 'pages/foundations/colour/semantic.html',    nested: true },
        { id: 'foundations/colour/exploration', label: 'Exploration', href: 'pages/foundations/colour/exploration.html', nested: true },
        { id: 'foundations/typography',       label: 'Typography', href: 'pages/foundations/typography.html' },
        // "Dimension" mirrors the "Colour" non-clickable section
        // header (decision 23). Four children: Primitive first
        // (foundation of the foundations — the --nuri-px-N scale
        // that the three semantic vocabularies alias), then the
        // three semantic dimension vocabularies — Spacing, Sizing
        // (decision 36 · N+6.1), Radius (amendment 36.1 · N+6.1.1).
        // All four pages live nested under foundations/dimension/
        // — symmetric with the colour group's nested structure.
        { id: 'foundations/dimension',           label: 'Dimension', header: true },
        { id: 'foundations/dimension/primitive', label: 'Primitive', href: 'pages/foundations/dimension/primitive.html', nested: true },
        { id: 'foundations/dimension/spacing',   label: 'Spacing',   href: 'pages/foundations/dimension/spacing.html',   nested: true },
        { id: 'foundations/dimension/sizing',    label: 'Sizing',    href: 'pages/foundations/dimension/sizing.html',    nested: true },
        { id: 'foundations/dimension/radius',    label: 'Radius',    href: 'pages/foundations/dimension/radius.html',    nested: true },
        { id: 'foundations/elevation',        label: 'Elevation',  placeholder: true },
        { id: 'foundations/motion',           label: 'Motion',     placeholder: true },
        { id: 'foundations/iconography',      label: 'Iconography',href: 'pages/foundations/iconography.html' },
      ],
    },
    {
      // Single Components group with sub-section headers (Actions /
      // Layout / Inputs / Display / Navigation / Data / Overlays)
      // — same hierarchy shape as Foundations (Colour / Dimension
      // as non-clickable headers above their nested children).
      // Operator-locked post-N+6.5 NAV polish: collapses the
      // previous 7 "Components · X" eyebrow groups into one to
      // match the Foundations pattern.
      group: 'Components',
      items: [
        // ── Theming · <nuri-scope> Tier 3 primitive (decisions 27/28 ·
        //    web↔RN scope spec · the migration "start here") ──
        { id: 'components/theming',     label: 'Theming',    header: true },
        { id: 'components/scope',       label: 'Scope',      href: 'pages/components/scope.html', nested: true },

        // ── Actions · Button + IconButton (decisions 24/39/40/41) ──
        { id: 'components/actions',     label: 'Actions',    header: true },
        { id: 'components/button',      label: 'Button',     href: 'pages/components/button.html',      nested: true },
        { id: 'components/icon-button', label: 'IconButton', href: 'pages/components/icon-button.html', nested: true },

        // ── Layout · Stack + Box + Screen + Scroll (decision 37 layout
        //    primitives · decision 42 Box bg/radius props · decision 58
        //    Screen/Scroll scaffold · N+6.2 / N+6.5 / N+11) ──
        { id: 'components/layout',      label: 'Layout',     header: true },
        { id: 'components/stack',       label: 'Stack',      href: 'pages/components/stack.html',  nested: true },
        { id: 'components/box',         label: 'Box',        href: 'pages/components/box.html',    nested: true },
        { id: 'components/screen',      label: 'Screen',     href: 'pages/components/screen.html', nested: true },
        { id: 'components/scroll',      label: 'Scroll',     href: 'pages/components/scroll.html', nested: true },
        { id: 'components/spacer',      label: 'Spacer',     href: 'pages/components/spacer.html', nested: true },

        // ── Inputs · Switch live · others deferred ──
        { id: 'components/inputs',         label: 'Inputs',      header: true },
        { id: 'components/input-field',    label: 'InputField',  placeholder: true, nested: true },
        { id: 'components/amount-input',   label: 'AmountInput', placeholder: true, nested: true },
        { id: 'components/dropdown',       label: 'Dropdown',    placeholder: true, nested: true },
        { id: 'components/switch',         label: 'Switch',      href: 'pages/components/switch.html', nested: true },
        { id: 'components/chip',           label: 'Chip',        placeholder: true, nested: true },

        // ── Display · Typography live · others deferred ──
        { id: 'components/display',          label: 'Display',          header: true },
        { id: 'components/typography',       label: 'Typography',       href: 'pages/components/typography.html', nested: true },
        { id: 'components/typography-stack', label: 'TypographyStack',  href: 'pages/components/typography-stack.html', nested: true },
        { id: 'components/icon-avatar',      label: 'IconAvatar',       href: 'pages/components/icon-avatar.html', nested: true },
        { id: 'components/separator',        label: 'Separator',        href: 'pages/components/separator.html', nested: true },
        { id: 'components/card',             label: 'Card',             placeholder: true, nested: true },
        { id: 'components/info-card',        label: 'InfoCard',         placeholder: true, nested: true },
        { id: 'components/tag',              label: 'Tag',              placeholder: true, nested: true },
        { id: 'components/label',            label: 'Label',            placeholder: true, nested: true },
        { id: 'components/status-pill',      label: 'StatusPill',       placeholder: true, nested: true },
        { id: 'components/notification-badge', label: 'NotificationBadge', placeholder: true, nested: true },
        { id: 'components/progress-bar',     label: 'ProgressBar',      placeholder: true, nested: true },
        { id: 'components/spinner',          label: 'Spinner',          placeholder: true, nested: true },
        { id: 'components/address-display',  label: 'AddressDisplay',   placeholder: true, nested: true },
        { id: 'components/qr-card',          label: 'QrCard',           placeholder: true, nested: true },

        // ── Navigation · Tabs live · others deferred ──
        { id: 'components/navigation',    label: 'Navigation',   header: true },
        { id: 'components/tabs',          label: 'Tabs',         href: 'pages/components/tabs.html', nested: true },
        { id: 'components/topbar',        label: 'Topbar',       href: 'pages/components/topbar.html', nested: true },
        { id: 'components/tab-bar',       label: 'TabBar',       href: 'pages/components/tab-bar.html', nested: true },
        { id: 'components/icon-tab-row',  label: 'IconTabRow',   placeholder: true, nested: true },
        { id: 'components/screen-header', label: 'ScreenHeader', placeholder: true, nested: true },
        { id: 'components/modal-header',  label: 'ModalHeader',  placeholder: true, nested: true },

        // ── Data · all deferred ──
        { id: 'components/data',             label: 'Data',            header: true },
        { id: 'components/balance-header',   label: 'BalanceHeader',   placeholder: true, nested: true },

        // ── List · promoted to its own section (decision 52 · docs
        //    section-per-recipe micro-pattern). The presentational +
        //    interactive primitives live on Base; the nav-item recipe
        //    gets its own sub-page. Retires the single list.html. ──
        { id: 'components/list',          label: 'List',             header: true },
        { id: 'components/list-base',     label: 'Base',             href: 'pages/components/list-base.html',     nested: true },
        { id: 'components/list-nav-item', label: 'Navigation Item',  href: 'pages/components/list-nav-item.html', nested: true },

        // ── Overlays · all deferred ──
        { id: 'components/overlays',        label: 'Overlays',       header: true },
        { id: 'components/modal-sheet',     label: 'ModalSheet',     placeholder: true, nested: true },
        { id: 'components/success-modal',   label: 'SuccessModal',   placeholder: true, nested: true },
        { id: 'components/floating-status', label: 'FloatingStatus', placeholder: true, nested: true },
      ],
    },
  ];

  // Single source: lib/docs/state.js · NuriState.AVAILABLE.neutral
  const NEUTRAL_SCALES = NuriState.AVAILABLE.neutral;
  const FONT_OPTIONS = [
    { value: 'ios',     label: 'iOS' },
    { value: 'android', label: 'Android' },
    { value: 'pixel',   label: 'Pixel' },
  ];

  // ── State helpers ────────────────────────────────────────────
  // Persistence + DOM-mirror is centralised in lib/docs/state.js (NuriState).
  // Getters just read from <html data-*> — that's the source of truth.
  const getTheme   = () => document.documentElement.dataset.theme   || 'light';
  const getNeutral = () => document.documentElement.dataset.neutral || 'gray';
  const getFont    = () => document.documentElement.dataset.font    || 'ios';

  const setTheme   = (t) => NuriState.set('theme',   t);
  const setNeutral = (n) => NuriState.set('neutral', n);
  const setFont    = (f) => NuriState.set('font',    f);

  // ── Icons + select-pill renderer · from NuriControl ─────────────
  // control.js must be loaded before shell.js in document order
  // (the page wires both <script>s with `defer`, so source order
  // wins). If a future page forgets the control.js <script> link,
  // shout — silent destructure on undefined is the worst failure mode.
  if (!window.NuriControl) {
    throw new Error('[NuriShell] lib/docs/control/control.js must load before shell.js');
  }
  const { SUN_ICON, MOON_ICON } = window.NuriControl;

  // ────────────────────────────────────────────────────────────
  // <nuri-shell active="...">
  // ────────────────────────────────────────────────────────────
  class NuriShell extends HTMLElement {
    connectedCallback() {
      const active = this.getAttribute('active') || '';

      // Sidebar
      const sidebar = document.createElement('aside');
      sidebar.className = 'nuri-shell__sidebar';
      sidebar.innerHTML = this.#brandHtml() + this.#navHtml(active) + this.#footerHtml();

      // Right column: topbar + main
      const col = document.createElement('div');
      col.className = 'nuri-shell__col';

      const topbar = document.createElement('div');
      topbar.className = 'nuri-shell__topbar';
      topbar.innerHTML = this.#topbarHtml();
      col.appendChild(topbar);

      const main = document.createElement('main');
      main.className = 'nuri-shell__main';
      while (this.firstChild) main.appendChild(this.firstChild);
      col.appendChild(main);

      this.appendChild(sidebar);
      this.appendChild(col);

      // Wire topbar controls
      this.#wireTopbar(topbar);
    }

    #brandHtml() {
      // Brand links to ROOT (index.html) so the single redirect target
      // there is the source of truth for the landing — decision 23.
      return `
        <a class="nuri-shell__brand" href="${ROOT}">
          <span class="nuri-shell__brand-mark">N</span>
          <span class="nuri-shell__brand-text">
            <span class="nuri-shell__brand-name">Nuri</span>
            <span class="nuri-shell__brand-meta">Design System · v0.0.1</span>
          </span>
        </a>
      `;
    }

    #navHtml(activeId) {
      const groups = NAV.map(g => {
        const items = g.items.map(it => {
          const isActive = it.id === activeId;
          const isPlaceholder = !!it.placeholder;
          const isNested = !!it.nested;
          const isHeader = !!it.header;
          const classes = [
            'nuri-shell__nav-link',
            isPlaceholder ? 'nuri-shell__nav-link--placeholder' : '',
            isNested ? 'nuri-shell__nav-link--nested' : '',
            isHeader ? 'nuri-shell__nav-link--header' : '',
          ].filter(Boolean).join(' ');
          // Section headers render as non-interactive <p> — they group
          // the indented children below without being a link themselves.
          if (isHeader) {
            return `<p class="${classes}">${it.label}</p>`;
          }
          const href = isPlaceholder ? '#' : `${ROOT}${it.href}`;
          const aria = isActive ? 'aria-current="page"' : '';
          return `<a class="${classes}" href="${href}" ${aria}>${it.label}</a>`;
        }).join('');
        return `
          <div class="nuri-shell__nav-group">
            <p class="nuri-shell__nav-group-title">${g.group}</p>
            ${items}
          </div>`;
      }).join('');
      return `<nav class="nuri-shell__nav">${groups}</nav>`;
    }

    #footerHtml() {
      // Pinned footer · a sibling of the SCROLLING nav (sidebar is a flex
      // column · the nav is flex:1+overflow, this is flex:none), so the CTA
      // stays anchored to the sidebar bottom and never scrolls away. The
      // Playground is a SEPARATE area (decision 57), so it lives here as a
      // CTA rather than a nav-tree item — always one click away from any DS
      // page. Plain styled <a> (no <nuri-button> dependency on every page).
      return `
        <div class="nuri-shell__footer">
          <a class="nuri-shell__footer-link" href="${ROOT}pages/playground/index.html">Playground</a>
        </div>
      `;
    }

    #topbarHtml() {
      const currentTheme = getTheme();
      const themeIcon = currentTheme === 'dark' ? SUN_ICON : MOON_ICON;
      const themeAria = currentTheme === 'dark' ? 'Switch to light' : 'Switch to dark';

      const neutralOptions = NEUTRAL_SCALES.map(n => ({
        value: n,
        label: n.charAt(0).toUpperCase() + n.slice(1),
      }));

      return [
        NuriControl.renderSelect({
          role: 'font',
          label: 'Font',
          options: FONT_OPTIONS,
          current: getFont(),
        }),
        NuriControl.renderSelect({
          role: 'neutral',
          label: 'Neutral',
          options: neutralOptions,
          current: getNeutral(),
        }),
        NuriControl.renderIconButton({
          role: 'theme',
          label: themeAria,
          icon: themeIcon,
        }),
      ].join('');
    }

    #wireTopbar(topbar) {
      const sel = topbar.querySelector('[data-role="neutral"]');
      sel.addEventListener('change', (e) => setNeutral(e.target.value));

      const fontSel = topbar.querySelector('[data-role="font"]');
      fontSel.addEventListener('change', (e) => setFont(e.target.value));

      const btn = topbar.querySelector('[data-role="theme"]');
      btn.addEventListener('click', () => {
        const next = getTheme() === 'dark' ? 'light' : 'dark';
        setTheme(next);
        btn.innerHTML = next === 'dark' ? SUN_ICON : MOON_ICON;
        btn.setAttribute('aria-label', next === 'dark' ? 'Switch to light' : 'Switch to dark');
      });
    }
  }

  // ────────────────────────────────────────────────────────────
  // <nuri-page eyebrow="..." title="..." lead="..." status="...">
  // ────────────────────────────────────────────────────────────
  class NuriPage extends HTMLElement {
    connectedCallback() {
      const eyebrow = this.getAttribute('eyebrow');
      const title = this.getAttribute('title') || '';
      const lead = this.getAttribute('lead') || '';
      const status = this.getAttribute('status'); // "draft" | "ready"

      const head = document.createElement('header');
      head.className = 'nuri-shell__page-head';

      const crumbs = eyebrow ? `<p class="nuri-shell__breadcrumb">${eyebrow}</p>` : '';
      const statusTag = status
        ? `<span class="nuri-tag nuri-tag--${status}">${status}</span>`
        : '';

      head.innerHTML = `
        ${crumbs}
        <h1 class="nuri-shell__title">${title}${statusTag}</h1>
        ${lead ? `<p class="nuri-shell__lead">${lead}</p>` : ''}
      `;
      this.insertBefore(head, this.firstChild);
    }
  }

  customElements.define('nuri-shell', NuriShell);
  customElements.define('nuri-page', NuriPage);
})();
