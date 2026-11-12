<template>
  <main>
    <div class="main">
      <TopRow
        :isSwitchActive="isSwitchActive"
        @toggle-switch="toggleSwitch"
        @filters-changed="handleFiltersChanged"
      />
      
      <template v-if="isSwitchActive">
        <PublikumView :filters="currentFilters" />
      </template>
      <template v-else>
        <div class="row2">
          <component 
  :is="tabs[activeTab].component" 
  :data="getTabData(activeTab)"
  :filters="currentFiltersForChild"
/>
          <ColumnTabs :tabs="tabs" :activeTab="activeTab" @set-active-tab="setActiveTab" />
        </div>
        <SecondarySection 
          :allData="allData" 
          :filters="currentFiltersForChild"
        />
      </template>
    </div>
  </main>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import TopRow from '@/components/Stream/content/TopRow.vue';
import ColumnTabs from '@/components/Stream/content/ColumnTabs.vue';
import StreamingTab from '@/components/Stream/tabs/StreamingTab.vue';
import SongsTab from '@/components/Stream/tabs/SongsTab.vue';
import ReleasesTab from '@/components/Stream/tabs/ReleasesTab.vue';
import ShazamsTab from '@/components/Stream/tabs/ShazamsTab.vue';
import EinnahmenTab from '@/components/Stream/tabs/EinnahmenTab.vue';
import StoresTab from '@/components/Stream/tabs/StoresTab.vue';
import SecondarySection from '@/components/Stream/Secondary-section/SecondarySection.vue';
import PublikumView from '@/views/PublikumView.vue';
import apiRequest from '@/lib/apiRequest';

// ========== تعريف التابات ==========
const tabsConfig = [
  { title: 'Streams', icon: '/icon/icon-stream/music.svg', component: StreamingTab, dataKey: null },
  { title: 'Songs', icon: '/icon/icon-stream/songs.svg', component: SongsTab, dataKey: 'songs' },
  { title: 'Releases', icon: '/icon/icon-stream/release.svg', component: ReleasesTab, dataKey: 'releases' },
  { title: 'Shazams', icon: '/icon/icon-stream/release.svg', component: ShazamsTab, dataKey: null },
  { title: 'Einnahmen', icon: '/icon/icon-stream/einnahmen.svg', component: EinnahmenTab, dataKey: null },
  { title: 'Stores', icon: '/icon/icon-stream/stores.svg', component: StoresTab, dataKey: 'stores' },
];

const activeTab = ref(0);
const isSwitchActive = ref(false);
const allData = ref({});
const currentTabRef = ref(null);
let fetchTimeout = null;

// ========== الفلاتر ==========
const currentFilters = reactive({
  dateType: 'last_28_days',
  startDate: null,
  endDate: null,
  songUuid: [],
  isrc: [],
  releaseUuid: [],
  gtin: [],
  artist: [],
  feature: [],
  contributer: [],
  producer: [],
  cLine: [],
  store: [],
  country: []
});

// ========== Computed ==========
const tabs = computed(() => tabsConfig);

const currentFiltersForChild = computed(() => {
  return {
    dateType: currentFilters.dateType,
    startDate: currentFilters.startDate,
    endDate: currentFilters.endDate,
    songUuid: currentFilters.songUuid,
    isrc: currentFilters.isrc,
    releaseUuid: currentFilters.releaseUuid,
    gtin: currentFilters.gtin,
    artist: currentFilters.artist,
    feature: currentFilters.feature,
    contributer: currentFilters.contributer,
    producer: currentFilters.producer,
    cLine: currentFilters.cLine,
    store: currentFilters.store,
    country: currentFilters.country
  };
});

// ========== دوال البيانات ==========
const getTabData = (tabIndex) => {
  const tab = tabsConfig[tabIndex];
  if (!tab.dataKey || !allData.value) return [];
  return allData.value[tab.dataKey] || [];
};

// ========== Build API Params ==========
const buildApiParams = () => {
  const params = new URLSearchParams();
  
  // Date filters
  if (currentFilters.dateType) {
    if (currentFilters.dateType === 'last_7_days') {
      params.append('date-type', 'last_7_days');
    } else if (currentFilters.dateType === 'last_14_days') {
      params.append('date-type', 'last_14_days');
    } else if (currentFilters.dateType === 'last_28_days') {
      params.append('date-type', 'last_28_days');
    } else if (currentFilters.dateType === 'last_90_days') {
      params.append('date-type', 'last_90_days');
    } else if (currentFilters.dateType === 'this_month') {
      params.append('date-type', 'this_month');
    } else if (currentFilters.dateType === 'last_month') {
      params.append('date-type', 'last_month');
    } else if (currentFilters.dateType === 'last_year') {
      params.append('date-type', 'last_year');
    } else if (currentFilters.dateType === 'custom' && currentFilters.startDate && currentFilters.endDate) {
      params.append('start_date', currentFilters.startDate);
      params.append('end_date', currentFilters.endDate);
    } else {
      params.append('date-type', currentFilters.dateType);
    }
  }
  
  if (currentFilters.startDate && currentFilters.dateType !== 'custom') {
    params.append('start_date', currentFilters.startDate);
  }
  if (currentFilters.endDate && currentFilters.dateType !== 'custom') {
    params.append('end_date', currentFilters.endDate);
  }
  
  // Array filters
  const arrayFields = ['songUuid', 'isrc', 'releaseUuid', 'gtin', 'artist', 'feature', 'contributer', 'producer', 'cLine', 'store', 'country'];
  const apiNames = ['song_uuid', 'isrc', 'release_uuid', 'gtin', 'artist', 'feature', 'contributer', 'producer', 'c-line', 'store', 'country'];
  
  arrayFields.forEach((field, idx) => {
    if (currentFilters[field]?.length) {
      currentFilters[field].forEach(item => params.append(`${apiNames[idx]}[]`, item));
    }
  });
  
  return params;
};

// ========== جلب البيانات ==========
const fetchTopData = async () => {
  try {
    const params = buildApiParams();
    console.log('🎵 Fetching top data with params:', params.toString());
    
    const response = await apiRequest.get(`/top-10?${params.toString()}`);
    const data = response.data?.data || response.data;
    
    if (data) {
      allData.value = data;
      console.log('✅ All data loaded:', Object.keys(data));
      console.log('📊 Songs count:', data.songs?.length || 0);
      console.log('📊 Releases count:', data.releases?.length || 0);
    } else {
      console.warn('⚠️ No data received');
      allData.value = {};
    }
  } catch (error) {
    console.error('❌ Error fetching top data:', error);
    allData.value = {};
  }
};

const debouncedFetch = () => {
  if (fetchTimeout) clearTimeout(fetchTimeout);
  fetchTimeout = setTimeout(() => {
    fetchTopData();
  }, 500);
};

// ========== دورة الحياة ==========
onMounted(() => {
  fetchTopData();
});

onUnmounted(() => {
  if (fetchTimeout) clearTimeout(fetchTimeout);
});

// ========== دوال الأحداث ==========
const setActiveTab = (index) => {
  activeTab.value = index;
};

const toggleSwitch = () => {
  isSwitchActive.value = !isSwitchActive.value;
};

const handleFiltersChanged = (filters) => {
  console.log('📥 Received filters from TopRow:', filters);
  
  if (filters.dateType) {
    currentFilters.dateType = filters.dateType;
    sessionStorage.setItem('audience_date_type', filters.dateType);

    // التواريخ تخصّ custom وحده. بدون تفريغها يبقى مدى مخصّص سابق
    // عالقاً بعد اختيار preset فيُرسَل معه (date-type=last_28_days&start_date=…).
    if (filters.dateType !== 'custom') {
      currentFilters.startDate = null;
      currentFilters.endDate = null;
    }
  }
  
  if (filters.startDate) currentFilters.startDate = filters.startDate;
  if (filters.endDate) currentFilters.endDate = filters.endDate;
  
  if (filters.song) currentFilters.songUuid = filters.song;
  if (filters.release) currentFilters.releaseUuid = filters.release;
  if (filters.artist) currentFilters.artist = filters.artist;
  if (filters.store) currentFilters.store = filters.store;
  if (filters.isrc) currentFilters.isrc = filters.isrc;
  if (filters.gtin) currentFilters.gtin = filters.gtin;
  if (filters.feature) currentFilters.feature = filters.feature;
  if (filters.country) currentFilters.country = filters.country;
  if (filters.contributer) currentFilters.contributer = filters.contributer;
  if (filters.producer) currentFilters.producer = filters.producer;
  if (filters.cLine) currentFilters.cLine = filters.cLine;
  
  // جلب البيانات الجديدة بعد تغيير الفلاتر
  debouncedFetch();
  
  console.log('📊 Updated currentFilters:', currentFilters);
};
</script>

<style lang="scss" scoped>
main {
  display: flex;
  justify-content: center;
  height: calc(100vh - 71px - 50px);
  position: relative;
  overflow: auto;
}

.main {
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: flex-start;
  gap: 20px;
  height: 100%;
  min-height: 0;
  // overflow: hidden;
}
.row2 {
  display: flex;
  align-items: flex-start;
  align-self: stretch;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  isolation: isolate; /* إنشاء سياق تراص جديد */
  min-height: 488px;
}

.component-wrapper {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  position: relative;
  z-index: 1;
  isolation: isolate;
}

/* جعل ColumnTabs يظهر فوق كل شيء */
.column2 {
  position: relative;
  z-index: 20 !important;
}
</style>