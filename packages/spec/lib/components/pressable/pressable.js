/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT · PRESSABLE · CUSTOM ELEMENT
 *   (the interactive el-host · factory-rewrite S2 · decision 67)
 *
 * <nuri-pressable> is the generic INTERACTIVE host — the web mirror of
 * RN <Pressable> (the el:'view'+interactive case in
 * createNuriComponent.tsx). It is the bare extraction of the native
 * <button> that the Button recipe (button.js) hard-codes inline, MINUS
 * the .nuri-button recipe CSS: it applies the generic `.nuri-interactive`
 * namespace (interactive.css · decision 65.3 §6 / 65.4) and exposes the
 * interactive vocabulary as data-* gates (the box/stack pattern).
 *
 * NOT a recipe — it carries NO box / stack / palette. Those arrive from
 * the descriptor at S3, merged onto THIS same host (the merged-node
 * model · interactive.css). A bare <nuri-pressable> is therefore an
 * inert affordance host: cursor + focus-ring only, with no press effect
 * until a channel is opted-in.
 *
 * 1:1 RN <Pressable> (decision 21 / 67 — <nuri-pressable> ⟷ <Pressable>
 * is a find-replace):
 *   children            → moved inside the inner <button>
 *   disabled            → native <button disabled> (interactive.css dims + reverts scale)
 *   accessibility-label → aria-label                (RN accessibilityLabel · F-ARIA-LABEL-1)
 *   (native click)      ≈ onPress                   (bubbles from the inner <button> · no onpress attr)
 *
 * The interactive-namespace channels (decision 65.4 · a structured
 * per-part opt-in, NOT a boolean) — each its own gate so a static
 * surface never reacts:
 *   press-scale  → data-press-scale  · interactive.css scales on :active
 *   press-color  → data-press-color  · palette.css swaps bg on :active (realized once palette merges · S3)
 *
 * accent → data-accent on the inner <button> · Tier-2 self-scope
 * (decision 27 / 62 · like button.js): re-resolves accent tokens for
 * this node only, not its descendants.
 *
 * Like button.js, the inner <button> is created once and NEVER torn
 * down on re-sync, so any listeners the consumer attached survive an
 * attribute change. The inner host stays <button> only — no as/role
 * escape hatch (no current consumer · P11 · decision 30).
 *
 * Markup
 *   <nuri-pressable>Tap</nuri-pressable>                            · inert affordance host
 *   <nuri-pressable press-scale>Tap</nuri-pressable>                · tactile :active scale
 *   <nuri-pressable press-scale press-color>Tap</nuri-pressable>    · scale + bg swap (the bg needs a palette · S3)
 *   <nuri-pressable disabled>Tap</nuri-pressable>                   · dimmed, inert
 *   <nuri-pressable accent="orange">Tap</nuri-pressable>            · Tier-2 self-scope
 *   <nuri-pressable accessibility-label="Close">…</nuri-pressable>  · a11y name for an icon-only host
 * ────────────────────────────────────────────────────────────── */

(() => {
  // Web custom-element attribute names use kebab-case; accessibility-label
  // is the find-replace mirror of RN's accessibilityLabel (decision 21).
  const ATTRS = ['press-scale', 'press-color', 'disabled', 'accent', 'accessibility-label'];

  class NuriPressable extends HTMLElement {
    static get observedAttributes() {
      return ATTRS;
    }

    #btn = null;

    connectedCallback() {
      if (this.#btn) return;

      // First-time mount: create the inner interactive <button>, move
      // authored children inside it, then sync attributes. Subsequent
      // attribute changes only re-sync — we never tear down the inner
      // button, so any listeners the consumer attached stay alive.
      const btn = document.createElement('button');
      btn.type = 'button';
      // The generic interaction namespace — NOT a recipe class. box ⊕ stack ⊕
      // palette land here too once a descriptor merges onto the node (S3).
      btn.className = 'nuri-interactive';
      while (this.firstChild) btn.appendChild(this.firstChild);
      this.appendChild(btn);
      this.#btn = btn;
      this.#sync();
    }

    attributeChangedCallback() {
      if (this.#btn) this.#sync();
    }

    #sync() {
      // Interactive channels (decision 65.4 · per-part opt-in gates).
      // Presence is the gate — interactive.css / palette.css match the bare
      // [data-press-*] on :active; a static surface carries no marker.
      this.#btn.toggleAttribute('data-press-scale', this.hasAttribute('press-scale'));
      this.#btn.toggleAttribute('data-press-color', this.hasAttribute('press-color'));

      // disabled → native <button disabled>: interactive.css dims to the
      // shared opacity, and a native disabled button never fires :active, so
      // the press scale reverts for free (interactive.css comment).
      this.#btn.toggleAttribute('disabled', this.hasAttribute('disabled'));

      // Tier-2 self-scope (decision 27 / 62 · like button.js): when `accent`
      // is explicit, mirror it as data-accent on the inner button so the
      // token cascade re-resolves accent tokens for that node only. When
      // omitted, the button inherits its ancestor's data-accent.
      const accent = this.getAttribute('accent');
      if (accent) {
        this.#btn.dataset.accent = accent;
      } else {
        delete this.#btn.dataset.accent;
      }

      // accessibility-label → aria-label (RN accessibilityLabel). For an
      // icon-only / propless interactive host that has no text children.
      const label = this.getAttribute('accessibility-label');
      if (label != null) {
        this.#btn.setAttribute('aria-label', label);
      } else {
        this.#btn.removeAttribute('aria-label');
      }
    }
  }

  // Idempotent define (decision 74) — the factory-backed recipes self-import this
  // primitive, so a page's classic <script> tag for it coexists with that import.
  if (!customElements.get('nuri-pressable')) customElements.define('nuri-pressable', NuriPressable);
})();
