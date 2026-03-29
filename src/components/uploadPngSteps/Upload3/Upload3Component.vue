<template>
  <div>
    <!-- العرض الأساسي -->
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

    <!-- ✅ عرض ShopsPage.vue -->
    <div v-else-if="currentView === 'shopsPage'" class="shops-content">
      <ShopsPage 
        :selectedCardIndex="selectedCardIndex"
        :release-uuid="releaseUuid"
        @back="handleBack"
        @next="handleNextStep"
        @save-release="handleSaveRelease"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, defineProps, defineEmits, watch, onMounted } from 'vue';
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

const cardFields = reactive({
  0: { visible: false },
  1: { visible: false },
  2: { visible: false },
});

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
    // تجهيز الـ payload - إرسال فقط الحقول المتغيرة
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
    
    // إرسال إلى الـ API
    const response = await apiRequest.put(
      `/releases/${props.releaseUuid}`,
      payload
    );
    
    console.log('✅ تم حفظ بيانات الـ Release بنجاح', response.data);
    
    // إرسال حدث للأب
    emit('save-release', response.data);
    
  } catch (error) {
    console.error('❌ فشل حفظ بيانات الـ Release:', error);
    console.error('تفاصيل الخطأ:', error.response?.data || error.message);
  }
};

const showCardField = (cardIndex) => {
  console.log(`Hover on card ${cardIndex + 1}, showing field`);
  cardFields[cardIndex].visible = true;
};

const hideCardField = (cardIndex) => {
  console.log(`Mouse leave on card ${cardIndex + 1}, hiding field`);
  cardFields[cardIndex].visible = false;
};

/* ✅ دالة handleNext المحدثة */
const handleNext = (cardIndex) => {
  console.log(`Button clicked on card ${cardIndex + 1}`);
  selectedCardIndex.value = cardIndex;
  
  // عرض ShopsPage داخلياً
  currentView.value = 'shopsPage';
  
  // تحديث الصورة العلوية
  const imageMap = {
    0: '/icons/top-line/lossless.png',
    1: '/icons/top-line/card2-image.png',
    2: '/icons/top-line/card3-image.png',
  };
  emit('update:topLineImage', imageMap[cardIndex]);
};

/* ✅ العودة للشاشة الرئيسية */
const handleBack = () => {
  console.log('Back to main view');
  currentView.value = 'main';
  emit('update:topLineImage', null);
};

/* ✅ الانتقال للخطوة التالية (من ShopsPage) */
const handleNextStep = () => {
  console.log('Next step from ShopsPage');
  emit('next'); // الانتقال للخطوة التالية
};

watch(currentView, (newView) => {
  emit('update:currentView', newView);
  if (newView === 'infos') {
    emit('update:topLineImage', '/icons/top-line/x.svg');
  } else if (newView === 'main') {
    emit('update:topLineImage', null);
  }
});

watch(() => [props.currentStep, props.sectionTitle, props.activeTab], ([newStep, newTitle, newTab]) => {
  console.log('Upload3Component props:', { currentStep: newStep, sectionTitle: newTitle, activeTab: newTab });
});

onMounted(() => {
  console.log('🚀 Upload3Component mounted with releaseUuid:', props.releaseUuid);
});
</script>

<style lang="scss" scoped>
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