/* ──────────────────────────────────────────────────────────────
 * NURI · @nuri/doc · TS DATA LOADER
 *
 * @nuri/doc consumes pure data from @nuri/spec and generated TS data from the
 * RN/prototype projections. All TS data imports cross the shared root
 * TypeScript transform; doc keeps these small wrappers as its local boundary.
 * ────────────────────────────────────────────────────────────── */

import { fileURLToPath } from 'node:url';

import { loadTsDataFromPath } from '../../../scripts/ts-data-loader.js';

// Resolve a @nuri/spec data subpath through its exports map (import.meta.resolve
// honours `exports`) and import it through the shared TS data transform.
export async function loadSpecData(subpath) {
  const url = import.meta.resolve(`@nuri/spec/${subpath}`);
  return loadTsDataFromPath(fileURLToPath(url));
}

// Load a data module by ABSOLUTE PATH through the same TS transform — for the
// generated artifacts that left @nuri/spec for the two PROJECTIONS at N+62 (the infra
// exit · decision 80): the RN contract (tokens · palette → @nuri/rn/generated/) and the
// web token-var registry (token-vars → @nuri/prototype/generated/). @nuri/spec is pure
// data now, so doc reads those resolved artifacts from the projection that owns them.
export async function loadDataFromPath(absPath) {
  return loadTsDataFromPath(absPath);
}
