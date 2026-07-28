<template>
  <main :class="{ 'no-height': hasOuterContent, 'restrict-overflow': restrictOverflow }">
    <!-- YouTube Popup -->
    <div v-if="showVideoPopup" class="video-popup-overlay" @click="closeVideoPopup">
      <div class="video-popup-container" @click.stop>
        <iframe 
          width="100%" 
          height="100%" 
          :src="'https://www.youtube.com/embed/' + videoId + '?autoplay=1'"
          frameborder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture;" 
          allowfullscreen>
        </iframe>
        <button class="close-btn" @click="closeVideoPopup">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>

    <div class="containerss">
      <div class="top-section">
        <div class="top">
          <div class="padding-top">
            <!-- Progress Bar -->
            <ProgressBar
              class="your-class"
              :startColor="[51, 27, 39]"
              :endColor="[222, 20, 86]"
              :items="items"
              :with_transition="true"
              type="percent"
              :percent="currentStep / 4 * 100"
            />
            
            <div class="header-section">
              <h1 class="section-title">{{ sectionTitle }}</h1>
              <p class="section-description">{{ sectionDescription }}</p>
            </div>
          </div>
        </div>
        <div class="youtube" @click="openVideoPopup">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 34" fill="none">
            <path d="M28.5 14.4019C30.5 15.5566 30.5 18.4434 28.5 19.5981L4.5 33.4545C2.5 34.6092 -1.66828e-06 33.1658 -1.56733e-06 30.8564L-3.55968e-07 3.14359C-2.55021e-07 0.834193 2.5 -0.609185 4.5 0.545516L28.5 14.4019Z" fill="#6A6C6D"/>
          </svg>
        </div>
      </div>
      <div class="content" :style="{ marginTop: contentMarginTop }">
        <!-- Dynamic Content Slot -->
        <div class="main-content">
          <slot></slot>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import ProgressBar from '@/zoundr/components/ProgressBar.vue';

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
  currentStep: {
    type: Number,
    required: true,
  },
  steps: {
    type: Array,
    default: () => [],
  },
  sectionTitle: {
    type: [String, Object],
    default: 'Lade Dein Werk hoch',
  },
  sectionDescription: {
    type: [String, Object],
    default: 'Lade hier alle Deine Werke hoch, die du schützen möchtest',
  },
  hasOuterContent: {
    type: Boolean,
    default: false,
  },
  restrictOverflow: { // New prop to control overflow
    type: Boolean,
    default: false,
  },
});

// Items for ProgressBar
const items = computed(() => {
  return props.steps.map((_, index) => ({
    id: index,
    completed: index < props.currentStep 
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

const contentMarginTop = computed(() => {
  const width = windowWidth.value;
  if (width >= 1600 && width <= 2075) {
    return `${((width - 1600) / (2075 - 1600)) * 23}px`;
  } else if (width >= 2074 && width <= 2560) {
    const minMargin = 23;
    const maxMargin = 68;
    return `${minMargin + (maxMargin - minMargin) * (width - 2074) / (2560 - 2074)}px`;
  }
  return '0px';
});
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Heebo', sans-serif;
}

.name, .composer {
  color: #FFF;
  font-family: Heebo;
  font-size: 16px;
  text-transform: uppercase;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
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
  color: var(--move);
}

.close-btn svg {
  width: 20px;
  height: 20px;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Main Styles */
main {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #1B1C20;
  height: calc(100dvh - 71px - 50px);
}

main.no-height {
  height: auto;
  flex-grow: 1;
}

main.restrict-overflow {
  overflow: hidden;
}

.containerss {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
}

.top-section {
  display: flex;
  justify-content: space-between;
  height: 120px;
  gap: 20px;
  width: 100%;
  margin: 0;
}

.padding-top {
  padding: 20px 20px 0px 30px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 28px;
  flex-shrink: 0;
}

.top {
  display: flex;
  width: 980px;
  height: 140px;
  flex-direction: column;
  align-items: flex-start;
  gap: 32px;
  flex-shrink: 0;
  background-color: var(--secondary);
  width: 85%;
  border-radius: 20px 20px 0 0;
  position: relative;
  z-index: 1;
}

.top::after {
  background-color: var(--primary);
  width: 50px;
  height: 52px;
  z-index: 4;
  position: absolute;
  content: '';
  bottom: 20px;
  right: -50px;
  border-radius: 0 0 0 40px;
}

.top::before {
  background-color: var(--secondary);
  width: 50px;
  height: 50px;
  z-index: 4;
  position: absolute;
  content: '2';
  bottom: 15px;
  right: -50px;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.youtube {
  width: 15%;
  height: 94px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #26282D;
  border-radius: 20px;
  z-index: 10;
  cursor: pointer;
}

.youtube:hover {
  border: 1px solid var(--move);
}

@media (min-width:1440px) and (max-width:1600px) {
  .youtube {
    height: calc(85px + (100vw - 1440px) * (160 - 150) / (2560 - 1440));
  }
}

@media (min-width:1600px) and (max-width:2000px) {
  .youtube {
    height: calc(85px + (100vw - 1440px) * (160 - 80) / (2560 - 1440));
  }
}

@media (min-width: 2000px) and (max-width: 2560px) {
  .youtube {
    height: calc(75px + (100vw - 1440px) * (180 - 89) / (2560 - 1440));
  }

  .top::after {
    background-color: var(--primary);
    width: 50px;
    height: 52px;
    z-index: 4;
    position: absolute;
    content: '';
    bottom: 20px;
    right: -50px;
    border-radius: 0 0 0 30px;
  }
}

@media (min-width: 2560px) {
  .youtube {
    height: 170px;
  }
}

.youtube svg {
  width: 44px;
  height: 44px;
  fill: #6A6C6D;
  transition: transform 0.2s ease;
}

.youtube:hover svg {
  fill: #f00;
}

.content {
  background-color: var(--secondary);
  width: 100%;
  border-radius: 0 20px 20px 20px;
  flex-grow: 1;
  margin: 0;
}

.header-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: relative;
  top: 10px;
  right: -4px;
}

.section-title {
  font-family: 'Heebo', sans-serif;
  font-size: 22px;
  font-weight: 700;
  line-height: 1;
  letter-spacing: 1.1px;
  text-transform: uppercase;
  margin: 0;
}

.section-description {
  font-family: 'Heebo', sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1;
  letter-spacing: 0.7px;
  margin: 0;
  opacity: 0.8;
}

.main-content {
  padding: 29px 30px 20px;
}

/* Responsive Styles */
@media (min-width: 1440px) and (max-width: 1599px) {
  .main-content {
    padding: 29px 30px 30px 30px;
    margin-top: 28px;
    height: 100%;
  }
  .header-section {
    position: relative;
    top: 4px;
  }
  .top-section {
    height: 110px;
  }
  .top {
    height: 130px;
  }
}

@media (min-width: 1600px) and (max-width: 2075px) {
  .top {
    height: clamp(120px, calc(120px + (100vw - 1600px) * (23 / 473)), 143px);
  }
  .top::before,
  .top::after {
    bottom: 0px;
  }
  .content {
    padding-top: 0;
  }
  .main-content {
    padding: 30px 30px 30px 30px;
  }
  .header-section {
    display: flex;
    flex-direction: column;
    gap: 20px;
    position: relative;
    top: 4px;
    right: -4px;
  }
}

@media (min-width: 2074px) and (max-width: 2560px) {
  .top {
    height: calc(143px + (100vw - 2074px) / (2560 - 2074) * (188 - 143));
  }
  .top::before,
  .top::after {
    bottom: 0px;
  }
  .content {
    padding-top: 13px;
  }
  .main-content {
    padding: 0px 30px 30px 30px;
  }
}
</style>