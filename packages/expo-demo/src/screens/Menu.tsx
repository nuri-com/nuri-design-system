import * as React from 'react';

import { Button, IconButton, Screen, Topbar, View } from '@ds';
import { useSheet } from '../hooks/useSheet';
import { ActionsSheet } from '../sheets/ActionsSheet';
import { ActivitySheet } from '../sheets/ActivitySheet';
import { AmountSheet } from '../sheets/AmountSheet';
import { FormSheet, FormSheet2 } from '../sheets/FormSheet';

type FormValues = {
  iban: string;
  firstName: string;
  secondName: string;
  reference: string;
};

// Each sheet mounts HERE, next to its launcher — it registers into the
// OverlayProvider outlet, so it still renders full-window above everything.
// Sheet state (open flags · the form's values) lives with the screen that
// uses it, not in the router.
export function Menu({ onBack }: { onBack: () => void }) {
  const activity = useSheet();
  const amount = useSheet();
  const actions = useSheet();
  const form = useSheet();
  const form2 = useSheet();

  const [formValues, setFormValues] = React.useState<FormValues>({
    iban: 'DE06100110012625717344',
    firstName: '',
    secondName: '',
    reference: '',
  });
  const setField = React.useCallback(
    (id: keyof FormValues) => (value: string) => setFormValues((prev) => ({ ...prev, [id]: value })),
    [],
  );

  return (
    <Screen safeArea>
      <Topbar>
        <IconButton icon="chevron-left" variant="soft" accessibilityLabel="Back to wallet" onPress={onBack} />
      </Topbar>

      <View direction="column" align="stretch" justify="center" gap="md" paddingX="lg" paddingY="lg" fill="grow">
        <Button size="lg" onPress={activity.show}>Activity Sheet</Button>
        <Button size="lg" onPress={amount.show}>Amount Sheet</Button>
        <Button size="lg" onPress={actions.show}>Actions Sheet</Button>
        <Button size="lg" onPress={form.show}>Form Sheet</Button>
        <Button size="lg" onPress={form2.show}>Form Sheet 2</Button>
      </View>

      <ActivitySheet open={activity.open} onClose={activity.onClose} />
      <AmountSheet open={amount.open} onClose={amount.onClose} />
      <ActionsSheet open={actions.open} onClose={actions.onClose} />
      <FormSheet open={form.open} values={formValues} onChangeField={setField} onClose={form.onClose} />
      <FormSheet2 open={form2.open} values={formValues} onChangeField={setField} onClose={form2.onClose} />
    </Screen>
  );
}
