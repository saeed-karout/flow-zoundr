<template>
  <div class="tab-content">
    <div class="card-upload-single-cover" :class="{ 
      'active-opacity': isPreReleaseActive,
      'has-image': uploadedImage && !isUploading,
      'drag-over': isDragging 
    }">
      <!-- Upload area that covers the entire card -->
      <div class="upload-full-area">
        <label for="cover-upload" class="upload-label" aria-label="Upload cover image"
          @dragover.prevent="handleDragOver" @dragenter.prevent="handleDragEnter" @dragleave.prevent="handleDragLeave"
          @drop.prevent="handleDrop" :class="{ 'drag-over': isDragging }" :disabled="!isPreReleaseActive">
          
          <!-- Uploaded image covering the entire card -->
          <div v-if="uploadedImage && !isUploading" class="uploaded-image-container">
            <img 
              :src="uploadedImage" 
              alt="Uploaded Cover" 
              class="uploaded-image-full"
              @error="handleImageError"
            />
          </div>
          
          <!-- Default content when no image -->
          <div v-if="!isUploading && !uploadedImage" class="default-upload-content">
            <span class="file-icon"></span>
          </div>
          
          <!-- Progress during upload -->
          <div v-if="isUploading" class="progress-overlay">
            <div class="progress-container">
              <div class="progress-wrapper">
                <CircleProgress :percent="fileProgress" :size="circleSize" :border-width="borderWidth" :border-bg-width="7"
                  fill-color="#DE1456" empty-color="#4B5563" :show-percent="false" background="#26282D" />
                <span class="progress-text">
                  {{ fileProgress }}%
                </span>
              </div>
            </div>
          </div>
          
          <!-- Error message -->
          <div v-if="errorMessage && !isUploading" class="error-message">
            {{ errorMessage }}
          </div>
        </label>
        <input id="cover-upload" type="file" :accept="allowedFileTypes.join(',')" class="hidden-input"
          @change="handleFileUpload" :disabled="!isPreReleaseActive" ref="fileInput" />
      </div>

      <!-- Text content that appears over the image - HIDDEN WHEN IMAGE IS UPLOADED -->
      <div class="text-content-overlay" v-if="!isUploading && !uploadedImage">
        <div class="text1">
          <span>Cover Upload per Drag & Drop</span>
          <div class="text-link-bold">
            ODER <span @click="triggerFileInput" :class="{ 'disabled': !isPreReleaseActive }">suche deine Datei.</span>
          </div>
        </div>

        <div class="text2">
          <span>Du hast (noch) kein Cover für diese Single?</span>
          <div class="text-link">
            <span>Coverbild des Albums übernehmen</span>
          </div>
        </div>
      </div>
    </div>

    <div class="column2">
      <div class="preRelease-info">
        <div class="top-line">
          <span>Du möchtest diesen Song Pre-releasen?</span>
          <div class="btn-switch" :class="{ active: isPreReleaseActive }" @click="togglePreRelease">
            <img src="/icon/circle.svg" class="circle" alt="circle image" />
          </div>
        </div>

        <div class="infos" :class="{ 'active-opacity': isPreReleaseActive }">
          <div class="headline">
            <div class="title" :class="{ 'active-text': isPreReleaseActive }">
              {{ artistName }}
            </div>
            <div class="subtitle" :class="{ 'active-text': isPreReleaseActive }">
              {{ songTitle }}
            </div>
          </div>

          <div class="Form">
            <div class="top-line" style="gap: 16px;">
              <span>Soll der gesamte Release mit dieser Single vorbestellbar sein?</span>
              <div class="btn-switch" :class="{ active: isPreOrderActive }" @click="togglePreOrder">
                <img src="/icon/circle.svg" class="circle" alt="circle image" />
              </div>
            </div>

            <div class="form">
              <span>Release Date for this single</span>
              <div class="section-input"
                :class="{ 
                  'is-hovered': isHoveredReleaseDate, 
                  'is-focused': isInputFocusedReleaseDate, 
                  'has-checkmark': isReleaseDateSelected 
                }"
                @mouseenter="isHoveredReleaseDate = true"
                @mouseleave="isHoveredReleaseDate = false"
              >
                <input 
                  type="text" 
                  class="input-field" 
                  :value="selectedReleaseDate" 
                  readonly
                  @focus="openCalendar"
                  :placeholder="dynamicPlaceholder"
                  :disabled="!isPreReleaseActive"
                />
                <div v-if="isReleaseDateSelected" class="checkmark">
                  <img src="../../../assets/icons/y.png" class="icon-y" alt="checkmark icon" />
                </div>
                <!-- ✅ spacer يظهر فقط عند التمرير -->
                <div class="spacer" @click="openCalendar">
                  <div class="play" :class="{ visible: isHoveredReleaseDate || isInputFocusedReleaseDate }">
                    <img :src="iconPlay" class="icon" alt="image icon" />
                  </div>
                </div>
                <img 
                  src="/icon/play-dark.svg" 
                  v-if="isCalendarVisibleReleaseDate" 
                  class="play-dark"
                  alt="image play dark for calendar" 
                />
                <CalendarPicker 
                  v-if="isCalendarVisibleReleaseDate" 
                  class="calendar-picker" 
                  @select="updateReleaseDate($event)" 
                  @close="closeCalendar"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
  <div class="btn-right" 
     :class="{
       'active': canGoToTracklist,
       'inactive': !canGoToTracklist
     }"
     @click="GotoFirstSection">
     Zur Tracklist
   </div>

  <!-- ✅ Popup للتحذير من التاريخ القريب (خاص بـ Pre-Release) -->
  <PreReleasePopup 
    :showPopup="showPreReleasePopup"
    :selectedDate="popupSelectedDate"
    :daysDifference="popupDaysDifference"
    @update-date="handlePopupUpdateDate"
    @close="handlePopupClose"
  />
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, defineProps, nextTick, computed } from 'vue';
import CalendarPicker from '@/components/CalendarPicker.vue';
import CircleProgress from 'vue3-circle-progress';
import iconPlay from '@/assets/icons/play.png';
import { storage_url } from '@/constants';
import PreReleasePopup from '@/components/modals/PreReleasePopup.vue'; // ✅ استيراد البوب اب الجديد


const props = defineProps({
  currentSong: {
    type: Object,
    default: () => ({})
  },
  formData: {
    type: Object,
    default: () => ({})
  },
  activeTab: {
    type: String,
    default: 'pre-release'
  },
  releaseArtists: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits([
  'update:form-data',
  'save-song',
  'openVideoPopup',
  'next',
  'enter-sub-layout',
  'exit-sub-layout',
  'back-to-tracklist'
]);

// ========== متغير حالة المكون ==========
const isMounted = ref(false);

// ──── حالة حفظ البيانات ────
const isSaving = ref(false);
const saveQueue = ref([]);

// ──── Data initialization ────
const isPreReleaseActive = ref(false);
const isPreOrderActive = ref(false);
const uploadedImage = ref(null);
const uploadedImageBase64 = ref(null);
const selectedReleaseDate = ref('');
const isReleaseDateSelected = ref(false);

// Store previous values for comparison
const previousValues = ref({
  prerelease: 0,
  pre_order: 0,
  cover: null,
  release_date: null
});

// State for release date input
const isHoveredReleaseDate = ref(false);
const isInputFocusedReleaseDate = ref(false);
const isCalendarVisibleReleaseDate = ref(false);

// State for image upload
const file = ref(null);
const fileProgress = ref(0);
const isUploading = ref(false);
const isDragging = ref(false);
const circleSize = ref(352);
const borderWidth = ref(12);
const allowedFileTypes = ['image/jpeg', 'image/png', 'image/jpg'];
const fileInput = ref(null);
const errorMessage = ref('');

const uploadedFileData = ref(null);

// ========== 🔥 متغيرات البوب اب ==========
const showPreReleasePopup = ref(false);
const popupSelectedDate = ref('');
const popupDaysDifference = ref(0);

// ========== 🔥 حساب التاريخ الموصى به (الجمعة القادمة بعد 7 أيام من اليوم) ==========
const computeRecommendedDate = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // إضافة 7 أيام
  const targetDate = new Date(today);
  targetDate.setDate(targetDate.getDate() + 7);
  
  // الانتقال إلى يوم الجمعة التالي (5 = Friday)
  const currentDay = targetDate.getDay();
  let daysToAdd = 0;
  
  if (currentDay <= 5) {
    daysToAdd = 5 - currentDay;
  } else {
    daysToAdd = (5 - currentDay) + 7;
  }
  
  targetDate.setDate(targetDate.getDate() + daysToAdd);
  
  return targetDate;
};

// ========== 🔥 Placeholder الديناميكي ==========
const dynamicPlaceholder = computed(() => {
  if (!isPreReleaseActive.value) return 'DD.MM.YYYY';
  
  const recommendedDate = computeRecommendedDate();
  const day = String(recommendedDate.getDate()).padStart(2, '0');
  const month = String(recommendedDate.getMonth() + 1).padStart(2, '0');
  const year = recommendedDate.getFullYear();
  
  return `${day}.${month}.${year}`;
});

// ========== 🔥 Computed Properties ==========
const artistName = computed(() => {
  if (props.releaseArtists && props.releaseArtists.length > 0) {
    const artistName = props.releaseArtists[0];
    if (typeof artistName === 'string') {
      return artistName;
    }
    if (typeof artistName === 'object' && artistName.name) {
      return artistName.name;
    }
    return String(artistName) || 'artist name';
  }
  
  if (props.currentSong?.contributors?.artist && 
      Array.isArray(props.currentSong.contributors.artist) && 
      props.currentSong.contributors.artist.length > 0) {
    const artist = props.currentSong.contributors.artist[0];
    return artist?.name || 'artist name';
  }
  
  if (props.currentSong?.artists && 
      Array.isArray(props.currentSong.artists) && 
      props.currentSong.artists.length > 0) {
    const artist = props.currentSong.artists[0];
    if (typeof artist === 'string') {
      return artist;
    }
    if (typeof artist === 'object' && artist.name) {
      return artist.name;
    }
    return String(artist) || 'artist name';
  }
  
  return 'artist name';
});

const songTitle = computed(() => {
  if (props.currentSong?.title) {
    return props.currentSong.title;
  }
  
  if (props.formData?.title) {
    return props.formData.title;
  }
  
  return 'song title';
});

// ========== 🔥 دالة التحقق من التاريخ وإظهار البوب اب ==========
const checkAndShowPopup = (dateString) => {
  if (!dateString) return false;
  
  // تحويل التاريخ المختار إلى كائن Date
  let selectedDate;
  if (dateString.includes('.')) {
    const parts = dateString.split('.');
    selectedDate = new Date(parts[2], parts[1] - 1, parts[0]);
  } else if (dateString.includes('/')) {
    const parts = dateString.split('/');
    selectedDate = new Date(parts[2], parts[1] - 1, parts[0]);
  } else {
    selectedDate = new Date(dateString);
  }
  
  if (isNaN(selectedDate.getTime())) return false;
  
  // حساب الفرق بين اليوم والتاريخ المختار
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  selectedDate.setHours(0, 0, 0, 0);
  
  const diffTime = selectedDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  console.log('📅 [PreReleaseContent] الفرق بين اليوم والتاريخ المختار:', diffDays, 'يوم');
  
  // ✅ إذا كان الفرق أقل من 7 أيام، نظهر البوب اب
  if (diffDays < 7 && diffDays >= 0) {
    popupSelectedDate.value = dateString;
    popupDaysDifference.value = diffDays;
    showPreReleasePopup.value = true;
    console.log('🔥 [PreReleaseContent] إظهار البوب اب - التاريخ قريب جداً!');
    return true;
  }
  
  return false;
};

// ========== 🔥 تحديث التاريخ من البوب اب ==========
const handlePopupUpdateDate = (newDate) => {
  console.log('📅 [PreReleaseContent] تحديث التاريخ من البوب اب إلى:', newDate);
  selectedReleaseDate.value = newDate;
  isReleaseDateSelected.value = true;
  showPreReleasePopup.value = false;
  
  // حفظ التغيير
  sendUpdate();
  
  setTimeout(() => {
    emitTabCompletion();
  }, 300);
};

// ========== 🔥 إغلاق البوب اب ==========
const handlePopupClose = () => {
  console.log('🔄 [PreReleaseContent] إغلاق البوب اب');
  showPreReleasePopup.value = false;
};

// ========== 🔥 دالة إغلاق الكالندر عند النقر خارجها ==========
const handleClickOutside = (event) => {
  if (!isCalendarVisibleReleaseDate.value) return;
  
  const calendarElement = document.querySelector('.calendar-picker');
  const inputElement = document.querySelector('.section-input .input-field');
  const spacerElement = document.querySelector('.section-input .spacer');
  const playDarkElement = document.querySelector('.section-input .play-dark');
  
  const isClickOnCalendar = calendarElement && calendarElement.contains(event.target);
  const isClickOnInput = inputElement && inputElement.contains(event.target);
  const isClickOnSpacer = spacerElement && spacerElement.contains(event.target);
  const isClickOnPlayDark = playDarkElement && playDarkElement.contains(event.target);
  
  if (!isClickOnCalendar && !isClickOnInput && !isClickOnSpacer && !isClickOnPlayDark) {
    closeCalendar();
  }
};

// ========== 🔥 دوال فتح وإغلاق الكالندر ==========
const openCalendar = () => {
  if (!isPreReleaseActive.value) return;
  isInputFocusedReleaseDate.value = true;
  isCalendarVisibleReleaseDate.value = true;
};

const closeCalendar = () => {
  isCalendarVisibleReleaseDate.value = false;
  isInputFocusedReleaseDate.value = false;
};

// ========== مراقبة التغييرات ==========
watch(() => props.currentSong, (newSong, oldSong) => {
  console.log('🔄 PreReleaseContent: currentSong changed', {
    oldTitle: oldSong?.title,
    newTitle: newSong?.title,
    uuid: newSong?.uuid
  });
  
  if (!isMounted.value) return;
  if (newSong?.uuid) {
    nextTick(() => {
      updateFromProps();
    });
  }
}, { deep: true, immediate: true });

watch(() => props.releaseArtists, (newArtists) => {
  console.log('🔄 PreReleaseContent: releaseArtists changed', newArtists);
}, { deep: true });

watch(() => props.formData, (newFormData) => {
  console.log('🔄 PreReleaseContent: formData changed', newFormData?.title);
}, { deep: true });

// ──── دالة معالجة قائمة الانتظار ────
const processSaveQueue = () => {
  if (!isMounted.value) {
    console.warn('⚠️ PreReleaseContent: المكون تم تدميره، تخطي معالجة قائمة الانتظار');
    return;
  }
  
  if (saveQueue.value.length === 0) {
    isSaving.value = false;
    console.log('✅ PreReleaseContent: جميع التغييرات تم حفظها');
    return;
  }
  
  const latestSave = saveQueue.value.pop();
  console.log(`📦 PreReleaseContent: معالجة أحدث عنصر من قائمة الانتظار (${saveQueue.value.length} متبقي)`);
  saveQueue.value = [];
  
  const payload = {};
  let hasChanges = false;
  
  if (latestSave.prerelease !== undefined && latestSave.prerelease !== previousValues.value.prerelease) {
    payload['prerelease'] = latestSave.prerelease;
    hasChanges = true;
  }
  
  if (latestSave.pre_order !== undefined && latestSave.pre_order !== previousValues.value.pre_order) {
    payload['pre_order'] = latestSave.pre_order;
    hasChanges = true;
  }
  
  if (latestSave.cover !== undefined && latestSave.cover !== previousValues.value.cover) {
    payload['cover'] = latestSave.cover;
    hasChanges = true;
  }
  
  if (latestSave.release_date !== undefined && latestSave.release_date !== previousValues.value.release_date) {
    payload['release_date'] = latestSave.release_date;
    hasChanges = true;
  }
  
  if (!hasChanges) {
    console.log('ℹ️ PreReleaseContent: لا توجد تغييرات في قائمة الانتظار');
    isSaving.value = false;
    return;
  }
  
  console.log('📤 PreReleaseContent: إرسال التغييرات من قائمة الانتظار:', payload);
  
  previousValues.value = {
    prerelease: latestSave.prerelease !== undefined ? latestSave.prerelease : previousValues.value.prerelease,
    pre_order: latestSave.pre_order !== undefined ? latestSave.pre_order : previousValues.value.pre_order,
    cover: latestSave.cover !== undefined ? latestSave.cover : previousValues.value.cover,
    release_date: latestSave.release_date !== undefined ? latestSave.release_date : previousValues.value.release_date
  };
  
  isSaving.value = true;
  emit('save-song', payload);
};

const handleSaveComplete = (event) => {
  if (!isMounted.value) {
    console.warn('⚠️ PreReleaseContent: المكون تم تدميره، تخطي معالجة نجاح الحفظ');
    return;
  }
  
  const { success, songUuid, error, data } = event.detail || {};
  
  if (success) {
    console.log('✅ PreReleaseContent: تم استلام إشارة نجاح الحفظ للأغنية:', songUuid);
    
    if (data?.cover) {
      console.log('🖼️ PreReleaseContent: تحديث الصورة من استجابة الخادم:', data.cover);
      const fullCoverUrl = `${storage_url}/${data.cover}`;
      uploadedImage.value = fullCoverUrl;
      uploadedImageBase64.value = fullCoverUrl;
      previousValues.value.cover = data.cover;
      uploadedFileData.value = null;
      
      setTimeout(() => {
        emitTabCompletion();
      }, 300);
    }
    
    if (data?.release_date) {
      console.log('📅 PreReleaseContent: تحديث release_date من استجابة الخادم:', data.release_date);
      const newDate = formatDateForDisplay(data.release_date);
      if (newDate !== selectedReleaseDate.value) {
        selectedReleaseDate.value = newDate;
        isReleaseDateSelected.value = true;
        previousValues.value.release_date = data.release_date;
        
        setTimeout(() => {
          emitTabCompletion();
        }, 300);
      }
    }
    
    setTimeout(() => {
      emitTabCompletion();
    }, 300);
    
  } else {
    console.warn('⚠️ PreReleaseContent: فشل الحفظ:', error);
  }
  
  isSaving.value = false;
  
  setTimeout(() => {
    if (!isMounted.value) {
      console.warn('⚠️ PreReleaseContent: المكون تم تدميره أثناء معالجة قائمة الانتظار');
      return;
    }
    
    if (saveQueue.value.length > 0) {
      console.log(`📦 PreReleaseContent: معالجة ${saveQueue.value.length} عناصر في قائمة الانتظار`);
      processSaveQueue();
    } else {
      console.log('✅ PreReleaseContent: قائمة الانتظار فارغة');
    }
  }, 200);
};

const updateFromProps = () => {
  if (!isMounted.value) {
    console.warn('⚠️ PreReleaseContent: المكون تم تدميره، تخطي تحديث البيانات');
    return;
  }
  
  if (!props.currentSong?.uuid) return;
  
  console.log('🔄 PreReleaseContent: Updating from currentSong', {
    uuid: props.currentSong.uuid,
    prerelease: props.currentSong.prerelease,
    pre_order: props.currentSong.pre_order,
    hasCover: !!props.currentSong.cover,
    cover: props.currentSong.cover,
    release_date: props.currentSong.release_date
  });
  
  if (props.currentSong.prerelease !== undefined) {
    const newPreReleaseActive = props.currentSong.prerelease === 1 || props.currentSong.prerelease === true;
    if (newPreReleaseActive !== isPreReleaseActive.value) {
      console.log('📥 PreReleaseContent: Updating isPreReleaseActive to', newPreReleaseActive);
      isPreReleaseActive.value = newPreReleaseActive;
      previousValues.value.prerelease = newPreReleaseActive ? 1 : 0;
    }
  }
  
  if (props.currentSong.pre_order !== undefined) {
    const newPreOrderActive = props.currentSong.pre_order === 1 || props.currentSong.pre_order === true;
    if (newPreOrderActive !== isPreOrderActive.value) {
      console.log('📥 PreReleaseContent: Updating isPreOrderActive to', newPreOrderActive);
      isPreOrderActive.value = newPreOrderActive;
      previousValues.value.pre_order = newPreOrderActive ? 1 : 0;
    }
  }
  
  if (props.currentSong.release_date) {
    const newDate = formatDateForDisplay(props.currentSong.release_date);
    if (newDate !== selectedReleaseDate.value) {
      selectedReleaseDate.value = newDate;
      isReleaseDateSelected.value = true;
      previousValues.value.release_date = props.currentSong.release_date;
    }
  } else {
    selectedReleaseDate.value = '';
    isReleaseDateSelected.value = false;
    previousValues.value.release_date = null;
  }
  
  if (props.currentSong.cover) {
    let fullCoverUrl = props.currentSong.cover;
    if (!fullCoverUrl.startsWith('http://') && !fullCoverUrl.startsWith('https://')) {
      fullCoverUrl = `${storage_url}/${fullCoverUrl}`;
    }
    if (fullCoverUrl !== uploadedImage.value) {
      console.log('🖼️ PreReleaseContent: تحديث الصورة من currentSong:', fullCoverUrl);
      uploadedImage.value = fullCoverUrl;
      uploadedImageBase64.value = fullCoverUrl;
      previousValues.value.cover = props.currentSong.cover;
    }
  }
  
  setTimeout(() => {
    emitTabCompletion();
  }, 300);
};

// ──── Format date from YYYY-MM-DD to DD.MM.YYYY for display ────
const formatDateForDisplay = (dateString) => {
  if (!dateString) return '';
  
  try {
    if (dateString.includes('T')) {
      dateString = dateString.split('T')[0];
    }
    
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      const [year, month, day] = dateString.split('-');
      return `${day}.${month}.${year}`;
    }
    
    return dateString;
  } catch (error) {
    console.error('❌ Error formatting date for display:', error);
    return '';
  }
};

// ──── Format date from DD.MM.YYYY to YYYY-MM-DD for API ────
const formatDateForAPI = (dateString) => {
  if (!dateString) return null;
  
  try {
    if (dateString.includes('.')) {
      const parts = dateString.split('.');
      if (parts.length === 3) {
        const day = parts[0].padStart(2, '0');
        const month = parts[1].padStart(2, '0');
        let year = parts[2];
        
        if (year.length === 2) {
          const currentYear = new Date().getFullYear();
          const currentCentury = Math.floor(currentYear / 100) * 100;
          const yearNum = parseInt(year, 10);
          year = (currentCentury + yearNum).toString();
        }
        
        return `${year}-${month}-${day}`;
      }
    }
    
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }
    
    return null;
  } catch (error) {
    console.error('❌ Error formatting date for API:', error);
    return null;
  }
};

// ──── Read image as Base64 ────
const readImageAsBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = reader.result.split(',')[1];
      resolve(base64String);
    };
    reader.onerror = (error) => reject(error);
  });
};

// ──── Send updates - sends only changed values ────
const sendUpdate = () => {
  if (!isMounted.value) {
    console.warn('⚠️ PreReleaseContent: المكون تم تدميره، تخطي إرسال التحديث');
    return;
  }
  
  if (!props.currentSong?.uuid) {
    console.warn('⚠️ PreReleaseContent: No song UUID');
    return;
  }
  
  if (isSaving.value) {
    console.log('⏳ PreReleaseContent: حفظ قيد التنفيذ، إضافة إلى قائمة الانتظار');
    
    const dataToSave = {
      prerelease: isPreReleaseActive.value ? 1 : 0,
      pre_order: isPreReleaseActive.value ? (isPreOrderActive.value ? 1 : 0) : null,
      cover: isPreReleaseActive.value ? uploadedFileData.value : null,
      release_date: isPreReleaseActive.value ? formatDateForAPI(selectedReleaseDate.value) : null
    };
    
    const isDuplicate = saveQueue.value.some(item => 
      JSON.stringify(item) === JSON.stringify(dataToSave)
    );
    
    if (!isDuplicate) {
      saveQueue.value.push(dataToSave);
      console.log(`📦 PreReleaseContent: تم إضافة عنصر إلى قائمة الانتظار (${saveQueue.value.length} عناصر)`);
    }
    return;
  }
  
  const apiFormattedDate = formatDateForAPI(selectedReleaseDate.value);
  const payload = {};
  let hasChanges = false;
  
  const prereleaseValue = isPreReleaseActive.value ? 1 : 0;
  if (prereleaseValue !== previousValues.value.prerelease) {
    payload['prerelease'] = prereleaseValue;
    console.log('🔄 Change in prerelease:', { 
      old: previousValues.value.prerelease, 
      new: prereleaseValue 
    });
    hasChanges = true;
    
    if (prereleaseValue === 0) {
      payload['pre_order'] = null;
      payload['cover'] = null;
      payload['release_date'] = null;
      
      previousValues.value.pre_order = null;
      previousValues.value.cover = null;
      previousValues.value.release_date = null;
      
      isPreOrderActive.value = false;
      uploadedImageBase64.value = null;
      uploadedImage.value = null;
      uploadedFileData.value = null;
      selectedReleaseDate.value = '';
      isReleaseDateSelected.value = false;
      
      hasChanges = true;
    }
  }
  
  if (isPreReleaseActive.value) {
    const preOrderValue = isPreOrderActive.value ? 1 : 0;
    if (preOrderValue !== previousValues.value.pre_order) {
      payload['pre_order'] = preOrderValue;
      console.log('🔄 Change in pre_order:', { 
        old: previousValues.value.pre_order, 
        new: preOrderValue 
      });
      hasChanges = true;
    }
    
    const hasNewFile = uploadedFileData.value && 
                       (!previousValues.value.cover || 
                        (previousValues.value.cover && uploadedFileData.value !== previousValues.value.cover));
    
    if (hasNewFile) {
      payload['cover'] = uploadedFileData.value;
      console.log('🔄 Change in cover: new file uploaded', {
        fileName: uploadedFileData.value.name,
        fileType: uploadedFileData.value.type,
        fileSize: uploadedFileData.value.size
      });
      hasChanges = true;
    }
    
    if (apiFormattedDate !== previousValues.value.release_date) {
      payload['release_date'] = apiFormattedDate;
      console.log('🔄 Change in release_date:', { 
        old: previousValues.value.release_date, 
        new: apiFormattedDate 
      });
      hasChanges = true;
    }
  }
  
  if (!hasChanges) {
    console.log('ℹ️ PreReleaseContent: No changes');
    isSaving.value = false;
    return;
  }
  
  console.log('📤 PreReleaseContent: Sending changes only:', payload);
  
  previousValues.value = {
    prerelease: prereleaseValue,
    pre_order: isPreReleaseActive.value ? (isPreOrderActive.value ? 1 : 0) : null,
    cover: isPreReleaseActive.value ? uploadedFileData.value : null,
    release_date: isPreReleaseActive.value ? apiFormattedDate : null
  };
  
  isSaving.value = true;
  emit('save-song', payload);
};

// ──── معالجة خطأ تحميل الصورة ────
const handleImageError = (event) => {
  console.error('❌ PreReleaseContent: فشل تحميل الصورة:', event.target.src);
  const img = event.target;
  const currentSrc = img.src;
  
  if (currentSrc.includes('storage/storage/')) {
    const fixedSrc = currentSrc.replace('storage/storage/', 'storage/');
    console.log('🔄 محاولة إصلاح المسار:', fixedSrc);
    img.src = fixedSrc;
    return;
  }
  
  if (currentSrc.includes('//storage/')) {
    const fixedSrc = currentSrc.replace('//storage/', '/storage/');
    console.log('🔄 محاولة إصلاح المسار:', fixedSrc);
    img.src = fixedSrc;
    return;
  }
  
  img.src = '/img/bgCardSongs/card1.png';
};

// ──── Toggle functions ────
const togglePreRelease = () => {
  if (!isMounted.value) return;
  
  const newValue = !isPreReleaseActive.value;
  console.log('🔄 PreReleaseContent: Toggling PreRelease to', newValue);
  isPreReleaseActive.value = newValue;
  
  if (!newValue) {
    isPreOrderActive.value = false;
    uploadedImageBase64.value = null;
    uploadedImage.value = null;
    uploadedFileData.value = null;
    selectedReleaseDate.value = '';
    isReleaseDateSelected.value = false;
    console.log('🔄 PreReleaseContent: Reset values due to deactivation');
    closeCalendar();
  }
  
  sendUpdate();
  
  setTimeout(() => {
    emitTabCompletion();
  }, 300);
};

const togglePreOrder = () => {
  if (!isMounted.value) return;
  
  const newValue = !isPreOrderActive.value;
  console.log('🔄 PreReleaseContent: Toggling PreOrder to', newValue);
  isPreOrderActive.value = newValue;
  sendUpdate();
  
  setTimeout(() => {
    emitTabCompletion();
  }, 300);
};

// ──── Update release date ────
const updateReleaseDate = (displayDate) => {
  if (!isMounted.value) return;
  if (!isPreReleaseActive.value) return;
  
  // ✅ التحقق من التاريخ وإظهار البوب اب إذا لزم الأمر
  const showPopup = checkAndShowPopup(displayDate);
  
  if (showPopup) {
    // ✅ نعرض البوب اب ونحتفظ بالتاريخ المختار
    console.log('📅 [PreReleaseContent] تاريخ مختار قريب جداً، إظهار البوب اب');
    // لا نغلق الكالندر حتى يتمكن المستخدم من الرؤية
    return;
  }
  
  // ✅ إذا لم يكن التاريخ قريباً، نستمر كالمعتاد
  selectedReleaseDate.value = displayDate;
  isReleaseDateSelected.value = true;
  closeCalendar();
  
  console.log('📅 PreReleaseContent: Release date selected:', {
    display: displayDate,
    apiFormat: formatDateForAPI(displayDate)
  });
  
  sendUpdate();
  
  setTimeout(() => {
    emitTabCompletion();
  }, 300);
};

// ──── Handle image upload ────
const triggerFileInput = () => {
  if (!isMounted.value) return;
  if (!isPreReleaseActive.value) return;
  if (fileInput.value) {
    fileInput.value.click();
  }
};

const handleFileUpload = async (event) => {
  if (!isMounted.value) return;
  if (!isPreReleaseActive.value) return;
  
  const uploadedFile = event.target.files[0] || event.dataTransfer.files[0];
  if (!uploadedFile) {
    errorMessage.value = 'No file selected.';
    return;
  }

  if (!allowedFileTypes.includes(uploadedFile.type)) {
    errorMessage.value = 'Please upload a JPEG or PNG file.';
    return;
  }

  if (uploadedFile.size > 10 * 1024 * 1024) {
    errorMessage.value = 'File exceeds maximum size of 10 MB.';
    return;
  }

  errorMessage.value = '';
  file.value = {
    id: Date.now(),
    name: uploadedFile.name,
    file: uploadedFile,
    status: 'uploading',
    progress: 0,
  };
  fileProgress.value = 0;
  isUploading.value = true;
  
  await uploadFile(file.value);
};

// ──── Upload file with progress simulation ────
const uploadFile = async (fileObj) => {
  try {
    const fileSize = fileObj.file.size;
    const fileSizeMB = (fileSize / 1024 / 1024).toFixed(2);
    
    const estimatedTimeMs = Math.min(6000, Math.max(1500, fileSize / 800));
    const updateInterval = 100;
    const totalSteps = estimatedTimeMs / updateInterval;
    const baseProgressPerStep = 100 / totalSteps;
    
    console.log(`📊 بدء رفع الملف: ${fileSizeMB} MB, الوقت المقدر: ${(estimatedTimeMs / 1000).toFixed(1)} ثانية`);
    
    let progress = 0;
    fileObj.progress = 0;
    fileProgress.value = 0;
    
    const interval = setInterval(() => {
      const varianceFactor = Math.min(1.5, Math.max(0.5, 1 / (fileSize / 500000)));
      const randomIncrement = (baseProgressPerStep * (0.5 + Math.random())) * varianceFactor;
      
      progress += randomIncrement;
      
      if (progress >= 95) {
        progress = 95;
      }
      
      fileObj.progress = Math.min(95, Math.round(progress));
      fileProgress.value = fileObj.progress;
      
      if (fileProgress.value % 10 === 0 || fileProgress.value === 5 || fileProgress.value === 15) {
        console.log(`📤 تقدم الرفع: ${fileProgress.value}%`);
      }
    }, updateInterval);

    console.log('🔄 جاري تحويل الصورة إلى Base64...');
    const base64Image = await readImageAsBase64(fileObj.file);
    
    clearInterval(interval);
    
    for (let i = 95; i <= 100; i++) {
      fileObj.progress = i;
      fileProgress.value = i;
      
      if (i === 100) {
        console.log(`📤 تقدم الرفع: ${fileProgress.value}%`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 30));
    }
    
    const imageUrl = URL.createObjectURL(fileObj.file);
    
    fileObj.id = Date.now();
    fileObj.status = 'completed';
    
    uploadedImage.value = imageUrl;
    uploadedImageBase64.value = base64Image;
    uploadedFileData.value = fileObj.file;
    
    console.log('🖼️ PreReleaseContent: تم تحميل الصورة محلياً:', imageUrl);
    
    setTimeout(() => {
      if (!isMounted.value) {
        console.warn('⚠️ PreReleaseContent: المكون تم تدميره أثناء رفع الصورة، تخطي التحديث');
        return;
      }
      isUploading.value = false;
      console.log('✅ PreReleaseContent: Image uploaded successfully');
      
      sendUpdate();
      
      setTimeout(() => {
        emitTabCompletion();
      }, 300);
    }, 300);
    
  } catch (error) {
    console.error('❌ PreReleaseContent: Failed to upload image:', error);
    if (!isMounted.value) return;
    
    errorMessage.value = 'Error uploading file.';
    fileObj.status = 'failed';
    fileProgress.value = 0;
    isUploading.value = false;
    file.value = null;
    uploadedImage.value = null;
    uploadedImageBase64.value = null;
    uploadedFileData.value = null;
  }
};

// ──── Drag and drop handlers ────
const handleDragOver = (event) => {
  if (!isMounted.value) return;
  if (!isPreReleaseActive.value) return;
  event.preventDefault();
};

const handleDragEnter = (event) => {
  if (!isMounted.value) return;
  if (!isPreReleaseActive.value) return;
  event.preventDefault();
  isDragging.value = true;
};

const handleDragLeave = (event) => {
  if (!isMounted.value) return;
  if (!isPreReleaseActive.value) return;
  event.preventDefault();
  isDragging.value = false;
};

const handleDrop = (event) => {
  if (!isMounted.value) return;
  if (!isPreReleaseActive.value) return;
  event.preventDefault();
  isDragging.value = false;
  
  const files = event.dataTransfer.files;
  if (files.length > 1) {
    errorMessage.value = 'Only one file can be uploaded.';
    return;
  }
  
  if (files.length === 1) {
    const simulatedEvent = { target: { files } };
    handleFileUpload(simulatedEvent);
  }
};

// ========== ✅ التحقق من اكتمال التاب ==========
const isTabComplete = (tabId) => {
  if (tabId === 'pre-release') {
    // ✅ إذا كان Pre-Release غير نشط، فهو مكتمل تلقائياً
    if (!isPreReleaseActive.value) {
      console.log('📌 [PreReleaseContent] Pre-Release is inactive, tab is complete');
      return true;
    }
    
    // ✅ إذا كان Pre-Release نشط، يجب أن تكون الصورة والتاريخ موجودين
    const hasImage = uploadedImage.value && uploadedImage.value !== '';
    const hasDate = isReleaseDateSelected.value && selectedReleaseDate.value && selectedReleaseDate.value !== '';
    const result = hasImage && hasDate;
    
    console.log('📌 [PreReleaseContent] isTabComplete:', result, { 
      hasImage, 
      hasDate, 
      isActive: isPreReleaseActive.value 
    });
    return result;
  }
  return false;
};

// ========== ✅ دالة إرسال تحديث الاكتمال ==========
const emitTabCompletion = () => {
  const isComplete = isTabComplete('pre-release');
  console.log('📌 [PreReleaseContent] Emitting tab completion:', isComplete);
  
  // ✅ إرسال كلا الحدثين لضمان التحديث
  emit('update:form-data', {
    tab: 'pre-release',
    data: { isComplete }
  });
  
  // ✅ إرسال التحديث مباشرة إلى الـ Store عبر المكون الأب
  emit('update-tab-completion', {
    'pre-release': isComplete
  });
};

// ========== ✅ Computed tabCompletion ==========
const tabCompletion = computed(() => {
  const isComplete = isTabComplete('pre-release');
  return {
    'pre-release': isComplete
  };
});


// ========== ✅ التحقق من إمكانية الانتقال ==========
const canGoToTracklist = computed(() => {
  // إذا كان Pre-Release غير نشط، يمكن الانتقال دائماً
  if (!isPreReleaseActive.value) return true;
  
  // إذا كان Pre-Release نشط، يجب أن تكون الصورة والتاريخ موجودين
  const hasImage = uploadedImage.value && uploadedImage.value !== '';
  const hasDate = isReleaseDateSelected.value && selectedReleaseDate.value && selectedReleaseDate.value !== '';
  
  return hasImage && hasDate;
});

// ──── دالة العودة إلى Tracklist ────
const GotoFirstSection = () => {
  if (!isMounted.value) return;
  
  if (!canGoToTracklist.value) {
    console.warn('⚠️ PreReleaseContent: Cannot proceed, incomplete data');
    
    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: { 
        message: isPreReleaseActive.value 
          ? 'Bitte lade ein Cover hoch und wähle ein Veröffentlichungsdatum aus.'
          : 'Bitte fülle alle erforderlichen Felder aus.',
        type: 'warning'
      }
    }));
    return;
  }

  console.log('➡️ PreReleaseContent: Returning to FirstSection');
  
  emitTabCompletion();
  
  setTimeout(() => {
    emit('exit-sub-layout');
    emit('back-to-tracklist');
  }, 300);
};

// ──── Update circle size based on screen width ────
const updateCircleSize = () => {
  if (!isMounted.value) return;
  
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

// ──── Lifecycle ────
onMounted(() => {
  isMounted.value = true;
  updateCircleSize();
  window.addEventListener('resize', updateCircleSize);
  document.addEventListener('click', handleClickOutside);
  console.log('🚀 PreReleaseContent: Mounted');
  updateFromProps();
  
  window.addEventListener('save-song-complete', handleSaveComplete);
  
  setTimeout(() => {
    emitTabCompletion();
  }, 500);
});

onBeforeUnmount(() => {
  isMounted.value = false;
  console.log('🔄 PreReleaseContent: Unmounted');
  
  window.removeEventListener('resize', updateCircleSize);
  window.removeEventListener('save-song-complete', handleSaveComplete);
  document.removeEventListener('click', handleClickOutside);
  
  if (uploadedImage.value && uploadedImage.value.startsWith('blob:')) {
    URL.revokeObjectURL(uploadedImage.value);
  }
  
  if (saveQueue.value.length > 0) {
    console.log(`📦 PreReleaseContent: معالجة ${saveQueue.value.length} تغييرات معلقة قبل الإزالة`);
    if (!isSaving.value) {
      processSaveQueue();
    }
  }
});
// ========== مراقبة تغييرات isPreReleaseActive ==========
watch(() => isPreReleaseActive.value, (newVal) => {
  console.log('🔄 PreReleaseContent: isPreReleaseActive changed to', newVal);
  
  // ✅ إذا تم إلغاء التفعيل، نرسل اكتمال
  if (!newVal) {
    setTimeout(() => {
      emitTabCompletion();
    }, 300);
  } else {
    // ✅ إذا تم التفعيل، نتحقق من اكتمال الحقول
    setTimeout(() => {
      emitTabCompletion();
    }, 300);
  }
});
defineExpose({
  isTabComplete,
  canGoToTracklist,
  emitTabCompletion 
});

</script>

<style lang="scss" scoped>
.tab-content {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 20px;
  align-self: stretch;
  width: 100%;
  height: 100%;
  position: relative;
}

.btn-right {
  position: fixed;
  right: 20px;
  bottom: 20px;
  border-radius: 5px;
  display: flex;
  padding: 12px 20px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  height: 36px;
  font-family: Heebo;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: 0.9;
  text-transform: uppercase;
  z-index: 11;
  transition: background 0.3s ease, color 0.3s ease;
  cursor: pointer;
}

.btn-right:not(.inactive) {
  background: var(--Main-Colors-Strawberry, #D15);
  color: #fff;
}

.btn-right:not(.inactive):hover {
  background: var(--dark-red, #b30f45);
}

.btn-right.inactive {
  background: var(--Main-Colors-Slate-Light, #3A3E42);
  color: #6A6C6D;
  cursor: not-allowed;
}

.btn-right.active {
  background: var(--Main-Colors-Strawberry, #D15);
  color: #FFF;
  cursor: pointer;
}

.btn-right.active:hover {
  background: var(--dark-red);
  color: #fff;
}

.card-upload-single-cover {
  display: flex;
  width: 310px;
  height: 310px;
  min-width: 310px;
  min-height: 310px;
  padding: 180px 20px 32px 20px;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  gap: 144px;
  aspect-ratio: 1/1;
  border-radius: 20px;
  border: 2px dashed var(--Main-Colors-White, #FFF);
  opacity: 0.3;
  background: #26282D;
  box-shadow: 4px 4px 20px 0 rgba(27, 28, 32, 0.20);
  transition: opacity 0.3s ease, border-color 0.3s ease;
  position: relative;
  overflow: hidden;
}

.card-upload-single-cover.active-opacity {
  opacity: 1;
}

.card-upload-single-cover.has-image {
  border: 2px solid var(--Main-Colors-White, #FFF);
}

.card-upload-single-cover.drag-over {
  border: 12px solid var(--Main-Colors-Strawberry, #D15);
  background: rgba(209, 17, 85, 0.1);
}

.upload-full-area {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.upload-label {
  width: 100%;
  height: 100%;
  border-radius: 20px;
  cursor: pointer;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.upload-label:disabled {
  cursor: not-allowed;
}

.uploaded-image-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 20px;
  overflow: hidden;
}

.uploaded-image-full {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 20px;
}

.default-upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  color: var(--Main-Colors-White, #FFF);
}

.file-icon {
  font-size: 90px;
  font-weight: 700;
  text-transform: uppercase;
}

.progress-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(38, 40, 45, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 20px;
}

.progress-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.progress-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.progress-text {
  position: absolute;
  color: white;
  font-family: Heebo;
  font-size: 4rem;
  font-weight: bold;
}

.hidden-input {
  display: none;
}

.error-message {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  color: var(--Main-Colors-Strawberry, #D15);
  font-family: Heebo;
  font-size: 16px;
  font-weight: 500;
  text-align: center;
  background: rgba(0, 0, 0, 0.7);
  padding: 10px 20px;
  border-radius: 8px;
  z-index: 3;
}

.text-content-overlay {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 144px;
  width: 100%;
}

.text1 {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.text1 span {
  color: var(--Main-Colors-White, #FFF);
  text-align: center;
  font-family: Heebo;
  font-size: 20px;
  font-style: normal;
  font-weight: 700;
  line-height: 100%;
  text-transform: uppercase;
}

.text1 .text-link-bold {
  display: flex;
  align-items: center;
  gap: 5px;
  color: var(--Main-Colors-White, #FFF);
  font-family: Heebo;
  font-size: 20px;
  font-style: normal;
  font-weight: 700;
  line-height: 1;
  text-transform: uppercase;
}

.text-link-bold span {
  color: var(--Main-Colors-Strawberry, #D15);
  font-family: Heebo;
  font-size: 20px;
  font-style: normal;
  font-weight: 700;
  line-height: 1;
  text-transform: uppercase;
  cursor: pointer;
}

.text-link-bold span.disabled {
  color: var(--Main-Colors-White, #6A6C6D);
  cursor: not-allowed;
}

.text-link-bold span:hover:not(.disabled) {
  text-decoration: underline;
}

.text2 {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.text2 span {
  color: var(--Main-Colors-White, #FFF);
  text-align: center;
  font-family: Heebo;
  font-size: 18px;
  font-style: normal;
  font-weight: 700;
  line-height: 100%;
}

.text2 .text-link {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.text2 .text-link span {
  color: var(--Main-Colors-White, #FFF);
  font-family: Heebo;
  font-size: 18px;
  font-style: normal;
  font-weight: 300;
  line-height: 1;
  text-decoration-line: underline;
  text-decoration-style: solid;
  text-decoration-skip-ink: none;
  text-decoration-thickness: auto;
  text-underline-offset: auto;
  text-underline-position: from-font;
}

:deep(.circle-progress__circle) {
  transform: rotate(-90deg);
}

:deep(.circle-progress__circle-foreground) {
  stroke: var(--Main-Colors-Strawberry, #D15) !important;
  transition: stroke-dashoffset 0.1s linear;
}

.column2 {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 48px;
  flex: 1 0 0;
}

.preRelease-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 48px;
  align-self: stretch;
}

.preRelease-info .top-line {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  align-self: stretch;
}

.preRelease-info .top-line span {
  color: var(--Main-Colors-White, #FFF);
  font-family: Heebo;
  font-size: 18px;
  font-style: normal;
  font-weight: 700;
  line-height: 1;
  letter-spacing: 0.9px;
  text-transform: uppercase;
}

.btn-switch {
  display: flex;
  width: 40px;
  height: 20px;
  padding: 2px;
  align-items: center;
  gap: 10px;
  border-radius: 10px;
  background: var(--primary, #1B1C20);
  cursor: pointer;
  transition: background 0.3s ease;
}

.btn-switch.active {
  background: var(--Main-Colors-Strawberry, #D15);
}

.btn-switch .circle {
  width: 16px;
  height: 16px;
  margin-left: 2px;
  transition: margin-left 0.3s ease;
}

.btn-switch.active .circle {
  margin-left: 20px;
}

.infos {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 52px;
  align-self: stretch;
  opacity: 0.3;
  transition: opacity 0.3s ease;
}

.infos.active-opacity {
  opacity: 1;
}

.infos .headline {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 20px;
}

.infos .headline .title {
  color: var(--Main-Colors-White, #6A6C6D);
  font-family: Heebo;
  font-size: 58px;
  font-style: normal;
  font-weight: 700;
  line-height: .8;
  text-transform: uppercase;
  transition: color 0.3s ease;
}

.infos .headline .title.active-text {
  color: var(--Main-Colors-White, #FFF);
}

.infos .headline .subtitle {
  color: var(--Main-Colors-White, #6A6C6D);
  font-family: Heebo;
  font-size: 40px;
  font-style: normal;
  font-weight: 700;
  line-height: .8;
  transition: color 0.3s ease;
}

.infos .headline .subtitle.active-text {
  color: var(--Main-Colors-White, #FFF);
}

.infos .Form {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 32px;
  align-self: stretch;
}

.infos .Form .top-line {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  align-self: stretch;
}

.infos .Form .top-line span {
  color: var(--Main-Colors-White, #FFF);
  font-family: Heebo;
  font-size: 14px;
  font-style: normal;
  font-weight: 300;
  line-height: 1;
  letter-spacing: 0.7px;
  text-transform: uppercase;
}

.infos .Form .form {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 8px;
  align-self: stretch;
}

.Form .form span {
  color: var(--Main-Colors-White, #FFF);
  font-family: Heebo;
  font-size: 14px;
  font-style: normal;
  font-weight: 300;
  line-height: 1;
  letter-spacing: 0.7px;
  text-transform: uppercase;
}

.section-input {
  display: flex;
  align-items: center;
  gap: 2px;
  align-self: stretch;
  border-radius: 5px;
  width: 404px;
  position: relative;
}

.section-input .input-field {
  display: flex;
  padding: 12px;
  justify-content: space-between;
  align-items: center;
  flex: 1 0 0;
  border-radius: 5px;
  background: var(--primary, #1B1C20);
  outline: none;
  border: 0;
  color: #fff;
  font-family: Heebo;
  font-size: 20px;
  height: 46px;
  max-width: 100%;
  box-sizing: border-box;
  cursor: pointer;
}

.section-input .input-field:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.section-input .input-field::placeholder {
  font-size: 20px;
}

.section-input.has-checkmark .input-field {
  padding-right: 94px;
}

.section-input .checkmark {
  position: absolute;
  right: 34px;
  top: 50%;
  transform: translateY(-50%);
}

.section-input .checkmark .icon-y {
  width: 18px;
  position: relative;
  right: 12px;
}

.section-input .spacer {
  display: flex;
  width: 34px;
  height: 46px;
  padding: 9px 10px;
  align-items: center;
  border-radius: 5px;
  position: relative;
  cursor: pointer;
}

/* ✅ spacer يظهر فقط عند التمرير أو التركيز */
.section-input .spacer .play {
  display: flex;
  padding: 13px 13px;
  align-items: center;
  position: absolute;
  right: 20px;
  opacity: 0;
  border-radius: 0 5px 5px 0;
  background: var(--primary, #1B1C20);
  transition: right 0.3s ease, opacity 0.3s ease;
  pointer-events: none;
}

.section-input .spacer .play.visible {
  right: -10px;
  opacity: 1;
  pointer-events: auto;
}

.section-input .spacer .play .icon {
  width: 18px;
  height: 20px;
  flex-shrink: 0;
  aspect-ratio: 9/10;
}

.section-input .spacer:hover .icon {
  filter: brightness(0) invert(1);
}

.calendar-picker {
  position: absolute;
  top: 0;
  left: calc(100% + 18px);
  z-index: 10;
  background: var(--primary, #1B1C20);
  padding: 20px;
  border-radius: 10px;
  box-shadow: 7px 3px 10px -3px var(--Main-Colors-Slate-Black, #0E0E10);
}

.play-dark {
  position: absolute;
  right: -20px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 20px;
  z-index: 11;
}


@media (max-width:1800px) {
  .section-input{
    max-width: 135px;
  }

  .section-input .spacer .play.visible{
    right: -25px;
  }

  .calendar-picker{
    left: calc(100% + 60px);
  }

  .play-dark{
    right: -64px;
  }

  .section-input.has-checkmark .input-field{
    padding-right: 20px;
  }

   .section-input .checkmark{
    right: 0;
  }
  .progress-text {
    font-size: 3rem;
  }

  .infos .Form .top-line span{
    line-height: 1.2;
  }
}
@media (min-width: 1440px) and (max-width: 1599px) {
  .file-icon {
    font-size: 60px;
  }

  .card-upload-single-cover{
    width: clamp(310px, -113.75px + 33.33vw, 365px);
    height: clamp(310px, -113.75px + 33.33vw, 365px);
    min-width: clamp(310px, -113.75px + 33.33vw, 365px);
    min-height: clamp(310px, -113.75px + 33.33vw, 365px);
  }

  .text-content-overlay{
    gap: 80px;
  }

  .text1 span,.text1 .text-link-bold{
    font-size: 16px;
  }

  .text2 span,.text2 .text-link span{
    font-size: 14px;
  }

  .preRelease-info .top-line span{
    font-size: 15.5px;
    letter-spacing: 0.8px;
  }

  .preRelease-info{
    gap: 32px;
  }

  .infos .headline .subtitle{
    font-size: 32px;
  }

  .infos .headline .title{
    font-size: 48px;
  }

  .infos .Form .top-line span,.Form .form span{
    font-size: 12px;
  }
}

@media (min-width: 1600px) and (max-width: 2074px) {
  .file-icon {
    font-size: 70px;
  }

  .progress-text {
    font-size: 3.5rem;
  }

  .card-upload-single-cover{
    width: clamp(366px, -346px + 41.05vw, 520px);
    height: clamp(366px, -346px + 41.05vw, 520px);
    min-width: clamp(366px, -346px + 41.05vw, 520px);
    min-height: clamp(366px, -346px + 41.05vw, 520px);
  }
}

@media (min-width: 2075px) and (max-width: 2560px){
  .card-upload-single-cover{
    width: clamp(378px, -625px + 48.3vw, 503px);
    height: clamp(378px, -625px + 48.3vw, 503px);
    min-width: clamp(378px, -625px + 48.3vw, 503px);
    min-height: clamp(378px, -625px + 48.3vw, 503px);
  }
}

@media (min-width: 2561px) {
  .card-upload-single-cover{
    width: 503px;
    height: 503px;
    min-width: 503px;
    min-height: 503px;
  }
}
</style>