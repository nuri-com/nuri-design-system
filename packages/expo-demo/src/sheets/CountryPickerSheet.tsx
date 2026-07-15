/*
 * PATTERN NOTES · COUNTRY PICKER
 * Consumer state: open picker, query, filtered rows, the selected country, and
 * editable phone prefix/number values.
 * Design system: every visible element; this file owns only example data and state.
 * Accessibility: SelectField is a disclosure button to a dialog. Overlay close is
 * expected to return focus to the invoking trigger; no app-local focus override is
 * added. Each search field receives focus from Modal.onOpenComplete.
 */

import * as React from 'react';
import type { ImageSourcePropType } from 'react-native';

import {
  Header,
  IconButton,
  List,
  ListAction,
  ListActionLeadingAvatar,
  ListActionText,
  ListActionTextMuted,
  Modal,
  ModalPanel,
  Scroll,
  SelectField,
  SelectFieldAvatar,
  SelectFieldChevron,
  SelectFieldLabel,
  SelectFieldValue,
  Text,
  TextField,
  TextFieldIconButton,
  TextFieldLabel,
  Topbar,
  TopbarCenter,
  TopbarContent,
  TopbarLeading,
  TopbarTrailing,
  View,
} from '@ds';
import type { TextFieldHandle } from '@ds';

type Country = {
  code: string;
  name: string;
  dial: string;
  flag: ImageSourcePropType;
};

const COUNTRIES: Country[] = [
  { code: 'DE', name: 'Germany', dial: '+49', flag: require('../../assets/flags/deu.png') },
  { code: 'AT', name: 'Austria', dial: '+43', flag: require('../../assets/flags/aut.png') },
  { code: 'AU', name: 'Australia', dial: '+61', flag: require('../../assets/flags/aus.png') },
  { code: 'PL', name: 'Poland', dial: '+48', flag: require('../../assets/flags/pol.png') },
  { code: 'UA', name: 'Ukraine', dial: '+380', flag: require('../../assets/flags/ukr.png') },
  { code: 'FR', name: 'France', dial: '+33', flag: require('../../assets/flags/fra.png') },
  { code: 'IT', name: 'Italy', dial: '+39', flag: require('../../assets/flags/ita.png') },
  { code: 'ES', name: 'Spain', dial: '+34', flag: require('../../assets/flags/esp.png') },
];

const INITIAL_COUNTRY = COUNTRIES[0];

const matches = (label: string, dial: string, query: string) => {
  const needle = query.trim().toLocaleLowerCase();
  return needle.length === 0 || label.toLocaleLowerCase().includes(needle) || dial.includes(needle);
};

export function CountryPickerSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [country, setCountry] = React.useState(INITIAL_COUNTRY);
  const [prefix, setPrefix] = React.useState(INITIAL_COUNTRY.dial);
  const [countryPickerOpen, setCountryPickerOpen] = React.useState(false);
  const [countryQuery, setCountryQuery] = React.useState('');
  const countrySearchRef = React.useRef<TextFieldHandle>(null);

  const filteredCountries = COUNTRIES.filter((item) => matches(item.name, item.dial, countryQuery));

  const closeCountryPicker = React.useCallback(() => {
    setCountryPickerOpen(false);
    setCountryQuery('');
  }, []);
  return (
    <>
      <Modal open={open} mode="full" onOpenChange={(next) => !next && onClose()}>
        <ModalPanel>
          <Header safeAreaTop>
            <Topbar surface="transparent">
              <TopbarLeading>
                <IconButton icon="chevron-left" variant="soft" accessibilityLabel="Back" onPress={onClose} />
              </TopbarLeading>
              <TopbarCenter>
                <Text size="lg" emphasis>Verify Phone</Text>
              </TopbarCenter>
              <TopbarTrailing>
                <IconButton icon="cross" variant="soft" accessibilityLabel="Close" onPress={onClose} />
              </TopbarTrailing>
            </Topbar>
          </Header>

          <Scroll safeAreaBottom>
            <View
              direction="column"
              align="stretch"
              justify="start"
              gap="xl"
              paddingX="lg"
              paddingTop="xl"
              paddingBottom="lg"
            >
              <SelectField
                accessibilityLabel="Country"
                accessibilityValue={country.name}
                onPress={() => setCountryPickerOpen(true)}
              >
                <SelectFieldLabel>Country</SelectFieldLabel>
                <SelectFieldAvatar source={country.flag} />
                <SelectFieldValue>{country.name}</SelectFieldValue>
                <SelectFieldChevron name="chevron-down" />
              </SelectField>

              <View direction="row" align="end" gap="md">
                <View width="2xl">
                  <TextField inputMode="tel" value={prefix} onChangeText={setPrefix}>
                    <TextFieldLabel>Prefix</TextFieldLabel>
                  </TextField>
                </View>
                <View fill="grow-shrink">
                  <TextField inputMode="tel" placeholder="151 23456789">
                    <TextFieldLabel>Phone number</TextFieldLabel>
                  </TextField>
                </View>
              </View>
            </View>
          </Scroll>
        </ModalPanel>
      </Modal>

      {/* Country selection: consumer query/filter/selection/open state. */}
      <Modal
        open={countryPickerOpen}
        mode="full"
        onOpenChange={(next) => !next && closeCountryPicker()}
        onOpenComplete={() => countrySearchRef.current?.focus()}
      >
        <ModalPanel>
          <Header safeAreaTop chrome="canvas">
            <Topbar layout="fluid">
              <TopbarLeading>
                <IconButton
                  icon="chevron-left"
                  variant="soft"
                  accessibilityLabel="Back to verify phone"
                  onPress={closeCountryPicker}
                />
              </TopbarLeading>
              <TopbarContent>
                <TextField
                  ref={countrySearchRef}
                  size="md"
                  accessibilityLabel="Search countries"
                  value={countryQuery}
                  onChangeText={setCountryQuery}
                  placeholder="Search"
                >
                  <TextFieldIconButton
                    name="cross-circle"
                    accessibilityLabel="Clear country search"
                    onPress={() => setCountryQuery('')}
                  />
                </TextField>
              </TopbarContent>
            </Topbar>
          </Header>

          <Scroll safeAreaBottom>
            <View paddingTop="sm">
              <List>
                {filteredCountries.map((item) => (
                  <ListAction
                    key={item.code}
                    accessibilityLabel={`${item.name}, ${item.dial}`}
                    onPress={() => {
                      setCountry(item);
                      setPrefix(item.dial);
                      closeCountryPicker();
                    }}
                  >
                    <ListActionLeadingAvatar source={item.flag} />
                    <ListActionText>{item.name}</ListActionText>
                    <ListActionTextMuted>{item.dial}</ListActionTextMuted>
                  </ListAction>
                ))}
              </List>
            </View>
          </Scroll>
        </ModalPanel>
      </Modal>

    </>
  );
}
