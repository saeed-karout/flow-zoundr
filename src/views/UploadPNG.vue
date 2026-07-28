<template>
  <div class="step-manager" :class="{ 'step-1-auto': currentStep === 1 }">
    
    <!-- 🔥 فيديو بوب اب -->
    <VideoPopup 
      :show="showVideoPopup" 
      :videoId="videoId" 
      @close="closeVideoPopup" 
    />
    
    <teleport to="body">
      <PupUpStart v-if="showPupUpStart" :show="showPupUpStart" @deny="closePupUpStart" />
    </teleport>
    
    <!-- 🔥 كروت اختيار نوع الإصدار - خارج أي Layout -->
    <div v-if="currentStep === 1 && showTypeSelection" class="type-selection-wrapper">
      <div class="selection-title">Was möchtest du releasen?</div>
      <div class="cards-container-songs">
        <TiltCard
          class="type-card"
          ref="card1"
          @mousemove="handleMouseMove($event, 'card1')"
          @mouseleave="handleMouseLeave('card1')"
          @click="selectReleaseType('single')"
          :class="{
            'hover-tl': activeCorners.card1 === 'tl',
            'hover-tr': activeCorners.card1 === 'tr',
            'hover-bl': activeCorners.card1 === 'bl',
            'hover-br': activeCorners.card1 === 'br'
          }"
        >
          <div class="card-title">Single</div>
          <div class="card-desc">1-3 Songs</div>
        </TiltCard>
        
        <TiltCard
          class="type-card"
          ref="card2"
          @mousemove="handleMouseMove($event, 'card2')"
          @mouseleave="handleMouseLeave('card2')"
          @click="selectReleaseType('extended player')"
          :class="{
            'hover-tl': activeCorners.card2 === 'tl',
            'hover-tr': activeCorners.card2 === 'tr',
            'hover-bl': activeCorners.card2 === 'bl',
            'hover-br': activeCorners.card2 === 'br'
          }"
        >
          <div class="card-title">Extended Player</div>
          <div class="card-desc">3-6 Songs</div>
        </TiltCard>
        
        <TiltCard
          class="type-card"
          ref="card3"
          @mousemove="handleMouseMove($event, 'card3')"
          @mouseleave="handleMouseLeave('card3')"
          @click="selectReleaseType('album')"
          :class="{
            'hover-tl': activeCorners.card3 === 'tl',
            'hover-tr': activeCorners.card3 === 'tr',
            'hover-bl': activeCorners.card3 === 'bl',
            'hover-br': activeCorners.card3 === 'br'
          }"
        >
          <div class="card-title">Album</div>
          <div class="card-desc">7-∞ Songs</div>
        </TiltCard>
      </div>
    </div>

    <template v-if="currentStep === 3 && useSubLayout">
      <Upload2Layout
        ref="upload2LayoutRef"
        :current-step="currentStep"
        :steps="steps"
        :section-title="sectionTitle"
        :height-mode="layoutHeightMode"
        :show-new-right2="showNewRight2"
        :top-line-image="topLineImage"
        :server-cover-url="serverCoverUrl || defaultBackgroundImage"
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
        @update:currentView="handleUpdateCurrentView"
        @enter-sub-layout="enterSubLayout"
        @exit-sub-layout="exitSubLayout"
        @change-song-type="handleChangeSongType"
        @back-to-first-section="handleBackToFirstSectionFromLayout"
        @update:form-data="handleFormDataUpdateFromChild"
        @update-tab-completion="handleTabCompletionUpdate"
      >
        <Upload2Component
          v-if="currentStep === 3"
          :key="'upload2-' + (releaseStore.currentReleaseId || 'new')"
          :ref="setComponentRef"
          :current-step="currentStep"
          :steps="steps"
          :section-title="sectionTitle"
          :active-tab="activeTab"
          :server-cover-url="serverCoverUrl || defaultBackgroundImage"
          :release-uuid="releaseStore.currentReleaseId || releaseUuidFromUrl || props.releaseUuid"
          :selected-date="selectedDate"
          :skip-creation="shouldSkipCreation && !releaseStore.currentReleaseId"
          :pending-release-type="pendingReleaseType"
          :edit-mode="editMode"
          :force-infos-view="forceInfosView"
          @next="nextStep"
          @release-created="handleReleaseCreated"
          @cover-updated="handleCoverUpdated"
          @release-updated="handleReleaseUpdated"
          @update:showNewRight2="showNewRight2 = $event"
          @update:currentView="handleUpdateCurrentView"
          @update:topLineImage="topLineImage = $event"
          @enter-sub-layout="enterSubLayout"
          @exit-sub-layout="exitSubLayout"
          @update-tab="handleTabUpdate"
          @openVideoPopup="openVideoPopup"
          v-model:title="section1Base"
          @update:title="handleTitleUpdate"
        />
      </Upload2Layout>
    </template>

    <!-- 🔥 باقي المكونات تستخدم StepLayout -->
    <template v-else>
      <!-- ✅ فقط إذا لم تكن كروت الاختيار ظاهرة -->
      <template v-if="!(currentStep === 1 && showTypeSelection)">
        <StepLayout
          ref="stepLayoutRef"
          :current-step="currentStep"
          :steps="steps"
          :section-title="sectionTitle"
          :restrict-overflow="true"
          :show-new-right2="showNewRight2"
          :current-view="currentView"
          :top-line-image="topLineImage"
          :server-cover-url="serverCoverUrl || defaultBackgroundImage"
          :uploaded-image="uploadedImage" 
          :height-mode="layoutHeightMode"
          :release-uuid="releaseStore.currentReleaseId"
          :active-tab="activeTab"
          :force-full-height="shouldForceFullHeight"
          @update-tab="handleTabUpdate"
          @back="handleBack"
          @next="nextStep"
          @update:topLineImage="topLineImage = $event"
          @release-created="handleReleaseCreated"
          @cover-updated="handleCoverUpdated"
          @release-updated="handleReleaseUpdated"
          @update:showNewRight2="showNewRight2 = $event"
          @update:currentView="handleUpdateCurrentView"
          @enter-sub-layout="enterSubLayout"
          @exit-sub-layout="exitSubLayout"
          @change-song-type="handleChangeSongType"
          @back-to-first-section="handleBackToFirstSectionFromLayout"
        >
          <!-- UploadComponent: currentStep === 1 -->
          <UploadComponent
            v-if="currentStep === 1 && !showTypeSelection"
            :key="'upload-' + (releaseStore.currentReleaseId || 'new')"
            :current-step="currentStep"
            :steps="steps"
            :section-title="sectionTitle"
            :active-tab="activeTab"
            :server-cover-url="serverCoverUrl || defaultBackgroundImage"
            :uploaded-image="uploadedImage"
            :release-uuid="releaseStore.currentReleaseId || releaseUuidFromUrl || props.releaseUuid"
            :selected-date="selectedDate"
            :skip-creation="shouldSkipCreation" 
            :pending-release-type="pendingReleaseType" 
            :edit-mode="editMode"
            :ref="setComponentRef"
            @next="nextStep"
            @release-created="handleReleaseCreated"
            @cover-updated="handleCoverUpdated"
            @release-updated="handleReleaseUpdated"
            @cover-restored="handleCoverRestored"
            @update:showNewRight2="showNewRight2 = $event"
            @update:currentView="handleUpdateCurrentView"
            @update:topLineImage="topLineImage = $event"
            @enter-sub-layout="enterSubLayout"
            @exit-sub-layout="exitSubLayout"
            @go-back="handleGoBackToTypeSelection" 
            v-model:title="section1Base"
            @update:title="handleTitleUpdate"
          />
          
          <!-- Upload1Component: currentStep === 2 -->
          <Upload1Component
            v-if="currentStep === 2"
            :key="'upload1-' + (releaseStore.currentReleaseId || 'new')"
            :current-step="currentStep"
            :steps="steps"
            :section-title="sectionTitle"
            :active-tab="activeTab"
            :server-cover-url="serverCoverUrl || null"
            :uploaded-image="serverCoverUrl"
            :release-uuid="releaseStore.currentReleaseId || releaseUuidFromUrl || props.releaseUuid"
            :selected-date="selectedDate"
            :skip-creation="shouldSkipCreation && !releaseStore.currentReleaseId"
            :pending-release-type="pendingReleaseType" 
            :edit-mode="editMode"
            :ref="setComponentRef"
            @next="nextStep"
            @release-created="handleReleaseCreated"
            @cover-updated="handleCoverUpdated"
            @release-updated="handleReleaseUpdated"
            @update:showNewRight2="showNewRight2 = $event"
            @update:currentView="handleUpdateCurrentView"
            @update:topLineImage="topLineImage = $event"
            @enter-sub-layout="enterSubLayout"
            @exit-sub-layout="exitSubLayout"
            v-model:title="section1Base"
            @update:title="handleTitleUpdate"
          />

          <!-- Upload2Component: currentStep === 3 (حالة احتياطية) -->
          <Upload2Component
            v-if="currentStep === 3"
            :key="'upload2-' + (releaseStore.currentReleaseId || 'new')"
            :current-step="currentStep"
            :steps="steps"
            :section-title="sectionTitle"
            :active-tab="activeTab"
            :server-cover-url="serverCoverUrl || defaultBackgroundImage"
            :release-uuid="releaseStore.currentReleaseId || releaseUuidFromUrl || props.releaseUuid"
            :selected-date="selectedDate"
            :skip-creation="shouldSkipCreation" 
            :pending-release-type="pendingReleaseType" 
            :edit-mode="editMode"
            :ref="setComponentRef"
            :force-infos-view="forceInfosView"
            @next="nextStep"
            @release-created="handleReleaseCreated"
            @cover-updated="handleCoverUpdated"
            @release-updated="handleReleaseUpdated"
            @update:showNewRight2="showNewRight2 = $event"
            @update:currentView="handleUpdateCurrentView"
            @update:topLineImage="topLineImage = $event"
            @enter-sub-layout="enterSubLayout"
            @exit-sub-layout="exitSubLayout"
            v-model:title="section1Base"
            @update:title="handleTitleUpdate"
          />
            
          <!-- Upload3Component: currentStep === 4 -->
          <Upload3Component
            v-if="currentStep === 4"
            :key="'upload3-' + (releaseStore.currentReleaseId || 'new')"
            :current-step="currentStep"
            :steps="steps"
            :section-title="sectionTitle"
            :active-tab="activeTab"
            :server-cover-url="serverCoverUrl || defaultBackgroundImage"
            :release-uuid="releaseStore.currentReleaseId || releaseUuidFromUrl || props.releaseUuid"
            :selected-date="selectedDate"
            :skip-creation="shouldSkipCreation" 
            :pending-release-type="pendingReleaseType" 
            :edit-mode="editMode"
            :ref="setComponentRef"
            :force-infos-view="forceInfosView"
            @next="nextStep"
            @release-created="handleReleaseCreated"
            @cover-updated="handleCoverUpdated"
            @release-updated="handleReleaseUpdated"
            @update:showNewRight2="showNewRight2 = $event"
            @update:currentView="handleUpdateCurrentView"
            @update:topLineImage="topLineImage = $event"
            @enter-sub-layout="enterSubLayout"
            @exit-sub-layout="exitSubLayout"
            v-model:title="section1Base"
            @update:title="handleTitleUpdate"
          />
          
          <!-- Upload4Component: currentStep === 5 -->
          <Upload4Component
            v-if="currentStep === 5"
            :key="'upload4-' + (releaseStore.currentReleaseId || 'new')"
            :current-step="currentStep"
            :steps="steps"
            :section-title="sectionTitle"
            :active-tab="activeTab"
            :server-cover-url="serverCoverUrl || defaultBackgroundImage"
            :release-uuid="releaseStore.currentReleaseId || releaseUuidFromUrl || props.releaseUuid"
            :selected-date="selectedDate"
            :skip-creation="shouldSkipCreation" 
            :pending-release-type="pendingReleaseType" 
            :edit-mode="editMode"
            :ref="setComponentRef"
            @next="nextStep"
            @release-created="handleReleaseCreated"
            @cover-updated="handleCoverUpdated"
            @release-updated="handleReleaseUpdated"
            @update:showNewRight2="showNewRight2 = $event"
            @update:currentView="handleUpdateCurrentView"
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
// ========== imports ==========
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick, provide, reactive } from 'vue';
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
import TiltCard from '@/components/TiltCard.vue';
import VideoPopup from '@/components/uploadPngSteps/Upload1Components/VideoPopup.vue';

// ========== router & store ==========
const route = useRoute();
const router = useRouter();
const releaseStore = useReleaseStore();

// ========== الصورة الافتراضية ==========
const defaultBackgroundImage = ref('/img/bgCardSongs/card1.png');

// ========== props ==========
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

// ========== emits ==========
const emit = defineEmits(['update:title', 'next', 'update:showNewRight2']);

// ========== state ==========
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
const uploadedImage = ref(null);
const showPupUpStart = ref(false);
const releaseUuidFromUrl = ref(null);
const selectedDate = ref(null);
const isCreatingRelease = ref(false);
const isNavigatingBetweenSteps = ref(false);

// ========== video state ==========
const showVideoPopup = ref(false);
const videoId = ref('480705053');

// ========== computed for layout ==========
const useSubLayout = computed(() => {
  if (currentStep.value === 2) {
    return false;
  }
  return currentStep.value === 3 && isInSubLayoutMode.value && currentView.value !== 'main';
});

const layoutHeightMode = computed(() => (currentStep.value === 3 ? 'full' : 'auto'));

const shouldForceFullHeight = computed(() => {
  return currentStep.value === 3 && currentView.value !== 'main' && isInSubLayoutMode.value;
});

// ========== ✅ logUploadState - تعريف قبل الاستخدام ==========
const logUploadState = (label, extra = {}) => {
  console.log('🧭 [UploadPNG]', label, {
    routePath: route.path,
    routeQuery: route.query,
    currentStep: currentStep.value,
    currentView: currentView.value,
    layoutHeightMode: layoutHeightMode.value,
    useSubLayout: useSubLayout.value,
    shouldForceFullHeight: shouldForceFullHeight.value,
    forceInfosView: forceInfosView.value,
    isInSubLayoutMode: isInSubLayoutMode.value,
    showNewRight2: showNewRight2.value,
    currentReleaseId: releaseStore.currentReleaseId,
    songUuid: releaseStore.songUuid,
    ...extra
  });
};

// ========== video functions ==========
const openVideoPopup = (field) => {
  console.log('🎬 [UploadPNG] فتح فيديو Vimeo للحقل:', field);
  
  const videoIds = {
    'title': '480705053',
    'subtitle': '480705053',
    'songType': '480705053',
    'explicitLyrics': '480705053',
    'isrc': '480705053',
    'titleLanguage': '480705053',
    'textLanguage': '480705053',
    'fileUpload': '480705053'
  };
  
  videoId.value = videoIds[field] || '480705053';
  showVideoPopup.value = true;
  document.body.style.overflow = 'hidden';
};

const closeVideoPopup = () => {
  showVideoPopup.value = false;
  document.body.style.overflow = '';
  setTimeout(() => {
    videoId.value = '480705053';
  }, 300);
};

const handleVideoKeydown = (event) => {
  if (event.key === 'Escape' && showVideoPopup.value) {
    closeVideoPopup();
  }
};

// ========== navigation guards ==========
let isNavigatingFromWatch = false;
let isManualNavigation = false;
let isNavigatingFromNextStep = false;
let manualNavigationTimeout = null;
let isReturningFromSongEdit = false;
let isReturningFromPreRelease = false;

// ========== force infos view ==========
const forceInfosView = ref(false);

// ========== component refs ==========
const upload1ComponentRef = ref(null);
const upload2ComponentRef = ref(null);
const upload3ComponentRef = ref(null);
const upload4ComponentRef = ref(null);

let isUpdatingFromStore = false;
let isUpdatingToStore = false;

const setSongDetailsTabToInfos = () => {
  if (activeTab.value !== 'infos') {
    activeTab.value = 'infos';
    console.log('📌 [UploadPNG] تم ضبط تبويب تفاصيل الأغنية إلى infos');
  }
};

// ========== ✅ handleTabCompletionUpdate ==========
const handleTabCompletionUpdate = (completion) => {
  console.log('📌 [UploadPNG] Tab completion updated from PreReleaseLayout:', completion);
  
  if (completion && typeof completion === 'object') {
    releaseStore.updateTabCompletion(completion);
    console.log('📌 [UploadPNG] Store tabCompletion updated:', releaseStore.tabCompletion);
    
    window.dispatchEvent(new CustomEvent('tab-completion-updated', {
      detail: { tabCompletion: completion }
    }));
  }
};

// ========== setComponentRef ==========
const setComponentRef = (el) => {
  if (!el) {
    console.warn('⚠️ setComponentRef: el is null or undefined');
    return;
  }
  
  const step = props.currentStep || currentStep.value;
  
  console.log('📌 setComponentRef called with step:', step, 'el:', el.$el || el);
  
  if (step === 2) {
    upload1ComponentRef.value = el;
    console.log('📌 تم تعيين upload1ComponentRef');
  } else if (step === 3) {
    upload2ComponentRef.value = el;
    console.log('📌 تم تعيين upload2ComponentRef');
  } else if (step === 4) {
    upload3ComponentRef.value = el;
    console.log('📌 تم تعيين upload3ComponentRef');
  } else if (step === 5) {
    upload4ComponentRef.value = el;
    console.log('📌 تم تعيين upload4ComponentRef');
  } else {
    console.warn('⚠️ setComponentRef: unknown step:', step);
  }
};

// ========== tilt card effects ==========
const activeCorners = reactive({
  card1: null,
  card2: null,
  card3: null
});

const card1 = ref(null);
const card2 = ref(null);
const card3 = ref(null);
const cornerSize = 100;

const handleMouseMove = (event, cardId) => {
  const cardRef = { card1, card2, card3 }[cardId];
  const card = cardRef.value?.$el;
  if (!card || typeof card.getBoundingClientRect !== 'function') {
    return;
  }
  const rect = card.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const width = rect.width;
  const height = rect.height;

  let corner = null;
  if (x < cornerSize && y < cornerSize) {
    corner = 'tl';
  } else if (x > width - cornerSize && y < cornerSize) {
    corner = 'tr';
  } else if (x < cornerSize && y > height - cornerSize) {
    corner = 'bl';
  } else if (x > width - cornerSize && y > height - cornerSize) {
    corner = 'br';
  }

  activeCorners[cardId] = corner;
};

const handleMouseLeave = (cardId) => {
  activeCorners[cardId] = null;
};

// ========== skip upload state ==========
const shouldSkipCreation = ref(false);
const pendingReleaseType = ref(null);

// ========== edit mode ==========
const isEditMode = ref(false);
const isEditSongMode = ref(false);

// ========== layout refs ==========
const upload2LayoutRef = ref(null);
const stepLayoutRef = ref(null);

provide('upload2ComponentRef', upload2LayoutRef);

// ========== title tracking ==========
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

// ========== handleReleaseUpdated ==========
const handleReleaseUpdated = (data) => {
  console.log('📦 UploadPNG: استقبال حدث release-updated:', data);
  
  if (data?.data) {
    if (draftRelease.value) {
      draftRelease.value = {
        ...draftRelease.value,
        ...data.data
      };
    } else {
      draftRelease.value = data.data;
    }
    
    if (data.data.songs) {
      draftRelease.value.songs = data.data.songs;
      console.log('🎵 تم تحديث الأغاني في draftRelease:', data.data.songs.length, 'أغنية');
      
      const isEditSongModeLocal = route.name === 'edit-song' || props.editMode === 'song';
      const hasSongUuid = !!(props.songUuid || releaseStore.songUuid || route.params.songUuid || route.query.song);
      
      if (isEditSongModeLocal || hasSongUuid) {
        console.log('🎵 وضع تعديل الأغنية - الحفاظ على isMetasComplete');
        releaseStore.determineStepFromRelease(draftRelease.value, false, true);
      } else {
        releaseStore.determineStepFromRelease(draftRelease.value, false);
      }
    }
    
    if (data.data.title || data.data.subtitle || data.data.release_date || data.data.artists) {
      const artists = data.data.artists || draftRelease.value?.artists || [];
      releaseStore.updateMetasData({
        title: data.data.title || draftRelease.value?.title || '',
        subtitle: data.data.subtitle || draftRelease.value?.subtitle || '',
        releaseDate: data.data.release_date || draftRelease.value?.release_date || null,
        artists: artists,
        releasePrice: data.data.release_price || draftRelease.value?.release_price || null,
        songPrice: data.data.price_per_song || draftRelease.value?.price_per_song || null,
        mainGenre: data.data.main_genre || draftRelease.value?.main_genre || '',
        subGenre: data.data.sub_genre || draftRelease.value?.sub_genre || '',
        label: data.data.label || draftRelease.value?.label || '',
        productionYear: data.data.production_year || draftRelease.value?.production_year || null,
        cLineYear: data.data.c_line_year || draftRelease.value?.c_line_year || null,
        cLineName: data.data.c_line_name || draftRelease.value?.c_line_name || '',
        pLineYear: data.data.p_line_year || draftRelease.value?.p_line_year || null,
        pLineName: data.data.p_line_name || draftRelease.value?.p_line_name || '',
        gtin: data.data.GTIN || draftRelease.value?.GTIN || '',
        catalogNumber: data.data.catalog_number || draftRelease.value?.catalog_number || ''
      });
    }
    
    if (data.data.title) {
      currentTitle.value = data.data.title;
      console.log('📝 تحديث currentTitle من release-updated:', data.data.title);
    }
    
    if (data.data.cover) {
      const coverPath = data.data.cover;
      const coverUrl = coverPath.startsWith('http') ? coverPath : `${storage_url}/${coverPath}`;
      
      serverCoverUrl.value = coverUrl;
      uploadedImage.value = coverUrl;
      releaseStore.setServerCoverUrl(coverUrl);
      
      console.log('🖼️ تم تحديث serverCoverUrl من release-updated:', serverCoverUrl.value);
      console.log('🖼️ تم تحديث uploadedImage من release-updated:', uploadedImage.value);
      
      if (releaseStore && !releaseStore._startComplete) {
        releaseStore.setStartComplete(true);
      }
      
      try {
        localStorage.setItem('upload_server_cover_url', coverUrl);
      } catch (e) {
        console.warn('⚠️ فشل حفظ الصورة في localStorage:', e);
      }
    }
    
    console.log('✅ تم تحديث draftRelease:', draftRelease.value);
    console.log('📌 حالة Metas:', releaseStore.isMetasComplete);
    console.log('📌 حالة Songs:', releaseStore.isSongsComplete);
  }
};



// ========== تحليل بيانات الأغنية وتحديث tabCompletion ==========
const updateTabCompletionFromSong = (songData) => {
  if (!songData) return;
  
  console.log('📊 [UploadPNG] Updating tabCompletion from song data:', songData);
  
  // ✅ تحليل اكتمال كل تاب
  const infosComplete = 
    songData.title && 
    songData.title !== 'Song Titel' &&
    songData.title.trim() !== '' &&
    songData.explicit_lyrics !== null &&
    songData.explicit_lyrics !== undefined &&
    songData.explicit_lyrics !== '' &&
    songData.title_language !== null &&
    songData.title_language !== undefined &&
    songData.title_language !== '' &&
    songData.lyrics_language !== null &&
    songData.lyrics_language !== undefined &&
    songData.lyrics_language !== '';
  
  const urheberComplete = 
    (songData.authors?.composer && songData.authors.composer.length > 0 && songData.authors.composer.some(v => v?.trim())) ||
    (songData.authors?.lyricist && songData.authors.lyricist.length > 0 && songData.authors.lyricist.some(v => v?.trim()));
  
  const mitwirkendeComplete = 
    (songData.contributors?.artist && songData.contributors.artist.length > 0 && songData.contributors.artist.some(v => v?.name?.trim())) ||
    (songData.contributors?.producer && songData.contributors.producer.length > 0 && songData.contributors.producer.some(v => v?.name?.trim()));
  
  // ✅ deals دائماً true
  const dealsComplete = true;
  
  // ✅ pre-release دائماً true (لأنه غير مفعل)
  const preReleaseComplete = true;
  
  // ✅ تأكد من أن القيم boolean
  const completion = {
    infos: infosComplete === true ? true : false,
    urheber: urheberComplete === true ? true : false,
    mitwirkende: mitwirkendeComplete === true ? true : false,
    deals: true,
    'pre-release': true
  };
  
  console.log('📤 [UploadPNG] Updating Store tabCompletion:', completion);
  
  // ✅ تحديث Store مباشرة
  releaseStore.updateTabCompletion(completion);
  
  return completion;
};


// ========== setCurrentView ==========
const setCurrentView = (view) => {
  console.log('📢 [UploadPNG] setting currentView:', view);
  
  if (view === 'firstSection') {
    forceInfosView.value = false;
    isInSubLayoutMode.value = false;
  } else if (view === 'infos') {
    forceInfosView.value = true;
    isInSubLayoutMode.value = true;
  } else if (view === 'main') {
    forceInfosView.value = false;
    isInSubLayoutMode.value = false;
  }
  
  currentView.value = view;
};

// ========== isRealImage ==========
const isRealImage = (url) => {
  if (!url) return false;
  if (url === '/img/bgCardSongs/card1.png') return false;
  if (url.includes('bgCardSongs/card1.png')) return false;
  if (url.includes('storage')) return true;
  if (url.startsWith('blob:')) return true;
  if (url.startsWith('http://') || url.startsWith('https://')) return true;
  return false;
};

// ========== handleChangeSongType ==========
const handleChangeSongType = () => {
  console.log('📢 [UploadPNG] استقبال حدث change-song-type');
  
  currentView.value = 'main';
  topLineImage.value = null;
  showNewRight2.value = false;
  isInSubLayoutMode.value = false;
  forceInfosView.value = false;
  
  const currentQuery = { ...route.query };
  delete currentQuery.song;
  router.replace({ query: currentQuery });
  
  releaseStore.clearSongUuid();
  
  window.dispatchEvent(new CustomEvent('change-song-type'));
  
  console.log('✅ [UploadPNG] تم العودة إلى شاشة الكروت (main)');
};

// ========== handleBackToFirstSectionFromLayout ==========
const handleBackToFirstSectionFromLayout = () => {
  console.log('🔙 [UploadPNG] استقبال حدث back-to-first-section من PreReleaseLayout');
  
  isReturningFromSongEdit = true;
  isReturningFromPreRelease = true;
  
  forceInfosView.value = false;
  setCurrentView('firstSection');
  topLineImage.value = null;
  
  const currentQuery = { ...route.query };
  delete currentQuery.song;
  
  const targetReleaseId = releaseStore.currentReleaseId || releaseUuidFromUrl.value || props.releaseUuid;

  if (targetReleaseId) {
    router.replace({
      path: `/releases/${targetReleaseId}/edit`,
      query: currentQuery
    });
    console.log('🔗 [UploadPNG] تم التوجيه إلى:', `/releases/${targetReleaseId}/edit`);
  } else {
    router.replace({ query: currentQuery });
  }
  
  releaseStore.songUuid = null;
  
  setTimeout(() => {
    isReturningFromSongEdit = false;
    isReturningFromPreRelease = false;
    console.log('🔓 [UploadPNG] Reset return flags');
  }, 3000);
  
  console.log('✅ [UploadPNG] تم العودة إلى firstSection');
  console.log('📌 currentView:', currentView.value);
  console.log('📌 forceInfosView:', forceInfosView.value);
};

// ========== handleCoverRestored ==========
const handleCoverRestored = (data) => {
  console.log('🖼️ [UploadPNG] استقبال حدث cover-restored:', data);
  
  if (data?.coverUrl && isRealImage(data.coverUrl)) {
    console.log('🖼️ [UploadPNG] تحديث uploadedImage و serverCoverUrl من cover-restored:', data.coverUrl);
    uploadedImage.value = data.coverUrl;
    serverCoverUrl.value = data.coverUrl;
    releaseStore.setServerCoverUrl(data.coverUrl);
  }
};

// ========== handleUpdateCurrentView ==========
const handleUpdateCurrentView = (view) => {
  console.log('📢 [UploadPNG] currentView updated:', view);
  setCurrentView(view);
};

// ========== step suffixes ==========
const stepSuffixes = {
  0: '',
  1: ' ',
  2: ' – Metas',
  3: ' – Songs',
  4: ' – Shops',
  5: ' – Publish',
};

// ========== sectionTitle computed ==========
const sectionTitle = computed(() => {
  if (currentStep.value === 1 && showTypeSelection.value) {
    return '';
  }
  
  let baseTitle = '';
  
  const getTitleFromReleaseType = () => {
    const typeMap = {
      'single': 'DEINE NEUE SINGLE',
      'extended player': 'DEINE NEUE EP',
      'album': 'DEIN NEUES ALBUM',
      'DEINE NEUE SINGLE': 'DEINE NEUE SINGLE',
      'DEINE NEUE EP': 'DEINE NEUE EP',
      'DEIN NEUES ALBUM': 'DEIN NEUES ALBUM'
    };
    
    let releaseTypeKey = releaseStore.releaseTypeValue || releaseStore.releaseType || 'single';
    
    if (typeof releaseTypeKey === 'string' && releaseTypeKey.includes('DEINE NEUE')) {
      if (releaseTypeKey.includes('SINGLE')) releaseTypeKey = 'single';
      else if (releaseTypeKey.includes('EP')) releaseTypeKey = 'extended player';
      else if (releaseTypeKey.includes('ALBUM')) releaseTypeKey = 'album';
    }
    
    return typeMap[releaseTypeKey] || 'DEINE NEUE SINGLE';
  };
  
  if (currentStep.value === 1) {
    baseTitle = getTitleFromReleaseType();
  } 
  else if (currentStep.value === 3) {
    if (currentView.value === 'firstSection') {
      let releaseTitle = '';
      if (releaseStore.metasData?.title && releaseStore.metasData.title.trim() !== '') {
        releaseTitle = releaseStore.metasData.title;
      } else if (draftRelease.value?.title && draftRelease.value.title.trim() !== '') {
        releaseTitle = draftRelease.value.title;
      } else {
        releaseTitle = getTitleFromReleaseType();
      }
      baseTitle = `${releaseTitle} – Songs`;
    } 
    else if (currentView.value === 'main') {
      let releaseTitle = '';
      if (releaseStore.metasData?.title && releaseStore.metasData.title.trim() !== '') {
        releaseTitle = releaseStore.metasData.title;
      } else if (draftRelease.value?.title && draftRelease.value.title.trim() !== '') {
        releaseTitle = draftRelease.value.title;
      } else {
        releaseTitle = getTitleFromReleaseType();
      }
      baseTitle = releaseTitle;
    } 
    else if (currentView.value === 'infos') {
      const songNumber = releaseStore.currentSongNumber || '01';
      const songTitle = releaseStore.currentSongTitle || '';
      
      const releaseTitle = releaseStore.metasData?.title || draftRelease?.value?.title || '';
      
      if (songTitle && songTitle.trim() !== '' && songTitle !== 'Song Titel' && songTitle !== releaseTitle) {
        baseTitle = `${songNumber} ${songTitle}`;
      } else {
        baseTitle = `${songNumber} Song Titel`;
      }
    }
  } 
  else {
    baseTitle = currentTitle.value?.trim();
    if (!baseTitle && draftRelease.value?.title) {
      baseTitle = draftRelease.value.title.trim();
    }
    if (!baseTitle) {
      baseTitle = getTitleFromReleaseType();
    }
  }
  
  let suffix = '';
  if (currentStep.value === 3 && currentView.value === 'firstSection') {
    suffix = '';
  } else if (currentStep.value === 3 && currentView.value === 'infos') {
    suffix = '';
  } else if (currentStep.value === 3 && currentView.value === 'main') {
    suffix = '';
  } else {
    suffix = stepSuffixes[currentStep.value] || '';
  }
  
  const fullTitle = baseTitle + suffix;
  
  if (baseTitle !== previousBaseTitle.value) {
    console.log('📋 sectionTitle recomputed:', {
      step: currentStep.value,
      baseTitle,
      suffix,
      fullTitle,
      currentView: currentView.value,
      songNumber: releaseStore.currentSongNumber,
      songTitle: releaseStore.currentSongTitle
    });
    previousBaseTitle.value = baseTitle;
  }
  
  return fullTitle;
});

// ========== watch releaseType ==========
watch(
  () => [releaseStore.releaseType, releaseStore.releaseTypeValue],
  () => {
    previousBaseTitle.value = '';
    console.log('📌 [UploadPNG] releaseType changed, updating title');
  },
  { immediate: true }
);

// ========== navigation functions ==========
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

const navigateToCreateRelease = () => {
  console.log('🆕 التنقل إلى إنشاء Release جديد');
  router.push({
    path: '/create-release'
  });
};

// ========== isMetasComplete ==========
const isMetasComplete = () => {
  console.log('🔍 isMetasComplete called, upload1ComponentRef:', upload1ComponentRef.value);
  
  if (!upload1ComponentRef.value) {
    console.log('⚠️ upload1ComponentRef غير متوفر بعد');
    if (currentStep.value === 3) {
      console.log('✅ currentStep هو 3، نعتبر Metas مكتملة');
      return true;
    }
    return false;
  }
  
  const artistInputs = upload1ComponentRef.value.artistInputs;
  const searchQuery2 = upload1ComponentRef.value.searchQuery2;
  const selectedDateValue = upload1ComponentRef.value.selectedDate;
  
  const hasValidArtist = artistInputs && 
                         artistInputs.length > 0 && 
                         artistInputs.some(input => input.searchQuery && input.searchQuery.trim() !== '');
  
  if (!hasValidArtist) {
    console.warn('⚠️ لا يمكن الانتقال: يجب إضافة فنان واحد على الأقل');
    return false;
  }
  
  if (!searchQuery2 || searchQuery2.trim() === '') {
    console.warn('⚠️ لا يمكن الانتقال: يجب إدخال عنوان (Title)');
    return false;
  }
  
  if (!selectedDateValue || selectedDateValue.trim() === '') {
    console.warn('⚠️ لا يمكن الانتقال: يجب اختيار تاريخ الإصدار (Release Date)');
    return false;
  }
  
  console.log('✅ جميع الحقول المطلوبة في Metas مستوفية');
  return true;
};

// ========== removeSkipFromUrl ==========
const removeSkipFromUrl = () => {
  const currentQuery = { ...route.query };
  let hasChanges = false;
  
  if (currentQuery.skip) {
    delete currentQuery.skip;
    hasChanges = true;
  }
  if (currentQuery.preserve) {
    delete currentQuery.preserve;
    hasChanges = true;
  }
  
  if (hasChanges) {
    router.replace({ query: currentQuery });
    console.log('🗑️ تم إزالة skip/preserve من الـ URL');
  }
};

// ========== handleGoBackToTypeSelection ==========
const handleGoBackToTypeSelection = () => {
  console.log('🔙 [UploadPNG] العودة إلى اختيار نوع الـ Release');
  
  const currentReleaseId = releaseStore.currentReleaseId || releaseUuidFromUrl.value || props.releaseUuid;
  
  if (currentReleaseId) {
    console.log('📌 يوجد releaseId، العودة إلى UploadComponent (الخطوة 1) بدلاً من كروت الاختيار');
    
    showTypeSelection.value = false;
    currentStep.value = 1;
    releaseStore.setCurrentStep(1);
    
    try {
      localStorage.removeItem('upload_server_cover_url');
    } catch (e) {
      console.warn('⚠️ Could not remove upload_server_cover_url:', e);
    }
    
    router.replace({
      path: `/releases/${currentReleaseId}/edit`,
      query: { step: 1 }
    });
    return;
  }
  
  console.log('📌 لا يوجد releaseId، عرض كروت اختيار نوع الـ Release');
  
  releaseStore.releaseType = null;
  releaseStore.releaseTypeValue = null;
  releaseStore.currentReleaseId = null;
  releaseUuidFromUrl.value = null;
  releaseStore._startComplete = false;
  releaseStore.draftRelease = null;
  releaseStore.serverCoverUrl = null;
  serverCoverUrl.value = defaultBackgroundImage.value;
  uploadedImage.value = null;
  draftRelease.value = null;
  currentStep.value = 1;
  releaseStore.setCurrentStep(1);
  
  try {
    localStorage.removeItem('upload_server_cover_url');
    localStorage.removeItem('upload2_state');
    localStorage.removeItem('upload2_selectedType');
    localStorage.removeItem('last_metas_page');
  } catch (e) {
    console.warn('⚠️ Could not clear localStorage:', e);
  }
  
  showTypeSelection.value = true;
  
  const { step, lastPage, showTypeSelection: _, ...restQuery } = route.query;
  router.replace({ 
    query: { ...restQuery, showTypeSelection: 'true' }
  });
  
  console.log('✅ تم العودة إلى اختيار نوع الـ Release');
};

const fetchRelease = async () => {
  if (shouldSkipCreation.value || route.query.skip === 'true' || route.query.new === 'true') {
    console.log('⏭️ وضع التخطي نشط - تم إلغاء جلب المسودة');
    serverCoverUrl.value = defaultBackgroundImage.value;
    return;
  }
  
  const isNewRelease = !props.releaseUuid && !releaseUuidFromUrl.value && route.path === '/create-release';
  
  if (isNewRelease) {
    console.log('🆕 إنشاء Release جديد - لا نجلب بيانات قديمة');
    serverCoverUrl.value = defaultBackgroundImage.value;
    draftRelease.value = null;
    return;
  }
  
  if (releaseStore.currentReleaseId && !props.releaseUuid && !releaseUuidFromUrl.value) {
    console.log('🆕 لدينا Release جديد، لا نجلب مسودة قديمة');
    return;
  }

  const isEditReleaseMode = route.name === 'edit-release' || props.editMode === 'release';
  const isEditSongModeLocal = route.name === 'edit-song' || props.editMode === 'song';
  
  const stepFromQuery = route.query.step ? parseInt(route.query.step) : null;
  const hasStepInQuery = stepFromQuery !== null && stepFromQuery >= 1 && stepFromQuery <= 5;
  
  const hasSongUuid = !!(props.songUuid || releaseStore.songUuid || route.params.songUuid || route.query.song);
  
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
        
        // ✅ تحديث tabCompletion من الأغاني
        if (release.songs && release.songs.length > 0) {
          // ✅ إذا كان هناك songUuid محدد، استخدمه
          const targetSongUuid = props.songUuid || releaseStore.songUuid || route.params.songUuid || route.query.song;
          
          if (targetSongUuid) {
            // ✅ ابحث عن الأغنية المحددة
            const targetSong = release.songs.find(s => s.uuid === targetSongUuid);
            if (targetSong) {
              console.log('🎵 [UploadPNG] تحديث tabCompletion من الأغنية المحددة:', targetSong.uuid);
              updateTabCompletionFromSong(targetSong);
            } else {
              // ✅ إذا لم يتم العثور على الأغنية، استخدم أول أغنية
              console.log('🎵 [UploadPNG] تحديث tabCompletion من أول أغنية (لم يتم العثور على الأغنية المحددة)');
              updateTabCompletionFromSong(release.songs[0]);
            }
          } else {
            // ✅ إذا لم يكن هناك songUuid، استخدم أول أغنية
            console.log('🎵 [UploadPNG] تحديث tabCompletion من أول أغنية (بدون songUuid)');
            updateTabCompletionFromSong(release.songs[0]);
          }
        }
        
        const hasTitle = release.title && release.title.trim() !== '';
        const hasArtists = release.artists && release.artists.length > 0;
        const hasReleaseDate = release.release_date;
        
        releaseStore.updateMetasData({
          title: release.title || '',
          subtitle: release.subtitle || '',
          releaseDate: release.release_date || null,
          artists: release.artists || [],
          releasePrice: release.release_price || null,
          songPrice: release.price_per_song || null,
          mainGenre: release.main_genre || '',
          subGenre: release.sub_genre || '',
          label: release.label || '',
          productionYear: release.production_year || null,
          cLineYear: release.c_line_year || null,
          cLineName: release.c_line_name || '',
          pLineYear: release.p_line_year || null,
          pLineName: release.p_line_name || '',
          gtin: release.GTIN || '',
          catalogNumber: release.catalog_number || ''
        });
        
        const hasStores = release.stores && release.stores.length > 0;
        if (releaseStore.isShopsComplete !== hasStores) {
          releaseStore.setShopsComplete(hasStores);
        }
        
        const isPublishReady = release.status === 'draft' && 
                               (hasTitle && hasArtists && hasReleaseDate) && 
                               release.songs && release.songs.length > 0 && 
                               releaseStore.isSongsComplete && 
                               hasStores;
        if (releaseStore.isPublishComplete !== isPublishReady) {
          releaseStore.setPublishComplete(isPublishReady);
        }
        
        if (release.title) {
          currentTitle.value = release.title;
        }
        
        if (release.cover) {
          const coverPath = release.cover;
          const coverUrl = coverPath.startsWith('http') ? coverPath : `${storage_url}/${coverPath}`;
          serverCoverUrl.value = coverUrl;
          uploadedImage.value = coverUrl;
          releaseStore.setServerCoverUrl(coverUrl);
          
          console.log('🖼️ تم تحديث serverCoverUrl من fetchRelease:', serverCoverUrl.value);
          console.log('🖼️ تم تحديث uploadedImage من fetchRelease:', uploadedImage.value);
          
          if (releaseStore && !releaseStore._startComplete) {
            releaseStore.setStartComplete(true);
          }
        } else {
          serverCoverUrl.value = null;
          uploadedImage.value = null;
        }
        
        if (isReturningFromPreRelease) {
          console.log('⏭️ [UploadPNG] Returning from Pre-Release, skipping step update in fetchRelease');
          releaseStore.determineStepFromRelease(release, false);
        }

        if (isEditSongModeLocal || hasSongUuid) {
          console.log('🎵 وضع تعديل الأغنية أو وجود songUuid - الحفاظ على isMetasComplete');
          releaseStore.determineStepFromRelease(release, false, true);
        }
        else if (isEditReleaseMode) {
          console.log('✏️ وضع تعديل الـ Release');
          
          showTypeSelection.value = false;
          
          if (hasStepInQuery) {
            console.log(`📌 استخدام step من query: ${stepFromQuery}`);
            currentStep.value = stepFromQuery;
            releaseStore.setCurrentStep(stepFromQuery);
            
            if (stepFromQuery === 2) {
              releaseStore.determineStepFromRelease(release, false, true);
            }
          } else {
            const determinedStep = releaseStore.determineStepFromRelease(release, true, true);
            console.log(`📌 الخطوة المحددة من البيانات: ${determinedStep}`);
            currentStep.value = determinedStep;
            releaseStore.setCurrentStep(determinedStep);
          }
        }
        else {
          console.log('📌 الوضع الافتراضي - الحفاظ على isMetasComplete');
          const determinedStep = releaseStore.determineStepFromRelease(release, true, true);
          console.log(`📌 الخطوة المحددة من البيانات: ${determinedStep}`);
          currentStep.value = determinedStep;
          releaseStore.setCurrentStep(determinedStep);
        }
        
        showTypeSelection.value = false;
        
        selectedDate.value = release.release_date 
          ? dayjs(release.release_date).format('DD/MM/YY') 
          : null;
        console.log('📅 UploadPNG: تم تعيين selectedDate من props:', selectedDate.value);
        
        console.log('✅ تم تحميل Release من props:', release.uuid);
        console.log('📌 currentStep:', currentStep.value);
        console.log('📌 isMetasComplete:', releaseStore.isMetasComplete);
        console.log('📌 isSongsComplete:', releaseStore.isSongsComplete);
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
        
        // ✅ تحديث tabCompletion من الأغاني
        if (release.songs && release.songs.length > 0) {
          // ✅ إذا كان هناك songUuid محدد، استخدمه
          const targetSongUuid = props.songUuid || releaseStore.songUuid || route.params.songUuid || route.query.song;
          
          if (targetSongUuid) {
            // ✅ ابحث عن الأغنية المحددة
            const targetSong = release.songs.find(s => s.uuid === targetSongUuid);
            if (targetSong) {
              console.log('🎵 [UploadPNG] تحديث tabCompletion من الأغنية المحددة (من الرابط):', targetSong.uuid);
              updateTabCompletionFromSong(targetSong);
            } else {
              console.log('🎵 [UploadPNG] تحديث tabCompletion من أول أغنية (من الرابط، لم يتم العثور على الأغنية المحددة)');
              updateTabCompletionFromSong(release.songs[0]);
            }
          } else {
            console.log('🎵 [UploadPNG] تحديث tabCompletion من أول أغنية (من الرابط، بدون songUuid)');
            updateTabCompletionFromSong(release.songs[0]);
          }
        }
        
        const hasTitle = release.title && release.title.trim() !== '';
        const hasArtists = release.artists && release.artists.length > 0;
        const hasReleaseDate = release.release_date;
        
        releaseStore.updateMetasData({
          title: release.title || '',
          subtitle: release.subtitle || '',
          releaseDate: release.release_date || null,
          artists: release.artists || [],
          releasePrice: release.release_price || null,
          songPrice: release.price_per_song || null,
          mainGenre: release.main_genre || '',
          subGenre: release.sub_genre || '',
          label: release.label || '',
          productionYear: release.production_year || null,
          cLineYear: release.c_line_year || null,
          cLineName: release.c_line_name || '',
          pLineYear: release.p_line_year || null,
          pLineName: release.p_line_name || '',
          gtin: release.GTIN || '',
          catalogNumber: release.catalog_number || ''
        });
        
        const hasStores = release.stores && release.stores.length > 0;
        if (releaseStore.isShopsComplete !== hasStores) {
          releaseStore.setShopsComplete(hasStores);
        }
        
        const isPublishReady = release.status === 'draft' && 
                               (hasTitle && hasArtists && hasReleaseDate) && 
                               release.songs && release.songs.length > 0 && 
                               releaseStore.isSongsComplete && 
                               hasStores;
        if (releaseStore.isPublishComplete !== isPublishReady) {
          releaseStore.setPublishComplete(isPublishReady);
        }
        
        if (release.title) {
          currentTitle.value = release.title;
        }
        
        const hasSongUuidLocal = !!(props.songUuid || releaseStore.songUuid || route.params.songUuid || route.query.song);
        
        if (release.cover) {
          const coverPath = release.cover;
          const coverUrl = coverPath.startsWith('http') ? coverPath : `${storage_url}/${coverPath}`;
          serverCoverUrl.value = coverUrl;
          uploadedImage.value = coverUrl;
          releaseStore.setServerCoverUrl(coverUrl);
        } else {
          serverCoverUrl.value = defaultBackgroundImage.value;
          uploadedImage.value = null;
        }
        
        if (isEditSongModeLocal || hasSongUuidLocal) {
          console.log('🎵 وضع تعديل الأغنية أو وجود songUuid - الحفاظ على isMetasComplete');
          releaseStore.determineStepFromRelease(release, false, true);
        }
        else if (isEditReleaseMode) {
          console.log('✏️ وضع تعديل الـ Release');
          
          if (hasStepInQuery) {
            console.log(`📌 استخدام step من query: ${stepFromQuery}`);
            currentStep.value = stepFromQuery;
            releaseStore.setCurrentStep(stepFromQuery);
            
            if (stepFromQuery === 2) {
              releaseStore.determineStepFromRelease(release, false, true);
            }
          } else {
            const determinedStep = releaseStore.determineStepFromRelease(release, true, true);
            console.log(`📌 الخطوة المحددة من البيانات: ${determinedStep}`);
            currentStep.value = determinedStep;
            releaseStore.setCurrentStep(determinedStep);
          }
        }
        else {
          console.log('📌 الوضع الافتراضي - الحفاظ على isMetasComplete');
          const determinedStep = releaseStore.determineStepFromRelease(release, true, true);
          console.log(`📌 الخطوة المحددة من البيانات: ${determinedStep}`);
          currentStep.value = determinedStep;
          releaseStore.setCurrentStep(determinedStep);
        }
        
        showTypeSelection.value = false;
        
        selectedDate.value = release.release_date 
          ? dayjs(release.release_date).format('DD/MM/YY') 
          : null;
        console.log('📅 UploadPNG: تم تعيين selectedDate من الرابط:', selectedDate.value);
        
        console.log('✅ تم تحميل Release من الرابط:', release.uuid);
        console.log('📌 currentStep:', currentStep.value);
        console.log('📌 isMetasComplete:', releaseStore.isMetasComplete);
        console.log('📌 isSongsComplete:', releaseStore.isSongsComplete);
      }
      return;
    }
    
    if (route.path === '/create-release') {
      console.log('📋 مسار /create-release فقط - إنشاء Release جديد');
      showTypeSelection.value = true;
      releaseStore.releaseType = null;
      releaseStore.currentReleaseId = null;
      serverCoverUrl.value = defaultBackgroundImage.value;
      draftRelease.value = null;
      currentStep.value = 1;
      releaseStore.setCurrentStep(1);
      return;
    }
    
    console.log('📡 جلب آخر مسودة');
    const response = await apiRequest.get('/releases');
    const releases = response.data?.data || [];
    
    if (releases.length === 0) {
      showTypeSelection.value = true;
      releaseStore.releaseType = null;
      releaseStore.currentReleaseId = null;
      serverCoverUrl.value = defaultBackgroundImage.value;
      return;
    }

    const latestDraft = releases
      .filter(r => r.status === 'draft')
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];

    if (latestDraft) {
      draftRelease.value = latestDraft;
      releaseStore.setReleaseType(latestDraft.release_type);
      releaseStore.setCurrentReleaseId(latestDraft.uuid);
      
      // ✅ تحديث tabCompletion من الأغاني
      if (latestDraft.songs && latestDraft.songs.length > 0) {
        // ✅ إذا كان هناك songUuid محدد، استخدمه
        const targetSongUuid = props.songUuid || releaseStore.songUuid || route.params.songUuid || route.query.song;
        
        if (targetSongUuid) {
          // ✅ ابحث عن الأغنية المحددة
          const targetSong = latestDraft.songs.find(s => s.uuid === targetSongUuid);
          if (targetSong) {
            console.log('🎵 [UploadPNG] تحديث tabCompletion من الأغنية المحددة (آخر مسودة):', targetSong.uuid);
            updateTabCompletionFromSong(targetSong);
          } else {
            console.log('🎵 [UploadPNG] تحديث tabCompletion من أول أغنية (آخر مسودة، لم يتم العثور على الأغنية المحددة)');
            updateTabCompletionFromSong(latestDraft.songs[0]);
          }
        } else {
          console.log('🎵 [UploadPNG] تحديث tabCompletion من أول أغنية (آخر مسودة، بدون songUuid)');
          updateTabCompletionFromSong(latestDraft.songs[0]);
        }
      }
      
      const hasTitle = latestDraft.title && latestDraft.title.trim() !== '';
      const hasArtists = latestDraft.artists && latestDraft.artists.length > 0;
      const hasReleaseDate = latestDraft.release_date;
      
      releaseStore.updateMetasData({
        title: latestDraft.title || '',
        subtitle: latestDraft.subtitle || '',
        releaseDate: latestDraft.release_date || null,
        artists: latestDraft.artists || [],
        releasePrice: latestDraft.release_price || null,
        songPrice: latestDraft.price_per_song || null,
        mainGenre: latestDraft.main_genre || '',
        subGenre: latestDraft.sub_genre || '',
        label: latestDraft.label || '',
        productionYear: latestDraft.production_year || null,
        cLineYear: latestDraft.c_line_year || null,
        cLineName: latestDraft.c_line_name || '',
        pLineYear: latestDraft.p_line_year || null,
        pLineName: latestDraft.p_line_name || '',
        gtin: latestDraft.GTIN || '',
        catalogNumber: latestDraft.catalog_number || ''
      });
      
      const hasSongUuidLocal = !!(props.songUuid || releaseStore.songUuid || route.params.songUuid || route.query.song);
      
      if (isEditSongModeLocal || hasSongUuidLocal) {
        console.log('🎵 وضع تعديل الأغنية أو وجود songUuid - الحفاظ على isMetasComplete');
        releaseStore.determineStepFromRelease(latestDraft, false, true);
      }
      else if (isEditReleaseMode) {
        console.log('✏️ وضع تعديل الـ Release');
        
        if (hasStepInQuery) {
          console.log(`📌 استخدام step من query: ${stepFromQuery}`);
          currentStep.value = stepFromQuery;
          releaseStore.setCurrentStep(stepFromQuery);
        } else {
          const determinedStep = releaseStore.determineStepFromRelease(latestDraft, true, true);
          console.log(`📌 الخطوة المحددة من البيانات: ${determinedStep}`);
          currentStep.value = determinedStep;
          releaseStore.setCurrentStep(determinedStep);
        }
      }
      else {
        console.log('📌 الوضع الافتراضي - الحفاظ على isMetasComplete');
        const determinedStep = releaseStore.determineStepFromRelease(latestDraft, true, true);
        console.log(`📌 الخطوة المحددة من البيانات: ${determinedStep}`);
        currentStep.value = determinedStep;
        releaseStore.setCurrentStep(determinedStep);
      }
      
      selectedDate.value = latestDraft.release_date 
        ? dayjs(latestDraft.release_date).format('DD/MM/YY') 
        : null;
      console.log('📅 UploadPNG: تم تعيين selectedDate من آخر مسودة:', selectedDate.value);
      
      showTypeSelection.value = false;
    }
  } catch (err) {
    console.error('❌ فشل جلب الـ Release:', err);
    serverCoverUrl.value = defaultBackgroundImage.value;
  } finally {
    isLoadingDraft.value = false;
  }
};

// ========== watch showTypeSelection query ==========
watch(() => route.query.showTypeSelection, (newVal) => {
  if (newVal === 'true') {
    console.log('📌 showTypeSelection=true في query');
    
    const currentReleaseId = releaseStore.currentReleaseId || releaseUuidFromUrl.value || props.releaseUuid;
    
    if (currentReleaseId) {
      console.log('📌 يوجد releaseId، تجاهل showTypeSelection والعودة إلى UploadComponent');
      showTypeSelection.value = false;
      
      releaseStore.currentReleaseId = null;
      releaseUuidFromUrl.value = null;
      releaseStore.draftRelease = null;
      releaseStore.serverCoverUrl = null;
      serverCoverUrl.value = defaultBackgroundImage.value;
      uploadedImage.value = null;
      draftRelease.value = null;
      
      const { showTypeSelection: _, ...restQuery } = route.query;
      router.replace({ query: restQuery });
      return;
    }
    
    showTypeSelection.value = true;
  } else {
    const currentReleaseId = releaseStore.currentReleaseId || releaseUuidFromUrl.value || props.releaseUuid;
    
    if (currentReleaseId) {
      showTypeSelection.value = false;
    } else if (!releaseStore.releaseType && route.path === '/create-release') {
      showTypeSelection.value = true;
      router.replace({ 
        query: { ...route.query, showTypeSelection: 'true' } 
      });
    }
  }
}, { immediate: true });

// ========== selectReleaseType ==========
const selectReleaseType = (type) => {
  console.log('📌 تم اختيار نوع الـ Release:', type);
  
  removeSkipFromUrl();
  
  let releaseTypeText = '';
  let releaseTypeValue = type;
  switch (type) {
    case 'single':
      releaseTypeText = 'DEINE NEUE SINGLE';
      releaseTypeValue = 'single';
      break;
    case 'extended player':
      releaseTypeText = 'DEINE NEUE EP';
      releaseTypeValue = 'extended player';
      break;
    case 'album':
      releaseTypeText = 'DEIN NEUES ALBUM';
      releaseTypeValue = 'album';
      break;
    default:
      releaseTypeText = 'DEINE NEUE SINGLE';
      releaseTypeValue = 'single';
  }
  
  releaseStore.setReleaseType(releaseTypeText);
  releaseStore.releaseTypeValue = releaseTypeValue;
  
  previousBaseTitle.value = '';
  
  console.log('📌 تم حفظ نوع الـ Release:', { 
    type: releaseTypeText, 
    value: releaseTypeValue 
  });
  
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('store-updated', {
      detail: { 
        type: 'release-type-changed',
        releaseType: releaseTypeText,
        releaseTypeValue: releaseTypeValue,
        timestamp: Date.now()
      }
    }));
  }
  
  const currentReleaseId = releaseStore.currentReleaseId || releaseUuidFromUrl.value || props.releaseUuid;
  
  const { showTypeSelection: _, ...restQuery } = route.query;
  
  if (currentReleaseId) {
    console.log('📌 وضع التعديل - الانتقال إلى Metas (step 2) مع الحفاظ على الـ Release');
    showTypeSelection.value = false;
    currentStep.value = 2;
    releaseStore.setCurrentStep(2);
    
    const savedPage = localStorage.getItem('last_metas_page') || 'right';
    router.replace({
      path: `/releases/${currentReleaseId}/edit`,
      query: { ...restQuery, step: 2, lastPage: savedPage }
    });
  } else {
    console.log('📌 وضع الإنشاء الجديد - الانتقال إلى UploadComponent (الخطوة 1)');
    showTypeSelection.value = false;
    currentStep.value = 1;
    releaseStore.setCurrentStep(1);
    router.replace({ query: restQuery });
  }
  
  console.log('📌 تم حفظ نوع الـ Release:', releaseTypeValue);
};

// ========== watch metasPage ==========
watch(() => releaseStore.metasPage, (newPage) => {
  console.log('📌 [UploadPNG] metasPage changed to:', newPage);
  
  if (newPage === 'newRight2') {
    showNewRight2.value = true;
    console.log('📌 [UploadPNG] showNewRight2 set to true (newRight2)');
  } else if (newPage === 'newRight') {
    showNewRight2.value = false;
    console.log('📌 [UploadPNG] showNewRight2 set to false (newRight)');
  } else {
    showNewRight2.value = false;
    console.log('📌 [UploadPNG] showNewRight2 set to false (right)');
  }
}, { immediate: true });

// ========== watch currentStep ==========
watch(currentStep, (newStep, oldStep) => {
  if (isUpdatingFromStore) return;
  
  console.log('[UploadPNG] currentStep تغير من', oldStep, 'إلى', newStep);
  
  if (oldStep === 3 && newStep === 2) {
    console.log('📌 [UploadPNG] الانتقال من Songs إلى Metas - إلغاء SubLayout');
    
    isInSubLayoutMode.value = false;
    forceInfosView.value = false;
    setCurrentView('main');
    
    if (releaseStore.currentStep !== newStep && !isUpdatingToStore) {
      isUpdatingToStore = true;
      releaseStore.setCurrentStep(newStep);
      setTimeout(() => {
        isUpdatingToStore = false;
      }, 100);
    }
    
    window.dispatchEvent(new CustomEvent('keep-songs-state', {
      detail: { from: 'songs', to: 'metas' }
    }));
    
    return;
  }
  
  if (oldStep === 2 && newStep === 3) {
    console.log('📌 [UploadPNG] الانتقال من Metas إلى Songs');
    setCurrentView('firstSection');
  }
  
  if (releaseStore.currentStep !== newStep && !isUpdatingToStore) {
    isUpdatingToStore = true;
    releaseStore.setCurrentStep(newStep);
    setTimeout(() => {
      isUpdatingToStore = false;
    }, 100);
  }
  
  if (newStep === 4 && oldStep === 3 && releaseStore.songUuid) {
    releaseStore.clearSongUuid();
    const currentQuery = { ...route.query };
    delete currentQuery.song;
    router.replace({ query: currentQuery });
  }
}, { deep: true });

// ========== getComponentByStep ==========
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
// ========== nextStep ==========
const nextStep = () => {
  console.log('📌 [UploadPNG] nextStep called!');
  console.log('📌 [UploadPNG] currentStep before:', currentStep.value);
  
  if (currentStep.value < 5) {
    const nextStepValue = currentStep.value + 1;
    console.log('📌 [UploadPNG] Moving to step:', nextStepValue);
    currentStep.value = nextStepValue;
    releaseStore.setCurrentStep(nextStepValue);
    console.log('📌 [UploadPNG] currentStep after:', currentStep.value);
  } else {
    console.log('📌 [UploadPNG] Already at last step');
  }
};
// ========== handleReleaseCreated ==========
const handleReleaseCreated = async (data) => {
  console.log('📦 UploadPNG: استقبال حدث release-created:', data);
  
  if (data?.releaseId) {
    shouldSkipCreation.value = false;
    releaseStore.currentReleaseId = data.releaseId;
    pendingReleaseType.value = null;
    
    if (data.coverUrl && isRealImage(data.coverUrl)) {
      let fullCoverUrl = data.coverUrl;
      if (!fullCoverUrl.startsWith('http://') && !fullCoverUrl.startsWith('https://')) {
        fullCoverUrl = `${storage_url}/${data.coverUrl}`;
      }
      serverCoverUrl.value = fullCoverUrl;
      uploadedImage.value = fullCoverUrl;
      console.log('🖼️ تم تحديث serverCoverUrl من release-created:', serverCoverUrl.value);
      console.log('🖼️ تم تحديث uploadedImage من release-created:', uploadedImage.value);
      
      if (releaseStore && !releaseStore._startComplete) {
        releaseStore.setStartComplete(true);
      }
    } else {
      serverCoverUrl.value = null;
      uploadedImage.value = null;
      console.log('🖼️ لا توجد صورة حقيقية، serverCoverUrl = null');
    }
    
    console.log('🔗 تم تحديث releaseId:', data.releaseId);
    
    try {
      console.log('📡 جلب تفاصيل الـ Release الجديد:', data.releaseId);
      const response = await apiRequest.get(`/releases/${data.releaseId}`);
      if (response.data?.data) {
        draftRelease.value = response.data.data;
        
        if (response.data.data.title) {
          currentTitle.value = response.data.data.title;
        }
        
        if (response.data.data.cover && isRealImage(response.data.data.cover)) {
          const coverPath = response.data.data.cover;
          const coverUrl = coverPath.startsWith('http') ? coverPath : `${storage_url}/${coverPath}`;
          serverCoverUrl.value = coverUrl;
          uploadedImage.value = coverUrl;
          console.log('🖼️ تم تحديث serverCoverUrl من fetchRelease:', serverCoverUrl.value);
          console.log('🖼️ تم تحديث uploadedImage من fetchRelease:', uploadedImage.value);
          
          if (releaseStore && !releaseStore._startComplete) {
            releaseStore.setStartComplete(true);
          }
          
          try {
            localStorage.setItem('upload_server_cover_url', coverUrl);
            console.log('💾 تم حفظ الصورة في localStorage');
          } catch (e) {
            console.warn('⚠️ فشل حفظ الصورة في localStorage:', e);
          }
        } else if (data.coverUrl && isRealImage(data.coverUrl)) {
          serverCoverUrl.value = data.coverUrl;
          uploadedImage.value = data.coverUrl;
          console.log('🖼️ استخدام الصورة من data.coverUrl:', serverCoverUrl.value);
        } else {
          serverCoverUrl.value = null;
          uploadedImage.value = null;
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
      releaseStore.setCurrentStep(2);
    } else {
      console.log('ℹ️ يوجد songUuid، البقاء في currentStep:', currentStep.value);
    }
    
    const currentQuery = { ...route.query };
    let hasChanges = false;
    if (currentQuery.skip) {
      delete currentQuery.skip;
      hasChanges = true;
    }
    if (currentQuery.preserve) {
      delete currentQuery.preserve;
      hasChanges = true;
    }
    if (hasChanges) {
      router.replace({ query: currentQuery });
      console.log('🗑️ تم إزالة skip/preserve من الـ URL');
    }
    
    console.log('✅ Release created, staying on current page with step 2');
  }
};

// ========== handleCoverUpdated ==========
const handleCoverUpdated = (data) => {
  console.log('🖼️ UploadPNG: استقبال حدث cover-updated:', data);
  if (data?.coverUrl && isRealImage(data.coverUrl)) {
    serverCoverUrl.value = data.coverUrl;
    uploadedImage.value = data.coverUrl;
    releaseStore.setServerCoverUrl(data.coverUrl);
    console.log('🖼️ تم تحديث serverCoverUrl من cover-updated:', serverCoverUrl.value);
    console.log('🖼️ تم تحديث uploadedImage من cover-updated:', uploadedImage.value);
    
    if (releaseStore && !releaseStore._startComplete) {
      releaseStore.setStartComplete(true);
    }
  } else {
    serverCoverUrl.value = defaultBackgroundImage.value;
    uploadedImage.value = null;
    console.log('🖼️ تم إعادة تعيين الصورة إلى الافتراضية');
  }
};

// ========== sub layout functions ==========
const enterSubLayout = () => { isInSubLayoutMode.value = true; };
const exitSubLayout = () => { isInSubLayoutMode.value = false; };

// ========== handleBack ==========
const handleBack = () => {
  if (currentStep.value === 3) {
    currentView.value = 'main';
    topLineImage.value = null;
    isInSubLayoutMode.value = false;
    forceInfosView.value = false;
    logUploadState('handleBack');
  }
};

// ========== handleTabUpdate ==========
const handleTabUpdate = (tabId) => {
  console.log('📌 [UploadPNG] Tab updated to:', tabId);
  activeTab.value = tabId;
};

// ========== closePupUpStart ==========
const closePupUpStart = () => {
  showPupUpStart.value = false;
  document.body.style.overflow = '';
  
  if (shouldSkipCreation.value || route.query.skip === 'true') {
    serverCoverUrl.value = defaultBackgroundImage.value;
    console.log('🖼️ تم تعيين الصورة الافتراضية للخلفية عند تخطي البداية');
  }
  
  removeSkipFromUrl();
};

// ========== watchers ==========
watch(() => releaseStore.currentStep, (newStep, oldStep) => {
  if (isUpdatingToStore) return;
  
  if (isReturningFromSongEdit) {
    console.log('⏭️ [UploadPNG] Skipping step update during return from song edit');
    return;
  }
  
  logUploadState('store currentStep changed', { oldStep, newStep });
  
  if (oldStep === 3 && newStep === 2) {
    console.log('📌 [UploadPNG] store: العودة إلى Metas - إلغاء SubLayout');
    
    isInSubLayoutMode.value = false;
    forceInfosView.value = false;
    if (currentView.value !== 'main') {
      setCurrentView('main');
    }
    
    window.dispatchEvent(new CustomEvent('keep-songs-state', {
      detail: { from: 'songs', to: 'metas' }
    }));
    
    if (currentStep.value !== newStep && newStep > 0 && newStep <= 5 && !isUpdatingFromStore) {
      isUpdatingFromStore = true;
      console.log('📌 تحديث currentStep من الـ Store إلى:', newStep);
      currentStep.value = newStep;
      setTimeout(() => {
        isUpdatingFromStore = false;
      }, 100);
    }
    return;
  }
  
  if (currentStep.value !== newStep && newStep > 0 && newStep <= 5 && !isUpdatingFromStore) {
    isUpdatingFromStore = true;
    console.log('📌 تحديث currentStep من الـ Store إلى:', newStep);
    currentStep.value = newStep;
    setTimeout(() => {
      isUpdatingFromStore = false;
    }, 100);
  }
});

watch(() => releaseStore.currentStep, (newStep) => {
  if (newStep === 4) {
    if (upload3ComponentRef.value) {
      upload3ComponentRef.value.currentView = 'shopsPage';
      console.log('📌 [UploadPNG] تعيين currentView إلى shopsPage في Upload3Component');
    }
  }
}, { immediate: true });

watch(() => route.query.preserve, (newVal) => {
  if (newVal === 'true') {
    console.log('⏭️ تم اكتشاف preserve=true في الـ URL، إزالته');
    removeSkipFromUrl();
  }
}, { immediate: true });

watch(() => route.query.skip, (newVal) => {
  if (newVal === 'true') {
    console.log('⏭️ تم اكتشاف skip=true في الـ URL، إزالته');
    removeSkipFromUrl();
  }
}, { immediate: true });

watch(() => route.path, async (newPath, oldPath) => {
  if (isReturningFromPreRelease) {
    console.log('⏭️ [UploadPNG] Skipping route.path watch during Pre-Release return');
    return;
  }
  
  if (route.query.preserve === 'true') {
    console.log('⏭️ [UploadPNG] preserve=true في query، تخطي إعادة تعيين الحالة');
    return;
  }
  
  if (route.query.step) {
    console.log('⏭️ [UploadPNG] step في query، تخطي إعادة تعيين الحالة');
    return;
  }
  
  if (route.name === 'edit-release' || newPath?.includes('/edit')) {
    console.log('⏭️ [UploadPNG] في وضع التعديل، تخطي إعادة تعيين الحالة');
    return;
  }
  
  if (route.params?.releaseUuid) {
    console.log('⏭️ [UploadPNG] يوجد releaseUuid في params، تخطي إعادة تعيين الحالة');
    return;
  }
  
  console.log('📍 [UploadPNG] route.path changed from', oldPath, 'to', newPath);
  
  if (newPath === '/create-release' || newPath === '/create-release/') {
    console.log('🔄 العودة إلى صفحة إنشاء جديد - إعادة تعيين الحالة');
    
    removeSkipFromUrl();
    
    showTypeSelection.value = true;
    currentStep.value = 1;
    releaseStore.currentStep = 1;
    releaseStore.currentReleaseId = null;
    releaseStore.releaseType = null;
    releaseStore.releaseTypeValue = null;
    draftRelease.value = null;
    serverCoverUrl.value = defaultBackgroundImage.value;
    shouldSkipCreation.value = false;
    pendingReleaseType.value = null;
    
    releaseStore.songUuid = null;
    releaseStore.currentSongTitle = null;
    
    currentTitle.value = '';
    previousBaseTitle.value = '';
    
    console.log('✅ تم إعادة تعيين الحالة للإنشاء الجديد');
  }
}, { immediate: true });

watch(uploadedImage, (newUrl) => {
  if (newUrl && isRealImage(newUrl)) {
    console.log('🖼️ [UploadPNG] uploadedImage changed to:', newUrl);
    serverCoverUrl.value = newUrl;
    releaseStore.setServerCoverUrl(newUrl);
  }
}, { immediate: true, deep: true });

watch(() => releaseStore.currentStep, (newStep, oldStep) => {
  if (isUpdatingFromStore) return;
  logUploadState('store currentStep gatekeeper changed', { oldStep, newStep });
  
  if (isEditMode.value && releaseStore.currentReleaseId) {
    if (newStep > currentStep.value + 1) {
      console.warn('⚠️ لا يمكن الانتقال إلى الخطوة', newStep, 'لأن البيانات غير مكتملة');
      setTimeout(() => {
        releaseStore.setCurrentStep(currentStep.value);
      }, 0);
      return;
    }
    
    if (newStep === 3 && currentStep.value === 2) {
      if (!releaseStore.isMetasComplete) {
        console.warn('⚠️ لا يمكن الانتقال إلى Songs لأن بيانات Metas غير مكتملة');
        setTimeout(() => {
          releaseStore.setCurrentStep(currentStep.value);
        }, 0);
        return;
      }
    }
    
    if (newStep === 4 && currentStep.value === 3) {
      if (!releaseStore.isSongsComplete) {
        console.warn('⚠️ لا يمكن الانتقال إلى Shops لأن بيانات Songs غير مكتملة');
        setTimeout(() => {
          releaseStore.setCurrentStep(currentStep.value);
        }, 0);
        return;
      }
    }
    
    if (newStep === 5 && currentStep.value === 4) {
      if (!releaseStore.isShopsComplete) {
        console.warn('⚠️ لا يمكن الانتقال إلى Publish لأن بيانات Shops غير مكتملة');
        setTimeout(() => {
          releaseStore.setCurrentStep(currentStep.value);
        }, 0);
        return;
      }
    }
  }
  
  if (oldStep === 3 && newStep === 2) {
    console.log('📌 [UploadPNG] store gatekeeper: العودة إلى Metas - إلغاء SubLayout');
    
    isInSubLayoutMode.value = false;
    forceInfosView.value = false;
    if (currentView.value !== 'main') {
      setCurrentView('main');
    }
    
    window.dispatchEvent(new CustomEvent('keep-songs-state', {
      detail: { from: 'songs', to: 'metas' }
    }));
    
    if (currentStep.value !== newStep && newStep > 0 && newStep <= 5) {
      console.log('📌 تحديث currentStep من الـ Store إلى:', newStep);
      currentStep.value = newStep;
      isUpdatingFromStore = true;
      setTimeout(() => {
        isUpdatingFromStore = false;
      }, 100);
    }
    return;
  }
  
  if (currentStep.value !== newStep && newStep > 0 && newStep <= 5) {
    console.log('📌 تحديث currentStep من الـ Store إلى:', newStep);
    currentStep.value = newStep;
    isUpdatingFromStore = true;
    setTimeout(() => {
      isUpdatingFromStore = false;
    }, 100);
  }
}, { deep: true });

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
    setSongDetailsTabToInfos();
    
    if (currentStep.value !== 3) {
      currentStep.value = 3;
      releaseStore.setCurrentStep(3);
    }
    
    if (draftRelease.value) {
      releaseStore.determineStepFromRelease(draftRelease.value, false);
    }
    
    setTimeout(() => {
      if (currentStep.value === 3) {
        window.dispatchEvent(new CustomEvent('force-edit-song', { 
          detail: { 
            songUuid: newSongUuid,
            releaseUuid: releaseStore.currentReleaseId 
          } 
        }));
      }
    }, 100);
  }
}, { immediate: true });

watch(() => route.query.song, (newSongUuid, oldSongUuid) => {
  if (newSongUuid && newSongUuid !== oldSongUuid) {
    releaseStore.setSongUuid(newSongUuid);
    setSongDetailsTabToInfos();
    
    if (currentStep.value !== 3) {
      currentStep.value = 3;
      releaseStore.setCurrentStep(3);
    }
    
    if (draftRelease.value) {
      releaseStore.determineStepFromRelease(draftRelease.value, false);
    }
    
    setTimeout(() => {
      if (currentStep.value === 3) {
        window.dispatchEvent(new CustomEvent('force-edit-song', { 
          detail: { 
            songUuid: newSongUuid,
            releaseUuid: releaseStore.currentReleaseId 
          } 
        }));
      }
    }, 100);
  } else if (!newSongUuid && oldSongUuid) {
    releaseStore.clearSongUuid();
  }
}, { immediate: true });

watch(() => route.params.songUuid, (newSongUuid, oldSongUuid) => {
  if (newSongUuid && newSongUuid !== oldSongUuid) {
    console.log('🎵 [UploadPNG] songUuid in params changed:', newSongUuid);
    releaseStore.setSongUuid(newSongUuid);
    setSongDetailsTabToInfos();
    
    if (currentStep.value !== 3) {
      currentStep.value = 3;
      releaseStore.setCurrentStep(3);
    }
    
    if (draftRelease.value) {
      releaseStore.determineStepFromRelease(draftRelease.value, false);
    }
    
    setTimeout(() => {
      if (currentStep.value === 3) {
        window.dispatchEvent(new CustomEvent('force-edit-song', { 
          detail: { 
            songUuid: newSongUuid,
            releaseUuid: releaseStore.currentReleaseId 
          } 
        }));
      }
    }, 300);
  }
}, { immediate: true });

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

watch(serverCoverUrl, (newUrl) => {
  if (!newUrl && shouldSkipCreation.value) {
    serverCoverUrl.value = defaultBackgroundImage.value;
  }
}, { immediate: true });

// ========== watch songs and shops completion ==========
watch(
  () => [releaseStore.isSongsComplete, releaseStore.isShopsComplete, releaseStore.currentStep],
  async ([isSongsComplete, isShopsComplete, storeCurrentStep]) => {
    console.log('📌 [UploadPNG] SongsComplete:', isSongsComplete, 'ShopsComplete:', isShopsComplete, 'CurrentStep:', storeCurrentStep, 'currentView:', currentView.value, 'isManualNavigation:', isManualNavigation, 'isNavigatingFromNextStep:', isNavigatingFromNextStep);
    
    if (isNavigatingFromWatch) {
      console.log('⏳ [UploadPNG] جاري التنقل، تخطي...');
      return;
    }
    
    if (isSongsComplete && isShopsComplete && storeCurrentStep === 3) {
      if (isManualNavigation) {
        console.log('📌 [UploadPNG] ⏳ Manual navigation in progress, skipping auto-navigation');
        return;
      }
      
      if (isNavigatingFromNextStep) {
        console.log('📌 [UploadPNG] ⏳ Navigating from nextStep, skipping auto-navigation');
        return;
      }
      
      if (currentView.value === 'firstSection') {
        console.log('📌 [UploadPNG] 📍 User is in firstSection, skipping auto-navigation');
        return;
      }
      
      const hasSongInUrl = !!route.query.song || !!route.params.songUuid;
      if (hasSongInUrl) {
        console.log('📌 [UploadPNG] 📍 songUuid in URL, skipping auto-navigation');
        return;
      }
      
      console.log('📌 [UploadPNG] ✅ Songs complete and Shops exist → moving to Shops (step 4)');
      
      isNavigatingFromWatch = true;
      
      currentStep.value = 4;
      releaseStore.setCurrentStep(4);
      
      const currentQuery = { ...route.query };
      delete currentQuery.song;
      router.replace({ query: currentQuery });
      
      emit('next');
      
      setTimeout(() => {
        isNavigatingFromWatch = false;
      }, 1000);
    }
    
    if (!isSongsComplete && isShopsComplete && storeCurrentStep === 4 && !isNavigatingFromWatch && !isManualNavigation && !isNavigatingFromNextStep) {
      const currentPath = route.path;
      if (currentPath.includes('/edit') && !currentPath.includes('/songs/')) {
        console.log('📌 [UploadPNG] ⚠️ Songs incomplete but Shops exist → moving back to Songs (step 3)');
        
        isNavigatingFromWatch = true;
        
        currentStep.value = 3;
        releaseStore.setCurrentStep(3);
        
        const currentQuery = { ...route.query };
        delete currentQuery.song;
        router.replace({ query: currentQuery });
        
        if (releaseStore.currentReleaseId) {
          await fetchRelease();
        }
        
        setTimeout(() => {
          isNavigatingFromWatch = false;
        }, 1000);
      } else {
        console.log('📌 [UploadPNG] ⚠️ Songs incomplete but user manually navigated to Shops, keeping current step');
      }
    }
  },
  { immediate: true, deep: true }
);

// ========== handleFormDataUpdateFromChild ==========
const handleFormDataUpdateFromChild = (data) => {
  console.log('📝 [UploadPNG] Form data updated from child:', data);
};

// ========== tab completion event listener ==========
window.addEventListener('tab-completion-updated', (event) => {
  console.log('📌 [UploadPNG] tab-completion-updated event received:', event.detail);
});

// ========== onMounted ==========
onMounted(async () => {
  console.log('🚀 UploadPNG mounted, route path:', route.path);
  console.log('📍 route.query:', route.query);
  console.log('📍 route.params:', route.params);
  console.log('📍 route.name:', route.name);
  console.log('📍 props.currentStep:', props.currentStep);
  logUploadState('mounted');
  
  document.addEventListener('keydown', handleVideoKeydown);
  
  if (route.query.showTypeSelection === 'true') {
    console.log('📌 showTypeSelection=true في onMounted، عرض كروت الاختيار');
    showTypeSelection.value = true;
    
    releaseStore.currentReleaseId = null;
    releaseUuidFromUrl.value = null;
    releaseStore.releaseType = null;
    releaseStore.releaseTypeValue = null;
    releaseStore._startComplete = false;
    releaseStore.draftRelease = null;
    releaseStore.serverCoverUrl = null;
    
    serverCoverUrl.value = defaultBackgroundImage.value;
    uploadedImage.value = null;
    draftRelease.value = null;
    currentStep.value = 1;
    
    try {
      localStorage.removeItem('upload_server_cover_url');
      localStorage.removeItem('upload2_state');
      localStorage.removeItem('upload2_selectedType');
    } catch (e) {
      console.warn('⚠️ Could not remove localStorage items:', e);
    }
    
    const { showTypeSelection: _, ...restQuery } = route.query;
    router.replace({ query: restQuery });
    return;
  }
  
  removeSkipFromUrl();
  
  window.addEventListener('force-full-height', (event) => {
    const { force } = event.detail || {};
    const mainElement = document.querySelector('.main');
    const canForceNow = force && shouldForceFullHeight.value;

    console.log('📢 [UploadPNG] استقبال حدث force-full-height:', {
      force,
      canForceNow,
      currentStep: currentStep.value,
      currentView: currentView.value,
      shouldForceFullHeight: shouldForceFullHeight.value,
      mainExists: !!mainElement,
      mainClasses: mainElement?.className || null
    });

    if (mainElement) {
      if (canForceNow) {
        mainElement.classList.add('force-full-height');
        console.log('✅ تم تطبيق force-full-height على العنصر الرئيسي');
      } else {
        mainElement.classList.remove('force-full-height');
        console.log('🧹 تم إزالة force-full-height من العنصر الرئيسي');
      }
    }
  });
  
  window.addEventListener('manual-navigation', (event) => {
    console.log('📌 [UploadPNG] Received manual-navigation event:', event.detail);
    isManualNavigation = true;
    
    if (manualNavigationTimeout) {
      clearTimeout(manualNavigationTimeout);
    }
    
    manualNavigationTimeout = setTimeout(() => {
      isManualNavigation = false;
      console.log('📌 [UploadPNG] Reset isManualNavigation to false');
      manualNavigationTimeout = null;
    }, 5000);
  });
  
  if (route.query.step) {
    const stepFromQuery = parseInt(route.query.step);
    if (stepFromQuery >= 1 && stepFromQuery <= 5) {
      currentStep.value = stepFromQuery;
      releaseStore.setCurrentStep(stepFromQuery);
      console.log('📌 تم تعيين currentStep من query.step:', stepFromQuery);
    }
  }

  if (route.name === 'edit-song' || props.editMode === 'song') {
    console.log('🎵 وضع تعديل الأغنية نشط');
    isEditSongMode.value = true;
    isEditMode.value = true;
    setSongDetailsTabToInfos();
    
    if (route.params.songUuid || props.songUuid) {
      const songUuid = route.params.songUuid || props.songUuid;
      releaseStore.setSongUuid(songUuid);
      console.log('🎵 تم تعيين songUuid:', songUuid);
    }
    
    if (releaseUuidFromUrl.value || props.releaseUuid) {
      await fetchRelease();
    } else {
      console.log('🆕 إنشاء Release جديد - لا نجلب بيانات قديمة');
      serverCoverUrl.value = null;
      draftRelease.value = null;
    }
    document.body.style.overflow = 'hidden';
    return;
  }
  
  if (route.name === 'edit-release' || props.editMode === 'release') {
    console.log('✏️ وضع تعديل الـ Release نشط');
    isEditMode.value = true;
    isEditSongMode.value = false;
    
    if (releaseUuidFromUrl.value || props.releaseUuid) {
      await fetchRelease();
      showTypeSelection.value = false;
    }
    document.body.style.overflow = 'hidden';
    return;
  }
  
  setTimeout(() => {
    showPupUpStart.value = true;
    console.log('🎉 تم فتح PupUpStart');
  }, 500);
  
  if (!route.query.step && releaseStore.currentStep > 1 && !route.query.skip) {
    currentStep.value = releaseStore.currentStep;
    console.log('📌 تم تعيين currentStep من الـ Store:', currentStep.value);
  }

  logUploadState('after-store-step-restore');
  
  const hasSongUuid = !!(props.songUuid || route.params.songUuid || route.query.song);
  if (hasSongUuid) {
    console.log('🎵 يوجد songUuid، تعيين currentStep إلى 3');
    currentStep.value = 3;
  }

  logUploadState('after-song-check');
  
  provide('nextStep', nextStep);
  provide('currentStep', currentStep);
  provide('updateTitle', handleTitleUpdate);
  provide('navigateToEditSong', navigateToEditSong);
  provide('navigateToEditRelease', navigateToEditRelease);
  provide('navigateToCreateRelease', navigateToCreateRelease);
  console.log('📢 [UploadPNG] nextStep provided to children');
  
  if (route.query.skip === 'true' || route.query.new === 'true') {
    console.log('⏭️ وضع التخطي نشط - لن يتم تحميل أي Release ولن يتم إنشاء أي شيء');
    shouldSkipCreation.value = true;
    showTypeSelection.value = false;
    currentStep.value = 2;
    serverCoverUrl.value = defaultBackgroundImage.value;
    console.log('🖼️ تم تعيين الصورة الافتراضية للخلفية في وضع التخطي');
    document.body.style.overflow = 'hidden';
    logUploadState('skip-mode');
    removeSkipFromUrl();
    return;
  }
  
  if (props.releaseUuid) {
    releaseUuidFromUrl.value = props.releaseUuid;
    releaseStore.setCurrentReleaseId(props.releaseUuid);
    console.log('📌 تم استخراج releaseUuid من props:', props.releaseUuid);
  } else {
    extractReleaseUuidFromUrl();
  }
  
  if (props.uploadedImage) {
    const isDefaultImage = props.uploadedImage === '/img/bgCardSongs/card1.png' || 
                           props.uploadedImage.includes('bgCardSongs/card1.png');
    
    if (!isDefaultImage) {
      console.log('🖼️ توجد صورة حقيقية من props:', props.uploadedImage);
      uploadedImage.value = props.uploadedImage;
      serverCoverUrl.value = props.uploadedImage;
    } else {
      console.log('🖼️ تجاهل الصورة الافتراضية من props');
      uploadedImage.value = null;
      serverCoverUrl.value = null;
    }
  }
  
  if (!hasSongUuid) {
    currentStep.value = props.currentStep || 1;
  }

  logUploadState('after-props-step-restore');
  
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

  if (releaseUuidFromUrl.value || props.releaseUuid) {
    await fetchRelease();
  } else {
    console.log('🆕 إنشاء Release جديد - لا نجلب بيانات قديمة');
    serverCoverUrl.value = defaultBackgroundImage.value;
    draftRelease.value = null;
  }

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

  logUploadState('mounted-final');

  document.body.style.overflow = 'hidden';
});

// ========== onBeforeUnmount ==========
onBeforeUnmount(() => {
  releaseStore.setCurrentStep(currentStep.value);
  
  document.removeEventListener('keydown', handleVideoKeydown);
  
  if (manualNavigationTimeout) {
    clearTimeout(manualNavigationTimeout);
    manualNavigationTimeout = null;
  }
  
  window.removeEventListener('manual-navigation', () => {});
  window.removeEventListener('force-full-height', () => {});
});
</script>

<style lang="scss" scoped>
.step-manager {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: 100%;
  height: calc(100dvh - 71px - 50px);
  min-height: calc(100dvh - 71px - 50px);
  position: relative;
}

.step-manager.step-1-auto {
  height: auto;
  min-height: auto;
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
  height: auto;
  min-height: auto;
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
  will-change: transform;
  transform-style: preserve-3d;
}

.type-card:hover {
  transition: .3s ease;
  box-shadow: 8px 8px 20px 19px rgba(0, 0, 0, 0.3);
}

.type-card::before {
  content: '';
  position: absolute;
  opacity: 0;
  transition: opacity 0.3s ease;
  width: 50px;
  height: 50px;
  z-index: 3;
  pointer-events: none;
}

.type-card::after {
  content: '';
  position: absolute;
  opacity: 0;
  transition: opacity 0.3s ease;
  width: 100%;
  height: 100%;
  border-radius: 20px;
  pointer-events: none;
}

.type-card.hover-tl::before {
  top: 0;
  left: 0;
  border-radius: 20px 0 0 0;
  opacity: 1;
  animation: fadeOutBorder 1.5s ease forwards;
}

.type-card.hover-tr::before {
  top: 0;
  right: 0;
  border-radius: 0 20px 0 0;
  opacity: 1;
  animation: fadeOutBorder 1.5s ease forwards;
}

.type-card.hover-bl::before {
  bottom: 0;
  left: 0;
  border-radius: 0 0 0 20px;
  opacity: 1;
  animation: fadeOutBorder 1.5s ease forwards;
}

.type-card.hover-br::before {
  bottom: 0;
  right: 0;
  border-radius: 0 0 20px 0;
  opacity: 1;
  animation: fadeOutBorder 1.5s ease forwards;
}

.type-card.hover-tl::after,
.type-card.hover-tr::after,
.type-card.hover-bl::after,
.type-card.hover-br::after {
  opacity: 1;
  background: rgba(27, 28, 32, 0.4);
}

@keyframes fadeOutBorder {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

.type-card:nth-child(1) { background-image: url('/img/bgCardSongs/card1.png'); }
.type-card:nth-child(2) { background-image: url('/img/bgCardSongs/card2.png'); }
.type-card:nth-child(3) { background-image: url('/img/bgCardSongs/card3.png'); }

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