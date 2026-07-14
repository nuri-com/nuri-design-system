# Spinner lab notes

Production parity record. The browser lab CSS was the reconciliation authority; the shipped
realizations live in `packages/prototype/primitives/spinner.css` and
`packages/rn/primitives/spinner/`.

- Candidate 2 · staggered ring — Knobs: duration, stagger, arc inset, and ease; all four arcs use the fixed 1.5px stroke at every size. Rotation keeps its original direction, with opacity now increasing across the four phase offsets so the leading arc is darkest and the trailing arcs fade behind it. The `cubic-bezier(0.4, 0.08, 0.2, 0.84)` curve keeps a matched non-zero velocity at both loop endpoints, shortening the apparent pause without losing the slow phase. RN drives a linear native clock through independently phase-shifted samples of that same curve, matching CSS negative animation delays: when the leading arc decelerates, the tail continues moving instead of stopping as a rigid group. The layered trail separates cleanly at 48 and visually compresses at 18.
