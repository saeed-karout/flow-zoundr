<template>
  <div class="top-row">
    <ZeitraumComboBox
      ref="zeitraumDropdown"
      @select="handleZeitraumSelect"
    />
    <Guthaben />
    <ButtonPrimary /> 
  </div>
</template>

<script setup>
import { ref } from 'vue';
import ZeitraumComboBox from './dropDown/ZeitraumDropdown.vue';
import Guthaben from './dropDown/Guthaben.vue';
import ButtonPrimary from './dropDown/ButtonPrimary.vue';

// ========== Emits ==========
const emit = defineEmits(['filters-changed']);

// ========== Refs ==========
const zeitraumDropdown = ref(null);

// ========== Methods ==========
const handleZeitraumSelect = (value) => {
  console.log('📅 Zeitraum selected:', value);
  
  // إرسال الفلتر إلى المكون الأب
  emit('filters-changed', value);
};
</script>

<style lang="scss" scoped>
.top-row {
  display: flex;
  align-items: center;
  gap: 20px;
  align-self: stretch;
  position: relative;
  z-index: 100;
}

@media (min-width: 1440px) and (max-width: 1599px) {
  .top-row {
    max-height: 40px;
  }
}
</style>