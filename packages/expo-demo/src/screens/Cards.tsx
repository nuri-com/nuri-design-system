import * as React from 'react';
import {
  Platform,
  ScrollView as RNScrollView,
  View as RNView,
  useWindowDimensions,
  type ImageSourcePropType,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

import {
  Bleed,
  Button,
  Footer,
  IconAvatar,
  IconButton,
  List,
  ListAction,
  ListActionLeadingAvatar,
  ListActionText,
  ListActionTextMuted,
  ListActionTrailIcon,
  Screen,
  Scroll,
  Separator,
  Text,
  Topbar,
  TopbarTitle,
  TopbarTrailing,
  View,
} from '@ds';
import type { IconName } from '@ds';

/* ──────────────────────────────────────────────────────────────
 * CARDS · the carousel prototype (playground pages/cards.html as spec).
 *
 * ONE screen; the carousel index IS the navigation state. Slide 0 = the
 * Total Balance home; slides 1..N = the account views. On snap-settle the
 * topbar, the action pair and the list below swap to the selected slide.
 * Tapping an account row jumps the carousel to that slide with NO
 * animation (+ vertical scroll reset); back = jump to slide 0, instant.
 *
 * Decisions (2026-08-26): SCROLLING chrome (the board-2 de-pinned topbar —
 * supersedes the pinned board-1 header; the bar is the first scroll row and
 * rides away with the content, the back lives in the footer) · PREDICTIVE
 * midpoint commit (supersedes settle-only: same no-flicker property, none
 * of the rest+debounce latency) · instant jumps both ways ·
 * MAGNETIC snap (mandatory; one card per swipe via
 * disableIntervalMomentum — no resting between snap points) · INFINITE
 * wrap, home included (one back-swipe from Total Balance reaches the last
 * account; the peeking sliver on both sides signals it).
 *
 * <Rail> below is the draft spec for a future DS primitive: it owns the
 * horizontal mechanics (snap · settle · imperative jump) so this screen
 * stays pure DS composition + consumer state. The geometry hook derives
 * every measure from the chrome grid — no tuned numbers.
 * ────────────────────────────────────────────────────────────── */

// Token mirrors (the @ds barrel deliberately does not export the scale
// tables, and expo-demo stays barrel-only / copy-portable). Values are the
// frozen dimension tokens; a future DS Rail would read them from the theme
// runtime instead.
const SPACE_SM = 6;    // --nuri-space-sm
const SPACE_LG = 18;   // --nuri-space-lg  · the page inset
const SIZE_LG = 48;    // --nuri-size-lg   · the topbar icon-button circle
const RATIO_CARD = 1.586; // --nuri-ratio-card

/* ── Rail geometry · every measure derives from the chrome grid ──────────
 *   height  = a card-ratio card AS IF full-width: (W − 2·lg) / ratio-card
 *   width   = the card's right edge sits at the CENTRE of the topbar's
 *             trailing icon-button: (W − lg − size_lg/2) − lg
 *   gap     = sm; the resulting peek (W − lg − cardW − gap = 36px) is a
 *             consequence, not a parameter.                              */
type RailGeometry = {
  side: number;
  gap: number;
  cardW: number;
  cardH: number;
  interval: number;
  viewport: number;
};

function useRailGeometry(): RailGeometry {
  const { width } = useWindowDimensions();
  return React.useMemo(() => {
    const trailingButtonCentre = width - SPACE_LG - SIZE_LG / 2;
    const side = SPACE_LG;
    const gap = SPACE_SM;
    const cardW = trailingButtonCentre - side;
    const cardH = Math.round((width - 2 * SPACE_LG) / RATIO_CARD);
    return { side, gap, cardW, cardH, interval: cardW + gap, viewport: width };
  }, [width]);
}

/* ── Rail · the horizontal snap mechanics (the future-DS-primitive shape:
 * geometry in, onIndexSettled out, imperative jumpTo) ──────────────────── */
export type RailHandle = { jumpTo: (index: number) => void };

const Rail = React.memo(React.forwardRef<RailHandle, {
  geometry: RailGeometry;
  count: number;
  /** Infinite wrap. One clone per side suffices: disableIntervalMomentum caps
   * every swipe at ONE card, so a gesture can never land past the first clone.
   * Settling on a clone teleports (no animation) to its real twin — identical
   * pixels, invisible. */
  loop?: boolean;
  onIndexSettled: (index: number) => void;
  children: React.ReactNode;
}>(function Rail({ geometry, count, loop = false, onIndexSettled, children }, ref) {
  const { side, gap, cardW, cardH, interval, viewport } = geometry;
  const scrollRef = React.useRef<RNScrollView>(null);
  const settleTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Rail positions = [clone(last)] + real 0..count-1 + [clone(first)] when
  // looping; `lead` shifts logical → rail offsets.
  const lead = loop ? 1 : 0;
  const railCount = count + 2 * lead;
  const toOffset = React.useCallback(
    (logical: number) => (logical + lead) * interval,
    [lead, interval],
  );

  const toLogical = React.useCallback((x: number) => {
    const rail = Math.max(0, Math.min(railCount - 1, Math.round(x / interval)));
    if (loop && rail === 0) return count - 1;
    if (loop && rail === railCount - 1) return 0;
    return rail - lead;
  }, [railCount, interval, lead, loop, count]);

  // PREDICTIVE commit (2026-08-26 · the felt "lag in the part down"): with the
  // one-card magnet the destination is KNOWN the moment the midpoint is
  // crossed — nearest-point rounding flips exactly once per glide — so the
  // content below swaps while the card is still gliding, instead of waiting
  // for rest + debounce. Commits are deduped; the render cost is ~2ms.
  const lastCommitted = React.useRef(0);
  const commit = React.useCallback((logical: number) => {
    if (lastCommitted.current === logical) return;
    lastCommitted.current = logical;
    onIndexSettled(logical);
  }, [onIndexSettled]);

  // The settle keeps only what NEEDS rest: the clone → real teleport.
  const settle = React.useCallback((x: number) => {
    const rail = Math.max(0, Math.min(railCount - 1, Math.round(x / interval)));
    const logical = toLogical(x);
    if (loop && (rail === 0 || rail === railCount - 1)) {
      scrollRef.current?.scrollTo({ x: toOffset(logical), animated: false });
    }
    commit(logical);
  }, [railCount, interval, toLogical, loop, toOffset, commit]);

  const onScroll = React.useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    if (loop && !parked.current && x >= (interval / 2)) parked.current = true;
    commit(toLogical(x));
    if (settleTimer.current) clearTimeout(settleTimer.current);
    settleTimer.current = setTimeout(() => settle(x), 60);
  }, [loop, interval, commit, toLogical, settle]);

  const onMomentumEnd = React.useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (settleTimer.current) clearTimeout(settleTimer.current);
    settle(e.nativeEvent.contentOffset.x);
  }, [settle]);

  React.useImperativeHandle(ref, () => ({
    jumpTo: (index: number) => {
      // An explicit jump CLAIMS the position: without this, a tap landing
      // before the (dev-slow) parking effect mounts gets squashed by the
      // park attempt — effects flush ahead of the queued scroll event.
      parked.current = true;
      lastCommitted.current = index;
      scrollRef.current?.scrollTo({ x: toOffset(index), animated: false });
    },
  }), [toOffset]);

  // Park at the first REAL slide on mount (the leading clone sits at 0).
  // contentOffset alone is iOS-only; the size-change hook covers every target.
  // Park at the first REAL slide on mount (the leading clone sits at 0).
  // Size/layout events race the web scroller's first layout (a too-early
  // scrollTo clamps to 0), so: bounded retries until a scroll event CONFIRMS
  // the offset landed. Prototype glue — a DS Rail would own initial-index.
  const parked = React.useRef(false);
  React.useEffect(() => {
    if (!loop) return;
    let tries = 0;
    let cancelled = false;
    const attempt = () => {
      if (cancelled || parked.current || tries >= 10) return;
      tries += 1;
      scrollRef.current?.scrollTo({ x: toOffset(0), animated: false });
      setTimeout(attempt, 80);
    };
    attempt();
    return () => { cancelled = true; };
  }, [loop, toOffset]);

  // The magnet: native = snapToInterval (+ one-card-per-swipe via
  // disableIntervalMomentum); web = CSS mandatory scroll-snap (RN-web
  // ignores snapToInterval — without this you can rest mid-way).
  // scrollPaddingLeft aligns the web snap grid with the native offsets.
  const webSnap = Platform.OS === 'web'
    ? ({ scrollSnapType: 'x mandatory', scrollPaddingLeft: side } as object)
    : null;
  const webItemSnap = Platform.OS === 'web'
    ? ({ scrollSnapAlign: 'start' } as object)
    : null;

  const items = React.Children.toArray(children);
  const rendered = loop && items.length > 1
    ? [items[items.length - 1], ...items, items[0]]
    : items;

  return (
    <RNScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      snapToInterval={interval}
      disableIntervalMomentum
      decelerationRate="fast"
      scrollEventThrottle={16}
      onScroll={onScroll}
      onMomentumScrollEnd={onMomentumEnd}
      style={[{ flexGrow: 0 }, webSnap]}
      contentContainerStyle={{
        paddingLeft: side,
        paddingRight: viewport - side - cardW,
        gap,
      }}
    >
      {rendered.map((child, i) => {
        const isClone = loop && (i === 0 || i === rendered.length - 1);
        return (
          <RNView
            key={`rail-${i}`}
            aria-hidden={isClone}
            style={[{ width: cardW, height: cardH }, webItemSnap]}
          >
            {child}
          </RNView>
        );
      })}
    </RNScrollView>
  );
}));

type AccountRow = { icon: IconName; title: string; value?: string };

type Account = {
  key: string;
  /** Row + card-head name (bare currency; tier lives on the band / qualifier). */
  name: string;
  /** The composed-name qualifier on the card head (muted, non-emphasis). Absent
   * on bitcoin/lightning — "Bitcoin Cash account" would read as BCH, and the
   * naming rule qualifies only where a collision exists. */
  qualifier?: string;
  tier: 'cash' | 'spend';
  source: ImageSourcePropType;
  balance: string;
  /** The figure on the card (3xl) + the optional md conversion line under it. */
  fig: string;
  sub?: string;
  sendAccent: 'lilac' | 'orange';
  details: AccountRow[];
};

const ACCOUNTS: Account[] = [
  {
    key: 'btc', name: 'Bitcoin', tier: 'cash',
    source: require('../../assets/logos/bitcoin.png'),
    balance: '86969 ₿', fig: '₿ 86969', sub: '€ 41.82', sendAccent: 'orange',
    details: [{ icon: 'qr', title: 'Address', value: 'bc1qct •••• gsl6r4' }],
  },
  {
    key: 'ln', name: 'Bitcoin Lightning', tier: 'cash',
    source: require('../../assets/logos/lightning.png'),
    balance: '0 ₿', fig: '₿ 0', sub: '€ 0.00', sendAccent: 'orange',
    details: [{ icon: 'qr', title: 'Address', value: 'satoshi@nuri.money' }],
  },
  {
    key: 'eur', name: 'Euro', qualifier: 'Cash account', tier: 'cash',
    source: require('../../assets/flags/eur.png'),
    balance: '100.00 €', fig: '€ 100.00', sendAccent: 'lilac',
    details: [{ icon: 'qr', title: 'Address', value: '0x71C7 •••• 976F' }],
  },
  {
    key: 'usd', name: 'Dollar', qualifier: 'Cash account', tier: 'cash',
    source: require('../../assets/flags/usa.png'),
    balance: '74.60 $', fig: '$ 74.60', sendAccent: 'lilac',
    details: [{ icon: 'qr', title: 'Address', value: '0x9A31 •••• 4C21' }],
  },
  {
    key: 'eur-visa', name: 'Euro', qualifier: 'Spend account', tier: 'spend',
    source: require('../../assets/logos/visa-eur.png'),
    balance: '34.45 €', fig: '€ 34.45', sendAccent: 'lilac',
    details: [
      { icon: 'card', title: 'Visa card details', value: '4539 •••• •••• 4729' },
      { icon: 'bank', title: 'IBAN', value: 'DE89 3704 0044 0532 0130 00' },
    ],
  },
  {
    key: 'usd-visa', name: 'Dollar', qualifier: 'Spend account', tier: 'spend',
    source: require('../../assets/logos/visa-usd.png'),
    balance: '25.00 $', fig: '$ 25.00', sendAccent: 'lilac',
    details: [
      { icon: 'card', title: 'Visa card details', value: '4539 •••• •••• 8102' },
      { icon: 'bank', title: 'IBAN', value: 'DE89 3704 0044 0532 0130 01' },
    ],
  },
];

/** The home list · static (jump handler is stable) — renders once. */
const HomeList = React.memo(function HomeList({ onJump }: { onJump: (index: number) => void }) {
  return (
    <List>
      <ListAction accessibilityLabel="Transaction history, 153 activities">
        <ListActionLeadingAvatar name="list-bullets" variant="outline" />
        <ListActionText>Transaction history</ListActionText>
        <ListActionTextMuted>153 Activities</ListActionTextMuted>
        <ListActionTrailIcon name="chevron-right" />
      </ListAction>
      <Band label="Cash accounts" />
      {ACCOUNTS.filter((a) => a.tier === 'cash').map((a) => (
        <ListAction
          key={a.key}
          accessibilityLabel={`${a.name}, ${a.balance}`}
          onPress={() => onJump(ACCOUNTS.indexOf(a) + 1)}
        >
          <ListActionLeadingAvatar source={a.source} />
          <ListActionText>{a.name}</ListActionText>
          <ListActionTextMuted>{a.balance}</ListActionTextMuted>
          <ListActionTrailIcon name="chevron-right" />
        </ListAction>
      ))}
      <Band label="Spend accounts" />
      {ACCOUNTS.filter((a) => a.tier === 'spend').map((a) => (
        <ListAction
          key={a.key}
          accessibilityLabel={`${a.name}, ${a.qualifier}, ${a.balance}`}
          onPress={() => onJump(ACCOUNTS.indexOf(a) + 1)}
        >
          <ListActionLeadingAvatar source={a.source} />
          <ListActionText>{a.name}</ListActionText>
          <ListActionTextMuted>{a.balance}</ListActionTextMuted>
          <ListActionTrailIcon name="chevron-right" />
        </ListAction>
      ))}
    </List>
  );
});

/** One account's detail list · re-renders only when the account changes. */
const AccountList = React.memo(function AccountList({ account }: { account: Account }) {
  return (
    <List>
      <ListAction accessibilityLabel="Transaction history, 153 activities">
        <ListActionLeadingAvatar name="list-bullets" variant="outline" />
        <ListActionText>Transaction history</ListActionText>
        <ListActionTextMuted>153 Activities</ListActionTextMuted>
        <ListActionTrailIcon name="chevron-right" />
      </ListAction>
      <Band label="Account details" />
      {account.details.map((d) => (
        <ListAction key={d.title} accessibilityLabel={`${d.title}, ${d.value ?? ''}`}>
          <ListActionLeadingAvatar name={d.icon} variant="outline" />
          <ListActionText>{d.title}</ListActionText>
          {d.value ? <ListActionTextMuted>{d.value}</ListActionTextMuted> : null}
          <ListActionTrailIcon name="chevron-right" />
        </ListAction>
      ))}
    </List>
  );
});

/** The labelled band — the tier / group header (the playground band pattern). */
function Band({ label }: { label: string }) {
  return (
    <View direction="row" align="center" gap="sm" height="md" paddingX="md">
      <View fill="grow"><Separator ySpace="none" /></View>
      <Text size="sm" emphasis muted>{label}</Text>
      <View fill="grow"><Separator ySpace="none" /></View>
    </View>
  );
}

/** One carousel card: composed head (name + muted qualifier) over the fixed
 * amount region. Fills the Rail item shell (the geometry owns width/height —
 * the card carries no aspect ratio of its own). */
function BalanceCard({
  head,
  headGap = 'sm',
  fig,
  sub,
}: {
  head: React.ReactNode;
  /** 'md' on the total card — the Bleed's symmetric pull eats one sm step
   * (the playground board-1 compensation). */
  headGap?: 'sm' | 'md';
  fig: string;
  sub?: string;
}) {
  return (
    <View
      chrome="strong"
      radius="lg"
      padding="md"
      direction="column"
      justify="between"
      align="stretch"
      fill="grow"
    >
      <View direction="row" align="center" gap={headGap}>{head}</View>
      {/* The AMOUNT REGION · fixed 3xl-height box on every card so the big
          figure sits at the same y across the carousel, dual-amount or not. */}
      <View height="3xl" direction="column" align="end" justify="start">
        <Text size="3xl" align="end">{fig}</Text>
        {sub ? <Text size="md" align="end">{sub}</Text> : null}
      </View>
    </View>
  );
}

export function Cards({
  onToggleTheme,
  onClose,
}: {
  onToggleTheme?: () => void;
  /** When provided (the Menu-launcher path), the HOME slide gets the close
   * footer; account slides keep their back-to-home. */
  onClose?: () => void;
}) {
  const geometry = useRailGeometry();
  const [index, setIndex] = React.useState(0);
  const railRef = React.useRef<RailHandle>(null);
  const pageRef = React.useRef<React.ElementRef<typeof RNScrollView>>(null);

  // The instant jump (tap-in and back share it · no animation by decision).
  const jumpTo = React.useCallback((next: number) => {
    setIndex(next);
    railRef.current?.jumpTo(next);
    pageRef.current?.scrollTo({ y: 0, animated: false });
  }, []);

  const account = index === 0 ? null : ACCOUNTS[index - 1];

  // The rail content is static — memoized as an ARRAY (keys included) so the
  // memoized Rail sees a stable children prop and skips index re-renders.
  const railCards = React.useMemo(() => [
    <BalanceCard
      key="total"
      fig="€ 25.87"
      headGap="md"
      head={
        <>
          <View direction="row" align="center">
            <IconAvatar size="sm" source={require('../../assets/flags/eur.png')} />
            <Bleed x="sm">
              <IconAvatar size="sm" source={require('../../assets/logos/bitcoin.png')} />
            </Bleed>
          </View>
          <Text size="md" emphasis>Total Balance</Text>
        </>
      }
    />,
    ...ACCOUNTS.map((a) => (
      <BalanceCard
        key={a.key}
        fig={a.fig}
        sub={a.sub}
        head={
          <>
            <IconAvatar size="sm" source={a.source} />
            <Text size="md" emphasis>{a.name}</Text>
            {a.qualifier ? <Text size="md" muted>{a.qualifier}</Text> : null}
          </>
        }
      />
    )),
  ], []);

  return (
    <Screen safeAreaTop>
      <Scroll ref={pageRef}>
        <View direction="column" align="stretch" justify="start" gap="md" paddingBottom="md" fill="grow">
          {/* The DE-PINNED chrome: the bar is the first scroll row (transparent —
              a scrolling bar occludes nothing) and rides away with the content.
              Stable across slides; the back lives in the footer. */}
          <Topbar surface="transparent" layout="fluid">
            <TopbarTitle>Welcome Satoshi!</TopbarTitle>
            <TopbarTrailing>
              <IconButton icon="settings" variant="soft" accessibilityLabel="Settings" onPress={onToggleTheme} />
            </TopbarTrailing>
          </Topbar>

          <Rail
            ref={railRef}
            geometry={geometry}
            count={ACCOUNTS.length + 1}
            loop
            onIndexSettled={setIndex}
          >
            {railCards}
          </Rail>

          {/* The action pair · per-slide state, outside the rail. */}
          <View direction="row" align="center" gap="sm" distribute="even" paddingX="lg">
            <Button size="lg" variant="soft">Move</Button>
            {account ? (
              <Button size="lg" variant="solid" accent={account.sendAccent}>Send</Button>
            ) : (
              <Button size="lg" variant="solid">Add money</Button>
            )}
          </View>

          {/* Every list stays MOUNTED; the slide swap is a display flip.
              Mounting the swapped subtree on each transition was the felt lag
              (~1s main-thread block in web dev) — paying it once at screen
              mount makes the swap style-cheap. display:none drops the hidden
              lists from layout and the a11y tree on both targets. */}
          <RNView style={{ display: account ? 'none' : 'flex' }}>
            <HomeList onJump={jumpTo} />
          </RNView>
          {ACCOUNTS.map((a, i) => (
            <RNView key={a.key} style={{ display: index === i + 1 ? 'flex' : 'none' }}>
              <AccountList account={a} />
            </RNView>
          ))}
        </View>
      </Scroll>

      {account || onClose ? (
        <Footer safeAreaBottom chrome="transparent" paddingX="lg" paddingY="sm" paddingBottom="lg">
          <View direction="row" justify="start" align="center">
            {account ? (
              <IconButton
                icon="chevron-left"
                variant="soft"
                accessibilityLabel="Back to total balance"
                onPress={() => jumpTo(0)}
              />
            ) : (
              <IconButton
                icon="cross"
                variant="soft"
                accessibilityLabel="Close"
                onPress={onClose}
              />
            )}
          </View>
        </Footer>
      ) : null}
    </Screen>
  );
}
