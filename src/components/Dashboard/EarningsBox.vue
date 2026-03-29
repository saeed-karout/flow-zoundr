<template>
  <div class="earnings-container">
    <p class="title">{{ title }}</p>
    <div class="chart-container">
      <canvas ref="chart"></canvas>
    </div>
    <div class="value">{{ formattedValue }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import Chart from 'chart.js/auto';

const props = defineProps({
  title: { type: String, required: true },
  value: { type: Number, required: true },
});

const chart = ref(null);
let chartInstance = null;

const formattedValue = computed(() => {
  return new Intl.NumberFormat('de-DE').format(props.value);
});

// بيانات وهمية ثابتة للرسم البياني (Einnahmen der letzten 12 Monate)
function getChartData() {
  return [
    { month: 'Jan', earnings: 3200 },
    { month: 'Feb', earnings: 2800 },
    { month: 'Mar', earnings: 4500 },
    { month: 'Apr', earnings: 3600 },
    { month: 'May', earnings: 5100 },
    { month: 'Jun', earnings: 4200 },
    { month: 'Jul', earnings: 3900 },
    { month: 'Aug', earnings: 4700 },
    { month: 'Sep', earnings: 3400 },
    { month: 'Oct', earnings: 5300 },
    { month: 'Nov', earnings: 4000 },
    { month: 'Dec', earnings: 4800 },
  ];
}

onMounted(() => {
  if (chart.value) {
    chartInstance = new Chart(chart.value.getContext('2d'), {
      type: 'line',
      data: {
        labels: getChartData().map(d => d.month),
        datasets: [{
          label: 'Earnings',
          data: getChartData().map(d => d.earnings),
          borderColor: '#D15',
          fill: false,
          pointBackgroundColor: '#D15',
          pointBorderColor: '#D15',
          pointRadius: 6,
        }],
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: '#6A6C6D', font: { size: 10 } } },
          y: { ticks: { color: '#6A6C6D', font: { size: 10 } } },
        },
      },
    });
  }
});

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }
});
</script>

<style lang="scss" scoped>
.earnings-container {
  display: flex;
  height: 100%;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 24px;
  position: relative;
  width: 100%;
}

.title {
  align-self: stretch;
  color: #FFF;
  font-size: 18px;
  font-style: normal;
  font-weight: 700;
  line-height: 1;
  letter-spacing: 0.9px;
  text-transform: uppercase;
  margin: 0;
}

.chart-container {
  width: 100%;
  height: 200px; /* ارتفاع محدد لضمان عرض الرسم البياني */
  position: relative;
}

.chart {
  width: 100%;
  height: 100%;
}

.value {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  color: #6A6C6D;
  font-size: 180px;
  font-style: normal;
  font-weight: 700;
  line-height: 1;
  letter-spacing: 9px;
  text-transform: uppercase;
  z-index: 10;
  opacity: 0.1;
  pointer-events: none;
}
</style>