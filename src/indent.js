// Tinted indent columns: which character ranges of a line's leading whitespace belong to which level,
// and which level is "active" (the block the cursor is in). Pure, so it runs on visible lines only.

// Levels of leading whitespace: a tab is one level, `tabSize` spaces are one level.
// Returns [{ level, start, end }] in character offsets.
function indentColumns(line, tabSize) {
  const out = [];
  let i = 0, level = 0, run = 0, runStart = 0;
  while (i < line.length) {
    const ch = line[i];
    if (ch === "\t") {
      if (run) { out.push({ level: level++, start: runStart, end: i }); run = 0; }
      out.push({ level: level++, start: i, end: i + 1 });
      runStart = i + 1;
    } else if (ch === " ") {
      if (!run) runStart = i;
      if (++run === tabSize) { out.push({ level: level++, start: runStart, end: i + 1 }); run = 0; runStart = i + 1; }
    } else break;
    i++;
  }
  // only whitespace (blank line): no columns, so trailing spaces don't paint a block
  if (i === line.length) return [];
  return out;
}

// Indentation width in levels, or -1 for blank lines.
function indentLevel(line, tabSize) {
  if (!line.trim()) return -1;
  return indentColumns(line, tabSize).length;
}

// The block containing `cursorLine`: the contiguous lines indented at least as deep as it.
// Returns { level, from, to } where `level` is the column to brighten, or null at the top level.
function activeBlock(getLine, lineCount, cursorLine, tabSize) {
  let line = cursorLine;
  let depth = indentLevel(getLine(line), tabSize);
  // on a blank line, borrow the depth of the next non-blank line below, then above
  for (let d = 1; depth < 0 && d < 200; d++) {
    if (cursorLine + d < lineCount && (depth = indentLevel(getLine(cursorLine + d), tabSize)) >= 0) line = cursorLine + d;
    else if (cursorLine - d >= 0 && (depth = indentLevel(getLine(cursorLine - d), tabSize)) >= 0) line = cursorLine - d;
  }
  if (depth <= 0) return null;
  const inside = n => { const lv = indentLevel(getLine(n), tabSize); return lv < 0 || lv >= depth; };
  let from = line, to = line;
  while (from > 0 && inside(from - 1)) from--;
  while (to < lineCount - 1 && inside(to + 1)) to++;
  return { level: depth - 1, from, to };
}

module.exports = { indentColumns, indentLevel, activeBlock };
