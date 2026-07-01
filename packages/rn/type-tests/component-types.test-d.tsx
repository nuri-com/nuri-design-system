/* ══════════════════════════════════════════════════════════════════
 * NURI · TYPE TEST · the component-API exact surface (Path C · Phase 2)
 * ──────────────────────────────────────────────────────────────────
 * THE LOAD-BEARING PROOF of Phase 2. Phase 2's whole deliverable is the TYPE
 * surface — each component's exact public props (`ButtonProps` with no `icon`;
 * `IconButtonProps` with a required scalar `icon` + `children?: never`). The render
 * is byte-identical (same factory instance · same recipe), so the render-smoke
 * CANNOT see this change — tsc is the only gate. This fixture asserts the surface
 * with `@ts-expect-error`: each marked line MUST error, so REMOVING a
 * `@ts-expect-error` makes tsc FAIL (an unused directive · TS2578) — that is the
 * bind proof (the narrowing actually bites; the export is not silently the wide bag).
 *
 * It is NOT a jest suite (jest is scoped to `factory/`; this lives OUTSIDE that root)
 * — it is pure `tsc` fodder, checked by `npm run typecheck -w @nuri/rn`. The fixtures
 * are `export const` so they are not unused-locals; none is rendered at runtime.
 *
 * Anti-goal reminder: NO `as`/`as unknown` casts anywhere — the exports are DIRECT
 * `FC<Wide>`→`FC<Narrow>` bindings (sound by prop contravariance). A cast here would
 * hide exactly the narrowing this fixture exists to prove.
 * ══════════════════════════════════════════════════════════════════ */

import * as React from 'react';
import { Button, IconButton, IconAvatar, TabBarItem } from '../factory';

// ── Button — text sink · variant/size · NO icon (the soup is gone) ──
// the real surface compiles: variant union + children text.
export const buttonOk = <Button variant="solid" size="md" onPress={() => undefined}>Send</Button>;
// bare children are the label sink.
export const buttonChildrenOk = <Button>Buy</Button>;
// @ts-expect-error Button has NO `icon` prop — it was never a slot on button (the `NuriBaseProps` soup that put `icon` on every component is what Phase 2 removes).
export const buttonNoIcon = <Button icon="apple" />;
// @ts-expect-error `variant` is a closed union — `plaid` is not a value.
export const buttonBadVariant = <Button variant="plaid">Send</Button>;

// ── IconButton — required scalar `icon` · children?: never · interactive ──
// the icon-only glyph circle: `icon` is required + valid, plus the pressable props.
export const iconButtonOk = <IconButton variant="soft" icon="apple" accessibilityLabel="Buy" onPress={() => undefined} />;
// @ts-expect-error IconButton REQUIRES `icon` — it is the whole control, not optional.
export const iconButtonMissingIcon = <IconButton />;
// @ts-expect-error IconButton forbids children (`children?: never` · no `default` slot · the glyph is the `icon` prop, not a children-sink).
export const iconButtonNoChildren = <IconButton icon="apple">child</IconButton>;

// ── IconAvatar — required `icon` · NOT interactive (no behaviour) · no children ──
export const iconAvatarOk = <IconAvatar variant="soft" icon="settings" />;
// @ts-expect-error IconAvatar is NOT interactive — it declares no `behaviour`, so `onPress` is not on its surface.
export const iconAvatarNoPress = <IconAvatar icon="settings" onPress={() => undefined} />;
// @ts-expect-error IconAvatar forbids children (`children?: never`).
export const iconAvatarNoChildren = <IconAvatar icon="settings">x</IconAvatar>;

// ── TabBarItem — selected bridge + onPress/a11yLabel · icon/label · no disabled ──
export const tabItemOk = <TabBarItem icon="card" label="Wallet" selected onPress={() => undefined} />;
// @ts-expect-error TabBarItem declares no `disabled` — an unselected item stays tappable (the DS never blocks it).
export const tabItemNoDisabled = <TabBarItem icon="card" label="Wallet" disabled />;
