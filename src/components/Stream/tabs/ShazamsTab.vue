<template>
  <TrendsChart 
    title="Shazams"
    endpoint="/trends/shazams"
    chart-color="#2196F3"
    :filters="filters"
  />
</template>

<script setup>
import TrendsChart from '@/components/Trends/TrendsChart.vue';

defineProps({
  filters: {
    type: Object,
    default: () => ({})
  }
});
</script>