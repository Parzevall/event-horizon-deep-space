// Git blame for one line: parse `git blame --porcelain` output and format it for the end of the line.

function parsePorcelain(text) {
  const lines = String(text).split("\n");
  const [sha] = (lines[0] || "").split(" ");
  if (!/^[0-9a-f]{40}$/.test(sha)) return null;
  const info = { sha };
  for (const l of lines.slice(1)) {
    if (l.startsWith("\t")) break;
    const sp = l.indexOf(" ");
    const key = sp < 0 ? l : l.slice(0, sp), value = sp < 0 ? "" : l.slice(sp + 1);
    if (key === "author") info.author = value;
    else if (key === "author-mail") info.mail = value.replace(/[<>]/g, "");
    else if (key === "author-time") info.time = Number(value) * 1000;
    else if (key === "summary") info.summary = value;
  }
  info.uncommitted = /^0{40}$/.test(sha) || info.mail === "not.committed.yet";
  return info;
}

function relativeTime(then, now = Date.now()) {
  const s = Math.max(0, Math.round((now - then) / 1000));
  const units = [["year", 31536000], ["month", 2592000], ["week", 604800], ["day", 86400], ["hour", 3600], ["minute", 60]];
  for (const [name, size] of units) {
    const n = Math.floor(s / size);
    if (n >= 1) return `${n} ${name}${n > 1 ? "s" : ""} ago`;
  }
  return "just now";
}

const MAX = 60;

// "You, 2 days ago · warn on low contrast"
function formatBlame(info, me, now = Date.now()) {
  if (!info) return "";
  if (info.uncommitted) return "Not committed yet";
  const who = me && (info.author === me.name || info.mail === me.email) ? "You" : info.author || "Unknown";
  let summary = info.summary || "";
  if (summary.length > MAX) summary = summary.slice(0, MAX - 1) + "…";
  return `${who}, ${relativeTime(info.time, now)}${summary ? ` · ${summary}` : ""}`;
}

module.exports = { parsePorcelain, relativeTime, formatBlame };
