import * as React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
  };
  onChangeField: (
    id: 'iban' | 'firstName' | 'secondName' | 'reference',
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
            </View>
          </View>
        </BottomSheetScroll>

        <BottomSheetFooter>
          <View chrome="strong" direction="column" align="stretch" paddingY="sm" paddingX="lg">
            <SafeAreaView edges={['bottom']} style={styles.footerSafeArea}>
              <View direction="row" align="center" justify="end">
                <Button size="sm" variant="solid" accent="lilac" onPress={onClose}>Next</Button>
              </View>
            </SafeAreaView>
          </View>
        </BottomSheetFooter>
      </BottomSheetPanel>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  footerSafeArea: {
    width: '100%',
  },
});
