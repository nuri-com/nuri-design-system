export type TextSelection = { start: number; end: number };

const clamp = (offset: number, length: number): number =>
  Math.max(0, Math.min(Number.isFinite(offset) ? offset : 0, length));

/**
 * Maps a selection through one contiguous edit inferred from the strings'
 * common prefix and suffix. The same mapping is used for sanitizer commands
 * and external prop rewrites, so neither path restores a stale caret verbatim.
 */
export function mapTextSelection(
  previousText: string,
  nextText: string,
  selection: TextSelection,
): TextSelection {
  let prefix = 0;
  const sharedLength = Math.min(previousText.length, nextText.length);
  while (prefix < sharedLength && previousText[prefix] === nextText[prefix]) prefix += 1;

  let suffix = 0;
  while (
    suffix < previousText.length - prefix &&
    suffix < nextText.length - prefix &&
    previousText[previousText.length - 1 - suffix] === nextText[nextText.length - 1 - suffix]
  ) {
    suffix += 1;
  }

  const previousChangedEnd = previousText.length - suffix;
  const nextChangedEnd = nextText.length - suffix;
  const delta = nextText.length - previousText.length;
  const changedPreviousText = previousChangedEnd > prefix;

  const mapOffset = (rawOffset: number): number => {
    const offset = clamp(rawOffset, previousText.length);
    if (offset < prefix || (changedPreviousText && offset === prefix)) return offset;
    if (offset >= previousChangedEnd) return clamp(offset + delta, nextText.length);
    return clamp(nextChangedEnd, nextText.length);
  };

  return {
    start: mapOffset(selection.start),
    end: mapOffset(selection.end),
  };
}
