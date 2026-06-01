/* ──────────────────────────────────────────────────────────────
 * NURI · TOKEN PARSER
 * Reads token declarations from the live CSS stylesheets and
 * returns them in a flat, set-tagged shape compatible with the
 * future DTCG tokens.json pipeline. The same shape feeds the
 * shared `.nuri-token-table` widget in shell.css.
 *
 * Token shape (DTCG-aligned):
 *   {
 *     set:        'core',                          // Tokens Studio "set"
 *     name:       'color.gray.1.light',            // DTCG dot-notation
 *     cssVar:     '--nuri-color-gray-1-light',     // CSS custom property
 *     value:      '#fcfcfc',                       // resolved value
 *     reference?: 'var(--nuri-color-neutral-1-light)', // semantic only
 *     type:       'color',                         // DTCG $type
 *   }
 *
 * Under `parseSemantics({ bothThemes: true })` (decision 20.1, N+6.0.2),
 * `value` + `reference` are replaced by `valueLight + valueDark` +
 * `referenceLight + referenceDark` — both walks resolve against the
 * same requested accent under different themes (the reference can
 * itself vary per theme, e.g. `var(--nuri-color-neutral-1-light)` →
 * `var(--nuri-color-neutral-1-dark)`).
 * `renderTable({ showBothModes: true, accent })` consumes that shape
 * to emit a 7-column table (DTCG · CSS var · Reference Light · Light
 * · Reference Dark · Dark · Type) with the inline swatch chip moved
 * from the DTCG name cell into each Reference cell — one chip per
 * (theme, accent) cell carrying matching `data-theme` + `data-accent`
 * attrs so the chip renders the resolved colour for its own cascade
 * context. Defaults preserve the single-`value` 5-column shape with
 * the chip in the DTCG name cell; opt-ins are strictly additive.
 *
 * The DTCG `$type` is inferred from the CSS var prefix per the
 * mapping documented in AGENTS.md and tokens-primitive.css.
 *
 * Exposed as window.NuriTokens. No module system.
 * ────────────────────────────────────────────────────────────── */

(function () {
  // Order matters: longer / more specific prefixes first. The "Component
  // token suffix" group at the bottom catches generic --nuri-<component>-*
  // patterns (e.g. --nuri-button-solid-bg) that the prefix-based group
  // above doesn't recognise. Without these the component token tables
  // would show all rows as "unknown".
  const TYPE_PREFIXES = [
    // ── Primitive / semantic prefixes (anchored by category) ──
    [/^--nuri-color-/,       'color'],
    [/^--nuri-bg-/,          'color'],
    [/^--nuri-text-/,        'color'],
    [/^--nuri-border-(subtle|default|strong)/, 'color'],
    [/^--nuri-accent-/,      'color'],
    [/^--nuri-focus-/,       'color'],
    [/^--nuri-px-/,          'dimension'],
    [/^--nuri-size-/,        'dimension'],
    [/^--nuri-space-/,       'dimension'],
    [/^--nuri-radius-/,      'dimension'],
    [/^--nuri-font-size-/,   'dimension'],
    [/^--nuri-line-height-/, 'dimension'],
    [/^--nuri-border-/,      'dimension'],
    [/^--nuri-font-family-/, 'fontFamily'],
    [/^--nuri-font-weight-/, 'fontWeight'],
    [/^--nuri-duration-/,    'duration'],
    [/^--nuri-shadow-/,      'shadow'],
    [/^--nuri-type-/,        'typography'],
    // ── Component token suffix (catches --nuri-<comp>-* patterns) ──
    // Run AFTER the prefix-based matchers above so primitive/semantic
    // tokens never fall through to these heuristics by accident.
    [/-(bg|fg)(-hover|-pressed|-disabled|-active|-focus)?$/, 'color'],
    [/-(min-|max-)?(height|width)$/,                          'dimension'],
    [/-(padding|margin)(-x|-y|-top|-right|-bottom|-left)?$/,  'dimension'],
    [/-(radius|gap|offset|stroke|inset)$/,                    'dimension'],
    [/-font-size$/,                                           'dimension'],
    [/-size$/,                                                'dimension'],
    [/-font-weight$/,                                         'fontWeight'],
    [/-(opacity|scale)$/,                                     'number'],
    [/-duration$/,                                            'duration'],
  ];

  function inferType(cssVar) {
    for (const [re, type] of TYPE_PREFIXES) {
      if (re.test(cssVar)) return type;
    }
    return 'unknown';
  }

  // "--nuri-color-gray-1-light" → "color.gray.1.light"
  function dtcgName(cssVar) {
    return cssVar.replace(/^--nuri-/, '').replace(/-/g, '.');
  }

  function findSheet(hrefSubstring) {
    for (const sheet of document.styleSheets) {
      if (sheet.href && sheet.href.includes(hrefSubstring)) return sheet;
    }
    return null;
  }

  // Resolve a CSS custom property to its final value under given
  // (theme, accent) by attaching a hidden wrapper with the right
  // data-* attributes. Used for semantic resolution.
  function resolveValue(cssVar, theme, accent) {
    const w = document.createElement('div');
    if (theme)  w.setAttribute('data-theme', theme);
    if (accent) w.setAttribute('data-accent', accent);
    w.style.cssText = 'position:absolute;left:-9999px;visibility:hidden;pointer-events:none;';
    document.body.appendChild(w);
    const v = getComputedStyle(w).getPropertyValue(cssVar).trim();
    w.remove();
    return v;
  }

  // Flatten a sheet's rule tree into the STYLE_RULE descendants, in
  // source order. Walks into @layer, @media, @supports, @container
  // blocks (anything that exposes inner cssRules) so component CSS
  // organised in @layer blocks is still parseable.
  //
  // Returns an array; callers iterate it as a flat list.
  function flatStyleRules(rules) {
    const out = [];
    function walk(rs) {
      for (const r of rs) {
        if (r.type === CSSRule.STYLE_RULE) {
          out.push(r);
        } else if (r.cssRules) {
          walk(r.cssRules);
        }
      }
    }
    walk(rules);
    return out;
  }

  // Pick the winning declaration for (cssVar, theme, accent) by walking
  // the cascade of tokens-semantic.css. Matches NURI's specific
  // 6-block structure (see tokens-semantic.css header).
  function selectorMatches(selector, theme, accent) {
    const sel = selector.trim();
    if (sel === ':root') return { matches: true, spec: 1 };
    const attrCount = (sel.match(/\[/g) || []).length;
    if (attrCount === 0) return { matches: false, spec: 0 };
    const themeOk = sel.includes('[data-theme="dark"]') ? theme === 'dark' : true;
    const neutralOk = sel.includes('[data-accent="neutral"]') ? accent === 'neutral' : true;
    const lilacOk = sel.includes('[data-accent="lilac"]') ? accent === 'lilac' : true;
    return { matches: themeOk && neutralOk && lilacOk, spec: attrCount };
  }

  function findReference(sheet, cssVar, theme, accent) {
    const matches = [];
    const rules = flatStyleRules(sheet.cssRules);
    for (let idx = 0; idx < rules.length; idx++) {
      const rule = rules[idx];
      const m = selectorMatches(rule.selectorText, theme, accent);
      if (m.matches) {
        const val = rule.style.getPropertyValue(cssVar);
        if (val && val.trim()) {
          matches.push({ spec: m.spec, idx, value: val.trim() });
        }
      }
    }
    if (!matches.length) return null;
    matches.sort((a, b) => (b.spec - a.spec) || (b.idx - a.idx));
    return matches[0].value;
  }

  // Read primitive declarations from a sheet's :root rule.
  // Skips declarations whose value is a `var(...)` reference — those
  // are aliases (e.g. --nuri-color-neutral-N-light → --nuri-color-gray-N-light),
  // not raw primitives.
  function parsePrimitives(sheet, opts) {
    opts = opts || {};
    const set = opts.set || 'core';
    const filter = opts.filter || null;
    const out = [];
    for (const rule of flatStyleRules(sheet.cssRules)) {
      if (rule.selectorText.trim() !== ':root') continue;
      for (const cssVar of rule.style) {
        if (!cssVar.startsWith('--nuri-')) continue;
        if (filter && !filter(cssVar)) continue;
        const value = rule.style.getPropertyValue(cssVar).trim();
        if (value.startsWith('var(')) continue;
        out.push({
          set: set,
          name: dtcgName(cssVar),
          cssVar: cssVar,
          value: value,
          type: inferType(cssVar),
        });
      }
    }
    sanityCheck('parsePrimitives', sheet, out);
    return out;
  }

  // Read semantic tokens (resolved for active theme/accent). For each
  // unique cssVar declared in the sheet, returns:
  //   reference — raw source value (e.g. "var(--nuri-color-neutral-1-light)")
  //   value     — resolved final value after walking the var() chain
  // Cascade resolution uses NURI's 6-block semantic ordering.
  //
  // bothThemes:true opt-in (decision 20.1) — for the accent argument,
  // resolves each token against BOTH theme=light AND theme=dark and
  // populates `valueLight + valueDark` instead of `value`, AND
  // `referenceLight + referenceDark` instead of `reference` (the
  // reference itself can vary per theme; e.g. block 1 refs
  // neutral-1-light, block 2 refs neutral-1-dark for the same
  // `--nuri-bg-canvas`). Pages documenting the full resolution matrix
  // (semantic.html since N+6.0.2) consume this; pages documenting a
  // single-context view keep the default single-`value` shape.
  function parseSemantics(sheet, opts) {
    opts = opts || {};
    const set = opts.set || 'core';
    const theme = opts.theme;
    const accent = opts.accent;
    const filter = opts.filter || null;
    const bothThemes = !!opts.bothThemes;

    const seen = new Set();
    const order = [];
    for (const rule of flatStyleRules(sheet.cssRules)) {
      for (const cssVar of rule.style) {
        if (!cssVar.startsWith('--nuri-')) continue;
        if (!seen.has(cssVar)) {
          seen.add(cssVar);
          order.push(cssVar);
        }
      }
    }

    const out = [];
    for (const cssVar of order) {
      if (filter && !filter(cssVar)) continue;
      if (bothThemes) {
        out.push({
          set: set,
          name: dtcgName(cssVar),
          cssVar: cssVar,
          referenceLight: findReference(sheet, cssVar, 'light', accent),
          referenceDark:  findReference(sheet, cssVar, 'dark',  accent),
          valueLight:     resolveValue(cssVar, 'light', accent),
          valueDark:      resolveValue(cssVar, 'dark',  accent),
          type: inferType(cssVar),
        });
      } else {
        out.push({
          set: set,
          name: dtcgName(cssVar),
          cssVar: cssVar,
          reference: findReference(sheet, cssVar, theme, accent),
          value: resolveValue(cssVar, theme, accent),
          type: inferType(cssVar),
        });
      }
    }
    sanityCheck('parseSemantics', sheet, out);
    return out;
  }

  // Runtime smoke check · noise instead of silent failure.
  // Fires once per parse call. Three conditions:
  //   1. Zero tokens returned → sheet probably failed to load (CORS,
  //      404, parsing race). Most painful silent failure historically.
  //   2. Tokens with type=unknown → naming convention drifted or the
  //      type-inference table in this file needs a new prefix.
  //   3. (semantic only) any token with null reference → cascade lookup
  //      failed, the page will render "—" in the Reference column.
  // Surfaces in browser DevTools console; non-blocking.
  function sanityCheck(label, sheet, tokens) {
    const href = (sheet && sheet.href) || '<unknown>';
    if (tokens.length === 0) {
      console.warn(
        `[NuriTokens] ${label}: 0 tokens parsed from ${href}. ` +
        `Sheet may have failed to load or a filter is too narrow.`
      );
      return;
    }
    const unknown = tokens.filter(t => t.type === 'unknown');
    if (unknown.length) {
      console.warn(
        `[NuriTokens] ${label}: ${unknown.length} token(s) with type=unknown ` +
        `(prefix not matched in TYPE_PREFIXES):`,
        unknown.map(t => t.cssVar)
      );
    }
    const noRef = tokens.filter(t =>
      ('reference' in t && t.reference == null)
      || ('referenceLight' in t && t.referenceLight == null)
      || ('referenceDark'  in t && t.referenceDark  == null)
    );
    if (noRef.length) {
      console.warn(
        `[NuriTokens] ${label}: ${noRef.length} semantic token(s) with no ` +
        `reference (cascade lookup failed):`,
        noRef.map(t => t.cssVar)
      );
    }
  }

  // ── Renderer · `.nuri-token-table` ────────────────────────────
  // Single point of truth for the table widget. Pages pass a list
  // of tokens and options; this returns the HTML string.

  // "var(--nuri-color-neutral-1-light)" → "--nuri-color-neutral-1-light"
  function refInner(rawRef) {
    if (!rawRef) return '—';
    const m = rawRef.match(/var\(\s*(--[\w-]+)\s*\)/);
    return m ? m[1] : rawRef;
  }

  function escape(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  // Inline swatch · default placement is the start of the DTCG name
  // cell, hanging to the LEFT via negative margin so token NAMES align
  // consistently whether the row has a swatch or not.
  // Non-color tokens skip the swatch entirely.
  function inlineSwatchHTML(token) {
    if (token.type !== 'color') return '';
    const isAlpha = token.cssVar.includes('-alpha-');
    const onDark = token.cssVar.includes('white-alpha');
    const cls = 'nuri-swatch nuri-swatch--inline'
      + (isAlpha ? ' nuri-swatch--alpha' : '')
      + (onDark ? ' nuri-swatch--on-dark' : '');
    const styleProp = isAlpha ? '--alpha-fill' : 'background';
    return `<span class="${cls}" style="${styleProp}: var(${token.cssVar})"></span>`;
  }

  // Mode-scoped swatch · used by showBothModes inside each Reference
  // cell. Carries data-theme + data-accent attrs directly so the
  // var() resolves against that explicit cascade context (independent
  // of the live `<html data-*>` state). Reuses .nuri-swatch--inline
  // (24px + negative margin) so the chip hangs to the LEFT of the
  // cell's padding-left, MATCHING the chip placement primitive.html
  // uses inside its DTCG name cell — reference TEXT then starts at
  // the column-header edge (e.g. `--nuri-color-neutral-1-light` aligns
  // with the "Reference Light" thead-th, exactly as primitive.html's
  // `color.neutral.1.light` aligns with the "DTCG" thead-th).
  function modeSwatchHTML(token, theme, accent) {
    if (token.type !== 'color') return '';
    const attrs = `data-theme="${theme}"`
      + (accent ? ` data-accent="${accent}"` : '');
    return `<span class="nuri-swatch nuri-swatch--inline" ${attrs} style="background: var(${token.cssVar})"></span>`;
  }

  function renderTable(tokens, opts) {
    opts = opts || {};
    const showReference = !!opts.showReference;
    const showBothModes = !!opts.showBothModes;
    const accent = opts.accent || null;
    const caption = opts.caption || null;

    // showBothModes lays out 7 columns:
    //   DTCG · CSS var · Reference Light · Light · Reference Dark · Dark · Type
    // (the chip moves from the DTCG cell into each Reference cell —
    // one chip per cascade context). Reference Light + Reference Dark
    // <th> + <td> carry an inline `padding-left: var(--nuri-px-48)` so
    // the `.nuri-swatch--inline` negative margin can hang the chip OUT
    // of the cell content area into the padding gutter (same trick
    // primitive.html's first-cell DTCG column gets for free via
    // shell.css's `td:first-child` rule). Reference TEXT then starts
    // at the column-header edge — visual parity with primitive.
    // Default lays out 5: DTCG · CSS var · (Reference) · Value · Type
    const refColStyle = ' style="padding-left: var(--nuri-px-48)"';
    const heads = showBothModes
      ? [
          '<th scope="col">DTCG</th>',
          '<th scope="col">CSS var</th>',
          `<th scope="col"${refColStyle}>Reference Light</th>`,
          '<th scope="col">Light</th>',
          `<th scope="col"${refColStyle}>Reference Dark</th>`,
          '<th scope="col">Dark</th>',
          '<th scope="col">Type</th>',
        ].join('')
      : [
          '<th scope="col">DTCG</th>',
          '<th scope="col">CSS var</th>',
          showReference ? '<th scope="col">Reference</th>' : '',
          '<th scope="col">Value</th>',
          '<th scope="col">Type</th>',
        ].filter(Boolean).join('');

    const rows = tokens.map(function (t) {
      // Name cell · in showBothModes the chip moves OUT of this cell
      // (it lives inside each Reference cell instead). Default keeps
      // the chip here hanging to the left via negative margin so
      // token NAMES align with the column-header edge.
      const nameInner = showBothModes
        ? `<span class="nuri-token-table__cell-name-inner">${escape(t.name)}</span>`
        : `<span class="nuri-token-table__cell-name-inner">${inlineSwatchHTML(t)}${escape(t.name)}</span>`;

      let trailingCells;
      if (showBothModes) {
        // Reference cells reuse the .__cell-name-inner flex wrapper so
        // .nuri-swatch--inline's negative margin-left can hang the
        // chip OUT of the cell content area into the padding gutter.
        // The cell's inline padding-left = px-48 matches the math the
        // class expects (margin-left = -px-48 + px-6 = -42px →
        // chip-left = 6px from cell border, text-start = 48px from
        // cell border = aligned with the column-header edge). Same
        // pattern primitive.html's first-cell DTCG column gets for
        // free; this just replicates the math on a non-first cell.
        const refLightInner = `<span class="nuri-token-table__cell-name-inner">${modeSwatchHTML(t, 'light', accent)}${escape(refInner(t.referenceLight))}</span>`;
        const refDarkInner  = `<span class="nuri-token-table__cell-name-inner">${modeSwatchHTML(t, 'dark',  accent)}${escape(refInner(t.referenceDark))}</span>`;
        trailingCells =
            `<td class="nuri-token-table__cell-mono nuri-token-table__cell-muted"${refColStyle}>${refLightInner}</td>`
          + `<td class="nuri-token-table__cell-mono nuri-token-table__cell-muted">${escape(t.valueLight)}</td>`
          + `<td class="nuri-token-table__cell-mono nuri-token-table__cell-muted"${refColStyle}>${refDarkInner}</td>`
          + `<td class="nuri-token-table__cell-mono nuri-token-table__cell-muted">${escape(t.valueDark)}</td>`;
      } else {
        const refCell = showReference
          ? `<td class="nuri-token-table__cell-mono nuri-token-table__cell-muted">${escape(refInner(t.reference))}</td>`
          : '';
        trailingCells = refCell
          + `<td class="nuri-token-table__cell-mono nuri-token-table__cell-muted">${escape(t.value)}</td>`;
      }

      return ''
        + '<tr>'
        +   `<td class="nuri-token-table__cell-mono nuri-token-table__cell-name">${nameInner}</td>`
        +   `<td class="nuri-token-table__cell-mono nuri-token-table__cell-muted">${escape(t.cssVar)}</td>`
        +   trailingCells
        +   `<td class="nuri-token-table__cell-type">${escape(t.type)}</td>`
        + '</tr>';
    }).join('');

    const cap = caption
      ? `<caption class="nuri-token-table__caption">${escape(caption)}</caption>`
      : '';

    // Wrapped in .nuri-table-scroll so the table can break out of the
    // shell-main padding edge-to-edge (negative size-10 margins) and
    // scroll horizontally on narrow viewports. CSS lives in shell.css.
    return ''
      + '<div class="nuri-table-scroll">'
      +   '<table class="nuri-token-table">'
      +     cap
      +     `<thead><tr>${heads}</tr></thead>`
      +     `<tbody>${rows}</tbody>`
      +   '</table>'
      + '</div>';
  }

  // Wait until a sheet's cssRules is parseable (handles async <link> load).
  // Calls cb(sheet) when ready, or cb(null) after ~300ms with a console.warn
  // so the failure mode is visible rather than silent.
  function whenSheetReady(hrefSubstring, cb, tries) {
    if (tries == null) tries = 30;
    const sheet = findSheet(hrefSubstring);
    let ready = false;
    if (sheet) { try { sheet.cssRules; ready = true; } catch (_) {} }
    if (ready) return cb(sheet);
    if (tries <= 0) {
      console.warn(
        `[NuriTokens] whenSheetReady: timeout waiting for "${hrefSubstring}" ` +
        `(${sheet ? 'sheet found but cssRules not accessible' : 'sheet not found at all'}). ` +
        `Token tables on this page will render empty.`
      );
      return cb(sheet);
    }
    setTimeout(function () { whenSheetReady(hrefSubstring, cb, tries - 1); }, 10);
  }

  window.NuriTokens = {
    findSheet: findSheet,
    parsePrimitives: parsePrimitives,
    parseSemantics: parseSemantics,
    renderTable: renderTable,
    whenSheetReady: whenSheetReady,
    inferType: inferType,
    dtcgName: dtcgName,
    resolveValue: resolveValue,
  };
})();
