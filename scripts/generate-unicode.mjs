// Convert pinned Unicode 17.0 data to a compact, sorted lookup table.
// Usage: node scripts/generate-unicode.mjs DerivedName.txt NameAliases.txt
import { readFileSync, writeFileSync } from 'node:fs';

const [namesPath, aliasesPath] = process.argv.slice(2);
if (!namesPath || !aliasesPath) throw new Error('Provide DerivedName.txt and NameAliases.txt');
const namesSource = readFileSync(namesPath, 'utf8');
const aliasesSource = readFileSync(aliasesPath, 'utf8');
if (!namesSource.startsWith('# DerivedName-17.0.0.txt') || !aliasesSource.startsWith('# NameAliases-17.0.0.txt')) {
  throw new Error('Expected Unicode 17.0.0 source files');
}
const ranges = namesSource.split('\n').flatMap(line => {
  const content = line.split('#')[0].trim();
  if (!content) return [];
  const [range, name] = content.split(';').map(part => part.trim());
  const [start, end = start] = range.split('..').map(value => parseInt(value, 16));
  return [[start, end, name]];
});
const aliases = {};
for (const line of aliasesSource.split('\n')) {
  const [hex, name, type] = line.split('#')[0].split(';').map(part => part.trim());
  if (type === 'control' && !aliases[parseInt(hex, 16)]) aliases[parseInt(hex, 16)] = name;
}
writeFileSync(new URL('../site/data/unicode.json', import.meta.url), JSON.stringify({ version: '17.0.0', ranges, aliases }) + '\n');
console.log(`Generated ${ranges.length} name ranges and ${Object.keys(aliases).length} control names.`);
