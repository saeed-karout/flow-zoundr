// src/utils/songCompletion.js
//
// ✅ المصدر الوحيد لحساب اكتمال الأغنية وتبويباتها.
//
// قبل هذا الملف كان المنطق مكرَّراً في ٦ أماكن (FirstSection / tabs.vue / Infos1 /
// Upload2Component / UploadPNG / stores/release.js) وكانت النسخ تختلف فيما بينها —
// خصوصاً في معالجة نوع instrumental — فيظهر التبويب مكتملاً في مكان وغير مكتمل في آخر.
// الآن تستدعي كل تلك المواضع نفس الدوال هنا، فتبقى علامات التبويبات وقائمة الأغاني
// في FirstSection والمخزَّن متطابقة دائماً.

export const TAB_ORDER = ['infos', 'urheber', 'mitwirkende', 'deals', 'pre-release'];

// ✅ نوع instrumental (لا نصوص): تُعطَّل حقول النصوص في InfosContent و UrheberContent
//    (Explicit / Sprache Text / Songtext / Textdichter)، ولذلك لا تُطلَب للاكتمال.
//    يشمل ذلك 'original_instrumental' و 'cover_instrumental' وأي قيمة تحتوي instrumental.
export const isInstrumentalSong = (song) =>
  String(song?.song_type || song?.song_typ || '').includes('instrumental');

// ========== مساعدات التحقق ==========

const isFilled = (value) =>
  value !== undefined && value !== null && String(value).trim() !== '';

// اسم شخص صالح: ٤ أحرف على الأقل (دون احتساب المسافات) + مسافة واحدة على الأقل.
// نفس قاعدة UrheberContent.isValidName كي تتطابق علامة الصح داخل الحقل مع علامة التبويب.
const isValidPersonName = (value) => {
  if (!isFilled(value)) return false;
  const trimmed = String(value).trim();
  return trimmed.replace(/\s/g, '').length >= 4 && trimmed.includes(' ');
};

const someFilled = (list) => Array.isArray(list) && list.some(isFilled);
const someValidName = (list) => Array.isArray(list) && list.some(isValidPersonName);
const someNamed = (list) => Array.isArray(list) && list.some((item) => isFilled(item?.name));

// مجموعة اختيارية: مكتملة ما لم يُضِف المستخدم صفوفاً ثم يتركها فارغة.
const optionalNamed = (list) =>
  Array.isArray(list) && list.length > 0 ? someNamed(list) : true;

const optionalRoleNamed = (list) =>
  Array.isArray(list) && list.length > 0
    ? list.some((item) => isFilled(item?.role) && isFilled(item?.name))
    : true;

// ✅ Pre-Release مفعّل → نتحقق من الغلاف والتاريخ فعلياً من بيانات الأغنية (موثوق أكثر من
//    العلم المحفوظ الذي قد يبقى true بعد التفعيل بلا غلاف/تاريخ). معطّل → يكفي علم الخادم.
const isPreReleaseActive = (song) =>
  song?.prerelease === 1 || song?.prerelease === true || song?.is_pre_release_active === true;

// ========== اكتمال التبويبات ==========

/**
 * يحسب اكتمال التبويبات الخمسة من بيانات الأغنية.
 * @returns {{infos:boolean, urheber:boolean, mitwirkende:boolean, deals:boolean, 'pre-release':boolean}|null}
 */
export const computeTabCompletion = (song) => {
  if (!song) return null;

  const instrumental = isInstrumentalSong(song);
  const authors = song.authors || {};
  const contributors = song.contributors || {};

  // Infos — Titel + Sprache Titel + ملف صوتي، و(Explicit + Sprache Text) لغير instrumental.
  const infos =
    isFilled(song.title) &&
    String(song.title).trim() !== 'Song Titel' &&
    (instrumental || isFilled(song.explicit_lyrics)) &&
    isFilled(song.title_language) &&
    (instrumental || isFilled(song.lyrics_language)) &&
    !!song.song_file;

  // Urheber — Komponist + Verlag + C-Line دائماً، و Textdichter لغير instrumental فقط.
  const urheber =
    someValidName(authors.composer) &&
    (instrumental || someValidName(authors.lyricist)) &&
    someFilled(authors.verlog) &&
    someFilled(authors.c_line);

  // Mitwirkende — Artist + P-Line + Produzent مطلوبة، Feature/Weitere اختيارية.
  const mitwirkende =
    someNamed(contributors.artist) &&
    optionalNamed(contributors.feature) &&
    someNamed(contributors.p_line) &&
    someNamed(contributors.producer) &&
    optionalRoleNamed(contributors.other_contributors);

  // Deals — لا حقول فيه، يكتمل بعلم الخادم عند زيارة التبويب.
  const deals = song.deals_step_completed === true;

  const preRelease = isPreReleaseActive(song)
    ? !!song.cover && !!song.release_date
    : song.pre_release_step_completed === true;

  return {
    infos: infos === true,
    urheber: urheber === true,
    mitwirkende: mitwirkende === true,
    deals: deals === true,
    'pre-release': preRelease === true,
  };
};

/** الأغنية مكتملة عندما تكتمل كل تبويباتها (ويشمل ذلك الملف الصوتي داخل تبويب Infos). */
export const isSongComplete = (song) => {
  const completion = computeTabCompletion(song);
  if (!completion) return false;
  return TAB_ORDER.every((tab) => completion[tab] === true);
};

/** أول تبويب غير مكتمل — يُستخدم لفتح الأغنية على التبويب الصحيح. */
export const getFirstIncompleteTab = (song) => {
  const completion = computeTabCompletion(song);
  if (!completion) return 'infos';
  return TAB_ORDER.find((tab) => completion[tab] !== true) || 'pre-release';
};
