/**
 * Shared utility for number input validation and sanitization
 */

export const INVALID_NUMERIC_KEYS = ['-', '+', 'e', 'E'];

/**
 * Checks if a key character should be blocked from numeric inputs.
 * @param {string} key 
 * @returns {boolean}
 */
export function isInvalidNumericKey(key) {
  return INVALID_NUMERIC_KEYS.includes(key);
}

/**
 * Event handler to prevent default keydown for invalid numeric characters.
 * @param {KeyboardEvent} e 
 */
export function blockInvalidChars(e) {
  if (isInvalidNumericKey(e.key)) {
    e.preventDefault();
  }
}

/**
 * Parses and sanitizes a numerical input value, ensuring it is non-negative and capped.
 * @param {any} val 
 * @param {number} max 
 * @returns {number}
 */
export function sanitizeNumericInput(val, max = 999999999) {
  if (val === '' || val === null || val === undefined) {
    return 0;
  }
  const cleanVal = typeof val === 'string' ? val.replace(/,/g, '') : val;
  const num = Number(cleanVal);
  if (isNaN(num) || num < 0) {
    return 0;
  }
  return Math.min(num, max);
}

/**
 * Formats a numeric value or string with thousand separators (commas).
 * Preserves decimal points if typed.
 * @param {number|string} val
 * @returns {string}
 */
export function formatNumberWithCommas(val) {
  if (val === '' || val === null || val === undefined || val === 0) {
    return '';
  }
  const str = String(val).replace(/,/g, '');
  const parts = str.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
}

/**
 * Parses user input containing commas back to a clean number.
 * @param {string|number} val
 * @param {number} max
 * @returns {number}
 */
export function parseFormattedNumber(val, max = 999999999) {
  return sanitizeNumericInput(val, max);
}
