import * as React from 'react';

import {
  Button,
  IconButton,
  Screen,
  Scroll,
  Text,
  TextField,
  TextFieldLabel,
  Topbar,
  TopbarLeading,
  TopbarTitle,
  View,
} from '@ds';

const LOAD_INTERVAL_MS = 48;
const BUSY_LOOP_MS = 24;

function blockJsBriefly(): void {
  const deadline = Date.now() + BUSY_LOOP_MS;
  while (Date.now() < deadline) {
    // Intentionally bounded work: this makes delayed controlled-value echoes
    // easier to hit without locking the demo indefinitely.
  }
}

export function TextFieldStress({ onBack }: { onBack: () => void }) {
  const [plain, setPlain] = React.useState('');
  const [sanitized, setSanitized] = React.useState('');
  const [loadEnabled, setLoadEnabled] = React.useState(false);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    const cancelTimer = () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    if (loadEnabled) {
      const run = () => {
        if (cancelled) return;
        blockJsBriefly();
        if (!cancelled) timerRef.current = setTimeout(run, LOAD_INTERVAL_MS);
      };
      timerRef.current = setTimeout(run, LOAD_INTERVAL_MS);
    }

    return () => {
      cancelled = true;
      cancelTimer();
    };
  }, [loadEnabled]);

  const clear = React.useCallback(() => {
    setPlain('');
    setSanitized('');
  }, []);

  const reset = React.useCallback(() => {
    setLoadEnabled(false);
    clear();
  }, [clear]);

  return (
    <Screen safeArea>
      <Topbar>
        <TopbarLeading>
          <IconButton icon="chevron-left" variant="soft" accessibilityLabel="Back to menu" onPress={onBack} />
        </TopbarLeading>
        <TopbarTitle>TextField stress</TopbarTitle>
      </Topbar>

      <Scroll>
        <View direction="column" align="stretch" gap="lg" paddingX="lg" paddingY="lg">
        <View direction="column" align="stretch" gap="sm">
          <Text size="md" emphasis>Controlled-input race harness</Text>
          <Text size="sm" muted>
            Enable JS load, focus each field, then type Lennard as quickly as possible. Compare the native buffer with the visible JS state.
          </Text>
          <Text size="sm" muted>
            JS load is disabled by default. Each cycle blocks for at most {BUSY_LOOP_MS} ms and its timer is cancelled when disabled or unmounted.
          </Text>
        </View>

        <View direction="column" align="stretch" gap="sm">
          <TextField value={plain} onChangeText={setPlain} placeholder="Fast-type Lennard">
            <TextFieldLabel>Plain controlled TextField</TextFieldLabel>
          </TextField>
          <Text size="sm" mono>JS state: {JSON.stringify(plain)}</Text>
        </View>

        <View direction="column" align="stretch" gap="sm">
          <TextField
            value={sanitized}
            onChangeText={setSanitized}
            sanitize={(text) => text.toUpperCase().replaceAll(' ', '')}
            placeholder="Fast-type Lennard with spaces"
          >
            <TextFieldLabel>Uppercase + strip spaces</TextFieldLabel>
          </TextField>
          <Text size="sm" mono>JS state: {JSON.stringify(sanitized)}</Text>
        </View>

        <View direction="column" align="stretch" gap="sm">
          <Button variant={loadEnabled ? 'solid' : 'soft'} onPress={() => setLoadEnabled((enabled) => !enabled)}>
            JS load: {loadEnabled ? 'on' : 'off'}
          </Button>
          <Button variant="soft" onPress={clear}>Clear fields</Button>
          <Button variant="soft" onPress={reset}>Reset harness</Button>
        </View>
        </View>
      </Scroll>
    </Screen>
  );
}
