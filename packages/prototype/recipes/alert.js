/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT · ALERT · CUSTOM ELEMENTS (factory-backed · form-kit-spec §1)
 *
 * <nuri-alert> is a single GENERIC registration over the web factory: the
 * observed attributes (variant · accent), the flat children slot (the message
 * string + the trailing action), the leading <nuri-alert-icon> slot, the public
 * default (variant=soft), and the de-collapsed nuri-* mount all DERIVE from the
 * frozen alert descriptor (generated/descriptors/alert.js · the authored SoT).
 * The message STRING children render as prose through the root's authored text
 * style (factory.js#wrapProseNodes · the web mirror of the RN prose rule).
 *
 * <nuri-alert-button> is the web mirror of the RN AlertButton — the ONLY
 * sanctioned action inside an alert (there is NO raw <nuri-button> escape hatch
 * · §1.1). It is a thin DELEGATING wrapper: it renders the real <nuri-button>
 * with the PINNED look (size sm · variant solid); accent inherits from the
 * enclosing <nuri-alert> scope; the label is its text children. It re-implements
 * NO button styling, so it CANNOT drift.
 *
 * The page loads THIS module (+ the linked namespace CSS); the primitives the
 * factory tree upgrades into (view · icon · typography) and the delegated
 * <nuri-button> arrive via the self-imports below (idempotent define-guards).
 * ────────────────────────────────────────────────────────────── */

import { defineNuriComponent, nuriNames } from '../factory/factory.js';
import { alertDescriptor } from '../generated/descriptors/alert.js';
// The delegated action element (<nuri-alert-button> → <nuri-button>) + the
// primitives the alert tree upgrades into.
import './button.js';
import '../primitives/view.js';
import '../primitives/icon.js';
import '../primitives/typography.js';

// <nuri-alert> — the generic factory registration over the frozen descriptor.
defineNuriComponent(alertDescriptor, nuriNames('alert').web);

// <nuri-alert-button> — delegate to the real <nuri-button> with pinned props. It
// is idempotent under the factory's harvest+clone: a clone that already carries a
// built <nuri-button> child keeps it (that child self-renders), so the label is
// preserved without re-reading a mutated subtree.
class NuriAlertButton extends HTMLElement {
  connectedCallback() {
    if (this.querySelector('nuri-button')) return;
    const label = this.textContent.trim();
    const button = document.createElement('nuri-button');
    button.setAttribute('size', 'sm');
    button.setAttribute('variant', 'solid');
    button.textContent = label;
    this.replaceChildren(button);
  }
}

if (!customElements.get('nuri-alert-button')) customElements.define('nuri-alert-button', NuriAlertButton);
