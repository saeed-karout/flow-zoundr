<template>
  <div class="tab-content">
    <div class="section">
      <div class="p">Deine Top Länder</div>
      <div class="top-song">
        <!-- Loading State -->
        <div v-if="isLoading" class="loading-state">
          <div class="spinner"></div>
        </div>
        
        <!-- Countries List -->
        <div v-else class="countries-container">
          <div class="music-title" v-for="(country, index) in data" :key="country.code || index">
            <div 
              class="background-layer" 
              :style="{ backgroundImage: `url(${getCountryFlag(country.code || '')})` }"
            ></div>
            <div class="number-container">
              <div :class="index === 0 ? 'number-1' : 'number'">{{ index + 1 }}.</div>
            </div>
            <div class="image-overlay"></div>
            <div class="info">
              <div class="title">
                <div class="span">{{ country.name || 'Unknown Country' }}</div>
              </div>
              <div class="p">{{ formatCurrency(country.revenue) }} Revenue</div>
            </div>
          </div>
        </div>
        
        <!-- Empty State -->
        <div v-if="!isLoading && (!data || data.length === 0)" class="empty-state">
          <div class="empty-message">Keine Länder gefunden</div>
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

const getCountryFlag = (countryCode) => {
  if (!countryCode) return '';
  // استخدام CDN للأعلام الدائرية
  return `https://cdn.jsdelivr.net/npm/flag-icons@7.0.0/flags/4x3/${countryCode.toLowerCase()}.svg`;
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
  height: 100%;
  min-height: 0;
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
  min-height: 0;
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
  z-index: 111;
  flex-shrink: 0;
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

.countries-container {
  display: flex;
  gap: 20px;
  flex-wrap: nowrap;
  height: 100%;
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
  filter: saturate(var(--saturation, 40%));
  transition: filter 0.6s ease;
  z-index: 1;
}

.music-title:hover .background-layer {
  filter: saturate(80%) brightness(1.1);
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
  width: auto;
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
  z-index: 150;
  opacity: 0.7;
  transition: opacity 0.3s ease;
}

.music-title:hover .info {
  opacity: 1;
}

.info .title {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  align-self: stretch;
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
  z-index: 150;
}

.info .p {
  align-self: stretch;
  color: var(--Main-Colors-White, #FFF);
  font-family: Heebo;
  font-size: 14px;
  font-style: normal;
  font-weight: 300;
  line-height: 0.6;
  padding-top: 2px;
  z-index: 150;
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

/* Responsive */
@media (min-width: 1440px) and (max-width: 1599px) {
  .music-title {
    width: 160px;
    min-width: 160px;
    height: 160px;
    min-height: 160px;
  }

  .title .span {
    font-size: 17px;
    line-height: .9;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .info .p {
    font-size: 12px;
  }
}
</style>