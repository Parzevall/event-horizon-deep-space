// Generates the Event Horizon color theme, the Tiles file icon theme and its SVGs from src/palette.js.
// `node scripts/build.js` writes them to themes/ and icons/.

const fs = require("node:fs");
const path = require("node:path");
const P = require("../src/palette");
const HULL = require("../src/hull-icons");
const { alpha: a, mix } = require("../src/color");

// ---------------------------------------------------------------- color theme

function workbenchColors() {
  const c = {
    // base
    "foreground": P.fg,
    "descriptionForeground": P.dim,
    "disabledForeground": P.muted,
    "errorForeground": P.error,
    "focusBorder": a(P.accent, 0.55),
    "icon.foreground": P.dim,
    "selection.background": a(P.fg, 0.2),
    "widget.shadow": "#000000CC",
    "widget.border": P.borderStrong,
    "sash.hoverBorder": a(P.accent, 0.5),
    "textLink.foreground": P.blue,
    "textLink.activeForeground": P.cyan,
    "textPreformat.foreground": P.string,
    "textPreformat.background": P.raised,
    "textBlockQuote.background": P.side,
    "textBlockQuote.border": P.borderStrong,
    "textCodeBlock.background": P.side,
    "textSeparator.foreground": P.borderStrong,

    // title bar + command center
    "titleBar.activeBackground": P.chrome,
    "titleBar.activeForeground": P.dim,
    "titleBar.inactiveBackground": P.chrome,
    "titleBar.inactiveForeground": P.muted,
    "titleBar.border": P.border,
    // the command center is a bare project chip (custom CSS), so it has no box in any state
    "commandCenter.background": "#00000000",
    "commandCenter.foreground": P.dim,
    "commandCenter.activeBackground": a(P.fg, 0.05),
    "commandCenter.border": "#00000000",
    "commandCenter.activeBorder": "#00000000",
    "commandCenter.inactiveBorder": "#00000000",
    "commandCenter.inactiveForeground": P.muted,

    // activity bar
    "activityBar.background": P.chrome,
    "activityBar.foreground": P.accent,
    "activityBar.inactiveForeground": P.muted,
    "activityBar.border": P.border,
    "activityBar.activeBorder": P.accent,
    "activityBarBadge.background": P.accent,
    "activityBarBadge.foreground": P.onAccent,
    "activityBarTop.foreground": P.accent,
    "activityBarTop.inactiveForeground": P.muted,
    "activityBarTop.activeBorder": P.accent,

    // side bar + lists
    "sideBar.background": P.side,
    "sideBar.foreground": P.fg,
    "sideBar.border": P.border,
    "sideBarTitle.foreground": P.dim,
    "sideBarSectionHeader.background": P.side,
    "sideBarSectionHeader.foreground": P.dim,
    "sideBarSectionHeader.border": P.border,
    "sideBarStickyScroll.background": P.side,
    "sideBarStickyScroll.shadow": "#00000055",
    "list.activeSelectionBackground": P.raised,
    "list.activeSelectionForeground": P.fg,
    "list.activeSelectionIconForeground": P.fg,
    "list.inactiveSelectionBackground": P.hover,
    "list.inactiveSelectionForeground": P.fg,
    "list.hoverBackground": P.hover,
    "list.hoverForeground": P.fg,
    "list.focusBackground": P.raised,
    "list.focusOutline": a(P.accent, 0.45),
    "list.focusAndSelectionOutline": a(P.accent, 0.45),
    "list.inactiveFocusOutline": "#00000000",
    "list.highlightForeground": P.accent,
    "list.focusHighlightForeground": P.accent,
    "list.invalidItemForeground": P.error,
    "list.errorForeground": P.error,
    "list.warningForeground": P.warning,
    "list.dropBackground": a(P.accent, 0.12),
    "list.filterMatchBackground": a(P.accent, 0.18),
    "listFilterWidget.background": P.raised,
    "listFilterWidget.outline": a(P.accent, 0.5),
    "listFilterWidget.noMatchesOutline": P.error,
    "tree.indentGuidesStroke": P.guideActive,
    "tree.inactiveIndentGuidesStroke": P.guideLine,

    // editor groups + tabs
    "editorGroup.border": P.border,
    "editorGroup.dropBackground": a(P.accent, 0.08),
    "editorGroupHeader.tabsBackground": P.chrome,
    "editorGroupHeader.tabsBorder": P.border,
    "editorGroupHeader.noTabsBackground": P.bg,
    "editorPane.background": P.bg,
    "tab.activeBackground": P.bg,
    "tab.activeForeground": P.fg,
    "tab.activeBorderTop": P.accent,
    "tab.activeBorder": P.bg,
    "tab.inactiveBackground": P.chrome,
    "tab.inactiveForeground": P.dim,
    "tab.border": P.border,
    "tab.hoverBackground": P.hover,
    "tab.hoverForeground": P.fg,
    "tab.unfocusedActiveBackground": P.bg,
    "tab.unfocusedActiveForeground": P.dim,
    "tab.unfocusedActiveBorderTop": a(P.accent, 0.4),
    "tab.unfocusedInactiveForeground": P.muted,
    "tab.activeModifiedBorder": P.accent,
    "tab.inactiveModifiedBorder": a(P.accent, 0.45),
    "tab.unfocusedActiveModifiedBorder": a(P.accent, 0.45),
    "tab.lastPinnedBorder": P.borderStrong,
    "tab.dragAndDropBorder": P.accent,
    "breadcrumb.background": P.bg,
    "breadcrumb.foreground": P.muted,
    "breadcrumb.focusForeground": P.fg,
    "breadcrumb.activeSelectionForeground": P.accent,
    "breadcrumbPicker.background": P.side,

    // editor core
    "editor.background": P.bg,
    "editor.foreground": P.text,
    "editorLineNumber.foreground": P.faint,
    "editorLineNumber.activeForeground": P.accent,
    "editorLineNumber.dimmedForeground": P.guide,
    "editorCursor.foreground": P.accent,
    "editorCursor.background": P.onAccent,
    "editor.lineHighlightBackground": P.lineHl,
    "editor.lineHighlightBorder": "#00000000",

    // selection = accent tint; symbol highlight = warm white (read) / mint (write), so neither looks like a selection
    "editor.selectionBackground": a(P.accent, 0.26),
    "editor.inactiveSelectionBackground": a(P.accent, 0.12),
    "editor.selectionHighlightBackground": a(P.accent, 0.06),
    "editor.selectionHighlightBorder": a(P.accent, 0.35),
    "editor.wordHighlightBackground": a(P.fg, 0.1),
    "editor.wordHighlightBorder": "#00000000",
    "editor.wordHighlightStrongBackground": a(P.string, 0.16),
    "editor.wordHighlightStrongBorder": "#00000000",
    // matching HTML/JSX tags arrive as text highlights: accent outline
    "editor.wordHighlightTextBackground": "#00000000",
    "editor.wordHighlightTextBorder": a(P.accent, 0.7),

    // find = accent
    "editor.findMatchBackground": a(P.accent, 0.55),
    "editor.findMatchBorder": P.accent,
    "editor.findMatchHighlightBackground": a(P.accent, 0.08),
    "editor.findMatchHighlightBorder": a(P.accent, 0.55),
    "editor.findRangeHighlightBackground": a(P.fg, 0.04),
    "editor.rangeHighlightBackground": a(P.fg, 0.05),
    "editor.symbolHighlightBackground": a(P.accent, 0.18),
    "editor.hoverHighlightBackground": a(P.fg, 0.06),
    "editorLink.activeForeground": P.blue,

    // guides, whitespace, rulers, brackets
    "editorWhitespace.foreground": P.faint,
    "editorRuler.foreground": P.border,
    "editorCodeLens.foreground": P.muted,
    "editorBracketMatch.background": a(P.fg, 0.07),
    "editorBracketMatch.border": P.muted,
    "editorBracketHighlight.unexpectedBracket.foreground": P.error,
    "editorUnicodeHighlight.border": P.warning,
    "editorUnicodeHighlight.background": a(P.warning, 0.1),

    // gutter (bars; added is mint, not the accent)
    "editorGutter.background": P.bg,
    "editorGutter.addedBackground": P.added,
    "editorGutter.modifiedBackground": P.modified,
    "editorGutter.deletedBackground": P.deleted,
    "editorGutter.foldingControlForeground": P.muted,
    "editorGutter.commentRangeForeground": P.muted,

    // overview ruler = the colored scrollbar marks (minimap is off)
    "editorOverviewRuler.border": "#00000000",
    "editorOverviewRuler.addedForeground": a(P.added, 0.7),
    "editorOverviewRuler.modifiedForeground": a(P.modified, 0.7),
    "editorOverviewRuler.deletedForeground": a(P.deleted, 0.7),
    "editorOverviewRuler.errorForeground": P.error,
    "editorOverviewRuler.warningForeground": P.warning,
    "editorOverviewRuler.infoForeground": P.info,
    "editorOverviewRuler.findMatchForeground": a(P.accent, 0.8),
    "editorOverviewRuler.selectionHighlightForeground": a(P.fg, 0.4),
    "editorOverviewRuler.wordHighlightForeground": a(P.fg, 0.4),
    "editorOverviewRuler.wordHighlightStrongForeground": a(P.string, 0.6),
    "editorOverviewRuler.rangeHighlightForeground": a(P.fg, 0.3),
    "editorOverviewRuler.bracketMatchForeground": a(P.fg, 0.4),
    "editorOverviewRuler.currentContentForeground": a(P.added, 0.6),
    "editorOverviewRuler.incomingContentForeground": a(P.cyan, 0.6),
    "scrollbar.shadow": "#00000000",
    "scrollbarSlider.background": a(P.fg, 0.06),
    "scrollbarSlider.hoverBackground": a(P.fg, 0.16),
    "scrollbarSlider.activeBackground": a(P.fg, 0.22),
    "minimap.background": P.bg,
    "minimapSlider.background": a(P.fg, 0.06),

    // problems
    "editorError.foreground": P.error,
    "editorWarning.foreground": P.warning,
    "editorInfo.foreground": P.info,
    "editorHint.foreground": a(P.fg, 0.35),
    "problemsErrorIcon.foreground": P.error,
    "problemsWarningIcon.foreground": P.warning,
    "problemsInfoIcon.foreground": P.info,

    // inlay hints (pill), ghost text, sticky scroll
    "editorInlayHint.background": P.raised,
    "editorInlayHint.foreground": P.punct,
    "editorInlayHint.typeBackground": P.raised,
    "editorInlayHint.typeForeground": P.punct,
    "editorInlayHint.parameterBackground": P.raised,
    "editorInlayHint.parameterForeground": P.punct,
    "editorGhostText.foreground": P.punct,
    // on true black a shadow alone is invisible, so the pinned header is lifted a step first
    "editorStickyScroll.background": P.hover,
    "editorStickyScroll.shadow": "#000000E6",
    "editorStickyScroll.border": "#00000000",
    "editorStickyScrollHover.background": P.raised,

    // widgets
    "editorWidget.background": P.side,
    "editorWidget.foreground": P.fg,
    "editorWidget.border": P.borderStrong,
    "editorWidget.resizeBorder": P.accent,
    "editorSuggestWidget.background": P.side,
    "editorSuggestWidget.border": P.borderStrong,
    "editorSuggestWidget.foreground": P.fg,
    "editorSuggestWidget.selectedBackground": a(P.accent, 0.16),
    "editorSuggestWidget.selectedForeground": P.fg,
    "editorSuggestWidget.highlightForeground": P.accent,
    "editorSuggestWidget.focusHighlightForeground": P.accent,
    "editorSuggestWidgetStatus.foreground": P.muted,
    "editorHoverWidget.background": P.side,
    "editorHoverWidget.foreground": P.fg,
    "editorHoverWidget.border": P.borderStrong,
    "editorHoverWidget.highlightForeground": P.accent,
    "editorHoverWidget.statusBarBackground": P.chrome,
    "editorMarkerNavigation.background": P.side,
    "editorMarkerNavigationError.background": P.error,
    "editorMarkerNavigationWarning.background": P.warning,
    "editorMarkerNavigationInfo.background": P.info,
    "editorLightBulb.foreground": P.yellow,
    "editorLightBulbAutoFix.foreground": P.accent,
    "editorLightBulbAi.foreground": P.magenta,

    // peek view
    "peekView.border": P.accent,
    "peekViewTitle.background": mix(P.accent, P.side, 0.12),
    "peekViewTitleLabel.foreground": P.fg,
    "peekViewTitleDescription.foreground": P.dim,
    "peekViewEditor.background": mix(P.accent, P.side, 0.03),
    "peekViewEditorGutter.background": mix(P.accent, P.side, 0.03),
    "peekViewEditorStickyScroll.background": mix(P.accent, P.side, 0.03),
    "peekViewEditor.matchHighlightBackground": a(P.accent, 0.25),
    "peekViewResult.background": P.side,
    "peekViewResult.selectionBackground": P.raised,
    "peekViewResult.selectionForeground": P.fg,
    "peekViewResult.matchHighlightBackground": a(P.accent, 0.2),
    "peekViewResult.fileForeground": P.fg,
    "peekViewResult.lineForeground": P.dim,

    // diff view: VS Code default colors (picked); only the frame follows the palette
    "diffEditor.border": P.border,
    "diffEditor.unchangedRegionBackground": P.side,
    "diffEditor.unchangedRegionForeground": P.dim,
    "merge.currentHeaderBackground": a(P.added, 0.3),
    "merge.currentContentBackground": a(P.added, 0.09),
    "merge.incomingHeaderBackground": a(P.cyan, 0.3),
    "merge.incomingContentBackground": a(P.cyan, 0.09),
    "merge.commonHeaderBackground": a(P.fg, 0.18),
    "merge.commonContentBackground": a(P.fg, 0.06),
    "merge.border": "#00000000",

    // panel + terminal
    "panel.background": P.side,
    "panel.border": P.border,
    "panelTitle.activeForeground": P.fg,
    "panelTitle.inactiveForeground": P.muted,
    "panelTitle.activeBorder": P.accent,
    "panelInput.border": P.borderStrong,
    "panelSection.border": P.border,
    "panelSectionHeader.background": P.side,
    "terminal.background": P.side,
    "terminal.foreground": P.fg,
    "terminal.border": P.border,
    "terminalCursor.foreground": P.accent,
    "terminalCursor.background": P.onAccent,
    "terminal.selectionBackground": a(P.fg, 0.18),
    "terminal.inactiveSelectionBackground": a(P.fg, 0.1),
    "terminal.findMatchBackground": a(P.accent, 0.4),
    "terminal.findMatchHighlightBackground": a(P.accent, 0.15),
    "terminal.tab.activeBorder": P.accent,
    "terminalCommandDecoration.defaultBackground": P.muted,
    "terminalCommandDecoration.successBackground": P.added,
    "terminalCommandDecoration.errorBackground": P.error,
    "terminal.ansiBlack": "#2A2826",
    "terminal.ansiRed": P.red,
    "terminal.ansiGreen": P.added,
    "terminal.ansiYellow": P.yellow,
    "terminal.ansiBlue": P.blue,
    "terminal.ansiMagenta": P.magenta,
    "terminal.ansiCyan": P.cyan,
    "terminal.ansiWhite": P.property,
    "terminal.ansiBrightBlack": P.muted,
    "terminal.ansiBrightRed": mix("#FFFFFF", P.red, 0.25),
    "terminal.ansiBrightGreen": mix("#FFFFFF", P.added, 0.25),
    "terminal.ansiBrightYellow": mix("#FFFFFF", P.yellow, 0.25),
    "terminal.ansiBrightBlue": mix("#FFFFFF", P.blue, 0.25),
    "terminal.ansiBrightMagenta": mix("#FFFFFF", P.magenta, 0.25),
    "terminal.ansiBrightCyan": mix("#FFFFFF", P.cyan, 0.25),
    "terminal.ansiBrightWhite": P.fg,

    // status bar: while debugging it stays black, with an accent top edge and accent text
    "statusBar.background": P.chrome,
    "statusBar.foreground": P.dim,
    "statusBar.border": P.border,
    "statusBar.noFolderBackground": P.chrome,
    "statusBar.noFolderForeground": P.dim,
    "statusBar.debuggingBackground": P.chrome,
    "statusBar.debuggingForeground": P.accent,
    "statusBar.debuggingBorder": P.accent,
    "statusBarItem.hoverBackground": a(P.fg, 0.08),
    "statusBarItem.activeBackground": a(P.fg, 0.14),
    "statusBarItem.remoteBackground": P.accent,
    "statusBarItem.remoteForeground": P.onAccent,
    "statusBarItem.errorBackground": P.error,
    "statusBarItem.errorForeground": P.onAccent,
    "statusBarItem.warningBackground": P.warning,
    "statusBarItem.warningForeground": P.onAccent,
    "statusBarItem.prominentBackground": a(P.fg, 0.1),
    "statusBarItem.prominentForeground": P.fg,

    // inputs, buttons, dropdowns, badges
    "input.background": P.chrome,
    "input.foreground": P.fg,
    "input.border": P.borderStrong,
    "input.placeholderForeground": P.muted,
    "inputOption.activeBackground": a(P.accent, 0.18),
    "inputOption.activeBorder": a(P.accent, 0.6),
    "inputOption.activeForeground": P.fg,
    "inputValidation.errorBackground": mix(P.error, P.bg, 0.14),
    "inputValidation.errorBorder": P.error,
    "inputValidation.warningBackground": mix(P.warning, P.bg, 0.12),
    "inputValidation.warningBorder": P.warning,
    "inputValidation.infoBackground": mix(P.info, P.bg, 0.12),
    "inputValidation.infoBorder": P.info,
    "button.background": P.accent,
    "button.foreground": P.onAccent,
    "button.hoverBackground": P.accentHover,
    "button.secondaryBackground": P.raised,
    "button.secondaryForeground": P.fg,
    "button.secondaryHoverBackground": "#1A1917",
    "button.border": "#00000000",
    "button.separator": a(P.onAccent, 0.4),
    "dropdown.background": P.raised,
    "dropdown.listBackground": P.side,
    "dropdown.border": P.borderStrong,
    "dropdown.foreground": P.fg,
    "checkbox.background": P.chrome,
    "checkbox.border": P.borderStrong,
    "checkbox.foreground": P.accent,
    "badge.background": a(P.accent, 0.2),
    "badge.foreground": P.accent,
    "progressBar.background": P.accent,

    // menus, quick input, notifications
    "menu.background": P.side,
    "menu.foreground": P.fg,
    "menu.selectionBackground": P.raised,
    "menu.selectionForeground": P.fg,
    "menu.separatorBackground": P.borderStrong,
    "menu.border": P.borderStrong,
    "menubar.selectionBackground": a(P.fg, 0.08),
    "quickInput.background": P.side,
    "quickInput.foreground": P.fg,
    "quickInputTitle.background": P.chrome,
    "quickInputList.focusBackground": a(P.accent, 0.14),
    "quickInputList.focusForeground": P.fg,
    "quickInputList.focusIconForeground": P.fg,
    "pickerGroup.foreground": P.accent,
    "pickerGroup.border": P.borderStrong,
    "keybindingLabel.background": P.raised,
    "keybindingLabel.foreground": P.fg,
    "keybindingLabel.border": P.borderStrong,
    "keybindingLabel.bottomBorder": P.borderStrong,
    "notifications.background": P.side,
    "notifications.foreground": P.fg,
    "notifications.border": P.borderStrong,
    "notificationCenterHeader.background": P.chrome,
    "notificationToast.border": P.borderStrong,
    "notificationLink.foreground": P.blue,
    "notificationsErrorIcon.foreground": P.error,
    "notificationsWarningIcon.foreground": P.warning,
    "notificationsInfoIcon.foreground": P.info,
    "banner.background": P.raised,
    "banner.foreground": P.fg,
    "banner.iconForeground": P.accent,
    "settings.headerForeground": P.fg,
    "settings.modifiedItemIndicator": P.accent,
    "settings.focusedRowBackground": a(P.fg, 0.03),
    "settings.rowHoverBackground": a(P.fg, 0.03),
    "settings.dropdownBackground": P.raised,
    "settings.textInputBackground": P.chrome,
    "settings.numberInputBackground": P.chrome,
    "welcomePage.tileBackground": P.side,
    "welcomePage.tileHoverBackground": P.raised,
    "walkThrough.embeddedEditorBackground": P.side,

    // git decorations in the explorer
    "gitDecoration.addedResourceForeground": P.added,
    "gitDecoration.untrackedResourceForeground": P.added,
    "gitDecoration.modifiedResourceForeground": P.modified,
    "gitDecoration.stageModifiedResourceForeground": P.modified,
    "gitDecoration.deletedResourceForeground": P.deleted,
    "gitDecoration.stageDeletedResourceForeground": P.deleted,
    "gitDecoration.renamedResourceForeground": P.cyan,
    "gitDecoration.ignoredResourceForeground": P.muted,
    "gitDecoration.conflictingResourceForeground": P.warning,
    "gitDecoration.submoduleResourceForeground": P.magenta,

    // source control graph lanes
    "scmGraph.historyItemRefColor": P.accent,
    "scmGraph.historyItemRemoteRefColor": P.string,
    "scmGraph.historyItemBaseRefColor": P.modified,
    "scmGraph.historyItemHoverDefaultLabelForeground": P.onAccent,
    "scmGraph.historyItemHoverDefaultLabelBackground": P.accent,
    "scmGraph.historyItemHoverLabelForeground": P.onAccent,
    "scmGraph.historyItemHoverAdditionsForeground": P.added,
    "scmGraph.historyItemHoverDeletionsForeground": P.deleted,
    "scmGraph.foreground1": P.accent,
    "scmGraph.foreground2": P.string,
    "scmGraph.foreground3": P.modified,
    "scmGraph.foreground4": P.magenta,
    "scmGraph.foreground5": P.yellow,

    // notebooks (outline focus)
    "notebook.editorBackground": P.bg,
    "notebook.cellEditorBackground": P.side,
    "notebook.cellBorderColor": P.borderStrong,
    "notebook.focusedCellBorder": P.accent,
    "notebook.focusedEditorBorder": a(P.accent, 0.6),
    "notebook.inactiveFocusedCellBorder": a(P.accent, 0.35),
    "notebook.selectedCellBorder": P.borderStrong,
    "notebook.selectedCellBackground": a(P.fg, 0.03),
    "notebook.cellHoverBackground": a(P.fg, 0.02),
    "notebook.focusedCellBackground": a(P.fg, 0.02),
    "notebook.outputContainerBackgroundColor": P.bg,
    "notebook.outputContainerBorderColor": P.border,
    "notebook.cellToolbarSeparator": P.borderStrong,
    "notebook.cellStatusBarItemHoverBackground": a(P.fg, 0.08),
    "notebook.symbolHighlightBackground": a(P.accent, 0.1),
    "notebookStatusRunningIcon.foreground": P.accent,
    "notebookStatusSuccessIcon.foreground": P.added,
    "notebookStatusErrorIcon.foreground": P.error,
    "notebookScrollbarSlider.background": a(P.fg, 0.08),
    "notebookScrollbarSlider.hoverBackground": a(P.fg, 0.16),
    "notebookScrollbarSlider.activeBackground": a(P.fg, 0.24),

    // debugging + testing
    "debugToolBar.background": P.raised,
    "debugToolBar.border": P.borderStrong,
    "editor.stackFrameHighlightBackground": a(P.accent, 0.12),
    "editor.focusedStackFrameHighlightBackground": a(P.accent, 0.2),
    "debugIcon.breakpointForeground": P.error,
    "debugIcon.breakpointDisabledForeground": P.muted,
    "debugIcon.startForeground": P.added,
    "debugIcon.stopForeground": P.error,
    "debugIcon.pauseForeground": P.yellow,
    "debugIcon.continueForeground": P.accent,
    "debugConsole.infoForeground": P.info,
    "debugConsole.warningForeground": P.warning,
    "debugConsole.errorForeground": P.error,
    "debugTokenExpression.name": P.type,
    "debugTokenExpression.value": P.fg,
    "debugTokenExpression.string": P.string,
    "debugTokenExpression.number": P.number,
    "debugTokenExpression.boolean": P.number,
    "debugTokenExpression.error": P.error,
    "testing.iconPassed": P.added,
    "testing.iconFailed": P.error,
    "testing.iconErrored": P.error,
    "testing.iconQueued": P.yellow,
    "testing.iconSkipped": P.muted,
    "testing.runAction": P.accent,

    // charts + symbol icons
    "charts.foreground": P.fg,
    "charts.lines": P.borderStrong,
    "charts.red": P.red,
    "charts.blue": P.blue,
    "charts.yellow": P.yellow,
    "charts.orange": P.accent,
    "charts.green": P.added,
    "charts.purple": P.magenta,
    "symbolIcon.classForeground": P.yellow,
    "symbolIcon.interfaceForeground": P.yellow,
    "symbolIcon.typeParameterForeground": P.yellow,
    "symbolIcon.functionForeground": P.func,
    "symbolIcon.methodForeground": P.func,
    "symbolIcon.constructorForeground": P.func,
    "symbolIcon.variableForeground": P.fg,
    "symbolIcon.propertyForeground": P.property,
    "symbolIcon.fieldForeground": P.property,
    "symbolIcon.constantForeground": P.number,
    "symbolIcon.enumeratorForeground": P.number,
    "symbolIcon.enumeratorMemberForeground": P.number,
    "symbolIcon.keywordForeground": P.keyword,
    "symbolIcon.stringForeground": P.string,
    "symbolIcon.moduleForeground": P.blue,
    "symbolIcon.namespaceForeground": P.blue
  };

  // hairline indent guides, the block with the cursor a step brighter
  for (let i = 1; i <= 6; i++) {
    c[`editorIndentGuide.background${i}`] = P.guideLine;
    c[`editorIndentGuide.activeBackground${i}`] = P.guideActive;
  }
  // bracket pairs cycle mint -> orange -> warm white; the active pair's guide is drawn in its color
  [P.string, P.number, P.type].forEach((col, i) => {
    c[`editorBracketHighlight.foreground${i + 1}`] = col;
    c[`editorBracketHighlight.foreground${i + 4}`] = col;
    c[`editorBracketPairGuide.activeBackground${i + 1}`] = a(col, 0.5);
    c[`editorBracketPairGuide.background${i + 1}`] = "#00000000";
  });
  return c;
}

const rule = (name, scope, foreground, fontStyle) => {
  const settings = {};
  if (foreground) settings.foreground = foreground;
  if (fontStyle !== undefined) settings.fontStyle = fontStyle;
  return { name, scope, settings };
};

function tokenColors() {
  return [
    rule("Comment", ["comment", "punctuation.definition.comment", "string.quoted.docstring.multi.python", "string.quoted.docstring"], P.comment, "italic"),
    rule("Variable", ["variable", "variable.other.readwrite", "meta.definition.variable", "entity.name.variable", "support.variable"], P.text),
    rule("Keyword", ["keyword", "keyword.control", "storage.type", "storage.modifier", "keyword.operator.new", "keyword.operator.expression",
      "keyword.operator.logical.python", "keyword.operator.word", "keyword.operator.typeof", "keyword.operator.instanceof", "keyword.other",
      "keyword.control.import", "keyword.control.from", "variable.language.super"], P.keyword, "bold italic"),
    rule("Operator", ["keyword.operator", "keyword.operator.assignment", "keyword.operator.arithmetic", "keyword.operator.comparison",
      "keyword.operator.relational", "keyword.operator.type.annotation", "keyword.operator.optional", "keyword.operator.spread",
      "storage.type.function.arrow", "punctuation.separator.annotation"], P.operator),
    rule("Punctuation", ["punctuation", "meta.brace", "punctuation.separator", "punctuation.terminator", "punctuation.accessor",
      "punctuation.definition.parameters", "punctuation.definition.block", "punctuation.definition.tag"], P.punct),
    rule("String", ["string", "string.quoted", "string.template", "punctuation.definition.string", "string.unquoted"], P.string),
    rule("Template and f-string braces", ["punctuation.definition.template-expression", "punctuation.section.embedded",
      "constant.character.format.placeholder.other.python", "storage.type.string.python"], P.func),
    rule("Escape", ["constant.character.escape", "constant.character", "constant.other.placeholder"], P.escape),
    // regex: groups, classes, quantifiers and anchors each get their own color
    rule("Regex", ["string.regexp"], P.string),
    rule("Regex delimiters", ["punctuation.definition.string.begin.regexp", "punctuation.definition.string.end.regexp"], P.punct),
    rule("Regex flags", ["keyword.other.regexp", "storage.modifier.regexp"], P.keyword),
    rule("Regex anchors", ["keyword.control.anchor.regexp", "keyword.control.anchors.regexp"], P.keyword),
    rule("Regex groups", ["punctuation.definition.group.regexp", "punctuation.definition.group.assertion.regexp",
      "meta.group.assertion.regexp", "punctuation.definition.group.no-capture.regexp", "keyword.operator.or.regexp"], P.func),
    rule("Regex character classes", ["constant.other.character-class.set.regexp", "constant.other.character-class.regexp",
      "punctuation.definition.character-class.regexp", "constant.other.character-class.range.regexp"], P.type),
    rule("Regex quantifiers", ["keyword.operator.quantifier.regexp"], P.number),
    rule("Regex escapes", ["constant.character.escape.backslash.regexp", "constant.character.escape.regexp"], P.escape),
    rule("Number and constant", ["constant.numeric", "constant.language", "constant.other", "support.constant", "constant.other.caps",
      "variable.other.enummember", "entity.name.constant"], P.number),
    rule("Function", ["entity.name.function", "support.function", "variable.function", "meta.function-call entity.name.function",
      "meta.function-call.generic.python", "entity.name.function.member", "support.function.builtin"], P.func),
    rule("Decorator", ["entity.name.function.decorator", "meta.decorator", "punctuation.decorator", "punctuation.definition.decorator",
      "meta.function.decorator.python", "entity.name.function.decorator.python"], P.string, "italic"),
    rule("Type", ["entity.name.type", "entity.name.class", "support.type", "support.class", "entity.other.inherited-class",
      "storage.type.primitive", "storage.type.built-in", "entity.name.type.class", "meta.type.annotation entity.name.type",
      "support.type.python", "entity.name.namespace.cpp entity.name.type"], P.type, "italic"),
    // bold where a function or class is defined; calls and references stay regular (semantic tokens refine this)
    rule("Function definitions", ["meta.definition.function entity.name.function", "meta.definition.method entity.name.function",
      "meta.function.python entity.name.function", "entity.name.function.python"], P.func, "bold"),
    rule("Type definitions", ["entity.name.type.class", "entity.name.class", "entity.name.type.alias", "entity.name.type.interface",
      "entity.name.type.enum"], P.type, "bold italic"),
    rule("Parameter", ["variable.parameter", "meta.parameters variable", "variable.parameter.function.language.python",
      "variable.parameter.function", "meta.function.parameters variable"], P.param, "italic"),
    rule("Property", ["variable.other.property", "variable.other.object.property", "support.variable.property", "meta.object-literal.key",
      "variable.other.member", "entity.other.attribute-name.python", "meta.attribute.python"], P.property),
    rule("self and this", ["variable.language.this", "variable.language.self", "variable.parameter.function.language.special.self.python",
      "variable.language.special.self.python", "variable.language.special.cls.python"], P.keyword, "italic"),
    rule("Modules and namespaces", ["entity.name.namespace", "entity.name.module", "entity.name.type.module", "support.module"], P.text),
    rule("JSON and YAML keys", ["support.type.property-name.json", "support.type.property-name", "entity.name.tag.yaml",
      "support.type.property-name.toml", "meta.mapping.key string"], P.type, ""),
    rule("HTML tags", ["entity.name.tag", "meta.tag.sgml"], P.keyword),
    rule("HTML attributes", ["entity.other.attribute-name"], P.param, "italic"),
    rule("CSS selectors", ["entity.other.attribute-name.class.css", "entity.other.attribute-name.id.css", "entity.name.tag.css",
      "entity.other.attribute-name.pseudo-class.css"], P.func, ""),
    rule("CSS properties", ["support.type.property-name.css", "support.type.vendored.property-name.css"], P.property, ""),
    rule("CSS values", ["support.constant.property-value.css", "constant.other.color.rgb-value", "keyword.other.unit"], P.number),
    rule("Markdown heading", ["markup.heading", "entity.name.section.markdown", "punctuation.definition.heading.markdown"], P.func, "bold"),
    rule("Markdown bold", ["markup.bold"], P.text, "bold"),
    rule("Markdown italic", ["markup.italic"], P.text, "italic"),
    rule("Markdown code", ["markup.inline.raw", "markup.fenced_code.block.markdown punctuation.definition", "markup.raw"], P.string),
    rule("Markdown link", ["markup.underline.link", "string.other.link"], P.blue),
    rule("Markdown quote", ["markup.quote"], P.dim, "italic"),
    rule("Markdown list", ["punctuation.definition.list.begin.markdown", "beginning.punctuation.definition.list.markdown"], P.accent),
    rule("Diff inserted", ["markup.inserted"], P.added),
    rule("Diff deleted", ["markup.deleted"], P.deleted),
    rule("Diff changed", ["markup.changed"], P.modified),
    rule("Invalid", ["invalid", "invalid.illegal"], P.error),
    rule("Deprecated", ["invalid.deprecated"], P.warning, "strikethrough"),
    rule("Shell variables", ["variable.other.normal.shell", "punctuation.definition.variable.shell"], P.param),
    rule("C/C++ preprocessor", ["meta.preprocessor", "keyword.control.directive", "punctuation.definition.directive"], P.keyword),
    rule("Lua builtins", ["support.function.library.lua", "support.function.lua"], P.func),
    // log files (VS Code's built-in Log language)
    rule("Log date", ["log.date"], P.comment, ""),
    rule("Log verbose and debug", ["log.verbose", "log.debug"], P.comment, ""),
    rule("Log info", ["log.info"], P.text, "bold"),
    rule("Log warning", ["log.warning"], P.accent, "bold"),
    rule("Log error", ["log.error", "log.exception"], P.red, "bold"),
    rule("Log exception type", ["log.exceptiontype"], P.yellow, ""),
    rule("Log constant", ["log.constant"], P.number, ""),
    rule("Log string", ["log.string"], P.string, "")
  ];
}

function semanticTokenColors() {
  return {
    "parameter": { foreground: P.param, italic: true },
    "typeParameter": { foreground: P.type, italic: true },
    "property": P.property,
    "property.readonly": P.property,
    "enumMember": P.number,
    "decorator": { foreground: P.string, italic: true },
    "selfParameter": { foreground: P.keyword, italic: true },
    "function.declaration": { foreground: P.func, bold: true },
    "method.declaration": { foreground: P.func, bold: true },
    "class.declaration": { foreground: P.type, bold: true, italic: true },
    "type.declaration": { foreground: P.type, bold: true, italic: true },
    "interface.declaration": { foreground: P.type, bold: true, italic: true },
    "enum.declaration": { foreground: P.type, bold: true, italic: true },
    "class.defaultLibrary": P.type,
    "type.defaultLibrary": P.type,
    "function.defaultLibrary": P.func,
    // Pylance marks module-level constants readonly; TS marks every const readonly, so keep TS neutral
    "variable.readonly:python": P.number,
    "*.deprecated": { strikethrough: true },
    "*.mutable": { underline: true }
  };
}

function buildTheme() {
  return {
    $schema: "vscode://schemas/color-theme",
    name: "Event Horizon Deep Space",
    type: "dark",
    semanticHighlighting: true,
    colors: workbenchColors(),
    tokenColors: tokenColors(),
    semanticTokenColors: semanticTokenColors()
  };
}

// ---------------------------------------------------------------- file icon theme (tiles)

const svg = inner => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16">${inner}</svg>`;
const xml = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// a language mark on a soft colored square
function fileSVG(color, label) {
  const size = label.length > 2 ? 5.2 : label.length > 1 ? 6.6 : 9;
  const y = label.length > 1 ? 10.4 : 11.4;
  const fit = label.length > 2 ? ` textLength="11.4" lengthAdjust="spacingAndGlyphs"` : "";
  return svg(`<rect x=".8" y="1.3" width="14.4" height="13.4" rx="3.6" fill="${color}" fill-opacity=".2"/>` +
    `<text x="8" y="${y}" text-anchor="middle" font-family="SF Mono, Menlo, ui-monospace, monospace" font-size="${size}" font-weight="700" fill="${color}"${fit}>${xml(label)}</text>`);
}

const FOLDER = "M1.5 4.6v7.9a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1V6.1a1 1 0 0 0-1-1H7.6L6.1 3.6H2.5a1 1 0 0 0-1 1z";
function folderSVG(color, open) {
  return svg(`<path d="${FOLDER}" fill="${color}" fill-opacity="${open ? ".38" : ".22"}" stroke="${color}" stroke-width="1.1" stroke-linejoin="round"/>`);
}

// file icon definitions: id -> [color, label]
const FILES = {
  file: [P.dim, "·"],
  ts: [P.type, "TS"], tsx: [P.type, "TSX"], dts: [P.type, "DTS"], js: [P.yellow, "JS"], jsx: [P.yellow, "JSX"],
  py: [P.string, "PY"], pyproject: [P.string, "PRJ"], ipynb: [P.param, "NB"],
  json: [P.number, "{}"], npm: [P.keyword, "PK"], tsconfig: [P.func, "TC"], lock: [P.muted, "LK"],
  md: [P.dim, "MD"], readme: [P.accent, "i"], txt: [P.dim, "TXT"], log: [P.muted, "LOG"], license: [P.yellow, "LIC"],
  toml: [P.func, "TM"], yaml: [P.magenta, "YML"], env: [P.yellow, "ENV"], ini: [P.dim, "INI"], git: [P.accent, "GIT"],
  csv: [P.string, "CSV"], parquet: [P.number, "PQ"], sql: [P.blue, "SQL"], db: [P.blue, "DB"],
  c: [P.blue, "C"], cpp: [P.blue, "C++"], h: [P.magenta, "H"], cmake: [P.func, "CMK"], make: [P.func, "MK"],
  rs: [P.accent, "RS"], go: [P.cyan, "GO"], java: [P.func, "JV"], lua: [P.blue, "LUA"], sh: [P.string, "SH"], r: [P.blue, "R"],
  html: [P.red, "<>"], css: [P.blue, "CSS"], scss: [P.magenta, "SCS"], svg: [P.yellow, "SVG"], xml: [P.func, "XML"],
  image: [P.magenta, "IMG"], pdf: [P.red, "PDF"], font: [P.dim, "Aa"], archive: [P.muted, "ZIP"],
  docker: [P.blue, "DKR"], tex: [P.dim, "TEX"], vsix: [P.accent, "EXT"]
};

const EXT = {
  ts: "ts", mts: "ts", cts: "ts", tsx: "tsx", "d.ts": "dts", js: "js", mjs: "js", cjs: "js", jsx: "jsx",
  py: "py", pyi: "py", pyw: "py", ipynb: "ipynb",
  json: "json", jsonc: "json", json5: "json", lock: "lock",
  md: "md", mdx: "md", markdown: "md", txt: "txt", log: "log",
  toml: "toml", yaml: "yaml", yml: "yaml", env: "env", ini: "ini", cfg: "ini", conf: "ini",
  csv: "csv", tsv: "csv", parquet: "parquet", feather: "parquet", sql: "sql", db: "db", sqlite: "db", duckdb: "db",
  c: "c", cpp: "cpp", cc: "cpp", cxx: "cpp", hpp: "h", h: "h", hh: "h", cmake: "cmake", mk: "make",
  rs: "rs", go: "go", java: "java", lua: "lua", sh: "sh", bash: "sh", zsh: "sh", fish: "sh", r: "r",
  html: "html", htm: "html", css: "css", scss: "scss", sass: "scss", less: "css", svg: "svg", xml: "xml",
  png: "image", jpg: "image", jpeg: "image", gif: "image", webp: "image", ico: "image", avif: "image", bmp: "image",
  pdf: "pdf", ttf: "font", otf: "font", woff: "font", woff2: "font", zip: "archive", gz: "archive", tar: "archive",
  xz: "archive", "7z": "archive", zst: "archive", tex: "tex", vsix: "vsix"
};

const NAMES = {
  "package.json": "npm", "package-lock.json": "lock", "yarn.lock": "lock", "pnpm-lock.yaml": "lock", "bun.lockb": "lock",
  "uv.lock": "lock", "poetry.lock": "lock", "cargo.lock": "lock", "tsconfig.json": "tsconfig", "jsconfig.json": "tsconfig",
  "pyproject.toml": "pyproject", "requirements.txt": "pyproject", "setup.py": "pyproject", "readme.md": "readme", "readme": "readme",
  "license": "license", "license.md": "license", "license.txt": "license", "cmakelists.txt": "cmake", "makefile": "make",
  ".gitignore": "git", ".gitattributes": "git", ".gitmodules": "git", "dockerfile": "docker", "docker-compose.yml": "docker",
  "compose.yaml": "docker", ".env": "env", ".env.local": "env", ".env.example": "env", ".editorconfig": "ini"
};

const LANGS = {
  python: "py", typescript: "ts", typescriptreact: "tsx", javascript: "js", javascriptreact: "jsx", json: "json", jsonc: "json",
  markdown: "md", toml: "toml", yaml: "yaml", c: "c", cpp: "cpp", lua: "lua", shellscript: "sh", html: "html", css: "css",
  scss: "scss", rust: "rs", go: "go", java: "java", sql: "sql", dockerfile: "docker", makefile: "make", r: "r", xml: "xml",
  "jupyter": "ipynb", latex: "tex", plaintext: "txt", ignore: "git", properties: "ini", dotenv: "env", log: "log"
};

// folder kinds: id -> [color, folder names]
const FOLDERS = {
  folder: [P.dim, []],
  src: [P.accent, ["src", "source", "app", "lib", "pkg", "core", "components"]],
  tests: [P.string, ["test", "tests", "__tests__", "spec", "specs", "e2e"]],
  data: [P.yellow, ["data", "datasets", "raw", "processed", "db", "database", "fixtures"]],
  notebooks: [P.param, ["notebooks", "notebook", "nb", "analysis", "experiments"]],
  docs: [P.blue, ["docs", "doc", "documentation", "notes", "wiki"]],
  scripts: [P.func, ["scripts", "script", "bin", "tools", "cli"]],
  assets: [P.magenta, ["assets", "images", "img", "public", "static", "media", "icons", "fonts"]],
  git: [P.red, [".git", ".github", ".gitlab", ".husky"]],
  config: [P.keyword, [".vscode", ".config", "config", "configs", "settings", ".idea"]],
  deps: [P.muted, ["node_modules", ".venv", "venv", "env", "__pycache__", "build", "dist", "out", "target", ".cache", ".next", "vendor", ".pytest_cache", ".mypy_cache", ".ruff_cache"]]
};

function buildIconTheme() {
  const svgs = {}, defs = {};
  const add = (id, content) => { svgs[`svg/${id}.svg`] = content; defs[id] = { iconPath: `./svg/${id}.svg` }; };

  for (const [id, [color, label]] of Object.entries(FILES)) add(`file-${id}`, fileSVG(color, label));
  const folderNames = {}, folderNamesExpanded = {};
  for (const [id, [color, names]] of Object.entries(FOLDERS)) {
    add(`folder-${id}`, folderSVG(color, false));
    add(`folder-${id}-open`, folderSVG(color, true));
    for (const n of names) { folderNames[n] = `folder-${id}`; folderNamesExpanded[n] = `folder-${id}-open`; }
  }
  const map = obj => Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, `file-${v}`]));
  return {
    svgs,
    json: {
      iconDefinitions: defs,
      file: "file-file",
      folder: "folder-folder",
      folderExpanded: "folder-folder-open",
      rootFolder: "folder-folder",
      rootFolderExpanded: "folder-folder-open",
      fileExtensions: map(EXT),
      fileNames: map(NAMES),
      languageIds: map(LANGS),
      folderNames,
      folderNamesExpanded,
      hidesExplorerArrows: false
    }
  };
}

// ---------------------------------------------------------------- file icon theme (Nerd Font glyphs)

// id -> [color, codepoint in the Nerd Font]. scripts/build-fonts.py subsets exactly these glyphs into fonts/eh-nerd.woff.
const NERD = {
  file: [P.dim, 0xf15b],
  ts: [P.type, 0xe628], tsx: [P.cyan, 0xe7ba], dts: [P.type, 0xe628], js: [P.yellow, 0xe74e], jsx: [P.cyan, 0xe7ba],
  py: [P.string, 0xe73c], pyproject: [P.string, 0xe73c], ipynb: [P.param, 0xe678],
  json: [P.number, 0xe60b], npm: [P.red, 0xe71e], tsconfig: [P.func, 0xe628], lock: [P.muted, 0xf023],
  md: [P.dim, 0xe73e], readme: [P.accent, 0xf05a], txt: [P.dim, 0xf15c], log: [P.muted, 0xf18d], license: [P.yellow, 0xe60a],
  toml: [P.func, 0xe615], yaml: [P.magenta, 0xe6a8], env: [P.yellow, 0xf462], ini: [P.dim, 0xe615], git: [P.accent, 0xe702],
  csv: [P.string, 0xe64a], parquet: [P.number, 0xf1c0], sql: [P.blue, 0xf1c0], db: [P.blue, 0xf1c0],
  c: [P.blue, 0xe61e], cpp: [P.blue, 0xe61d], h: [P.magenta, 0xf0fd], cmake: [P.func, 0xe615], make: [P.func, 0xe779],
  rs: [P.accent, 0xe7a8], go: [P.cyan, 0xe626], java: [P.func, 0xe738], lua: [P.blue, 0xe620], sh: [P.string, 0xf489], r: [P.blue, 0xf25d],
  html: [P.red, 0xe736], css: [P.blue, 0xe749], scss: [P.magenta, 0xe603], svg: [P.yellow, 0xe698], xml: [P.func, 0xe619],
  image: [P.magenta, 0xf1c5], pdf: [P.red, 0xf1c1], font: [P.dim, 0xe659], archive: [P.muted, 0xf1c6],
  docker: [P.blue, 0xf308], tex: [P.dim, 0xe69b], vsix: [P.accent, 0xe70c]
};
// folder kind -> [closed codepoint, open codepoint]; colors come from FOLDERS
const NERD_FOLDERS = { git: [0xe5fb, 0xe5fb], config: [0xe5fc, 0xe5fc], deps: [0xe5fa, 0xe5fa] };
const OPEN = [0xf07b, 0xf07c];

const fontChar = cp => "\\" + cp.toString(16);

function buildNerdIconTheme() {
  const defs = {};
  const add = (id, color, cp) => { defs[id] = { fontCharacter: fontChar(cp), fontColor: color }; };
  for (const [id, [color, cp]] of Object.entries(NERD)) add(`file-${id}`, color, cp);
  const folderNames = {}, folderNamesExpanded = {};
  for (const [id, [color, names]] of Object.entries(FOLDERS)) {
    const [closed, open] = NERD_FOLDERS[id] || OPEN;
    add(`folder-${id}`, color, closed);
    add(`folder-${id}-open`, color, open);
    for (const n of names) { folderNames[n] = `folder-${id}`; folderNamesExpanded[n] = `folder-${id}-open`; }
  }
  const map = obj => Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, `file-${v}`]));
  return {
    fonts: [{ id: "eh-nerd", src: [{ path: "../fonts/eh-nerd.woff", format: "woff" }], weight: "normal", style: "normal", size: "112%" }],
    iconDefinitions: defs,
    file: "file-file",
    folder: "folder-folder",
    folderExpanded: "folder-folder-open",
    rootFolder: "folder-folder",
    rootFolderExpanded: "folder-folder-open",
    fileExtensions: map(EXT),
    fileNames: map(NAMES),
    languageIds: map(LANGS),
    folderNames,
    folderNamesExpanded,
    hidesExplorerArrows: false
  };
}

const nerdCodepoints = () => [...new Set(Object.values(buildNerdIconTheme().iconDefinitions)
  .map(d => parseInt(d.fontCharacter.replace(/\\/g, ""), 16)))].sort((x, y) => x - y);

// ---------------------------------------------------------------- decoration colors (package.json)

// indent columns cycle through these, like the bracket colors but quieter
const INDENT = [P.string, P.number, P.type, P.func, P.param, P.keyword];

// Theme colors the extension's decorations use, so any theme can override them.
function contributedColors() {
  const color = (id, description, dark, light = dark) => ({ id: `eventHorizon.${id}`, description, defaults: { dark, light, highContrast: dark, highContrastLight: light } });
  return [
    color("tagForeground", "Text color of comment-tag pills.", P.onAccent, "#FFFFFF"),
    color("tagTodo", "TODO pill background.", P.string, "#0E7C66"),
    color("tagFixme", "FIXME and BUG pill background.", P.red, "#C0362F"),
    color("tagNote", "NOTE pill background.", P.blue, "#3554B8"),
    color("tagHack", "HACK and XXX pill background.", P.yellow, "#A35A00"),
    color("inlineErrorForeground", "Inline error message text.", P.error, "#C0362F"),
    color("inlineErrorBackground", "Background tint of a line with an error.", a(P.error, 0.1), "#C0362F14"),
    color("inlineWarningForeground", "Inline warning message text.", P.warning, "#A35A00"),
    color("inlineWarningBackground", "Background tint of a line with a warning.", a(P.warning, 0.06), "#A35A0010"),
    color("inlineInfoForeground", "Inline info message text.", P.info, "#3554B8"),
    color("inlineInfoBackground", "Background tint of a line with info.", "#00000000"),
    ...INDENT.map((c, i) => color(`indent${i + 1}`, `Indent column ${i + 1} tint.`, a(c, 0.07), a(c, 0.1))),
    ...INDENT.map((c, i) => color(`indentActive${i + 1}`, `Indent column ${i + 1} tint inside the block with the cursor.`, a(c, 0.13), a(c, 0.18))),
    color("foldedForeground", "Text of the hidden-lines pill after a folded block.", P.accent, "#C2560F"),
    color("foldedBackground", "Background of the hidden-lines pill.", a(P.accent, 0.16), "#C2560F1F"),
    color("blameForeground", "Git blame text at the end of the current line.", P.muted, "#8A847D"),
    color("trailingWhitespaceBackground", "Trailing spaces and tabs.", a(P.red, 0.28), "#C0362F33")
  ];
}

// ---------------------------------------------------------------- write

function writeAll(root = path.join(__dirname, "..")) {
  const themeFile = path.join(root, "themes", "event-horizon-color-theme.json");
  fs.mkdirSync(path.dirname(themeFile), { recursive: true });
  fs.writeFileSync(themeFile, JSON.stringify(buildTheme(), null, 2) + "\n");

  const iconsDir = path.join(root, "icons");
  fs.rmSync(path.join(iconsDir, "svg"), { recursive: true, force: true });
  fs.mkdirSync(path.join(iconsDir, "svg"), { recursive: true });
  const { json, svgs } = buildIconTheme();
  for (const [rel, content] of Object.entries(svgs)) fs.writeFileSync(path.join(iconsDir, rel), content + "\n");
  fs.writeFileSync(path.join(iconsDir, "event-horizon-tiles-icon-theme.json"), JSON.stringify(json, null, 2) + "\n");

  fs.writeFileSync(path.join(iconsDir, "event-horizon-nerd-icon-theme.json"), JSON.stringify(buildNerdIconTheme(), null, 2) + "\n");
  fs.mkdirSync(path.join(root, "fonts"), { recursive: true });
  fs.writeFileSync(path.join(root, "fonts", "nerd-codepoints.json"), JSON.stringify(nerdCodepoints()) + "\n");

  // hull product icons: stroke SVGs that build-fonts.py outlines into fonts/eh-hull.woff
  const hullDir = path.join(root, "product-icons", "svg");
  fs.rmSync(hullDir, { recursive: true, force: true });
  fs.mkdirSync(hullDir, { recursive: true });
  for (const name of Object.keys(HULL.DRAW)) fs.writeFileSync(path.join(hullDir, `${name}.svg`), HULL.svg(name) + "\n");
  fs.writeFileSync(path.join(root, "product-icons", "icons.json"), JSON.stringify(HULL.ICONS, null, 2) + "\n");

  const pkgFile = path.join(root, "package.json");
  const pkg = JSON.parse(fs.readFileSync(pkgFile, "utf8"));
  pkg.contributes.colors = contributedColors();
  fs.writeFileSync(pkgFile, JSON.stringify(pkg, null, 2) + "\n");
  return { colors: Object.keys(buildTheme().colors).length, icons: Object.keys(svgs).length };
}

if (require.main === module) {
  const out = writeAll();
  console.log(`theme: ${out.colors} workbench colors · icons: ${out.icons} svgs`);
}

module.exports = { buildTheme, buildIconTheme, buildNerdIconTheme, nerdCodepoints, contributedColors, writeAll };
