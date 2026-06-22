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
 * via a consumer glyph (DemoIcon), light↔dark (the toggle), and a
 * <NuriScope accent="neutral"> subtree (the accent override · decision 63).
 * ══════════════════════════════════════════════════════════════════ */

import * as React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  Button,
  IconAvatar,
  Topbar,
  NuriScope,
  NuriSurfaceContext,
  typeStyle,
  useToken,
} from '@nuri/rn';
import { DemoIcon } from './DemoIcon';

// A propless title — inherits the Topbar surface foreground by SCOPE (§12).
const TopbarTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { foreground } = React.useContext(NuriSurfaceContext);
  return <Text style={[typeStyle('lgEm'), { color: foreground }]}>{children}</Text>;
};

const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const muted = useToken('chrome.textMuted') as string;
  return <Text style={[typeStyle('smEm'), { color: muted }, styles.label]}>{children}</Text>;
};

export const Demo: React.FC<{ onToggleTheme: () => void }> = ({ onToggleTheme }) => {
  const canvas = useToken('chrome.bgCanvas') as string;

  return (
    <View style={[styles.root, { backgroundColor: canvas }]}>
      <Topbar center="true">
        <TopbarTitle>Nuri · factory demo</TopbarTitle>
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
          <IconAvatar variant="solid"><DemoIcon name="vault" /></IconAvatar>
          <IconAvatar variant="soft"><DemoIcon name="coin-vertical" /></IconAvatar>
          <IconAvatar variant="ghost"><DemoIcon name="gear" /></IconAvatar>
          <IconAvatar variant="subtle"><DemoIcon name="question" /></IconAvatar>
        </View>

        <SectionLabel>NuriScope — accent override (decision 63)</SectionLabel>
        <NuriScope accent="neutral">
          <View style={styles.row}>
            <Button variant="solid" size="md" onPress={onToggleTheme}>neutral</Button>
            <Button variant="soft" size="md" onPress={onToggleTheme}>scope</Button>
            <IconAvatar variant="solid"><DemoIcon name="arrows-down-up" /></IconAvatar>
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
