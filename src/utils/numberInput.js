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
  const num = Number(val);
  if (isNaN(num) || num < 0) {
    return 0;
  }
  return Math.min(num, max);
}
