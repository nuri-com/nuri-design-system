/* ──────────────────────────────────────────────────────────────
 * NURI · DS CONTRACT · the single seam into the read-only spec
 * ──────────────────────────────────────────────────────────────
 * This is the file in @nuri/rn that wires the RN PROJECTION's public
 * resolved contract to the package surface. Raw colour token tables stay
 * internal to the provider builder, so consumers read resolved semantic
 * roles instead of token leaves. (N+19 · M2 · decision 65.7/65.8: the
 * vendored `DesignSystemSpec/` snapshot is GONE.)
 *
 * The projection model (decision 80 · N+62 · the infra exit): @nuri/spec
 * is PURE DATA; this RN projection GENERATES + OWNS its resolved contract
 * at @nuri/rn/generated/ (committed · decision 35 · re-emit ≡ committed ·
 * the codegen in root scripts/ flattens it from spec's TS SoTs). So the
 * resolved artifacts are imported LOCALLY (`./generated/*`), and only the
 * authored DATA — the descriptors + their schema — is read from @nuri/spec
 * (the `./descriptors/<name>` subpaths · pure data · source only):
 *
 *   ./generated/data/tokens       static scales: space · size · radius · ratio
 *                                 · border · type (+ Accent/Theme)
 *   ./generated/data/interaction  the transversal interaction baseline
 *                                 ({ pressScale · disabledOpacity } · decision 45)
 *   ./generated/data/icons        IconName → SVG markup registry (one drawing
 *                                 per glyph · no weights · decision 38 · N+51)
 *   ./generated/data/palette      {variant|chrome} → {bg·fg·fgMuted·pressedBg·border}
 *   @nuri/spec/descriptors/*      the FROZEN descriptors + schema (DATA · source)
 * ────────────────────────────────────────────────────────────── */

import {
  space,
  size,
  radius,
  ratio,
  border,
  type as typeScale,
  emphasisWeight,
} from './generated/data/tokens';
import type { Accent, Theme, TypeSize, TypeWeight, TypeStep } from './generated/data/tokens';
import { icons } from './generated/data/icons';
import type { IconName } from './generated/data/icons';

// The transversal interaction baseline consumed by the factory:
// `interaction` carries the decision-45 cross-component constants
// (pressScale/disabledOpacity) the factory theme pins against. It now
// ships as its OWN transversal emit (generated/data/interaction.ts · Smell-1 ·
// decision 66 arc #0), so the factory no longer reaches into a
// per-component file for a non-component value (the retired
// build/components/button.ts · the R1 finding resolved).
import { interaction } from './generated/data/interaction';

// ── The FROZEN descriptor contract (decision 65 · 65.3 · 65.6 · Guard F) ──
// The cross-repo authoring language the generic factory consumes: the
// composition schema (the five disjoint namespaces · 65.3 §6) and the three
// per-component descriptors (PURE DATA · no theme thunk · 65.3 §7).
// NOTE: the palette MAPPING ({variant|chrome} → colour refs · generated/data/palette.ts)
// is an INTERNAL engine detail, NOT part of the public contract seam (SEED-4 · Arc
// 1) — runtime/theme-payload.ts imports it directly from generated/data/, so it
// never reaches the public barrel.
import { buttonDescriptor } from '@nuri/spec/descriptors/button';
import { iconAvatarDescriptor } from '@nuri/spec/descriptors/icon-avatar';
import { topbarDescriptor } from '@nuri/spec/descriptors/topbar';
import { iconButtonDescriptor } from '@nuri/spec/descriptors/icon-button';
import { tabBarItemDescriptor } from '@nuri/spec/descriptors/tab-bar-item';
import { tabBarDescriptor } from '@nuri/spec/descriptors/tab-bar';
import type {
  SizeLeaf,
  RadiusLeaf,
  RatioLeaf,
  StackNS,
  BoxNS,
  TypographyNS,
  PaletteVariant,
  PaletteChrome,
  PaletteNS,
  InteractiveNS,
  Elevation,
  EffectNS,
  NS,
  PartId,
  Part,
  El,
  PartAnatomy,
  PartMap,
  Axes,
  Variants,
  Descriptor,
} from '@nuri/spec/descriptors/schema';

export {
  space,
  size,
  radius,
  ratio,
  border,
  typeScale,
  emphasisWeight,
  icons,
  interaction,
  // descriptor contract (the palette MAPPING is internal · not re-exported · SEED-4)
  buttonDescriptor,
  iconAvatarDescriptor,
  topbarDescriptor,
  iconButtonDescriptor,
  tabBarItemDescriptor,
  tabBarDescriptor,
};

export type { Accent, Theme, TypeSize, TypeWeight, TypeStep, IconName };

// The frozen descriptor schema types (decision 65.6 · Guard F). `SpaceLeaf`
// and `TypeKey` are intentionally NOT re-exported here — `theme.tsx` already
// owns those names in the public barrel (structurally identical aliases);
// the factory imports them from `theme` to avoid an `export *` name clash.
export type {
  SizeLeaf,
  RadiusLeaf,
  RatioLeaf,
  StackNS,
  BoxNS,
  TypographyNS,
  PaletteVariant,
  PaletteChrome,
  PaletteNS,
  InteractiveNS,
  Elevation,
  EffectNS,
  NS,
  PartId,
  Part,
  El,
  PartAnatomy,
  PartMap,
  Axes,
  Variants,
  Descriptor,
};
