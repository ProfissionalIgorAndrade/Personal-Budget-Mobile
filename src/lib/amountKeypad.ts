const MAX_DIGITS = 11; // up to R$ 999.999.999,99

const onlyDigits = (text: string) => text.replace(/\D/g, '');

// Bank-app keypad behavior for a currency field, independent of where the
// caret is: typed digits always enter on the right (1, 2, 3 -> R$ 1,23) and
// deleting removes the last digit. The edit is found by diffing the previous
// and the new text, so a tap in the middle of the field cannot insert digits
// in the middle of the number.
export function nextCents(previousText: string, newText: string, previousCents: number): number {
  let prefix = 0;
  while (prefix < previousText.length && prefix < newText.length && previousText[prefix] === newText[prefix]) prefix++;
  let suffix = 0;
  while (
    suffix < previousText.length - prefix &&
    suffix < newText.length - prefix &&
    previousText[previousText.length - 1 - suffix] === newText[newText.length - 1 - suffix]
  ) {
    suffix++;
  }

  const removed = previousText.slice(prefix, previousText.length - suffix);
  const inserted = newText.slice(prefix, newText.length - suffix);

  // Whole text replaced (paste, autofill): take the digits as typed.
  if (prefix === 0 && suffix === 0) {
    const pasted = onlyDigits(newText).replace(/^0+/, '').slice(0, MAX_DIGITS);
    return pasted ? Number(pasted) : 0;
  }

  let digits = previousCents > 0 ? String(previousCents) : '';
  const removedDigits = onlyDigits(removed).length;
  // Deleting a separator ("," or ".") counts as deleting one digit.
  const toDrop = removedDigits > 0 ? removedDigits : removed.length > 0 && !inserted ? 1 : 0;
  digits = digits.slice(0, Math.max(0, digits.length - toDrop));
  digits = (digits + onlyDigits(inserted)).replace(/^0+/, '').slice(0, MAX_DIGITS);
  return digits ? Number(digits) : 0;
}
