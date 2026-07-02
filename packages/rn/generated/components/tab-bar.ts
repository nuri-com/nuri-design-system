/* ──────────────────────────────────────────────────────────────
 * NURI · COMPONENT · TAB-BAR · GENERATED RN API ADAPTER · DO NOT EDIT BY HAND
 *
 * The exact public export for `tab-bar` (Path C component-API). `{Name}Props`
 * is emitted from the descriptor's `api` (packages/spec/components/tab-bar.ts);
 * the component adapter normalizes public props into selection, content,
 * behaviour, and accent scope before calling the shared descriptor renderer.
 *
 * Source · the authored descriptor `api`+`variants`. Emitter · scripts/parsers/
 * components-api.js — run `npm run build`. Committed (decision 35) · the re-emit
 * `git diff --exit-code` gate covers it. NEVER hand-edit — edit the descriptor's `api`.
 * ────────────────────────────────────────────────────────────── */

import * as React from 'react';
import { nuriNames, renderDescriptorInstance } from '../../runtime/renderer';
import type { NuriBehaviour } from '../../runtime/renderer';
import { tabBarDescriptor } from '@nuri/spec/descriptors/tab-bar';
import { recipes } from '../data/recipes';
import { NuriScope } from '../../theme';
import type { Accent } from '../data/tokens';

export type TabBarProps = {
  accent?: Accent;
  children?: React.ReactNode;
};

type TabBarPart = 'root';

const tabBarDisplayName = nuriNames('tab-bar').rn;

const TabBarInner: React.FC<TabBarProps> = (props) => {
  const selection: Record<string, string> = {
  };
  const content: Partial<Record<TabBarPart, React.ReactNode>> = {};
  if (props.children !== undefined) content["root"] = props.children;
  const behaviour: NuriBehaviour<TabBarPart> = {};

  return renderDescriptorInstance({
    descriptor: tabBarDescriptor,
    recipe: recipes["tab-bar"],
    displayName: tabBarDisplayName,
    selection,
    content,
    behaviour,
  });
};
TabBarInner.displayName = `${tabBarDisplayName}Inner`;

export const TabBar: React.FC<TabBarProps> = (props) =>
  props.accent !== undefined
    ? React.createElement(NuriScope, { accent: props.accent, children: React.createElement(TabBarInner, props) })
    : React.createElement(TabBarInner, props);
TabBar.displayName = tabBarDisplayName;
