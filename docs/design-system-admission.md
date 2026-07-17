# Design-system admission

The Nuri design-system repository is the **slow shared core**. Tokens, axes, primitives, generated component contracts, runtime behavior, supported platform behavior, and stable documentation move deliberately because every admitted concept becomes shared vocabulary.

Fast learning normally belongs in the consumer repository that owns the product problem. Product screens, app wrappers, one-off compositions, provider-specific flows, and app-local recipes should prove demand at the edge before the design system pays the cost of a shared contract.

The design-system playground and prototype may host bounded DS-owned, non-contract experiments, but they are not a fast lane for public DS growth. An experiment can teach, demonstrate, or compare; it cannot create public API, generated contract, stable documentation, production consumer dependency, or supported behavior. Promotion from experiment to shared contract requires a separate Extension admission request and independent admission decision.

The Expo demo exists for design-system compatibility and behavioral verification. It is not app-feature incubation and does not admit new DS surface by itself.

There is **no fast lane for public design-system growth**. A consumer need is strong evidence, but it is not authorization by itself. Implementation does not confer admission. A branch, PR, green CI, local demo, Expo demo, or working app patch proves only that code exists and the checked behavior still passes. Gates do not prove architecture, ownership, recurrence, vocabulary quality, or whether the work belongs in the shared core.

## Public / observable surface

Public or observable surface includes components, exports, exported types, tokens, axes, descriptors, generated contracts, props, slots, primitives, providers, hooks, imperative handles, runtime behavior, accessibility/interaction semantics, supported platform behavior, and stable documentation.

Adding, broadening, or materially changing public/observable surface is an **Extension**. Removing, narrowing, deprecating, consolidating, or making existing public/observable surface less available or harder to misuse is a **Contraction**. Doing both is **Mixed**.

## Actor roles and authority boundaries

Admission separates need, architecture, execution authorization, implementation, and verification.

| Role | Owns | Cannot do |
| --- | --- | --- |
| **Requester / consumer or product owner** | Raises the request; names the consumer owner; supplies the concrete need, gap, use case, current workaround, and any available consumer-local prototype, wrapper, recipe, inventory, or other evidence. | Cannot admit the DS contract by completing a form, checking a box, opening a branch/PR, or assembling evidence. |
| **Independent DS architect / admission authority** | Independently evaluates whether the design system should own the contract and records one outcome in their own authenticated canonical issue comment or architect-owned linked ADR. May implement later after independent admission. | Cannot be replaced by an implementing agent, CI, labels, issue-form completeness, Expo demos, or requester self-attestation. Cannot use implementation status to weaken admission independence from the requester/consumer. |
| **Second human architectural reviewer** | Required when one person occupies both requester/consumer and DS architect roles. Confirms the decision is independently reviewed. | Does not remove the need for a named DS architect decision record. |
| **Project owner** | After admission, may move a bounded item to Project `Ready` when the accepted contract, execution scope, and downstream verification plan are complete. | Cannot use Ready to manufacture admission; Ready is execution authorization after the admission prerequisite is satisfied. |
| **Implementing agent / engineer** | Implements only the admitted, bounded scope and supplies deterministic verification evidence. If the admitting architect implements later, independent verification is still required. | Implementation work, proof, or green gates cannot self-admit, self-authorize Ready, or replace independent verification. |

Consumer demand cannot authorize itself. Completing an issue form, satisfying required YAML fields, checking an owner-acceptance box, opening a branch or PR, producing an Expo demo, passing gates, or having an implementing agent assemble evidence does not admit a contract. The requester or consumer/product owner cannot record their own admission. Admission independence is from the requester/consumer: a human DS architect who independently admits the contract may implement later, but independent verification remains required.

## Architect decision record

The independent DS architect records the admission decision in their own authenticated canonical issue comment or architect-owned linked ADR. Initial requester/consumer submission remains Pending/request-only and cannot select, self-attest, or type itself into `Admit`. The architect-owned record must be linked before an admitted contract can become eligible for Project `Ready`; it is not a requester-owned field.

Use this template or equivalent fields:

```md
### DS admission decision

Outcome: Admit / Reject / Request more evidence / Keep consumer-owned
Admission class: Contraction / Extension / Mixed
Architect: @github-login
Second human architectural reviewer, if requester/consumer and architect overlap: @github-login or none
Requester / consumer owner: @github-login or owner/repo team
Evidence considered: issue links, prototypes, usage inventory, non-use proof, trade study, comments, ADRs
Rationale: why this outcome is correct
Accepted contract: exact public/observable delta, removal, narrowing, deprecation, or compatibility-affecting change if admitted
Anti-scope: refused, deferred, or consumer-owned behavior
Contraction evidence considered, if applicable: affected consumers/non-use, migration, deprecation, rollback, compatibility, docs, burden removed
Bounded execution scope reference: issue section/comment/ADR link
Downstream verification plan reference: issue section/comment/ADR link
```

Allowed outcomes and transitions:

| Outcome | Meaning | Project / issue transition |
| --- | --- | --- |
| **Admit** | A specific DS contract and anti-scope are accepted by the independent DS architect. | Continue shaping until the accepted contract, bounded execution scope, and downstream verification plan are complete; then a human Project owner may move the item to `Ready`. |
| **Reject** | The proposed contract should not enter the design system. | Close the DS request as not planned or record the rejection; create consumer-owned work only if useful. No DS Ready. |
| **Request more evidence** | The architect cannot decide with the current evidence. | Keep or return the item to `Shaping` or `Decision Needed`; requester/consumer supplies the named missing evidence. No DS Ready. |
| **Keep consumer-owned** | The need is real, but ownership belongs in the consumer repo, wrapper, recipe, or product edge. | Close the DS request or create/route consumer-owned work. No DS Ready for DS contract work. |

## Evidence sequencing

The evidence order is mandatory. Do not move executed proof earlier merely to make a request look Ready.

| Phase | Primary actor | Required evidence | Boundary |
| --- | --- | --- | --- |
| **Before admission** | Requester / consumer owner | Named requester and consumer owner; concrete need/gap/use case or contraction driver; current workaround/current behavior; available consumer-local prototype, wrapper, recipe, inventory, non-use proof, or other evidence. | Evidence only. Submission does not admit or authorize execution. |
| **Admission** | Independent DS architect | Outcome (`Admit`, `Reject`, `Request more evidence`, `Keep consumer-owned`), architect, second reviewer if needed, rationale, evidence considered, accepted contract and anti-scope when admitted. | Architectural decision, not implementation. |
| **Before Project `Ready`** | Architect plus Project owner | Architect-accepted contract and anti-scope; bounded execution scope; migration/compatibility/documentation plan when relevant; downstream verification plan. | Project `Ready` is the sole execution authorization and only after admission prerequisites are met. |
| **Verification Pending → Verified** | Implementer plus independent verifier / real consumer | Executed evidence against the implemented contract: repo checks, CI, typecheck/build, fixture/demo proof, Expo or other real-consumer PRs, device/runtime checks, compatibility runs. | Proof must exercise the implementation, not a proposed API; independent verification is still required if the admitting architect implemented. |
| **Before Done** | Implementer / coordinator | Merge containment, migration/deprecation/rollback evidence, documentation and release evidence, and linked downstream proof. | Done requires merged containment and closed evidence, not only local green tests. |

Do not require a pre-implementation Expo PR, runtime proof, or compatibility run before Project `Ready`; new public API normally cannot be exercised by Expo before it exists. A downstream verification **plan** is required before Ready. Executed Expo/device/runtime/compatibility proof belongs after implementation during Verification/Done. A written compatibility claim is useful planning evidence, but it is not completion proof.

## Ownership boundary

The design system owns reusable presentation vocabulary and intrinsic cross-platform mechanics needed to honor accepted shared contracts: accessibility, interaction, focus, keyboard, overlay, token, descriptor, and runtime behavior where those mechanics are part of the contract.

Consumers own product-specific behavior, orchestration, screen layout, copy, provider-specific flows, navigation, app wrappers, one-off compositions, and local recipes until an independent DS architect admits a specific shared contract.

When in doubt, keep the behavior in the consumer repo and document the evidence. Promote only when the shared-core cost is justified, the accepted contract is clear, and the anti-scope prevents accidental generalization.

## Change classes and Ready requirements

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

Admission-request evidence is proportional:

- affected-consumer inventory or evidence of non-use;
- migration, deprecation, rollback, compatibility, release-note, and documentation implications;
- ambiguity, duplication, misuse, or maintenance burden removed.

A pure Contraction is **not** required to prove Extension-style recurrence, DS ownership, abstraction generalization, or broad alternatives/trade-study prompts. If the work also adds, broadens, or materially changes public/observable surface, classify it as Mixed.

Ready requires:

- independent DS architect `Admit` decision for the specific contraction and anti-scope;
- the proportional Contraction evidence above;
- bounded execution scope;
- downstream verification plan for affected consumers, compatibility, migration/deprecation, docs, and rollback as relevant.

Executed compatibility proof belongs during Verification/Done, after implementation.

### Extension

An Extension adds, broadens, or materially changes public/observable design-system vocabulary or behavior: a component, export, exported type, token, axis value, descriptor or descriptor API, generated contract, prop, slot, primitive, provider, hook, imperative handle, runtime behavior, accessibility/interaction semantic, documented pattern, supported platform behavior, or any other shared surface consumers may rely on.

Before admission, the consumer/product owner supplies evidence of need:

- named current consumer and concrete use case;
- the gap, current workaround, or consumer-local prototype/implementation;
- why existing DS surface, app-local composition, wrapper, recipe, or product-edge ownership is insufficient.

Admission review is owned by the independent DS architect and must evaluate:

- evidence of recurrence or a legitimate system-owned invariant, not only one app's immediate preference;
- why ownership belongs in the DS rather than the consumer;
- alternatives/trade study against product-edge, app-owned, wrapper, recipe, composition, component, primitive, and existing-axis options;
- contract cost, maintenance burden, vocabulary quality, and compatibility expectations;
- anti-scope defining what will not be generalized, admitted, or supported;
- the outcome: admit a specific contract, reject, request more evidence, or keep consumer-owned.

Ready requires:

- independent DS architect `Admit` decision for the specific accepted public/observable contract delta and anti-scope;
- bounded execution scope;
- migration/compatibility/documentation plan as relevant;
- downstream verification plan.

Actual Expo, fixture, demo, device/runtime, or compatibility proof is Verification/Done evidence after implementation.

### Mixed

A Mixed change both adds/broadens/materially changes public/observable surface and removes/narrows/deprecates/consolidates/compatibility-affects existing surface.

Ready requires **Extension admission plus Contraction evidence**:

- all Extension consumer evidence and independent DS architect admission for the new or changed surface;
- all Contraction affected-consumer/non-use, migration, compatibility, rollback, documentation, and burden-reduction evidence for the removed, narrowed, deprecated, consolidated, or compatibility-affecting surface;
- explicit migration handling for consumers moving from the old contract to the new one;
- accepted contract and anti-scope for both sides of the change;
- bounded execution scope and downstream verification plan for the whole change.

### Experiment

An Experiment explores a possible design-system idea without admitting contract. It must be bounded to DS-owned non-contract surfaces such as `@nuri/playground`, `@nuri/prototype` prototype surfaces, internal notes, or throwaway fixtures.

Ready requires:

- explicit confirmation that no public/observable contract is created;
- boundaries keeping the work out of public barrels, generated contracts, stable docs, and production consumer paths;
- a promotion rule: any move from experiment to shared contract requires a separate Extension admission request and decision.

Experiments use the lightweight DS maintenance form and do not require an admission record while they remain non-contract.

## Issue front doors

The repository has exactly two design-system governance front doors:

1. **DS maintenance** (`.github/ISSUE_TEMPLATE/ds-maintenance.yml`) for Corrections, internal maintenance, and bounded DS-owned Experiments. It is intentionally proportional and does not ask for an admission record.
2. **DS contract admission request** (`.github/ISSUE_TEMPLATE/ds-contract-admission.yml`) for Contractions, Extensions, and Mixed changes. It captures common requester evidence, class-scoped Contraction/Mixed evidence, class-scoped Extension/Mixed evidence, the proposed contract delta, the requested independent architect, proposed execution scope, downstream verification plan, and completion evidence expectations. It is a request, not an admission act.

GitHub issue forms cannot conditionally require fields based on the selected class. The contract-admission request form therefore keeps common request fields required and makes class-scoped Contraction/Mixed and Extension/Mixed evidence structurally optional. The named human DS architect enforces selected-class completeness semantically. Do not force fake `not applicable` ceremony and do not create a third front door.

Neither form applies an automatic `agent-ready`, `Ready`, or equivalent readiness label. During the manual pilot, the canonical execution authorization is the Nuri Delivery Project item moving to `Ready` after human review. Issue-form completeness, labels, assignment, branches, PRs, implementation, local claim tooling, Expo demos, and green CI are evidence only; they are not Ready.

## Real-consumer / downstream verification evidence

For public API or runtime behavior changes, the request must include a downstream verification plan before Project `Ready`; actual proof is attached during Verification/Done after implementation. Today that usually means Expo or another real consumer: an exact `nuri-com/nuri-expo` PR, fixture, typecheck/build, demo, device/runtime proof, or compatibility run that exercises the implemented public contract.

The Expo demo can verify DS compatibility and behavior, but it must not incubate app features or bypass admission. If actual real-consumer proof cannot be produced after implementation, keep the item in Verification or mark the missing proof as an explicit blocker/Decision Needed. A written compatibility claim alone is not sufficient completion proof.

## Admission workflow

1. Classify the work as Correction, internal maintenance, Contraction, Extension, Mixed, or Experiment.
2. Choose the correct front door: maintenance for no-contract-delta maintenance and bounded experiments; contract admission request for public/observable contract changes.
3. For Extension/Mixed, have the requester/consumer owner supply the concrete need, gap, use case, current workaround, and any available consumer-local prototype/evidence. For Contraction/Mixed, supply affected-consumer or non-use evidence, migration/deprecation/rollback implications, and the burden removed.
4. Have the independent named human DS architect record the architectural decision: admit a specific contract, reject, request more evidence, or keep consumer-owned. If requester/consumer and architect are the same person, require a second named human architectural reviewer in the decision record.
5. Keep pending, rejected, more-evidence, and consumer-owned outcomes out of Project `Ready`; track unresolved human judgment as `Decision Needed`, not as implementation work.
6. Only after a specific contract is admitted, anti-scope is clear, execution scope is bounded, and downstream verification is planned may a human Project owner move the Project item to `Ready`.
7. During Verification/Done, attach actual checks and real-consumer/runtime/compatibility evidence against the implemented contract.
8. Before Done, attach merge containment, migration/deprecation/rollback, release, and documentation evidence.

The Ready decision is human-owned during the manual pilot. Existing DS gates prove only behavior and drift they inspect; they do not prove architectural fitness, abstraction quality, API parsimony, honest classification, ownership, recurrence, or admission.
