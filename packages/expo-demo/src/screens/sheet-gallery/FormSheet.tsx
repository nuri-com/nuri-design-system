import * as React from 'react';

import {
  BottomSheet,
  BottomSheetPanel,
  BottomSheetScroll,
  Button,
  IconButton,
  Text,
  TextField,
  TextFieldButton,
  TextFieldLabel,
  Topbar,
  TopbarTrailing,
  View,
} from '../../components/ui';
import { FORM_FIELDS } from './data';

export function FormSheet({
  open,
  values,
  onChangeField,
  onClose,
}: {
  open: boolean;
  values: Record<string, string>;
  onChangeField: (id: string) => (value: string) => void;
  onClose: () => void;
}) {
  return (
    <BottomSheet open={open} detent="full" onOpenChange={(next) => !next && onClose()}>
      <BottomSheetPanel>
        <View direction="column" align="stretch" justify="start" fill="grow">
          <Topbar>
            <TopbarTrailing>
              <IconButton icon="cross" variant="soft" accessibilityLabel="Close form sheet" onPress={onClose} />
            </TopbarTrailing>
          </Topbar>

          <View direction="column" align="stretch" justify="start" fill="grow-shrink">
            <BottomSheetScroll>
              <View direction="column" align="stretch" justify="start" gap="xl" paddingX="lg" paddingBottom="xl">
                <View direction="column" align="stretch" justify="start" gap="sm">
                  <Text size="lg" emphasis>Who is your recipient?</Text>
                  <Text size="md" muted>Enter their bank account details</Text>
                </View>

                <View direction="column" align="stretch" justify="start" gap="xl">
                  {FORM_FIELDS.map((field) => (
                    <TextField
                      key={field.id}
                      value={values[field.id] ?? ''}
                      onChangeText={onChangeField(field.id)}
                      placeholder={field.placeholder}
                      inputMode={field.inputMode}
                    >
                      <TextFieldLabel>{field.label}</TextFieldLabel>
                      {field.action ? (
                        <TextFieldButton accessibilityLabel={field.action}>{field.action}</TextFieldButton>
                      ) : null}
                    </TextField>
                  ))}
                </View>

                <Button size="lg" variant="solid" accent="lilac" onPress={onClose}>Save recipient</Button>
                <View height="xl" />
              </View>
            </BottomSheetScroll>
          </View>
        </View>
      </BottomSheetPanel>
    </BottomSheet>
  );
}
