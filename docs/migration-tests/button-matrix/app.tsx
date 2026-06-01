/* ══════════════════════════════════════════════════════════════════
 * APP · the migration-test demo composition · mirrors the HTML row-for-row
 * ──────────────────────────────────────────────────────────────────
 * The composition/demos layer of the former monolithic `index.tsx`,
 * relocated in the N+12b split. Each per-component mirror now lives in
 * its own `<component>.tsx`; this file is the call site that exercises
 * them — the rows, the stateful demo wrappers, and the page shell.
 *
 * Layout composition uses <Stack> + <Box> (decision 37 · N+6.2)
 * instead of the pre-N+6.2 hand-rolled flex styles. The canvas is
 * a Box with uniform padding="xl"; the page is a Stack gap="xl" of
 * (header, row-groups); each row-group is a Stack gap="sm" of
 * (label, row); each row is a Stack direction="row" gap="md" of
 * instances. F-LAYOUT-1 retired.
 * ══════════════════════════════════════════════════════════════════ */

import * as React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text } from 'react-native';

import { chrome, typeStyle, NuriScope, type Accent } from './_shared';
import { Stack } from './stack';
import { Box } from './box';
import { Button } from './button';
import { Icon } from './icon';
import { IconButton } from './icon-button';
import { Switch } from './switch';
import { Tabs, Tab } from './tabs';
import { TabBar, TabBarItem } from './tab-bar';
import { Topbar, TopbarStart, TopbarEnd } from './topbar';
import { Typography } from './typography';
import { TypographyStack } from './typography-stack';
import { Separator } from './separator';
import { IconAvatar } from './icon-avatar';
import { List, ListItem, InteractiveListItem } from './list';
import { NavItem } from './nav-item';

// ══════════════════════════════════════════════════════════════════
// STYLE SHEET · demo-local styles
// ──────────────────────────────────────────────────────────────────
// The Button-internal base + label styling moved into button.tsx in
// the N+12b split; what remains here is the demo chrome (header, row
// labels, faux-list cell text) the App body composes directly.
// ══════════════════════════════════════════════════════════════════
const styles = StyleSheet.create({
  headerTitle: {
    fontSize:   22,
    fontWeight: '600',
    color:      chrome.light.textPrimary,
  },
  headerSub: {
    fontSize: 13,
    color:    chrome.light.textMuted,
  },

  rowLabel: {
    fontSize:    12,
    color:       chrome.light.textMuted,
    fontFamily: 'monospace',
  },

  // Body text for the Separator / IconAvatar faux-list rows (N+6.9).
  cellText: {
    fontSize: 14,
    color:    chrome.light.textPrimary,
  },
});

// Stateful demo wrappers — App's body is a pure expression with no
// hook slot, so the controlled state for Switch + Tabs lives here.
const SwitchDemo: React.FC<{ accent?: Accent; disabled?: boolean; initial?: boolean }> = ({
  accent,
  disabled,
  initial = false,
}) => {
  const [on, setOn] = React.useState(initial);
  return <Switch checked={on} accent={accent} disabled={disabled} onChange={setOn} />;
};

const TabsDemo: React.FC = () => {
  const [value, setValue] = React.useState('overview');
  return (
    <Tabs value={value} onChange={setValue}>
      <Tab value="overview">Overview</Tab>
      <Tab value="activity">Activity</Tab>
      <Tab value="assets">Assets</Tab>
      {/* D3 · disabled option · non-selectable + muted + a11y disabled */}
      <Tab value="archived" disabled>Archived</Tab>
    </Tabs>
  );
};

const TopbarDemo: React.FC = () => {
  // Title type + color now come from the Topbar centre region itself
  // (decision 46 amended · decision 55) — the demo passes bare title
  // text and the component supplies lg-em from the shared scale.
  return (
    <Stack gap="md">
      {/* default · left-aligned · back chevron + settings */}
      <Topbar>
        <TopbarStart>
          <IconButton name="caret-left" variant="ghost" label="Back" />
        </TopbarStart>
        Account
        <TopbarEnd>
          <IconButton name="gear" variant="ghost" label="Settings" />
        </TopbarEnd>
      </Topbar>

      {/* center · Cancel / Edit / Save action bar (decision 46) · the
          roomy centred bar opts out of the xs default with inset="lg" */}
      <Topbar center inset="lg">
        <TopbarStart>
          <Button variant="soft">Cancel</Button>
        </TopbarStart>
        Edit
        <TopbarEnd>
          <Button variant="solid">Save</Button>
        </TopbarEnd>
      </Topbar>

      {/* close · ghost-fill IconButton (decision 40.1 passthrough) */}
      <Topbar>
        Receive
        <TopbarEnd>
          <IconButton name="x-circle" variant="ghost" fill label="Close" />
        </TopbarEnd>
      </Topbar>
    </Stack>
  );
};

const TabBarDemo: React.FC = () => {
  const [value, setValue] = React.useState('vault');
  return (
    <TabBar value={value} onChange={setValue} label="Primary">
      <TabBarItem value="vault" name="vault" label="My vault" />
      <TabBarItem value="coin" name="coin-vertical" label="Coin" />
      <TabBarItem value="activity" name="clock" label="Activity" />
    </TabBar>
  );
};

const App: React.FC = () => (
  <SafeAreaView style={{ flex: 1, backgroundColor: chrome.light.bgCanvas }}>
    <ScrollView>
      <Box
        padding="xl"
        style={{ width: 390, backgroundColor: chrome.light.bgCanvas }}
      >
        <Stack gap="xl">
          <Stack gap="xs">
            <Text style={styles.headerTitle}>Button matrix</Text>
            <Text style={styles.headerSub}>
              variant × accent × state × scope-tier · 8 instances
            </Text>
          </Stack>

          {/* ── Row A · Tier 1 · ambient context default (lilac) ── */}
          <Stack gap="sm">
            <Text style={styles.rowLabel}>Tier 1 · ambient accent (lilac)</Text>
            <Stack direction="row" gap="md">
              <Button variant="solid">Pay</Button>
              <Button variant="soft">Cancel</Button>
            </Stack>
          </Stack>

          {/* ── Row B · Tier 2 · self-scope via `accent` prop ───── */}
          <Stack gap="sm">
            <Text style={styles.rowLabel}>Tier 2 · self-scope · accent="neutral"</Text>
            <Stack direction="row" gap="md">
              <Button variant="solid" accent="neutral">Pay</Button>
              <Button variant="soft" accent="neutral">Cancel</Button>
            </Stack>
          </Stack>

          {/* ── Row C · Tier 3 · subtree-scope via NuriScope ────── */}
          {/* Merge-on-override: accent="neutral" flips the accent dim   */}
          {/* while mode inherits from ambient (decision 27/62). One     */}
          {/* composite Provider, not one-per-dimension (F-SCOPE-1 closed). */}
          <Stack gap="sm">
            <Text style={styles.rowLabel}>Tier 3 · subtree-scope · NuriScope accent="neutral"</Text>
            <Stack direction="row" gap="md">
              <NuriScope accent="neutral">
                <Button variant="solid">Pay</Button>
                <Button variant="soft">Cancel</Button>
              </NuriScope>
            </Stack>
          </Stack>

          {/* ── Row D · State · disabled ─────────────────────────── */}
          <Stack gap="sm">
            <Text style={styles.rowLabel}>State · disabled · ambient accent (lilac)</Text>
            <Stack direction="row" gap="md">
              <Button variant="solid" disabled>Pay</Button>
              <Button variant="soft" disabled>Cancel</Button>
            </Stack>
          </Stack>

          {/* ── Row D.1 · Size · lg / md / sm (D2 · decision 41/55) ── */}
          {/* Per-size geometry triple from button.ts; label type tracks  */}
          {/* size (sm → smEm · md/lg → mdEm). align="start" so the rows   */}
          {/* don't stretch to a common height. */}
          <Stack gap="sm">
            <Text style={styles.rowLabel}>Size · lg / md / sm · geometry + label type per size</Text>
            <Stack direction="row" gap="md" align="start">
              <Button variant="solid" size="lg">Large</Button>
              <Button variant="solid" size="md">Medium</Button>
              <Button variant="solid" size="sm">Small</Button>
            </Stack>
          </Stack>

          {/* ── Row E · IconButton · N+6.8 · F-ICON-RN-1 CLOSED ──── */}
          {/* Single-size-locked md (decision 40); ghost joins solid/soft */}
          {/* as the cross-component tertiary (decision 39). Glyphs are  */}
          {/* real Icons over the shared registry (decision 48).         */}
          <Stack gap="sm">
            <Text style={styles.rowLabel}>IconButton · md-locked · solid / soft / ghost · glyphs live</Text>
            <Stack direction="row" gap="md">
              <IconButton name="plus" variant="solid" label="Add item" />
              <IconButton name="gear" variant="soft" />
              <IconButton name="x-circle" variant="ghost" label="Dismiss" />
              <IconButton name="scan" variant="solid" accent="neutral" disabled />
            </Stack>
          </Stack>

          {/* ── Row F · Switch · N+6.5 · complete RN translation ──── */}
          {/* off / on / on+neutral self-scope / disabled. Consumes the */}
          {/* generated switchTokens end-to-end (no Icon blocker).      */}
          <Stack gap="sm">
            <Text style={styles.rowLabel}>Switch · 60×36 · off / on / accent="neutral" / disabled</Text>
            <Stack direction="row" gap="md" align="center">
              <SwitchDemo />
              <SwitchDemo initial />
              <SwitchDemo initial accent="neutral" />
              <SwitchDemo initial disabled />
            </Stack>
          </Stack>

          {/* ── Row G · Tabs · N+6.5 · compound · Box-composed surface ─ */}
          {/* Controlled single-select; tablist surface is the RN Box.   */}
          <Stack gap="sm">
            <Text style={styles.rowLabel}>Tabs · compound · Box-composed surface · 3 options</Text>
            <TabsDemo />
          </Stack>

          {/* ── Row H · Topbar · N+6.6 · compositional chrome shell ── */}
          {/* default left-aligned · center action bar · ghost-fill close. */}
          {/* Composes IconButton (glyph-live · N+6.8) — no new direct Icon consumer. */}
          <Stack gap="sm">
            <Text style={styles.rowLabel}>Topbar · default / center action bar / ghost-fill close · composes IconButton</Text>
            <TopbarDemo />
          </Stack>

          {/* ── Row H.1 · TabBar · N+9 · icon-only bottom destination switcher ── */}
          {/* Controlled single-select; DISTINCT from Tabs. Selected item   */}
          {/* reads in text-primary with a filled glyph (chrome-only, NOT   */}
          {/* accent). Role gap vs web's <nav>/aria-current is F-TABBAR-ROLE-1. */}
          <Stack gap="sm">
            <Text style={styles.rowLabel}>TabBar · compound · icon-only bottom destination switcher · 3 items · composes Icon</Text>
            <TabBarDemo />
          </Stack>

          {/* ── Row I · TypographyStack · decision 53 · text-hierarchy ─────── */}
          {/* column primary→muted pairing · row baseline label+value · the   */}
          {/* hierarchy guidance steps composed as Typography size/emphasis/   */}
          {/* muted props (no -element / level · decision 53).                 */}
          <Stack gap="sm">
            <Text style={styles.rowLabel}>TypographyStack · column / row label+value / hierarchy guidance · composes Typography both sides</Text>
            <Stack direction="row" gap="xl" align="start">
              <TypographyStack>
                <Typography size="md" emphasis>Coffee Roasters</Typography>
                <Typography size="sm" muted>26 May at 11:34 AM</Typography>
              </TypographyStack>
              <TypographyStack direction="row">
                <Typography size="sm" muted>Amount</Typography>
                <Typography size="md" emphasis>€42.00</Typography>
              </TypographyStack>
              <TypographyStack>
                <Typography size="lg" emphasis>Step 1</Typography>
                <Typography size="md" emphasis>Step 2</Typography>
                <Typography size="sm" emphasis>Step 3</Typography>
                <Typography size="sm">Step 4</Typography>
                <Typography size="sm" muted>Step 5</Typography>
              </TypographyStack>
            </Stack>
          </Stack>

          {/* ── Row J · Separator · N+6.9 · decision 49 ──────────── */}
          {/* Prop-free 1px hairline, author-placed between rows —    */}
          {/* closes the Stack `divider` question (a divider is just  */}
          {/* a Separator the author drops in, not a Stack prop).     */}
          <Stack gap="sm">
            <Text style={styles.rowLabel}>Separator · 1px hairline · author-placed between rows</Text>
            <Stack gap="sm">
              <Text style={styles.cellText}>Groceries</Text>
              <Separator />
              <Text style={styles.cellText}>Rent</Text>
              <Separator />
              <Text style={styles.cellText}>Utilities</Text>
            </Stack>
          </Stack>

          {/* ── Row K · IconAvatar · N+6.9 · decision 50 ─────────── */}
          {/* Decorative twin of IconButton; first NEW consumer of    */}
          {/* the resolved Icon (F-ICON-RN-1 closed · N+6.8). Leads a  */}
          {/* labelled activity row; Separator rules between them.    */}
          <Stack gap="sm">
            <Text style={styles.rowLabel}>IconAvatar · 48px · solid / soft / ghost / subtle · decorative · leads a labelled row</Text>
            <Stack gap="sm">
              <Stack direction="row" gap="sm" align="center">
                <IconAvatar name="clock" variant="soft" />
                <Text style={styles.cellText}>Reminder · rent due Friday</Text>
              </Stack>
              <Separator />
              <Stack direction="row" gap="sm" align="center">
                <IconAvatar name="vault" variant="solid" />
                <Text style={styles.cellText}>You planted a new goal</Text>
              </Stack>
              <Separator />
              <Stack direction="row" gap="sm" align="center">
                <IconAvatar name="gear" variant="ghost" fill />
                <Text style={styles.cellText}>Profile updated</Text>
              </Stack>
              <Separator />
              <Stack direction="row" gap="sm" align="center">
                <IconAvatar name="clock" variant="subtle" />
                <Text style={styles.cellText}>Archived last month</Text>
              </Stack>
            </Stack>
          </Stack>

          {/* ── Row L · List + ListItem · N+7 · decision 51 ───────── */}
          {/* The family capstone: ONE row shape — [leading] · content  */}
          {/* · [trailing] — composed via children, not use-case        */}
          {/* variants. Disclosure (content + caret, interactive),      */}
          {/* Transaction (leading avatar + content + amount,           */}
          {/* interactive), Summary (content + value, non-interactive). */}
          {/* density projects row min-height; Separators stay 1px.     */}
          <Stack gap="sm">
            <Text style={styles.rowLabel}>List family · primitive ListItem · InteractiveListItem wrapper · NavItem recipe · density sm→lg · decision 52</Text>

            {/* NavItem · the recipe · auto-filled muted caret + md-em label */}
            <List>
              <NavItem onPress={() => {}}>Linked accounts</NavItem>
              <Separator />
              <NavItem onPress={() => {}}>Currency</NavItem>
            </List>

            {/* InteractiveListItem · pressable wrapper · custom content + caret */}
            <List>
              <InteractiveListItem
                onPress={() => {}}
                trailing={<Icon name="caret-right" size="md" color={chrome.light.borderStrong} />}
              >
                <TypographyStack>
                  <Typography size="md" emphasis>Currency</Typography>
                  <Typography size="sm" muted>GBP £</Typography>
                </TypographyStack>
              </InteractiveListItem>
            </List>

            {/* transaction · interactive · leading avatar + content + trailing amount */}
            <List>
              <InteractiveListItem
                onPress={() => {}}
                leading={<IconAvatar name="arrow-up" variant="soft" />}
                trailing={
                  <TypographyStack>
                    <Typography size="md" emphasis>−£24.00</Typography>
                    <Typography size="sm" muted>Complete</Typography>
                  </TypographyStack>
                }
              >
                <TypographyStack>
                  <Typography size="md" emphasis>Sent to Alex</Typography>
                  <Typography size="sm" muted>26 May at 11:34 AM</Typography>
                </TypographyStack>
              </InteractiveListItem>
            </List>

            {/* summary · PRESENTATIONAL ListItem · content + trailing value */}
            <List>
              <ListItem
                trailing={
                  <TypographyStack>
                    <Typography size="lg" emphasis>£201.20</Typography>
                  </TypographyStack>
                }
              >
                <TypographyStack>
                  <Typography size="md" emphasis>Total</Typography>
                </TypographyStack>
              </ListItem>
            </List>

            {/* density · sm (60px) · separators stay 1px · NavItem recipe */}
            <List density="sm">
              <NavItem onPress={() => {}}>Security</NavItem>
              <Separator />
              <NavItem onPress={() => {}}>Privacy</NavItem>
            </List>
          </Stack>
        </Stack>
      </Box>
    </ScrollView>
  </SafeAreaView>
);

export default App;
