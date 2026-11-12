<template>
  <div class="streaming-segmented-tab">
    <div class="p">{{ title }}</div>
    
    <!-- Bars Container -->
    <div class="bars" ref="barsContainer">
      <!-- بلا بيانات: لا تواريخ ولا 0€ — يبقى الرقم الكبير خلف الصندوق وحده.
           الحاوية نفسها تبقى فيحتفظ الصندوق بارتفاعه. -->
      <template v-if="hasData">
      <div 
        v-for="bar in displayedBars" 
        :key="bar.label" 
        class="graph-month"
        @mouseenter="updateHoverData(bar)" 
        @mouseleave="resetHoverData"
      >
        <!-- Floating Number on Hover (مطابق للشكل الأول) -->
        <div 
          class="number" 
          :style="{ 
            top: `calc(${barHeight}px - ${bar.percentage * (barHeight / 100)}px + 16px )`
          }"
        >
          {{ formatNumber(hoveredBar.label === bar.label ? hoveredBar.value : bar.value) }}€
        </div>

        <!-- Segmented Bar Graph (مطابق للشكل الأول) -->
        <div class="bar-graph" :style="{ height: barHeight + 'px' }">
          <div class="bar-fill" :style="{ height: bar.percentage + '%' }"></div>
          <div v-for="index in 48" :key="index" class="segment-wrapper">
            <div class="segment"></div>
            <div class="gap"></div>
          </div>
        </div>
        
        <!-- Month Label -->
        <div class="month-container">
          <div class="p">{{ bar.label }}</div>
          <div class="hover-line"></div>
        </div>
      </div>
      </template>
    </div>

    <!-- Background Watermark Number -->
    <div class="bg-number">
      {{ formatNumber(totalValue) }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import apiRequest from '@/lib/apiRequest';

// ========== Props ==========
const props = defineProps({
  title: {
    type: String,
    default: 'Streaming'
  },
  endpoint: {
    type: String,
    default: '/trends/streams'
  },
  barColor: {
    type: String,
    default: '#DD1155'
  },
  filters: {
    type: Object,
    default: () => ({})
  }
});

// ========== Reactive Data ==========
const isLoading = ref(false);
const chartData = ref({
  dates: [],
  values: []
});
const barHeight = ref(330); // ارتفاع ثابت مثل الكود الأول
const barsContainer = ref(null);
let fetchTimeout = null;
let resizeObserver = null;

// Hover state
const hoveredBar = ref({
  label: null,
  value: null,
  percentage: null
});

// ========== Computed ==========
const totalValue = computed(() => {
  return chartData.value.values.reduce((sum, val) => sum + val, 0);
});

const hasData = computed(() =>
  chartData.value.values.some((value) => Number(value) > 0)
);

const maxValue = computed(() => {
  const max = Math.max(...chartData.value.values, 1);
  return max;
});

// Process data for display (مع الحفاظ على منطق sampling من الكود الثاني)
const displayedBars = computed(() => {
  const dates = chartData.value.dates;
  const values = chartData.value.values;
  const maxVal = maxValue.value;
  
  if (dates.length === 0) return [];
  
  // نستخدم نفس منطق smart sampling من الكود الثاني
  const getMaxBarsToShow = () => {
    const screenWidth = window.innerWidth;
    if (screenWidth >= 2075) return 20;
    else if (screenWidth >= 1600) return 16;
    else if (screenWidth >= 1440) return 14;
    else if (screenWidth >= 1200) return 12;
    else return 10;
  };
  
  let targetCount = dates.length;
  const maxPossible = getMaxBarsToShow();
  
  if (dates.length > maxPossible) {
    targetCount = maxPossible;
  }
  
  let sampledDates = dates;
  let sampledValues = values;
  
  if (dates.length > targetCount) {
    const step = dates.length / targetCount;
    const sampledDatesTemp = [];
    const sampledValuesTemp = [];
    
    for (let i = 0; i < targetCount; i++) {
      const index = Math.floor(i * step);
      sampledDatesTemp.push(dates[index]);
      sampledValuesTemp.push(values[index]);
    }
    
    sampledDates = sampledDatesTemp;
    sampledValues = sampledValuesTemp;
  }
  
  return sampledValues.map((value, index) => ({
    label: sampledDates[index] || '',
    value: value,
    percentage: maxVal > 0 ? (value / maxVal) * 100 : 0,
    originalValue: value
  }));
});

// ========== Utility Functions ==========
const formatNumber = (num) => {
  if (!num && num !== 0) return '0';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

// Update hover data
const updateHoverData = (bar) => {
  hoveredBar.value = {
    label: bar.label,
    value: bar.value,
    percentage: bar.percentage
  };
};

// Reset hover data
const resetHoverData = () => {
  hoveredBar.value = {
    label: null,
    value: null,
    percentage: null
  };
};

// ========== تحديث ارتفاع الأعمدة (مثل الكود الأول) ==========
const updateBarHeight = () => {
  if (barsContainer.value) {
    const containerHeight = barsContainer.value.clientHeight;
    const availableHeight = containerHeight - 75;
    if (availableHeight > 100) {
      barHeight.value = availableHeight;
    } else {
      barHeight.value = 340;
    }
  }
};

// ========== Build API Params ==========
const buildApiParams = () => {
  const params = new URLSearchParams();
  
  if (props.filters?.dateType) {
    if (props.filters.dateType === 'last_7_days') {
      params.append('date-type', 'last_7_days');
    } else if (props.filters.dateType === 'last_28_days') {
      params.append('date-type', 'last_28_days');
    } else if (props.filters.dateType === 'this_month') {
      params.append('date-type', 'this_month');
    } else if (props.filters.dateType === 'last_month') {
      params.append('date-type', 'last_month');
    } else if (props.filters.dateType === 'last_90_days') {
      params.append('date-type', 'last_90_days');
    } else if (props.filters.dateType === 'last_12_months') {
      params.append('date-type', 'last_12_months');
    } else if (props.filters.dateType === 'custom' && props.filters.startDate && props.filters.endDate) {
      params.append('date-type', 'custom');
      params.append('start_date', props.filters.startDate);
      params.append('end_date', props.filters.endDate);
    } else {
      params.append('date-type', props.filters.dateType);
    }
  }
  
  // التواريخ تُرسَل مع custom فقط، وهي مُضافة أعلاه في فرعه.
  // سابقاً كانت تُرفق مع كلّ preset — وهذا تحديداً ما ولّد
  // date-type=last_7_days&start_date=…&end_date=…
  
  // Array filters
  if (props.filters?.songUuid?.length) {
    props.filters.songUuid.forEach(id => params.append('song_uuid[]', id));
  }
  if (props.filters?.isrc?.length) {
    props.filters.isrc.forEach(code => params.append('isrc[]', code));
  }
  if (props.filters?.releaseUuid?.length) {
    props.filters.releaseUuid.forEach(id => params.append('release_uuid[]', id));
  }
  if (props.filters?.gtin?.length) {
    props.filters.gtin.forEach(code => params.append('gtin[]', code));
  }
  if (props.filters?.artist?.length) {
    props.filters.artist.forEach(name => params.append('artist[]', name));
  }
  if (props.filters?.feature?.length) {
    props.filters.feature.forEach(name => params.append('feature[]', name));
  }
  if (props.filters?.contributer?.length) {
    props.filters.contributer.forEach(name => params.append('contributer[]', name));
  }
  if (props.filters?.producer?.length) {
    props.filters.producer.forEach(name => params.append('producer[]', name));
  }
  if (props.filters?.cLine?.length) {
    props.filters.cLine.forEach(line => params.append('c-line[]', line));
  }
  if (props.filters?.store?.length) {
    props.filters.store.forEach(store => params.append('store[]', store));
  }
  if (props.filters?.country?.length) {
    props.filters.country.forEach(country => params.append('country[]', country));
  }
  
  return params;
};

// ========== Fetch Data ==========
const fetchStreamsData = async () => {
  isLoading.value = true;
  try {
    const params = buildApiParams();
    console.log('📊 Fetching streams with params:', params.toString());
    
    const response = await apiRequest.get(`${props.endpoint}?${params.toString()}`);
    const data = response.data?.data || response.data;
    
    if (data && data.dates && data.values) {
      chartData.value = {
        dates: data.dates,
        values: data.values
      };
      console.log(`✅ Loaded ${chartData.value.dates.length} data points`);
    } else if (data && Array.isArray(data)) {
      chartData.value = {
        dates: data.map(item => item.date || item.label || ''),
        values: data.map(item => item.value || item.count || 0)
      };
    } else {
      console.warn('⚠️ Unexpected data format:', data);
      chartData.value = {
        dates: [],
        values: []
      };
    }
    
    await nextTick();
    setTimeout(updateBarHeight, 100);
  } catch (error) {
    console.error('❌ Error fetching streams data:', error);
    chartData.value = {
      dates: [],
      values: []
    };
    await nextTick();
  } finally {
    isLoading.value = false;
  }
};

const debouncedFetch = () => {
  if (fetchTimeout) {
    clearTimeout(fetchTimeout);
    fetchTimeout = null;
  }
  fetchTimeout = setTimeout(() => {
    fetchStreamsData();
  }, 500);
};

// Watch for filters changes
watch(
  () => props.filters,
  () => {
    debouncedFetch();
  },
  { deep: true, immediate: true }
);

// ========== Lifecycle ==========
onMounted(() => {
  fetchStreamsData();
  window.addEventListener('resize', updateBarHeight);
  
  if (document.querySelector('.streaming-segmented-tab')) {
    resizeObserver = new ResizeObserver(() => {
      updateBarHeight();
    });
    resizeObserver.observe(document.querySelector('.streaming-segmented-tab'));
  }
});

onUnmounted(() => {
  if (fetchTimeout) {
    clearTimeout(fetchTimeout);
    fetchTimeout = null;
  }
  window.removeEventListener('resize', updateBarHeight);
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
});
</script>

<style lang="scss" scoped>
.streaming-segmented-tab {
  display: flex;
  padding: 20px 30px 12px 30px;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  gap: 4px;
  flex: 1 0 0;
  width: 100%;
  height: 100%;
  border-radius: 20px;
  background: var(--Main-Colors-Slate, #26282D);
  position: relative;
  min-height: 0;
  overflow: hidden;
}

.p {
  color: #FFF;
  align-self: stretch;
  font-family: Heebo, sans-serif;
  font-size: 18px;
  font-style: normal;
  font-weight: 700;
  line-height: 0.6;
  letter-spacing: 0.9px;
  text-transform: uppercase;
  position: relative;
  top: 3px;
  flex-shrink: 0;
  z-index: 2;
}

.bars {
  display: flex;
  padding: 10px 0 12px 0;
  justify-content: space-between;
  align-items: flex-end;
  align-self: stretch;
  z-index: 1;
  flex: 1;
  min-height: 0;
  gap: 4px;
  position: relative;
}

.graph-month {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  gap: 27px;
  min-width: 0;
  cursor: pointer;
  transition: 0.3s ease;
  position: relative;
  height: 100%;
}

.graph-month .number {
  position: absolute;
  left: 50%;
  transform: translateX(-50%) translateY(8px);
  color: #FFF;
  text-align: center;
  font-family: Heebo, sans-serif;
  font-size: 14px;
  font-style: normal;
  font-weight: 300;
  line-height: 0.6;
  text-transform: uppercase;
  opacity: 0;
  transition: opacity 0.3s ease, transform 0.3s ease;
  z-index: 20;
  white-space: nowrap;
  pointer-events: none;
  padding: 4px 10px;
  border-radius: 4px;
}

.graph-month:hover .number {
  opacity: 1;
  transform: translateX(-50%) translateY(-20px);
}

.graph-month .bar-graph {
  display: flex;
  width: 100%;
  max-width: 67px;
  min-width: 35px;
  flex-direction: column-reverse;
  align-items: center;
  position: relative;
  background: var(--Main-Colors-Slate, #26282D);
  overflow: hidden;
  border-radius: 4px;
  flex-shrink: 0;
  z-index: 1;
}

.graph-month .bar-graph .bar-fill {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background: v-bind(barColor);
  border-radius: 0 0 4px 4px;
  transition: height 0.3s ease;
  z-index: 0;
}

.graph-month .bar-graph .segment-wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
  flex: 1;
  z-index: 1;
  position: relative;
}

.graph-month .bar-graph .segment {
  width: 100%;
  max-height: 4px;
  background: transparent;
  flex: 1;
}

.graph-month .bar-graph .gap {
  width: 100%;
  max-height: 8px;
  min-height: 1px;
  background: var(--Main-Colors-Slate, #26282D);
  flex: 1;
}

.graph-month .month-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  z-index: 3;
}

.graph-month .month-container .p {
  color: #FFF;
  text-align: center;
  font-family: Heebo, sans-serif;
  font-size: 16px;
  font-style: normal;
  font-weight: 300;
  line-height: 0.6;
  letter-spacing: 0.7px;
  opacity: 0.7;
  text-transform: uppercase;
  top: 0;
}

.graph-month .month-container .hover-line {
  position: absolute;
  bottom: -12px;
  width: 2px;
  height: 2px;
  background: v-bind(barColor);
  opacity: 0;
  transition: width 0.4s ease, opacity 0.4s ease;
}

.graph-month:hover .month-container .hover-line {
  width: 100%;
  max-width: 67px;
  min-width: 35px;
  opacity: 1;
}

.bg-number {
  color: var(--selvar);
  font-family: Heebo;
  font-size: 180px;
  font-weight: 700;
  line-height: 0.8;
  letter-spacing: 9px;
  text-transform: uppercase;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  opacity: 0.1;
  white-space: nowrap;
  z-index: 100;
}

.loading-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(221, 17, 85, 0.1);
  border-top-color: #DD1155;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Responsive Design - مطابق للشكل الأول */
@media (min-width: 1440px) and (max-width: 1599px) {
  .graph-month .bar-graph {
    min-width: 45px;
    max-width: 57px;
  }
  
  .graph-month .month-container .p {
    font-size: 12px;
  }
  
  .graph-month .number {
    font-size: 12px;
  }
}

@media (min-width:1600px) and (max-width:2074px) {
.bg-number{
  font-size: 150px;
}
}

@media (min-width: 2075px) and (max-width: 2560px) {
  .graph-month .bar-graph {
    max-width: 80px;
    min-width: 50px;
  }
  
  .bg-number {
    font-size: 200px;
    letter-spacing: 10px;
  }
}
</style>