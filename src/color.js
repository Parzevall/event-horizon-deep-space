// Small color helpers shared by the build script and tests.

function rgb(hex) {
  const n = parseInt(hex.slice(1, 7), 16);
  return [n >> 16, (n >> 8) & 255, n & 255];
}

// WCAG 2.x relative luminance and contrast ratio
function luminance(hex) {
  return rgb(hex).map(c => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  }).reduce((sum, c, i) => sum + c * [0.2126, 0.7152, 0.0722][i], 0);
}

function contrast(a, b) {
  const x = luminance(a), y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

// "#B0D97E" + 0.24 -> "#B0D97E3D"
function alpha(hex, a) {
  return hex.slice(0, 7) + Math.round(a * 255).toString(16).padStart(2, "0").toUpperCase();
}

// opaque blend: "#FF8A3D" 12% over "#050506"
function mix(hex, over, t) {
  const a = rgb(hex), b = rgb(over);
  return "#" + a.map((v, i) => Math.round(v * t + b[i] * (1 - t)).toString(16).padStart(2, "0")).join("").toUpperCase();
}

module.exports = { rgb, luminance, contrast, alpha, mix };
