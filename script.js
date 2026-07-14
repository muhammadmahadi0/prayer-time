/* ========================================================================
   Simple Prayer Time — Countdown + Settings
   Bangladesh-only — 64 district dropdown
   ======================================================================== */

// ======================== BANGLADESH DISTRICTS (64) ========================

const DISTRICTS = [
  { bn: 'ঢাকা',       en: 'Dhaka',        lat: 23.8103, lng: 90.4125, ifId: 1185241 },
  { bn: 'ফরিদপুর',    en: 'Faridpur',     lat: 23.6070, lng: 89.8414, ifId: 1203344 },
  { bn: 'গাজীপুর',    en: 'Gazipur',      lat: 23.9999, lng: 90.4203, ifId: 1200109 },
  { bn: 'গোপালগঞ্জ',  en: 'Gopalganj',    lat: 23.0068, lng: 89.8285, ifId: 1202120 },
  { bn: 'জামালপুর',   en: 'Jamalpur',     lat: 24.9375, lng: 89.9375, ifId: 1185106 },
  { bn: 'কিশোরগঞ্জ',  en: 'Kishoreganj',  lat: 24.4262, lng: 90.9840, ifId: 1337249 },
  { bn: 'মাদারীপুর',  en: 'Madaripur',    lat: 23.1705, lng: 90.2051, ifId: 1337245 },
  { bn: 'মানিকগঞ্জ',  en: 'Manikganj',    lat: 23.8617, lng: 90.0047, ifId: 1348441 },
  { bn: 'মুন্সীগঞ্জ', en: 'Munshiganj',   lat: 23.5422, lng: 90.5308, ifId: 1337183 },
  { bn: 'ময়মনসিংহ',  en: 'Mymensingh',   lat: 24.7471, lng: 90.4203, ifId: 1185162 },
  { bn: 'নারায়ণগঞ্জ',en: 'Narayanganj',  lat: 23.6238, lng: 90.5014, ifId: 1185155 },
  { bn: 'নরসিংদী',    en: 'Narsingdi',    lat: 23.9205, lng: 90.7221, ifId: 1185117 },
  { bn: 'নেত্রকোণা',  en: 'Netrokona',    lat: 24.8845, lng: 90.7286, ifId: 1185116 },
  { bn: 'রাজবাড়ী',   en: 'Rajbari',      lat: 23.7582, lng: 89.6427, ifId: 1337180 },
  { bn: 'শরীয়তপুর',  en: 'Shariatpur',   lat: 23.2072, lng: 90.3502, ifId: 1337186 },
  { bn: 'শেরপুর',     en: 'Sherpur',      lat: 25.0733, lng: 90.1677, ifId: 1337248 },
  { bn: 'টাঙ্গাইল',    en: 'Tangail',      lat: 24.2469, lng: 89.9201, ifId: 1336144 },
  { bn: 'বান্দরবান',  en: 'Bandarban',    lat: 22.1953, lng: 92.2184, ifId: 1185270 },
  { bn: 'ব্রাহ্মণবাড়িয়া', en: 'Brahmanbaria', lat: 23.9570, lng: 91.1103, ifId: 1336142 },
  { bn: 'চাঁদপুর',    en: 'Chandpur',     lat: 23.2325, lng: 90.6631, ifId: 1207337 },
  { bn: 'চট্টগ্রাম',  en: 'Chittagong',   lat: 22.3569, lng: 91.7832, ifId: 1205733 },
  { bn: 'কুমিল্লা',   en: 'Comilla',      lat: 23.4607, lng: 91.1809, ifId: 1185186 },
  { bn: 'কক্সবাজার',  en: "Cox's Bazar",  lat: 21.4272, lng: 92.0063, ifId: 1336134 },
  { bn: 'ফেনী',       en: 'Feni',         lat: 22.9406, lng: 91.4145, ifId: 1185224 },
  { bn: 'খাগড়াছড়ি', en: 'Khagrachari',  lat: 23.1346, lng: 91.5048, ifId: 1185252 },
  { bn: 'লক্ষ্মীপুর', en: 'Lakshmipur',   lat: 22.9447, lng: 90.8270, ifId: 1196292 },
  { bn: 'নোয়াখালী',  en: 'Noakhali',     lat: 22.8724, lng: 91.1066, ifId: 1195434 },
  { bn: 'রাঙ্গামাটি', en: 'Rangamati',    lat: 22.6493, lng: 92.1721, ifId: 1336139 },
  { bn: 'হবিগঞ্জ',    en: 'Habiganj',     lat: 24.3814, lng: 91.4182, ifId: 1185209 },
  { bn: 'মৌলভীবাজার',en: 'Moulvibazar',  lat: 24.4864, lng: 91.7713, ifId: 1185166 },
  { bn: 'সুনামগঞ্জ',  en: 'Sunamganj',    lat: 25.0713, lng: 91.4023, ifId: 1185105 },
  { bn: 'সিলেট',      en: 'Sylhet',       lat: 24.8949, lng: 91.8687, ifId: 1185099 },
  { bn: 'বাগেরহাট',   en: 'Bagerhat',     lat: 22.6608, lng: 89.7909, ifId: 1185281 },
  { bn: 'চুয়াডাঙ্গা', en: 'Chuadanga',    lat: 23.6440, lng: 88.8524, ifId: 1337205 },
  { bn: 'যশোর',       en: 'Jessore',      lat: 23.1634, lng: 89.2183, ifId: 1336140 },
  { bn: 'ঝিনাইদহ',    en: 'Jhenaidah',    lat: 23.5451, lng: 89.1786, ifId: 1337204 },
  { bn: 'খুলনা',      en: 'Khulna',       lat: 22.8456, lng: 89.5403, ifId: 1336135 },
  { bn: 'কুষ্টিয়া',  en: 'Kushtia',      lat: 23.9014, lng: 89.1206, ifId: 1185191 },
  { bn: 'মাগুরা',     en: 'Magura',       lat: 23.4870, lng: 89.4193, ifId: 1337206 },
  { bn: 'মেহেরপুর',   en: 'Meherpur',     lat: 23.7778, lng: 88.6367, ifId: 1337203 },
  { bn: 'নড়াইল',     en: 'Narail',       lat: 23.1545, lng: 89.5017, ifId: 1185293 },
  { bn: 'সাতক্ষীরা',  en: 'Satkhira',     lat: 22.7190, lng: 89.0692, ifId: 1185111 },
  { bn: 'বরগুনা',     en: 'Barguna',      lat: 22.1504, lng: 90.1346, ifId: 1337217 },
  { bn: 'বরিশাল',     en: 'Barisal',      lat: 22.7010, lng: 90.3535, ifId: 1336137 },
  { bn: 'ভোলা',       en: 'Bhola',        lat: 22.6870, lng: 90.6495, ifId: 1205538 },
  { bn: 'ঝালকাঠি',    en: 'Jhalokati',    lat: 22.6426, lng: 90.1988, ifId: 1337214 },
  { bn: 'পটুয়াখালী', en: 'Patuakhali',   lat: 22.3529, lng: 90.3292, ifId: 7646711 },
  { bn: 'পিরোজপুর',   en: 'Pirojpur',     lat: 22.5841, lng: 89.9679, ifId: 1185138 },
  { bn: 'বগুড়া',     en: 'Bogura',       lat: 24.8466, lng: 89.3733, ifId: 1337233 },
  { bn: 'জয়পুরহাট',  en: 'Joypurhat',    lat: 25.1017, lng: 89.0249, ifId: 1337162 },
  { bn: 'নওগাঁ',      en: 'Naogaon',      lat: 24.7949, lng: 88.9577, ifId: 1194041 },
  { bn: 'নাটোর',      en: 'Natore',       lat: 24.4100, lng: 88.9949, ifId: 7483813 },
  { bn: 'নবাবগঞ্জ',   en: 'Nawabganj',    lat: 24.5963, lng: 88.2746, ifId: 1337240 },
  { bn: 'পাবনা',      en: 'Pabna',        lat: 24.0064, lng: 89.2451, ifId: 1336143 },
  { bn: 'রাজশাহী',    en: 'Rajshahi',     lat: 24.3636, lng: 88.6241, ifId: 1185128 },
  { bn: 'সিরাজগঞ্জ',  en: 'Sirajganj',    lat: 24.4574, lng: 89.7064, ifId: 1185115 },
  { bn: 'দিনাজপুর',   en: 'Dinajpur',     lat: 25.6277, lng: 88.6338, ifId: 1203891 },
  { bn: 'গাইবান্ধা',   en: 'Gaibandha',    lat: 25.3289, lng: 89.5433, ifId: 1337160 },
  { bn: 'কুড়িগ্রাম', en: 'Kurigram',     lat: 25.8073, lng: 89.6489, ifId: 1185160 },
  { bn: 'লালমনিরহাট', en: 'Lalmonirhat',  lat: 25.9923, lng: 89.2847, ifId: 1185181 },
  { bn: 'নীলফামারী',  en: 'Nilphamari',   lat: 25.9494, lng: 88.9546, ifId: 6545349 },
  { bn: 'পঞ্চগড়',    en: 'Panchagarh',   lat: 26.3386, lng: 88.5618, ifId: 1337153 },
  { bn: 'রংপুর',      en: 'Rangpur',      lat: 25.7466, lng: 89.2517, ifId: 1185188 },
  { bn: 'ঠাকুরগাঁও',  en: 'Thakurgaon',   lat: 26.0334, lng: 88.4667, ifId: 1185092 }
];

// ======================== CONFIG ========================

const API_BASE = 'https://api.aladhan.com/v1';
const PRAYER_NAMES_BN = { fajr: 'ফজর', dhuhr: 'যোহর', asr: 'আসর', maghrib: 'মাগরিব', isha: 'ইশা' };
const PRAYER_NAMES_EN = { fajr: 'Fajr', dhuhr: 'Dhuhr', asr: 'Asr', maghrib: 'Maghrib', isha: 'Isha' };
const PRAYER_ORDER = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

// ======================== HELPERS ========================

function $(id) { return document.getElementById(id); }
function t2m(t) { const [h,m]=t.split(':'); return +h*60+ +m; }

function getNow() {
  const d = new Date();
  const utc = d.getTime() + d.getTimezoneOffset() * 60000;
  return new Date(utc + 6 * 3600000); // BD always UTC+6
}

function pad(n) { return String(n).padStart(2, '0'); }

function toBn(n) {
  if (typeof n === 'string') n = parseInt(n);
  return String(n).split('').map(d => '০১২৩৪৫৬৭৮৯'[parseInt(d)] || d).join('');
}

// ======================== STATE ========================

// Default district = saved or Dhaka (index 0)
const savedIdx = localStorage.getItem('districtIdx');
const defIdx = (savedIdx !== null && DISTRICTS[savedIdx]) ? +savedIdx : 0;

let state = {
  lang: localStorage.getItem('lang') || 'bn',
  theme: localStorage.getItem('theme') || 'dark',
  times: null,
  nextPrayer: null,
  progressPct: 0,
  districtIdx: defIdx
};

// ======================== DISTRICT SELECTOR ========================

function getCurrentDistrict() { return DISTRICTS[state.districtIdx]; }

async function setDistrict(idx) {
  idx = Math.max(0, Math.min(DISTRICTS.length - 1, idx));
  state.districtIdx = idx;
  localStorage.setItem('districtIdx', idx);

  // Sync both selects
  document.querySelectorAll('#districtSelect, #settingsDistrictSelect').forEach(el => el.value = idx);

  updateLocationDisplay();
  updateWidget();

  // Refetch times with new coordinates
  await fetchTimes();
  tick();
}

function updateLocationDisplay() {
  const d = getCurrentDistrict();
  const bn = state.lang === 'bn';
  $('locationDisplay').textContent = bn ? `${d.bn}, বাংলাদেশ` : `${d.en}, Bangladesh`;
}

function populateDistrictSelect() {
  const selects = ['districtSelect', 'settingsDistrictSelect'];
  for (const selId of selects) {
    const sel = $(selId);
    if (!sel) continue;
    sel.innerHTML = '';
    DISTRICTS.forEach((d, i) => {
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = `${d.bn} (${d.en})`;
      sel.appendChild(opt);
    });
    sel.value = state.districtIdx;
  }
}

// ======================== PRAYER TIMES ========================

async function fetchTimes() {
  try {
    const d = getCurrentDistrict();
    const now = getNow();
    const ds = `${now.getDate()}-${now.getMonth()+1}-${now.getFullYear()}`;
    const url = `${API_BASE}/timings/${ds}?latitude=${d.lat}&longitude=${d.lng}&method=1&school=1`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    if (data.code !== 200) throw new Error('Invalid');
    const t = data.data.timings;
    state.times = {
      fajr: t.Fajr, sunrise: t.Sunrise, dhuhr: t.Dhuhr,
      asr: t.Asr, maghrib: t.Maghrib, isha: t.Isha
    };
    return true;
  } catch(e) {
    // Fallback — use Dhaka approx
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
  for (const key of PRAYER_ORDER) times[key] = t2m(state.times[key]);

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
  const m = t2m(state.times.maghrib);

  // Tahajjud: last 1/3 of night from Maghrib → Fajr
  let nightDur;
  if (f < m) nightDur = (1440 - m) + f;
  else nightDur = f - m;
  if (nightDur <= 0) nightDur = 540;
  const lastThirdStart = (m + (2 / 3) * nightDur) % 1440;

  const tTime = minToTimeStr(lastThirdStart);
  const bn = state.lang === 'bn';
  $('nafilTahajjudTime').textContent = bn
    ? `রাত ${tTime} — সাহরি (রাতের শেষ তৃতীয়াংশ)`
    : `~${tTime} — Fajr (last 1/3 of night)`;
}

// ======================== LANGUAGE ========================

function setLang(lang) {
  state.lang = lang;
  localStorage.setItem('lang', lang);
  document.querySelectorAll('#langToggle span').forEach(el => {
    el.classList.toggle('active', el.dataset.lang === lang);
  });
  document.querySelectorAll('#themeToggle span').forEach(el => {
    const bn = lang === 'bn';
    el.textContent = el.dataset.theme === 'dark' ? (bn ? '◐ ডার্ক' : '◐ Dark') : (bn ? '☀ লাইট' : '☀ Light');
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
  $('districtSettingLabel').textContent = bn ? 'জেলা / District' : 'District';
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
  if (isDark) { btn.style.background = ''; btn.querySelector('i').style.color = ''; }
  else { btn.style.background = '#e2e8f0'; btn.querySelector('i').style.color = '#f59e0b'; }
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
  for (const ms of ye) if (ms.date <= g) bm = ms;
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

function updateWidget() {
  const d = getCurrentDistrict();
  const id = d.ifId;
  if (!id) return;

  const wrap = $('widgetWrap');
  if (!wrap) return;

  // Rebuild iframe to force clean reload
  const oldFrame = $('prayerWidget');
  const newFrame = document.createElement('iframe');
  newFrame.id = 'prayerWidget';
  newFrame.style.cssText = oldFrame.style.cssText || 'width:100%; border:1px solid #ddd; display:block; height:auto';
  newFrame.scrolling = 'no';
  newFrame.title = 'Prayer Times';
  newFrame.src = `https://www.islamicfinder.org/prayer-widget/${id}/hanfi/3/0/18.0/18.0`;
  newFrame.addEventListener('load', function onLoad() {
    setTimeout(() => {
      if (newFrame.style.height === '340px' || newFrame.style.height === '0px' || !newFrame.style.height || newFrame.style.height === 'auto') {
        newFrame.style.height = '360px';
      }
    }, 2000);
  });
  oldFrame.parentNode.replaceChild(newFrame, oldFrame);
}

// ======================== WIDGET ========================

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
      if (w.style.height === '340px' || w.style.height === '0px') w.style.height = '360px';
    }, 2000);
  });
}

// ======================== INIT ========================

document.addEventListener('DOMContentLoaded', async function() {
  // ---- District selector ----
  populateDistrictSelect();
  updateLocationDisplay();
  $('districtSelect').addEventListener('change', function() {
    setDistrict(+this.value);
  });
  $('settingsDistrictSelect').addEventListener('change', function() {
    setDistrict(+this.value);
  });

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
  $('themeBtn').addEventListener('click', () => setTheme(state.theme === 'dark' ? 'light' : 'dark'));
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
  updateWidget();
});
