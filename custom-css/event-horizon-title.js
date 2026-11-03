// Event Horizon: turn the title bar's command center label into a project chip, branch and file.
// window.title is "${rootName} @ ${activeRepositoryBranchName} / ${activeEditorShort}"; this splits that text
// into three styled spans. If the script doesn't run, the plain text still reads fine.
// Loaded by the custom CSS loader alongside event-horizon.css.
(function () {
  const PATTERN = /^(.*?) @ (.*?) \/ (.*)$/;

  function span(cls, text) {
    const el = document.createElement("span");
    el.className = cls;
    el.textContent = text;
    return el;
  }

  function split(label) {
    if (label.querySelector(".eh-chip")) return;
    const m = PATTERN.exec(label.textContent);
    if (!m) return;
    const [, root, branch, file] = m;
    const parts = [span("eh-chip", root)];
    if (branch.trim()) {
      const b = span("eh-branch", "");
      b.append(span("codicon codicon-git-branch", ""), branch);
      parts.push(b);
    }
    if (file.trim()) parts.push(span("eh-file", file));
    label.replaceChildren(...parts);
  }

  function watch(titlebar) {
    const run = () => titlebar.querySelectorAll(".command-center .search-label").forEach(split);
    new MutationObserver(run).observe(titlebar, { childList: true, subtree: true, characterData: true });
    run();
  }

  // the title bar is created after this script runs; wait for it, but only watch the title bar itself
  const find = setInterval(() => {
    const titlebar = document.querySelector(".monaco-workbench .part.titlebar");
    if (!titlebar) return;
    clearInterval(find);
    watch(titlebar);
  }, 250);
})();
