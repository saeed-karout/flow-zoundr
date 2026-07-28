<template>
  <div class="multi-line-chart-container">
    <div class="multi-line-chart-box">
      <div class="p">{{ title }}</div>
      
      <!-- Loading State -->
      <!-- <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
      </div> -->
      
      <!-- Chart with multiple lines -->
      <div  class="chart-wrapper" ref="chartWrapperRef">
        <div class="chart-container" ref="chartContainerRef">
          <svg 
            class="multi-line-svg" 
            :viewBox="`0 0 ${svgWidth} ${svgHeight}`"
            preserveAspectRatio="xMidYMid meet"
            @mousemove="showTooltipOnLines"
            @mouseleave="hideTooltip"
          >
            <defs>
              <!-- Gradients for each store -->
              <linearGradient v-for="store in activeStores" :key="`gradient-${store.key}`" :id="`gradient-${store.key}`" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" :stop-color="store.color" stop-opacity="0.8"/>
                <stop offset="100%" :stop-color="store.color" stop-opacity="0.05"/>
              </linearGradient>
            </defs>
            
            <!-- Area fills for each store -->
            <path 
              v-for="store in activeStores"
              :key="`area-${store.key}`"
              :d="getAreaPath(store.key)"
              :fill="`url(#gradient-${store.key})`"
              opacity="0.3"
            />
            
            <!-- Line strokes for each store -->
            <path 
              v-for="store in activeStores"
              :key="`line-${store.key}`"
              :d="getLinePath(store.key)"
              :stroke="store.color"
              stroke-width="2"
              fill="none"
              :style="{ 
                strokeDasharray: store.dashArray || 'none',
                opacity: (highlightedStore && highlightedStore !== store.key) ? 0.2 : 1
              }"
            />
          </svg>
        </div>
        
        <!-- X-axis labels -->
        <div class="chart-labels">
          <div 
            v-for="(item, index) in displayedLabels" 
            :key="index"
            class="chart-label"
            :style="{ left: item.position + '%' }"
          >
            {{ item.label }}
          </div>
        </div>
        
        <!-- Legend -->
        <!-- <div class="chart-legend">
          <div 
            v-for="store in activeStores" 
            :key="store.key"
            class="legend-item"
            @mouseenter="highlightStore(store.key)"
            @mouseleave="unhighlightStore()"
          >
            <div class="legend-color" :style="{ backgroundColor: store.color }"></div>
            <div class="legend-label">{{ store.label }}</div>
          </div>
        </div> -->
      </div>
      
      <!-- Tooltip -->
      <div 
        v-if="tooltip.visible" 
        class="chart-tooltip"
        :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }"
      >
        <div 
          v-for="store in tooltip.stores" 
          :key="store.key"
          class="tooltip-store"
        >
          <div class="tooltip-color" :style="{ backgroundColor: store.color }"></div>
          <div class="tooltip-value" :style="{ color: store.color }">{{ formatNumber(store.value) }}</div>
          <div class="tooltip-label">{{ store.label }}</div>
        </div>
        <div class="tooltip-date">{{ tooltip.date }}</div>
      </div>
      
      <!-- Total number as background watermark -->
      <div class="number">{{ formatNumber(totalValue) }}</div>
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
    required: true,
    default: 'Stores'
  },
  endpoint: {
    type: String,
    required: true,
    default: '/trends/stores'
  },
  filters: {
    type: Object,
    default: () => ({})
  }
});

// ========== Store Color Palette ==========
const storeColorPalette = {
  'spotify': { color: '#1DB954', label: 'Spotify' },
  'apple music': { color: '#A2AAAD', label: 'Apple Music' },
  'apple': { color: '#A2AAAD', label: 'Apple Music' },
  'deezer': { color: '#2D96C8', label: 'Deezer' },
  'amazon music': { color: '#FF9900', label: 'Amazon Music' },
  'amazon': { color: '#FF9900', label: 'Amazon Music' },
  'tidal': { color: '#000000', label: 'Tidal' },
  'youtube music': { color: '#FF0000', label: 'YouTube Music' },
  'youtube': { color: '#FF0000', label: 'YouTube Music' },
  'soundcloud': { color: '#FF5500', label: 'SoundCloud' },
  'pandora': { color: '#005483', label: 'Pandora' },
  'napster': { color: '#000000', label: 'Napster' },
  'anghami': { color: '#1ED760', label: 'Anghami' },
  'google play': { color: '#4285F4', label: 'Google Play' },
  'google': { color: '#4285F4', label: 'Google Play' },
};

// Default colors for unknown stores
const defaultColors = [
  { color: '#FF6B6B', label: 'Store 1' },
  { color: '#4ECDC4', label: 'Store 2' },
  { color: '#45B7D1', label: 'Store 3' },
  { color: '#96CEB4', label: 'Store 4' },
  { color: '#FFEAA7', label: 'Store 5' },
  { color: '#DDA0DD', label: 'Store 6' },
  { color: '#FF8A5C', label: 'Store 7' },
  { color: '#A29BFE', label: 'Store 8' },
  { color: '#FD79A8', label: 'Store 9' },
  { color: '#00B894', label: 'Store 10' },
];

// ========== Reactive Data ==========
const isLoading = ref(false);
const chartData = ref({
  dates: [],
  values: [] // Array of objects for each store
});
const storeKeys = ref([]); // Store keys from API
const chartWrapperRef = ref(null);
const chartContainerRef = ref(null);
let fetchTimeout = null;
let resizeObserver = null;

// SVG dimensions
const svgWidth = ref(100);
const svgHeight = ref(100);
const padding = { left: 0, right: 0, top: 8, bottom: 40 };

// Tooltip state
const tooltip = ref({
  visible: false,
  x: 0,
  y: 0,
  date: '',
  stores: []
});

// Highlight state
const highlightedStore = ref(null);

// ========== Computed ==========
// Get active stores with colors
const activeStores = computed(() => {
  const stores = [];
  let defaultColorIndex = 0;
  
  storeKeys.value.forEach((key, index) => {
    let storeConfig = storeColorPalette[key];
    
    if (storeConfig) {
      stores.push({
        key: key,
        label: storeConfig.label || key,
        color: storeConfig.color,
        dashArray: 'none'
      });
    } else {
      // Use default colors for unknown stores
      const defaultColor = defaultColors[defaultColorIndex % defaultColors.length];
      stores.push({
        key: key,
        label: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
        color: defaultColor.color,
        dashArray: defaultColorIndex % 2 === 0 ? 'none' : '5,5'
      });
      defaultColorIndex++;
    }
  });
  
  return stores;
});

const totalValue = computed(() => {
  let total = 0;
  chartData.value.values.forEach(dayData => {
    storeKeys.value.forEach(key => {
      total += dayData[key] || 0;
    });
  });
  return total;
});

const chartLabels = computed(() => {
  return chartData.value.dates;
});

const maxValue = computed(() => {
  let max = 1;
  chartData.value.values.forEach(dayData => {
    storeKeys.value.forEach(key => {
      const value = dayData[key] || 0;
      if (value > max) max = value;
    });
  });
  return max * 1.1;
});

// Display labels based on number of data points
const displayedLabels = computed(() => {
  const labels = chartData.value.dates;
  const count = labels.length;
  
  if (count === 0) return [];
  
  if (count <= 7) {
    return labels.map((label, index) => ({
      label: label,
      position: (index / (count - 1)) * 100
    }));
  } else if (count <= 14) {
    return labels.filter((_, index) => index % 2 === 0).map((label, idx, arr) => ({
      label: label,
      position: (idx / (arr.length - 1)) * 100
    }));
  } else if (count <= 28) {
    return labels.filter((_, index) => index % 4 === 0).map((label, idx, arr) => ({
      label: label,
      position: (idx / (arr.length - 1)) * 100
    }));
  } else {
    return labels.filter((_, index) => index % 7 === 0).map((label, idx, arr) => ({
      label: label,
      position: (idx / (arr.length - 1)) * 100
    }));
  }
});

// ========== Chart Functions ==========
const getStorePoints = (storeKey) => {
  const values = chartData.value.values;
  const maxVal = maxValue.value;
  
  const availableWidth = svgWidth.value - padding.left - padding.right;
  const availableHeight = svgHeight.value - padding.top - padding.bottom;
  
  if (values.length === 0 || availableWidth <= 0 || availableHeight <= 0) return [];
  
  const step = values.length > 1 ? availableWidth / (values.length - 1) : availableWidth;
  
  return values.map((dayData, index) => {
    const value = dayData[storeKey] || 0;
    let y = svgHeight.value - padding.bottom - ((value / maxVal) * availableHeight);
    y = Math.max(padding.top, Math.min(svgHeight.value - padding.bottom, y));
    
    return {
      x: padding.left + (index * step),
      y: y,
      value: value,
      index: index
    };
  });
};

const getLinePath = (storeKey) => {
  const points = getStorePoints(storeKey);
  if (points.length < 2) return '';
  
  let path = `M ${points[0].x} ${points[0].y}`;
  
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const dx = curr.x - prev.x;
    path += ` C ${prev.x + dx * 0.3} ${prev.y}, ${curr.x - dx * 0.3} ${curr.y}, ${curr.x} ${curr.y}`;
  }
  
  return path;
};

const getAreaPath = (storeKey) => {
  const points = getStorePoints(storeKey);
  if (points.length < 2) return '';
  
  const startX = points[0].x;
  const bottomY = svgHeight.value - padding.bottom;
  
  let path = `M ${startX} ${bottomY} L ${points[0].x} ${points[0].y}`;
  
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const dx = curr.x - prev.x;
    path += ` C ${prev.x + dx * 0.3} ${prev.y}, ${curr.x - dx * 0.3} ${curr.y}, ${curr.x} ${curr.y}`;
  }
  
  const lastPoint = points[points.length - 1];
  path += ` L ${lastPoint.x} ${bottomY} Z`;
  
  return path;
};

// ========== Utility Functions ==========
const formatNumber = (num) => {
  if (!num && num !== 0) return '0';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const showTooltipOnLines = (event) => {
  const svg = event.target.closest('.multi-line-svg');
  if (!svg) return;
  
  const rect = svg.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const containerRect = chartWrapperRef.value?.getBoundingClientRect();
  
  if (containerRect && storeKeys.value.length > 0) {
    const points = getStorePoints(storeKeys.value[0]);
    let closestPoint = null;
    let minDistance = Infinity;
    
    points.forEach(point => {
      const distance = Math.abs(point.x - x);
      if (distance < minDistance) {
        minDistance = distance;
        closestPoint = point;
      }
    });
    
    if (closestPoint && minDistance < 50) {
      const storeValues = [];
      storeKeys.value.forEach(key => {
        const storePoints = getStorePoints(key);
        const point = storePoints[closestPoint.index];
        if (point) {
          const store = activeStores.value.find(s => s.key === key);
          storeValues.push({
            key: key,
            label: store?.label || key,
            value: point.value,
            color: store?.color || '#888'
          });
        }
      });
      
      tooltip.value = {
        visible: true,
        x: event.clientX - containerRect.left,
        y: event.clientY - containerRect.top - 60,
        date: chartLabels.value[closestPoint.index] || '',
        stores: storeValues
      };
    }
  }
};

const hideTooltip = () => {
  tooltip.value.visible = false;
};

const highlightStore = (storeKey) => {
  highlightedStore.value = storeKey;
};

const unhighlightStore = () => {
  highlightedStore.value = null;
};

// ========== Update SVG dimensions ==========
const updateSvgDimensions = () => {
  if (chartContainerRef.value) {
    const rect = chartContainerRef.value.getBoundingClientRect();
    svgWidth.value = rect.width;
    svgHeight.value = rect.height;
  }
};

// ========== Build API Params ==========
const buildApiParams = () => {
  const params = new URLSearchParams();
  
  if (props.filters?.dateType) {
    params.append('date-type', props.filters.dateType);
  }
  
  if (props.filters?.startDate && props.filters.dateType === 'custom') {
    params.append('start_date', props.filters.startDate);
  }
  if (props.filters?.endDate && props.filters.dateType === 'custom') {
    params.append('end_date', props.filters.endDate);
  }
  
  return params;
};

// ========== Fetch Data ==========
const fetchData = async () => {
  isLoading.value = true;
  try {
    const params = buildApiParams();
    console.log(`📊 Fetching ${props.endpoint} with params:`, params.toString());
    
    const response = await apiRequest.get(`${props.endpoint}?${params.toString()}`);
    const data = response.data?.data || response.data;
    
    if (data && data.dates && data.values && data.values.length > 0) {
      // Extract store keys from the first data point
      const firstDataPoint = data.values[0];
      storeKeys.value = Object.keys(firstDataPoint);
      
      chartData.value = {
        dates: data.dates,
        values: data.values
      };
      console.log(`✅ Loaded data for ${storeKeys.value.length} stores:`, storeKeys.value);
    } else {
      console.warn('⚠️ Unexpected data format:', data);
      chartData.value = { dates: [], values: [] };
      storeKeys.value = [];
    }
    
    await nextTick();
    updateSvgDimensions();
  } catch (error) {
    console.error(`❌ Error fetching ${props.endpoint} data:`, error);
    chartData.value = { dates: [], values: [] };
    storeKeys.value = [];
    await nextTick();
    updateSvgDimensions();
  } finally {
    isLoading.value = false;
  }
};

const debouncedFetch = () => {
  if (fetchTimeout) clearTimeout(fetchTimeout);
  fetchTimeout = setTimeout(() => {
    fetchData();
  }, 500);
};

watch(
  () => props.filters,
  () => {
    debouncedFetch();
  },
  { deep: true, immediate: true }
);

const handleResize = () => {
  updateSvgDimensions();
};

onMounted(() => {
  fetchData();
  window.addEventListener('resize', handleResize);
  
  if (chartContainerRef.value) {
    resizeObserver = new ResizeObserver(() => {
      updateSvgDimensions();
    });
    resizeObserver.observe(chartContainerRef.value);
  }
});

onUnmounted(() => {
  if (fetchTimeout) clearTimeout(fetchTimeout);
  window.removeEventListener('resize', handleResize);
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
});
</script>

<style lang="scss" scoped>
.multi-line-chart-container {
  width: 100%;
  height: 100%;
  min-height: 0;
  flex: 1;
}

.multi-line-chart-box {
  display: flex;
  padding: 20px 30px;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 16px;
  flex: 1 0 0;
  border-radius: 20px;
  background: var(--secondary);
  position: relative;
  height: 100%;
  min-height: 0;
  box-sizing: border-box;
}

.multi-line-chart-box .p {
  color: #FFF;
  font-family: Heebo;
  font-size: 18px;
  font-style: normal;
  font-weight: 700;
  line-height: 0.8;
  letter-spacing: 0.9px;
  text-transform: uppercase;
  align-self: stretch;
  flex-shrink: 0;
}

.chart-wrapper {
  position: relative;
  width: 100%;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  z-index: 2;
  overflow: visible;
}

.chart-container {
  position: relative;
  width: 100%;
  flex: 1;
  min-height: 0;
}

.multi-line-svg {
  width: 100%;
  height: 100%;
  cursor: crosshair;
  background: transparent;
  display: block;
  overflow: visible;
}

.chart-labels {
  position: relative;
  width: 100%;
  // flex-shrink: 0;
  // margin-top: 4px;
  // align-items: stretch;
  padding: 0 0px;
  display: flex;
  justify-content: space-between;
}

.chart-label {
  // position: absolute;
  // transform: translateX(-50%);
  color: #FFF;
  font-family: Heebo;
  font-size: 10px;
  font-weight: 300;
  opacity: 0.7;
  white-space: nowrap;
}

.chart-legend {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 16px;
  padding: 8px 0 0 0;
  z-index: 10;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.legend-item:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: scale(1.05);
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.legend-label {
  color: #FFF;
  font-family: Heebo;
  font-size: 11px;
  font-weight: 400;
  opacity: 0.8;
}

.chart-tooltip {
  position: absolute;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(8px);
  border-radius: 8px;
  padding: 8px 12px;
  min-width: 120px;
  pointer-events: none;
  z-index: 100;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transform: translateX(-50%);
}

.tooltip-store {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.tooltip-color {
  width: 8px;
  height: 8px;
  border-radius: 2px;
}

.tooltip-value {
  font-family: Heebo;
  font-size: 12px;
  font-weight: 700;
  min-width: 50px;
}

.tooltip-label {
  color: #FFF;
  font-family: Heebo;
  font-size: 10px;
  font-weight: 300;
  opacity: 0.8;
}

.tooltip-date {
  color: #FFF;
  font-family: Heebo;
  font-size: 10px;
  font-weight: 400;
  opacity: 0.6;
  margin-top: 6px;
  padding-top: 4px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
}

.multi-line-chart-box .number {
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
  z-index: 1;
}

.loading-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
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

/* Responsive */
@media (max-width: 1599px) {
  .multi-line-chart-box .number {
    font-size: 120px;
    letter-spacing: 6px;
  }
  
  .chart-legend {
    gap: 12px;
  }
  
  .legend-label {
    font-size: 9px;
  }
}

@media (min-width: 1600px) and (max-width: 2074px) {
  .multi-line-chart-box .number {
    font-size: 150px;
    letter-spacing: 7px;
  }
}

@media (min-width: 2075px) and (max-width: 2560px) {
  .multi-line-chart-box .number {
    font-size: 200px;
    letter-spacing: 10px;
  }
}
</style>