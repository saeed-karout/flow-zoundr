<template>
  <div class="streams-30-days-chart">
    <div class="chart-header">
      <div class="title">Streams der letzten 30 Tage</div>
    </div>
    
    <!-- Loading State -->
    <!-- <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
    </div> -->
    
    <!-- Chart -->
    <div class="chart-wrapper" ref="chartWrapperRef">
      <div class="chart-container" ref="chartContainerRef">
        <svg 
          class="streams-svg" 
          :viewBox="`0 0 ${svgWidth} ${svgHeight}`"
          preserveAspectRatio="xMidYMid meet"
          @mousemove="showTooltipOnLine"
          @mouseleave="hideTooltip"
        >
          <defs>
            <linearGradient :id="gradientId" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#DD1155" stop-opacity="0.8"/>
              <stop offset="100%" stop-color="#DD1155" stop-opacity="0.05"/>
            </linearGradient>
          </defs>
          
          <!-- Background area fill -->
          <path 
            :d="areaPath" 
            :fill="`url(#${gradientId})`"
            opacity="0.8"
          />
          
          <!-- Line stroke -->
          <path 
            :d="linePath" 
            stroke="#DD1155" 
            stroke-width="2" 
            fill="none"
            class="line-stroke"
          />
          
          <!-- Data point circles (hidden by default, shown on hover) -->
          <!-- <g v-if="showCircles">
            <circle 
              v-for="(point, index) in chartPoints" 
              :key="`circle-${index}`"
              :cx="point.x"
              :cy="point.y"
              r="4"
              fill="#DD1155"
              stroke="white"
              stroke-width="1.5"
              class="chart-circle"
            />
          </g> -->
          
          <!-- Hover circle (follows mouse on line) -->
          <circle 
            v-if="hoveredPoint && tooltip.visible"
            :cx="hoveredPoint.x"
            :cy="hoveredPoint.y"
            r="6"
            fill="#26282D"
            :stroke="'#DD1155'"
            stroke-width="2"
            class="hover-circle"
          />
        </svg>
      </div>
      
      <!-- X-axis labels -->
      <div class="chart-labels">
        <div 
          v-for="(item, index) in displayedLabels" 
          :key="index"
          class="chart-label"
        >
          {{ item.label }}
        </div>
      </div>
    </div>
    
    <!-- Tooltip -->
    <div 
      v-if="tooltip.visible" 
      class="chart-tooltip"
      :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }"
    >
      <div class="tooltip-label">{{ tooltip.label }}</div>
      <div class="tooltip-value">{{ formatNumber(tooltip.value) }}</div>
    </div>
    
    <!-- Total number as background watermark -->
    <div class="watermark-number">{{ formatNumber(totalStreams) }}</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import apiRequest from '@/lib/apiRequest';

// ========== Reactive Data ==========
const isLoading = ref(false);
const gradientId = `grad-${Date.now()}-${Math.random()}`;
const chartData = ref({
  dates: [],
  values: []
});
const chartWrapperRef = ref(null);
const chartContainerRef = ref(null);

// SVG dimensions
const svgWidth = ref(100);
const svgHeight = ref(100);
const padding = { left: 0, right: 0, top: 8, bottom: 20 };

// Tooltip state
const tooltip = ref({
  visible: false,
  x: 0,
  y: 0,
  value: 0,
  label: ''
});

// Hover state for circle following
const hoveredPoint = ref(null);

let resizeObserver = null;
let fetchTimeout = null;

// ========== Update SVG dimensions ==========
const updateSvgDimensions = () => {
  if (chartContainerRef.value) {
    const rect = chartContainerRef.value.getBoundingClientRect();
    svgWidth.value = rect.width || 100;
    svgHeight.value = rect.height || 100;
  }
};

// ========== Computed ==========
const totalStreams = computed(() => {
  return chartData.value.values.reduce((sum, val) => sum + val, 0);
});

const chartLabels = computed(() => {
  return chartData.value.dates;
});

const maxValue = computed(() => {
  const max = Math.max(...chartData.value.values, 1);
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
  } else if (count <= 30) {
    // For 30 days, show every 3rd day
    return labels.filter((_, index) => index % 3 === 0).map((label, idx, arr) => ({
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

// Calculate chart points
const chartPoints = computed(() => {
  const values = chartData.value.values;
  const labels = chartData.value.dates;
  const maxVal = maxValue.value;
  
  const availableWidth = svgWidth.value - padding.left - padding.right;
  const availableHeight = svgHeight.value - padding.top - padding.bottom;
  
  if (values.length === 0 || availableWidth <= 0 || availableHeight <= 0) return [];
  
  const step = values.length > 1 ? availableWidth / (values.length - 1) : availableWidth;
  
  return values.map((value, index) => {
    let y = svgHeight.value - padding.bottom - ((value / maxVal) * availableHeight);
    y = Math.max(padding.top, Math.min(svgHeight.value - padding.bottom, y));
    
    return {
      x: padding.left + (index * step),
      y: y,
      value: value,
      label: labels[index] || '',
      index: index
    };
  });
});

// Line path with smooth curves
const linePath = computed(() => {
  const points = chartPoints.value;
  if (points.length < 2) return '';
  
  let path = `M ${points[0].x} ${points[0].y}`;
  
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const dx = curr.x - prev.x;
    path += ` C ${prev.x + dx * 0.3} ${prev.y}, ${curr.x - dx * 0.3} ${curr.y}, ${curr.x} ${curr.y}`;
  }
  
  return path;
});

// Area path with smooth curves
const areaPath = computed(() => {
  const points = chartPoints.value;
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
});

// Control circle visibility
const showCircles = computed(() => {
  const count = chartPoints.value.length;
  return count > 0 && count <= 30;
});

// ========== Utility Functions ==========
const formatNumber = (num) => {
  if (!num && num !== 0) return '0';
  return num.toLocaleString('de-DE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
};

const getPositionOnLine = (xPos) => {
  const points = chartPoints.value;
  if (points.length < 2) return null;
  
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    
    if (xPos >= p1.x && xPos <= p2.x && p2.x !== p1.x) {
      const t = (xPos - p1.x) / (p2.x - p1.x);
      const y = p1.y + (p2.y - p1.y) * t;
      const value = p1.value + (p2.value - p1.value) * t;
      const labelIndex = Math.floor(i + t);
      
      return { 
        y, 
        value, 
        label: chartLabels.value[labelIndex] || chartLabels.value[i] || '' 
      };
    }
  }
  
  return null;
};

const showTooltipOnLine = (event) => {
  const svg = event.target.closest('.streams-svg');
  if (!svg) return;
  
  const rect = svg.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const containerRect = chartWrapperRef.value?.getBoundingClientRect();
  
  if (containerRect) {
    const linePos = getPositionOnLine(x);
    if (linePos) {
      // Update hovered point for circle
      hoveredPoint.value = {
        x: x,
        y: linePos.y
      };
      
      const tooltipX = event.clientX - containerRect.left - 30;
      const tooltipY = (linePos.y / svgHeight.value) * rect.height + padding.top - 15;
      
      tooltip.value = {
        visible: true,
        x: Math.max(0, tooltipX),
        y: Math.max(0, tooltipY),
        value: Math.round(linePos.value),
        label: linePos.label
      };
    }
  }
};

const hideTooltip = () => {
  tooltip.value.visible = false;
  hoveredPoint.value = null;
};

// ========== Fetch Data ==========
const fetchStreamsData = async () => {
  isLoading.value = true;
  try {
    const params = new URLSearchParams();
    params.append('date-type', 'last_28_days');
    
    console.log('📊 Fetching last 30 days streams with params:', params.toString());
    
    const response = await apiRequest.get(`/trends/streams?${params.toString()}`);
    const data = response.data?.data || response.data;
    
    if (data && data.dates && data.values) {
      chartData.value = {
        dates: data.dates,
        values: data.values
      };
      console.log(`✅ Loaded ${data.dates.length} days of streams data`);
    } else if (data && Array.isArray(data)) {
      chartData.value = {
        dates: data.map(item => item.date || item.label || ''),
        values: data.map(item => item.value || item.count || 0)
      };
    } else {
      console.warn('⚠️ Unexpected data format:', data);
      chartData.value = generateSampleData();
    }
    
    await nextTick();
    updateSvgDimensions();
  } catch (error) {
    console.error('❌ Error fetching streams data:', error);
    chartData.value = generateSampleData();
    await nextTick();
    updateSvgDimensions();
  } finally {
    isLoading.value = false;
  }
};

// Generate sample data for demo
const generateSampleData = () => {
  const dates = [];
  const values = [];
  const today = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    dates.push(`${date.getDate()}. ${date.toLocaleString('default', { month: 'short' }).toUpperCase()}`);
    values.push(Math.floor(Math.random() * 1000) + 100);
  }
  
  return { dates, values };
};

// Handle resize
const handleResize = () => {
  updateSvgDimensions();
};

// ========== Lifecycle ==========
onMounted(() => {
  fetchStreamsData();
  window.addEventListener('resize', handleResize);
  
  if (chartContainerRef.value) {
    resizeObserver = new ResizeObserver(() => {
      updateSvgDimensions();
    });
    resizeObserver.observe(chartContainerRef.value);
  }
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
  if (fetchTimeout) {
    clearTimeout(fetchTimeout);
  }
});
</script>

<style lang="scss" scoped>
.streams-30-days-chart {
  width: 100%;
  height: 300px;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: var(--secondary);
  border-radius: 20px;
  padding: 20px 30px;
  position: relative;
  gap: 16px;
  box-sizing: border-box;
}

.chart-header {
  flex-shrink: 0;
}

.title {
  color: #FFF;
  font-family: Heebo;
  font-size: 18px;
  font-style: normal;
  font-weight: 700;
  line-height: 0.8;
  letter-spacing: 0.9px;
  text-transform: uppercase;
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
  overflow: hidden;
}

.chart-container {
  position: relative;
  width: 100%;
  flex: 1;
  min-height: 0;
}

.streams-svg {
  width: 100%;
  height: 100%;
  cursor: crosshair;
  background: transparent;
  display: block;
}

.line-stroke {
  // No position relative or children needed
}

.chart-circle {
  transition: r 0.2s ease, fill 0.2s ease;
  cursor: pointer;
  
  &:hover {
    r: 7;
    fill: #FF3366;
  }
}

.hover-circle {
  // animation: pulse 1.5s ease-in-out infinite;
  // filter: drop-shadow(0 0 6px rgba(221, 17, 85, 0.4));
}

.chart-labels {
  position: relative;
  width: 100%;
  flex-shrink: 0;
  margin-top: 4px;
  align-items: stretch;
  display: flex;
  justify-content: space-between;
}

.chart-label {
  color: #FFF;
  font-family: Heebo;
  font-size: 10px;
  font-weight: 300;
  opacity: 0.7;
  white-space: nowrap;
}

.chart-tooltip {
  position: absolute;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  border-radius: 8px;
  padding: 8px 12px;
  min-width: 60px;
  text-align: center;
  pointer-events: none;
  z-index: 100;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transition: opacity 0.2s ease;
  transform: translateX(18px);
}

.tooltip-label {
  color: #FFF;
  font-family: Heebo;
  font-size: 11px;
  font-weight: 300;
  opacity: 0.7;
  line-height: 1;
}

.tooltip-value {
  font-family: Heebo;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.2;
  color: white;
  margin-top: 2px;
}

.watermark-number {
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
  opacity: 0.07;
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

@keyframes pulse {
  0%, 100% { 
    r: 5;
    opacity: 1;
  }
  50% { 
    r: 8;
    opacity: 0.8;
  }
}

/* Responsive */
@media (max-width: 1599px) {
  .watermark-number {
    font-size: 120px;
    letter-spacing: 6px;
  }
}

@media (min-width: 1600px) and (max-width: 2074px) {
  .watermark-number {
    font-size: 150px;
    letter-spacing: 7px;
  }
}

@media (min-width: 2075px) and (max-width: 2560px) {
  .watermark-number {
    font-size: 200px;
    letter-spacing: 10px;
  }
}
</style>