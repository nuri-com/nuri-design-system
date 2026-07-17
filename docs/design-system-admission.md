# Design-system admission

The Nuri design-system repository is the **slow shared core**. Tokens, axes, primitives, generated component contracts, runtime behavior, supported platform behavior, and stable documentation move deliberately because every admitted concept becomes shared vocabulary.

Fast learning normally belongs in the consumer repository that owns the product problem. Product screens, app wrappers, one-off compositions, provider-specific flows, and app-local recipes should prove demand at the edge before the design system pays the cost of a shared contract.

The design-system playground and prototype may host bounded DS-owned, non-contract experiments, but they are not a fast lane for public DS growth. An experiment can teach, demonstrate, or compare; it cannot create public API, generated contract, stable documentation, production consumer dependency, or supported behavior. Promotion from experiment to shared contract requires a separate Extension admission.

The Expo demo exists for design-system compatibility and behavioral verification. It is not app-feature incubation and does not admit new DS surface by itself.

There is **no fast lane for public design-system growth**. A consumer need is strong evidence, but it is not authorization by itself. Implementation does not confer admission. A branch, PR, green CI, local demo, Expo demo, or working app patch proves only that code exists and the checked behavior still passes. Gates do not prove architecture, ownership, recurrence, vocabulary quality, or whether the work belongs in the shared core.

## Public / observable surface

Public or observable surface includes components, exports, tokens, axes, descriptors, generated contracts, props, slots, primitives, providers, hooks, imperative handles, runtime behavior, accessibility/interaction semantics, supported platform behavior, and stable documentation. Adding, broadening, or materially changing any of those is an Extension. Removing, narrowing, deprecating, consolidating, or making any of those harder to use is a Contraction.

## Ownership boundary

The design system owns reusable presentation vocabulary and intrinsic cross-platform mechanics needed to honor accepted shared contracts: accessibility, interaction, focus, keyboard, overlay, token, descriptor, and runtime behavior where those mechanics are part of the contract.

Consumers own product-specific behavior, orchestration, screen layout, copy, provider-specific flows, navigation, app wrappers, one-off compositions, and local recipes until a named human design-system owner admits a shared contract.

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

Ready requires:

- named human DS-owner acceptance for the contraction;
- affected-consumer inventory or evidence of non-use;
- compatibility, migration, deprecation, rollback, and documentation handling;
- an explanation of how the contraction reduces ambiguity, duplication, misuse, or maintenance burden.

### Extension

An Extension adds, broadens, or materially changes public/observable design-system vocabulary or behavior: a token, axis value, primitive, descriptor API, generated contract, runtime behavior, documented pattern, supported platform behavior, or any other shared surface consumers may rely on.

Ready requires a named human DS owner to accept an admission record containing:

- named current consumer and concrete use case;
- evidence of recurrence or a system-owned invariant, not only a one-off app demand;
- why ownership belongs in the DS rather than the consumer;
- trade study against product-edge, app-owned, wrapper, recipe, composition, component, primitive, and existing-axis alternatives;
- anti-scope defining what will not be generalized, admitted, or supported;
- accepted public/observable contract delta;
- compatibility, migration, documentation, and future deprecation expectations;
- relevant real-consumer evidence for public API or runtime behavior changes.

### Mixed

A Mixed change both adds/broadens/materially changes public/observable surface and removes/narrows/deprecates/compatibility-affects existing surface.

Ready requires **Extension admission plus Contraction migration evidence**:

- all Extension evidence and named human DS-owner admission for the new or changed surface;
- all Contraction evidence for the removed, narrowed, deprecated, consolidated, or compatibility-affecting surface;
- explicit compatibility and migration handling for consumers moving from the old contract to the new one.

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
2. **DS contract admission** (`.github/ISSUE_TEMPLATE/ds-contract-admission.yml`) for Contractions, Extensions, and Mixed changes. It captures named human ownership, current consumer/use case, recurrence or invariant evidence, ownership argument, trade study, anti-scope, contract delta, migration/compatibility, real-consumer evidence when relevant, and bounded execution essentials.

Neither form applies an automatic `agent-ready`, `Ready`, or equivalent readiness label. During the manual pilot, the canonical execution authorization is the Nuri Delivery Project item moving to `Ready` after human review. Issue-form completeness, labels, assignment, branches, PRs, implementation, local claim tooling, Expo demos, and green CI are evidence only; they are not Ready.

## Real-consumer evidence

For public API or runtime behavior changes, the admission record must include relevant real-consumer evidence. Today that usually means Expo: an exact `nuri-com/nuri-expo` PR, fixture, typecheck/build, demo, device/runtime proof, or compatibility run that exercises the changed public contract. A written compatibility claim alone is not sufficient.

The Expo demo can verify DS compatibility and behavior, but it must not incubate app features or bypass admission. If an API/runtime change cannot yet be proven in a real consumer, keep the item out of Ready or classify the missing proof as an explicit Decision Needed / verification dependency.

## Admission workflow

1. Classify the work as Correction, internal maintenance, Contraction, Extension, Mixed, or Experiment.
2. Choose the correct front door: maintenance for no-contract-delta maintenance and bounded experiments; contract admission for public/observable contract changes.
3. For contract admission, name the human DS owner, current consumer/use case, recurrence or invariant, ownership argument, trade study, anti-scope, contract delta, migration/compatibility, and real-consumer evidence where relevant.
4. Keep unresolved human judgment in `Decision Needed`; do not hide it in an implementation task.
5. Only after the class-specific rule is satisfied may a human move the Project item to `Ready` for bounded execution.

The Ready decision is human-owned during the manual pilot. Existing DS gates prove only behavior and drift they inspect; they do not prove architectural fitness, abstraction quality, API parsimony, honest classification, ownership, recurrence, or admission.
