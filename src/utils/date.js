// تحليل تواريخ الـ API بأمان على كلّ المتصفّحات.
//
// `new Date("2024-05-01 10:00:00")` يعمل في كروم لكنّه يُرجع Invalid Date في
// سفاري (والصيغة غير معياريّة أصلاً: المعيار يوجب حرف T). فأيّ حقل يصل بهذه
// الصيغة من الخادم كان يظهر فارغاً أو NaN في سفاري وحده — لذلك يمرّ كلّ تحليل
// تاريخ من هنا.

/** @returns {Date|null} */
export const parseApiDate = (value) => {
  if (value === null || value === undefined || value === '') return null;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === 'number') {
    const fromNumber = new Date(value);
    return Number.isNaN(fromNumber.getTime()) ? null : fromNumber;
  }

  const text = String(value).trim();
  if (!text) return null;

  // الصيغة الألمانية 01.05.2024
  const german = text.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (german) {
    return new Date(Number(german[3]), Number(german[2]) - 1, Number(german[1]));
  }

  // "2024-05-01 10:00:00" → "2024-05-01T10:00:00" ليقبلها سفاري وفايرفوكس
  const normalized = text.replace(/^(\d{4}-\d{2}-\d{2})[ ](\d{2}:\d{2})/, '$1T$2');

  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
};

/** 01.05.2024 — التنسيق المعتمد في الواجهة. */
export const formatDateDe = (value) => {
  const date = parseApiDate(value);
  if (!date) return null;
  return date.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

/** قيمة للترتيب — 0 لتاريخ غير صالح بدل NaN الذي يُفسد المقارنة. */
export const dateSortValue = (value) => {
  const date = parseApiDate(value);
  return date ? date.getTime() : 0;
};
