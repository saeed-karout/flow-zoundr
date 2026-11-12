// مصدر واحد لمواضع حقول التصحيح (corrections) القادمة من الباكإند.
//
// الباكإند يرسل مصفوفة `corrections` على الـ release وعلى كلّ أغنية، تحوي أسماء
// الحقول المطلوب تصحيحها. هذا الملفّ يربط كلّ حقل بموضعه في تدفّق التعديل حتى:
//   1) ننقل المستخدم مباشرةً إلى أوّل صفحة فيها تصحيح.
//   2) نُحدّد الحقول المعنيّة ببوردر أحمر في مكانها.
//
// خطوات UploadPNG: 1 الغلاف · 2 Metas · 3 الأغاني · 4 المتاجر · 5 النشر.

import { TAB_ORDER, computeTabCompletion } from './songCompletion.js';

// الصنف الذي يرسم البوردر الأحمر — معرّف عالمياً في src/assets/main.scss
// حتى لا تحتاج كلّ مكوّنات التدفّق إلى تكرار القاعدة في أنماطها المحصورة.
export const CORRECTION_CLASS = 'is-correction';

// ترتيب صفحات Metas الفرعية داخل الخطوة 2 (Parent.vue).
export const METAS_PAGE_ORDER = ['right', 'newRight', 'newRight2'];

// ترتيب تبويبات الأغنية داخل الخطوة 3 — نفس ترتيب songCompletion.TAB_ORDER.
export const SONG_TAB_ORDER = TAB_ORDER;

// حقول الـ release. الحقل الذي يظهر في أكثر من موضع يُنسب إلى أبكرها،
// لأنّ المستخدم سيمرّ على البقيّة تباعاً.
export const RELEASE_FIELD_LOCATION = {
  cover:              { step: 1 },
  // شاشة اختيار النوع تظهر عند الإنشاء فقط؛ في وضع التعديل تعرض الخطوة 1 الغلاف.
  // يبقى مُحدّداً بالأحمر لكنّه لا يصلح نقطة بداية.
  release_type:       { step: 1, navigable: false },

  artists:            { step: 2, view: 'right' },
  title:              { step: 2, view: 'right' },
  subtitle:           { step: 2, view: 'right' },
  release_date:       { step: 2, view: 'right' },
  // FormLeft (GTIN و Katalognummer) يُعرض مع صفحة newRight2 لا مع الصفحة الأولى.
  GTIN:               { step: 2, view: 'newRight2' },
  catalog_number:     { step: 2, view: 'newRight2' },

  release_price:      { step: 2, view: 'newRight' },
  price_per_song:     { step: 2, view: 'newRight' },
  main_genre:         { step: 2, view: 'newRight' },
  sub_genre:          { step: 2, view: 'newRight' },

  label:              { step: 2, view: 'newRight2' },
  production_year:    { step: 2, view: 'newRight2' },
  c_line_name:        { step: 2, view: 'newRight2' },
  c_line_year:        { step: 2, view: 'newRight2' },
  p_line_name:        { step: 2, view: 'newRight2' },
  p_line_year:        { step: 2, view: 'newRight2' },

  stores:             { step: 4 },
  add_new_stores:     { step: 4 },
  countries_included: { step: 4 },
  countries_excluded: { step: 4 },

  audio_quality:       { step: 5 },
  audio_quality_email: { step: 5 },
};

// حقول الأغنية → التبويب الذي يحويها داخل الخطوة 3.
export const SONG_FIELD_LOCATION = {
  title:           'infos',
  subtitle:        'infos',
  song_type:       'infos',
  explicit_lyrics: 'infos',
  isrc:            'infos',
  title_language:  'infos',
  lyrics_language: 'infos',
  song_file:       'infos',
  song_lyrics:     'infos',
  preview_enabled: 'infos',
  preview_start:   'infos',
  preview_file:    'infos',
  cover:           'infos',

  authors:         'urheber',

  contributors:    'mitwirkende',
  production_year: 'mitwirkende',

  prerelease:      'pre-release',
  pre_order:       'pre-release',
  release_date:    'pre-release',
};

// حقول لا يكتمل بها الـ release. مرتّبة تلقائياً حسب الخطوة ثم الصفحة عبر
// RELEASE_FIELD_LOCATION، فلا يوجد ترتيب مكرّر يمكن أن يتعارض مع ترتيب Korrektur.
export const REQUIRED_RELEASE_FIELDS = [
  'cover',
  'artists', 'title', 'release_date',
  'release_price', 'price_per_song', 'main_genre', 'sub_genre',
  'label', 'production_year', 'c_line_name', 'c_line_year', 'p_line_name', 'p_line_year',
];

const isEmptyValue = (value) => {
  if (value === null || value === undefined) return true;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'string') return value.trim() === '';
  return false;
};

const asList = (value) =>
  Array.isArray(value) ? value.filter((v) => typeof v === 'string' && v.trim() !== '') : [];

export const getReleaseCorrections = (release) => asList(release?.corrections);
export const getSongCorrections = (song) => asList(song?.corrections);

export const hasCorrection = (list, field) => asList(list).includes(field);

export const hasAnyCorrection = (release) => {
  if (getReleaseCorrections(release).length) return true;
  const songs = Array.isArray(release?.songs) ? release.songs : [];
  return songs.some((song) => getSongCorrections(song).length > 0);
};

/**
 * أوّل موضع فيه حقل ناقص في مسوّدة (Entwürfe) — نفس شكل هدف Korrektur وترتيبه،
 * فلا تتضارب قواعد الانتقال بين القسمين.
 */
export const resolveMissingTarget = (release) => {
  if (!release) return null;

  // 1) حقول الـ release، مرتّبة بالخطوة ثم الصفحة
  const missing = REQUIRED_RELEASE_FIELDS
    .filter((field) => isEmptyValue(release[field]))
    .map((field) => {
      const loc = RELEASE_FIELD_LOCATION[field];
      if (!loc || loc.navigable === false) return null;
      const page = loc.view ? METAS_PAGE_ORDER.indexOf(loc.view) : 0;
      return {
        rank: loc.step * 1000 + Math.max(page, 0),
        step: loc.step,
        view: loc.view || null,
        tab: null,
        songUuid: null,
        field,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.rank - b.rank);

  if (missing.length) {
    const head = missing[0];
    const samePage = missing.filter((c) => c.view === head.view && c.step === head.step);
    return { ...head, count: samePage.length, fields: samePage.map((c) => c.field) };
  }

  // 2) أوّل أغنية ناقصة → تبويبها الناقص
  const songs = Array.isArray(release.songs) ? release.songs : [];
  for (let i = 0; i < songs.length; i += 1) {
    const song = songs[i];
    const completion = computeTabCompletion(song);
    if (!completion) continue;
    const tab = TAB_ORDER.find((t) => completion[t] !== true);
    if (tab) {
      return {
        rank: 3000 + i * 10 + TAB_ORDER.indexOf(tab),
        step: 3,
        view: null,
        tab,
        songUuid: song?.uuid || null,
        field: null,
        count: 1,
        fields: [],
      };
    }
  }

  // 3) لا متاجر
  if (!Array.isArray(release.stores) || release.stores.length === 0) {
    return { rank: 4000, step: 4, view: null, tab: null, songUuid: null, field: 'stores', count: 1, fields: ['stores'] };
  }

  return null;
};

/**
 * أوّل تبويب فيه حقل مطلوب تصحيحه في أغنية ما (حسب ترتيب التبويبات).
 */
export const resolveSongTab = (fields) => {
  const tabs = new Set();
  asList(fields).forEach((field) => {
    const tab = SONG_FIELD_LOCATION[field];
    if (tab) tabs.add(tab);
  });
  return SONG_TAB_ORDER.find((tab) => tabs.has(tab)) || null;
};

/**
 * أوّل موضع فيه تصحيح، مرتّباً حسب: الخطوة ← صفحة Metas ← ترتيب الأغنية ← التبويب.
 * يُرجع null إن لم يكن هناك أيّ تصحيح معروف الموضع.
 */
export const resolveCorrectionTarget = (release) => {
  const candidates = [];

  getReleaseCorrections(release).forEach((field) => {
    const loc = RELEASE_FIELD_LOCATION[field];
    if (!loc || loc.navigable === false) return;
    const page = loc.view ? METAS_PAGE_ORDER.indexOf(loc.view) : 0;
    candidates.push({
      rank: loc.step * 1000 + Math.max(page, 0),
      step: loc.step,
      view: loc.view || null,
      tab: null,
      songUuid: null,
      field,
    });
  });

  const songs = Array.isArray(release?.songs) ? release.songs : [];
  songs.forEach((song, index) => {
    getSongCorrections(song).forEach((field) => {
      const tab = SONG_FIELD_LOCATION[field];
      if (!tab) return;
      candidates.push({
        // ترتيب الأغنية أولاً ثم التبويب داخلها.
        rank: 3 * 1000 + index * 10 + Math.max(SONG_TAB_ORDER.indexOf(tab), 0),
        step: 3,
        view: null,
        tab,
        songUuid: song?.uuid || null,
        field,
      });
    });
  });

  if (candidates.length === 0) return null;
  candidates.sort((a, b) => a.rank - b.rank);

  // أوّل حقل مطلوب تصحيحه هو الوجهة: أبكر خطوة ← أبكر صفحة/تبويب فيها.
  // (لا نُقدّم صفحةً لأنّ فيها تصحيحات أكثر؛ المستخدم يبدأ من الأوّل ويتابع.)
  const head = candidates[0];
  const samePlace = candidates.filter(
    (c) =>
      c.step === head.step &&
      c.view === head.view &&
      c.tab === head.tab &&
      c.songUuid === head.songUuid
  );

  return { ...head, count: samePlace.length, fields: samePlace.map((c) => c.field) };
};
