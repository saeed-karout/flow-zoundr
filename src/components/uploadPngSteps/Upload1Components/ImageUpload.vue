<template>
  <label class="cards-upload-file"
         for="cover-upload-input"
         @dragover.prevent="handleDragOver"
         @dragenter.prevent="handleDragEnter"
         @dragleave.prevent="handleDragLeave"
         @drop.prevent="handleDrop"
         :class="{ 'uploading': isUploadingActive }">

    <!-- الخلفية الثابتة (تظهر دائماً) -->
    <img src="@/assets/images/bg-card-release/1-min.png"
         alt="Upload Background"
         class="background-image"
         aria-hidden="true" />

    <!-- Dashed border فقط إذا ما فيش صورة أبدًا -->
    <div v-if="!finalImageUrl && !isUploadingActive" class="dashed-border"></div>

    <!-- الصورة النهائية (من السيرفر أو من الرفع المحلي) -->
    <img v-if="finalImageUrl && !isUploadingActive" :src="finalImageUrl" alt="Cover Image"
         class="schutzen-upload-icon uploaded-image" aria-hidden="true" />

    <!-- النصوص تظهر فقط إذا ما فيش صورة -->
    <span v-if="!finalImageUrl && !isUploadingActive" class="schutzen-file-icon">IMG</span>
    <span v-if="!finalImageUrl && !isUploadingActive" class="schutzen-upload-text">Cover Ändern</span>

    <!-- Input مخفي -->
    <input id="cover-upload-input"
           type="file"
           accept="image/jpeg,image/jpg,image/png"
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
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
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
const localUploading = ref(false);
const localProgress = ref(0);
const circleSize = ref(352);
const borderWidth = ref(12);

// الحصول على STORAGE_URL من متغيرات البيئة
const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || 'https://zoundr-flow-api.davinda.dev/storage';

// دالة لتكوين المسار الكامل للصورة
const getFullImageUrl = (path) => {
  if (!path) return null;
  
  // إذا كان الرابط كاملاً (يبدأ بـ http:// أو https:// أو blob:)
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('blob:')) {
    return path;
  }
  
  // إذا كان المسار يبدأ بـ /storage/ أو storage/
  let cleanPath = path;
  if (cleanPath.startsWith('/storage/')) {
    cleanPath = cleanPath.substring(8); // إزالة /storage/
  } else if (cleanPath.startsWith('storage/')) {
    cleanPath = cleanPath.substring(7); // إزالة storage/
  }
  
  // دمج المسار مع STORAGE_URL
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
  return getFullImageUrl(imageUrl);
});

watch(() => props.isUploading, (newVal) => {
  console.log('📊 ImageUpload: props.isUploading changed to:', newVal);
  if (!newVal) {
    localUploading.value = false;
    localProgress.value = 0;
  }
});

watch(() => props.serverCoverUrl, (newUrl) => {
  if (newUrl) {
    console.log('🖼️ ImageUpload: serverCoverUrl updated:', newUrl);
    console.log('🖼️ Full image URL:', getFullImageUrl(newUrl));
    localUploading.value = false;
    localProgress.value = 0;
  }
});

const updateCircleSize = () => {
  const screenWidth = window.innerWidth;
  if (screenWidth < 1599) {
    circleSize.value = 250;
    borderWidth.value = 8;
  } else if (screenWidth >= 1600 && screenWidth < 2075) {
    circleSize.value = 300;
    borderWidth.value = 10;
  } else {
    circleSize.value = 352;
    borderWidth.value = 12;
  }
};

// التحقق من أبعاد الصورة
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

// التحقق من نوع الملف (JPEG أو PNG)
const validateFileType = (file) => {
  const validTypes = ['image/jpeg', 'image/png'];
  const validExtensions = ['.jpg', '.jpeg', '.png'];
  const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
  
  const isValidType = validTypes.includes(file.type);
  const isValidExtension = validExtensions.includes(fileExtension);
  
  return isValidType && isValidExtension;
};

// التحقق من الحجم (10 MB)
const validateFileSize = (file) => {
  const maxSize = 10 * 1024 * 1024; // 10 MB
  return file.size <= maxSize;
};

// دوال Drag & Drop
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

// المعالجة الرئيسية للملف
const processFile = async (file) => {
  // مسح رسالة الخطأ السابقة
  errorMessage.value = '';
  
  // 1. التحقق من نوع الملف (JPEG أو PNG)
  if (!validateFileType(file)) {
    errorMessage.value = 'Nur JPEG oder PNG Dateien sind erlaubt.';
    return;
  }
  
  // 2. التحقق من الحجم (10 MB)
  if (!validateFileSize(file)) {
    errorMessage.value = 'Maximale Dateigröße ist 10 MB.';
    return;
  }
  
  // 3. التحقق من الأبعاد (3000 x 3000 px)
  try {
    await validateImageDimensions(file);
  } catch (err) {
    errorMessage.value = err;
    return;
  }
  
  // 4. ملاحظة: التحقق من RGB وعدم وجود شعارات يتم على السيرفر
  // لأنها تتطلب معالجة متقدمة لا يمكن تنفيذها في المتصفح بشكل موثوق
  
  // بدء التحميل بعد اجتياز جميع التحققات
  localUploading.value = true;
  localProgress.value = 0;
  
  // محاكاة تقدم الرفع
  const interval = setInterval(() => {
    if (localProgress.value < 90 && !props.isUploading) {
      localProgress.value += 10;
    } else {
      clearInterval(interval);
    }
  }, 200);
  
  // إنشاء preview محلي
  const previewUrl = URL.createObjectURL(file);
  emit('update:uploadedImage', previewUrl);
  
  // إرسال الملف إلى المكون الأب للمعالجة على السيرفر
  emit('file-selected', file);
  
  // تنظيف الـ preview بعد دقيقة
  setTimeout(() => URL.revokeObjectURL(previewUrl), 60000);
  
  // إيقاف المحاكاة بعد 2 ثانية
  setTimeout(() => {
    clearInterval(interval);
  }, 2000);
};

onMounted(() => {
  updateCircleSize();
  window.addEventListener('resize', updateCircleSize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateCircleSize);
});
</script>

<style lang="scss" scoped>
.cards-upload-file {
  display: flex;
  min-width: 470px;
  flex-direction: column;
  align-items: center;
  aspect-ratio: 1/1;
  border-radius: 20px;
  box-shadow: 4px 4px 20px 0 rgba(27, 28, 32, 0.20);
  position: relative;
  gap: 32px;
  cursor: pointer;
  overflow: hidden;
}

.cards-upload-file:hover {
  box-shadow: 0 8px 30px rgba(222, 20, 86, 0.15);
}

.cards-upload-file.uploading {
  cursor: wait;
}

/* صورة الخلفية الثابتة */
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

/* Overlay ثابت - يظهر فقط عند hover ولا يتحرك */
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
  font-size: 110px;
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
  font-size: 2.8rem;
  font-weight: bold;
  text-transform: uppercase;
  border-radius: 20px;
  opacity: 0;
  transform: translateY(80px);
  transition: opacity 0.3s ease, transform 0.4s ease;
  z-index: 2;
  pointer-events: none;
}

.cards-upload-file:hover .schutzen-file-icon {
  opacity: 0;
  transform: translate(-50%, -70px);
}

.cards-upload-file:hover .schutzen-upload-text {
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
  color: var(--Strawberry, #DE1456);
  font-size: 14px;
  font-weight: 500;
  background: rgba(222, 20, 86, 0.15);
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid var(--Strawberry);
  text-align: center;
  z-index: 20;
  max-width: 90%;
  backdrop-filter: blur(4px);
}

/* Progress bar styles */
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
  font-size: 4rem;
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
  stroke: var(--Strawberry, #DE1456) !important;
  transition: stroke-dashoffset 0.1s linear;
}

/* Responsive */
@media (min-width: 1440px) and (max-width: 1599px) {
  .cards-upload-file {
    width: clamp(310px, calc(308px + 54 * (100vw - 1440px) / 159), 362px);
    height: clamp(310px, calc(308px + 54 * (100vw - 1440px) / 159), 362px);
  }

  .schutzen-file-icon {
    font-size: 80px;
  }

  .schutzen-upload-text {
    font-size: 2rem;
  }

  .progress-text {
    font-size: 2rem;
  }
}

@media (min-width: 1600px) and (max-width: 2075px) {
  .cards-upload-file {
    width: clamp(366px, calc(-171.3333px + 33.3333vw), 520px);
    height: clamp(366px, calc(-171.3333px + 33.3333vw), 520px);
  }

  .schutzen-file-icon {
    font-size: 95px;
  }

  .schutzen-upload-text {
    font-size: 2.4rem;
  }
}

@media (min-width: 2075px) and (max-width: 2560px) {
  .cards-upload-file {
    width: clamp(378px, calc(-173.048px + 33.3999vw), 503px);
    height: clamp(378px, calc(-173.048px + 33.3999vw), 503px);
  }

  .schutzen-file-icon {
    font-size: 110px;
  }

  .schutzen-upload-text {
    font-size: 2.8rem;
  }
}
</style>