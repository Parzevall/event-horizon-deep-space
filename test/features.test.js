const test = require("node:test");
const assert = require("node:assert/strict");
const { indentColumns, indentLevel, activeBlock } = require("../src/indent");
const { foldedGaps, pill, trailingStart } = require("../src/lines");
const { parsePorcelain, relativeTime, formatBlame } = require("../src/blame");
const { contributedColors } = require("../scripts/build");

test("indent columns: spaces group by tab size, tabs are one level each", () => {
  assert.deepEqual(indentColumns("    x", 2), [{ level: 0, start: 0, end: 2 }, { level: 1, start: 2, end: 4 }]);
  assert.deepEqual(indentColumns("\t\tx", 4), [{ level: 0, start: 0, end: 1 }, { level: 1, start: 1, end: 2 }]);
  assert.deepEqual(indentColumns("   x", 2), [{ level: 0, start: 0, end: 2 }], "a partial level isn't painted");
  assert.deepEqual(indentColumns("      ", 2), [], "blank lines get no columns");
  assert.equal(indentLevel("", 2), -1);
});

test("active block: lines indented at least as deep as the cursor line, blank lines included", () => {
  const src = ["function a() {", "  if (x) {", "    one();", "", "    two();", "  }", "}"];
  const at = n => activeBlock(i => src[i], src.length, n, 2);
  assert.deepEqual(at(2), { level: 1, from: 2, to: 4 });
  assert.deepEqual(at(3), { level: 1, from: 2, to: 4 }, "blank line borrows the next line's depth");
  assert.deepEqual(at(1), { level: 0, from: 1, to: 5 });
  assert.equal(at(0), null, "top level has no column");
});

test("folded gaps come from the holes between visible ranges", () => {
  assert.deepEqual(foldedGaps([{ start: 0, end: 4 }, { start: 17, end: 40 }]), [{ line: 4, hidden: 12 }]);
  assert.deepEqual(foldedGaps([{ start: 0, end: 40 }]), []);
  assert.equal(pill(1), "1 line");
  assert.equal(pill(12), "12 lines");
});

test("trailing whitespace ignores blank lines", () => {
  assert.equal(trailingStart("const a = 1;   "), 12);
  assert.equal(trailingStart("const a = 1;"), -1);
  assert.equal(trailingStart("    "), -1);
});

const PORCELAIN = `4f2c9e1a0b7d3c5e8f6a1b2c3d4e5f60718293a4 12 12 1
author Ada Lovelace
author-mail <ada@example.com>
author-time 1730500000
author-tz +0000
summary warn on low contrast
filename src/loadTheme.ts
\t  missing.push(rule.name);
`;

test("blame: parses porcelain and formats it for the end of the line", () => {
  const info = parsePorcelain(PORCELAIN);
  assert.equal(info.author, "Ada Lovelace");
  assert.equal(info.summary, "warn on low contrast");
  const now = 1730500000 * 1000 + 2 * 86400 * 1000;
  assert.equal(formatBlame(info, { name: "Ada Lovelace" }, now), "You, 2 days ago · warn on low contrast");
  assert.equal(formatBlame(info, { name: "Someone" }, now), "Ada Lovelace, 2 days ago · warn on low contrast");
  assert.equal(formatBlame(parsePorcelain(PORCELAIN.replace(/^4f2c\w+/, "0".repeat(40))), null, now), "Not committed yet");
  assert.equal(parsePorcelain("fatal: no such path"), null);
  assert.equal(relativeTime(0, 30 * 1000), "just now");
  assert.equal(relativeTime(0, 3600 * 1000), "1 hour ago");
});

test("every decoration color the extension uses is contributed", () => {
  const fs = require("node:fs");
  const ids = new Set(contributedColors().map(c => c.id));
  const src = fs.readFileSync(require.resolve("../extension.js"), "utf8");
  const used = new Set([...src.matchAll(/color\("([A-Za-z0-9]+)"\)/g)].map(m => `eventHorizon.${m[1]}`));
  for (const tag of src.matchAll(/"(eventHorizon\.tag\w+)"/g)) used.add(tag[1]);
  ["indent", "indentActive"].forEach(p => { for (let i = 1; i <= 6; i++) used.add(`eventHorizon.${p}${i}`); });
  ["Error", "Warning", "Info"].forEach(k => ["Foreground", "Background"].forEach(f => used.add(`eventHorizon.inline${k}${f}`)));
  for (const id of used) assert.ok(ids.has(id), `${id} not contributed`);
});

test("git blame is guarded against repository-configured commands", () => {
  const fs = require("node:fs");
  const src = fs.readFileSync(require.resolve("../extension.js"), "utf8");
  assert.match(src, /core\.fsmonitor=false/);
  assert.match(src, /--no-textconv/);
  assert.match(src, /vscode\.workspace\.isTrusted/);
  const pkg = JSON.parse(fs.readFileSync(require.resolve("../package.json"), "utf8"));
  assert.equal(pkg.capabilities.untrustedWorkspaces.supported, "limited");
});
