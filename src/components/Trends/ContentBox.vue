<template>
  <div class="Content-Box">
    <div class="map-container">
      <LeafletMap
        ref="mapRef"
        :center="mapCenter"
        :zoom="mapZoom"
        :countries-data="countriesDataForMap"
        @map-click="handleMapClick"
        @zoom-change="handleZoomChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import LeafletMap from '@/components/Trends/LeafletMap.vue';

const props = defineProps({
  // استقبال بيانات الدول من API
  countriesList: {
    type: Array,
    default: () => []
  }
});

const mapRef = ref(null);
const mapCenter = ref([30, 20]);
const mapZoom = ref(3);

// تحويل بيانات الدول إلى الشكل المطلوب للخريطة
const countriesDataForMap = computed(() => {
  if (!props.countriesList || props.countriesList.length === 0) {
    return {};
  }
  
  // حساب الحد الأقصى للعدد لتحديد شدة اللون
  const maxCount = Math.max(...props.countriesList.map(c => c.count), 1);
  
  // إنشاء كائن بمفاتيح هي أسماء الدول وقيمها هي العدد
  const data = {};
  props.countriesList.forEach(country => {
    // حساب شدة اللون (0-1) - كلما زاد العدد، اقترب من 1
    const intensity = country.count / maxCount;
    data[country.name] = {
      count: country.count,
      intensity: intensity
    };
  });
  
  return data;
});

const handleMapClick = (latlng) => {
  console.log('تم النقر على الخريطة:', latlng);
};

const handleZoomChange = (zoom) => {
  console.log('مستوى التكبير:', zoom);
};
</script>

<style lang="scss" scoped>
.Content-Box {
  display: flex;
  padding: 20px;
  gap: 20px;
  align-self: stretch;
  border-radius: 20px;
  background: var(--secondary);
  height: 100%;
  min-height: 500px;
}

.map-container {
  flex: 1;
  min-width: 0;
  height: 100%;
  border-radius: 20px;
  overflow: hidden;
}

@media (max-width: 1200px) {
  .Content-Box {
    min-height: 400px;
  }
  
  .map-container {
    height: 400px;
  }
}
</style>