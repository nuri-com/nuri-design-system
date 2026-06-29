/* ──────────────────────────────────────────────────────────────
 * NURI · DEMO · AVAILABLE (the standalone playground's NuriState seed)
 *
 * window.NuriState.AVAILABLE — the option lists the <nuri-demo> toolbar
 * reads (demo.js · the theme / accent pickers). This is the PLAYGROUND
 * slice of state: theme + accent ONLY (no neutral · no font), and the
 * accent list is SPEC-DERIVED from the generated registry
 * (prototype/generated/accents.js ← the ACCENTS list in parsers/semantic.js),
 * so the toggle set tracks the spec with no hand-listing here.
 *
 * It is NOT the doc site's NuriState: the doc keeps its own stateful seed
 * (doc/harness/state.js · neutral + localStorage persistence). This module
 * is deliberately PERSISTENCE-FREE — the playground is a build-free,
 * storage-free bench (decision 57). Loading it (a module) keeps the DAG
 * playground → prototype → spec: zero import from @nuri/doc.
 *
 * Load as a module BEFORE demo.js (which reads NuriState.AVAILABLE at the
 * <nuri-demo> connectedCallback); deferred module + classic-defer scripts
 * execute in document order, so an earlier <script type="module"> wins.
 * ────────────────────────────────────────────────────────────── */

import { ACCENTS } from '../generated/accents.js';

window.NuriState = window.NuriState || {};
window.NuriState.AVAILABLE = {
  theme: ['light', 'dark'],
  accent: ACCENTS,
};
