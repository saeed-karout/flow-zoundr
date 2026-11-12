<template>
  <!-- ✅ عرض Upload3Component فقط عندما يكون currentStep === 4 -->
  <div v-if="props.currentStep === 4" class="upload3-container">
    <!-- Loading state until initial check is done -->
    <div v-if="!isInitialized" class="upload3-loading"></div>
    
    <!-- ✅ عرض First Section (نوع الكواليتي) بدلاً من الكروت إذا لم توجد أغاني -->
    <div v-else-if="showFirstSection" class="first-section-content">
      <div class="first-section-message">
        <div class="first-section-icon">🎵</div>
        <h2 class="first-section-title">Keine Songs gefunden</h2>
        <p class="first-section-description">
          Bitte fügen Sie zuerst Songs hinzu, bevor Sie Stores auswählen.
        </p>
        <div class="first-section-actions">
          <button class="btn-primary" @click="goToAddSongs">
            Songs hinzufügen
          </button>
        </div>
      </div>
    </div>

    <!-- العرض الأساسي (كروت اختيار المتاجر) -->
    <div v-else-if="currentView === 'main'" class="content">
      <!-- كارد 1 -->
      <div class="option"  @mouseenter="showCardField(0)" @mouseleave="hideCardField(0)">
        <div class="card-songs" >
          <div class="topic">Alle Shops</div>
          <div class="logo" :class="{ 'shifted': cardFields[0].visible }"></div>
          <div class="image-overlay" :class="{ 'no-overlay': cardFields[0].visible }">
            <div class="Form">
              <div class="btn-primary1" @click="handleNext(0)">
                <div class="p">Wählen</div>
              </div>
            </div>
          </div>
        </div>
        <div class="description">
         Veröffentliche Deine Musik in allen wichtigen Shops weltweit. Durch unsere ca. 50 DSPs auf insgesamt 350 Plattformen
        </div>
      </div>

      <!-- كارد 2 -->
      <div class="option"  @mouseenter="showCardField(1)" @mouseleave="hideCardField(1)">
        <div class="card-songs2">
          <div class="topic">Ohne Socials</div>
          <div class="logo" :class="{ 'shifted': cardFields[1].visible }"></div>
          <div class="image-overlay" :class="{ 'no-overlay': cardFields[1].visible }">
            <div class="Form">
              <div class="btn-primary" @click="handleNext(1)">
                <div class="p">Wählen</div>
              </div>
            </div>
          </div>
        </div>
        <div class="description">
       Veröffentliche Deine Musik in allen Musikplattformen weltweit. Ausgeschlossen werden alle sozialen Netzwerke wie Instagram, TikTok, Youtube etc.
        </div>
      </div>

      <!-- كارد 3 -->
      <div class="option"  @mouseenter="showCardField(2)" @mouseleave="hideCardField(2)">
        <div class="card-songs3">
          <div class="topic">Individuell</div>
          <div class="logo" :class="{ 'shifted': cardFields[2].visible }"></div>
          <div class="image-overlay" :class="{ 'no-overlay': cardFields[2].visible }">
            <div class="Form">
              <div class="btn-primary" @click="handleNext(2)">
                <div class="p">Konfigurieren</div>
              </div>
            </div>
          </div>
        </div>
        <div class="description">
         Du suchst Dir aus allen Plattformen die Richtigen raus und veröffentlichst nur dort Deine Musik. 
        </div>
      </div>
    </div>

    <!-- ✅ عرض ShopsPage.vue داخل Upload3Component -->
    <div v-else-if="currentView === 'shopsPage'" class="shops-content" key="shops-page-content">
      <ShopsPage 
        ref="shopsPageRef"
        :selectedCardIndex="selectedCardIndex"
        :release-uuid="props.releaseUuid"
        :stores-list="storesList"
        @back="handleBack"
        @next="handleNextStep"
        @save-release="handleSaveRelease"
        @update:selected-stores="handleSelectedStoresUpdate"
        @openVideoPopup="openVideoPopup"
      />
    </div>
  </div>
  <!-- ✅ عرض فارغ إذا لم نكن في الخطوة 4 -->
  <div v-else class="upload3-empty"></div>

  <!-- ✅ نافذة الفيديو: لم تكن موجودة في فرع الخطوة 4 إطلاقاً (نافذة Parent.vue تخصّ
       شجرة الخطوتين 1 و 2)، فلم يكن لـ spacer في ShopsPage أي مكان يرسل إليه حدثه. -->
  <VideoPopup :show="showVideoPopup" :videoId="videoId" @close="closeVideoPopup" />
</template>

<script setup>
import { ref, reactive, defineProps, defineEmits, watch, onMounted, onBeforeUnmount, nextTick, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useReleaseStore } from '@/stores/release';
import ShopsPage from './ShopsPage.vue';
import VideoPopup from '../Upload1Components/VideoPopup.vue';
import apiRequest from '@/lib/apiRequest';

const props = defineProps({
  currentStep: { type: Number, required: true },
  steps: { type: Array, default: () => ['0', '1', '2', '3', '4'] },
  sectionTitle: { type: [String, Object], default: 'Summer Feeling – Metas' },
  activeTab: { type: String, default: 'infos' },
  releaseUuid: { type: String, required: true },
  selectedQuality: { type: String, default: null }
});

const emit = defineEmits(['next', 'update:currentView', 'back', 'update:topLineImage', 'save-release', 'go-to-add-songs']);

const route = useRoute();
const router = useRouter();

const currentView = ref('main');
const selectedCardIndex = ref(null);
const shopsPageRef = ref(null);
const isInitialized = ref(false);
const isMounted = ref(false);
const hasSongs = ref(false);
const isLoadingSongs = ref(false);

const cardFields = reactive({
  0: { visible: false },
  1: { visible: false },
  2: { visible: false },
});

// ========== حساب showFirstSection ==========
const showFirstSection = computed(() => {
  return isInitialized.value && 
         !hasSongs.value && 
         props.selectedQuality && 
         currentView.value === 'main';
});

// ========== قائمة المتاجر الاجتماعية ==========
const SOCIAL_STORES = [
  'META (Facebook, Instagram)',
  'TikTok / Resso',
  'TikTok PMVs (Video)',
  'YouTube (Content ID)',
  'YouTube Music',
  'FaceBook',
  'Instagram',
  'TikTok',
  'YouTube',
];

// ========== قائمة المتاجر ==========
const storesList = ref([]);

// ========== بيانات الـ Release ==========
const releaseData = ref({
  catalog_number: '',
  stores: [],
  countries_included: [],
  countries_excluded: []
});

// ========== دالة تحديث حالة ShopsComplete ==========
const updateShopsComplete = (value) => {
  try {
    const releaseStore = useReleaseStore();
    if (releaseStore && typeof releaseStore.setShopsComplete === 'function') {
      releaseStore.setShopsComplete(value);
      console.log(`✅ [Upload3Component] ShopsComplete set to: ${value}`);
    } else {
      // Fallback: استخدام localStorage
      localStorage.setItem('isShopsComplete', JSON.stringify(value));
      console.log(`✅ [Upload3Component] ShopsComplete saved to localStorage: ${value}`);
    }
  } catch (error) {
    console.warn('⚠️ [Upload3Component] Could not update ShopsComplete:', error);
  }
};

// ========== جلب الأغاني من الـ API ==========
const fetchSongs = async () => {
  if (!props.releaseUuid) return;
  
  isLoadingSongs.value = true;
  try {
    console.log('📡 جلب الأغاني للـ release:', props.releaseUuid);
    const response = await apiRequest.get(`/releases/${props.releaseUuid}/songs`);
    const data = response.data?.data || response.data || [];
    
    hasSongs.value = Array.isArray(data) && data.length > 0;
    console.log(`✅ ${hasSongs.value ? 'تم العثور على' : 'لا توجد'} أغاني (${data.length})`);
    
    return data;
  } catch (error) {
    console.error('❌ فشل جلب الأغاني:', error);
    hasSongs.value = false;
    return [];
  } finally {
    isLoadingSongs.value = false;
  }
};

// ========== جلب المتاجر من الـ API ==========
const fetchStores = async () => {
  try {
    console.log('📡 جلب قائمة المتاجر...');
    const response = await apiRequest.get('/stores');
    const data = response.data.data || response.data;
    
    if (Array.isArray(data)) {
      // ✅ نُبقي المتاجر النشطة فقط (is_active) — كي يتطابق ما يُرسَل ("اختر الكل")
      //    مع ما يُعرَض في ShopsPage. توافق رجعي مع status القديم.
      storesList.value = data
        .filter(store =>
          store.is_active === true ||
          store.status === 'Online' || store.status === 'online' || store.status === 'active'
        )
        .map(store => ({
          id: store.id,
          name: store.name,
          status: store.status || 'Online',
          is_active: store.is_active !== undefined ? store.is_active : true,
          selected: false,
          isSocial: SOCIAL_STORES.some(socialName =>
            store.name && store.name.toLowerCase().includes(socialName.toLowerCase())
          )
        }));
      console.log(`✅ تم جلب ${storesList.value.length} متجر نشط`);
    }
  } catch (error) {
    console.error('❌ فشل جلب المتاجر:', error);
  }
};

// ========== جلب بيانات الـ Release للتحقق من الأغاني والمتاجر ==========
const fetchReleaseData = async () => {
  if (!props.releaseUuid) return;
  
  try {
    console.log('📡 جلب بيانات الـ Release:', props.releaseUuid);
    const response = await apiRequest.get(`/releases/${props.releaseUuid}`);
    const releaseData = response.data?.data || response.data;
    
    const hasExistingStores = releaseData.stores && 
                             Array.isArray(releaseData.stores) && 
                             releaseData.stores.length > 0;
    
    if (hasExistingStores) {
      storesList.value = storesList.value.map(store => ({
        ...store,
        selected: releaseData.stores.includes(store.name)
      }));
      
      // ✅ تحديث ShopsComplete = true إذا كان هناك متاجر محددة
      updateShopsComplete(true);
    } else {
      // إذا لم تكن هناك متاجر، تأكد من أن ShopsComplete = false
      updateShopsComplete(false);
    }
    
    if (releaseData.songs && Array.isArray(releaseData.songs)) {
      hasSongs.value = releaseData.songs.length > 0;
      console.log(`✅ ${hasSongs.value ? 'تم العثور على' : 'لا توجد'} أغاني في بيانات الـ Release`);
    } else {
      await fetchSongs();
    }
    
    determineInitialView(hasExistingStores);
    
    return releaseData;
  } catch (error) {
    console.error('❌ فشل جلب بيانات الـ Release:', error);
    await fetchSongs();
    determineInitialView(false);
  }
};

// ========== تحديد العرض الأولي ==========
const determineInitialView = (hasExistingStores) => {
  if (route.query.forceView === 'main') {
    currentView.value = 'main';
    console.log('📌 [Upload3Component] ✅ forceView=main, showing cards');
    emit('update:currentView', 'main');
    isInitialized.value = true;
    return;
  }

  if (route.query.forceView === 'shopsPage') {
    currentView.value = 'shopsPage';
    console.log('📌 [Upload3Component] ✅ forceView=shopsPage, skipping to shopsPage');
    emit('update:currentView', 'shopsPage');
    isInitialized.value = true;
    return;
  }

  if (hasExistingStores) {
    currentView.value = 'shopsPage';
    console.log('📌 [Upload3Component] ✅ Release has stores, skipping to shopsPage');
    emit('update:currentView', 'shopsPage');
    isInitialized.value = true;
    return;
  }

  if (hasSongs.value) {
    currentView.value = 'main';
    console.log('📌 [Upload3Component] ✅ Has songs, showing cards');
    emit('update:currentView', 'main');
    isInitialized.value = true;
    return;
  }

  currentView.value = 'main';
  console.log('📌 [Upload3Component] ⚠️ No songs, showing cards with first section warning');
  emit('update:currentView', 'main');
  isInitialized.value = true;
};

// ========== دالة الانتقال إلى صفحة إضافة الأغاني ==========
const goToAddSongs = () => {
  console.log('📌 [Upload3Component] Going to add songs');
  emit('go-to-add-songs');
};

// ========== عرض وحجب الحقول ==========
const showCardField = (cardIndex) => {
  console.log(`Hover on card ${cardIndex + 1}, showing field`);
  cardFields[cardIndex].visible = true;
};

const hideCardField = (cardIndex) => {
  console.log(`Mouse leave on card ${cardIndex + 1}, hiding field`);
  cardFields[cardIndex].visible = false;
};

// ========== معالجة اختيار الكارد ==========
const handleNext = async (cardIndex) => {
  console.log(`Button clicked on card ${cardIndex + 1}`);
  selectedCardIndex.value = cardIndex;
  
  if (!hasSongs.value) {
    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: { 
        message: 'Bitte fügen Sie zuerst Songs hinzu, bevor Sie Stores auswählen.', 
        type: 'warning' 
      }
    }));
    return;
  }
  
  let selectedStoreNames = [];
  
  if (cardIndex === 0) {
    selectedStoreNames = storesList.value.map(s => s.name);
  } else if (cardIndex === 1) {
    selectedStoreNames = storesList.value
      .filter(s => !s.isSocial)
      .map(s => s.name);
  } else if (cardIndex === 2) {
    selectedStoreNames = [];
  }
  
  const addNewStores = cardIndex === 0 ? 1 : 0;

  console.log('📤 حفظ المتاجر المختارة:', selectedStoreNames, 'add_new_stores:', addNewStores);

  try {
    const payload = {
      stores: selectedStoreNames,
      add_new_stores: addNewStores
    };

    const response = await apiRequest.put(
      `/releases/${props.releaseUuid}`,
      payload
    );

    console.log('✅ تم حفظ المتاجر بنجاح:', response.data);

    storesList.value = storesList.value.map(store => ({
      ...store,
      selected: selectedStoreNames.includes(store.name)
    }));

    // ✅ تحديث ShopsComplete = true
    updateShopsComplete(true);

    emit('save-release', { stores: selectedStoreNames, add_new_stores: addNewStores });
    
  } catch (error) {
    console.error('❌ فشل حفظ المتاجر:', error);
    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: { 
        message: 'Fehler beim Speichern der Stores. Bitte versuchen Sie es erneut.', 
        type: 'error' 
      }
    }));
    return;
  }
  
  currentView.value = 'shopsPage';
  emit('update:currentView', 'shopsPage');
  nextTick(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  });
  
  const imageMap = {
    0: '/icons/top-line/lossless.png',
    1: '/icons/top-line/card2-image.png',
    2: '/icons/top-line/card3-image.png',
  };
  emit('update:topLineImage', imageMap[cardIndex]);
};

// ========== نافذة الفيديو ==========
//   نفس نمط Parent.vue: الطفل يبثّ openVideoPopup بمفتاح القسم، والحاوية تعرض النافذة.
const showVideoPopup = ref(false);
const videoId = ref('');
const videoIds = {
  shopsCountriesInclude: '480705053',
  shopsCountriesExclude: '480705053'
};

const openVideoPopup = (form) => {
  videoId.value = videoIds[form] || '480705053';
  showVideoPopup.value = true;
  document.body.style.overflow = 'hidden';
};

const closeVideoPopup = () => {
  showVideoPopup.value = false;
  document.body.style.overflow = '';
};

// ========== العودة من ShopsPage ==========
const handleBack = () => {
  console.log('Back to main view from ShopsPage');
  currentView.value = 'main';
  emit('update:currentView', 'main');
  emit('update:topLineImage', null);
};

// ========== الانتقال إلى الخطوة التالية ==========
const handleNextStep = () => {
  console.log('Next step from ShopsPage');
  emit('next');
};

// ========== حفظ بيانات الـ Release ==========
const handleSaveRelease = async (data) => {
  console.log('📤 Upload3Component: حفظ بيانات الـ Release', data);
  
  if (!props.releaseUuid) {
    console.error('❌ لا يوجد releaseUuid');
    return;
  }
  
  releaseData.value = { ...releaseData.value, ...data };
  
  try {
    const payload = {};
    
    if (data.catalog_number !== undefined) {
      payload.catalog_number = data.catalog_number;
    }
    
    if (data.stores !== undefined) {
      payload.stores = data.stores;
      if (data.add_new_stores !== undefined) {
        payload.add_new_stores = data.add_new_stores ? 1 : 0;
      } else {
        const allStoreNames = storesList.value.map(s => s.name);
        const allSelected = allStoreNames.length > 0 && allStoreNames.every(n => data.stores.includes(n));
        payload.add_new_stores = allSelected ? 1 : 0;
      }
    } else if (data.add_new_stores !== undefined) {
      payload.add_new_stores = data.add_new_stores ? 1 : 0;
    }

    if (data.countries_included !== undefined) {
      payload.countries_included = data.countries_included;
    }
    
    if (data.countries_excluded !== undefined) {
      payload.countries_excluded = data.countries_excluded;
    }
    
    console.log('📤 Upload3Component: إرسال إلى API', {
      url: `/releases/${props.releaseUuid}`,
      payload: payload
    });
    
    const response = await apiRequest.put(
      `/releases/${props.releaseUuid}`,
      payload
    );
    
    console.log('✅ تم حفظ بيانات الـ Release بنجاح', response.data);
    
    // ✅ إذا تم حفظ المتاجر، تحديث ShopsComplete
    if (data.stores !== undefined && data.stores.length > 0) {
      updateShopsComplete(true);
    }
    
    emit('save-release', response.data);
    
  } catch (error) {
    console.error('❌ فشل حفظ بيانات الـ Release:', error);
    console.error('تفاصيل الخطأ:', error.response?.data || error.message);
    
    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: { 
        message: 'Fehler beim Speichern der Daten. Bitte versuchen Sie es erneut.', 
        type: 'error' 
      }
    }));
  }
};

// ========== تحديث المتاجر المختارة ==========
const handleSelectedStoresUpdate = (selectedStores) => {
  console.log('📌 [Upload3Component] Selected stores updated:', selectedStores);
  storesList.value = storesList.value.map(store => ({
    ...store,
    selected: selectedStores.includes(store.name)
  }));
  
  // ✅ إذا تم اختيار متاجر، تحديث ShopsComplete
  if (selectedStores && selectedStores.length > 0) {
    updateShopsComplete(true);
  } else {
    updateShopsComplete(false);
  }
};

// ========== مراقبة currentView ==========
watch(currentView, (newView) => {
  emit('update:currentView', newView);
  if (newView === 'main') {
    emit('update:topLineImage', null);
  } else if (newView === 'shopsPage') {
    nextTick(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    });
  }
});

// ========== مراقبة forceView من الـ URL ==========
watch(
  () => route.query.forceView,
  (newVal) => {
    if (!isInitialized.value) return;
    
    console.log('📌 [Upload3Component] forceView changed:', newVal);
    
    if (newVal === 'shopsPage') {
      currentView.value = 'shopsPage';
      emit('update:currentView', 'shopsPage');
      console.log('📌 [Upload3Component] ✅ forceView=shopsPage, moved to shopsPage');
    } else if (newVal === 'main') {
      currentView.value = 'main';
      emit('update:currentView', 'main');
      console.log('📌 [Upload3Component] ✅ forceView=main, moved to main');
    }
  },
  { immediate: true }
);

// ========== مراقبة props.currentStep ==========
watch(
  () => props.currentStep,
  (newStep) => {
    if (!isInitialized.value) return;
    console.log('📌 [Upload3Component] props.currentStep changed to:', newStep);

    if (newStep === 4) {
      // ✅ عند الدخول إلى Shops، تحقق من حالة المتاجر
      const hasStores = storesList.value.some(s => s.selected);
      if (hasStores) {
        updateShopsComplete(true);
      }
      
      currentView.value = 'main';
      console.log('📌 [Upload3Component] ✅ Set currentView to main');
      emit('update:currentView', 'main');
    }
  },
  { immediate: true }
);

// ========== مراقبة selectedQuality ==========
watch(
  () => props.selectedQuality,
  async (newQuality) => {
    if (!isInitialized.value) return;
    console.log('📌 [Upload3Component] selectedQuality changed to:', newQuality);
    
    if (newQuality && !hasSongs.value) {
      await fetchSongs();
    }
  }
);

// ========== onMounted ==========
onMounted(async () => {
  if (isMounted.value) {
    console.log('⚠️ [Upload3Component] Already mounted, skipping');
    return;
  }

  console.log('🚀 Upload3Component mounted with releaseUuid:', props.releaseUuid);
  console.log('📌 props.currentStep:', props.currentStep);
  console.log('📌 props.selectedQuality:', props.selectedQuality);
  console.log('📌 route.query.forceView:', route.query.forceView);
  isMounted.value = true;

  // ✅ تحميل حالة ShopsComplete من localStorage
  try {
    const releaseStore = useReleaseStore();
    if (releaseStore && typeof releaseStore.loadShopsComplete === 'function') {
      releaseStore.loadShopsComplete();
    }
  } catch (e) {
    console.warn('⚠️ Could not load ShopsComplete:', e);
  }

  // 1. جلب المتاجر
  await fetchStores();

  // 2. جلب بيانات الـ Release
  await fetchReleaseData();

  // 3. إذا كانت هناك متاجر محددة مسبقاً، تأكد من تحديث ShopsComplete
  const hasStores = storesList.value.some(s => s.selected);
  if (hasStores) {
    updateShopsComplete(true);
  }

  isInitialized.value = true;
});

onBeforeUnmount(() => {
  console.log('🔄 [Upload3Component] unmounted');
  isMounted.value = false;
});
</script>

<style lang="scss" scoped>
.upload3-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.upload3-loading {
  width: 100%;
  height: 100%;
}

.upload3-empty {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
  min-height: 0 !important;
  max-height: 0 !important;
  overflow: hidden !important;
  padding: 0 !important;
  margin: 0 !important;
  border: 0 !important;
  position: absolute !important;
  pointer-events: none !important;
  opacity: 0 !important;
}

.content,
.shops-content,
.first-section-content {
  display: flex;
  justify-content: center;
  align-items: stretch;
  gap: clamp(20px, 2vw, 60px);
  flex: 1 1 auto;
  align-self: stretch;
  width: 100%;
  height: 100% !important;
  min-height: 100% !important;
  padding: 50px 20px 0px 0px;
}

.shops-content,
.first-section-content {
  padding-top: 0;
}

/* ===== First Section Styles ===== */
.first-section-content {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  padding: 40px 20px;
}

.first-section-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  text-align: center;
  max-width: 500px;
  padding: 40px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.first-section-icon {
  font-size: 64px;
  line-height: 1;
}

.first-section-title {
  color: var(--Main-Colors-White, #FFF);
  font-family: Heebo;
  font-size: 28px;
  font-weight: 500;
  margin: 0;
}

.first-section-description {
  color: rgba(255, 255, 255, 0.7);
  font-family: Heebo;
  font-size: 16px;
  font-weight: 300;
  line-height: 1.6;
  margin: 0;
}

.first-section-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.first-section-actions .btn-primary {
  display: flex;
  padding: 12px 32px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  border-radius: 5px;
  background: var(--Strawberry, #E91E63) !important;
  color: #FFF;
  font-family: Heebo;
  font-size: 16px;
  font-weight: 400;
  border: none;
  cursor: pointer;
  transition: background 0.3s ease;
}

.first-section-actions .btn-primary:hover {
  background: var(--dark-red, #c2185b) !important;
}

/* ===== باقي الأنماط ===== */
.option {
  display: flex;
  height: 100%;
  min-height: 0;
  flex-direction: column;
  align-items: center;
  gap: 30px;
  flex: 1;
  max-width: 440px;
}

.option .card-songs,
.option .card-songs2,
.option .card-songs3 {
  display: flex;
  width: 100%;
  aspect-ratio: 1/1;
  max-width: 440px;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  gap: 22px;
  border-radius: 20px;
  box-shadow: 4px 4px 20px 0 rgba(27, 28, 32, 0.70);
  position: relative;
  cursor: pointer;
  background-size: cover !important;
  background-position: center !important;
  background-repeat: no-repeat !important;
}

.card-songs { background: url('/img/bgCardSongs/card1.png'); }
.card-songs2 { background: url('/img/bgCardSongs/card2.png'); }
.card-songs3 { background: url('/img/bgCardSongs/card3.png'); }

.topic {
  position: absolute;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  color: var(--Main-Colors-White, #FFF);
  text-align: center;
  font-family: Heebo;
  font-size: 38px;
  font-style: normal;
  font-weight: 300;
  line-height: 100%;
  transition: all 0.3s ease;
  z-index: 1;
  min-width: 220px;
  padding: 10px 0;
}

.logo {
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 130px;
  height: 130px;
  transition: all 0.3s ease;
  z-index: 3;
}

.card-songs .logo { background: url('/icon/upload3/all_stores.png') 50% / cover no-repeat; }
.card-songs2 .logo { background: url('/icon/upload3/ohen_social.png') 50% / cover no-repeat; }
.card-songs3 .logo { background: url('/icon/upload3/Individuell.png') 50% / cover no-repeat; }

.logo.shifted {
  top: 130px;
}

.option:hover .topic {
  bottom: 100px;
  transform: translateX(-50%) scale(1.1);
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 20px;
  background: url(../../../assets/icons/dashboard/user/shadows.png) 50% / cover no-repeat;
  transition: background 0.3s ease;
  z-index: 2;
}

.image-overlay.no-overlay {
  background: none !important;
}

.Form {
  position: absolute;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  z-index: 5;
}

.btn-primary1 {
  display: flex;
  padding: 12px 20px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  border-radius: 5px;
  background: var(--Strawberry) !important;
  transition: background 0.3s ease !important;
  cursor: pointer;
}

.btn-primary1:hover {
  background: var(--dark-red) !important;
}

.btn-primary {
  display: flex;
  padding: 12px 20px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  border-radius: 5px;
  background: #3A3E42 !important;
  transition: background 0.3s ease !important;
  cursor: pointer;
}

.btn-primary:hover {
  background: var(--dark-red) !important;
}

.btn-primary1 .p,
.btn-primary .p {
  font-family: Heebo;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: 1;
  text-transform: uppercase;
  color: #FFF;
}

.option .description {
  align-self: stretch;
  color: var(--Main-Colors-White, #FFF);
  text-align: center;
  font-family: Heebo;
  font-size: clamp(14px, 1.2vw, 18px);
  font-style: normal;
  font-weight: 300;
  line-height: 1.5;
  max-width: 444px;
}

@media (max-width:1599px) {
  .content { gap: clamp(15px, 1.5vw, 30px); }
  .option .card-songs,
  .option .card-songs2,
  .option .card-songs3 {
    max-width: 362px;
  }

  .logo.shifted {
    top: 100px;
  }
  .logo{
    width: 120px;
    height: 120px;
  }

  .btn-primary1 .p, .btn-primary .p{
    font-size: 14px;
  }

  .topic{
    font-size: 28px;
  }
}

@media (min-width:1600px) and (max-width:2074px) {
  .option .card-songs,
  .option .card-songs2,
  .option .card-songs3 {
    max-width: 380px;
  }
}

@media (min-width:2075px) and (max-width:2560px) {
  .content { gap: clamp(30px, 3vw, 60px); }
  .option .card-songs,
  .option .card-songs2,
  .option .card-songs3 {
    max-width: 440px;
  }

  .logo{
    width: 150px;
    height: 150px;
  }

  .logo.shifted {
    top: 150px;
  }
}
</style>