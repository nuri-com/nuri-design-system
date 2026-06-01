/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT · DEMO
 *
 * <nuri-demo> · interactive component example container
 *
 * A docs widget for component pages. Encapsulates:
 *   · toolbar with locally-scoped toggles (theme / accent / neutral / font)
 *   · preview area where children render LIVE
 *   · code area showing the source markup verbatim
 *
 * Source of truth = the <template> child. Its innerHTML is BOTH
 * cloned into the preview (as live components) AND serialized for
 * the code display. One source, two views — can't drift.
 *
 * Toolbar controls write data-* attributes to an inner <nuri-scope>
 * wrapper. Scope is LOCAL — never touches NuriState or <html data-*>.
 * Reload returns to the page-default state (no persistence by design;
 * that's the page-level topbar's job).
 *
 * Usage:
 *   <nuri-demo controls="theme,accent,neutral,font">
 *     <template>
 *       <nuri-button variant="solid">Pay</nuri-button>
 *     </template>
 *   </nuri-demo>
 *
 * Attributes (all optional):
 *   controls="…"  — comma-separated subset of: theme, accent, neutral, font,
 *                   device (any combination, any order; omit for a toolbar-less
 *                   card). `device` is the playground opt-in (decision 57): when
 *                   listed, the preview renders inside a phone device frame
 *                   (bezel + status bar + home indicator) and the toolbar shows a
 *                   device picker that also drives the platform font. DS component
 *                   pages don't list it, so they are unaffected — the frame is
 *                   purely additive.
 *   label="…"     — label on the toolbar left (e.g. variant name "solid").
 *                   NOT named "title" because that would trigger native
 *                   browser tooltips on hover.
 *   subtitle="…"  — muted label next to the label (HTML allowed — for
 *                   inline <code>; trusted-content widget, no sanitisation)
 *   stack         — boolean. Preview area uses vertical flex (children
 *                   stacked + full-width) instead of centered. For demos
 *                   showing multiple buttons in a column.
 *   layout="…"    — card layout. "widget" (default) is the rounded, fully
 *                   bordered docs card (toolbar · preview · code, top → down).
 *                   "board" is the playground panel: 560px wide, no
 *                   border-radius, a single right border (panels butt into a
 *                   continuous canvas), a padding-less canvas, and the toolbar
 *                   moved BETWEEN the preview and the code.
 *
 * Defer-loaded so children (including <template>) are parsed before
 * connectedCallback runs. See AGENTS.md "Custom element pattern".
 * ────────────────────────────────────────────────────────────── */

(function () {
  'use strict';

  // Available values per scope dimension.
  //   theme / accent / neutral → NuriState.AVAILABLE (lib/docs/state.js)
  //   font                      → labels diverge from values, defined here
  // Single source of truth: this list mirrors lib/docs/shell.js · FONT_OPTIONS.
  // When the topbar controls are extracted in a future session, both will
  // consume the same registry.
  const FONT_OPTIONS = [
    { value: 'ios',     label: 'iOS' },
    { value: 'android', label: 'Android' },
    { value: 'pixel',   label: 'Pixel' },
  ];

  // Device presets for the playground `device` control (decision 57).
  // Each preset carries:
  //   · font     — the platform typeface (iOS → SF, Pixel/Android → Google Sans
  //                / Roboto); selecting a device also sets the scope's font.
  //   · platform — the chrome family (PLATFORM_CHROME below). Drives the status
  //                bar glyphs, the top cutout and the bottom control. Reflected
  //                as data-platform on the frame so demo.css can paint it.
  // `value` is reflected as data-device (frame dimensions). A new device is one
  // entry here + (only if a new platform) one PLATFORM_CHROME entry + CSS kit.
  const DEVICE_OPTIONS = [
    { value: 'iphone-17e', label: 'iPhone 17e', font: 'ios',     platform: 'ios' },
    { value: 'iphone-se',  label: 'iPhone SE',  font: 'ios',     platform: 'ios-classic' },
    { value: 'pixel-8',    label: 'Pixel 8',    font: 'pixel',   platform: 'pixel' },
    { value: 'android',    label: 'Android',    font: 'android', platform: 'android' },
  ];

  // Chrome kit per platform. Three independent traits the frame composes:
  //   · status — which status-bar glyph set (ios | android)
  //   · cutout — the top sensor housing (island | punch | none)
  //   · bottom — the navigation affordance (pill | buttons | none)
  // Pixel reads like a modern iPhone (operator's call): the floating black
  // Dynamic-Island bar + a gesture home pill — only the Android status glyphs
  // and typeface give it away. Generic Android is the distinct one: a punch-
  // hole camera + 3 transparent buttons on a safe-area band. iOS-classic (SE)
  // has no cutout and no on-screen control — its home button sits off-screen,
  // so we just give the black frame a thicker bezel (CSS).
  const PLATFORM_CHROME = {
    'ios':         { status: 'ios',     cutout: 'island', bottom: 'pill' },
    'ios-classic': { status: 'ios',     cutout: 'none',   bottom: 'none' },
    'pixel':       { status: 'android', cutout: 'island', bottom: 'pill' },
    'android':     { status: 'android', cutout: 'punch',  bottom: 'buttons' },
  };

  // Icons + renderers come from NuriControl (lib/docs/control/control.js).
  // Loaded before this file via the page's <script> tag order (both `defer`).
  // Fail loud if a page forgets the control.js link — silent destructure on
  // undefined would surface as a missing toolbar with no obvious cause.
  if (!window.NuriControl) {
    throw new Error('[NuriDemo] lib/docs/control/control.js must load before demo.js');
  }
  const { SUN_ICON, MOON_ICON } = window.NuriControl;

  const VALID_CONTROLS = ['theme', 'accent', 'neutral', 'font', 'device'];

  // `device` is NOT a cascade-scope dimension (it frames the preview, it
  // doesn't re-theme it), so it is excluded from the <nuri-scope> attrs and
  // wired separately to the frame element.
  const SCOPE_CONTROLS = ['theme', 'accent', 'neutral', 'font'];

  // <nuri-scope> uses `mode` (not `theme`) for the theme dimension —
  // it's the only prop that translates to a different data-* name
  // (data-theme). All others are 1:1 with their data-* names.
  const SCOPE_PROP = { theme: 'mode' };

  function escapeHtml(s) {
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function capitalize(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  function optionsFor(dim) {
    if (dim === 'font') return FONT_OPTIONS;
    if (dim === 'device') return DEVICE_OPTIONS;
    return null;
  }

  function labelFor(dim, value) {
    const opts = optionsFor(dim);
    if (opts) {
      const opt = opts.find(o => o.value === value);
      return opt ? opt.label : value;
    }
    return capitalize(value);
  }

  function valuesFor(dim) {
    const opts = optionsFor(dim);
    if (opts) return opts.map(o => o.value);
    return (window.NuriState && NuriState.AVAILABLE && NuriState.AVAILABLE[dim]) || [];
  }

  function pageDefault(dim) {
    return document.documentElement.dataset[dim] || valuesFor(dim)[0] || '';
  }

  class NuriDemo extends HTMLElement {
    connectedCallback() {
      // Guard: connectedCallback can fire multiple times (move to / from DOM).
      // Only do the heavy work once.
      if (this._upgraded) return;
      this._upgraded = true;

      const template = this.querySelector(':scope > template');
      if (!template) {
        console.warn('[NuriDemo] missing <template> child — nothing to render', this);
        return;
      }
      const sourceHtml = template.innerHTML.trim();

      const controls = (this.getAttribute('controls') || '')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)
        .filter(c => VALID_CONTROLS.includes(c));

      const label    = this.getAttribute('label')    || '';
      const subtitle = this.getAttribute('subtitle') || '';
      const stack    = this.hasAttribute('stack');
      const layout   = this.getAttribute('layout') === 'board' ? 'board' : 'widget';
      const device   = controls.includes('device') ? pageDefault('device') : '';

      // Initial scope state = current page state (inherit, don't override).
      // The user explicitly clicking a toolbar control creates the first
      // local override; before that, the demo follows the page. `device` is
      // not a scope dimension, so it never reaches <nuri-scope>.
      const scopeDims = controls.filter(c => SCOPE_CONTROLS.includes(c));
      // The accent must travel WITH the theme. The accent×theme tokens use a
      // compound selector ([data-accent="lilac"][data-theme="dark"]); a scope
      // that flips data-theme also matches the bare [data-theme="dark"] rule,
      // which RESETS the accent to the neutral-dark default. Without
      // data-accent on the SAME element the lilac-dark override never matches,
      // so the brand colour breaks in dark mode. Seed accent from the page
      // default whenever the scope carries the theme but not accent itself.
      if (scopeDims.includes('theme') && !scopeDims.includes('accent')) {
        scopeDims.push('accent');
      }
      const scopeAttrs = scopeDims.map(c => {
        const prop = SCOPE_PROP[c] || c;
        return `${prop}="${pageDefault(c)}"`;
      }).join(' ');

      // The device control also drives the font (a phone preset carries its
      // platform typeface). Seed the scope's initial font from the default
      // device, unless the demo already exposes a standalone `font` control.
      const deviceFont = device
        ? ((DEVICE_OPTIONS.find(o => o.value === device) || {}).font || '')
        : '';
      const scopeAttrsFull = deviceFont && !controls.includes('font')
        ? `${scopeAttrs} font="${deviceFont}"`
        : scopeAttrs;

      const showToolbar = controls.length || label;
      // `device` reframes the preview (it doesn't stack); the two modifiers
      // are mutually exclusive in practice.
      const previewCls = 'nuri-demo-card__preview'
        + (device ? ' nuri-demo-card__preview--device' : '')
        + (stack ? ' nuri-demo-card__preview--stack' : '');
      // In device mode the themeable scope is moved INSIDE the frame (it wraps
      // only the phone screen), so the controls re-theme just the device
      // content — the card chrome stays in the page's fixed light context.
      const previewInner = device
        ? this._renderDeviceFrame(sourceHtml, device, scopeAttrsFull)
        : sourceHtml;

      const toolbarHtml = showToolbar ? this._renderToolbar(controls, label, subtitle) : '';
      const previewHtml = `<div class="${previewCls}">${previewInner}</div>`;
      // Playground code is a FIXED dark slab (forced data-theme="dark") under
      // the light chrome; DS docs code follows the card's themeable scope.
      const codeAttrs = device ? ' data-theme="dark"' : '';
      const codeHtml = `<pre class="nuri-demo-card__code"${codeAttrs}><code>${escapeHtml(sourceHtml)}</code></pre>`;

      // Section order is the ONE thing the layout reorders in the DOM (not via
      // CSS `order`, so reading order / tab order stay correct): widget keeps
      // toolbar · preview · code; board moves the toolbar BETWEEN the preview
      // and the code. Everything else board changes is paint, dispatched off
      // data-layout in demo.css.
      const cardInner = layout === 'board'
        ? `${previewHtml}${toolbarHtml}${codeHtml}`
        : `${toolbarHtml}${previewHtml}${codeHtml}`;

      const cardHtml = `<div class="nuri-demo-card" data-layout="${layout}" data-controls="${controls.join(',')}">
            ${cardInner}
          </div>`;

      // Two theming models:
      //  · DS docs card (no device): ONE <nuri-scope> wraps the ENTIRE card so
      //    theme/neutral/font re-theme the self-contained demo (toolbar + code
      //    dim with the preview).
      //  · Playground device card: NO wrapping scope here — the card chrome
      //    inherits the playground's fixed light+cream context. The themeable
      //    scope lives inside the device frame (preview only) and the code is
      //    forced dark, so toggling a control changes ONLY the phone content.
      this.innerHTML = device
        ? cardHtml
        : `<nuri-scope class="nuri-demo-card__scope" ${scopeAttrsFull}>${cardHtml}</nuri-scope>`;

      this._wireControls();
    }

    _renderToolbar(controls, label, subtitle) {
      const titleBlock = label ? `<div class="nuri-demo-card__title">
        <span class="nuri-demo-card__title-label">${label}</span>
        ${subtitle ? `<span class="nuri-demo-card__title-meta">${subtitle}</span>` : ''}
      </div>` : '';
      const controlsBlock = controls.length ? `<div class="nuri-demo-card__controls">
        ${controls.map(c => this._renderControl(c)).join('')}
      </div>` : '';
      return `<div class="nuri-demo-card__toolbar">${titleBlock}${controlsBlock}</div>`;
    }

    _renderControl(dim) {
      const initial = pageDefault(dim);
      if (dim === 'theme') {
        return NuriControl.renderIconButton({
          role: 'theme',
          label: 'Toggle theme',
          icon: initial === 'dark' ? SUN_ICON : MOON_ICON,
        });
      }
      const options = valuesFor(dim).map(v => ({ value: v, label: labelFor(dim, v) }));
      return NuriControl.renderSelect({
        role: dim,
        label: capitalize(dim),
        options: options,
        current: initial,
      });
    }

    // The phone device frame (decision 57). The phone bezel + status bar +
    // cutout + bottom control are docs chrome; the SCREEN inside is bg-canvas
    // and themes through the surrounding <nuri-scope>, so the composed view
    // re-resolves exactly as it would on a real device when theme / neutral
    // change. The chrome glyphs are decorative inline SVG. data-device drives
    // the frame dimensions and data-platform drives the chrome kit, both from
    // CSS (attribute dispatch). The DOM differs per platform — island vs
    // punch-hole vs nav bar are structurally distinct — so JS composes the
    // structure (via PLATFORM_CHROME) and CSS owns the paint.
    _renderDeviceFrame(sourceHtml, device, scopeAttrs) {
      const preset = DEVICE_OPTIONS.find(o => o.value === device) || {};
      const platform = preset.platform || 'ios';
      const chrome = PLATFORM_CHROME[platform] || PLATFORM_CHROME['ios'];

      // The themeable <nuri-scope> wraps the SCREEN (cutout + status + viewport
      // + bottom), not the bezel: the dark hardware slab is fixed chrome, while
      // the screen surface re-resolves through the scope. It carries the
      // controllable class so _wireControls writes the device theme/neutral/
      // font here — and nowhere else on the card.
      return `
        <div class="nuri-device" data-device="${device}" data-platform="${platform}">
          <div class="nuri-device__frame">
            <nuri-scope class="nuri-demo-card__scope nuri-device__scope" ${scopeAttrs}>
              <div class="nuri-device__screen">
                ${this._renderCutout(chrome.cutout)}
                <div class="nuri-device__status">
                  <span class="nuri-device__time">9:41</span>
                  <span class="nuri-device__signals">${this._renderSignals(chrome.status)}</span>
                </div>
                <div class="nuri-device__viewport">${sourceHtml}</div>
                ${this._renderBottom(chrome.bottom)}
              </div>
            </nuri-scope>
          </div>
        </div>
      `;
    }

    // Top sensor housing. island = Dynamic-Island pill (iOS); punch = Android
    // punch-hole camera; none = notch-less (SE). Painted/positioned in CSS.
    _renderCutout(kind) {
      if (kind === 'none') return '';
      return `<div class="nuri-device__cutout nuri-device__cutout--${kind}" aria-hidden="true"></div>`;
    }

    // Status-bar signal cluster — iOS vs Android glyph sets (decorative SVG).
    _renderSignals(family) {
      if (family === 'android') {
        // Filled signal triangle · filled wifi fan · VERTICAL battery (Android).
        return `
          <svg class="nuri-device__glyph" viewBox="0 0 18 12" aria-hidden="true"><path d="M16.5 1.2v9.6a.6.6 0 0 1-.9.5L1.3 6.5a.6.6 0 0 1 0-1L15.6.7a.6.6 0 0 1 .9.5Z"/></svg>
          <svg class="nuri-device__glyph" viewBox="0 0 16 12" aria-hidden="true"><path d="M8 11.4.7 4.1a10.4 10.4 0 0 1 14.6 0L8 11.4Z"/></svg>
          <svg class="nuri-device__glyph nuri-device__glyph--battery-v" viewBox="0 0 12 16" aria-hidden="true"><rect x="4" y="0" width="4" height="2.2" rx="0.6"/><rect x="1" y="1.6" width="10" height="13.6" rx="2.6" fill="none" stroke="currentColor" stroke-width="1.2"/><rect x="2.8" y="4.8" width="6.4" height="8.6" rx="1.2"/></svg>
        `;
      }
      // iOS (default) — signal bars · wifi fan · horizontal battery.
      return `
        <svg class="nuri-device__glyph" viewBox="0 0 18 12" aria-hidden="true"><rect x="0" y="8" width="3" height="4" rx="1"/><rect x="5" y="5" width="3" height="7" rx="1"/><rect x="10" y="2" width="3" height="10" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1" opacity="0.35"/></svg>
        <svg class="nuri-device__glyph" viewBox="0 0 16 12" aria-hidden="true"><path d="M8 11.2 1.2 4.4a9.6 9.6 0 0 1 13.6 0L8 11.2Z" opacity="0.35"/><path d="M8 11.2 3.9 7.1a5.8 5.8 0 0 1 8.2 0L8 11.2Z"/></svg>
        <svg class="nuri-device__glyph nuri-device__glyph--battery" viewBox="0 0 26 12" aria-hidden="true"><rect x="0.5" y="0.5" width="22" height="11" rx="3" fill="none" stroke="currentColor" stroke-width="1" opacity="0.4"/><rect x="2" y="2" width="16" height="8" rx="1.5"/><rect x="24" y="4" width="1.5" height="4" rx="0.75" opacity="0.4"/></svg>
      `;
    }

    // Bottom navigation affordance. pill = gesture home bar (modern iOS / Pixel);
    // buttons = Android 3-button nav (back · home · recent), transparent on a
    // safe-area band; none = off-screen home button (SE), nothing on the screen.
    _renderBottom(kind) {
      if (kind === 'pill') return `<div class="nuri-device__home"></div>`;
      if (kind === 'buttons') {
        return `
          <div class="nuri-device__nav" aria-hidden="true">
            <svg class="nuri-device__navglyph" viewBox="0 0 24 24"><path d="M15 4.5 7.5 12l7.5 7.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            <svg class="nuri-device__navglyph" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="2"/></svg>
            <svg class="nuri-device__navglyph" viewBox="0 0 24 24"><rect x="4.5" y="4.5" width="15" height="15" rx="2.5" fill="none" stroke="currentColor" stroke-width="2"/></svg>
          </div>`;
      }
      return '';
    }

    // Re-skin the frame for a newly-picked device WITHOUT rebuilding the
    // viewport (the live composition keeps its element state). Swaps the three
    // platform-specific chrome parts in place: cutout, status glyphs, bottom
    // control — plus data-device / data-platform for the CSS-driven dimensions.
    _swapDeviceChrome(deviceEl, device) {
      const preset = DEVICE_OPTIONS.find(o => o.value === device) || {};
      const platform = preset.platform || 'ios';
      const chrome = PLATFORM_CHROME[platform] || PLATFORM_CHROME['ios'];
      deviceEl.setAttribute('data-device', device);
      deviceEl.setAttribute('data-platform', platform);

      const screen = deviceEl.querySelector('.nuri-device__screen');
      if (!screen) return;

      const oldCutout = screen.querySelector('.nuri-device__cutout');
      if (oldCutout) oldCutout.remove();
      const cutoutHtml = this._renderCutout(chrome.cutout);
      if (cutoutHtml) screen.insertAdjacentHTML('afterbegin', cutoutHtml);

      const signals = screen.querySelector('.nuri-device__signals');
      if (signals) signals.innerHTML = this._renderSignals(chrome.status);

      const oldBottom = screen.querySelector('.nuri-device__home, .nuri-device__nav');
      if (oldBottom) oldBottom.remove();
      const bottomHtml = this._renderBottom(chrome.bottom);
      if (bottomHtml) screen.insertAdjacentHTML('beforeend', bottomHtml);
    }

    _wireControls() {
      const scope = this.querySelector('.nuri-demo-card__scope');
      if (!scope) return;

      // The frame (if any) — the device picker writes data-device here.
      const deviceEl = this.querySelector('.nuri-device');

      this.querySelectorAll('[data-role]').forEach(ctrl => {
        const dim = ctrl.getAttribute('data-role');

        if (dim === 'device') {
          const select = ctrl.querySelector('select');
          if (select && deviceEl) {
            select.addEventListener('change', () => {
              // Swap dimensions + platform chrome (cutout / status glyphs /
              // bottom control), preserving the live viewport composition.
              this._swapDeviceChrome(deviceEl, select.value);
              // Switching device also switches the platform font on the scope.
              const opt = DEVICE_OPTIONS.find(o => o.value === select.value);
              if (opt && opt.font) scope.setAttribute('font', opt.font);
            });
          }
          return;
        }

        if (dim === 'theme') {
          ctrl.addEventListener('click', () => {
            const cur = scope.getAttribute('mode') || pageDefault('theme');
            const next = cur === 'dark' ? 'light' : 'dark';
            scope.setAttribute('mode', next);
            ctrl.innerHTML = next === 'dark' ? SUN_ICON : MOON_ICON;
          });
          return;
        }

        const select = ctrl.querySelector('select');
        if (!select) return;

        select.addEventListener('change', () => {
          const propName = SCOPE_PROP[dim] || dim;
          scope.setAttribute(propName, select.value);
        });
      });
    }
  }

  if (!customElements.get('nuri-demo')) {
    customElements.define('nuri-demo', NuriDemo);
  }
})();
