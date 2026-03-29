```vue
<template>
  <div v-if="showPopup" class="popup-overlay">
    <div class="popup">
      <div class="top-line">
        <div class="title">Dein Release Datum ist {{ selectedDate }}!</div>
        <div class="subtitle">Das sind nur {{ daysDifference }} {{ daysDifference === 1 ? 'Tag' : 'Tage' }}!</div>
        <div class="description">
          Bitte beachte, dass wir aufgrund der Store Guidelines in Text, Audio und Cover nicht garantieren
          können, dass Dein Release zu diesem Datum in jedem Store verfügbar sein wird.
        </div>
        <div class="p">Wir empfehlen Dir, Dein Releasedatum auf <br>
          <span>{{ recommendedDate }}</span> zu ändern (mindestens 14 Tage ab heute).
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
defineProps({
  showPopup: { type: Boolean, required: true },
  selectedDate: { type: String, required: true },
  recommendedDate: { type: String, required: true },
  daysDifference: { type: Number, required: true }
});

defineEmits(['update-date', 'close']);
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
  width: 560px;
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
  line-height: 1;
  text-transform: uppercase;
}

.subtitle {
  align-self: center;
  color: var(--Main-Colors-White, #FFF);
  font-family: Heebo;
  font-size: 28px;
  font-style: normal;
  font-weight: 700;
  line-height: 1;
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
  line-height: 130%;
}

.p {
  align-self: stretch;
  color: var(--Main-Colors-White, #FFF);
  text-align: center;
  font-family: Heebo;
  font-size: 18px;
  font-style: normal;
  font-weight: 700;
  line-height: 130%;
}

.p span {
  color: var(--Main-Colors-Strawberry, #D15);
  font-family: Heebo;
  font-size: 18px;
  font-style: normal;
  font-weight: 700;
  line-height: 1;
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
  line-height: 1;
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
  line-height: 1;
  text-transform: uppercase;
}

.button-primary:hover,
.button-secondary:hover {
  transition: 0.3s ease;
  background: var(--dark-red);
}
</style>
```