/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT · VIEW · CUSTOM ELEMENT
 *   (the static merged-node host · factory-rewrite S4 · decision 67)
 *
 * <nuri-view> is the generic STATIC view host — the web mirror of RN
 * <View> (the el:'view' NON-interactive case in createNuriComponent.tsx ·
 * the N+26 el→primitive lock). It is the static counterpart of
 * <nuri-pressable>: where the pressable owns an inner interactive
 * <button>, the view IS the painting node itself.
 *
 * THE ELEMENT IS THE MERGED NODE (B1.5 §4.2 · palette.css). The web
 * factory (lib/runtime/factory.js) applies the resolved box ⊕ stack ⊕
 * palette classes + geometry/colour data-* DIRECTLY onto this element —
 * there is no inner element, no interactive opt-in, and no deferred
 * MutationObserver (simpler than the pressable, whose inner <button> is
 * created on connect). So this custom element carries NO sync logic: it
 * is a bare registration whose job is to BE the defined `nuri-view`
 * primitive. The styling lives entirely in the @layer CSS (view.css for
 * the host's default box · box.css / stack.css / palette.css for the
 * merged namespaces · option A · NOT §9 · decision 2 STANDS).
 *
 * DEDICATED · ≠ <nuri-box> (N+26 lock): <nuri-box> is geometry-only and a
 * display:contents wrapper around an inner <div>; <nuri-view> hosts the
 * full box+stack+palette merge as the painting node, the clean 1:1 with
 * RN <View>. accent self-scope (Tier-2 · decision 27/62) rides the
 * existing token cascade — the factory mirrors `accent` to data-accent
 * directly on this node (like icon-avatar.js's inner span), no JS here.
 *
 * No hand-authoring consumer exists (the hand recipes stay · the factory
 * is the only consumer · P11 · decision 30) — hence no observed
 * attributes / no `as` escape hatch. Markup is the factory's output:
 *   <nuri-view class="nuri-box nuri-stack nuri-palette" data-…>…</nuri-view>
 * ────────────────────────────────────────────────────────────── */

(() => {
  // A bare registration: the factory applies the merged node directly, so
  // the element needs no observed attributes and no connectedCallback work.
  // Defining it gives <nuri-view> a real custom-element identity (so the
  // @layer host rule's default box applies as a defined element).
  class NuriView extends HTMLElement {}

  // Idempotent define (decision 74) — the factory-backed recipes self-import this
  // primitive, so a page's classic <script> tag for it coexists with that import.
  if (!customElements.get('nuri-view')) customElements.define('nuri-view', NuriView);
})();
