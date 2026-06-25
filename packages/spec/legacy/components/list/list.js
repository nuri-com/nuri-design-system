/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT · LIST · CUSTOM ELEMENT  (decision 51 · N+7)
 *
 * <nuri-list> is the container half of the List family — a flex
 * column with role="list" that owns per-row rhythm via the single
 * `density` axis. All paint + the density→row-min-height projection
 * live in list.css; the element only carries semantics and reflects
 * the density default so the attribute selector resolves.
 *
 * Markup
 *   <nuri-list>…</nuri-list>                     default: density=md
 *   <nuri-list density="sm">…</nuri-list>
 *   <nuri-list density="lg">…</nuri-list>
 *
 * `density` is DISPATCHED as an attribute (decision 42 · JS reports
 * state, CSS owns appearance): list.js reflects the `md` default onto
 * the host so `nuri-list[density="md"] nuri-list-item` matches, and
 * authored `sm`/`lg` flow straight through. No `gap` — inter-row
 * rhythm is the row min-height + author-placed <nuri-separator>s
 * (decision 51).
 *
 * The wrapper exists for API mapping in docs HTML — it does NOT port
 * to RN. The RN consumer is generated separately (same prop names,
 * different mechanism · RISKS R1).
 *
 * Accessibility
 *   The host is exposed as role="list"; its <nuri-list-item> children
 *   carry role="listitem" (list-item.js). Author-placed
 *   <nuri-separator>s remain role="separator" — structural breaks,
 *   not list entries.
 * ────────────────────────────────────────────────────────────── */

(() => {
  class NuriList extends HTMLElement {
    connectedCallback() {
      // Structural list container.
      if (!this.hasAttribute('role')) this.setAttribute('role', 'list');

      // Reflect the density default so the attribute-keyed min-height
      // rule (nuri-list[density="md"] nuri-list-item) resolves. Authored
      // sm/lg are left untouched.
      if (!this.hasAttribute('density')) this.setAttribute('density', 'md');
    }
  }

  customElements.define('nuri-list', NuriList);
})();
