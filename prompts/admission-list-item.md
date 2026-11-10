# Admission request · list-item — ADMITTED (nuri-com/nuri-design-system#240) · Ready · IMPLEMENTED in PR nuri-com/nuri-design-system#241, independent verification pending

> **Status (2026-11-09).** Admitted by @darioaschero under the sole-architect exception (decision: https://github.com/nuri-com/nuri-design-system/issues/240#issuecomment-6749734963), after the independent review (https://github.com/nuri-com/nuri-design-system/issues/240#issuecomment-6744184207) and the amendment (https://github.com/nuri-com/nuri-design-system/issues/240#issuecomment-6749729294). Project Ready set by the operator. Implemented in PR nuri-com/nuri-design-system#241; independent verification pending.

> Draft for the `DS contract admission request` issue form (`.github/ISSUE_TEMPLATE/ds-contract-admission.yml`).
> Drafted 2026-11-09 at the operator's request (the requester's step only).
>
> **Filed 2026-11-09 as nuri-com/nuri-design-system#240**, at the operator's go-ahead ("Sì, posta"). The issue body is this draft in the form's field order. Its two references to the local list-gutter draft are reworded, since that draft is not in the repository.
>
> **Amended 2026-11-09 after the independent review** (https://github.com/nuri-com/nuri-design-system/issues/240#issuecomment-6744184207), following all of its claims, risks and recommendations, at the operator's go-ahead ("Confermo tutte"). The main changes:
> - the single-element accessibility reading and its frozen-schema channel are out of v1;
> - `textEnd` is deferred;
> - the tail is renamed `textSuffix` and given `fill: 'hug'`;
> - `text` is required;
> - the legacy `<nuri-list-item>` is pruned;
> - the anti-scope and the exceptions are recorded explicitly;
> - the risk is Low.
>
> Evidence cited at:
> - `feat/playground-review-sheet@4a2c24a` (pushed). This is PR nuri-com/nuri-design-system#239, which is merged. The two cited pages are byte-identical on `main@0cbb776`.
> - `nuri-com/nuri-expo@5c818c8b` (`origin/main`, 2026-11-04).
>
> The requester choices were ratified by the operator on 9 Nov and amended after the review. They are the requester's proposal, not an admission.
>
> The architect-owned field, "Architect decision record location", is left out on purpose because the requester cannot fill it.
>
> **Next:**
> 1. @darioaschero records the decision, answering each point of the review.
> 2. A human moves the item to Project `Ready`.
> 3. The implementation follows, then the independent verification.

---

**Admission class:** Extension

**Requesting actor / evidence owner:** @darioaschero

**Consumer owner / affected-surface owner:** @darioaschero (nuri-expo send journey: the review sheet of Send, Lightning pay, Buy and Sell)

## Request summary and current state

- **Current surface.** The List family is `list` · `list-action` · `list-separator`, plus `list-switch`.
  - Every row in it is pressable.
  - `list-item` is reserved for the non-pressable row (decision 84; header of `packages/spec/components/list-action.ts`).
  - No active element has the name. A quarantined pre-axes hand recipe with that tag exists in `packages/prototype/legacy/components/list-item/` (decisions 51/52). It is not a build input, and this request prunes it (scope).
- **The row the review sheet needs** is a read-only label over a value:
  - the label is `sm` and muted, over a value in `md` emphasis;
  - an optional muted suffix sits on the value's line, in the same size and with no separator character: "₿ 22 450 € 21.17";
  - there is 3 (`xs`) between the two lines;
  - rows are divided by hairlines, one every 73, with 13.9 between the text and each hairline.
  - In the DS, the same picture is a 60 row (`xl`) between `list-separator`s, which add 6 on each side of the hairline. This was measured, see choice 5.
- **Honest scope of the gap.**
  - Today the row's look **is** expressible in pure DS by composition: `nuri-view` + `nuri-typography` + `nuri-separator`. The 16 rows below prove it.
  - The gap is recurrence and consistency, not expressibility.
  - One gap is not about the look: reading the row as one element is **not** expressible today. The DS `View` has no accessibility props (`packages/rn/primitives/View.tsx:20`). That gap stays open in v1 and goes to its own request (choice 6).
- **Why now.** The Send review sheet is finished as round 21 of `send-wip.html`, and it is carried onto the six review boards of `operation.html`. These rows are the only part of that sheet still composed by hand. The page's misfit log names `list-item`.

## Proposed contract delta (not admitted)

**Proposed public/observable delta.** A new component, `ListItem` / `nuri-list-item`. It is the non-pressable sibling of `list-action`, placed inside `list`, between `list-separator`s.

```ts
// packages/spec/components/list-item.ts · proposed, not admitted
export const listItemDescriptor: Descriptor<ListItemAxes> = {
  structure: {
    anatomy: {
      el: 'view',
      parts: {
        content: { el: 'view', parts: {
          textMuted: { el: 'text' },
          line: { el: 'view', parts: { text: { el: 'text' }, textSuffix: { el: 'text' } } },
        } },
      },
    },
    base: {
      // sides ≡ list-action (md), so the text lines up with list-separator's hairline.
      // 60 tall with 6 above and below: list-separator's 6 + 6 make up the rest,
      // so rows follow each other every 73 (choice 5)
      root: { stack: { direction: 'row', align: 'center', gap: 'md' }, box: { paddingX: 'md', paddingY: 'sm', minHeight: 'xl' } },
      // the lines stack in the order the author writes them (choice 1); 3 between (choice 2)
      content: { stack: { direction: 'column', align: 'stretch', justify: 'center', gap: 'xs', fill: 'grow-shrink' } },
      // the label
      textMuted: { typography: { size: 'sm', align: 'start', flow: 'truncate', lines: 1 }, palette: { muted: true } },
      line: { stack: { direction: 'row', align: 'center', gap: 'xs' } },
      // the value: md emphasis, one line; it truncates first when the line is too long (choice 8)
      text: { stack: { fill: 'shrink' }, typography: { size: 'md', emphasis: true, align: 'start', flow: 'truncate', lines: 1 } },
      // next to the value, 3 after it: "₿ 4 802 € 4.53". It never shrinks, on either target (choice 3)
      textSuffix: { stack: { fill: 'hug' }, typography: { size: 'md', align: 'start', flow: 'truncate', lines: 1 }, palette: { muted: true } },
    },
  },
  api: {
    axes: [],                       // no axis: the order is the author's
    // no behaviour: the row is not a control, and the single-element reading is out of v1 (choice 6)
    slots: {                        // list-action's words, plus one (choice 7)
      textMuted:  { part: 'textMuted', kind: 'text', component: true },
      text:       { part: 'text', kind: 'text', component: true, required: true },
      textSuffix: { part: 'textSuffix', kind: 'text', component: true },
    },
  },
};
```

**Public names** (mechanical kebab↔Pascal):

| RN | Web |
|---|---|
| `ListItem` | `nuri-list-item` |
| `ListItemTextMuted` | `nuri-list-item-text-muted` |
| `ListItemText` | `nuri-list-item-text` |
| `ListItemTextSuffix` | `nuri-list-item-text-suffix` |

`ListItemProps` is `{ children?: React.ReactNode }`. There is no `onPress`, no `disabled` and no `accessibilityLabel`.

**How the composition works:**
- **Authored order.** Everything renders in the order the author writes it, through the shared classifier that `list-action` uses:
  - between the two lines: the review row writes the label (`textMuted`) first;
  - inside the value's line: a suffix written before `text` renders before it. The docs say: value first, then suffix.
- **Slots.** Each slot appears at most once, and `text` is required (as select-field and select-trigger mark `label` and `value`, `select-field.ts:86-88`). A row with no suffix is a label and a value.
- **Truncation.** The value truncates first (`fill: 'shrink'`), and the suffix stays whole (`fill: 'hug'`), the same on both targets. Without an explicit fill, the suffix would shrink on web (`flex: 0 1 auto`) but not on RN. The suffix is meant for short text: a handle, an amount, an expiry.

**The rest stays as it is:**
- **`list`:** no new part or prop. A list that bleeds is a separate request (choice 9). Rows and separators remain positional siblings.
- **`list-action` and `list-switch`:** unchanged, including their 0 between the lines (choice 2). Only the header comments that say "every list row" are reworded for the 60 exception (choice 5).
- **`list-separator`:** unchanged; it is used as it is (choice 5).
- **The frozen schema:** unchanged. The Guard F pin does not move.
- **Tokens, palette rows and accents:** none.

**Affected:**
- a new descriptor;
- the generated RN component and web twin;
- a new web recipe;
- the `@nuri/rn` barrel;
- the doc page;
- the playground component page;
- the guard rosters (docs-drift, naming, component-api, no-unused-exports);
- the legacy `components/list-item/` (pruned) and `legacy/README.md`.

**Anti-scope.** These items are given:
- no press, no `onPress`, no focus and no press wash;
- no chevron or trail icon;
- no selection or checked state;
- no copy action (no copy button and no tap-to-copy).

These items are proposed by the requester and open to the architect:
- **No single-element accessibility reading in v1** (choice 6). Each text is read on its own, as in today's composition. A later request brings it, with evidence first.
- **No end-of-line text (`textEnd`) in v1** (choice 3).
- **No leading avatar, and no trailing column centred on the row** as in `list-action` (choice 4). The four static-row misfits at `send-wip.html:23572, 23575, 23579, 23602` are not closed by this contract.
- **No interactive descendants.** The slots are text only.
- **No mono value, no weight option, and no wrapping value** (choice 8). Identifiers are abbreviated by the author, with the ellipsis in the middle ("bc1q…5mdq").
- **The stated geometry holds inside `nuri-list`, between `list-separator`s** (choice 5). Other placements, such as outside `nuri-list`, without separators, or in the nuri-expo soft cards, are not part of the contract.
- **No mixing with `list-action` in the same list** (choice 5): their rows follow each other every 85 and every 73.
- **No gap change on `list-action` or `list-switch`** (choice 2).
- **No change to `list`, `list-separator` or the frozen schema.**
- **No grouping container:** no soft card and no first/last corners. That belongs to the future list-group structure named in the `list-action.ts` header.
- **No auto-inserted separators** (decision 49).
- **No new token, palette row or accent scope.**
- **No reveal/mask (eye), no status colour (warning, error), and no editable value.**
- **No section heading over a group of rows.**
- **No two-line topbar title.** That is the other misfit on the same page, and it is composition.

## Requester choices (ratified by the operator, 9 Nov; amended after the independent review)

These are the requester's choices for the proposed contract. They are not an admission. Each one notes how the review's recommendation was followed.

**1 · Line order: the author's, as in `list-action`.** The review recommends: keep, with conditions; this choice follows them.
- The operator: "l'ordine delle righe e' fisso per quello che serve ora, ma guarderei come sono compesti i testi in action item, in generale il ds prmuove la composability, ma se serve per accesibility possiamo tenerlo fisso".
- The shared classifier (`packages/spec/composition/classify.js`, used by both RN and web) draws direct entries "in authored order" (`packages/rn/runtime/renderer.tsx:643-644`) and groups nested ones.
- Authored order beating anatomy order is pinned only in the classifier, for direct entries (`scripts/composition-classify.test.js:41`). No render-path test pins a reversed group, and value-first `list-item` needs one: the group `line` written before the direct `textMuted`. The implementation adds tests on both render paths, for value-first and for suffix-first.
- The order inside the value's line is authored too, and the docs say value first, then suffix.
- `text` is required.
- Accessibility does not need a fixed order: screen readers read the texts in screen order.

**2 · 3 between the lines, on `list-item` only.** The review recommends: keep.
- Round 20 tried 0 and 3 on the same case. The operator's reason: "negli action item abbiamo text md e text sm sotto, qui il contrario, e otticamente l'effetto è diverso; provane uno con lo spazio a 3".
- Round 21 applied 3 everywhere ("Sì, su tutti").
- nuri-expo uses `gap="xs"` at 4 read-only sites.
- `list-action` and `list-switch` keep 0. The docs name the difference within the family.

**3 · The suffix sits next to the value; `textEnd` is deferred.** The review recommends: keep the tail and change `textEnd`; this choice defers it.
- **The suffix.** 10 of the 16 rows have one: `@emil`, the euro after every bitcoin amount, and "Expires in 9:41". It is `md`, muted, with no "·" (round 14).
  - It takes `fill: 'hug'`, so it never shrinks on either target while the value truncates. The review measured the web suffix truncating without it: "€ 21.17" was drawn at 29.8 of its 36 px.
  - It is named `textSuffix` (choice 7).
- **`textEnd`, deferred.** The operator wanted the end-of-line form only if it did not make things more complicated: "non mi dispiacerebbe aver la possibilita' di fare questo con expire in, ma se rende tutto piu complicato no, il comportsmento fi default sarebbe con i due testi vicini". The review showed it does:
  - `fill: 'grow'` has no shipped use on a text part, and it was refused there because "Android inflates flexGrow Text to the full available width" (`select-trigger.ts:50-51`, `resolve-map.ts:102-104`);
  - `grow` is `flex: 1 0 auto`, so the end text cannot truncate, and on web a long end text collapsed the value to 0 px;
  - the end-of-line form came from the operator's screenshot, not the committed board 9, where "Expires in 9:41" is a suffix (`operation.html:840`).
  - It can come back in a later additive request, made shrinkable, with long-text and Android cases in its plan.

**4 · No leading avatar and no row-centred trailing column in v1.** The review recommends: keep.
- None of the 16 rows has either.
- The four static-row misfits in `send-wip.html` stay open:
  - a scanned identifier with a glyph avatar (L23572);
  - a read-only address with an icon-avatar (L23575);
  - a recipient with initials and the Nuri accessory (L23579);
  - `list-action` rows used as static bullets (L23602).
- Adding a 48 avatar later would make a 60 row (6 + 48 + 6), not 72, so it reopens the floor (choice 5).
- nuri-expo's swap From/To (`components/ActivityDetailSheet.tsx:169-173`) puts its end figure in emphasis. v1 does not cover it.

**5 · Rows at 60 with `list-separator` as it is; the exception is recorded.** The review recommends: keep the geometry and record the exception explicitly.
- **What `list-separator` is.** A 1px hairline in `border.subtle`, inset 12 inside the list, whose own padding is 6. The line runs from 18 to the width minus 18, with 6 above and 6 below it.
- **Why 60.** A 60 row with 6 above and below loses exactly the 6 the separator adds. So rows follow each other every 73, as the operator designed. The operator chose it ("Righe a 60 (d)") over two alternatives: the list rhythm at 72, which covers the From chip, and a new `list-separator` option.
- **The exception.** The 72 floor was set for rhythm ("a list row is 72 tall regardless of content", `list-action.ts:47-48`; it "keeps every list row on one rhythm", `list-switch.ts:60-62`), not for tap targets. `list-item` departs from that rhythm on purpose, and its picture is completed by the separators.
- **What this depends on:**
  - **Separators:** the 13.9 between text and hairline includes the separator's 6. Without separators, the texts of two adjacent rows are 15.8 apart (7.9 + 7.9). Separators are therefore part of the stated geometry (anti-scope).
  - **The outer edges:** the first and last rows are 6 tighter. Each screen adds `padding-top="sm"` and moves `padding-bottom` from `lg` to `xl`. These are two values per screen, written by the author. The review reproduced the exact sheet with them.
  - **Mixed lists:** a list that mixes `list-item` and `list-action` would alternate 73 and 85, so mixing is anti-scope.
  - **Header comments:** the "every list row" comments in `list-action.ts` and `list-switch.ts` are reworded (scope).
- **Measured on 9 Nov** (iPhone SE, `operation.html` board 7 at `4a2c24a`, three rows, the From chip behind at 239–275, the list in a column with no side padding as on board 3). The review reproduced these figures.

| | Today (hand composition) | `list-separator` as is, rows 72 | **`list-separator` as is, rows 60 (chosen)** |
|---|---|---|---|
| Sheet top | 281 | 257, over the chip | 293, and 281 with the 6 added above and below |
| Hairlines (x 18…357) | y 425, 498 (one every 73) | y 407, 492 (one every 85) | y 431, 504 (one every 73) |
| Text to hairline | 13.9 | 19.9 | 13.9 |
| Send button | 589–649 | 589–649 | 589–649 |

**6 · Accessibility: out of v1, to its own request.** The review recommends: ask for more evidence. This changes the earlier choice of one element plus an author label.
- **The review's reasons** (R1):
  - In ARIA 1.2 there is no standard web realisation: `role="group"` takes a name but does not merge its children into one stop, `aria-label` is prohibited on a generic element, and `role="text"` is not in the spec.
  - The channel's home is open: `behaviour` carries runtime handlers, while the existing `api.role` (`schema.ts:486`, realised at `renderer.tsx:744` and `factory.js:678`) already holds a non-pressable root semantic.
  - On Android, an accessible View becomes focusable.
  - The proposed coherence rule was too narrow.
  - An author label can speak a stale amount next to a different one on screen.
- **v1.** Each text is read on its own, as in today's composition, and the frozen schema is untouched.
- **The later request**, with evidence first:
  - a VoiceOver and TalkBack pass on today's board 7;
  - the web realisation named in the contract;
  - the channel's home (`api.role` or `behaviour`), with a name that is not ARIA `group`;
  - a wide coherence rule (no leaf target, no interactive descendants);
  - Android focus;
  - whether a label override is needed at all.

**7 · Slot names: `textMuted`, `text`, `textSuffix`.** The review recommends: keep `text` / `textMuted` and ask about the new names; `textEnd` is gone and the tail is renamed.
- Reusing `list-action`'s words gives the three rows one vocabulary for the two lines.
- The tail is named `textSuffix`, not `textTail`. "Tail" already names the ellipsis in the DS (`schema.ts:195-196`; `ellipsizeMode: 'tail'`, `renderer.tsx:796`), and "suffix" says what the slot is: what follows the value on its line.
- `text` and `textMuted` are `multiple` in `list-action` (`list-action.ts:73-74`) and singular here. The docs say so.
- **Decision 84's shared family vocabulary is deferred again, although its trigger is met.** `list-switch` is already a second row type (`decisionlog.md:5455-5459`). This is recorded as a decision, not a default: the per-component reuse of the same words keeps owner scoping (decision 83) and adds no shared contract. A shared `nuri-list-*` set is left to its own request.

**8 · The value as the review draws it: `md` emphasis, one line, truncated, not mono.** The review recommends: keep, with a doc rule.
- It matches round 18 (the dark texts in emphasis).
- **Doc rule:** identifiers are abbreviated by the author, with the ellipsis in the middle ("bc1q…5mdq"), because the value truncates at its end and the last characters of an address are the ones users check. They are not mono in this row. This matches nuri-expo's `ListAction` card number and IBAN (`screens/wirex/WirexCardDetailsModal.tsx:378-381`).
- Mono or wrapping values would be a later Extension.

**9 · A list that bleeds: a separate request, after this one.** The review recommends: keep.
- The operator wants a list usable in a container padded 18, with the text on the 18 line and `list-action`'s wash bleeding past it. The operator chose "Richiesta separata", then "chiuderei il list item prima".
- **Today:** `<nuri-bleed x="lg">` around the list already gives text at 18 in a container padded 18. It works only because 18 = 6 + 12, and it needs the wrapper every time. On web the row's inner `<button>` is re-enabled by the bleed cascade (`bleed.css:24-25`); on RN a Pressable is its own target.
- **The unposted list-gutter draft** (`prompts/admission-list-gutter.md`, 17 Aug) assumes 12 columns. In an 18 column it would put the text at 12, so it needs revising.
- **No effect on `list-item`:** it takes `list-action`'s side padding and lines up with it, whatever the list does. The bleed request's inventory includes `list-item`.

## Consumer need, gap, and current workaround (before admission)

**Consumer / owner.** The nuri-expo send journey, owned by @darioaschero. The review sheet comes before the confirm button of Send (from Euro, from Bitcoin, to a bitcoin address), Lightning pay, Buy and Sell.

**Use case.** The sheet states where the money goes and what leaves and arrives, in read-only rows. The rows follow four content rules:
- "To" on sends;
- what leaves, in its currency;
- what arrives, only when it differs (otherwise "No fee");
- the invoice row with its expiry.

The rows were finalized in round 21 of `send-wip.html` and carried onto `operation.html`.

**Gap.** The List family has no non-pressable row. `list-action` without `onPress` is still a pressable host, with the button role, the press wash and focus.

**Workaround.** Each row is composed by hand, at `operation.html@4a2c24a` boards 2, 5, 7, 9, 12 and 14:

```html
<nuri-view direction="column" align="stretch" padding-x="lg" padding-bottom="lg">
  <nuri-view direction="column" align="start" justify="center" gap="xs" min-height="2xl" padding-y="md">
    <nuri-typography size="sm" muted>You send</nuri-typography>
    <nuri-view direction="row" align="center" gap="xs">
      <nuri-typography size="md" emphasis>₿ 22 450</nuri-typography>
      <nuri-typography size="md" muted>€ 21.17</nuri-typography>
    </nuri-view>
  </nuri-view>
  <nuri-separator y-space="none"></nuri-separator>
  …
</nuri-view>
```

The page's misfit log (`operation.html:1940`) reads, in short:
- boards 2, 5, 7, 9, 12 and 14 ask for a read-only item at the list rows' height, label over value with space xs, and a muted tail on the value's line;
- it is composed as a column view with typography nodes;
- the element that would remove it is "list-item (the reserved non-pressable list row)".

## Available consumer-local prototype or evidence (before admission)

**Use count at `4a2c24a`:**

| Board (`operation.html`) | Rows | Rows with a suffix | Separators |
|---|---|---|---|
| 2 · send from euro · review (L109) | 3 | 1 | 2 |
| 5 · send from bitcoin · review (L419) | 3 | 2 | 2 |
| 7 · send to a bitcoin address · review (L616) | 3 | 2 | 2 |
| 9 · pay a lightning invoice · review (L784) | 3 | 3 | 2 |
| 12 · buy bitcoin · review (L987) | 2 | 1 | 1 |
| 14 · sell bitcoin · review (L1152) | 2 | 1 | 1 |
| **Total** | **16** | **10** | **10** |

- The misfit log names `list-item` once, in one entry that covers all six boards (L1940).
- `send-wip.html` round 21 (L941–1599) has the same six cases and the same 16 rows. It is the source of `operation.html`, not a second use.
- `send-wip.html` names `list-item` 24 times:
  - 19 are misfit entries for review rounds 4–22. This is the row's history: a side-by-side 48 row (rounds 4–8), then label over value (from round 9), 72 tall (round 19), and 3 between the lines (rounds 20–21).
  - One is a note in a round comment (L15860).
  - Four ask for static rows that this contract does not cover (L23572, 23575, 23579, 23602; choice 4).

**How the row was settled (operator, 9 Nov):**
- **Round 14:** the tail in the value's size, muted, with no dot ("non fare cambi di font size, solo colore e peso").
- **Round 15:** the euro after every bitcoin amount.
- **Round 18:** the dark texts in emphasis.
- **Round 19:** rows at 72 ("Sì, a 72").
- **Rounds 20–21:** 3 between the lines (choice 2).
- **Measured on iPhone SE at round 21, and reproduced by the review:**
  - The label is 19.3 tall and the value 21.9. Each row is 72, split 13.9 / 3 / 13.9.
  - The sheet's top is at 281 with three rows and at 354 with two.
  - The button is at 589–649, and nothing scrolls.

**Recurrence in the consumer app** (`nuri-com/nuri-expo@5c818c8b`, read-only search of `screens/` and `components/`, debug screens excluded; the review swept the same files and found only these sites):

| Where | What | Fit |
|---|---|---|
| `components/ActivityDetailSheet.tsx:209-231` (activity details) | Date, Status: `sm` muted over `md` regular, `gap="xs"`, in a soft card | Read-only label over value. 2 rows |
| `components/ActivityDetailSheet.tsx:164-176` | swap From / To: `sm` muted label over a line of name (`md` regular) + amount (`md` emphasis), justify between | Read-only, with an emphasised figure at the line's end. Not covered in v1 |
| `screens/addressBook/AddressBookScreen.tsx:813-828` (contact page) | Note: `sm` muted over `md` wrap, gap `sm`, soft card | Read-only. 1 row |
| `screens/wirex/modals/WirexAppleWalletModal.tsx:107-122` | Expiry and CVV: `sm` muted over `md` mono, `gap="xs"`, two columns side by side | Read-only pairs, not list rows |
| `components/UsernamePicker.tsx:236-241` | preview: `xs` muted over `md` mono, `gap="xs"` | One read-only pair, not a row |
| `components/ActivityDetailSheet.tsx:183-206`, `AddressBookScreen.tsx:776-808`, `components/LightningInvoiceSheet.tsx:307-331`, `components/ReceiveModal.tsx:136-159` | counterparty, destinations, invoice, receive address: label over value **with a copy button** | Copy is anti-scope. These stay as they are |
| `screens/wirex/WirexCardDetailsModal.tsx:183-262, 373-386` | card and bank details as `ListAction`, value over label, with copy/reveal | Pressable. Already served by `list-action` |
| `components/send/SendFromRow.tsx:61-66`, `screens/home/MoveSheet.tsx:633-641`, `components/PayLinkSummary.tsx:91-103` | "From Euro" / "To …" inline on one line | A different shape (the read-only chip misfit of `operation.html` 16) |

**Honest reading:**
- The **typographic pair** (`sm` muted label over an `md` value, 3 apart) recurs in nuri-expo. Its 3px gap matches the operator's choice independently.
- The **exact contract comes from one design**: a list row, a 60 floor and an `md` emphasis value, drawn as 16 rows of one sheet family.
- **None of the nuri-expo pairs would adopt it without a visual change.** They differ in weight (regular), container (soft card) and floor (none).
- **What carries the case** is the family invariant (row padding coupled to the separator) and the consistency of the List family.

**Missing evidence:**
- There is no RN or device rendering of the review rows: the playground is web only. That is post-implementation proof, owned by the implementer.
- How VoiceOver and TalkBack read today's composed rows has not been probed. That belongs to the later accessibility request (choice 6).

## Class-scoped Extension / Mixed evidence

**Recurrence or system-owned invariant.**
- *Honest scope:* one sheet design in one flow family (Send, Lightning pay, Buy, Sell), drawn on 6 boards with 16 rows. The nuri-expo detail sheets show the same label/value pair 5 more times, in a soft-card container rather than a list.
- *The invariant:* the List family already owns the parts of the row that would otherwise be copied by hand:
  - the row padding;
  - the separator (its inset and its rhythm);
  - the coupling between the row text and the separator inset;
  - the row floor (72 for pressable rows, by the operator's ruling of 2026-10-14; 60 for `list-item`, choice 5).

  A hand-composed row copies those numbers into every screen, and a change to the family would not reach it. That includes the coming request on a list that bleeds.
- *The name:* decision 84 reserved `list-item` "for a future non-pressable row", stating that "the reserved name records a real product distinction, not an omission".

**DS ownership argument.**
- The geometry (floor, padding, inset, separator) and the type pair are already DS tokens and DS rows. A consumer copy re-implements them next to the DS ones.
- The playground is the consumer channel: the app implements from playground links. A row that exists only as five layout attributes per instance stays consistent only as long as every copy is faithful. Drift has already started: nuri-expo has `gap="xs"` and `gap="sm"`, emphasis and regular values, and `xs` and `sm` labels.
- The single-element reading can only be solved in the DS, since no consumer composition can express it today. It is left to its own request (choice 6).

**Alternatives / trade study.**

| Alternative | Requester's reading (not a decision) |
|---|---|
| Keep the composition in each consumer (`View` + `Typography` + `Separator`) | Works today and costs nothing. It repeats the row's layout values per row, and the drift is already visible in nuri-expo. |
| `list-action` without `onPress` | Still a pressable host (button role, wash, focus). The DS keeps one semantic per control (`list-switch.ts` header). |
| An `interactive: false` prop or axis on `list-action` | Two semantics in one control, against the same rule. It widens a shipped contract. |
| A consumer-owned `ReviewRow` in nuri-expo | It serves one app. The DS playground cannot show it, so the misfit stays open on the DS side. |
| A label/value "field" element outside the List family | It would also fit the soft-card sites in nuri-expo, but it is a new name next to a reserved one, and the row floor and separator would stay hand-composed. |

**Contract cost.**
- One new component on both targets: three text slots (`text` required), no props beyond `children`, no axes, no tokens and no schema change.
- The legacy `list-item` recipe is pruned.
- The upkeep:
  - one more list-family row in the docs, with the 60 exception and the separator dependency named;
  - the guard rosters;
  - two new composition tests (value-first and suffix-first) on both render paths;
  - the bleed request's inventory (one more row type to check);
  - any later family-wide change, which has three rows to move instead of two.

**Anti-scope / deferred.** See the delta above. These are deferred to later requests:
- the single-element accessibility reading;
- `textEnd`;
- the avatar;
- mono and wrapping values;
- grouping into soft cards;
- the shared family slot vocabulary.

## Requested DS architect / admission recorder

@darioaschero · sole-architect exception · independent review: https://github.com/nuri-com/nuri-design-system/issues/240#issuecomment-6744184207

## Proposed bounded execution scope if admitted

**In scope:**

- **Spec:**
  - `packages/spec/components/list-item.ts` (new);
  - the family lines in the headers of `list.ts`, `list-action.ts` and `list-switch.ts`, with "every list row" reworded for the 60 exception.
- **Codegen and guards:**
  - `scripts/parsers/descriptors.js` roster;
  - `scripts/component-api.test.js`, `docs-drift.test.js` (roster only; the Guard F pin does not move), `naming.test.js`, `no-unused-exports.test.js`, `spec-agnosticism.test.js`, `recipes.test.js`.
- **RN:**
  - regenerated `generated/components/list-item.ts` and `generated/data/recipes.ts`;
  - the `index.ts` barrel;
  - `__tests__/render-smoke`, `__tests__/public-surface`, `type-tests/component-types.test-d.tsx`;
  - a composition test on the RN render path for value-first and suffix-first `list-item`.
- **Web:**
  - `prototype/recipes/list-item.js` and the `recipes/list.js` import;
  - the regenerated descriptor twin;
  - the same composition test on the web factory path;
  - `playground/pipeline/bundle.js`;
  - `pages/component/list-item.html` (new) and `component/index.html`.
- **Legacy:** prune `packages/prototype/legacy/components/list-item/` (`list-item.js` and `list-item.css`), and update `legacy/README.md` (its table and its "Pruned" note). This is the icon-button and tab-bar precedent. The other frozen legacy files that mention the tag stay as read-only specs.
- **Playground:** the six review sheets of `operation.html` move to `nuri-list-item`, and the misfit-log line is closed.
  - The rows sit inside `nuri-list`, with `nuri-list-separator` between them.
  - The column loses `padding-x="lg"`, or wraps the list in `<nuri-bleed x="lg">`.
  - The column adds `padding-top="sm"`, and moves `padding-bottom` from `lg` to `xl`.
  - `send-wip.html`'s rounds stay as history.
- **Expo-demo:** one existing sheet gains read-only rows, in pure DS components (candidate: `src/sheets/ActivitySheet.tsx`).
- **Doc:**
  - `harness/shell.js` nav;
  - `pipeline/component-api-ir.js`;
  - `pipeline/docs.js` order;
  - `pipeline/docs-drift.test.js`;
  - the generated `list-item` page.

**Out of scope:**
- nuri-expo adoption, which is a separate consumer PR after a vendoring sync;
- moving the nuri-expo soft-card detail sites, which is the consumer's call;
- any change to `list`, `list-action` and `list-switch` (beyond the header comments), `list-separator` or the frozen schema;
- the single-element accessibility reading and `textEnd`, which are later requests (choices 6 and 3);
- the list that bleeds and the list-gutter draft, which form a separate request (choice 9);
- the list-group container;
- the two-line topbar title and the read-only select-trigger (the other misfits on `operation.html`);
- the merge (the operator merges).

**Artifacts expected to change:**
- spec and the generated contracts;
- prototype and RN contract and composition tests;
- the legacy `list-item` folder and its README;
- the doc page;
- the playground `component/list-item` page and `operation.html`;
- one expo-demo sheet.

## Downstream verification plan (before Ready)

- [ ] **Repository checks / CI:**
  - root `npm run build` and `npm test`;
  - the 5 gates (`spec` · `prototype` · `doc` · `rn` render-smoke and tsc · `expo-demo` tsc), including the `@nuri/doc` workspace;
  - two builds give hash-identical generated files;
  - only the generated files listed in scope differ, and the Guard F pin is unchanged.
- [ ] **Contract / type proof:**
  - `ListItemProps` is exact in the type-tests: `children` and the three slot components, with no `onPress`, `disabled` or `accessibilityLabel`;
  - a row without `text` fails as the generated contract defines for required slots;
  - there is no pressable host on RN and no button role on web;
  - no second definition of `nuri-list-item` exists in the tree.
- [ ] **Composition proof:** on both render paths, value-first and suffix-first rows render in the authored order, pinned by tests.
- [ ] **Rendered proof (web, in-session):** `component/list-item.html` and the six `operation.html` review boards. Probe them by geometry, not by eye:
  - every two-line row is 60 with 7.9 / 3 / 7.9, the hairlines come every 73, and the text sits 13.9 from each hairline;
  - the row text x equals the hairline x (18);
  - the suffix sits 3 after the value on its line;
  - with a long value, the value truncates and the suffix stays whole, on web and RN-web, then on device (Android included);
  - light and dark;
  - the structural parts (`content`, `line`) render: dump the tree and assert them by geometry on host nodes;
  - on iPhone SE the sheets measure as today: sheet top at 281 with three rows and 354 with two, clear of the chip (which ends at 275), and the button at 589–649.
- [ ] **Expo proof (post-implementation):**
  - the expo-demo sheet through the Expo web preview;
  - then the native-only residue for the operator on a device or simulator:
    - VoiceOver and TalkBack read the texts in screen order, with no stop on the row itself, as in today's composition;
    - large text, where the row grows past 60 without clipping;
  - screenshots under `docs/evidence/list-item/`.
- [ ] **Real consumer:** an exact nuri-com/nuri-expo PR that implements the Send review sheet from the playground link. It is attached during Verification/Done, never before Ready.

## Acceptance criteria and Verification/Done evidence

- [ ] `<ListItem>` and `<nuri-list-item>` render from the descriptor on both targets. There are no hand-authored platform strings, and the names are mechanical kebab↔Pascal.
- [ ] The geometry and the type match the contract on both targets:
  - 60 floor, padding `md` at the sides and `sm` above and below, 3 between the lines;
  - label `sm` muted and value `md` emphasis, in the order the author writes them;
  - the suffix next to the value. It stays whole while the value truncates.
- [ ] The row is not focusable, has no wash, and does not respond to a tap. Screen readers read its texts in screen order (probed, not asserted).
- [ ] The legacy `list-item` recipe is pruned, `legacy/README.md` is updated, and the tag is defined once.
- [ ] The six `operation.html` review sheets use `nuri-list-item`, and their misfit-log line is closed. The sheets measure as before (rows every 73, sheet top 281 / 354, button 589–649).
- [ ] `list`, `list-action`, `list-switch` and `list-separator` snapshots are unchanged.
- [ ] The full gate suite is green, including `@nuri/doc`, and the commands and their output are in the PR.
- [ ] This issue's status line is flipped in the same PR that ships the implementation.

## Owning repository and base branch

`nuri-com/nuri-design-system @ main`

## Dependencies and human decisions

- **Evidence:** nuri-com/nuri-design-system#239 (merged), at `feat/playground-review-sheet@4a2c24a`.
- **Independent review:** https://github.com/nuri-com/nuri-design-system/issues/240#issuecomment-6744184207.
- **Process precedent:** nuri-com/nuri-design-system#233 (Button `variant: ghost`, amended after its review).
- **The sole-architect exception:** nuri-com/nuri-design-system#229.
- **List family:**
  - nuri-com/nuri-design-system#201 ("Refactor UI List component", open);
  - the list that bleeds, a separate request to come after this one, revising the unposted `prompts/admission-list-gutter.md` for 18 columns (choice 9). This request does not wait for it;
  - nuri-com/nuri-design-system#212 (Bleed): its anti-scope refuses a bleed inside a descriptor.
- **Decisions:** in `decisionlog.md`:
  - 84 (the reserved name; the family slot vocabulary, deferred again in choice 7);
  - 83 (owner scoping);
  - 51/52 (the legacy list item, pruned);
  - 49 (separators are author-placed).

  The operator's ruling of 2026-10-14 (the 72 floor) gets a recorded exception for the read-only row (choice 5).
- **Later requests named here:**
  - the single-element accessibility reading (choice 6);
  - `textEnd` (choice 3);
  - the list that bleeds (choice 9).
- **Decision Needed:** the architect's decision, answering each point of the independent review.

## Risk class

Low

## Authority, responsibility, and accountability evidence

**This draft:** written by an agent session at the requester's direction. That session only read the DS checkout and nuri-expo, measured in a browser without changing files, wrote this one file, and posted nothing.

**May change (after Ready):**
- `packages/spec` (not the frozen schema);
- the generated outputs;
- `packages/rn` tests and barrel;
- `packages/prototype` recipes, tests, and the legacy `list-item` folder with its README;
- `packages/doc`;
- `packages/playground`;
- `packages/expo-demo`;
- `scripts/` parsers and tests.

**Must not change:**
- nuri-expo;
- the tokens and palette rows;
- the frozen schema;
- other components' contracts: `list`, `list-action`, `list-switch`, `list-separator` and the rest. Only the header comments named in scope change.

**Approval boundaries:**
- no merge without the operator;
- no release tag without the operator;
- Project `Ready` is set by a human.

**Outcome:** one PR implementing the admitted contract.

**Independent verification:** the commands and probes above, re-run by someone other than the implementer.

## Release, migration, and documentation plan

**Release.**
- It is an Extension: a new export, with no change to existing components, so no migration is needed.
- It ships in the next `rn/v0.x.y` tag with a release-note line ("List: `ListItem`, the read-only row").

**Consumers.** nuri-expo picks it up on the next vendoring sync. Adoption in the Send review sheet is a separate consumer PR.

**Docs.**
- The new `list-item` page says:
  - when to use it: read-only facts in a list, never an action;
  - that the lines and the suffix follow the author's order (value first, then suffix);
  - that the suffix is short text, and that identifiers are abbreviated with the ellipsis in the middle;
  - that its 60 floor and 3 gap differ from `list-action`, and why;
  - that it sits between `list-separator`s inside `nuri-list`, and that the screen adds 6 above and below the list;
  - that it is not mixed with `list-action` in one list.
- The list family's pages name three rows.
- Both are updated in the same PR.

**Rollback.** Revert the PR; no consumer uses `list-item` until the sync. The legacy folder comes back with the revert.
