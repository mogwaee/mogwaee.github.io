import { loadBookmarks } from './bookmarks.js';
import { initThemeMenu, initThemePicker } from './themes.js';

// Module scripts run after the HTML has been parsed.
initThemePicker();
initThemeMenu();
loadBookmarks();
