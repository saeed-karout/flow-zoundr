<template>
  <div class="component-container">
    
    <!-- عرض شاشة تحميل مؤقتة -->
    <div v-if="isInitialLoading" class="loading-container">
      <div class="spinner"></div>
      <div class="loading-text">Loading...</div>
    </div>

    <template v-else>
      <!-- عرض الكروت الثلاثة فقط لو كان currentView = main ولم يتم تفعيل sub-layout -->
      <div v-if="currentView === 'main' && !forceInfosView && !isInSubLayout" class="content">
        
        <div class="option">
          <div class="card-songs" @click="handleCardClick(0)">
            <div class="image-overlay">
              <div class="Form">
                <div class="btn-primary1" @click.stop="handleNext(0)">
                  <div class="p">Weiter</div>
                </div>
              </div>
            </div>
            <div class="logo"></div>
          </div>
          <div class="description">
            Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.
          </div>
        </div>

        <div class="option" @mouseenter="showFormField(1)" @mouseleave="hideFormField(1)">
          <div class="card-songs2">
            <div class="image-overlay" :class="{ 'no-overlay': formFields[1].email }">
              <div class="Form">
                <div class="Form-filed" :class="{ visible: formFields[1].visible || formFields[1].email }">
                  <input v-model="formFields[1].email" type="email" class="email-input"
                    :class="{ 'has-text': formFields[1].email }" placeholder="E-mail Mastering Studio"
                    @input="validateEmail(1)" />
                  <img v-if="formFields[1].isValid" src="/icon/y.png" class="checkmark" alt="checkmark" />
                </div>
                <div class="btn-primary" :class="{ active: formFields[1].isValid }" @click.stop="handleNext(1)">
                  <div class="p">Weiter</div>
                </div>
              </div>
            </div>
            <div class="logo" :class="{ shifted: formFields[1].visible || formFields[1].email }"></div>
          </div>
          <div class="description">
            Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, ipsa quae ab illo inventore.
          </div>
        </div>

        <div class="option" @mouseenter="showFormField(2)" @mouseleave="hideFormField(2)">
          <div class="card-songs3">
            <div class="image-overlay" :class="{ 'no-overlay': formFields[2].email }">
              <div class="Form">
                <div class="Form-filed" :class="{ visible: formFields[2].visible || formFields[2].email }">
                  <input v-model="formFields[2].email" type="email" class="email-input"
                    :class="{ 'has-text': formFields[2].email }" placeholder="E-mail Mastering Studio"
                    @input="validateEmail(2)" />
                  <img v-if="formFields[2].isValid" src="/icon/y.png" class="checkmark" alt="checkmark" />
                </div>
                <div class="btn-primary" :class="{ active: formFields[2].isValid }" @click.stop="handleNext(2)">
                  <div class="p">Weiter</div>
                </div>
              </div>
            </div>
            <div class="logo" :class="{ shifted: formFields[2].visible || formFields[2].email }"></div>
          </div>
          <div class="description">
            Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium, totam rem aperiam, eaque ipsa quae ab illo inventore.
          </div>
        </div>

      </div>

      <!-- FirstSection: قائمة الأغاني + إضافة/تعديل/حذف -->
      <FirstSection 
        v-else-if="currentView === 'firstSection' && !isInSubLayout" 
        :sectionTitle="sectionTitle"
        :selectedCardIndex="selectedCardIndex" 
        :tracks="tracks" 
        :release-uuid="props.releaseUuid" 
        :song-type="selectedSongType"
        @next="$emit('next')" 
        @add-track="addNewSong"
        @edit-track="editSong"
        @delete-track="deleteSong" 
        @back="handleBackClick"
        @update:topLineImage="updateTopLineImage"
      />

      <!-- Infos: تفاصيل الأغنية -->
      <Infos 
        v-else-if="(isInSubLayout || forceInfosView) && currentView === 'infos'" 
        :active-tab="activeTab" 
        :current-song="currentSong" 
        @save-song="handleSaveSong" 
        @back="handleBackFromInfos"
        @next="$emit('next')" 
        @back-to-tracklist="handleBackToTracklist"
        @enter-sub-layout="handleEnterSubLayout" 
        @exit-sub-layout="handleExitSubLayout" 
        @refresh-songs="fetchSongs"
        @refresh-current-song="refreshCurrentSong"
      />
    </template>

    <!-- رسالة خطأ إذا حاول المستخدم الانتقال بدون اختيار كارد -->
    <div v-if="showCardError" class="error-message">
      ⚠️ Bitte wählen Sie einen Songtyp aus, bevor Sie fortfahren.
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, defineProps, defineEmits, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import apiRequest from '@/lib/apiRequest';
import FirstSection from './Upload2/FirstSection.vue';
import Infos from './Upload2/Infos1.vue';
import { useReleaseStore } from '@/stores/release';

// استدعاء composables
const route = useRoute();
const router = useRouter();
const releaseStore = useReleaseStore();

const props = defineProps({
  currentStep: Number,
  steps: Array,
  sectionTitle: [String, Object],
  activeTab: String,
  forceInfosView: Boolean,
  releaseUuid: { type: String, required: true },
  topLineImage: { type: String, default: null }
});

const emit = defineEmits([
  'next', 'update:currentView', 'back', 'update:topLineImage',
  'enter-sub-layout', 'exit-sub-layout', 'change-song-type'
]);

const currentView = ref('main');
const selectedCardIndex = ref(null);
const forceInfosView = ref(false);
const isInSubLayout = ref(false);
const tracks = ref([]);
const currentSong = ref(null);
const audioQuality = ref(null); 
const selectedSongType = ref('');
const showCardError = ref(false);
let errorTimeout = null;
const isInitialLoading = ref(true); 
const isNavigatingBack = ref(false); // منع التنفيذ المتكرر
let isFirstMount = true;


// خريطة لأنواع الأغاني للصور
const songTypeImageMap = {
  'lossless': '/icons/top-line/lossless.png',
  'digital_master': '/icons/top-line/card2-image.png',
  'dobly_atmos': '/icons/top-line/card3-image.png'
};

const formFields = reactive({
  1: { visible: false, email: '', isValid: false },
  2: { visible: false, email: '', isValid: false },
});

// Map card indices to audio quality values and song types
const audioQualityMap = {
  0: 'lossless',
  1: 'digital_master',
  2: 'dobly_atmos'
};

// Map card indices to song types
const songTypeMap = {
  0: 'lossless',
  1: 'digital_master', 
  2: 'dobly_atmos'
};

// دالة لديبوغ حالة المكون
const logState = () => {
  console.group('📊 Upload2Component State');
  console.log('currentView:', currentView.value);
  console.log('isInSubLayout:', isInSubLayout.value);
  console.log('forceInfosView:', forceInfosView.value);
  console.log('selectedCardIndex:', selectedCardIndex.value);
  console.log('selectedSongType:', selectedSongType.value);
  console.log('tracks count:', tracks.value.length);
  console.log('props.currentStep:', props.currentStep);
  console.log('props.topLineImage:', props.topLineImage);
  console.groupEnd();
};

// دالة لتحديث الصورة العلوية بناءً على نوع الأغنية
const updateTopLineImage = (imagePath) => {
  if (imagePath) {
    emit('update:topLineImage', imagePath);
  } else if (selectedSongType.value && songTypeImageMap[selectedSongType.value]) {
    emit('update:topLineImage', songTypeImageMap[selectedSongType.value]);
  }
};

// دالة للعودة إلى الصفحة الرئيسية لتغيير نوع الأغنية
const handleTopLineImageClick = () => {
  console.log('🖱️ تم النقر على الصورة العلوية - العودة لتغيير نوع الأغنية');
  console.log('currentView قبل التغيير:', currentView.value);
  
  if (confirm('Möchten Sie den Songtyp ändern? Alle nicht gespeicherten Änderungen gehen verloren.')) {
    changeSongType();
  }
};

// دالة لتغيير نوع الأغنية والعودة إلى الصفحة الرئيسية
const changeSongType = () => {
  console.log('🔄 [Upload2Component] بدء تغيير نوع الأغنية');
  console.log('currentView قبل التغيير:', currentView.value);
  console.log('selectedSongType قبل التغيير:', selectedSongType.value);
  console.log('tracks length قبل التغيير:', tracks.value.length);
  
  // مسح songUuid من URL
  try {
    const currentQuery = { ...route.query };
    delete currentQuery.song;
    router.replace({ query: currentQuery });
    console.log('🔗 تم مسح songUuid من URL');
  } catch (error) {
    console.error('❌ فشل مسح URL:', error);
  }
  
  // مسح من الـ store
  releaseStore.clearSongUuid();
  console.log('🗑️ تم مسح songUuid من store');
  
  // إعادة تعيين الحالات
  currentView.value = 'main';
  forceInfosView.value = false;
  isInSubLayout.value = false;
  currentSong.value = null;
  selectedCardIndex.value = null;
  selectedSongType.value = '';
  tracks.value = [];
  
  // إعادة تعيين الصورة العلوية
  emit('update:topLineImage', null);
  emit('exit-sub-layout');
  
  // إرسال حدث تغيير نوع الأغنية للمكون الأب
  emit('change-song-type');
  
  console.log('✅ [Upload2Component] تم العودة إلى شاشة اختيار نوع الأغنية');
  console.log('currentView بعد التغيير:', currentView.value);
  console.log('selectedSongType بعد التغيير:', selectedSongType.value);
  console.log('tracks length بعد التغيير:', tracks.value.length);
  logState();
};

// دالة لإظهار رسالة خطأ مؤقتة
const showTemporaryError = () => {
  showCardError.value = true;
  if (errorTimeout) clearTimeout(errorTimeout);
  errorTimeout = setTimeout(() => {
    showCardError.value = false;
  }, 3000);
};

// دالة لمسح songUuid من URL
const clearSongUuidFromUrl = () => {
  try {
    const currentQuery = { ...route.query };
    delete currentQuery.song;
    router.replace({ query: currentQuery });
    console.log('🔗 تم مسح songUuid من URL');
  } catch (error) {
    console.error('❌ فشل مسح URL:', error);
  }
};

// دالة للرجوع إلى FirstSection (قابلة للاستدعاء من الخارج) - مع منع التنفيذ المتكرر
const handleBackToFirstSection = () => {
  // منع التنفيذ إذا كان بالفعل في firstSection أو إذا كان هناك تنفيذ جار
  if (isNavigatingBack.value) {
    console.log('⚠️ [Upload2Component] تنفيذ الرجوع قيد التشغيل بالفعل، تخطي');
    return;
  }
  
  if (currentView.value === 'firstSection') {
    console.log('⚠️ [Upload2Component] بالفعل في firstSection، تخطي');
    return;
  }
  
  console.log('🔙 [Upload2Component] تنفيذ handleBackToFirstSection - العودة إلى FirstSection');
  
  isNavigatingBack.value = true;
  
  // مسح songUuid من URL فقط، لا نمسح الـ tracks
  clearSongUuidFromUrl();
  releaseStore.clearSongUuid();
  
  // تغيير view إلى firstSection فقط، لا نمسح tracks
  currentView.value = 'firstSection';
  isInSubLayout.value = false;
  forceInfosView.value = false;
  currentSong.value = null;
  
  // إرسال تحديث currentView إلى المكون الأب
  emit('update:currentView', currentView.value);
  
  // تحديث الصورة العلوية
  updateTopLineImage();
  
  emit('exit-sub-layout');
  logState();
  
  // إعادة تعيين العلم بعد فترة قصيرة
  setTimeout(() => {
    isNavigatingBack.value = false;
  }, 500);
};

// جلب كل الأغاني
const fetchSongs = async () => {
  if (!props.releaseUuid) {
    console.error('❌ fetchSongs: لا يوجد releaseUuid');
    return;
  }
  
  try {
    console.log('📡 جلب الأغاني لـ release:', props.releaseUuid);
    const res = await apiRequest.get(`/releases/${props.releaseUuid}/songs`);
    tracks.value = res.data.data || [];
    console.log('✅ تم جلب الأغاني:', tracks.value.length, 'أغنية');
    
    if (route.query.song) {
      const songExists = tracks.value.some(song => song.uuid === route.query.song);
      if (!songExists) {
        console.warn('⚠️ الأغنية في الـ URL غير موجودة في القائمة:', route.query.song);
        clearSongUuidFromUrl();
        releaseStore.clearSongUuid();
      }
    }
  } catch (err) {
    console.error('❌ فشل جلب الأغاني:', err);
  }
};

// تحديث الأغنية الحالية فقط
const refreshCurrentSong = async () => {
  if (!props.releaseUuid || !currentSong.value?.uuid) {
    console.warn('⚠️ لا يمكن تحديث الأغنية: لا يوجد releaseUuid أو uuid');
    return;
  }

  try {
    console.log(`↻ جلب الأغنية المحددة: ${currentSong.value.uuid}`);
    const res = await apiRequest.get(
      `/releases/${props.releaseUuid}/songs/${currentSong.value.uuid}`
    );

    const freshSong = res.data.data || res.data;

    if (freshSong?.uuid) {
      const updatedSong = { ...currentSong.value };
      
      Object.keys(freshSong).forEach(key => {
        if (freshSong[key] !== undefined && freshSong[key] !== null) {
          updatedSong[key] = freshSong[key];
        }
      });
      
      currentSong.value = updatedSong;
      
      if (freshSong.title) {
        releaseStore.setCurrentSongTitle(freshSong.title);
        console.log('🎵 تحديث عنوان الأغنية في store:', freshSong.title);
      }
      
      console.log('✅ تم تحديث currentSong من الخادم');

      const index = tracks.value.findIndex(s => s.uuid === freshSong.uuid);
      if (index !== -1) {
        tracks.value[index] = { ...tracks.value[index], ...updatedSong };
      }
    }
  } catch (err) {
    console.error('❌ فشل جلب الأغنية المحددة:', err);
  }
};

const addNewSong = async () => {
  if (!selectedSongType.value) {
    console.error('❌ لا يمكن إنشاء أغنية: لم يتم اختيار نوع الأغنية بعد');
    showTemporaryError();
    return;
  }
  
  try {
    const formData = new FormData();
    const songNumber = tracks.value.filter(t => t.song_type === selectedSongType.value).length + 1;
    formData.append('title', `Song ${songNumber}`);
    formData.append('subtitle', '');
    formData.append('song_type', selectedSongType.value);
    console.log('🎵 إنشاء أغنية جديدة من نوع:', selectedSongType.value);

    const res = await apiRequest.post(`/releases/${props.releaseUuid}/songs`, formData);
    const newSong = res.data.data;
    tracks.value.push(newSong);
    console.log('✅ تم إنشاء أغنية جديدة:', newSong);
  } catch (err) {
    console.error('❌ فشل إنشاء الأغنية:', err);
  }
};

// تعديل الأغنية - الحفاظ على /edit في الرابط
const editSong = async (songUuid) => {
  console.log('🔍 جاري تحميل أغنية:', songUuid);
  
  if (!props.releaseUuid) {
    console.error('❌ لا يوجد releaseUuid');
    return;
  }
  
  if (songUuid === props.releaseUuid) {
    console.error('❌ خطأ: songUuid هو نفسه releaseUuid');
    return;
  }
  
  // تحديث URL مع الحفاظ على /edit
  updateUrlWithSongUuid(songUuid);
  
  const existingTrack = tracks.value.find(track => track.uuid === songUuid);
  
  if (!existingTrack) {
    console.warn('⚠️ الأغنية غير موجودة في tracks، جلب من الخادم مباشرة');
    await fetchSongDirectly(songUuid);
    return;
  }
  
  try {
    currentSong.value = JSON.parse(JSON.stringify(existingTrack));
    
    if (existingTrack.title) {
      releaseStore.setCurrentSongTitle(existingTrack.title);
      console.log('🎵 تحديث عنوان الأغنية في store من tracks:', existingTrack.title);
    }
    
    console.log('✅ تم تعيين currentSong من tracks المحلية');
    await refreshCurrentSong();
    
    currentView.value = 'infos';
    isInSubLayout.value = true;
    forceInfosView.value = true;
    
    // إرسال تحديث currentView إلى المكون الأب
    emit('update:currentView', currentView.value);
    console.log('📢 [Upload2Component] Emitted update:currentView:', currentView.value);

    emit('enter-sub-layout');
    updateTopLineImage();
    
    logState();
  } catch (err) {
    console.error('❌ فشل جلب تفاصيل الأغنية:', err);
  }
};

// تحديث URL مع الحفاظ على /edit
const updateUrlWithSongUuid = (songUuid) => {
  if (!songUuid || songUuid === props.releaseUuid) {
    console.error('❌ لا يمكن تحديث URL: songUuid غير صالح أو هو نفسه releaseUuid');
    return;
  }
  
  try {
    // الحفاظ على /edit في الرابط
    const newUrl = `/releases/${props.releaseUuid}/songs/${songUuid}/edit`;
    router.push(newUrl);
    console.log('🔗 تم تحديث URL إلى (مع /edit):', newUrl);
  } catch (error) {
    console.error('❌ فشل تحديث URL:', error);
  }
};

// دالة الحفظ المحسنة
const handleSaveSong = async (updatedData) => {
  if (!props.releaseUuid || !currentSong.value?.uuid) {
    console.error('❌ handleSaveSong: لا يوجد releaseUuid أو uuid للأغنية الحالية');
    return;
  }

  try {
    console.log('💾 بدء حفظ الأغنية:', currentSong.value.uuid);
    console.log('📤 البيانات المستلمة للحفظ:', updatedData);
    
    const hasSongFile = updatedData.song_file && typeof updatedData.song_file === 'string';
    const hasCoverFile = updatedData.cover && typeof updatedData.cover === 'string';
    
    if (hasSongFile || hasCoverFile) {
      console.log('📤 رفع ملف/صور باستخدام FormData');
      
      const formData = new FormData();
      
      if (hasSongFile) {
        try {
          const byteCharacters = atob(updatedData.song_file);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: 'audio/wav' });
          formData.append('song_file', blob, updatedData.song_file_name || 'song.wav');
        } catch (err) {
          console.error('❌ فشل تحويل ملف الصوت:', err);
        }
      }
      
      if (hasCoverFile) {
        try {
          const base64Data = updatedData.cover.split(',')[1] || updatedData.cover;
          const byteCharacters = atob(base64Data);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: 'image/jpeg' });
          formData.append('cover', blob, 'cover.jpg');
        } catch (err) {
          console.error('❌ فشل تحويل صورة الغلاف:', err);
        }
      }
      
      if (updatedData.prerelease !== undefined) {
        formData.append('prerelease', updatedData.prerelease);
      }
      
      if (updatedData.pre_order !== undefined) {
        formData.append('pre_order', updatedData.pre_order);
      }
      
      if (updatedData.release_date && updatedData.release_date !== null) {
        formData.append('release_date', updatedData.release_date);
      }
      
      if (updatedData.pre_release_image && updatedData.pre_release_image !== null) {
        formData.append('pre_release_image', updatedData.pre_release_image);
      }
      
      formData.append('_method', 'PUT');
      
      const response = await apiRequest.post(
        `/releases/${props.releaseUuid}/songs/${currentSong.value.uuid}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        }
      );
      
      console.log('✅ تم رفع الملفات بنجاح!', response.data);
      
      if (response.data.data) {
        Object.assign(currentSong.value, response.data.data);
        
        if (response.data.data.title) {
          releaseStore.setCurrentSongTitle(response.data.data.title);
          console.log('🎵 تحديث عنوان الأغنية في store من response:', response.data.data.title);
        }
      }
      
    } else {
      console.log('📤 إرسال بيانات نصية كـ JSON');
      
      const tabFields = {
        'infos': ['title', 'subtitle', 'song_type', 'explicit_lyrics', 'isrc', 'title_language', 'lyrics_language', 'song_lyrics', 'preview_enabled'],
        'urheber': ['authors'],
        'mitwirkende': ['contributors', 'production_year'],
        'deals': ['is_splitting_active', 'shares'],
        'pre-release': ['prerelease', 'pre_order', 'pre_release_image', 'release_date']
      };
      
      let currentTab = null;
      if (updatedData.authors) currentTab = 'urheber';
      else if (updatedData.contributors) currentTab = 'mitwirkende';
      else if (updatedData.is_splitting_active !== undefined) currentTab = 'deals';
      else if (updatedData.prerelease !== undefined || 
               updatedData.pre_order !== undefined || 
               updatedData.pre_release_image !== undefined || 
               updatedData.release_date !== undefined) currentTab = 'pre-release';
      else currentTab = 'infos';
      
      console.log(`📌 التبويب المرسل: ${currentTab}`);
      
      const payload = {};
      let hasChanges = false;
      const allowedFields = tabFields[currentTab] || [];
      
      Object.keys(updatedData).forEach(key => {
        if (key === 'uuid' || key === 'release_uuid' || key === 'created_at' || key === 'song_file' || key === 'cover') {
          return;
        }
        
        if (!allowedFields.includes(key) && key !== 'authors' && key !== 'contributors') {
          console.log(`⏭️ تخطي ${key} - ليس من حقول التبويب ${currentTab}`);
          return;
        }
        
        const newValue = updatedData[key];
        const oldValue = currentSong.value[key];
        
        const isValueChanged = JSON.stringify(newValue) !== JSON.stringify(oldValue);
        
        if (isValueChanged && newValue !== null) {
          payload[key] = newValue;
          hasChanges = true;
          console.log(`🔄 تغيير في ${key}`);
        }
      });
      
      if (!hasChanges || Object.keys(payload).length === 0) {
        console.log('ℹ️ لا توجد تغييرات');
        return;
      }
      
      console.log('📤 Payload النهائي:', payload);
      
      const response = await apiRequest.put(
        `/releases/${props.releaseUuid}/songs/${currentSong.value.uuid}`,
        payload
      );
      
      console.log('✅ تم الحفظ بنجاح!', response.data);
      
      if (response.data.data) {
        Object.assign(currentSong.value, response.data.data);
        
        if (payload.title || response.data.data.title) {
          const newTitle = payload.title || response.data.data.title;
          releaseStore.setCurrentSongTitle(newTitle);
          console.log('🎵 تحديث عنوان الأغنية في store من payload:', newTitle);
        }
      }
    }
    
    const index = tracks.value.findIndex(s => s.uuid === currentSong.value.uuid);
    if (index !== -1) {
      tracks.value[index] = { ...tracks.value[index], ...currentSong.value };
    }
    
    console.log('🔄 تم تحديث البيانات المحلية');
    
  } catch (err) {
    console.error('❌ فشل الحفظ:', {
      error: err,
      message: err.message,
      response: err.response?.data
    });
  }
};

const deleteSong = async (songUuid) => {
  try {
    await apiRequest.delete(`/releases/${props.releaseUuid}/songs/${songUuid}`);
    tracks.value = tracks.value.filter(s => s.uuid !== songUuid);
    
    if (currentSong.value?.uuid === songUuid) {
      handleBackFromInfos();
    }
    
    console.log('✅ تم حذف الأغنية:', songUuid);
  } catch (err) {
    console.error('❌ فشل الحذف:', err);
  }
};

const fetchSongDirectly = async (songUuid) => {
  if (!props.releaseUuid || !songUuid) {
    console.error('❌ fetchSongDirectly: لا يوجد releaseUuid أو songUuid');
    return;
  }
  
  if (songUuid === props.releaseUuid) {
    console.error('❌ خطأ: songUuid هو نفسه releaseUuid');
    return;
  }
  
  try {
    const res = await apiRequest.get(
      `/releases/${props.releaseUuid}/songs/${songUuid}`
    );

    const songData = res.data.data || res.data;

    if (!songData?.uuid) {
      console.error('❌ لم يتم جلب الأغنية بشكل صحيح');
      return;
    }

    currentSong.value = JSON.parse(JSON.stringify(songData));
    
    if (songData.title) {
      releaseStore.setCurrentSongTitle(songData.title);
      console.log('🎵 تحديث عنوان الأغنية في store من fetchSongDirectly:', songData.title);
    }
    
    console.log('✅ تم جلب الأغنية مباشرة من الخادم');

    if (!tracks.value.find(t => t.uuid === songUuid)) {
      tracks.value.push({ ...songData });
    }

    currentView.value = 'infos';
    isInSubLayout.value = true;
    forceInfosView.value = true;
    
    emit('update:currentView', currentView.value);

    emit('enter-sub-layout');
    updateTopLineImage();
    
    logState();

  } catch (err) {
    console.error('❌ فشل جلب الأغنية مباشرة:', err);
  }
};

const handleBackFromInfos = () => {
  console.log('🔙 العودة من Infos');
  
  clearSongUuidFromUrl();
  releaseStore.clearSongUuid();
  
  currentView.value = 'firstSection';
  forceInfosView.value = false;
  isInSubLayout.value = false;
  currentSong.value = null;
  
  emit('update:currentView', currentView.value);
  emit('exit-sub-layout');
  updateTopLineImage();
  
  logState();
};

const handleBackToTracklist = () => {
  console.log('🔄 Upload2Component: استقبال حدث back-to-tracklist، العودة إلى FirstSection');
  
  clearSongUuidFromUrl();
  releaseStore.clearSongUuid();
  
  currentView.value = 'firstSection';
  isInSubLayout.value = false;
  forceInfosView.value = false;
  currentSong.value = null;
  
  emit('update:currentView', currentView.value);
  emit('exit-sub-layout');
  updateTopLineImage();
  
  logState();
};

const handleForceEditSong = (event) => {
  const { songUuid } = event.detail;
  if (songUuid && props.releaseUuid && songUuid !== props.releaseUuid) {
    console.log('📩 تلقيت حدث force-edit-song:', songUuid);
    releaseStore.setSongUuid(songUuid);
    editSong(songUuid);
  } else {
    console.error('❌ حدث force-edit-song به خطأ: songUuid هو نفسه releaseUuid');
  }
};

const handleEnterSubLayout = () => {
  isInSubLayout.value = true;
  emit('enter-sub-layout');
};

const handleExitSubLayout = () => {
  isInSubLayout.value = false;
  emit('exit-sub-layout');
};

// ========== Lifecycle Hooks ==========
// أضف هذا المتغير في بداية المكون

// ثم في onMounted
onMounted(async () => {
  console.log('🚀 Upload2Component mounted');
  
  // إذا لم يكن هذا أول تحميل للمكون، لا تفعل شيئاً
  if (!isFirstMount) {
    console.log('⚠️ [Upload2Component] تم تحميل المكون مسبقاً، تخطي إعادة التهيئة');
    return;
  }
  
  isFirstMount = false;
  
  // تعيين حالة التحميل
  isInitialLoading.value = true;
  
  logState();
  
  window.addEventListener('force-edit-song', handleForceEditSong);
  
  window.addEventListener('back-to-first-section-from-layout', () => {
    console.log('🔙 [Upload2Component] استقبال حدث الرجوع من Layout (via window)');
    handleBackToFirstSection();
  });
  
  // فقط جلب الأغاني إذا كانت tracks فارغة
  if (tracks.value.length === 0) {
    await fetchSongs();
  } else {
    console.log('📦 الأغاني موجودة بالفعل، تخطي جلبها:', tracks.value.length);
  }

  const songUuidToLoad = releaseStore.songUuid || route.query.song;
  
  if (songUuidToLoad && props.releaseUuid && songUuidToLoad !== props.releaseUuid) {
    console.log('🔄 تحميل أغنية من الـ Store أو URL:', songUuidToLoad);
    
    if (tracks.value.length > 0) {
      await editSong(songUuidToLoad);
    } else {
      setTimeout(async () => {
        await fetchSongs();
        if (tracks.value.length > 0) {
          await editSong(songUuidToLoad);
        }
        setTimeout(() => {
          isInitialLoading.value = false;
        }, 100);
      }, 500);
      return;
    }
  } else if (props.forceInfosView && tracks.value.length > 0 && currentView.value !== 'firstSection') {
    await editSong(tracks.value[0].uuid);
  } else if (selectedSongType.value && tracks.value.length > 0 && currentView.value === 'main') {
    currentView.value = 'firstSection';
    emit('update:currentView', currentView.value);
    updateTopLineImage();
  }
  
  setTimeout(() => {
    isInitialLoading.value = false;
  }, 100);
  
  logState();
});

onUnmounted(() => {
  window.removeEventListener('force-edit-song', handleForceEditSong);
  window.removeEventListener('back-to-first-section-from-layout', () => {});
  if (errorTimeout) clearTimeout(errorTimeout);
});

// ========== Handlers for Cards ==========
const handleCardClick = (index) => {
  selectedCardIndex.value = index;
  if (index === 0) {
    handleNext(index);
  }
};

// دالة لإرسال audio_quality إلى الـ API
const updateAudioQuality = async (quality) => {
  if (!props.releaseUuid) {
    console.error('❌ لا يوجد releaseUuid لتحديث جودة الصوت');
    return;
  }

  try {
    console.log('🎵 تحديث جودة الصوت:', quality);
    
    const payload = {
      audio_quality: quality,
      _method: 'PATCH'
    };

    const response = await apiRequest.post(`/releases/${props.releaseUuid}`, payload);
    console.log('✅ تم تحديث جودة الصوت بنجاح:', response.data);
    
    audioQuality.value = quality;
    
  } catch (err) {
    console.error('❌ فشل تحديث جودة الصوت:', err.response?.data || err.message);
  }
};

const handleNext = (cardIndex) => {
  // التحقق من صحة الإيميل للكارد الثاني والثالث
  if (cardIndex > 0 && !formFields[cardIndex].isValid) {
    console.warn('⚠️ يجب إدخال إيميل صحيح للمتابعة');
    showTemporaryError();
    return;
  }

  selectedCardIndex.value = cardIndex;
  const quality = audioQualityMap[cardIndex];
  selectedSongType.value = songTypeMap[cardIndex];
  
  console.log('🎵 تم اختيار نوع الأغنية:', selectedSongType.value);
  console.log('🎵 تم اختيار جودة الصوت:', quality);

  updateAudioQuality(quality);

  currentView.value = 'firstSection';
  emit('update:currentView', currentView.value);
  updateTopLineImage();
  
  logState();
};

const handleBackClick = () => {
  console.log('🔙 العودة من FirstSection إلى شاشة اختيار الكروت');
  currentView.value = 'main';
  selectedCardIndex.value = null;
  selectedSongType.value = '';
  tracks.value = [];
  emit('update:topLineImage', null);
  logState();
};

const showFormField = (cardIndex) => {
  formFields[cardIndex].visible = true;
};

const hideFormField = (cardIndex) => {
  if (!formFields[cardIndex].email) {
    formFields[cardIndex].visible = false;
  }
};

const validateEmail = (cardIndex) => {
  const email = formFields[cardIndex].email;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  formFields[cardIndex].isValid = emailRegex.test(email);
  
  if (email === 'test@example.com' || email === 'demo@test.com') {
    formFields[cardIndex].isValid = true;
  }
};

// مراقبة تغيرات route.query.song
watch(
  () => route.query.song,
  async (newSongUuid) => {
    if (newSongUuid && props.releaseUuid && props.currentStep === 3 && !isNavigatingBack.value) {
      if (newSongUuid === props.releaseUuid) {
        console.error('❌ خطأ في route.query.song: songUuid هو نفسه releaseUuid');
        clearSongUuidFromUrl();
        return;
      }
      
      console.log('🔄 تم اكتشاف تغير في route.query.song:', newSongUuid);
      if (newSongUuid !== currentSong.value?.uuid) {
        await editSong(newSongUuid);
      }
    } else if (!newSongUuid && currentView.value === 'infos') {
      handleBackFromInfos();
    }
  },
  { immediate: true }
);

// مراقبة forceInfosView
watch(() => props.forceInfosView, (newVal) => {
  console.log('🔄 props.forceInfosView تغير:', newVal);
  if (newVal && tracks.value.length > 0 && !isNavigatingBack.value) {
    editSong(tracks.value[0].uuid);
  }
}, { immediate: true });

// تصدير الدوال التي يحتاجها المكون الأب
defineExpose({
  handleTopLineImageClick,
  changeSongType,
  currentView,
  selectedSongType,
  handleBackToFirstSection,
  resetFirstMount: () => { isFirstMount = true; }
});
</script>



<style lang="scss" scoped>
.component-container {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 500px;
}

.error-message {
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  background: #DE1456;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-family: Heebo;
  font-size: 14px;
  font-weight: 500;
  z-index: 1000;
  animation: fadeInOut 3s ease forwards;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

@keyframes fadeInOut {
  0% {
    opacity: 0;
    transform: translateX(-50%) translateY(20px);
  }
  15% {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
  85% {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateX(-50%) translateY(-20px);
    visibility: hidden;
  }
}

/* شاشة التحميل المؤقتة */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  min-height: 400px;
  gap: 20px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: var(--Strawberry, #DE1456);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  color: var(--Main-Colors-White, #FFF);
  font-family: Heebo;
  font-size: 16px;
  font-weight: 400;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.content {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 40px;
  flex: 1 0 0;
  align-self: stretch;
  min-height: 500px;
  padding-bottom: 50px;
}

.option {
  display: flex;
  height: 500px;
  flex-direction: column;
  align-items: center;
  gap: 40px;
}

.option .card-songs,
.card-songs2,
.card-songs3 {
  display: flex;
  width: 360px;
  height: 360px;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  gap: 22px;
  flex-shrink: 0;
  aspect-ratio: 1/1;
  border-radius: 20px;
  box-shadow: 4px 4px 20px 0 rgba(27, 28, 32, 0.70);
  position: relative;
  cursor: pointer;
}

.card-songs {
  background: url('/img/bgCardSongs/card1.png');
  background-size: contain;
}

.card-songs2 {
  background: url('/img/bgCardSongs/card2.png');
  background-size: contain;
}

.card-songs3 {
  background: url('/img/bgCardSongs/card3.png');
  background-size: contain;
}

.image-overlay {
  display: flex;
  padding: 32px 28px;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
  flex: 1 0 0;
  align-self: stretch;
  border-radius: 20px;
  background: url(../../assets/icons/dashboard/user/shadows.png) 50% / cover no-repeat;
  transition: background 0.3s ease;
}

.option:hover .image-overlay,
.image-overlay.no-overlay {
  background: none !important;
  transition: background 0.3s ease;
}

.option .description {
  align-self: stretch;
  color: var(--Main-Colors-White, #FFF);
  text-align: center;
  font-family: Heebo;
  font-size: 18px;
  font-style: normal;
  font-weight: 300;
  line-height: normal;
  max-width: 444px;
}

.card-songs .logo {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 303px;
  height: 119px;
  background: url('/img/bgCardSongs/logo/logo1.png') 50% / cover no-repeat;
}

.card-songs2 .logo {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 303px;
  height: 119px;
  background: url('/img/bgCardSongs/logo/logo2.png') 50% / cover no-repeat;
  transition: top 0.3s ease, width 0.3s ease, height 0.3s ease;
}

.card-songs2 .logo.shifted {
  top: 100px;
  width: 272.7px;
  height: 107.1px;
}

.card-songs3 .logo {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 200px;
  height: 79px;
  background: url('/img/bgCardSongs/logo/logo3.png') 50% / cover no-repeat;
  transition: top 0.3s ease, width 0.3s ease, height 0.3s ease;
}

.card-songs3 .logo.shifted {
  top: 120px;
  width: 180px;
  height: 71.1px;
}

.Form {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  align-self: stretch;
  position: relative;
}

.Form .Form-filed {
  display: flex;
  width: 304px;
  padding: 8px 12px;
  justify-content: space-between;
  align-items: center;
  position: absolute;
  top: -55px;
  border-radius: 5px;
  background: var(--primary);
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.Form .Form-filed.visible {
  opacity: 1;
  transform: translateY(0);
  color: #FFF;
}

.Form .Form-filed:hover {
  border: 1px solid var(--move);
}

.Form-filed .email-input {
  color: var(--Main-Colors-Dove, #6A6C6D);
  font-family: Heebo;
  font-size: 20px;
  font-style: normal;
  font-weight: 300;
  line-height: 1;
  letter-spacing: 1px;
  background: transparent;
  border: none;
  outline: none;
  flex: 1;
}

.Form-filed .email-input.has-text {
  color: var(--Main-Colors-White, #FFF);
}

.Form-filed .email-input::placeholder {
  color: var(--Main-Colors-Dove, #6A6C6D);
}

.Form-filed .checkmark {
  width: 20px;
  height: 20px;
}

.Form .btn-primary,
.btn-primary1 {
  display: flex;
  padding: 12px 20px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  border-radius: 5px;
  background: var(--Main-Colors-Slate-Light, #3A3E42);
  transition: background 0.3s ease;
}

.btn-primary1 {
  display: flex;
  padding: 12px 20px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  border-radius: 5px;
  transition: background 0.3s ease;
  background: var(--Strawberry);
}

.btn-primary1:hover {
  background: var(--dark-red);
}

.Form .btn-primary.active {
  background: var(--Strawberry);
}

.Form .btn-primary.active:hover {
  background: var(--dark-red);
}

.btn-primary1 .p {
  font-family: Heebo;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: 1;
  text-transform: uppercase;
  transition: color 0.3s ease;
  color: #FFF;
}

.btn-primary .p {
  color: #6A6C6D;
  font-family: Heebo;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: 1;
  text-transform: uppercase;
  transition: color 0.3s ease;
}

.btn-primary.active .p {
  color: var(--Main-Colors-White, #FFF);
}

/* Responsive */
@media (max-width:1599px) {
  .option .description {
    font-size: 14px;
  }

  .option .card-songs,
  .option .card-songs2,
  .option .card-songs3 {
    width: clamp(308px, calc(308px + 54 * (100vw - 1440px) / 159), 362px);
    height: clamp(308px, calc(308px + 54 * (100vw - 1440px) / 159), 362px);
  }

  .card-songs .logo {
    width: 270px;
    height: 100px;
  }

  .card-songs2 .logo {
    width: 280px;
    height: 115px;
  }

  .card-songs3 .logo {
    width: 180px;
  }
}

@media (min-width:1600px) and (max-width:2074px) {
  .option .card-songs,
  .option .card-songs2,
  .option .card-songs3 {
    width: 340px;
    height: 340px;
  }
}

@media (min-width:2075px) and (max-width:2560px) {
  .option .card-songs,
  .option .card-songs2,
  .option .card-songs3 {
    width: 440px;
    height: 440px;
    gap: 112px;
    align-items: center;
  }

  .card-songs .logo {
    width: 340px;
    height: 142px;
  }

  .card-songs2 .logo {
    width: 350px;
    height: 150px;
  }

  .card-songs3 .logo {
    width: 230px;
  }
}
</style>