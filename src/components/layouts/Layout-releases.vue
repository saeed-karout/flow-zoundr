<template>
  <main :class="{ 
    'no-height': hasOuterContent, 
    'restrict-overflow': restrictOverflow, 
    'full-vh': showNewRight2,
    'upload3-active': isUpload3Active 
  }">
    <!-- YouTube Popup -->
    <div v-if="showVideoPopup" class="video-popup-overlay" @click="closeVideoPopup">
      <div class="video-popup-container" @click.stop>
        <iframe width="100%" height="100%" :src="'https://www.youtube.com/embed/' + videoId + '?autoplay=1'"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture;"
          allowfullscreen>
        </iframe>
        <button class="close-btn" @click="closeVideoPopup">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>

    <div class="main" :class="{ 
      'full-height': (showNewRight2 || showFinalPage || isUpload3Active) && currentStep !== 2 && currentStep !== 1, 
      'final-page-active': showFinalPage,
      'upload3-height': isUpload3Active,
      'content-full-height': showNewRight2 || showFinalPage
    }">
      
      <!-- bg-image: صورة الخلفية -->
      <div class="bg-image" :key="bgImageKey" :style="bgImageStyle"></div>
      
      <!-- محتوى فوق الخلفية -->
      <div class="overlay-content">
        <div class="image-blur">
          <div class="Head">
            <ProgressBar :startColor="[51, 27, 39]" :endColor="[222, 20, 86]" :items="items" :with_transition="true"
              type="percent" :percent="currentStep / (steps.length) * 100" />
            <div class="top-line">
              <div class="p">{{ sectionTitle }}</div>
              <img 
                v-if="shouldShowImage"
                :src="displayTopLineImage" 
                alt="Top line image" 
                class="top-line-image"
                :class="{ 'clickable': isImageClickable }"
                @click="handleTopLineImageClick"
                @error="handleImageError"
              >
            </div>
          </div>

          <div class="content-wrapper">
            <div class="content">
              <slot></slot>
            </div>
            <!-- Show Tabs only when currentStep is 2 and currentView is 'infos' -->
            <Tabs v-if="currentStep === 2 && currentView === 'infos'" class="tabs" @update-tab="$emit('update-tab', $event)"
              @back="$emit('back')" />
          </div>
        </div>
      </div>

      <!-- YouTube Video Section -->
      <div class="youtube" @click="openVideoPopup">
        <div class="video-wrapper">
          <div class="video-bg-left">
            <div class="video-bg-left-image" :style="videoBgLeftImageStyle"></div>
            <div class="video-bg-left-blur"></div>
          </div>
          <div class="video-content">
            <img src="@/assets/icons/Play.png" alt="YouTube Play Icon">
          </div>
          <div class="video-bg-right">
            <!-- الطبقة العليا التي تحتوي على تتمة الصورة مع نفس تأثير image-blur -->
            <div class="video-bg-right-image" :style="videoBgRightImageStyle"></div>
            <div class="video-bg-right-blur"></div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import ProgressBar from '@/zoundr/components/ProgressBar.vue';
import Tabs from '@/components/uploadPngSteps/Upload2/tabs.vue';

// Props
const props = defineProps({
  currentStep: { type: Number, required: true },
  steps: { type: Array, default: () => ['0', '1', '2', '3', '4'] },
  sectionTitle: { type: [String, Object], default: 'Dein Neue Single' },
  hasOuterContent: { type: Boolean, default: false },
  restrictOverflow: { type: Boolean, default: false },
  backgroundImage: { type: String, default: null },
  showNewRight2: { type: Boolean, default: false },
  showFinalPage: { type: Boolean, default: false },
  currentView: { type: String, default: 'main' },
  topLineImage: { type: [String, null], default: null },
  serverCoverUrl: { type: [String, null], default: null }
});

// Emits
const emit = defineEmits(['back', 'update-tab', 'update:topLineImage', 'change-song-type']);

// Constants
const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || 'https://zoundr-flow-api.davinda.dev/storage';

// Refs
const showVideoPopup = ref(false);
const videoId = ref('WPni755-Krg');
const bgImageKey = ref(0);

// الصورة المعروضة
const displayTopLineImage = computed(() => {
  return props.topLineImage || '/icons/top-line/lossless.png';
});

// تحديد ما إذا كانت الصورة قابلة للنقر
const isImageClickable = computed(() => {
  return props.currentView !== 'main' && 
         (props.currentView === 'firstSection' || props.currentView === 'infos');
});

// تحديد ما إذا كانت الصورة تظهر
const shouldShowImage = computed(() => {
  if (props.currentView === 'main') return false;
  if (props.currentStep === 2 && (props.currentView === 'firstSection' || props.currentView === 'infos')) return true;
  if (props.currentStep === 3) return true;
  return false;
});

// دالة معالجة النقر على الصورة
const handleTopLineImageClick = () => {
  if (!isImageClickable.value) return;
  emit('change-song-type');
};

const openVideoPopup = () => {
  showVideoPopup.value = true;
  document.body.style.overflow = 'hidden';
};

const closeVideoPopup = () => {
  showVideoPopup.value = false;
  document.body.style.overflow = '';
};

// تحديد إذا كنا في Upload3
const isUpload3Active = computed(() => {
  return props.currentStep === 4 || props.currentStep === 5;
});

// Handle image load error
const handleImageError = (event) => {
  console.error('Image failed to load:', event.target.src);
  event.target.src = '/icons/top-line/lossless.png';
};

// Items for ProgressBar
const items = computed(() => {
  return props.steps.map((_, index) => ({
    id: index,
    completed: index < props.currentStep,
  }));
});

// دالة للحصول على رابط الصورة الكامل
const getFullImageUrl = (url) => {
  if (!url) return null;
  
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('blob:')) return url;
  if (url.startsWith('/storage/')) return `${STORAGE_URL}${url}`;
  if (url.startsWith('storage/')) return `${STORAGE_URL}/${url}`;
  if (url.startsWith('covers/')) return `${STORAGE_URL}/${url}`;
  
  return `${STORAGE_URL}/${url}`;
};

// الحصول على الرابط الكامل للصورة للخلفية
const backgroundFullUrl = computed(() => {
  const imageUrl = props.serverCoverUrl || props.backgroundImage;
  return getFullImageUrl(imageUrl);
});

// Background image style
const bgImageStyle = computed(() => {
  const fullUrl = backgroundFullUrl.value;
  
  if (fullUrl) {
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

// Style للطبقة العليا - تتمة الصورة للجزء الأيمن
const videoBgRightImageStyle = computed(() => {
  const fullUrl = backgroundFullUrl.value;
  
  if (fullUrl) {
    const timestamp = Date.now();
    const urlWithTimestamp = `${fullUrl}${fullUrl.includes('?') ? '&' : '?'}_t=${timestamp}`;
    return {
      backgroundImage: `url(${urlWithTimestamp})`,
      backgroundSize: '1200% 1550%',
      backgroundPosition: '0px -40px',
      backgroundRepeat: 'no-repeat',
      borderRadius: '0 20px 0 0'
    };
  }
  return {};
});

// Style للطبقة العليا - تتمة الصورة للجزء الأيسر
const videoBgLeftImageStyle = computed(() => {
  const fullUrl = backgroundFullUrl.value;
  
  if (fullUrl) {
    const timestamp = Date.now();
    const urlWithTimestamp = `${fullUrl}${fullUrl.includes('?') ? '&' : '?'}_t=${timestamp}`;
    return {
      backgroundImage: `url(${urlWithTimestamp})`,
      backgroundSize: '1200% 1550%',
      backgroundPosition: '0px -40px',
      backgroundRepeat: 'no-repeat',
      borderRadius: '0 20px 0 0'
    };
  }
  return {};
});

// مراقبة تغيير serverCoverUrl
watch(() => props.serverCoverUrl, (newUrl, oldUrl) => {
  if (newUrl !== oldUrl) {
    bgImageKey.value += 1;
  }
}, { immediate: true });

// مراقبة تغيير backgroundImage
watch(() => props.backgroundImage, (newUrl, oldUrl) => {
  if (newUrl !== oldUrl) {
    bgImageKey.value += 1;
  }
});

onMounted(() => {
  window.addEventListener('resize', () => {});
  console.log('🚀 [StepLayout] mounted');
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', () => {});
});
</script>

<style lang="scss" scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Heebo', sans-serif;
}

/* YouTube Popup Styles */
.video-popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
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

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

main {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  background-color: #1B1C20;
  height: calc(100dvh - 71px - 50px);
  width: 100%;
  margin: 0;
  padding: 0;
}

main.full-vh {
  height: 88.5dvh;
}

main.no-height {
  height: auto;
  flex-grow: 1;
}

main.restrict-overflow {
  overflow: hidden;
}

.main {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 52px;
  border-radius: 20px;
  position: relative;
  height: auto;
  min-height: 400px;
  transition: min-height 0.5s ease, height 0.5s ease;
}

.main.full-height {
  height: 100%;
}

.main.content-full-height {
  display: flex;
  flex-direction: column;
  height: 100%;
  
  .overlay-content {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  
  .content-wrapper {
    flex: 1;
    display: flex;
  }
  
  .content {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
}

.main.final-page-active {
  height: 100%;
  min-height: 100%;
  flex-grow: 1;
}

/* bg-image */
.bg-image {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 20px;
  overflow: hidden;
  z-index: 0;
}

/* overlay content */
.overlay-content {
  position: relative;
  width: 100%;
  height: 100%;
  z-index: 2;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.image-blur {
  width: 100%;
  height: 100%;
  background: rgba(38, 40, 45, 0.80);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex: 1;
}

.Head {
  display: flex;
  width: 100%;
  max-width: calc(100% - 230px);
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

.top-line .top-line-image {
  height: 32px;
  width: auto;
  display: block;
  cursor: default;
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.top-line .top-line-image.clickable {
  cursor: pointer;
}

.top-line .top-line-image.clickable:hover {
  transform: scale(1.05);
  opacity: 0.8;
}

.top-line .top-line-image.clickable:active {
  transform: scale(0.95);
}

.content-wrapper {
  display: flex;
  width: 100%;
  flex-grow: 1;
  position: relative;
}

.content {
  width: 100%;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  padding-top: 50px;
}

.tabs {
  position: absolute;
  right: -30px;
  top: 0;
  height: calc(100% + 71px);
  width: 240px;
}

/* === YouTube Video Section === */
.youtube {
  display: flex;
  padding: 0 0 20px 20px;
  flex-direction: column;
  align-items: flex-end;
  gap: 7px;
  position: absolute;
  right: 0;
  top: 0;
  border-radius: 0 20px 0 40px;
  background: var(--primary);
  z-index: 2;
}

/* الزاوية اليسرى العلوية لـ .youtube */
.youtube::before {
  content: '';
  position: absolute;
  left: -20px;
  top: 0;
  background: var(--primary);
  width: 20px;
  height: 20px;
}

/* الزاوية اليمنى السفلية لتأثير الخلفية */
.youtube::after {
  content: '';
  position: absolute;
  left: -20px;
  top: 0;
  width: 20px;
  height: 20px;
  border-radius: 0 20px 0 0;
  background: var(--secondary);
}

/* حاوية الفيديو */
.video-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* المحتوى الرئيسي للفيديو */
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

/* الزاوية اليمنى السفلية - الطبقة السفلية (لون أساسي) */
.video-bg-right {
  position: absolute;
  right: 0;
  bottom: -40px;
  width: 20px;
  height: 20px;
  z-index: 1;
  background: var(--primary);
  overflow: hidden;
}

/* الطبقة العليا - الصورة للجزء الأيمن */
.video-bg-right-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  background-repeat: no-repeat;
  border-radius: 0 20px 0 0;
}

/* طبقة الـ blur للجزء الأيمن */
.video-bg-right-blur {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 3;
  background: rgba(38, 40, 45, 0.80);
  backdrop-filter: blur(10px);
  border-radius: 0 20px 0 0;
  pointer-events: none;
}

/* الزاوية اليسرى العلوية - الطبقة السفلية (لون أساسي) */
.video-bg-left {
  position: absolute;
  left: -40px;
  top: 0px;
  width: 20px;
  height: 20px;
  z-index: 1;
  background: var(--primary);
  overflow: hidden;
}

/* الطبقة العليا - الصورة للجزء الأيسر */
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

/* طبقة الـ blur للجزء الأيسر */
.video-bg-left-blur {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 3;
  background: rgba(38, 40, 45, 0.80);
  backdrop-filter: blur(10px);
  border-radius: 0 20px 0 0;
  pointer-events: none;
}

/* Responsive */
@media (max-width:1599px) {
  .video-content {
    width: 160px;
    height: 90px;
    max-width: 186px;
    max-height: 104px;
  }
  .Head {
    max-width: calc(100% - 175px);
  }
}

@media (min-width:1600px) and (max-width:2074px) {
  .video-content {
    width: 186px;
    height: 104px;
    max-width: 266px;
    max-height: 149px;
  }
  .Head {
    max-width: calc(100% - 200px);
  }
}

@media (min-width:2075px) and (max-width:2560px) {
  .video-content {
    width: 266px;
    height: 149px;
    max-width: 346px;
    max-height: 193px;
  }
  .Head {
    max-width: calc(100% - 275px);
  }
}
</style>