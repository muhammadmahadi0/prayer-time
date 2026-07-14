/* ========================================================================
   Prayer Times — JavaScript (IslahBD-style) v2
   Full segment timeline with countdowns
   ======================================================================== */

// ======================== CONFIG ========================

const API_BASE = 'https://api.aladhan.com/v1';

const LOCATIONS = {
  badda:     { name: 'বাড্ডা',     nameEn: 'Badda',     lat: 23.7898, lng: 90.4253 },
  dhaka:     { name: 'ঢাকা',       nameEn: 'Dhaka',     lat: 23.8103, lng: 90.4125 },
  chittagong:{ name: 'চট্টগ্রাম',  nameEn: 'Chattogram',lat: 22.3569, lng: 91.7832 },
  sylhet:    { name: 'সিলেট',      nameEn: 'Sylhet',    lat: 24.8949, lng: 91.8687 },
  khulna:    { name: 'খুলনা',      nameEn: 'Khulna',    lat: 22.8456, lng: 89.5403 },
  rajshahi:  { name: 'রাজশাহী',    nameEn: 'Rajshahi',  lat: 24.3745, lng: 88.6041 },
  barisal:   { name: 'বরিশাল',     nameEn: 'Barisal',   lat: 22.7010, lng: 90.3535 },
  rangpur:   { name: 'রংপুর',      nameEn: 'Rangpur',   lat: 25.7468, lng: 89.2504 },
  mymensingh:{ name: 'ময়মনসিংহ',   nameEn: 'Mymensingh',lat: 24.7471, lng: 90.4203 }
};

const PRAYER_KEYS = ['fajr','dhuhr','asr','maghrib','isha'];

const PRAYER_NAMES_BN = { fajr: 'ফজর', dhuhr: 'যোহর', asr: 'আসর', maghrib: 'মাগরিব', isha: 'ইশা' };
const PRAYER_NAMES_EN = { fajr: 'Fajr', dhuhr: 'Dhuhr', asr: 'Asr', maghrib: 'Maghrib', isha: 'Isha' };

const HIJRI_MONTHS = ['Muharram','Safar','Rabi al-Awwal','Rabi al-Thani','Jumada al-Awwal','Jumada al-Thani','Rajab',"Sha'ban",'Ramadan','Shawwal','Dhu al-Qidah','Dhu al-Hijjah'];
const HIJRI_MONTHS_BN = ['মুহাররম','সফর','রবিউল আউয়াল','রবিউস সানি','জমাদিউল আউয়াল','জমাদিউস সানি','রজব','শাবান','রমযান','শাওয়াল','জিলকদ','জিলহজ্জ'];

const FAQ_DATA = {
  bn: [
    { q: 'নামাজের সময় কত নির্ভুল?', a: 'University of Islamic Sciences, Karachi পদ্ধতি অনুসরণ করি। স্থানীয় ভৌগোলিক অবস্থানের ভিত্তিতে ১-২ মিনিট পার্থক্য থাকতে পারে।' },
    { q: 'সাহরী ও ইফতার নির্ধারণ?', a: 'সাহরীর শেষ = ফজর, ইফতার = মাগরিব। Aladhan API থেকে রিয়েল-টাইম ডেটা।' },
    { q: 'নিষিদ্ধ সময়গুলো কী?', a: 'সূর্যোদয়ের ১৮ মিনিট, যোহরের ১০ মিনিট আগে (দুপুরের শীর্ষে), সূর্যাস্তের ১৮ মিনিট আগে — এই তিন সময় নামাজ নিষিদ্ধ।' },
    { q: 'ইশরাক ও সালাতুদ দুহা কী?', a: 'সূর্যোদয়ের ১৮ মিনিট পর থেকে যোহরের ১০ মিনিট আগে পর্যন্ত ইশরাক/সালাতুদ দুহার সময়। এই সময়ে নফল নামাজ পড়া যায়।' },
    { q: 'অবস্থান সনাক্তকরণ?', a: 'IP এড্রেস থেকে অটো। ড্রপডাউন থেকে নিজেও সিলেক্ট করতে পারেন।' },
    { q: 'হিজরী তারিখ মাগরিবের পর পরিবর্তন?', a: 'ইসলামী দিন শুরু হয় মাগরিব থেকে। তাই মাগরিবের পর তারিখ ১ দিন এগিয়ে যায়।' }
  ],
  en: [
    { q: 'How accurate are prayer times?', a: 'We use the University of Islamic Sciences, Karachi method. 1-2 min variation possible based on geography.' },
    { q: 'How are Sahri & Iftar determined?', a: 'Sahri ends at Fajr, Iftar at Maghrib. Real-time data from Aladhan API.' },
    { q: 'Which times are prohibited?', a: '18 min after sunrise, 10 min before Dhuhr (zenith), 18 min before Maghrib (sunset).' },
    { q: 'What is Ishraq & Salatud Duha?', a: 'After 18 min from sunrise until 10 min before Dhuhr. Voluntary prayer time.' },
    { q: 'How is location detected?', a: 'Auto-detected from IP. You can also select manually from the dropdown.' },
    { q: 'Why does Hijri date change after Maghrib?', a: 'Islamic day starts at Maghrib, not midnight. Date advances after Maghrib.' }
  ]
};


// ======================== STATE ========================

let state = {
  lang: 'bn',
  loc: null,
  times: null,
  hijri: null,
  segment: null,        // current segment { id, nameBn, nameEn, startMin, endMin, type }
  nextSegment: null,
  countdownMs: 0,
  remainingMs: 0,
  progressPct: 0,
  loading: true,
  detectedLocation: null,
  locationLoading: true,
  locationManual: false
};


// ======================== HELPERS ========================

function $(id) { return document.getElementById(id); }

function toBn(n) {
  if (typeof n === 'string') n = parseInt(n);
  return String(n).split('').map(d => '০১২৩৪৫৬৭৮৯'[parseInt(d)] || d).join('');
}

function pad(n) { return String(n).padStart(2, '0'); }

function getNow() {
  const d = new Date();
  const utc = d.getTime() + d.getTimezoneOffset() * 60000;
  return new Date(utc + 6 * 3600000);
}

function getCM() {
  const n = getNow();
  return n.getHours() * 60 + n.getMinutes();
}

function timeToMin(str) {
  if (!str) return 0;
  const [h, m] = str.split(':').map(Number);
  return h * 60 + m;
}

function minToStr(m) {
  m = ((m % 1440) + 1440) % 1440;
  return `${pad(Math.floor(m / 60))}:${pad(Math.round(m % 60))}`;
}

function formatCD(ms) {
  if (ms <= 0) return '০০:০০:০০';
  const ts = Math.floor(ms / 1000);
  const h = Math.floor(ts / 3600);
  const m = Math.floor((ts % 3600) / 60);
  const s = ts % 60;
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

function formatCDbn(ms) {
  return formatCD(ms).split('').map(d => '০১২৩৪৫৬৭৮৯'[parseInt(d)] || d).join('');
}


// ======================== SEGMENT SYSTEM ========================

const SEGMENT_PROHIBITED_OFFSET = 15; // minutes after sunrise / before sunset
const SEGMENT_DHUHR_OFFSET = 10;      // minutes before Dhuhr

/** Build the full timeline segments from prayer times */
function buildSegments(t) {
  const f = timeToMin(t.fajr);
  const s = timeToMin(t.sunrise);
  const d = timeToMin(t.dhuhr);
  const a = timeToMin(t.asr);
  const m = timeToMin(t.maghrib);
  const i = timeToMin(t.isha);

  return [
    { id: 'isha',     start: i, end: f + 1440, type: 'prayer',    nameBn: 'ইশা/তাহাজ্জুদ',    nameEn: 'Isha/Tahajjud' },
    { id: 'fajr',     start: f, end: s,        type: 'prayer',    nameBn: 'ফজর',              nameEn: 'Fajr' },
    { id: 'prohibited_sunrise', start: s, end: s + SEGMENT_PROHIBITED_OFFSET, type: 'prohibited', nameBn: 'নিষিদ্ধ (সূর্যোদয়)', nameEn: 'Prohibited (Sunrise)' },
    { id: 'ishraq',   start: s + SEGMENT_PROHIBITED_OFFSET, end: d - SEGMENT_DHUHR_OFFSET, type: 'optional', nameBn: 'ইশরাক/সালাতুদ দুহা', nameEn: 'Ishraq/Salatud Duha' },
    { id: 'prohibited_noon', start: d - SEGMENT_DHUHR_OFFSET, end: d, type: 'prohibited', nameBn: 'নিষিদ্ধ (যোহরের পূর্বে)', nameEn: 'Prohibited (Before Dhuhr)' },
    { id: 'dhuhr',    start: d, end: a,        type: 'prayer',    nameBn: 'যোহর',             nameEn: 'Dhuhr' },
    { id: 'asr',      start: a, end: m,        type: 'prayer',    nameBn: 'আসর',              nameEn: 'Asr' },
    { id: 'prohibited_sunset', start: m - SEGMENT_PROHIBITED_OFFSET, end: m, type: 'prohibited', nameBn: 'নিষিদ্ধ (সূর্যাস্ত)', nameEn: 'Prohibited (Sunset)' },
    { id: 'maghrib',  start: m, end: i,        type: 'prayer',    nameBn: 'মাগরিব/ইফতার',     nameEn: 'Maghrib/Iftar' }
  ];
}

function findSegment(segs, cm) {
  if (!segs) return null;
  for (const seg of segs) {
    let end = seg.end;
    if (end <= seg.start) end += 1440;
    // Check both cm and cm+1440 (handles Isha→Fajr wrap at midnight)
    if ((cm >= seg.start && cm < end) || (cm + 1440 >= seg.start && cm + 1440 < end)) return seg;
  }
  return null;
}

function getNextSeg(segs, cm) {
  if (!segs) return null;
  let curIdx = -1;
  for (let i = 0; i < segs.length; i++) {
    const seg = segs[i];
    let end = seg.end;
    if (end <= seg.start) end += 1440;
    if ((cm >= seg.start && cm < end) || (cm + 1440 >= seg.start && cm + 1440 < end)) { curIdx = i; break; }
  }
  if (curIdx < 0) {
    // fallback: find first upcoming segment
    for (let i = 0; i < segs.length; i++) { if (cm < segs[i].start) return segs[i]; }
    return segs[0];
  }
  return segs[(curIdx + 1) % segs.length];
}

function getCS() {
  const n = getNow();
  return n.getHours() * 3600 + n.getMinutes() * 60 + n.getSeconds();
}

function segRemaining(seg, cm) {
  if (!seg) return 0;
  let end = seg.end;
  if (end <= seg.start) end += 1440;
  const nowMin = cm;
  // If segment wraps past midnight (end > 1440) and we're in the wrapped portion
  if (end > 1440 && nowMin < (end % 1440)) {
    return ((end % 1440) - nowMin) * 60000;
  }
  if (nowMin >= end) return 0;
  return (end - nowMin) * 60000;
}

/** Second-precision remaining ms — for real-time countdown in the circular timer */
function segRemainingMs(seg, cs) {
  if (!seg) return 0;
  let endSec = seg.end * 60; // convert minutes → seconds
  if (endSec <= seg.start * 60) endSec += 86400;
  // If segment wraps past midnight and we're in the wrapped portion
  if (endSec > 86400 && cs < (endSec % 86400)) {
    return ((endSec % 86400) - cs) * 1000;
  }
  if (cs >= endSec) return 0;
  return (endSec - cs) * 1000;
}

/** Second-precision progress % — smooth ring animation */
function segProgressMs(seg, cs) {
  const startSec = seg.start * 60;
  let endSec = seg.end * 60;
  if (endSec <= startSec) endSec += 86400;
  const dur = endSec - startSec;
  if (dur <= 0) return 0;
  // Handle segments that wrap past midnight (e.g., Isha→Fajr)
  const elapsed = (cs < startSec) ? (cs + (86400 - startSec)) : (cs - startSec);
  return Math.min(100, Math.max(0, (elapsed / dur) * 100));
}

function segDuration(seg) {
  if (!seg) return 0;
  let dur = seg.end - seg.start;
  if (dur <= 0) dur += 1440;
  return dur * 60000;
}

function segProgress(seg, cm) {
  const dur = segDuration(seg);
  if (dur <= 0) return 0;
  const remain = segRemaining(seg, cm);
  return Math.min(100, Math.max(0, ((dur - remain) / dur) * 100));
}


// ======================== IP GEOLOCATION ========================

async function detectLocationFromIP() {
  const cacheKey = 'islahbd_detected_location';
  const cacheDuration = 24 * 60 * 60 * 1000;

  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed.detectedAt && (Date.now() - parsed.detectedAt < cacheDuration)) return parsed;
    }
  } catch(e) {}

  try {
    const res = await fetch('https://ipapi.co/json/');
    if (res.ok) {
      const data = await res.json();
      const loc = { city: data.city, lat: data.latitude, lng: data.longitude, country: data.country_code, detectedAt: Date.now() };
      try { localStorage.setItem(cacheKey, JSON.stringify(loc)); } catch(e) {}
      return loc;
    }
  } catch(e) {}

  try {
    const res = await fetch('https://ip-api.com/json/');
    if (res.ok) {
      const data = await res.json();
      if (data.status === 'success') {
        const loc = { city: data.city, lat: data.lat, lng: data.lon, country: data.countryCode, detectedAt: Date.now() };
        try { localStorage.setItem(cacheKey, JSON.stringify(loc)); } catch(e) {}
        return loc;
      }
    }
  } catch(e) {}

  return { city: 'Dhaka', lat: 23.8103, lng: 90.4125, country: 'BD', detectedAt: Date.now() };
}

function matchCityToKey(cityName) {
  if (!cityName) return null;
  const c = cityName.toLowerCase().trim();
  for (const key of Object.keys(LOCATIONS)) {
    if (c === key || c === LOCATIONS[key].nameEn.toLowerCase()) return key;
  }
  if (c.includes('dhaka')||c.includes('mirpur')||c.includes('gazipur')||c.includes('uttara')||c.includes('savar')||c.includes('tongi')||c.includes('narayanganj')||c.includes('badda')||c.includes('demra')||c.includes('keraniganj')) return 'badda';
  if (c.includes('chattogram')||c.includes('chittagong')) return 'chittagong';
  if (c.includes('sylhet')) return 'sylhet';
  if (c.includes('khulna')) return 'khulna';
  if (c.includes('barisal')||c.includes('barishal')) return 'barisal';
  if (c.includes('rajshahi')) return 'rajshahi';
  if (c.includes('rangpur')) return 'rangpur';
  if (c.includes('mymensingh')||c.includes('momenshahi')) return 'mymensingh';
  return null;
}


// ======================== API ========================

async function fetchPrayerTimes(locKey) {
  const loc = LOCATIONS[locKey];
  const now = getNow();
  const dateStr = `${now.getDate()}-${now.getMonth()+1}-${now.getFullYear()}`;
  const cacheKey = `islahbd_times_${locKey}_${dateStr}`;

  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const p = JSON.parse(cached);
      if (p.date === dateStr && p.loc === locKey) {
        state.times = p.times;
        state.rawHijri = p.rawHijri || null;
        state.hijri = getAdjustedHijri(state.rawHijri, state.times.maghrib);
        return;
      }
    }
  } catch(e) {}

  try {
    const url = `${API_BASE}/timings/${dateStr}?latitude=${loc.lat}&longitude=${loc.lng}&method=1&school=1&timetype=24`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    if (data.code !== 200 || !data.data) throw new Error('Invalid response');

    const t = data.data.timings;
    state.times = { fajr: t.Fajr, sunrise: t.Sunrise, dhuhr: t.Dhuhr, asr: t.Asr, maghrib: t.Maghrib, isha: t.Isha };

    if (data.data.date && data.data.date.hijri) {
      const h = data.data.date.hijri;
      const monthDays = parseInt(h.month.days) || 30;
      state.rawHijri = {
        day: parseInt(h.day),
        month: h.month.en,
        year: parseInt(h.year),
        monthDays: monthDays
      };
      state.hijri = getAdjustedHijri(state.rawHijri, state.times.maghrib);
    }

    try {
      localStorage.setItem(cacheKey, JSON.stringify({
        date: dateStr, loc: locKey, times: state.times, rawHijri: state.rawHijri
      }));
    } catch(e) {}
  } catch(e) {
    console.warn('API failed, using fallback times');
    state.times = { fajr: '04:08', sunrise: '05:15', dhuhr: '12:00', asr: '15:30', maghrib: '18:42', isha: '19:52' };
    state.rawHijri = { day: 18, month: 'Muharram', year: 1448, monthDays: 30 };
    state.hijri = getAdjustedHijri(state.rawHijri, state.times.maghrib);
  }
}


// ======================== COMPUTATION (per-second) ========================

function tick() {
  if (!state.times) return;
  const segs = buildSegments(state.times);
  const cm = getCM();
  const now = getNow();
  const cs = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  const cur = findSegment(segs, cm);
  const next = getNextSeg(segs, cm);
  const changed = !cur || !state.segment || cur.id !== state.segment.id;
  state.segment = cur;
  state.nextSegment = next;

  // Use second-precision for live countdown & smooth ring
  state.remainingMs = segRemainingMs(cur, cs);
  state.countdownMs = state.remainingMs;
  state.progressPct = segProgressMs(cur, cs);

  // Recompute Hijri date (advances at Maghrib)
  if (state.rawHijri) {
    const newHijri = getAdjustedHijri(state.rawHijri, state.times.maghrib);
    const hijriChanged = !state.hijri || newHijri.day !== state.hijri.day || newHijri.month !== state.hijri.month;
    state.hijri = newHijri;
    if (hijriChanged) changed = true;
  }

  if (changed) {
    fullRender();
  } else {
    updateStatusBar();
    updateProgressRing();
    updatePrayerListStates();
  }
}

function updateClock() {
  if (state.times) {
    $('sunriseTime').textContent = state.times.sunrise;
    $('sunsetTime').textContent = state.times.maghrib;
  }
}


// ======================== RENDERERS ========================

function fullRender() {
  if (state.loading || !state.times || !state.segment) return;
  updateHeader();
  updateStatusBar();
  updatePrayerList();
  updateProhibitedTimes();
  updateProgressRing();
}

function updateHeader() {
  const now = getNow();
  // Location — display as text (no dropdown)
  const locKey = state.loc || 'badda';
  const loc = LOCATIONS[locKey] || LOCATIONS['badda'];
  const locName = state.lang === 'bn' ? loc.name : loc.nameEn;
  if ($('locationName')) $('locationName').textContent = locName;
  if ($('autoBadge')) {
    $('autoBadge').style.display = state.locationManual ? 'none' : 'inline';
  }

  // Hijri — adjusted for BD moon sighting + advances after Maghrib
  if (state.hijri) {
    const d = state.hijri.day;
    const mName = state.hijri.month;
    const y = state.hijri.year;
    const idx = HIJRI_MONTHS.indexOf(mName);
    $('hijriDate').textContent = state.lang === 'bn'
      ? `${toBn(d)} ${HIJRI_MONTHS_BN[idx >= 0 ? idx : 0]} ${toBn(y)}`
      : `${d} ${mName} ${y} AH`;
  } else {
    $('hijriDate').textContent = '--';
  }

  // Gregorian
  const wd = ['রবিবার','সোমবার','মঙ্গলবার','বুধবার','বৃহস্পতিবার','শুক্রবার','শনিবার'];
  const wdEn = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const mo = ['জানুয়ারি','ফেব্রুয়ারি','মার্চ','এপ্রিল','মে','জুন','জুলাই','আগস্ট','সেপ্টেম্বর','অক্টোবর','নভেম্বর','ডিসেম্বর'];
  const moEn = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  $('gregorianDate').textContent = state.lang === 'bn'
    ? `${wd[now.getDay()]}, ${toBn(now.getDate())} ${mo[now.getMonth()]} ${toBn(now.getFullYear())}`
    : `${wdEn[now.getDay()]}, ${moEn[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;

  // Bengali calendar
  const bd = getBengaliDate(now);
  $('banglaDate').textContent = state.lang === 'bn'
    ? `${toBn(bd.day)} ${bd.monthBn} ${toBn(bd.year)}`
    : `${bd.day} ${bd.monthEn} ${bd.year} BS`;

  // Sunrise/sunset
  if (state.times) {
    $('sunriseTime').textContent = state.times.sunrise;
    $('sunsetTime').textContent = state.times.maghrib;
  }
}

/**
 * Adjust Hijri date for Bangladesh (1 day behind Umm al-Qura) + Maghrib-based day change.
 * Before Maghrib: API day - 1 (BD moon sighting is 1 day behind Saudi)
 * After Maghrib:   API day     (Islamic day starts at Maghrib, so date advances)
 */
/** Strip diacritics from month names (API returns Muḥarram vs our Muharram) */
function normalizeMonth(name) {
  return name.normalize('NFKD').replace(/[\u0300-\u036f\u1e00-\u1eff\u00c0-\u017e]/g, '');
}

/** Adjust Hijri date: Bangladesh moon sighting is consistently 1 day behind Umm al-Qura */
function getAdjustedHijri(raw, maghribTime) {
  if (!raw) return null;
  let day = Math.max(1, raw.day - 1);
  let monthIdx = HIJRI_MONTHS.indexOf(normalizeMonth(raw.month));
  let year = raw.year;
  if (monthIdx < 0) monthIdx = 0; // fallback: Muharram

  if (day > (raw.monthDays || 30)) {
    monthIdx = (monthIdx + 1) % 12;
    year = (monthIdx === 0) ? year + 1 : year;
    day = 1;
  }

  return {
    day: day,
    month: HIJRI_MONTHS[monthIdx],
    year: year
  };
}

/** Bengali calendar (Bangla Academy fixed calendar) */
function getBengaliDate(g) {
  const y = g.getFullYear(), m = g.getMonth() + 1, d = g.getDate();
  // Bangla Academy fixed month start dates (month_num, day)
  const months = [
    { en: 'Boishakh',  bn: 'বৈশাখ',  ms: 4, ds: 14 },
    { en: 'Joishtho',  bn: 'জ্যৈষ্ঠ', ms: 5, ds: 15 },
    { en: 'Ashaarh',   bn: 'আষাঢ়',  ms: 6, ds: 15 },
    { en: 'Srabon',    bn: 'শ্রাবণ',  ms: 7, ds: 16 },
    { en: 'Bhadro',    bn: 'ভাদ্র',   ms: 8, ds: 16 },
    { en: 'Ashshin',   bn: 'আশ্বিন',  ms: 9, ds: 16 },
    { en: 'Kartik',    bn: 'কার্তিক', ms: 10, ds: 16 },
    { en: 'Agrahayon', bn: 'অগ্রহায়ণ', ms: 11, ds: 15 },
    { en: 'Poush',     bn: 'পৌষ',    ms: 12, ds: 15 },
    { en: 'Magh',      bn: 'মাঘ',    ms: 1, ds: 14 },
    { en: 'Falgun',    bn: 'ফাল্গুন', ms: 2, ds: 13 },
    { en: 'Choitro',   bn: 'চৈত্র',   ms: 3, ds: 15 }
  ];

  // Bangabda year: after Boishakh 1 (Apr 14) → Gregorian - 594, before → Gregorian - 595
  const by = (m > 4 || (m === 4 && d >= 14)) ? y - 594 : y - 595;

  // Build sorted list of (month_obj, start_date) for the Bangla year
  // The Bangla year starts at Boishakh (Apr 14)
  let startYear = y;
  if (m < 4 || (m === 4 && d < 14)) startYear = y - 1; // Before Boishakh → reference Apr 14 of PREVIOUS Gregorian year

  // Create an array of { month, date } pairs sorted chronologically
  const yearStarts = months.map(mm => {
    let ty = startYear;
    // Magh-Choitro (months 1-3) fall in the NEXT Gregorian year
    if (mm.ms <= 3) ty = startYear + 1;
    return { ...mm, date: new Date(ty, mm.ms - 1, mm.ds) };
  });

  // Find the latest start date ≤ current date
  let bMonth = yearStarts[0], bDay = 1;
  for (const ms of yearStarts) {
    if (ms.date <= g) { bMonth = ms; }
  }

  // Calculate the day
  const diffDays = Math.round((g - bMonth.date) / (24 * 60 * 60 * 1000));
  bDay = diffDays + 1;

  return { day: bDay, monthEn: bMonth.en, monthBn: bMonth.bn, year: by };
}

function updateStatusBar() {
  if (!state.times || !state.segment) return;
  const lang = state.lang;
  const seg = state.segment;
  const cm = getCM();

  // Column 1: সাহরি time (Fajr)
  $('sahriTime').textContent = state.times.fajr;
  $('sahriLabel').textContent = lang === 'bn' ? 'সাহরি' : 'Sahri';

  // Column 2: ইফতার time (Maghrib)
  $('iftarTime').textContent = state.times.maghrib;
  $('iftarLabel').textContent = lang === 'bn' ? 'ইফতার' : 'Iftar';

  // Column 3: BIG countdown
  const maghribMin = timeToMin(state.times.maghrib);
  const ishaMin = timeToMin(state.times.isha);
  const fajrMin = timeToMin(state.times.fajr);

  // Before Iftar = between Fajr and Maghrib (daytime)
  const isBeforeIftar = cm >= fajrMin && cm < maghribMin;
  // Before Sahri = after Isha or before Fajr (nighttime, Isha-to-Fajr wraparound)
  const isBeforeSahri = cm >= ishaMin || cm < fajrMin;

  let targetKey, labelBn, labelEn;
  if (isBeforeIftar) {
    targetKey = 'maghrib';
    labelBn = 'ইফতারে বাকি';
    labelEn = 'Iftar in';
  } else if (isBeforeSahri) {
    targetKey = 'fajr';
    labelBn = 'সাহরিতে বাকি';
    labelEn = 'Sahri in';
  } else {
    // Between Fajr and Maghrib but iftar already passed? Use tomorrow's iftar
    targetKey = 'maghrib';
    labelBn = 'ইফতারে বাকি';
    labelEn = 'Iftar in';
  }

  const [h, m] = state.times[targetKey].split(':').map(Number);
  const now = getNow();
  const nowMs = now.getHours() * 3600000 + now.getMinutes() * 60000 + now.getSeconds() * 1000 + now.getMilliseconds();
  let targetMs = h * 3600000 + m * 60000;
  if (targetMs <= nowMs) targetMs += 86400000;
  const msLeft = targetMs - nowMs;

  $('countdownLabel').textContent = lang === 'bn' ? labelBn : labelEn;
  $('countdownDisplay').textContent = formatCDbn(msLeft);
}

function updatePrayerList() {
  const container = $('prayerList');
  if (!state.times) return;
  const lang = state.lang;

  // Determine which prayer is "current" based on segment
  const seg = state.segment;
  let activePrayer = null;
  if (seg) {
    if (seg.type === 'prayer') {
      activePrayer = seg.id;
    } else if (seg.id === 'prohibited_sunrise' || seg.id === 'ishraq') {
      activePrayer = 'fajr'; // fajr ended, but show it
    } else if (seg.id === 'prohibited_noon') {
      activePrayer = 'dhuhr';
    } else if (seg.id === 'prohibited_sunset') {
      activePrayer = 'asr';
    }
  }

  let html = '';
  PRAYER_KEYS.forEach((key, i) => {
    const isActive = key === activePrayer || key === state.segment?.id;
    const name = lang === 'bn' ? PRAYER_NAMES_BN[key] : PRAYER_NAMES_EN[key];
    const startTime = state.times[key];
    const endKey = i === 0 ? 'sunrise' : PRAYER_KEYS[(i + 1) % PRAYER_KEYS.length];
    const endTime = state.times[endKey];
    const animDelay = i * 0.06;
    html += `
      <div class="prayer-card ${isActive ? 'active' : ''} bg-[#131820] hover:bg-[#1a2233] p-2.5 rounded-xl flex justify-between items-center border ${isActive ? 'border-emerald-500/0 shadow-lg shadow-emerald-900/20' : 'border-gray-800/30'}" style="animation-delay:${animDelay}s">
        <div class="min-w-0 flex-1">
          <p class="font-medium text-[11px] text-gray-100 ${isActive ? 'text-white' : ''} leading-tight">${name}</p>
          <p class="text-[10px] ${isActive ? 'text-white/70' : 'text-gray-500'} mt-0.5 font-mono">${startTime} — ${endTime}</p>
        </div>
        <span class="badge text-[10px] ${isActive ? 'bg-white/20 text-white' : 'bg-gray-700/40 text-gray-400'} px-2 py-1 rounded-full font-mono font-medium flex-shrink-0 ml-2">${startTime}</span>
      </div>`;
  });

  container.innerHTML = html;
}

function updatePrayerListStates() {
  // Just re-applies active class based on segment
  const seg = state.segment;
  if (!seg) return;
  const cards = document.querySelectorAll('.prayer-card');
  PRAYER_KEYS.forEach((key, i) => {
    const isActive = key === seg.id || (seg.type === 'prohibited' && key === getPrevPrayerKey(seg.id));
    if (cards[i]) {
      cards[i].className = cards[i].className.replace(' active', '');
      if (isActive) cards[i].classList.add('active');
    }
  });
}

function getPrevPrayerKey(segId) {
  const map = { 'prohibited_sunrise': 'fajr', 'prohibited_noon': 'dhuhr', 'prohibited_sunset': 'asr', 'ishraq': 'fajr' };
  return map[segId] || null;
}

function updateProgressRing() {
  const ring = $('progressRing');
  if (!ring || !state.segment) return;
  const circumference = 2 * Math.PI * 70; // r=70 (160px SVG)
  const offset = circumference - (state.progressPct / 100) * circumference;
  ring.style.strokeDasharray = `${circumference}`;
  ring.style.strokeDashoffset = `${offset}`;

  const lang = state.lang;
  const seg = state.segment;
  const name = lang === 'bn' ? seg.nameBn : seg.nameEn;
  $('currentPrayerName').textContent = name;

  // Type label
  const typeLabels = {
    prayer: lang === 'bn' ? 'ফরজ নামাজ' : 'Prayer',
    prohibited: lang === 'bn' ? 'নিষিদ্ধ সময়' : 'Prohibited',
    optional: lang === 'bn' ? 'নফল নামাজ' : 'Optional'
  };
  $('segmentTypeLabel').textContent = typeLabels[seg.type] || '';

  $('remainingTime').textContent = formatCDbn(state.remainingMs);
}

function updateProhibitedTimes() {
  if (!state.times) return;
  const list = $('prohibitedList');
  const lang = state.lang;
  const t = state.times;

  const riseEnd = minToStr(timeToMin(t.sunrise) + SEGMENT_PROHIBITED_OFFSET);
  const noonStart = minToStr(timeToMin(t.dhuhr) - SEGMENT_DHUHR_OFFSET);
  const setStart = minToStr(timeToMin(t.maghrib) - SEGMENT_PROHIBITED_OFFSET);

  const labels = lang === 'bn'
    ? [{n: 'সূর্যোদয়ের পর', i: '🌅'}, {n: 'যোহরের পূর্বে (দুপুর)', i: '☀️'}, {n: 'সূর্যাস্তের পূর্বে', i: '🌆'}]
    : [{n: 'After Sunrise', i: '🌅'}, {n: 'Before Dhuhr (Zenith)', i: '☀️'}, {n: 'Before Sunset', i: '🌆'}];

  list.innerHTML = `
    <div class="flex justify-between items-center py-1.5">
      <span class="text-gray-400 text-xs"><span>${labels[0].i}</span> ${labels[0].n}</span>
      <span class="font-mono text-xs text-gray-300">${t.sunrise} — ${riseEnd}</span>
    </div>
    <div class="flex justify-between items-center py-1.5">
      <span class="text-gray-400 text-xs"><span>${labels[1].i}</span> ${labels[1].n}</span>
      <span class="font-mono text-xs text-gray-300">${noonStart} — ${t.dhuhr}</span>
    </div>
    <div class="flex justify-between items-center py-1.5">
      <span class="text-gray-400 text-xs"><span>${labels[2].i}</span> ${labels[2].n}</span>
      <span class="font-mono text-xs text-gray-300">${setStart} — ${t.maghrib}</span>
    </div>`;
}

function renderLoading() {
  $('hijriDate').textContent = state.lang === 'bn' ? 'লোড হচ্ছে...' : 'Loading...';
  $('gregorianDate').textContent = '';
  $('banglaDate').textContent = '';
  $('sunriseTime').textContent = '--:--';
  $('sunsetTime').textContent = '--:--';
  $('sahriTime').textContent = '--:--';
  $('iftarTime').textContent = '--:--';
  $('countdownDisplay').textContent = '--:--:--';
  $('prayerList').innerHTML = '<div class="text-center py-6"><i class="fas fa-spinner fa-spin text-emerald-400 text-xl"></i></div>';
  $('prohibitedList').innerHTML = '';
  $('currentPrayerName').textContent = '--';
  $('segmentTypeLabel').textContent = '';
  $('remainingTime').textContent = '--:--:--';
}

function updateFaq() {
  const items = FAQ_DATA[state.lang];
  $('faqContent').innerHTML = items.map(item =>
    `<div class="faq-item">
      <p class="font-medium text-emerald-400 text-xs mb-1">${item.q}</p>
      <p class="text-gray-300 text-xs leading-relaxed">${item.a}</p>
    </div>`
  ).join('');
}


// ======================== PAGE INIT ========================

document.addEventListener('DOMContentLoaded', async function() {

  // ---- Language toggle ----
  function setLang(lang) {
    state.lang = lang;
    document.querySelectorAll('#langToggle span').forEach(el => {
      el.classList.toggle('bg-emerald-600/20', el.dataset.lang === lang);
      el.classList.toggle('text-emerald-400', el.dataset.lang === lang);
      el.classList.toggle('border', el.dataset.lang === lang);
      el.classList.toggle('border-emerald-600/30', el.dataset.lang === lang);
      el.classList.toggle('rounded-xl', el.dataset.lang === lang);
      el.classList.toggle('text-gray-500', el.dataset.lang !== lang);
    });
    updateLanguage();
    updateFaq();
  }

  function updateLanguage() {
    const lang = state.lang;
    $('sunriseLabel').textContent = lang === 'bn' ? 'সূর্যোদয়' : 'Sunrise';
    $('sunsetLabel').textContent = lang === 'bn' ? 'সূর্যাস্ত' : 'Sunset';
    $('sahriLabel').textContent = lang === 'bn' ? 'সাহরি' : 'Sahri';
    $('iftarLabel').textContent = lang === 'bn' ? 'ইফতার' : 'Iftar';
    // countdownLabel set dynamically in updateStatusBar
    $('prohibitedTitle').innerHTML = `<i class="fas fa-ban text-red-400 text-xs"></i> ${lang === 'bn' ? 'সালাতের নিষিদ্ধ সময়' : 'Prohibited Times'}`;
    $('faqBtnLabel').textContent = 'FAQ';
    $('faqModalTitle').textContent = lang === 'bn' ? 'সচরাচর জিজ্ঞাসা' : 'Frequently Asked Questions';
    $('settingsTitle').textContent = lang === 'bn' ? 'সেটিংস' : 'Settings';
    $('langSettingLabel').textContent = lang === 'bn' ? 'ভাষা / Language' : 'Language';
    $('calcLabel').textContent = lang === 'bn' ? 'গণনা পদ্ধতি' : 'Calculation Method';
    $('settingsFooter').textContent = lang === 'bn' ? 'ইসলাহ বিডি — নামাজের সময়সূচী' : 'IslahBD — Prayer Times';
    $('nafilTitle').textContent = lang === 'bn' ? 'নফল নামাজসমূহ' : 'Nafil Prayers';

    fullRender();
  }

  $('langToggle').addEventListener('click', function(e) {
    const span = e.target.closest('span');
    if (span && span.dataset.lang) setLang(span.dataset.lang);
  });

  // ---- Settings panel ----
  $('settingsBtn').addEventListener('click', () => {
    $('settingsPanel').classList.add('open');
    $('overlay').classList.add('show');
  });
  function closeSettings() {
    $('settingsPanel').classList.remove('open');
    $('overlay').classList.remove('show');
  }
  $('closeSettings').addEventListener('click', closeSettings);
  $('overlay').addEventListener('click', closeSettings);

  // ---- FAQ ----
  $('faqBtn').addEventListener('click', () => {
    $('faqModal').classList.remove('hidden');
    updateFaq();
  });
  function closeFaq() { $('faqModal').classList.add('hidden'); }
  $('closeFaq').addEventListener('click', closeFaq);
  $('faqOverlay').addEventListener('click', closeFaq);
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') { closeSettings(); closeFaq(); }
  });

  // ---- INIT FLOW ----
  renderLoading();

  // Step 1: Detect IP
  const detected = await detectLocationFromIP();
  state.detectedLocation = detected;
  let matchedKey = 'badda';
  if (detected && detected.city) {
    const match = matchCityToKey(detected.city);
    if (match) matchedKey = match;
  }
  state.loc = matchedKey;
  state.locationLoading = false;

  // Step 2: Load prayer times
  state.loading = true;
  await fetchPrayerTimes(state.loc);
  state.loading = false;
  state.locationManual = false;

  // Step 3: Compute initial state
  tick();
  fullRender();

  // Step 4: Per-second tick
  setInterval(tick, 1000);
});
