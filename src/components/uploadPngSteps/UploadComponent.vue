<template>
  <div class="upload">
   
    <ImageUpload 
      :uploadedImage="localUploadedImage"
      :server-cover-url="serverCoverUrl"
      :is-uploading="isUploading"
      :upload-progress="uploadProgress"
      @update:uploadedImage="localUploadedImage = $event"
      @file-selected="handleNewFile" 
    />

    <!-- النصوص الجانبية (تظهر فقط إذا لم يتم رفع صورة بعد) -->
    <div class="text-upload" v-if="!uploadedImage && !errorMessage && !isUploading">
      <div class="spaces"></div>
      <div class="text">
        <div class="p">Cover Upload per Drag & Drop</div>
        <div class="text-link">
          <div class="span-white">Oder</div>
          <div class="span-red" @click="triggerFileInput">suche deine Datei.</div>
        </div>
        <div class="p-bottom">
          Maximale Dateigröße ist 10 MB. Nur JPEG oder PNG in RGB, 3.000 x 3.000 px. 
          Es dürfen keine Logos zu sehen sein. Genannt werden darf nur Albumtitel und/oder Künstler-/Bandname.
        </div>
      </div>
      <div class="text-info">
        <div class="p">Du hast noch kein Coverbild?</div>
        <div class="text-link">
          <div class="p skip-link" @click="skipUpload">
            Schritt überspringen und später hochladen.
          </div>
        </div>
      </div>
    </div>

    <!-- رسالة الخطأ فقط -->
    <div class="text-upload" v-if="errorMessage">
      <div class="text2">
        <div class="p error-message">{{ errorMessage }}</div>
        <div class="retry-button" @click="retryUpload" v-if="pendingCoverFile">
          Erneut versuchen
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import ImageUpload from '@/components/uploadPngSteps/Upload1Components/ImageUpload.vue';
import apiRequest from '@/lib/apiRequest';
import { useReleaseStore } from '@/stores/release';

const router = useRouter();
const releaseStore = useReleaseStore();

const props = defineProps({
  currentStep: Number,
  steps: Array,
  sectionTitle: [String, Object]
});

const emit = defineEmits(['next', 'release-created', 'cover-updated']);

const uploadedImage = ref(null);
const pendingCoverFile = ref(null);
const localUploadedImage = ref(null);
const serverCoverUrl = ref(null);
const errorMessage = ref('');
const isUploading = ref(false);
const uploadProgress = ref(0);
const releaseId = ref(releaseStore.currentReleaseId || null);

// تشغيل input file من ImageUpload
const triggerFileInput = () => {
  const input = document.querySelector('#cover-upload-input');
  if (input) {
    input.click();
  }
};

// استقبال الملف من ImageUpload عند الرفع
const handleNewFile = async (file) => {
  console.log('📸 ملف جديد:', file.name, file.type, 'حجم الملف:', file.size);
  
  // التحقق من صحة الملف
  if (!file.type.startsWith('image/')) {
    errorMessage.value = 'Bitte wähle eine Bilddatei aus.';
    return;
  }
  
  // التحقق من أن الملف JPG
  if (file.type !== 'image/jpeg' && file.type !== 'image/jpg') {
    errorMessage.value = 'The cover field must be a file of type: jpg.';
    return;
  }
  
  // التحقق من الحجم (10 MB كحد أقصى)
  if (file.size > 10 * 1024 * 1024) {
    errorMessage.value = 'The file size must not exceed 10 MB.';
    return;
  }
  
  pendingCoverFile.value = file;
  isUploading.value = true;
  uploadProgress.value = 0;
  errorMessage.value = '';
  
  // إنشاء preview محلي
  const reader = new FileReader();
  reader.onload = (e) => {
    uploadedImage.value = e.target.result;
    localUploadedImage.value = e.target.result;
  };
  reader.readAsDataURL(file);
  
  // التحقق مما إذا كان Release موجوداً بالفعل
  if (releaseId.value || releaseStore.currentReleaseId) {
    // تحديث صورة Release موجود
    await updateCoverImage(file);
  } else {
    // إنشاء Release جديد مع الصورة
    await createReleaseWithImage(file);
  }
};

// إنشاء Release جديد مع الصورة (أول رفع)
const createReleaseWithImage = async (file) => {
  if (!releaseStore.releaseType) {
    console.error('❌ release_type غير موجود');
    errorMessage.value = 'Bitte wähle zuerst einen Release-Typ aus.';
    isUploading.value = false;
    return;
  }

  try {
    const formData = new FormData();
    formData.append('release_type', releaseStore.releaseType);
    formData.append('cover', file);

    console.log('📤 إرسال طلب إنشاء Release جديد مع صورة');

    const response = await apiRequest.post('/releases', formData, {
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          uploadProgress.value = percentCompleted;
          console.log(`📤 تقدم الرفع: ${percentCompleted}%`);
        }
      }
    });

    console.log('✅ Release تم إنشاؤه بنجاح:', response.data);

    if (response.data?.data?.uuid) {
      const newReleaseUuid = response.data.data.uuid;
      releaseId.value = newReleaseUuid;
      releaseStore.currentReleaseId = newReleaseUuid;
      
      console.log('🔗 تم إنشاء Release جديد بالـ UUID:', newReleaseUuid);
      
      // تحديث رابط الصورة من السيرفر
      if (response.data.data.cover) {
        serverCoverUrl.value = response.data.data.cover;
        console.log('🖼️ تم تحديث serverCoverUrl:', serverCoverUrl.value);
      }
      
      // إرسال حدث أن الـ Release تم إنشاؤه
      emit('release-created', {
        releaseId: newReleaseUuid,
        coverUrl: response.data.data.cover || null
      });
      
      // إنهاء حالة الرفع
      isUploading.value = false;
      await nextTick();
      
      // ========== الانتقال المباشر إلى Upload1Component ==========
      console.log('🚀 محاولة الانتقال إلى Upload1Component...');
      console.log('📍 الانتقال إلى:', `/create-release/${newReleaseUuid}?step=2`);
      
      try {
        // الطريقة 1: استخدام router.push
        await router.push({
          path: `/create-release/${newReleaseUuid}`,
          query: { step: '2' }
        });
        
        console.log('✅ تم الانتقال بنجاح عبر router.push');
        
        // تأكيد بعد نصف ثانية
        setTimeout(() => {
          console.log('📍 المسار الحالي:', router.currentRoute.value.fullPath);
          console.log('📍 query:', router.currentRoute.value.query);
        }, 500);
        
      } catch (pushErr) {
        console.error('❌ فشل router.push:', pushErr);
        
        // الطريقة 2: استخدام window.location
        try {
          console.log('⚠️ محاولة الانتقال عبر window.location');
          window.location.href = `/create-release/${newReleaseUuid}?step=2`;
        } catch (locErr) {
          console.error('❌ فشل window.location:', locErr);
        }
      }
    } else {
      console.error('❌ لم يتم العثور على UUID في الاستجابة:', response.data);
    }
  } catch (err) {
    console.error('❌ فشل إنشاء الـ Release:', err);
    handleUploadError(err);
    isUploading.value = false;
  }
};

// تحديث صورة Release موجود (رفع لاحق)
const updateCoverImage = async (file) => {
  const currentReleaseId = releaseId.value || releaseStore.currentReleaseId;
  
  if (!currentReleaseId) {
    console.error('❌ لا يوجد Release ID للتحديث');
    errorMessage.value = 'Kein Release gefunden. Bitte lade zuerst ein Cover hoch.';
    isUploading.value = false;
    return;
  }

  try {
    const formData = new FormData();
    formData.append('cover', file);
    formData.append('_method', 'PATCH');

    console.log('📤 تحديث صورة Release:', `/releases/${currentReleaseId}`);

    const response = await apiRequest.post(`/releases/${currentReleaseId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          uploadProgress.value = percentCompleted;
          console.log(`📤 تقدم تحديث الصورة: ${percentCompleted}%`);
        }
      }
    });

    console.log('✅ تم تحديث الصورة بنجاح:', response.data);

    // تحديث رابط الصورة من السيرفر
    if (response.data?.data?.cover) {
      serverCoverUrl.value = response.data.data.cover;
      console.log('🖼️ تم تحديث serverCoverUrl:', serverCoverUrl.value);
    }
    
    // إرسال حدث أن الصورة تم تحديثها
    emit('cover-updated', {
      releaseId: currentReleaseId,
      coverUrl: response.data.data?.cover || null
    });
    
    // إنهاء حالة الرفع
    isUploading.value = false;
    
  } catch (err) {
    console.error('❌ فشل تحديث الصورة:', err);
    handleUploadError(err);
    isUploading.value = false;
  }
};

// معالجة أخطاء الرفع
const handleUploadError = (err) => {
  if (err.response) {
    console.error('❌ Response data:', err.response.data);
    if (err.response.data?.errors?.cover) {
      errorMessage.value = err.response.data.errors.cover.join(', ');
    } else {
      errorMessage.value = err.response.data?.message || 'Fehler beim Hochladen.';
    }
  } else {
    errorMessage.value = 'Netzwerkfehler. Bitte versuche es erneut.';
  }
};

const skipUpload = async () => {
  console.log('➡️ تخطي رفع الصورة - إنشاء Release جديد بدون صورة');
  
  if (!releaseStore.releaseType) {
    console.error('❌ release_type غير موجود');
    errorMessage.value = 'Bitte wähle zuerst einen Release-Typ aus.';
    return;
  }

  try {
    isUploading.value = true;
    
    // إنشاء كائن البيانات بدلاً من FormData
    const releaseData = {
      release_type: releaseStore.releaseType,
      title: 'Neues Release', // عنوان افتراضي
      // يمكنك إضافة المزيد من الحقول الافتراضية هنا
    };

    console.log('📤 إرسال طلب إنشاء Release جديد بدون صورة:', releaseData);

    const response = await apiRequest.post('/releases', releaseData);

    console.log('✅ Release تم إنشاؤه بنجاح:', response.data);

    if (response.data?.data?.uuid) {
      const newReleaseUuid = response.data.data.uuid;
      releaseId.value = newReleaseUuid;
      releaseStore.currentReleaseId = newReleaseUuid;
      
      console.log('🔗 تم إنشاء Release جديد بالـ UUID:', newReleaseUuid);
      
      // إرسال حدث أن الـ Release تم إنشاؤه
      emit('release-created', {
        releaseId: newReleaseUuid,
        coverUrl: null
      });
      
      // إنهاء حالة الرفع
      isUploading.value = false;
      await nextTick();
      
      // الانتقال إلى Parent.vue مع الـ UUID الجديد
      console.log('🚀 الانتقال إلى Parent.vue مع الـ UUID الجديد:', newReleaseUuid);
      
      await router.push({
        path: `/create-release/${newReleaseUuid}`,
        query: { step: '2', new: 'true' }
      });
    }
  } catch (err) {
    console.error('❌ فشل إنشاء الـ Release:', err);
    if (err.response) {
      console.error('❌ Response data:', err.response.data);
      errorMessage.value = err.response.data?.message || 'Fehler beim Erstellen des Releases.';
    }
    isUploading.value = false;
  }
};
// إعادة المحاولة عند الخطأ
const retryUpload = () => {
  if (pendingCoverFile.value) {
    errorMessage.value = '';
    handleNewFile(pendingCoverFile.value);
  }
};


// مراقبة تغيير releaseId من المتجر
watch(() => releaseStore.currentReleaseId, (newId) => {
  if (newId) {
    releaseId.value = newId;
    console.log('📦 تم تحديث releaseId من المتجر:', newId);
  }
}, { immediate: true });

// مراقبة تغيير serverCoverUrl
watch(serverCoverUrl, (newUrl) => {
  if (newUrl) {
    console.log('🖼️ serverCoverUrl تم التحديث:', newUrl);
    localUploadedImage.value = newUrl;
  }
});
</script>

<!-- باقي الـ style كما هو -->

<style lang="scss" scoped>
/* نفس الـ style الموجود في الكود الأصلي */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Heebo', sans-serif;
}

.upload {
  display: flex;
  align-items: flex-end;
  gap: 150px;
  align-self: stretch;
  width: 100%;
}

.cards-upload-file {
  display: flex;
  width: 470px;
  height: 470px;
  flex-direction: column;
  align-items: center;
  aspect-ratio: 1/1;
  border-radius: 20px;
  box-shadow: 4px 4px 20px 0 rgba(27, 28, 32, 0.20);
  position: relative;
}

.spaces{
  width: 93px;
  height: 38px;
}

.schutzen-upload-icon {
  width: 100%;
  height: 100%;
  transition: all 0.3s ease;
  border-radius: 20px;
  opacity: 0.75;
  object-fit: cover;
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

.text-upload {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  position: relative;
}

.text-upload .text {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 20px;
  align-self: stretch;
}

.text-upload .text2 {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 20px;
  align-self: stretch;
  position: absolute;
  top: 40%;
}

.text-upload .text2 .p {
  width: 701px;
  color: var(--Main-Colors-White, #FFF);
  font-family: Heebo;
  font-size: 40px;
  font-style: normal;
  font-weight: 700;
  line-height: 1;
  text-transform: uppercase;
}

.text-upload .text .p {
  color: #FFF;
  font-family: Heebo;
  font-size: 40px;
  font-style: normal;
  font-weight: 700;
  text-transform: uppercase;
  pointer-events: none;
  line-height: .7;
}

.text-upload .text .p-bottom {
  color: #FFF;
  font-family: Heebo;
  font-size: 18px;
  font-style: normal;
  font-weight: 300;
  line-height: normal;
  align-self: stretch;
  max-width: 750px;
  position: relative;
  top: -3px;
}

.text-upload .text .text-link {
  display: flex;
  align-items: center;
  gap: 11px;
  padding-top: 2px;
}

.text-link .span-white {
  color: #FFF;
  font-family: Heebo;
  font-size: 40px;
  font-style: normal;
  font-weight: 700;
  line-height: .7;
  text-transform: uppercase;
  pointer-events: none;
}

.text-link .span-red {
  color: var(--Strawberry, #DE1456);
  font-family: Heebo;
  font-size: 40px;
  font-style: normal;
  font-weight: 700;
  line-height: .7;
  text-transform: uppercase;
}

.text-link .span-red:hover {
  text-decoration-line: underline;
  cursor: pointer;
}

.text-upload .text-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-end;
  gap: 12px;
  align-self: stretch;
}

.text-info .p {
  color: #FFF;
  text-align: right;
  font-family: Heebo;
  font-size: 18px;
  font-style: normal;
  font-weight: 700;
  line-height: 1;
}

.text-info .text-link {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.text-info .text-link .p {
  color: #FFF;
  font-family: Heebo;
  font-size: 18px;
  font-style: normal;
  font-weight: 300;
  line-height: .8;
  text-decoration-line: underline;
  cursor: pointer;

  &:hover{
    color: var(--move);
    transition: .3s ease;
  }
}

.retry-button {
  color: var(--Strawberry, #DE1456);
  font-family: Heebo;
  font-size: 18px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  text-decoration-line: underline;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 8px;
  background: rgba(222, 20, 86, 0.1);
}

.retry-button:hover {
  background: rgba(222, 20, 86, 0.2);
}

@media (min-width: 1440px) and (max-width: 1599px) {
  .cards-upload-file {
    width: clamp(308px, calc(308px + 54 * (100vw - 1440px) / 159), 362px);
    height: clamp(308px, calc(308px + 54 * (100vw - 1440px) / 159), 362px);
  }

  .upload{
    gap: 110px;
  }

  .text-upload .text .p,
  .text-link .span-white,
  .text-link .span-red {
    font-size: 32px;
    line-height: .9;
  }

  .text-upload .text .p-bottom,
  .text-info .p,
  .text-info .text-link .p {
    font-size: 18px;
  }

  .schutzen-file-icon {
    font-size: 72px;
  }

  .schutzen-upload-text {
    font-size: 2.2rem;
  }

  .text-upload {
    padding-right: 60px;
  }
}

@media (min-width: 1600px) and (max-width: 2075px) {
  .cards-upload-file {
    width: clamp(362px, calc(-171.3333px + 33.3333vw), 520px);
    height: clamp(362px, calc(-171.3333px + 33.3333vw), 520px);
  }

  .text-upload .text .p,
  .text-link .span-white,
  .text-link .span-red {
    font-size: 40px;
  }

  .text-upload .text .p-bottom,
  .text-info .p,
  .text-info .text-link .p {
    font-size: 18px;
  }

  .schutzen-file-icon {
    font-size: 80px;
  }

  .schutzen-upload-text {
    font-size: 2.5rem;
  }

  .text-upload {
    padding-right: 73px;
  }

  .text-upload .text .p{
    line-height: 120%;
  }
}

@media (min-width: 2075px) and (max-width: 2560px) {
  .cards-upload-file {
    width: clamp(378px, calc(-123.048px + 34vw), 503px);
    height: clamp(378px, calc(-123.048px + 34vw), 503px);
  }

  .text-upload {
    padding-right: 113px;
  }
  .upload{
    gap: 136px;
  }

  .text-upload .text .p,
  .text-link .span-white,
  .text-link .span-red {
    font-size: 40px;
  }

  .text-upload .text .p-bottom,
  .text-info .p,
  .text-info .text-link .p {
    font-size: clamp(16px, calc(0.8734px + 0.632911vw), 18px);
  }

  .schutzen-file-icon {
    font-size: 110px;
  }

  .schutzen-upload-text {
    font-size: 2.8rem;
  }
}
</style>