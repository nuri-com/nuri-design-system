/* ══════════════════════════════════════════════════════════════════
 * NURI · the consumable EXAMPLE (R1.5)
 * ──────────────────────────────────────────────────────────────────
 * The tangible "how the RN team consumes the spec": a small screen built
 * ONLY on the factory components — the ergonomic, 1:1-with-web Button /
 * IconAvatar / Topbar, derived generically from the frozen descriptors. No
 * hand-written components; the call sites mirror the web elements.
 *
 * Shows: the typed named-prop API (variant/size/accent/disabled), `children`
 * routed to each component's primary content part, the glyph-by-scope (§12)
 * via the TYPED `icon="name"` prop (the DS owns RN glyph rendering now — no
 * consumer glyph wrapper), light↔dark (the toggle), and a
 * <NuriScope accent="neutral"> subtree (the accent override · decision 63).
 * ══════════════════════════════════════════════════════════════════ */

import * as React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  Button,
  IconAvatar,
  Topbar,
  TopbarLeading,
  TopbarCenter,
  TopbarTrailing,
  NuriScope,
  NuriIcon,
  typeStyle,
  useNuriTheme,
} from '@nuri/rn';

const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { text } = useNuriTheme();
  const muted = text.muted;
  return <Text style={[typeStyle('sm', true), { color: muted }, styles.label]}>{children}</Text>;
};

export const Demo: React.FC<{ onToggleTheme: () => void }> = ({ onToggleTheme }) => {
  const { chrome } = useNuriTheme();
  const canvas = chrome.canvas.bg;

  return (
    <View style={[styles.root, { backgroundColor: canvas }]}>
      {/* The compound slot Topbar — leading + centre + trailing regions composed
          via the typed sub-components (the centre lands at the bar's TRUE centre
          with asymmetric edges · the in-bar title is out of scope this slice). */}
      <Topbar>
        <TopbarLeading>
          <IconAvatar variant="ghost" icon="card" />
        </TopbarLeading>
        <TopbarCenter>
          {/* The centre region is an OPEN host slot (a `view`, not an icon part),
              so it takes a standalone NuriIcon — the RN twin of `<nuri-icon name>`. */}
          <NuriIcon name="bitcoin" />
        </TopbarCenter>
        <TopbarTrailing>
          <Button variant="soft" size="sm" onPress={onToggleTheme}>Theme</Button>
        </TopbarTrailing>
      </Topbar>

      <ScrollView contentContainerStyle={styles.body}>
        <SectionLabel>Button — variant × size (the richest descriptor)</SectionLabel>
        <View style={styles.row}>
          <Button variant="solid" size="md" onPress={onToggleTheme}>Buy</Button>
          <Button variant="soft" size="md" onPress={onToggleTheme}>Soft</Button>
          <Button variant="ghost" size="md" onPress={onToggleTheme}>Ghost</Button>
        </View>
        <View style={styles.row}>
          <Button variant="solid" size="sm" onPress={onToggleTheme}>small</Button>
          <Button variant="solid" size="lg" onPress={onToggleTheme}>large</Button>
          <Button variant="solid" size="md" disabled onPress={onToggleTheme}>disabled</Button>
        </View>

        <SectionLabel>IconAvatar — the SAME factory, static · glyph by scope</SectionLabel>
        <View style={styles.row}>
          <IconAvatar variant="solid" icon="apple" />
          <IconAvatar variant="soft" icon="card" />
          <IconAvatar variant="ghost" icon="euro" />
          <IconAvatar variant="subtle" icon="bitcoin" />
        </View>

        <SectionLabel>NuriScope — accent override (decision 63)</SectionLabel>
        <NuriScope accent="neutral">
          <View style={styles.row}>
            <Button variant="solid" size="md" onPress={onToggleTheme}>neutral</Button>
            <Button variant="soft" size="md" onPress={onToggleTheme}>scope</Button>
            <IconAvatar variant="solid" icon="bitcoin" />
          </View>
        </NuriScope>

        <SectionLabel>Theme</SectionLabel>
        <View style={styles.row}>
          <Button variant="soft" size="sm" onPress={onToggleTheme}>Toggle light / dark</Button>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  body: { padding: 18, gap: 8 },
  row: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 4 },
  label: { marginTop: 14 },
});
