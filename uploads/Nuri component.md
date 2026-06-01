---
title: Nuri component

---

- [Chip](#chip)
- [CompactDropdown](#compactdropdown)
- [CountryDropdown](#countrydropdown)
- [CurrencySwitcherInput](#currencyswitcherinput)
- [DSSwitch](#dsswitch)
- [FAQModal](#faqmodal)
- [FloatingTransactionStatus](#floatingtransactionstatus)
- [GenericSuccessModal](#genericsuccessmodal)
- [IconButton](#iconbutton)
- [IconTabRow](#icontabrow)
- [InfoCard](#infocard)
- [InfoList](#infolist)
- [InlineInfoCard](#inlineinfocard)
- [InputField](#inputfield)
- [Label](#label)
- [Layout (layout.tsx)](#layout-layouttsx)
- [ModalHeaderWithCloseButton](#modalheaderwithclosebutton)
- [ModalSheet](#modalsheet)
- [NearSwapModal](#nearswapmodal)
- [NetworkPendingBadge](#networkpendingbadge)
- [NostrChatModal](#nostrchatmodal)
- [NotificationBadge](#notificationbadge)
- [NuriLogo](#nurilogo)
- [PasskeyLoginScreen](#passkeyloginscreen)
- [PasskeyLoginScreenNative](#passkeyloginscreennative)
- [PasskeyLoginScreenWebView](#passkeyloginscreenwebview)
- [PleaseUpdateAppModal](#pleaseupdateappmodal)
- [ProgressBar](#progressbar)
- [QrCard](#qrcard)
- [QrScannerModal](#qrscannermodal)
- [ReceiveQrModal](#receiveqrmodal)
- [ScreenHeader](#screenheader)
- [Spinner](#spinner)
- [StatusPill](#statuspill)
- [SumsubWebModal](#sumsubwebmodal)
- [SupportButton](#supportbutton)
- [SupportDumpModal](#supportdumpmodal)
- [SupportModals](#supportmodals)
- [SwapConfirmation (SwapConfirmation.tsx)](#swapconfirmation-swapconfirmationtsx)
- [TabBar](#tabbar)
- [Tag](#tag)
- [TappableBalance](#tappablebalance)
- [TransactionList](#transactionlist)
- [TransactionsModalShell](#transactionsmodalshell)
- [Typography (typography.tsx)](#typography-typographytsx)

---

## AddressDisplay

Renders an address or pubkey as bold endpoints with a faded middle section (e.g. `bc1q8...x4f2`).

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `value` | `string` | Yes | — | Full address or pubkey string |
| `edgeChars` | `number` | No | `5` | Number of characters to show at start and end |
| `numberOfLines` | `number` | No | — | Max lines before truncating. Omit to allow full address to wrap |
| `style` | `StyleProp<TextStyle>` | No | — | Override style for the outer container |

---

## AmountInput

A numeric text input with a leading currency symbol used for entering monetary amounts. Forwards a ref to the underlying `TextInput`.

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `value` | `string` | Yes | — | Current input value |
| `onChangeText` | `(text: string) => void` | Yes | — | Called when the user types |
| `currencySymbol` | `string` | Yes | — | Symbol rendered before the input (e.g. `€`, `₿`) |
| `keyboardType` | `"number-pad" \| "decimal-pad" \| "numeric"` | No | `"decimal-pad"` | Native keyboard type |
| `autoFocus` | `boolean` | No | `false` | Auto-focus the input on mount |
| `editable` | `boolean` | No | `true` | Whether the input accepts editing |
| `selection` | `{ start: number; end: number }` | No | — | Controlled selection range |
| `accessibilityLabel` | `string` | No | — | Accessibility label |
| `accessibilityHint` | `string` | No | — | Accessibility hint |

---

## BalanceDigits

Renders a tokenized balance string (digits, dots, spacer groups) with separate styling for leading zeros vs. significant digits. Used inside balance headers.

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `tokens` | `BalanceToken[]` | Yes | — | Pre-tokenized balance segments |
| `isNegative` | `boolean` | Yes | — | Renders a leading `-` when true |
| `currencySymbol` | `string` | Yes | — | Currency symbol prefixing the digits |
| `styles` | `BalanceDigitsStyles` | Yes | — | Caller-supplied style map (wrapper, row, valueText, symbol, leadingZeros, significant, groupSpacing) |

---

## BalanceHeader

A row showing a title, large balance value, optional subtitle, and an optional list of trailing icon buttons.

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `title` | `string` | Yes | — | Heading text above the balance |
| `balance` | `string` | Yes | — | Formatted balance string |
| `subtitle` | `string` | No | — | Secondary line under the balance |
| `icons` | `HeaderIcon[]` | No | — | Trailing icon buttons; each has `icon`, `onPress`, optional `onLongPress`, `accessibilityLabel` |

---

## BalanceScreenLayout

Layout scaffold for screens that center a balance display + action buttons over a scrollable content area, with optional absolutely-positioned overlay at the top.

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `topOverlay` | `ReactNode` | No | — | Content rendered absolutely above the centered area (e.g. CardCarousel) |
| `balanceContent` | `ReactNode` | No | — | The balance display (digits, mask) |
| `balanceTrailing` | `ReactNode` | No | — | Indicator beside balance (spinner, lock) |
| `buttons` | `ReactNode` | No | — | Action buttons row content |
| `belowButtons` | `ReactNode` | No | — | Content below buttons but above the scroll area |
| `children` | `ReactNode` | No | — | Scrollable content below the balance/buttons area |
| `refreshControl` | `React.ReactElement<any>` | No | — | RefreshControl for the ScrollView |
| `balanceContainerStyle` | `StyleProp<ViewStyle>` | No | — | Override balanceContainer style |
| `scrollContentContainerStyle` | `StyleProp<ViewStyle>` | No | — | Override ScrollView contentContainerStyle |

---

## BaseCarousel

Generic horizontal snap-scroll carousel for card-style items with loading and empty states. Also exports `useCarouselCardSize()` hook.

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `items` | `T[]` | Yes | — | Items to render |
| `keyExtractor` | `(item: T) => string` | Yes | — | Returns a stable key for each item |
| `onItemPress` | `(item: T) => void` | Yes | — | Called when a non-disabled item is tapped |
| `isItemDisabled` | `(item: T) => boolean` | No | — | Returns true to disable tap for an item |
| `renderItem` | `(item: T) => ReactNode` | Yes | — | Renders the visual for each item |
| `loading` | `boolean` | No | — | Show loading spinner instead of items |
| `loadingText` | `string` | No | `"Loading..."` | Text shown beside loading spinner |
| `activeIndex` | `number` | No | `0` | Controlled active index for snap position |
| `onActiveIndexChange` | `(index: number) => void` | No | — | Called when the user scrolls to a different item |
| `emptyStateContent` | `ReactNode` | No | — | Rendered when `items` is empty |

---

## BaseDropdown

Generic dropdown field with floating label that opens a `ModalSheet` listing options. Used as the building block for `CompactDropdown` and `CountryDropdown`.

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `label` | `string` | Yes | — | Floating field label |
| `disabled` | `boolean` | No | `false` | Disables interaction |
| `modalTitle` | `string` | No | — | Title for the option modal (falls back to `label`) |
| `data` | `T[]` | Yes | — | Option items |
| `keyExtractor` | `(item: T, index: number) => string` | Yes | — | Stable key for each option |
| `renderTriggerValue` | `() => React.ReactNode` | Yes | — | Renders the currently selected value in the trigger |
| `renderItem` | `(item: T, index: number) => React.ReactNode` | Yes | — | Renders a row in the option list |
| `onSelect` | `(item: T) => void` | Yes | — | Called when an option is selected |
| `containerStyle` | `StyleProp<ViewStyle>` | No | — | Style override for the trigger wrapper |

---

## BiometricLockModal

Full-screen modal that locks the app pending biometric (Face/Touch ID) unlock, with an auto-logout countdown.

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `visible` | `boolean` | Yes | — | Whether the modal is shown |
| `onClose` | `() => void` | Yes | — | Called when unlock succeeds |
| `onLogout` | `() => void` | Yes | — | Called when the user logs out (or auto-logout expires) |

---

## BiometricRetryModal

Full-screen modal shown after a cancelled Face ID prompt offering retry or close.

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `visible` | `boolean` | Yes | — | Whether the modal is shown |
| `busy` | `boolean` | No | `false` | Disables buttons and shows loading on retry |
| `onRetry` | `() => void` | Yes | — | Called when the user taps "Try Face ID again" |
| `onClose` | `() => void` | Yes | — | Called when the user dismisses the modal |

---

## Button

Pill-shaped button with multiple variants, colors, and sizes. Supports icons, loading state, and full-width/flex layouts.

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `variant` | `"primary" \| "secondary" \| "tertiary" \| "applePay"` | Yes | — | Visual treatment |
| `color` | `"lilac" \| "dark" \| "green" \| "orange"` | No | — | Color modifier. primary accepts `"lilac"` (default) / `"dark"`. tertiary accepts `"green"` (default) / `"orange"` |
| `size` | `"xlarge" \| "large" \| "medium" \| "small"` | No | `"medium"` | Button size |
| `label` | `string` | Yes | — | Button label text |
| `onPress` | `() => void` | Yes | — | Press handler |
| `icon` | `keyof typeof Icons` | No | — | Icon name from `assets/icons` |
| `disabled` | `boolean` | No | `false` | Disables interaction |
| `loading` | `boolean` | No | `false` | Shows a spinner in place of the label |
| `fullWidth` | `boolean` | No | `false` | Stretch to container width |
| `flex` | `boolean` | No | `false` | Apply `flex: 1` |
| `spreadContent` | `boolean` | No | `false` | Left-aligns label and pushes icon to the right (space-between) |
| `hitSlop` | `{ top: number; bottom: number; left: number; right: number }` | No | — | Extra touch target padding |
| `accessibilityLabel` | `string` | No | — | Accessibility label (falls back to `label`) |
| `style` | `StyleProp<ViewStyle>` | No | — | Outer style override |
| `labelStyle` | `StyleProp<TextStyle>` | No | — | Label text style override |

---

## Card

A simple white rounded surface container with padding.

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `children` | `ReactNode` | Yes | — | Card content |
| `style` | `StyleProp<ViewStyle>` | No | — | Style override |

---

## ChatBubble

A chat message bubble that supports incoming/outgoing alignment, support-highlight tinting, timestamp, and outgoing delivery state (pending/sent/failed).

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `children` | `ReactNode` | Yes | — | Bubble content (message text) |
| `outgoing` | `boolean` | Yes | — | True for outgoing messages (right-aligned) |
| `highlight` | `boolean` | No | `false` | Highlight incoming message (e.g. support team) |
| `timestamp` | `string` | No | — | Pre-formatted timestamp string |
| `deliveryState` | `"pending" \| "sent" \| "failed"` | No | — | Delivery state for outgoing messages |

---

## Chip

Compact pill containing text and an optional dismiss action. Tappable when `onPress` is provided.

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `text` | `string` | Yes | — | Chip text |
| `size` | `"large" \| "small"` | No | `"large"` | Chip size |
| `selected` | `boolean` | No | `false` | When true and `onDismiss` is provided, shows a close icon |
| `onPress` | `() => void` | No | — | Press handler |
| `onDismiss` | `() => void` | No | — | Dismiss handler (shown only when `selected`) |
| `color` | `BodySmall` color prop | No | — | Text color (passed through to typography) |

---

## CompactDropdown

A compact `BaseDropdown` for simple string-list selection.

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `label` | `string` | Yes | — | Floating field label |
| `value` | `string \| undefined` | Yes | — | Currently selected value |
| `options` | `string[]` | Yes | — | Available options |
| `onChange` | `(value: string) => void` | Yes | — | Selection handler |
| `disabled` | `boolean` | No | `false` | Disables interaction |

---

## CountryDropdown

Dropdown for selecting an EEA country (with a custom-entry option at the top), showing flag emoji and dial code.

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `label` | `string` | No | `"Country"` | Floating field label |
| `selectedIso2` | `string` | Yes | — | Currently selected ISO-2 country code |
| `onChange` | `(iso2: string) => void` | Yes | — | Called when a country is selected |
| `disabled` | `boolean` | No | `false` | Disables interaction |
| `onCustomEntrySelected` | `() => void` | No | — | Called when the user picks the custom entry option |

---

## CurrencySwitcherInput

An `AmountInput` paired with a circular toggle icon button to switch the input's currency. Forwards a ref to the underlying `TextInput`.

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `value` | `string` | Yes | — | Current input value |
| `onChangeText` | `(text: string) => void` | Yes | — | Called when the user types |
| `currencySymbol` | `string` | Yes | — | Currency symbol |
| `keyboardType` | `"number-pad" \| "decimal-pad" \| "numeric"` | No | — | Native keyboard type |
| `autoFocus` | `boolean` | No | — | Auto-focus on mount |
| `editable` | `boolean` | No | — | Whether the input accepts editing (toggle hidden when `false`) |
| `accessibilityLabel` | `string` | No | — | Input accessibility label |
| `accessibilityHint` | `string` | No | — | Input accessibility hint |
| `onToggle` | `() => void` | Yes | — | Called when the switch icon is pressed |
| `toggleAccessibilityLabel` | `string` | No | `"Switch amount input"` | Accessibility label for the toggle |

---

## DSSwitch

Design-system styled native `Switch` with brand track/thumb colors.

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `value` | `boolean` | Yes | — | Switch state |
| `onValueChange` | `(value: boolean) => void` | Yes | — | Toggle handler |
| `disabled` | `boolean` | No | `false` | Disables interaction |

---

## FAQModal

Full-page modal that displays an expandable FAQ list inside a `Card`.

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `visible` | `boolean` | Yes | — | Whether the modal is shown |
| `onClose` | `() => void` | Yes | — | Close handler |

---

## FloatingTransactionStatus

Floating row showing a pending transaction spinner/label (optionally tappable to open an explorer URL) plus a chevron button to open transactions. Accepts a `styles` map from the caller.

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `visible` | `boolean` | No | `true` | Toggle visibility |
| `showPending` | `boolean` | Yes | — | Whether to render the pending status row |
| `isWaitingForNetwork` | `boolean` | Yes | — | When true, shows the `NetworkPendingBadge` instead of pending row |
| `pendingLabel` | `string \| null` | No | — | Label text shown next to the spinner |
| `explorerUrl` | `string \| null` | No | — | When provided, the pending row opens this URL on press |
| `onOpenTransactions` | `() => void` | Yes | — | Called when the chevron icon button is pressed |
| `transactionsAccessibilityLabel` | `string` | Yes | — | Accessibility label for the chevron button |
| `styles` | `FloatingTransactionStatusStyles` | Yes | — | Caller-supplied style map (container, chevron, statusRow, statusSpinner, statusText) |

---

## GenericSuccessModal

Full-screen success modal with a paperplane illustration, close header, and a primary "Done" CTA.

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `visible` | `boolean` | Yes | — | Whether the modal is shown |
| `onClose` | `() => void` | Yes | — | Close handler |
| `onDismiss` | `() => void` | No | — | Called when modal is fully dismissed (falls back to `onClose`) |

---

## IconButton

Circular pressable button containing an SVG icon (resized automatically) with optional label below. Hover/pressed states for web parity.

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `icon` | `React.ReactNode` | Yes | — | Icon element; auto-resized to the size of the button |
| `size` | `"large" \| "medium" \| "small"` | No | `"medium"` | Button size |
| `label` | `string` | No | — | Optional label rendered below the icon (also adds a border) |
| `onPress` | `() => void` | Yes | — | Press handler |
| `disabled` | `boolean` | No | `false` | Disables interaction |
| `accessibilityLabel` | `string` | No | — | Accessibility label (falls back to `label`) |
| `style` | `StyleProp<ViewStyle>` | No | — | Container style override |

---

## IconTabRow

Pure tab row of icon + label cells. Generic over the tab value type.

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `tabs` | `Tab<T>[]` | Yes | — | Array of tabs; each has `value`, `label`, `icon`, optional `iconFilled` for active |
| `selected` | `T` | Yes | — | Currently selected tab value |
| `onChange` | `(value: T) => void` | Yes | — | Selection handler |

---

## InfoCard

Larger horizontal info card with headline, optional subline, primary + dismiss buttons, and an optional right-side illustration. Color tint variants.

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `headline` | `string` | Yes | — | Headline text |
| `subline` | `string` | No | — | Secondary text under the headline |
| `color` | `"white" \| "green" \| "orange"` | No | `"white"` | Background color tint |
| `illustration` | `ImageSourcePropType` | No | — | Right-side illustration image |
| `primaryLabel` | `string` | Yes | — | Label for the primary button |
| `onPrimaryPress` | `() => void` | Yes | — | Primary button handler |
| `dismissLabel` | `string` | No | `"Dismiss"` | Label for the dismiss button (shown only with `onDismiss`) |
| `onDismiss` | `() => void` | No | — | Dismiss button handler |
| `style` | `StyleProp<ViewStyle>` | No | — | Container style override |

---

## InfoList

Vertical list of label/value rows with optional icon, copy-to-clipboard button, and onPress. Items default to subtitle-on-top, title-below.

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `items` | `InfoListItemProps[]` | Yes | — | Row items (see fields below) |
| `containerStyle` | `ViewStyle` | No | — | Outer container style |
| `iconStyle` | `TextStyle` | No | — | Style for emoji/string icons |
| `iconSize` | `number` | No | `24` | Pixel size for element icons |
| `rightContainerStyle` | `ViewStyle` | No | — | Style for the right-side action slot |

`InfoListItemProps` fields: `icon?` (ReactNode or string), `title` (string, required), `subtitle?`, `rightContent?`, `onPress?`, `copyValue?`, `style?`, `titleStyle?`, `titleFirst?` (default false), `itemKey?`.

---

## InlineInfoCard

A smaller inline version of `InfoCard` with default illustrations per color variant.

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `headline` | `string` | Yes | — | Headline text |
| `subline` | `string` | No | — | Secondary text |
| `color` | `"white" \| "green" \| "orange"` | No | `"white"` | Background color tint |
| `illustration` | `ImageSourcePropType` | No | — | Override the default illustration for this color variant |
| `primaryLabel` | `string` | Yes | — | Primary button label |
| `onPrimaryPress` | `() => void` | Yes | — | Primary button handler |
| `dismissLabel` | `string` | No | `"Dismiss"` | Label for the dismiss button |
| `onDismiss` | `() => void` | No | — | Dismiss handler |
| `style` | `StyleProp<ViewStyle>` | No | — | Container style override |

---

## InputField

Standard text input with floating label, focus/valid-state indicator, and an optional trailing accessory icon button.

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `label` | `string` | Yes | — | Floating label text |
| `value` | `string` | Yes | — | Current input value |
| `onChangeText` | `(t: string) => void` | Yes | — | Called when text changes |
| `autoCapitalize` | `"none" \| "sentences" \| "words" \| "characters"` | No | `"none"` | Auto-capitalize behavior |
| `keyboardType` | `"default" \| "number-pad" \| "decimal-pad" \| "numeric" \| "email-address" \| "phone-pad" \| undefined` | No | `"default"` | Native keyboard type |
| `placeholder` | `string` | No | — | Placeholder text |
| `inputRef` | `React.RefObject<TextInput>` | No | — | Ref forwarded to the TextInput |
| `autoFocus` | `boolean` | No | — | Auto-focus on mount |
| `accessoryLabel` | `string` | No | — | Accessibility label for the accessory button |
| `onAccessoryPress` | `() => void` | No | — | Accessory press handler |
| `accessoryIcon` | `React.ReactNode` | No | — | Trailing icon node |
| `editable` | `boolean` | No | `true` | Whether input is editable |
| `maxLength` | `number` | No | — | Max characters |
| `onFocus` | `() => void` | No | — | Focus handler |
| `onBlur` | `() => void` | No | — | Blur handler |
| `accessibilityLabel` | `string` | No | — | Input accessibility label |
| `accessibilityHint` | `string` | No | — | Input accessibility hint |

---

## Label

Small pill label with grey/black/primary color variants and optional active state. Pressable when `onPress` is provided.

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `text` | `string` | Yes | — | Label text |
| `size` | `"large" \| "small"` | No | `"large"` | Pill size |
| `variant` | `"grey" \| "black" \| "primary"` | No | `"grey"` | Color variant |
| `active` | `boolean` | No | `false` | Apply the active background tint |
| `onPress` | `() => void` | No | — | Press handler (label is non-interactive when omitted) |

---

## Layout (layout.tsx)

Layout primitive components.

### Row
Horizontal flex row with vertically-centered items.

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `children` | `ReactNode` | Yes | — | Row content |
| `style` | `StyleProp<ViewStyle>` | No | — | Style override |

### Section
Standard content section with horizontal padding.

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `children` | `ReactNode` | Yes | — | Section content |
| `style` | `StyleProp<ViewStyle>` | No | — | Style override |

### KeyValueRow
Label-value row with space-between layout.

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `label` | `ReactNode` | Yes | — | Left label (strings are wrapped in styled `Text`) |
| `value` | `ReactNode` | Yes | — | Right value (strings are wrapped in styled `Text`) |
| `style` | `StyleProp<ViewStyle>` | No | — | Style override |

### Divider
Thin 1px horizontal divider line.

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `style` | `StyleProp<ViewStyle>` | No | — | Style override |

---

## ModalHeaderWithCloseButton

A modal-style header with a left-aligned close icon button, center content slot, and an optional right-side action. Optionally applies top safe-area inset.

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `onClose` | `() => void` | Yes | — | Close handler |
| `children` | `ReactNode` | No | — | Center content (typically the title) |
| `rightAction` | `ReactNode` | No | — | Right-side action element |
| `iconSize` | `"large" \| "medium" \| "small"` | No | `"large"` | Close icon button size |
| `closeIcon` | `ReactNode` | No | — | Custom close icon node (defaults to `XCloseIcon`) |
| `accessibilityLabel` | `string` | No | `"Close"` | Accessibility label for the close button |
| `applyTopInset` | `boolean` | No | `true` | Apply top safe-area inset |

---

## ModalSheet

Bottom-sheet or full-page modal with a close header and scrollable content. Also exports `ModalSheetOptionRow` and `ModalSheetOptionList` for option-list usage.

### ModalSheet

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `visible` | `boolean` | Yes | — | Whether the modal is shown |
| `onClose` | `() => void` | Yes | — | Close handler |
| `children` | `ReactNode` | Yes | — | Modal body content |
| `maxHeightPct` | `number` | No | `0.7` | Bottom-sheet max height as a fraction of screen height |
| `title` | `ReactNode` | No | — | Header center title |
| `avoidKeyboard` | `boolean` | No | `false` | Wrap content in `KeyboardAvoidingView` |
| `keyboardVerticalOffset` | `number` | No | `0` | Offset for keyboard avoidance |
| `fullPage` | `boolean` | No | `false` | Full-page (pageSheet) presentation instead of bottom sheet |
| `footer` | `ReactNode` | No | — | Footer content fixed at the bottom (full-page only) |
| `onShow` | `() => void` | No | — | Called when modal is shown |
| `onDismiss` | `() => void` | No | — | Called when modal is dismissed |
| `headerRightAction` | `ReactNode` | No | — | Right-side header action |
| `closeIcon` | `ReactNode` | No | — | Custom close icon |
| `closeIconAccessibilityLabel` | `string` | No | — | Accessibility label for the close button |

### ModalSheetOptionRow
A single full-width option button row (used in option lists inside ModalSheet).

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `label` | `string` | Yes | — | Button label |
| `onPress` | `() => void` | Yes | — | Press handler |
| `variant` | `"primary" \| "secondary" \| "tertiary"` | No | `"primary"` | Button variant |
| `color` | `"lilac" \| "dark" \| "green" \| "orange"` | No | — | Button color modifier |
| `disabled` | `boolean` | No | — | Disables interaction |
| `loading` | `boolean` | No | — | Shows loading state |
| `icon` | Button icon prop | No | — | Optional icon name |
| `accessibilityLabel` | `string` | No | — | Accessibility label |
| `style` | `StyleProp<ViewStyle>` | No | — | Style override |

### ModalSheetOptionList
Vertically-stacked list of `ModalSheetOptionRow` items.

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `options` | `ModalSheetOptionConfig[]` | Yes | — | List of option configs (each like `ModalSheetOptionRow` props plus optional `key`) |
| `style` | `StyleProp<ViewStyle>` | No | — | Container style override |

---

## NearSwapModal

Full-page swap entry modal with amount input (optional currency switcher), secondary helper text, error message, and a primary CTA. Switches to a confirmation view when `confirmView` is provided. Forwards a `focus()` handle.

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `visible` | `boolean` | Yes | — | Whether the modal is shown |
| `onClose` | `() => void` | Yes | — | Close handler |
| `title` | `string` | Yes | — | Modal title |
| `enableCurrencySwitch` | `boolean` | No | `false` | Show the currency switcher control |
| `primarySymbol` | `string` | Yes | — | Currency symbol for the primary input |
| `primaryValue` | `string` | Yes | — | Current input value |
| `onChangeText` | `(text: string) => void` | Yes | — | Called when the user types |
| `onToggle` | `() => void` | No | — | Called when the currency-switch icon is pressed |
| `amountAccessibilityLabel` | `string` | No | — | Input accessibility label |
| `amountAccessibilityHint` | `string` | No | — | Input accessibility hint |
| `toggleAccessibilityLabel` | `string` | No | — | Toggle accessibility label |
| `secondaryText` | `string` | Yes | — | Helper text shown below the amount |
| `errorMessage` | `string \| null` | No | — | Error text |
| `ctaLabel` | `string` | Yes | — | Primary button label |
| `ctaDisabled` | `boolean` | Yes | — | Whether the primary button is disabled |
| `onSubmit` | `() => void` | Yes | — | Primary button handler |
| `ctaAccessibilityLabel` | `string` | No | — | Primary button accessibility label |
| `confirmView` | `{ fromAmount: string; toAmount: string; onConfirm: () => void; onBack: () => void; loading?: boolean } \| null` | No | — | Switches the modal to confirmation mode with these handlers |

---

## NetworkPendingBadge

Inline row with a spinner and "waiting for network" caption. Only renders when `NetworkStatusService` reports waiting state.

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `label` | `string` | No | `"waiting for network"` | Caption text |
| `containerStyle` | `StyleProp<ViewStyle>` | No | — | Outer container style override |
| `textStyle` | `StyleProp<TextStyle>` | No | — | Caption text style override |
| `spinnerStyle` | `StyleProp<ViewStyle>` | No | — | Spinner style override |

---

## NostrChatModal

Full-page chat modal over Nostr relays for messaging the support contact (NIP-04 / NIP-17). Owns its own keypair, relay socket lifecycle, message cache, and delivery states.

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `visible` | `boolean` | Yes | — | Whether the modal is shown |
| `onClose` | `() => void` | Yes | — | Close handler |
| `supportPubkey` | `string` | Yes | — | Nostr pubkey of the support contact |
| `lockToSupport` | `boolean` | No | `false` | When true, lock conversation to the support contact |
| `relayUrls` | `string[]` | No | — | Override the default relay list |

---

## NotificationBadge

Small numeric badge typically overlaid on an icon button. Hidden when `count <= 0` or `visible` is false.

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `count` | `number` | Yes | — | Number to display |
| `visible` | `boolean` | No | `true` | Toggle visibility |
| `absolute` | `boolean` | No | `true` | When true, badge is absolutely positioned over its parent |
| `style` | `StyleProp<ViewStyle>` | No | — | Container style override |

---

## NuriLogo

The Nuri wordmark SVG logo.

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `size` | `number` | No | `32` | Width/height in px |
| `color` | `string` | No | `COLORS.TEXT` | Logo fill color |

---

## PasskeyLoginScreen

Full-screen passkey login/onboarding screen. Picks between a native passkey implementation and a WebView-based fallback depending on the platform.

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `visible` | `boolean` | Yes | — | Whether the screen is rendered |
| `footerMessage` | `string \| null` | No | — | Optional message shown at the bottom |
| `resetSignal` | `number` | No | — | Bumping this value resets the busy state inside the underlying content |
| `onPayloadReady` | `(payload: { prf: Uint8Array; isNew: boolean; credIdB64u?: string; credPubkeyB64u?: string }) => void` | Yes | — | Called when a passkey PRF payload is obtained |
| `onError` | `(error: string) => void` | Yes | — | Called when passkey creation/auth fails |
| `onAttemptStart` | `() => void` | No | — | Called when the user starts a create/use attempt |
| `onDismiss` | `() => void` | No | — | Called when the user dismisses the WebAuthn-unsupported card |

---

## PasskeyLoginScreenNative

Native-passkey variant of the passkey login content (no `visible` prop; the parent decides). Takes the same props as `PasskeyLoginScreen` minus `visible`.

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `footerMessage` | `string \| null` | No | — | Optional message shown at the bottom |
| `resetSignal` | `number` | No | — | Bumping this value resets the busy state |
| `onPayloadReady` | `(payload: { prf: Uint8Array; isNew: boolean; credIdB64u?: string; credPubkeyB64u?: string }) => void` | Yes | — | Called when a passkey PRF payload is obtained |
| `onError` | `(error: string) => void` | Yes | — | Called on error |
| `onAttemptStart` | `() => void` | No | — | Called when an attempt starts |
| `onDismiss` | `() => void` | No | — | Forwarded from parent; unused in native flow |

---

## PasskeyLoginScreenWebView

WebView-based fallback for the passkey login content. Same prop shape as `PasskeyLoginScreenNative`.

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `footerMessage` | `string \| null` | No | — | Optional message shown at the bottom |
| `resetSignal` | `number` | No | — | Bumping this value resets the busy state in the WebView |
| `onPayloadReady` | `(payload: { prf: Uint8Array; isNew: boolean; credIdB64u?: string; credPubkeyB64u?: string }) => void` | Yes | — | Called when a passkey PRF payload is obtained |
| `onError` | `(error: string) => void` | Yes | — | Called on error |
| `onAttemptStart` | `() => void` | No | — | Called when an attempt starts |
| `onDismiss` | `() => void` | No | — | Called when the user dismisses the WebAuthn-unsupported card |

---

## PleaseUpdateAppModal

Blocking full-screen "please update the app" modal that deep-links to the store URL.

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `visible` | `boolean` | Yes | — | Whether the modal is shown |
| `storeUrl` | `string` | Yes | — | App/Play Store URL to open |
| `headline` | `string` | No | `t("modal.PleaseUpdateAppModal.headline")` | Headline text |
| `description` | `string` | No | `t("modal.PleaseUpdateAppModal.description")` | Description text |

---

## ProgressBar

Multi-segment progress bar where the first `currentStep` segments are filled.

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `steps` | `number` | Yes | — | Total number of segments |
| `currentStep` | `number` | Yes | — | Number of filled segments |
| `style` | `StyleProp<ViewStyle>` | No | — | Container style override |

---

## QrCard

A white rounded card containing a QR code. Optionally tappable.

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `value` | `string` | Yes | — | Data encoded into the QR code |
| `size` | `number` | No | `180` | QR pixel size |
| `onPress` | `() => void` | No | — | Press handler (wraps the card in a TouchableOpacity) |

---

## QrScannerModal

Full-page modal with camera-based QR scanner, optional type filtering, and a paste-from-clipboard button. Implements `QrScannerProps` from `types/debug`.

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `visible` | `boolean` | Yes | — | Whether the modal is shown |
| `onClose` | `() => void` | Yes | — | Close handler |
| `onResult` | `(value: string) => void` | Yes | — | Called with the raw scanned/pasted string |
| `acceptTypes` | `QrType[]` | No | — | When set, only QR codes parsed to one of these types are accepted |
| `onParsedResult` | `(parsed: ParsedQr) => string \| undefined` | No | — | Called with the parsed QR. Return an error string to reject |
| `title` | `string` | No | `"Scan QR or Paste Address"` | Modal title |
| `pasteLabel` | `string` | No | `"Paste Bitcoin Address"` | Label for the paste-from-clipboard button |

---

## ReceiveQrModal

Full-page modal showing a receive address, a QR code, copy and share icon buttons, with generating/empty states.

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `visible` | `boolean` | Yes | — | Whether the modal is shown |
| `onClose` | `() => void` | Yes | — | Close handler |
| `value` | `string` | No | — | Address/value to display + encode |
| `isGenerating` | `boolean` | No | `false` | When true, shows a generating spinner instead of QR |
| `autoCopy` | `boolean` | No | `false` | Automatically copy `value` to clipboard on open |
| `shareLabel` | `string` | Yes | — | Accessibility label for the share icon button |
| `generatingText` | `string` | No | `"Generating your next receiving address..."` | Text shown during generation |
| `emptyText` | `string` | No | `"Your wallet is getting ready. Please try again in a moment."` | Empty-state text |
| `showEmptyState` | `boolean` | No | `true` | Whether to render the empty state when `value` is missing |
| `onCopy` | `() => void` | No | — | Called after a manual copy |
| `addressIcon` | `React.ReactNode` | No | — | Optional icon shown next to the address |
| `footerContent` | `React.ReactNode` | No | — | Footer content |
| `actionsContent` | `React.ReactNode` | No | — | Alternative footer content (preferred over `footerContent`) |
| `useKeyboardAvoidingView` | `boolean` | No | `false` | Enable keyboard avoidance for the modal |

---

## ScreenHeader

Top-of-screen header with the Nuri logo, optional brand text, a center slot, optional right extras, and a support icon with unread badge. The logo supports a hidden multi-tap to open a debug hub.

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `centerContent` | `ReactNode` | No | — | Center slot (e.g. a tab switcher) |
| `logoBranding` | `ReactNode` | No | — | Extra branding rendered next to the logo |
| `rightExtra` | `ReactNode` | No | — | Extra content rendered before the support button |
| `showSupport` | `boolean` | No | `true` | Whether to show the support icon button |
| `supportUnreadCount` | `number` | No | `0` | Unread support message count for the badge |
| `onSupportPress` | `() => void` | No | — | Called when the support button is pressed |
| `onLogoMultiTap` | `() => void` | No | — | Called after 8 rapid logo taps |
| `containerStyle` | `StyleProp<ViewStyle>` | No | — | Additional outer container style |

---

## Spinner

`ActivityIndicator` wrapper with named variants that map to size + color.

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `variant` | `"pending" \| "loading" \| "overlay" \| "button" \| "buttonDark"` | No | `"loading"` | Visual variant |
| `style` | `StyleProp<ViewStyle>` | No | — | Style override |

---

## StatusPill

Small pill displaying a status label with success/error/warning/pending/neutral variants.

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `label` | `string` | Yes | — | Pill label text |
| `variant` | `"success" \| "error" \| "warning" \| "pending" \| "neutral"` | No | `"neutral"` | Color variant |

---

## SumsubWebModal

Full-screen modal hosting the Sumsub KYC verification web flow in a WebView, with a fallback message when no URL is available.

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `visible` | `boolean` | Yes | — | Whether the modal is shown |
| `url` | `string \| null` | Yes | — | Verification URL (renders fallback when null) |
| `onClose` | `() => void` | Yes | — | Close handler |

---

## SupportButton

The `IconButton` + unread `NotificationBadge` pair used to open support chat.

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `unreadCount` | `number` | Yes | — | Unread message count |
| `onPress` | `() => void` | Yes | — | Press handler |

---

## SupportDumpModal

Bottom-sheet modal that sends an encrypted debug dump to support over Nostr, with progress + success/error status.

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `visible` | `boolean` | Yes | — | Whether the modal is shown |
| `onClose` | `() => void` | Yes | — | Close handler |
| `supportPubkey` | `string` | Yes | — | Nostr pubkey of the support contact |
| `appSnapshot` | `SupportDumpAppSnapshot` | No | — | App state snapshot to include in the dump |

---

## SupportModals

Wrapper that renders the support `NostrChatModal` using the configured `SUPPORT_PUBKEY`.

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `showNostrChat` | `boolean` | Yes | — | Whether to show the chat modal |
| `onCloseNostrChat` | `() => void` | Yes | — | Close handler |

---

## SwapConfirmation (SwapConfirmation.tsx)

Two named exports that compose the swap confirmation step.

### SwapConfirmationBody
Vertical "You send / You receive" amount layout.

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `fromAmount` | `string` | Yes | — | Outgoing amount text |
| `toAmount` | `string` | Yes | — | Incoming amount text |

### SwapConfirmationFooter
Primary + secondary CTA pair for confirming or backing out of a swap.

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `onConfirm` | `() => void` | Yes | — | Confirm handler |
| `onBack` | `() => void` | Yes | — | Back handler |
| `loading` | `boolean` | No | `false` | Disables both buttons and shows loading label on confirm |

---

## TabBar

Horizontal tab row with bold-active labels and an underline indicator. Generic over the tab value type.

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `tabs` | `Tab<T>[]` | Yes | — | Array of tabs (each has `value`, `label`) |
| `selected` | `T` | Yes | — | Currently selected tab value |
| `onChange` | `(value: T) => void` | Yes | — | Selection handler |

---

## Tag

Small fixed-height tag/pill displaying a text label.

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `text` | `string` | Yes | — | Tag text |
| `color` | `BodySmall` color prop | No | — | Text color (passed through to typography) |

---

## TappableBalance

Tappable balance display that switches between a hidden mask, an unresolved placeholder, or a fully rendered `BalanceDigits`.

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `isHidden` | `boolean` | Yes | — | Show the masked text instead of the balance |
| `tokens` | `BalanceToken[]` | Yes | — | Tokenized balance for visible state |
| `isNegative` | `boolean` | Yes | — | Whether the balance is negative |
| `currencySymbol` | `string` | Yes | — | Currency symbol |
| `balanceDigitsStyles` | `BalanceDigitsStyles` | Yes | — | Styles for the nested `BalanceDigits` |
| `hiddenMask` | `string` | No | `"****"` | Text shown when hidden |
| `unresolvedContent` | `ReactNode` | No | — | Content shown when the balance hasn't resolved yet (e.g. `€—`) |
| `onPress` | `() => void` | No | — | Tap handler |
| `onLongPress` | `() => void` | No | — | Long-press handler |
| `style` | `StyleProp<ViewStyle>` | No | — | Container style override |

---

## TransactionList

Vertical list of transaction rows: icon, title + optional subtitle, optional amount/amountSubtitle, optional onPress.

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `items` | `TransactionItemProps[]` | Yes | — | Row items |
| `containerStyle` | `ViewStyle` | No | — | Outer container style |

`TransactionItemProps` fields: `icon?`, `title` (required), `subtitle?`, `amount?`, `amountSubtitle?`, `amountStyle?`, `titleStyle?`, `onPress?`, `itemKey?`, `titleFirst?`, `_createdAt?` (internal, not rendered).

---

## TransactionsModalShell

Full-page transactions modal shell: title header, optional CSV export button, refresh-controlled scroll area, error/empty/loading states, and a `TransactionList` (or arbitrary `children`).

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `visible` | `boolean` | Yes | — | Whether the modal is shown |
| `onClose` | `() => void` | Yes | — | Close handler |
| `title` | `string` | Yes | — | Modal title |
| `items` | `TransactionItemProps[]` | Yes | — | Items to render in the list |
| `loading` | `boolean` | Yes | — | Whether to show the loading spinner |
| `refreshing` | `boolean` | Yes | — | Pull-to-refresh state |
| `onRefresh` | `() => void` | Yes | — | Refresh handler |
| `onExportCsv` | `() => void` | No | — | When provided, shows a CSV export icon button in the header |
| `exportDisabled` | `boolean` | No | — | Disables the CSV export button (defaults to disabled when `items` is empty) |
| `error` | `string \| null` | No | — | Error message displayed at top of list |
| `emptyText` | `string` | No | — | Custom empty-state text |
| `titleStyle` | `object` | No | — | Style for the title |
| `children` | `React.ReactNode` | No | — | Optional custom list content (renders instead of `TransactionList` when items > 0) |

---

## Typography (typography.tsx)

Text primitives backed by the `TYPOGRAPHY` tokens in `designSystem.ts`. All accept a `color` prop with the values:
`"text" | "white" | "subtitle" | "error" | "success" | "warning" | "info" | "link" | "linkLilac"`.

### H1
40px display heading (h1 token).

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `children` | `ReactNode` | Yes | — | Text content |
| `style` | `StyleProp<TextStyle>` | No | — | Style override |
| `numberOfLines` | `number` | No | — | Truncate after N lines |
| `color` | `TextColor` | No | — | Predefined text color |

### H2
Large heading (h2 token).

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `children` | `ReactNode` | Yes | — | Text content |
| `style` | `StyleProp<TextStyle>` | No | — | Style override |
| `numberOfLines` | `number` | No | — | Truncate after N lines |
| `color` | `TextColor` | No | — | Predefined text color |

### H3
Medium heading (h3 token).

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `children` | `ReactNode` | Yes | — | Text content |
| `style` | `StyleProp<TextStyle>` | No | — | Style override |
| `numberOfLines` | `number` | No | — | Truncate after N lines |
| `color` | `TextColor` | No | — | Predefined text color |

### H4
Small heading (h4 token).

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `children` | `ReactNode` | Yes | — | Text content |
| `style` | `StyleProp<TextStyle>` | No | — | Style override |
| `numberOfLines` | `number` | No | — | Truncate after N lines |
| `color` | `TextColor` | No | — | Predefined text color |

### DisplayHeadline
Brand bold display headline; supports a runtime `fontSize` override for auto-fit measuring.

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `children` | `ReactNode` | Yes | — | Text content |
| `style` | `StyleProp<TextStyle>` | No | — | Style override |
| `numberOfLines` | `number` | No | — | Truncate after N lines |
| `color` | `TextColor` | No | — | Predefined text color |
| `fontSize` | `number` | No | — | Override the default headline font size |
| `onLayout` | `(event: LayoutChangeEvent) => void` | No | — | Layout callback (used for measuring) |

### DisplayHeadlineThin
Thin variant of the brand display headline. Same props as `DisplayHeadline`.

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `children` | `ReactNode` | Yes | — | Text content |
| `style` | `StyleProp<TextStyle>` | No | — | Style override |
| `numberOfLines` | `number` | No | — | Truncate after N lines |
| `color` | `TextColor` | No | — | Predefined text color |
| `fontSize` | `number` | No | — | Override the default headline font size |
| `onLayout` | `(event: LayoutChangeEvent) => void` | No | — | Layout callback |

### Subtitle
Subtitle text (subtitle token).

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `children` | `ReactNode` | Yes | — | Text content |
| `style` | `StyleProp<TextStyle>` | No | — | Style override |
| `numberOfLines` | `number` | No | — | Truncate after N lines |
| `color` | `TextColor` | No | — | Predefined text color |

### Body
Standard 16px body text.

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `children` | `ReactNode` | Yes | — | Text content |
| `style` | `StyleProp<TextStyle>` | No | — | Style override |
| `numberOfLines` | `number` | No | — | Truncate after N lines |
| `color` | `TextColor` | No | — | Predefined text color |

### BodyBold
Bold variant of `Body`.

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `children` | `ReactNode` | Yes | — | Text content |
| `style` | `StyleProp<TextStyle>` | No | — | Style override |
| `numberOfLines` | `number` | No | — | Truncate after N lines |
| `color` | `TextColor` | No | — | Predefined text color |

### BodySmall
Smaller body text (14px).

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `children` | `ReactNode` | Yes | — | Text content |
| `style` | `StyleProp<TextStyle>` | No | — | Style override |
| `numberOfLines` | `number` | No | — | Truncate after N lines |
| `color` | `TextColor` | No | — | Predefined text color |

### BodySmallBold
Bold variant of `BodySmall`.

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `children` | `ReactNode` | Yes | — | Text content |
| `style` | `StyleProp<TextStyle>` | No | — | Style override |
| `numberOfLines` | `number` | No | — | Truncate after N lines |
| `color` | `TextColor` | No | — | Predefined text color |

### Caption
12px medium caption text.

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `children` | `ReactNode` | Yes | — | Text content |
| `style` | `StyleProp<TextStyle>` | No | — | Style override |
| `numberOfLines` | `number` | No | — | Truncate after N lines |
| `color` | `TextColor` | No | — | Predefined text color |

### Small
12px regular text (lighter weight than `Caption`).

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `children` | `ReactNode` | Yes | — | Text content |
| `style` | `StyleProp<TextStyle>` | No | — | Style override |
| `numberOfLines` | `number` | No | — | Truncate after N lines |
| `color` | `TextColor` | No | — | Predefined text color |

### TextLink
Tappable underlined link styled as body text.

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `children` | `ReactNode` | Yes | — | Link text |
| `onPress` | `() => void` | Yes | — | Press handler |
| `style` | `StyleProp<TextStyle>` | No | — | Style override |
| `suppressHighlighting` | `boolean` | No | — | Suppress highlight on press |
| `color` | `TextColor` | No | — | Predefined text color |
| `disabled` | `boolean` | No | — | Disables press (and accessibility state) |

### SelectableBody
Selectable body text intended for debug logs / copyable values.

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `children` | `ReactNode` | Yes | — | Text content |
| `style` | `StyleProp<TextStyle>` | No | — | Style override |
| `numberOfLines` | `number` | No | — | Truncate after N lines |
| `selectable` | `boolean` | No | `true` | Whether the text is selectable |
| `color` | `TextColor` | No | — | Predefined text color |

### Title
Alias for `BodyBold`. Used for modal titles.

### Headline
Alias for `DisplayHeadline`.

### AmountDisplay
Alias for `H2`. Previously 48px, now uses the 40px H2 token.

### AddressText
Alias for `Body`. Previously 18px, now uses the 16px body token.


# Usage Counts

> Generated 2026-05-22. JSX usage of each exported component across `App.tsx`, `screens/`, `components/` (excluding self), `lib/`, and `services/`.
>
> - **Files** = number of distinct files that render the component as JSX (`<Name ...`).
> - **Uses** = total number of JSX occurrences across those files.
>
> Imports without JSX usage (e.g. type imports, re-exports) are not counted. Indirect rendering via children or render props is not counted.

## Ranked by file count (descending)

| Component | Files | Uses |
|-----------|------:|-----:|
| Body | 48 | 332 |
| Button | 36 | 141 |
| ModalSheet | 36 | 37 |
| Title | 30 | 32 |
| BodyBold | 22 | 138 |
| Caption | 14 | 38 |
| Spinner | 13 | 19 |
| IconButton | 12 | 13 |
| Card | 8 | 11 |
| AmountInput | 7 | 7 |
| BodySmall | 6 | 12 |
| InputField | 5 | 13 |
| ModalSheetOptionList | 4 | 4 |
| TransactionList | 4 | 4 |
| NuriLogo | 3 | 4 |
| QrScannerModal | 3 | 4 |
| BalanceScreenLayout | 3 | 3 |
| DSSwitch | 3 | 3 |
| GenericSuccessModal | 3 | 3 |
| Headline | 3 | 3 |
| InfoList | 3 | 3 |
| ModalSheetOptionRow | 3 | 3 |
| Row | 3 | 3 |
| ScreenHeader | 3 | 3 |
| SumsubWebModal | 3 | 3 |
| SupportModals | 3 | 3 |
| TappableBalance | 3 | 3 |
| TransactionsModalShell | 3 | 3 |
| AddressText | 2 | 6 |
| ModalHeaderWithCloseButton | 2 | 3 |
| AddressDisplay | 2 | 2 |
| BaseCarousel | 2 | 2 |
| BaseDropdown | 2 | 2 |
| CurrencySwitcherInput | 2 | 2 |
| Divider | 2 | 2 |
| FloatingTransactionStatus | 2 | 2 |
| NearSwapModal | 2 | 2 |
| NetworkPendingBadge | 2 | 2 |
| NotificationBadge | 2 | 2 |
| TabBar | 2 | 2 |
| TextLink | 2 | 2 |
| SelectableBody | 1 | 3 |
| AmountDisplay | 1 | 1 |
| BalanceDigits | 1 | 1 |
| BiometricLockModal | 1 | 1 |
| BiometricRetryModal | 1 | 1 |
| BodySmallBold | 1 | 1 |
| ChatBubble | 1 | 1 |
| CompactDropdown | 1 | 1 |
| CountryDropdown | 1 | 1 |
| FAQModal | 1 | 1 |
| H3 | 1 | 1 |
| NostrChatModal | 1 | 1 |
| PasskeyLoginScreen | 1 | 1 |
| PleaseUpdateAppModal | 1 | 1 |
| QrCard | 1 | 1 |
| ReceiveQrModal | 1 | 1 |
| Small | 1 | 1 |
| SupportDumpModal | 1 | 1 |
| SwapConfirmationBody | 1 | 1 |
| SwapConfirmationFooter | 1 | 1 |

## No detected JSX usage

These components were not found rendered as JSX anywhere in the searched paths. They may be unused, internal-only (used by sibling components in `components/`), or referenced via patterns not captured by the JSX regex (e.g. dynamic `React.createElement`).

| Component | Notes |
|-----------|-------|
| BalanceHeader | — |
| Chip | — |
| DisplayHeadline | — |
| DisplayHeadlineThin | — |
| H1 | — |
| H2 | — |
| H4 | — |
| IconTabRow | — |
| InfoCard | — |
| InlineInfoCard | — |
| KeyValueRow | — |
| Label | — |
| PasskeyLoginScreenNative | — |
| PasskeyLoginScreenWebView | — |
| ProgressBar | — |
| Section | — |
| StatusPill | — |
| Subtitle | — |
| SupportButton | — |
| SwapConfirmation | — |
| Tag | — |
