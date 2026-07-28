<template>
  <div class="box-stream">
    <div class="p">Details</div>
    <div class="tables">
      <div class="Heads">
        <div class="p">Release</div>
        <div class="p">Artist</div>
        <div class="p">Streams</div>
        <div class="p">Downloads</div>
        <div class="p">Physisch</div>
        <div class="p">Einnahmen</div>
      </div>
      <div class="column" ref="scrollContainer" @scroll="handleScroll">
        <div v-if="isLoading && detailsData.length === 0" class="loading-state">
          <div class="spinner"></div>
        </div>
        <template v-else v-for="(item, index) in detailsData" :key="item.release_id || index">
          <div class="line">
            <div class="p">{{ item.release_name || '-' }}</div>
            <div class="p">{{ formatArtists(item.artists) }}</div>
            <div class="p">{{ formatNumber(item.streams) }}</div>
            <div class="p">{{ formatNumber(item.downloads) }}</div>
            <div class="p">{{ formatNumber(item.physical) }}</div>
            <div class="p">{{ formatCurrency(item.earnings) }}</div>
          </div>
          <div class="space" v-if="index < detailsData.length - 1"></div>
        </template>
        
        <!-- Loading more indicator -->
        <div v-if="isLoadingMore" class="loading-more">
          <div class="spinner-small"></div>
        </div>
        
        <div v-if="!isLoading && detailsData.length === 0" class="empty-state">
          <span>Keine Daten gefunden</span>
        </div>
      </div>
    </div>
    <div class="Fade" ></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import apiRequest from '@/lib/apiRequest';

// ========== Props ==========
const props = defineProps({
  filters: {
    type: Object,
    default: () => ({})
  }
});

// ========== Reactive Data ==========
const isLoading = ref(false);
const isLoadingMore = ref(false);
const detailsData = ref([]);
const currentPage = ref(1);
const perPage = ref(10);
const hasMoreData = ref(true);
const scrollContainer = ref(null);
let fetchTimeout = null;
let scrollTimeout = null;

// ========== Utility Functions ==========
const formatNumber = (num) => {
  if (!num && num !== 0) return '0';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '0,00 EUR';
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount).replace('€', 'EUR');
};

const formatArtists = (artists) => {
  if (!artists || artists.length === 0) return '-';
  if (artists.length === 1) return artists[0];
  if (artists.length === 2) return `${artists[0]}, ${artists[1]}`;
  return `${artists[0]}, ${artists[1]}, +${artists.length - 2}`;
};

// ========== Build API Params ==========
const buildApiParams = (page = 1) => {
  const params = new URLSearchParams();
  
  params.append('page', page);
  params.append('per_page', perPage.value);
  
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
const fetchDetailsData = async (page = 1, append = false) => {
  if (page === 1) {
    isLoading.value = true;
  } else {
    isLoadingMore.value = true;
  }
  
  try {
    const params = buildApiParams(page);
    console.log(`📋 Fetching details page ${page} with params:`, params.toString());
    
    const response = await apiRequest.get(`/royalties/details?${params.toString()}`);
    const data = response.data?.data || response.data;
    
    if (data && data.data) {
      const newData = data.data;
      
      if (append) {
        detailsData.value = [...detailsData.value, ...newData];
      } else {
        detailsData.value = newData;
      }
      
      if (data.meta) {
        const lastPage = data.meta.last_page || 1;
        hasMoreData.value = page < lastPage;
        console.log(`📄 Page ${page}/${lastPage}, hasMore: ${hasMoreData.value}`);
      }
      
      console.log(`✅ Loaded ${newData.length} items, total: ${detailsData.value.length}`);
    } else if (Array.isArray(data)) {
      if (append) {
        detailsData.value = [...detailsData.value, ...data];
      } else {
        detailsData.value = data;
      }
      hasMoreData.value = data.length >= perPage.value;
    } else {
      console.warn('⚠️ Unexpected data format:', data);
      if (!append) detailsData.value = [];
      hasMoreData.value = false;
    }
    
    await nextTick();
  } catch (error) {
    console.error('❌ Error fetching details data:', error);
    if (!append) detailsData.value = [];
    hasMoreData.value = false;
  } finally {
    if (page === 1) {
      isLoading.value = false;
    } else {
      isLoadingMore.value = false;
    }
  }
};

// ========== Handle Scroll ==========
const handleScroll = () => {
  if (scrollTimeout) return;
  
  scrollTimeout = setTimeout(() => {
    const container = scrollContainer.value;
    if (!container) {
      scrollTimeout = null;
      return;
    }
    
    const scrollTop = container.scrollTop;
    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;
    const threshold = 50;
    
    if (scrollHeight - scrollTop - clientHeight < threshold) {
      if (hasMoreData.value && !isLoadingMore.value && !isLoading.value) {
        currentPage.value++;
        fetchDetailsData(currentPage.value, true);
      }
    }
    
    scrollTimeout = null;
  }, 150);
};

// ========== Reset Data ==========
const resetData = () => {
  detailsData.value = [];
  currentPage.value = 1;
  hasMoreData.value = true;
  isLoadingMore.value = false;
  fetchDetailsData(1, false);
};

// ========== Watch for Filters ==========
watch(
  () => props.filters,
  () => {
    resetData();
  },
  { deep: true }
);

// ========== Lifecycle ==========
onMounted(() => {
  fetchDetailsData(1, false);
});

onUnmounted(() => {
  if (fetchTimeout) {
    clearTimeout(fetchTimeout);
    fetchTimeout = null;
  }
  if (scrollTimeout) {
    clearTimeout(scrollTimeout);
    scrollTimeout = null;
  }
});
</script>

<style lang="scss" scoped>
.box-stream {
  display: flex;
  height: 100%;
  padding: 20px 30px;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 32px;
  flex: 1 0 0;
  border-radius: 20px;
  background: var(--secondary, #26282d);
  position: relative;
  overflow: hidden;
  
}

.box-stream .p {
  color: #fff;
  font-family: Heebo;
  font-size: 18px;
  font-style: normal;
  font-weight: 700;
  line-height: 0.8;
  letter-spacing: 0.9px;
  text-transform: uppercase;
  align-self: stretch;
  flex-shrink: 0;
  z-index: 2;
}

.tables {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0;
  flex: 1 0 0;
  align-self: stretch;
  padding-top: 3px;
  min-height: 0;
  overflow: hidden;
  
}

.tables .Heads {
  display: flex;
  padding-bottom: 16px;
  align-items: flex-start;
  gap: 20px;
  align-self: stretch;
  background: linear-gradient(
    180deg,
    var(--Main-Colors-Slate, #26282d) 50%,
    rgba(38, 40, 45, 0) 100%
  );
  flex-shrink: 0;
  z-index: 2;
  position: sticky;
  top: 0;
}

.tables .Heads .p {
  color: #fff;
  text-align: right;
  font-family: Heebo;
  font-size: 14px;
  font-style: normal;
  font-weight: 300;
  line-height: 0.7;
  letter-spacing: 0.7px;
  width: 140px;
  opacity: 0.7;
}

.tables .Heads .p:nth-child(1) {
  text-align: left;
  flex: 1 0 0;
}

.tables .Heads .p:nth-child(2) {
  flex: 1 0 0;
  text-align: left;
}

.tables .Heads .p:nth-child(6) {
  text-align: right;
}

.tables .column {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0;
  flex: 1 0 0;
  align-self: stretch;
  gap: 20px;
  padding-top: 14px;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
  scrollbar-color: var(--Strawberry) transparent;
  position: relative;
  padding-bottom: 30px;
  scrollbar-width: none;

}

.tables .column::-webkit-scrollbar {
  width: 4px;
}

.tables .column::-webkit-scrollbar-track {
  background: transparent;
}

.tables .column::-webkit-scrollbar-thumb {
  background: var(--Strawberry, #D15);
  border-radius: 2px;
}

.line {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 20px;
  align-self: stretch;
  flex-shrink: 0;
}

.line:nth-child(1) {
  padding-top: 0;
}

.line .p {
  color: #fff;
  font-family: Heebo;
  text-align: right;
  font-size: 18px;
  font-style: normal;
  font-weight: 300;
  line-height: 0.9;
  letter-spacing: 0.9px;
  opacity: 0.7;
  width: 140px;
}

.line .p:nth-child(1) {
  text-align: left;
  flex: 1 0 0;
  font-weight: 700;
}

.line .p:nth-child(2) {
  flex: 1 0 0;
  text-align: left;
  font-weight: 700;
}

.line .p:nth-child(6) {
  opacity: 1;
  font-weight: 700;
  text-align: right;
  text-transform: none;
}

.space {
  width: 100%;
  height: 1px;
  background: var(--primary, #ffffff);
  opacity: 1;
  padding: .5px 0 0 0;
  flex-shrink: 0;
}

.Fade {
  width: 100%;
  height: 64px;
  position: absolute;
  bottom: 0;
  left: 0;
  background: linear-gradient(0deg, var(--secondary, #26282d) 30%, rgba(38, 40, 45, 0) 100%);
  z-index: 1;
  border-radius: 0 0 20px 20px;
  pointer-events: none;
  transition: opacity 0.3s ease;
  opacity: 1;
  z-index:5;
}



.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 40px 0;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(221, 17, 85, 0.1);
  border-top-color: #DD1155;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 16px 0;
}

.spinner-small {
  width: 24px;
  height: 24px;
  border: 2px solid rgba(221, 17, 85, 0.1);
  border-top-color: #DD1155;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 40px 0;
  color: #FFF;
  font-family: Heebo;
  font-size: 16px;
  font-weight: 300;
  opacity: 0.5;
}

@media (max-width:1599px) {

  .line .p{
    font-size: 14px;
    letter-spacing: .7px;
    width: 100px;
  }

  .tables .Heads .p{
    width: 100px;
    font-size: 14px;
    letter-spacing: .7px;
  }

  .tables .Heads .p:nth-child(1),.line .p:nth-child(1) {
    text-align: left;
    min-width: 150px;
  }

  .tables .Heads .p:nth-child(2),.line .p:nth-child(2){
    flex: 1 1 0;
    width: auto;
  }

  .tables .Heads .p:nth-child(6),.line .p:nth-child(6){
    width: 120px;
  }
}

@media (min-width:1600px) {
  .tables .Heads .p:nth-child(1),.line .p:nth-child(1) {
    text-align: left;
  }

  .line .p{
    font-size: 18px;
    letter-spacing: .7px;
    width: 140px;
  }

  .tables .Heads .p{
    width: 140px;
    font-size: 14px;
    letter-spacing: .9px;
  }
}
</style>