export type CompositionNode = {
  name: string;
  el?: unknown;
  children: CompositionNode[];
  [key: string]: unknown;
};

export type CompositionEntry = {
  part: string;
  content?: unknown;
  props?: Record<string, unknown>;
};

export type CompositionPlanItem<Node extends CompositionNode, Entry extends CompositionEntry> =
  | { kind: 'own'; entry: Entry; index: number }
  | { kind: 'direct'; child: Node; entry: Entry; index: number }
  | { kind: 'group'; part: string }
  | { kind: 'static'; child: Node };

export type CompositionGroup<Node extends CompositionNode, Entry extends CompositionEntry> = {
  child: Node;
  entries: Entry[];
};

export function classifyComposition<
  Node extends CompositionNode,
  Entry extends CompositionEntry,
  Content extends Record<string, unknown>,
>(
  node: Node,
  entries: Entry[],
  options: {
    ambientContent: Content;
    isHostEl: (el: unknown) => boolean;
    isMultiPart: (part: string) => boolean;
    inputTarget?: string;
    labelPart?: string;
    errorPrefix: string;
  },
): {
  ordered: CompositionPlanItem<Node, Entry>[];
  grouped: Map<string, CompositionGroup<Node, Entry>>;
  ambientContent: Content;
};
