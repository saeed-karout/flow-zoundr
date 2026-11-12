<template>
  <div class="upload">
   
    <!-- 🔥 نفس حجم Parent.vue تماماً -->
    <div class="image-upload-wrapper" :class="{ 'is-correction': isCorrected('cover') }">
      <ImageUpload 
        :uploadedImage="localUploadedImage"
        :server-cover-url="serverCoverUrl"
        :is-uploading="isUploading"
        :upload-progress="uploadProgress"
        @update:uploadedImage="localUploadedImage = $event"
        @file-selected="handleNewFile" 
      />
    </div>

    <!-- النصوص الجانبية -->
    <div class="text-upload">
      <!-- 🔥 النص العلوي يبقى دائماً كما هو (لا يتغير أبداً) -->
      <div class="spaces"></div>
      <div class="text">
        <div class="p">Cover Upload per Drag & Drop</div>
        <div class="text-link">
          <div class="span-white">Oder</div>
          <div class="span-red" @click="triggerFileInput">suche deine Datei.</div>
        </div>
        <div class="p-bottom">
          Maximale Dateigröße ist 10 MB. Nur JPEG/ JPG in RGB, 3.000 x 3.000 px.
          Es dürfen keine Logos zu sehen sein. Genannt werden darf nur Albumtitel und/oder Künstler-/Bandname.
        </div>
      </div>
      
      <!-- 🔥 الجزء السفلي فقط هو الذي يتغير -->
      <!-- الحالة 1: لا توجد صورة → عرض نص التخطي -->
      <div class="text-info" v-if="!hasRealImage && !isUploading && !errorMessage">
        <div class="p">Du hast noch kein Coverbild?</div>
        <div class="text-link">
          <div class="p skip-link" @click="skipUpload">
            Schritt überspringen und später hochladen.
          </div>
        </div>
      </div>

      <!-- الحالة 2: توجد صورة → لا نعرض أي شيء هنا (الزر في الأسفل) -->
      <div class="text-info" v-if="hasRealImage && !isUploading && !errorMessage">
        <!-- فارغ - الزر في الأسفل -->
      </div>

      <!-- الحالة 3: جاري التحميل → عرض progress -->
      <div class="text-info" v-if="isUploading">
        <div class="p" style="color: #FFF; text-align: right; font-weight: 300;">
          <!-- Wird hochgeladen... {{ uploadProgress }}% -->
        </div>
      </div>
    </div>

    <!-- رسالة الخطأ -->
    <div class="text-upload" v-if="errorMessage && !isUploading">
      <div class="text2">
        <div class="p error-message">{{ errorMessage }}</div>
        <div class="retry-button" @click="retryUpload" v-if="pendingCoverFile">
          Erneut versuchen
        </div>
      </div>
    </div>
  </div>

  <!-- 🔥 زر Weiter - ثابت في أسفل اليمين، يظهر فقط عند وجود صورة -->
  <div class="btn-next" @click="skipUpload" v-if="hasRealImage && !isUploading">
    <span>Weiter</span>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onMounted, computed } from 'vue';
import { useCorrections } from '@/composables/useCorrections';
import { useRoute, useRouter } from 'vue-router';
import ImageUpload from '@/components/uploadPngSteps/Upload1Components/ImageUpload.vue';
import apiRequest from '@/lib/apiRequest';
import { useReleaseStore } from '@/stores/release';
import { storage_url } from '@/constants';

// حقول مطلوب تصحيحها (Korrektur) ← بوردر أحمر.
const { isCorrected } = useCorrections();

const route = useRoute();
const router = useRouter();
const releaseStore = useReleaseStore();

const props = defineProps({
  currentStep: Number,
  steps: Array,
  sectionTitle: [String, Object],
  serverCoverUrl: { type: String, default: null },
  uploadedImage: { type: String, default: null },
  releaseUuid: { type: String, default: null },
  editMode: { type: String, default: null }
});

// في UploadComponent.vue - في defineEmits
const emit = defineEmits(['next', 'release-created', 'cover-updated', 'skip-upload', 'go-back', 'cover-restored', 'cover-upload-failed']);

const uploadedImage = ref(null);
const pendingCoverFile = ref(null);
const localUploadedImage = ref(null);
const serverCoverUrlLocal = ref(null);
const errorMessage = ref('');
const isUploading = ref(false);
const uploadProgress = ref(0);
const releaseId = ref(releaseStore.currentReleaseId || props.releaseUuid || null);
const hasNavigated = ref(false);
const uploadedFileName = ref('');
const isFirstLoad = ref(true);
const isNavigating = ref(false);

// ========== 🔥 دالة العودة إلى اختيار نوع الـ Release ==========
const goBackToTypeSelection = () => {
  console.log('🔙 العودة إلى اختيار نوع الـ Release');
  emit('go-back');
};

// ========== 🔥 التحقق من وجود صورة حقيقية ==========
const isRealImage = (url) => {
  if (!url) return false;
  if (url === '/img/bgCardSongs/card1.png') return false;
  if (url.includes('bgCardSongs/card1.png')) return false;
  if (url.includes('defaultBackgroundImage')) return false;
  if (url.includes('storage') && !url.includes('bgCardSongs')) return true;
  if (url.startsWith('blob:')) return true;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    if (url.includes('bgCardSongs/card1.png')) return false;
    return true;
  }
  if (url.startsWith('data:image')) return true;
  return false;
};

// ========== 🔥 Computed للتحقق من وجود صورة حقيقية ==========
const hasRealImage = computed(() => {
  const url = serverCoverUrlLocal.value || localUploadedImage.value || uploadedImage.value;
  return isRealImage(url);
});

// ========== 🔥 دالة الانتقال إلى Metas ==========
const navigateToMetas = () => {
  console.log('🚀 الانتقال إلى Metas');
  
  if (isNavigating.value) {
    console.log('⏳ جاري التنقل بالفعل، تخطي');
    return;
  }
  
  if (hasNavigated.value) {
    console.log('⏳ تم التنقل بالفعل، تخطي');
    return;
  }
  
  if (!hasRealImage.value) {
    console.log('⚠️ لا توجد صورة حقيقية، تخطي التنقل');
    return;
  }
  
  isNavigating.value = true;
  hasNavigated.value = true;
  
  if (releaseStore) {
    releaseStore.setMetasComplete(true);
    console.log('✅ [UploadComponent] تم تعيين isMetasComplete إلى true');
    
    if (!releaseStore._startComplete) {
      releaseStore.setStartComplete(true);
      console.log('✅ [UploadComponent] تم تعيين _startComplete إلى true');
    }
  }
  
  console.log('🚀 [UploadComponent] استدعاء skipUpload');
  skipUpload();
  
  setTimeout(() => {
    isNavigating.value = false;
    console.log('🔓 [UploadComponent] إلغاء قفل التنقل');
  }, 2000);
};

// ========== 🔥 دالة skipUpload ==========
const skipUpload = () => {
  console.log('➡️ تخطي رفع الصورة / الانتقال إلى Metas');
  
  if (hasRealImage.value) {
    console.log('🖼️ توجد صورة، الانتقال إلى Metas');
    hasNavigated.value = false;
    
    emit('skip-upload', {
      releaseType: releaseStore.releaseType
    });
    
    emit('next', { 
      skipUpload: true, 
      releaseType: releaseStore.releaseType 
    });
    return;
  }
  
  if (!releaseStore.releaseType) {
    console.error('❌ release_type غير موجود');
    errorMessage.value = 'Bitte wähle zuerst einen Release-Typ aus.';
    return;
  }

  console.log('🚀 إرسال حدث skip-upload إلى الوالد');
  
  emit('skip-upload', {
    releaseType: releaseStore.releaseType
  });
  
  emit('next', { 
    skipUpload: true, 
    releaseType: releaseStore.releaseType 
  });
};

// ========== 🔥 استعادة الصورة ==========
const restoreCoverImage = async () => {
  console.log('🔄 [UploadComponent] محاولة استعادة الصورة');
  
  // ✅ 1. استخدام releaseStore.serverCoverUrl
  if (releaseStore.serverCoverUrl && isRealImage(releaseStore.serverCoverUrl)) {
    console.log('🖼️ استعادة الصورة من releaseStore.serverCoverUrl:', releaseStore.serverCoverUrl);
    serverCoverUrlLocal.value = releaseStore.serverCoverUrl;
    localUploadedImage.value = releaseStore.serverCoverUrl;
    uploadedImage.value = releaseStore.serverCoverUrl;
    
    // ✅ إرسال حدث استعادة الصورة
    emit('cover-restored', {
      coverUrl: releaseStore.serverCoverUrl
    });
    
    // ✅ إجبار تحديث ImageUpload
    await nextTick();
    localUploadedImage.value = releaseStore.serverCoverUrl + '?t=' + Date.now();
    
    return true;
  }
  
  // ✅ 2. استخدام releaseStore.draftRelease.cover
  if (releaseStore.draftRelease?.cover) {
    const coverPath = releaseStore.draftRelease.cover;
    let coverUrl;
    if (coverPath.startsWith('http://') || coverPath.startsWith('https://')) {
      coverUrl = coverPath;
    } else {
      coverUrl = `${storage_url}/${coverPath}`;
    }
    
    if (isRealImage(coverUrl)) {
      console.log('🖼️ استعادة الصورة من releaseStore.draftRelease:', coverUrl);
      serverCoverUrlLocal.value = coverUrl;
      localUploadedImage.value = coverUrl;
      uploadedImage.value = coverUrl;
      
      // ✅ إرسال حدث استعادة الصورة
      emit('cover-restored', {
        coverUrl: coverUrl
      });
      
      // ✅ إجبار تحديث ImageUpload
      await nextTick();
      localUploadedImage.value = coverUrl + '?t=' + Date.now();
      
      // ✅ تحديث serverCoverUrl في الـ Store
      releaseStore.setServerCoverUrl(coverUrl);
      return true;
    }
  }
  
  // ✅ 3. جلب الصورة من الخادم
  if (releaseId.value) {
    console.log('📡 محاولة جلب الصورة من الخادم:', releaseId.value);
    await fetchReleaseCover();
    return true;
  }
  
  console.log('⚠️ [UploadComponent] لا توجد صورة لاستعادتها');
  return false;
};

// ========== 🔥 تحميل الصورة الموجودة عند التحميل ==========
onMounted(async () => {
  console.log('🚀 UploadComponent mounted');
  console.log('📌 props.serverCoverUrl:', props.serverCoverUrl);
  console.log('📌 props.uploadedImage:', props.uploadedImage);
  console.log('📌 releaseId:', releaseId.value);
  console.log('📌 editMode:', props.editMode);
  console.log('📌 hasRealImage:', hasRealImage.value);
  
  if (props.editMode === 'release' || props.editMode === 'song') {
    console.log('📌 وضع التعديل - لن ننتقل تلقائياً');
    isFirstLoad.value = false;
    
    // ✅ في وضع التعديل، استعادة الصورة
    await restoreCoverImage();
    
    // ✅ بعد استعادة الصورة، تحديث ImageUpload
    await nextTick();
    if (serverCoverUrlLocal.value && isRealImage(serverCoverUrlLocal.value)) {
      localUploadedImage.value = serverCoverUrlLocal.value + '?t=' + Date.now();
    }
    return;
  }
  
  // ✅ في وضع الإنشاء، استعادة الصورة إذا كانت موجودة
  await restoreCoverImage();
  
  isFirstLoad.value = false;
});

// ========== 🔥 جلب صورة الـ Release من الخادم ==========
const fetchReleaseCover = async () => {
  if (!releaseId.value) return;
  
  try {
    const response = await apiRequest.get(`/releases/${releaseId.value}`);
    const release = response.data?.data;
    
    if (release?.cover && isRealImage(release.cover)) {
      const coverPath = release.cover;
      let coverUrl;
      if (coverPath.startsWith('http://') || coverPath.startsWith('https://')) {
        coverUrl = coverPath;
      } else {
        coverUrl = `${storage_url}/${coverPath}`;
      }
      
      console.log('🖼️ تم جلب الصورة من الـ Release:', coverUrl);
      serverCoverUrlLocal.value = coverUrl;
      localUploadedImage.value = coverUrl;
      uploadedImage.value = coverUrl;
      
      const urlParts = coverUrl.split('/');
      uploadedFileName.value = urlParts[urlParts.length - 1] || 'Cover';
      
      if (releaseStore && !releaseStore._startComplete) {
        releaseStore.setStartComplete(true);
        console.log('✅ [UploadComponent] تم تحديث _startComplete إلى true');
      }
      
      if (!props.editMode && !isFirstLoad.value) {
        setTimeout(() => {
          if (!hasNavigated.value && !isNavigating.value) {
            navigateToMetas();
          }
        }, 500);
      }
    } else {
      console.log('📌 لا توجد صورة في الـ Release');
    }
  } catch (err) {
    console.warn('⚠️ فشل جلب صورة الـ Release:', err);
  }
};

const triggerFileInput = () => {
  const input = document.querySelector('#cover-upload-input');
  if (input) {
    input.click();
  }
};

// ========== 🔥 استقبال الملف من ImageUpload عند الرفع ==========
const handleNewFile = async (file) => {
  console.log('📸 ملف جديد:', file.name, file.type, 'حجم الملف:', file.size);
  
  hasNavigated.value = false;
  isNavigating.value = false;
  
  uploadedFileName.value = file.name;
  
  if (!file.type.startsWith('image/')) {
    errorMessage.value = 'Bitte wähle eine Bilddatei aus.';
    return;
  }
  
  if (file.type !== 'image/jpeg' && file.type !== 'image/jpg') {
    errorMessage.value = 'The cover field must be a file of type: jpg.';
    return;
  }
  
  if (file.size > 10 * 1024 * 1024) {
    errorMessage.value = 'The file size must not exceed 10 MB.';
    return;
  }
  
  pendingCoverFile.value = file;
  isUploading.value = true;
  uploadProgress.value = 0;
  errorMessage.value = '';
  
  const reader = new FileReader();
  reader.onload = (e) => {
    uploadedImage.value = e.target.result;
    localUploadedImage.value = e.target.result;
  };
  reader.readAsDataURL(file);
  
  if (releaseId.value || releaseStore.currentReleaseId) {
    await updateCoverImage(file);
  } else {
    await createReleaseWithImage(file);
  }
};

// ========== 🔥 دالة إنشاء Release مع الصورة ==========
const createReleaseWithImage = async (file) => {
  if (!releaseStore.releaseType) {
    console.error('❌ release_type غير موجود');
    errorMessage.value = 'Bitte wähle zuerst einen Release-Typ aus.';
    isUploading.value = false;
    return;
  }

  try {
    const formData = new FormData();
    let releaseType = releaseStore.releaseType;
    if (typeof releaseType === 'string' && releaseType.includes('DEINE NEUE')) {
      if (releaseType.includes('SINGLE')) releaseType = 'single';
      else if (releaseType.includes('EP')) releaseType = 'extended player';
      else if (releaseType.includes('ALBUM')) releaseType = 'album';
    }
    
    formData.append('release_type', releaseType);
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
      
      let coverUrl = null;
      if (response.data.data.cover) {
        const coverPath = response.data.data.cover;
        if (coverPath.startsWith('http://') || coverPath.startsWith('https://')) {
          coverUrl = coverPath;
        } else {
          coverUrl = `${storage_url}/${coverPath}`;
        }
        serverCoverUrlLocal.value = coverUrl;
        localUploadedImage.value = coverUrl;
        console.log('🖼️ تم تحديث serverCoverUrl:', serverCoverUrlLocal.value);
        
        const urlParts = coverUrl.split('/');
        uploadedFileName.value = urlParts[urlParts.length - 1] || file.name;
      }
      
      if (releaseStore && !releaseStore._startComplete) {
        releaseStore.setStartComplete(true);
        console.log('✅ [UploadComponent] تم تحديث _startComplete إلى true');
      }
      
      releaseStore.setMetasComplete(true);
      console.log('✅ [UploadComponent] تم تعيين isMetasComplete إلى true');
      
      emit('release-created', {
        releaseId: newReleaseUuid,
        coverUrl: coverUrl
      });
      
      isUploading.value = false;
      
      console.log('🚀 [UploadComponent] الانتقال إلى Metas بعد إنشاء الـ Release');
      
      hasNavigated.value = false;
      isNavigating.value = false;
      
      emit('skip-upload', {
        releaseType: releaseStore.releaseType
      });
      
      emit('next', { 
        skipUpload: true, 
        releaseType: releaseStore.releaseType 
      });
      
      try {
        const currentPath = route.path;
        const newPath = `/releases/${newReleaseUuid}/edit`;
        
        if (currentPath !== newPath) {
          await router.replace({
            path: newPath,
            query: { ...route.query, preserve: 'true' }
          });
          console.log('🔗 [UploadComponent] تم تحديث الرابط إلى وضع التعديل:', newPath);
        }
      } catch (routerError) {
        console.warn('⚠️ [UploadComponent] فشل تحديث الرابط:', routerError);
      }
    }
  } catch (err) {
    console.error('❌ فشل إنشاء الـ Release:', err);
    handleUploadError(err);
    isUploading.value = false;
  }
};

// ========== 🔥 تحديث صورة Release موجود ==========
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

    if (response.data?.data?.cover) {
      const coverPath = response.data.data.cover;
      let coverUrl;
      if (coverPath.startsWith('http://') || coverPath.startsWith('https://')) {
        coverUrl = coverPath;
      } else {
        coverUrl = `${storage_url}/${coverPath}`;
      }
      serverCoverUrlLocal.value = coverUrl;
      localUploadedImage.value = coverUrl;
      console.log('🖼️ تم تحديث serverCoverUrl:', serverCoverUrlLocal.value);
      
      const urlParts = coverUrl.split('/');
      uploadedFileName.value = urlParts[urlParts.length - 1] || file.name;
    }
    
    if (releaseStore && !releaseStore._startComplete) {
      releaseStore.setStartComplete(true);
      console.log('✅ [UploadComponent] تم تحديث _startComplete إلى true');
    }
    
    releaseStore.setMetasComplete(true);
    console.log('✅ [UploadComponent] تم تعيين isMetasComplete إلى true');
    
    emit('cover-updated', {
      releaseId: currentReleaseId,
      coverUrl: serverCoverUrlLocal.value
    });
    
    isUploading.value = false;
    
    console.log('🚀 [UploadComponent] الانتقال إلى Metas بعد تحديث الصورة');
    navigateToMetas();
    
  } catch (err) {
    console.error('❌ فشل تحديث الصورة:', err);
    handleUploadError(err);
    emit('cover-upload-failed', { message: err.response?.data?.message || err.message || 'upload failed' });
    isUploading.value = false;
  }
};

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

const retryUpload = () => {
  if (pendingCoverFile.value) {
    errorMessage.value = '';
    handleNewFile(pendingCoverFile.value);
  }
};

// ========== 🔥 مراقبة التغييرات من الوالد ==========
watch(() => props.currentStep, (newStep, oldStep) => {
  console.log('📌 UploadComponent: props.currentStep changed:', { old: oldStep, new: newStep });
  
  if (newStep === 1) {
    console.log('📌 تم العودة إلى start');
    hasNavigated.value = false;
    isNavigating.value = false;
    
    // ✅ استعادة الصورة عند العودة إلى step 1
    if (releaseId.value) {
      setTimeout(async () => {
        await restoreCoverImage();
        await nextTick();
        if (serverCoverUrlLocal.value && isRealImage(serverCoverUrlLocal.value)) {
          localUploadedImage.value = serverCoverUrlLocal.value + '?t=' + Date.now();
        }
      }, 300);
    }
  }
}, { immediate: true });

// ========== 🔥 watch لـ serverCoverUrl ==========
watch(() => props.serverCoverUrl, (newUrl) => {
  if (props.editMode === 'release' || props.editMode === 'song') {
    if (newUrl && isRealImage(newUrl)) {
      console.log('🖼️ استقبال serverCoverUrl في وضع التعديل (عرض فقط):', newUrl);
      serverCoverUrlLocal.value = newUrl;
      localUploadedImage.value = newUrl;
      uploadedImage.value = newUrl;
    } else if (!newUrl || newUrl === '/img/bgCardSongs/card1.png') {
      // ✅ إذا كانت الصورة فارغة، حاول استعادتها
      if (releaseId.value && !isUploading.value) {
        setTimeout(async () => {
          await restoreCoverImage();
        }, 300);
      }
    }
    return;
  }
  
  if (newUrl && isRealImage(newUrl) && !isNavigating.value) {
    console.log('🖼️ استقبال serverCoverUrl من الوالد:', newUrl);
    serverCoverUrlLocal.value = newUrl;
    localUploadedImage.value = newUrl;
    uploadedImage.value = newUrl;
    
    const urlParts = newUrl.split('/');
    uploadedFileName.value = urlParts[urlParts.length - 1] || 'Cover';
    
    if (releaseStore && !releaseStore._startComplete) {
      releaseStore.setStartComplete(true);
      console.log('✅ [UploadComponent] تم تحديث _startComplete إلى true');
    }
    
    if (!hasNavigated.value && !props.editMode) {
      setTimeout(() => {
        if (!hasNavigated.value && !isNavigating.value) {
          navigateToMetas();
        }
      }, 300);
    }
  } else if (!newUrl || newUrl === '/img/bgCardSongs/card1.png') {
    // ✅ إذا كانت الصورة فارغة، حاول استعادتها
    if (releaseId.value && !isUploading.value && !hasRealImage.value) {
      setTimeout(async () => {
        await restoreCoverImage();
      }, 300);
    }
  }
}, { immediate: true });

// ========== 🔥 watch لـ uploadedImage ==========
watch(() => props.uploadedImage, (newUrl) => {
  if (props.editMode === 'release' || props.editMode === 'song') {
    if (newUrl && isRealImage(newUrl)) {
      console.log('🖼️ استقبال uploadedImage في وضع التعديل (عرض فقط):', newUrl);
      serverCoverUrlLocal.value = newUrl;
      localUploadedImage.value = newUrl;
      uploadedImage.value = newUrl;
    } else if (!newUrl || newUrl === '/img/bgCardSongs/card1.png') {
      // ✅ إذا كانت الصورة فارغة، حاول استعادتها
      if (releaseId.value && !isUploading.value) {
        setTimeout(async () => {
          await restoreCoverImage();
        }, 300);
      }
    }
    return;
  }
  
  if (newUrl && isRealImage(newUrl) && !isNavigating.value) {
    console.log('🖼️ استقبال uploadedImage من الوالد:', newUrl);
    serverCoverUrlLocal.value = newUrl;
    localUploadedImage.value = newUrl;
    uploadedImage.value = newUrl;
    
    const urlParts = newUrl.split('/');
    uploadedFileName.value = urlParts[urlParts.length - 1] || 'Cover';
    
    if (releaseStore && !releaseStore._startComplete) {
      releaseStore.setStartComplete(true);
      console.log('✅ [UploadComponent] تم تحديث _startComplete إلى true');
    }
    
    if (!hasNavigated.value && !props.editMode) {
      setTimeout(() => {
        if (!hasNavigated.value && !isNavigating.value) {
          navigateToMetas();
        }
      }, 300);
    }
  } else if (!newUrl || newUrl === '/img/bgCardSongs/card1.png') {
    // ✅ إذا كانت الصورة فارغة، حاول استعادتها
    if (releaseId.value && !isUploading.value && !hasRealImage.value) {
      setTimeout(async () => {
        await restoreCoverImage();
      }, 300);
    }
  }
}, { immediate: true });

// ========== 🔥 مراقبة releaseId واستعادة الصورة ==========
watch(() => releaseId.value, async (newId) => {
  if (newId) {
    console.log('📦 تم تحديث releaseId:', newId);
    // ✅ إذا لم تكن هناك صورة محلية، جلبها من الـ Release
    if (!hasRealImage.value && !isUploading.value) {
      await fetchReleaseCover();
    }
  }
}, { immediate: true });

// ========== 🔥 مراقبة currentStep من الـ Store ==========
watch(() => releaseStore.currentStep, async (newStep, oldStep) => {
  console.log('📌 [UploadComponent] store.currentStep changed:', { old: oldStep, new: newStep });
  
  // ✅ إذا عدنا إلى الخطوة 1 (Cover) من خطوة أعلى
  if (newStep === 1 && oldStep > 1) {
    console.log('🔄 تم العودة إلى Cover من الخطوة', oldStep);
    
    // ✅ إعادة تعيين حالة التنقل
    hasNavigated.value = false;
    isNavigating.value = false;
    
    // ✅ استعادة الصورة
    await restoreCoverImage();
    
    // ✅ تحديث ImageUpload
    await nextTick();
    if (serverCoverUrlLocal.value && isRealImage(serverCoverUrlLocal.value)) {
      localUploadedImage.value = serverCoverUrlLocal.value + '?t=' + Date.now();
    }
  }
}, { immediate: true });

// ========== 🔥 مراقبة serverCoverUrlLocal ==========
watch(serverCoverUrlLocal, (newUrl) => {
  if (newUrl) {
    console.log('🖼️ serverCoverUrlLocal تم التحديث:', newUrl);
    localUploadedImage.value = newUrl;
    uploadedImage.value = newUrl;
  }
}, { immediate: true, deep: true });

// ========== 🔥 مراقبة uploadedImage للتأكد من التحديث ==========
watch(uploadedImage, (newUrl) => {
  if (newUrl && isRealImage(newUrl)) {
    console.log('🖼️ uploadedImage تم التحديث:', newUrl);
    localUploadedImage.value = newUrl;
    serverCoverUrlLocal.value = newUrl;
  }
}, { immediate: true, deep: true });

// ========== 🔥 تصدير الدوال ==========
defineExpose({
  uploadedImage,
  localUploadedImage,
  serverCoverUrl: serverCoverUrlLocal,
  releaseId,
  isUploading,
  uploadProgress,
  pendingCoverFile,
  errorMessage,
  hasRealImage,
  retryUpload,
  triggerFileInput,
  handleNewFile,
  navigateToMetas,
  goBackToTypeSelection,
  skipUpload
});
</script>


<style lang="scss" scoped>
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
  padding-bottom: 20px;
}

.btn-back{
  display: flex;
  justify-content: center;
  width: 30px;
  height: 30px;
  padding: 12px 8px 10px 8px;
  align-items: center;
  position: absolute;
  right: 0;
  top: 35px;
  border-radius: 15px;
  background: #1B1C20;
  transition: background 0.3s ease;
  cursor: pointer;
  opacity: 0.3;
  z-index: 10;
  rotate: 180deg;
}

.btn-back:hover{
  background: var(--Strawberry);
  opacity: 1;
}

/* قياسات .image-upload-wrapper في src/assets/main.scss — مشتركة مع
   الخطوة 2 / Metas (Upload1Components/Parent.vue). */

/* بطاقة الغلاف (.cards-upload-file) بانحناء 20px، فيأخذ بوردر التصحيح
   الانحناء نفسه بدل 5px العامّة وإلا بدا مربّعاً حول بطاقة مدوّرة. */
.image-upload-wrapper.is-correction {
  border-radius: 20px;
}

/* ===== باقي الأنماط ===== */
.cards-upload-file {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  align-items: center;
  aspect-ratio: 1/1;
  border-radius: 20px;
  box-shadow: 4px 4px 20px 0 rgba(27, 28, 32, 0.20);
  position: relative;
}

.spaces {
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
  font-size: 39px;
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
  top: -5px;
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

.text-info {
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
}

.text-info .text-link .p:hover {
  color: var(--move);
  transition: .3s ease;
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

.skip-link {
  transition: color 0.3s ease;
}

.skip-link:hover {
  color: var(--Strawberry, #DE1456) !important;
}

.btn-next {
  position: fixed;
  right: 20px;
  bottom: 20px;
  display: flex;
  padding: 12px 26px;
  justify-content: center;
  align-items: center;
  gap: 12px;
  border-radius: 8px;
  background: var(--Strawberry, #DE1456);
  cursor: pointer;
  transition: background 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease;
  border: none;
  color: white;
  font-family: Heebo;
  font-size: 18px;
  font-weight: 300;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  line-height: .9;
  z-index: 1000;
}

.btn-next:hover {
  background: var(--dark-red, #b01048);
}

.btn-next:active {
  transform: scale(0.95);
  box-shadow: 0 2px 10px rgba(222, 20, 86, 0.3);
}

.btn-next span {
  color: white;
  font-family: Heebo;
  font-size: 18px;
  font-weight: 600;
  text-transform: uppercase;
}

.btn-next svg {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  stroke: white;
}


@media (max-width:1680px) {
    .text-upload .text .p,
  .text-link .span-white,
  .text-link .span-red {
    font-size: 32px;
  
  }

  .text-upload .text .p-bottom,
  .text-info .p,
  .text-info .text-link .p {
    font-size: 18px;
  }

}
/* ===== دعم responsive ===== */
@media (min-width: 1440px) and (max-width: 1599px) {
  .upload {
    gap: 110px;
  }


  
  

  .text-upload {
    padding-right: 44px;
  }
}

@media (min-width: 1600px) and (max-width: 2074px) {
 

  .text-upload {
    padding-right: 40px;
  }
}

@media (min-width: 2075px) and (max-width: 2560px) {
  .text-upload {
    padding-right: 113px;
  }
  .upload {
    gap: 136px;
  }

  .text-upload .text .p,
  .text-link .span-white,
  .text-link .span-red {
    font-size: 40px;
  }
}

/* ===== Mobile Responsive ===== */
@media (max-width: 768px) {
  .btn-next {
    right: 10px;
    bottom: 10px;
    padding: 10px 20px;
    font-size: 14px;
  }
  
  .btn-next span {
    font-size: 14px;
  }
  
  .btn-next svg {
    width: 16px;
    height: 16px;
  }
}

@media (max-width: 480px) {
  .btn-next {
    right: 8px;
    bottom: 8px;
    padding: 8px 16px;
    font-size: 12px;
    border-radius: 6px;
  }
  
  .btn-next span {
    font-size: 12px;
  }
  
  .btn-next svg {
    width: 14px;
    height: 14px;
  }
}
</style>