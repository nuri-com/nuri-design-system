# Design-system admission

Nuri's design system has two speeds:

- **Fast product edge:** product screens, app wrappers, one-off compositions, and local experiments can move quickly in the consumer that owns the product problem.
- **Slow shared core:** tokens, axes, primitives, generated component contracts, runtime behavior, and public documentation move deliberately because every admitted concept becomes shared vocabulary.

The design-system core should stay **small, stable, and composable**. Growth is a cost: every new public option, token, primitive, descriptor, visual behavior, or migration path increases naming burden, testing surface, documentation, compatibility, and consumer expectations. A consumer need is strong evidence, but it is not authorization by itself.

Implementation does not confer admission. A branch, PR, green CI, or a working app patch proves only that code exists and the checked behavior still passes. Gates do not prove architecture, ownership, recurrence, vocabulary quality, or whether the work belongs in the shared core.

## Ownership boundary

The design system owns reusable vocabulary and contracts that satisfy a recurring product need or a system invariant across consumers. Consumers own product-specific behavior, orchestration, screen layout, copy, provider-specific flows, and local recipes until a human design-system owner admits a shared contract.

When in doubt, keep the behavior at the product edge and document the evidence. Promote only when the shared-core cost is justified and the accepted contract is clear.

## Change classes

### Correction

A Correction restores an already-admitted contract or fixes an implementation, documentation, type, generated-output, or runtime mismatch with **no intended public or observable delta**.

Ready requires:

- the broken invariant or regression is named;
- the issue explicitly confirms no intended public/observable delta;
- verification proves the admitted contract is restored.

### Contraction

A Contraction removes, narrows, deprecates, or makes less available an already-admitted public/observable contract.

Ready requires:

- named owner acceptance for the contraction;
- compatibility and migration evidence;
- documentation of affected consumers and rollback/deprecation handling.

### Extension

An Extension adds or broadens public/observable design-system vocabulary: a token, axis value, primitive, descriptor API, generated contract, runtime behavior, documented pattern, or any other shared surface consumers may rely on.

Ready requires:

- named human design-system admission;
- a named current consumer/use case;
- evidence of recurrence or a system invariant, not only a one-off app demand;
- a trade study against product-edge, app-owned, wrapper, or recipe alternatives;
- anti-scope defining what will not be generalized;
- the accepted public/observable contract;
- compatibility, migration, and documentation expectations.

### Experiment

An Experiment explores a possible design-system idea without admitting contract. It must stay on non-contract surfaces such as local playgrounds, prototypes, internal notes, or throwaway fixtures.

Ready requires:

- explicit confirmation that no public/observable contract is created;
- boundaries preventing production consumers from depending on the experiment;
- a promotion rule: any move from experiment to shared contract requires a separate Extension admission.

## Admission workflow

1. Classify the work as Correction, Contraction, Extension, or Experiment.
2. Name the current consumer/use case and the workaround or gap.
3. State public/observable contract impact and the design-system-vs-consumer ownership boundary.
4. Record compatibility/migration expectations and anti-scope.
5. Link the admission decision owner and canonical decision/admission record.
6. Only after the class-specific Ready rule is satisfied may execution proceed as a bounded implementation task.

The Ready decision is human-owned during the manual pilot. Issue-form completeness and CI are evidence for that decision; they are not the decision.

## Contraction workflow

Contractions are riskier than ordinary cleanup because consumers may already rely on the shared contract. Treat removals, renames, narrowed values, changed defaults, and less visible behavior as contractions unless proven internal-only.

A contraction should define the owner who accepts the reduction, the consumer impact, compatibility or migration path, deprecation/rollback handling, and documentation updates. If migration is impossible or intentionally not provided, that decision must be explicit and owner-accepted.

## Experiment workflow

Experiments are useful only while they remain non-contract. Keep them out of public barrels, generated contract surfaces, stable docs, and production consumer paths. Label or place them so consumers cannot mistake them for admitted vocabulary.

If an experiment proves useful, open a new Extension admission with the evidence learned. Do not promote by editing the experiment PR until the Extension admission exists and names the accepted contract.
