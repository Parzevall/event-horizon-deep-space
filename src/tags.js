// Finds TODO / FIXME / NOTE / HACK (plus BUG, XXX) inside comments on a single line.
// Pure and line-based so it can run on just the visible ranges of an editor.

const TAG_RE = /\b(TODO|FIXME|NOTE|HACK|BUG|XXX)\b(?!s)/g;
const ALIAS = { TODO: "todo", FIXME: "fixme", BUG: "fixme", NOTE: "note", HACK: "hack", XXX: "hack" };

const HASH = new Set(["python", "shellscript", "yaml", "toml", "ruby", "perl", "r", "makefile", "cmake",
  "dockerfile", "julia", "powershell", "coffeescript", "elixir", "nim", "properties", "ini", "dotenv", "fish"]);
const DASH = new Set(["lua", "sql", "haskell", "elm", "ada"]);
const ANGLE = new Set(["markdown", "html", "xml", "svg", "vue-html"]);
const SLASH = new Set(["javascript", "typescript", "javascriptreact", "typescriptreact", "c", "cpp", "csharp",
  "java", "go", "rust", "swift", "kotlin", "dart", "php", "scss", "less", "css", "jsonc", "json", "glsl",
  "hlsl", "zig", "objective-c", "objective-cpp", "scala", "groovy", "cuda-cpp"]);

function markersFor(languageId) {
  if (HASH.has(languageId)) return ["#"];
  if (DASH.has(languageId)) return ["--"];
  if (ANGLE.has(languageId)) return ["<!--"];
  if (SLASH.has(languageId)) return ["//", "/*"];
  return ["//", "/*", "#"];
}

// Index where the comment starts on this line, or -1. Skips markers inside string literals.
function commentStart(line, languageId) {
  const markers = markersFor(languageId);
  if (markers.includes("//") && /^\s*\*(\s|$)/.test(line)) return line.indexOf("*"); // block comment body
  let quote = null;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quote) {
      if (ch === "\\") i++;
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") { quote = ch; continue; }
    for (const m of markers) if (line.startsWith(m, i)) return i;
  }
  return -1;
}

function findTagsInLine(line, languageId) {
  const start = commentStart(line, languageId);
  if (start < 0) return [];
  const out = [];
  TAG_RE.lastIndex = start;
  let m;
  while ((m = TAG_RE.exec(line))) out.push({ tag: ALIAS[m[1]], start: m.index, end: m.index + m[1].length });
  return out;
}

module.exports = { findTagsInLine, commentStart };
