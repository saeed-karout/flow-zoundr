<template>
  <Teleport to="body">
    <div v-if="showPopup" class="popup-overlay" @click="handleOverlayClick">
      <div class="popup" @click.stop>
        <div class="top-line">
          <div class="title">Dein Pre-Release Datum ist {{ formatGermanDate(selectedDate) }}!</div>
          <div class="subtitle">Das sind nur {{ daysDifference }} {{ daysDifference === 1 ? 'Tag' : 'Tage' }}!</div>
          <div class="description">
            Bitte beachte, dass wir aufgrund der Store Guidelines in Text, Audio und Cover nicht garantieren
            können, dass Dein Pre-Release zu diesem Datum in jedem Store verfügbar sein wird.
          </div>
          <div class="p">Wir empfehlen Dir, Dein Pre-Release Datum auf <br>
            <span>{{ formatGermanDate(computedRecommendedDate) }}</span> zu ändern.
          </div>
        </div>
        <div class="buttons">
          <div class="button-primary" @click="handleClose">
            <div class="p">Nein Danke!</div>
          </div>
          <div class="button-secondary" @click="handleUpdateDate">
            <div class="p">Ja, bitte ändern!</div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  showPopup: { type: Boolean, required: true },
  selectedDate: { type: String, required: true },
  daysDifference: { type: Number, required: true }
});

const emit = defineEmits(['update-date', 'close']);

// ========== 🔥 حساب التاريخ الموصى به (الجمعة بعد 7 أيام من اليوم الحالي) ==========
const computeRecommendedDate = () => {
  // 🔥 استخدام اليوم الحالي بدلاً من التاريخ المختار
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  console.log('📅 [PreReleasePopup] اليوم الحالي:', today);
  
  // 🔥 إضافة 7 أيام (أسبوع واحد)
  const targetDate = new Date(today);
  targetDate.setDate(targetDate.getDate() + 7);
  
  console.log('📅 [PreReleasePopup] بعد 7 أيام:', targetDate);
  
  // 🔥 الانتقال إلى يوم الجمعة التالي (5 = Friday)
  const currentDay = targetDate.getDay(); // 0=Sunday, 5=Friday
  let daysToAdd = 0;
  
  if (currentDay <= 5) {
    // إذا كان اليوم قبل أو يساوي الجمعة، ننتقل إلى الجمعة
    daysToAdd = 5 - currentDay;
  } else {
    // إذا كان اليوم بعد الجمعة (السبت أو الأحد)، ننتقل إلى الجمعة القادمة
    daysToAdd = (5 - currentDay) + 7;
  }
  
  targetDate.setDate(targetDate.getDate() + daysToAdd);
  
  console.log('📅 [PreReleasePopup] التاريخ الموصى به (الجمعة القادمة بعد 7 أيام):', targetDate);
  
  // تنسيق التاريخ للإرجاع بصيغة DD.MM.YYYY
  return formatDateForReturn(targetDate);
};

// ========== تنسيق التاريخ للإرجاع ==========
const formatDateForReturn = (date) => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
};

// ========== حساب التاريخ الموصى به باستخدام computed ==========
const computedRecommendedDate = computed(() => {
  return computeRecommendedDate();
});

// ========== دالة لتنسيق التاريخ بالصيغة المطلوبة (DD.MM.YYYY) ==========
const formatGermanDate = (dateString) => {
  if (!dateString) return '';
  
  // إذا كان التاريخ بالفعل بصيغة string
  let date;
  
  // التعامل مع صيغ مختلفة من التواريخ
  if (dateString.includes('-')) {
    // صيغة YYYY-MM-DD
    date = new Date(dateString);
  } else if (dateString.includes('/')) {
    // صيغة DD/MM/YY أو YY/MM/DD
    const parts = dateString.split('/');
    if (parts[0].length === 4) {
      // صيغة YYYY/MM/DD
      date = new Date(parts[0], parts[1] - 1, parts[2]);
    } else {
      // صيغة DD/MM/YY
      const year = 2000 + parseInt(parts[2]);
      date = new Date(year, parts[1] - 1, parts[0]);
    }
  } else if (dateString.includes('.')) {
    // صيغة DD.MM.YYYY
    const parts = dateString.split('.');
    date = new Date(parts[2], parts[1] - 1, parts[0]);
  } else {
    // محاولة تحويل مباشر
    date = new Date(dateString);
  }
  
  // تحقق إذا كان التاريخ صالح
  if (isNaN(date.getTime())) {
    return dateString; // أرجع النص الأصلي إذا فشل التحويل
  }
  
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  
  // صيغة: DD.MM.YYYY
  return `${day}.${month}.${year}`;
};

// ========== معالجة الأحداث ==========
const handleClose = () => {
  console.log('🔄 [PreReleasePopup] إغلاق البوب اب (Nein Danke!)');
  emit('close');
};

const handleUpdateDate = () => {
  console.log('🔄 [PreReleasePopup] تحديث التاريخ إلى:', computedRecommendedDate.value);
  emit('update-date', computedRecommendedDate.value);
  emit('close');
};

const handleOverlayClick = () => {
  console.log('🔄 [PreReleasePopup] النقر على الخلفية - إغلاق');
  emit('close');
};
</script>

<style lang="scss" scoped>
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 99999;
  backdrop-filter: blur(4px);
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.popup {
  display: flex;
  width: 580px;
  padding: 52px 32px 40px 32px;
  flex-direction: column;
  align-items: flex-end;
  gap: 24px;
  flex-shrink: 0;
  border-radius: 20px;
  border: 2px solid var(--Main-Colors-Strawberry, #D15);
  background: var(--Main-Colors-Slate, #26282D);
  animation: slideUp 0.3s ease;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.top-line {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 28px;
  align-self: stretch;
}

.title {
  align-self: stretch;
  color: var(--Main-Colors-Strawberry, #D15);
  text-align: center;
  font-family: Heebo;
  font-size: 28px;
  font-style: normal;
  font-weight: 700;
  line-height: 1.2;
  text-transform: uppercase;
}

.subtitle {
  align-self: center;
  color: var(--Main-Colors-White, #FFF);
  font-family: Heebo;
  font-size: 28px;
  font-style: normal;
  font-weight: 700;
  line-height: 1.2;
  text-transform: uppercase;
}

.description {
  align-self: stretch;
  color: var(--Main-Colors-White, #FFF);
  text-align: center;
  font-family: Heebo;
  font-size: 18px;
  font-style: normal;
  font-weight: 300;
  line-height: 1.5;
}

.p {
  align-self: stretch;
  color: var(--Main-Colors-White, #FFF);
  text-align: center;
  font-family: Heebo;
  font-size: 18px;
  font-style: normal;
  font-weight: 700;
  line-height: 1.5;
}

.p span {
  color: var(--Main-Colors-Strawberry, #D15);
  font-family: Heebo;
  font-size: 18px;
  font-style: normal;
  font-weight: 700;
  line-height: 1.2;
}

.buttons {
  display: flex;
  padding-top: 24px;
  justify-content: space-between;
  align-items: flex-start;
  align-self: stretch;
  gap: 16px;
}

.button-primary {
  display: flex;
  flex: 1;
  padding: 12px 20px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  border-radius: 5px;
  background: var(--Main-Colors-Slate-Light, #3A3E42);
  cursor: pointer;
  transition: background 0.3s ease, transform 0.2s ease;
}

.button-primary:hover {
  background: #4a4e52;
  transform: scale(1.02);
}

.button-primary:active {
  transform: scale(0.98);
}

.button-primary .p {
  color: var(--Main-Colors-White, #FFF);
  font-family: Heebo;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: 1;
  text-transform: uppercase;
}

.button-secondary {
  display: flex;
  flex: 1;
  padding: 12px 20px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  border-radius: 5px;
  background: var(--Main-Colors-Strawberry, #D15);
  cursor: pointer;
  transition: background 0.3s ease, transform 0.2s ease;
}

.button-secondary:hover {
  background: #b30f45;
  transform: scale(1.02);
}

.button-secondary:active {
  transform: scale(0.98);
}

.button-secondary .p {
  color: var(--Main-Colors-White, #FFF);
  font-family: Heebo;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: 1;
  text-transform: uppercase;
}

/* ===== استجابة للشاشات الصغيرة ===== */
@media (max-width: 768px) {
  .popup {
    width: 90%;
    padding: 32px 20px 28px 20px;
    margin: 0 16px;
  }
  
  .title {
    font-size: 22px;
  }
  
  .subtitle {
    font-size: 22px;
  }
  
  .description {
    font-size: 16px;
  }
  
  .p {
    font-size: 16px;
  }
  
  .buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .button-primary,
  .button-secondary {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .popup {
    padding: 24px 16px 20px 16px;
  }
  
  .title {
    font-size: 18px;
  }
  
  .subtitle {
    font-size: 18px;
  }
  
  .description {
    font-size: 14px;
  }
  
  .p {
    font-size: 14px;
  }
}
</style>