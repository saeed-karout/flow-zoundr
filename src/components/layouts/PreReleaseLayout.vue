<template>
  <div class="main" :class="{ 
    'height-full': heightMode === 'full' || (heightMode === 'auto' && currentStep === 2), 
    'height-auto': heightMode === 'auto' && currentStep !== 2,
    'new-right2-active': isNewRight2Active
  }">
    <div class="content-wrapper">
      <div class="bg-image" :style="bgImageStyle">
        <div class="image-blur">
          <div class="content-songs">
            <div class="head-section">
              <ProgressBar :startColor="[51, 27, 39]" :endColor="[222, 20, 86]" :items="progressItems"
                :with_transition="true" type="percent" :percent="progressPercent" />
              <div class="top-line">
                <div class="p">{{ sectionTitle }}</div>
                
                <div v-if="currentStep === 2 && currentView === 'firstSection'" class="top-line-image-container">
                  <img 
                    :src="displayTopLineImage" 
                    alt="Top line image"
                    class="top-line-image clickable"
                    :class="{ 'image-loaded': imageLoaded }"
                    @click="handleTopLineImageClick"
                    @load="onImageLoad"
                    @error="handleImageError"
                  />
                </div>
                
                <!-- 🔥 زر الرجوع SVG -->
                <div 
                  v-if="currentView === 'infos'"
                  class="back-button-wrapper"
                  @click="handleBackToFirstSection"
                >
                  <svg 
                    class="back-button-svg"
                    xmlns="http://www.w3.org/2000/svg" 
                    width="20" 
                    height="20" 
                    viewBox="0 0 23 23" 
                    fill="none"
                  >
                    <path 
                      d="M22 22L11.5 11.5M11.5 11.5L1 1M11.5 11.5L1 22M11.5 11.5L22 1" 
                      stroke="currentColor" 
                      stroke-width="2" 
                      stroke-linecap="round"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div class="slot-container">
              <slot
                :activeTab="activeTab"
                @update:form-data="handleFormDataUpdate"
                @update-tab-completion="handleTabCompletionUpdate"
              ></slot>
            </div>
          </div>
        </div>
      </div>

      <div class="column2">
        <!-- 🔥 Vimeo Video Section -->
        <div class="video" @click="openVideoPopup">
          <div class="video-wrapper">
            <div class="video-bg-left">
              <div class="video-bg-left-image" :style="videoBgLeftImageStyle"></div>
              <div class="video-bg-left-blur"></div>
            </div>
            <div class="video-content">
              <img src="@/assets/icons/Play.png" alt="Vimeo Play Icon">
            </div>
            <div class="video-bg-right">
              <div class="video-bg-right-image" :style="videoBgRightImageStyle"></div>
              <div class="video-bg-right-blur"></div>
            </div>
          </div>
        </div>

        <!-- ✅ tabs يستخدم Store مباشرة -->
        <tabs 
          :server-cover-url="serverCoverUrl" 
          :active-tab="activeTab"
          @update-tab="$emit('update-tab', $event)"
          @back="$emit('back')" 
        />
      </div>
    </div>

    <!-- ✅ Video Popup مع دعم Esc -->
    <div v-if="showVideoPopup" class="video-popup-overlay" @click="closeVideoPopup">
      <div class="video-popup-container" @click.stop>
        <iframe 
          ref="vimeoRef"
          width="100%" 
          height="100%" 
          :src="vimeoEmbedUrl"
          frameborder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowfullscreen
          loading="lazy"
          @error="handleIframeError"
        >
        </iframe>
        <button class="close-btn" @click="closeVideoPopup">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        <div v-if="videoError" class="video-error">
          <p>⚠️ Fehler beim Laden des Videos.</p>
          <p class="video-id">Video ID: {{ videoId }}</p>
          <button @click="reloadVideo" class="reload-btn">Neu laden</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import ProgressBar from '@/zoundr/components/ProgressBar.vue';
import tabs from '../uploadPngSteps/Upload2/tabs.vue';
import { useReleaseStore } from '@/stores/release';

import losslessIcon from '@/assets/icons/top-line/lossless.png';
import digitalMastersIcon from '@/assets/icons/top-line/digital-masters.png';
import admIcon from '@/assets/icons/top-line/ADM.png';

// ✅ استخدام Store
const releaseStore = useReleaseStore();

const props = defineProps({
  currentStep: { type: Number, required: true },
  steps: { type: Array, default: () => ['0', '1', '2', '3', '4'] },
  sectionTitle: { type: String, default: 'Dein Neue Single' },
  topLineImage: { type: [String, null], default: null },
  serverCoverUrl: { type: [String, null], default: null },
  currentView: { type: String, default: 'main' },
  heightMode: { type: String, default: 'auto' },
  showNewRight2: { type: Boolean, default: false },
  activeTab: { type: String, default: 'infos' },
  videoId: { type: String, default: '480705053' },
  uploadedImage: { type: [String, null], default: null },
  backgroundImage: { type: String, default: null }
});

// ✅ تعريف emit
const emit = defineEmits([
  'update-tab', 
  'back', 
  'update:topLineImage', 
  'change-song-type', 
  'back-to-first-section'
]);

const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || 'https://zoundr-flow-api.davinda.dev/storage';
const DEFAULT_BG_IMAGE = '/img/bgCardSongs/card1.png';

const songTypeImageMap = {
  'lossless': losslessIcon,
  'digital_master': digitalMastersIcon,
  'dobly_atmos': admIcon
};

const showVideoPopup = ref(false);
const videoId = ref(props.videoId || '480705053');
const imageLoaded = ref(false);
const vimeoRef = ref(null);
const videoError = ref(false);

// ========== بناء رابط Vimeo ==========
const vimeoEmbedUrl = computed(() => {
  const id = videoId.value?.replace(/\D/g, '') || '480705053';
  const params = new URLSearchParams({
    autoplay: '1',
    controls: '1',
    byline: '0',
    portrait: '0',
    title: '0',
    dnt: '1',
    transparent: '0',
    responsive: '1'
  });
  return `https://player.vimeo.com/video/${id}?${params.toString()}`;
});

const reloadVideo = () => {
  videoError.value = false;
  const iframe = vimeoRef.value;
  if (iframe) {
    const src = iframe.src;
    iframe.src = '';
    setTimeout(() => {
      iframe.src = src;
    }, 200);
  }
};

const handleIframeError = (error) => {
  console.error('❌ Vimeo iframe error:', error);
  videoError.value = true;
};

// ========== 🔥 مستمع حدث Esc ==========
const handleKeydown = (event) => {
  if (showVideoPopup.value && event.key === 'Escape') {
    console.log('⌨️ [PreReleaseLayout] Esc pressed, closing video popup');
    closeVideoPopup();
  }
};

// ========== ✅ معالج تحديث tabCompletion من المكونات الفرعية ==========
const handleTabCompletionUpdate = (completion) => {
  console.log('📌 [PreReleaseLayout] Received update-tab-completion:', completion);
  if (completion && typeof completion === 'object') {
    // ✅ تحديث Store مباشرة
    releaseStore.updateTabCompletion(completion);
    console.log('📌 [PreReleaseLayout] Updated Store tabCompletion:', releaseStore.tabCompletion);
  }
};

// ========== معالج تحديث form-data ==========
const handleFormDataUpdate = (updates) => {
  console.log('📌 [PreReleaseLayout] Received update:form-data:', updates);
  
  if (updates && updates.tab && updates.data) {
    // ✅ تحديث Store مباشرة
    if (updates.data.isComplete !== undefined && updates.tab) {
      releaseStore.updateTabCompletion({ [updates.tab]: updates.data.isComplete });
      console.log(`📌 [PreReleaseLayout] Updated tab ${updates.tab} completion in Store:`, updates.data.isComplete);
    }
    
    // ✅ تحديث أي تبويبات أخرى
    const newCompletion = {};
    Object.keys(updates.data).forEach(key => {
      if (typeof updates.data[key] === 'boolean' && ['infos', 'urheber', 'mitwirkende', 'deals', 'pre-release'].includes(key)) {
        newCompletion[key] = updates.data[key];
      }
    });
    
    if (Object.keys(newCompletion).length > 0) {
      releaseStore.updateTabCompletion(newCompletion);
      console.log('📌 [PreReleaseLayout] Updated multiple tabs in Store:', newCompletion);
    }
  }
};

// ========== حساب الصورة الخلفية ==========
const getFullImageUrl = (url) => {
  if (!url) return null;
  if (url === '' || url === null || url === undefined) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('blob:')) return url;
  if (url.startsWith('/img/')) return url;
  if (url.startsWith('/storage/')) return `${STORAGE_URL}${url}`;
  if (url.startsWith('storage/')) return `${STORAGE_URL}/${url}`;
  if (url.startsWith('covers/')) return `${STORAGE_URL}/${url}`;
  if (!url.includes('/') && (url.includes('cover_') || url.includes('.jpg') || url.includes('.png'))) {
    return `${STORAGE_URL}/covers/${url}`;
  }
  return url;
};

const backgroundFullUrl = ref(DEFAULT_BG_IMAGE);

const getInitialImageUrl = () => {
  return props.uploadedImage || props.serverCoverUrl || props.backgroundImage || null;
};

// مراقبة uploadedImage
watch(() => props.uploadedImage, (newUrl) => {
  if (newUrl && newUrl !== '' && newUrl !== '/img/bgCardSongs/card1.png') {
    const fullUrl = getFullImageUrl(newUrl);
    if (fullUrl) {
      backgroundFullUrl.value = fullUrl;
      console.log('🖼️ [PreReleaseLayout] Updated background from uploadedImage:', fullUrl);
    }
  } else {
    backgroundFullUrl.value = DEFAULT_BG_IMAGE;
  }
}, { immediate: true });

// مراقبة serverCoverUrl
watch(() => props.serverCoverUrl, (newUrl) => {
  if (props.uploadedImage && props.uploadedImage !== '' && props.uploadedImage !== '/img/bgCardSongs/card1.png') {
    return;
  }
  
  if (newUrl && newUrl !== '' && newUrl !== '/img/bgCardSongs/card1.png') {
    const fullUrl = getFullImageUrl(newUrl);
    if (fullUrl) {
      backgroundFullUrl.value = fullUrl;
      console.log('🖼️ [PreReleaseLayout] Updated background from serverCoverUrl:', fullUrl);
    }
  } else if (!props.uploadedImage) {
    backgroundFullUrl.value = DEFAULT_BG_IMAGE;
  }
}, { immediate: true });

// مراقبة backgroundImage
watch(() => props.backgroundImage, (newUrl) => {
  if (props.uploadedImage && props.uploadedImage !== '' && props.uploadedImage !== '/img/bgCardSongs/card1.png') {
    return;
  }
  if (props.serverCoverUrl && props.serverCoverUrl !== '' && props.serverCoverUrl !== '/img/bgCardSongs/card1.png') {
    return;
  }
  
  if (newUrl && newUrl !== '' && newUrl !== '/img/bgCardSongs/card1.png') {
    const fullUrl = getFullImageUrl(newUrl);
    if (fullUrl) {
      backgroundFullUrl.value = fullUrl;
      console.log('🖼️ [PreReleaseLayout] Updated background from backgroundImage:', fullUrl);
    }
  } else {
    backgroundFullUrl.value = DEFAULT_BG_IMAGE;
  }
}, { immediate: true });

const bgImageStyle = computed(() => {
  const fullUrl = backgroundFullUrl.value;
  if (fullUrl && fullUrl !== DEFAULT_BG_IMAGE) {
    const timestamp = Date.now();
    const urlWithTimestamp = `${fullUrl}${fullUrl.includes('?') ? '&' : '?'}_t=${timestamp}`;
    return {
      backgroundImage: `url(${urlWithTimestamp})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    };
  }
  return { backgroundColor: 'var(--secondary)' };
});

const getUrlWithTimestamp = (url) => {
  if (!url) return null;
  const timestamp = Date.now();
  return `${url}${url.includes('?') ? '&' : '?'}_t=${timestamp}`;
};

// ========== أنماط خلفية الفيديو ==========
const videoBgRightImageStyle = computed(() => {
  const fullUrl = backgroundFullUrl.value;
  if (fullUrl && fullUrl !== DEFAULT_BG_IMAGE) {
    const urlWithTimestamp = getUrlWithTimestamp(fullUrl);
    return {
      backgroundImage: `url(${urlWithTimestamp})`,
      backgroundSize: '3000% 100%',
      backgroundRepeat: 'no-repeat',
      borderRadius: '0 20px 0 0'
    };
  }
  return {};
});

const videoBgLeftImageStyle = computed(() => {
  const fullUrl = backgroundFullUrl.value;
  if (fullUrl && fullUrl !== DEFAULT_BG_IMAGE) {
    const urlWithTimestamp = getUrlWithTimestamp(fullUrl);
    return {
      backgroundImage: `url(${urlWithTimestamp})`,
      backgroundSize: '1000% 900%',
      backgroundRepeat: 'no-repeat',
      borderRadius: '0 20px 0 0'
    };
  }
  return {};
});

// ========== دوال الفيديو ==========
const openVideoPopup = () => {
  console.log('🎬 [PreReleaseLayout] Opening Vimeo video with ID:', videoId.value);
  showVideoPopup.value = true;
  videoError.value = false;
  document.body.style.overflow = 'hidden';
};

const closeVideoPopup = () => {
  showVideoPopup.value = false;
  document.body.style.overflow = '';
  videoError.value = false;
};

// ========== مراقبة videoId ==========
watch(() => props.videoId, (newId) => {
  if (newId) {
    const cleanId = newId.replace(/\D/g, '');
    if (cleanId) {
      videoId.value = cleanId;
      console.log('🔄 [PreReleaseLayout] Video ID updated to:', videoId.value);
    }
  }
}, { immediate: true });

// ========== باقي الكومبوتيد ==========
const displayTopLineImage = computed(() => {
  if (props.topLineImage) {
    return props.topLineImage;
  }
  return losslessIcon;
});

const isNewRight2Active = computed(() => {
  return props.showNewRight2 && props.currentStep === 2;
});

const onImageLoad = () => {
  imageLoaded.value = true;
};

watch(() => displayTopLineImage.value, () => {
  imageLoaded.value = false;
}, { immediate: true });

const handleTopLineImageClick = () => {
  if (props.currentView !== 'firstSection') return;
  if (confirm('Möchten Sie den Songtyp ändern? Alle nicht gespeicherten Änderungen gehen verloren.')) {
    emit('change-song-type');
  }
};

const handleBackToFirstSection = () => {
  // ✅ مسح tabCompletion من الـ Store عند العودة
  releaseStore.updateTabCompletion({
    infos: false,
    urheber: false,
    mitwirkende: false,
    deals: true,
    'pre-release': true
  });
  console.log('🧹 [PreReleaseLayout] Reset tabCompletion in Store');
  
  setTimeout(() => {
    emit('back-to-first-section');
  }, 100);
};

const progressItems = computed(() => {
  return props.steps.map((_, index) => ({
    id: index,
    completed: index < props.currentStep,
  }));
});

const progressPercent = computed(() => {
  return (props.currentStep / props.steps.length) * 100;
});

const handleImageError = (event) => {
  event.target.src = losslessIcon;
  event.target.style.display = 'block';
  imageLoaded.value = true;
};

// ========== مراقبة Store tabCompletion ==========
watch(
  () => releaseStore.tabCompletion,
  (newVal) => {
    console.log('📌 [PreReleaseLayout] Store tabCompletion changed:', newVal);
  },
  { deep: true, immediate: true }
);

// ========== دورة الحياة ==========
onMounted(async () => {
  imageLoaded.value = true;
  
  const initialImage = getInitialImageUrl();
  if (initialImage) {
    const fullUrl = getFullImageUrl(initialImage);
    if (fullUrl && fullUrl !== DEFAULT_BG_IMAGE) {
      backgroundFullUrl.value = fullUrl;
      console.log('🖼️ [PreReleaseLayout] Initial background set to:', fullUrl);
    }
  }
  
  // ✅ إضافة مستمع حدث Esc
  document.addEventListener('keydown', handleKeydown);
  
  console.log('🚀 [PreReleaseLayout] mounted');
  console.log('🎬 [PreReleaseLayout] Video ID:', videoId.value);
});

// ========== 🔥 إزالة المستمع عند تدمير المكون ==========
onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown);
  document.body.style.overflow = '';
  console.log('🔄 [PreReleaseLayout] unmounted, removed Esc listener');
});

watch(() => isNewRight2Active.value, (newVal) => {
  console.log('📌 [PreReleaseLayout] isNewRight2Active:', newVal);
}, { immediate: true });
</script>

<style lang="scss" scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Heebo', sans-serif;
}

.main {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 20px;
  width: 100%;
  height: auto;
}

.main.height-full {
  height: calc(100dvh - 71px - 50px);
}

@media (max-height:1700px) {
  .main,.bg-image{
    scrollbar-width: none;
  }
}

.main.height-auto {
  height: auto;
  min-height: 100%;
}

.head-section {
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: flex-start;
  gap: 20px;
}

.top-line {
  display: flex;
  height: 14px;
  justify-content: space-between;
  align-items: center;
  align-self: stretch;
}

.top-line .p {
  color: #FFF;
  font-family: Heebo;
  font-size: 20px;
  font-style: normal;
  font-weight: 700;
  line-height: 1;
  text-transform: uppercase;
}

.top-line-image-container {
  height: 32px;
  width: auto;
  display: flex;
  align-items: center;
}

.top-line-image {
  height: 32px;
  width: auto;
  display: block;
  cursor: pointer;
  transition: transform 0.2s ease, opacity 0.3s ease;
  filter: brightness(0) invert(1);
  opacity: 0;
}

.top-line-image.image-loaded {
  opacity: 1;
}

.top-line-image.clickable:hover {
  transform: scale(1.02);
  opacity: 0.8;
}

.top-line-image.clickable:active {
  transform: scale(0.95);
}

/* ========== 🔥 زر الرجوع SVG ========== */
.back-button-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  width: 32px;
  height: 32px;
  transition: all 0.3s ease;
  border-radius: 50%;
}

.back-button-wrapper:hover {
  transform: scale(1.05);
}

.back-button-wrapper:active {
  transform: scale(0.9);
}

.back-button-svg {
  color: #FFFFFF;
  width: 20px;
  height: 20px;
  transition: color 0.3s ease;
}

.back-button-wrapper:hover .back-button-svg {
  color: #DD1155;
}

.content-wrapper {
  display: flex;
  width: 100%;
  height: 100%;
  flex-grow: 1;
  min-width: 0;
}

.content-songs {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  flex: 1 0 0;
  border-radius: 20px;
  position: relative;
  height: 100%;
  overflow: hidden;
  padding: 20px;
  gap: 20px;
}

.column2 {
  display: flex;
  width: 240px;
  height: 100%;
  flex-direction: column;
  align-items: flex-start;
  flex-shrink: 0;
}

.column2 .video {
  display: flex;
  height: 167px;
  padding: 0 0 20px 20px;
  flex-direction: column;
  align-items: flex-end;
  gap: 7px;
  flex-shrink: 0;
  align-self: stretch;
  aspect-ratio: 240/143;
}

.video {
  display: flex;
  padding: 0 0 20px 20px;
  flex-direction: column;
  align-items: flex-end;
  gap: 7px;
  flex-shrink: 0;
  align-self: stretch;
  aspect-ratio: 240/143;
  position: relative;
  border-radius: 0 20px 0 40px;
  background: var(--primary);
}

.video::before {
  content: '';
  position: absolute;
  left: -10px;
  top: 0;
  width: 10px;
  height: 10px;
}

.video::after {
  content: '';
  position: absolute;
  left: -10px;
  top: 0;
  width: 10px;
  height: 10px;
  border-radius: 0 20px 0 0;
}

.video-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;

}

.video-content {
  display: flex;
  width: 220px;
  height: 123px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  aspect-ratio: 220/123;
  border-radius: 20px;
  background: var(--secondary);
  cursor: pointer;
  position: relative;
  z-index: 2;
  transition: border 0.3s ease;
}

.video-content:hover {
  border: 1px solid var(--move);
}

.video-content:hover img {
  filter: brightness(0) invert(1);
}

.video-content img {
  transition: filter 0.3s ease;
}

.video-bg-right {
  position: absolute;
  right: 0;
  bottom: -30px;
  width: 10px;
  height: 10px;
  z-index: 1;
  background: var(--primary);
  overflow: hidden;
}

.video-bg-right-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.9;
  z-index: 2;
  background-repeat: no-repeat;
  border-radius: 0 20px 0 0;
}

.video-bg-right-blur {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 3;
  background: rgba(38, 40, 45, 0.90);
  backdrop-filter: blur(10px);
  border-radius: 0 20px 0 0;
  pointer-events: none;
}

.video-bg-left {
  position: absolute;
  left: -40px;
  top: 0px;
  width: 0px;
  opacity: 0.01;
  height: 20px;
  z-index: 1;
  background: var(--primary);
  overflow: hidden;
}

.video-bg-left-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  background-repeat: no-repeat;
  border-radius: 0 20px 0 0;
}

.video-bg-left-blur {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 3;
  background: rgba(38, 40, 45, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 0 20px 0 0;
  pointer-events: none;
}

.bg-image {
  display: flex;
  flex: 1 1 0;
  min-width: 0;
  flex-direction: column;
  align-items: flex-start;
  aspect-ratio: 1/1;
  border-radius: 20px;
}

.bg-image .image-blur {
  flex: 1 0 0;
  align-self: stretch;
  background: rgba(38, 40, 45, 0.80);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  height: 100%;
  scrollbar-width: none;
}

.video-popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #1b1c20a6;
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(8px);
  animation: fadeIn 0.3s ease-out;
}

.video-popup-container {
  position: relative;
  width: 80%;
  max-width: 1000px;
  aspect-ratio: 16/9;
  background: #000;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.video-popup-container iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.video-error {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  text-align: center;
  z-index: 5;
  background: rgba(0, 0, 0, 0.85);
  padding: 30px 40px;
  border-radius: 12px;
  min-width: 250px;
}

.video-error .video-id {
  font-size: 12px;
  opacity: 0.6;
  margin-top: 8px;
}

.reload-btn {
  margin-top: 16px;
  padding: 8px 24px;
  background: var(--Strawberry, #DE1456);
  border: none;
  border-radius: 5px;
  color: white;
  cursor: pointer;
  font-family: Heebo, sans-serif;
  font-size: 14px;
  transition: background 0.3s ease;
}

.reload-btn:hover {
  background: #b01048;
}

.close-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: var(--Strawberry, #DE1456);
}

.close-btn svg {
  width: 20px;
  height: 20px;
}

.slot-container {
  flex: 1;
  width: 100%;
  overflow: auto;
  display: flex;
  scrollbar-width: none;
  flex-direction: column;
}

.slot-container::-webkit-scrollbar {
  width: 8px;
}

.slot-container::-webkit-scrollbar-track {
  background: transparent;
}

.slot-container::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

.slot-container::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.4);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@media (min-width:1440px) and (max-width:1599px) {
  .column2 { width: 180px; }
  .video-content { width: 160px; height: 90px; }
  .column2 .video { height: 110px; }
}

@media (min-width:2075px) and (max-width:2560px) {
  .column2 { width: 286px; }
  .video-content { width: 266px; height: 149px; }
}

.main.height-auto {
  height: auto;
  min-height: 100%;
}

.main.new-right2-active {
  height: 100% !important;
  min-height: 100% !important;
}
</style>