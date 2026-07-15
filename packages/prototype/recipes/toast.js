/* ──────────────────────────────────────────────────────────────
 * NURI · TOAST · STATIC WEB POSITIONAL RECIPE
 *
 * Web owns no timer/provider behaviour. This element only establishes the
 * design-spec position for a composed body such as <nuri-alert>.
 * ────────────────────────────────────────────────────────────── */

import './alert.js';

class NuriToast extends HTMLElement {}

if (!customElements.get('nuri-toast')) {
  customElements.define('nuri-toast', NuriToast);
}
