```vue
<template>
  
  <component :is="currentComponent" :current-step="currentStep" @next="nextStep" @prev="prevStep" />
</template>

<script setup>
import { ref, computed } from 'vue';
import SchutzenView from '@/components/steps/SchutzenView1.vue';
import SchutzenView2 from '@/components/steps/SchutzenView2.vue';
import SchutzenView33 from '@/components/steps/SchutzenView33.vue';
import final from '../components/steps/final.vue';
import SchutzenView4 from '@/components/steps/SchutzenView4.vue';

// متغير لتتبع الخطوة الحالية
const currentStep = ref(1);

// تعريف الخطوات
const steps = ref([
  { id: 1, name: 'step 1' },
  { id: 2, name: 'step 2' },
  { id: 3, name: 'step 3' },
  { id: 4, name: 'step 4' },
  { id: 5, name: 'final' }
]);

// تحديد المكون بناءً على الخطوة الحالية
const currentComponent = computed(() => {
  switch (currentStep.value) {
    case 1:
      return SchutzenView;
    case 2:
      return SchutzenView2;
    case 3:
      return SchutzenView33;
    case 4:
      return SchutzenView4;
    case 5:
      return final;
    default:
      return SchutzenView;
  }
});

// الانتقال إلى الخطوة التالية
const nextStep = () => {
  if (currentStep.value < steps.value.length) {
    currentStep.value += 1;
  }
};

// الانتقال إلى الخطوة السابقة
const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value -= 1;
  }
};

// الانتقال إلى خطوة معينة
const goToStep = (stepId) => {
  currentStep.value = stepId;
};
</script>
```