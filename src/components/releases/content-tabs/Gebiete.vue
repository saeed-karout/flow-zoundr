<template>
  <div class="Content-Box">
    <div class="map-container">
      <LeafletMap
        ref="mapRef"
        :center="mapCenter"
        :zoom="mapZoom"
         :includedCountries="includedCountries"
  :excludedCountries="excludedCountries"
        @map-click="handleMapClick"
        @zoom-change="handleZoomChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import LeafletMap from '@/components/LeafletMap.vue';

const props = defineProps({
  release: {
    type: Object,
    default: () => ({})
  }
});

const mapRef = ref(null);
const mapCenter = ref([40, 20]);
const mapZoom = ref(3);


// خرائط رموز الدول إلى أسماء كاملة وإحداثيات تقريبية
const countryData = {
  'DE': { name: 'Deutschland', coords: [51.1657, 10.4515], flag: '🇩🇪' },
  'AT': { name: 'Österreich', coords: [47.5162, 14.5501], flag: '🇦🇹' },
  'CH': { name: 'Schweiz', coords: [46.8182, 8.2275], flag: '🇨🇭' },
  'US': { name: 'Vereinigte Staaten', coords: [37.0902, -95.7129], flag: '🇺🇸' },
  'GB': { name: 'Vereinigtes Königreich', coords: [55.3781, -3.4360], flag: '🇬🇧' },
  'FR': { name: 'Frankreich', coords: [46.6034, 1.8883], flag: '🇫🇷' },
  'ES': { name: 'Spanien', coords: [40.4637, -3.7492], flag: '🇪🇸' },
  'IT': { name: 'Italien', coords: [41.8719, 12.5674], flag: '🇮🇹' },
  'NL': { name: 'Niederlande', coords: [52.1326, 5.2913], flag: '🇳🇱' },
  'BE': { name: 'Belgien', coords: [50.5039, 4.4699], flag: '🇧🇪' },
  'SE': { name: 'Schweden', coords: [60.1282, 18.6435], flag: '🇸🇪' },
  // يمكن إضافة المزيد من الدول حسب الحاجة
};

// الحصول على قائمة الدول المدرجة
const includedCountries = computed(() => {
  return Array.isArray(props.release?.countries_included) ? props.release.countries_included : [];
});

// الحصول على قائمة الدول المستثناة
const excludedCountries = computed(() => {
  return Array.isArray(props.release?.countries_excluded) ? props.release.countries_excluded : [];
});

// إعداد علامات الخريطة
const mapMarkers = computed(() => {
  const markers = [];
  
  // إضافة علامات للدول المدرجة (باللون #1B1C20)
  includedCountries.value.forEach(code => {
    const country = countryData[code];
    if (country) {
      markers.push({
        position: country.coords,
        title: `${country.flag} ${country.name} - Veröffentlicht`,
        type: 'included',
        markerColor: '#1B1C20'
      });
    }
  });
  
  // إضافة علامات للدول المستثناة (باللون #6A6C6D)
  excludedCountries.value.forEach(code => {
    const country = countryData[code];
    if (country) {
      markers.push({
        position: country.coords,
        title: `${country.flag} ${country.name} - Ausgeschlossen`,
        type: 'excluded',
        markerColor: '#6A6C6D'
      });
    }
  });
  
  return markers;
});

// دوال الخريطة
const handleMapClick = (latlng) => {
  console.log('تم النقر على:', latlng);
};

const handleZoomChange = (zoom) => {
  console.log('التكبير:', zoom);
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

/* Responsive */
@media (max-width: 1200px) {
  .Content-Box {
    min-height: 400px;
  }
  
  .map-container {
    height: 400px;
  }
}
</style>