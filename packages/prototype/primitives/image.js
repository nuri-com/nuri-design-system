/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT · IMAGE · CUSTOM ELEMENT
 *   (the free-standing bitmap leaf · hand-authorable · the media-card slice)
 *
 * <nuri-image> is the web twin of RN `Image` (rn/primitives/Image.tsx) and
 * the OPEN sibling of the factory's `el:'image'` leaf (factory.js
 * renderImage · the icon-avatar `source` bridge). It renders ONE inner
 * <img class="nuri-image nuri-box"> — byte-for-byte the shape the factory
 * emits for its image leaf — and self-derives the box classes + data-* from
 * its OWN public attrs through the factory's `mergeAttrs` (the view.js
 * reader pattern · no second mechanism). box.css sizes/rounds it, image.css
 * paints the always-on blend ring (border-translucent · element contract,
 * never a palette variant).
 *
 * THE HOST IS display:contents (image.css · the nuri-button precedent): the
 * inner <img> IS the flex item, so a row's align="stretch" stretches the
 * bitmap itself and its `aspect-ratio` transfers to the other axis — the
 * same thing Yoga does to RN's Image host. That is the media-card photo
 * column: `<nuri-image source fit="cover" aspect-ratio="portrait">` beside
 * a growing text column inside a `clip aspect-ratio="banner"` row.
 *
 * 1:1 RN <Image> (decision 21 · a find-replace):
 *   source               → src                      (RN ImageSourcePropType · here a URL)
 *   fit                  → object-fit (cover|contain · default cover · RN resizeMode)
 *   accessibility-label  → alt                      (RN accessibilityLabel)
 *   (absent label)       → alt="" + aria-hidden     (DECORATIVE · RN accessible={false})
 *   box attrs            → .nuri-box + data-*       (width · height · radius · aspect-ratio · clip …)
 *
 * NO stack (an image has no children), NO palette (a bitmap has no colour),
 * NO interactive (a pressable image is <nuri-pressable><nuri-image/></nuri-pressable>).
 *
 * The parity gate (primitives-parity.test.ts) reads BOX_ATTRS + ATTRS below and
 * asserts the box attrs ≡ the schema box keys (kebab) and the local contract is
 * exactly source · fit · accessibility-label — a CHECKED projection.
 *
 * Markup
 *   <nuri-image source="photo.png" aspect-ratio="portrait"></nuri-image>        · decorative · cover
 *   <nuri-image source="logo.svg" fit="contain" width="lg" height="lg"></nuri-image>
 *   <nuri-image source="…" accessibility-label="Bank card"></nuri-image>         · announced image
 * ────────────────────────────────────────────────────────────── */

import { mergeAttrs } from '../factory/factory.js';

// The box namespace (kebab) — the mirror of the RN Image's BOX_KEYS; checked
// against the schema by the parity gate, never trusted as a hand list.
const BOX_ATTRS = [
  'width', 'height', 'min-height', 'min-width',
  'padding', 'padding-x', 'padding-y', 'padding-start', 'padding-end', 'padding-top', 'padding-bottom',
  'radius', 'radius-top', 'aspect-ratio', 'clip',
];
// The element's LOCAL contract (not a namespace): the bitmap source, the crop
// mode, and the accessible name (the decision-21 mirror of accessibilityLabel).
const LOCAL_ATTRS = ['source', 'fit', 'accessibility-label'];
const ATTRS = [...BOX_ATTRS, ...LOCAL_ATTRS];

const MANAGED_DATA = BOX_ATTRS.map((a) => `data-${a}`);

// fit · cover | contain (the ratified vocabulary · default cover). Anything
// else falls back to cover — the RN twin's `fit` is a closed union.
const normalizeFit = (v) => (v === 'contain' ? 'contain' : 'cover');

class NuriImage extends HTMLElement {
  static get observedAttributes() {
    return ATTRS;
  }

  #img = null;

  connectedCallback() {
    if (!this.#img) {
      // First mount: create the inner <img> once and never tear it down on
      // re-sync (the pressable precedent), so a consumer's listeners survive.
      const img = document.createElement('img');
      img.classList.add('nuri-image');
      this.appendChild(img);
      this.#img = img;
    }
    this.#sync();
  }

  attributeChangedCallback() {
    if (this.#img) this.#sync();
  }

  #sync() {
    const img = this.#img;

    // source → src. Required: without it the element stays an empty host.
    const source = this.getAttribute('source');
    if (source != null) img.setAttribute('src', source);
    else img.removeAttribute('src');

    // fit → object-fit (the factory's image leaf sets the same inline style).
    img.style.objectFit = normalizeFit(this.getAttribute('fit'));

    // accessibility-label → alt; absent ⇒ DECORATIVE (alt="" + aria-hidden ·
    // the IconAvatar precedent · RN accessible={false}).
    const label = this.getAttribute('accessibility-label');
    if (label != null) {
      img.setAttribute('alt', label);
      img.removeAttribute('aria-hidden');
    } else {
      img.setAttribute('alt', '');
      img.setAttribute('aria-hidden', 'true');
    }

    // box attrs → the merged-node classes + data-* via the factory's own
    // mergeAttrs (byte-identical spelling to the factory's image leaf).
    const box = {};
    for (const a of BOX_ATTRS) {
      if (!this.hasAttribute(a)) continue;
      if (a === 'clip') box.clip = true; // presence flag → data-clip='true' (the wrap convention)
      else box[a] = this.getAttribute(a);
    }
    const { classes, data } = Object.keys(box).length ? mergeAttrs({ box }) : { classes: [], data: {} };
    img.classList.toggle('nuri-box', classes.includes('nuri-box'));
    for (const key of MANAGED_DATA) {
      if (key in data) img.setAttribute(key, data[key]);
      else img.removeAttribute(key);
    }
  }
}

// Idempotent define (decision 74) — a page's <script type="module"> tag coexists
// with the playground boot import.
if (!customElements.get('nuri-image')) customElements.define('nuri-image', NuriImage);
