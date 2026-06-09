<template>
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

    <!-- Box 5: Sources (Skip Rate from API) -->
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
          />
          
          <!-- Data points -->
          <circle 
            v-for="(point, index) in chartPoints" 
            :key="index"
            :cx="point.x"
            :cy="point.y"
            r="4"
            fill="#DD1155"
            stroke="#FFFFFF"
            stroke-width="1.5"
            class="data-point"
            @mouseenter="showTooltip(point, index)"
            @mouseleave="hideTooltip"
          />
        </svg>
        
        <!-- X-axis labels -->
        <div class="skip-rate-labels">
          <div 
            v-for="(label, index) in skipRateData.labels" 
            :key="index"
            class="skip-label"
          >
            {{ label }}%
          </div>
        </div>
        
        <!-- Tooltip -->
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
      <img src="/img/Flächen.svg" class="Flachen" alt="Flächen.svg">
    </div>
    <div class="musk-countries">
      <div class="box-countries" @click="toggleCountriesPage">
        <div class="text-1">{{ countriesData.title }}</div>
        <div class="countries">
          <div v-for="country in displayedCountries" :key="country.name" class="row-country">
            <div class="icon">
              <div class="country-icon" :style="{ backgroundImage: `url(${country.icon})` }"></div>
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
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import apiRequest from '@/lib/apiRequest';
import iconAt from '@/assets/images/Lander/at.png';

// ========== Reactive Data ==========
const isLoading = ref(false);
const gradientId = `grad-${Date.now()}-${Math.random()}`;

const audienceData = ref({
  title: 'Publikum',
  icon: '/icon/Team.svg',
  total: 0,
});

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

// Track active page for countries
const activePage = ref(0);

// Track hover state for bars
const hoveredBar = ref({
  percentage: null,
  count: null,
  type: null,
});

// Tooltip state
const tooltip = ref({
  visible: false,
  x: 0,
  y: 0,
  value: 0,
  label: 0,
});

// SVG dimensions
const svgWidth = 323;
const svgHeight = 140;
const padding = { left: 15, right: 15, top: 10, bottom: 20 };

// Compute chart points
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

// Compute area path (filled area under the line)
const areaPath = computed(() => {
  if (chartPoints.value.length < 2) return '';
  
  let path = `M ${padding.left} ${svgHeight - padding.bottom}`;
  
  // Add all data points
  chartPoints.value.forEach(point => {
    path += ` L ${point.x} ${point.y}`;
  });
  
  // Close the path to the bottom right and back to start
  const lastPoint = chartPoints.value[chartPoints.value.length - 1];
  path += ` L ${lastPoint.x} ${svgHeight - padding.bottom}`;
  path += ` Z`;
  
  return path;
});

// Compute line path (just the line connecting points)
const linePath = computed(() => {
  if (chartPoints.value.length < 2) return '';
  
  let path = `M ${chartPoints.value[0].x} ${chartPoints.value[0].y}`;
  
  for (let i = 1; i < chartPoints.value.length; i++) {
    path += ` L ${chartPoints.value[i].x} ${chartPoints.value[i].y}`;
  }
  
  return path;
});

// Show tooltip on data point hover
const showTooltip = (point, index) => {
  tooltip.value = {
    visible: true,
    x: point.x,
    y: point.y - 25,
    value: point.value,
    label: point.label
  };
};

const hideTooltip = () => {
  tooltip.value.visible = false;
};

// Compute max skip rate for chart scaling
const maxSkipRate = computed(() => {
  return Math.max(...skipRateData.value.values, 1);
});

// Compute displayed countries with normalized percentages
const displayedCountries = computed(() => {
  const countries = countriesData.value.pages[activePage.value] || [];
  const maxCount = Math.max(...countries.map(country => country.count), 1);
  return countries.map(country => ({
    ...country,
    percentage: Number(((country.count / maxCount) * 100).toFixed(2)),
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
  hoveredBar.value = {
    percentage: bar.percentage,
    count: barCount,
    type: type,
  };
};

const resetHoverData = (type) => {
  if (hoveredBar.value.type === type) {
    hoveredBar.value = {
      percentage: null,
      count: null,
      type: null,
    };
  }
};

// ========== API Functions ==========
const fetchAudienceData = async (filters = {}) => {
  isLoading.value = true;
  try {
    const params = new URLSearchParams();
    
    if (filters.dateType) params.append('date-type', filters.dateType);
    if (filters.startDate) params.append('start_date', filters.startDate);
    if (filters.endDate) params.append('end_date', filters.endDate);
    if (filters.songUuid) filters.songUuid.forEach(id => params.append('song_uuid[]', id));
    if (filters.isrc) filters.isrc.forEach(code => params.append('isrc[]', code));
    if (filters.releaseUuid) filters.releaseUuid.forEach(id => params.append('release_uuid[]', id));
    if (filters.gtin) filters.gtin.forEach(code => params.append('gtin[]', code));
    if (filters.artist) filters.artist.forEach(name => params.append('artist[]', name));
    if (filters.feature) filters.feature.forEach(name => params.append('feature[]', name));
    if (filters.contributer) filters.contributer.forEach(name => params.append('contributer[]', name));
    if (filters.producer) filters.producer.forEach(name => params.append('producer[]', name));
    if (filters.cLine) filters.cLine.forEach(line => params.append('c-line[]', line));
    if (filters.store) filters.store.forEach(store => params.append('store[]', store));
    if (filters.country) filters.country.forEach(country => params.append('country[]', country));

    const response = await apiRequest.get(`/audience?${params.toString()}`);
    const data = response.data?.data || response.data;
    
    console.log('📊 Audience API Response:', data);
    
    if (data) {
      audienceData.value.total = data.total_audience || 0;
      
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
      
      if (data.skip_rate && Array.isArray(data.skip_rate[0]) && Array.isArray(data.skip_rate[1])) {
        skipRateData.value.labels = data.skip_rate[0];
        skipRateData.value.values = data.skip_rate[1];
      }
      
      if (data.countries && Array.isArray(data.countries)) {
        const pageSize = 5;
        const pages = [];
        for (let i = 0; i < data.countries.length; i += pageSize) {
          pages.push(data.countries.slice(i, i + pageSize).map(country => ({
            name: country.name,
            icon: getCountryIcon(country.name),
            count: country.count
          })));
        }
        
        countriesData.value.pages = pages.length > 0 ? pages : [[]];
        countriesData.value.dots = pages.map((_, idx) => ({ active: idx === 0 }));
      }
      
      playbackData.value.devices = [
        { title: 'Mobile', percentage: 45 },
        { title: 'Laptop', percentage: 25 },
        { title: 'Radio', percentage: 15 },
        { title: 'Tablet', percentage: 10 },
        { title: 'Mac/PC', percentage: 5 },
      ];
      
      sourceData.value.sources = [
        { title: 'Artist', percentage: 35 },
        { title: 'Search', percentage: 25 },
        { title: 'Playlist', percentage: 20 },
        { title: 'Album', percentage: 12 },
        { title: 'Others', percentage: 8 },
      ];
    }
  } catch (error) {
    console.error('❌ Error fetching audience data:', error);
  } finally {
    isLoading.value = false;
  }
};

const getCountryIcon = (countryName) => {
  const iconMap = {
    'United States': '/icons/countries/us.svg',
    'Germany': '/icons/countries/de.svg',
    'Brazil': '/icons/countries/br.svg',
    'United Kingdom': '/icons/countries/gb.svg',
    'Canada': '/icons/countries/ca.svg',
    'Spain': '/icons/countries/es.svg',
    'France': '/icons/countries/fr.svg',
    'Swiss': '/icons/countries/ch.svg',
    'Netherlands': '/icons/countries/at.svg',
    'Australia': '/icons/countries/au.svg',
  };
  return iconMap[countryName] || iconAt;
};

// ========== Lifecycle ==========
onMounted(() => {
  fetchAudienceData();
});
</script>




<style lang="scss" scoped>


.last-Box {
  .skip-rate-container {
    position: relative;
    width: 100%;
    height: calc(100% - 30px);
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  
  .skip-rate-svg {
    width: 100%;
    height: auto;
    min-height: 100px;
    cursor: pointer;
    
    .data-point {
      cursor: pointer;
      transition: r 0.2s ease;
      
      &:hover {
        r: 6;
      }
    }
  }
  
  .skip-rate-labels {
    display: flex;
    justify-content: space-between;
    margin-top: 8px;
    padding: 0 10px;
  }
  
  .skip-label {
    flex: 1;
    text-align: center;
    color: #FFF;
    font-family: Heebo;
    font-size: 10px;
    font-weight: 300;
    opacity: 0.7;
  }
  
  .skip-tooltip {
    position: absolute;
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(8px);
    border-radius: 8px;
    padding: 6px 12px;
    min-width: 50px;
    text-align: center;
    transform: translateX(-50%);
    pointer-events: none;
    z-index: 100;
    border: 1px solid rgba(221, 17, 85, 0.3);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    
    .tooltip-value {
      color: #DD1155;
      font-family: Heebo;
      font-size: 14px;
      font-weight: 700;
    }
    
    .tooltip-label {
      color: #FFF;
      font-family: Heebo;
      font-size: 10px;
      font-weight: 300;
      opacity: 0.7;
    }
  }
}


/* Ensure the entire component fits within the viewport */
:deep(.publikum-view) {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.publikum-view-row1 {
  display: flex;
  height: 180px;
  align-items: center;
  gap: 20px;
  align-self: stretch;
  justify-content: space-between;
}

/* قاعدة موحدة لجميع الصناديق - نفس الأبعاد للجميع */
.Box-1,
.Box-2,
.Box-3,
.Box-4,
.last-Box {
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

/* إزالة الأبعاد الثابتة من Box-2 و Box-3 */
.Box-2,
.Box-3 {
  width: auto;
  height: auto;
}

.Box-4{
  gap: 20px;
  align-self:baseline;
}

.text-1 {
  color: #FFF;
  text-align: center;
  font-family: Heebo;
  font-size: 18px;
  font-style: normal;
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
  font-style: normal;
  font-weight: 700;
  line-height: 0.6;
  letter-spacing: 0.9px;
  text-transform: uppercase;
}

.Box-2 .bars,
.Box-3 .bars {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  align-self: stretch;
  height: 80px;
}

.Box-2 .bars .bar,
.Box-3 .bars .bar {
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
  font-style: normal;
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
  font-style: normal;
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
  font-style: normal;
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
  // gap: 8px;
}

.row-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  align-self: stretch;
  flex: 1;
  min-height: 20px;
}

.row-bar .title {
  width: 40px;
  color: #FFF;
  font-family: Heebo;
  font-size: 10px;
  font-style: normal;
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
  justify-content: flex-start;
  flex: 1 0 0;
  border-radius: 10px;
  background: var(--primary);
}

.progress-bar .line-red {
  height: 4px;
  border-radius: 4px;
  max-height: 4px;
  background: var(--Strawberry);
  transition: width 0.3s ease;
}

.row-bar .num {
  width: 28px;
  color: #FFF;
  text-align: right;
  font-family: Heebo;
  font-size: 10px;
  font-style: normal;
  font-weight: 300;
  line-height: 0.6;
  letter-spacing: 0.5px;
  opacity: 0.7;
}

.last-Box {
  .chart {
    /* إضافة محتوى إذا لزم الأمر */
  }
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
  height: calc(100vh - 180px);
  width: 100%;
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
}

.maps .Flachen {
  height: 100%;
  object-fit: contain;
  max-width: 100%;
  max-height: 100%;
}

.musk-countries {
  width: 260px;
  height: 280px;
  position: absolute;
  bottom: 0px;
  left: 0px;
  border-radius: 0px 38px 0px 20px;
  background: var(--primary);
}

.musk-countries::before {
  content: '';
  position: absolute;
  top: -20px;
  left: 0;
  width: 20px;
  height: 20px;
  background: var(--secondary);
  border-radius: 0 0 0 20px;
  z-index: 5;
}

.musk-countries::after {
  content: '';
  position: absolute;
  top: -20px;
  left: 0;
  width: 20px;
  height: 20px;
  background: var(--primary);
  border-radius: 0 0 0 0px;
  z-index: 4;
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
}

.box-countries::before {
  content: '';
  position: absolute;
  bottom: 0px;
  right: -40px;
  width: 20px;
  height: 20px;
  background: var(--secondary);
  border-radius: 0 0 0 20px;
  z-index: 5;
}

.box-countries::after {
  content: '';
  position: absolute;
  bottom: 0px;
  right: -40px;
  width: 20px;
  height: 20px;
  background: var(--primary);
  border-radius: 0 0 0 0px;
  z-index: 4;
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

.row-country .icon .country-icon {
  flex: 1 0 0;
  align-self: stretch;
  border-radius: 20px;
  background-size: cover;
  background-position: 50%;
  background-repeat: no-repeat;
}

.row-country .number {
  flex: 1 0 0;
  color: var(--Main-Colors-White, #FFF);
  text-align: right;
  font-family: Heebo;
  font-size: 18px;
  font-style: normal;
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
  font-style: normal;
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
  .publikum-view-row1 {
    gap: 15px;
  }
  
  .Box-1, .Box-2, .Box-3, .Box-4, .last-Box {
    padding: 16px 12px;
  }
  
  .maps {
    min-width: 768px;
    max-width: 1066px;
    min-height: 404px;
    max-height: 492px;
    position: relative;
  }

  .maps .Flachen {
    position: absolute;
    right: 0;
  }

  .numbers-2 .left {
    font-size: 18px;
  }

  .numbers-2 .left {
    width: 17px;
  }

  .row-bar {
    gap: 4px;
  }

  .numbers-2 {
    align-items: end;
  }
  
  .numbers-2 .right {
    font-size: 14px;
  }
}

@media (min-width:1600px) and (max-width:2074px) {
  .number {
    font-size: 28px;
  }

  .maps {
    min-width: 1066px;
    max-width: 1646px;
    min-height: 492px;
    max-height: 759px;
    position: relative;
  }
}

@media (min-width:2075px) and (max-width:2560px) {
  .publikum-view-row1 {
    height: 260px; /* الحفاظ على نفس الارتفاع */
  }
  
  .Box-1, .Box-2, .Box-3, .Box-4, .last-Box {
    height: 260px; /* الحفاظ على نفس الارتفاع */
    padding: 16px 12px; /* الحفاظ على نفس الـ padding */
  }

  .number {
    font-size: 28px; /* الحفاظ على نفس حجم الخط */
  }

  .icon-team {
    width: 152px; /* الحفاظ على نفس الحجم */
    height: 108px;
  }

  .Box-4{
    gap: 52px;
  }

  .Box-2 .bars, .Box-3 .bars {
    height: 160px; /* الحفاظ على نفس الارتفاع */
  }

  .Box-2 .bars .bar, .Box-3 .bars .bar{
    height: 100%;
  }

  .Box-2 .bars .bar .bar-graph, 
  .Box-3 .bars .bar .bar-graph {
    width: 30px; /* الحفاظ على نفس العرض */
    height: 150px; /* الحفاظ على نفس الارتفاع */
  }


  /* التصحيح المهم: تحديث عامل الحساب للارتفاع الجديد */
  .Box-2 .bars .bar .bar-graph::before,
  .Box-3 .bars .bar .bar-graph::before {
    height: calc(100% - var(--percentage) * 1.5px);
  }

    .Box-2 .bars .bar .bar-graph .gap, .Box-3 .bars .bar .bar-graph .gap{
    width: 30px;
    height: 4.3px;
  }
  .Box-2 .bars .bar .bar-graph .segment-wrapper, .Box-3 .bars .bar .bar-graph .segment-wrapper{
    width: 30px;
  }

  .Box-2 .bars .bar .bar-graph .segment, .Box-3 .bars .bar .bar-graph .segment{
    width: 30px;
    height: 5px;
  }


  .maps {
    min-width: 1469px;
    max-width: 2120px;
    min-height: 678px;
    max-height: 979px;
    position: relative;
  }
}
</style>