import { mapTextSelection } from '../runtime/text-selection-map';

describe('mapTextSelection', () => {
  test.each([
    ['insert before caret', 'abcd', 'abXcd', { start: 3, end: 3 }, { start: 4, end: 4 }],
    ['delete after caret', 'abcdef', 'abcef', { start: 3, end: 3 }, { start: 3, end: 3 }],
    ['replacement spanning caret', 'abcdef', 'abXYef', { start: 3, end: 3 }, { start: 4, end: 4 }],
    ['full uppercase', 'abc', 'ABC', { start: 2, end: 2 }, { start: 3, end: 3 }],
    ['clamping', 'abc', 'a', { start: -5, end: 99 }, { start: 0, end: 1 }],
    ['non-collapsed selection', 'abcdef', 'abXYZef', { start: 1, end: 5 }, { start: 1, end: 6 }],
  ])('%s', (_name, previous, next, selection, expected) => {
    expect(mapTextSelection(previous, next, selection)).toEqual(expected);
  });
});
