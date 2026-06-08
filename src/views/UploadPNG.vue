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
          ref="upload2LayoutRef"
          :current-step="currentStep"
          :steps="steps"
          :section-title="sectionTitle"
          :top-line-image="topLineImage"
          :server-cover-url="serverCoverUrl"
          :release-uuid="releaseStore.currentReleaseId"
          :active-tab="activeTab"
          :current-view="currentView"
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
          @change-song-type="handleChangeSongType"
          @back-to-first-section="handleBackToFirstSectionFromLayout"
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
            :skip-creation="shouldSkipCreation"
            :pending-release-type="pendingReleaseType" 
            :edit-mode="editMode"
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
          ref="stepLayoutRef"
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
          @change-song-type="handleChangeSongType"
          @back-to-first-section="handleBackToFirstSectionFromLayout"
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
            :skip-creation="shouldSkipCreation" 
            :pending-release-type="pendingReleaseType" 
            :edit-mode="editMode"
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
const selectedDate = ref(null);
// const componentKey = ref(0);

// ========== SKIP UPLOAD STATE ==========
const shouldSkipCreation = ref(false);
const pendingReleaseType = ref(null);

// ========== EDIT MODE STATE ==========
const isEditMode = ref(false);
const isEditSongMode = ref(false);

// Refs for child components
const upload2LayoutRef = ref(null);
const stepLayoutRef = ref(null);

// Provide ref to child components
provide('upload2ComponentRef', upload2LayoutRef);

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

// دالة للتعامل مع حدث الرجوع من Layout - بدون تغيير componentKey
const handleBackToFirstSectionFromLayout = () => {
  console.log('🔙 [UploadPNG] استقبال حدث back-to-first-section من PreReleaseLayout');
  
  // نجد Upload2Component مباشرة وندعو الدالة دون إعادة تحميل
  if (upload2LayoutRef.value) {
    // محاولة الوصول إلى المكون الداخلي
    if (upload2LayoutRef.value.handleBackToFirstSection) {
      upload2LayoutRef.value.handleBackToFirstSection();
    } else {
      window.dispatchEvent(new CustomEvent('back-to-first-section-from-layout'));
    }
  } else {
    window.dispatchEvent(new CustomEvent('back-to-first-section-from-layout'));
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

const navigateToEditSong = (songUuid) => {
  if (!releaseStore.currentReleaseId) {
    console.error('❌ لا يوجد Release ID للتنقل إلى الأغنية');
    return;
  }
  
  if (!songUuid) {
    console.error('❌ لا يوجد Song UUID');
    return;
  }
  
  const targetPath = `/releases/${releaseStore.currentReleaseId}/songs/${songUuid}/edit`;
  console.log('🎵 التنقل إلى تعديل الأغنية:', targetPath);
  
  router.push({
    path: targetPath
  });
};

// دالة للتنقل إلى تعديل الـ Release
const navigateToEditRelease = () => {
  if (!releaseStore.currentReleaseId) {
    console.error('❌ لا يوجد Release ID للتنقل');
    return;
  }
  
  console.log('✏️ التنقل إلى تعديل الـ Release:', `/releases/${releaseStore.currentReleaseId}/edit`);
  
  router.push({
    path: `/releases/${releaseStore.currentReleaseId}/edit`
  });
};

// دالة للتنقل إلى إنشاء Release جديد
const navigateToCreateRelease = () => {
  console.log('🆕 التنقل إلى إنشاء Release جديد');
  router.push({
    path: '/create-release'
  });
};

// ========== READ STEP FROM QUERY ==========
onMounted(async () => {
  console.log('🚀 UploadPNG mounted, route path:', route.path);
  console.log('📍 route.query:', route.query);
  console.log('📍 route.params:', route.params);
  console.log('📍 route.name:', route.name);
  
  // التحقق من وضع تعديل الأغنية
  if (route.name === 'edit-song' || props.editMode === 'song') {
    console.log('🎵 وضع تعديل الأغنية نشط');
    isEditSongMode.value = true;
    isEditMode.value = true;
    
    if (route.params.songUuid || props.songUuid) {
      const songUuid = route.params.songUuid || props.songUuid;
      releaseStore.setSongUuid(songUuid);
      console.log('🎵 تم تعيين songUuid:', songUuid);
    }
    
    if (releaseUuidFromUrl.value || props.releaseUuid) {
      await fetchRelease();
      currentStep.value = 3;
      showTypeSelection.value = false;
    }
    document.body.style.overflow = 'hidden';
    return;
  }
  
  // التحقق من وضع تعديل الـ Release
  if (route.name === 'edit-release' || props.editMode === 'release') {
    console.log('✏️ وضع تعديل الـ Release نشط');
    isEditMode.value = true;
    isEditSongMode.value = false;
    
    if (releaseUuidFromUrl.value || props.releaseUuid) {
      await fetchRelease();
      currentStep.value = 2;
      showTypeSelection.value = false;
    }
    document.body.style.overflow = 'hidden';
    return;
  }
  
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
  provide('navigateToEditSong', navigateToEditSong);
  provide('navigateToEditRelease', navigateToEditRelease);
  provide('navigateToCreateRelease', navigateToCreateRelease);
  console.log('📢 [UploadPNG] nextStep provided to children');
  
  // ========== التحقق من وضع التخطي أولاً ==========
  if (route.query.skip === 'true' || route.query.new === 'true') {
    console.log('⏭️ وضع التخطي نشط - لن يتم تحميل أي Release ولن يتم إنشاء أي شيء');
    shouldSkipCreation.value = true;
    showTypeSelection.value = false;
    currentStep.value = 2;
    document.body.style.overflow = 'hidden';
    return;
  }
  
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
const nextStep = async (data) => {
  console.log('📢 [UploadPNG] nextStep CALLED! current step:', currentStep.value);
  console.log('📢 [UploadPNG] received data:', data);
  
  // التحقق من وجود تخطي للرفع
  if (data && typeof data === 'object' && data.skipUpload) {
    console.log('⏭️ تم استلام حدث skipUpload');
    shouldSkipCreation.value = true;
    pendingReleaseType.value = data.releaseType;
    
    if (currentStep.value < steps.value.length) {
      currentStep.value += 1;
      console.log('📢 [UploadPNG] الانتقال إلى الخطوة', currentStep.value);
      
      const currentPath = route.path;
      if (currentPath === '/create-release') {
        router.replace({
          path: '/create-release',
          query: { skip: 'true' }
        });
      }
      
      return true;
    }
  }
  
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
  if (shouldSkipCreation.value) {
    return getComponentByStep(currentStep.value);
  }
  
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

// دالة جلب المسودة
const fetchRelease = async () => {
  if (shouldSkipCreation.value || route.query.skip === 'true') {
    console.log('⏭️ وضع التخطي نشط - تم إلغاء جلب المسودة');
    return;
  }
  
  const isEditReleaseMode = route.name === 'edit-release' || props.editMode === 'release';
  const isEditSongModeLocal = route.name === 'edit-song' || props.editMode === 'song';
  
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
        
        if (isEditSongModeLocal) {
          console.log('🎵 وضع تعديل الأغنية - البقاء في الخطوة 3');
          if (release.cover) {
            serverCoverUrl.value = `${storage_url}/${release.cover}`;
          }
          if (currentStep.value !== 3) {
            currentStep.value = 3;
          }
        }
        else if (isEditReleaseMode) {
          console.log('✏️ وضع تعديل الـ Release - البقاء في الخطوة 2');
          if (release.cover) {
            serverCoverUrl.value = `${storage_url}/${release.cover}`;
          }
          if (currentStep.value === 1) {
            currentStep.value = 2;
          }
        }
        else {
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
        }
        
        showTypeSelection.value = false;
        
        selectedDate.value = release.release_date 
          ? dayjs(release.release_date).format('DD/MM/YY') 
          : null;
        console.log('📅 UploadPNG: تم تعيين selectedDate من props:', selectedDate.value);
        
        console.log('✅ تم تحميل Release من props:', release.uuid);
        console.log('📌 currentStep:', currentStep.value);
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
        
        if (isEditSongModeLocal) {
          console.log('🎵 وضع تعديل الأغنية - البقاء في الخطوة 3');
          if (release.cover) {
            serverCoverUrl.value = `${storage_url}/${release.cover}`;
          }
          if (currentStep.value !== 3) {
            currentStep.value = 3;
          }
        }
        else if (isEditReleaseMode) {
          console.log('✏️ وضع تعديل الـ Release - البقاء في الخطوة 2');
          if (release.cover) {
            serverCoverUrl.value = `${storage_url}/${release.cover}`;
          }
          if (currentStep.value === 1) {
            currentStep.value = 2;
          }
        }
        else {
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
        }
        
        showTypeSelection.value = false;
        
        selectedDate.value = release.release_date 
          ? dayjs(release.release_date).format('DD/MM/YY') 
          : null;
        console.log('📅 UploadPNG: تم تعيين selectedDate من الرابط:', selectedDate.value);
        
        console.log('✅ تم تحميل Release من الرابط:', release.uuid);
        console.log('📌 currentStep:', currentStep.value);
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
      
      if (isEditSongModeLocal) {
        console.log('🎵 وضع تعديل الأغنية - البقاء في الخطوة 3');
        if (latestDraft.cover) {
          serverCoverUrl.value = `${storage_url}/${latestDraft.cover}`;
        }
        if (currentStep.value !== 3) {
          currentStep.value = 3;
        }
      }
      else if (isEditReleaseMode) {
        console.log('✏️ وضع تعديل الـ Release - البقاء في الخطوة 2');
        if (latestDraft.cover) {
          serverCoverUrl.value = `${storage_url}/${latestDraft.cover}`;
        }
        if (currentStep.value === 1) {
          currentStep.value = 2;
        }
      }
      else {
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
      }
      
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
    shouldSkipCreation.value = false;
    pendingReleaseType.value = null;
    
    if (data.coverUrl) {
      serverCoverUrl.value = data.coverUrl;
    }
    
    console.log('🔗 تم تحديث releaseId:', data.releaseId);
    
    await router.replace(`/releases/${data.releaseId}/edit`);
    console.log('🔗 تم تحديث الرابط إلى وضع التعديل:', `/releases/${data.releaseId}/edit`);
    
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
      console.log('🔄 تعيين currentStep إلى 2');
      currentStep.value = 2;
    } else {
      console.log('ℹ️ يوجد songUuid، البقاء في currentStep:', currentStep.value);
    }
  }
};

const handleCoverUpdated = (data) => {
  console.log('🖼️ UploadPNG: استقبال حدث cover-updated:', data);
  if (data?.coverUrl) {
    serverCoverUrl.value = data.coverUrl;
  }
};

const handleChangeSongType = () => {
  console.log('📢 [UploadPNG] استقبال حدث change-song-type');
  
  currentView.value = 'main';
  topLineImage.value = null;
  showNewRight2.value = false;
  isInSubLayoutMode.value = false;
  
  const currentQuery = { ...route.query };
  delete currentQuery.song;
  router.replace({ query: currentQuery });
  
  releaseStore.clearSongUuid();
  // componentKey.value += 1;
  
  console.log('✅ [UploadPNG] تم إعادة تعيين جميع الحالات بنجاح');
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

// ========== WATCHERS ==========
watch(() => route.path, async (newPath) => {
  if (shouldSkipCreation.value || route.query.skip === 'true') {
    console.log('⏭️ وضع التخطي نشط - تم إلغاء التحديث');
    return;
  }
  
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
    releaseStore.clearSongUuid();
    const currentQuery = { ...route.query };
    delete currentQuery.song;
    router.replace({ query: currentQuery });
  }
  
  if (newStep === 2 && oldStep === 3 && releaseStore.songUuid) {
    currentStep.value = 3;
  }
});

watch(() => route.query.step, (newStep) => {
  if (newStep) {
    const parsedStep = parseInt(newStep);
    if (!isNaN(parsedStep) && parsedStep >= 1 && parsedStep <= 5) {
      currentStep.value = parsedStep;
    }
  }
});

watch(() => route.params, (newParams) => {
  console.log('📍 route.params تغير:', newParams);
}, { deep: true });

watch(() => draftRelease.value?.title, (newTitle) => {
  if (newTitle && newTitle !== currentTitle.value) {
    currentTitle.value = newTitle;
  }
});

watch(() => props.title, (newTitle) => {
  if (newTitle !== currentTitle.value) {
    currentTitle.value = newTitle;
  }
});

watch(() => releaseStore.currentSongTitle, (newTitle) => {
  if (newTitle && currentStep.value === 3) {
    previousBaseTitle.value = '';
  }
});

watch(currentTitle, (newTitle, oldTitle) => {
  if (newTitle !== oldTitle) {
    emit('update:title', newTitle);
  }
});

watch(() => releaseStore.releaseType, () => {
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