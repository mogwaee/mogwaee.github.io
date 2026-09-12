'use strict';

const THEME_STORAGE_KEY = 'ahead-start-theme';
const THEMES = [
  'dracula',
  'catppuccin-mocha',
  'catppuccin-latte',
  'synthwave',
  'paper',
];

const init = () => {
  //console.log("init");
  initThemePicker();
  const themeMenu = document.querySelector('.theme-menu');
  document.addEventListener('click', (event) => {
    if (!themeMenu.contains(event.target)) themeMenu.open = false;
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && themeMenu.open) {
      themeMenu.open = false;
      themeMenu.querySelector('summary').focus();
    }
  });
  loadBookmarks();
};

const initThemePicker = () => {
  const themeSelect = document.getElementById('theme-select');
  const systemThemes = document.getElementById('system-themes');
  const darkSelect = document.getElementById('dark-theme-select');
  const lightSelect = document.getElementById('light-theme-select');
  const osAppearance = window.matchMedia('(prefers-color-scheme: dark)');
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);

  themeSelect.value = savedTheme === 'system' || !savedTheme
    ? 'system'
    : normalizeTheme(savedTheme);

  const restoreChoice = (select, key, fallback) => {
    const saved = localStorage.getItem(key);
    select.value = Array.from(select.options).some((option) => option.value === saved)
      ? saved : fallback;
  };
  restoreChoice(darkSelect, 'ahead-start-dark-theme', 'catppuccin-mocha');
  restoreChoice(lightSelect, 'ahead-start-light-theme', 'catppuccin-latte');

  const applySelection = () => {
    const followOS = themeSelect.value === 'system';
    systemThemes.hidden = !followOS;
    setTheme(followOS
      ? (osAppearance.matches ? darkSelect.value : lightSelect.value)
      : themeSelect.value);
  };

  themeSelect.addEventListener('change', () => {
    localStorage.setItem(THEME_STORAGE_KEY, themeSelect.value);
    applySelection();
  });
  for (const [select, key] of [
    [darkSelect, 'ahead-start-dark-theme'],
    [lightSelect, 'ahead-start-light-theme'],
  ]) {
    select.addEventListener('change', () => {
      localStorage.setItem(key, select.value);
      applySelection();
    });
  }
  osAppearance.addEventListener('change', applySelection);
  applySelection();
};

const setTheme = (theme) => {
  const selectedTheme = normalizeTheme(theme);
  document.documentElement.dataset.theme = selectedTheme;
  document.documentElement.style.colorScheme =
    ['catppuccin-latte', 'paper'].includes(selectedTheme) ? 'light' : 'dark';

  const themeColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--theme-color')
    .trim();
  const themeColorMeta = document.querySelector('meta[name="theme-color"]');

  if (themeColor && themeColorMeta) {
    themeColorMeta.setAttribute('content', themeColor);
  }
};

const normalizeTheme = (theme) => {
  return THEMES.includes(theme) ? theme : 'dracula';
};

const loadBookmarks = () => {
  fetch('../res/bookmarks.json')
    .then((res) => res.json())
    .then((data) => {
      //console.log(data);
      displayBookmarks(data);
    })
    .catch((err) => console.error(err));
};

//const createGroup = () => {};

const displayBookmarks = (bookmarks) => {
  let colCount = 0;
  for (const column of bookmarks) {
    colCount++;
    //console.log('**Column**: ' + colCount);
    for (const group of column.groups) {
      //console.log('**Group**: ' + group.name);
      let newGroup = document.createElement('div');
      newGroup.classList.add('group');
      let newTitle = document.createElement('h2');
      newTitle.classList.add('group-name');
      newTitle.innerHTML = group.name;
      newGroup.appendChild(newTitle);

      let newOl = document.createElement('ol');
      newOl.classList.add('bookmarks');
      for (const bookmark of group.bookmarks) {
        //console.log(bookmark.name);
        let newLi = document.createElement('li');
        newLi.classList.add('bookmark');
        newOl.appendChild(newLi);
        let newA = document.createElement('a');
        newA.setAttribute('href', bookmark.url);
        newA.setAttribute('target', '_blank');
        newA.innerHTML = bookmark.name;
        newLi.appendChild(newA);
      }
      newGroup.appendChild(newOl);

      let column = document.getElementById('col' + colCount);
      column.appendChild(newGroup);
    }
  }
  //console.log(bookmarks[0].groups[0].name);
};

window.onload = init();
