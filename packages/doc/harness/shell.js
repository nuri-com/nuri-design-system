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
      group: 'Reference',
      items: [
        { id: 'components',        label: 'Components',       href: 'components.html' },
        { id: 'typography',        label: 'Typography',       href: 'generated/foundations/typography.html' },
        { id: 'dimension',         label: 'Dimension',        href: 'generated/foundations/dimension.html' },
        { id: 'colour-semantic',   label: 'Colour Semantic',  href: 'generated/foundations/colour-semantic.html' },
        { id: 'colour-primitive',  label: 'Colour Primitive', href: 'generated/foundations/colour-primitive.html' },
        { id: 'stack-axis',        label: 'Stack Axis',       href: 'generated/axes/stack.html' },
        { id: 'box-axis',          label: 'Box Axis',         href: 'generated/axes/box.html' },
        { id: 'palette-axis',      label: 'Palette Axis',     href: 'generated/axes/palette.html' },
        { id: 'interactive-axis',  label: 'Interactive Axis', href: 'generated/axes/interactive.html' },
        { id: 'typography-axis',   label: 'Typography Axis',  href: 'generated/axes/typography.html' },
      ],
    },
    {
      group: 'Components',
      items: [
        { id: 'components/button',             label: 'Button',             href: 'generated/components/button.html' },
        { id: 'components/alert',              label: 'Alert',              href: 'generated/components/alert.html' },
        { id: 'components/icon-button',        label: 'Icon Button',        href: 'generated/components/icon-button.html' },
        { id: 'components/icon-avatar',        label: 'Icon Avatar',        href: 'generated/components/icon-avatar.html' },
        { id: 'components/list',               label: 'List',               href: 'generated/components/list.html' },
        { id: 'components/list-action',        label: 'List Action',        href: 'generated/components/list-action.html' },
        { id: 'components/select-field',       label: 'Select Field',       href: 'generated/components/select-field.html' },
        { id: 'components/select-trigger',     label: 'Select Trigger',     href: 'generated/components/select-trigger.html' },
        { id: 'components/text-field',         label: 'Text Field',         href: 'generated/components/text-field.html' },
        { id: 'components/tab-bar',            label: 'Tab Bar',            href: 'generated/components/tab-bar.html' },
        { id: 'components/tab-bar-item',       label: 'Tab Bar Item',       href: 'generated/components/tab-bar-item.html' },
        { id: 'components/topbar',             label: 'Topbar',             href: 'generated/components/topbar.html' },
        { id: 'components/view',               label: 'View',               href: 'generated/components/view.html' },
        { id: 'components/typography',         label: 'Typography',         href: 'generated/components/typography.html' },
        { id: 'components/icon',               label: 'Icon',               href: 'generated/components/icon.html' },
        { id: 'components/pressable',          label: 'Pressable',          href: 'generated/components/pressable.html' },
        { id: 'components/screen',             label: 'Screen',             href: 'generated/components/screen.html' },
        { id: 'components/header',             label: 'Header',             href: 'generated/components/header.html' },
        { id: 'components/scroll',             label: 'Scroll',             href: 'generated/components/scroll.html' },
        { id: 'components/footer',             label: 'Footer',             href: 'generated/components/footer.html' },
        { id: 'components/dock',               label: 'Dock',               href: 'generated/components/dock.html' },
        { id: 'components/separator',          label: 'Separator',          href: 'generated/components/separator.html' },
        { id: 'components/modal',               label: 'Modal',              href: 'generated/components/modal.html' },
        { id: 'components/modal-panel',         label: 'Modal Panel',        href: 'generated/components/modal-panel.html' },
        { id: 'components/nuri-root',          label: 'NuriRoot',           href: 'generated/components/nuri-root.html' },
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
