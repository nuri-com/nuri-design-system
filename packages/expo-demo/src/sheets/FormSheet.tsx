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

type FormSheetProps = {
  open: boolean;
  values: {
    iban: string;
    firstName: string;
    secondName: string;
    reference: string;
  };
  onChangeField: (
    id: 'iban' | 'firstName' | 'secondName' | 'reference',
  ) => (value: string) => void;
  onClose: () => void;
};

function FormSheetFields({
  values,
  onChangeField,
}: Pick<FormSheetProps, 'values' | 'onChangeField'>) {
  return (
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
        </View>
      </View>
    </BottomSheetScroll>
  );
}

export function FormSheet({
  open,
  values,
  onChangeField,
  onClose,
}: FormSheetProps) {
  return (
    <BottomSheet open={open} detent="full" safeAreaBottom onOpenChange={(next) => !next && onClose()}>
      <BottomSheetPanel>
        <BottomSheetTopbar>
          <TopbarTrailing>
            <IconButton icon="cross" variant="soft" accessibilityLabel="Close form sheet" onPress={onClose} />
          </TopbarTrailing>
        </BottomSheetTopbar>

        <FormSheetFields values={values} onChangeField={onChangeField} />

        <BottomSheetFooter
          chrome="strong"
          direction="row"
          align="center"
          justify="end"
          paddingY="xs"
          paddingX="lg"
        >
          <Button size="sm" variant="solid" accent="lilac" onPress={onClose}>Next</Button>
        </BottomSheetFooter>
      </BottomSheetPanel>
    </BottomSheet>
  );
}

export function FormSheet2({
  open,
  values,
  onChangeField,
  onClose,
}: FormSheetProps) {
  return (
    <BottomSheet open={open} detent="full" safeAreaBottom onOpenChange={(next) => !next && onClose()}>
      <BottomSheetPanel>
        <BottomSheetTopbar>
          <TopbarTrailing>
            <IconButton icon="cross" variant="soft" accessibilityLabel="Close form sheet 2" onPress={onClose} />
          </TopbarTrailing>
        </BottomSheetTopbar>

        <FormSheetFields values={values} onChangeField={onChangeField} />

        <BottomSheetFooter
          chrome="canvas"
          direction="column"
          align="stretch"
          paddingBottom="sm"
          paddingX="lg"
        >
          <Button size="lg" variant="solid" accent="lilac" onPress={onClose}>Next</Button>
        </BottomSheetFooter>
      </BottomSheetPanel>
    </BottomSheet>
  );
}
