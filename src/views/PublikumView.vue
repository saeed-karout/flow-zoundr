<template>
  <div class="publikum-view">
    <div class="publikum-view-row1">
      <!-- Box 1: Total Audience -->
      <div class="Box-1">
        <div class="text-1">{{ audienceData.title }}</div>
        <img :src="audienceData.icon" class="icon-team" alt="Team Icon">
        <div class="number">{{ formatNumber(audienceData.total) }}</div>
      </div>

      <!-- Box 2: Male Audience -->
      <div class="Box-2">
        <div class="text-1">{{ maleData.title }}</div>
        <div class="bars">
          <div
            v-for="bar in maleData.bars"
            :key="bar.ageRange"
            class="bar"
            @mouseenter="updateHoverData(bar, 'male')"
            @mouseleave="resetHoverData('male')"
          >
            <div class="bar-graph" :style="{ '--percentage': bar.percentage }">
              <div
                v-for="index in 16"
                :key="index"
                class="segment-wrapper"
              >
                <div class="segment"></div>
                <div class="gap"></div>
              </div>
            </div>
           <div class="p">
              <template v-if="bar.ageRange.includes('+')">
                {{ bar.ageRange }}
              </template>
              <template v-else>
                <span class="age-start">{{ bar.ageRange.split('-')[0] }}-</span>
                <span class="age-end">{{ bar.ageRange.split('-')[1] }}</span>
              </template>
            </div>
          </div>
        </div>
        <div class="numbers-2">
          <div class="left">{{ hoveredBar.percentage !== null && hoveredBar.type === 'male' ? hoveredBar.percentage : maleData.percentage }}%</div>
          <div class="right">{{ formatNumber(hoveredBar.count !== null && hoveredBar.type === 'male' ? hoveredBar.count : maleData.count) }}</div>
        </div>
      </div>

      <!-- Box 3: Female Audience -->
      <div class="Box-3">
        <div class="text-1">{{ femaleData.title }}</div>
        <div class="bars">
          <div
            v-for="bar in femaleData.bars"
            :key="bar.ageRange"
            class="bar"
            @mouseenter="updateHoverData(bar, 'female')"
            @mouseleave="resetHoverData('female')"
          >
            <div class="bar-graph" :style="{ '--percentage': bar.percentage }">
              <div
                v-for="index in 16"
                :key="index"
                class="segment-wrapper"
              >
                <div class="segment"></div>
                <div class="gap"></div>
              </div>
            </div>
            <div class="p">
              <template v-if="bar.ageRange.includes('+')">
                {{ bar.ageRange }}
              </template>
              <template v-else>
                <span class="age-start">{{ bar.ageRange.split('-')[0] }}-</span>
                <span class="age-end">{{ bar.ageRange.split('-')[1] }}</span>
              </template>
            </div>
          </div>
        </div>
        <div class="numbers-2">
          <div class="left">{{ hoveredBar.percentage !== null && hoveredBar.type === 'female' ? hoveredBar.percentage : femaleData.percentage }}%</div>
          <div class="right">{{ formatNumber(hoveredBar.count !== null && hoveredBar.type === 'female' ? hoveredBar.count : femaleData.count) }}</div>
        </div>
      </div>

      <!-- Box 4: Playback Devices -->
      <div class="Box-4">
        <div class="text-1">{{ playbackData.title }}</div>
        <div class="Bars">
          <div v-for="device in playbackData.devices" :key="device.title" class="row-bar">
            <div class="title">{{ device.title }}</div>
            <div class="progress-bar">
              <div class="line-red" :style="{ width: `${device.percentage}%` }"></div>
            </div>
            <div class="num">{{ device.percentage }}%</div>
          </div>
        </div>
      </div>

      <!-- Box 5: Sources -->
      <div class="Box-4">
        <div class="text-1">{{ sourceData.title }}</div>
        <div class="Bars">
          <div v-for="source in sourceData.sources" :key="source.title" class="row-bar">
            <div class="title">{{ source.title }}</div>
            <div class="progress-bar">
              <div class="line-red" :style="{ width: `${source.percentage}%` }"></div>
            </div>
            <div class="num">{{ source.percentage }}%</div>
          </div>
        </div>
      </div>

      <!-- Last Box: Skip Rate - Area Chart -->
      <div class="last-Box">
        <div class="text-1">{{ skipRateData.title }}</div>
        <div class="skip-rate-container">
          <svg 
            class="skip-rate-svg" 
            viewBox="0 0 323 140" 
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient :id="gradientId" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#DD1155" stop-opacity="1"/>
                <stop offset="100%" stop-color="#26282D" stop-opacity="0.1"/>
              </linearGradient>
            </defs>
            
            <path 
              :d="areaPath" 
              :fill="`url(#${gradientId})`"
              opacity="0.8"
            />
            
            <path 
              :d="linePath" 
              stroke="#DD1155" 
              stroke-width="1" 
              fill="none"
            />
          </svg>
          
          <div class="skip-rate-labels">
            <div 
              v-for="(label, index) in skipRateData.labels" 
              :key="index"
              class="skip-label"
            >
              {{ label }}%
            </div>
          </div>
          
          <div 
            v-if="tooltip.visible" 
            class="skip-tooltip"
            :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }"
          >
            <div class="tooltip-value">{{ tooltip.value }}</div>
            <div class="tooltip-label">{{ tooltip.label }}%</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Map Section -->
    <div class="map">
      <div class="maps">
        <LeafletMap
          ref="mapRef"
          :center="mapCenter"
          :zoom="mapZoom"
          :countries-data="countriesDataForMap"
          @map-click="handleMapClick"
          @zoom-change="handleZoomChange"
        />
      </div>
      <div class="musk-countries">
        <div class="box-countries" @click="toggleCountriesPage">
          <div class="text-1">{{ countriesData.title }}</div>
          <div class="countries">
            <div v-for="country in displayedCountries" :key="country.name" class="row-country">
              <div class="icon">
                <img 
                  :src="getCountryFlagUrl(country.name)"
                  class="country-flag"
                  :alt="country.name"
                  @error="handleFlagError"
                >
              </div>
              <div v-if="activePage === 0" class="number">
                {{ formatNumber(country.count) }}
              </div>
              <div v-else class="progress-bar-container">
                <div class="progress-bar">
                  <div class="line-red" :style="{ width: `${country.percentage}%` }"></div>
                </div>
                <div class="num">{{ country.percentage }}%</div>
              </div>
            </div>
          </div>
          <div class="slide-nav">
            <div
              v-for="(dot, index) in countriesData.dots"
              :key="index"
              class="slide-dot"
              @click.stop="setActiveDot(index)"
            >
              <div v-if="dot.active" class="red"></div>
            </div>
          </div>

          <div class="rounded-bottom"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue';
import apiRequest from '@/lib/apiRequest';
import LeafletMap from '@/components/Trends/LeafletMap.vue';

// ========== Props ==========
const props = defineProps({
  filters: {
    type: Object,
    default: () => ({})
  }
});

// ========== Reactive Data ==========
const gradientId = `grad-${Date.now()}-${Math.random()}`;
const mapCenter = ref([30, 20]);
const mapZoom = ref(2);
let fetchTimeout = null;

const audienceData = ref({
  title: 'Publikum',
  icon: '/icon/Team.svg',
  total: 0,
});

const getDateType = () => {
  return props.filters?.dateType || sessionStorage.getItem('audience_date_type') || 'last_28_days';
};

const toApiDate = (dateValue) => {
  if (!dateValue) return null;
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
};

const filterParamMap = {
  song: 'song_uuid',
  release: 'release_uuid',
  artist: 'artist',
  store: 'store',
  isrc: 'isrc',
  gtin: 'gtin',
  feature: 'feature',
  country: 'country',
  contributer: 'contributer',
  producer: 'producer',
  cLine: 'c-line',
};

const appendListParam = (query, key, value) => {
  if (!value) return;

  const list = Array.isArray(value)
    ? value
    : String(value)
        .split(',')
        .map(item => item.trim())
        .filter(Boolean);

  if (list.length === 0) return;

  list.forEach(item => {
    query.append(`${key}[]`, item);
  });
};

const maleData = ref({
  title: 'Männlich',
  percentage: 0,
  count: 0,
  bars: [
    { ageRange: '0-12', percentage: 0 },
    { ageRange: '13-17', percentage: 0 },
    { ageRange: '18-24', percentage: 0 },
    { ageRange: '25-34', percentage: 0 },
    { ageRange: '35-44', percentage: 0 },
    { ageRange: '45-64', percentage: 0 },
    { ageRange: '65+', percentage: 0 },
  ],
});

const femaleData = ref({
  title: 'Weiblich',
  percentage: 0,
  count: 0,
  bars: [
    { ageRange: '0-12', percentage: 0 },
    { ageRange: '13-17', percentage: 0 },
    { ageRange: '18-24', percentage: 0 },
    { ageRange: '25-34', percentage: 0 },
    { ageRange: '35-44', percentage: 0 },
    { ageRange: '45-64', percentage: 0 },
    { ageRange: '65+', percentage: 0 },
  ],
});

const playbackData = ref({
  title: 'GERÄTE',
  devices: [],
});

const sourceData = ref({
  title: 'Quelle',
  sources: [],
});

const skipRateData = ref({
  title: 'Skip Rate',
  labels: [0, 25, 50, 75, 100],
  values: [0, 0, 0, 0, 0],
});

const countriesData = ref({
  title: 'Länder',
  pages: [[]],
  dots: [{ active: true }],
});

const activePage = ref(0);
const hoveredBar = ref({ percentage: null, count: null, type: null });
const tooltip = ref({ visible: false, x: 0, y: 0, value: 0, label: 0 });

const svgWidth = 323;
const svgHeight = 140;
const padding = { left: 15, right: 15, top: 10, bottom: 20 };

// ========== تحويل بيانات الدول للخريطة ==========
const countriesDataForMap = computed(() => {
  const allCountries = [];
  countriesData.value.pages.forEach(page => {
    page.forEach(country => {
      allCountries.push({
        name: country.name,
        count: country.count
      });
    });
  });
  
  if (allCountries.length === 0) return {};
  
  const sortedCountries = [...allCountries].sort((a, b) => b.count - a.count);
  
  const result = {};
  sortedCountries.forEach((country, index) => {
    result[country.name] = {
      count: country.count,
      rank: index + 1
    };
  });
  
  return result;
});

// ========== دوال الخريطة ==========
const handleMapClick = (latlng) => {
  console.log('تم النقر على الخريطة:', latlng);
};

const handleZoomChange = (zoom) => {
  console.log('مستوى التكبير:', zoom);
};

// ========== دوال الأعلام ==========
const getCountryCode = (countryName) => {
  const codeMap = {
    'United States': 'us', 'Germany': 'de', 'Brazil': 'br', 'United Kingdom': 'gb',
    'Canada': 'ca', 'Spain': 'es', 'France': 'fr', 'Japan': 'jp', 'Netherlands': 'nl',
    'Australia': 'au', 'Switzerland': 'ch', 'Austria': 'at', 'Italy': 'it', 'Sweden': 'se',
    'Norway': 'no', 'Denmark': 'dk', 'Finland': 'fi', 'Poland': 'pl', 'Russia': 'ru',
    'China': 'cn', 'India': 'in', 'South Korea': 'kr', 'Mexico': 'mx', 'South Africa': 'za',
    'Argentina': 'ar', 'Chile': 'cl', 'Colombia': 'co', 'Peru': 'pe', 'Venezuela': 've',
    'Egypt': 'eg', 'Turkey': 'tr', 'Saudi Arabia': 'sa', 'United Arab Emirates': 'ae',
    'Israel': 'il', 'Greece': 'gr', 'Portugal': 'pt', 'Belgium': 'be', 'Ireland': 'ie',
    'New Zealand': 'nz', 'Czech Republic': 'cz', 'Hungary': 'hu', 'Romania': 'ro',
    'Ukraine': 'ua', 'Thailand': 'th', 'Vietnam': 'vn', 'Malaysia': 'my', 'Singapore': 'sg',
    'Indonesia': 'id', 'Philippines': 'ph', 'Pakistan': 'pk', 'Bangladesh': 'bd',
    'Nigeria': 'ng', 'Kenya': 'ke', 'Morocco': 'ma'
  };
  return codeMap[countryName] || 'un';
};

const getCountryFlagUrl = (countryName) => {
  const code = getCountryCode(countryName);
  return `https://cdn.jsdelivr.net/npm/circle-flags@1.0.0/flags/${code}.svg`;
};

const handleFlagError = (event) => {
  event.target.src = 'https://cdn.jsdelivr.net/npm/circle-flags@1.0.0/flags/un.svg';
};

// ========== الرسوم البيانية ==========
const chartPoints = computed(() => {
  const values = skipRateData.value.values;
  const labels = skipRateData.value.labels;
  const maxValue = Math.max(...values, 1);
  const availableWidth = svgWidth - padding.left - padding.right;
  const step = availableWidth / (values.length - 1);
  
  return values.map((value, index) => ({
    x: padding.left + (index * step),
    y: svgHeight - padding.bottom - ((value / maxValue) * (svgHeight - padding.top - padding.bottom)),
    value: value,
    label: labels[index]
  }));
});

const linePath = computed(() => {
  if (chartPoints.value.length < 2) return '';
  let path = `M ${chartPoints.value[0].x} ${chartPoints.value[0].y}`;
  for (let i = 1; i < chartPoints.value.length; i++) {
    const prev = chartPoints.value[i - 1];
    const curr = chartPoints.value[i];
    const dx = curr.x - prev.x;
    path += ` C ${prev.x + dx * 0.3} ${prev.y}, ${curr.x - dx * 0.3} ${curr.y}, ${curr.x} ${curr.y}`;
  }
  return path;
});

const areaPath = computed(() => {
  if (chartPoints.value.length < 2) return '';
  let path = `M ${padding.left} ${svgHeight - padding.bottom} L ${chartPoints.value[0].x} ${chartPoints.value[0].y}`;
  for (let i = 1; i < chartPoints.value.length; i++) {
    const prev = chartPoints.value[i - 1];
    const curr = chartPoints.value[i];
    const dx = curr.x - prev.x;
    path += ` C ${prev.x + dx * 0.3} ${prev.y}, ${curr.x - dx * 0.3} ${curr.y}, ${curr.x} ${curr.y}`;
  }
  const lastPoint = chartPoints.value[chartPoints.value.length - 1];
  path += ` L ${lastPoint.x} ${svgHeight - padding.bottom} Z`;
  return path;
});

const displayedCountries = computed(() => {
  const countries = countriesData.value.pages[activePage.value] || [];
  const maxCount = Math.max(...countries.map(c => c.count), 1);
  return countries.map(c => ({
    ...c,
    percentage: Number(((c.count / maxCount) * 100).toFixed(2)),
  }));
});

// ========== Utility Functions ==========
const formatNumber = (num) => {
  if (!num && num !== 0) return '0';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const toggleCountriesPage = () => {
  const nextPage = (activePage.value + 1) % countriesData.value.pages.length;
  setActiveDot(nextPage);
};

const setActiveDot = (index) => {
  if (countriesData.value.dots[index]) {
    countriesData.value.dots = countriesData.value.dots.map((dot, i) => ({
      active: i === index,
    }));
    activePage.value = index;
  }
};

const updateHoverData = (bar, type) => {
  const totalCount = type === 'male' ? maleData.value.count : femaleData.value.count;
  const barCount = Math.round((bar.percentage / 100) * totalCount);
  hoveredBar.value = { percentage: bar.percentage, count: barCount, type: type };
};

const resetHoverData = (type) => {
  if (hoveredBar.value.type === type) {
    hoveredBar.value = { percentage: null, count: null, type: null };
  }
};

// ========== API Functions ==========
const fetchAudienceData = async () => {
  const dateType = getDateType();
  const startDate = toApiDate(props.filters?.startDate);
  const endDate = toApiDate(props.filters?.endDate);

  const query = new URLSearchParams();
  query.set('date-type', dateType);

  if (dateType === 'custom') {
    if (!startDate || !endDate) {
      console.warn('⚠️ Custom range needs start_date and end_date');
      return;
    }
    query.set('start_date', startDate);
    query.set('end_date', endDate);
  }

  Object.entries(filterParamMap).forEach(([sourceKey, apiKey]) => {
    appendListParam(query, apiKey, props.filters?.[sourceKey]);
  });

  console.log('📊 Fetching audience with params:', Object.fromEntries(query.entries()));
  
  try {
    const response = await apiRequest.get(`/audience?${query.toString()}`);
    const data = response.data?.data || response.data;
    
    if (data) {
      updateDataFromResponse(data);
    }
  } catch (error) {
    console.error('❌ Error fetching audience data:', error);
  }
};

const updateDataFromResponse = (data) => {
  // Total Audience
  audienceData.value.total = data.total_audience || 0;
  
  // Gender Age Data
  if (data.gender_age) {
    const male = data.gender_age.male || {};
    const female = data.gender_age.female || {};
    
    const maleTotal = male.total || 0;
    const femaleTotal = female.total || 0;
    const grandTotal = maleTotal + femaleTotal;
    
    maleData.value.count = maleTotal;
    femaleData.value.count = femaleTotal;
    
    maleData.value.percentage = grandTotal > 0 ? Math.round((maleTotal / grandTotal) * 100) : 0;
    femaleData.value.percentage = grandTotal > 0 ? Math.round((femaleTotal / grandTotal) * 100) : 0;
    
    const maxMaleValue = Math.max(...Object.values(male).filter(v => typeof v === 'number' && v !== male.total), 1);
    const maxFemaleValue = Math.max(...Object.values(female).filter(v => typeof v === 'number' && v !== female.total), 1);
    
    maleData.value.bars = [
      { ageRange: '0-12', percentage: maxMaleValue > 0 ? Math.round((male['0-12'] || 0) / maxMaleValue * 100) : 0 },
      { ageRange: '13-17', percentage: maxMaleValue > 0 ? Math.round((male['13-17'] || 0) / maxMaleValue * 100) : 0 },
      { ageRange: '18-24', percentage: maxMaleValue > 0 ? Math.round((male['18-24'] || 0) / maxMaleValue * 100) : 0 },
      { ageRange: '25-34', percentage: maxMaleValue > 0 ? Math.round((male['25-34'] || 0) / maxMaleValue * 100) : 0 },
      { ageRange: '35-44', percentage: maxMaleValue > 0 ? Math.round((male['35-44'] || 0) / maxMaleValue * 100) : 0 },
      { ageRange: '45-64', percentage: maxMaleValue > 0 ? Math.round((male['45-64'] || 0) / maxMaleValue * 100) : 0 },
      { ageRange: '65+', percentage: maxMaleValue > 0 ? Math.round((male['+65'] || 0) / maxMaleValue * 100) : 0 },
    ];
    
    femaleData.value.bars = [
      { ageRange: '0-12', percentage: maxFemaleValue > 0 ? Math.round((female['0-12'] || 0) / maxFemaleValue * 100) : 0 },
      { ageRange: '13-17', percentage: maxFemaleValue > 0 ? Math.round((female['13-17'] || 0) / maxFemaleValue * 100) : 0 },
      { ageRange: '18-24', percentage: maxFemaleValue > 0 ? Math.round((female['18-24'] || 0) / maxFemaleValue * 100) : 0 },
      { ageRange: '25-34', percentage: maxFemaleValue > 0 ? Math.round((female['25-34'] || 0) / maxFemaleValue * 100) : 0 },
      { ageRange: '35-44', percentage: maxFemaleValue > 0 ? Math.round((female['35-44'] || 0) / maxFemaleValue * 100) : 0 },
      { ageRange: '45-64', percentage: maxFemaleValue > 0 ? Math.round((female['45-64'] || 0) / maxFemaleValue * 100) : 0 },
      { ageRange: '65+', percentage: maxFemaleValue > 0 ? Math.round((female['+65'] || 0) / maxFemaleValue * 100) : 0 },
    ];
  }
  
  // Skip Rate
  if (data.skip_rate) {
    if (data.skip_rate.rates && data.skip_rate.values) {
      skipRateData.value.labels = data.skip_rate.rates;
      skipRateData.value.values = data.skip_rate.values;
    } else if (Array.isArray(data.skip_rate[0]) && Array.isArray(data.skip_rate[1])) {
      skipRateData.value.labels = data.skip_rate[0];
      skipRateData.value.values = data.skip_rate[1];
    }
  }
  
  // Countries
  if (data.countries && Array.isArray(data.countries)) {
    const pageSize = 5;
    const pages = [];
    for (let i = 0; i < data.countries.length; i += pageSize) {
      pages.push(data.countries.slice(i, i + pageSize).map(country => ({
        name: country.name,
        count: country.count
      })));
    }
    
    countriesData.value.pages = pages.length > 0 ? pages : [[]];
    countriesData.value.dots = pages.map((_, idx) => ({ active: idx === 0 }));
  }
  
  // Devices
  if (data.devices) {
    const devices = data.devices;
    const totalDevices = Object.values(devices).reduce((sum, val) => sum + val, 0);
    
    playbackData.value.devices = Object.entries(devices).map(([key, value]) => ({
      title: key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' '),
      percentage: totalDevices > 0 ? Math.round((value / totalDevices) * 100) : 0
    }));
  } else {
    // Fallback data
    playbackData.value.devices = [
      { title: 'Mobile', percentage: 45 },
      { title: 'Laptop', percentage: 25 },
      { title: 'Radio', percentage: 15 },
      { title: 'Tablet', percentage: 10 },
      { title: 'Mac/PC', percentage: 5 },
    ];
  }
  
  // Sources
  if (data.sources) {
    const sources = data.sources;
    const totalSources = Object.values(sources).reduce((sum, val) => sum + val, 0);
    
    sourceData.value.sources = Object.entries(sources).map(([key, value]) => ({
      title: key.charAt(0).toUpperCase() + key.slice(1),
      percentage: totalSources > 0 ? Math.round((value / totalSources) * 100) : 0
    }));
  } else {
    // Fallback data
    sourceData.value.sources = [
      { title: 'Artist', percentage: 35 },
      { title: 'Search', percentage: 25 },
      { title: 'Playlist', percentage: 20 },
      { title: 'Album', percentage: 12 },
      { title: 'Others', percentage: 8 },
    ];
  }
};

// ========== Debounce ==========
const debouncedFetch = () => {
  if (fetchTimeout) {
    clearTimeout(fetchTimeout);
    fetchTimeout = null;
  }
  fetchTimeout = setTimeout(() => {
    fetchAudienceData();
  }, 300);
};

// ========== Lifecycle ==========
watch(
  () => props.filters,
  () => {
    const dateType = getDateType();

    if (dateType === 'custom' && (!props.filters?.startDate || !props.filters?.endDate)) {
      return;
    }

    debouncedFetch();
  },
  { deep: true, immediate: true }
);

onUnmounted(() => {
  if (fetchTimeout) clearTimeout(fetchTimeout);
});
</script>

<style lang="scss" scoped>
/* جميع الأنماط كما هي دون تغيير */
.leaflet-pane > svg path.leaflet-interactive {
  outline: none !important;
}

.last-Box .skip-rate-container {
  position: relative;
  width: calc(100% + 20px);
  height: calc(100% - 20px);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 0;
  margin: 0;
}

.last-Box .skip-rate-svg {
  width: 100%;
  height: auto;
  min-height: 180px;
  cursor: pointer;
}

.last-Box .skip-rate-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  padding: 0 10px;
}

.last-Box .skip-label {
  flex: 1;
  text-align: center;
  color: #FFF;
  font-family: Heebo;
  font-size: 10px;
  font-weight: 300;
  opacity: 0.7;
}

.publikum-view {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
  gap: 20px;
}

.publikum-view-row1 {
  display: flex;
  height: 180px;
  align-items: center;
  gap: 20px;
  align-self: stretch;
  justify-content: space-between;
}

.Box-1, .Box-2, .Box-3, .Box-4, .last-Box {
  display: flex;
  padding: 16px 12px;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  flex: 1 1 0px;
  align-self: stretch;
  border-radius: 20px;
  background: var(--secondary);
  min-height: 0;
  min-width: 0;
  width: 100%;
  height: 180px;
}

.Box-2, .Box-3 {
  width: auto;
  height: auto;
}

.Box-4 {
  gap: 20px;
  align-self: baseline;
}

.text-1 {
  color: #FFF;
  text-align: center;
  font-family: Heebo;
  font-size: 18px;
  font-weight: 700;
  line-height: 0.6;
  letter-spacing: 0.9px;
  text-transform: uppercase;
}

.icon-team {
  width: 92px;
  height: 64px;
  flex-shrink: 0;
  aspect-ratio: 23/16;
}

.number {
  color: #FFF;
  text-align: center;
  font-family: Heebo;
  font-size: 18px;
  font-weight: 700;
  line-height: 0.6;
  letter-spacing: 0.9px;
  text-transform: uppercase;
}

.Box-2 .bars, .Box-3 .bars {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  align-self: stretch;
  height: 80px;
}

.Box-2 .bars .bar, .Box-3 .bars .bar {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  flex: 1 1 0px;
  cursor: pointer;
  transition: 0.3s ease;
  min-width: 0;
}

.Box-2 .bars .bar:hover .bar-graph,
.Box-3 .bars .bar:hover .bar-graph {
  background: var(--move);
  transition: 0.3s ease;
}

.Box-2 .bars .bar .bar-graph,
.Box-3 .bars .bar .bar-graph {
  display: flex;
  width: 16px;
  height: 64px;
  flex-direction: column-reverse;
  align-items: center;
  position: relative;
  background: linear-gradient(180deg, var(--Strawberry) 0%, var(--secondary) 100%);
  overflow: hidden;
}

.Box-2 .bars .bar .bar-graph::before,
.Box-3 .bars .bar .bar-graph::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: calc(100% - var(--percentage) * 0.64px);
  background: var(--secondary);
}

.Box-2 .bars .bar .bar-graph .segment-wrapper,
.Box-3 .bars .bar .bar-graph .segment-wrapper {
  display: flex;
  flex-direction: column;
  width: 16px;
}

.Box-2 .bars .bar .bar-graph .segment,
.Box-3 .bars .bar .bar-graph .segment {
  width: 16px;
  height: 2px;
  background: transparent;
}

.Box-2 .bars .bar .bar-graph .gap,
.Box-3 .bars .bar .bar-graph .gap {
  width: 16px;
  height: 2px;
  background: var(--secondary);
}

.Box-2 .bars .bar .p,
.Box-3 .bars .bar .p {
  color: #FFF;
  text-align: center;
  font-family: Heebo;
  font-size: 10px;
  font-weight: 300;
  line-height: 0.6;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  padding-top: 2px;
}

.numbers-2 {
  display: flex;
  justify-content: space-between;
  align-items: center;
  align-self: stretch;
  transition: 0.3s ease;
}

.numbers-2 .left {
  color: #fff;
  text-align: center;
  font-family: Heebo;
  font-size: 28px;
  font-weight: 700;
  line-height: 0.8;
  letter-spacing: 1.4px;
  text-transform: uppercase;
  transition: 0.3s ease;
}

.numbers-2 .right {
  color: #fff;
  text-align: center;
  font-family: Heebo;
  font-size: 18px;
  font-weight: 700;
  line-height: 0.6;
  letter-spacing: 0.9px;
  text-transform: uppercase;
  opacity: 0.3;
  transition: 0.3s ease;
}

.Bars {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  flex: 1;
  align-self: stretch;
}

.row-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  align-self: stretch;
  // flex: 1;
  min-height: 20px;
}

.row-bar .title {
  width: 50px;
  color: #FFF;
  font-family: Heebo;
  font-size: 14px;
  font-weight: 300;
  line-height: 0.6;
  letter-spacing: 0.5px;
  opacity: 0.7;
}

.row-bar .progress-bar {
  display: flex;
  height: 8px;
  padding: 3px 4px;
  align-items: start;
  justify-content:center;
  flex: 1 0 0;
  border-radius: 10px;
  background: var(--primary);
}

.progress-bar .line-red {
  height: 2px;
  border-radius: 4px;
  max-height: 2px;
  background: var(--Strawberry);
  transition: width 0.3s ease;
}

.row-bar .num {
  width: 24px;
  color: #FFF;
  text-align: right;
  font-family: Heebo;
  font-size: 10px;
  font-weight: 300;
  line-height: 0.6;
  letter-spacing: 0.5px;
  opacity: 0.7;
}

.map {
  display: flex;
  padding: 28px 20px;
  justify-content: center;
  align-items: flex-start;
  align-self: stretch;
  border-radius: 20px;
  background: var(--secondary);
  position: relative;
  width: 100%;
  flex: 1;
  flex-shrink: 0;
  overflow: hidden;
}

.maps {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  min-height: 0;
  min-width: 0;
}

.maps :deep(.leaflet-map) {
  width: 100%;
  height: 100%;
  border-radius: 20px;
}

.musk-countries {
  width: 260px;
  height: 280px;
  position: absolute;
  bottom: 0px;
  left: 0px;
  border-radius: 0px 38px 0px 20px;
  background: var(--primary);
  z-index: 10;
}

.box-countries {
  display: flex;
  width: 240px;
  height: 260px;
  padding: 16px 12px;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  position: absolute;
  bottom: 0px;
  left: 0px;
  border-radius: 20px;
  background: var(--secondary);
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 11;

  &::before{
    content: '';
    width: 20px;
    height: 20px;
    background: var(--primary);
    position: absolute;
    top: -40px;
    left: 0;
  }

  &::after{
    content: '';
    width: 20px;
    height: 20px;
    background: var(--secondary);
    position: absolute;
    top: -40px;
    left: 0;
    border-radius: 0 0 0 20px;
  }
}

.rounded-bottom{
  position: absolute;
  bottom: 0;
  right: -40px;
  width: 20px;
  height: 20px;
  background: var(--primary);
  border-radius: 0 0 20px 20px;

  &::after{
    content: '';
    width: 20px;
    height: 20px;
    background: var(--secondary);
    position: absolute;
    bottom: 0px;
    right: 0px;
    border-radius: 0 0 0 20px;
  }
}

.countries {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  align-self: stretch;
}

.row-country {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  align-self: stretch;
}

.row-country .icon {
  display: flex;
  width: 32px;
  height: 32px;
  padding: 6px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  border-radius: 16px;
  background: var(--primary);
}

.row-country .icon .country-flag {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
}

.row-country .number {
  flex: 1 0 0;
  color: var(--Main-Colors-White, #FFF);
  text-align: right;
  font-family: Heebo;
  font-size: 18px;
  font-weight: 700;
  line-height: 0.6;
  letter-spacing: 0.9px;
  text-transform: uppercase;
}

.row-country .progress-bar-container {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1 0 0;
}

.row-country .progress-bar-container .progress-bar {
  display: flex;
  height: 8px;
  padding: 3px 4px;
  align-items: start;
  justify-content: flex-start;
  flex: 1 0 0;
  border-radius: 10px;
  background: var(--primary);
}

.row-country .progress-bar-container .progress-bar .line-red {
  height: 4px;
  border-radius: 4px;
  max-height: 4px;
  background: var(--Strawberry);
  transition: width 0.3s ease;
}

.row-country .progress-bar-container .num {
  width: 28px;
  color: #FFF;
  text-align: right;
  font-family: Heebo;
  font-size: 10px;
  font-weight: 300;
  line-height: 0.6;
  letter-spacing: 0.5px;
  opacity: 0.7;
}

.slide-nav {
  display: flex;
  align-items: center;
  gap: 8px;
}

.slide-nav .slide-dot {
  display: flex;
  width: 14px;
  height: 14px;
  padding: 4px;
  align-items: center;
  gap: 10px;
  border-radius: 7px;
  background: var(--primary);
  cursor: pointer;
}

.slide-dot .red {
  width: 6px;
  height: 6px;
  flex-shrink: 0;
  fill: var(--Strawberry);
  border-radius: 50%;
  background: var(--Strawberry);
}

@media (max-width:1780px) {
  .Box-2 .bars .bar .p .age-start,
  .Box-3 .bars .bar .p .age-start {
    display: none;
  }
  .Box-2 .bars .bar .p .age-end::before,
  .Box-3 .bars .bar .p .age-end::before {
    content: "-";
  }
}

@media (min-width:1440px) and (max-width:1599px) {
  .publikum-view-row1 { gap: 15px; }
  .Box-1, .Box-2, .Box-3, .Box-4, .last-Box { padding: 16px 12px; }
  .numbers-2 .left { font-size: 18px; width: 17px; }
  .row-bar { gap: 4px; }
  .numbers-2 { align-items: end; }
  .numbers-2 .right { font-size: 14px; }
}

@media (min-width:1600px) and (max-width:2074px) {
  .number { font-size: 28px; }
}

@media (min-width:2075px) and (max-width:2560px) {
  .publikum-view-row1 { height: 260px; }
  .Box-1, .Box-2, .Box-3, .Box-4, .last-Box { height: 260px; padding: 16px 12px; }
  .number { font-size: 28px; }
  .icon-team { width: 152px; height: 108px; }
  .Box-4 { gap: 52px; }
  .Box-2 .bars, .Box-3 .bars { height: 160px; }
  .Box-2 .bars .bar, .Box-3 .bars .bar { height: 100%; }
  .Box-2 .bars .bar .bar-graph, .Box-3 .bars .bar .bar-graph { width: 30px; height: 150px; }
  .Box-2 .bars .bar .bar-graph::before, .Box-3 .bars .bar .bar-graph::before { height: calc(100% - var(--percentage) * 1.5px); }
  .Box-2 .bars .bar .bar-graph .gap, .Box-3 .bars .bar .bar-graph .gap { width: 30px; height: 4.3px; }
  .Box-2 .bars .bar .bar-graph .segment-wrapper, .Box-3 .bars .bar .bar-graph .segment-wrapper { width: 30px; }
  .Box-2 .bars .bar .bar-graph .segment, .Box-3 .bars .bar .bar-graph .segment { width: 30px; height: 5px; }
}
</style>