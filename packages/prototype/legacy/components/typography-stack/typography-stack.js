/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT · TYPOGRAPHY-STACK · CUSTOM ELEMENT  (rhythm container · decision 47 · 53)
 *
 *   <nuri-typography-stack [direction]>   the flex container · layout is
 *                                         pure CSS reading `direction`
 *                                         directly → the element only
 *                                         needs defining (no JS layout).
 *
 * Decision 53 ELIMINATED <nuri-typography-stack-element>: the stack now
 * wraps plain <nuri-typography> lines (size / emphasis / muted carry what
 * the old `level` sub-scale resolved). There is no longer a styled-line
 * element to upgrade — the container is the only custom element, and its
 * layout is owned entirely by typography-stack.css reading the
 * `direction` attribute. Defined so :defined fires + the element is a
 * known custom element (the skeleton :not(:defined) rule can flip).
 *
 * No Shadow DOM, no <slot>, no reparenting — children are homogeneous
 * <nuri-typography> lines, there is no region routing like Topbar's
 * start/end (decision 47).
 * ────────────────────────────────────────────────────────────── */

(() => {
  class NuriTypographyStack extends HTMLElement {}

  customElements.define('nuri-typography-stack', NuriTypographyStack);
})();
