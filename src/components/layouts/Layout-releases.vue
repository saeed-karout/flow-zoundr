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
    }"
      :style="backgroundImage && currentStep === 1 ? { backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}">

      <div class="Head">
        <ProgressBar :startColor="[51, 27, 39]" :endColor="[222, 20, 86]" :items="items" :with_transition="true"
          type="percent" :percent="currentStep / (steps.length) * 100" />
        <div class="top-line">
          <div class="p">{{ sectionTitle }}</div>
          <img v-if="currentStep === 2 && ['firstSection', 'infos'].includes(currentView) || currentStep === 3"
            :src="topLineImage || '/icons/top-line/lossless.png'" alt="Top line image" @error="handleImageError">
        </div>
      </div>

      <div class="youtube" @click="openVideoPopup">
        <div class="video">
          <img src="@/assets/icons/Play.png" alt="YouTube Play Icon">
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
  </main>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import ProgressBar from '@/zoundr/components/ProgressBar.vue';
import Tabs from '@/components/uploadPngSteps/Upload2/tabs.vue';

// YouTube Popup functionality
const showVideoPopup = ref(false);
const videoId = ref('WPni755-Krg');

const openVideoPopup = () => {
  showVideoPopup.value = true;
  document.body.style.overflow = 'hidden';
};

const closeVideoPopup = () => {
  showVideoPopup.value = false;
  document.body.style.overflow = '';
};

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
});


// تحديد إذا كنا في Upload3
const isUpload3Active = computed(() => {
  return props.currentStep === 4 || 5;
});

// Handle image load error
const handleImageError = (event) => {
  console.error('Image failed to load:', event.target.src);
  event.target.src = '/icons/top-line/lossless.png'; // Fallback to public folder
};

// Emits
const emit = defineEmits(['back', 'update-tab', 'update:topLineImage']);

// Items for ProgressBar
const items = computed(() => {
  return props.steps.map((_, index) => ({
    id: index,
    completed: index < props.currentStep,
  }));
});

// Responsive margin calculation
const windowWidth = ref(window.innerWidth);

const updateWindowWidth = () => {
  windowWidth.value = window.innerWidth;
};

onMounted(() => {
  window.addEventListener('resize', updateWindowWidth);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateWindowWidth);
});

// Debug prop changes
watch(() => [props.showNewRight2, props.showFinalPage, props.currentView, props.topLineImage, props.currentStep], ([newShowNewRight2, newShowFinalPage, newCurrentView, newTopLineImage, newStep]) => {
  console.log('StepLayout props:', {
    showNewRight2: newShowNewRight2,
    showFinalPage: newShowFinalPage,
    currentView: newCurrentView,
    topLineImage: newTopLineImage,
    currentStep: newStep,
    isUpload3Active: newStep === 3
  });
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
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
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
  // padding: 20px 30px 52px 30px;
  padding: 20px 30px 40px 30px;
  flex-direction: column;
  align-items: flex-start;
  gap: 52px;
  border-radius: 20px;
  background: var(--secondary);
  position: relative;
  height: auto;
  min-height: 400px;
  transition: min-height 0.5s ease, height 0.5s ease;
}

.main.full-height {
  // min-height: 100%;
  height: 100%;
  transition: min-height 0.5s ease, height 0.5s ease;
}

.main.content-full-height {
  display: flex;
  flex-direction: column;
  height: 100%;
  
  .content-wrapper {
    flex: 1; // يأخذ كل المساحة المتبقية
    display: flex;
  }
  
  .content {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
}

/* ارتفاع خاص لـ Upload3 */
// .main.upload3-height {
//   height: 100%;
//   min-height: 100%;
// }

.main.final-page-active {
  height: 100%;
  min-height: 100%;
  flex-grow: 1;
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
}

.tabs {
  position: absolute;
  right: -30px;
  top: 0;
  height: calc(100% + 71px);
  width: 240px;
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

.top-line img {
  width: 33px;
  height: 32px;
  display: block;

}

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
}

.youtube::before {
  content: '';
  position: absolute;
  left: -20px;
  top: 0;
  background: var(--primary);
  width: 20px;
  height: 20px;
}

.youtube::after {
  content: '';
  position: absolute;
  left: -20px;
  top: 0;
  background: var(--secondary);
  width: 20px;
  height: 20px;
  border-radius: 0 20px 0 0;
}

.video {
  display: flex;
  width: 220px;
  height: 123px;
  padding: 39px 83px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  aspect-ratio: 220/123;
  border-radius: 20px;
  background: var(--secondary);
  cursor: pointer;
}

.video:hover {
  transition: 0.3s ease;
  border: 1px solid var(--move);
}

.video:hover img {
  filter: brightness(0) invert(1);
}

.video::before {
  content: '';
  position: absolute;
  right: 0px;
  bottom: -20px;
  background: var(--primary);
  width: 20px;
  height: 20px;
}

.video::after {
  content: '';
  position: absolute;
  right: 0px;
  bottom: -20px;
  background: var(--secondary);
  width: 20px;
  height: 20px;
  border-radius: 0 20px 0 0;
}


@media (max-width:1599px) {
  .video {
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
  .video {
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
  .video {
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