// Event Horizon: comment-tag pills, inline problems, tinted indent columns, folded-line counts,
// current-line git blame, trailing whitespace, and Apply/Revert Setup.
const vscode = require("vscode");
const path = require("node:path");
const { spawn } = require("node:child_process");
const { findTagsInLine } = require("./src/tags");
const { lineProblems } = require("./src/problems");
const { indentColumns, activeBlock } = require("./src/indent");
const { foldedGaps, pill, trailingStart } = require("./src/lines");
const { parsePorcelain, formatBlame } = require("./src/blame");

// Settings written by "Event Horizon: Apply Setup". Revert restores whatever was there before.
const RECOMMENDED = {
  "workbench.colorTheme": "Event Horizon Deep Space",
  "workbench.iconTheme": "event-horizon-nerd",
  "workbench.productIconTheme": "event-horizon-hull",
  "workbench.tree.renderIndentGuides": "always",
  "workbench.editor.showIcons": false,
  "editor.lineHeight": 1.8,
  "editor.cursorStyle": "line",
  "editor.cursorWidth": 4,
  "editor.cursorBlinking": "expand",
  "editor.minimap.enabled": false,
  "editor.scrollbar.verticalScrollbarSize": 8,
  "editor.scrollbar.horizontalScrollbarSize": 8,
  "editor.bracketPairColorization.enabled": true,
  "editor.guides.bracketPairs": "active",
  "editor.guides.indentation": true,
  "editor.guides.highlightActiveIndentation": true,
  "editor.stickyScroll.enabled": true,
  "editor.renderLineHighlight": "all",
  "editor.renderWhitespace": "selection",
  "editor.occurrencesHighlight": "singleFile",
  "editor.semanticHighlighting.enabled": true,
  "editor.inlayHints.enabled": "on",
  "editor.inlayHints.padding": true,
  "python.analysis.inlayHints.variableTypes": true,
  "python.analysis.inlayHints.functionReturnTypes": true,
  "typescript.inlayHints.parameterNames.enabled": "literals",
  "typescript.inlayHints.functionLikeReturnTypes.enabled": true,
  "scm.diffDecorationsGutterWidth": 3,
  "workbench.editor.highlightModifiedTabs": true,
  "breadcrumbs.icons": false,
  "terminal.integrated.cursorStyle": "block"
};
const PREVIOUS_KEY = "eventHorizon.previousSettings";

const TAG_COLORS = { todo: "eventHorizon.tagTodo", fixme: "eventHorizon.tagFixme", note: "eventHorizon.tagNote", hack: "eventHorizon.tagHack" };
const SEVERITY = { error: 0, warning: 1, info: 2, hint: 3 };
const LEVELS = 6;
const MARGIN = 50; // lines painted above and below the visible ranges

function activate(context) {
  const deco = opts => vscode.window.createTextEditorDecorationType(opts);
  const color = id => new vscode.ThemeColor(`eventHorizon.${id}`);

  // Text added after a line renders in the order the types are created: fold pill, then problem, then blame.
  const foldType = deco({
    after: { color: color("foldedForeground"), backgroundColor: color("foldedBackground"), margin: "0 0 0 1.5ch", fontStyle: "normal", fontWeight: "600" },
    rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed
  });
  const tagTypes = Object.fromEntries(Object.entries(TAG_COLORS).map(([tag, id]) => [tag, deco({
    backgroundColor: new vscode.ThemeColor(id),
    color: color("tagForeground"),
    border: "1px solid",
    borderColor: new vscode.ThemeColor(id),
    borderRadius: "3px",
    fontWeight: "650",
    fontStyle: "normal"
  })]));
  const problemTypes = [0, 1, 2, 3].map(sev => {
    const key = ["Error", "Warning", "Info", "Info"][sev];
    return deco({
      isWholeLine: true,
      backgroundColor: color(`inline${key}Background`),
      after: { color: color(`inline${key}Foreground`), margin: "0 0 0 3ch", fontStyle: "italic" }
    });
  });
  const indentTypes = Array.from({ length: LEVELS }, (_, i) => deco({ backgroundColor: color(`indent${i + 1}`) }));
  const indentActiveTypes = Array.from({ length: LEVELS }, (_, i) => deco({ backgroundColor: color(`indentActive${i + 1}`) }));
  const blameType = deco({
    after: { color: color("blameForeground"), margin: "0 0 0 4ch", fontStyle: "italic" },
    rangeBehavior: vscode.DecorationRangeBehavior.ClosedOpen
  });
  const trailType = deco({ backgroundColor: color("trailingWhitespaceBackground") });

  context.subscriptions.push(...Object.values(tagTypes), ...problemTypes, ...indentTypes, ...indentActiveTypes, foldType, blameType, trailType);

  const config = () => vscode.workspace.getConfiguration("eventHorizon");

  // lines around what's visible, each at most once
  function visibleLines(editor) {
    const doc = editor.document, seen = new Set(), out = [];
    for (const r of editor.visibleRanges) {
      const last = Math.min(r.end.line + MARGIN, doc.lineCount - 1);
      for (let line = Math.max(0, r.start.line - MARGIN); line <= last; line++) {
        if (seen.has(line)) continue;
        seen.add(line);
        out.push(line);
      }
    }
    return out;
  }

  // ---------------- comment tags + trailing whitespace + indent columns (one pass over visible lines)
  function paintLines(editor) {
    if (!editor) return;
    const doc = editor.document, cfg = config();
    const tags = Object.fromEntries(Object.keys(TAG_COLORS).map(t => [t, []]));
    const trail = [];
    const cols = Array.from({ length: LEVELS }, () => []), activeCols = Array.from({ length: LEVELS }, () => []);
    const wantTags = cfg.get("commentTags.enabled", true);
    const wantTrail = cfg.get("trailingWhitespace.enabled", true);
    const wantIndent = cfg.get("indentColumns.enabled", false);
    const cursorLines = new Set(editor.selections.map(s => s.active.line));
    const tabSize = Number(editor.options.tabSize) || 4;
    const block = wantIndent ? activeBlock(n => doc.lineAt(n).text, doc.lineCount, editor.selection.active.line, tabSize) : null;

    for (const line of visibleLines(editor)) {
      const text = doc.lineAt(line).text;
      if (text.length > 2000) continue;
      if (wantTags) for (const t of findTagsInLine(text, doc.languageId)) tags[t.tag].push(new vscode.Range(line, t.start, line, t.end));
      if (wantTrail && !cursorLines.has(line)) {
        const at = trailingStart(text);
        if (at >= 0) trail.push(new vscode.Range(line, at, line, text.length));
      }
      if (wantIndent) {
        for (const c of indentColumns(text, tabSize)) {
          const active = block && c.level === block.level && line >= block.from && line <= block.to;
          (active ? activeCols : cols)[c.level % LEVELS].push(new vscode.Range(line, c.start, line, c.end));
        }
      }
    }
    for (const [tag, type] of Object.entries(tagTypes)) editor.setDecorations(type, tags[tag]);
    editor.setDecorations(trailType, trail);
    indentTypes.forEach((type, i) => editor.setDecorations(type, cols[i]));
    indentActiveTypes.forEach((type, i) => editor.setDecorations(type, activeCols[i]));
  }

  // ---------------- folded blocks: "12 lines" after the fold
  function paintFolds(editor) {
    if (!editor) return;
    const items = [];
    if (config().get("foldedLines.enabled", true)) {
      const ranges = editor.visibleRanges.map(r => ({ start: r.start.line, end: r.end.line }));
      for (const g of foldedGaps(ranges)) {
        const end = editor.document.lineAt(g.line).range.end;
        items.push({ range: new vscode.Range(end, end), renderOptions: { after: { contentText: ` ${pill(g.hidden)} ` } } });
      }
    }
    editor.setDecorations(foldType, items);
  }

  // ---------------- inline problems
  function paintProblems(editor) {
    if (!editor) return;
    const buckets = [[], [], [], []];
    if (config().get("inlineProblems.enabled", true)) {
      const min = SEVERITY[config().get("inlineProblems.minSeverity", "warning")] ?? 1;
      const icon = ["✖", "⚠", "ℹ", "ℹ"];
      for (const p of lineProblems(vscode.languages.getDiagnostics(editor.document.uri), min)) {
        if (p.line >= editor.document.lineCount) continue;
        buckets[p.severity].push({
          range: editor.document.lineAt(p.line).range,
          renderOptions: { after: { contentText: `${icon[p.severity]} ${p.text}` } }
        });
      }
    }
    problemTypes.forEach((type, sev) => editor.setDecorations(type, buckets[sev]));
  }

  // ---------------- git blame for the current line
  const identities = new Map(); // repo dir -> Promise<{ name, email }>
  let blameSeq = 0;
  // A repository's own config can make git run commands (fsmonitor, textconv filters), so blame only runs in
  // trusted workspaces, only for files inside a workspace folder, and with those hooks switched off.
  const SAFE = ["-c", "core.fsmonitor=false", "-c", "core.hooksPath=/dev/null", "-c", "diff.external=", "-c", "core.pager=cat"];
  function git(args, cwd, input) {
    return new Promise(resolve => {
      let out = "";
      const child = spawn("git", [...SAFE, ...args], { cwd, stdio: ["pipe", "pipe", "ignore"], env: { ...process.env, GIT_TERMINAL_PROMPT: "0" } });
      child.stdout.on("data", d => { out += d; if (out.length > 200000) child.kill(); });
      child.on("error", () => resolve(null));
      child.on("close", code => resolve(code === 0 ? out : null));
      child.stdin.on("error", () => {});
      child.stdin.end(input ?? "");
    });
  }
  function identity(cwd) {
    if (!identities.has(cwd)) identities.set(cwd, Promise.all([git(["config", "user.name"], cwd), git(["config", "user.email"], cwd)])
      .then(([name, email]) => ({ name: (name || "").trim(), email: (email || "").trim() })));
    return identities.get(cwd);
  }
  async function paintBlame(editor) {
    if (!editor) return;
    const seq = ++blameSeq;
    editor.setDecorations(blameType, []);
    const doc = editor.document;
    if (!config().get("blame.enabled", true) || doc.uri.scheme !== "file" || doc.lineCount > 50000 || !editor.selection.isEmpty) return;
    if (!vscode.workspace.isTrusted || !vscode.workspace.getWorkspaceFolder(doc.uri)) return;
    const line = editor.selection.active.line;
    const cwd = path.dirname(doc.uri.fsPath);
    const out = await git(["blame", "--no-textconv", "--porcelain", "-L", `${line + 1},${line + 1}`, "--contents", "-", "--", path.basename(doc.uri.fsPath)], cwd, doc.getText());
    if (seq !== blameSeq || !out || editor.selection.active.line !== line) return;
    const text = formatBlame(parsePorcelain(out), await identity(cwd));
    if (seq !== blameSeq || !text) return;
    const end = doc.lineAt(line).range.end;
    editor.setDecorations(blameType, [{ range: new vscode.Range(end, end), renderOptions: { after: { contentText: text } } }]);
  }

  // ---------------- scheduling
  const timers = new Map();
  function schedule(editor, delay = 120) {
    if (!editor) return;
    clearTimeout(timers.get(editor));
    timers.set(editor, setTimeout(() => { timers.delete(editor); paintLines(editor); paintProblems(editor); paintFolds(editor); }, delay));
  }
  let blameTimer;
  function scheduleBlame(editor, delay = 350) {
    clearTimeout(blameTimer);
    if (editor) editor.setDecorations(blameType, []);
    blameSeq++;
    blameTimer = setTimeout(() => paintBlame(editor), delay);
  }
  const paintVisible = () => vscode.window.visibleTextEditors.forEach(e => schedule(e, 0));
  const lastLine = new WeakMap();

  context.subscriptions.push(
    vscode.window.onDidChangeVisibleTextEditors(paintVisible),
    vscode.window.onDidChangeActiveTextEditor(e => scheduleBlame(e, 150)),
    vscode.window.onDidChangeTextEditorVisibleRanges(e => schedule(e.textEditor, 60)),
    vscode.window.onDidChangeTextEditorSelection(e => {
      const line = e.selections[0].active.line;
      if (lastLine.get(e.textEditor) !== line) {
        lastLine.set(e.textEditor, line);
        schedule(e.textEditor, 30);      // active indent block + trailing whitespace follow the cursor
        if (e.textEditor === vscode.window.activeTextEditor) scheduleBlame(e.textEditor);
      }
    }),
    vscode.workspace.onDidChangeTextDocument(e => vscode.window.visibleTextEditors
      .filter(ed => ed.document === e.document).forEach(ed => schedule(ed))),
    vscode.workspace.onDidSaveTextDocument(doc => { if (vscode.window.activeTextEditor?.document === doc) scheduleBlame(vscode.window.activeTextEditor, 300); }),
    vscode.languages.onDidChangeDiagnostics(e => {
      const changed = new Set(e.uris.map(u => u.toString()));
      vscode.window.visibleTextEditors.filter(ed => changed.has(ed.document.uri.toString())).forEach(ed => schedule(ed, 200));
    }),
    vscode.workspace.onDidChangeConfiguration(e => {
      if (!e.affectsConfiguration("eventHorizon")) return;
      paintVisible();
      scheduleBlame(vscode.window.activeTextEditor, 0);
    }),
    vscode.workspace.onDidGrantWorkspaceTrust(() => scheduleBlame(vscode.window.activeTextEditor, 0)),
    { dispose: () => { timers.forEach(t => clearTimeout(t)); clearTimeout(blameTimer); } }
  );
  paintVisible();
  scheduleBlame(vscode.window.activeTextEditor, 500);

  // ---------------- commands
  context.subscriptions.push(
    vscode.commands.registerCommand("eventHorizon.applySetup", async () => {
      const ok = await vscode.window.showInformationMessage(
        "Apply the Event Horizon setup?",
        { modal: true, detail: `Sets ${Object.keys(RECOMMENDED).length} user settings: theme, Nerd Font file icons, Hull product icons, line height 1.8, a 4px cursor with expand blink, minimap off, bracket pair guides, sticky scroll, quiet scrollbars and breadcrumbs, inlay hints and more. "Event Horizon: Revert Setup" restores your previous values.` },
        "Apply"
      );
      if (ok !== "Apply") return;
      const all = vscode.workspace.getConfiguration();
      const previous = context.globalState.get(PREVIOUS_KEY) || {};
      for (const key of Object.keys(RECOMMENDED)) {
        if (!(key in previous)) previous[key] = all.inspect(key)?.globalValue ?? null;
      }
      await context.globalState.update(PREVIOUS_KEY, previous);
      for (const [key, value] of Object.entries(RECOMMENDED)) {
        try { await all.update(key, value, vscode.ConfigurationTarget.Global); }
        catch (err) { console.warn(`Event Horizon: skipped ${key}: ${err.message}`); }
      }
      vscode.window.showInformationMessage("Event Horizon setup applied. Run \"Event Horizon: Revert Setup\" to undo it.");
    }),
    vscode.commands.registerCommand("eventHorizon.revertSetup", async () => {
      const previous = context.globalState.get(PREVIOUS_KEY);
      if (!previous) { vscode.window.showInformationMessage("Nothing to revert: Apply Setup hasn't been run."); return; }
      const all = vscode.workspace.getConfiguration();
      for (const [key, value] of Object.entries(previous)) {
        try { await all.update(key, value === null ? undefined : value, vscode.ConfigurationTarget.Global); }
        catch (err) { console.warn(`Event Horizon: could not restore ${key}: ${err.message}`); }
      }
      await context.globalState.update(PREVIOUS_KEY, undefined);
      vscode.window.showInformationMessage("Restored your settings from before Event Horizon.");
    }),
    vscode.commands.registerCommand("eventHorizon.copyCustomCssPath", async () => {
      // ready to paste as the loader's setting: both files, as file:// URLs
      const files = ["event-horizon.css", "event-horizon-title.js"].map(f => vscode.Uri.joinPath(context.extensionUri, "custom-css", f).toString());
      await vscode.env.clipboard.writeText(`"vscode_custom_css.imports": ${JSON.stringify(files)}`);
      vscode.window.showInformationMessage("Copied the vscode_custom_css.imports setting for the optional Event Horizon extras. It needs the Custom CSS and JS Loader extension, which patches VS Code's own files. See the README.");
    })
  );
}

function deactivate() {}

module.exports = { activate, deactivate };
