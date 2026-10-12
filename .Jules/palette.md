## 2026-09-17 - Roving TabIndex & Keyboard Arrow Navigation for ARIA Tablists
**Learning:** `role="tablist"` components require roving `tabIndex` (`0` for active tab, `-1` for inactive tabs) and keydown handling (`ArrowRight`, `ArrowLeft`, `Home`, `End`) so keyboard and screen reader users can navigate tabs without tabbing through every inactive tab stop.
**Action:** Always pair `role="tablist"` buttons with `tabIndex={activeTab === i ? 0 : -1}`, `onKeyDown` navigation handler, and DOM element refs for programmatic focus.

## 2026-09-27 - Focus Trapping & Focus Restoration in Accessible Modal Dialogs
**Learning:** Modal dialogs (`aria-modal="true"`) require focus trapping (`Tab` and `Shift+Tab`) inside the modal container and focus restoration (`document.activeElement`) upon closure to prevent keyboard focus from escaping into background content.
**Action:** When creating modal dialogs, store `document.activeElement` on open, focus the modal's primary element/close button, trap Tab key cycles within the modal container, and restore focus on unmount/close.

## 2026-10-03 - Focus Management & Screen Reader Live Announcements for Dynamic Form Item Lists
**Learning:** When users dynamically add/remove items in form lists, keyboard focus is easily lost to `<body>` on removal or requires extra Tab keystrokes on addition unless explicitly focused onto the newly created input or previous item element.
**Action:** Always pair dynamic list additions/deletions with target focus shifting (`pendingFocusIndexRef`) and an `aria-live="polite"` live region so keyboard and screen reader users maintain context.
