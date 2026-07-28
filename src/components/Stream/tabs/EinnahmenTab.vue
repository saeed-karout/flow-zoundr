<template>
  <BarChart 
     title="Einnahmen"
    endpoint="/trends/streams"
    bar-color="#DD1155"
    :filters="filters"
  />
</template>

<script setup>
import BarChart from '@/components/Trends/BarChart.vue';

defineProps({
  filters: {
    type: Object,
    default: () => ({})
  }
});
</script>