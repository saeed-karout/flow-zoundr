<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick, inject } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { debounce } from '@/utils/debounce';
import apiRequest from '@/lib/apiRequest';
import { useReleaseStore } from '@/stores/release';
import dayjs from 'dayjs';
import { storage_url } from '@/constants';
import { isRealImage } from '@/utils/imageUtils';
import VideoPopup from './VideoPopup.vue';
import ImageUpload from './ImageUpload.vue';
import FormLeft from './FormLeft.vue';
import RightSection from './RightSection.vue';
import NewRightSection from './NewRightSection.vue';
import NewRight2Section from './NewRight2Section.vue';
import PopUpDays from '../../../components/modals/PopUpDays.vue';

const route = useRoute();
const router = useRouter();

// ========== 🔥 Inject draftRelease من UploadPNG ==========
const draftRelease = inject('draftRelease', null);

// ========== 🔥 حالة التحميل ==========
const isLoading = ref(true);
const isDataLoaded = ref(false);

const searchArtistsResults = ref([]);
const isSearchingArtists = ref(false);
const hasSubGenresAvailable = ref(true);
let isUpdatingArtists = false;
let pendingArtistUpdate = null;
let isCreatingFromInput = false;

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
  isEditSongMode: { type: Boolean, default: false },
  releaseUuid: { type: String, default: null }
});

// Define emits
const emit = defineEmits(['update:title', 'next', 'update:showNewRight2', 'cover-updated', 'release-updated', 'release-created']);

// ========== STORAGE_URL ==========
const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || 'https://zoundr-flow-api.davinda.dev/storage';

// ========== التحقق من وضع التعديل ==========
const isEditMode = computed(() => {
  return props.editMode === 'release' || props.editMode === 'song' || props.isEditSongMode;
});

// دالة الانتقال للخطوة التالية
const handleNextStep = () => {
  console.log('Weiter zu Songs تم الضغط → تمرير next للأعلى');
  
  // ✅ إزالة showTypeSelection من query عند الانتقال من Metas
  const { showTypeSelection: _, ...restQuery } = route.query;
  router.replace({ query: restQuery });
  
  emit('next');
};

// Video Popup
const showVideoPopup = ref(false);
const videoId = ref('');
const videoIds = {
  form1: '480705053',
  form2: '480705053',
  form3: '480705053',
  form4: '480705053',
  form5: '480705053',
  form6: '480705053',
  form7: '480705053',
  form8: '480705053',
  form9: '480705053',
  form10: '480705053',
  form11: '480705053',
  form12: '480705053',
  form13: '480705053',
  form14: '480705053',
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

// ========== STATE ==========
const uploadedImage = ref(null);
const serverCoverUrl = ref(null);
const releaseUuid = ref(null);
const isUploading = ref(false);
const fileProgress = ref(0);
const pendingCoverFile = ref(null);
const errorMessage = ref('');
const releaseStore = useReleaseStore();
const isReleaseCreated = ref(false);

// ========== FORM STATE ==========
const artistInputs = ref([{ searchQuery: '', isHovered: false, isFocused: false, isSelected: false, artistData: null }]);
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
const pendingReleaseType = ref(null);
const showMetasFromRight = ref(false);

const form4Container = ref(null);

const closeCalendar = () => {
  if (isCalendarVisible.value) {
    console.log('🔒 إغلاق الكالندر');
    isCalendarVisible.value = false;
    isInputFocused.value = false;
    nextTick();
  }
};

const handleClickOutside = (event) => {
  if (isCalendarVisible.value && form4Container.value && !form4Container.value.contains(event.target)) {
    console.log('🔒 إغلاق الكالندر - نقر خارجي على form4Container');
    closeCalendar();
  }
};

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

// ========== 🔥 دالة مسح بيانات الصورة ==========
const clearCoverData = () => {
  localStorage.removeItem('temp_cover_url');
  localStorage.removeItem('temp_cover_full_url');
  localStorage.removeItem('temp_cover_base64');
  localStorage.removeItem('releaseCover');
  console.log('🗑️ تم مسح بيانات الصورة من localStorage');
};

// ========== دوال الفنانين ==========
const fetchArtistsFromAPI = async (query) => {
  if (!query || query.trim() === '') {
    searchArtistsResults.value = [];
    return;
  }
  
  isSearchingArtists.value = true;
  
  try {
    const response = await apiRequest.get(`/artists?q=${encodeURIComponent(query.trim())}&limit=20`);
    
    console.log('📡 API Response:', response.data);
    
    let artists = [];
    if (response.data?.data && Array.isArray(response.data.data)) {
      artists = response.data.data;
    } else if (response.data && Array.isArray(response.data)) {
      artists = response.data;
    } else if (response.data?.artists && Array.isArray(response.data.artists)) {
      artists = response.data.artists;
    }
    
    console.log(`✅ تم جلب ${artists.length} فنان`);
    searchArtistsResults.value = artists;
    
  } catch (error) {
    console.error('❌ خطأ في جلب الفنانين:', error);
    searchArtistsResults.value = [];
  } finally {
    isSearchingArtists.value = false;
  }
};

const updateSearchResults = debounce(async (index, query) => {
  console.log('🔍 updateSearchResults called - index:', index, 'query:', query);
  
  if (query && query.trim()) {
    await fetchArtistsFromAPI(query);
  } else {
    searchArtistsResults.value = [];
  }
  
  if (artistInputs.value[index] && (artistInputs.value[index].searchQuery?.trim() || artistInputs.value[index].isFocused)) {
    showSearchResults.value = index;
    console.log('✅ showSearchResults set to:', index);
  } else {
    showSearchResults.value = null;
    searchArtistsResults.value = [];
  }
  
  if (artistInputs.value[index]) {
    artistInputs.value[index].isSelected = artistInputs.value[index].searchQuery?.trim() !== '';
  }
}, 500);

const filteredSearchResults = computed(() => {
  const index = showSearchResults.value;
  if (index === null || index === undefined) return [];
  
  const results = searchArtistsResults.value.filter(item => item && item.name);
  
  console.log(`📊 filteredSearchResults: ${results.length} نتائج`);
  console.log('📊 جميع النتائج:', results.map(r => r.name));
  
  return results;
});

// ========== 🔥 دالة رفع الصورة ==========
const uploadCoverImage = async (file) => {
  if (!releaseUuid.value) {
    console.error('❌ لا يوجد releaseUuid');
    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: { 
        message: 'Keine Release-ID gefunden. Bitte erstelle zuerst einen Release.', 
        type: 'error' 
      }
    }));
    return;
  }
  
  // ✅ منع التحميل المتكرر
  if (isUploading.value) {
    console.log('⏳ جاري تحميل الصورة بالفعل');
    return;
  }
  
  isUploading.value = true;
  fileProgress.value = 0;
  
  try {
    const formData = new FormData();
    formData.append('cover', file);
    formData.append('_method', 'PATCH');
    
    console.log('📤 [Parent] تحديث الصورة في الـ Release:', {
      releaseUuid: releaseUuid.value,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    });
    
    const progressInterval = setInterval(() => {
      if (fileProgress.value < 90) {
        fileProgress.value += 5;
      }
    }, 200);
    
    const response = await apiRequest.post(
      `/releases/${releaseUuid.value}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        params: {
          _method: 'PATCH'
        }
      }
    );
    
    clearInterval(progressInterval);
    fileProgress.value = 100;
    
    console.log('✅ [Parent] تم تحديث الصورة بنجاح:', response.data);
    
    const coverData = response.data.data || response.data;
    const coverPath = coverData.cover || coverData.path;
    
    if (coverPath) {
      let fullUrl = coverPath;
      if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://') && !fullUrl.startsWith('blob:')) {
        fullUrl = `${STORAGE_URL}/${coverPath}`;
      }
      
      serverCoverUrl.value = fullUrl;
      uploadedImage.value = fullUrl;
      
      // ✅ تحديث serverCoverUrl في الـ Store
      releaseStore.setServerCoverUrl(fullUrl);
      
      emit('cover-updated', { coverUrl: fullUrl });
      
      localStorage.setItem('releaseCover', fullUrl);
      localStorage.setItem('temp_cover_url', coverPath);
      localStorage.setItem('temp_cover_full_url', fullUrl);
      localStorage.setItem('upload_server_cover_url', fullUrl);
      
      console.log('💾 تم حفظ الصورة في localStorage');
    }
    
    setTimeout(() => {
      isUploading.value = false;
      fileProgress.value = 0;
    }, 1000);
    
    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: { 
        message: 'Cover erfolgreich hochgeladen!', 
        type: 'success' 
      }
    }));
    
  } catch (error) {
    console.error('❌ [Parent] فشل تحديث الصورة:', error);
    
    fileProgress.value = 0;
    isUploading.value = false;
    
    let errorMessage = 'Fehler beim Hochladen des Covers.';
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.response?.data?.errors) {
      const errors = Object.values(error.response.data.errors).flat();
      errorMessage = errors.join(', ');
    }
    
    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: { 
        message: errorMessage, 
        type: 'error' 
      }
    }));
  }
};

// ========== 🔥 دالة handleFileUpload المعدلة ==========
const handleFileUpload = async (file) => {
  console.log('📸 Parent: تم استلام ملف جديد:', file.name, file.type, 'حجم:', (file.size / 1024 / 1024).toFixed(2), 'MB');

  if (!file || !['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
    console.warn('⚠️ ملف غير صالح:', file.type, file.name);
    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: { 
        message: 'Bitte wählen Sie eine gültige JPEG oder PNG Datei aus.', 
        type: 'error' 
      }
    }));
    return;
  }

  if (file.size > 8 * 1024 * 1024) {
    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: { 
        message: 'Das Bild ist sehr groß. Der Upload kann einige Zeit dauern.', 
        type: 'warning' 
      }
    }));
  }

  const previewUrl = URL.createObjectURL(file);
  uploadedImage.value = previewUrl;
  
  pendingCoverFile.value = file;
  
  // 🔥🔥🔥 التحقق من وجود Release
  const hasRelease = !!(releaseUuid.value || releaseStore.currentReleaseId || props.releaseUuid);
  
  if (hasRelease) {
    console.log('📌 يوجد Release، تحديث الصورة فقط (UUID:', releaseUuid.value || releaseStore.currentReleaseId || props.releaseUuid, ')');
    // ✅ تحديث الصورة فقط، لا تنشئ Release جديد
    await uploadCoverImage(file);
  } else {
    console.log('📌 لا يوجد releaseUuid، إنشاء Release جديد مع الصورة');
    // ✅ إنشاء Release جديد مع الصورة
    await createReleaseWithAllData(file);
  }
};

const handleImagePreview = (previewUrl) => {
  console.log('🖼️ [Parent] Preview محلي:', previewUrl);
  uploadedImage.value = previewUrl;
};

const removeCover = async () => {
  if (!releaseUuid.value) {
    uploadedImage.value = null;
    serverCoverUrl.value = null;
    clearCoverData();
    return;
  }
  
  try {
    await apiRequest.delete(`/releases/${releaseUuid.value}/cover`);
    
    serverCoverUrl.value = null;
    uploadedImage.value = null;
    clearCoverData();
    
    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: { 
        message: 'Cover wurde entfernt.', 
        type: 'info' 
      }
    }));
    
  } catch (error) {
    console.error('❌ [Parent] فشل حذف الصورة:', error);
    serverCoverUrl.value = null;
    uploadedImage.value = null;
    clearCoverData();
  }
};

// ========== دوال التاريخ ==========
const computeRecommendedDate = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const targetDate = new Date(today);
  targetDate.setDate(targetDate.getDate() + 14);
  
  const currentDay = targetDate.getDay();
  let daysToAdd = 0;
  
  if (currentDay <= 5) {
    daysToAdd = 5 - currentDay;
  } else {
    daysToAdd = (5 - currentDay) + 7;
  }
  
  targetDate.setDate(targetDate.getDate() + daysToAdd);
  
  const day = String(targetDate.getDate()).padStart(2, '0');
  const month = String(targetDate.getMonth() + 1).padStart(2, '0');
  const year = String(targetDate.getFullYear()).slice(-2);
  return `${day}/${month}/${year}`;
};

const recommendedDateForPlaceholder = computed(() => {
  return computeRecommendedDate();
});

const calculateRecommendedDateFrom = (dateStr) => {
  if (!dateStr) {
    const today = dayjs();
    let targetDate = today.add(14, 'day');
    const currentDay = targetDate.day();
    let daysToAdd = currentDay <= 5 ? 5 - currentDay : (5 - currentDay) + 7;
    targetDate = targetDate.add(daysToAdd, 'day');
    return targetDate.format('DD/MM/YY');
  }
  
  const [day, month, yearShort] = dateStr.split('/');
  const year = parseInt(yearShort) < 50 ? 2000 + parseInt(yearShort) : 1900 + parseInt(yearShort);
  const date = dayjs(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
  
  if (!date.isValid()) {
    const today = dayjs();
    let targetDate = today.add(14, 'day');
    const currentDay = targetDate.day();
    let daysToAdd = currentDay <= 5 ? 5 - currentDay : (5 - currentDay) + 7;
    targetDate = targetDate.add(daysToAdd, 'day');
    return targetDate.format('DD/MM/YY');
  }
  
  let targetDate = date.add(14, 'day');
  const currentDay = targetDate.day();
  let daysToAdd = 0;
  
  if (currentDay <= 5) {
    daysToAdd = 5 - currentDay;
  } else {
    daysToAdd = (5 - currentDay) + 7;
  }
  
  targetDate = targetDate.add(daysToAdd, 'day');
  const formattedDate = targetDate.format('DD/MM/YY');
  console.log('📅 calculateRecommendedDateFrom - من:', dateStr, '→ إلى:', formattedDate);
  return formattedDate;
};

const recommendedDate = computed(() => {
  if (selectedDate.value) {
    return calculateRecommendedDateFrom(selectedDate.value);
  }
  return calculateRecommendedDateFrom(null);
});

const updateToRecommendedDate = () => {
  const today = dayjs();
  let targetDate = today.add(14, 'day');
  const currentDay = targetDate.day();
  let daysToAdd = 0;
  
  if (currentDay <= 5) {
    daysToAdd = 5 - currentDay;
  } else {
    daysToAdd = (5 - currentDay) + 7;
  }
  
  targetDate = targetDate.add(daysToAdd, 'day');
  const formattedDate = targetDate.format('DD/MM/YY');
  
  console.log('📅 updateToRecommendedDate - التاريخ الموصى به (من اليوم الحالي):', formattedDate);
  
  selectedDate.value = formattedDate;
  isForm4Selected.value = true;
  showPopup.value = false;
  
  const todayStart = dayjs().startOf('day');
  const selectedStart = targetDate.startOf('day');
  daysDifference.value = selectedStart.diff(todayStart, 'day');
  
  console.log('📅 updateToRecommendedDate - الفرق بالأيام:', daysDifference.value);
  
  if (releaseUuid.value) {
    setTimeout(() => {
      updateRelease();
    }, 100);
  }
};

// ========== 🔥 دالة resetReturningFromSongs ==========
const resetReturningFromSongs = () => {
  releaseStore.resetReturningFromSongs();
  console.log('🔄 [Parent] resetReturningFromSongs called');
};

// ========== 🔥 onMounted المعدل ==========
onMounted(async () => {
  // 🔥 إظهار الـ loading
  isLoading.value = true;
  
  document.addEventListener('click', handleGlobalClick);
  document.addEventListener('click', handleClickOutside);
  
  console.log('🚀 Parent.vue mounted');
  console.log('📌 props.editMode:', props.editMode);
  console.log('📌 props.isEditSongMode:', props.isEditSongMode);
  console.log('📌 props.releaseUuid:', props.releaseUuid);
  console.log('📌 releaseStore.currentReleaseId:', releaseStore.currentReleaseId);
  console.log('📌 isEditMode.value:', isEditMode.value);
  console.log('📌 props.skipCreation:', props.skipCreation);
  
  // 🔥 إذا كان هناك releaseUuid من props أو من المتجر، نعتبر الـ Release موجوداً
  const hasValidReleaseId = props.releaseUuid || releaseStore.currentReleaseId || route.params.releaseUuid;
  const isInEditMode = isEditMode.value;
  const isNewRelease = !hasValidReleaseId && !isInEditMode;
  
  if (hasValidReleaseId) {
    const uuid = props.releaseUuid || releaseStore.currentReleaseId || route.params.releaseUuid;
    releaseUuid.value = uuid;
    releaseStore.setCurrentReleaseId(uuid);
    isReleaseCreated.value = true;
    console.log('📦 تم تعيين releaseUuid:', uuid);
  }
  
  // 🔥🔥🔥 استعادة الصورة من الـ Store أولاً (أولوية قصوى)
  const storeCoverUrl = releaseStore.serverCoverUrl;
  
  if (storeCoverUrl && isRealImage(storeCoverUrl) && !uploadedImage.value && !serverCoverUrl.value) {
    console.log('🖼️ استعادة الصورة من Store:', storeCoverUrl);
    uploadedImage.value = storeCoverUrl;
    serverCoverUrl.value = storeCoverUrl;
    
    if (releaseStore && !releaseStore._startComplete) {
      releaseStore.setStartComplete(true);
    }
  }
  
  // 🔥🔥🔥 استعادة الصورة من localStorage (ثانوية)
  const savedCoverUrl = localStorage.getItem('upload_server_cover_url') || 
                        localStorage.getItem('temp_cover_full_url');
  
  if (savedCoverUrl && !uploadedImage.value && !serverCoverUrl.value) {
    console.log('🖼️ استعادة الصورة من localStorage:', savedCoverUrl);
    uploadedImage.value = savedCoverUrl;
    serverCoverUrl.value = savedCoverUrl;
    
    if (releaseStore && !releaseStore._startComplete) {
      releaseStore.setStartComplete(true);
    }
  }
  
  // ✅ استخدام serverCoverUrl من props إذا كان موجوداً وحقيقياً
  if (props.serverCoverUrl && isRealImage(props.serverCoverUrl) && !uploadedImage.value) {
    console.log('🖼️ توجد صورة من props.serverCoverUrl:', props.serverCoverUrl);
    uploadedImage.value = props.serverCoverUrl;
    serverCoverUrl.value = props.serverCoverUrl;
    
    if (releaseStore && !releaseStore._startComplete) {
      releaseStore.setStartComplete(true);
    }
  }
  
  // ✅ إذا كان هناك releaseUuid، لا نمسح الصورة
  if (hasValidReleaseId) {
    console.log('📌 يوجد releaseUuid، الحفاظ على الصورة');
    // لا نمسح الصورة
    
    // ✅ إذا كان هناك صورة في الـ Store، استخدمها
    if (releaseStore.serverCoverUrl && isRealImage(releaseStore.serverCoverUrl) && !uploadedImage.value) {
      uploadedImage.value = releaseStore.serverCoverUrl;
      serverCoverUrl.value = releaseStore.serverCoverUrl;
      console.log('🖼️ استخدام الصورة من الـ Store:', releaseStore.serverCoverUrl);
    }
  } else if (props.skipCreation || isNewRelease) {
    console.log('🆕 وضع التخطي أو إنشاء جديد - مسح الصورة وعدم استرجاعها');
    clearCoverData();
    uploadedImage.value = null;
    serverCoverUrl.value = null;
    isLoading.value = false;
    isDataLoaded.value = true;
    return;
  }
  
  // 🔥 استرجاع الصورة من localStorage (مرة أخرى للتأكيد) - فقط إذا لم تكن موجودة
  if (!uploadedImage.value && !serverCoverUrl.value) {
    const tempCoverFullUrl = localStorage.getItem('temp_cover_full_url');
    if (tempCoverFullUrl) {
      console.log('🖼️ استرجاع الصورة من localStorage عند التحميل:', tempCoverFullUrl);
      uploadedImage.value = tempCoverFullUrl;
      serverCoverUrl.value = tempCoverFullUrl;
    }
  }
  
  if (props.uploadedImage && isRealImage(props.uploadedImage) && !uploadedImage.value) {
    console.log('🖼️ توجد صورة من props:', props.uploadedImage);
    uploadedImage.value = props.uploadedImage;
    serverCoverUrl.value = props.uploadedImage;
  }
  
  // ========== تحميل البيانات ==========
  if (isEditMode.value) {
    console.log('✏️ وضع التعديل - جلب البيانات');
    
    const uuid = props.releaseUuid || releaseStore.currentReleaseId || route.params.releaseUuid;
    
    if (uuid) {
      releaseUuid.value = uuid;
      releaseStore.setCurrentReleaseId(uuid);
      
      try {
        console.log('📡 جلب بيانات الـ Release:', uuid);
        const response = await apiRequest.get(`/releases/${uuid}`);
        const release = response.data?.data;
        
        if (release) {
          console.log('✅ تم جلب بيانات الـ Release:', release);
          emit('release-updated', {
            releaseId: release.uuid,
            data: release
          });
          fillReleaseData(release);
          isReleaseCreated.value = true;
          
          // 🔥 إعادة تعيين حالة العودة من Songs بعد تحميل البيانات
          setTimeout(() => {
            resetReturningFromSongs();
          }, 500);
        } else {
          console.warn('⚠️ لم يتم العثور على الـ Release');
        }
      } catch (err) {
        console.error('❌ فشل جلب الـ Release:', err);
      }
    } else {
      console.warn('⚠️ لا يوجد releaseUuid للتعديل');
    }
    isLoading.value = false;
    isDataLoaded.value = true;
    return;
  }
  
  if (props.skipCreation) {
    console.log('⏭️ وضع التخطي نشط - لن يتم جلب أي مسودة');
    clearCoverData();
    resetAllFields();
    isLoading.value = false;
    isDataLoaded.value = true;
    return;
  }
  
  if (releaseStore.currentReleaseId && !releaseUuid.value) {
    console.log('🆕 إنشاء Release جديد - لا نجلب بيانات قديمة');
    // ✅ لا نمسح الصورة إذا كانت موجودة
    isLoading.value = false;
    isDataLoaded.value = true;
    return;
  }
  
  if (releaseUuid.value) {
    console.log('📦 جلب بيانات Release للتعديل:', releaseUuid.value);
    try {
      const response = await apiRequest.get(`/releases/${releaseUuid.value}`);
      const release = response.data?.data;
      if (release) {
        emit('release-updated', {
          releaseId: release.uuid,
          data: release
        });
        fillReleaseData(release);
        isReleaseCreated.value = true;
        
        // 🔥 إعادة تعيين حالة العودة من Songs بعد تحميل البيانات
        setTimeout(() => {
          resetReturningFromSongs();
        }, 500);
      }
    } catch (err) {
      console.error('فشل جلب الـ Release:', err);
    }
    isLoading.value = false;
    isDataLoaded.value = true;
    return;
  }
  
  if (releaseStore.currentReleaseId) {
    releaseUuid.value = releaseStore.currentReleaseId;
    console.log('📦 تم الحصول على releaseUuid من المتجر:', releaseUuid.value);
    
    try {
      const response = await apiRequest.get(`/releases/${releaseUuid.value}`);
      const release = response.data?.data;
      
      if (release) {
        emit('release-updated', {
          releaseId: release.uuid,
          data: release
        });
        fillReleaseData(release);
        isReleaseCreated.value = true;
        
        // 🔥 إعادة تعيين حالة العودة من Songs بعد تحميل البيانات
        setTimeout(() => {
          resetReturningFromSongs();
        }, 500);
      }
    } catch (err) {
      console.error('فشل جلب الـ Release:', err);
    }
    isLoading.value = false;
    isDataLoaded.value = true;
    return;
  }
  
  console.log('📋 لا يوجد releaseUuid محدد، لا نجلب أي بيانات');
  clearCoverData();
  resetAllFields();
  isLoading.value = false;
  isDataLoaded.value = true;
});

// ========== 🔥 مراقبة serverCoverUrl من الـ Store ==========
watch(
  () => releaseStore.serverCoverUrl,
  (newUrl) => {
    if (newUrl && isRealImage(newUrl)) {
      console.log('🖼️ [Parent] استقبال serverCoverUrl من Store:', newUrl);
      uploadedImage.value = newUrl;
      serverCoverUrl.value = newUrl;
      
      // ✅ تحديث _startComplete
      if (releaseStore && !releaseStore._startComplete) {
        releaseStore.setStartComplete(true);
      }
    }
  },
  { immediate: true, deep: true }
);

onUnmounted(() => {
  document.removeEventListener('click', handleGlobalClick);
  document.removeEventListener('click', handleClickOutside);
  document.body.style.overflow = '';
});

// ========== دوال إعادة التعيين ==========
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
  
  artistInputs.value = [{ searchQuery: '', isHovered: false, isFocused: false, isSelected: false, artistData: null }];
  
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

// ========== 🔥 تحديد الصفحة المناسبة في Metas ==========
const determineMetasPage = (release) => {
  if (!release) {
    console.warn('⚠️ No release data for determineMetasPage');
    return 'right';
  }
  
  // 🔥 أولاً: التحقق من وجود بيانات متقدمة (NewRight2)
  const hasAdvancedData = release.label || 
                         release.production_year || 
                         release.c_line_name || 
                         release.c_line_year || 
                         release.p_line_name || 
                         release.p_line_year;
  
  if (hasAdvancedData) {
    console.log('📌 توجد بيانات متقدمة → NewRight2');
    return 'newRight2';
  }
  
  // 🔥 ثانياً: التحقق من وجود بيانات السعر والنوع (NewRight)
  const hasPricingData = release.release_price || 
                        release.price_per_song || 
                        release.main_genre || 
                        release.sub_genre;
  
  if (hasPricingData) {
    console.log('📌 توجد بيانات السعر والنوع → NewRight');
    return 'newRight';
  }
  
  // 🔥 ثالثاً: محاولة الحصول على الصفحة من query
  let savedPage = route.query.lastPage || null;
  
  // 🔥 رابعاً: إذا لم تكن في query، استخدم metasPage من الـ Store
  if (!savedPage) {
    savedPage = releaseStore.metasPage || null;
    console.log('📌 metasPage from Store:', savedPage);
  }
  
  // 🔥 خامساً: إذا كان هناك savedPage، استخدمه
  if (savedPage) {
    console.log(`📌 استعادة آخر صفحة محفوظة: ${savedPage}`);
    return savedPage;
  }
  
  // 🔥 الصفحة الافتراضية
  console.log('📌 الصفحة الافتراضية → Right');
  return 'right';
};

// ========== 🔥 updateStoreMetasData المعدلة ==========
const updateStoreMetasData = () => {
  const artists = artistInputs.value
    .filter(input => input.searchQuery && input.searchQuery.trim() !== '')
    .map(input => input.searchQuery.trim());
  
  const hasTitle = searchQuery2.value && searchQuery2.value.trim() !== '';
  const hasArtists = artists.length > 0;
  const hasReleaseDate = selectedDate.value && selectedDate.value.trim() !== '';
  
  // 🔥🔥🔥 التحقق من حالة العودة من Songs
  const isReturningFromSongs = releaseStore._isReturningFromSongs || false;
  
  if (isReturningFromSongs) {
    console.log('🔄 [Parent] عودة من Songs، تحديث metasData فقط دون تغيير isMetasComplete');
    // ✅ فقط نحدث البيانات في metasData دون تغيير isMetasComplete
    releaseStore.metasData = {
      ...releaseStore.metasData,
      title: searchQuery2.value || '',
      subtitle: searchQuery3.value || '',
      releaseDate: selectedDate.value || null,
      artists: artists,
      releasePrice: releasePrice.value || null,
      songPrice: songPrice.value || null,
      mainGenre: mainGenre.value || '',
      subGenre: subGenre.value || '',
      label: labelName.value || '',
      productionYear: productionYear.value || null,
      cLineYear: cLineYear.value || null,
      cLineName: cLineName.value || '',
      pLineYear: pLineYear.value || null,
      pLineName: pLineName.value || '',
      gtin: gtin.value || '',
      catalogNumber: catalogNumber.value || ''
    };
    console.log('📌 [Parent] metasData updated (preserving isMetasComplete:', releaseStore.isMetasComplete, ')');
    return;
  }
  
  // ✅ التحديث العادي
  releaseStore.updateMetasData({
    title: searchQuery2.value || '',
    subtitle: searchQuery3.value || '',
    releaseDate: selectedDate.value || null,
    artists: artists,
    releasePrice: releasePrice.value || null,
    songPrice: songPrice.value || null,
    mainGenre: mainGenre.value || '',
    subGenre: subGenre.value || '',
    label: labelName.value || '',
    productionYear: productionYear.value || null,
    cLineYear: cLineYear.value || null,
    cLineName: cLineName.value || '',
    pLineYear: pLineYear.value || null,
    pLineName: pLineName.value || '',
    gtin: gtin.value || '',
    catalogNumber: catalogNumber.value || ''
  });
  
  // 🔥 تحديث isMetasComplete في الـ Store - التحقق من وجود songUuid
  const hasSongUuid = !!(releaseStore.songUuid || route.params.songUuid || route.query.song);
  
  if (hasSongUuid) {
    console.log('🎵 [Parent] يوجد songUuid، الحفاظ على isMetasComplete:', releaseStore.isMetasComplete);
  } else {
    const isComplete = hasTitle && hasArtists && hasReleaseDate;
    // ✅ فقط إذا كانت القيمة مختلفة، نقوم بالتحديث
    if (releaseStore.isMetasComplete !== isComplete) {
      releaseStore.setMetasComplete(isComplete);
      console.log('📌 Store: isMetasComplete set to', isComplete);
    } else {
      console.log('📌 Store: isMetasComplete unchanged (already', isComplete, ')');
    }
    console.log('📌 Data:', { hasTitle, hasArtists, hasReleaseDate });
  }
  
  // 🔥 تحديث حالة الأغاني من draftRelease (الذي يأتي من UploadPNG)
  if (draftRelease?.value?.songs) {
    const songs = draftRelease.value.songs;
    const allSongsComplete = songs.every(song => {
      const hasSongTitle = song.title && song.title.trim() !== '';
      const hasSongFile = song.song_file !== null && song.song_file !== undefined && song.song_file !== '';
      const hasCover = song.cover !== null && song.cover !== undefined && song.cover !== '';
      const hasAuthors = song.composers && song.composers.length > 0;
      return hasSongTitle && hasSongFile && hasCover && hasAuthors;
    });
    
    if (releaseStore.isSongsComplete !== allSongsComplete) {
      releaseStore.setSongsComplete(allSongsComplete);
    }
    console.log('📌 حالة Songs من draftRelease:', allSongsComplete);
  } else {
    console.log('📌 لا يوجد draftRelease أو لا توجد أغاني');
  }
};

// ========== 🔥 fillReleaseData (المعدلة) ==========
const fillReleaseData = (release) => {
  if (!release) {
    console.warn('⚠️ لا توجد بيانات لملءها');
    return;
  }
  
  console.log('📝 ملء البيانات من الـ Release:', release.uuid);
  
  // 🔥 تعيين releaseUuid
  releaseUuid.value = release.uuid;
  releaseStore.setReleaseType(release.release_type);
  releaseStore.setCurrentReleaseId(release.uuid);
  isReleaseCreated.value = true;

  // ========== 1. تعبئة البيانات الأساسية ==========
  // 🔥 العنوان (title)
  searchQuery2.value = release.title || '';
  isForm2Selected.value = searchQuery2.value.trim() !== '';
  
  // 🔥 العنوان الفرعي (subtitle)
  searchQuery3.value = release.subtitle || '';
  if (searchQuery3.value.trim() !== '') {
    isForm3Active.value = true;
    isForm3Selected.value = true;
  } else {
    isForm3Active.value = false;
    isForm3Selected.value = false;
  }
  
  // 🔥 تاريخ الإصدار (release_date)
  if (release.release_date) {
    const dateObj = dayjs(release.release_date);
    if (dateObj.isValid()) {
      selectedDate.value = dateObj.format('DD/MM/YY');
      isForm4Selected.value = true;
    }
  } else {
    selectedDate.value = null;
    isForm4Selected.value = false;
  }
  
  // 🔥 السعر (release_price)
  releasePrice.value = release.release_price || '';
  isReleasePriceSelected.value = releasePrice.value !== '' && releasePrice.value !== null && releasePrice.value !== undefined;
  
  // 🔥 سعر الأغنية (price_per_song)
  songPrice.value = release.price_per_song || '';
  isSongPriceSelected.value = songPrice.value !== '' && songPrice.value !== null && songPrice.value !== undefined;
  
  // 🔥 النوع الرئيسي (main_genre)
  mainGenre.value = release.main_genre || '';
  isMainGenreSelected.value = mainGenre.value.trim() !== '';
  
  // 🔥 النوع الفرعي (sub_genre)
  subGenre.value = release.sub_genre || '';
  isSubGenreSelected.value = subGenre.value.trim() !== '';
  
  // 🔥 التسمية (label)
  labelName.value = release.label || '';
  isForm8Selected.value = labelName.value.trim() !== '';
  
  // 🔥 سنة الإنتاج (production_year)
  productionYear.value = release.production_year || '';
  isForm9Selected.value = productionYear.value.trim() !== '';
  
  // 🔥 C Line
  cLineYear.value = release.c_line_year || '';
  cLineName.value = release.c_line_name || '';
  isForm10Selected.value = cLineYear.value.trim() !== '' && cLineName.value.trim() !== '';
  
  // 🔥 P Line
  pLineYear.value = release.p_line_year || '';
  pLineName.value = release.p_line_name || '';
  isForm11Selected.value = pLineYear.value.trim() !== '' && pLineName.value.trim() !== '';
  
  // 🔥 GTIN
  gtin.value = release.GTIN || '';
  if (gtin.value.trim() !== '') {
    isForm6Active.value = true;
    isForm6Selected.value = true;
  } else {
    isForm6Active.value = false;
    isForm6Selected.value = false;
  }
  
  // 🔥 Catalog Number
  catalogNumber.value = release.catalog_number || '';
  if (catalogNumber.value.trim() !== '') {
    isForm7Active.value = true;
    isForm7Selected.value = true;
  } else {
    isForm7Active.value = false;
    isForm7Selected.value = false;
  }
  
  // ========== 2. تعبئة الفنانين (artists) ==========
  if (release.artists && Array.isArray(release.artists) && release.artists.length > 0) {
    const validArtists = release.artists.filter(a => a && a.trim() !== '');
    if (validArtists.length > 0) {
      artistInputs.value = validArtists.map((artist) => ({
        searchQuery: artist.trim(),
        isHovered: false,
        isFocused: false,
        isSelected: true,
        artistData: null
      }));
      console.log('📌 تم تعيين الفنانين:', validArtists);
    } else {
      artistInputs.value = [{ 
        searchQuery: '', 
        isHovered: false, 
        isFocused: false, 
        isSelected: false, 
        artistData: null 
      }];
    }
  } else {
    artistInputs.value = [{ 
      searchQuery: '', 
      isHovered: false, 
      isFocused: false, 
      isSelected: false, 
      artistData: null 
    }];
  }

  // ========== 3. تحديث حالة النوع الفرعي ==========
  if (subGenre.value.trim() !== '') {
    isSubGenreEnabled.value = true;
  }

  // ========== 4. تحديث الصورة ==========
  if (release.cover) {
    const coverUrl = `${STORAGE_URL}/${release.cover}`;
    serverCoverUrl.value = coverUrl;
    uploadedImage.value = coverUrl;
    localStorage.setItem('temp_cover_url', release.cover);
    localStorage.setItem('temp_cover_full_url', coverUrl);
  } else {
    if (props.uploadedImage) {
      serverCoverUrl.value = props.uploadedImage;
      uploadedImage.value = props.uploadedImage;
    } else {
      clearCoverData();
      uploadedImage.value = null;
      serverCoverUrl.value = null;
    }
  }

  // ========== 5. تحديث الـ Store باستخدام updateStoreMetasData ==========
  // ✅ استدعاء updateStoreMetasData بدلاً من تعيين isMetasComplete مباشرة
  updateStoreMetasData();

  // ========== 6. تحديد الصفحة المناسبة في Metas ==========
  const targetPage = determineMetasPage(release);
  console.log(`📌 الصفحة المستهدفة في Metas: ${targetPage}`);
  
  if (targetPage === 'newRight2') {
    showNewRight2.value = true;
    showNewRight.value = false;
    isNewRight2Visible.value = true;
    isNewFormsVisible.value = true;
    showFinalPage.value = false;
    releaseStore.setMetasPage('newRight2');
    console.log('📌 تم استعادة NewRight2');
  } else if (targetPage === 'newRight') {
    showNewRight.value = true;
    showNewRight2.value = false;
    isNewRight2Visible.value = false;
    isNewFormsVisible.value = false;
    showFinalPage.value = false;
    releaseStore.setMetasPage('newRight');
    console.log('📌 تم استعادة NewRight');
  } else {
    showNewRight.value = false;
    showNewRight2.value = false;
    isNewRight2Visible.value = false;
    isNewFormsVisible.value = false;
    showFinalPage.value = false;
    releaseStore.setMetasPage('right');
    console.log('📌 تم استعادة Right (الصفحة الرئيسية)');
  }
  
  if (route.query.lastPage) {
    const { lastPage, ...restQuery } = route.query;
    router.replace({ query: restQuery });
  }

  console.log('✅ تم ملء البيانات بنجاح. UUID:', releaseUuid.value);
  
  // 🔥 إعادة تعيين حالة العودة من Songs
  setTimeout(() => {
    resetReturningFromSongs();
  }, 300);
  
  setTimeout(() => {
    updatePreviousValues();
    console.log('📝 Initial previous values set');
  }, 500);
};

const hasAnyRequiredField = computed(() => {
  const hasTitle = searchQuery2.value && searchQuery2.value.trim() !== '';
  const hasArtist = artistInputs.value.some(input => 
    input.searchQuery && input.searchQuery.trim() !== ''
  );
  const hasDate = selectedDate.value && selectedDate.value.trim() !== '';
  const hasSubtitle = searchQuery3.value && searchQuery3.value.trim() !== '';
  
  return hasTitle || hasArtist || hasDate || hasSubtitle;
});

// ========== 🔥 createReleaseOnFirstInput المعدلة ==========
const createReleaseOnFirstInput = async () => {
  if (isEditMode.value) {
    console.log('ℹ️ وضع التعديل - لا ننشئ Release جديد');
    return;
  }
  
  // 🔥🔥🔥 إذا كان هناك releaseUuid بالفعل، لا ننشئ Release جديد
  if (releaseUuid.value || releaseStore.currentReleaseId || props.releaseUuid) {
    console.log('ℹ️ يوجد Release بالفعل (UUID:', releaseUuid.value || releaseStore.currentReleaseId || props.releaseUuid, ') - لا ننشئ Release جديد');
    return;
  }
  
  if (isCreatingFromInput) {
    console.log('⏳ جاري إنشاء Release بالفعل من الإدخال');
    return;
  }
  
  if (isReleaseCreated.value || releaseUuid.value || isCreatingRelease.value) {
    console.log('ℹ️ Release موجود بالفعل أو جاري الإنشاء');
    return;
  }
  
  const hasTitle = searchQuery2.value && searchQuery2.value.trim() !== '';
  const hasArtist = artistInputs.value.some(input => 
    input.searchQuery && input.searchQuery.trim() !== ''
  );
  const hasDate = selectedDate.value && selectedDate.value.trim() !== '';
  
  if (!hasTitle && !hasArtist && !hasDate) {
    console.log('ℹ️ لا توجد بيانات مدخلة بعد');
    return;
  }
  
  if (hasArtist && !hasTitle && !hasDate) {
    console.log('⏳ انتظار اكتمال البيانات الأساسية (العنوان، التاريخ)');
    return;
  }
  
  console.log('🔄 إنشاء Release عند أول إدخال');
  isCreatingFromInput = true;
  
  try {
    await createReleaseWithAllData();
  } catch (error) {
    console.error('❌ فشل إنشاء Release من الإدخال:', error);
  } finally {
    isCreatingFromInput = false;
  }
};

// ========== 🔥 دالة createReleaseWithAllData المعدلة ==========
const createReleaseWithAllData = async (coverFile = null) => {
  // ✅ منع الإنشاء المتكرر
  if (isCreatingRelease.value) {
    console.log('⏳ جاري إنشاء Release بالفعل');
    return false;
  }
  
  if (isEditMode.value) {
    console.log('ℹ️ وضع التعديل - لا ننشئ Release جديد');
    return false;
  }
  
  // 🔥🔥🔥 إذا كان هناك releaseUuid بالفعل، لا ننشئ Release جديد
  if (releaseUuid.value || releaseStore.currentReleaseId || props.releaseUuid) {
    console.log('ℹ️ يوجد Release بالفعل (UUID:', releaseUuid.value || releaseStore.currentReleaseId || props.releaseUuid, ') - تحديث الصورة فقط');
    // ✅ إذا كان هناك ملف، قم بتحديث الصورة فقط
    const file = coverFile || pendingCoverFile.value;
    if (file) {
      await uploadCoverImage(file);
    } else {
      await updateRelease();
    }
    return true;
  }
  
  const currentArtistInputs = JSON.parse(JSON.stringify(artistInputs.value));
  const currentSearchQuery2 = searchQuery2.value;
  const currentSearchQuery3 = searchQuery3.value;
  const currentSelectedDate = selectedDate.value;
  const currentReleasePrice = releasePrice.value;
  const currentSongPrice = songPrice.value;
  const currentMainGenre = mainGenre.value;
  const currentSubGenre = subGenre.value;
  const currentLabelName = labelName.value;
  const currentProductionYear = productionYear.value;
  const currentCLineYear = cLineYear.value;
  const currentCLineName = cLineName.value;
  const currentPLineYear = pLineYear.value;
  const currentPLineName = pLineName.value;
  const currentGtin = gtin.value;
  const currentCatalogNumber = catalogNumber.value;
  
  clearCoverData();
  
  const fileToUpload = coverFile || pendingCoverFile.value;
  
  if (fileToUpload) {
    pendingCoverFile.value = fileToUpload;
    console.log('📸 سيتم رفع الصورة مع الـ Release:', fileToUpload.name, 'حجم:', (fileToUpload.size / 1024 / 1024).toFixed(2), 'MB');
  } else {
    console.log('📸 لا توجد صورة للرفع مع الـ Release');
  }
  
  let releaseType = props.pendingReleaseType || 
                    releaseStore.releaseTypeValue || 
                    'single';
  
  if (typeof releaseType === 'string' && releaseType.includes('DEINE NEUE')) {
    if (releaseType.includes('SINGLE')) releaseType = 'single';
    else if (releaseType.includes('EP')) releaseType = 'extended player';
    else if (releaseType.includes('ALBUM')) releaseType = 'album';
  }
  
  console.log('📌 releaseType المستخدم:', releaseType);
  
  const releaseData = {
    release_type: releaseType,
    status: 'draft'
  };
  
  if (currentSearchQuery2 && currentSearchQuery2.trim() !== '') {
    releaseData.title = currentSearchQuery2.trim();
  }
  
  if (currentSearchQuery3 && currentSearchQuery3.trim() !== '') {
    releaseData.subtitle = currentSearchQuery3.trim();
  }
  
  if (currentSelectedDate && currentSelectedDate.trim() !== '') {
    const formattedDate = formatDate(currentSelectedDate);
    if (formattedDate) {
      releaseData.release_date = formattedDate;
    }
  }
  
  const artistsList = currentArtistInputs
    .filter(input => input.searchQuery && input.searchQuery.trim() !== '')
    .map(input => input.searchQuery.trim());
  
  if (artistsList.length > 0) {
    releaseData.artists = artistsList;
  }
  
  if (currentReleasePrice && currentReleasePrice.toString().trim() !== '') {
    releaseData.release_price = parseFloat(currentReleasePrice);
  }
  
  if (currentSongPrice && currentSongPrice.toString().trim() !== '') {
    releaseData.price_per_song = parseFloat(currentSongPrice);
  }
  
  if (currentMainGenre && currentMainGenre.trim() !== '') {
    releaseData.main_genre = currentMainGenre.trim();
  }
  
  if (currentSubGenre && currentSubGenre.trim() !== '') {
    releaseData.sub_genre = currentSubGenre.trim();
  }
  
  if (currentLabelName && currentLabelName.trim() !== '') {
    releaseData.label = currentLabelName.trim();
  }
  
  if (currentProductionYear && currentProductionYear.toString().trim() !== '') {
    releaseData.production_year = parseInt(currentProductionYear);
  }
  
  if (currentCLineYear && currentCLineYear.toString().trim() !== '') {
    releaseData.c_line_year = parseInt(currentCLineYear);
  }
  
  if (currentCLineName && currentCLineName.trim() !== '') {
    releaseData.c_line_name = currentCLineName.trim();
  }
  
  if (currentPLineYear && currentPLineYear.toString().trim() !== '') {
    releaseData.p_line_year = parseInt(currentPLineYear);
  }
  
  if (currentPLineName && currentPLineName.trim() !== '') {
    releaseData.p_line_name = currentPLineName.trim();
  }
  
  if (currentGtin && currentGtin.trim() !== '') {
    releaseData.GTIN = currentGtin.trim();
  }
  
  if (currentCatalogNumber && currentCatalogNumber.trim() !== '') {
    releaseData.catalog_number = currentCatalogNumber.trim();
  }
  
  Object.keys(releaseData).forEach(key => {
    if (releaseData[key] === undefined || releaseData[key] === null) {
      delete releaseData[key];
    }
  });
  
  if (!releaseData.release_type) {
    console.warn('⚠️ لا يوجد نوع Release');
    errorMessage.value = 'Bitte wähle einen Release-Typ aus.';
    return false;
  }
  
  console.log('📤 بيانات الإرسال النهائية:', releaseData);
  console.log('📸 هل توجد صورة؟', !!fileToUpload);
  
  isCreatingRelease.value = true;
  
  try {
    let response;
    
    if (fileToUpload) {
      const formData = new FormData();
      Object.keys(releaseData).forEach(key => {
        if (releaseData[key] !== null && releaseData[key] !== undefined) {
          formData.append(key, releaseData[key]);
        }
      });
      formData.append('cover', fileToUpload);
      
      console.log('📤 إنشاء Release مع الصورة، حجم الصورة:', (fileToUpload.size / 1024 / 1024).toFixed(2), 'MB');
      
      response = await apiRequest.post('/releases', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json'
        },
        timeout: 120000,
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            fileProgress.value = percentCompleted;
            if (percentCompleted % 10 === 0 || percentCompleted === 100) {
              console.log(`📤 تقدم الرفع: ${percentCompleted}%`);
            }
          }
        }
      });
    } else {
      console.log('📤 إنشاء Release بدون صورة');
      response = await apiRequest.post('/releases', releaseData, {
        timeout: 30000
      });
    }
    
    console.log('✅ Release تم إنشاؤه بنجاح:', response.data);
    
    if (response.data?.data?.uuid) {
      const newReleaseUuid = response.data.data.uuid;
      
      releaseUuid.value = newReleaseUuid;
      releaseStore.setCurrentReleaseId(newReleaseUuid);
      isReleaseCreated.value = true;
      
      // استعادة البيانات
      artistInputs.value = currentArtistInputs;
      searchQuery2.value = currentSearchQuery2;
      searchQuery3.value = currentSearchQuery3;
      selectedDate.value = currentSelectedDate;
      releasePrice.value = currentReleasePrice;
      songPrice.value = currentSongPrice;
      mainGenre.value = currentMainGenre;
      subGenre.value = currentSubGenre;
      labelName.value = currentLabelName;
      productionYear.value = currentProductionYear;
      cLineYear.value = currentCLineYear;
      cLineName.value = currentCLineName;
      pLineYear.value = currentPLineYear;
      pLineName.value = currentPLineName;
      gtin.value = currentGtin;
      catalogNumber.value = currentCatalogNumber;
      
      // 🔥 تحديث الصورة من الاستجابة
      if (response.data.data.cover) {
        const coverPath = response.data.data.cover;
        const coverUrl = coverPath.startsWith('http') ? coverPath : `${STORAGE_URL}/${coverPath}`;
        serverCoverUrl.value = coverUrl;
        uploadedImage.value = coverUrl;
        
        // ✅ تحديث serverCoverUrl في الـ Store
        releaseStore.setServerCoverUrl(coverUrl);
        
        localStorage.setItem('temp_cover_url', coverPath);
        localStorage.setItem('temp_cover_full_url', coverUrl);
        localStorage.setItem('upload_server_cover_url', coverUrl);
        console.log('💾 تم حفظ الصورة في localStorage');
        
        // ✅ تحديث _startComplete
        if (releaseStore && !releaseStore._startComplete) {
          releaseStore.setStartComplete(true);
        }
      } else if (fileToUpload) {
        console.log('🔄 محاولة تحديث الصورة بعد إنشاء الـ Release');
        await uploadCoverImage(fileToUpload);
      }
      
      // ✅ تأكد من تحديث metasData في الـ Store
      const artistsListForStore = currentArtistInputs
        .filter(input => input.searchQuery && input.searchQuery.trim() !== '')
        .map(input => input.searchQuery.trim());
      
      releaseStore.updateMetasData({
        title: currentSearchQuery2 || '',
        subtitle: currentSearchQuery3 || '',
        releaseDate: currentSelectedDate || null,
        artists: artistsListForStore,
        releasePrice: currentReleasePrice || null,
        songPrice: currentSongPrice || null,
        mainGenre: currentMainGenre || '',
        subGenre: currentSubGenre || '',
        label: currentLabelName || '',
        productionYear: currentProductionYear || null,
        cLineYear: currentCLineYear || null,
        cLineName: currentCLineName || '',
        pLineYear: currentPLineYear || null,
        pLineName: currentPLineName || '',
        gtin: currentGtin || '',
        catalogNumber: currentCatalogNumber || ''
      });
      
      // 🔥 تحديث الـ Store
      updateStoreMetasData();
      
      // 🔥🔥🔥 تعيين currentStep إلى 2 في الـ Store
      releaseStore.setCurrentStep(2);
      console.log('📌 [Parent] تم تعيين currentStep إلى 2');
      
      // 🔥🔥🔥 تعيين isMetasComplete إلى true (لأن الصورة موجودة)
      releaseStore.setMetasComplete(true);
      console.log('📌 [Parent] تم تعيين isMetasComplete إلى true');
      
      // 🔥🔥🔥🔥🔥 استدعاء determineStepFromRelease مع updateCurrentStep = false
      // لمنع تغيير currentStep إلى 1 (لأن البيانات غير مكتملة)
      // هذا يحل مشكلة الارتفاع المفاجئ والوميض عند الانتقال إلى Metas
      releaseStore.determineStepFromRelease(response.data.data, false);
      console.log('📌 [Parent] تم استدعاء determineStepFromRelease مع updateCurrentStep = false');
      
      // 🔥 تحديث الـ URL مع step=2
      const currentPath = route.path;
      const newPath = `/releases/${newReleaseUuid}/edit`;
      
      if (currentPath !== newPath) {
        await router.replace({
          path: newPath,
          query: { ...route.query, preserve: 'true', step: 2 }
        });
        console.log('🔗 تم تحديث الرابط إلى:', newPath, 'مع step=2');
      }
      
      // 🔥 إرسال الأحداث إلى المكون الأب (UploadPNG)
      emit('release-created', {
        releaseId: newReleaseUuid,
        coverUrl: response.data.data?.cover || null
      });
      
      emit('release-updated', {
        releaseId: newReleaseUuid,
        data: response.data.data
      });
      
      updatePreviousValues();
      
      console.log('✅ Release created with UUID:', newReleaseUuid);
      return true;
    }
    
    return false;
    
  } catch (err) {
    console.error('❌ فشل إنشاء الـ Release:', err);
    console.error('❌ تفاصيل الخطأ:', err.response?.data);
    
    let errorMsg = 'Fehler beim Erstellen des Releases.';
    if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
      errorMsg = 'Der Upload dauert zu lange. Bitte versuche es mit einem kleineren Bild (max. 10 MB) oder einer stabileren Verbindung.';
    } else if (err.response?.data?.message) {
      errorMsg = err.response.data.message;
    } else if (err.message) {
      errorMsg = err.message;
    }
    errorMessage.value = errorMsg;
    
    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: { 
        message: errorMsg, 
        type: 'error' 
      }
    }));
    
    isUploading.value = false;
    fileProgress.value = 0;
    
    return false;
  } finally {
    isCreatingRelease.value = false;
  }
};

const formatDate = (dateStr) => {
  if (!dateStr || dateStr.trim() === '') return null;
  
  try {
    const parts = dateStr.split('/');
    if (parts.length !== 3) return null;
    
    const [day, month, yearShort] = parts;
    const dayNum = parseInt(day);
    const monthNum = parseInt(month);
    const yearNum = parseInt(yearShort);
    
    if (isNaN(dayNum) || isNaN(monthNum) || isNaN(yearNum)) return null;
    if (dayNum < 1 || dayNum > 31 || monthNum < 1 || monthNum > 12) return null;
    
    const year = yearNum < 50 ? `20${yearShort}` : `19${yearShort}`;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  } catch (error) {
    console.error('❌ خطأ في تنسيق التاريخ:', error);
    return null;
  }
};

// ========== دوال التحديث ==========
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

  console.log('📤 Sending only changed fields:', payload);

  try {
    const response = await apiRequest.post(`/releases/${releaseUuid.value}`, payload, {
      params: { _method: 'PATCH' }
    });
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

// ========== دوال الفنانين ==========
const addArtistInput = () => {
  if (artistInputs.value.length < 2) {
    artistInputs.value.push({ searchQuery: '', isHovered: false, isFocused: false, isSelected: false, artistData: null });
  }
};

const removeArtistInput = () => {
  if (artistInputs.value.length === 2) {
    artistInputs.value.splice(1, 1);
  }
};

const updateArtistsImmediately = async () => {
  if (!releaseUuid.value) return;
  
  if (isUpdatingArtists) {
    console.log('⏳ تحديث الفنانين قيد التنفيذ بالفعل، سيتم تجاهل هذا الطلب');
    return;
  }
  
  const artistsList = artistInputs.value
    .filter(input => input.searchQuery && input.searchQuery.trim() !== '')
    .map(input => input.searchQuery.trim());
  
  const currentArtistsStr = JSON.stringify(artistsList);
  const prevArtistsStr = JSON.stringify(previousValues.value.artists || []);
  
  if (currentArtistsStr === prevArtistsStr) {
    console.log('ℹ️ No changes in artists');
    return;
  }
  
  console.log('📤 Updating artists:', artistsList);
  
  isUpdatingArtists = true;
  
  try {
    const response = await apiRequest.post(`/releases/${releaseUuid.value}`, {
      artists: artistsList.length > 0 ? artistsList : null
    }, {
      params: { _method: 'PATCH' }
    });
    
    console.log('✅ Artists updated successfully:', response.data);
    
    previousValues.value.artists = artistsList;
    
    emit('release-updated', {
      releaseId: releaseUuid.value,
      data: response.data?.data || { artists: artistsList }
    });
    
  } catch (err) {
    console.error('❌ Failed to update artists:', err.response?.data || err);
  } finally {
    isUpdatingArtists = false;
  }
};

const selectSearchResult = (result, index) => {
  console.log('🎯 تم اختيار الفنان:', result.name);
  
  if (artistInputs.value[index].searchQuery === result.name) {
    console.log('⚠️ نفس الفنان تم اختياره بالفعل، سيتم إغلاق النتائج');
    
    showSearchResults.value = null;
    searchArtistsResults.value = [];
    
    artistInputs.value[index].isSelected = true;
    artistInputs.value[index].isFocused = false;
    
    console.log('✅ تم إغلاق نتائج البحث');
    return;
  }
  
  artistInputs.value[index].searchQuery = result.name;
  artistInputs.value[index].isSelected = true;
  artistInputs.value[index].isFocused = false;
  artistInputs.value[index].artistData = result;
  
  showSearchResults.value = null;
  searchArtistsResults.value = [];
  
  console.log('✅ تم اختيار الفنان:', result.name);
  
  if (releaseUuid.value) {
    updateArtistsImmediately();
  }
};

// ========== دوال التبديل ==========
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

const handleDateSelect = (formattedDate) => {
  if (!formattedDate || typeof formattedDate !== 'string') {
    return;
  }

  console.log('📅 Parent: استلام تاريخ من الكالندر:', formattedDate);
  
  selectedDate.value = formattedDate.trim();
  isForm4Selected.value = true;

  const selected = dayjs(formattedDate, 'DD/MM/YY');
  if (!selected.isValid()) {
    return;
  }

  const fullYear = selected.year() < 100 ? selected.year() + 2000 : selected.year();
  const correctedSelected = dayjs(`${fullYear}-${selected.month() + 1}-${selected.date()}`);

  const todayStart = dayjs().startOf('day');
  const selectedStart = correctedSelected.startOf('day');

  const diffInDays = selectedStart.diff(todayStart, 'day');
  daysDifference.value = diffInDays;

  showPopup.value = diffInDays >= 0 && diffInDays < 14;

  isCalendarVisible.value = false;
  isInputFocused.value = false;
  
  console.log('🔒 تم إغلاق الكالندر بعد اختيار التاريخ');
};

// ========== دوال التنقل ==========
const handleButtonArrowClick = () => {
  if (!isBottomButtonActive.value) {
    console.log('⚠️ الزر غير نشط');
    return;
  }
  
  // ✅ التحقق من وجود songUuid قبل حفظ الصفحة
  const hasSongUuid = !!(releaseStore.songUuid || route.params.songUuid || route.query.song);
  
  if (isEditMode.value) {
    console.log('✏️ وضع التعديل - تخطي إنشاء Release');
    // 🔥 حفظ الصفحة الحالية في الـ Store
    if (showNewRight2.value) {
      releaseStore.setMetasPage('newRight2');
    } else if (showNewRight.value) {
      releaseStore.setMetasPage('newRight');
    } else {
      releaseStore.setMetasPage('right');
    }
    proceedWithNavigation();
    return;
  }
  
  if (!isReleaseCreated.value && !releaseUuid.value) {
    createReleaseWithAllData().then(success => {
      if (success) {
        // 🔥 حفظ الصفحة الحالية في الـ Store
        if (showNewRight2.value) {
          releaseStore.setMetasPage('newRight2');
        } else if (showNewRight.value) {
          releaseStore.setMetasPage('newRight');
        } else {
          releaseStore.setMetasPage('right');
        }
        proceedWithNavigation();
      }
    });
    return;
  }
  
  // 🔥 حفظ الصفحة الحالية في الـ Store
  if (showNewRight2.value) {
    releaseStore.setMetasPage('newRight2');
  } else if (showNewRight.value) {
    releaseStore.setMetasPage('newRight');
  } else {
    releaseStore.setMetasPage('right');
  }
  
  proceedWithNavigation();
};

const handleButtonArrowTopClick = () => {
  console.log('🔼 الزر العلوي - الرجوع للخلف');
  
  if (showFinalPage.value) {
    // 🔥 حفظ الصفحة في الـ Store
    releaseStore.setMetasPage('newRight2');
    
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
    // 🔥 حفظ الصفحة في الـ Store
    releaseStore.setMetasPage('newRight');
    
    showNewRight2.value = false;
    isNewRight2Visible.value = false;
    isNewFormsVisible.value = false;
    emit('update:showNewRight2', false);
    
    setTimeout(() => {
      showNewRight.value = true;
    }, 500);
    
  } else if (showNewRight.value) {
    // 🔥 حفظ الصفحة في الـ Store
    releaseStore.setMetasPage('right');
    
    showNewRight.value = false;
    emit('update:showNewRight2', false);
    
    setTimeout(() => {
      isSlidingUp.value = false;
    }, 500);
  }
};

const proceedWithNavigation = () => {
  if (showNewRight2.value) {
    // 🔥 حفظ الصفحة في الـ Store
    releaseStore.setMetasPage('newRight2');
    
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
    // 🔥 حفظ الصفحة في الـ Store
    releaseStore.setMetasPage('newRight');
    
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
    // 🔥 حفظ الصفحة في الـ Store
    releaseStore.setMetasPage('right');
    
    isSlidingUp.value = true;
    setTimeout(() => {
      showNewRight.value = true;
      isSlidingUp.value = false;
      emit('update:showNewRight2', false);
    }, 500);
  }
};

// ========== computed properties ==========
const isTopButtonActive = computed(() => {
  return true;
});

const isBottomButtonActive = computed(() => {
  if (showNewRight2.value) {
    const hasBasicFields = 
      isForm2Selected.value &&
      isForm4Selected.value &&
      artistInputs.value.some(input => input.isSelected);
    
    let hasGTIN = true;
    if (isForm6Active.value) {
      hasGTIN = isForm6Selected.value === true;
    }
    
    let hasCatalogNumber = true;
    if (isForm7Active.value) {
      hasCatalogNumber = isForm7Selected.value === true;
    }
    
    const hasAdditionalFields = 
      isForm8Selected.value &&
      isForm9Selected.value &&
      isForm10Selected.value &&
      isForm11Selected.value;
    
    return hasBasicFields && hasGTIN && hasCatalogNumber && hasAdditionalFields;
  }
  
  if (showNewRight.value) {
    const isSubGenreCondition = isSubGenreEnabled.value ? isSubGenreSelected.value : true;
    return isReleasePriceSelected.value && 
           isSongPriceSelected.value && 
           isMainGenreSelected.value && 
           isSubGenreCondition;
  }
  
  const hasAtLeastOneArtist = artistInputs.value.some(input => input.isSelected);
  
  let isSubtitleValid = true;
  if (isForm3Active.value) {
    isSubtitleValid = isForm3Selected.value === true;
  }
  
  const isActive = hasAtLeastOneArtist && isForm2Selected.value && isForm4Selected.value && isSubtitleValid;
  
  console.log('📌 isBottomButtonActive (normal):', {
    hasAtLeastOneArtist,
    isForm2Selected: isForm2Selected.value,
    isForm4Selected: isForm4Selected.value,
    isForm3Active: isForm3Active.value,
    isForm3Selected: isForm3Selected.value,
    isSubtitleValid,
    isActive
  });
  
  return isActive;
});

const isButtonArrowVisible = computed(() => {
  return isBottomButtonActive.value;
});

const isButtonArrowDisabled = computed(() => {
  return !isBottomButtonActive.value;
});

const searchResultStyle = computed(() => {
  return {
    position: 'absolute',
    top: '48px',
    left: 0,
    width: 'calc(100% + 10px)',
    zIndex: 1000,
    display: 'block',
    visibility: 'visible',
    borderRadius: '5px'
  };
});

// ========== Watchers ==========
watch([searchQuery2, searchQuery3, selectedDate, releasePrice, songPrice, mainGenre, subGenre, gtin, catalogNumber, labelName, productionYear, cLineYear, cLineName, pLineYear, pLineName], () => {
  isForm2Selected.value = searchQuery2.value.trim() !== '';
  isForm3Selected.value = isForm3Active.value && searchQuery3.value.trim() !== '';
  isForm4Selected.value = selectedDate.value !== null;
  const releasePriceStr = typeof releasePrice.value === 'string' 
    ? releasePrice.value.trim() 
    : String(releasePrice.value).trim();
  isReleasePriceSelected.value = releasePriceStr !== '' && releasePrice.value !== null && releasePrice.value !== undefined;
  
  const songPriceStr = typeof songPrice.value === 'string' 
    ? songPrice.value.trim() 
    : String(songPrice.value).trim();
  isSongPriceSelected.value = songPriceStr !== '' && songPrice.value !== null && songPrice.value !== undefined;
  isMainGenreSelected.value = mainGenre.value.trim() !== '';
  isSubGenreSelected.value = subGenre.value.trim() !== '';
  isForm6Selected.value = isForm6Active.value && gtin.value.trim() !== '';
  isForm7Selected.value = isForm7Active.value && catalogNumber.value.trim() !== '';
  isForm8Selected.value = labelName.value.trim() !== '';
  isForm9Selected.value = productionYear.value.trim() !== '';
  isForm10Selected.value = cLineYear.value.trim() !== '' && cLineName.value.trim() !== '';
  isForm11Selected.value = pLineYear.value.trim() !== '' && pLineName.value.trim() !== '';
}, { deep: true, immediate: true });

watch(hasSubGenresAvailable, (newVal) => {
  console.log('📌 Parent: hasSubGenresAvailable changed to:', newVal);
});

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

// ========== 🔥 مراقبة uploadedImage من props ==========
watch(() => props.uploadedImage, (newImage) => {
  if (newImage) {
    console.log('🖼️ [Parent] استقبال uploadedImage من props:', newImage);
    uploadedImage.value = newImage;
    serverCoverUrl.value = newImage;
  }
}, { immediate: true });

// ========== 🔥 مراقبة serverCoverUrl ==========
watch(serverCoverUrl, (newUrl) => {
  if (newUrl) {
    console.log('🖼️ [Parent] serverCoverUrl تحديث:', newUrl);
    uploadedImage.value = newUrl;
  }
});

// تأكد من أن watch التالي موجود بالفعل:
watch([showNewRight, showNewRight2, showFinalPage], ([newRight, newRight2, final]) => {
  if (final) {
    console.log('📌 في FinalPage، لا نحفظ الصفحة');
    return;
  }
  
  // 🔥 حفظ الصفحة في الـ Store
  if (newRight2) {
    releaseStore.setMetasPage('newRight2');
    console.log('💾 حفظ آخر صفحة في Store: newRight2');
  } else if (newRight) {
    releaseStore.setMetasPage('newRight');
    console.log('💾 حفظ آخر صفحة في Store: newRight');
  } else {
    releaseStore.setMetasPage('right');
    console.log('💾 حفظ آخر صفحة في Store: right');
  }
}, { immediate: true, deep: true });

// ========== 🔥 مراقبة التغييرات في الح fields (المعدلة) ==========
watch(
  [searchQuery2, searchQuery3, selectedDate, artistInputs, releasePrice, songPrice, mainGenre, subGenre, labelName, productionYear, cLineYear, cLineName, pLineYear, pLineName, gtin, catalogNumber],
  () => {
    // 🔥 التحقق من حالة العودة من Songs
    if (releaseStore._isReturningFromSongs) {
      console.log('🔄 [Parent] عودة من Songs، تحديث metasData فقط');
      // تحديث metasData دون تغيير isMetasComplete
      const artists = artistInputs.value
        .filter(input => input.searchQuery && input.searchQuery.trim() !== '')
        .map(input => input.searchQuery.trim());
      
      releaseStore.metasData = {
        ...releaseStore.metasData,
        title: searchQuery2.value || '',
        subtitle: searchQuery3.value || '',
        releaseDate: selectedDate.value || null,
        artists: artists,
        releasePrice: releasePrice.value || null,
        songPrice: songPrice.value || null,
        mainGenre: mainGenre.value || '',
        subGenre: subGenre.value || '',
        label: labelName.value || '',
        productionYear: productionYear.value || null,
        cLineYear: cLineYear.value || null,
        cLineName: cLineName.value || '',
        pLineYear: pLineYear.value || null,
        pLineName: pLineName.value || '',
        gtin: gtin.value || '',
        catalogNumber: catalogNumber.value || ''
      };
      return;
    }
    
    updateStoreMetasData();
    
    if (releaseUuid.value && !props.skipCreation) {
      updateRelease();
    }
  },
  { deep: true, immediate: true }
);

watch(
  () => artistInputs.value.map(a => ({ searchQuery: a.searchQuery, isSelected: a.isSelected })),
  () => {
    updateStoreMetasData();
    
    if (!releaseUuid.value || props.skipCreation) return;
    
    if (pendingArtistUpdate) {
      clearTimeout(pendingArtistUpdate);
    }
    
    pendingArtistUpdate = setTimeout(() => {
      updateArtistsImmediately();
      pendingArtistUpdate = null;
    }, 300);
  },
  { deep: true }
);

watch(
  [
    () => searchQuery2.value,
    () => searchQuery3.value,
    () => selectedDate.value,
    () => artistInputs.value.map(a => a.searchQuery).join(',')
  ],
  async (newValues, oldValues) => {
    if (isEditMode.value) {
      console.log('ℹ️ وضع التعديل - لا ننشئ Release جديد');
      return;
    }
    
    if (!isReleaseCreated.value && !releaseUuid.value && !isCreatingRelease.value) {
      await nextTick();
      await createReleaseOnFirstInput();
    }
  },
  { deep: true }
);

watch(
  () => artistInputs.value.map(a => ({ searchQuery: a.searchQuery, isSelected: a.isSelected })),
  async (newVal, oldVal) => {
    if (isEditMode.value) {
      console.log('ℹ️ وضع التعديل - لا ننشئ Release جديد');
      return;
    }
    
    if (!isReleaseCreated.value && !releaseUuid.value && !isCreatingRelease.value) {
      const hasArtist = artistInputs.value.some(input => 
        input.searchQuery && input.searchQuery.trim() !== ''
      );
      
      if (hasArtist) {
        await nextTick();
        await createReleaseOnFirstInput();
      }
    }
  },
  { deep: true }
);

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

defineExpose({
  artistInputs,
  searchQuery2,
  selectedDate,
  isForm2Selected,
  isForm4Selected,
  releasePrice,
  songPrice,
  mainGenre,
  subGenre,
  createReleaseWithAllData,
  isReleaseCreated,
  releaseUuid,
  showNewRight,
  showNewRight2,
  showFinalPage,
  isNewRight2Visible,
  isNewFormsVisible
});
</script>
<template>
  <!-- 🔥 عرض شاشة التحميل -->
  <div v-if="isLoading" class="loading-container">
    <!-- <div class="spinner"></div> -->
    <!-- <span class="loading-text">Lade Metas Daten...</span> -->
  </div>
  
  <!-- 🔥 عرض المحتوى بعد تحميل البيانات -->
  <div v-else class="main" :class="{ 'height-auto': currentStep === 2, 'height-full': currentStep !== 2 }">
    <div class="upload"
         :class="{ 
           'show-right': showNewRight || showNewRight2,
           'step-2': currentStep === 2
         }"
         :style="{ 
           gap: showNewRight || showNewRight2 ? '24px' : '110px', 
           alignItems: showNewRight || showNewRight2 ? 'stretch' : 'center'
         }">

      <!-- Video Popup -->
      <VideoPopup :show="showVideoPopup" :videoId="videoId" @close="closeVideoPopup" />

      <!-- Left Section -->
      <div class="left-section">
        <div class="image-upload-wrapper">
          <ImageUpload 
            :uploadedImage="uploadedImage"
            :serverCoverUrl="serverCoverUrl"
            :isUploading="isUploading"
            :uploadProgress="fileProgress"
            @update:uploadedImage="handleImagePreview"
            @file-selected="handleFileUpload"
          />
        </div>
        
        <!-- 🔥 استخدام v-show بدلاً من v-if مع transition -->
        <transition name="form-left-transition">
          <FormLeft 
            v-show="showNewRight2 && isNewFormsVisible && !showFinalPage" 
            class="form-left-component"
            :gtin="gtin" 
            :catalogNumber="catalogNumber"
            :isForm6Active="isForm6Active" 
            :isForm7Active="isForm7Active" 
            :isForm6Selected="isForm6Selected" 
            :isForm7Selected="isForm7Selected"
            :isHoveredForm6="isHoveredForm6" 
            :isHoveredForm7="isHoveredForm7"
            :iconPlay="iconPlay" 
            :releaseUuid="releaseUuid"
            :show="showNewRight2 && isNewFormsVisible && !showFinalPage"
            @update:gtin="gtin = $event" 
            @update:catalogNumber="catalogNumber = $event"
            @toggleForm6="toggleForm6" 
            @toggleForm7="toggleForm7" 
            @updateForm6Selected="(val) => { 
              console.log('📌 Parent: received updateForm6Selected:', val); 
              isForm6Selected = val; 
            }" 
            @updateForm7Selected="(val) => { 
              console.log('📌 Parent: received updateForm7Selected:', val); 
              isForm7Selected = val; 
            }"
            @mouseenterForm6="isHoveredForm6 = true" 
            @mouseleaveForm6="isHoveredForm6 = false"
            @mouseenterForm7="isHoveredForm7 = true" 
            @mouseleaveForm7="isHoveredForm7 = false"
            @openVideoPopup="openVideoPopup" 
          />
        </transition>
      </div>

      <!-- Right Sections -->
      <div class="right-sections-wrapper">
        <!-- RightSection -->
        <RightSection 
          v-if="!showNewRight && !showNewRight2 && !showFinalPage" 
          key="right"
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
          :recommendedDate="recommendedDateForPlaceholder"
          :isSlidingIn="true"
          :isLeaving="false"
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
          @addNewArtist="handleAddNewArtist" 
        />

        <!-- NewRightSection -->
        <NewRightSection 
          v-if="showNewRight && !showNewRight2 && !showFinalPage" 
          key="newRight"
          class="right-section"
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
          :isSlidingIn="true"
          :isLeaving="false"
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
          @update:hasSubGenres="hasSubGenresAvailable = $event"
          @openVideoPopup="openVideoPopup" 
        />

        <!-- NewRight2Section -->
        <NewRight2Section 
          v-if="showNewRight2" 
          key="newRight2"
          class="right2-section"
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
          @update:showMetas="showMetasFromRight = $event"
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
          @openVideoPopup="openVideoPopup" 
        />
      </div>

      <!-- Popup Component -->
      <PopUpDays :showPopup="showPopup" 
                 :selectedDate="selectedDate" 
                 :recommendedDate="recommendedDate" 
                 :daysDifference="daysDifference"
                 @update-date="updateToRecommendedDate" 
                 @close="showPopup = false" />

      <!-- Button Arrow Top -->
      <div class="button-arrow-top" 
           v-if="showNewRight || showNewRight2" 
           @click="handleButtonArrowTopClick">
        <img src="/icon/Arrow.svg" class="down" alt="down">
      </div>
    </div>

    <!-- Button Arrow Bottom -->
    <div class="button-arrow" 
         v-if="!showFinalPage" 
         :class="{ 
           disabled: !isBottomButtonActive
         }"
         @click="isBottomButtonActive ? handleButtonArrowClick() : null">
      <img src="/icon/Arrow.svg" class="down" alt="down">
    </div>

    <!-- زر Weiter zu Songs -->
    <div v-if="showFinalPage" class="btn-right" @click="handleNextStep">
      Weiter zu Songs
    </div>
  </div>
</template>

<style lang="scss" scoped>
/* ===== أنماط شاشة التحميل ===== */
.loading-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 88vh;
  min-height: 100%;
  gap: 20px;
  border-radius: 20px;
  // background: var(--Main-Colors-Slate, #26282D);
}

.loading-container .spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-top-color: var(--Strawberry, #D15);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-container .loading-text {
  color: var(--Main-Colors-Dove, #6A6C6D);
  font-family: Heebo;
  font-size: 18px;
  font-weight: 300;
  letter-spacing: 0.5px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ===== باقي الأنماط ===== */
.main {
  height: auto;
  min-height: auto;
}

.main.force-full-height {
  height: 100% !important;
  min-height: 100% !important;
  display: flex;
  flex-direction: column;
}

.main.height-auto {
  height: auto !important;
  min-height: auto !important;
  display: flex;
  flex-direction: column;
  padding-bottom: 20px;
}

.main.height-full {
  height: 100% !important;
  min-height: 100% !important;
  display: flex;
  flex-direction: column;
}

.upload {
  display: flex;
  position: relative;
  gap: 110px;
  flex: 1 1 auto;
  min-height: 0;
  align-self: stretch;
}

.upload:not(.show-right):not(.step-2) {
  align-items: center;
}

.upload.show-right,
.upload.step-2 {
  align-items: stretch;
  height: auto !important;
  min-height: auto !important;
}

/* ===== 🔥 الأقسام الداخلية ===== */
.left-section,
.right-section,
.right2-section {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.left-section {
  flex: 0 0 auto;
  position: relative;
}

/* ===== 🔥 ImageUpload Wrapper ===== */
.image-upload-wrapper {
  flex: 0 0 auto;
  /* 🔥 الأبعاد الأساسية - شاشات أقل من 1440px */
  width: clamp(310px, 25vw, 310px);
  max-width: 310px;
  height: clamp(310px, 25vw, 310px);
  max-height: 310px;
  aspect-ratio: 1/1;
}

/* 🔥 جعل ImageUpload يأخذ 100% من الـ wrapper */
.image-upload-wrapper :deep(.cards-upload-file) {
  width: 100% !important;
  height: 100% !important;
  min-width: unset !important;
  max-width: unset !important;
  min-height: unset !important;
  max-height: unset !important;
  aspect-ratio: 1/1;
}

/* ===== Responsive - شاشات 1440-1599px: من 310px إلى 366px ===== */
@media (min-width: 1440px) and (max-width: 1599px) {
  .image-upload-wrapper {
    width: clamp(310px, calc(310px + (366 - 310) * ((100vw - 1440px) / (1599 - 1440))), 366px);
    height: clamp(310px, calc(310px + (366 - 310) * ((100vw - 1440px) / (1599 - 1440))), 366px);
    max-width: 366px;
    max-height: 366px;
  }
}

/* ===== Responsive - شاشات 1600-2074px: من 366px إلى 520px ===== */
@media (min-width: 1600px) and (max-width: 2074px) {
  .image-upload-wrapper {
    width: clamp(366px, calc(366px + (520 - 366) * ((100vw - 1600px) / (2074 - 1600))), 520px);
    height: clamp(366px, calc(366px + (520 - 366) * ((100vw - 1600px) / (2074 - 1600))), 520px);
    max-width: 520px;
    max-height: 520px;
  }
}

/* ===== Responsive - شاشات 2075-2560px: من 378px إلى 503px ===== */
@media (min-width: 2075px) and (max-width: 2560px) {
  .image-upload-wrapper {
    width: clamp(378px, calc(378px + (503 - 378) * ((100vw - 2075px) / (2560 - 2075))), 503px);
    height: clamp(378px, calc(378px + (503 - 378) * ((100vw - 2075px) / (2560 - 2075))), 503px);
    max-width: 503px;
    max-height: 503px;
  }
}

/* ===== Responsive - شاشات أكبر من 2560px ===== */
@media (min-width: 2561px) {
  .image-upload-wrapper {
    width: 503px;
    height: 503px;
    max-width: 503px;
    max-height: 503px;
  }
}

.right-section,
.right2-section {
  flex: 1 1 auto;
  min-height: 0;
}

/* زر حذف الصورة */
.remove-cover {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 36px;
  height: 36px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: background 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.remove-cover:hover {
  background: rgba(222, 20, 86, 0.8);
}

.remove-cover svg {
  width: 18px;
  height: 18px;
  stroke: white;
}

/* زر السهم العلوي */
.button-arrow-top {
  display: flex;
  justify-content: center;
  width: 30px;
  height: 30px;
  padding: 12px 8px 10px 8px;
  align-items: center;
  position: absolute;
  right: 0;
  top: 20px;
  border-radius: 15px;
  background: #1B1C20;
  transition: background 0.3s ease;
  cursor: pointer;
  opacity: 0.3;
  z-index: 10;
  rotate: 180deg;
}

.button-arrow-top:hover {
  background: var(--dark-red);
  opacity: 1;
}

/* زر السهم السفلي */
.button-arrow {
  display: flex;
  justify-content: center;
  width: 30px;
  height: 30px;
  padding: 12px 8px 10px 8px;
  align-items: center;
  position: absolute;
  right: 0;
  transition: background 0.3s ease;
  bottom: 0;
  border-radius: 15px;
  background: var(--Strawberry);
  cursor: pointer;
  z-index: 10;
}

.button-arrow:hover {
  background: var(--dark-red);
}

.button-arrow.disabled {
  background: #1B1C20;
  pointer-events: none;
  opacity: 0.3;
}

.button-arrow.hidden {
  display: none;
}

.btn-right {
  position: absolute;
  right: 0px;
  bottom: 0;
  border-radius: 5px;
  background: #D15;
  padding: 8px 20px;
  color: white;
  font-weight: 400;
  text-transform: uppercase;
  cursor: pointer;
  z-index: 11;
}

.btn-right:hover {
  background: var(--dark-red);
}

/* Responsive */
@media (min-width:1440px) and (max-width:1599px) {
  .upload { gap: 110px; }
}

@media (min-width:1600px) and (max-width:2074px) {
  .upload { gap: 122px; }
}

@media (min-width:2075px) and (max-width:2560px) {
  .button-arrow-top { top: 40px; }
}

.right-sections-wrapper {
  flex: 1;
}

</style>