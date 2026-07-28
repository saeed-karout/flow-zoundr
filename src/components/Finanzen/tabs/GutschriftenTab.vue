<template>
  <div class="box-stream">
    <div class="p">Gutschriften</div>
    <div class="tables">
      <div class="Heads">
        <div class="p">#</div>
        <div class="p">Datum</div>
        <div class="p">Betrag Netto</div>
        <div class="p">MwSt.</div>
        <div class="p">Betrag Brutto</div>
        <div class="p">Status</div>
        <div class="p">PDF</div>
      </div>
      <div class="column" ref="scrollContainer" @scroll="handleScroll">
        <div v-if="isLoading && creditsData.length === 0" class="loading-state">
          <div class="spinner"></div>
        </div>
        <template v-else v-for="(item, index) in creditsData" :key="item.id || index">
          <div class="line">
            <div class="p">{{ item.reference || item.id || '-' }}</div>
            <div class="p">{{ formatDate(item.date) }}</div>
            <div class="p">{{ formatCurrency(item.net_amount) }}</div>
            <div class="p">{{ formatCurrency(item.vat) }}</div>
            <div class="p">{{ formatCurrency(item.gross_amount) }}</div>
            <div class="p">
              <span v-if="item.status !== 'completed'">
                {{ item.status === 'pending' ? 'Offen' : item.status }}
              </span>
              <img v-else src="../../../assets/icons/y.png" class="icon" alt="Completed" />
            </div>
            <div class="download" @click="downloadCredit(item.id, item.reference)">
              {{ downloading && currentDownloadId === item.id ? 'Download' : 'Download' }}
            </div>
          </div>
          <div class="space" v-if="index < creditsData.length - 1"></div>
        </template>
        
        <!-- Loading more indicator -->
        <div v-if="isLoadingMore" class="loading-more">
          <div class="spinner-small"></div>
        </div>
        
        <div v-if="!isLoading && creditsData.length === 0" class="empty-state">
          <span>Keine Gutschriften gefunden</span>
        </div>
      </div>
    </div>
    <div class="Fade" :class="{ hidden: creditsData.length === 0 }"></div>
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
const creditsData = ref([]);
const currentPage = ref(1);
const perPage = ref(10);
const hasMoreData = ref(true);
const scrollContainer = ref(null);
const downloading = ref(false);
const currentDownloadId = ref(null);
let fetchTimeout = null;
let scrollTimeout = null;

// ========== Utility Functions ==========
const formatDate = (date) => {
  if (!date) return '-';
  try {
    const d = new Date(date);
    return d.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch {
    return date;
  }
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

// ========== تحميل ملف PDF ==========
const downloadCredit = async (creditId, reference) => {
  if (!creditId) {
    console.warn('⚠️ No credit ID available');
    return;
  }
  
  if (downloading.value) {
    console.warn('⚠️ Download already in progress');
    return;
  }
  
  downloading.value = true;
  currentDownloadId.value = creditId;
  
  try {
    console.log(`📥 Downloading credit ${reference} (ID: ${creditId})...`);
    
    // استخدام endpoint تحميل الـ PDF مع ID
    const response = await apiRequest.get(`/credits/${creditId}/download`, {
      responseType: 'blob'
    });
    
    const contentType = response.headers['content-type'] || '';
    const isJson = contentType.includes('application/json');
    
    if (isJson) {
      const text = await response.data.text();
      try {
        const errorData = JSON.parse(text);
        console.error('❌ Download error:', errorData);
        alert(`Fehler beim Herunterladen: ${errorData.message || 'Unbekannter Fehler'}`);
      } catch (e) {
        console.error('❌ Download error:', text);
        alert('Fehler beim Herunterladen der Datei');
      }
      return;
    }
    
    const blob = new Blob([response.data], { 
      type: contentType || 'application/pdf'
    });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Gutschrift_${reference || creditId}.pdf`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setTimeout(() => {
      URL.revokeObjectURL(link.href);
    }, 100);
    
    console.log(`✅ Credit ${reference} downloaded successfully`);
  } catch (error) {
    console.error(`❌ Error downloading credit ${reference}:`, error);
    
    if (error.response && error.response.data) {
      try {
        const errorData = await error.response.data.text();
        const parsedError = JSON.parse(errorData);
        alert(`Fehler beim Herunterladen: ${parsedError.message || 'Unbekannter Fehler'}`);
      } catch (e) {
        alert('Fehler beim Herunterladen der Datei. Bitte versuchen Sie es später erneut.');
      }
    } else {
      alert('Fehler beim Herunterladen der Datei. Bitte versuchen Sie es später erneut.');
    }
  } finally {
    downloading.value = false;
    currentDownloadId.value = null;
  }
};

// ========== Build API Params ==========
const buildApiParams = (page = 1) => {
  const params = new URLSearchParams();
  
  params.append('page', page);
  params.append('per_page', perPage.value);
  
  // إضافة فلتر الحالة إذا كان موجوداً
  if (props.filters?.status) {
    params.append('status', props.filters.status);
  }
  
  // إضافة فلتر التاريخ إذا كان موجوداً
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
const fetchCreditsData = async (page = 1, append = false) => {
  if (page === 1) {
    isLoading.value = true;
  } else {
    isLoadingMore.value = true;
  }
  
  try {
    const params = buildApiParams(page);
    console.log(`📋 Fetching credits page ${page} with params:`, params.toString());
    
    // استخدام endpoint /credits لجلب البيانات
    const response = await apiRequest.get(`/credits?${params.toString()}`);
    const data = response.data?.data || response.data;
    
    if (data && data.data) {
      const newData = data.data.map(item => ({
        ...item,
        id: item.id || item.uuid,
        // معالجة الحالة
        status: item.status || 'pending'
      }));
      
      if (append) {
        creditsData.value = [...creditsData.value, ...newData];
      } else {
        creditsData.value = newData;
      }
      
      if (data.meta) {
        const lastPage = data.meta.last_page || 1;
        hasMoreData.value = page < lastPage;
        console.log(`📄 Page ${page}/${lastPage}, hasMore: ${hasMoreData.value}`);
      }
      
      console.log(`✅ Loaded ${newData.length} items, total: ${creditsData.value.length}`);
    } else if (Array.isArray(data)) {
      const processedData = data.map(item => ({
        ...item,
        id: item.id || item.uuid,
        status: item.status || 'pending'
      }));
      
      if (append) {
        creditsData.value = [...creditsData.value, ...processedData];
      } else {
        creditsData.value = processedData;
      }
      hasMoreData.value = data.length >= perPage.value;
    } else {
      console.warn('⚠️ Unexpected data format:', data);
      if (!append) creditsData.value = [];
      hasMoreData.value = false;
    }
    
    await nextTick();
  } catch (error) {
    console.error('❌ Error fetching credits data:', error);
    if (!append) creditsData.value = [];
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
        fetchCreditsData(currentPage.value, true);
      }
    }
    
    scrollTimeout = null;
  }, 150);
};

// ========== Reset Data ==========
const resetData = () => {
  creditsData.value = [];
  currentPage.value = 1;
  hasMoreData.value = true;
  isLoadingMore.value = false;
  fetchCreditsData(1, false);
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
  fetchCreditsData(1, false);
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
  min-height: 0;
  overflow: hidden;
}

.tables .Heads {
  display: flex;
  padding-bottom: 16px;
  align-items: center;
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
  line-height: 1;
  letter-spacing: 0.7px;
  width: 140px;
  opacity: 0.7;
}

.tables .Heads .p:nth-child(1) {
  text-align: left;
  width: 120px;
}

.tables .Heads .p:nth-child(2) {
  flex: 1 0 0;
  text-align: left;
}

.tables .Heads .p:nth-child(6) {
  text-align: center;
}

.tables .Heads .p:nth-child(7) {
  width: 102px;
  text-align: right;
}

.tables .column {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0;
  flex: 1 0 0;
  align-self: stretch;
  padding-bottom: 30px;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
  scrollbar-color: var(--Strawberry) transparent;
  position: relative;
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

.line .p {
  color: #fff;
  font-family: Heebo;
  font-size: 18px;
  font-style: normal;
  font-weight: 300;
  line-height: 1;
  letter-spacing: 0.9px;
  opacity: 0.7;
  width: 140px;
  display: flex;
  align-items: center;
}

.line .p:nth-child(1) {
  text-align: left;
  width: 120px;
}

.line .p:nth-child(2) {
  flex: 1 0 0;
  text-align: left;
}

.line .p:nth-child(3),
.line .p:nth-child(4),
.line .p:nth-child(5) {
  text-align: right;
  justify-content: flex-end;
}

.line .p:nth-child(5) {
  opacity: 1;
  font-weight: 700;
}

.line .p:nth-child(6) {
  text-align: center;
  justify-content: center;
  text-transform: none;
}

.line .p .icon {
  width: 18px;
}

.line .download {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  border-radius: 12px;
  background: var(--Main-Colors-Slate-Light, #3a3e42);
  color: #fff;
  font-family: Heebo;
  font-size: 14px;
  font-style: normal;
  font-weight: 300;
  line-height: 1;
  width: 102px;
  padding: 4px 20px;
  text-align: right;
  cursor: pointer;
  transition: background 0.3s ease;
  height: 24px;
}

.line .download:hover {
  background: var(--dark-red, #a11212);
}

.line .download:active {
  transform: scale(0.95);
}

.line .download:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.space {
  width: 100%;
  height: 1px;
  background: var(--primary, #ffffff);
  opacity: 1;
  padding: .5px 0 0 0;
  margin: 15px 0;
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
}

.Fade.hidden {
  opacity: 0;
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

@media (min-width: 1440px) and (max-width: 1599px) {
  .tables .Heads .p, .line .p {
    width: 95px;
    font-size: 14px;
  }

  .line .p:nth-child(1),
  .tables .Heads .p:nth-child(1) {
    text-align: left;
    width: 75px;
  }

  .tables .Heads .p:nth-child(3),
  .line .p:nth-child(3),
  .tables .Heads .p:nth-child(5),
  .line .p:nth-child(5) {
    width: 120px;
  }

  .line .download,
  .tables .Heads .p:nth-child(7) {
    width: 90px;
    text-align: right;
  }
}
</style>