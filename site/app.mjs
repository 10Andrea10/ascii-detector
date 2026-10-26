import { describeCharacter, PAGE_SIZE } from './characters.mjs';

const input = document.querySelector('#text-input');
const rows = document.querySelector('#character-rows');
const clear = document.querySelector('#clear');
const more = document.querySelector('#show-more');
const status = document.querySelector('#load-status');
const retry = document.querySelector('#retry');
const results = document.querySelector('.results');
let data;
let characters = [];
let visible = PAGE_SIZE;
let frame;

const examples = {
  lookalikes: 'aа AА oо 0O 1lI',
  dashes: '- – — −',
  spaces: 'a b\na\u00A0b\na\u200Bb\na\tb',
};

function cell(text, className) {
  const element = document.createElement('td');
  element.textContent = text;
  if (className) element.className = className;
  return element;
}

function renderRows() {
  if (!data) return;
  const fragment = document.createDocumentFragment();
  for (let index = 0; index < Math.min(visible, characters.length); index++) {
    const item = describeCharacter(characters[index], data);
    const row = document.createElement('tr');
    if (item.ascii === null) row.className = 'non-ascii';
    row.append(cell(index + 1));
    const glyphCell = cell('');
    const glyph = document.createElement('bdi');
    glyph.className = 'glyph' + (item.hidden ? ' hidden-glyph' : '');
    glyph.textContent = item.display;
    glyph.title = item.name;
    glyphCell.append(glyph);
    row.append(glyphCell);
    const ascii = cell(item.ascii === null ? '—' : item.ascii);
    if (item.ascii === null) {
      ascii.className = 'not-ascii';
      ascii.setAttribute('aria-label', 'Not ASCII');
    }
    row.append(ascii, cell(item.unicode));
    const name = cell(item.name, 'character-name');
    if (item.kind) {
      const kind = document.createElement('span');
      kind.className = 'kind';
      kind.textContent = item.kind;
      name.append(kind);
    }
    row.append(name);
    fragment.append(row);
  }
  rows.replaceChildren(fragment);
  const shown = Math.min(visible, characters.length);
  document.querySelector('#shown-count').textContent = `Showing ${shown.toLocaleString()} of ${characters.length.toLocaleString()} code points`;
  more.hidden = shown >= characters.length;
}

function update() {
  characters = Array.from(input.value);
  visible = PAGE_SIZE;
  clear.disabled = !characters.length;
  const count = characters.length;
  document.querySelector('#count').textContent = `${count.toLocaleString()} code point${count === 1 ? '' : 's'}`;
  document.querySelector('#empty').hidden = count > 0;
  document.querySelector('#results-content').hidden = !count || !data;
  let ascii = 0;
  for (const character of characters) if (character.codePointAt(0) <= 127) ascii++;
  document.querySelector('#ascii-count').textContent = ascii.toLocaleString();
  document.querySelector('#unicode-count').textContent = (count - ascii).toLocaleString();
  renderRows();
}

input.addEventListener('input', () => {
  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(update);
});
clear.addEventListener('click', () => {
  input.value = '';
  update();
  input.focus();
});
document.querySelectorAll('[data-example]').forEach(button => {
  button.addEventListener('click', () => {
    input.value = examples[button.dataset.example];
    update();
    input.focus();
  });
});
more.addEventListener('click', () => {
  const firstNew = Math.min(visible, characters.length);
  visible += PAGE_SIZE;
  renderRows();
  // Keep keyboard focus in the newly revealed results when the button disappears.
  const nextRow = rows.children[firstNew];
  if (nextRow) {
    nextRow.tabIndex = -1;
    nextRow.focus({ preventScroll: true });
  }
});

async function loadNames() {
  retry.hidden = true;
  status.hidden = false;
  status.textContent = 'Loading character names…';
  results.setAttribute('aria-busy', 'true');
  try {
    const response = await fetch(new URL('./data/unicode.json', import.meta.url));
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const loaded = await response.json();
    if (!Array.isArray(loaded.ranges) || !loaded.aliases || !loaded.version) throw new Error('Invalid Unicode data');
    data = loaded;
    status.textContent = 'Character names ready.';
    status.hidden = true;
    update();
  } catch {
    status.textContent = 'Couldn’t load character names. Check your connection and try again. Your text is still here.';
    retry.hidden = false;
  } finally {
    results.setAttribute('aria-busy', 'false');
  }
}
retry.addEventListener('click', loadNames);
update();
loadNames();
