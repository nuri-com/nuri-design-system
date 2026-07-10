/* ══════════════════════════════════════════════════════════════════
 * NURI · COMPOSITION CLASSIFIER · SHARED EXECUTABLE CONTRACT
 * ─────────────────────────────────────────────────────────────────
 * Classifies authored composition entries against one anatomy host. This module
 * is deliberately dependency-free and engine-agnostic: RN and web inject the
 * host predicate, repetition policy, input anatomy, and error envelope, then
 * render the returned plan in their own engines.
 * ══════════════════════════════════════════════════════════════════ */

function findChildPath(node, part) {
  for (const child of node.children) {
    if (child.name === part) return [child];
    const nested = findChildPath(child, part);
    if (nested) return [child, ...nested];
  }
  return undefined;
}

function subtreeHasPart(node, part) {
  return node.name === part || node.children.some((child) => subtreeHasPart(child, part));
}

/**
 * Build the engine-neutral ordered rendering plan for one composition host.
 *
 * @param {{ name: string, children: Array<object> }} node
 * @param {Array<{ part: string, content?: unknown, props?: object }>} entries
 * @param {{
 *   ambientContent: Record<string, unknown>,
 *   isHostEl: (el: unknown) => boolean,
 *   isMultiPart: (part: string) => boolean,
 *   inputTarget?: string,
 *   labelPart?: string,
 *   errorPrefix: string,
 * }} options
 */
export function classifyComposition(node, entries, options) {
  const {
    isHostEl,
    isMultiPart,
    inputTarget,
    labelPart,
    errorPrefix,
  } = options;
  const ambientContent = { ...options.ambientContent };
  if (labelPart && ambientContent[labelPart] === undefined) {
    const labelEntry = entries.find((entry) => entry.part === labelPart);
    if (labelEntry) ambientContent[labelPart] = labelEntry.content;
  }

  const grouped = new Map();
  const targets = new Map();
  const ordered = [];
  const childIndex = new Map(node.children.map((child, index) => [child.name, index]));

  for (const [index, entry] of entries.entries()) {
    if (entry.part === node.name) {
      ordered.push({ kind: 'own', entry, index });
      continue;
    }
    const path = findChildPath(node, entry.part);
    if (!path) {
      throw new Error(`${errorPrefix} composition entry targets '${entry.part}', which is not under '${node.name}'`);
    }
    const child = path[0];
    if (path.length > 1 && isHostEl(child.el)) {
      let group = grouped.get(child.name);
      if (!group) {
        group = { child, entries: [] };
        grouped.set(child.name, group);
        ordered.push({ kind: 'group', part: child.name });
        targets.set(child.name, (targets.get(child.name) ?? 0) + 1);
      }
      group.entries.push(entry);
      continue;
    }
    ordered.push({ kind: 'direct', child, entry, index });
    targets.set(entry.part, (targets.get(entry.part) ?? 0) + 1);
  }

  for (const child of node.children) {
    if (targets.has(child.name)) continue;
    if (!inputTarget || !subtreeHasPart(child, inputTarget)) continue;
    const staticItem = { kind: 'static', child };
    const staticIndex = childIndex.get(child.name) ?? 0;
    const before = ordered.findIndex((item) => {
      const part = item.kind === 'group' ? item.part : item.kind === 'direct' ? item.child.name : undefined;
      return part !== undefined && (childIndex.get(part) ?? 0) > staticIndex;
    });
    if (before === -1) ordered.push(staticItem);
    else ordered.splice(before, 0, staticItem);
  }

  for (const [part, count] of targets) {
    if (count > 1 && !isMultiPart(part)) {
      throw new Error(`${errorPrefix} slot targeting part '${part}' is singular — it appears ${count} times under '${node.name}'`);
    }
  }

  return { ordered, grouped, ambientContent };
}
