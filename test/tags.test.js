const test = require("node:test");
const assert = require("node:assert/strict");
const { findTagsInLine } = require("../src/tags");

const tags = (line, lang) => findTagsInLine(line, lang).map(t => [t.tag, line.slice(t.start, t.end)]);

test("finds a TODO in a slash comment", () => {
  assert.deepEqual(tags("    // TODO: warn when contrast drops", "typescript"), [["todo", "TODO"]]);
});

test("finds tags in python hash comments", () => {
  assert.deepEqual(tags("    # NOTE: 0.0 means nobody churned", "python"), [["note", "NOTE"]]);
});

test("ignores tags that are not inside a comment", () => {
  assert.deepEqual(tags('const TODO = "later";', "typescript"), []);
  assert.deepEqual(tags("todo_list = load()", "python"), []);
});

test("ignores comment markers inside strings", () => {
  assert.deepEqual(tags('const url = "http://x.dev/TODO";', "typescript"), []);
  assert.deepEqual(tags('label = "#FIXME later"', "python"), []);
});

test("still finds a tag in a trailing comment after a string", () => {
  assert.deepEqual(tags('const u = "a//b"; // FIXME: escape this', "typescript"), [["fixme", "FIXME"]]);
});

test("finds several tags on one line and maps aliases", () => {
  assert.deepEqual(tags("// HACK: temp, BUG in parser, XXX", "javascript"), [["hack", "HACK"], ["fixme", "BUG"], ["hack", "XXX"]]);
});

test("is case sensitive and needs word boundaries", () => {
  assert.deepEqual(tags("// todo lowercase and TODOs plural", "typescript"), []);
});

test("handles block comment continuation lines and block openers", () => {
  assert.deepEqual(tags(" * TODO: document params", "typescript"), [["todo", "TODO"]]);
  assert.deepEqual(tags("/* NOTE: legacy */ run();", "c"), [["note", "NOTE"]]);
});

test("uses -- for lua and sql, <!-- for markdown", () => {
  assert.deepEqual(tags("-- TODO: bind key", "lua"), [["todo", "TODO"]]);
  assert.deepEqual(tags("<!-- FIXME: broken link -->", "markdown"), [["fixme", "FIXME"]]);
});

test("does not treat C preprocessor lines as comments", () => {
  assert.deepEqual(tags("#define TODO 1", "cpp"), []);
});

test("unknown languages accept both // and #", () => {
  assert.deepEqual(tags("# TODO: x", "plaintext"), [["todo", "TODO"]]);
  assert.deepEqual(tags("// TODO: x", "plaintext"), [["todo", "TODO"]]);
});
