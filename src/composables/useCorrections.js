import { computed, unref } from 'vue';
import { useReleaseStore } from '@/stores/release';
import { CORRECTION_CLASS } from '@/utils/corrections';

/**
 * يُتيح لأيّ مكوّن في تدفّق التعديل معرفة الحقول المطلوب تصحيحها (status: correction)
 * فيضع عليها بوردر أحمر. المصدر هو releaseStore.correctionFields الذي عبّأه
 * CatalogStatusView عند فتح الـ release من قسم Korrektur.
 *
 * @param {import('vue').Ref<string>|string|Function} songUuid  لحقول الأغنية فقط
 */
export function useCorrections(songUuid = null) {
  const releaseStore = useReleaseStore();

  const releaseFields = computed(() => releaseStore.correctionFields?.release || []);

  const songFields = computed(() => {
    const uuid = typeof songUuid === 'function' ? songUuid() : unref(songUuid);
    if (!uuid) return [];
    return releaseStore.correctionFields?.songs?.[uuid] || [];
  });

  const isCorrected = (field) => releaseFields.value.includes(field);
  const isSongCorrected = (field) => songFields.value.includes(field);

  // تُستعمل مباشرةً في :class — تُرجع '' فلا تضيف شيئاً عند عدم وجود تصحيح.
  const correctionClass = (field) => (isCorrected(field) ? CORRECTION_CLASS : '');
  const songCorrectionClass = (field) => (isSongCorrected(field) ? CORRECTION_CLASS : '');

  const hasCorrections = computed(
    () => releaseFields.value.length > 0 || songFields.value.length > 0
  );

  return {
    releaseFields,
    songFields,
    isCorrected,
    isSongCorrected,
    correctionClass,
    songCorrectionClass,
    hasCorrections,
  };
}
