<template>
  <div class="trends-chart-container">
    <div class="trends-chart-box" ref="chartRootRef">
      <div class="p">{{ title }}</div>
      
      <!-- Chart - Area Chart with circles -->
      <div class="chart-wrapper" ref="chartWrapperRef">
        <div v-if="hasData" class="chart-container" ref="chartContainerRef">
          <svg 
            class="trends-svg" 
            :viewBox="`0 0 ${svgWidth} ${svgHeight}`"
            preserveAspectRatio="xMidYMid meet"
            @mousemove="showTooltipOnLine"
            @mouseleave="hideTooltip"
          >
            <defs>
              <linearGradient :id="gradientId" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" :stop-color="chartColor" stop-opacity="0.8"/>
                <stop offset="100%" :stop-color="chartColor" stop-opacity="0.05"/>
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
              ref="linePathRef"
              :d="linePath"
              :stroke="chartColor"
              stroke-width="2"
              fill="none"
              class="line-stroke"
            />
            
            <!-- Data point circles -->
            <g v-if="showCircles">
             
            </g>
            
         
            
            <!-- Hover circle (follows mouse on line) -->
            <circle 
              v-if="hoveredPoint && !tooltip.visible === false"
              :cx="hoveredPoint.x"
              :cy="hoveredPoint.y"
              r="6"
              fill="#26282D"
              :stroke="chartColor"
              stroke-width="2"
              class="hover-circle"
            />
          </svg>
        </div>
        
        <!-- X-axis labels -->
        <div v-if="hasData" class="chart-labels">
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
        :class="{ 'is-below': tooltip.below }"
        :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }"
      >
        <div class="tooltip-label">{{ tooltip.label }}</div>
        <div class="tooltip-value">{{ formatNumber(tooltip.value) }}</div>
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
    default: 'Streaming'
  },
  endpoint: {
    type: String,
    required: true,
    default: '/trends/streams'
  },
  chartColor: {
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
const gradientId = `grad-${Date.now()}-${Math.random()}`;
const chartData = ref({
  dates: [],
  values: []
});
const chartWrapperRef = ref(null);
const chartContainerRef = ref(null);
let fetchTimeout = null;
let resizeObserver = null;

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
const linePathRef = ref(null);
const chartRootRef = ref(null);

// ========== معرفة نوع الفلتر ==========
const isLast7Days = computed(() => {
  return props.filters?.dateType === 'last_7_days' || props.filters?.dateType === 'last_14_days';
});

// ========== Update SVG dimensions ==========
const updateSvgDimensions = () => {
  if (chartContainerRef.value) {
    const rect = chartContainerRef.value.getBoundingClientRect();
    svgWidth.value = rect.width || 100;
    svgHeight.value = rect.height || 100;
  }
};

// ========== Computed ==========
// بلا بيانات لا نرسم خطّاً مسطّحاً ولا محور تواريخ فارغاً — يبقى الرقم (0) وحده.
const hasData = computed(() =>
  chartData.value.values.some((value) => Number(value) > 0)
);

const totalValue = computed(() => {
  return chartData.value.values.reduce((sum, val) => sum + val, 0);
});

const chartLabels = computed(() => {
  return chartData.value.dates;
});

const maxValue = computed(() => {
  const max = Math.max(...chartData.value.values, 1);
  return max * 1.1;
});

// ========== دالة حساب عدد العناصر المعروضة ==========
const getDisplayStep = (count) => {
  // إذا كان الفلتر هو آخر 7 أيام أو آخر 14 يوم، نستخدم التقسيم القديم
  if (isLast7Days.value) {
    if (count <= 7) return 1;
    if (count <= 14) return 2;
    if (count <= 28) return 4;
    return 7;
  }
  
  // للأنواع الأخرى: نريد عرض 10 أقسام على الأقل
  // إذا كان العدد أقل من 10، نعرض الكل
  if (count <= 10) return 1;
  
  // إذا كان العدد بين 10 و 20، نعرض كل عنصرين (نصف العدد)
  if (count <= 20) return Math.floor(count / 10);
  
  // إذا كان العدد بين 20 و 50، نعرض كل 3-4 عناصر
  if (count <= 50) return Math.floor(count / 12);
  
  // إذا كان العدد أكبر من 50، نعرض كل 5-7 عناصر
  if (count <= 100) return Math.floor(count / 14);
  
  // للأعداد الكبيرة جداً، نعرض كل 10 عناصر
  return Math.floor(count / 15);
};

// Display labels based on number of data points
const displayedLabels = computed(() => {
  const labels = chartData.value.dates;
  const count = labels.length;
  
  if (count === 0) return [];
  
  // إذا كان هناك عنصر واحد فقط
  if (count === 1) {
    return [{
      label: labels[0],
      position: 50
    }];
  }
  
  // حساب الخطوة بناءً على نوع الفلتر
  const step = getDisplayStep(count);
  
  // إذا كانت الخطوة 1، نعرض كل العناصر
  if (step === 1) {
    return labels.map((label, index) => ({
      label: label,
      position: (index / (count - 1)) * 100
    }));
  }
  
  // نعرض العناصر بناءً على الخطوة المحسوبة
  const filteredLabels = [];
  for (let i = 0; i < count; i += step) {
    filteredLabels.push({
      label: labels[i],
      position: (i / (count - 1)) * 100
    });
  }
  
  // التأكد من أن آخر عنصر مضمن
  const lastIndex = count - 1;
  const lastFiltered = filteredLabels[filteredLabels.length - 1];
  if (lastFiltered && lastFiltered.label !== labels[lastIndex]) {
    filteredLabels.push({
      label: labels[lastIndex],
      position: 100
    });
  }
  
  return filteredLabels;
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
  return count > 0 && count <= 50;
});

const showCircleWithNumber = computed(() => {
  const count = chartPoints.value.length;
  return count > 0 && count <= 10;
});

// ========== Utility Functions ==========
const formatNumber = (num) => {
  if (!num && num !== 0) return '0';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

// ✅ أقرب نقطة بيانات (يوم) لموضع الماوس — تُستخدم للتولتيب فقط، حتى يُظهر كل يوم
//    رقمه المحدّد من الريسبونس (بدل الاستيفاء الذي كان يُظهر أرقاماً متغيّرة).
const getNearestPoint = (xPos) => {
  const points = chartPoints.value;
  if (points.length === 0) return null;

  let nearest = points[0];
  let minDist = Math.abs(points[0].x - xPos);
  for (let i = 1; i < points.length; i++) {
    const dist = Math.abs(points[i].x - xPos);
    if (dist < minDist) {
      minDist = dist;
      nearest = points[i];
    }
  }
  return nearest;
};

// ✅ النقطة الحقيقية على المنحنى (الـ path) عند إحداثي x المطلوب — تتحرك الدائرة
//    بسلاسة مع الماوس وتبقى دائماً على الخط (المنحنى Bézier وليس استيفاءً خطياً).
const getPointOnPathAtX = (targetX) => {
  const path = linePathRef.value;
  if (!path || typeof path.getTotalLength !== 'function') return null;

  const total = path.getTotalLength();
  if (total === 0) return null;

  // x يتزايد باطّراد على طول الخط → بحث ثنائي بطول المسار للوصول إلى x المطلوب.
  let lo = 0;
  let hi = total;
  let best = path.getPointAtLength(0);
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    const p = path.getPointAtLength(mid);
    best = p;
    if (Math.abs(p.x - targetX) < 0.25) break;
    if (p.x < targetX) lo = mid; else hi = mid;
  }
  return best;
};

const showTooltipOnLine = (event) => {
  const svg = event.target.closest('.trends-svg');
  if (!svg) return;

  const rect = svg.getBoundingClientRect();
  const x = event.clientX - rect.left;

  // التولتيب position: absolute داخل الجذر، فصندوق احتوائه هو الجذر لا .chart-wrapper.
  // القياس من الورابر كان يزيحه بمقدار (الترويسة + الفجوة + الحشو) إلى الأعلى.
  const rootRect = chartRootRef.value?.getBoundingClientRect();
  if (!rootRect) return;

  // الدائرة: تتبع الماوس بسلاسة على المنحنى نفسه.
  const curvePoint = getPointOnPathAtX(x) || getNearestPoint(x);
  // التولتيب: رقم اليوم المحدّد (أقرب نقطة).
  const nearest = getNearestPoint(x);
  if (!curvePoint || !nearest) return;

  hoveredPoint.value = {
    x: curvePoint.x,
    y: curvePoint.y
  };

  // موضع النقطة رأسياً داخل البطاقة (من أعلى الجذر). الرفع فوقها يتمّ
  // بـ translateY(-100%) في الـ CSS، فيتبع ارتفاع التولتيب الفعلي ولا يغطّي الدائرة.
  const pointY = rect.top - rootRect.top + (curvePoint.y / svgHeight.value) * rect.height;

  tooltip.value = {
    visible: true,
    x: event.clientX - rootRect.left - 30,
    y: pointY,
    below: pointY < 60,
    value: Math.round(nearest.value),
    label: nearest.label
  };
};

const hideTooltip = () => {
  tooltip.value.visible = false;
  hoveredPoint.value = null;
};

// Circle tooltip handlers
const showCircleTooltip = (point, event) => {
  const containerRect = chartWrapperRef.value?.getBoundingClientRect();
  if (containerRect) {
    tooltip.value = {
      visible: true,
      x: event.clientX - containerRect.left - 30,
      y: event.clientY - containerRect.top - 50,
      value: Math.round(point.value),
      label: point.label
    };
  }
};

const hideCircleTooltip = () => {
  // Don't hide if mouse is still on line
  setTimeout(() => {
    if (!tooltip.value.visible) {
      // Only hide if not showing from line hover
    }
  }, 100);
};

// ========== Build API Params ==========
const buildApiParams = () => {
  const params = new URLSearchParams();
  
  if (props.filters?.dateType) {
    if (props.filters.dateType === 'last_28_days') {
      params.append('date-type', 'last_28_days');
    } else if (props.filters.dateType === 'this_month') {
      params.append('date-type', 'this_month');
    } else if (props.filters.dateType === 'last_month') {
      params.append('date-type', 'last_month');
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
const fetchData = async () => {
  isLoading.value = true;
  try {
    const params = buildApiParams();
    console.log(`📊 Fetching ${props.endpoint} with params:`, params.toString());
    
    const response = await apiRequest.get(`${props.endpoint}?${params.toString()}`);
    const data = response.data?.data || response.data;
    
    if (data && data.dates && data.values) {
      chartData.value = {
        dates: data.dates,
        values: data.values
      };
    } else if (data && Array.isArray(data)) {
      chartData.value = {
        dates: data.map(item => item.date || item.label || ''),
        values: data.map(item => item.value || item.count || 0)
      };
    } else {
      console.warn('⚠️ Unexpected data format:', data);
      chartData.value = { dates: [], values: [] };
    }
    
    await nextTick();
    updateSvgDimensions();
  } catch (error) {
    console.error(`❌ Error fetching ${props.endpoint} data:`, error);
    chartData.value = { dates: [], values: [] };
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

// ========== Lifecycle ==========
// الحاوية تُنشأ فقط عند وجود بيانات، فقد تكون غائبة وقت التركيب.
const observeContainer = () => {
  if (!chartContainerRef.value) return;
  if (!resizeObserver) {
    resizeObserver = new ResizeObserver(() => {
      updateSvgDimensions();
    });
  }
  resizeObserver.disconnect();
  resizeObserver.observe(chartContainerRef.value);
};

// عند وصول البيانات تظهر الحاوية → نربط المراقب ونقيس أبعادها.
watch(hasData, (value) => {
  if (!value) return;
  nextTick(() => {
    observeContainer();
    updateSvgDimensions();
  });
});

onMounted(() => {
  fetchData();
  window.addEventListener('resize', handleResize);
  observeContainer();
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
.trends-chart-container {
  width: 100%;
  height: 100%;
  min-height: 0;
  flex: 1;
}

.trends-chart-box {
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

.trends-chart-box .p {
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
  overflow: hidden;
}

.chart-container {
  position: relative;
  width: 100%;
  flex: 1;
  min-height: 0;
}

.trends-svg {
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

.chart-circle-number {
  transition: r 0.2s ease, fill 0.2s ease;
  cursor: pointer;
  
  &:hover {
    r: 16;
    fill: #FF3366;
  }
}

.circle-text {
  pointer-events: none;
  user-select: none;
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
  font-size: 14px;
  font-weight: 300;
  opacity: 0.7;
  white-space: nowrap;
  letter-spacing: 0.7px;
}

.chart-tooltip {
  position: absolute;
  backdrop-filter: blur(8px);
  border-radius: 8px;
  padding: 8px 8px;
  min-width: 60px;
  text-align: center;
  pointer-events: none;
  z-index: 100;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transition: opacity 0.2s ease;
  /* يُرفع بكامل ارتفاعه فوق النقطة + 12px فجوة، فلا يغطّي الدائرة أبداً
     مهما طال نصّه (رقم طويل أو تاريخ أعرض). */
  transform: translateX(24px) translateY(calc(-100% - 12px));
}

/* قرب قمّة البطاقة لا متّسع فوقه — يُقلَب تحت النقطة بدل أن يُقصّ. */
.chart-tooltip.is-below {
  transform: translateX(24px) translateY(12px);
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

.trends-chart-box .number {
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
  .trends-chart-box .number {
    font-size: 120px;
    letter-spacing: 6px;
  }
  .chart-label {
    font-size: 11px;
  }
}

@media (min-width: 1600px) and (max-width: 2074px) {
  .trends-chart-box .number {
    font-size: 150px;
    letter-spacing: 7px;
  }
}

@media (min-width: 2075px) and (max-width: 2560px) {
  .trends-chart-box .number {
    font-size: 200px;
    letter-spacing: 10px;
  }
  .chart-label {
    font-size: 16px;
  }
}
</style>