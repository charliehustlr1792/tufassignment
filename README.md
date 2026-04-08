# Wall Calendar Component

A production-grade, interactive wall calendar built with **Next.js 16**, **React 19**, **TypeScript**, and **Tailwind CSS 4**. Designed to closely replicate the aesthetic of a physical wall calendar with realistic page-flip animations.

![Next.js](https://img.shields.io/badge/Next.js-16.2-black)
![React](https://img.shields.io/badge/React-19.2-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4)

## Features

### Core Functionality
- **Interactive Date Range Selection** — Click to set start date, click again to set end date. Click a third time to reset and start a new range.
- **Hover Preview** — See the potential range highlighted before committing the second click.
- **Month Navigation** — Scroll (desktop) or swipe (mobile) to flip between months with a realistic page-turn animation.
- **Keyboard Navigation** — Arrow keys to move between days, Enter/Space to select.
- **Persistent Notes** — 8-line ruled notepad per month. Notes are saved to `localStorage` and persist across sessions.

### Visual Design
- **3-Layer Hero Section** — Shaped image with angled bottom edges, flanked by two cyan chevron overlays creating a distinctive V-pattern, matching the reference wall calendar design.
- **Spiral Binding** — Decorative spiral rings along the top edge.
- **Page Stack Effect** — Stacked pages peek from the bottom, simulating a real multi-page wall calendar.
- **Monthly Images** — Each month displays a unique themed image.
- **Page Flip Animation** — Smooth 3D perspective-based animation with shadow depth changes that simulates turning a physical calendar page.
- **Sound Effects** — Optional page-turn audio on month change.

### Design Details
- **Weekend Highlighting** — Saturday and Sunday displayed in teal/cyan (both headers and day numbers).
- **Today Indicator** — Dark pill with a cyan dot for the current date.
- **Holiday Markers** — Indian public holidays marked with red dots and tooltip on hover.
- **Responsive Layout** — Fits entirely within the viewport on desktop; touch-swipe enabled for mobile.

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| Next.js | 16.2.2 | React framework with App Router |
| React | 19.2.4 | UI library |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 4.x | Utility-first styling |
| date-fns | 4.1.0 | Date manipulation |

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd tufassignment

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
app/
  components/
    calendar/
      CalendarContainer.tsx   # Main orchestrator — layout, state, flip logic, touch/scroll handlers
      CalendarGrid.tsx        # 7-column weekday grid with day cells
      DayCell.tsx             # Individual day button with selection, hover, holiday states
      HeroImage.tsx           # 3-layer hero: left chevron, shaped image, right chevron with text
      NotesPanel.tsx          # Ruled notepad with per-month persistence
  types/
    calendar.ts               # TypeScript type definitions
  utils/
    dateUtils.ts              # Date generation and comparison helpers
    localStorage.ts           # Note serialization/deserialization
    soundEffects.ts           # Page-turn audio loader
  globals.css                 # Animations, fonts, theme variables
  layout.tsx                  # Root layout
  page.tsx                    # Entry point
public/
  months/                     # Monthly hero images
  sounds/                     # Page-flip audio
```

## Usage

| Action | Desktop | Mobile |
|---|---|---|
| Next month | Scroll down | Swipe up |
| Previous month | Scroll up | Swipe down |
| Select date | Click | Tap |
| Select range | Click start, then click end | Tap start, then tap end |
| Navigate days | Arrow keys | — |
| Add note | Click a ruled line | Tap a ruled line |

## Architecture Decisions

- **Two-sheet flip system** — During animation, both the outgoing and incoming month sheets exist simultaneously. The outgoing sheet rotates away while the incoming settles in, preventing any visual gap or flash.
- **CSS keyframe animations** — Pure CSS for the flip effect (no JS animation libraries), using `perspective`, `rotateX`, and `drop-shadow` for depth.
- **`date-fns`** — Chosen over native Date APIs for reliable, tree-shakeable date math without timezone footguns.
- **Local images** — Month images served from `/public/months/` for fast loading and offline reliability.
- **`localStorage` persistence** — Notes survive page refreshes without needing a backend.

## Shortcomings (Honest Self-Review)

- I could not replicate the hero section exactly like the reference image within the assignment timeframe. The overall direction is close, but the geometry, layering precision, and typography alignment are not pixel-perfect.
- The component still does not fully sell the illusion of a real wall calendar. It reads as a polished UI card in places instead of a physical hanging paper calendar.
- The scroll/swipe flip animation works, but it can still feel mechanical. Motion timing, easing, and depth transitions need refinement for a more natural page-turn feel.
- Mobile interaction quality is improved but not production-proof. Gesture handling is sensitive to edge cases and deserves stronger testing across devices and browsers.

## What Could Have Been Better

- Add a real event system (not just notes):
  - Event creation with title, time, and optional color/category.
  - Event badges directly inside day cells.
  - Event detail popover or panel.
  - Edit/delete support and recurring events.
- Improve visual fidelity:
  - Replace CSS-approximated decorative elements with high-quality assets/SVGs for spiral rings, pin, paper texture, and print-like shadows.
