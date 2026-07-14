# Prayer Times Bangladesh — Agent Guide

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
├── AGENTS.md       # This file
```

## Time Sources
1. **IslamicFinder Widget (primary display):** Embedded iframe showing prayer times per district. Widget URL: `https://www.islamicfinder.org/prayer-widget/{geonameId}/hanfi/3/0/18.0/18.0`
2. **Aladhan API (countdown & timers):** Used for: next-prayer countdown, progress bar, Tahajjud calculation, Duha timer, nafil times. API: `https://api.aladhan.com/v1/timings/{date}?latitude={lat}&longitude={lng}&method=1&school=1` (Hanafi school)
3. **GeoNames IDs:** IslamicFinder uses GeoNames IDs for locations. All 64 districts mapped in `DISTRICTS` array.

## Key Conventions
- **Language:** Bengali primary (`state.lang === 'bn'`). English via toggle that hides/shows `.hidden` elements
- **Theme:** CSS custom properties on `:root` / `[data-theme="light"]`. Toggle with `setTheme()`
- **Timezone:** Asia/Dhaka (UTC+6) — hardcoded `getNow()` adds 6h offset
- **Districts:** 64 districts in `DISTRICTS` array with `{bn, en, lat, lng, ifId}`. Selected district stored in `localStorage`
- **Prayer order:** `['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']`
- **GitHub:** `github.com/muhammadmahadi0/prayer-time` — push via PAT (no zip)

## Main Timer Behavior (updateCountdown)
The main countdown card at the top changes throughout the day:
- **Normal times:** Shows current prayer name + time remaining until next prayer
- **Sunrise prohibited period** (~sunrise to +15min): RED timer showing "সূর্যোদয় (নিষিদ্ধ)" / "Sunrise (prohibited)"
- **Salatud Duha period** (~sunrise+18min to Dhuhr-10min): Shows "সালাতুদ দুহা" / "Salatud Duha" + remaining time
- Label: "সময় বাকি আছে" / "Time left" (small text above prayer name)

## Prayer Times Flow
- `fetchTimes()` → Aladhan API → `state.times {fajr, sunrise, dhuhr, asr, maghrib, isha}`
- `findNext()` → determines current & next prayer → `state.nextPrayer`, `state.currentPrayer`
- `tick()` called every 1s → `findNext()` + `updateCountdown()` + `updateProgress()` + `updateDates()` + `updateNafil()`

## Nafil & Special Timers
- **Tahajjud:** Last 1/3 of night (Maghrib → Fajr, not Isha → Fajr)
- **Ishraq:** Sunrise + 15 min
- **Duha:** Sunrise + 18 min → Dhuhr - 10 min
- **Awwabin:** Maghrib → Isha
- **Prohibited times:** Sunrise (+15min), Zenith (Dhuhr -10min), Sunset

## Islamic Context
- User follows **Hanafi fiqh** (Hakimul Ummah Ashraf Ali Thanwi RH's methodology)
- Asr = Hanafi (school=1)
- Tahajjud night = Maghrib to Fajr (last third)
- Prohibited times observed strictly
- All labels in Bengali default, English fallback

## Common Gotchas
- Widget iframe is rebuilt on district change (`updateWidget()` replaces the iframe DOM node)
- Bengali genitive suffix: "এশা" → "এশার" (not "এশাএর"). Use `bnGenitive` lookup table
- Always verify JS syntax: `node -c script.js`
- Fallback times (Dhaka) used when Aladhan API fails
- Push via PAT: `https://{user}:{pat}@github.com/{repo}.git` — reset to `https://github.com/{repo}.git` after
