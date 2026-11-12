# Mixed-weight field label — admission proposal

Version context: package 0.0.1 (unchanged, no release). Updated 2026-09-20 by Emin / Hermes.
Status: **proposal only; Pending/request-only; Decision Needed; not implemented**.

Tracks nuri-com/nuri-design-system#219. Consumer: nuri-com/nuri-expo#1412.
Related, distinct feature: nuri-com/nuri-design-system#218 / #217 (Text italic).
Neither proposal depends on the other. No native/appwide parity is claimed.

## Evidence and authority

Latest remote main checked at `022845e6c25107b0f4632e2bee256fe06e79f995`:

- [Public Text](../../packages/rn/primitives/Text.tsx) accepts ReactNode children and existing emphasis.
- [TextFieldLabelProps](../../packages/rn/generated/components/text-field.ts) accepts only `children?: string`.
- [TextField descriptor](../../packages/spec/components/text-field.ts) emphasizes the whole label and truncates it to one line; errors remain external Alert composition.
- [Renderer](../../packages/rn/runtime/renderer.tsx) derives an input name only from string label content; explicit accessibilityLabel takes precedence.

Emin approved emphasized `Wallet name:` plus regular feedback. The app task reports
web-only composition using existing DS Text; its native string label remains unchanged.
One real consumer is evidenced, not multiple independent consumers.

Per [admission policy](../design-system-admission.md), an independent named human
architect must admit the exact contract and anti-scope, then a human Project owner
must grant Ready before implementation. @taner-caliskan is requested, not assumed
appointed or approving. If requester and architect overlap, a second human reviewer
is required. This document does not change stable API documentation or admit a contract.

## Candidate exact contract (not an available API)

```tsx
// Proposed only; not currently supported.
<TextFieldLabel feedback="Use at least three characters.">
  Wallet name:
</TextFieldLabel>
```

- Retain `children?: string` as the identity; add only `feedback?: string`.
- Identity includes the colon supplied by the consumer. Do not insert punctuation,
  translate copy, trim nonempty content or interpret markup.
- Nonempty feedback opts into a single inline label: emphasized identity, one
  separating space, regular-weight feedback. Reuse existing emphasis/regular tokens;
  no numeric font-weight prop. Consumer semibold intent is not a global token change.
- Missing, empty or whitespace-only feedback follows today's label path unchanged,
  including typography, truncation, spacing, palette and accessibility defaults.
- With meaningful feedback, both identity and feedback wrap as needed with **no line
  cap, ellipsis, clipping or truncation of validation/help text**. Long localized text
  and enlarged system text must remain fully readable.
- Feedback requires a non-whitespace identity. This is not a standalone help slot;
  later implementation must diagnose invalid usage in development rather than silently
  dropping feedback. The architect must accept that diagnostic with the contract.
- Prototype counterpart: `feedback` attribute on the existing label slot element,
  identity as its text content. Removing/emptying the attribute restores baseline.
  The spelling and slot/schema representation need explicit architectural acceptance.

## Accessibility and compatibility requirements

Keep one logical label associated with the same input. With feedback enabled and no
explicit accessibilityLabel override, derive the full identity + space + feedback
name in source order on every target. Nested runs must not become duplicate accessible
labels or extra focus targets. Keep explicit accessibilityLabel precedence unchanged;
consumers using an override must preserve equivalent feedback through existing
accessible composition and verify it on their target. Do not rely on weight or color
alone to convey meaning. Label focus/click behavior must not regress where supported.

Feedback updates must update visible text and the derived name. This request does not
add validation state, announcement/live-region behavior, or replace existing Alert
error composition. Consumer code continues to own message choice and timing.

## Trade study and bounded later scope

Keeping app-local Text composition is the immediate fallback and a valid possible
architect outcome. Arbitrary ReactNode children broaden the surface and make text
extraction ambiguous; whole-string emphasis fails the user need. A bounded optional
feedback string is the candidate smallest contract, not a mandated architectural decision.

The DS ownership argument is label association/name extraction and platform-consistent
text presentation, not the wallet-specific copy. Cost includes frozen-schema review,
authored slot data, codegen, RN/prototype renderers, generated types/docs and regression
tests. An independent architect may request more evidence or keep this consumer-owned.

If admitted, change authored sources first and regenerate; never edit generated files
by hand. No general rich-text API, italic API, new component, font scale/token, arbitrary
style/weight/color, field size, validation engine, app code, release or deployment here.

## Verification plan, not executed API proof

After admission and implementation:

1. All five repository gates and deterministic re-emission; exact type/slot tests.
2. Omitted/empty/whitespace-only feedback preserves baseline output. Valid rich labels
   render correct weights without style leakage; invalid input values are rejected.
3. Long identity + long localized feedback, large text, narrow viewport and dynamic
   feedback show complete text with no truncation; other TextField behavior is unchanged.
4. Verify single associated name, override precedence, reading order and focus with
   web accessibility inspection, iOS VoiceOver and Android TalkBack.
5. Attach exact DS/app SHAs and actual consumer typecheck/build/runtime evidence for
   web, iOS and Android. A web workaround alone proves no native parity.
6. Independent verification and normal release/migration/rollback evidence before Done.

No migration for existing consumers; remove the app workaround only after a released
capability is integrated and verified. Rollback retains current consumer composition.
