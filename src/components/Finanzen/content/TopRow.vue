<template>
  <div class="top-row">
    <ZeitraumComboBox
      ref="zeitraumDropdown"
      @select="handleZeitraumSelect"
    />
    <Guthaben />
    <ButtonPrimary  /> 
  </div>
</template>

<script setup>
import { ref } from 'vue';
import ZeitraumComboBox from './dropDown/ZeitraumDropdown.vue';
import Guthaben from './dropDown/Guthaben.vue';

import ButtonPrimary from './dropDown/ButtonPrimary.vue';



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

@media (min-width:1440px) and (max-width:1599px) {
  .top-row{
    max-height: 40px;
  }
}
</style>