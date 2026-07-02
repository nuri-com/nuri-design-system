// ════════════════════════════════════════════════════════════════
// Text — typography (+ palette colour) · RN <Text>
// ────────────────────────────────────────────────────────────────
// Mirrors the factory's `text` render (runtime/renderer.tsx §case 'text'): the
// type ref expands via typeStyle(size, emphasis); the colour is own-palette fg
// or the inherited surface fg (§12); any palette bg lands via node.view.
// ════════════════════════════════════════════════════════════════
import * as React from 'react';
import { Text as RNText } from 'react-native';
import type { TextStyle } from 'react-native';
import type { TypographyNS, PaletteNS } from '../contract';
import { typeStyle } from '../theme';
import { PALETTE_KEYS, TYPOGRAPHY_KEYS } from '@nuri/spec/descriptors/schema';
import { useResolvedNode, withKeys, scopedByAccent } from './shared';

export type TextProps = TypographyNS & PaletteNS & { children?: React.ReactNode };

const TextImpl: React.FC<TextProps> = (props) => {
  const { children, ...nsProps } = props;
  const { node, fg } = useResolvedNode(nsProps);
  return (
    <RNText
      style={[
        node.type ? typeStyle(node.type.size, node.type.emphasis) : null,
        fg ? { color: fg } : null,
        node.view as TextStyle,
      ]}
    >
      {children}
    </RNText>
  );
};
TextImpl.displayName = 'Text';
export const Text = withKeys(scopedByAccent(TextImpl), [...TYPOGRAPHY_KEYS, ...PALETTE_KEYS]);
