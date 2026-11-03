const test = require("node:test");
const assert = require("node:assert/strict");
const { buildTheme, buildIconTheme } = require("../scripts/build");
const { contrast } = require("../src/color");

const theme = buildTheme();
const HEX = /^#[0-9A-Fa-f]{6}([0-9A-Fa-f]{2})?$/;

test("every workbench color is a valid hex", () => {
  for (const [key, value] of Object.entries(theme.colors)) assert.match(value, HEX, key);
});

test("every workbench key is one VS Code knows", () => {
  const fs = require("node:fs");
  const js = "/usr/share/code/resources/app/out/vs/workbench/workbench.desktop.main.js";
  if (!fs.existsSync(js)) return;
  // workbench colors live in the main bundle; git and other built-in extensions contribute the rest
  const ext = "/usr/share/code/resources/app/extensions";
  const src = fs.readFileSync(js, "utf8") + fs.readdirSync(ext)
    .map(d => { try { return fs.readFileSync(`${ext}/${d}/package.json`, "utf8"); } catch { return ""; } }).join("");
  const unknown = Object.keys(theme.colors).filter(k => !src.includes(`"${k}"`));
  assert.deepEqual(unknown, []);
});

test("covers the surfaces the picks depend on", () => {
  const required = [
    "editor.background", "editor.foreground", "editor.selectionBackground", "editor.wordHighlightBackground",
    "editor.wordHighlightStrongBackground", "editor.findMatchBackground", "editor.findMatchHighlightBorder",
    "editor.lineHighlightBackground", "editorLineNumber.activeForeground", "editorCursor.foreground",
    "editorIndentGuide.background1", "editorIndentGuide.activeBackground1", "editorBracketHighlight.foreground1",
    "editorInlayHint.background", "editorGutter.addedBackground", "editorGhostText.foreground",
    "notebook.focusedCellBorder", "statusBar.debuggingBackground", "scmGraph.foreground1", "editorStickyScroll.shadow",
    "editorOverviewRuler.addedForeground", "terminal.ansiGreen", "sideBar.background", "activityBar.background",
    "tab.activeBackground", "statusBar.background", "focusBorder"
  ];
  for (const key of required) assert.ok(theme.colors[key], `missing ${key}`);
});

test("syntax colors meet contrast targets on the editor background", () => {
  const bg = theme.colors["editor.background"];
  for (const rule of theme.tokenColors) {
    const fg = rule.settings.foreground;
    if (!fg || fg.length !== 7) continue;
    const isComment = [].concat(rule.scope).some(s => /^(comment|log\.(date|verbose|debug))/.test(s));
    const isPunct = [].concat(rule.scope).some(s => /^(punctuation|keyword\.operator)/.test(s));
    const min = isComment ? 3.5 : isPunct ? 3 : 4.5;
    assert.ok(contrast(fg, bg) >= min, `${rule.name}: ${fg} is ${contrast(fg, bg).toFixed(2)}:1`);
  }
});

test("symbol highlights never use the accent, which the selection owns", () => {
  const c = theme.colors, sel = c["editor.selectionBackground"].slice(0, 7);
  assert.equal(sel, c["editorCursor.foreground"].slice(0, 7), "selection is the accent tint");
  for (const key of ["editor.wordHighlightBackground", "editor.wordHighlightStrongBackground"])
    assert.notEqual(c[key].slice(0, 7), sel, key);
});

test("git added is not the accent", () => {
  const c = theme.colors;
  assert.notEqual(c["editorGutter.addedBackground"].slice(0, 7), c["editorCursor.foreground"].slice(0, 7));
});

test("the editor is true black, with hairline indent guides and a brighter active one", () => {
  const c = theme.colors;
  assert.equal(c["editor.background"], "#000000");
  assert.notEqual(c["editorIndentGuide.background1"], c["editorIndentGuide.activeBackground1"]);
  assert.ok(contrast(c["editorIndentGuide.activeBackground1"], c["editor.background"]) > contrast(c["editorIndentGuide.background1"], c["editor.background"]));
});

test("diff view keeps VS Code's default colors", () => {
  for (const key of Object.keys(theme.colors)) assert.ok(!/^diffEditor\.(inserted|removed)/.test(key), key);
});

test("log files and regex parts have their own rules", () => {
  const scopes = theme.tokenColors.flatMap(r => [].concat(r.scope));
  for (const s of ["log.error", "log.warning", "log.info", "log.date", "keyword.operator.quantifier.regexp", "punctuation.definition.group.regexp"])
    assert.ok(scopes.includes(s), s);
});

test("params and types are italic, comments italic", () => {
  const style = scope => theme.tokenColors.find(r => [].concat(r.scope).includes(scope))?.settings.fontStyle || "";
  assert.match(style("comment"), /italic/);
  assert.match(style("variable.parameter"), /italic/);
  assert.match(style("entity.name.type"), /italic/);
});

test("icon theme references only icons that exist, and every icon is used", () => {
  const { json, svgs } = buildIconTheme();
  const defined = new Set(Object.keys(json.iconDefinitions));
  for (const [id, def] of Object.entries(json.iconDefinitions)) {
    const file = def.iconPath.replace("./", "");
    assert.ok(svgs[file], `${id} -> ${file} not generated`);
    assert.match(svgs[file], /^<svg [^>]*viewBox="0 0 16 16"/);
  }
  const used = new Set([json.file, json.folder, json.folderExpanded, json.rootFolder, json.rootFolderExpanded,
    ...Object.values(json.fileExtensions), ...Object.values(json.fileNames), ...Object.values(json.languageIds),
    ...Object.values(json.folderNames), ...Object.values(json.folderNamesExpanded)]);
  for (const id of used) assert.ok(defined.has(id), `undefined icon ${id}`);
  for (const id of defined) assert.ok(used.has(id), `unused icon ${id}`);
});

test("icon theme covers the file types this machine actually uses", () => {
  const { json } = buildIconTheme();
  for (const ext of ["py", "ipynb", "ts", "tsx", "js", "json", "md", "toml", "cpp", "h", "lua", "sh", "css", "html", "yaml", "csv", "svg", "png"])
    assert.ok(json.fileExtensions[ext], `no icon for .${ext}`);
  for (const name of ["package.json", "tsconfig.json", "pyproject.toml", "readme.md", "uv.lock", "cmakelists.txt", ".gitignore", "dockerfile"])
    assert.ok(json.fileNames[name], `no icon for ${name}`);
  for (const dir of ["src", "tests", "data", "notebooks", "docs", ".git", "node_modules", ".vscode"])
    assert.ok(json.folderNames[dir], `no folder icon for ${dir}`);
});

test("nerd icon theme: every icon is a font glyph from the bundled subset", () => {
  const fs = require("node:fs");
  const { buildNerdIconTheme, nerdCodepoints } = require("../scripts/build");
  const json = buildNerdIconTheme();
  const cps = new Set(nerdCodepoints());
  for (const [id, d] of Object.entries(json.iconDefinitions)) {
    assert.match(d.fontCharacter, /^\\[0-9a-f]{4,5}$/, id);
    assert.ok(cps.has(parseInt(d.fontCharacter.slice(1), 16)), id);
    assert.match(d.fontColor, HEX, id);
  }
  for (const id of new Set([...Object.values(json.fileExtensions), ...Object.values(json.fileNames), ...Object.values(json.folderNames)]))
    assert.ok(json.iconDefinitions[id], `undefined icon ${id}`);
  assert.ok(fs.existsSync(require("node:path").join(__dirname, "..", "fonts", "eh-nerd.woff")), "run npm run fonts");
});

test("hull product icons cover the activity bar and the common toolbar icons", () => {
  const fs = require("node:fs");
  const file = require("node:path").join(__dirname, "..", "product-icons", "event-horizon-hull-product-icon-theme.json");
  const json = JSON.parse(fs.readFileSync(file, "utf8"));
  for (const id of ["files", "search", "source-control", "debug-alt", "extensions", "account", "settings-gear", "ellipsis", "chevron-right", "chevron-down", "close"])
    assert.ok(json.iconDefinitions[id], `no hull icon for ${id}`);
});
