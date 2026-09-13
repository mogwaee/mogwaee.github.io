# Ahead Start

A personal bookmark dashboard hosted on GitHub Pages. Plain HTML, CSS, and JavaScript modules; no build step or runtime dependencies.

## Local preview

From the project directory, run `python3 -m http.server 8000` and open http://localhost:8000. Use an HTTP server because JavaScript modules and bookmark loading require it.

## Structure

- `index.html`: page layout, search form, and theme controls.
- `js/main.js`: application startup.
- `js/themes.js`: theme names, appearance types, saved preferences, and menu behavior.
- `js/bookmarks.js`: bookmark loading and DOM rendering.
- `css/style.css`: fonts, layout, and component styles.
- `css/themes.css`: color variables for each theme.
- `res/bookmarks.json`: ordered columns, groups, and bookmarks.
- `img/` and `css/fonts/`: static assets, including unused legacy assets retained for reference.

## Editing

Add or rearrange bookmarks in `res/bookmarks.json`. Each top-level entry creates a column; each column contains `groups`, and each group has a `name` and `bookmarks` with `name` and `url`. Rendering preserves this order.

To add a theme, add its `id`, `name`, and `appearance` (`dark` or `light`) to `THEMES` in `js/themes.js`, then define the matching `[data-theme='id']` variables in `css/themes.css`. All three theme selectors are generated from that list.

Theme preferences use the existing `ahead-start-theme`, `ahead-start-dark-theme`, and `ahead-start-light-theme` localStorage keys. With no saved selection, the page follows OS appearance. If storage is unavailable, selection still works for the current page.

## Checks and publishing

Run `node --test tests/*.test.mjs` for data and behavior checks, and `git diff --check` before committing. Preview changes in a browser, checking theme selection, OS appearance, search, and bookmark layout.

Publishing uses the `master` branch on `origin` (GitHub Pages). Commit and push when the changes are ready to publish.
