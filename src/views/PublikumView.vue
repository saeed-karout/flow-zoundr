<template>
  <div class="publikum-view">
    <div class="publikum-view-row1">
      <!-- Box 1: Total Audience -->
      <div class="Box-1">
        <div class="text-1">{{ audienceData.title }}</div>
        <template v-if="hasAudience">
          <img :src="audienceData.icon" class="icon-team" alt="Team Icon">
          <div class="number">{{ formatNumber(audienceData.total) }}</div>
        </template>
      </div>

      <!-- Box 2: Male Audience -->
      <div class="Box-2">
        <div class="text-1">{{ maleData.title }}</div>
        <div v-if="hasMaleData" class="bars">
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
        <div v-if="hasMaleData" class="numbers-2">
          <div class="left">{{ hoveredBar.percentage !== null && hoveredBar.type === 'male' ? hoveredBar.percentage : maleData.percentage }}%</div>
          <div class="right">{{ formatNumber(hoveredBar.count !== null && hoveredBar.type === 'male' ? hoveredBar.count : maleData.count) }}</div>
        </div>
      </div>

      <!-- Box 3: Female Audience -->
      <div class="Box-3">
        <div class="text-1">{{ femaleData.title }}</div>
        <div v-if="hasFemaleData" class="bars">
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
        <div v-if="hasFemaleData" class="numbers-2">
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
            v-if="hasSkipRate"
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
          
          <div v-if="hasSkipRate" class="skip-rate-labels">
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
            <transition-group 
              name="country-slide" 
              tag="div" 
              class="countries-transition"
              mode="out-in"
            >
              <div 
                v-for="(country, idx) in displayedCountries" 
                :key="country.name"
                class="row-country"
                :style="{ transitionDelay: `${idx * 60}ms` }"
              >
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
            </transition-group>
          </div>
          <div v-if="hasCountries" class="slide-nav">
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
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import apiRequest from '@/lib/apiRequest';
import LeafletMap from '@/components/Trends/LeafletMap.vue';

// ========== Props ==========
const props = defineProps({
  filters: {
    type: Object,
    default: () => ({})
  }
});

// ========== Refs ==========
const mapRef = ref(null);
const gradientId = `grad-${Date.now()}-${Math.random()}`;
const mapCenter = ref([30, 20]);
const mapZoom = ref(2);
let fetchTimeout = null;

// ========== Data ==========
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

// ========== هل وصلت بيانات فعلاً؟ ==========
// عند غياب البيانات كانت الصناديق تعرض هيكلاً فارغاً: أيقونة و0، وسلالم
// الأعمار بلا أعمدة، ومحور 0–100% مع خطّ أحمر مسطّح. نُخفيها ونُبقي العنوان.
const hasAudience = computed(() => Number(audienceData.value.total) > 0);

const hasBarsData = (data) =>
  Number(data.count) > 0 || data.bars.some((bar) => Number(bar.percentage) > 0);

const hasMaleData = computed(() => hasBarsData(maleData.value));
const hasFemaleData = computed(() => hasBarsData(femaleData.value));

// نقاط التنقّل بين صفحات الدول لا معنى لها بلا دول.
const hasCountries = computed(() =>
  countriesData.value.pages.some((page) => Array.isArray(page) && page.length > 0)
);

const hasSkipRate = computed(() =>
  Array.isArray(skipRateData.value.values) &&
  skipRateData.value.values.some((value) => Number(value) > 0)
);

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

// ========== Computed ==========
const countriesDataForMap = computed(() => {
  console.log('🗺️ [countriesDataForMap] بدء التحويل...');
  
  const allCountries = [];
  countriesData.value.pages.forEach((page, pageIndex) => {
    console.log(`🗺️ [countriesDataForMap] الصفحة ${pageIndex}:`, page);
    page.forEach(country => {
      allCountries.push({
        name: country.name,
        count: country.count
      });
    });
  });
  
  console.log('🗺️ [countriesDataForMap] allCountries:', allCountries);
  
  if (allCountries.length === 0) {
    console.warn('🗺️ [countriesDataForMap] لا توجد دول!');
    return {};
  }
  
  const uniqueCountries = [];
  const seenNames = new Set();
  for (const country of allCountries) {
    if (!seenNames.has(country.name)) {
      seenNames.add(country.name);
      uniqueCountries.push(country);
    }
  }
  
  console.log('🗺️ [countriesDataForMap] uniqueCountries:', uniqueCountries);
  
  const sortedCountries = [...uniqueCountries].sort((a, b) => b.count - a.count);
  console.log('🗺️ [countriesDataForMap] sortedCountries:', sortedCountries);
  
  const result = {};
  sortedCountries.forEach((country, index) => {
    result[country.name] = {
      name: country.name,
      count: country.count,
      rank: index + 1
    };
  });

  console.log('🗺️ [countriesDataForMap] النتيجة النهائية:', result);
  console.log('🗺️ [countriesDataForMap] عدد الدول:', Object.keys(result).length);
  
  return result;
});

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
  console.log('📊 [displayedCountries] بدء الحساب...');
  console.log('📊 [displayedCountries] activePage:', activePage.value);
  console.log('📊 [displayedCountries] countriesData.pages:', countriesData.value.pages);
  
  const countries = countriesData.value.pages[activePage.value] || [];
  console.log('📊 [displayedCountries] countries:', countries);
  
  const maxCount = Math.max(...countries.map(c => c.count), 1);
  console.log('📊 [displayedCountries] maxCount:', maxCount);
  
  const result = countries.map(c => ({
    ...c,
    percentage: Number(((c.count / maxCount) * 100).toFixed(2)),
  }));
  
  console.log('📊 [displayedCountries] النتيجة:', result);
  return result;
});

// ========== Methods ==========
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

// ========== Country Flags ==========
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

// ========== Map Handlers ==========
const handleMapClick = (latlng) => {
  console.log('تم النقر على الخريطة:', latlng);
};

const handleZoomChange = (zoom) => {
  console.log('مستوى التكبير:', zoom);
};

// ========== Update Map ==========
const updateMap = () => {
  console.log('🗺️ [updateMap] بدء تحديث الخريطة...');
  
  if (!mapRef.value) {
    console.warn('🗺️ [updateMap] mapRef غير موجود');
    return;
  }
  
  const map = mapRef.value.map;
  if (map) {
    console.log('🗺️ [updateMap] تحديث حجم الخريطة...');
    setTimeout(() => {
      map.invalidateSize();
      console.log('🗺️ [updateMap] تم تحديث حجم الخريطة');
    }, 300);
  }
  
  setTimeout(() => {
    if (mapRef.value.geoLayer) {
      console.log('🗺️ [updateMap] تحديث ألوان الخريطة...');
      mapRef.value.updateMapColors();
      
      if (typeof mapRef.value.updateTooltips === 'function') {
        console.log('🗺️ [updateMap] تحديث التولتيبات...');
        mapRef.value.updateTooltips();
      }
    }
  }, 400);
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
    
    console.log('📊 API Response Data:', data);
    
    if (data) {
      updateDataFromResponse(data);
    } else {
      console.warn('⚠️ لا توجد بيانات من API');
    }
  } catch (error) {
    console.error('❌ Error fetching audience data:', error);
  }
};

const updateDataFromResponse = (data) => {
  console.log('🔄 [updateDataFromResponse] بدء تحديث البيانات...');
  console.log('🔄 [updateDataFromResponse] البيانات المستلمة:', data);
  
  // Total Audience
  audienceData.value.total = data.total_audience || 0;
  console.log('✅ Total Audience:', audienceData.value.total);
  
  // Gender Age Data
  if (data.gender_age) {
    console.log('✅ Gender Age Data موجودة');
    const male = data.gender_age.male || {};
    const female = data.gender_age.female || {};
    
    const maleTotal = male.total || 0;
    const femaleTotal = female.total || 0;
    const grandTotal = maleTotal + femaleTotal;
    
    maleData.value.count = maleTotal;
    femaleData.value.count = femaleTotal;
    
    maleData.value.percentage = grandTotal > 0 ? Math.round((maleTotal / grandTotal) * 100) : 0;
    femaleData.value.percentage = grandTotal > 0 ? Math.round((femaleTotal / grandTotal) * 100) : 0;
    
    console.log('✅ Male Total:', maleTotal, 'Female Total:', femaleTotal);
    
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
    
    console.log('✅ Male Bars:', maleData.value.bars);
    console.log('✅ Female Bars:', femaleData.value.bars);
  } else {
    console.warn('⚠️ لا توجد بيانات Gender Age');
  }
  
  // Skip Rate
  if (data.skip_rate) {
    console.log('✅ Skip Rate Data موجودة');
    if (data.skip_rate.rates && data.skip_rate.values) {
      skipRateData.value.labels = data.skip_rate.rates;
      skipRateData.value.values = data.skip_rate.values;
    } else if (Array.isArray(data.skip_rate[0]) && Array.isArray(data.skip_rate[1])) {
      skipRateData.value.labels = data.skip_rate[0];
      skipRateData.value.values = data.skip_rate[1];
    }
    console.log('✅ Skip Rate Labels:', skipRateData.value.labels);
    console.log('✅ Skip Rate Values:', skipRateData.value.values);
  } else {
    console.warn('⚠️ لا توجد بيانات Skip Rate');
  }
  
  // ========== Countries ==========
  if (data.countries && Array.isArray(data.countries)) {
    console.log('✅ Countries Data موجودة:', data.countries);
    
    const topFiveCountries = data.countries.slice(0, 5).map(country => ({
      name: country.name,
      count: country.count
    }));
    
    console.log('✅ Top 5 Countries:', topFiveCountries);
    
    const pages = [
      topFiveCountries,
      topFiveCountries
    ];
    
    countriesData.value.pages = pages;
    countriesData.value.dots = pages.map((_, idx) => ({ active: idx === 0 }));
    
    console.log('✅ countriesData.pages:', countriesData.value.pages);
    console.log('✅ countriesData.dots:', countriesData.value.dots);
    
    activePage.value = 0;
  } else {
    console.warn('⚠️ لا توجد بيانات Countries');
  }
  
  // Devices
  if (data.devices) {
    console.log('✅ Devices Data موجودة:', data.devices);
    const devices = data.devices;
    const totalDevices = Object.values(devices).reduce((sum, val) => sum + val, 0);
    
    playbackData.value.devices = Object.entries(devices).map(([key, value]) => ({
      title: key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' '),
      percentage: totalDevices > 0 ? Math.round((value / totalDevices) * 100) : 0
    }));
    
    console.log('✅ Playback Devices:', playbackData.value.devices);
  } else {
    console.warn('⚠️ لا توجد بيانات Devices');
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
    console.log('✅ Sources Data موجودة:', data.sources);
    const sources = data.sources;
    const totalSources = Object.values(sources).reduce((sum, val) => sum + val, 0);
    
    sourceData.value.sources = Object.entries(sources).map(([key, value]) => ({
      title: key.charAt(0).toUpperCase() + key.slice(1),
      percentage: totalSources > 0 ? Math.round((value / totalSources) * 100) : 0
    }));
    
    console.log('✅ Sources:', sourceData.value.sources);
  } else {
    console.warn('⚠️ لا توجد بيانات Sources');
    sourceData.value.sources = [
      { title: 'Artist', percentage: 35 },
      { title: 'Search', percentage: 25 },
      { title: 'Playlist', percentage: 20 },
      { title: 'Album', percentage: 12 },
      { title: 'Others', percentage: 8 },
    ];
  }
  
  console.log('🔄 [updateDataFromResponse] اكتمل تحديث البيانات');
  
  // ✅ تحديث الخريطة بعد تحميل البيانات
  nextTick(() => {
    updateMap();
  });
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

// ========== Watchers ==========
watch(
  () => props.filters,
  (newFilters) => {
    console.log('🔄 [PublikumView] filters changed:', newFilters);
    const dateType = getDateType();

    if (dateType === 'custom' && (!props.filters?.startDate || !props.filters?.endDate)) {
      console.warn('⚠️ تاريخ مخصص بدون تواريخ بداية ونهاية');
      return;
    }

    debouncedFetch();
  },
  { deep: true }
);

// ✅ مراقبة تغيير countriesDataForMap وتحديث الخريطة
watch(
  () => countriesDataForMap.value,
  (newData, oldData) => {
    console.log('🗺️ [watch] countriesDataForMap تغير');
    console.log('🗺️ [watch] عدد الدول الجديد:', Object.keys(newData).length);
    console.log('🗺️ [watch] عدد الدول القديم:', Object.keys(oldData || {}).length);
    
    if (Object.keys(newData).length > 0) {
      console.log('🗺️ [watch] تحديث الخريطة بالبيانات الجديدة...');
      nextTick(() => {
        updateMap();
      });
    }
  },
  { deep: true }
);

// ========== Lifecycle ==========
onMounted(() => {
  console.log('🚀 [PublikumView] تم تحميل المكون');
  console.log('🚀 [PublikumView] props.filters:', props.filters);
  fetchAudienceData();
});

onUnmounted(() => {
  if (fetchTimeout) clearTimeout(fetchTimeout);
});
</script>

<style lang="scss" scoped>
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
  overflow: hidden;
}

.countries-transition {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  align-self: stretch;
  width: 100%;
}

.row-country {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  align-self: stretch;
  will-change: transform, opacity;
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
  transition: all 0.3s ease;
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
  transition: width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
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
  width: 5px;
  height: 5px;
  flex-shrink: 0;
  fill: var(--Strawberry);
  border-radius: 50%;
  background: var(--Strawberry);
}

/* ========== ANIMATIONS FOR COUNTRY TRANSITIONS ========== */
.country-slide-leave-active {
  position: absolute;
  width: 100%;
}

.country-slide-leave-to {
  opacity: 0;
  transform: translateY(-30px) scale(0.95);
}

.country-slide-enter-active {
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.country-slide-enter-from {
  opacity: 0;
  transform: translateY(30px) scale(0.95);
}

.country-slide-enter-to {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.country-slide-leave-active {
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.country-slide-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.country-slide-leave-to {
  opacity: 0;
  transform: translateY(-30px) scale(0.95);
}

.country-slide-move {
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.number {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.line-red {
  transition: width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* ========== RESPONSIVE ========== */
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
  .last-Box .skip-rate-svg{ min-height: 110px; }
}

@media (min-width:1600px) and (max-width:2074px) {
  .number { font-size: 28px; }
  .last-Box .skip-rate-svg{ min-height: 110px; }
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