<template>
  <div class="top-row">
    <ZeitraumComboBox
      ref="zeitraumDropdown"
      @select="handleZeitraumSelect"
    />
    <FilterComboBox
      ref="filterDropdown"
      @select="handleFilterSelect"
    />
    <Switch :isSwitchActive="isSwitchActive" @toggle-switch="$emit('toggle-switch')" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import ZeitraumComboBox from './dropDown/ZeitraumDropdown.vue';
import FilterComboBox from './dropDown/FilterDropdown.vue';
import Switch from './Switch.vue';

defineProps(['isSwitchActive']);
defineEmits(['toggle-switch']);

const zeitraumDropdown = ref(null);
const filterDropdown = ref(null);

const handleZeitraumSelect = (value) => {
  console.log('Zeitraum selected:', value);
};

const handleFilterSelect = (value) => {
  console.log('Filter selected:', value);
};
</script>

<style lang="scss" scoped>
.top-row {
  display: flex;
  align-items: center;
  gap: 20px;
  align-self: stretch;
  position: relative;
  z-index: 100; /* تأكد من أن الـ TopRow فوق العناصر الأخرى */
}
</style>