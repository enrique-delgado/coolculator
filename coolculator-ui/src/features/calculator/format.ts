const SIGNIFICANT_DIGITS = 12;
export const MAX_INPUT_LENGTH = 15;

// Turns a computed result into a display string: integers print exactly,
// everything else is trimmed to a sane number of significant digits and
// stripped of the trailing-zero noise floating point arithmetic tends to
// leave behind (e.g. 0.1 + 0.2).
export function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return "Error";
  if (Number.isInteger(value) && Math.abs(value) < 1e15) {
    return value.toString();
  }
  return parseFloat(value.toPrecision(SIGNIFICANT_DIGITS)).toString();
}
