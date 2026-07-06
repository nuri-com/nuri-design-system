/* ──────────────────────────────────────────────────────────────
 * SHEET · the overlay-layer validation screen (brief-overlay-provider M4).
 * Exercises the migrated <BottomSheet>: it now registers into the
 * <OverlayProvider> outlet (mounted in App above the safe-area padding), so
 * the scrim dims the FULL window — including the status-bar strip — instead of
 * only the padded content box.
 *
 * Two real sheets, both pure DS composition (the SCREEN owns the open state —
 * the DS stays dumb: it paints `open`, the consumer owns it):
 *   · CHOICE — a content-detent sheet with a column of option buttons.
 *   · FORM   — a sheet with TextFields + a footer button, wrapped in
 *              <BottomSheetScroll> so fields and the footer stay reachable with
 *              the keyboard up (the KeyboardAvoidingView lives in the migrated
 *              overlay subtree; validate on a real device — see App).
 *
 * The status-bar dim + the keyboard push on a real iOS/Android device are
 * operator-owned residue (the web/expo-web harness can't prove native
 * status-bar behaviour); this screen is what that device check drives.
 * ────────────────────────────────────────────────────────────── */

import * as React from 'react';
import {
  BottomSheet,
  BottomSheetPanel,
  BottomSheetScroll,
  Button,
  Text,
  TextField,
  TextFieldLabel,
  Topbar,
  TopbarCenter,
  View,
} from '../components/ui';

type OpenSheet = 'none' | 'choice' | 'form';

const ACCOUNTS = ['Main wallet', 'Savings', 'Trading', 'Travel card', 'Cold storage'];

// Enough fields that the full-screen form overflows — so BottomSheetScroll (and
// its keyboard-inset scrolling) is actually exercised, not just present.
type FormField = {
  id: string;
  label: string;
  placeholder: string;
  inputMode?: React.ComponentProps<typeof TextField>['inputMode'];
};
const FORM_FIELDS: readonly FormField[] = [
  { id: 'recipient', label: 'Recipient', placeholder: 'Name' },
  { id: 'amount', label: 'Amount', placeholder: '0.00', inputMode: 'decimal' },
  { id: 'reference', label: 'Reference', placeholder: 'Invoice #' },
  { id: 'iban', label: 'IBAN', placeholder: 'DE00 0000 0000 0000' },
  { id: 'bic', label: 'BIC', placeholder: 'NURIDEXXX' },
  { id: 'note', label: 'Note', placeholder: 'Optional message' },
];

export const Sheet: React.FC = () => {
  const [open, setOpen] = React.useState<OpenSheet>('none');
  const [values, setValues] = React.useState<Record<string, string>>({});
  const setField = React.useCallback(
    (id: string) => (text: string) => setValues((prev) => ({ ...prev, [id]: text })),
    [],
  );
  const close = React.useCallback(() => setOpen('none'), []);

  return (
    <View direction="column" align="stretch" justify="start" fill="grow" chrome="canvas">
      <Topbar>
        <TopbarCenter>
          <Text size="md" emphasis>Overlay</Text>
        </TopbarCenter>
      </Topbar>

      <View direction="column" align="stretch" justify="start" gap="md" paddingX="lg" paddingY="lg" fill="grow">
        <Text size="sm" muted>
          The bottom sheet registers into the overlay layer — its scrim dims the whole window,
          status bar included.
        </Text>
        <Button size="lg" variant="soft" onPress={() => setOpen('choice')}>Choose account</Button>
        <Button size="lg" variant="solid" accent="orange" onPress={() => setOpen('form')}>Add recipient</Button>
      </View>

      {/* CHOICE · a content-height sheet with a column of options. */}
      <BottomSheet open={open === 'choice'} detent="content" onOpenChange={(next) => !next && close()}>
        <BottomSheetPanel>
          <View direction="column" align="stretch" gap="sm" padding="lg">
            <Text size="lg" emphasis>Choose account</Text>
            {ACCOUNTS.map((name) => (
              <Button key={name} variant="soft" onPress={close}>{name}</Button>
            ))}
          </View>
        </BottomSheetPanel>
      </BottomSheet>

      {/* FORM · full-screen (operator's call — the real keyboard case), with
          TextFields + footer wrapped in BottomSheetScroll so the fields scroll
          above the keyboard and Save stays reachable (validated on a real
          device — the harness can't prove the keyboard push). */}
      <BottomSheet open={open === 'form'} detent="full" onOpenChange={(next) => !next && close()}>
        <BottomSheetPanel>
          <BottomSheetScroll>
            <View direction="column" align="stretch" gap="md" padding="lg">
              <Text size="lg" emphasis>Add recipient</Text>
              {FORM_FIELDS.map((field) => (
                <TextField
                  key={field.id}
                  value={values[field.id] ?? ''}
                  onChangeText={setField(field.id)}
                  placeholder={field.placeholder}
                  inputMode={field.inputMode}
                >
                  <TextFieldLabel>{field.label}</TextFieldLabel>
                </TextField>
              ))}
              <Button size="lg" variant="solid" onPress={close}>Save</Button>
            </View>
          </BottomSheetScroll>
        </BottomSheetPanel>
      </BottomSheet>
    </View>
  );
};
