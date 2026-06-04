<template>
  <div class="step-manager">
    
    <teleport to="body">
      <PupUpStart v-if="showPupUpStart" :show="showPupUpStart" @deny="closePupUpStart" />
    </teleport>
    
    <div v-if="currentStep === 1 && showTypeSelection" class="type-selection-wrapper">
      <div class="selection-title">Was möchtest du releasen?</div>
      <div class="cards-container-songs">
        <div class="type-card" @click="selectReleaseType('single')">
          <div class="card-title">Single</div>
          <div class="card-desc">1-3 Songs</div>
        </div>
        <div class="type-card" @click="selectReleaseType('extended player')">
          <div class="card-title">Extended Player</div>
          <div class="card-desc">3-6 Songs</div>
        </div>
        <div class="type-card" @click="selectReleaseType('album')">
          <div class="card-title">Album</div>
          <div class="card-desc">7-∞ Songs</div>
        </div>
      </div>
    </div>

    <template v-else>
      <template v-if="useSubLayout">
        <Upload2Layout
          :current-step="currentStep"
          :steps="steps"
          :section-title="sectionTitle"
          :top-line-image="topLineImage"
          :server-cover-url="serverCoverUrl"
          :release-uuid="releaseStore.currentReleaseId"
          :active-tab="activeTab"
          @update-tab="handleTabUpdate"
          @back="handleBack"
          @update:topLineImage="topLineImage = $event"
          @next="nextStep"
          @release-created="handleReleaseCreated"
          @cover-updated="handleCoverUpdated"
          @release-updated="handleReleaseUpdated"
          @update:currentView="currentView = $event"
          @enter-sub-layout="enterSubLayout"
          @exit-sub-layout="exitSubLayout"
        >
          <component
            :is="currentComponent"
            :current-step="currentStep"
            :steps="steps"
            :section-title="sectionTitle"
            :active-tab="activeTab"
            :server-cover-url="serverCoverUrl"
            :release-uuid="releaseStore.currentReleaseId"
            :selected-date="selectedDate"
            @next="nextStep"
            @release-created="handleReleaseCreated"
            @cover-updated="handleCoverUpdated"
            @release-updated="handleReleaseUpdated"
            @update:currentView="currentView = $event"
            @update:topLineImage="topLineImage = $event"
            @enter-sub-layout="enterSubLayout"
            @exit-sub-layout="exitSubLayout"
            @update:showNewRight2="showNewRight2 = $event"
            v-model:title="section1Base"
            :force-infos-view="currentStep >= 3"
            @update:title="handleTitleUpdate"
          />
        </Upload2Layout>
      </template>

      <template v-else>
        <StepLayout
          :current-step="currentStep"
          :steps="steps"
          :section-title="sectionTitle"
          :restrict-overflow="true"
          :showNewRight2="showNewRight2"
          
          :current-view="currentView"
          :topLineImage="topLineImage"
          :server-cover-url="serverCoverUrl"
          :release-uuid="releaseStore.currentReleaseId"
          :active-tab="activeTab"
          @update-tab="handleTabUpdate"
          @back="handleBack"
          @next="nextStep"
          @update:topLineImage="topLineImage = $event"
          @release-created="handleReleaseCreated"
          @cover-updated="handleCoverUpdated"
          @release-updated="handleReleaseUpdated"
          @update:showNewRight2="showNewRight2 = $event"
          @update:currentView="currentView = $event"
          @enter-sub-layout="enterSubLayout"
          @exit-sub-layout="exitSubLayout"
        >
          <component
            :is="currentComponent"
            :current-step="currentStep"
            :steps="steps"
            :section-title="sectionTitle"
            :active-tab="activeTab"
            :server-cover-url="serverCoverUrl"
            :release-uuid="releaseStore.currentReleaseId"
            :selected-date="selectedDate"
            @next="nextStep"
            @release-created="handleReleaseCreated"
            @cover-updated="handleCoverUpdated"
            @release-updated="handleReleaseUpdated"
            @update:showNewRight2="showNewRight2 = $event"
            @update:currentView="currentView = $event"
            @update:topLineImage="topLineImage = $event"
            @enter-sub-layout="enterSubLayout"
            @exit-sub-layout="exitSubLayout"
            v-model:title="section1Base"
            @update:title="handleTitleUpdate"
          />
        </StepLayout>
      </template>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick, provide } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useReleaseStore } from '@/stores/release';
import apiRequest from '@/lib/apiRequest';
import { storage_url } from '@/constants';
import dayjs from 'dayjs';

import StepLayout from '@/components/layouts/Layout-releases.vue';
import Upload2Layout from '@/components/layouts/PreReleaseLayout.vue';
import UploadComponent from '@/components/uploadPngSteps/UploadComponent.vue';
import Upload1Component from '@/components/uploadPngSteps/Upload1Components/Parent.vue';
import Upload2Component from '@/components/uploadPngSteps/Upload2Component.vue';
import Upload3Component from '@/components/uploadPngSteps/Upload3/Upload3Component.vue';
import Upload4Component from '@/components/uploadPngSteps/Upload4/Upload4Component.vue';
import PupUpStart from '@/components/modals/PupUpStart.vue';

const route = useRoute();
const router = useRouter();
const releaseStore = useReleaseStore();

// Props
const props = defineProps({
  currentStep: { type: Number, required: true },
  steps: { type: Array, default: () => ['0', '1', '2', '3', '4'] },
  sectionTitle: { type: [String, Object], default: 'Cover Vorschau' },
  uploadedImage: { type: String, default: null },
  title: { type: String, default: '' },
  releaseUuid: { type: String, default: null },
  songUuid: { type: String, default: null },
  editMode: { type: String, default: null }
});

// Emits
const emit = defineEmits(['update:title', 'next', 'update:showNewRight2']);

// State
const currentStep = ref(1);
const steps = ref(['0', '1', '2', '3', '4']);
const showNewRight2 = ref(false);
const activeTab = ref('infos');
const currentView = ref('main');
const topLineImage = ref(null);
const isInSubLayoutMode = ref(false);
const showTypeSelection = ref(true);
const section1Base = ref('');
const isLoadingDraft = ref(false);
const draftRelease = ref(null);
const serverCoverUrl = ref(null);
const showPupUpStart = ref(false);
const releaseUuidFromUrl = ref(null);
const selectedDate = ref(null); // إضافة selectedDate

// ========== TITLE TRACKING ==========
const currentTitle = ref(props.title || '');
const previousBaseTitle = ref('');

const handleTitleUpdate = (newTitle) => {
  console.log('📝 تحديث العنوان:', newTitle);
  currentTitle.value = newTitle;
  
  if (draftRelease.value) {
    draftRelease.value.title = newTitle;
  }
  
  emit('update:title', newTitle);
};

const handleReleaseUpdated = (data) => {
  console.log('📦 UploadPNG: استقبال حدث release-updated:', data);
  
  if (data?.data && draftRelease.value) {
    draftRelease.value = {
      ...draftRelease.value,
      ...data.data
    };
    
    if (data.data.title) {
      currentTitle.value = data.data.title;
      console.log('📝 تحديث currentTitle من release-updated:', data.data.title);
    }
    
    console.log('✅ تم تحديث draftRelease:', draftRelease.value);
  }
};

const titleMap = {
  single: 'DEINE NEUE SINGLE',
  'extended player': 'DEINE NEUE EP',
  album: 'DEIN NEUES ALBUM',
};

const stepSuffixes = {
  0: '',
  1: ' ',
  2: ' – Metas',
  3: ' – Songs',
  4: ' – Shops',
  5: ' – Publish',
};

const sectionTitle = computed(() => {
  let baseTitle = '';
  
  if (currentStep.value === 3) {
    const songTitle = releaseStore.currentSongTitle || 
                     (draftRelease.value?.songs?.[0]?.title) || 
                     'NEUER SONG';
    baseTitle = songTitle;
  } 
  else {
    baseTitle = currentTitle.value?.trim();
    
    if (!baseTitle && draftRelease.value?.title) {
      baseTitle = draftRelease.value.title.trim();
    }
    
    if (!baseTitle) {
      baseTitle = titleMap[releaseStore.releaseType] || 'DEINE NEUE SINGLE';
    }
  }
  
  const suffix = stepSuffixes[currentStep.value] || '';
  const fullTitle = baseTitle + suffix;
  
  if (baseTitle !== previousBaseTitle.value) {
    console.log('📋 sectionTitle recomputed:', {
      step: currentStep.value,
      baseTitle,
      source: currentStep.value === 3 ? 'song' : (currentTitle.value ? 'currentTitle' : (draftRelease.value?.title ? 'draftRelease' : 'default')),
      suffix,
      fullTitle
    });
    previousBaseTitle.value = baseTitle;
  }
  
  return fullTitle;
});

// ========== READ STEP FROM QUERY ==========
onMounted(async () => {
  console.log('🚀 UploadPNG mounted, route path:', route.path);
  console.log('📍 route.query:', route.query);
  console.log('📍 route.params:', route.params);
  
  setTimeout(() => {
    showPupUpStart.value = true;
    console.log('🎉 تم فتح PupUpStart');
  }, 500);
  
  const stepParam = route.query.step;
  if (stepParam) {
    const parsedStep = parseInt(stepParam);
    if (!isNaN(parsedStep) && parsedStep >= 1 && parsedStep <= 5) {
      currentStep.value = parsedStep;
      console.log('📌 تم تعيين currentStep من query:', currentStep.value);
    }
  }
  
  const hasSongUuid = !!(props.songUuid || route.params.songUuid || route.query.song);
  if (hasSongUuid) {
    console.log('🎵 يوجد songUuid، تعيين currentStep إلى 3');
    currentStep.value = 3;
  }
  
  provide('nextStep', nextStep);
  provide('currentStep', currentStep);
  provide('updateTitle', handleTitleUpdate);
  console.log('📢 [UploadPNG] nextStep provided to children');
  
  if (route.path === '/create-release' && !props.releaseUuid && !releaseUuidFromUrl.value) {
    console.log('📋 مسار /create-release فقط - عرض اختيار نوع الـ Release');
    showTypeSelection.value = true;
    releaseStore.releaseType = null;
    releaseStore.currentReleaseId = null;
    serverCoverUrl.value = null;
    draftRelease.value = null;
    currentStep.value = 1;
    document.body.style.overflow = 'hidden';
    return;
  }
  
  if (props.releaseUuid) {
    releaseUuidFromUrl.value = props.releaseUuid;
    releaseStore.setCurrentReleaseId(props.releaseUuid);
    console.log('📌 تم استخراج releaseUuid من props:', props.releaseUuid);
  } else {
    extractReleaseUuidFromUrl();
  }
  
  if (!hasSongUuid) {
    currentStep.value = props.currentStep || 1;
  }
  
  if (props.songUuid) {
    console.log('[UploadPNG] تم استلام songUuid من props:', props.songUuid);
    releaseStore.setSongUuid(props.songUuid);
  } else {
    const songUuidFromUrl = route.query.song || route.params.songUuid || null;
    if (songUuidFromUrl) {
      console.log('[UploadPNG] تم قراءة songUuid من query/params:', songUuidFromUrl);
      releaseStore.setSongUuid(songUuidFromUrl);
    } else {
      releaseStore.clearSongUuid();
    }
  }

  await fetchRelease();

  if (releaseStore.songUuid && currentStep.value === 2 && draftRelease.value?.cover) {
    console.log('[UploadPNG] يوجد songUuid وcover، الانتقال إلى الخطوة 3');
    currentStep.value = 3;
    
    setTimeout(() => {
      if (currentStep.value === 3) {
        window.dispatchEvent(new CustomEvent('force-edit-song', { 
          detail: { 
            songUuid: releaseStore.songUuid,
            releaseUuid: releaseStore.currentReleaseId 
          } 
        }));
      }
    }, 500);
  }

  document.body.style.overflow = 'hidden';
});

// ========== NEXT STEP FUNCTION ==========
const nextStep = async () => {
  console.log('📢 [UploadPNG] nextStep CALLED! current step:', currentStep.value);
  console.log('📢 [UploadPNG] steps length:', steps.value.length);
  
  if (currentStep.value < steps.value.length) {
    const oldStep = currentStep.value;
    currentStep.value += 1;
    console.log('📢 [UploadPNG] Step increased from', oldStep, 'to', currentStep.value);
    
    if (oldStep === 3 && currentStep.value === 4) {
      releaseStore.clearSongUuid();
    }
    
    emit('next');
    
    await nextTick();
    console.log('📢 [UploadPNG] After nextTick, step is:', currentStep.value);
    console.log('📢 [UploadPNG] Current component should now be:', getComponentByStep(currentStep.value)?.name || 'unknown');
    
    return true;
  } else {
    console.log('📢 [UploadPNG] Cannot increase step, already at max');
    return false;
  }
};

const useSubLayout = computed(() => isInSubLayoutMode.value);

const currentComponent = computed(() => {
  if (draftRelease.value && draftRelease.value.cover) {
    const adjustedStep = currentStep.value === 1 ? 2 : currentStep.value;
    return getComponentByStep(adjustedStep);
  }
  return getComponentByStep(currentStep.value);
});

const getComponentByStep = (step) => {
  switch (step) {
    case 1: return UploadComponent;
    case 2: return Upload1Component;
    case 3: return Upload2Component;
    case 4: return Upload3Component;
    case 5: return Upload4Component;
    default: return UploadComponent;
  }
};

const extractReleaseUuidFromUrl = () => {
  const pathParts = route.path.split('/');
  const releaseIndex = pathParts.indexOf('releases');
  
  if (releaseIndex !== -1 && pathParts[releaseIndex + 1]) {
    releaseUuidFromUrl.value = pathParts[releaseIndex + 1];
    releaseStore.setCurrentReleaseId(releaseUuidFromUrl.value);
    console.log('📌 تم استخراج releaseUuid من الرابط (releases):', releaseUuidFromUrl.value);
    return true;
  }
  
  const lastPart = pathParts[pathParts.length - 1];
  if (lastPart && lastPart !== 'create-release' && lastPart.length > 10) {
    releaseUuidFromUrl.value = lastPart;
    releaseStore.setCurrentReleaseId(lastPart);
    console.log('📌 تم استخراج releaseUuid من الرابط (create-release):', lastPart);
    return true;
  }
  
  releaseUuidFromUrl.value = null;
  return false;
};

// دالة مساعدة لملء البيانات
const fillReleaseData = (release) => {
  releaseUuid.value = release.uuid;
  releaseStore.setReleaseType(release.release_type);
  releaseStore.setCurrentReleaseId(release.uuid);

  const isNewRelease = route.query.new === 'true';
  
  if (!isNewRelease) {
    searchQuery2.value = release.title || '';
    searchQuery3.value = release.subtitle || '';
    
    // تعيين selectedDate
    selectedDate.value = release.release_date 
      ? dayjs(release.release_date).format('DD/MM/YY') 
      : null;
    console.log('📅 UploadPNG: تم تعيين selectedDate:', selectedDate.value);
    
    releasePrice.value = release.release_price || '';
    songPrice.value = release.price_per_song || '';
    mainGenre.value = release.main_genre || '';
    subGenre.value = release.sub_genre || '';
    labelName.value = release.label || '';
    productionYear.value = release.production_year || '';
    cLineYear.value = release.c_line_year || '';
    cLineName.value = release.c_line_name || '';
    pLineYear.value = release.p_line_year || '';
    pLineName.value = release.p_line_name || '';
    gtin.value = release.GTIN || '';
    catalogNumber.value = release.catalog_number || '';
    
    console.log('📝 تم ملء البيانات من المسودة:', release.uuid);
  } else {
    console.log('🆕 Release جديد، لا نقوم بملء البيانات القديمة');
    resetAllFields();
  }

  if (release.cover) {
    serverCoverUrl.value = `${storage_url}/${release.cover}`;
    localUploadedImage.value = serverCoverUrl.value;
  }

  console.log('تم استرجاع المسودة. UUID:', releaseUuid.value);
};

// دالة جلب المسودة - معدلة
const fetchRelease = async () => {
  isLoadingDraft.value = true;
  try {
    if (props.releaseUuid) {
      console.log('📡 جلب Release محدد من props:', props.releaseUuid);
      const response = await apiRequest.get(`/releases/${props.releaseUuid}`);
      const release = response.data?.data;
      
      if (release) {
        draftRelease.value = release;
        releaseStore.setReleaseType(release.release_type);
        releaseStore.setCurrentReleaseId(release.uuid);
        
        if (release.title) {
          currentTitle.value = release.title;
        }
        
        const hasSongUuid = !!(props.songUuid || releaseStore.songUuid || route.query.song || route.params.songUuid);
        
        if (release.cover) {
          serverCoverUrl.value = `${storage_url}/${release.cover}`;
          if (!hasSongUuid && currentStep.value === 1) {
            currentStep.value = 2;
          }
        } else {
          if (!hasSongUuid) {
            currentStep.value = 1;
          }
        }
        
        showTypeSelection.value = false;
        
        // تعيين selectedDate
        selectedDate.value = release.release_date 
          ? dayjs(release.release_date).format('DD/MM/YY') 
          : null;
        console.log('📅 UploadPNG: تم تعيين selectedDate من props:', selectedDate.value);
        
        console.log('✅ تم تحميل Release من props:', release.uuid);
      }
      return;
    }
    
    if (releaseUuidFromUrl.value) {
      console.log('📡 جلب Release محدد من الرابط:', releaseUuidFromUrl.value);
      const response = await apiRequest.get(`/releases/${releaseUuidFromUrl.value}`);
      const release = response.data?.data;
      
      if (release) {
        draftRelease.value = release;
        releaseStore.setReleaseType(release.release_type);
        releaseStore.setCurrentReleaseId(release.uuid);
        
        if (release.title) {
          currentTitle.value = release.title;
        }
        
        const hasSongUuid = !!(props.songUuid || releaseStore.songUuid || route.query.song || route.params.songUuid);
        
        if (release.cover) {
          serverCoverUrl.value = `${storage_url}/${release.cover}`;
          if (!hasSongUuid && currentStep.value === 1) {
            currentStep.value = 2;
          }
        } else {
          if (!hasSongUuid) {
            currentStep.value = 1;
          }
        }
        
        showTypeSelection.value = false;
        
        // تعيين selectedDate
        selectedDate.value = release.release_date 
          ? dayjs(release.release_date).format('DD/MM/YY') 
          : null;
        console.log('📅 UploadPNG: تم تعيين selectedDate من الرابط:', selectedDate.value);
        
        console.log('✅ تم تحميل Release من الرابط:', release.uuid);
      }
      return;
    }
    
    if (route.path === '/create-release') {
      console.log('📋 مسار /create-release فقط - إنشاء Release جديد');
      showTypeSelection.value = true;
      releaseStore.releaseType = null;
      releaseStore.currentReleaseId = null;
      serverCoverUrl.value = null;
      draftRelease.value = null;
      currentStep.value = 1;
      return;
    }
    
    console.log('📡 جلب آخر مسودة');
    const response = await apiRequest.get('/releases');
    const releases = response.data?.data || [];
    
    if (releases.length === 0) {
      showTypeSelection.value = true;
      releaseStore.releaseType = null;
      releaseStore.currentReleaseId = null;
      serverCoverUrl.value = null;
      return;
    }

    const latestDraft = releases
      .filter(r => r.status === 'draft')
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];

    if (latestDraft) {
      draftRelease.value = latestDraft;
      releaseStore.setReleaseType(latestDraft.release_type);
      releaseStore.setCurrentReleaseId(latestDraft.uuid);
      
      if (latestDraft.title) {
        currentTitle.value = latestDraft.title;
      }
      
      console.log('✅ تم تحميل آخر مسودة:', latestDraft.uuid);
      
      const hasSongUuid = !!(props.songUuid || releaseStore.songUuid || route.query.song || route.params.songUuid);
      
      if (latestDraft.cover) {
        serverCoverUrl.value = `${storage_url}/${latestDraft.cover}`;
        if (!hasSongUuid) {
          currentStep.value = 2;
        }
      } else {
        if (!hasSongUuid) {
          currentStep.value = 1;
        }
      }
      
      // تعيين selectedDate
      selectedDate.value = latestDraft.release_date 
        ? dayjs(latestDraft.release_date).format('DD/MM/YY') 
        : null;
      console.log('📅 UploadPNG: تم تعيين selectedDate من آخر مسودة:', selectedDate.value);
      
      showTypeSelection.value = false;
    }
  } catch (err) {
    console.error('❌ فشل جلب الـ Release:', err);
  } finally {
    isLoadingDraft.value = false;
  }
};

const selectReleaseType = (type) => {
  console.log('📌 تم اختيار نوع الـ Release:', type);
  releaseStore.setReleaseType(type);
  showTypeSelection.value = false;
};

const handleReleaseCreated = async (data) => {
  console.log('📦 UploadPNG: استقبال حدث release-created:', data);
  
  if (data?.releaseId) {
    releaseStore.currentReleaseId = data.releaseId;
    
    if (data.coverUrl) {
      serverCoverUrl.value = data.coverUrl;
    }
    
    console.log('🔗 تم تحديث releaseId:', data.releaseId);
    
    await router.replace(`/create-release/${data.releaseId}`);
    console.log('🔗 تم تحديث الرابط إلى:', `/create-release/${data.releaseId}`);
    
    try {
      const response = await apiRequest.get(`/releases/${data.releaseId}`);
      if (response.data?.data) {
        draftRelease.value = response.data.data;
        
        if (response.data.data.title) {
          currentTitle.value = response.data.data.title;
        }
        
        console.log('✅ تم تحديث draftRelease:', draftRelease.value);
      }
    } catch (err) {
      console.error('❌ فشل جلب تفاصيل الـ Release بعد الإنشاء:', err);
    }
    
    showTypeSelection.value = false;
    
    const hasSongUuid = !!(releaseStore.songUuid || props.songUuid || route.query.song || route.params.songUuid);
    
    if (!hasSongUuid) {
      console.log('🔄 تغيير currentStep من', currentStep.value, 'إلى 2');
      currentStep.value = 2;
      emit('next');
      await nextTick();
      console.log('✅ تم الانتقال إلى الخطوة 2, currentStep الآن:', currentStep.value);
    } else {
      console.log('ℹ️ يوجد songUuid، لا يتم تغيير currentStep');
    }
  }
};

const handleCoverUpdated = (data) => {
  console.log('🖼️ UploadPNG: استقبال حدث cover-updated:', data);
  if (data?.coverUrl) {
    serverCoverUrl.value = data.coverUrl;
  }
};

const enterSubLayout = () => { isInSubLayoutMode.value = true; };
const exitSubLayout = () => { isInSubLayoutMode.value = false; };

const handleBack = () => {
  if (currentStep.value === 3) {
    currentView.value = 'main';
    topLineImage.value = null;
  }
};

const handleTabUpdate = (tabId) => activeTab.value = tabId;

const closePupUpStart = () => {
  showPupUpStart.value = false;
  document.body.style.overflow = '';
};

// ========== إضافة المتغيرات المفقودة ==========
const localUploadedImage = ref(null);
const searchQuery2 = ref('');
const searchQuery3 = ref('');
const releasePrice = ref('');
const songPrice = ref('');
const mainGenre = ref('');
const subGenre = ref('');
const gtin = ref('');
const catalogNumber = ref('');
const labelName = ref('');
const productionYear = ref('');
const cLineYear = ref('');
const cLineName = ref('');
const pLineYear = ref('');
const pLineName = ref('');
const isForm2Selected = ref(false);
const isForm3Selected = ref(false);
const isForm4Selected = ref(false);
const isReleasePriceSelected = ref(false);
const isSongPriceSelected = ref(false);
const isMainGenreSelected = ref(false);
const isSubGenreSelected = ref(false);
const isForm6Selected = ref(false);
const isForm7Selected = ref(false);
const isForm8Selected = ref(false);
const isForm9Selected = ref(false);
const isForm10Selected = ref(false);
const isForm11Selected = ref(false);
const isForm3Active = ref(false);
const isForm6Active = ref(false);
const isForm7Active = ref(false);
const isSubGenreEnabled = ref(false);
const daysDifference = ref(0);
const showPopup = ref(false);

const resetAllFields = () => {
  searchQuery2.value = '';
  searchQuery3.value = '';
  selectedDate.value = null;
  releasePrice.value = '';
  songPrice.value = '';
  mainGenre.value = '';
  subGenre.value = '';
  labelName.value = '';
  productionYear.value = '';
  cLineYear.value = '';
  cLineName.value = '';
  pLineYear.value = '';
  pLineName.value = '';
  gtin.value = '';
  catalogNumber.value = '';
  isForm2Selected.value = false;
  isForm3Selected.value = false;
  isForm4Selected.value = false;
  isForm3Active.value = false;
  isForm6Active.value = false;
  isForm7Active.value = false;
  isForm6Selected.value = false;
  isForm7Selected.value = false;
  isForm8Selected.value = false;
  isForm9Selected.value = false;
  isForm10Selected.value = false;
  isForm11Selected.value = false;
};

// Watchers
watch(() => route.path, async (newPath) => {
  const pathParts = newPath.split('/');
  const releaseIndex = pathParts.indexOf('releases');
  
  if (releaseIndex !== -1 && pathParts[releaseIndex + 1]) {
    const newReleaseUuid = pathParts[releaseIndex + 1];
    if (newReleaseUuid !== releaseUuidFromUrl.value) {
      releaseUuidFromUrl.value = newReleaseUuid;
      releaseStore.setCurrentReleaseId(newReleaseUuid);
      await fetchRelease();
    }
  }
});

watch(() => props.songUuid, (newSongUuid, oldSongUuid) => {
  console.log('[UploadPNG] تغير في props.songUuid:', { جديد: newSongUuid, قديم: oldSongUuid });
  
  if (newSongUuid && newSongUuid !== oldSongUuid) {
    releaseStore.setSongUuid(newSongUuid);
    
    if (currentStep.value === 3) {
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('force-edit-song', { 
          detail: { 
            songUuid: newSongUuid,
            releaseUuid: releaseStore.currentReleaseId 
          } 
        }));
      }, 100);
    } else if (currentStep.value === 2 && draftRelease.value?.cover) {
      currentStep.value = 3;
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('force-edit-song', { 
          detail: { 
            songUuid: newSongUuid,
            releaseUuid: releaseStore.currentReleaseId 
          } 
        }));
      }, 500);
    }
  }
}, { immediate: true });

watch(() => route.query.song, (newSongUuid, oldSongUuid) => {
  console.log('[UploadPNG] تغير في route.query.song:', { جديد: newSongUuid, قديم: oldSongUuid });
  
  if (newSongUuid && newSongUuid !== oldSongUuid) {
    releaseStore.setSongUuid(newSongUuid);
    
    if (currentStep.value === 3) {
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('force-edit-song', { 
          detail: { 
            songUuid: newSongUuid,
            releaseUuid: releaseStore.currentReleaseId 
          } 
        }));
      }, 100);
    } else if (currentStep.value === 2 && draftRelease.value?.cover) {
      currentStep.value = 3;
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('force-edit-song', { 
          detail: { 
            songUuid: newSongUuid,
            releaseUuid: releaseStore.currentReleaseId 
          } 
        }));
      }, 500);
    }
  } else if (!newSongUuid && oldSongUuid) {
    releaseStore.clearSongUuid();
  }
}, { immediate: true });

watch(() => route.params.songUuid, (newSongUuid, oldSongUuid) => {
  console.log('[UploadPNG] تغير في route.params.songUuid:', { جديد: newSongUuid, قديم: oldSongUuid });
  
  if (newSongUuid && newSongUuid !== oldSongUuid) {
    releaseStore.setSongUuid(newSongUuid);
    
    if (currentStep.value === 3) {
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('force-edit-song', { 
          detail: { 
            songUuid: newSongUuid,
            releaseUuid: releaseStore.currentReleaseId 
          } 
        }));
      }, 100);
    } else if (currentStep.value === 2 && draftRelease.value?.cover) {
      currentStep.value = 3;
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('force-edit-song', { 
          detail: { 
            songUuid: newSongUuid,
            releaseUuid: releaseStore.currentReleaseId 
          } 
        }));
      }, 500);
    }
  }
}, { immediate: true });

watch(() => currentStep.value, (newStep, oldStep) => {
  console.log('[UploadPNG] currentStep تغير من', oldStep, 'إلى', newStep);
  
  if (newStep === 4 && oldStep === 3 && releaseStore.songUuid) {
    console.log('🗑️ مسح songUuid عند الانتقال من 3 إلى 4');
    releaseStore.clearSongUuid();
    
    const currentQuery = { ...route.query };
    delete currentQuery.song;
    router.replace({ query: currentQuery });
  }
  
  if (newStep === 2 && oldStep === 3 && releaseStore.songUuid) {
    console.log('⚠️ اكتشاف انتقال غير طبيعي من 3 إلى 2 مع وجود songUuid، إعادة التعيين إلى 3');
    currentStep.value = 3;
  }
});

watch(() => route.query.step, (newStep) => {
  if (newStep) {
    const parsedStep = parseInt(newStep);
    if (!isNaN(parsedStep) && parsedStep >= 1 && parsedStep <= 5) {
      console.log('📌 تحديث currentStep من query.step:', parsedStep);
      currentStep.value = parsedStep;
    }
  }
});

watch(() => route.params, (newParams) => {
  console.log('📍 route.params تغير:', newParams);
}, { deep: true });

watch(() => draftRelease.value?.title, (newTitle) => {
  if (newTitle && newTitle !== currentTitle.value) {
    console.log('🔄 تحديث currentTitle من draftRelease.title:', newTitle);
    currentTitle.value = newTitle;
  }
});

watch(() => props.title, (newTitle) => {
  if (newTitle !== currentTitle.value) {
    console.log('🔄 تحديث currentTitle من props:', newTitle);
    currentTitle.value = newTitle;
  }
});

watch(() => releaseStore.currentSongTitle, (newTitle) => {
  if (newTitle && currentStep.value === 3) {
    console.log('🎵 تحديث عنوان الأغنية من store:', newTitle);
    previousBaseTitle.value = '';
  }
});

watch(currentTitle, (newTitle, oldTitle) => {
  if (newTitle !== oldTitle) {
    console.log('📝 currentTitle تغير:', { old: oldTitle, new: newTitle });
    emit('update:title', newTitle);
  }
});

watch(() => releaseStore.releaseType, () => {
  console.log('🔄 releaseType changed, forcing sectionTitle update');
  previousBaseTitle.value = '';
});
</script>

<style lang="scss" scoped>
.step-manager {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
  position: relative;
}

.loading-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-spinner {
  color: white;
  font-size: 1.5rem;
  font-family: Heebo;
}

.type-selection-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: clamp(40px, 5vw, 80px);
  gap: clamp(60px, 6vw, 100px);
  border-radius: 20px;
  background: linear-gradient(180deg, var(--Main-Colors-Slate, #26282D) 0%, var(--Main-Colors-Slate-Dark, #1B1C20) 100%);
}

.selection-title {
  color: var(--Main-Colors-White, #FFF);
  font-family: Heebo;
  font-size: clamp(36px, 4vw, 48px);
  font-weight: 700;
  text-transform: uppercase;
  text-align: center;
  line-height: 1.2;
}

.cards-container-songs {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: clamp(20px, 2vw, 80px);
  width: 100%;
  max-width: 1600px;
}

.type-card {
  flex: 1;
  min-width: 300px;
  max-width: 400px;
  height: clamp(320px, 25vw, 420px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 20px;
  cursor: pointer;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  transition: all 0.4s ease;
  position: relative;
}

.type-card:nth-child(1) { background-image: url('/img/bgCardSongs/card1.png'); }
.type-card:nth-child(2) { background-image: url('/img/bgCardSongs/card2.png'); }
.type-card:nth-child(3) { background-image: url('/img/bgCardSongs/card3.png'); }

.type-card:hover::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(27, 28, 32, 0.4);
  border-radius: 20px;
}

.type-card > * {
  position: relative;
  z-index: 1;
}

.card-title {
  color: #FFF;
  text-align: center;
  font-family: Heebo;
  font-size: 72px;
  font-weight: 700;
  line-height: 100%;
  text-transform: uppercase;
}

.card-desc {
  color: #FFF;
  text-align: center;
  font-family: Heebo;
  font-size: 18px;
  font-weight: 700;
  text-transform: uppercase;
  opacity: 0.9;
  position: absolute;
  bottom: 40px;
}

/* Responsive */
@media (min-width:1440px) and (max-width:1599px) {
  .type-card { max-width: 320px; max-height: 320px; }
  .card-title { font-size: 52px; }
}

@media (min-width:1600px) and (max-width:2074px) {
  .type-card { max-width: 340px; max-height: 340px; }
  .card-title { font-size: 58px; }
}

@media (min-width:2075px) and (max-width:2559px) {
  .type-card { max-width: 440px; max-height: 440px; }
}

@media (min-width: 2560px) {
  .selection-title { font-size: 52px; }
  .card-title { font-size: 64px; }
  .type-card { height: 460px; max-width: 460px; }
}
</style>