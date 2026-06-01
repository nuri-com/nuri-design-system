---
name: add-principle
description: Use this skill when adding or deprecating a principle on `pages/principles.html`. Per decision 22, principles change rarely; IDs are stable forever.
---

# Skill · Add or change a principle

Principles live in [`pages/principles.html`](../pages/principles.html).
Per [decision 22](../decisionlog.md#22-principles-split--n3), they
change rarely.

**To add**:
1. Pick the next free ID (`P{N+1}`). IDs are stable forever — never
   reuse.
2. Add `<section class="page-section" id="p{n}-..." data-principle-id="P{N+1}">`
   with the same structure as existing principles: h2 with ID-prefixed
   title + brief paragraph + `<dl class="nuri-spec-card">` with
   extractable `data-*` attrs.
3. If the principle is grounded in a session decision, cross-link
   the decision number in [`decisionlog.md`](../decisionlog.md) and
   vice-versa.
4. Update the "Hard rules" citation table in [`AGENTS.md`](../AGENTS.md)
   if the new principle introduces an enforced rule.

**To deprecate**: don't delete. Set `data-principle-status="deprecated"`
on the section + spec card, and add a row explaining the reason.
Keeps the citation chain in AGENTS.md valid.

## Anti-goals (parsimony · P11)

- Don't add a principle that documents tokens, components, or
  patterns not yet shipped. Premature codification (the N+5.7
  cleanup of the shadow atomic-pattern at `pages/principles.html`
  is the worked example) is the exact drift class P11 closes.
- The principle and its referenced surface ship together. Meta:
  P11 itself shipped alongside its enforcement cascade in N+5.7.1
  — no asymmetric "principle before mechanism", and no "mechanism
  before principle".
- A principle promotion needs evidence: at least an n=2 incident
  trail of the drift class it closes, surfaced in a roadmap
  retrospective. N+5.7.1's n=5 trigger is the precedent.
- See [P11](../pages/principles.html#p11-parsimony) ·
  [decision 30](../decisionlog.md#30-primitive-parsimony--no-speculative-additions--n571).
