/* ──────────────────────────────────────────────────────────────
 * NURI · DS CONTRACT · the single seam into the read-only spec
 * ──────────────────────────────────────────────────────────────
 * This is the ONLY file in @nuri/rn that wires the RN PROJECTION's
 * resolved contract to the package surface — everything else imports
 * the contract from here, so if a source moves, exactly one path
 * changes. (N+19 · M2 · decision 65.7/65.8: the vendored
 * `DesignSystemSpec/` snapshot is GONE.)
 *
 * The projection model (decision 80 · N+62 · the infra exit): @nuri/spec
 * is PURE DATA; this RN projection GENERATES + OWNS its resolved contract
 * at @nuri/rn/generated/ (committed · decision 35 · re-emit ≡ committed ·
 * the codegen in root scripts/ flattens it from spec's TS SoTs). So the
 * resolved artifacts are imported LOCALLY (`./generated/*`), and only the
 * authored DATA — the descriptors + their schema — is read from @nuri/spec
 * (the `./descriptors/<name>` subpaths · pure data · source only):
 *
 *   ./generated/tokens         runtime sets: chrome · accent · space
 *                              · size · radius · ratio · type (+ Accent/Theme)
 *   ./generated/token-paths    the TokenPath discriminated union
 *   ./generated/interaction    the transversal interaction baseline
 *                              ({ pressScale · disabledOpacity } · decision 45)
 *   ./generated/icons          IconName → SVG markup registry (one drawing
 *                              per glyph · no weights · decision 38 · N+51)
 *   ./generated/palette        {variant|chrome} → {bg·fg·fgMuted·pressedBg}
 *   @nuri/spec/descriptors/*   the FROZEN descriptors + schema (DATA · source)
 * ────────────────────────────────────────────────────────────── */

import {
  chrome,
  accent as accentTokens,
  space,
  size,
  radius,
  ratio,
  type as typeScale,
  emphasisWeight,
} from './generated/tokens';
import type { Accent, Theme, TypeSize, TypeWeight, TypeStep } from './generated/tokens';
import type { TokenPath } from './generated/token-paths';
import { icons } from './generated/icons';
import type { IconName } from './generated/icons';

// The transversal interaction baseline consumed by the factory:
// `interaction` carries the decision-45 cross-component constants
// (pressScale/disabledOpacity) the factory theme pins against. It now
// ships as its OWN transversal emit (build/interaction.ts · Smell-1 ·
// decision 66 arc #0), so the factory no longer reaches into a
// per-component file for a non-component value (the retired
// build/components/button.ts · the R1 finding resolved).
import { interaction } from './generated/interaction';

// ── The FROZEN descriptor contract (decision 65 · 65.3 · 65.6 · Guard F) ──
// The cross-repo authoring language the generic factory consumes: the
// composition schema (the five disjoint namespaces · 65.3 §6) and the three
// per-component descriptors (PURE DATA · no theme thunk · 65.3 §7).
// NOTE: the palette MAPPING ({variant|chrome} → colour refs · generated/palette.ts)
// is an INTERNAL engine detail, NOT part of the public contract seam (SEED-4 · Arc
// 1) — factory/theme.ts imports it directly from generated/, so it never reaches
// the public barrel.
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
  chrome,
  accentTokens,
  space,
  size,
  radius,
  ratio,
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

export type { Accent, Theme, TypeSize, TypeWeight, TypeStep, TokenPath, IconName };

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
