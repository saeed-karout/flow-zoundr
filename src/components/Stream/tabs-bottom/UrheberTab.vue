<template>
  <div class="tab-content">
    <div class="section">
      <div class="p">Deine Top Urheber</div>
      <div class="top-song">
        <!-- Loading State -->
        <div v-if="isLoading" class="loading-state">
          <div class="spinner"></div>
        </div>
        
        <!-- Urheber List -->
        <div v-else class="urheber-container">
          <div class="music-title" v-for="(urheber, index) in data" :key="urheber.name || index">
            <div class="background-layer"></div>
            <div class="number-container">
              <div :class="index === 0 ? 'number-1' : 'number'">{{ index + 1 }}.</div>
            </div>
            <div 
              class="image-overlay" 
              :style="{ backgroundColor: getRandomColor(index) }" 
              :data-title-line1="getTitleLine1(urheber.name || '?')"
              :data-title-line2="getTitleLine2(urheber.name || '?')"
              :data-title-line3="getTitleLine3(urheber.name || '?')"
            ></div>
            <div class="info">
              <div class="title">
                <div class="sub-title">{{ urheber.name || 'Unknown Urheber' }}</div>
              </div>
              <div class="p">{{ formatNumber(urheber.streams) }} Streams</div>
            </div>
          </div>
        </div>
        
        <!-- Empty State -->
        <div v-if="!isLoading && (!data || data.length === 0)" class="empty-state">
          <div class="empty-message">Keine Urheber gefunden</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// ========== Props ==========
const props = defineProps({
  data: {
    type: Array,
    default: () => []
  },
  filters: {
    type: Object,
    default: () => ({})
  }
});

// ========== Reactive Data ==========
const isLoading = ref(false);

// Colors for urheber
const urheberColors = [
  '#CF7502', '#5ACD96', '#28A745', '#FFC107', '#6F42C1',
  '#FD7E14', '#20C997', '#DC3545', '#007BFF', '#6610F2',
  '#E83E8C', '#17A2B8', '#343A40', '#F8F9FA', '#6C757D'
];

// ========== Utility Functions ==========
const formatNumber = (num) => {
  if (!num && num !== 0) return '0';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const getRandomColor = (index) => {
  return urheberColors[index % urheberColors.length];
};

// Get first two characters
const getTitleLine1 = (title) => {
  if (!title || title === '?') return '??';
  const cleanTitle = title.replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '');
  if (cleanTitle.length === 0) return '??';
  if (cleanTitle.length === 1) return cleanTitle.charAt(0).toUpperCase() + '?';
  return cleanTitle.substring(0, 2).toUpperCase();
};

// Get second two characters (characters 3-4)
const getTitleLine2 = (title) => {
  if (!title || title === '?') return '??';
  const cleanTitle = title.replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '');
  if (cleanTitle.length <= 2) return '';
  if (cleanTitle.length === 3) return cleanTitle.charAt(2).toUpperCase();
  return cleanTitle.substring(2, 4).toUpperCase();
};

// Get third two characters (characters 5-6) - optional
const getTitleLine3 = (title) => {
  if (!title || title === '?') return '??';
  const cleanTitle = title.replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '');
  if (cleanTitle.length <= 4) return '';
  if (cleanTitle.length === 5) return cleanTitle.charAt(4).toUpperCase();
  return cleanTitle.substring(4, 6).toUpperCase();
};
</script>

<style lang="scss" scoped>
.tab-content {
  display: flex;
  align-items: flex-start;
  align-self: stretch;
  border-radius: 20px;
  width: 100%;
  max-width: 100%;
  min-height: 281px;
}

.section {
  display: flex;
  padding: 20px;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 20px;
  flex: 1 0 0;
  border-radius: 20px;
  background: var(--Main-Colors-Slate, #26282D);
  position: relative;
  width: 100%;
  max-width: 100%;
}

.section .p {
  color: #FFF;
  font-family: Heebo;
  font-size: 18px;
  font-style: normal;
  font-weight: 700;
  line-height: 0.6;
  letter-spacing: 0.9px;
  text-transform: uppercase;
  padding-top: 3px;
}

.top-song {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  align-self: stretch;
  overflow-x: auto;
  // padding-right: 80px;
  scrollbar-width: none;
  border-radius: 20px;
  flex-wrap: nowrap;
  min-width: auto;
}

.urheber-container {
  display: flex;
  gap: 20px;
  flex-wrap: nowrap;
}

.top-song::-webkit-scrollbar {
  height: 8px;
}

.top-song::-webkit-scrollbar-track {
  background: #26282D;
}

.top-song::-webkit-scrollbar-thumb {
  background: #6A6C6D;
  border-radius: 4px;
}

.top-song::-webkit-scrollbar-thumb:hover {
  background: #D15;
}

.music-title {
  display: flex;
  width: 207px;
  height: 207px;
  justify-content: space-between;
  align-items: flex-end;
  border-radius: 20px;
  position: relative;
  cursor: pointer;
  isolation: isolate;
  flex-shrink: 0;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.5), transparent);
}

.background-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 20px;
  background: url('../../../assets/icons/dashboard/user/shadow.png') 50% / cover no-repeat;
  z-index: 2;
}

.image-overlay {
  display: flex;
  padding: 16px;
  flex-direction: column;
  justify-content: flex-end;
  align-items: flex-start;
  flex: 1 0 0;
  align-self: stretch;
  border-radius: 20px;
  position: relative;
  z-index: 1;
  isolation: isolate;
  overflow: hidden;
  filter: saturate(40%);
  transition: filter 0.6s ease;
}

.music-title:hover .image-overlay {
  filter: saturate(100%);
}

.image-overlay::before {
  content: attr(data-title-line1) "\A" attr(data-title-line2) "\A" attr(data-title-line3);
  white-space: pre;
  position: absolute;
  left: 12px;
  bottom: -170px;
  color: var(--Main-Colors-Slate-Dark, #1B1C20);
  font-family: Heebo;
  font-size: 160px;
  font-style: normal;
  font-weight: 900;
  line-height: 120px;
  text-transform: uppercase;
  opacity: 0.5;
  z-index: 0;
  pointer-events: none;
}

/* Hide empty lines */
.image-overlay[data-title-line2=""]::before {
  content: attr(data-title-line1);
}

.image-overlay[data-title-line3=""]::before {
  content: attr(data-title-line1) "\A" attr(data-title-line2);
}

.number-container {
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 5;
  isolation: isolate;
}

.number,
.number-1 {
  display: flex;
  width: 26px;
  padding: 8px 6px;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
  border-radius: 13px;
  color: var(--Main-Colors-White, #FFF);
  font-family: Heebo;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 0.6;
  transition: opacity 0.3s ease;
  z-index: 3;
  background: rgba(0, 0, 0, 0.7);
}

.number-1 {
  background: var(--Strawberry, #FF4D4F);
}

.number {
  background: var(--secondary, #6A6C6D);
}

.info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  align-self: stretch;
  position: absolute;
  bottom: 16px;
  left: 16px;
  z-index: 100;
  opacity: .7;
}

.info .title {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  align-self: stretch;
}

.title .sub-title {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  color: #FFF;
  text-overflow: ellipsis;
  font-family: Heebo;
  font-size: 18px;
  font-style: normal;
  font-weight: 700;
  line-height: 0.6;
  text-transform: uppercase;
  transition: opacity 0.3s ease;
  z-index: 150;
  opacity: .7;
}

.info .p {
  align-self: stretch;
  color: #FFF;
  font-family: Heebo;
  font-size: 14px;
  font-style: normal;
  font-weight: 300;
  line-height: 0.6;
  padding-top: 2px;
  transition: opacity 0.3s ease;
  z-index: 150;
}

.music-title:hover .sub-title,
.music-title:hover .info .p,
.music-title:hover .number,
.music-title:hover .number-1 {
  opacity: 1;
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 207px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(221, 17, 85, 0.1);
  border-top-color: #DD1155;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 207px;
}

.empty-message {
  color: #FFF;
  font-family: Heebo;
  font-size: 16px;
  font-weight: 300;
  opacity: 0.5;
  text-align: center;
}
</style>