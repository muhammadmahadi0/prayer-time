/* ========================================================================
   Simple Prayer Time — Countdown + Settings
   ======================================================================== */

// ======================== CONFIG ========================

const API_BASE = 'https://api.aladhan.com/v1';
const GEO_API = 'https://ipapi.co/json/';
const PRAYER_NAMES_BN = { fajr: 'ফজর', dhuhr: 'যোহর', asr: 'আসর', maghrib: 'মাগরিব', isha: 'ইশা' };
const PRAYER_NAMES_EN = { fajr: 'Fajr', dhuhr: 'Dhuhr', asr: 'Asr', maghrib: 'Maghrib', isha: 'Isha' };
const PRAYER_ORDER = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

// ======================== HELPERS ========================

function $(id) { return document.getElementById(id); }
function t2m(t) { const [h,m]=t.split(':'); return +h*60+ +m; }

/** Return current time in a given UTC-offset timezone (default: +6 BD) */
function getNow(offset) {
  offset = offset != null ? offset : (state.tzOffset || 6);
  const d = new Date();
  const utc = d.getTime() + d.getTimezoneOffset() * 60000;
  return new Date(utc + offset * 3600000);
}

function pad(n) { return String(n).padStart(2, '0'); }

function toBn(n) {
  if (typeof n === 'string') n = parseInt(n);
  return String(n).split('').map(d => '০১২৩৪৫৬৭৮৯'[parseInt(d)] || d).join('');
}

// ======================== STATE ========================

let state = {
  lang: localStorage.getItem('lang') || 'bn',
  theme: localStorage.getItem('theme') || 'dark',
  times: null,
  nextPrayer: null,
  progressPct: 0,
  // Location
  lat: 23.7898,
  lng: 90.4253,
  city: 'Dhaka',
  country: 'Bangladesh',
  tzOffset: 6
};

// ======================== IP GEOLOCATION ========================

async function detectLocation() {
  try {
    const res = await fetch(GEO_API);
    if (!res.ok) throw new Error('geo fail');
    const d = await res.json();
    if (d.latitude && d.longitude) {
      state.lat = d.latitude;
      state.lng = d.longitude;
      state.city = d.city || d.region || 'Unknown';
      state.country = d.country_name || 'Unknown';
      state.tzOffset = d.utc_offset ? parseFloat(d.utc_offset) : state.tzOffset;
      // Save to localStorage so it persists
      localStorage.setItem('loc_city', state.city);
      localStorage.setItem('loc_country', state.country);
      return true;
    }
  } catch(e) { /* silent fail — keep default Dhaka */ }
  // Try fallback from localStorage
  const savedCity = localStorage.getItem('loc_city');
  if (savedCity) {
    state.city = savedCity;
    state.country = localStorage.getItem('loc_country') || state.country;
  }
  return false;
}

function updateLocationDisplay() {
  const bn = state.lang === 'bn';
  if (state.city && state.country) {
    $('locationDisplay').textContent = bn
      ? `${state.country} — ${state.city}`
      : `${state.city}, ${state.country}`;
  }
  // Show the auto-detect badge if we detected (not default Dhaka)
  const isAuto = state.city !== 'Dhaka' || state.country !== 'Bangladesh';
  $('autoBadge').classList.toggle('hidden', !isAuto);
}

// ======================== PRAYER TIMES ========================

async function fetchTimes() {
  try {
    const now = getNow();
    const ds = `${now.getDate()}-${now.getMonth()+1}-${now.getFullYear()}`;
    const url = `${API_BASE}/timings/${ds}?latitude=${state.lat}&longitude=${state.lng}&method=1&school=1`;
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
    // Fallback (approx Dhaka)
    state.times = {
      fajr: '03:54', sunrise: '05:20', dhuhr: '12:04',
      asr: '16:44', maghrib: '18:48', isha: '20:14'
    };
    return false;
  }
}

function findNext() {
  if (!state.times) return;
  const now = getNow();
  const cm = now.getHours() * 60 + now.getMinutes();
  const cs = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

  const times = {};
  for (const key of PRAYER_ORDER) {
    times[key] = t2m(state.times[key]);
  }

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
  if (!next) {
    next = { key: 'fajr', minutes: times.fajr + 1440 };
    current = PRAYER_ORDER[PRAYER_ORDER.length - 1];
  }

  const nextMs = next.minutes * 60000;
  const nowMs = cs * 1000;
  let remaining = nextMs - nowMs;
  if (remaining <= 0) remaining += 86400000;

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
  const remaining = n.remaining - 1000;
  n.remaining = Math.max(0, remaining);

  const h = Math.floor(remaining / 3600000);
  const m = Math.floor((remaining % 3600000) / 60000);
  const s = Math.floor((remaining % 60000) / 1000);
  $('countdownDisplay').textContent = `${pad(h)}:${pad(m)}:${pad(s)}`;

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
  updateDates();
  updateNafil();
  updateTimesTable();
}

// ======================== NAFIL TIMES ========================

function minToTimeStr(m) {
  m = ((m % 1440) + 1440) % 1440;
  const h = Math.floor(m / 60);
  const mn = Math.floor(m % 60);
  return `${pad(h)}:${pad(mn)}`;
}

function updateNafil() {
  if (!state.times) return;
  const f = t2m(state.times.fajr);
  const s = t2m(state.times.sunrise);
  const d = t2m(state.times.dhuhr);
  const m = t2m(state.times.maghrib);
  const i = t2m(state.times.isha);

  // --- Tahajjud: last 1/3 of night (Maghrib → Fajr) ---
  let nightDur;
  if (f < m) nightDur = (1440 - m) + f;
  else nightDur = f - m;
  if (nightDur <= 0) nightDur = 540;
  const lastThirdStart = (m + (2 / 3) * nightDur) % 1440;

  const tTime = minToTimeStr(lastThirdStart);
  const fTime = minToTimeStr(f);

  const bn = state.lang === 'bn';
  if (bn) {
    $('nafilTahajjudTime').textContent = `রাত ${tTime} — সাহরি (রাতের শেষ তৃতীয়াংশ)`;
  } else {
    $('nafilTahajjudTime').textContent = `~${tTime} — Fajr (last 1/3 of night)`;
  }
}

// ======================== TIMES TABLE ========================

function updateTimesTable() {
  if (!state.times) return;
  const bn = state.lang === 'bn';
  const labels = bn
    ? { fajr: 'ফজর', dhuhr: 'যোহর', asr: 'আসর', maghrib: 'মাগরিব', isha: 'ইশা' }
    : { fajr: 'Fajr', dhuhr: 'Dhuhr', asr: 'Asr', maghrib: 'Maghrib', isha: 'Isha' };

  const order = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
  for (const key of order) {
    const slot = $('timesGrid').querySelector(`[data-prayer="${key}"]`);
    if (!slot) continue;
    const t = state.times[key];
    if (t) {
      slot.querySelector('.time-value').textContent = t.slice(0, 5);
    }
    slot.querySelector('.time-label').textContent = labels[key];
  }

  // Highlight the current/next prayer
  const now = getNow();
  const cm = now.getHours() * 60 + now.getMinutes();
  const order2 = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
  let nextIdx = -1;
  for (let i = 0; i < order2.length; i++) {
    const tm = t2m(state.times[order2[i]]);
    if (cm < tm) { nextIdx = i; break; }
  }
  if (nextIdx === -1) nextIdx = 0; // next is fajr (tomorrow)

  // Class: highlight the NEXT prayer
  document.querySelectorAll('#timesGrid .time-slot').forEach(el => {
    el.classList.remove('slot-now', 'slot-next');
  });
  const activeEl = document.querySelector(`#timesGrid [data-prayer="${order2[nextIdx]}"]`);
  if (activeEl) activeEl.classList.add('slot-next');
}

// ======================== LANGUAGE ========================

function setLang(lang) {
  state.lang = lang;
  localStorage.setItem('lang', lang);

  document.querySelectorAll('#langToggle span').forEach(el => {
    el.classList.toggle('active', el.dataset.lang === lang);
  });
  // Theme toggle labels also
  document.querySelectorAll('#themeToggle span').forEach(el => {
    const bn = lang === 'bn';
    if (el.dataset.theme === 'dark') el.textContent = bn ? '◐ ডার্ক' : '◐ Dark';
    else el.textContent = bn ? '☀ লাইট' : '☀ Light';
  });

  updateLocationDisplay();

  const bn = lang === 'bn';
  $('appTitleBn').classList.toggle('hidden', !bn);
  $('appTitleEn').classList.toggle('hidden', bn);
  $('nextPrayerLabelBn').classList.toggle('hidden', !bn);
  $('nextPrayerLabelEn').classList.toggle('hidden', bn);
  $('timeRemainingLabelBn').classList.toggle('hidden', !bn && (!state.nextPrayer || state.nextPrayer.remaining >= 0));
  $('timeRemainingLabelEn').classList.toggle('hidden', bn || !state.nextPrayer);
  $('nafilTitle').textContent = bn ? 'নফল নামাজ' : 'Nafil';
  $('nafilTahajjud').textContent = bn ? 'তাহাজ্জুদ' : 'Tahajjud';
  $('nafilIshraq').textContent = bn ? 'ইশরাক' : 'Ishraq';
  $('nafilDuha').textContent = bn ? 'সালাতুদ দুহা' : 'Salatud Duha';
  $('nafilAwwabin').textContent = bn ? 'আওয়াবীন' : 'Awwabin';
  $('nafilIshraqTime').textContent = bn ? 'সূর্যোদয় +১৫মি' : 'Sunrise +15m';
  $('prohibitedTitle').textContent = bn ? 'নিষিদ্ধ সময়' : 'Prohibited';
  $('prohSunriseLabel').textContent = bn ? 'সূর্যোদয়' : 'Sunrise';
  $('prohNoonLabel').textContent = bn ? 'সূর্য মধ্যাকাশে' : 'Zenith';
  $('prohSunsetLabel').textContent = bn ? 'সূর্যাস্ত' : 'Sunset';
  $('prohFooter').textContent = bn ? 'ইফতার = মাগরিব; মাগরিবের নামাজ ২-৩ মিনিট পর' : 'Iftar = Maghrib; Maghrib prayer 2-3 min later';
  $('settingsTitle').textContent = bn ? 'সেটিংস' : 'Settings';
  $('langSettingLabel').textContent = bn ? 'ভাষা / Language' : 'Language';
  $('themeSettingLabel').textContent = bn ? 'থিম / Theme' : 'Theme';
  $('footerPowered').textContent = bn ? 'Powered by' : 'Powered by';
}

// ======================== THEME ========================

function setTheme(theme) {
  state.theme = theme;
  localStorage.setItem('theme', theme);
  document.documentElement.setAttribute('data-theme', theme);

  document.querySelectorAll('#themeToggle span').forEach(el => {
    el.classList.toggle('active', el.dataset.theme === theme);
  });

  const isDark = theme === 'dark';
  $('themeIconSun').classList.toggle('hidden', isDark);
  $('themeIconMoon').classList.toggle('hidden', !isDark);
  const btn = $('themeBtn');
  if (isDark) {
    btn.style.background = '';
    btn.querySelector('i').style.color = '';
  } else {
    btn.style.background = '#e2e8f0';
    btn.querySelector('i').style.color = '#f59e0b';
  }
}

// ======================== BENGALI DATE ========================

const BN_MONTHS = [
  { en: 'Boishakh',  bn: 'বৈশাখ',  ms: 4, ds: 14 },
  { en: 'Joishtho',  bn: 'জ্যৈষ্ঠ', ms: 5, ds: 15 },
  { en: 'Ashaarh',   bn: 'আষাঢ়',  ms: 6, ds: 15 },
  { en: 'Srabon',    bn: 'শ্রাবণ',  ms: 7, ds: 16 },
  { en: 'Bhadro',    bn: 'ভাদ্র',   ms: 8, ds: 17 },
  { en: 'Ashshin',   bn: 'আশ্বিন',  ms: 9, ds: 17 },
  { en: 'Kartik',    bn: 'কার্তিক', ms: 10, ds: 16 },
  { en: 'Agrahayon', bn: 'অগ্রহায়ণ', ms: 11, ds: 15 },
  { en: 'Poush',     bn: 'পৌষ',    ms: 12, ds: 15 },
  { en: 'Magh',      bn: 'মাঘ',    ms: 1, ds: 14 },
  { en: 'Falgun',    bn: 'ফাল্গুন', ms: 2, ds: 13 },
  { en: 'Choitro',   bn: 'চৈত্র',   ms: 3, ds: 15 }
];
const BN_DAYS = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
const BN_MONTH_NAMES = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];

function getBanglaDate(g) {
  const y = g.getFullYear(), m = g.getMonth() + 1, d = g.getDate();
  const by = (m > 4 || (m === 4 && d >= 14)) ? y - 593 : y - 594;
  let startYear = y;
  if (m < 4 || (m === 4 && d < 14)) startYear = y - 1;
  const ye = BN_MONTHS.map(mm => {
    let ty = startYear;
    if (mm.ms <= 3) ty = startYear + 1;
    return { ...mm, date: new Date(ty, mm.ms - 1, mm.ds) };
  });
  let bm = ye[0];
  for (const ms of ye) { if (ms.date <= g) bm = ms; }
  const diff = Math.floor((g - bm.date) / 86400000);
  return { day: diff + 1, monthEn: bm.en, monthBn: bm.bn, year: by };
}

function updateDates() {
  const now = getNow();
  const bd = getBanglaDate(now);
  $('banglaDateDisplay').textContent = `${toBn(bd.day)} ${bd.monthBn} ${toBn(bd.year)}`;
  const wd = BN_DAYS[now.getDay()];
  const mn = BN_MONTH_NAMES[now.getMonth()];
  $('gregorianDateDisplay').textContent = `${wd}, ${toBn(now.getDate())} ${mn} ${toBn(now.getFullYear())}`;
}

// ======================== WIDGET ========================

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
  w.style.height = '340px';
  w.addEventListener('load', function onLoad() {
    setTimeout(() => {
      if (w.style.height === '340px' || w.style.height === '0px') {
        w.style.height = '360px';
      }
    }, 2000);
  });
}

// ======================== INIT ========================

document.addEventListener('DOMContentLoaded', async function() {
  // ---- Geolocation ----
  await detectLocation();
  updateLocationDisplay();

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

  // ---- Theme toggle ----
  $('themeBtn').addEventListener('click', () => {
    setTheme(state.theme === 'dark' ? 'light' : 'dark');
  });
  $('themeToggle').addEventListener('click', function(e) {
    const span = e.target.closest('span');
    if (span && span.dataset.theme) setTheme(span.dataset.theme);
  });
  setTheme(state.theme);

  // ---- Load times + start countdown ----
  await fetchTimes();
  tick();
  setInterval(tick, 1000);

  // ---- Size widget ----
  sizeWidget();
});
