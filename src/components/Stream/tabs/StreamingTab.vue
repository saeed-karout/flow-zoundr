<template>
  <TrendsChart 
    title="Streaming"
    endpoint="/trends/streams"
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