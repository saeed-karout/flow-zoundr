<template>
  <TrendsChart 
    title="Release Downloads"
    endpoint="/trends/downloads"
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