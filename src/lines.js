// Small line helpers for folded-block counts and trailing whitespace.

// VS Code reports an editor's visible ranges split at folded regions, so the gaps between them are the
// hidden lines. Returns [{ line, hidden }] where `line` is the last visible line before each gap.
function foldedGaps(ranges) {
  const sorted = [...ranges].sort((a, b) => a.start - b.start);
  const out = [];
  for (let i = 0; i + 1 < sorted.length; i++) {
    const hidden = sorted[i + 1].start - sorted[i].end - 1;
    if (hidden > 0) out.push({ line: sorted[i].end, hidden });
  }
  return out;
}

const pill = n => `${n} line${n === 1 ? "" : "s"}`;

// Start offset of trailing spaces/tabs, or -1 when there are none or the line is only whitespace.
function trailingStart(line) {
  const m = /[ \t]+$/.exec(line);
  if (!m || m.index === 0) return -1;
  return m.index;
}

module.exports = { foldedGaps, pill, trailingStart };
