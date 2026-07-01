/* ══════════════════════════════════════════════════════════════════
 * NURI · WEB → RN TAG TRANSLATOR
 * ──────────────────────────────────────────────────────────────────
 * Deterministic screen-surface transform for Nuri's mechanically paired names:
 *   nuri-<component>        → <Component>
 *   nuri-<component>-<slot> → <ComponentSlot>
 * Attributes use the existing simple kebab→camel prop casing. Children recurse
 * in source order. This intentionally scopes to the current DS component tags,
 * not arbitrary HTML.
 * ══════════════════════════════════════════════════════════════════ */

import { readFile } from 'node:fs/promises';

const COMPONENTS = ['tab-bar-item', 'icon-button', 'icon-avatar', 'tab-bar', 'topbar', 'button'];

const pascalCase = (kebab) => kebab.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
const camelCase = (kebab) => kebab.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());

export function nuriTagToRnName(tagName) {
  if (!tagName.startsWith('nuri-')) throw new Error(`[web-to-rn] '${tagName}' is not a Nuri tag`);
  const local = tagName.slice('nuri-'.length);
  for (const component of COMPONENTS) {
    if (local === component) return pascalCase(component);
    const prefix = `${component}-`;
    if (local.startsWith(prefix)) return `${pascalCase(component)}${pascalCase(local.slice(prefix.length))}`;
  }
  throw new Error(`[web-to-rn] unsupported Nuri component tag '${tagName}'`);
}

function parseAttrs(rawAttrs) {
  const attrs = [];
  const attrRe = /([A-Za-z_:][A-Za-z0-9_:.-]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  for (const match of rawAttrs.matchAll(attrRe)) {
    const [, rawName, doubleValue, singleValue, bareValue] = match;
    const name = camelCase(rawName);
    const value = doubleValue ?? singleValue ?? bareValue;
    attrs.push(value === undefined ? name : `${name}=${JSON.stringify(value)}`);
  }
  return attrs.length ? ` ${attrs.join(' ')}` : '';
}

export function translateWebToRn(source) {
  return source.replace(/<\/?nuri-[a-z0-9-]+(?:\s+[^<>]*?)?\s*\/?>/g, (token) => {
    const close = token.startsWith('</');
    const selfClosing = /\/>$/.test(token);
    const tagMatch = token.match(/^<\/?\s*(nuri-[a-z0-9-]+)([\s\S]*?)(?:\/?)>$/);
    if (!tagMatch) return token;
    const [, tagName, rawAttrs] = tagMatch;
    const rnName = nuriTagToRnName(tagName);
    if (close) return `</${rnName}>`;
    return `<${rnName}${parseAttrs(rawAttrs)}${selfClosing ? ' />' : '>'}`;
  });
}

if (process.argv[1] && import.meta.url === new URL(process.argv[1], 'file:').href) {
  const input = process.argv[2] ? await readFile(process.argv[2], 'utf8') : await new Promise((resolve, reject) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => { data += chunk; });
    process.stdin.on('end', () => resolve(data));
    process.stdin.on('error', reject);
  });
  process.stdout.write(translateWebToRn(input));
}
