## 2026-09-17 - Roving TabIndex & Keyboard Arrow Navigation for ARIA Tablists
**Learning:** `role="tablist"` components require roving `tabIndex` (`0` for active tab, `-1` for inactive tabs) and keydown handling (`ArrowRight`, `ArrowLeft`, `Home`, `End`) so keyboard and screen reader users can navigate tabs without tabbing through every inactive tab stop.
**Action:** Always pair `role="tablist"` buttons with `tabIndex={activeTab === i ? 0 : -1}`, `onKeyDown` navigation handler, and DOM element refs for programmatic focus.
