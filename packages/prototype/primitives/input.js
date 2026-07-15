/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT · INPUT  (native form-control host)
 *
 * <nuri-input> is the thin web primitive for descriptor el:'input'. It owns one
 * native <input>, reflects the descriptor-declared value props, and forwards the
 * native input event to the property handler surface (`onChangeText`). Styling
 * stays on the host via factory-applied namespace classes/data attrs; the native
 * control inherits font and colour and contributes the real focus target.
 * ────────────────────────────────────────────────────────────── */

(() => {
  const ATTRS = ['value', 'placeholder', 'input-mode', 'secure-text-entry', 'auto-capitalize', 'max-length', 'disabled', 'aria-label'];

  const clamp = (offset, length) => Math.max(0, Math.min(Number.isFinite(offset) ? offset : 0, length));

  function mapSelection(previousText, nextText, selection) {
    let prefix = 0;
    const sharedLength = Math.min(previousText.length, nextText.length);
    while (prefix < sharedLength && previousText[prefix] === nextText[prefix]) prefix += 1;

    let suffix = 0;
    while (
      suffix < previousText.length - prefix &&
      suffix < nextText.length - prefix &&
      previousText[previousText.length - 1 - suffix] === nextText[nextText.length - 1 - suffix]
    ) {
      suffix += 1;
    }

    const previousChangedEnd = previousText.length - suffix;
    const nextChangedEnd = nextText.length - suffix;
    const delta = nextText.length - previousText.length;
    const changedPreviousText = previousChangedEnd > prefix;
    const mapOffset = (rawOffset) => {
      const offset = clamp(rawOffset, previousText.length);
      if (offset < prefix || (changedPreviousText && offset === prefix)) return offset;
      if (offset >= previousChangedEnd) return clamp(offset + delta, nextText.length);
      return clamp(nextChangedEnd, nextText.length);
    };

    return {
      start: mapOffset(selection.start),
      end: mapOffset(selection.end),
    };
  }

  class NuriInput extends HTMLElement {
    static get observedAttributes() {
      return ATTRS;
    }

    #input = null;

    connectedCallback() {
      if (!this.#input) {
        this.#input = document.createElement('input');
        this.#input.className = 'nuri-input';
        this.#input.addEventListener('input', () => {
          const raw = this.#input.value;
          const selection = {
            start: this.#input.selectionStart ?? raw.length,
            end: this.#input.selectionEnd ?? raw.length,
          };
          const emitted = typeof this.sanitize === 'function' ? this.sanitize(raw) : raw;
          if (emitted !== raw) {
            const mappedSelection = mapSelection(raw, emitted, selection);
            this.#input.value = emitted;
            this.#input.setSelectionRange(mappedSelection.start, mappedSelection.end);
          }
          if (typeof this.onChangeText === 'function') this.onChangeText(emitted);
        });
        this.#input.addEventListener('focus', () => {
          this.dispatchEvent(new CustomEvent('nuri-input-focus', { bubbles: true }));
          if (typeof this.onNuriFocus === 'function') this.onNuriFocus();
        });
        this.#input.addEventListener('blur', () => {
          this.dispatchEvent(new CustomEvent('nuri-input-blur', { bubbles: true }));
          if (typeof this.onNuriBlur === 'function') this.onNuriBlur();
        });
        this.replaceChildren(this.#input);
      }
      this.#sync();
    }

    attributeChangedCallback() {
      if (this.#input) this.#sync();
    }

    #sync() {
      const input = this.#input;
      if (!input) return;
      input.value = this.getAttribute('value') ?? '';
      input.placeholder = this.getAttribute('placeholder') ?? '';
      const mode = this.getAttribute('input-mode');
      if (mode) input.setAttribute('inputmode', mode);
      else input.removeAttribute('inputmode');
      input.type = this.hasAttribute('secure-text-entry') ? 'password' : 'text';
      const autoCapitalize = this.getAttribute('auto-capitalize');
      if (autoCapitalize) input.setAttribute('autocapitalize', autoCapitalize);
      else input.removeAttribute('autocapitalize');
      const maxLength = this.getAttribute('max-length');
      if (maxLength === null) input.removeAttribute('maxlength');
      else input.maxLength = Number(maxLength);
      input.disabled = this.hasAttribute('disabled');
      const label = this.getAttribute('aria-label');
      if (label) input.setAttribute('aria-label', label);
      else input.removeAttribute('aria-label');
    }
  }

  if (!customElements.get('nuri-input')) customElements.define('nuri-input', NuriInput);
})();
