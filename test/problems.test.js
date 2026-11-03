const test = require("node:test");
const assert = require("node:assert/strict");
const { lineProblems } = require("../src/problems");

// VS Code DiagnosticSeverity: Error 0, Warning 1, Information 2, Hint 3
const d = (line, severity, message) => ({ severity, message, range: { start: { line } } });

test("keeps the worst problem per line and counts the rest", () => {
  const out = lineProblems([d(4, 1, "unused variable"), d(4, 0, "type mismatch"), d(4, 1, "shadowed")], 1);
  assert.equal(out.length, 1);
  assert.deepEqual(out[0], { line: 4, severity: 0, text: "type mismatch (+2 more)" });
});

test("drops problems below the minimum severity", () => {
  const out = lineProblems([d(1, 2, "info"), d(2, 3, "hint"), d(3, 1, "warn")], 1);
  assert.deepEqual(out.map(p => p.line), [3]);
});

test("uses only the first line of multi-line messages and trims it", () => {
  const out = lineProblems([d(0, 0, "  Argument of type 'x' is not assignable.\n  Details follow  ")], 1);
  assert.equal(out[0].text, "Argument of type 'x' is not assignable.");
});

test("shortens very long messages with an ellipsis", () => {
  const out = lineProblems([d(0, 1, "a".repeat(200))], 1);
  assert.equal(out[0].text.length, 120);
  assert.ok(out[0].text.endsWith("…"));
});

test("returns lines sorted and handles empty input", () => {
  assert.deepEqual(lineProblems([], 1), []);
  const out = lineProblems([d(9, 0, "b"), d(2, 0, "a")], 1);
  assert.deepEqual(out.map(p => p.line), [2, 9]);
});
