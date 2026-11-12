// تنسيق نصوص العرض فقط — لا يغيّر البيانات نفسها.
//   • "_" تصير مسافة:            original_instrumental → Original Instrumental
//   • أول حرف من كل كلمة كبير:   kein ISRC → Kein ISRC
//   • بقية الحروف تُترك كما هي، فلا تنكسر الاختصارات (ISRC، GTIN، EUR).
//   • \p{L} يغطّي الحروف الألمانية (ä ö ü)، والأرقام والتواريخ تمرّ دون تغيير.
export const toTitleCase = (value) => {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/(^|\s)(\p{L})/gu, (_m, space, ch) => space + ch.toLocaleUpperCase('de-DE'));
};
