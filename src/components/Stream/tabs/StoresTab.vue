<template>
  <MultiLineChart 
    title="Stores"
    endpoint="/trends/stores"
    :filters="filters"
  />
</template>

<script setup>
import MultiLineChart from '@/components/Trends/MultiLineChart.vue';

defineProps({
  filters: {
    type: Object,
    default: () => ({})
  }
});
</script>