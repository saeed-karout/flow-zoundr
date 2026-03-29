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
 <!-- إذا كان فيه + (يعني 65+) → نظهر النص كامل بدون تقسيم -->
  <template v-if="bar.ageRange.includes('+')">
    {{ bar.ageRange }}
  </template>

  <!-- غير كده → نقسم ونخفي الجزء الأول على الشاشات المتوسطة -->
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
 <!-- إذا كان فيه + (يعني 65+) → نظهر النص كامل بدون تقسيم -->
  <template v-if="bar.ageRange.includes('+')">
    {{ bar.ageRange }}
  </template>

  <!-- غير كده → نقسم ونخفي الجزء الأول على الشاشات المتوسطة -->
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

    <!-- Box 4: Sources -->
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

    <!-- Last Box: Skip Rate -->
    <div class="last-Box">
      <div class="text-1">{{ skipRateData.title }}</div>
      <div class="chart"></div>
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
import { ref, computed } from 'vue';
import iconAt from '@/assets/images/Lander/at.png';

// Sample data structure (to be replaced by API data)
const audienceData = ref({
  title: 'Publikum',
  icon: '/icon/Team.svg',
  total: 192293265,
});

const maleData = ref({
  title: 'Männlich',
  percentage: 43,
  count: 82686104,
  bars: [
    { ageRange: '0-12', percentage: 100 },
    { ageRange: '13-17', percentage: 80 },
    { ageRange: '18-24', percentage: 60 },
    { ageRange: '25-34', percentage: 50 },
    { ageRange: '35-44', percentage: 40 },
    { ageRange: '45-64', percentage: 20 },
    { ageRange: '65+', percentage: 5 },
  ],
});

const femaleData = ref({
  title: 'Weiblich',
  percentage: 57,
  count: 109607161,
  bars: [
    { ageRange: '0-12', percentage: 20 },
    { ageRange: '13-17', percentage: 50 },
    { ageRange: '18-24', percentage: 80 },
    { ageRange: '25-34', percentage: 100 },
    { ageRange: '35-44', percentage: 80 },
    { ageRange: '45-64', percentage: 50 },
    { ageRange: '65+', percentage: 30 },
  ],
});

const playbackData = ref({
  title: 'GERÄTE',
  devices: [
    { title: 'Mobile', percentage: 100 },
    { title: 'Laptop', percentage: 80 },
    { title: 'Radio', percentage: 60 },
    { title: 'Tablet', percentage: 40 },
    { title: 'Mac/PC', percentage: 2 },
  ],
});

const sourceData = ref({
  title: 'Quelle',
  sources: [
    { title: 'Artist', percentage: 50 },
    { title: 'Search', percentage: 30 },
    { title: 'Playlist', percentage: 40 },
    { title: 'Album', percentage: 20 },
    { title: 'Others', percentage: 10 },
  ],
});

const skipRateData = ref({
  title: 'Skip Rate',
});

// Example country data with multiple pages
const countriesData = ref({
  title: 'Länder',
  pages: [
    [
      { name: 'Austria', icon: iconAt, count: 96049394 },
      { name: 'Germany', icon: iconAt, count: 967341 },
      { name: 'France', icon: iconAt, count: 48622 },
      { name: 'Spain', icon: iconAt, count: 58948 },
      { name: 'Italy', icon: iconAt, count: 600 },
    ],
    [
      { name: 'Brazil', icon: iconAt, count: 86049394 },
      { name: 'Canada', icon: iconAt, count: 935300 },
      { name: 'Japan', icon: iconAt, count: 50 },
      { name: 'Australia', icon: iconAt, count: 79 },
      { name: 'India', icon: iconAt, count: 81 },
    ],
  ],
  dots: [
    { active: true },
    { active: false },
  ],
});

// Track the active page for countries
const activePage = ref(0);

// Track hover state for bars
const hoveredBar = ref({
  percentage: null,
  count: null,
  type: null,
});

// Compute the currently displayed countries with normalized percentages
const displayedCountries = computed(() => {
  const countries = countriesData.value.pages[activePage.value] || [];
  const maxCount = Math.max(...countries.map(country => country.count), 1); // Avoid division by zero
  return countries.map(country => ({
    ...country,
    percentage: Number(((country.count / maxCount) * 100).toFixed(2)),
  }));
});

// Utility function to format numbers with commas
const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

// Function to toggle between countries pages when clicking anywhere on the box
const toggleCountriesPage = () => {
  const nextPage = (activePage.value + 1) % countriesData.value.pages.length;
  setActiveDot(nextPage);
};

// Function to set the active dot and update the displayed countries
const setActiveDot = (index) => {
  countriesData.value.dots = countriesData.value.dots.map((dot, i) => ({
    active: i === index,
  }));
  activePage.value = index;
};

// Function to update hover data when hovering over a bar
const updateHoverData = (bar, type) => {
  const totalCount = type === 'male' ? maleData.value.count : femaleData.value.count;
  const barCount = Math.round((bar.percentage / 100) * totalCount);
  hoveredBar.value = {
    percentage: bar.percentage,
    count: barCount,
    type: type,
  };
};

// Function to reset hover data when mouse leaves
const resetHoverData = (type) => {
  if (hoveredBar.value.type === type) {
    hoveredBar.value = {
      percentage: null,
      count: null,
      type: null,
    };
  }
};

// Function to fetch data from API
const fetchData = async () => {
  try {
    // Example API response structure
    const data = {
      audience: { title: 'Publikum', icon: '/icon/Team.svg', total: 192293265 },
      male: {
        title: 'Männlich',
        percentage: 43,
        count: 82686104,
        bars: [
          { ageRange: '0-12', percentage: 100 },
          { ageRange: '13-17', percentage: 15 },
          { ageRange: '18-24', percentage: 25 },
          { ageRange: '25-34', percentage: 20 },
          { ageRange: '35-44', percentage: 15 },
          { ageRange: '45-64', percentage: 10 },
          { ageRange: '65+', percentage: 5 },
        ],
      },
      female: {
        title: 'Weiblich',
        percentage: 57,
        count: 109607161,
        bars: [
          { ageRange: '0-12', percentage: 12 },
          { ageRange: '13-17', percentage: 18 },
          { ageRange: '18-24', percentage: 20 },
          { ageRange: '25-34', percentage: 22 },
          { ageRange: '35-44', percentage: 15 },
          { ageRange: '45-64', percentage: 10 },
          { ageRange: '65+', percentage: 3 },
        ],
      },
      playback: {
        title: 'Abgespielt',
        devices: [
          { title: 'Mobile', percentage: 30 },
          { title: 'Laptop', percentage: 25 },
          { title: 'Radio', percentage: 15 },
          { title: 'Tablet', percentage: 20 },
          { title: 'Mac/PC', percentage: 10 },
        ],
      },
      source: {
        title: 'Quelle',
        sources: [
          { title: 'Artist', percentage: 20 },
          { title: 'Search', percentage: 30 },
          { title: 'Playlist', percentage: 25 },
          { title: 'Album', percentage: 15 },
          { title: 'Others', percentage: 10 },
        ],
      },
      skipRate: { title: 'Skip Rate' },
      countries: {
        title: 'Länder',
        pages: [
          [
            { name: 'Austria', icon: '/assets/images/Lander/at.png', count: 96049394 },
            { name: 'Germany', icon: '/assets/images/Lander/de.png', count: 967341 },
            { name: 'France', icon: '/assets/images/Lander/fr.png', count: 48622 },
            { name: 'Spain', icon: '/assets/images/Lander/es.png', count: 58948 },
            { name: 'Italy', icon: '/assets/images/Lander/it.png', count: 600 },
          ],
          [
            { name: 'Brazil', icon: '/assets/images/Lander/br.png', count: 86049394 },
            { name: 'Canada', icon: '/assets/images/Lander/ca.png', count: 935300 },
            { name: 'Japan', icon: '/assets/images/Lander/jp.png', count: 50 },
            { name: 'Australia', icon: '/assets/images/Lander/au.png', count: 79 },
            { name: 'India', icon: '/assets/images/Lander/in.png', count: 81 },
          ],
        ],
        dots: [
          { active: true },
          { active: false },
        ],
      },
    };

    // Normalize percentages to ensure they sum to 100
    const normalizePercentages = (items) => {
      const total = items.reduce((sum, item) => sum + (item.percentage || 0), 0);
      if (total === 0) return items.map(item => ({ ...item, percentage: 0 }));
      return items.map(item => ({
        ...item,
        percentage: Number((item.percentage / total * 100).toFixed(2)),
      }));
    };

    // Update reactive data
    audienceData.value = data.audience;
    maleData.value = {
      ...data.male,
      bars: normalizePercentages(data.male.bars),
    };
    femaleData.value = {
      ...data.female,
      bars: normalizePercentages(data.female.bars),
    };
    playbackData.value = {
      ...data.playback,
      devices: normalizePercentages(data.playback.devices),
    };
    sourceData.value = {
      ...data.source,
      sources: normalizePercentages(data.source.sources),
    };
    skipRateData.value = data.skipRate;
    countriesData.value = data.countries;
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};
</script>

<style lang="scss" scoped>
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