export const THEMES = [
  { id: 'dracula', name: 'Dracula', appearance: 'dark' },
  { id: 'catppuccin-mocha', name: 'Catppuccin Mocha', appearance: 'dark' },
  { id: 'catppuccin-latte', name: 'Catppuccin Latte', appearance: 'light' },
  { id: 'synthwave', name: "SynthWave '84", appearance: 'dark' },
  { id: 'paper', name: 'Paper', appearance: 'light' },
];

// Storage can be unavailable in restricted browser contexts.
const readPreference = (key) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const savePreference = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    // Keep the selection working for the current page.
    console.warn('Unable to save theme preference:', error);
  }
};

const setTheme = (id) => {
  const theme = THEMES.find((theme) => theme.id === id) ?? THEMES[0];
  const root = document.documentElement;
  root.dataset.theme = theme.id;
  root.style.colorScheme = theme.appearance;
  document.getElementById('current-theme-name').textContent = theme.name;

  const color = getComputedStyle(root).getPropertyValue('--theme-color').trim();
  const meta = document.querySelector('meta[name="theme-color"]');
  if (color && meta) meta.content = color;
};

export const initThemePicker = () => {
  const themeSelect = document.getElementById('theme-select');
  const darkSelect = document.getElementById('dark-theme-select');
  const lightSelect = document.getElementById('light-theme-select');
  const systemThemes = document.getElementById('system-themes');
  const osAppearance = window.matchMedia('(prefers-color-scheme: dark)');
  const choices = [
    { select: themeSelect, key: 'ahead-start-theme', fallback: 'system', themes: THEMES },
    { select: darkSelect, key: 'ahead-start-dark-theme', fallback: 'catppuccin-mocha', themes: THEMES.filter((theme) => theme.appearance === 'dark') },
    { select: lightSelect, key: 'ahead-start-light-theme', fallback: 'catppuccin-latte', themes: THEMES.filter((theme) => theme.appearance === 'light') },
  ];

  const applySelection = () => {
    const followOS = themeSelect.value === 'system';
    systemThemes.hidden = !followOS;
    setTheme(followOS
      ? (osAppearance.matches ? darkSelect.value : lightSelect.value)
      : themeSelect.value);
  };

  for (const { select, key, fallback, themes } of choices) {
    const options = themes.map(({ name, id }) => new Option(name, id));
    if (select === themeSelect) options.unshift(new Option('Follow OS', 'system'));
    select.replaceChildren(...options);
    const saved = readPreference(key);
    select.value = options.some((option) => option.value === saved) ? saved : fallback;
    select.addEventListener('change', () => {
      savePreference(key, select.value);
      applySelection();
    });
  }

  osAppearance.addEventListener('change', applySelection);
  applySelection();
};

export const initThemeMenu = () => {
  const menu = document.querySelector('.theme-menu');
  document.addEventListener('click', (event) => {
    if (!menu.contains(event.target)) menu.open = false;
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menu.open) {
      menu.open = false;
      menu.querySelector('summary').focus();
    }
  });
};
