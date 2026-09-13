const createBookmark = ({ name, url }) => {
  const item = document.createElement('li');
  item.className = 'bookmark';
  const link = document.createElement('a');
  link.textContent = name;
  link.href = url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  item.append(link);
  return item;
};

const createGroup = ({ name, bookmarks }) => {
  const group = document.createElement('div');
  group.className = 'group';
  const heading = document.createElement('h2');
  heading.className = 'group-name';
  heading.textContent = name;
  const list = document.createElement('ol');
  list.className = 'bookmarks';
  list.append(...bookmarks.map(createBookmark));
  group.append(heading, list);
  return group;
};

export const displayBookmarks = (bookmarks) => {
  const columns = bookmarks.map(({ groups }) => {
    const column = document.createElement('div');
    column.className = 'cols';
    column.append(...groups.map(createGroup));
    return column;
  });
  document.getElementById('bookmark-columns').replaceChildren(...columns);
};

export const loadBookmarks = async () => {
  const status = document.getElementById('bookmark-status');
  status.hidden = true;
  try {
    const response = await fetch(new URL('../res/bookmarks.json', import.meta.url));
    if (!response.ok) throw new Error(`Bookmark request failed: ${response.status}`);
    displayBookmarks(await response.json());
  } catch (error) {
    status.textContent = 'Bookmarks could not be loaded. Please refresh to try again.';
    status.hidden = false;
    console.error('Unable to load bookmarks:', error);
  }
};
