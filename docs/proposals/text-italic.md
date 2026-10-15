# Proposal: orthogonal italic Text presentation

**Status: Pending / request-only — NOT admitted, NOT implemented, NOT a supported API.**

Admission request: nuri-com/nuri-design-system#217.
Consumer context: nuri-com/nuri-expo#1412 and nuri-com/nuri-expo#1413.
Baseline inspected: `main@022845e6c25107b0f4632e2bee256fe06e79f995`.

This is an internal proposal, deliberately outside `packages/doc/generated` and the
published API reference. It does not authorize implementation or change stable
contract documentation. The [admission policy](../design-system-admission.md)
requires an independent named human architect's decision, then human Project
`Ready`. Neither the consumer request nor this draft PR satisfies those gates.

## Need and evidence

The Nuri app staging task needs a single line with semibold `create wallet` and a
regular italic username. The app task reports a DS outer Text using the existing
single-line truncation contract, nested DS Text for emphasis, and raw React Native
Text with `fontStyle: 'italic'` for the username. This proposal records that gap;
it does not claim an upstream implementation or device proof.

Verified upstream sources:

- [Text](../../packages/rn/primitives/Text.tsx) consumes `TypographyNS` and exposes no italic prop.
- [Shared schema](../../packages/spec/components/schema.ts) declares size, emphasis,
  mono, alignment, flow and lines, but no italic key.
- [Typography axis](../../packages/spec/axes/typography-axis.ts) is authored data.
- [Prototype primitive](../../packages/prototype/primitives/typography.js) likewise
  exposes no italic input.

Only one concrete consumer is evidenced. A second consumer is not invented.
The architectural argument to evaluate is that slant is reusable typography
presentation and cross-platform behavior should be owned with the other text
axes, not repeatedly supplied through consumer-native style escapes. The architect
may reject that argument, request more evidence, or keep this consumer-owned.

## Candidate contract — subject to independent admission

Add `italic?: boolean` to the shared typography namespace, surfaced by public
RN `Text` and supported wherever that same namespace is resolved. No free-form
style prop, new component, family token or type-size token.

| Input | Required behavior |
| --- | --- |
| omitted / undefined | Preserve existing emitted styles and native/CSS inheritance; emit no new font-style override. |
| `true` | Select italic slant only. |
| explicit `false` | Select normal slant, including under an italic parent. |

Italic is independent from size, emphasis, mono, palette, alignment and flow.
It must not change font family, weight, size, line height, tracking or accessibility
semantics. `emphasis` still controls semibold independently. Support regular
italic and semibold italic without fusing new typography tokens.

Prototype candidate spelling: `<nuri-typography italic>` selects italic;
`italic="true"` does the same; `italic="false"` explicitly resets to normal;
removing the attribute restores the previous cascade. Unknown nonempty values
warn and do not apply a style override. The explicit false spelling needs human
architect review because existing emphasis uses presence-only boolean dispatch;
this proposal does not silently change that existing convention.

Proposed consumer composition (illustrative only; not compilable with today's API):

```tsx
<Text size="md" align="center" flow="truncate" lines={1}>
  <Text size="md" emphasis>create wallet</Text>
  {' '}
  <Text size="md" italic>{username}</Text>
</Text>
```

Keep the outer Text regular and use sibling spans so the username does not inherit
the prefix's semibold weight. Existing truncation owns the whole line. Do not add a
Button or no-wrap API: Button labels already have single-line semantics.

## Alternatives and anti-scope

- Keep the current app-local native wrapper: lowest immediate shared-core cost;
  remains the fallback while admission is pending.
- Overload emphasis: rejected proposal because weight and slant are independent.
- Add a font family/size or wallet-specific component: unnecessary generalization.
- Add one orthogonal boolean: preferred candidate, not an accepted decision.

No font assets, font scales, global font scaling, Button heights, new line-flow
behavior, product copy ownership, app modifications, deployment or release.
If shipped fonts cannot provide usable italic on any supported platform, stop and
bring measured evidence back to admission rather than expanding into font intake.

## Bounded implementation plan — only after Admit and Ready

1. Reconcile the accepted contract with the frozen shared schema; obtain explicit
   versioned-contract approval. Author source data and schema, not generated files.
2. Update RN resolution and both primitive/factory text render paths, keeping
   omitted values byte-compatible. Wire prototype attributes and generated CSS
   through the existing source-to-projection pipeline.
3. Run existing builders to regenerate only required RN/prototype outputs and
   public documentation. Never hand-edit `generated/`; no schema-guard bypass.
4. Add focused regression/type tests and a mixed-style inline fixture. Review any
   widened namespace consumers before committing; no opportunistic refactor.

## Verification plan — not executed implementation evidence

- Omission preserves prior resolver and rendered output, including inheritance.
- `true`, `false`, regular italic and emphasized italic resolve as specified;
  invalid RN prop values fail typechecking. Primitive/factory behavior agrees.
- Nested spans preserve sibling weight/slant isolation; explicit normal under an
  italic parent resets slant without changing the selected weight or metrics.
- Prototype attribute updates/removal and generated selectors match the contract.
- Existing one-line tail truncation works with short and adversarially long names.
- Run spec, prototype, doc, RN and Expo-demo gates, and verify deterministic
  re-emission. Passing tests is not an admission decision.
- After implementation, the app owner attaches exact DS/app SHAs, typecheck/build
  and web, iOS and Android/Samsung evidence of the implemented composition. Check
  clipping, glyph/family fallback and accessibility text at normal and enlarged
  system font settings without changing the global font-scaling policy.

## Decisions and handoff

Requester/evidence owner: @eminogrande / nuri-com/nuri-expo team.
Requested independent reviewer: @taner-caliskan, not presumed to have accepted the
role or contract; DS owners may nominate another independent human architect.
No architect decision or Project Ready authorization is claimed. If requester and
architect overlap, a second named human architectural reviewer is required.

After admission and verified implementation, document the additive API through the
normal generator and release process. Existing consumers require no migration.
Only then should the app replace its native italic workaround; retaining that
workaround is the rollback. This draft neither closes the admission issue nor
claims the consumer feature shipped.
