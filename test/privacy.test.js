import test from 'node:test';
import assert from 'node:assert/strict';
import { formatTaxId, maskTaxId } from '../src/utils/privacy.js';

test('formatTaxId formats empty or partial strings defensively', () => {
  assert.equal(formatTaxId(''), '');
  assert.equal(formatTaxId(null), '');
  assert.equal(formatTaxId(undefined), '');
  assert.equal(formatTaxId('1'), '1');
  assert.equal(formatTaxId('11002'), '1-1002');
  assert.equal(formatTaxId('1100201234'), '1-1002-01234');
  assert.equal(formatTaxId('110020123456'), '1-1002-01234-56');
  assert.equal(formatTaxId('1100201234567'), '1-1002-01234-56-7');
});

test('formatTaxId ignores non-digit characters and caps at 13 digits', () => {
  assert.equal(formatTaxId('1-1002-01234-56-7'), '1-1002-01234-56-7');
  assert.equal(formatTaxId('110020123456799999'), '1-1002-01234-56-7');
});

test('maskTaxId masks middle 5 digits when isRevealed is false', () => {
  const rawId = '1100201234567';
  assert.equal(maskTaxId(rawId, false), '1-1002-XXXXX-56-7');
  assert.equal(maskTaxId(rawId), '1-1002-XXXXX-56-7'); // default false
});

test('maskTaxId returns unmasked formatted string when isRevealed is true', () => {
  const rawId = '1100201234567';
  assert.equal(maskTaxId(rawId, true), '1-1002-01234-56-7');
});

test('maskTaxId handles empty, null and partial inputs safely', () => {
  assert.equal(maskTaxId(''), '');
  assert.equal(maskTaxId(null), '');
  assert.equal(maskTaxId('123'), '1XX');
});
