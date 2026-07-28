<template>
  <!-- ✅ عرض Upload3Component فقط عندما يكون currentStep === 4 -->
  <div v-if="props.currentStep === 4" class="upload3-container">
    <!-- العرض الأساسي (كروت اختيار المتاجر) -->
    <div v-if="currentView === 'main'" class="content">
      <!-- كارد 1 -->
      <div class="option" @mouseenter="showCardField(0)" @mouseleave="hideCardField(0)">
        <div class="card-songs">
          <div class="topic">Alle Stores</div>
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
          Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.
        </div>
      </div>

      <!-- كارد 2 -->
      <div class="option" @mouseenter="showCardField(1)" @mouseleave="hideCardField(1)">
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
          Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, ipsa quae ab illo inventore.
        </div>
      </div>

      <!-- كارد 3 -->
      <div class="option" @mouseenter="showCardField(2)" @mouseleave="hideCardField(2)">
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
          Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore.
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
      />
    </div>
  </div>
  <!-- ✅ عرض فارغ إذا لم نكن في الخطوة 4 -->
  <div v-else class="upload3-empty"></div>
</template>

<script setup>
import { ref, reactive, defineProps, defineEmits, watch, onMounted, onBeforeUnmount } from 'vue';
import ShopsPage from './ShopsPage.vue';
import apiRequest from '@/lib/apiRequest';

const props = defineProps({
  currentStep: { type: Number, required: true },
  steps: { type: Array, default: () => ['0', '1', '2', '3', '4'] },
  sectionTitle: { type: [String, Object], default: 'Summer Feeling – Metas' },
  activeTab: { type: String, default: 'infos' },
  releaseUuid: { type: String, required: true } 
});

const emit = defineEmits(['next', 'update:currentView', 'back', 'update:topLineImage', 'save-release']);

const currentView = ref('main');
const selectedCardIndex = ref(null);
const shopsPageRef = ref(null);
const isInitialized = ref(false);
const isMounted = ref(false);

const cardFields = reactive({
  0: { visible: false },
  1: { visible: false },
  2: { visible: false },
});

// ========== قائمة المتاجر الاجتماعية ==========
const SOCIAL_STORES = [
  'META (Facebook, Instagram)',
  'TikTok / Resso',
  'TikTok PMVs (Video)',
  'YouTube (Content ID)',
  'YouTube Music',
  'Spotify',
  'Spotify (Video)',
  'Spotify Audiobooks',
  'Apple Music (Audiobook)',
  'iTunes Store / Apple Music (VIDEO)',
  'iTunes Store / Apple Music / Shazam (Service)',
  'Pandora',
  'Deezer'
];

// ========== قائمة المتاجر ==========
const storesList = ref([]);

// ========== جلب المتاجر من الـ API ==========
const fetchStores = async () => {
  try {
    console.log('📡 جلب قائمة المتاجر...');
    const response = await apiRequest.get('/stores');
    const data = response.data.data || response.data;
    
    if (Array.isArray(data)) {
      storesList.value = data.map(store => ({
        id: store.id,
        name: store.name,
        status: store.status || 'Online',
        selected: false,
        isSocial: SOCIAL_STORES.some(socialName => 
          store.name && store.name.toLowerCase().includes(socialName.toLowerCase())
        )
      }));
      console.log(`✅ تم جلب ${storesList.value.length} متجر`);
    }
  } catch (error) {
    console.error('❌ فشل جلب المتاجر:', error);
  }
};

// بيانات الـ Release (سيتم تحديثها من ShopsPage)
const releaseData = ref({
  catalog_number: '',
  stores: [],
  countries_included: [],
  countries_excluded: []
});

// دالة لحفظ بيانات الـ Release
const handleSaveRelease = async (data) => {
  console.log('📤 Upload3Component: حفظ بيانات الـ Release', data);
  
  if (!props.releaseUuid) {
    console.error('❌ لا يوجد releaseUuid');
    return;
  }
  
  // تحديث البيانات المحلية
  releaseData.value = { ...releaseData.value, ...data };
  
  try {
    const payload = {};
    
    if (data.catalog_number !== undefined) {
      payload.catalog_number = data.catalog_number;
    }
    
    if (data.stores !== undefined) {
      payload.stores = data.stores;
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

// دالة معالجة تحديث المتاجر المختارة من ShopsPage
const handleSelectedStoresUpdate = (selectedStores) => {
  console.log('📌 [Upload3Component] Selected stores updated:', selectedStores);
  // تحديث المتاجر في القائمة المحلية
  storesList.value = storesList.value.map(store => ({
    ...store,
    selected: selectedStores.includes(store.name)
  }));
};

const showCardField = (cardIndex) => {
  console.log(`Hover on card ${cardIndex + 1}, showing field`);
  cardFields[cardIndex].visible = true;
};

const hideCardField = (cardIndex) => {
  console.log(`Mouse leave on card ${cardIndex + 1}, hiding field`);
  cardFields[cardIndex].visible = false;
};

const handleNext = async (cardIndex) => {
  console.log(`Button clicked on card ${cardIndex + 1}`);
  selectedCardIndex.value = cardIndex;
  
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
  
  console.log('📤 حفظ المتاجر المختارة:', selectedStoreNames);
  
  try {
    const payload = {
      stores: selectedStoreNames
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
    
    emit('save-release', { stores: selectedStoreNames });
    
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
  
  // ✅ الانتقال إلى shopsPage
  currentView.value = 'shopsPage';
  emit('update:currentView', 'shopsPage');
  
  const imageMap = {
    0: '/icons/top-line/lossless.png',
    1: '/icons/top-line/card2-image.png',
    2: '/icons/top-line/card3-image.png',
  };
  emit('update:topLineImage', imageMap[cardIndex]);
};

const handleBack = () => {
  console.log('Back to main view from ShopsPage');
  currentView.value = 'main';
  emit('update:currentView', 'main');
  emit('update:topLineImage', null);
};

const handleNextStep = () => {
  console.log('Next step from ShopsPage');
  emit('next');
};

// ========== مراقبة currentView ==========
watch(currentView, (newView) => {
  emit('update:currentView', newView);
  if (newView === 'main') {
    emit('update:topLineImage', null);
  }
});

// ========== مراقبة props.currentStep للانتقال إلى shopsPage ==========
watch(
  () => props.currentStep,
  (newStep) => {
    console.log('📌 [Upload3Component] props.currentStep changed to:', newStep);
    
    // ✅ إذا كان currentStep = 4، انتقل إلى shopsPage فوراً
    if (newStep === 4) {
      currentView.value = 'shopsPage';
      console.log('📌 [Upload3Component] ✅ Set currentView to shopsPage');
      emit('update:currentView', 'shopsPage');
    } else if (newStep === 3) {
      // العودة إلى main
      currentView.value = 'main';
      console.log('📌 [Upload3Component] ✅ Set currentView to main');
      emit('update:currentView', 'main');
    }
  },
  { immediate: true }
);

// في onMounted
onMounted(async () => {
  if (isMounted.value) {
    console.log('⚠️ [Upload3Component] Already mounted, skipping');
    return;
  }
  
  console.log('🚀 Upload3Component mounted with releaseUuid:', props.releaseUuid);
  console.log('📌 props.currentStep:', props.currentStep);
  isMounted.value = true;
  
  // ✅ تعيين currentView إلى 'main' دائماً عند التحميل
  currentView.value = 'main';
  console.log('📌 [Upload3Component] ✅ Set currentView to main');
  emit('update:currentView', 'main');
  
  await fetchStores();
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

/* ✅ إخفاء العنصر الفارغ */
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
.shops-content {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 40px;
  flex: 1 0 0;
  align-self: stretch;
  padding-top: 100px;
  width: 100%;
  height: 100%;
}

.shops-content{
  padding-top: 0;
}

/* باقي الـ styles كما هي بدون تغيير */
.option {
  display: flex;
  height: 500px;
  flex-direction: column;
  align-items: center;
  gap: 40px;
}

.option .card-songs,
.option .card-songs2,
.option .card-songs3 {
  display: flex;
  width: 360px;
  height: 360px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 22px;
  flex-shrink: 0;
  aspect-ratio: 1/1;
  border-radius: 20px;
  box-shadow: 4px 4px 20px 0 rgba(27, 28, 32, 0.70);
  position: relative;
  cursor: pointer;
  background-size: contain;
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
  top: 90px;
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
  font-size: 18px;
  font-style: normal;
  font-weight: 300;
  line-height: normal;
  max-width: 444px;
}

@media (max-width:1599px) {
  .option .description{
    font-size: 14px;
  } 

  .logo{
    width: 110px;
    height: 110px;
  }

  .btn-primary1 .p, .btn-primary .p{
    font-size: 14px;
  }

  .option .card-songs,.option .card-songs2,.option .card-songs3,.option{
    width:clamp(308px, calc(308px + 54 * (100vw - 1440px) / 159), 362px);
    height:clamp(308px, calc(308px + 54 * (100vw - 1440px) / 159), 362px);
  }

  .topic{
    font-size: 28px;
  }
}

@media (min-width:1600px) and (max-width:2074px) {
  .Card{
    width: 340px;
    height: 340px;
  }
}

@media (min-width:2075px) and (max-width:2560px) {
  .option .card-songs,.option .card-songs2,.option .card-songs3{
    width: 440px;
    height: 440px;
    gap: 112px;
    align-items: center;
  }

  .logo{
    width: 150px;
    height: 150px;
  }

  .logo.shifted {
    top: 110px;
  }
}
</style>