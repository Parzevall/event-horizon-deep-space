// Single source of truth for Event Horizon. Everything else is generated from this.

module.exports = {
  // surfaces: true black, panels separated only by hairlines
  bg: "#000000",
  side: "#050506",
  chrome: "#000000",
  raised: "#0F0E0D",   // widgets, inlay pills, list selection
  hover: "#0A0A09",
  lineHl: "#0C0B0A",
  border: "#161618",
  borderStrong: "#242220",

  // text: warm greys
  fg: "#E6E3DE",
  dim: "#8F8A84",
  muted: "#5E5A55",
  faint: "#3A3734",    // inactive line numbers
  guide: "#141312",
  guideLine: "#1F1D1B",  // indent guide hairlines
  guideActive: "#4A4540",

  // accent: accretion orange, used for cursor, focus, active tab, selection, find matches
  accent: "#FF8A3D",
  accentHover: "#FFA060",
  onAccent: "#000000",

  // syntax: Mission Phosphor (Syntax Studies round 5) - amber keywords, terminal-green strings,
  // instrument-teal functions, copper types, warning-orange numbers, on warm paper-white code
  text: "#EDE3CC",     // plain code (variables); UI text stays fg
  keyword: "#FFB547",
  string: "#9BD67B",
  escape: "#F2D27A",
  func: "#7FD1C7",
  type: "#E8A06A",
  number: "#FF7B54",
  param: "#D9C8A0",
  comment: "#776D5A",
  property: "#CBBFA6",
  operator: "#867D6A", // "quieter punctuation": operators and punctuation 20% darker than the palette's
  punct: "#6A6251",

  // signals + the wider colour set for terminal, icons and git
  added: "#8EF0CF",
  modified: "#9DB4FF",
  deleted: "#FF5F56",
  error: "#FF5F56",
  warning: "#FFC799",
  info: "#9DB4FF",
  red: "#FF5F56",
  yellow: "#FFC799",
  blue: "#9DB4FF",
  magenta: "#D7A6FF",
  cyan: "#7FE3F0"
};
