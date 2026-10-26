import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describeCharacter, unicodeName } from '../site/characters.mjs';

const data = JSON.parse(readFileSync(new URL('../site/data/unicode.json', import.meta.url)));
const describe = character => describeCharacter(character, data);

test('ASCII and visually similar Unicode characters retain distinct identities', () => {
  assert.equal(describe('a').ascii, 97);
  assert.equal(describe('а').ascii, null);
  assert.equal(describe('а').name, 'CYRILLIC SMALL LETTER A');
  assert.deepEqual(Array.from('-–—−', character => describe(character).code), [45, 8211, 8212, 8722]);
  assert.equal(describe('−').name, 'MINUS SIGN');
  assert.equal(describe('\x7f').ascii, 127);
  assert.equal(describe('\x80').ascii, null);
});

test('whitespace, controls, bidi overrides and invisible marks get visible labels', () => {
  assert.equal(describe(' ').display, 'SPACE');
  assert.equal(describe('\t').name, 'CHARACTER TABULATION');
  assert.equal(describe('\n').display, 'LF');
  assert.equal(describe('\r').display, 'CR');
  assert.equal(describe('\u00A0').display, 'NBSP');
  assert.equal(describe('\u200B').display, 'ZWSP');
  assert.equal(describe('\u202E').hidden, true);
  assert.equal(describe('\uFE0F').kind, 'Invisible');
});

test('accents and emoji are inspected by code point, without normalization', () => {
  assert.equal(Array.from('é').length, 1);
  assert.equal(Array.from('e\u0301').length, 2);
  assert.equal(describe('\u0301').name, 'COMBINING ACUTE ACCENT');
  assert.equal(describe('\u0301').display, '◌\u0301');
  assert.equal(describe('😀').unicode, 'U+1F600');
  assert.equal(describe('😀').name, 'GRINNING FACE');
  assert.equal(Array.from('👩‍💻').length, 3);
});

test('derived names and undefined code points have accurate descriptions', () => {
  assert.equal(unicodeName(0x4E00, data), 'CJK UNIFIED IDEOGRAPH-4E00');
  assert.equal(unicodeName(0xAC00, data), 'HANGUL SYLLABLE GA');
  assert.equal(unicodeName(0xE000, data), 'PRIVATE USE — NO STANDARD NAME');
  assert.equal(unicodeName(0xFFFF, data), 'NONCHARACTER');
  assert.equal(unicodeName(0x10FFFF, data), 'NONCHARACTER');
  assert.equal(unicodeName(0xD800, data), 'UNPAIRED SURROGATE — INVALID UNICODE');
  assert.equal(unicodeName(0x0378, data), 'UNASSIGNED IN UNICODE 17.0.0');
});

test('bundled name ranges are ordered and never overlap', () => {
  assert.equal(data.version, '17.0.0');
  assert.ok(data.ranges.length > 40000);
  let previous = -1;
  for (const [start, end, name] of data.ranges) {
    assert.ok(start > previous && end >= start && end <= 0x10FFFF);
    assert.ok(name.length > 0);
    previous = end;
  }
});
