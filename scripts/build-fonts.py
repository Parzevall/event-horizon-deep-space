# Builds the two icon fonts (the Hull glyphs are original work; the file icons are a subset of Symbols Nerd Font). Run after scripts/build.js (npm run fonts does both):
#   fonts/eh-nerd.woff  only the Nerd Font glyphs listed in fonts/nerd-codepoints.json
#   fonts/eh-hull.woff  the Hull product icons, strokes outlined from product-icons/svg
# and writes product-icons/event-horizon-hull-product-icon-theme.json.
# Needs fonttools, picosvg and skia-pathops: `uv run --with fonttools --with picosvg --with skia-pathops python scripts/build-fonts.py`

import json
import sys
from pathlib import Path

import pathops
from fontTools import subset
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.cu2quPen import Cu2QuPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.svgLib.path import parse_path
from fontTools.ttLib import TTFont
from picosvg.svg import SVG

ROOT = Path(__file__).resolve().parent.parent
# the official icons-only Nerd Font (MIT, see vendor/nerd-fonts/LICENSE and THIRD_PARTY_NOTICES.md)
NERD_SOURCE = ROOT / "vendor/nerd-fonts/SymbolsNerdFont-Regular.ttf"
UPM = 1000
HULL_FIRST = 0xE001


def build_nerd():
    codepoints = json.loads((ROOT / "fonts/nerd-codepoints.json").read_text())
    cmap = TTFont(NERD_SOURCE).getBestCmap()
    missing = [hex(c) for c in codepoints if c not in cmap]
    if missing:
        sys.exit(f"Nerd Font is missing glyphs: {missing}")
    opts = subset.Options()
    opts.flavor = "woff"
    opts.layout_features = []
    opts.name_IDs = [0, 1, 2, 3, 4, 5, 6, 13, 14]
    opts.notdef_outline = True
    font = TTFont(NERD_SOURCE)
    sub = subset.Subsetter(opts)
    sub.populate(unicodes=codepoints)
    sub.subset(font)
    # rename the subset so it never shadows an installed Nerd Font; keep the copyright and license records
    for rec in font["name"].names:
        if rec.nameID in (1, 4, 16):
            rec.string = "Event Horizon File Icons"
        elif rec.nameID == 6:
            rec.string = "EventHorizonFileIcons-Regular"
        elif rec.nameID == 3:
            rec.string = "Event Horizon File Icons (subset of Symbols Nerd Font)"
    out = ROOT / "fonts/eh-nerd.woff"
    font.flavor = "woff"
    font.save(out)
    print(f"eh-nerd.woff: {len(codepoints)} glyphs, {out.stat().st_size} bytes")


def outline(svg_path):
    """Stroke SVG -> one union pathops.Path in font units (y up)."""
    pico = SVG.parse(str(svg_path)).topicosvg()
    paths = []
    scale = UPM / 24
    for shape in pico.shapes():
        p = pathops.Path()
        pen = TransformPen(p.getPen(), (scale, 0, 0, -scale, 0, 24 * scale))
        parse_path(shape.as_path().d, pen)
        paths.append(p)
    result = pathops.Path()
    pathops.union(paths, result.getPen())
    return result


def build_hull():
    icons = json.loads((ROOT / "product-icons/icons.json").read_text())
    names = sorted({*icons.values()})
    glyphs, cmap, metrics = {".notdef": TTGlyphPen(None).glyph()}, {}, {".notdef": (UPM, 0)}
    order = [".notdef"]
    codepoint = {}
    for i, name in enumerate(names):
        tt = TTGlyphPen(None)
        outline(ROOT / "product-icons/svg" / f"{name}.svg").draw(Cu2QuPen(tt, max_err=1, reverse_direction=True))
        glyphs[name] = tt.glyph()
        metrics[name] = (UPM, 0)
        order.append(name)
        codepoint[name] = HULL_FIRST + i
        cmap[HULL_FIRST + i] = name

    fb = FontBuilder(UPM, isTTF=True)
    fb.setupGlyphOrder(order)
    fb.setupCharacterMap(cmap)
    fb.setupGlyf(glyphs)
    fb.setupHorizontalMetrics(metrics)
    fb.setupHorizontalHeader(ascent=UPM, descent=0)
    fb.setupNameTable({"familyName": "Event Horizon Hull", "styleName": "Regular"})
    fb.setupOS2(sTypoAscender=UPM, sTypoDescender=0, usWinAscent=UPM, usWinDescent=0)
    fb.setupPost()
    fb.font.flavor = "woff"
    out = ROOT / "fonts/eh-hull.woff"
    fb.save(out)

    theme = {
        "fonts": [{"id": "eh-hull", "src": [{"path": "../fonts/eh-hull.woff", "format": "woff"}], "weight": "normal", "style": "normal"}],
        "iconDefinitions": {cid: {"fontCharacter": "\\" + format(codepoint[name], "x")} for cid, name in icons.items()},
    }
    (ROOT / "product-icons/event-horizon-hull-product-icon-theme.json").write_text(json.dumps(theme, indent=2) + "\n")
    print(f"eh-hull.woff: {len(names)} glyphs for {len(icons)} icon ids, {out.stat().st_size} bytes")


if __name__ == "__main__":
    build_nerd()
    build_hull()
