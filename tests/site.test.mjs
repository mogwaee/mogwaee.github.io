import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { THEMES, initThemePicker } from '../js/themes.js';
import { displayBookmarks, loadBookmarks } from '../js/bookmarks.js';

const bookmarks = JSON.parse(await readFile(new URL('../res/bookmarks.json', import.meta.url)));

class Element {
  children = [];
  listeners = {};
  dataset = {};
  style = {};
  value = '';
  textContent = '';
  append(...children) { this.children.push(...children); }
  replaceChildren(...children) { this.children = children; }
  addEventListener(type, callback) { this.listeners[type] = callback; }
}

const setup = () => {
  const elements = new Map();
  globalThis.document = {
    documentElement: new Element(),
    createElement: () => new Element(),
    getElementById: (id) => {
      if (!elements.has(id)) elements.set(id, new Element());
      return elements.get(id);
    },
    querySelector: () => new Element(),
  };
  globalThis.Option = class {
    constructor(text, value) { this.textContent = text; this.value = value; }
  };
  const appearance = new Element();
  appearance.matches = true;
  globalThis.window = { matchMedia: () => appearance };
  globalThis.getComputedStyle = () => ({ getPropertyValue: () => '#bd93f9' });
  const saved = new Map();
  globalThis.localStorage = {
    getItem: (key) => saved.get(key) ?? null,
    setItem: (key, value) => saved.set(key, value),
  };
  return { get: document.getElementById, appearance, saved };
};

test('bookmark data has valid HTTP URLs and no duplicate names or URLs', () => {
  const names = new Set();
  const urls = new Set();
  for (const column of bookmarks) {
    for (const group of column.groups) {
      assert.ok(group.name.trim());
      for (const bookmark of group.bookmarks) {
        const name = bookmark.name.trim().toLowerCase();
        const url = new URL(bookmark.url);
        assert.ok(['http:', 'https:'].includes(url.protocol));
        assert.ok(name);
        assert.ok(!names.has(name), `Duplicate name: ${name}`);
        assert.ok(!urls.has(url.href), `Duplicate URL: ${url.href}`);
        names.add(name);
        urls.add(url.href);
      }
    }
  }
});

test('theme metadata and CSS palettes agree', async () => {
  const css = await readFile(new URL('../css/themes.css', import.meta.url), 'utf8');
  const ids = [...css.matchAll(/\[data-theme='([^']+)'\]/g)].map((match) => match[1]);
  assert.deepEqual(ids, THEMES.map((theme) => theme.id));
  assert.equal(new Set(ids).size, ids.length);
});

test('themes follow OS, update labels, persist explicit choices, and restore them', () => {
  const { get, appearance, saved } = setup();
  initThemePicker();
  assert.equal(get('current-theme-name').textContent, 'Catppuccin Mocha');
  appearance.matches = false;
  appearance.listeners.change();
  assert.equal(get('current-theme-name').textContent, 'Catppuccin Latte');
  for (const theme of THEMES) {
    get('theme-select').value = theme.id;
    get('theme-select').listeners.change();
    assert.equal(get('current-theme-name').textContent, theme.name);
    assert.equal(document.documentElement.style.colorScheme, theme.appearance);
    assert.equal(saved.get('ahead-start-theme'), theme.id);
    assert.equal(get('system-themes').hidden, true);
  }
  initThemePicker();
  assert.equal(get('theme-select').value, 'paper');
});

test('blocked storage does not prevent selecting a theme', () => {
  const { get } = setup();
  globalThis.localStorage = {
    getItem() { throw new Error('Blocked'); },
    setItem() { throw new Error('Blocked'); },
  };
  initThemePicker();
  get('theme-select').value = 'dracula';
  get('theme-select').listeners.change();
  assert.equal(get('current-theme-name').textContent, 'Dracula');
});

test('rendering preserves columns and treats names as text without duplicating output', () => {
  const { get } = setup();
  displayBookmarks(bookmarks);
  displayBookmarks(bookmarks);
  assert.equal(get('bookmark-columns').children.length, bookmarks.length);
  displayBookmarks([{ groups: [{ name: '<b>Group</b>', bookmarks: [{ name: '<b>Link</b>', url: 'https://example.com' }] }] }]);
  const group = get('bookmark-columns').children[0].children[0];
  assert.equal(group.children[0].textContent, '<b>Group</b>');
  const link = group.children[1].children[0].children[0];
  assert.equal(link.textContent, '<b>Link</b>');
  assert.equal(link.rel, 'noopener noreferrer');
});

test('failed bookmark requests show an error and a successful retry clears it', async () => {
  const { get } = setup();
  const originalError = console.error;
  const originalFetch = globalThis.fetch;
  try {
    console.error = () => {};
    globalThis.fetch = async () => ({ ok: false, status: 404 });
    await loadBookmarks();
    assert.equal(get('bookmark-status').hidden, false);
    globalThis.fetch = async () => ({ ok: true, json: async () => bookmarks });
    await loadBookmarks();
    assert.equal(get('bookmark-status').hidden, true);
    assert.equal(get('bookmark-columns').children.length, bookmarks.length);
  } finally {
    console.error = originalError;
    globalThis.fetch = originalFetch;
  }
});
