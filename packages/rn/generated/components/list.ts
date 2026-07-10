/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT · LIST · GENERATED RN API ADAPTER · DO NOT EDIT BY HAND
 *
 * The exact public export for `list` (Path C component-API). `{Name}Props`
 * is emitted from the descriptor's `api` (packages/spec/components/list.ts);
 * the component adapter normalizes public props into selection, content,
 * behaviour, and optional accent scope before calling the shared descriptor renderer.
 *
 * Source · the authored descriptor `api`+`variants`. Emitter · scripts/parsers/
 * components-api.js — run `npm run build`. Committed (decision 35) · the re-emit
 * `git diff --exit-code` gate covers it. NEVER hand-edit — edit the descriptor's `api`.
 * ────────────────────────────────────────────────────────────── */

import * as React from 'react';
import { nuriNames, renderDescriptorInstance } from '../../runtime/renderer';
import type { NuriBehaviour } from '../../runtime/renderer';
import { listDescriptor } from '@nuri/spec/descriptors/list';
import { recipes } from '../data/recipes';
import { scopedByAccent } from '../../primitives/shared';
import type { Accent } from '../data/tokens';

export type ListProps = {
  accent?: Accent;
  children?: React.ReactNode;
};

type ListPart = 'root';

const listDisplayName = nuriNames('list').rn;

const ListInner: React.FC<ListProps> = (props) => {
  const selection: Record<string, string> = {
  };
  const content: Partial<Record<ListPart, React.ReactNode>> = {};
  if (props.children !== undefined) content["root"] = props.children;
  const behaviour: NuriBehaviour<ListPart> = {};

  return renderDescriptorInstance({
    descriptor: listDescriptor,
    recipe: recipes["list"],
    displayName: listDisplayName,
    selection,
    content,
    behaviour,
  });
};
ListInner.displayName = `${listDisplayName}Inner`;

export const List = scopedByAccent(ListInner);
List.displayName = listDisplayName;
