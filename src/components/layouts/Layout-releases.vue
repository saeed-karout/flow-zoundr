<template>
  <main :class="{ 
    'no-height': hasOuterContent, 
    'restrict-overflow': restrictOverflow, 
    'full-vh': showNewRight2,
    'upload3-active': isUpload3Active,
    'step-1': currentStep === 1,
    'height-full': heightMode === 'full',
    'force-full-height': forceFullHeight && (currentStep === 3),
    'overflow-auto': shouldUseOverflowAuto,
    'overflow-hidden': shouldUseOverflowHidden,
     'first-section-active': currentStep === 3 && currentView === 'firstSection'
  }">
    <!-- Vimeo Popup -->
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

    <div 
      class="main" 
      :class="mainClasses"
      :style="mainStyle"
    >
      
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
                v-if="shouldShowImage && displayTopLineImage"
                :src="displayTopLineImage" 
                alt="Top line image" 
                class="top-line-image"
                :class="{ 'clickable': isImageClickable }"
                @click="handleTopLineImageClick"
                @error="handleImageError"
                @load="onImageLoad"
                :style="{ opacity: imageLoaded ? 1 : 0 }"
              >
            </div>
          </div>

          <div class="content-wrapper">
            <div class="content">
              <slot></slot>
            </div>
            <!-- ✅ عمود تبويبات تفاصيل الأغنية يخصّ الخطوة 3 (Songs) فقط — كان الشرط
                 currentStep === 2 فيظهر فوق Metas إذا بقي currentView على 'infos'
                 (مثلاً: تعديل أغنية ← COVER ← رفع غلاف ← Metas). -->
            <Tabs v-if="currentStep === 3 && currentView === 'infos'" class="tabs"
              :server-cover-url="backgroundFullUrl"
              @update-tab="$emit('update-tab', $event)"
              @back="$emit('back')" />
          </div>
        </div>
      </div>

      <!-- Vimeo Video Section -->
      <div class="youtube" @click="openVideoPopup" :style="youtubeCornerStyle">
        <div class="video-wrapper">
          <div class="video-bg-left">
            <div class="video-bg-left-image" :style="videoBgLeftImageStyle"></div>
            <div class="video-bg-left-blur"></div>
          </div>
          <div class="video-content">
            <img src="@/assets/icons/Play.png" alt="Vimeo Play Icon">
          </div>
          <div class="video-bg-right">
            <div class="video-bg-right-clip">
              <div class="video-bg-right-image" :style="videoBgRightImageStyle"></div>
              <div class="video-bg-right-blur"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
import ProgressBar from '@/zoundr/components/ProgressBar.vue';
import Tabs from '@/components/uploadPngSteps/Upload2/tabs.vue';
import { useReleaseStore } from '@/stores/release';

import losslessIcon from '@/assets/icons/top-line/lossless.png';
import digitalMastersIcon from '@/assets/icons/top-line/digital-masters.png';
import admIcon from '@/assets/icons/top-line/ADM.png';

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
  serverCoverUrl: { type: [String, null], default: null },
  forceFullHeight: { type: Boolean, default: false },
  heightMode: { type: String, default: 'auto' },
  videoId: { type: String, default: '480705053' },
  uploadedImage: { type: [String, null], default: null },
});

const emit = defineEmits(['back', 'update-tab', 'update:topLineImage', 'change-audio-quality']);

const releaseStore = useReleaseStore();

const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || 'https://zoundr-flow-api.davinda.dev/storage';
const DEFAULT_BG_IMAGE = '/img/bgCardSongs/card1.png';

const audioQualityImageMap = {
  'lossless': losslessIcon,
  'digital_master': digitalMastersIcon,
  'dobly_atmos': admIcon
};

const showVideoPopup = ref(false);
const videoId = ref(props.videoId || '480705053');
const bgImageKey = ref(0);
const imageLoaded = ref(false);
const vimeoRef = ref(null);
const videoError = ref(false);

// ========== 🔥 حساب الـ classes ==========
const mainClasses = computed(() => {
  const isContentFullHeight = props.showNewRight2 && props.currentStep === 2;

  return {
    'full-height': (props.showNewRight2 || props.showFinalPage || isUpload3Active.value) && props.currentStep !== 1,
    'final-page-active': props.showFinalPage,
    'upload3-height': isUpload3Active.value,
    'content-full-height': isContentFullHeight,
    'songs-main-view': props.currentStep === 3 && props.currentView === 'main',
    'force-full-height': props.forceFullHeight && (props.currentStep === 1 || props.currentStep === 2)
  };
});
// ========== 🔥 حساب الـ style ==========
// ========== 🔥 حساب الـ style ==========
const mainStyle = computed(() => {
  // ✅ عند العودة إلى Cover، إزالة الارتفاع
  if (props.currentStep === 1 && !props.showNewRight2) {
    return {
      height: 'auto !important',
      minHeight: 'auto !important'
    };
  }

  return {};
});

// ========== 🔥 تحديد نوع الـ overflow ==========
const shouldUseOverflowAuto = computed(() => {
  if (props.heightMode === 'full' || props.currentStep === 3 || props.forceFullHeight) {
    return true;
  }
  if (props.showNewRight2 || props.showFinalPage || isUpload3Active.value) {
    return true;
  }
  return false;
});

const shouldUseOverflowHidden = computed(() => !shouldUseOverflowAuto.value);

// ========== 🔥 بناء رابط Vimeo ==========
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

const shouldShowImage = computed(() => {
  if (props.currentStep === 2) return false;
  if (props.currentStep === 3) return props.currentView !== 'main';
  return false;
});

const isImageClickable = computed(() => {
  return props.currentStep === 3 &&
         props.currentView !== 'main' &&
         (props.currentView === 'firstSection' || props.currentView === 'infos') &&
         // ✅ لا يمكن النقر لتغيير نوع الصوت بعد رفع ملف صوتي
         !releaseStore.hasUploadedAudio;
});

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
  console.warn('⚠️ [StepLayout] Unknown URL format:', url);
  return url;
};

const displayTopLineImage = computed(() => {
  const image = props.topLineImage;
  if (image) {
    return getFullImageUrl(image);
  }
  const quality = releaseStore.draftRelease?.audio_quality;
  if (quality && audioQualityImageMap[quality]) {
    return audioQualityImageMap[quality];
  }
  return null;
});

const onImageLoad = () => {
  imageLoaded.value = true;
  console.log('✅ [StepLayout] Top line image loaded successfully');
};

const handleTopLineImageClick = () => {
  if (!isImageClickable.value) return;
  console.log('🖱️ [StepLayout] تم النقر على الصورة العلوية - تغيير نوع الأغنية');
  emit('change-audio-quality');
};

const handleImageError = (event) => {
  console.error('❌ [StepLayout] Image failed to load:', event.target.src);
  event.target.src = losslessIcon;
  event.target.style.display = 'block';
  imageLoaded.value = true;
};

const preloadImage = (src) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(src);
    img.onerror = () => resolve(null);
    img.src = src;
  });
};

// ✅ عندما تصل صورة الـ top-line بعد تحميل الـ Layout (مثل الانتقال التلقائي إلى
//    FirstSection عند وجود audio_quality محفوظة)، نُحمّلها مسبقاً ونكشفها بأنفسنا بدل
//    الاعتماد فقط على حدث @load الذي قد لا يُطلق فتبقى الصورة بشفافية 0 (غير مرئية).
//    مُعرّفة بعد preloadImage لتفادي مشكلة TDZ عند التشغيل الفوري (immediate).
watch(() => displayTopLineImage.value, async (newImg) => {
  imageLoaded.value = false;
  if (newImg) {
    await preloadImage(newImg);
    imageLoaded.value = true;
  }
}, { immediate: true });

// ========== 🔥 دوال فتح وإغلاق الفيديو ==========
const openVideoPopup = () => {
  console.log('🎬 [StepLayout] Opening Vimeo video with ID:', videoId.value);
  showVideoPopup.value = true;
  videoError.value = false;
  document.body.style.overflow = 'hidden';
  nextTick(() => {
    setTimeout(() => {
      reloadVideo();
    }, 300);
  });
};

const closeVideoPopup = () => {
  showVideoPopup.value = false;
  document.body.style.overflow = '';
  videoError.value = false;
};

// ========== 🔥 مستمع حدث Esc ==========
const handleKeydown = (event) => {
  if (showVideoPopup.value && event.key === 'Escape') {
    console.log('⌨️ [StepLayout] Esc pressed, closing video popup');
    closeVideoPopup();
  }
};

watch(() => props.videoId, (newId) => {
  if (newId) {
    const cleanId = newId.replace(/\D/g, '');
    if (cleanId) {
      videoId.value = cleanId;
      console.log('🔄 [StepLayout] Video ID updated to:', videoId.value);
    }
  }
}, { immediate: true });

const isUpload3Active = computed(() => props.currentStep === 4 || props.currentStep === 5);

const items = computed(() => {
  return props.steps.map((_, index) => ({
    id: index,
    completed: index < props.currentStep,
  }));
});

// ========== 🔥 حساب الصورة الخلفية ==========
const backgroundFullUrl = ref(DEFAULT_BG_IMAGE);

// ✅ دالة تحديث الخلفية
const updateBackground = (imageUrl) => {
  console.log('🖼️ [StepLayout] updateBackground called with:', imageUrl);
  
  if (!imageUrl || imageUrl === '' || imageUrl === '/img/bgCardSongs/card1.png') {
    backgroundFullUrl.value = DEFAULT_BG_IMAGE;
    bgImageKey.value += 1;
    console.log('🖼️ [StepLayout] Reset to default background image');
    return;
  }
  
  const fullUrl = getFullImageUrl(imageUrl);
  if (fullUrl && fullUrl !== DEFAULT_BG_IMAGE) {
    backgroundFullUrl.value = fullUrl;
    bgImageKey.value += 1;
    console.log('🖼️ [StepLayout] Updated background image to:', fullUrl);
  } else {
    backgroundFullUrl.value = DEFAULT_BG_IMAGE;
    bgImageKey.value += 1;
  }
};

// ✅ حساب الصورة بناءً على الأولويات عند التهيئة
const getInitialImageUrl = () => {
  // الأولوية: uploadedImage > serverCoverUrl > backgroundImage
  return props.uploadedImage || props.serverCoverUrl || props.backgroundImage;
};

// 🔥 مراقبة uploadedImage (أولوية قصوى)
watch(() => props.uploadedImage, (newUrl, oldUrl) => {
  if (newUrl !== oldUrl) {
    console.log('🖼️ [StepLayout] uploadedImage changed:', newUrl);
    if (!newUrl || newUrl === '' || newUrl === '/img/bgCardSongs/card1.png') {
      // ✅ إذا تم مسح الصورة، استخدم الصورة الافتراضية
      backgroundFullUrl.value = DEFAULT_BG_IMAGE;
      bgImageKey.value += 1;
      console.log('🖼️ [StepLayout] Reset to default background image (uploadedImage cleared)');
    } else {
      const fullUrl = getFullImageUrl(newUrl);
      if (fullUrl) {
        backgroundFullUrl.value = fullUrl;
        bgImageKey.value += 1;
        console.log('🖼️ [StepLayout] Updated background image from uploadedImage:', fullUrl);
      }
    }
  }
}, { immediate: true });

// 🔥 مراقبة serverCoverUrl (يتم تجاهلها إذا كانت uploadedImage موجودة)
watch(() => props.serverCoverUrl, (newUrl, oldUrl) => {
  // ✅ إذا كانت uploadedImage موجودة وصالحة، لا نغير بناءً على serverCoverUrl
  if (props.uploadedImage && props.uploadedImage !== '' && props.uploadedImage !== '/img/bgCardSongs/card1.png') {
    console.log('🖼️ [StepLayout] uploadedImage has priority, ignoring serverCoverUrl change');
    return;
  }
  
  if (newUrl !== oldUrl) {
    console.log('🖼️ [StepLayout] serverCoverUrl changed:', newUrl);
    updateBackground(newUrl);
  }
}, { immediate: true });

// 🔥 مراقبة backgroundImage (كحل أخير)
watch(() => props.backgroundImage, (newUrl, oldUrl) => {
  // ✅ إذا كانت uploadedImage أو serverCoverUrl موجودة وصالحة، لا نغير
  if (props.uploadedImage && props.uploadedImage !== '' && props.uploadedImage !== '/img/bgCardSongs/card1.png') {
    return;
  }
  if (props.serverCoverUrl && props.serverCoverUrl !== '' && props.serverCoverUrl !== '/img/bgCardSongs/card1.png') {
    return;
  }
  
  if (newUrl !== oldUrl) {
    console.log('🖼️ [StepLayout] backgroundImage changed:', newUrl);
    updateBackground(newUrl);
  }
}, { immediate: true });

// ========== 🔥 حساب الـ bgImageStyle ==========
const bgImageStyle = computed(() => {
  const fullUrl = backgroundFullUrl.value;
  if (fullUrl) {
    // ✅ بلا طابع زمني — مورد واحد مشترك مع شرائح الزوايا والتبويبات،
    //    فتبدو صورة واحدة متّصلة بدل موارد متعددة.
    return {
      backgroundImage: `url("${fullUrl}")`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      // ✅ مثبّت بالنافذة كي تتطابق معه شرائح الزوايا (youtube::after / video-bg-right)
      //    فتبدو تتمّةً متّصلة لهذه الخلفية.
      backgroundAttachment: 'fixed',
      backgroundRepeat: 'no-repeat'
    };
  }
  return { backgroundColor: 'var(--secondary)' };
});

// ✅ متغيّر CSS يحمل صورة الغلاف لتمريرها إلى العنصر الزائف .youtube::after
//    (لا يمكن ضبط خلفية عنصر زائف عبر :style مباشرةً).
const youtubeCornerStyle = computed(() => {
  const fullUrl = backgroundFullUrl.value;
  return { '--cover-img': fullUrl ? `url("${getUrlWithTimestamp(fullUrl)}")` : 'none' };
});

// ✅ يُعيد العنوان كما هو. كان يُلحق _t=Date.now() فتصبح كل شريحة (الخلفية،
//    زاوية youtube::after، video-bg-right/left، التبويبات) مورداً منفصلاً — أي
//    صوراً متعددة قد تصل في أوقات مختلفة فتظهر فواصل بينها بدل صورة متّصلة.
const getUrlWithTimestamp = (url) => (url || null);

const videoBgRightImageStyle = computed(() => {
  const fullUrl = backgroundFullUrl.value;
  if (fullUrl) {
    const urlWithTimestamp = getUrlWithTimestamp(fullUrl);
    return {
      backgroundImage: `url(${urlWithTimestamp})`,
      // ✅ نفس أسلوب الخلفية (cover + مثبّت بالنافذة) فتُكمِل صورة .bg-image بسلاسة.
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      backgroundRepeat: 'no-repeat'
    };
  }
  return {};
});

const videoBgLeftImageStyle = computed(() => {
  const fullUrl = backgroundFullUrl.value;
  if (fullUrl) {
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

// ========== 🔥 مراقبة التغييرات الأخرى ==========
watch(() => props.topLineImage, (newUrl, oldUrl) => {
  if (newUrl !== oldUrl) {
    console.log('🖼️ [StepLayout] topLineImage changed:', newUrl);
    // ⚠️ لا نُصفّر imageLoaded هنا. إدارة imageLoaded مسؤولية مراقِب displayTopLineImage
    //    وحده. كان تصفيرها هنا يُخفي الصورة (opacity 0) عندما يتغيّر prop إلى نفس عنوان
    //    الصورة الناتج (مثلاً من مسار draftRelease.audio_quality الاحتياطي إلى نفس
    //    ملف lossless): displayTopLineImage لا يتغيّر فلا يُعيد الكشف، و@load لا يُطلق
    //    لأن src لم يتغيّر → تبقى الصورة مخفية. الاعتماد على مراقِب displayTopLineImage.
  }
});

watch(() => shouldUseOverflowAuto.value, (newVal) => {
  console.log('🔄 [StepLayout] overflow mode changed:', newVal ? 'auto' : 'hidden');
});

// ========== 🔥 مراقبة currentStep لإزالة الارتفاع عند العودة إلى Cover ==========
watch(() => props.currentStep, (newStep, oldStep) => {
  // ✅ إذا عدنا إلى الخطوة 1 (Cover)
  if (newStep === 1 && oldStep && oldStep > 1) {
    console.log('📌 [StepLayout] العودة إلى Cover، إزالة الارتفاع 100%');
    nextTick(() => {
      const mainEl = document.querySelector('.main');
      if (mainEl) {
        mainEl.style.height = 'auto';
        mainEl.style.minHeight = 'auto';
        mainEl.classList.remove('full-height', 'content-full-height');
        console.log('✅ [StepLayout] تم إزالة الارتفاع 100%');
      }
    });
  }
}, { immediate: true });
// ========== 🔥 دورة حياة المكون ==========
onMounted(async () => {
  window.addEventListener('resize', () => {});
  window.addEventListener('keydown', handleKeydown);
  
  // ✅ تعيين الخلفية الأولية
  const initialImage = getInitialImageUrl();
  updateBackground(initialImage);
  
  console.log('🚀 [StepLayout] mounted');
  console.log('🖼️ [StepLayout] serverCoverUrl:', props.serverCoverUrl);
  console.log('🖼️ [StepLayout] uploadedImage:', props.uploadedImage);
  console.log('🖼️ [StepLayout] backgroundImage:', props.backgroundImage);
  console.log('🖼️ [StepLayout] backgroundFullUrl:', backgroundFullUrl.value);
  console.log('🖼️ [StepLayout] topLineImage:', props.topLineImage);
  console.log('🖼️ [StepLayout] displayTopLineImage:', displayTopLineImage.value);
  console.log('🎬 [StepLayout] Video ID:', videoId.value);
  console.log('🔄 [StepLayout] overflow mode:', shouldUseOverflowAuto.value ? 'auto' : 'hidden');
  
  if (displayTopLineImage.value) {
    await preloadImage(displayTopLineImage.value);
    imageLoaded.value = true;
  }
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', () => {});
  window.removeEventListener('keydown', handleKeydown);
  document.body.style.overflow = '';
});
</script>

<style lang="scss" scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Heebo', sans-serif;
}

main.first-section-active {
  height: 100%;
  min-height: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
}

main.first-section-active > .main {
  height: 100%;
  min-height: 100%;
  flex: 1;
}

main.first-section-active > .main .overlay-content,
main.first-section-active > .main .image-blur,
main.first-section-active > .main .content-wrapper,
main.first-section-active > .main .content {
  height: 100%;
  min-height: 100%;
  flex: 1;
}

/* ========== Vimeo Popup Styles ========== */
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

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* ========== Main Styles ========== */
main {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  background-color: #1B1C20;
  height: auto;
  min-height: 100%;
  width: 100%;
  margin: 0;
  padding: 0;
  flex-grow: 1;
  overflow: hidden;
  transition: overflow 0.3s ease;
}

main.overflow-auto {
  overflow-y: auto;
  overflow-x: hidden;
}

main.overflow-hidden {
  overflow: hidden;
}

main.overflow-auto::-webkit-scrollbar {
  width: 6px;
}

main.overflow-auto::-webkit-scrollbar-track {
  background: var(--Main-Colors-Slate, #26282D);
  border-radius: 3px;
}

main.overflow-auto::-webkit-scrollbar-thumb {
  background: var(--Strawberry, #D15);
  border-radius: 3px;
}

main.overflow-auto::-webkit-scrollbar-thumb:hover {
  background: var(--Strawberry-dark, #B03A5A);
}

main.overflow-auto {
  scrollbar-width: thin;
  scrollbar-color: var(--Strawberry, #D15) var(--Main-Colors-Slate, #26282D);
}

main.step-1 {
  flex-grow: 1;
  min-height: 100%;
  overflow: hidden !important;
}

main.full-vh {
  height: 88.5dvh;
  overflow: auto;
}

main.height-full {
  height: 100%;
  min-height: 100%;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  overflow: auto;
}

main.force-full-height {
  height: 100%;
  min-height: 100%;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  overflow: auto;
}

main.force-full-height > .main {
  height: 100%;
  min-height: 100%;
  flex: 1;
}

main.force-full-height > .main .overlay-content,
main.force-full-height > .main .image-blur,
main.force-full-height > .main .content-wrapper,
main.force-full-height > .main .content {
  height: 100%;
  min-height: 100%;
}

main.no-height {
  height: auto;
  flex-grow: 1;
  overflow: hidden;
}

main.restrict-overflow {
  overflow: hidden !important;
}

/* ========== Main Container ========== */
.main {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 52px;
  border-radius: 20px;
  position: relative;
  height: auto;
  min-height: auto;
  /* Enable the existing height transition to animate between the intrinsic
     size (auto) and 100% — e.g. .content-full-height when entering NewRight2. */
  interpolate-size: allow-keywords;
  transition: min-height 0.5s ease, height 0.5s ease;
}

/* 🔥 full-height */
.main.full-height {
  height: 100% !important;
  min-height: 100% !important;
}

.main.step-1 {
  height: 100% !important;
  min-height: 100% !important;
  gap: 20px !important;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.main.step-1 .overlay-content {
  height: 100% !important;
  min-height: 100% !important;
  flex: 1;
}

.main.step-1 .image-blur {
  height: 100% !important;
  min-height: 100% !important;
  padding-bottom: 20px;
  flex: 1;
}

.main.step-1 .content-wrapper {
  height: 100% !important;
  min-height: 100% !important;
  flex-grow: 1;
}

.main.step-1 .content {
  height: 100% !important;
  min-height: 100% !important;
  flex-grow: 1;
  padding-top: 20px !important;
}

.main.songs-main-view {
  height: 100%;
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

.main.force-full-height {
  height: 100% !important;
  min-height: 100% !important;
}

.main.force-full-height .overlay-content,
.main.force-full-height .image-blur,
.main.force-full-height .content-wrapper,
.main.force-full-height .content {
  height: 100% !important;
  min-height: 100% !important;
}

.main.content-full-height {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.main.content-full-height .overlay-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.main.content-full-height .content-wrapper {
  flex: 1;
  display: flex;
}

.main.content-full-height .content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.main.final-page-active {
  height: 100%;
  min-height: 100%;
  flex-grow: 1;
}

/* ========== bg-image ========== */
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

/* ========== overlay content ========== */
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
  padding: 20px 20px 20px 20px;
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
  transition: transform 0.2s ease, opacity 0.3s ease;
  filter: brightness(0) invert(1);
  opacity: 0;
}

.top-line .top-line-image.clickable {
  cursor: pointer;
}

.top-line .top-line-image.clickable:hover {
  transform: scale(1.02);
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

/* ========== Vimeo Video Section ========== */
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
  width: 20px;
  height: 20px;
  border-radius: 0 20px 0 0;
  /* ✅ صورة الغلاف كتتمّة لـ .bg-image: مثبّتة بالنافذة (fixed) بمقاس cover، مع طبقة
     تعتيم داكنة تُطابق تعتيم الخلفية. تعود إلى لون secondary عند غياب الغلاف. */
  background-color: var(--secondary);
  background-image: linear-gradient(rgba(38, 40, 45, 0.80), rgba(38, 40, 45, 0.80)), var(--cover-img, none);
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  background-repeat: no-repeat;
}

.video-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
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
  bottom: -40px;
  width: 20px;
  height: 20px;
  z-index: 1;
  background: var(--primary);
  overflow: hidden;
}

/* ✅ طبقة قصّ داخلية تتولّى التدوير وحدها.
   لماذا: اجتماع backdrop-filter مع border-radius على نفس العنصر يُنتج في Chromium
   هالة فاتحة بعرض بكسل على الحافة المُدوّرة (الـ «border أبيض»). ووضع التدوير
   على الحاوية الخارجية كان يقصّ خلفيتها primary أيضاً فيظهر ما خلفها (صورة
   الصفحة) في الركن. الطبقة الداخلية تحلّ الأمرين: لا تدوير على طبقة التمويه،
   وخلفية primary تبقى ظاهرة في الركن المُدوّر كما كانت. */
.video-bg-right-clip {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 0 20px 0 0;
  overflow: hidden;
}



.video-bg-right-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  /* ✅ تعتيم كامل (1) مطابق لغلاف .bg-image — كان 0.9 يجعلها أفتح فتبدو منقطعة */
  opacity: 1;
  z-index: 2;
  background-repeat: no-repeat;
  /* مربّعة عمداً — التدوير تتولّاه الحاوية عبر overflow: hidden. */
}

.video-bg-right-blur {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 3;
  background: rgba(38, 40, 45, 0.80);
  backdrop-filter: blur(10px);
  /* مربّعة عمداً — التدوير تتولّاه الحاوية عبر overflow: hidden. */
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

@media (max-height:850px) {
  .overlay-content,
  .image-blur {
    overflow: auto;
    scrollbar-width: none;
  }
}

@media (max-height:1000px) {
  main.restrict-overflow,
  .bg-image,
  .main.content-full-height .overlay-content,
  .main.content-full-height .image-blur,
  .main.content-full-height .content-wrapper,
  .main.content-full-height .content {
    overflow: auto !important;
    scrollbar-width: none;
  }
}

/* ========== Responsive ========== */
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
    max-width: calc(100% - 285px);
  }
}
</style>