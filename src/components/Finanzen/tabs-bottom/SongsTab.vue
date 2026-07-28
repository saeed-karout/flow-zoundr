<template>
  <div class="tab-content">
    <div class="section">
      <div class="p">Deine Top Songs </div>
      <div class="top-song">
        <!-- Loading State -->
        <div v-if="isLoading" class="loading-state">
          <div class="spinner"></div>
        </div>
        
        <!-- Songs List -->
        <div v-else class="songs-container">
          <div class="music-title" v-for="(song, index) in data" :key="song.uuid || index">
            <div 
              class="background-layer" 
              :style="{ 
                backgroundImage: `url(${song.picture || defaultImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }"
            ></div>
            <div class="image-overlay">
              <div class="number-container">
                <div :class="index === 0 ? 'number-1' : 'number'">{{ index + 1 }}.</div>
              </div>
              <div class="info">
                <div class="title">
                  <div class="sub-title">Artist Music</div>
                  <div class="span">{{ song.name || 'Untitled' }}</div>
                </div>
                 <div class="numbers">
                  <div class="p">{{ formatCurrency(song.revenue) }}</div>
                  <div class="p">{{ getPercentage(song.revenue) }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Empty State -->
        <div v-if="!isLoading && (!data || data.length === 0)" class="empty-state">
          <div class="empty-message">Keine Songs gefunden</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
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

// صورة افتراضية
const defaultImage = '/img/bgCardSongs/card1.png';
// ========== Computed ==========
const totalRevenue = computed(() => {
  return props.data.reduce((sum, item) => sum + (item.revenue || 0), 0);
});
// ========== Utility Functions ==========
const formatCurrency = (num) => {
  if (!num && num !== 0) return '€0.00';
  return new Intl.NumberFormat('de-DE', { 
    style: 'currency', 
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
};

const getPercentage = (revenue) => {
  if (!revenue || totalRevenue.value === 0) return '0%';
  const percentage = (revenue / totalRevenue.value) * 100;
  return percentage.toFixed(2) + '%';
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
  height: 100%;
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
  height: 100%;
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
  flex-shrink: 0;
}
.numbers {
  display: flex;
  justify-content: space-between;
  align-items: center;
  align-self: stretch;
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
  flex: 1;
  min-height: 0;
}

.songs-container {
  display: flex;
  gap: 20px;
  flex-wrap: nowrap;
  height: 100%;
}

.music-title {
  display: flex;
  width: 207px;
  min-width: 207px;
  height: 100%;
  min-height: 207px;
  justify-content: space-between;
  align-items: flex-end;
  border-radius: 20px;
  position: relative;
  cursor: pointer;
  isolation: isolate;
  flex-shrink: 0;
}

.background-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 20px;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  filter: saturate(var(--saturation, 20%));
  transition: filter 0.6s ease;
  z-index: 1;
}

.music-title:hover .background-layer {
  filter: saturate(70%);
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
  background: url('../../../assets/icons/dashboard/user/shadow.png') 50% / cover no-repeat;
  position: relative;
  z-index: 2;
  isolation: isolate;
}

.number-container {
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 3;
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
  background: var(--Strawberry);
}

.number {
  background: var(--secondary);
}

.info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  align-self: stretch;
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
  color: var(--Main-Colors-White, #FFF);
  text-overflow: ellipsis;
  font-family: Heebo;
  font-size: 14px;
  font-style: normal;
  font-weight: 700;
  line-height: 0.6;
  text-transform: uppercase;
  opacity: 0.3;
  transition: opacity 0.3s ease;
}

.title .span {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  align-self: stretch;
  color: var(--Main-Colors-White, #FFF);
  text-overflow: ellipsis;
  font-family: Heebo;
  font-size: 18px;
  font-style: normal;
  font-weight: 700;
  line-height: 0.6;
  text-transform: uppercase;
  opacity: 0.7;
  padding-top: 2px;
  padding-bottom: 0.8px;
  transition: opacity 0.3s ease;
}

.info .p {
  align-self: stretch;
  color: var(--Main-Colors-White, #FFF);
  font-family: Heebo;
  font-size: 14px;
  font-style: normal;
  font-weight: 300;
  line-height: 0.6;
  opacity: 0.7;
  padding-top: 2px;
  transition: opacity 0.3s ease;
}

.music-title:hover .sub-title,
.music-title:hover .span,
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