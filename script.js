/* ========================================================================
   Simple Prayer Time — Countdown + Settings
   ======================================================================== */

// ======================== CONFIG ========================

const API_BASE = 'https://api.aladhan.com/v1';
const LOCATION = { lat: 23.7898, lng: 90.4253 };
const PRAYER_NAMES_BN = { fajr: 'ফজর', dhuhr: 'যোহর', asr: 'আসর', maghrib: 'মাগরিব', isha: 'ইশা' };
const PRAYER_NAMES_EN = { fajr: 'Fajr', dhuhr: 'Dhuhr', asr: 'Asr', maghrib: 'Maghrib', isha: 'Isha' };
const PRAYER_ORDER = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

// ======================== HELPERS ========================

function $(id) { return document.getElementById(id); }
function t2m(t) { const [h,m]=t.split(':'); return +h*60+ +m; }

function getNow() {
  const d = new Date();
  const utc = d.getTime() + d.getTimezoneOffset() * 60000;
  return new Date(utc + 6 * 3600000);
}

function pad(n) { return String(n).padStart(2, '0'); }

function toBn(n) {
  if (typeof n === 'string') n = parseInt(n);
  return String(n).split('').map(d => '০১২৩৪৫৬৭৮৯'[parseInt(d)] || d).join('');
}

// ======================== STATE ========================

let state = {
  lang: localStorage.getItem('lang') || 'bn',
  times: null,
  nextPrayer: null,
  progressPct: 0
};

// ======================== COUNTDOWN ========================

async function fetchTimes() {
  try {
    const now = getNow();
    const ds = `${now.getDate()}-${now.getMonth()+1}-${now.getFullYear()}`;
    const url = `${API_BASE}/timings/${ds}?latitude=${LOCATION.lat}&longitude=${LOCATION.lng}&method=1&school=1`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('API error');
    const d = await res.json();
    if (d.code !== 200) throw new Error('Invalid');
    const t = d.data.timings;
    state.times = {
      fajr: t.Fajr, sunrise: t.Sunrise, dhuhr: t.Dhuhr,
      asr: t.Asr, maghrib: t.Maghrib, isha: t.Isha
    };
    return true;
  } catch(e) {
    // Fallback
    state.times = {
      fajr: '04:15', sunrise: '05:15', dhuhr: '12:00',
      asr: '15:40', maghrib: '18:45', isha: '19:55'
    };
    return false;
  }
}

function findNext() {
  if (!state.times) return;
  const now = getNow();
  const cm = now.getHours() * 60 + now.getMinutes();
  const cs = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

  // Convert times to minutes
  const times = {};
  for (const key of PRAYER_ORDER) {
    times[key] = t2m(state.times[key]);
  }

  // Find current and next prayer
  let next = null;
  let current = null;
  for (let i = 0; i < PRAYER_ORDER.length; i++) {
    const key = PRAYER_ORDER[i];
    const tm = times[key];
    if (cm < tm) {
      next = { key, minutes: tm };
      current = i > 0 ? PRAYER_ORDER[i-1] : PRAYER_ORDER[PRAYER_ORDER.length-1];
      break;
    }
  }
  // If all passed, next is tomorrow's Fajr
  if (!next) {
    next = { key: 'fajr', minutes: times.fajr + 1440 };
    current = PRAYER_ORDER[PRAYER_ORDER.length - 1];
  }

  const nextMs = next.minutes * 60000;
  const nowMs = cs * 1000;
  let remaining = nextMs - nowMs;
  if (remaining <= 0) remaining += 86400000;

  // Calculate progress (percentage through current segment)
  const prevMin = current ? times[current] : 0;
  let dur = next.minutes - prevMin;
  if (dur <= 0) dur += 1440;
  const elapsed = cm - (prevMin > cm ? prevMin - 1440 : prevMin);
  const pct = Math.min(100, Math.max(0, (elapsed / dur) * 100));

  state.nextPrayer = { ...next, remaining };
  state.progressPct = pct;
}

function updateCountdown() {
  if (!state.nextPrayer) return;
  const n = state.nextPrayer;
  const remaining = n.remaining - 1000; // subtract 1 second each tick
  n.remaining = Math.max(0, remaining);

  // Display
  const h = Math.floor(remaining / 3600000);
  const m = Math.floor((remaining % 3600000) / 60000);
  const s = Math.floor((remaining % 60000) / 1000);
  $('countdownDisplay').textContent = `${pad(h)}:${pad(m)}:${pad(s)}`;

  // Prayer name
  const bn = state.lang === 'bn';
  if (bn) {
    $('nextPrayerName').textContent = PRAYER_NAMES_BN[n.key];
    $('timeRemainingLabelBn').classList.remove('hidden');
    $('timeRemainingLabelEn').classList.add('hidden');
  } else {
    $('nextPrayerName').textContent = PRAYER_NAMES_EN[n.key];
    $('timeRemainingLabelEn').classList.remove('hidden');
    $('timeRemainingLabelBn').classList.add('hidden');
  }
}

function updateProgress() {
  $('progressBar').style.width = `${state.progressPct}%`;
}

function tick() {
  findNext();
  updateCountdown();
  updateProgress();
}

// ======================== LANGUAGE ========================

function setLang(lang) {
  state.lang = lang;
  localStorage.setItem('lang', lang);

  document.querySelectorAll('#langToggle span').forEach(el => {
    el.classList.toggle('bg-emerald-600/20', el.dataset.lang === lang);
    el.classList.toggle('text-emerald-400', el.dataset.lang === lang);
    el.classList.toggle('border', el.dataset.lang === lang);
    el.classList.toggle('border-emerald-600/30', el.dataset.lang === lang);
    el.classList.toggle('rounded-xl', el.dataset.lang === lang);
    el.classList.toggle('text-gray-500', el.dataset.lang !== lang);
  });

  const bn = lang === 'bn';
  // Title
  $('appTitleBn').classList.toggle('hidden', !bn);
  $('appTitleEn').classList.toggle('hidden', bn);
  // Countdown labels
  $('nextPrayerLabelBn').classList.toggle('hidden', !bn);
  $('nextPrayerLabelEn').classList.toggle('hidden', bn);
  $('timeRemainingLabelBn').classList.toggle('hidden', !bn && (!state.nextPrayer || state.nextPrayer.remaining >= 0));
  $('timeRemainingLabelEn').classList.toggle('hidden', bn || !state.nextPrayer);
  // Nafil
  $('nafilTitle').textContent = bn ? 'নফল নামাজ' : 'Nafil';
  $('nafilTahajjud').textContent = bn ? 'তাহাজ্জুদ' : 'Tahajjud';
  $('nafilIshraq').textContent = bn ? 'ইশরাক' : 'Ishraq';
  $('nafilDuha').textContent = bn ? 'সালাতুদ দুহা' : 'Salatud Duha';
  $('nafilAwwabin').textContent = bn ? 'আওয়াবীন' : 'Awwabin';
  $('nafilIshraqTime').textContent = bn ? 'সূর্যোদয় +১৫মি' : 'Sunrise +15m';
  // Prohibited
  $('prohibitedTitle').textContent = bn ? 'নিষিদ্ধ সময়' : 'Prohibited';
  $('prohSunriseLabel').textContent = bn ? 'সূর্যোদয়' : 'Sunrise';
  $('prohNoonLabel').textContent = bn ? 'সূর্য মধ্যাকাশে' : 'Zenith';
  $('prohSunsetLabel').textContent = bn ? 'সূর্যাস্ত' : 'Sunset';
  $('prohFooter').textContent = bn ? 'ইফতার = মাগরিব; মাগরিবের নামাজ ২-৩ মিনিট পর' : 'Iftar = Maghrib; Maghrib prayer 2-3 min later';
  // Settings
  $('settingsTitle').textContent = bn ? 'সেটিংস' : 'Settings';
  $('langSettingLabel').textContent = bn ? 'ভাষা / Language' : 'Language';
  $('footerPowered').textContent = bn ? 'Powered by' : 'Powered by';
}

// ======================== WIDGET SIZING ========================

// Listen for IslamicFinder postMessage auto-height (if supported)
window.addEventListener('message', function(e) {
  if (e.origin !== 'https://www.islamicfinder.org') return;
  try {
    const d = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
    if (d.height && typeof d.height === 'number') {
      $('prayerWidget').style.height = d.height + 'px';
    }
  } catch {}
});

function sizeWidget() {
  const w = $('prayerWidget');
  if (!w) return;

  // IslamicFinder widget loads async; set initial reasonable height,
  // then rely on postMessage for exact sizing.
  w.style.height = '340px';

  // After load, try once more
  w.addEventListener('load', function onLoad() {
    // Give it a moment to render, then set a default if postMessage didn't fire
    setTimeout(() => {
      // If postMessage hasn't set a height yet, use a safe default
      if (w.style.height === '340px' || w.style.height === '0px') {
        w.style.height = '360px';
      }
    }, 2000);
  });
}

// ======================== INIT ========================

document.addEventListener('DOMContentLoaded', async function() {
  // ---- Language toggle ----
  $('langToggle').addEventListener('click', function(e) {
    const span = e.target.closest('span');
    if (span && span.dataset.lang) setLang(span.dataset.lang);
  });

  // ---- Settings ----
  $('settingsBtn').addEventListener('click', () => {
    $('settingsPanel').classList.add('open');
    $('overlay').classList.remove('hidden');
    $('overlay').classList.add('show');
  });
  function closeSettings() {
    $('settingsPanel').classList.remove('open');
    $('overlay').classList.add('hidden');
    $('overlay').classList.remove('show');
  }
  $('closeSettings').addEventListener('click', closeSettings);
  $('overlay').addEventListener('click', closeSettings);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSettings(); });

  // ---- Apply language ----
  setLang(state.lang);

  // ---- Load times + start countdown ----
  await fetchTimes();
  tick();
  setInterval(tick, 1000);

  // ---- Size widget ----
  sizeWidget();
});
