<template>
  <label class="cards-upload-file"
         for="cover-upload-input"
         @dragover.prevent="handleDragOver"
         @dragenter.prevent="handleDragEnter"
         @dragleave.prevent="handleDragLeave"
         @drop.prevent="handleDrop"
         :class="{ 'uploading': isUploadingActive }">

    <!-- Dashed border فقط إذا ما فيش صورة أبدًا -->
    <div v-if="!finalImageUrl && !isUploadingActive" class="dashed-border"></div>

    <!-- الصورة النهائية (من السيرفر أو من الرفع المحلي) -->
    <img v-if="finalImageUrl && !isUploadingActive" :src="finalImageUrl" alt="Cover Image"
         class="schutzen-upload-icon uploaded-image" aria-hidden="true" />

    <!-- الخلفية الافتراضية فقط إذا ما فيش صورة -->
    <img v-if="!finalImageUrl && !isUploadingActive" src="@/assets/images/bg-card-release/1-min.png"
         alt="Upload Background" class="schutzen-upload-icon" aria-hidden="true" />

    <!-- النصوص تظهر فقط إذا ما فيش صورة -->
    <span v-if="!finalImageUrl && !isUploadingActive" class="schutzen-file-icon">IMG</span>
    <span v-if="!finalImageUrl && !isUploadingActive" class="schutzen-upload-text">Cover Ändern</span>

    <!-- Input مخفي - accept لـ jpg فقط -->
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

    <!-- رسالة الخطأ إذا حاول يرفع صيغة غلط -->
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
  uploadedImage: { type: String, default: null },      // preview محلي
  serverCoverUrl: { type: String, default: null },     // من السيرفر
  isUploading: { type: Boolean, default: false },      // حالة الرفع من المكون الأب
  uploadProgress: { type: Number, default: 0 }         // نسبة التقدم من المكون الأب
});

const emit = defineEmits(['update:uploadedImage', 'file-selected']);

const isDragging = ref(false);
const errorMessage = ref('');
const localUploading = ref(false);
const localProgress = ref(0);
const circleSize = ref(352);
const borderWidth = ref(12);

// حالة الرفع النشطة (من المكون الأب أو محلياً)
const isUploadingActive = computed(() => {
  return props.isUploading || localUploading.value;
});

// نسبة التقدم الحالية
const currentProgress = computed(() => {
  return props.uploadProgress || localProgress.value;
});

// الصورة النهائية التي تُعرض
const finalImageUrl = computed(() => {
  return props.serverCoverUrl || props.uploadedImage;
});

// مراقبة تغيير isUploading من المكون الأب
watch(() => props.isUploading, (newVal) => {
  console.log('📊 ImageUpload: props.isUploading changed to:', newVal);
  if (!newVal) {
    // إذا انتهت عملية الرفع من المكون الأب، نوقف الرفع المحلي
    localUploading.value = false;
    localProgress.value = 0;
  }
});

// مراقبة تغيير serverCoverUrl
watch(() => props.serverCoverUrl, (newUrl) => {
  if (newUrl) {
    console.log('🖼️ ImageUpload: serverCoverUrl updated:', newUrl);
    // تأكيد إيقاف الرفع عند وصول الصورة من السيرفر
    localUploading.value = false;
    localProgress.value = 0;
  }
});

// تحديث حجم الدائرة حسب الشاشة
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

// Drag & Drop
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

// النقر عبر label
const handleFileSelect = (e) => {
  const file = e.target.files?.[0];
  if (file) {
    if (isUploadingActive.value) return;
    processFile(file);
  }
  e.target.value = '';
};

const processFile = (file) => {
  errorMessage.value = '';

  const isJpg = file.type === 'image/jpeg' && file.name.toLowerCase().endsWith('.jpg');

  if (!isJpg) {
    errorMessage.value = 'The cover field must be a file of type: jpg.';
    return;
  }

  if (file.size > 10 * 1024 * 1024) {
    errorMessage.value = 'The file size must not exceed 10 MB.';
    return;
  }

  // بدء التحميل محلياً
  localUploading.value = true;
  localProgress.value = 0;

  // محاكاة تقدم الرفع (سيتم override بواسطة المكون الأب)
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
  
  // إرسال الملف إلى المكون الأب
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
/* نفس الستايل بدون تغيير */
.cards-upload-file {
  display: flex;
  width: 470px;
  flex-direction: column;
  align-items: center;
  aspect-ratio: 1/1;
  border-radius: 20px;
  box-shadow: 4px 4px 20px 0 rgba(27, 28, 32, 0.20);
  position: relative;
  gap: 32px;
  cursor: pointer;
}

.cards-upload-file:hover {
  box-shadow: 0 8px 30px rgba(222, 20, 86, 0.15);
}

.cards-upload-file.uploading {
  cursor: wait;
}

.dashed-border {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 20px;
  background-image: url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='20' ry='20' stroke='white' stroke-width='5' stroke-dasharray='8%2c 18' stroke-dashoffset='0' stroke-linecap='round'/%3e%3c/svg%3e");
}

.schutzen-upload-icon {
  width: 100%;
  transition: all 0.3s ease;
  border-radius: 20px;
  opacity: 1;
  object-fit: cover;
  height: 100%;
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
  transition: opacity 0.7s ease, transform 0.7s ease;
  z-index: 2;
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
  background-color: rgba(35, 35, 35, 0.3);
  border-radius: 20px;
  opacity: 0;
  transform: translateY(80px);
  transition: opacity 0.3s ease, transform 0.6s ease;
  z-index: 2;
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
}

/* Progress bar styles */
.progress-container {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(0deg, rgba(38, 40, 45, 0.90) 0%, rgba(38, 40, 45, 0.90) 100%);
  border-radius: 20px;
  z-index: 20;
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
  font-size: 2.5rem;
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

  .progress-text {
    font-size: 2rem;
  }
}

@media (min-width: 1600px) and (max-width: 2075px) {
  .cards-upload-file {
    width: clamp(366px, calc(-171.3333px + 33.3333vw), 520px);
    height: clamp(366px, calc(-171.3333px + 33.3333vw), 520px);
  }
}

@media (min-width: 2075px) and (max-width: 2560px) {
  .cards-upload-file {
    width: clamp(378px, calc(-173.048px + 33.3999vw), 503px);
    height: clamp(378px, calc(-173.048px + 33.3999vw), 503px);
  }
}
</style>