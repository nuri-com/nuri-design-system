# Keyboard press feedback — proposal only

Version context: 0.0.1 (unchanged); 2026-09-20 — Emin / Hermes.
Status: pending independent admission; not stable guidance or implemented DS behavior.
Tracks nuri-com/nuri-design-system#221; consumer: nuri-com/nuri-expo#1412.

## Admission boundary

The [admission policy](../design-system-admission.md) includes stable documentation
and documented interaction patterns in public/observable surface. Promoting this
proposal to stable guidance is an **Extension**, despite requiring no new visual API.
An independent named human architect must accept the exact guidance and anti-scope,
then a human Project owner must authorize Ready. @taner-caliskan is requested, not
assumed appointed or approving. This internal note does not self-admit the pattern.
Keeping the optional vibration recipe entirely consumer-owned remains a valid outcome.

## Existing source, not a new API

Inspected main: `022845e6c25107b0f4632e2bee256fe06e79f995`.

- [Pressable](../../packages/rn/primitives/Pressable.tsx) exposes the interactive
  namespace and passes pressed/disabled state into the shared resolver.
- [Interactive resolution](../../packages/rn/runtime/resolve.ts) suppresses pressed
  effects while disabled.
- [Interaction baseline](../../packages/spec/axes/interaction.ts) defines
  `pressScale: 0.97`.
- [Public generated reference](../../packages/doc/generated/components/pressable.md)
  already lists `pressColor` and `pressScale` as optional booleans. Do not edit it here.

Use existing `pressColor` + `pressScale` opt-ins for key presentation. Do not add a
custom scale token, visual override or speculative haptic prop. Preserve existing
palette resolution. Production RN and the web prototype have different roles;
this consumer's web recipe does not establish native vibration support or parity.

## Proposed consumer guidance

1. Give **every enabled on-screen web keyboard key** immediate visible feedback on
   press-in: letters, digits, mode switches, delete, space and submit where present.
   Use the existing DS pressed colour and scale (`0.97`), not delayed action results.
2. Let the existing press lifecycle restore the resting state on release or cancel.
   Verify pointer/touch cancellation and keyboard activation; do not invent unsupported
   `onPressIn`/`onPressOut` props on the public DS wrapper or leave a sticky pressed state.
3. Disabled keys have no pressed effects, vibration or action. Preserve disabled
   accessibility state and existing focus/keyboard semantics.
4. Optional vibration belongs to the consumer activation handler, not press-in,
   rendering, hover, focus, cancellation, or an asynchronous transaction result.
   After checking the key is enabled, make at most one best-effort
   `navigator.vibrate(10)` call per actual activation. Feature-detect both navigator
   and the method inside `try/catch`; absence, a false return or an exception must
   never block the key's action. Do not gate the action on the return value.
5. Browser/OS support, user activation rules, settings and hardware can block or
   ignore vibration. Do not request unrelated permissions, use permission tricks,
   retry until it works, or promise tactile feedback. Even `true` is **not physical
   vibration proof**. Report hardware observation separately from API-call evidence.
6. This is a **tap acknowledgement**, not a success haptic. A submit tap may be
   acknowledged before its outcome is known; a failed transaction must never trigger
   a success haptic. Transaction orchestration and outcome feedback remain app-owned.

## Evidence, alternatives and scope

Emin approved the direction for nuri-com/nuri-expo#1412. One concrete consumer is
known; broader recurrence and hardware proof are not claimed. Existing axes already
solve the visual requirement. Options for the architect: keep the whole recipe at
the product edge, or admit this narrow documentation pattern. Shared haptic runtime,
new exports/props, new platform guarantees and native integration are out of scope.
No runtime, generated API, app implementation, merge, release or deployment is part
of this draft. Typography proposals nuri-com/nuri-design-system#218 and
nuri-com/nuri-design-system#220 remain separate and unchanged.

## Verification plan before stable publication

- Source-linked docs checks, documentation build/tests, unchanged generated output.
- Consumer pointer/touch/keyboard tests for all enabled keys: immediate pressed state,
  release/cancel reset and exactly one activation; disabled keys remain inert.
- Consumer cases: navigator absent; vibrate absent; false return; exception; true
  without observed hardware response. Key actions still work exactly once.
- Supported-device observation, labelled with browser/OS/hardware; unsupported paths
  remain usable. Do not equate a test mock or true return with tactile proof.
- Failed-submit outcome does not emit success feedback. Existing focus, accessible
  names and native semantics remain intact; runtime/device evidence belongs to the
  consumer and later admitted work, not this docs-only draft.
