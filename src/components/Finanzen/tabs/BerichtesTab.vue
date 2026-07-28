<template>
  <div class="box-stream">
    <div class="p">Berichte</div>
    <div class="tables">
      <div class="column" ref="scrollContainer" @scroll="handleScroll">
        <div v-if="isLoading && reportsData.length === 0" class="loading-state">
          <div class="spinner"></div>
        </div>
        <template v-else v-for="(item, index) in reportsData" :key="item.release_id || index">
          <div class="lines">
            <div class="info-line">
              <div class="info">
                <div class="p">{{ item.release_name || '-' }}</div>
                <div class="p">{{ formatArtists(item.artists) }}</div>
              </div>
              <div class="button-primary" @click="downloadReport(item.downloads?.csv, 'csv')">Download CSV</div>
              <div class="button-primary" @click="downloadReport(item.downloads?.pdf, 'pdf')">Download PDF</div>
            </div>
          </div>
          <!-- <div class="space" v-if="index < reportsData.length - 1"></div> -->
        </template>
        
        <!-- Loading more indicator -->
        <div v-if="isLoadingMore" class="loading-more">
          <div class="spinner-small"></div>
        </div>
        
        <div v-if="!isLoading && reportsData.length === 0" class="empty-state">
          <span>Keine Berichte gefunden</span>
        </div>
      </div>
    </div>
    <div class="Fade" :class="{ hidden: reportsData.length === 0 }"></div>
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
const reportsData = ref([]);
const currentPage = ref(1);
const perPage = ref(10);
const hasMoreData = ref(true);
const scrollContainer = ref(null);
const downloading = ref(false);
let fetchTimeout = null;
let scrollTimeout = null;

// ========== Utility Functions ==========
const formatArtists = (artists) => {
  if (!artists || artists.length === 0) return '-';
  if (artists.length === 1) return artists[0];
  if (artists.length === 2) return `${artists[0]}, ${artists[1]}`;
  return `${artists[0]}, ${artists[1]}, +${artists.length - 2}`;
};

const downloadReport = async (url, format) => {
  if (!url) {
    console.warn('⚠️ No download URL available');
    return;
  }
  
  if (downloading.value) {
    console.warn('⚠️ Download already in progress');
    return;
  }
  
  downloading.value = true;
  
  try {
    console.log(`📥 Downloading ${format.toUpperCase()} report from:`, url);
    
    // إرسال الطلب مع الـ token و responseType: 'blob'
    const response = await apiRequest.get(url, {
      responseType: 'blob'
    });
    
    // التحقق من نوع المحتوى
    const contentType = response.headers['content-type'] || '';
    const isJson = contentType.includes('application/json');
    
    if (isJson) {
      // إذا كان الجواب JSON، قد يكون هناك خطأ
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
    
    // إنشاء رابط تحميل
    const blob = new Blob([response.data], { 
      type: contentType || (format === 'csv' ? 'text/csv' : 'application/pdf')
    });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    
    // استخراج اسم الملف من الرابط أو استخدام اسم افتراضي
    const urlParts = url.split('/');
    const fileName = urlParts[urlParts.length - 1]?.split('?')[0] || `report.${format}`;
    link.download = fileName.includes('.') ? fileName : `report.${format}`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // تنظيف الـ URL بعد التحميل
    setTimeout(() => {
      URL.revokeObjectURL(link.href);
    }, 100);
    
    console.log(`✅ ${format.toUpperCase()} report downloaded successfully`);
  } catch (error) {
    console.error(`❌ Error downloading ${format.toUpperCase()} report:`, error);
    
    // محاولة قراءة رسالة الخطأ
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
  }
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
const fetchReportsData = async (page = 1, append = false) => {
  if (page === 1) {
    isLoading.value = true;
  } else {
    isLoadingMore.value = true;
  }
  
  try {
    const params = buildApiParams(page);
    console.log(`📋 Fetching reports page ${page} with params:`, params.toString());
    
    const response = await apiRequest.get(`/royalties/reports?${params.toString()}`);
    const data = response.data?.data || response.data;
    
    if (data && data.data) {
      const newData = data.data;
      
      if (append) {
        reportsData.value = [...reportsData.value, ...newData];
      } else {
        reportsData.value = newData;
      }
      
      if (data.meta) {
        const lastPage = data.meta.last_page || 1;
        hasMoreData.value = page < lastPage;
        console.log(`📄 Page ${page}/${lastPage}, hasMore: ${hasMoreData.value}`);
      }
      
      console.log(`✅ Loaded ${newData.length} items, total: ${reportsData.value.length}`);
    } else if (Array.isArray(data)) {
      if (append) {
        reportsData.value = [...reportsData.value, ...data];
      } else {
        reportsData.value = data;
      }
      hasMoreData.value = data.length >= perPage.value;
    } else {
      console.warn('⚠️ Unexpected data format:', data);
      if (!append) reportsData.value = [];
      hasMoreData.value = false;
    }
    
    await nextTick();
  } catch (error) {
    console.error('❌ Error fetching reports data:', error);
    if (!append) reportsData.value = [];
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
        fetchReportsData(currentPage.value, true);
      }
    }
    
    scrollTimeout = null;
  }, 150);
};

// ========== Reset Data ==========
const resetData = () => {
  reportsData.value = [];
  currentPage.value = 1;
  hasMoreData.value = true;
  isLoadingMore.value = false;
  fetchReportsData(1, false);
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
  fetchReportsData(1, false);
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
  height: 100%;
  display: flex;
  padding: 20px 30px;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 32px;
  flex: 1 0 0;
  border-radius: 20px;
  background: var(--secondary, #26282D);
  position: relative;
  overflow: hidden;
}

.box-stream .p {
  color: #FFF;
  font-family: Heebo;
  font-size: 18px;
  font-style: normal;
  font-weight: 700;
  line-height: 0.8;
  letter-spacing: 0.9px;
  text-transform: uppercase;
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

.column {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  flex: 1 0 0;
  align-self: stretch;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
  scrollbar-color: var(--Strawberry) transparent;
  min-height: 200px;
  padding-bottom: 30px;
  scrollbar-width: none;
}

.column::-webkit-scrollbar {
  width: 4px;
}

.column::-webkit-scrollbar-track {
  background: transparent;
}

.column::-webkit-scrollbar-thumb {
  background: var(--Strawberry, #D15);
  border-radius: 2px;
}

.lines {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  align-self: stretch;
  flex-shrink: 0;
}

.info-line {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  align-self: stretch;
  width: 100%;
}

.info-line .info {
  display: flex;
  padding: 0px 8px;
  align-items: center;
  gap: 20px;
  flex: 1 0 0;
  align-self: stretch;
  background: var(--primary, #FFFFFF);
}

.info-line .info .p {
  flex: 1 0 0;
  color: var(--Main-Colors-White, #FFF);
  font-family: Heebo;
  font-size: 18px;
  font-style: normal;
  font-weight: 700;
  line-height: 1;
  letter-spacing: 0.9px;
  opacity: 0.7;
}

.button-primary {
  display: flex;
  padding: 12px 20px 13px 20px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  border-radius: 5px;
  background: var(--Main-Colors-Slate-Light, #3A3E42);
  color: #FFF;
  font-family: Heebo;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: 0.7;
  cursor: pointer;
  transition: background 0.3s ease;
  white-space: nowrap;
  flex-shrink: 0;
}

.button-primary:hover {
  background: var(--dark-red);
}

.button-primary:active {
  transform: scale(0.95);
}

.Fade {
  width: 100%;
  height: 64px;
  position: absolute;
  bottom: 0;
  left: 0;
  background: linear-gradient(0deg, var(--secondary) 30%, rgba(38, 40, 45, 0.00) 100%);
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

@media (max-width:1599px) {
  .info-line .info .p {
    font-size: 14px;
    letter-spacing: .7px;
  }

  .button-primary {
    font-size: 12px;
    padding: 10px 14px;
  }
}

@media (min-width:1600px) {
  .info-line .info .p {
    font-size: 18px;
    letter-spacing: .9px;
  }
}
</style>