/* ══════════════════════════════════════════════════════════════════
 * NURI · TYPE TEST · the component-API exact surface (Path C · Phase 3)
 * ──────────────────────────────────────────────────────────────────
 * THE LOAD-BEARING PROOF for the generated adapter public surface. Each component's
 * exact props (`ButtonProps` with no `icon`; `IconButtonProps` with a required
 * scalar `icon` + `children?: never`) are emitted from descriptor `api` and then
 * normalized by the generated RN adapter at runtime. This fixture asserts that
 * surface with `@ts-expect-error`: each marked line MUST error, so REMOVING a
 * `@ts-expect-error` makes tsc FAIL (an unused directive · TS2578). That proves the
 * generated exports are still exact and have not widened back into the old soup.
 *
 * It is NOT a jest suite (jest is scoped to `factory/`; this lives OUTSIDE that root)
 * — it is pure `tsc` fodder, checked by `npm run typecheck -w @nuri/rn`. The fixtures
 * are `export const` so they are not unused-locals; none is rendered at runtime.
 *
 * Anti-goal reminder: NO `as`/`as unknown` casts anywhere. A cast here would hide
 * exactly the public-surface regression this fixture exists to catch.
 * ══════════════════════════════════════════════════════════════════ */

import * as React from 'react';
import { Button, ButtonIcon, ButtonText, IconButton, IconAvatar, TabBarItem } from '../factory';

// ── Button — text sink · variant/size · NO icon (the soup is gone) ──
// the real surface compiles: variant union + children text.
export const buttonOk = <Button variant="solid" size="md" onPress={() => undefined}>Send</Button>;
// bare children are the label sink.
export const buttonChildrenOk = <Button>Buy</Button>;
// composed ordered lockup: flat slot exports, icon slot uses `name`.
export const buttonComposedOk = <Button><ButtonText>Buy</ButtonText><ButtonIcon name="apple" /></Button>;
// @ts-expect-error Button has NO `icon` prop — it was never a slot on button (the `NuriBaseProps` soup that put `icon` on every component is what Phase 2 removes).
export const buttonNoIcon = <Button icon="apple" />;
// @ts-expect-error `variant` is a closed union — `plaid` is not a value.
export const buttonBadVariant = <Button variant="plaid">Send</Button>;
// @ts-expect-error ButtonIcon glyph names are closed over the generated icon registry.
export const buttonIconBadName = <ButtonIcon name="made-up" />;
// @ts-expect-error Button has no dot-notation API; flat exports are the public shape.
export const buttonNoDotNotation = <Button.Text>Buy</Button.Text>;

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
