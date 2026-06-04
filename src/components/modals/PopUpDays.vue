<template>
  <div v-if="showPopup" class="popup-overlay">
    <div class="popup">
      <div class="top-line">
        <div class="title">Dein Release Datum ist {{ formatGermanDate(selectedDate) }}!</div>
        <div class="subtitle">Das sind nur {{ daysDifference }} {{ daysDifference === 1 ? 'Tag' : 'Tage' }}!</div>
        <div class="description">
          Bitte beachte, dass wir aufgrund der Store Guidelines in Text, Audio und Cover nicht garantieren
          können, dass Dein Release zu diesem Datum in jedem Store verfügbar sein wird.
        </div>
        <div class="p">Wir empfehlen Dir, Dein Releasedatum auf <br>
          <span>{{ formatGermanDate(recommendedDate) }}</span> zu ändern.
        </div>
      </div>
      <div class="buttons">
        <div class="button-primary" @click="$emit('close')">
          <div class="p">Nein Danke!</div>
        </div>
        <div class="button-secondary" @click="$emit('update-date', recommendedDate)">
          <div class="p">Ja, bitte ändern!</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  showPopup: { type: Boolean, required: true },
  selectedDate: { type: String, required: true },
  recommendedDate: { type: String, required: true },
  daysDifference: { type: Number, required: true }
});

defineEmits(['update-date', 'close']);

// دالة لتنسيق التاريخ بالصيغة الألمانية (DD.MM.YYYY)
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
  
  // صيغة ألمانية: DD.MM.YYYY
  return `${day}.${month}.${year}`;
};
</script>

<style lang="scss" scoped>
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
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
  line-height: .7;
  text-transform: uppercase;
}

.subtitle {
  align-self: center;
  color: var(--Main-Colors-White, #FFF);
  font-family: Heebo;
  font-size: 28px;
  font-style: normal;
  font-weight: 700;
  line-height: .7;
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
  line-height: 1.2;
}

.p {
  align-self: stretch;
  color: var(--Main-Colors-White, #FFF);
  text-align: center;
  font-family: Heebo;
  font-size: 18px;
  font-style: normal;
  font-weight: 700;
  line-height: 1.2;
}

.p span {
  color: var(--Main-Colors-Strawberry, #D15);
  font-family: Heebo;
  font-size: 18px;
  font-style: normal;
  font-weight: 700;
  line-height: .7;
}

.buttons {
  display: flex;
  padding-top: 24px;
  justify-content: space-between;
  align-items: flex-start;
  align-self: stretch;
}

.button-primary {
  display: flex;
  width: 160px;
  padding: 12px 20px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  border-radius: 5px;
  background: var(--Main-Colors-Slate-Light, #3A3E42);
  cursor: pointer;
}

.button-primary .p {
  color: var(--Main-Colors-White, #FFF);
  font-family: Heebo;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: .7;
  text-transform: uppercase;
}

.button-secondary {
  display: flex;
  width: 180px;
  padding: 12px 20px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  border-radius: 5px;
  background: #D15;
  cursor: pointer;
}

.button-secondary .p {
  color: var(--Main-Colors-White, #FFF);
  font-family: Heebo;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: .7;
  text-transform: uppercase;
}

.button-primary:hover,
.button-secondary:hover {
  transition: 0.3s ease;
  background: var(--dark-red);
}
</style>