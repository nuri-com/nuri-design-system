import * as React from 'react';

import {
  BottomSheet,
  BottomSheetFooter,
  BottomSheetPanel,
  BottomSheetScroll,
  BottomSheetTopbar,
  Button,
  IconButton,
  Text,
  TextField,
  TextFieldButton,
  TextFieldLabel,
  TopbarTrailing,
  View,
} from '@ds';

export function FormSheet({
  open,
  values,
  onChangeField,
  onClose,
}: {
  open: boolean;
  values: {
    iban: string;
    firstName: string;
    secondName: string;
    reference: string;
    email: string;
    note: string;
  };
  onChangeField: (
    id: 'iban' | 'firstName' | 'secondName' | 'reference' | 'email' | 'note',
  ) => (value: string) => void;
  onClose: () => void;
}) {
  return (
    <BottomSheet open={open} detent="full" onOpenChange={(next) => !next && onClose()}>
      <BottomSheetPanel>
        <BottomSheetTopbar>
          <TopbarTrailing>
            <IconButton icon="cross" variant="soft" accessibilityLabel="Close form sheet" onPress={onClose} />
          </TopbarTrailing>
        </BottomSheetTopbar>

        <BottomSheetScroll>
          <View direction="column" align="stretch" justify="start" gap="xl" paddingX="lg">
            <View direction="column" align="stretch" justify="start" gap="sm">
              <Text size="lg" emphasis>Who is your recipient?</Text>
              <Text size="md" muted>Enter their bank account details</Text>
            </View>

            <View direction="column" align="stretch" justify="start" gap="xl">
              <TextField value={values.iban} onChangeText={onChangeField('iban')} placeholder="IBAN">
                <TextFieldLabel>IBAN*</TextFieldLabel>
                <TextFieldButton accessibilityLabel="Paste IBAN">Paste</TextFieldButton>
              </TextField>

              <TextField value={values.firstName} onChangeText={onChangeField('firstName')} placeholder="eg. Satoshi">
                <TextFieldLabel>First name*</TextFieldLabel>
              </TextField>

              <TextField value={values.secondName} onChangeText={onChangeField('secondName')} placeholder="eg. Nakamoto">
                <TextFieldLabel>Second name*</TextFieldLabel>
              </TextField>

              <TextField value={values.reference} onChangeText={onChangeField('reference')} placeholder="Optional">
                <TextFieldLabel>Reference</TextFieldLabel>
              </TextField>

              <TextField value={values.email} onChangeText={onChangeField('email')} placeholder="name@example.com" inputMode="email">
                <TextFieldLabel>Email</TextFieldLabel>
              </TextField>

              <TextField value={values.note} onChangeText={onChangeField('note')} placeholder="Add a short note">
                <TextFieldLabel>Note</TextFieldLabel>
              </TextField>
            </View>
          </View>
        </BottomSheetScroll>

        <BottomSheetFooter>
          <View chrome="strong" direction="row" align="center" justify="end" paddingY="sm" paddingX="lg">
            <Button size="sm" variant="solid" accent="lilac" onPress={onClose}>Next</Button>
          </View>
        </BottomSheetFooter>
      </BottomSheetPanel>
    </BottomSheet>
  );
}
