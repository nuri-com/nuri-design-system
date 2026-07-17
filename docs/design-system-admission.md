# Design-system admission

The Nuri design-system repository is the **slow shared core**. Tokens, axes, primitives, generated component contracts, runtime behavior, supported platform behavior, and stable documentation move deliberately because every admitted concept becomes shared vocabulary.

Fast learning normally belongs in the consumer repository that owns the product problem. Product screens, app wrappers, one-off compositions, provider-specific flows, and app-local recipes should prove demand at the edge before the design system pays the cost of a shared contract.

The design-system playground and prototype may host bounded DS-owned, non-contract experiments, but they are not a fast lane for public DS growth. An experiment can teach, demonstrate, or compare; it cannot create public API, generated contract, stable documentation, production consumer dependency, or supported behavior. Promotion from experiment to shared contract requires a separate Extension admission.

The Expo demo exists for design-system compatibility and behavioral verification. It is not app-feature incubation and does not admit new DS surface by itself.

There is **no fast lane for public design-system growth**. A consumer need is strong evidence, but it is not authorization by itself. Implementation does not confer admission. A branch, PR, green CI, local demo, Expo demo, or working app patch proves only that code exists and the checked behavior still passes. Gates do not prove architecture, ownership, recurrence, vocabulary quality, or whether the work belongs in the shared core.

## Public / observable surface

Public or observable surface includes components, exports, tokens, axes, descriptors, generated contracts, props, slots, primitives, providers, hooks, imperative handles, runtime behavior, accessibility/interaction semantics, supported platform behavior, and stable documentation. Adding, broadening, or materially changing any of those is an Extension. Removing, narrowing, deprecating, consolidating, or making any of those harder to use is a Contraction.

## Actor separation

Admission has two different human roles:

- **Consumer / product owner:** raises and demonstrates the need. This role supplies the current consumer, product use case, gap or workaround, consumer-local prototype or implementation when one exists, and evidence that the edge problem is real.
- **Independent DS architect / admission authority:** evaluates whether the design system should own the contract. This named human reviews recurrence or system invariant, ownership, alternatives, contract cost, anti-scope, and any Contraction evidence, then explicitly records one decision: admit a specific DS contract, reject it, request more evidence, or keep it consumer-owned.

Consumer demand cannot authorize itself. Completing a form, checking an owner-acceptance box, opening a branch or PR, producing an Expo demo, passing gates, or having an implementing agent assemble evidence does not admit a contract. The consumer/product owner and the implementing agent cannot self-admit. Only an independent DS architect-admitted **specific contract** can become eligible for Project `Ready`.

## Evidence sequencing

The evidence order is part of the policy:

1. **Before admission:** consumer/product-owner evidence of need, or Contraction impact evidence for already-admitted surface.
2. **Admission review:** independent DS architectural decision to admit, reject, request more evidence, or keep consumer-owned.
3. **Before Project `Ready`:** the architect-accepted contract and anti-scope, bounded execution scope, migration/compatibility/documentation plan as applicable, and downstream verification plan.
4. **During Verification/Done:** actual evidence against the implemented contract: repository checks, CI, typecheck/build, fixture/demo proof, Expo or other real-consumer PRs, device/runtime checks, and compatibility runs as relevant.

Do not require a pre-implementation Expo PR, runtime proof, or compatibility run before Project `Ready`; new public API normally cannot be exercised by Expo before it exists. A written compatibility claim is useful planning evidence, but it is not completion proof.

## Ownership boundary

The design system owns reusable presentation vocabulary and intrinsic cross-platform mechanics needed to honor accepted shared contracts: accessibility, interaction, focus, keyboard, overlay, token, descriptor, and runtime behavior where those mechanics are part of the contract.

Consumers own product-specific behavior, orchestration, screen layout, copy, provider-specific flows, navigation, app wrappers, one-off compositions, and local recipes until an independent DS architect admits a specific shared contract.

When in doubt, keep the behavior in the consumer repo and document the evidence. Promote only when the shared-core cost is justified, the accepted contract is clear, and the anti-scope prevents accidental generalization.

## Change classes

### Correction

A Correction restores an already-admitted contract or fixes an implementation, documentation, type, generated-output, or runtime mismatch with **no intended public or observable delta**.

Ready requires:

- the broken invariant or regression is named;
- the issue explicitly confirms no intended public/observable delta;
- verification proves the admitted contract is restored.

Corrections use the lightweight DS maintenance form and do not require an admission record.

### Internal maintenance

Internal maintenance keeps repo mechanics healthy without changing public/observable surface. Examples include internal tests, codegen hygiene that re-emits the same contract, build/doc plumbing, or policy wording that does not admit, remove, broaden, or narrow DS surface.

Ready requires:

- the internal artifact or process is named;
- the issue explains why there is no public/observable contract delta;
- scope, authority, and verification are bounded to maintenance.

Internal maintenance uses the lightweight DS maintenance form and does not require an admission record.

### Contraction

A Contraction removes, narrows, deprecates, consolidates, or makes less available an already-admitted public/observable contract.

Ready requires proportional Contraction evidence:

- independent DS architect acceptance of the specific contraction and anti-scope;
- affected-consumer inventory or evidence of non-use;
- migration implications and compatibility, deprecation, rollback, release-note, and documentation handling;
- an explanation of the ambiguity, duplication, misuse, or maintenance burden removed;
- bounded execution scope and downstream verification plan.

A pure Contraction is not required to prove Extension-style recurrence, generalization, or new shared vocabulary. If the work also adds, broadens, or materially changes public/observable surface, classify it as Mixed.

### Extension

An Extension adds, broadens, or materially changes public/observable design-system vocabulary or behavior: a token, axis value, primitive, descriptor API, generated contract, runtime behavior, documented pattern, supported platform behavior, or any other shared surface consumers may rely on.

Before admission, the consumer/product owner supplies evidence of need:

- named current consumer and concrete use case;
- the gap, current workaround, or consumer-local prototype/implementation;
- why existing DS surface, app-local composition, wrapper, recipe, or product-edge ownership is insufficient.

Admission review is owned by the independent DS architect and must evaluate:

- evidence of recurrence or a legitimate system-owned invariant, not only one app's immediate preference;
- why ownership belongs in the DS rather than the consumer;
- trade study against product-edge, app-owned, wrapper, recipe, composition, component, primitive, and existing-axis alternatives;
- contract cost, maintenance burden, vocabulary quality, and compatibility expectations;
- anti-scope defining what will not be generalized, admitted, or supported;
- the decision: admit a specific contract, reject, request more evidence, or keep consumer-owned.

Before Project `Ready`, an admitted Extension must have the architect-accepted public/observable contract delta and anti-scope, bounded execution scope, migration/compatibility/documentation plan, and downstream verification plan. Actual Expo, fixture, demo, device/runtime, or compatibility proof is Verification/Done evidence after implementation.

### Mixed

A Mixed change both adds/broadens/materially changes public/observable surface and removes/narrows/deprecates/compatibility-affects existing surface.

Ready requires **Extension admission plus Contraction evidence**:

- all Extension consumer evidence and independent DS architect admission for the new or changed surface;
- all Contraction affected-consumer/non-use, migration, compatibility, rollback, documentation, and burden-reduction evidence for the removed, narrowed, deprecated, consolidated, or compatibility-affecting surface;
- explicit migration handling for consumers moving from the old contract to the new one;
- bounded execution scope and downstream verification plan for the whole change.

### Experiment

An Experiment explores a possible design-system idea without admitting contract. It must be bounded to DS-owned non-contract surfaces such as `@nuri/playground`, `@nuri/prototype` prototype surfaces, internal notes, or throwaway fixtures.

Ready requires:

- explicit confirmation that no public/observable contract is created;
- boundaries keeping the work out of public barrels, generated contracts, stable docs, and production consumer paths;
- a promotion rule: any move from experiment to shared contract requires a separate Extension admission.

Experiments use the lightweight DS maintenance form and do not require an admission record while they remain non-contract.

## Issue front doors

The repository has exactly two design-system governance front doors:

1. **DS maintenance** (`.github/ISSUE_TEMPLATE/ds-maintenance.yml`) for Corrections, internal maintenance, and bounded DS-owned Experiments. It is intentionally proportional and does not ask for an admission record.
2. **DS contract admission** (`.github/ISSUE_TEMPLATE/ds-contract-admission.yml`) for Contractions, Extensions, and Mixed changes. It captures the requesting actor or consumer/product owner, independent DS architect/admission authority, admission decision, consumer evidence of need, class-specific Contraction evidence, architect-accepted contract and anti-scope, migration/compatibility/documentation plan, bounded execution scope, downstream verification plan, and Done evidence expectations.

Neither form applies an automatic `agent-ready`, `Ready`, or equivalent readiness label. During the manual pilot, the canonical execution authorization is the Nuri Delivery Project item moving to `Ready` after human review. Issue-form completeness, labels, assignment, branches, PRs, implementation, local claim tooling, Expo demos, and green CI are evidence only; they are not Ready.

## Downstream verification evidence

For public API or runtime behavior changes, the admission record must include the planned downstream proof before Project `Ready`; actual proof is attached during Verification/Done after implementation. Today that usually means Expo: an exact `nuri-com/nuri-expo` PR, fixture, typecheck/build, demo, device/runtime proof, or compatibility run that exercises the implemented public contract.

The Expo demo can verify DS compatibility and behavior, but it must not incubate app features or bypass admission. If actual real-consumer proof cannot be produced after implementation, keep the item in Verification or mark the missing proof as an explicit blocker/Decision Needed. A written compatibility claim alone is not sufficient completion proof.

## Admission workflow

1. Classify the work as Correction, internal maintenance, Contraction, Extension, Mixed, or Experiment.
2. Choose the correct front door: maintenance for no-contract-delta maintenance and bounded experiments; contract admission for public/observable contract changes.
3. For Extension/Mixed, have the consumer/product owner supply evidence of need. For Contraction/Mixed, supply affected-consumer or non-use evidence and migration implications.
4. Have the independent named DS architect/admission authority record the architectural decision: admit a specific contract, reject, request more evidence, or keep consumer-owned.
5. Keep pending, rejected, more-evidence, and consumer-owned outcomes out of Project `Ready`; track unresolved human judgment as `Decision Needed`, not as implementation work.
6. Only after a specific contract is admitted, anti-scope is clear, execution scope is bounded, and downstream verification is planned may a human move the Project item to `Ready`.
7. During Verification/Done, attach actual checks and real-consumer/runtime/compatibility evidence against the implemented contract.

The Ready decision is human-owned during the manual pilot. Existing DS gates prove only behavior and drift they inspect; they do not prove architectural fitness, abstraction quality, API parsimony, honest classification, ownership, recurrence, or admission.
