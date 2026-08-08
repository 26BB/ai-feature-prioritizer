# DESIGN.md — Retro Vintage Paperback & Terracotta Yellow Design System

Synthesized design tokens and motion guidelines inspired by retro vintage paperbacks, warm vanilla cream backdrops, mustard yellow accents, and terracotta orange action buttons with hard-edged neo-brutalist borders and kinetic word motion animations.

---

## 🎨 Color Palette & Tokens

| Token | Hex / Value | Description / Reference from Image |
| :--- | :--- | :--- |
| `--bg-base` | `#F4ECE1` | Warm Vanilla Cream paper backdrop |
| `--bg-surface` | `#FAF4EC` | Soft paper beige surface card background |
| `--bg-surface-solid` | `#FFFDF9` | Clean paper white card background |
| `--bg-yellow` | `#FFDE59` | Retro Mustard Yellow header highlight |
| `--bg-orange` | `#F26725` | Terracotta Orange primary action background |
| `--primary` | `#F26725` | Terracotta Orange accent |
| `--primary-light` | `#FF8A48` | Warm Orange hover state |
| `--secondary` | `#FFDE59` | Bright Mustard Yellow secondary accent |
| `--border-subtle` | `#2B2521` | Dark vintage ink hairline border (1px solid) |
| `--border-bold` | `#1A1613` | Neo-brutalist 2px solid dark border |
| `--text-primary` | `#1A1613` | Deep vintage ink black |
| `--text-secondary` | `#524941` | Warm charcoal ink text |
| `--text-muted` | `#807469` | Muted paper text |
| `--shadow-retro` | `4px 4px 0px #1A1613` | Neo-brutalist hard offset shadow |

---

## 🔤 Typography & Motion Animation

### Typography
- **Headlines:** Sora / Serif (Bold, 800 weight, deep ink black `#1A1613`).
- **Body & Monospace:** Space Mono / Inter (Clean typewriter & technical aesthetic).

### Motion Animations for Words
1. **Shimmering Kinetic Text (`.animated-word-shimmer`):**
   Continuous multi-color gradient shimmer moving smoothly across key highlight words (`#F26725` → `#FFDE59` → `#E85D26`).
2. **Kinetic Word Wave (`.word-wave`):**
   Gentle up-and-down floating micro-motion on hover for interactive titles.
3. **Typewriter Pulse (`.typewriter-cursor`):**
   Retro pulsing cursor alongside hero text badges.
