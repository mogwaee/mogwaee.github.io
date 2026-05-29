'use strict';

const THEME_STORAGE_KEY = 'ahead-start-theme';
const THEMES = [
  'dracula',
  'catppuccin-mocha',
  'synthwave',
  'paper',
];

const init = () => {
  //console.log("init");
  initThemePicker();
  loadBookmarks();
};

const initThemePicker = () => {
  const themeSelect = document.getElementById('theme-select');
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  const initialTheme = normalizeTheme(savedTheme);

  setTheme(initialTheme);

  if (!themeSelect) {
    return;
  }

  themeSelect.value = initialTheme;
  themeSelect.addEventListener('change', () => {
    setTheme(themeSelect.value);
    localStorage.setItem(THEME_STORAGE_KEY, themeSelect.value);
  });
};

const setTheme = (theme) => {
  const selectedTheme = normalizeTheme(theme);
  document.documentElement.dataset.theme = selectedTheme;

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
