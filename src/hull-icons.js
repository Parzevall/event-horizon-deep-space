// The Hull product icon set: thin lines with chamfered corners, drawn on a 24px grid.
// scripts/build.js writes each one as a stroke SVG; scripts/build-fonts.py outlines the strokes into an icon font.

const SW = 1.5;
const st = `fill="none" stroke="#000" stroke-width="${SW}" stroke-linecap="butt" stroke-linejoin="bevel"`;

// rectangle with the top-right corner cut at 45°
function R(x, y, w, h) {
  const c = Math.min(2.4, w / 3, h / 3);
  return `<path d="M${x} ${y}h${w - c}l${c} ${c}v${h - c}h${-w}z" ${st}/>`;
}
const C = (cx, cy, r) => `<circle cx="${cx}" cy="${cy}" r="${r}" ${st}/>`;
const P = d => `<path d="${d}" ${st}/>`;
const D = (cx, cy) => `<circle cx="${cx}" cy="${cy}" r="1.25" fill="#000"/>`;

const DRAW = {
  files: () => R(5, 7, 11, 14) + P("M8.5 7V3H20V18H16"),
  search: () => C(10.5, 10.5, 6) + P("M15 15l5.5 5.5"),
  git: () => C(7, 5, 2) + C(7, 19, 2) + C(17, 7.5, 2) + P("M7 7v10") + P("M17 9.5v2.5l-10 3.5"),
  debug: () => P("M7 4.5 19 12 7 19.5z") + P("M4 8v8"),
  ext: () => R(4, 12.5, 7, 7) + R(11, 12.5, 7, 7) + R(4, 5.5, 7, 7) + R(13.5, 3.5, 6.5, 6.5),
  account: () => C(12, 8.5, 3.6) + P("M5 20v-3l3-3h8l3 3v3"),
  gear: () => C(12, 12, 2.8) + P("M12 3.5v3M12 17.5v3M3.5 12h3M17.5 12h3M6 6l2.1 2.1M15.9 15.9 18 18M6 18l2.1-2.1M15.9 8.1 18 6"),
  more: () => D(6, 12) + D(12, 12) + D(18, 12),
  newfile: () => R(5, 3, 12, 18) + P("M11 9v6M8 12h6"),
  newfolder: () => P("M3 5h6l2 2h7.5L21 9.5V20H3z") + P("M12 10.5v6M9 13.5h6"),
  refresh: () => P("M19 12a7 7 0 1 1-2.05-4.95") + P("M17.2 3.6v3.9h-3.9"),
  collapse: () => R(7, 7, 13, 13) + P("M4 16V4h12") + P("M10.5 13.5h6"),
  branch: () => C(7, 5, 2) + C(7, 19, 2) + C(17, 7.5, 2) + P("M7 7v10") + P("M17 9.5v2.5l-10 3.5"),
  error: () => C(12, 12, 8) + P("M9 9l6 6M15 9l-6 6"),
  warning: () => P("M12 3.5 21.5 20h-19z") + P("M12 10v4.5") + D(12, 17.3),
  bell: () => P("M6 17v-7l3-3.5h6L18 10v7z") + P("M4.5 17h15M10 20h4"),
  sync: () => P("M19 12a7 7 0 0 1-12 4.9M5 12a7 7 0 0 1 12-4.9") + P("M17 3.5v3.6h-3.6M7 20.5v-3.6h3.6"),
  chevronRight: () => P("M9.5 6l6 6-6 6"),
  chevronDown: () => P("M6 9.5l6 6 6-6"),
  close: () => P("M6.5 6.5l11 11M17.5 6.5l-11 11"),
  add: () => P("M12 5v14M5 12h14"),
  check: () => P("M5 12.5l4.5 4.5L19 7"),
  split: () => R(3, 4, 18, 16) + P("M12 4v16"),
  filter: () => P("M4 5h16l-6 7.5V19l-4 2v-8.5z")
};

// codicon id -> drawing. Icons not listed here keep VS Code's codicons.
const ICONS = {
  "files": "files", "search": "search", "source-control": "git", "debug-alt": "debug", "extensions": "ext",
  "account": "account", "settings-gear": "gear", "gear": "gear", "ellipsis": "more", "new-file": "newfile",
  "new-folder": "newfolder", "refresh": "refresh", "collapse-all": "collapse", "git-branch": "branch",
  "error": "error", "warning": "warning", "bell": "bell", "sync": "sync", "chevron-right": "chevronRight",
  "chevron-down": "chevronDown", "close": "close", "add": "add", "check": "check", "split-horizontal": "split",
  "filter": "filter"
};

const svg = name => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">${DRAW[name]()}</svg>`;

module.exports = { DRAW, ICONS, svg };
