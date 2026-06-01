/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT · CONTROL
 *
 * Shared markup helpers for the select-pill + icon-button controls
 * used by the docs chrome. Two call sites:
 *   · lib/docs/shell.js · topbar (Font · Neutral · Theme toggle)
 *   · lib/docs/demo/demo.js · demo toolbar (Theme · Accent · Neutral · Font)
 *
 * Pre-N+3.5 both sites duplicated the markup + icons + class names.
 * This module is the single source of truth. CSS lives at
 * lib/docs/control/control.css. See roadmap/N+3.5.md.
 *
 * Exposed as window.NuriControl. No module system.
 *
 *   NuriControl.renderSelect({ role, label, options, current })
 *     options · [{ value, label }]
 *     Returns markup with class .nuri-control wrapping a <label> + <select>.
 *
 *   NuriControl.renderIconButton({ role, label, icon })
 *     Returns markup with class .nuri-control nuri-control--icon
 *     wrapping a <button>. `icon` is an HTML/SVG string.
 *
 * Call sites wire change/click handlers by querying [data-role="…"]
 * — the data-role attribute is set from the `role` field.
 * ────────────────────────────────────────────────────────────── */

(function () {
  'use strict';

  // Inline SVG icons. `currentColor` lets the SVG inherit its host
  // control's text color — decision 15 (background-image data URIs
  // don't inherit currentColor because the SVG is parsed as a
  // standalone resource; inline SVG does).
  const SUN_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>';
  const MOON_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
  const CARET_ICON = '<svg class="nuri-control__caret" width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 1l4 4 4-4"/></svg>';

  function escapeAttr(s) {
    return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function renderSelect({ role, label, options, current }) {
    const opts = options.map((o) => {
      const sel = o.value === current ? ' selected' : '';
      return `<option value="${escapeAttr(o.value)}"${sel}>${escapeHtml(o.label)}</option>`;
    }).join('');
    return ''
      + `<label class="nuri-control" data-role="${escapeAttr(role)}">`
      +   '<span class="nuri-control__inner">'
      +     `<span class="nuri-control__label">${escapeHtml(label)}</span>`
      +     `<select class="nuri-control__select" aria-label="${escapeAttr(label)}">${opts}</select>`
      +     CARET_ICON
      +   '</span>'
      + '</label>';
  }

  function renderIconButton({ role, label, icon }) {
    return ''
      + `<button class="nuri-control nuri-control--icon" type="button" data-role="${escapeAttr(role)}" aria-label="${escapeAttr(label)}">`
      +   icon
      + '</button>';
  }

  window.NuriControl = {
    renderSelect: renderSelect,
    renderIconButton: renderIconButton,
    SUN_ICON: SUN_ICON,
    MOON_ICON: MOON_ICON,
    CARET_ICON: CARET_ICON,
  };
})();
