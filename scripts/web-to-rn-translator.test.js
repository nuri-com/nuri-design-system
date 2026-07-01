import test from 'node:test';
import assert from 'node:assert/strict';

import { nuriTagToRnName, translateWebToRn } from './web-to-rn-translator.js';

test('web-to-rn translator · deterministic component and slot tag names', () => {
  assert.equal(nuriTagToRnName('nuri-topbar-leading'), 'TopbarLeading');
  assert.equal(nuriTagToRnName('nuri-button-text'), 'ButtonText');
});

test('web-to-rn translator · Button slot attrs and ordered children survive', () => {
  const web = '<nuri-button><nuri-button-text>Buy Bitcoin</nuri-button-text><nuri-button-icon name="apple"></nuri-button-icon><nuri-button-text>Pay</nuri-button-text></nuri-button>';
  assert.equal(
    translateWebToRn(web),
    '<Button><ButtonText>Buy Bitcoin</ButtonText><ButtonIcon name="apple"></ButtonIcon><ButtonText>Pay</ButtonText></Button>',
  );
});

test('web-to-rn translator · self-closing slot attrs map directly', () => {
  assert.equal(
    translateWebToRn('<nuri-button-icon name="apple" />'),
    '<ButtonIcon name="apple" />',
  );
});
