<template>
  <main>
    <div class="main">
      <TopRow 
        @filters-changed="handleFiltersChanged"
      />
      
      <template v-if="isSwitchActive">
        <PublikumView />
      </template>

      <template v-else>
        <div class="row2">
          <component 
            :is="tabs[activeTab].component" 
            :data="getTabData(activeTab)"
            :filters="currentFilters"
          />
          <ColumnTabs :tabs="tabs" :activeTab="activeTab" @set-active-tab="setActiveTab" />
        </div>
        <SecondarySection 
          :allData="allData"
          :filters="currentFilters"
        />
      </template>
    </div>
  </main>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import TopRow from '@/components/Finanzen/content/TopRow.vue';
import ColumnTabs from '@/components/Finanzen/content/ColumnTabs.vue';
import RechnungenTab from '@/components/Finanzen/tabs/RechnungenTab.vue';
import DetailsTab from '@/components/Finanzen/tabs/DetailsTab.vue';
import BerichtesTab from '@/components/Finanzen/tabs/BerichtesTab.vue';
import GutschriftenTab from '@/components/Finanzen/tabs/GutschriftenTab.vue';
import EinnahmenTab from '@/components/Finanzen/tabs/EinnahmenTab.vue';
import AdressenTab from '@/components/Finanzen/tabs/AdressenTab.vue';
import SecondarySection from '@/components/Finanzen/Secondary-section/SecondarySection.vue';
import PublikumView from '@/views/PublikumView.vue';
import apiRequest from '@/lib/apiRequest';

// ========== تعريف التابات ==========
const tabsConfig = [
  { title: 'Einnahmen', icon: '/icon/icon-stream/einnahmen.svg', component: EinnahmenTab, dataKey: null },
  { title: 'Details', icon: '/icon/icon-Finanzen/details.svg', component: DetailsTab, dataKey: null },
  { title: 'Berichte', icon: '/icon/icon-Finanzen/Berichte.svg', component: BerichtesTab, dataKey: null },
  { title: 'Gutschriften', icon: '/icon/icon-Finanzen/Gutschriften.svg', component: GutschriftenTab, dataKey: null },
  { title: 'Rechnungen', icon: '/icon/icon-Finanzen/Rechnungen.svg', component: RechnungenTab, dataKey: null },
  { title: 'Adressen', icon: '/icon/icon-Finanzen/Re-Adresse.svg', component: AdressenTab, dataKey: null },
];

const activeTab = ref(0);
const isSwitchActive = ref(false);
const allData = ref({});
const isLoading = ref(false);
let fetchTimeout = null;

// ========== الفلاتر ==========
const currentFilters = reactive({
  dateType: 'last_year',
  startDate: null,
  endDate: null
});

// ========== Computed ==========
const tabs = computed(() => tabsConfig);

const getTabData = (tabIndex) => {
  const tab = tabsConfig[tabIndex];
  if (!tab.dataKey || !allData.value) return [];
  return allData.value[tab.dataKey] || [];
};

// ========== Build API Params ==========
const buildApiParams = () => {
  const params = new URLSearchParams();
  
  console.log('🔨 Building API params with filters:', currentFilters);
  
  // إضافة date-type
  if (currentFilters.dateType) {
    params.append('date-type', currentFilters.dateType);
  }
  
  // إضافة start_date و end_date إذا كان الفلتر custom
  if (currentFilters.dateType === 'custom') {
    if (currentFilters.startDate) {
      params.append('start_date', currentFilters.startDate);
    }
    if (currentFilters.endDate) {
      params.append('end_date', currentFilters.endDate);
    }
  }
  
  console.log('📊 Final API params:', params.toString());
  return params;
};

// ========== جلب البيانات ==========
const fetchRoyaltiesData = async () => {
  isLoading.value = true;
  try {
    const params = buildApiParams();
    console.log('💰 Fetching royalties data with params:', params.toString());
    
    const response = await apiRequest.get(`/royalties/top-ten?${params.toString()}`);
    const data = response.data?.data || response.data;
    
    if (data) {
      allData.value = data;
      console.log('✅ Royalties data loaded:', Object.keys(data));
    } else {
      console.warn('⚠️ No royalties data received');
      allData.value = {};
    }
  } catch (error) {
    console.error('❌ Error fetching royalties data:', error);
    allData.value = {};
  } finally {
    isLoading.value = false;
  }
};

// ========== Debounce ==========
const debouncedFetch = () => {
  if (fetchTimeout) {
    clearTimeout(fetchTimeout);
    fetchTimeout = null;
  }
  fetchTimeout = setTimeout(() => {
    fetchRoyaltiesData();
  }, 300);
};

// ========== دوال الأحداث ==========
const handleFiltersChanged = (filters) => {
  console.log('📥 Received filters from TopRow:', filters);
  
  if (filters) {
    if (filters.dateType) {
      currentFilters.dateType = filters.dateType;
      console.log('📅 Date type updated to:', currentFilters.dateType);
    }
    
    if (filters.startDate) {
      currentFilters.startDate = filters.startDate;
      console.log('📅 Start date updated to:', currentFilters.startDate);
    }
    
    if (filters.endDate) {
      currentFilters.endDate = filters.endDate;
      console.log('📅 End date updated to:', currentFilters.endDate);
    }
    
    // جلب البيانات الجديدة
    console.log('🔄 Fetching new data with updated filters...');
    debouncedFetch();
  }
};

const setActiveTab = (index) => {
  activeTab.value = index;
};

const toggleSwitch = () => {
  isSwitchActive.value = !isSwitchActive.value;
};

// ========== دورة الحياة ==========
onMounted(() => {
  console.log('🚀 Finanzen component mounted');
  fetchRoyaltiesData();
});

onUnmounted(() => {
  if (fetchTimeout) {
    clearTimeout(fetchTimeout);
    fetchTimeout = null;
  }
});
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
  min-height: 484px;
  overflow: hidden;
  // gap: 20px;
}

.row2 > * {
  min-height: 0;
  // overflow: hidden;
}
</style>