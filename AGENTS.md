# Prayer Times Bangladesh — Agent Guide

**IMPORTANT:** Always read this file first before starting any work. After making changes, update this file to reflect the new state. Do NOT re-read source files repeatedly — use this doc as the single source of truth for project context.

## Project Overview
A single-page Islamic prayer times widget for Bangladesh, supporting all 64 districts. Built as a static HTML/CSS/JS page served via GitHub Pages.

## Tech Stack
- **Stack:** HTML5 + Tailwind CSS (CDN) + Vanilla JS
- **UI:** Bengali (default) with English toggle, dark/light theme
- **Accent:** green (#10b981 / #059669)
- **Design:** mobile-first, card-based, dark glassmorphism
- **No build step, no framework, no npm**

## File Structure
```
~/work/prayer-times/
├── index.html      # Main page: countdown, widget, settings
├── script.js       # All JS: state, API, countdown, timers
├── style.css       # CSS variables, theme, layout
├── AGENTS.md       # This file — read first, update after changes
```

## Time Sources
1. **IslamicFinder Widget (primary display):** Embedded iframe showing prayer times per district. Widget URL: `https://www.islamicfinder.org/prayer-widget/{geonameId}/hanfi/3/0/18.0/18.0`
2. **Aladhan API (countdown & timers):** Used for: next-prayer countdown, progress bar, Tahajjud calculation, Ishraq/Chasht timers, nafil times. API: `https://api.aladhan.com/v1/timings/{date}?latitude={lat}&longitude={lng}&method=1&school=1` (Hanafi school)
3. **GeoNames IDs:** IslamicFinder uses GeoNames IDs for locations. All 64 districts mapped in `DISTRICTS` array.

## Key Conventions
- **Language:** Bengali primary (`state.lang === 'bn'`). English via toggle that hides/shows `.hidden` elements
- **Theme:** CSS custom properties on `:root` / `[data-theme="light"]`. Toggle with `setTheme()`
- **Timezone:** Asia/Dhaka (UTC+6) — hardcoded `getNow()` adds 6h offset
- **Districts:** 64 districts in `DISTRICTS` array with `{bn, en, lat, lng, ifId}`. Selected district stored in `localStorage`
- **Prayer order:** `['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']`
- **GitHub:** `github.com/muhammadmahadi0/prayer-time` — push via PAT (no zip)

## Main Timer Behavior (updateCountdown)
The main countdown card at the top changes throughout the day. The three morning phases:

### 1. Sunrise Prohibited (RED)
- **Period:** Sunrise → Sunrise+15min
- **Display:** RED timer + "সূর্যোদয় (নিষিদ্ধ)" / "Sunrise (prohibited)"
- **Counts down to:** end of prohibited period

### 2. Ishraq (first 2 hours after prohibited)
- **Period:** Sunrise+15min → Sunrise+2hr15min (ishraqEnd)
- **Display:** "ইশরাক" / "Ishraq" + timer
- **Counts down to:** Dhuhr-10min (chashtEnd) — same target as Chasht

### 3. Chasht (from 2hr mark to Dhuhr)
- **Period:** Sunrise+2hr15min → Dhuhr-10min (chashtEnd)
- **Display:** "চাশত" / "Chasht" + timer
- **Counts down to:** Dhuhr-10min (same target as Ishraq)

### Normal Time (rest of day)
- Shows current prayer (Fajr/Dhuhr/Asr/Maghrib/Isha) + time remaining until next prayer
- Label: "সময় বাকি আছে" / "Time left"

## Prayer Times Flow
- `fetchTimes()` → Aladhan API → `state.times {fajr, sunrise, dhuhr, asr, maghrib, isha}`
- `findNext()` → determines current & next prayer → `state.nextPrayer`, `state.currentPrayer`
- `tick()` called every 1s → `findNext()` + `updateCountdown()` + `updateProgress()` + `updateDates()` + `updateNafil()`

## Nafil & Special Timers
| Name | Time | Details |
|---|---|---|
| **Tahajjud** | Last 1/3 of night | Night = Maghrib → Fajr (not Isha → Fajr) |
| **Ishraq** | Sunrise+15m → +2hr15m | Starts immediately after prohibited period (no delay) |
| **Chasht** | Sunrise+2hr15m → Dhuhr-10m | Also called Salatud Duha |
| **Awwabin** | Maghrib → Isha | |
| **Prohibited: Sunrise** | Sunrise → +15min | RED timer |
| **Prohibited: Zenith** | Dhuhr - 10min | |
| **Prohibited: Sunset** | Before sunset | |

## Islamic Context
- User follows **Hanafi fiqh** (Hakimul Ummah Ashraf Ali Thanwi RH's methodology)
- Asr = Hanafi (school=1)
- Tahajjud night = Maghrib to Fajr (last third)
- Prohibited times observed strictly
- All labels in Bengali default, English fallback

## Common Gotchas
- **Always read AGENTS.md first** before touching source files
- Widget iframe is rebuilt on district change (`updateWidget()` replaces the iframe DOM node)
- Bengali genitive suffix: "এশা" → "এশার" (not "এশাএর"). Use `bnGenitive` lookup table
- Always verify JS syntax: `node -c script.js`
- Fallback times (Dhaka) used when Aladhan API fails
- Push via PAT: `https://{user}:{pat}@github.com/{repo}.git` — reset to `https://github.com/{repo}.git` after
- When user asks for MINIMAL changes, only change text content — don't restructure HTML/CSS
