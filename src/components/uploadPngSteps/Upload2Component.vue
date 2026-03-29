<template>
  <div class="component-container">
 
    <!-- عرض الكروت الثلاثة فقط لو كان currentView = main ولم يتم تفعيل sub-layout -->
    <div v-if="currentView === 'main' && !forceInfosView && !isInSubLayout" class="content">
      
      <div class="option">
        <div class="card-songs" @click="handleCardClick(0)">
          <div class="image-overlay">
            <div class="Form">
              <div class="btn-primary1" @click="handleNext(0)">
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
              <div class="btn-primary" :class="{ active: formFields[1].isValid }" @click="handleNext(1)">
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
              <div class="btn-primary" :class="{ active: formFields[2].isValid }" @click="handleNext(2)">
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
      @next="$emit('next')" 
      @add-track="addNewSong"
      @edit-track="editSong"
      @delete-track="deleteSong" 
      @back="handleBackClick"
      @update:topLineImage="emit('update:topLineImage', $event)" 
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

   
  </div>
</template>

<script setup>
import { ref, reactive, defineProps, defineEmits, watch, onMounted, onUnmounted } from 'vue';
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
  releaseUuid: { type: String, required: true }
});

const emit = defineEmits([
  'next', 'update:currentView', 'back', 'update:topLineImage',
  'enter-sub-layout', 'exit-sub-layout'
]);

const currentView = ref('main');
const selectedCardIndex = ref(null);
const forceInfosView = ref(false);
const isInSubLayout = ref(false);
const tracks = ref([]);
const currentSong = ref(null);
const audioQuality = ref(null); 

const formFields = reactive({
  1: { visible: false, email: '', isValid: false },
  2: { visible: false, email: '', isValid: false },
});

// Map card indices to audio quality values
const audioQualityMap = {
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
  console.log('currentSong uuid:', currentSong.value?.uuid);
  console.log('currentSong title:', currentSong.value?.title);
  console.log('currentSong prerelease:', currentSong.value?.prerelease);
  console.log('currentSong pre_order:', currentSong.value?.pre_order);
  console.log('tracks count:', tracks.value.length);
  console.log('audioQuality:', audioQuality.value);
  console.log('props.forceInfosView:', props.forceInfosView);
  console.log('props.currentStep:', props.currentStep);
  console.log('releaseStore.songUuid:', releaseStore.songUuid);
  console.log('releaseStore.currentSongTitle:', releaseStore.currentSongTitle);
  console.log('route.query.song:', route.query.song);
  console.log('props.releaseUuid:', props.releaseUuid);
  console.groupEnd();
};

onMounted(async () => {
  console.log('🚀 Upload2Component mounted');
  logState();
  
  // استمع لحدث force-edit-song من UploadPNG
  window.addEventListener('force-edit-song', handleForceEditSong);
  
  // 1. جلب الأغاني أولاً
  await fetchSongs();

  // 2. تحقق من وجود songUuid في الـ Store أو الـ URL
  const songUuidToLoad = releaseStore.songUuid || route.query.song;
  if (songUuidToLoad && props.releaseUuid) {
    console.log('🔄 تحميل أغنية من الـ Store أو URL:', songUuidToLoad);
    
    // التحقق أولاً من أن songUuid مختلف عن releaseUuid
    if (songUuidToLoad === props.releaseUuid) {
      console.error('❌ خطأ: songUuid هو نفسه releaseUuid:', songUuidToLoad);
      console.log('ℹ️ الإصلاح: استخدم الرابط: /create-release/019ba971-1e8d-7013-a8b6-3c3a60f98247?song=019be18a-1159-70c7-8a67-4748d0cd2317');
      return;
    }
    
    // إذا كان هناك أغاني في القائمة، تحميل مباشرة
    if (tracks.value.length > 0) {
      await editSong(songUuidToLoad);
    } else {
      // إذا لم تكن هناك أغاني، حاول مرة أخرى بعد تأخير
      setTimeout(async () => {
        await fetchSongs();
        if (tracks.value.length > 0) {
          await editSong(songUuidToLoad);
        }
      }, 500);
    }
    return;
  }

  // 3. السلوك العادي: إذا كنا في الخطوة 3 انتقل إلى قائمة الأغاني
  if (props.currentStep === 3 && !songUuidToLoad) {
    currentView.value = 'firstSection';
    console.log('📋 الانتقال العادي إلى قائمة الأغاني');
  }
});

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
    
    // التحقق من أن songUuid في الـ URL موجود في القائمة
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
      // الحفاظ على البيانات الحالية وإضافة الجديدة فقط
      const updatedSong = { ...currentSong.value };
      
      // تحديث القيم التي تلقيناها من الخادم
      Object.keys(freshSong).forEach(key => {
        if (freshSong[key] !== undefined && freshSong[key] !== null) {
          updatedSong[key] = freshSong[key];
        }
      });
      
      currentSong.value = updatedSong;
      
      // ===== تحديث عنوان الأغنية في الـ store =====
      if (freshSong.title) {
        releaseStore.setCurrentSongTitle(freshSong.title);
        console.log('🎵 تحديث عنوان الأغنية في store:', freshSong.title);
      }
      // ==========================================
      
      console.log('✅ تم تحديث currentSong من الخادم');

      // تحديث tracks أيضاً
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
  try {
    const formData = new FormData();
    formData.append('title', `Song ${tracks.value.length + 1}`);
    formData.append('subtitle', '');
    formData.append('song_type', 'SONG');

    const res = await apiRequest.post(`/releases/${props.releaseUuid}/songs`, formData);
    const newSong = res.data.data;
    tracks.value.push(newSong);
    console.log('✅ تم إنشاء أغنية جديدة:', newSong);
  } catch (err) {
    console.error('❌ فشل إنشاء الأغنية:', err);
  }
};

// تعديل دالة editSong لتحديث URL
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
  
  // تحديث URL إلى الرابط الجديد
  updateUrlWithSongUuid(songUuid);
  
  // تحقق أولاً إذا كانت الأغنية موجودة في tracks
  const existingTrack = tracks.value.find(track => track.uuid === songUuid);
  
  if (!existingTrack) {
    console.warn('⚠️ الأغنية غير موجودة في tracks، جلب من الخادم مباشرة');
    await fetchSongDirectly(songUuid);
    return;
  }
  
  try {
    // استخدام بيانات الأغنية الموجودة أولاً
    currentSong.value = JSON.parse(JSON.stringify(existingTrack));
    
    // ===== تحديث عنوان الأغنية في الـ store =====
    if (existingTrack.title) {
      releaseStore.setCurrentSongTitle(existingTrack.title);
      console.log('🎵 تحديث عنوان الأغنية في store من tracks:', existingTrack.title);
    }
    // ==========================================
    
    console.log('✅ تم تعيين currentSong من tracks المحلية');
    
    // جلب البيانات المحدثة من الخادم
    await refreshCurrentSong();
    
    // التبديل إلى عرض infos
    currentView.value = 'infos';
    isInSubLayout.value = true;
    forceInfosView.value = true;

    emit('enter-sub-layout');
    emit('update:topLineImage', '/icons/top-line/x.svg');
    
    logState();
  } catch (err) {
    console.error('❌ فشل جلب تفاصيل الأغنية:', err);
  }
};

// دالة لتحديث URL مع songUuid (بالصيغة الجديدة)
const updateUrlWithSongUuid = (songUuid) => {
  if (!songUuid || songUuid === props.releaseUuid) {
    console.error('❌ لا يمكن تحديث URL: songUuid غير صالح أو هو نفسه releaseUuid');
    return;
  }
  
  try {
    // استخدام الرابط الجديد: /releases/{releaseUuid}/songs/{songUuid}
    const newUrl = `/releases/${props.releaseUuid}/songs/${songUuid}`;
    router.push(newUrl);
    console.log('🔗 تم تحديث URL إلى:', newUrl);
  } catch (error) {
    console.error('❌ فشل تحديث URL:', error);
  }
};

// دالة الحفظ المحسنة - كل تبويب يرسل بياناته فقط
const handleSaveSong = async (updatedData) => {
  if (!props.releaseUuid || !currentSong.value?.uuid) {
    console.error('❌ handleSaveSong: لا يوجد releaseUuid أو uuid للأغنية الحالية');
    return;
  }

  try {
    console.log('💾 بدء حفظ الأغنية:', currentSong.value.uuid);
    console.log('📤 البيانات المستلمة للحفظ:', updatedData);
    
    // التحقق من وجود ملف صوت أو صورة cover في البيانات
    const hasSongFile = updatedData.song_file && typeof updatedData.song_file === 'string';
    const hasCoverFile = updatedData.cover && typeof updatedData.cover === 'string' && updatedData.cover.startsWith('/9j/'); // تحقق من أن cover هو base64 لصورة
    
    // إذا كان هناك ملف صوت أو صورة cover، نستخدم FormData
    if (hasSongFile || hasCoverFile) {
      console.log('📤 رفع ملف/صور باستخدام FormData');
      
      const formData = new FormData();
      
      // إضافة ملف الصوت إذا وجد
      if (hasSongFile) {
        // تحويل base64 إلى Blob
        const byteCharacters = atob(updatedData.song_file);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'audio/wav' });
        formData.append('song_file', blob, updatedData.song_file_name || 'song.wav');
      }
      
      // إضافة صورة cover إذا وجدت
      if (hasCoverFile) {
        // تحويل base64 إلى Blob
        const base64Data = updatedData.cover.split(',')[1] || updatedData.cover; // في حال كانت البيانات تحتوي على "data:image/jpeg;base64,"
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'image/jpeg' }); // افتراضي jpeg
        formData.append('cover', blob, 'cover.jpg');
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
      
      // إضافة _method PUT لأن بعض الـ APIs تتطلب ذلك مع FormData
      formData.append('_method', 'PUT');
      
      console.log('📤 FormData:', {
        hasSongFile,
        hasCoverFile,
        keys: [...formData.keys()]
      });
      
      // إرسال الطلب
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
      
      // تحديث البيانات المحلية
      if (response.data.data) {
        Object.assign(currentSong.value, response.data.data);
        
        // ===== تحديث عنوان الأغنية في الـ store =====
        if (response.data.data.title) {
          releaseStore.setCurrentSongTitle(response.data.data.title);
          console.log('🎵 تحديث عنوان الأغنية في store من response:', response.data.data.title);
        }
        // ==========================================
      }
      
    } else {
      // لا يوجد ملفات، نرسل البيانات النصية فقط كـ JSON
      console.log('📤 إرسال بيانات نصية كـ JSON');
      
      // قائمة الحقول حسب كل تبويب
      const tabFields = {
        'infos': ['title', 'subtitle', 'song_type', 'explicit_lyrics', 'isrc', 'title_language', 'lyrics_language', 'song_lyrics', 'preview_enabled'],
        'urheber': ['authors'],
        'mitwirkende': ['contributors', 'production_year'],
        'deals': ['is_splitting_active', 'shares'],
        'pre-release': ['prerelease', 'pre_order', 'pre_release_image', 'release_date'] // بدون cover لأن cover يتم التعامل معه كملف
      };
      
      // تحديد التبويب المرسل من خلال الحقول الموجودة
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
      
      // إنشاء payload يحتوي فقط على حقول التبويب الحالي
      const payload = {};
      let hasChanges = false;
      
      // الحصول على حقول التبويب الحالي
      const allowedFields = tabFields[currentTab] || [];
      
      Object.keys(updatedData).forEach(key => {
        // تجاهل الخصائص غير المرغوب فيها
        if (key === 'uuid' || key === 'release_uuid' || key === 'created_at' || key === 'song_file' || key === 'cover') {
          return;
        }
        
        // التأكد من أن الحقل مسموح به لهذا التبويب
        if (!allowedFields.includes(key) && key !== 'authors' && key !== 'contributors') {
          console.log(`⏭️ تخطي ${key} - ليس من حقول التبويب ${currentTab}`);
          return;
        }
        
        const newValue = updatedData[key];
        const oldValue = currentSong.value[key];
        
        // التحقق مما إذا كانت القيمة قد تغيرت
        const isValueChanged = JSON.stringify(newValue) !== JSON.stringify(oldValue);
        
        if (isValueChanged) {
          // التأكد من عدم إرسال null
          if (newValue === null) {
            console.log(`⏭️ تخطي ${key} بقيمة null`);
            return;
          }
          
          payload[key] = newValue;
          hasChanges = true;
          console.log(`🔄 تغيير في ${key}:`, { قديم: oldValue ? 'موجود' : 'فارغ', جديد: 'موجود' });
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
      
      // تحديث البيانات المحلية
      if (response.data.data) {
        Object.assign(currentSong.value, response.data.data);
        
        // ===== تحديث عنوان الأغنية في الـ store =====
        if (payload.title || response.data.data.title) {
          const newTitle = payload.title || response.data.data.title;
          releaseStore.setCurrentSongTitle(newTitle);
          console.log('🎵 تحديث عنوان الأغنية في store من payload:', newTitle);
        }
        // ==========================================
      }
    }
    
    // تحديث tracks أيضاً
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
    
    // إذا كنا نحذف الأغنية الحالية، ارجع للقائمة
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
    
    // ===== تحديث عنوان الأغنية في الـ store =====
    if (songData.title) {
      releaseStore.setCurrentSongTitle(songData.title);
      console.log('🎵 تحديث عنوان الأغنية في store من fetchSongDirectly:', songData.title);
    }
    // ==========================================
    
    console.log('✅ تم جلب الأغنية مباشرة من الخادم');

    // أضف الأغنية إلى tracks إذا لم تكن موجودة
    if (!tracks.value.find(t => t.uuid === songUuid)) {
      tracks.value.push({ ...songData });
    }

    // التبديل إلى عرض infos
    currentView.value = 'infos';
    isInSubLayout.value = true;
    forceInfosView.value = true;

    emit('enter-sub-layout');
    emit('update:topLineImage', '/icons/top-line/x.svg');
    
    logState();

  } catch (err) {
    console.error('❌ فشل جلب الأغنية مباشرة:', err);
  }
};

// تعديل دالة handleBackFromInfos لمسح URL
const handleBackFromInfos = () => {
  console.log('🔙 العودة من Infos');
  
  // مسح songUuid من URL
  clearSongUuidFromUrl();
  
  // مسح من store
  releaseStore.clearSongUuid();
  
  currentView.value = 'main';
  forceInfosView.value = false;
  isInSubLayout.value = false;
  currentSong.value = null;
  emit('exit-sub-layout');
  emit('update:topLineImage', null);
  emit('back');
  
  logState();
};

// دالة جديدة للعودة إلى Tracklist من PreRelease
const handleBackToTracklist = () => {
  console.log('🔄 Upload2Component: استقبال حدث back-to-tracklist، العودة إلى FirstSection');
  
  // مسح songUuid من URL
  clearSongUuidFromUrl();
  
  // مسح من store
  releaseStore.clearSongUuid();
  
  // العودة إلى FirstSection
  currentView.value = 'firstSection';
  isInSubLayout.value = false;
  forceInfosView.value = false;
  currentSong.value = null;
  
  emit('exit-sub-layout');
  emit('update:topLineImage', null);
  
  logState();
};

const forceReturnToMain = () => {
  // مسح songUuid من URL
  clearSongUuidFromUrl();
  releaseStore.clearSongUuid();
  
  currentView.value = 'main';
  forceInfosView.value = false;
  isInSubLayout.value = false;
  currentSong.value = null;
  emit('exit-sub-layout');
  emit('update:topLineImage', null);
};

const handleEnterSubLayout = () => {
  isInSubLayout.value = true;
  emit('enter-sub-layout');
};

const handleExitSubLayout = () => {
  isInSubLayout.value = false;
  emit('exit-sub-layout');
};

// مراقبة تغيرات route.query.song
watch(
  () => route.query.song,
  async (newSongUuid) => {
    if (newSongUuid && props.releaseUuid && props.currentStep === 3) {
      // التحقق من أن songUuid مختلف عن releaseUuid
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
      // إذا تم مسح songUuid من URL ونحن في عرض infos
      handleBackFromInfos();
    }
  },
  { immediate: true }
);

// مراقبة forceInfosView
watch(() => props.forceInfosView, (newVal) => {
  console.log('🔄 props.forceInfosView تغير:', newVal);
  if (newVal && tracks.value.length > 0) {
    editSong(tracks.value[0].uuid);
  }
}, { immediate: true });

onUnmounted(() => {
  window.removeEventListener('force-edit-song', handleForceEditSong);
});

const handleCardClick = (index) => {
  selectedCardIndex.value = index;
  if (index === 0) {
    // الكارد الأول ينتقل مباشرة بدون إيميل
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
    
    // تحديث القيمة محلياً
    audioQuality.value = quality;
    
  } catch (err) {
    console.error('❌ فشل تحديث جودة الصوت:', err.response?.data || err.message);
  }
};

const handleNext = (cardIndex) => {
  selectedCardIndex.value = cardIndex;
  const quality = audioQualityMap[cardIndex];
  
  // التحقق من صحة الإيميل للكارد الثاني والثالث
  if (cardIndex > 0 && !formFields[cardIndex].isValid) {
    console.warn('⚠️ يجب إدخال إيميل صحيح للمتابعة');
    return;
  }

  // تحديث جودة الصوت في الـ API
  updateAudioQuality(quality);

  // الانتقال إلى FirstSection
  currentView.value = 'firstSection';
  const imageMap = {
    0: '/icons/top-line/lossless.png',
    1: '/icons/top-line/card2-image.png',
    2: '/icons/top-line/card3-image.png',
  };
  emit('update:topLineImage', imageMap[cardIndex]);
};

const handleBackClick = () => {
  currentView.value = 'main';
  selectedCardIndex.value = null;
  emit('update:topLineImage', null);
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
  // استخدام إيميل وهمي للتجربة
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  formFields[cardIndex].isValid = emailRegex.test(email);
  
  // للتجربة، يمكنك استخدام إيميل وهمي
  if (email === 'test@example.com' || email === 'demo@test.com') {
    formFields[cardIndex].isValid = true;
  }
};
</script>

<style lang="scss" scoped>
.component-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.debug-overlay {
  position: fixed;
  top: 10px;
  left: 10px;
  background: rgba(0, 0, 0, 0.85);
  color: #fff;
  padding: 10px;
  border-radius: 5px;
  font-size: 12px;
  z-index: 10000;
  max-width: 300px;
  border: 1px solid #DE1456;
}

.debug-overlay div {
  margin: 2px 0;
  font-family: monospace;
}

.debug-overlay strong {
  color: #DE1456;
}

.debug-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 40px;
  text-align: center;
  background: rgba(27, 28, 32, 0.9);
  border-radius: 10px;
}

.debug-message {
  color: #ff6b6b;
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 20px;
}

.debug-details {
  color: #aaa;
  font-size: 14px;
  margin: 5px 0;
  font-family: monospace;
  background: rgba(0, 0, 0, 0.3);
  padding: 5px 10px;
  border-radius: 4px;
}

.debug-button {
  margin-top: 20px;
  padding: 10px 20px;
  background: #DE1456;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-family: Heebo;
  font-size: 14px;
  transition: background 0.3s;
}

.debug-button:hover {
  background: #c0124b;
}

.content {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 40px;
  flex: 1 0 0;
  align-self: stretch;
  padding-top: 100px;
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

  &:hover {
    background: var(--dark-red);
  }
}

.Form .btn-primary.active {
  background: var(--Strawberry);

  &:hover {
    background: var(--dark-red);
  }
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