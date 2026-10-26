export const PAGE_SIZE = 200;

export function unicodeName(code, data) {
  if (data.aliases[code]) return data.aliases[code];
  let low = 0;
  let high = data.ranges.length - 1;
  while (low <= high) {
    const middle = (low + high) >>> 1;
    const [start, end, name] = data.ranges[middle];
    if (code < start) high = middle - 1;
    else if (code > end) low = middle + 1;
    else return name.replace('*', code.toString(16).toUpperCase().padStart(4, '0'));
  }
  if ((code >= 0xFDD0 && code <= 0xFDEF) || (code & 0xFFFF) >= 0xFFFE) return 'NONCHARACTER';
  if ((code >= 0xE000 && code <= 0xF8FF) || (code >= 0xF0000 && code <= 0xFFFFD) || (code >= 0x100000 && code <= 0x10FFFD)) return 'PRIVATE USE — NO STANDARD NAME';
  if (code >= 0xD800 && code <= 0xDFFF) return 'UNPAIRED SURROGATE — INVALID UNICODE';
  return 'UNASSIGNED IN UNICODE ' + data.version;
}

const labels = new Map([
  [0, 'NUL'], [9, 'TAB'], [10, 'LF'], [13, 'CR'], [32, 'SPACE'],
  [127, 'DEL'], [160, 'NBSP'], [0x200B, 'ZWSP'], [0x200C, 'ZWNJ'],
  [0x200D, 'ZWJ'], [0x202F, 'NNBSP'], [0x2060, 'WJ'], [0xFEFF, 'BOM'],
]);

export function describeCharacter(character, data) {
  const code = character.codePointAt(0);
  let kind = '';
  if (/\p{Cc}/u.test(character)) kind = 'Control';
  else if (/\p{Z}/u.test(character)) kind = 'Space';
  else if (/[\p{Cf}\p{Default_Ignorable_Code_Point}]/u.test(character)) kind = 'Invisible';
  else if (/\p{M}/u.test(character)) kind = 'Combining mark';
  const name = unicodeName(code, data);
  const hidden = ['Control', 'Space', 'Invisible'].includes(kind) || name.startsWith('UNPAIRED SURROGATE');
  return {
    character, code, name, kind,
    unicode: 'U+' + code.toString(16).toUpperCase().padStart(4, '0'),
    ascii: code <= 127 ? code : null,
    hidden,
    display: hidden ? (labels.get(code) || kind.toUpperCase() || 'INVALID') : kind === 'Combining mark' ? '\u25CC' + character : character,
  };
}
