// Guardrails for user-visible copy: no protocol jargon, at most one helper
// text per screen. Pure functions; app.test.js runs them against the sources.
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tools, common } from './content.js';

const HERE = dirname(fileURLToPath(import.meta.url));

// Words a user must never see (match underscore/camel/space variants).
export const BANNED = [/session/i, /connect[ _]?wallet/i, /request[ _]?id/i, /idempotency/i, /schema/i];

// Curated copy (content.js) is user-visible by definition.
function curatedStrings() {
  const out = [];
  (function walk(v) {
    if (typeof v === 'string') return out.push(v);
    if (v && typeof v === 'object') for (const x of Object.values(v)) walk(x);
  })({ tools, common });
  return out;
}

// Rendered literals in the app/screens sources: quoted strings that read like
// prose (contain a space and a letter). Technical tokens (icon names, routes,
// class names, tool names) are single words and never match.
function renderedLiterals(file) {
  const src = readFileSync(join(HERE, file), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  return [...src.matchAll(/'((?:[^'\\]|\\.)*)'/g)]
    .map((m) => m[1])
    .filter((s) => /[a-zA-Z]/.test(s) && s.includes(' '));
}

export function userVisibleCopy() {
  return [
    ...curatedStrings(),
    ...renderedLiterals('app.js'),
    ...renderedLiterals('screens.js'),
  ];
}

export function jargonViolations() {
  return userVisibleCopy().filter((s) => BANNED.some((re) => re.test(s)));
}

// Helper text = `help` copy attached to a field. Count per screen = per app
// screen function in app.js and per flow step in flows.js content.
export function helpersPerScreen() {
  const appSrc = readFileSync(join(HERE, 'app.js'), 'utf8');
  const screens = {};
  for (const m of appSrc.matchAll(/function (\w+Screen)\(\) \{[\s\S]*?(?=\nfunction |\nconst App|$)/g)) {
    screens[m[1]] = (m[0].match(/\bhelp\s*:/g) || []).length;
  }
  for (const [tool, def] of Object.entries(tools)) {
    for (const [fieldKey, f] of Object.entries(def.fields || {})) {
      screens[`${tool}.${fieldKey}`] = f.help ? 1 : 0;
    }
  }
  return screens;
}
