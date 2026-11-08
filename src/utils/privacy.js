/**
 * Privacy & PDPA Data Masking Utilities
 */

/**
 * Formats a 13-digit Thai National ID / Tax ID with standard hyphens:
 * X-XXXX-XXXXX-XX-X
 *
 * @param {string} val
 * @returns {string}
 */
export function formatTaxId(val) {
  if (!val) return '';
  const digits = String(val).replace(/\D/g, '').slice(0, 13);
  if (digits.length <= 1) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 1)}-${digits.slice(1)}`;
  if (digits.length <= 10) return `${digits.slice(0, 1)}-${digits.slice(1, 5)}-${digits.slice(5)}`;
  if (digits.length <= 12) return `${digits.slice(0, 1)}-${digits.slice(1, 5)}-${digits.slice(5, 10)}-${digits.slice(10)}`;
  return `${digits.slice(0, 1)}-${digits.slice(1, 5)}-${digits.slice(5, 10)}-${digits.slice(10, 12)}-${digits.slice(12, 13)}`;
}

/**
 * Masks a Thai Tax ID (13 digits), hiding the middle 5 digits with 'X' unless revealed.
 * Example for 1100201234567:
 * Revealed: "1-1002-01234-56-7"
 * Masked:   "1-1002-XXXXX-56-7"
 *
 * @param {string} val
 * @param {boolean} isRevealed
 * @returns {string}
 */
export function maskTaxId(val, isRevealed = false) {
  if (!val) return '';
  const digits = String(val).replace(/\D/g, '').slice(0, 13);
  if (digits.length === 0) return '';

  if (isRevealed) {
    return formatTaxId(digits);
  }

  if (digits.length < 13) {
    // For incomplete input: mask everything except the first digit
    return digits.split('').map((ch, i) => (i === 0 ? ch : 'X')).join('');
  }

  // Standard 13-digit masked pattern: 1-1002-XXXXX-56-7
  const p1 = digits.slice(0, 1);
  const p2 = digits.slice(1, 5);
  const p4 = digits.slice(10, 12);
  const p5 = digits.slice(12, 13);
  return `${p1}-${p2}-XXXXX-${p4}-${p5}`;
}
