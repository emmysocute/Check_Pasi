import test from 'node:test';
import assert from 'node:assert/strict';
import { isInvalidNumericKey, blockInvalidChars, sanitizeNumericInput } from '../src/utils/numberInput.js';

test('isInvalidNumericKey blocks -, +, e, E', () => {
  assert.equal(isInvalidNumericKey('-'), true);
  assert.equal(isInvalidNumericKey('+'), true);
  assert.equal(isInvalidNumericKey('e'), true);
  assert.equal(isInvalidNumericKey('E'), true);
  assert.equal(isInvalidNumericKey('1'), false);
  assert.equal(isInvalidNumericKey('.'), false);
  assert.equal(isInvalidNumericKey('Backspace'), false);
});

test('blockInvalidChars calls preventDefault for invalid keys', () => {
  let prevented = false;
  const mockEvent = {
    key: '-',
    preventDefault: () => { prevented = true; }
  };
  blockInvalidChars(mockEvent);
  assert.equal(prevented, true);

  prevented = false;
  const validEvent = {
    key: '5',
    preventDefault: () => { prevented = true; }
  };
  blockInvalidChars(validEvent);
  assert.equal(prevented, false);
});

test('sanitizeNumericInput handles empty, null, and non-numeric inputs', () => {
  assert.equal(sanitizeNumericInput(''), 0);
  assert.equal(sanitizeNumericInput(null), 0);
  assert.equal(sanitizeNumericInput(undefined), 0);
  assert.equal(sanitizeNumericInput('abc'), 0);
  assert.equal(sanitizeNumericInput('-500'), 0);
});

test('sanitizeNumericInput clamps to max and returns valid numbers', () => {
  assert.equal(sanitizeNumericInput('50000'), 50000);
  assert.equal(sanitizeNumericInput(120000), 120000);
  assert.equal(sanitizeNumericInput('1000000000', 999999999), 999999999);
  assert.equal(sanitizeNumericInput('150000', 100000), 100000);
});
