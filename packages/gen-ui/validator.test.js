import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validate } from './validator.js';

const validTree = {
  type: 'Card',
  props: { padding: 'lg' },
  children: [
    { type: 'Spinner', props: { size: 'sm' } },
    {
      type: 'InputField',
      props: { value: '', onChangeText: 'fn' },
      children: [],
    },
  ],
};

test('accepts a valid tree', () => {
  assert.deepEqual(validate(validTree), []);
});

test('rejects unknown component', () => {
  const tree = { type: 'MagicBox', props: {} };
  const errors = validate(tree);
  assert.equal(errors.length, 1);
  assert.match(errors[0], /unknown component "MagicBox"/);
});

test('rejects unknown prop', () => {
  const tree = { type: 'Button', props: { label: 'Hi', onPress: 'fn', color: 'red' } };
  const errors = validate(tree);
  assert.equal(errors.length, 1);
  assert.match(errors[0], /unknown prop "color"/);
});

test('rejects missing required prop', () => {
  const tree = { type: 'Button', props: { variant: 'secondary' } };
  const errors = validate(tree);
  assert.ok(errors.some((e) => /missing required prop "label"/.test(e)));
  assert.ok(errors.some((e) => /missing required prop "onPress"/.test(e)));
});

test('rejects unknown component nested in children', () => {
  const tree = {
    type: 'Card',
    children: [{ type: 'Gizmo', props: {} }],
  };
  const errors = validate(tree);
  assert.ok(errors.some((e) => /unknown component "Gizmo"/.test(e)));
});

test('rejects unknown prop nested in children', () => {
  const tree = {
    type: 'ModalSheet',
    props: { visible: true, onClose: 'fn' },
    children: [{ type: 'Spinner', props: { speed: 'fast' } }],
  };
  const errors = validate(tree);
  assert.ok(errors.some((e) => /unknown prop "speed"/.test(e)));
});

test('rejects malformed node', () => {
  const errors = validate({ props: {} });
  assert.ok(errors.some((e) => /invalid node/.test(e)));
});

test('rejects non-array children', () => {
  const errors = validate({ type: 'Card', children: 'not-an-array' });
  assert.ok(errors.some((e) => /children must be an array/.test(e)));
});

test('accepts string leaf children', () => {
  const tree = { type: 'Card', children: ['hello'] };
  assert.deepEqual(validate(tree), []);
});
