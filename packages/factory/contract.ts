/* ──────────────────────────────────────────────────────────────
 * NURI · DS CONTRACT · the single seam into the read-only spec
 * ──────────────────────────────────────────────────────────────
 * This is the ONLY file in @nuri/factory that reaches into the
 * @nuri/spec package — everything else imports the contract from
 * here, so if the spec's surface ever moves, exactly one path
 * changes. (N+19 · M2 · decision 65.7/65.8: the vendored
 * `DesignSystemSpec/` snapshot is GONE; this seam now imports the
 * sibling workspace `@nuri/spec` across the monorepo, through its
 * `exports` map. The factory is the spec's FIRST importer — the one
 * that validates that boundary, the M1-deferred item.)
 *
 * "The emit IS the contract" — we import the generated build/*
 * artifacts (decision 35: build/ is generated, never re-derived
 * from styles/ or the CSS). We do NOT touch lib/ or styles/. The
 * `@nuri/spec` exports subpaths face exactly these build/* files:
 *
 *   @nuri/spec/tokens          runtime sets: chrome · accent · space
 *                              · size · radius · type (+ Accent/Theme)
 *   @nuri/spec/token-paths     the TokenPath discriminated union
 *   @nuri/spec/icons           IconName × weight SVG registry
 *   @nuri/spec/components/<n>  per-component numerics + TokenPath refs
 * ────────────────────────────────────────────────────────────── */

import {
  chrome,
  accent as accentTokens,
  space,
  size,
  radius,
  type as typeScale,
} from '@nuri/spec/tokens';
import type { Accent, Theme, TypeSize, TypeWeight, TypeStep } from '@nuri/spec/tokens';
import type { TokenPath } from '@nuri/spec/token-paths';
import { icons } from '@nuri/spec/icons';
import type { IconName, IconWeight } from '@nuri/spec/icons';

// Per-component spec consumed by the factory: `button` carries the
// interaction baseline numerics (pressScale/disabledOpacity) the factory
// theme pins against (build/components/button.ts · decision 34). The other
// per-component token files stay in build/ (the read-only spec) but are
// no longer imported — the migration mirrors that read them are retired (R1.5).
import { button } from '@nuri/spec/components/button';

// ── The FROZEN descriptor contract (decision 65 · 65.3 · 65.6 · Guard F) ──
// The cross-repo authoring language the generic factory consumes: the
// composition schema (the five disjoint namespaces · 65.3 §6), the palette
// mapping ({variant|chrome} → {bg·fg·fgMuted·pressedBg} as TokenPath data ·
// build/palette.ts), and the three per-component descriptors (PURE DATA ·
// no theme thunk · 65.3 §7).
import { palette } from '@nuri/spec/palette';
import { compositionButtonDescriptor } from '@nuri/spec/descriptors/composition-button';
import { iconAvatarDescriptor } from '@nuri/spec/descriptors/icon-avatar';
import { topbarDescriptor } from '@nuri/spec/descriptors/topbar';
import type {
  SizeLeaf,
  RadiusLeaf,
  StackNS,
  BoxNS,
  TypographyNS,
  PaletteVariant,
  PaletteChrome,
  PaletteNS,
  InteractiveNS,
  NS,
  Part,
  El,
  PartAnatomy,
  PartMap,
  Axes,
  Variants,
  Descriptor,
} from '@nuri/spec/descriptors/schema';

export {
  chrome,
  accentTokens,
  space,
  size,
  radius,
  typeScale,
  icons,
  button,
  // descriptor contract
  palette,
  compositionButtonDescriptor,
  iconAvatarDescriptor,
  topbarDescriptor,
};

export type { Accent, Theme, TypeSize, TypeWeight, TypeStep, TokenPath, IconName, IconWeight };

// The frozen descriptor schema types (decision 65.6 · Guard F). `SpaceLeaf`
// and `TypeKey` are intentionally NOT re-exported here — `theme.tsx` already
// owns those names in the public barrel (structurally identical aliases);
// the factory imports them from `theme` to avoid an `export *` name clash.
export type {
  SizeLeaf,
  RadiusLeaf,
  StackNS,
  BoxNS,
  TypographyNS,
  PaletteVariant,
  PaletteChrome,
  PaletteNS,
  InteractiveNS,
  NS,
  Part,
  El,
  PartAnatomy,
  PartMap,
  Axes,
  Variants,
  Descriptor,
};
