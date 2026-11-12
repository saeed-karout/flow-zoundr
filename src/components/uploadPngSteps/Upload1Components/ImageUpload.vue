<template>
  <label class="cards-upload-file"
         for="cover-upload-input"
         @dragover.prevent="handleDragOver"
         @dragenter.prevent="handleDragEnter"
         @dragleave.prevent="handleDragLeave"
         @drop.prevent="handleDrop"
         :class="{ 'uploading': isUploadingActive, 'has-image': finalImageUrl && !isUploadingActive }">

    <!-- الخلفية الثابتة (تظهر دائماً) -->
    <img src="@/assets/images/bg-card-release/1-min.png"
         alt="Upload Background"
         class="background-image"
         aria-hidden="true" />

    <!-- Dashed border فقط إذا ما فيش صورة أبداً -->
    <div v-if="!finalImageUrl && !isUploadingActive" class="dashed-border"></div>

    <!-- الصورة النهائية (من السيرفر أو من الرفع المحلي) -->
    <img v-if="finalImageUrl && !isUploadingActive" :src="finalImageUrl" alt="Cover Image"
         class="schutzen-upload-icon uploaded-image" aria-hidden="true" />

    <!-- النصوص تظهر دائماً عند hover حتى لو存在 صورة -->
    <span v-if="!finalImageUrl && !isUploadingActive" class="schutzen-file-icon">COVER</span>
    
    <span class="schutzen-upload-text" :class="{ 'has-image': finalImageUrl && !isUploadingActive }">
      Cover Ändern
    </span>

    <!-- Input مخفي -->
    <input id="cover-upload-input"
           type="file"
           accept="image/jpeg,image/jpg"
           class="hidden-input"
           @change="handleFileSelect"
           :disabled="isUploadingActive" />

    <!-- شريط التقدم أثناء الرفع -->
    <div v-if="isUploadingActive" class="progress-container">
      <div class="progress-wrapper">
        <CircleProgress
          :percent="currentProgress"
          :size="circleSize"
          :border-width="borderWidth"
          :border-bg-width="7"
          fill-color="#DE1456"
          empty-color="#4B5563"
          :show-percent="false"
          background="#26282D"
        />
        <span class="progress-text">{{ currentProgress }}%</span>
      </div>
    </div>

    <!-- رسالة الخطأ -->
    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>
  </label>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
import CircleProgress from 'vue3-circle-progress';
import 'vue3-circle-progress/dist/circle-progress.css';

const props = defineProps({
  uploadedImage: { type: String, default: null },
  serverCoverUrl: { type: String, default: null },
  isUploading: { type: Boolean, default: false },
  uploadProgress: { type: Number, default: 0 }
});

const emit = defineEmits(['update:uploadedImage', 'file-selected']);

const isDragging = ref(false);
const errorMessage = ref('');
let errorTimer = null;
const localUploading = ref(false);
const localProgress = ref(0);
const circleSize = ref(280);
const borderWidth = ref(10);
const isMounted = ref(false);

// الحصول على STORAGE_URL من متغيرات البيئة
const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || 'https://zoundr-flow-api.davinda.dev/storage';

// دالة لتكوين المسار الكامل للصورة
const getFullImageUrl = (path) => {
  if (!path) return null;
  
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('blob:')) {
    return path;
  }
  
  let cleanPath = path;
  if (cleanPath.startsWith('/storage/')) {
    cleanPath = cleanPath.substring(8);
  } else if (cleanPath.startsWith('storage/')) {
    cleanPath = cleanPath.substring(7);
  }
  
  return `${STORAGE_URL}/${cleanPath}`;
};

const isUploadingActive = computed(() => {
  return props.isUploading || localUploading.value;
});

const currentProgress = computed(() => {
  return props.uploadProgress || localProgress.value;
});

const finalImageUrl = computed(() => {
  const imageUrl = props.serverCoverUrl || props.uploadedImage;
  if (!imageUrl) return null;
  
  if (imageUrl === '/img/bgCardSongs/card1.png' || imageUrl.includes('bgCardSongs/card1.png')) {
    return null;
  }
  
  return getFullImageUrl(imageUrl);
});

watch(() => props.isUploading, (newVal) => {
  if (!isMounted.value) return;
  if (!newVal) {
    localUploading.value = false;
    localProgress.value = 0;
  }
}, { immediate: true });

watch(() => props.serverCoverUrl, (newUrl, oldUrl) => {
  if (!isMounted.value) return;
  if (newUrl === oldUrl) return;
  
  if (newUrl) {
    localUploading.value = false;
    localProgress.value = 0;
  }
}, { immediate: true });

// تحديث حجم الدائرة
const updateCircleSize = () => {
  const container = document.querySelector('.cards-upload-file');
  if (!container) {
    circleSize.value = 280;
    borderWidth.value = 10;
    return;
  }
  
  const rect = container.getBoundingClientRect();
  const size = Math.min(rect.width, rect.height);
  
  const circleSizeValue = Math.floor(size * 0.8);
  circleSize.value = Math.max(circleSizeValue, 150);
  
  if (circleSize.value < 200) {
    borderWidth.value = 8;
  } else if (circleSize.value < 300) {
    borderWidth.value = 10;
  } else {
    borderWidth.value = 12;
  }
};

const validateImageDimensions = (file) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      if (img.width === 3000 && img.height === 3000) {
        resolve(true);
      } else {
        reject(`Die Bildgröße muss genau 3.000 x 3.000 Pixel betragen. Aktuelle Größe: ${img.width} x ${img.height} px`);
      }
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject('Die Bilddatei ist beschädigt oder ungültig.');
    };
    
    img.src = url;
  });
};

const validateFileType = (file) => {
  const validTypes = ['image/jpeg'];
  const validExtensions = ['.jpg', '.jpeg'];
  const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
  
  return validTypes.includes(file.type) && validExtensions.includes(fileExtension);
};

const validateFileSize = (file) => {
  const maxSize = 10 * 1024 * 1024;
  return file.size <= maxSize;
};

const handleDragOver = (e) => e.preventDefault();
const handleDragEnter = (e) => { 
  e.preventDefault(); 
  if (!isUploadingActive.value) isDragging.value = true;
};
const handleDragLeave = (e) => { 
  e.preventDefault(); 
  isDragging.value = false;
};
const handleDrop = (e) => {
  e.preventDefault();
  isDragging.value = false;
  if (isUploadingActive.value) return;
  
  const file = e.dataTransfer?.files?.[0];
  if (file) processFile(file);
};

const handleFileSelect = (e) => {
  const file = e.target.files?.[0];
  if (file) {
    if (isUploadingActive.value) return;
    processFile(file);
  }
  e.target.value = '';
};

const setError = (msg) => {
  errorMessage.value = msg;
  if (errorTimer) clearTimeout(errorTimer);
  errorTimer = setTimeout(() => {
    errorMessage.value = '';
  }, 3000);
};

const processFile = async (file) => {
  errorMessage.value = '';
  if (errorTimer) clearTimeout(errorTimer);

  if (!validateFileType(file)) {
    setError('Nur JPEG Dateien sind erlaubt.');
    return;
  }

  if (!validateFileSize(file)) {
    setError('Maximale Dateigröße ist 10 MB.');
    return;
  }

  try {
    await validateImageDimensions(file);
  } catch (err) {
    setError(err);
    return;
  }
  
  localUploading.value = true;
  localProgress.value = 0;
  
  const interval = setInterval(() => {
    if (localProgress.value < 90 && !props.isUploading) {
      localProgress.value += 5;
    } else {
      clearInterval(interval);
    }
  }, 300);
  
  const previewUrl = URL.createObjectURL(file);
  emit('update:uploadedImage', previewUrl);
  emit('file-selected', file);
  
  setTimeout(() => URL.revokeObjectURL(previewUrl), 300000);
  
  setTimeout(() => {
    clearInterval(interval);
  }, 3000);
};

onMounted(() => {
  isMounted.value = true;
  
  nextTick(() => {
    updateCircleSize();
  });
  
  window.addEventListener('resize', () => {
    updateCircleSize();
  });
  
  if (window.ResizeObserver) {
    const container = document.querySelector('.cards-upload-file');
    if (container) {
      const resizeObserver = new ResizeObserver(() => {
        updateCircleSize();
      });
      resizeObserver.observe(container);
    }
  }
});

onBeforeUnmount(() => {
  isMounted.value = false;
  if (errorTimer) clearTimeout(errorTimer);
  window.removeEventListener('resize', updateCircleSize);
});
</script>

<style lang="scss" scoped>
.cards-upload-file {
  display: flex;
  flex-direction: column;
  align-items: center;
  aspect-ratio: 1/1;
  border-radius: 20px;
  box-shadow: 4px 4px 20px 0 rgba(27, 28, 32, 0.20);
  position: relative;
  gap: 32px;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s ease;
  
  /* 🔥 الأبعاد الأساسية - شاشات أقل من 1440px */
  width: clamp(310px, 25vw, 310px);
  max-width: 310px;
  height: clamp(310px, 25vw, 310px);
  max-height: 310px;
}

/* 🔥 شاشات 1440-1599px: من 310px إلى 366px */
@media (min-width: 1440px) and (max-width: 1599px) {
  .cards-upload-file {
    width: clamp(310px, calc(310px + (366 - 310) * ((100vw - 1440px) / (1599 - 1440))), 366px);
    height: clamp(310px, calc(310px + (366 - 310) * ((100vw - 1440px) / (1599 - 1440))), 366px);
    max-width: 366px;
    max-height: 366px;
  }
}

/* 🔥 شاشات 1600-2074px: من 366px إلى 520px */
@media (min-width: 1600px) and (max-width: 2074px) {
  .cards-upload-file {
    width: clamp(366px, calc(366px + (520 - 366) * ((100vw - 1600px) / (2074 - 1600))), 520px);
    height: clamp(366px, calc(366px + (520 - 366) * ((100vw - 1600px) / (2074 - 1600))), 520px);
    max-width: 520px;
    max-height: 520px;
  }
}

/* 🔥 شاشات 2075-2560px: من 378px إلى 503px */
@media (min-width: 2075px) and (max-width: 2560px) {
  .cards-upload-file {
    width: clamp(378px, calc(378px + (503 - 378) * ((100vw - 2075px) / (2560 - 2075))), 503px);
    height: clamp(378px, calc(378px + (503 - 378) * ((100vw - 2075px) / (2560 - 2075))), 503px);
    max-width: 503px;
    max-height: 503px;
  }
}

/* 🔥 شاشات أكبر من 2560px */
@media (min-width: 2561px) {
  .cards-upload-file {
    width: 503px;
    height: 503px;
    max-width: 503px;
    max-height: 503px;
  }
}

.cards-upload-file:hover {
  box-shadow: 0 8px 30px rgba(222, 20, 86, 0.15);
}

.cards-upload-file.uploading {
  cursor: wait;
}

.background-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 20px;
  z-index: 0;
  pointer-events: none;
}

.cards-upload-file::after {
  content: '';
  position: absolute;
  inset: 0;
  background-color: rgba(35, 35, 35, 0.3);
  border-radius: 20px;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 1;
  pointer-events: none;
}

.cards-upload-file:hover::after {
  opacity: 1;
}

.cards-upload-file.has-image::before {
  content: '';
  position: absolute;
  inset: 0;
  background-color: rgba(35, 35, 35, 0.5);
  border-radius: 20px;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 2;
  pointer-events: none;
}

.cards-upload-file.has-image:hover::before {
  opacity: 1;
}

.dashed-border {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 20px;
  background-image: url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='20' ry='20' stroke='white' stroke-width='5' stroke-dasharray='8%2c 18' stroke-dashoffset='0' stroke-linecap='round'/%3e%3c/svg%3e");
  z-index: 1;
}

.schutzen-upload-icon {
  position: relative;
  width: 100%;
  transition: all 0.3s ease;
  border-radius: 20px;
  opacity: 1;
  object-fit: cover;
  height: 100%;
  z-index: 1;
}

.schutzen-upload-icon.uploaded-image {
  opacity: 1;
}

.schutzen-file-icon {
  position: absolute;
  color: var(--Main-Colors-White, #FFF);
  text-align: center;
  font-family: Heebo;
  font-size: clamp(60px, 9vw, 85px);
  font-style: normal;
  font-weight: 700;
  line-height: 100%;
  text-transform: uppercase;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  transition: opacity 0.3s ease, transform 0.3s ease;
  z-index: 2;
  pointer-events: none;
}

.schutzen-upload-text {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  text-align: center;
  font-size: clamp(1.5rem, 2.7vw, 2.8rem);
  font-weight: bold;
  text-transform: uppercase;
  border-radius: 20px;
  opacity: 0;
  transform: translateY(80px);
  transition: opacity 0.3s ease, transform 0.4s ease;
  z-index: 3;
  pointer-events: none;
}

.schutzen-upload-text.has-image {
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.8);
}

.cards-upload-file:hover .schutzen-file-icon {
  opacity: 0;
  transform: translate(-50%, -70px);
}

.cards-upload-file:hover .schutzen-upload-text {
  opacity: 1;
  transform: translateY(0);
}

.cards-upload-file.has-image:hover .schutzen-upload-text {
  opacity: 1;
  transform: translateY(0);
}

.hidden-input {
  display: none;
}

.error-message {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  background: var(--secondary);
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid var(--Strawberry);
  text-align: center;
  z-index: 20;
  max-width: 90%;
  backdrop-filter: blur(4px);
}

.progress-container {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(0deg, rgba(38, 40, 45, 0.70) 0%, rgba(38, 40, 45, 0.70) 100%);
  border-radius: 20px;
  z-index: 10;
  backdrop-filter: blur(4px);
}

.progress-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.progress-text {
  position: absolute;
  color: white;
  font-size: clamp(2rem, 4vw, 4rem);
  font-weight: 700;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
  font-family: Heebo;
}

:deep(.circle-progress) {
  width: auto !important;
  height: auto !important;
}

:deep(.circle-progress__text) {
  display: none;
}

:deep(.circle-progress__circle) {
  transform: rotate(-90deg);
}

:deep(.circle-progress__circle-foreground) {
  // stroke: var(--Strawberry, #DE1456) !important;
  transition: stroke-dashoffset 0.1s linear;
}
</style>