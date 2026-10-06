## 2026-09-17 - Roving TabIndex & Keyboard Arrow Navigation for ARIA Tablists
**Learning:** `role="tablist"` components require roving `tabIndex` (`0` for active tab, `-1` for inactive tabs) and keydown handling (`ArrowRight`, `ArrowLeft`, `Home`, `End`) so keyboard and screen reader users can navigate tabs without tabbing through every inactive tab stop.
**Action:** Always pair `role="tablist"` buttons with `tabIndex={activeTab === i ? 0 : -1}`, `onKeyDown` navigation handler, and DOM element refs for programmatic focus.

## 2026-09-27 - Focus Trapping & Focus Restoration in Accessible Modal Dialogs
**Learning:** Modal dialogs (`aria-modal="true"`) require focus trapping (`Tab` and `Shift+Tab`) inside the modal container and focus restoration (`document.activeElement`) upon closure to prevent keyboard focus from escaping into background content.
**Action:** When creating modal dialogs, store `document.activeElement` on open, focus the modal's primary element/close button, trap Tab key cycles within the modal container, and restore focus on unmount/close.

## 2026-10-06 - Accessible ARIA Progress Bars for Custom Metric Visualizations
**Learning:** Custom visual progress/metric bars rendered via styled `div`s are invisible to screen reader users unless explicitly tagged with `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, and a descriptive `aria-label`.
**Action:** Always annotate custom metric visualization bars with `role="progressbar"`, `aria-valuenow={val}`, `aria-valuemin={min}`, `aria-valuemax={max}`, and `aria-label="{Dimension}: {val} out of {max}"`.
