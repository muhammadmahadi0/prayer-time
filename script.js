/* ========================================================================
   Simple Prayer Time — Settings & UI
   ======================================================================== */

// ======================== HELPERS ========================

function $(id) { return document.getElementById(id); }

// ======================== STATE ========================

let state = {
  lang: localStorage.getItem('lang') || 'bn'
};

// ======================== LANGUAGE ========================

function setLang(lang) {
  state.lang = lang;
  localStorage.setItem('lang', lang);

  // Toggle buttons
  document.querySelectorAll('#langToggle span').forEach(el => {
    el.classList.toggle('bg-emerald-600/20', el.dataset.lang === lang);
    el.classList.toggle('text-emerald-400', el.dataset.lang === lang);
    el.classList.toggle('border', el.dataset.lang === lang);
    el.classList.toggle('border-emerald-600/30', el.dataset.lang === lang);
    el.classList.toggle('rounded-xl', el.dataset.lang === lang);
    el.classList.toggle('text-gray-500', el.dataset.lang !== lang);
  });

  // App title
  const isBn = lang === 'bn';
  $('appTitleBn').classList.toggle('hidden', !isBn);
  $('appTitleEn').classList.toggle('hidden', isBn);
  $('subtitleBn').classList.toggle('hidden', !isBn);
  $('subtitleEn').classList.toggle('hidden', isBn);
  $('nafilTitle').textContent = isBn ? 'নফল নামাজসমূহ' : 'Nafil Prayers';
  $('prohibitedTitle').textContent = isBn ? 'সালাতের নিষিদ্ধ সময়' : 'Prohibited Times';
  $('settingsTitle').textContent = isBn ? 'সেটিংস' : 'Settings';
  $('langSettingLabel').textContent = isBn ? 'ভাষা / Language' : 'Language';
  $('footerPowered').textContent = isBn ? 'Powered by' : 'Powered by';

  // Nafil labels
  $('nafilTahajjud').textContent = isBn ? 'তাহাজ্জুদ' : 'Tahajjud';
  $('nafilIshraq').textContent = isBn ? 'ইশরাক' : 'Ishraq';
  $('nafilDuha').textContent = isBn ? 'সালাতুদ দুহা' : 'Salatud Duha';
  $('nafilAwwabin').textContent = isBn ? 'আওয়াবীন' : 'Awwabin';

  $('nafilIshraqTime').textContent = isBn ? 'সূর্যোদয়ের ১৫ মিনিট পর' : '15 min after sunrise';
  $('nafilDuhaTime').textContent = isBn ? 'ইশরাক — যোহরের ১০ মিনিট আগে' : 'Ishraq — 10 min before Dhuhr';

  // Prohibited labels
  $('prohSunriseLabel').textContent = isBn ? 'সূর্যোদয়ের সময়' : 'At Sunrise';
  $('prohNoonLabel').textContent = isBn ? 'দুপুরে সূর্য মধ্যাকাশে' : 'Sun at Zenith';
  $('prohSunsetLabel').textContent = isBn ? 'সূর্যাস্তের সময়' : 'At Sunset';
  $('prohSunrise').textContent = isBn ? '+১৫ মিনিট' : '+15 min';
  $('prohNoon').textContent = isBn ? 'যোহরের ১০ মিনিট আগে' : '10 min before Dhuhr';
  $('prohSunset').textContent = isBn ? '১৫ মিনিট আগে' : '15 min before';
  $('prohibitedFooter').textContent = isBn
    ? 'ইফতার = মাগরিবের সময়, মাগরিবের নামাজ ২-৩ মিনিট পর'
    : 'Iftar = Maghrib time; Maghrib prayer 2-3 min later';
}

// ======================== INIT ========================

document.addEventListener('DOMContentLoaded', function() {
  // ---- Language toggle ----
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
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeSettings();
  });

  // ---- Apply saved language ----
  setLang(state.lang);
});
