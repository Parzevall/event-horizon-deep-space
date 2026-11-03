// Collapses diagnostics to one message per line for the inline ("Error Lens" style) display.
// Severity follows vscode.DiagnosticSeverity: Error 0, Warning 1, Information 2, Hint 3.

const MAX = 120;

function firstLine(message) {
  const text = String(message).split("\n").map(s => s.trim()).find(Boolean) || "";
  return text.length > MAX ? text.slice(0, MAX - 1) + "…" : text;
}

function lineProblems(diagnostics, minSeverity) {
  const byLine = new Map();
  for (const d of diagnostics) {
    if (d.severity > minSeverity) continue;
    const line = d.range.start.line;
    const entry = byLine.get(line);
    if (!entry) byLine.set(line, { worst: d, count: 1 });
    else {
      entry.count++;
      if (d.severity < entry.worst.severity) entry.worst = d;
    }
  }
  return [...byLine.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([line, { worst, count }]) => {
      let text = firstLine(worst.message);
      if (count > 1) text += ` (+${count - 1} more)`;
      return { line, severity: worst.severity, text };
    });
}

module.exports = { lineProblems };
