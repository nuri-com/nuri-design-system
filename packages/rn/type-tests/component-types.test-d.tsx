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
 * It is NOT a jest suite (jest is scoped to `__tests__/`; this lives OUTSIDE that root)
 * — it is pure `tsc` fodder, checked by `npm run typecheck -w @nuri/rn`. The fixtures
 * are `export const` so they are not unused-locals; none is rendered at runtime.
 *
 * Anti-goal reminder: NO `as`/`as unknown` casts anywhere. A cast here would hide
 * exactly the public-surface regression this fixture exists to catch.
 * ══════════════════════════════════════════════════════════════════ */

import * as React from 'react';
import {
  Button,
  ButtonIcon,
  ButtonText,
  IconButton,
  IconAvatar,
  List,
  ListAction,
  ListActionLeadingAvatar,
  ListActionText,
  ListSeparator,
  TextField,
  TextFieldButton,
  TextFieldIconButton,
  TextFieldLabel,
  TabBarItem,
  BottomSheet,
  BottomSheetFooter,
  BottomSheetPanel,
  BottomSheetScroll,
  BottomSheetTopbar,
  Screen,
  TopbarCenter,
} from '../index';

// ── Button — text sink · variant/size · NO icon (the soup is gone) ──
// the real surface compiles: variant union + children text.
export const buttonOk = <Button variant="solid" size="lg" onPress={() => undefined}>Send</Button>;
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
export const iconAvatarOutlineOk = <IconAvatar variant="outline" icon="settings" />;
// @ts-expect-error IconAvatar is NOT interactive — it declares no `behaviour`, so `onPress` is not on its surface.
export const iconAvatarNoPress = <IconAvatar icon="settings" onPress={() => undefined} />;
// @ts-expect-error IconAvatar forbids children (`children?: never`).
export const iconAvatarNoChildren = <IconAvatar icon="settings">x</IconAvatar>;

// ── List family — open host + pressable row + preset separator ──
export const listOk = (
  <List>
    <ListAction accessibilityLabel="Bank" onPress={() => undefined}>
      <ListActionLeadingAvatar name="bank" variant="solid" accent="orange" />
      <ListActionText>Bank account</ListActionText>
    </ListAction>
    <ListSeparator />
  </List>
);
// @ts-expect-error ListAction no longer exposes avatar styling props.
export const listActionNoVariant = <ListAction variant="solid" />;
// @ts-expect-error ListActionLeadingAvatar variant is the closed IconAvatar variant set.
export const listActionAvatarBadVariant = <ListActionLeadingAvatar name="bank" variant="plaid" />;
// @ts-expect-error ListSeparator v1 has no knobs; it is the preset.
export const listSeparatorNoProps = <ListSeparator ySpace="sm" />;

// ── TextField — input allowlist + label/button/icon-button composition ──
export const textFieldOk = (
  <TextField value="DE12" onChangeText={() => undefined} placeholder="DE..." inputMode="numeric">
    <TextFieldLabel>IBAN</TextFieldLabel>
  </TextField>
);
export const textFieldButtonOk = (
  <TextField value="Ada" onChangeText={() => undefined}>
    <TextFieldLabel>First name</TextFieldLabel>
    <TextFieldButton onPress={() => undefined} accessibilityLabel="Paste name">Paste</TextFieldButton>
  </TextField>
);
export const textFieldIconButtonOk = (
  <TextField value="secret" secureTextEntry>
    <TextFieldLabel>Recovery code</TextFieldLabel>
    <TextFieldIconButton name="eye-hidden" onPress={() => undefined} accessibilityLabel="Hide recovery code" />
  </TextField>
);
// @ts-expect-error TextFieldLabel requires visible label content.
export const textFieldLabelRequiresChildren = <TextFieldLabel />;
// @ts-expect-error TextFieldLabel feeds the native input label and is string-only in PR2.
export const textFieldLabelNoMixedChildren = <TextFieldLabel>First {'name'}</TextFieldLabel>;
// @ts-expect-error TextFieldLabel feeds the native input label and does not accept rich label nodes.
export const textFieldLabelNoRichChildren = <TextFieldLabel>{<>Name</>}</TextFieldLabel>;
// @ts-expect-error TextField has no label prop; labels are public composition via TextFieldLabel.
export const textFieldNoLabelProp = <TextField label="IBAN" />;
// @ts-expect-error TextField v1 exposes inputMode, not RN keyboardType.
export const textFieldNoKeyboardType = <TextField keyboardType="numeric"><TextFieldLabel>IBAN</TextFieldLabel></TextField>;
// @ts-expect-error disabled is the public prop; editable is not exposed.
export const textFieldNoEditable = <TextField editable={false}><TextFieldLabel>IBAN</TextFieldLabel></TextField>;
// @ts-expect-error autoCapitalize is intentionally out of the v1 input allowlist.
export const textFieldNoAutoCapitalize = <TextField autoCapitalize="words"><TextFieldLabel>Name</TextFieldLabel></TextField>;
// @ts-expect-error error is external Alert composition, not a TextField prop.
export const textFieldNoError = <TextField error><TextFieldLabel>IBAN</TextFieldLabel></TextField>;
// @ts-expect-error helper text is out of scope for v1.
export const textFieldNoHelper = <TextField helper="Use IBAN"><TextFieldLabel>IBAN</TextFieldLabel></TextField>;
// @ts-expect-error TextField v1 has no size axis.
export const textFieldNoSize = <TextField size="sm"><TextFieldLabel>IBAN</TextFieldLabel></TextField>;
// @ts-expect-error TextField v1 has no variant axis.
export const textFieldNoVariant = <TextField variant="soft"><TextFieldLabel>IBAN</TextFieldLabel></TextField>;
// @ts-expect-error TextFieldButton delegates to Button text; it does not expose an icon prop.
export const textFieldButtonNoIcon = <TextFieldButton icon="apple">Paste</TextFieldButton>;
// @ts-expect-error TextFieldIconButton requires the generated icon-name prop.
export const textFieldIconButtonMissingName = <TextFieldIconButton accessibilityLabel="Hide" />;
// @ts-expect-error TextFieldIconButton is icon-only and requires an accessible label.
export const textFieldIconButtonMissingAccessibilityLabel = <TextFieldIconButton name="eye-hidden" />;
// @ts-expect-error TextFieldIconButton is icon-only and forbids children.
export const textFieldIconButtonNoChildren = <TextFieldIconButton name="eye-hidden">Hide</TextFieldIconButton>;

// ── TabBarItem — selected bridge + onPress/a11yLabel · icon/label · no disabled ──
export const tabItemOk = <TabBarItem icon="card" label="Wallet" selected onPress={() => undefined} />;
// @ts-expect-error TabBarItem declares no `disabled` — an unselected item stays tappable (the DS never blocks it).
export const tabItemNoDisabled = <TabBarItem icon="card" label="Wallet" disabled />;

// ── BottomSheet family — Nuri contract, no raw engine surface ──
export const bottomSheetOk = (
  <BottomSheet open detent="content" scrim="dim" safeAreaBottom dismissible>
    <BottomSheetPanel>
      <BottomSheetTopbar>
        <TopbarCenter>Address</TopbarCenter>
      </BottomSheetTopbar>
      <BottomSheetScroll>
        <Button>Paste Bitcoin Address</Button>
      </BottomSheetScroll>
      <BottomSheetFooter
        chrome="strong"
        direction="row"
        align="center"
        justify="end"
        gap="sm"
        paddingX="lg"
        paddingY="xs"
      >
        <Button>Continue</Button>
      </BottomSheetFooter>
    </BottomSheetPanel>
  </BottomSheet>
);
// the two-detent surface: `content` and `full` are the whole set.
export const bottomSheetContentOk = <BottomSheet open detent="content" />;
export const bottomSheetFullOk = <BottomSheet open detent="full" />;
// @ts-expect-error BottomSheet safeAreaBottom is boolean intent, not a source token.
export const bottomSheetNoStringSafeAreaBottom = <BottomSheet open safeAreaBottom="device" />;
// @ts-expect-error BottomSheet does not expose numeric inset transport.
export const bottomSheetNoBottomInset = <BottomSheet open bottomInset={34} />;
// @ts-expect-error BottomSheet collapsed to two detents — `large` was dropped (D1).
export const bottomSheetNoLargeDetent = <BottomSheet open detent="large" />;
// @ts-expect-error BottomSheet intentionally does NOT expose raw engine snapPoints.
export const bottomSheetNoSnapPoints = <BottomSheet open snapPoints={['25%', '75%']} />;
// @ts-expect-error BottomSheet intentionally has no header slot prop; compose BottomSheetTopbar instead.
export const bottomSheetNoHeaderProp = <BottomSheet open header={<Button>Done</Button>} />;
// @ts-expect-error BottomSheet intentionally has no content-slot props; compose children instead.
export const bottomSheetNoFooterProp = <BottomSheet open footer={<Button>Done</Button>} />;
// @ts-expect-error BottomSheetPanel is visual content only; detents live on BottomSheet.
export const bottomSheetPanelNoDetent = <BottomSheetPanel detent="full" />;
// @ts-expect-error BottomSheetPanel intentionally has no header slot prop; compose BottomSheetTopbar instead.
export const bottomSheetPanelNoHeaderProp = <BottomSheetPanel header={<Button>Done</Button>} />;
// @ts-expect-error BottomSheetPanel intentionally has no footer slot prop; compose BottomSheetFooter instead.
export const bottomSheetPanelNoFooterProp = <BottomSheetPanel footer={<Button>Done</Button>} />;
// @ts-expect-error BottomSheetFooter owns a constrained tray/floating-action surface, not the full View radius axis.
export const bottomSheetFooterNoRadius = <BottomSheetFooter radius="lg"><Button>Done</Button></BottomSheetFooter>;
// @ts-expect-error BottomSheetFooter does not expose View fill/size layout escape hatches.
export const bottomSheetFooterNoFill = <BottomSheetFooter fill="grow"><Button>Done</Button></BottomSheetFooter>;
// @ts-expect-error BottomSheetFooter is not an interactive primitive.
export const bottomSheetFooterNoPress = <BottomSheetFooter onPress={() => undefined}><Button>Done</Button></BottomSheetFooter>;

// ── Screen — full-screen primitive requests provider safe-area by boolean intent ──
export const screenSafeAreaOk = <Screen safeArea><Button>Done</Button></Screen>;
export const screenSafeAreaEdgesOk = <Screen safeAreaTop safeAreaBottom><Button>Done</Button></Screen>;
// @ts-expect-error Screen safeAreaTop is boolean intent, not a reader/source token.
export const screenNoStringSafeAreaTop = <Screen safeAreaTop="device" />;
// @ts-expect-error Screen does not expose numeric inset transport.
export const screenNoNumericSafeAreaBottom = <Screen safeAreaBottom={34} />;
