/* ──────────────────────────────────────────────────────────────
 * LOCAL TYPE SHIM · react-native-svg · SvgXml only
 *
 * This is a spec repo with NO RN runtime — react-native-svg is NOT a
 * dependency (operator-decided · decision 48). The migration test
 * proves the RN Icon's *prop contract* typechecks against the shared
 * registry; it never renders. This shim declares the minimal surface
 * the Icon consumes — `SvgXml` with the props it passes — so `tsc`
 * resolves the import without pulling in the real package.
 *
 * When a real RN build lands, delete this shim and add
 * `react-native-svg` as a dependency; the Icon source below is
 * written against this exact prop surface, so the swap is mechanical.
 * ────────────────────────────────────────────────────────────── */
declare module 'react-native-svg' {
  import * as React from 'react';

  export interface SvgXmlProps {
    xml: string;
    width?: number;
    height?: number;
    color?: string;
  }

  export const SvgXml: React.FC<SvgXmlProps>;
}
