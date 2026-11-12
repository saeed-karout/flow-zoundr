import { useDataStore } from '@/stores/data';

// المستخدم الحالي لهذا التطبيق = ردّ ‎GET /user‎ المحفوظ في مخزن البيانات.
//
// لا نقرأه من localStorage / sessionStorage: المفتاح 'user' هناك لا يكتبه هذا
// التطبيق إطلاقاً، بل تطبيقات ZOUNDR الأخرى على النطاق نفسه — فقد يحمل حساباً
// آخر أو جلسة قديمة. وهذا ما كان يحدث فعلاً: تُرسَل بيانات مستخدم غير الحالي
// إلى ‎/wallet/balance‎ فيعود الرصيد 0.00 لأنّه رصيد حسابٍ آخر.

/** توحيد أسماء الحقول المختلفة، مع التأكّد من اكتمال الثلاثة. */
const shape = (raw) => {
  const user = raw?.data || raw;
  if (!user) return null;

  const uuid = user.uuid || user.id || user.user_uuid;
  const name = user.name || user.username || user.user_name || user.first_name;
  const email = user.email || user.user_email;

  return uuid && name && email ? { uuid, name, email } : null;
};

/** المستخدم الحالي إن كان محمّلاً — بلا أيّ طلب شبكة. */
export const readCurrentUser = () => {
  try {
    return shape(useDataStore().user);
  } catch (error) {
    console.error('❌ تعذّرت قراءة المستخدم الحالي:', error);
    return null;
  }
};

/** المستخدم الحالي، ويُحمَّل من ‎/user‎ إن لم يكن حاضراً بعد. */
export const ensureCurrentUser = async () => {
  const existing = readCurrentUser();
  if (existing) return existing;

  try {
    await useDataStore().loadUser();
  } catch (error) {
    console.error('❌ تعذّر تحميل المستخدم الحالي:', error);
  }
  return readCurrentUser();
};
