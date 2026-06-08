<template>
  <div class="upload"
        :style="{ 
         gap: showNewRight || showNewRight2 ? '24px' : '', 
         alignItems: showNewRight || showNewRight2 ? 'start' : 'center', 
         height: showNewRight2 || showFinalPage ? 'auto' : '100%' 
       }">
    <!-- Video Popup -->
    <VideoPopup :show="showVideoPopup" :videoId="videoId" @close="closeVideoPopup" />

    <!-- Left Section -->
    <div class="">
      <ImageUpload 
        :uploadedImage="localUploadedImage"
        :server-cover-url="serverCoverUrl"
        :is-uploading="isUploading"
        :upload-progress="uploadProgress"
        @update:uploadedImage="localUploadedImage = $event"
        @file-selected="handleFileSelected" 
      />
      <FormLeft v-if="showNewRight2 && isNewFormsVisible && !showFinalPage" 
                :gtin="gtin" :catalogNumber="catalogNumber"
                :isForm6Active="isForm6Active" :isForm7Active="isForm7Active" 
                :isForm6Selected="isForm6Selected" :isForm7Selected="isForm7Selected"
                :isHoveredForm6="isHoveredForm6" :isHoveredForm7="isHoveredForm7"
                :iconPlay="iconPlay" 
                @update:gtin="gtin = $event" 
                @update:catalogNumber="catalogNumber = $event"
                @toggleForm6="toggleForm6" 
                @toggleForm7="toggleForm7" 
                @updateForm6Selected="updateForm6Selected" 
                @updateForm7Selected="updateForm7Selected"
                @mouseenterForm6="isHoveredForm6 = true" 
                @mouseleaveForm6="isHoveredForm6 = false"
                @mouseenterForm7="isHoveredForm7 = true" 
                @mouseleaveForm7="isHoveredForm7 = false"
                @openVideoPopup="openVideoPopup" />
    </div>

    <!-- Right Section -->
  <RightSection 
    v-if="!showNewRight && !showNewRight2" 
    :artistInputs="artistInputs"
    :showSearchResults="showSearchResults" 
    :filteredSearchResults="filteredSearchResults"
    :searchQuery2="searchQuery2" 
    :searchQuery3="searchQuery3" 
    :selectedDate="selectedDate"
    :isForm2Selected="isForm2Selected" 
    :isForm3Selected="isForm3Selected" 
    :isForm4Selected="isForm4Selected"
    :isForm3Active="isForm3Active" 
    :isHoveredForm2="isHoveredForm2" 
    :isHoveredForm3="isHoveredForm3"
    :isHoveredForm4="isHoveredForm4" 
    :isInputFocused="isInputFocused" 
    :isCalendarVisible="isCalendarVisible"
    :iconPlay="iconPlay" 
    :searchResultStyle="searchResultStyle" 
    :isSlidingUp="isSlidingUp"
    @update:artistInputs="artistInputs = $event" 
    @update:showSearchResults="showSearchResults = $event"
    @update:searchQuery2="searchQuery2 = $event; emit('update:title', $event)"
    @update:searchQuery3="searchQuery3 = $event" 
    @update:selectedDate="handleDateSelect"
    @update:isForm2Selected="isForm2Selected = $event" 
    @update:isForm3Selected="isForm3Selected = $event"
    @update:isForm4Selected="isForm4Selected = $event" 
    @toggleForm3="toggleForm3"
    @update:isHoveredForm2="isHoveredForm2 = $event" 
    @update:isHoveredForm3="isHoveredForm3 = $event"
    @update:isHoveredForm4="isHoveredForm4 = $event" 
    @update:isInputFocused="isInputFocused = $event"
    @update:isCalendarVisible="isCalendarVisible = $event" 
    @openVideoPopup="openVideoPopup"
    @addArtistInput="addArtistInput" 
    @removeArtistInput="removeArtistInput"
    @selectSearchResult="selectSearchResult" 
    @updateSearchResults="updateSearchResults" 
/>
    <!-- New Right Section -->
    <NewRightSection v-if="showNewRight" 
                     :releasePrice="releasePrice" 
                     :songPrice="songPrice" 
                     :mainGenre="mainGenre"
                     :subGenre="subGenre" 
                     :isReleasePriceSelected="isReleasePriceSelected"
                     :isSongPriceSelected="isSongPriceSelected" 
                     :isMainGenreSelected="isMainGenreSelected"
                     :isSubGenreSelected="isSubGenreSelected" 
                     :isHoveredReleasePrice="isHoveredReleasePrice"
                     :isHoveredSongPrice="isHoveredSongPrice" 
                     :isHoveredMainGenre="isHoveredMainGenre"
                     :isHoveredSubGenre="isHoveredSubGenre" 
                     :isSubGenreEnabled="isSubGenreEnabled" 
                     :artistInputs="artistInputs"
                     :searchQuery2="searchQuery2" 
                     :selectedDate="selectedDate" 
                     :iconPlay="iconPlay"
                     @update:releasePrice="releasePrice = $event" 
                     @update:songPrice="songPrice = $event"
                     @update:mainGenre="mainGenre = $event" 
                     @update:subGenre="subGenre = $event"
                     @update:isReleasePriceSelected="isReleasePriceSelected = $event"
                     @update:isSongPriceSelected="isSongPriceSelected = $event"
                     @update:isMainGenreSelected="isMainGenreSelected = $event"
                     @update:isSubGenreSelected="isSubGenreSelected = $event"
                     @update:isHoveredReleasePrice="isHoveredReleasePrice = $event"
                     @update:isHoveredSongPrice="isHoveredSongPrice = $event"
                     @update:isHoveredMainGenre="isHoveredMainGenre = $event"
                     @update:isHoveredSubGenre="isHoveredSubGenre = $event"
                     @update:isSubGenreEnabled="isSubGenreEnabled = $event" 
                     @openVideoPopup="openVideoPopup" />

    <!-- New Right 2 Section (بدون زر) -->
    <NewRight2Section v-if="showNewRight2" 
                      :artistInputs="artistInputs" 
                      :searchQuery2="searchQuery2"
                      :selectedDate="selectedDate" 
                      :releasePrice="releasePrice" 
                      :songPrice="songPrice" 
                      :mainGenre="mainGenre"
                      :subGenre="subGenre" 
                      :labelName="labelName" 
                      :productionYear="productionYear" 
                      :cLineYear="cLineYear"
                      :cLineName="cLineName" 
                      :pLineYear="pLineYear" 
                      :pLineName="pLineName" 
                      :gtin="gtin"
                      :catalogNumber="catalogNumber" 
                      :isNewRight2Visible="isNewRight2Visible" 
                      :isNewFormsVisible="isNewFormsVisible"
                      :isForm8Selected="isForm8Selected" 
                      :isForm9Selected="isForm9Selected"
                      :isForm10Selected="isForm10Selected" 
                      :isForm11Selected="isForm11Selected"
                      :isHoveredForm8="isHoveredForm8" 
                      :isHoveredForm9="isHoveredForm9"
                      :isHoveredForm10="isHoveredForm10" 
                      :isHoveredForm11="isHoveredForm11"
                      :showFinalPage="showFinalPage" 
                      :iconPlay="iconPlay"
                      @update:labelName="labelName = $event" 
                      @update:productionYear="productionYear = $event"
                      @update:cLineYear="cLineYear = $event" 
                      @update:cLineName="cLineName = $event"
                      @update:pLineYear="pLineYear = $event" 
                      @update:pLineName="pLineName = $event"
                      @update:isForm8Selected="isForm8Selected = $event" 
                      @update:isForm9Selected="isForm9Selected = $event"
                      @update:isForm10Selected="isForm10Selected = $event" 
                      @update:isForm11Selected="isForm11Selected = $event"
                      @update:isHoveredForm8="isHoveredForm8 = $event" 
                      @update:isHoveredForm9="isHoveredForm9 = $event"
                      @update:isHoveredForm10="isHoveredForm10 = $event" 
                      @update:isHoveredForm11="isHoveredForm11 = $event"
                      @openVideoPopup="openVideoPopup" />

    <!-- Popup Component (PopUpDays) -->
    <PopUpDays :showPopup="showPopup" 
               :selectedDate="selectedDate" 
               :recommendedDate="recommendedDate" 
               :daysDifference="daysDifference"
               @update-date="updateToRecommendedDate" 
               @close="showPopup = false" />

   <!-- Button Arrow Top - يختفي في آخر خطوة -->
<div class="button-arrow-top" 
     v-if="(showNewRight || showNewRight2) " 
     @click="handleButtonArrowTopClick">
  <img src="/icon/Arrow.svg" class="down" alt="down">
</div>
  </div>

  <!-- Button Arrow Bottom - يختفي في آخر خطوة -->
  <div class="button-arrow" 
       v-if="isButtonArrowVisible && !showFinalPage" 
       :class="{ disabled: isButtonArrowDisabled }"
       @click="handleButtonArrowClick">
    <img src="/icon/Arrow.svg" class="down" alt="down">
  </div>

  <!-- زر Weiter zu Songs - يظهر في آخر خطوة فقط -->
  <div v-if="showFinalPage" class="btn-right" @click="handleNextStep">
    Weiter zu Songs
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { debounce } from '@/utils/debounce';
import apiRequest from '@/lib/apiRequest';
import { useReleaseStore } from '@/stores/release';
import dayjs from 'dayjs';
import { storage_url } from '@/constants';

import VideoPopup from './VideoPopup.vue';
import ImageUpload from './ImageUpload.vue';
import FormLeft from './FormLeft.vue';
import RightSection from './RightSection.vue';
import NewRightSection from './NewRightSection.vue';
import NewRight2Section from './NewRight2Section.vue';
import PopUpDays from '../../../components/modals/PopUpDays.vue';

const route = useRoute();
const router = useRouter(); // <-- أضف هذا
const releaseStore = useReleaseStore();

// Define props
const props = defineProps({
  currentStep: { type: Number, required: true },
  steps: { type: Array, default: () => ['0', '1', '2', '3', '4'] },
  sectionTitle: { type: [String, Object], default: 'Cover Vorschau' },
  uploadedImage: { type: String, default: null },
  title: { type: String, default: '' },
  skipCreation: { type: Boolean, default: false },
  pendingReleaseType: { type: String, default: null },
   editMode: { type: String, default: null },
  isEditSongMode: { type: Boolean, default: false }
});

// Define emits
const emit = defineEmits(['update:title', 'next', 'update:showNewRight2', 'cover-updated', 'release-updated', 'release-created']);

// دالة الانتقال للخطوة التالية
const handleNextStep = () => {
  console.log('Weiter zu Songs تم الضغط → تمرير next للأعلى');
  emit('next');
};

// Video Popup
const showVideoPopup = ref(false);
const videoId = ref('');
const videoIds = {
  form1: 'WPni755-Krg',
  form2: 'dQw4w9WgXcQ',
  form3: 'kJQP7kiw5Fk',
  form4: '3tmd-ClpJxA',
  form5: 'x6QZn9xiuOE',
  form6: 'M7lc1UVf-VE',
  form7: 'y6120QOlsfU',
  form8: 'dQw4w9WgXcQ',
  form9: 'kJQP7kiw5Fk',
  form10: '3tmd-ClpJxA',
  form11: 'x6QZn9xiuOE'
};

const openVideoPopup = (form) => {
  videoId.value = videoIds[form] || 'WPni755-Krg';
  showVideoPopup.value = true;
  document.body.style.overflow = 'hidden';
};

const closeVideoPopup = () => {
  showVideoPopup.value = false;
  videoId.value = '';
  document.body.style.overflow = '';
};

// حالة الصورة والـ UUID
const localUploadedImage = ref(null);
const serverCoverUrl = ref(null);
const releaseUuid = ref(null);

// حالة الرفع
const isUploading = ref(false);
const uploadProgress = ref(0);
const pendingCoverFile = ref(null);
const errorMessage = ref(''); // <-- أضف هذا

// متغير لتتبع ما إذا تم إنشاء الـ Release بالفعل
const isReleaseCreated = ref(false);

// Form states
const artistInputs = ref([{ searchQuery: '', isHovered: false, isFocused: false, isSelected: false }]);
const showSearchResults = ref(null);
const searchResults = ref([]);
const searchQuery2 = ref('');
const searchQuery3 = ref('');
const selectedDate = ref(null);
const releasePrice = ref('');
const songPrice = ref('');
const mainGenre = ref('');
const subGenre = ref('');
const gtin = ref('');
const catalogNumber = ref('');
const labelName = ref('');
const productionYear = ref('');
const isCreatingRelease = ref(false);
const cLineYear = ref('');
const cLineName = ref('');
const pLineYear = ref('');
const pLineName = ref('');
const isForm2Selected = ref(false);
const isForm3Selected = ref(false);
const isForm4Selected = ref(false);
const isReleasePriceSelected = ref(false);
const isSongPriceSelected = ref(false);
const isMainGenreSelected = ref(false);
const isSubGenreSelected = ref(false);
const isForm6Selected = ref(false);
const isForm7Selected = ref(false);
const isForm8Selected = ref(false);
const isForm9Selected = ref(false);
const isForm10Selected = ref(false);
const isForm11Selected = ref(false);
const isForm3Active = ref(false);
const isForm6Active = ref(false);
const isForm7Active = ref(false);
const isHoveredForm2 = ref(false);
const isHoveredForm3 = ref(false);
const isHoveredForm4 = ref(false);
const isHoveredReleasePrice = ref(false);
const isHoveredSongPrice = ref(false);
const isHoveredMainGenre = ref(false);
const isHoveredSubGenre = ref(false);
const isHoveredForm6 = ref(false);
const isHoveredForm7 = ref(false);
const isHoveredForm8 = ref(false);
const isHoveredForm9 = ref(false);
const isHoveredForm10 = ref(false);
const isHoveredForm11 = ref(false);
const isInputFocused = ref(false);
const isCalendarVisible = ref(false);
const showPopup = ref(false);
const showNewRight = ref(false);
const showNewRight2 = ref(false);
const isSlidingUp = ref(false);
const isSlidingOut = ref(false);
const isNewRight2Visible = ref(false);
const isNewFormsVisible = ref(false);
const showFinalPage = ref(false);
const isSubGenreEnabled = ref(false);
const daysDifference = ref(0);

// ========== إضافة ref للـ form4Container ==========
const form4Container = ref(null);
// =================================================

// Mock data
const mockData = [
  { id: '1', name: 'Digger Barnes', type: 'artist', image: '/icon/icon-picture.jpg' },
  { id: '2', name: 'John Doe', type: 'artist', image: '/icon/icon-picture.jpg' },
  { id: '3', name: 'Jane Smith', type: 'artist', image: '/icon/icon-picture.jpg' },
  { id: '4', name: 'Alex Johnson', type: 'artist', image: '/icon/icon-picture.jpg' },
  { id: '5', name: 'Emma Wilson', type: 'artist', image: '/icon/icon-picture.jpg' },
  { id: '6', name: 'Michael Brown', type: 'artist', image: '/icon/icon-picture.jpg' },
  { id: '7', name: 'Sarah Davis', type: 'artist', image: '/icon/icon-picture.jpg' },
  { id: '8', name: 'Chris Lee', type: 'artist', image: '/icon/icon-picture.jpg' },
  { id: '9', name: 'Laura Taylor', type: 'artist', image: '/icon/icon-picture.jpg' },
  { id: '10', name: 'David Miller', type: 'artist', image: '/icon/icon-picture.jpg' },
];

// ========== دوال إغلاق الكالندر المحسنة ==========
const closeCalendar = () => {
  if (isCalendarVisible.value) {
    console.log('🔒 إغلاق الكالندر');
    isCalendarVisible.value = false;
    isInputFocused.value = false;
    nextTick();
  }
};

// دالة للتعامل مع النقر خارج الكالندر
const handleClickOutside = (event) => {
  if (isCalendarVisible.value && form4Container.value && !form4Container.value.contains(event.target)) {
    console.log('🔒 إغلاق الكالندر - نقر خارجي على form4Container');
    closeCalendar();
  }
};

// دالة للتعامل مع النقر في أي مكان في الصفحة
const handleGlobalClick = (event) => {
  if (isCalendarVisible.value) {
    const calendarElement = document.querySelector('.calendar-picker');
    const inputElement = document.querySelector('.form4 .input-field');
    const playDarkElement = document.querySelector('.form4 .play-dark');
    
    const isClickOnCalendar = calendarElement && calendarElement.contains(event.target);
    const isClickOnInput = inputElement && inputElement.contains(event.target);
    const isClickOnPlayDark = playDarkElement && playDarkElement.contains(event.target);
    
    if (!isClickOnCalendar && !isClickOnInput && !isClickOnPlayDark) {
      console.log('🔒 إغلاق الكالندر - نقر خارجي (global)');
      closeCalendar();
    }
  }
};

// ========== جلب المسودة + ملء الحقول + تعيين UUID ==========
onMounted(async () => {
  // إضافة مستمعات الأحداث لإغلاق الكالندر
  document.addEventListener('click', handleGlobalClick);
  document.addEventListener('click', handleClickOutside);
  
  // في وضع التخطي، لا نقوم بجلب أي مسودة
  if (props.skipCreation) {
    console.log('⏭️ وضع التخطي نشط - لن يتم جلب أي مسودة');
    resetAllFields();
    return;
  }
  
  try {
    // محاولة الحصول على releaseUuid من المتجر أولاً (للتعديل)
    if (releaseStore.currentReleaseId) {
      releaseUuid.value = releaseStore.currentReleaseId;
      console.log('📦 تم الحصول على releaseUuid من المتجر:', releaseUuid.value);
      
      // جلب تفاصيل الـ Release
      const response = await apiRequest.get(`/releases/${releaseUuid.value}`);
      const release = response.data?.data;
      
      if (release) {
        fillReleaseData(release);
      }
      return;
    }
    
    // إذا لم يكن في المتجر، جلب آخر مسودة (للتعديل فقط)
    const response = await apiRequest.get('/releases');
    const releases = response.data?.data || [];

    if (releases.length > 0) {
      const latestDraft = releases
        .filter(r => r.status === 'draft')
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];

      if (latestDraft) {
        fillReleaseData(latestDraft);
      }
    }
  } catch (err) {
    console.error('فشل جلب المسودات:', err);
  }
});

onUnmounted(() => {
  // إزالة مستمعات الأحداث
  document.removeEventListener('click', handleGlobalClick);
  document.removeEventListener('click', handleClickOutside);
  document.body.style.overflow = '';
});

// دالة مساعدة لإعادة تعيين جميع الحقول
const resetAllFields = () => {
  searchQuery2.value = '';
  searchQuery3.value = '';
  selectedDate.value = null;
  releasePrice.value = '';
  songPrice.value = '';
  mainGenre.value = '';
  subGenre.value = '';
  labelName.value = '';
  productionYear.value = '';
  cLineYear.value = '';
  cLineName.value = '';
  pLineYear.value = '';
  pLineName.value = '';
  gtin.value = '';
  catalogNumber.value = '';
  
  // إعادة تعيين الفنانين
  artistInputs.value = [{ searchQuery: '', isHovered: false, isFocused: false, isSelected: false }];
  
  // إعادة تعيين الحالات
  isForm2Selected.value = false;
  isForm3Selected.value = false;
  isForm4Selected.value = false;
  isForm3Active.value = false;
  isForm6Active.value = false;
  isForm7Active.value = false;
  isForm6Selected.value = false;
  isForm7Selected.value = false;
  isForm8Selected.value = false;
  isForm9Selected.value = false;
  isForm10Selected.value = false;
  isForm11Selected.value = false;
  
  console.log('🔄 تم إعادة تعيين جميع الحقول');
};

// دالة مساعدة لملء البيانات
const fillReleaseData = (release) => {
  releaseUuid.value = release.uuid;
  releaseStore.setReleaseType(release.release_type);
  releaseStore.setCurrentReleaseId(release.uuid);

  // ملء الحقول من المسودة (للتعديل)
  searchQuery2.value = release.title || '';
  searchQuery3.value = release.subtitle || '';
  selectedDate.value = release.release_date 
    ? dayjs(release.release_date).format('DD/MM/YY') 
    : null;
  releasePrice.value = release.release_price || '';
  songPrice.value = release.price_per_song || '';
  mainGenre.value = release.main_genre || '';
  subGenre.value = release.sub_genre || '';
  labelName.value = release.label || '';
  productionYear.value = release.production_year || '';
  cLineYear.value = release.c_line_year || '';
  cLineName.value = release.c_line_name || '';
  pLineYear.value = release.p_line_year || '';
  pLineName.value = release.p_line_name || '';
  gtin.value = release.GTIN || '';
  catalogNumber.value = release.catalog_number || '';
  
  console.log('📝 تم ملء البيانات من المسودة:', release.uuid);

  if (release.cover) {
    serverCoverUrl.value = `${storage_url}/${release.cover}`;
    localUploadedImage.value = serverCoverUrl.value;
  }

  console.log('تم استرجاع المسودة. UUID:', releaseUuid.value);

  // تحديث القيم السابقة بعد تحميل البيانات
  setTimeout(() => {
    updatePreviousValues();
    console.log('📝 Initial previous values set');
  }, 500);
};

// في Parent.vue، قم بتعديل دالة createReleaseOnFirstInput

const createReleaseOnFirstInput = async () => {
  // لا تنشئ Release إذا:
  // 1. تم إنشاؤه بالفعل
  // 2. ليس في وضع التخطي
  // 3. لم يتم إدخال أي قيمة فعلية (فقط الحقول الفارغة)
  
  if (isReleaseCreated.value) {
    console.log('✅ Release تم إنشاؤه بالفعل');
    return;
  }
  
  if (!props.skipCreation) {
    console.log('ℹ️ ليس في وضع التخطي، لن يتم إنشاء Release تلقائياً');
    return;
  }
  
  // التحقق من وجود قيمة فعلية مدخلة (ليست فارغة)
  const hasRealInput = 
    (searchQuery2.value && searchQuery2.value.trim() !== '') ||
    (searchQuery3.value && searchQuery3.value.trim() !== '') ||
    selectedDate.value ||
    (releasePrice.value && releasePrice.value.toString().trim() !== '') ||
    (songPrice.value && songPrice.value.toString().trim() !== '') ||
    (mainGenre.value && mainGenre.value.trim() !== '') ||
    (subGenre.value && subGenre.value.trim() !== '') ||
    (gtin.value && gtin.value.trim() !== '') ||
    (catalogNumber.value && catalogNumber.value.trim() !== '') ||
    artistInputs.value.some(input => input.searchQuery && input.searchQuery.trim() !== '');
  
  if (!hasRealInput) {
    console.log('ℹ️ لا توجد قيم فعلية مدخلة بعد، انتظار إدخال المستخدم');
    return;
  }
  
  console.log('🎯 تم اكتشاف أول إدخال حقيقي - جاري إنشاء Release...');
  
  const releaseType = props.pendingReleaseType || releaseStore.releaseType;
  
  if (!releaseType) {
    console.error('❌ لا يوجد release_type');
    return;
  }

  // منع محاولات متعددة متزامنة
  if (isCreatingRelease.value) {
    console.log('⏳ جاري إنشاء Release بالفعل، انتظر...');
    return;
  }
  
  isCreatingRelease.value = true;
  
  // لا نرفع isUploading هنا لأننا لا نرفع صورة
  // isUploading خاص برفع الصور فقط
  
  try {
    // تحضير البيانات الأساسية - فقط الحقول التي تحتوي على قيم
    const releaseData = {
      release_type: releaseType
    };
    
    // إضافة الحقل title فقط إذا كان المستخدم قد كتب شيئاً
    if (searchQuery2.value && searchQuery2.value.trim() !== '') {
      releaseData.title = searchQuery2.value.trim();
    }
    
    if (searchQuery3.value && searchQuery3.value.trim() !== '') {
      releaseData.subtitle = searchQuery3.value.trim();
    }
    
    if (selectedDate.value) {
      releaseData.release_date = formatDate(selectedDate.value);
    }
    
    if (releasePrice.value && releasePrice.value.toString().trim() !== '') {
      releaseData.release_price = parseFloat(releasePrice.value);
    }
    
    if (songPrice.value && songPrice.value.toString().trim() !== '') {
      releaseData.price_per_song = parseFloat(songPrice.value);
    }
    
    if (mainGenre.value && mainGenre.value.trim() !== '') {
      releaseData.main_genre = mainGenre.value.trim();
    }
    
    if (subGenre.value && subGenre.value.trim() !== '') {
      releaseData.sub_genre = subGenre.value.trim();
    }
    
    if (gtin.value && gtin.value.trim() !== '') {
      releaseData.GTIN = gtin.value.trim();
    }
    
    if (catalogNumber.value && catalogNumber.value.trim() !== '') {
      releaseData.catalog_number = catalogNumber.value.trim();
    }
    
    const artistsList = artistInputs.value
      .filter(input => input.searchQuery && input.searchQuery.trim() !== '')
      .map(input => input.searchQuery.trim());
    
    if (artistsList.length > 0) {
      releaseData.artists = artistsList;
    }

    console.log('📤 إنشاء Release مع البيانات المدخلة:', releaseData);

    const response = await apiRequest.post('/releases', releaseData);

    console.log('✅ Release تم إنشاؤه بنجاح:', response.data);

    if (response.data?.data?.uuid) {
      const newReleaseUuid = response.data.data.uuid;
      releaseUuid.value = newReleaseUuid;
      releaseStore.currentReleaseId = newReleaseUuid;
      isReleaseCreated.value = true;
      
      // تحديث الصورة إذا كانت موجودة (ولكن لا نرفع isUploading هنا لأننا لا نرفع صورة)
      if (pendingCoverFile.value) {
        // رفع الصورة إذا وجدت - هذا سيقوم بتعيين isUploading بنفسه
        await updateCover(pendingCoverFile.value);
      }
      
      if (response.data.data.cover) {
        serverCoverUrl.value = `${storage_url}/${response.data.data.cover}`;
        localUploadedImage.value = serverCoverUrl.value;
      }
      
     router.replace({
  path: `/releases/${newReleaseUuid}/edit`,
  query: { ...route.query }
});
      
      emit('release-created', {
        releaseId: newReleaseUuid,
        coverUrl: response.data.data.cover || null
      });
      
      console.log('✅ Release created with UUID:', newReleaseUuid);
    }
  } catch (err) {
    console.error('❌ فشل إنشاء الـ Release:', err);
    errorMessage.value = err.response?.data?.message || 'Fehler beim Erstellen des Releases.';
  } finally {
    isCreatingRelease.value = false;
    // لا نقوم بتعيين isUploading.value = false هنا لأننا لم نرفعها
  }
};


// دالة مساعدة لتنسيق التاريخ
const formatDate = (dateStr) => {
  if (!dateStr) return null;
  const [day, month, yearShort] = dateStr.split('/');
  const year = parseInt(yearShort) < 50 ? `20${yearShort}` : `19${yearShort}`;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

// ========== مراقبة الحالات لإنشاء Release عند أول إدخال ==========
watch(
  [
    () => searchQuery2.value,
    () => searchQuery3.value,
    () => selectedDate.value,
    () => releasePrice.value,
    () => songPrice.value,
    () => mainGenre.value,
    () => subGenre.value,
    () => gtin.value,
    () => catalogNumber.value,
    () => artistInputs.value.map(a => a.searchQuery).join(',')
  ],
  async (newValues, oldValues) => {
    // التحقق من وجود تغيير فعلي ووجود قيمة حقيقية
    const hasRealNewValue = newValues.some(val => val && String(val).trim() !== '');
    
    if (hasRealNewValue && props.skipCreation && !isReleaseCreated.value) {
      // تأخير صغير للتأكد من أن المستخدم انتهى من الكتابة
      setTimeout(() => {
        createReleaseOnFirstInput();
      }, 500);
    }
  },
  { deep: true }
);

// Handle file selection from ImageUpload
const handleFileSelected = (file) => {
  console.log('📸 Parent: تم استلام ملف جديد:', file.name, file.type);

  if (!file || !['image/jpeg', 'image/jpg'].includes(file.type) || !file.name.toLowerCase().endsWith('.jpg')) {
    console.warn('⚠️ ملف غير صالح:', file.type, file.name);
    errorMessage.value = 'Bitte wählen Sie eine gültige JPG-Datei aus.';
    return;
  }

  pendingCoverFile.value = file;
  localUploadedImage.value = URL.createObjectURL(file);
  
  // في وضع التخطي، إذا لم يتم إنشاء Release بعد، أنشئه أولاً
  if (props.skipCreation && !isReleaseCreated.value) {
    // إنشاء Release أولاً ثم رفع الصورة
    createReleaseOnFirstInput().then(() => {
      // بعد إنشاء Release، قم برفع الصورة
      if (releaseUuid.value) {
        updateCover(file);
      }
    });
  } else if (releaseUuid.value) {
    updateCover(file);
  }
};

// تحديث الصورة عبر PATCH
const updateCover = async (file) => {
  if (!file) {
    console.warn('⚠️ لا يوجد ملف للرفع');
    return;
  }

  if (!releaseUuid.value) {
    console.warn('⚠️ لا يوجد UUID للـ release');
    return;
  }

  console.log('📤 بدء رفع الصورة إلى:', `/releases/${releaseUuid.value}`);
  isUploading.value = true;
  uploadProgress.value = 0;

  const formData = new FormData();
  formData.append('cover', file);
  formData.append('_method', 'PATCH');

  try {
    const response = await apiRequest.post(`/releases/${releaseUuid.value}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          uploadProgress.value = percentCompleted;
          console.log(`📤 تقدم الرفع: ${percentCompleted}%`);
        }
      }
    });

    console.log('✅ تم تحديث الصورة بنجاح:', response.data);

    if (response.data?.data?.cover) {
      serverCoverUrl.value = `${storage_url}/${response.data.data.cover}`;
      localUploadedImage.value = serverCoverUrl.value;
      console.log('🖼️ تم تحديث serverCoverUrl:', serverCoverUrl.value);
    }
    
    emit('cover-updated', {
      releaseId: releaseUuid.value,
      coverUrl: response.data.data?.cover || null
    });
    
  } catch (err) {
    console.error('❌ فشل تحديث الصورة:', err.response?.data || err.message);
    errorMessage.value = err.response?.data?.message || 'Fehler beim Hochladen des Covers.';
  } finally {
    // تأكد من إيقاف isUploading بعد انتهاء الرفع
    setTimeout(() => {
      isUploading.value = false;
      uploadProgress.value = 0;
      console.log('🔄 isUploading تم تعيينه إلى false');
    }, 500);
  }
};

// دالة التحديث المشتركة (debounced) لكل الحقول
const previousValues = ref({});

const updatePreviousValues = () => {
  const currentData = {
    title: searchQuery2.value?.trim() || '',
    subtitle: searchQuery3.value?.trim() || '',
    release_date: selectedDate.value?.trim() || '',
    release_price: releasePrice.value || '',
    price_per_song: songPrice.value || '',
    main_genre: mainGenre.value?.trim() || '',
    sub_genre: subGenre.value?.trim() || '',
    label: labelName.value?.trim() || '',
    production_year: productionYear.value || '',
    c_line_year: cLineYear.value || '',
    c_line_name: cLineName.value?.trim() || '',
    p_line_year: pLineYear.value || '',
    p_line_name: pLineName.value?.trim() || '',
    GTIN: gtin.value?.trim() || '',
    catalog_number: catalogNumber.value?.trim() || '',
    artists: artistInputs.value
      .filter(input => input.searchQuery.trim() !== '')
      .map(input => input.searchQuery.trim())
  };
  
  previousValues.value = currentData;
  console.log('📝 Updated previous values:', currentData);
};

// دالة التحديث المحسنة - ترسل فقط الحقول المتغيرة
const updateRelease = debounce(async () => {
  if (!releaseUuid.value) return;

  const payload = {};
  const currentData = {
    title: searchQuery2.value?.trim() || '',
    subtitle: searchQuery3.value?.trim() || '',
    release_date: selectedDate.value?.trim() || '',
    release_price: releasePrice.value || '',
    price_per_song: songPrice.value || '',
    main_genre: mainGenre.value?.trim() || '',
    sub_genre: subGenre.value?.trim() || '',
    label: labelName.value?.trim() || '',
    production_year: productionYear.value || '',
    c_line_year: cLineYear.value || '',
    c_line_name: cLineName.value?.trim() || '',
    p_line_year: pLineYear.value || '',
    p_line_name: pLineName.value?.trim() || '',
    GTIN: gtin.value?.trim() || '',
    catalog_number: catalogNumber.value?.trim() || '',
    artists: artistInputs.value
      .filter(input => input.searchQuery.trim() !== '')
      .map(input => input.searchQuery.trim())
  };

  let hasChanges = false;

  // قارن كل حقل مع القيمة السابقة
  if (currentData.title !== previousValues.value.title) {
    payload.title = currentData.title || null;
    hasChanges = true;
  }

  if (currentData.subtitle !== previousValues.value.subtitle) {
    payload.subtitle = currentData.subtitle || null;
    hasChanges = true;
  }

  if (currentData.release_date !== previousValues.value.release_date) {
    if (currentData.release_date && currentData.release_date.match(/^\d{2}\/\d{2}\/\d{2}$/)) {
      const [day, month, yearShort] = currentData.release_date.split('/');
      const year = parseInt(yearShort) < 50 ? `20${yearShort}` : `19${yearShort}`;
      payload.release_date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    } else {
      payload.release_date = null;
    }
    hasChanges = true;
  }

  if (currentData.release_price !== previousValues.value.release_price) {
    payload.release_price = currentData.release_price ? parseFloat(currentData.release_price) : null;
    hasChanges = true;
  }

  if (currentData.price_per_song !== previousValues.value.price_per_song) {
    payload.price_per_song = currentData.price_per_song ? parseFloat(currentData.price_per_song) : null;
    hasChanges = true;
  }

  if (currentData.main_genre !== previousValues.value.main_genre) {
    payload.main_genre = currentData.main_genre || null;
    hasChanges = true;
  }

  if (currentData.sub_genre !== previousValues.value.sub_genre) {
    payload.sub_genre = currentData.sub_genre || null;
    hasChanges = true;
  }

  if (currentData.label !== previousValues.value.label) {
    payload.label = currentData.label || null;
    hasChanges = true;
  }

  if (currentData.production_year !== previousValues.value.production_year) {
    payload.production_year = currentData.production_year ? parseInt(currentData.production_year) : null;
    hasChanges = true;
  }

  const cLineChanged = currentData.c_line_year !== previousValues.value.c_line_year || 
                       currentData.c_line_name !== previousValues.value.c_line_name;
  
  if (cLineChanged) {
    if (currentData.c_line_year && currentData.c_line_name) {
      payload.c_line_year = parseInt(currentData.c_line_year);
      payload.c_line_name = currentData.c_line_name;
    } else {
      payload.c_line_year = null;
      payload.c_line_name = null;
    }
    hasChanges = true;
  }

  const pLineChanged = currentData.p_line_year !== previousValues.value.p_line_year || 
                       currentData.p_line_name !== previousValues.value.p_line_name;
  
  if (pLineChanged) {
    if (currentData.p_line_year && currentData.p_line_name) {
      payload.p_line_year = parseInt(currentData.p_line_year);
      payload.p_line_name = currentData.p_line_name;
    } else {
      payload.p_line_year = null;
      payload.p_line_name = null;
    }
    hasChanges = true;
  }

  if (currentData.GTIN !== previousValues.value.GTIN) {
    payload.GTIN = currentData.GTIN || null;
    hasChanges = true;
  }

  if (currentData.catalog_number !== previousValues.value.catalog_number) {
    payload.catalog_number = currentData.catalog_number || null;
    hasChanges = true;
  }

  const artistsStr = JSON.stringify(currentData.artists);
  const prevArtistsStr = JSON.stringify(previousValues.value.artists || []);
  if (artistsStr !== prevArtistsStr) {
    payload.artists = currentData.artists.length > 0 ? currentData.artists : null;
    hasChanges = true;
  }

  if (!hasChanges) {
    console.log('ℹ️ No changes detected');
    return;
  }

  payload._method = 'PATCH';

  console.log('📤 Sending only changed fields:', payload);

  try {
    const response = await apiRequest.post(`/releases/${releaseUuid.value}`, payload);
    console.log('✅ Release updated successfully:', response.data);
    
    updatePreviousValues();
    
    emit('release-updated', {
      releaseId: releaseUuid.value,
      data: response.data?.data || payload
    });
    
  } catch (err) {
    console.error('❌ Update failed:', err.response?.data || err);
  }
}, 2000);

// مراقبة كل الحقول للتحديث (فقط إذا كان الـ Release موجود بالفعل)
watch(
  [
    searchQuery2, searchQuery3, selectedDate,
    releasePrice, songPrice, mainGenre, subGenre,
    labelName, productionYear, cLineYear, cLineName,
    pLineYear, pLineName, gtin, catalogNumber
  ],
  () => {
    if (releaseUuid.value && !props.skipCreation) {
      updateRelease();
    }
  },
  { deep: true }
);

watch(gtin, (newVal) => {
  if (newVal?.trim()) {
    isForm6Active.value = true;
    isForm6Selected.value = true;
  }
}, { immediate: true });

watch(catalogNumber, (newVal) => {
  if (newVal?.trim()) {
    isForm7Active.value = true;
    isForm7Selected.value = true;
  }
}, { immediate: true });

watch(searchQuery3, (newVal) => {
  if (newVal?.trim()) {
    isForm3Active.value = true;
    isForm3Selected.value = true;
  }
}, { immediate: true });

const currentDate = dayjs();

const recommendedDate = computed(() => {
  return currentDate.add(14, 'day').format('DD/MM/YY');
});

// مراقبة selectedDate + إظهار البوب أب
watch(selectedDate, (newDate) => {
  if (!newDate?.trim()) {
    showPopup.value = false;
    return;
  }

  let [day, month, yearShort] = newDate.split('/');
  day = parseInt(day);
  month = parseInt(month);
  yearShort = parseInt(yearShort);

  const year = yearShort < 100 ? 2000 + yearShort : yearShort;
  const selected = dayjs(`${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`);

  if (!selected.isValid()) {
    showPopup.value = false;
    return;
  }

  const todayStart = currentDate.startOf('day');
  const selectedStart = selected.startOf('day');

  const diffInDays = selectedStart.diff(todayStart, 'day');
  daysDifference.value = diffInDays;

  showPopup.value = diffInDays >= 0 && diffInDays < 14;
}, { immediate: true });

// ========== دالة معالجة اختيار التاريخ من الكالندر ==========
// في Parent.vue، تأكد من وجود هذه الدالة أو قم بتعديلها
const handleDateSelect = (formattedDate) => {
  if (!formattedDate || typeof formattedDate !== 'string') {
    return;
  }

  console.log('📅 Parent: استلام تاريخ من الكالندر:', formattedDate);
  
  selectedDate.value = formattedDate.trim();
  isForm4Selected.value = true;

  // تحقق من التاريخ وعرض البوب أب إذا لزم الأمر
  const selected = dayjs(formattedDate, 'DD/MM/YY');
  if (!selected.isValid()) {
    return;
  }

  const fullYear = selected.year() < 100 ? selected.year() + 2000 : selected.year();
  const correctedSelected = dayjs(`${fullYear}-${selected.month() + 1}-${selected.date()}`);

  const todayStart = currentDate.startOf('day');
  const selectedStart = correctedSelected.startOf('day');

  const diffInDays = selectedStart.diff(todayStart, 'day');
  daysDifference.value = diffInDays;

  showPopup.value = diffInDays >= 0 && diffInDays < 14;

  // ✅ إغلاق الكالندر بعد اختيار التاريخ
  isCalendarVisible.value = false;
  isInputFocused.value = false;
  
  console.log('🔒 تم إغلاق الكالندر بعد اختيار التاريخ');
};

const updateToRecommendedDate = () => {
  selectedDate.value = recommendedDate.value;
  isForm4Selected.value = true;
  showPopup.value = false;
  daysDifference.value = 14;
};

const fetchSpotifyResults = async (query) => {
  try {
    searchResults.value = mockData.filter(item =>
      item.type === 'artist' && item.name.toLowerCase().includes(query.toLowerCase().trim())
    );
  } catch (error) {
    console.error('Error fetching search results:', error);
    searchResults.value = [];
  }
};

const filteredSearchResults = computed(() => {
  const index = showSearchResults.value;
  if (index === null || index === undefined) return [];
  const query = artistInputs.value[index]?.searchQuery || '';
  const selectedArtists = artistInputs.value
    .map(input => input.searchQuery.trim().toLowerCase())
    .filter(name => name !== '');
  let results = mockData.filter(item => item.type === 'artist');
  if (query && query.trim()) {
    results = results.filter(item => item.name.toLowerCase().includes(query.toLowerCase().trim()));
  }
  results = results.filter(item => !selectedArtists.includes(item.name.toLowerCase()));
  return results;
});

const addArtistInput = () => {
  if (artistInputs.value.length < 2) {
    artistInputs.value.push({ searchQuery: '', isHovered: false, isFocused: false, isSelected: false });
  }
};

const removeArtistInput = () => {
  if (artistInputs.value.length === 2) {
    artistInputs.value.splice(1, 1);
  }
};

const selectSearchResult = (result, index) => {
  artistInputs.value[index].searchQuery = result.name;
  artistInputs.value[index].isSelected = true;
  artistInputs.value[index].isFocused = false;
  setTimeout(() => {
    showSearchResults.value = null;
  }, 0);
};

const updateSearchResults = async (index) => {
  if (artistInputs.value[index].searchQuery.trim() || artistInputs.value[index].isFocused) {
    showSearchResults.value = index;
    await fetchSpotifyResults(artistInputs.value[index].searchQuery);
  } else {
    showSearchResults.value = null;
    searchResults.value = [];
  }
  artistInputs.value[index].isSelected = artistInputs.value[index].searchQuery.trim() !== '';
};

const toggleForm3 = () => {
  isForm3Active.value = !isForm3Active.value;
  if (!isForm3Active.value) {
    searchQuery3.value = '';
    isForm3Selected.value = false;
  } else if (searchQuery3.value?.trim()) {
    isForm3Selected.value = true;
  }
};

const toggleForm6 = () => {
  isForm6Active.value = !isForm6Active.value;
  if (!isForm6Active.value) {
    gtin.value = '';
    isForm6Selected.value = false;
  }
};

const toggleForm7 = () => {
  isForm7Active.value = !isForm7Active.value;
  if (!isForm7Active.value) {
    catalogNumber.value = '';
    isForm7Selected.value = false;
  }
};

const updateForm6Selected = () => {
  isForm6Selected.value = isForm6Active.value && gtin.value.trim() !== '';
};

const updateForm7Selected = () => {
  isForm7Selected.value = isForm7Active.value && catalogNumber.value.trim() !== '';
};

const handleButtonArrowClick = () => {
  if (!isButtonArrowDisabled.value) {
    if (showNewRight2.value) {
      isNewRight2Visible.value = false;
      isNewFormsVisible.value = false;
      showFinalPage.value = true;
      
      setTimeout(() => {
        isNewRight2Visible.value = true;
        setTimeout(() => {
          isNewFormsVisible.value = true;
        }, 1500);
      }, 500);
    } else if (showNewRight.value) {
      isSlidingOut.value = true;
      setTimeout(() => {
        showNewRight.value = false;
        showNewRight2.value = true;
        isSlidingOut.value = false;
        emit('update:showNewRight2', true);
        setTimeout(() => {
          isNewRight2Visible.value = true;
          setTimeout(() => {
            isNewFormsVisible.value = true;
          }, 2000);
        }, 500);
      }, 500);
    } else {
      isSlidingUp.value = true;
      setTimeout(() => {
        showNewRight.value = true;
        isSlidingUp.value = false;
        emit('update:showNewRight2', false);
      }, 500);
    }
  }
};

const handleButtonArrowTopClick = () => {
  if (showFinalPage.value) {
    showFinalPage.value = false;
    isNewRight2Visible.value = false;
    isNewFormsVisible.value = false;
    setTimeout(() => {
      isNewRight2Visible.value = true;
      setTimeout(() => {
        isNewFormsVisible.value = true;
      }, 500);
    }, 500);
  } else if (showNewRight2.value) {
    showNewRight2.value = false;
    isNewRight2Visible.value = false;
    isNewFormsVisible.value = false;
    emit('update:showNewRight2', false);
    setTimeout(() => {
      showNewRight.value = true;
    }, 500);
  } else if (showNewRight.value) {
    showNewRight.value = false;
    emit('update:showNewRight2', false);
    setTimeout(() => {
      isSlidingUp.value = false;
    }, 500);
  }
};

const isButtonArrowVisible = computed(() => {
  if (showNewRight2.value && !showFinalPage.value) {
    return true;
  } else if (showNewRight.value) {
    return isReleasePriceSelected.value && isSongPriceSelected.value && isMainGenreSelected.value && isSubGenreSelected.value;
  } else {
    const allForm1Selected = artistInputs.value.length > 0 && artistInputs.value.every(input => input.isSelected);
    return allForm1Selected && isForm2Selected.value && isForm4Selected.value;
  }
});

const isButtonArrowDisabled = computed(() => {
  return showNewRight.value ? false : isForm3Active.value && !isForm3Selected.value;
});

const searchResultStyle = computed(() => {
  return {
    position: 'absolute',
    top: '48px',
    left: 0,
    width: 'calc(100% + 2px)',
    zIndex: 1000,
    display: 'block',
    visibility: 'visible',
    borderRadius: '5px'
  };
});

watch([searchQuery2, searchQuery3, selectedDate, releasePrice, songPrice, mainGenre, subGenre, gtin, catalogNumber, labelName, productionYear, cLineYear, cLineName, pLineYear, pLineName], () => {
  isForm2Selected.value = searchQuery2.value.trim() !== '';
  isForm3Selected.value = isForm3Active.value && searchQuery3.value.trim() !== '';
  isForm4Selected.value = selectedDate.value !== null;
  isReleasePriceSelected.value = releasePrice.value.trim() !== '';
  isSongPriceSelected.value = songPrice.value.trim() !== '';
  isMainGenreSelected.value = mainGenre.value.trim() !== '';
  isSubGenreSelected.value = subGenre.value.trim() !== '';
  isForm6Selected.value = isForm6Active.value && gtin.value.trim() !== '';
  isForm7Selected.value = isForm7Active.value && catalogNumber.value.trim() !== '';
  isForm8Selected.value = labelName.value.trim() !== '';
  isForm9Selected.value = productionYear.value.trim() !== '';
  isForm10Selected.value = cLineYear.value.trim() !== '' && cLineName.value.trim() !== '';
  isForm11Selected.value = pLineYear.value.trim() !== '' && pLineName.value.trim() !== '';
}, { deep: true, immediate: true });
</script>

<!-- أضف الأنماط هنا إذا كانت موجودة -->

<style lang="scss" scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Heebo', sans-serif;
}

img[alt] {
  text-indent: -9999px;
}

.upload {
  display: flex;
  align-items: flex-start;
  align-self: stretch;
  position: relative;
  // height: 100%;
  gap: 110px;
}

// 🆕 Left Section - ارتفاع طبيعي فقط
.left-section {
  flex-shrink: 0; // لا ينكمش
  height: auto; // ارتفاع طبيعي حسب المحتوى
}

.right2-full-height {
  flex: 1; // يأخذ المساحة المتبقية
  min-height: 0; // مهم لتفعيل flex: 1 مع overflow
  height: 100%; // ارتفاع كامل
}

.button-arrow-top {
  display: flex;
  justify-content: center;
  width: 30px;
  height: 30px;
  padding: 12px 8px 10px 8px;
  align-items: center;
  gap: 10px;
  position: absolute;
  right: -10px;
  top: 20px;
  border-radius: 15px;
  background: var(--primary);
  cursor: pointer;
  transition: background 0.3s ease;
  rotate: 180deg;
  z-index: 10;
}

.button-arrow {
  display: flex;
  justify-content: center;
  width: 30px;
  height: 30px;
  padding: 12px 8px 10px 8px;
  align-items: center;
  gap: 10px;
  position: absolute;
  right: -9px;
  bottom: 0px;
  border-radius: 15px;
  background: var(--Strawberry);
  cursor: pointer;
  transition: background 0.3s ease;
}

.button-arrow.disabled {
  background: var(--Main-Colors-Dove, #6A6C6D);
  pointer-events: none;
  opacity: 0.6;
}

.button-arrow .down {
  width: auto;
  flex-shrink: 0;
}

.btn-right {
    position: absolute;
    right: -10px;
    bottom: 0px;
    border-radius: 5px;
    background: #D15;
    display: flex;
    padding: 12px 20px 12px 20px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    height: 36px;
    color: var(--Main-Colors-White, #FFF);
    font-family: Heebo;
    font-size: 16px;
    font-style: normal;
    font-weight: 400;
    line-height: 0.9;
    text-transform: uppercase;
    cursor: pointer;
    z-index: 11;
    

    &:hover{
        transition: .3s ease;
        background: var(--dark-red);
    }
}

@media  (min-width:1440px) and (max-width:1599px) {
    .upload{
      gap: 110px;
    }
}

@media  (min-width:1600px) and (max-width:2074px) {
    .upload{
      gap: 122px;
    }

    .button-arrow-top{
      top: 10px;
    }
}

@media  (min-width:2075px) and (max-width:2560px) {
   .button-arrow-top{
    top: 40px;
   }
}
</style>