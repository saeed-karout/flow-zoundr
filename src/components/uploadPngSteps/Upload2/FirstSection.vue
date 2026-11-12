<template>
  <div class="contents">
    <div v-if="filteredTracks.length === 0 && !isLoadingTracks" class="text-top">
      Füge Deinen ersten Song hinzu!
    </div>
    <div v-else-if="filteredTracks.length > 0" class="tracks-list">
      <div class="title">TrackList</div>

      <div
        v-for="(track, index) in filteredTracks"
        :key="track.uuid"
        class="line drag-handle"
        :class="{
          'has-warning': !isTrackComplete(track),
          'is-dragging': dragIndex === index,
          'drag-over': dragOverIndex === index && dragIndex !== index
        }"
        draggable="true"
        @dragstart="onDragStart(index, $event)"
        @dragover.prevent="onDragOver(index)"
        @dragenter.prevent
        @dragleave="onDragLeave(index)"
        @drop.prevent="onDrop(index)"
        @dragend="onDragEnd"
      >
       
        <div class="id">{{ formatTrackNumber(index) }}</div>
        <div class="check" v-if="isTrackComplete(track)">
          <img src="/icon/y.png" alt="Completed">
        </div>
        <div class="check-warning" v-else>
          <img src="/icon/warning.svg" alt="Warning">
        </div>
        <div class="name-feeling">{{ getTrackDisplayTitle(track) || "Song Titel" }}</div>
        <div class="subtitle">{{ getArtistNameFromRelease() || "" }}</div>

        <div class="button-edit" @click="editTrack(track.uuid)" title="">
          <svg xmlns="http://www.w3.org/2000/svg" width="23" height="21" viewBox="0 0 23 21" fill="currentColor" title="">
            <path d="M3.18477 14.1986C2.76556 13.908 2.73936 13.3796 3.10617 13.0361L17.4377 0.327954C17.8307 -0.0155099 18.5119 -0.0947708 18.9835 0.116592L20.4245 0.829939C20.8961 1.06772 20.9485 1.51687 20.5555 1.86033L5.85719 14.9384C5.46419 15.2818 4.80918 15.3083 4.38998 15.0176L3.18477 14.1986Z"/>
            <path d="M1.58656 15.0705C1.74376 14.5685 2.21537 14.41 2.63457 14.7006L3.83978 15.546C4.25899 15.8367 4.80919 16.3122 5.04499 16.5764C5.2808 16.8406 5.6738 17.4483 5.9096 17.9239L6.59081 19.2185C6.82661 19.6676 6.61701 20.1168 6.093 20.196L0.695754 20.9886C0.19795 21.0679 -0.116453 20.7244 0.0407484 20.2224L1.58656 15.0705Z"/>
            <path d="M6.45981 17.4219C6.224 16.9727 6.35501 16.3122 6.72181 15.9688L21.4201 2.89072C21.8132 2.54726 22.2586 2.67936 22.4158 3.15492L22.9398 4.71372C23.097 5.21571 22.9398 5.87621 22.5468 6.21968L8.26762 18.9278C7.87462 19.2713 7.37681 19.1656 7.14101 18.7165L6.45981 17.4219Z"/>
          </svg>
        </div>

        <div class="button-delete" @click="openDeletePopup(track)" title="">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="22" viewBox="0 0 20 22" fill="#d15" title="">
            <path d="M18.7945 2.96049H16.1096V1.35802C16.1096 0.597531 15.5068 0 14.7397 0H5.23288C4.46575 0 3.86301 0.597531 3.86301 1.35802V2.96049H1.17808C0.547945 2.96049 0 3.5037 0 4.15556V6.98025H20V4.1284C19.9726 3.5037 19.4521 2.96049 18.7945 2.96049ZM5.50685 1.62963H14.4658V2.96049H5.50685V1.62963Z"/>
            <path d="M0.986301 8.58272V20.8321C0.986301 21.4839 1.50685 22 2.16438 22H17.8356C18.4658 22 19.0137 21.4568 19.0137 20.8049V8.58272H0.986301ZM6.16438 18.2519C6.16438 18.8494 5.67123 19.3383 5.06849 19.3383C4.46575 19.3383 3.9726 18.8494 3.9726 18.2519V12.3309C3.9726 11.7333 4.46575 11.2444 5.06849 11.2444C5.67123 11.2444 6.16438 11.7333 6.16438 12.3309V18.2519ZM11.0959 18.2519C11.0959 18.8494 10.6027 19.3383 10 19.3383C9.39726 19.3383 8.90411 18.8494 8.90411 18.2519V12.3309C8.90411 11.7333 9.39726 11.2444 10 11.2444C10.6027 11.2444 11.0959 11.7333 11.0959 12.3309V18.2519ZM16.0274 18.2519C16.0274 18.8494 15.5342 19.3383 14.9315 19.3383C14.3288 19.3383 13.8356 18.8494 13.8356 18.2519V12.3309C13.8356 11.7333 14.3288 11.2444 14.9315 11.2444C15.5342 11.2444 16.0274 11.7333 16.0274 12.3309V18.2519Z"/>
          </svg>
        </div>
      </div>
    </div>

    <!-- 🔥 زر الإضافة - يختفي تماماً عند عدم الإمكانية -->
    <div v-if="canAddMoreSongs && !isLoadingTracks" class="add-track" @click="addNewTrack">
      <img src="/icon/upload2/Plus.svg" alt="icon plus" class="plus">
    </div>
  </div>

  <!-- زر Weiter zu Shops -->
  <div v-if="filteredTracks.length > 0" class="btn-right" 
     :class="{
       'active': allTracksComplete && canProceedToShops && (!isPreReleaseActive || (uploadedImage && isReleaseDateSelected)),
       'inactive': !allTracksComplete || !canProceedToShops || (isPreReleaseActive && (!uploadedImage || !isReleaseDateSelected))
     }"
     @click="handleNext">
    Weiter zu Shops
  </div>

  <!-- Popup تأكيد الحذف -->
  <ConfirmDeletePopup
    :show="showDeletePopup"
    :song-title="songToDelete?.title || 'Song Titel'"
    :song-uuid="songToDelete?.uuid || ''"
    @confirm="confirmDelete"
    @cancel="cancelDelete"
  />
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick, inject } from 'vue';
import { useRouter } from 'vue-router';
import apiRequest from '@/lib/apiRequest';
import ConfirmDeletePopup from '@/components/modals/ConfirmDeletePopup.vue';
import { useReleaseStore } from '@/stores/release';
import { computeTabCompletion, isSongComplete, isInstrumentalSong } from '@/utils/songCompletion';

const router = useRouter();
const releaseStore = useReleaseStore();

const props = defineProps({
  sectionTitle: { type: [String, Object], default: 'Songs' },
  selectedCardIndex: { type: Number, default: null },
  tracks: { type: Array, default: () => [] },
  releaseUuid: { type: String, required: true },
  audioQuality: { type: String, default: '' },
  isInSubLayout: { type: Boolean, default: false },
  releaseTitle: { type: String, default: '' },
  releaseArtists: { type: Array, default: () => [] }
});

const emit = defineEmits(['back', 'update:topLineImage', 'add-track', 'edit-track', 'delete-track', 'next', 'reorder-tracks']);

// ========== Inject draftRelease ==========
const draftRelease = inject('draftRelease', null);

// ========== Popup الحذف ==========
const showDeletePopup = ref(false);
const songToDelete = ref(null);

// ========== Drag & Drop ==========
const dragIndex = ref(null);
const dragOverIndex = ref(null);
const localOrder = ref([]);

const onDragStart = (index, event) => {
  dragIndex.value = index;
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData('text/plain', index.toString());
};

const onDragOver = (index) => {
  if (dragIndex.value !== null && dragIndex.value !== index) {
    dragOverIndex.value = index;
  }
};

const onDragLeave = (index) => {
  if (dragOverIndex.value === index) {
    dragOverIndex.value = null;
  }
};

const onDrop = async (toIndex) => {
  const fromIndex = dragIndex.value;
  dragOverIndex.value = null;
  dragIndex.value = null;

  if (fromIndex === null || fromIndex === toIndex) return;

  // ✅ الحصول على الأغنية التي تم نقلها
  const movedTrack = localOrder.value[fromIndex];
  
  // ✅ إعادة ترتيب القائمة المحلية
  const reordered = [...localOrder.value];
  const [moved] = reordered.splice(fromIndex, 1);
  reordered.splice(toIndex, 0, moved);
  localOrder.value = reordered;

  // ✅ إعلام المكون الأب بالتغيير
  emit('reorder-tracks', reordered);

  // ✅ إرسال طلب PUT واحد فقط
  try {
    await apiRequest.put(
      `/releases/${props.releaseUuid}/songs/${movedTrack}`,
      { sort_order: toIndex + 1 }
    );
    console.log('✅ تم تحديث ترتيب الأغنية:', movedTrack, 'إلى:', toIndex + 1);
    
    // ✅ تحديث القائمة المحلية بترتيب جديد من الخادم (اختياري)
    const response = await apiRequest.get(`/releases/${props.releaseUuid}/songs`);
    if (response.data?.data) {
      const updatedSongs = response.data.data;
      localOrder.value = updatedSongs.map(s => s.uuid);
      emit('reorder-tracks', localOrder.value);
    }
  } catch (err) {
    console.error('❌ فشل تحديث ترتيب الأغنية:', err);
    
    // ✅ إعادة تحميل الترتيب الأصلي في حالة الفشل
    const response = await apiRequest.get(`/releases/${props.releaseUuid}/songs`);
    if (response.data?.data) {
      const originalOrder = response.data.data.map(s => s.uuid);
      localOrder.value = originalOrder;
      emit('reorder-tracks', originalOrder);
    }
  }
};

const onDragEnd = () => {
  dragIndex.value = null;
  dragOverIndex.value = null;
};

// ========== استقبال حالة Pre-release من المكون الأب ==========
const isPreReleaseActive = ref(false);
const uploadedImage = ref(null);
const isReleaseDateSelected = ref(false);

// ========== 🔥 علامات لمنع الإنشاء المتكرر ==========
const isInitialLoad = ref(true);
const isAddingTrack = ref(false);
const isLoadingTracks = ref(true);

// ========== 🔥 الحصول على نوع الـ Release ==========
const releaseType = computed(() => {
  // 1. من releaseStore
  if (releaseStore.releaseTypeValue) {
    return releaseStore.releaseTypeValue;
  }
  
  // 2. من releaseStore.releaseType
  if (releaseStore.releaseType) {
    const type = releaseStore.releaseType.toLowerCase();
    if (type.includes('single')) return 'single';
    if (type.includes('extended') || type.includes('ep')) return 'extended player';
    if (type.includes('album')) return 'album';
  }
  
  // 3. من draftRelease
  if (draftRelease?.value?.release_type) {
    return draftRelease.value.release_type;
  }
  
  // 4. افتراضي
  return 'single';
});

// ========== 🔥 تحديد الحد الأدنى والحد الأقصى للأغاني حسب نوع الـ Release ==========
const songLimits = computed(() => {
  const type = releaseType.value;
  
  switch (type) {
    case 'single':
      return { min: 1, max: 3, label: 'Single' };
    case 'extended player':
      return { min: 3, max: 6, label: 'Extended Player' };
    case 'album':
      return { min: 7, max: Infinity, label: 'Album' };
    default:
      return { min: 1, max: Infinity, label: 'Unknown' };
  }
});

// ========== 🔥 التحقق من إمكانية إضافة المزيد من الأغاني ==========
const canAddMoreSongs = computed(() => {
  const currentCount = filteredTracks.value.length;
  const maxSongs = songLimits.value.max;
  
  // إذا كان Infinity (Album)، يمكن إضافة ما لا نهاية
  if (maxSongs === Infinity) {
    return true;
  }
  
  return currentCount < maxSongs;
});

// ========== 🔥 التحقق من إمكانية الانتقال إلى Shops ==========
const canProceedToShops = computed(() => {
  const currentCount = filteredTracks.value.length;
  const minSongs = songLimits.value.min;
  const maxSongs = songLimits.value.max;
  
  // التحقق من الحد الأدنى
  if (currentCount < minSongs) {
    console.log(`📌 [FirstSection] عدد الأغاني (${currentCount}) أقل من الحد الأدنى (${minSongs})`);
    return false;
  }
  
  // التحقق من الحد الأقصى (إذا لم يكن Infinity)
  if (maxSongs !== Infinity && currentCount > maxSongs) {
    console.log(`📌 [FirstSection] عدد الأغاني (${currentCount}) أكبر من الحد الأقصى (${maxSongs})`);
    return false;
  }
  
  return true;
});

// ========== دالة لتحديث حالة Pre-release من المكون الأب ==========
const updatePreReleaseStatus = (status, image, dateSelected) => {
  isPreReleaseActive.value = status;
  uploadedImage.value = image;
  isReleaseDateSelected.value = dateSelected;
  console.log('📌 [FirstSection] تحديث حالة Pre-release:', { status, image: !!image, dateSelected });
  // ✅ إعادة التحقق عند تغيير حالة Pre-release
  updateAllTracksComplete();
};

// ========== الحصول على اسم الفنان من الـ Release ==========
const getArtistNameFromRelease = () => {
  if (releaseStore.metasData?.artists && releaseStore.metasData.artists.length > 0) {
    return releaseStore.metasData.artists[0];
  }
  
  if (draftRelease?.value?.artists && draftRelease.value.artists.length > 0) {
    return draftRelease.value.artists[0];
  }
  
  if (props.releaseArtists && props.releaseArtists.length > 0) {
    return props.releaseArtists[0];
  }
  
  return '';
};

// ========== الحصول على عنوان العرض للأغنية (بدون الرقم) ==========
const getTrackDisplayTitle = (track) => {
  if (!track || !track.title) return 'Song Titel';
  
  const titleParts = track.title.split(' ');
  if (/^\d{2}$/.test(titleParts[0])) {
    const displayTitle = titleParts.slice(1).join(' ');
    // ✅ إذا كان الجزء النصي فارغاً أو "Song Titel"، استخدم "Song Titel"
    return (displayTitle && displayTitle !== 'Song Titel') ? displayTitle : 'Song Titel';
  }
  
  return track.title || 'Song Titel';
};

// ========== دوال التحقق من اكتمال بيانات الأغنية ==========

const hasValidAuthors = (track) => {
  if (!track.authors) return false;
  
  const hasComposer = track.authors.composer && track.authors.composer.length > 0;
  const hasVerlog = track.authors.verlog && track.authors.verlog.length > 0;
  const hasCLine = track.authors.c_line && track.authors.c_line.length > 0;
  const hasLyricist = track.authors.lyricist && track.authors.lyricist.length > 0;
  
  return hasComposer || hasVerlog || hasCLine || hasLyricist;
};

const hasValidContributors = (track) => {
  if (!track.contributors) return false;
  
  const hasArtist = track.contributors.artist && track.contributors.artist.length > 0;
  const hasFeature = track.contributors.feature && track.contributors.feature.length > 0;
  const hasProducer = track.contributors.producer && track.contributors.producer.length > 0;
  const hasPLine = track.contributors.p_line && track.contributors.p_line.length > 0;
  const hasOther = track.contributors.other_contributors && track.contributors.other_contributors.length > 0;
  
  return hasArtist || hasFeature || hasProducer || hasPLine || hasOther;
};
// ========== دالة التحقق من اكتمال الأغنية ==========
// ✅ تستخدم المصدر المشترك @/utils/songCompletion كي تتطابق قائمة الأغاني هنا مع
//    علامات التبويبات في tabs.vue و Infos1 ومع isSongsComplete في المخزَّن.
const isTrackComplete = (track) => {
  if (!track) return false;

  const completion = computeTabCompletion(track);
  const complete = isSongComplete(track);

  console.log(`📌 [FirstSection] تحليل الأغنية: ${track.title || 'Untitled'}`, {
    ...completion,
    isInstrumental: isInstrumentalSong(track),
    hasSongFile: !!track.song_file,
    isComplete: complete
  });

  return complete;
};
// ========== ✅ التحقق من اكتمال جميع الأغاني ==========
const allTracksComplete = ref(false);

// ========== ✅ دالة تحديث حالة اكتمال جميع الأغاني ==========
const updateAllTracksComplete = () => {
  if (filteredTracks.value.length === 0) {
    allTracksComplete.value = false;
    releaseStore.setSongsComplete(false);
    console.log('📌 [FirstSection] لا توجد أغاني، allTracksComplete = false');
    return;
  }
  
  // ✅ تحليل كل أغنية على حدة
  const trackStatus = filteredTracks.value.map(track => ({
    title: track.title || 'Untitled',
    uuid: track.uuid,
    isComplete: isTrackComplete(track)
  }));
  
  console.log('📊 [FirstSection] حالة الأغاني:', trackStatus);
  
  // ✅ التحقق من أن جميع الأغاني مكتملة
  const allComplete = trackStatus.every(item => item.isComplete === true);
  allTracksComplete.value = allComplete;
  releaseStore.setSongsComplete(allComplete);

  // ✅ مزامنة draftRelease.songs مع الأغاني المحدّثة هنا. بدون ذلك يقرأ
  //    determineStepFromRelease أعلاماً قديمة (deals/pre_release) لأغنية عُدّلت
  //    للتو فيعيد ضبط isSongsComplete إلى false ويمنع "Weiter zu Shops".
  if (releaseStore.draftRelease && Array.isArray(props.tracks)) {
    releaseStore.draftRelease.songs = props.tracks.map(t => ({ ...t }));
  }

  console.log(`📌 [FirstSection] جميع الأغاني مكتملة: ${allComplete}`);
  return trackStatus;
};
// ========== تصفية الأغاني ==========
const filteredTracks = computed(() => {
  if (localOrder.value.length === 0) {
    return [...props.tracks].sort((a, b) => (a.sort_order ?? 9999) - (b.sort_order ?? 9999));
  }
  const order = localOrder.value;
  return [...props.tracks].sort((a, b) => {
    const ia = order.indexOf(a.uuid);
    const ib = order.indexOf(b.uuid);
    return (ia === -1 ? 9999 : ia) - (ib === -1 ? 9999 : ib);
  });
});

// ========== 🔥 دالة تنسيق رقم الأغنية (01, 02, 03, ...) ==========
const formatTrackNumber = (index) => {
  const number = index + 1;
  return number.toString().padStart(2, '0');
};

// ========== 🔥 دالة الحصول على رقم الأغنية التالي ==========
const getNextTrackNumber = () => {
  const count = filteredTracks.value.length + 1;
  return count.toString().padStart(2, '0');
};

// ========== 🔥 إضافة أغنية جديدة ==========
const addNewTrack = async (force = false) => {
  // 🔥 منع الإنشاء المتكرر
  if (isAddingTrack.value) {
    console.log('⏳ [FirstSection] جاري إضافة أغنية بالفعل، تخطي');
    return;
  }
  
  // 🔥 منع الإنشاء التلقائي عند التحميل الأول
  if (isInitialLoad.value && !force) {
    console.log('⏳ [FirstSection] تخطي الإنشاء التلقائي (تحميل أولي)');
    return;
  }
  
  // 🔥 منع الإنشاء إذا كانت الأغاني لا تزال قيد التحميل
  if (isLoadingTracks.value) {
    console.log('⏳ [FirstSection] الأغاني لا تزال قيد التحميل، تخطي الإنشاء');
    return;
  }
  
  // 🔥 التحقق من إمكانية إضافة المزيد من الأغاني
  if (!canAddMoreSongs.value) {
    const maxSongs = songLimits.value.max;
    const typeLabel = songLimits.value.label;
    console.warn(`⚠️ [FirstSection] لا يمكن إضافة المزيد من الأغاني (الحد الأقصى لـ ${typeLabel} هو ${maxSongs === Infinity ? '∞' : maxSongs})`);
    
    const message = maxSongs === Infinity 
      ? 'يمكنك إضافة عدد غير محدود من الأغاني للألبوم.'
      : `الحد الأقصى لـ ${typeLabel} هو ${maxSongs} أغاني.`;
    
    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: { 
        message: `لا يمكن إضافة المزيد من الأغاني. ${message}`,
        type: 'warning'
      }
    }));
    return;
  }
  
  if (!props.releaseUuid) {
    console.error('❌ releaseUuid غير موجود');
    return;
  }

  if (!props.audioQuality) {
    console.error('❌ نوع الأغنية غير محدد، الرجاء اختيار نوع أولاً');
    return;
  }

  // 🔥 تعيين علامة الجاري
  isAddingTrack.value = true;

  try {
    const formData = new FormData();
    const trackNumber = getNextTrackNumber();
    
    // ✅ استخدام "Song Titel" كعنوان افتراضي بدلاً من عنوان الـ Release
    const trackTitle = `${trackNumber} Song Titel`;
    
    formData.append('title', trackTitle);
    formData.append('subtitle', '');
    formData.append('sort_order', filteredTracks.value.length + 1);
    
    console.log('🎵 إنشاء أغنية جديدة:', trackTitle);

    const res = await apiRequest.post(`/releases/${props.releaseUuid}/songs`, formData);
    const newSong = res.data.data;
    
    // ✅ إعادة تعيين currentSongTitle إلى القيمة الافتراضية
    releaseStore.setCurrentSongTitle('');
    releaseStore.setCurrentSongNumber(trackNumber);
    
    emit('add-track', newSong);
    console.log('✅ تم إنشاء أغنية جديدة:', newSong);
  } catch (err) {
    console.error('❌ فشل إنشاء الأغنية:', err);
  } finally {
    setTimeout(() => {
      isAddingTrack.value = false;
    }, 500);
  }
};

// ========== تعديل أغنية ==========
const editTrack = (songUuid) => {
  console.log('✏️ تعديل أغنية:', songUuid);
  
  const track = filteredTracks.value.find(t => t.uuid === songUuid);
  if (track) {
    console.log('📌 تم العثور على الأغنية:', track.title);
  }
  
  emit('edit-track', songUuid);
};

// ========== الانتقال إلى الخطوة التالية ==========
const handleNext = () => {
  // ✅ نحسب الاكتمال من الأغاني الحالية مباشرةً (المصدر الحقيقي المحدّث) بدل
  //    الاعتماد على releaseStore.isSongsComplete الذي قد يكون قديماً أو تخطّاه
  //    قفل التحديث في الـ store، فيمنع المتابعة رغم اكتمال الأغاني فعلاً.
  const isComplete =
    filteredTracks.value.length > 0 &&
    filteredTracks.value.every(t => isTrackComplete(t));

  // نزامن قيمة الـ store مع الحقيقة حتى تتفق بقية الشاشة (الشريط/التنقل).
  if (isComplete && releaseStore.isSongsComplete !== true) {
    releaseStore.isSongsComplete = true;
  }

  if (!isComplete) {
    console.warn('⚠️ لا يمكن المتابعة: بعض الأغاني غير مكتملة');
    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: {
        message: 'Bitte vervollständige alle Songs (Audio-Datei, Cover, Autoren und Mitwirkende).',
        type: 'warning'
      }
    }));
    return;
  }
  
  if (!canProceedToShops.value) {
    const minSongs = songLimits.value.min;
    const maxSongs = songLimits.value.max;
    const typeLabel = songLimits.value.label;
    
    let message = '';
    if (filteredTracks.value.length < minSongs) {
      message = `Für ${typeLabel} benötigst du mindestens ${minSongs} ${minSongs === 1 ? 'Song' : 'Songs'}. Aktuell: ${filteredTracks.value.length}.`;
    } else if (maxSongs !== Infinity && filteredTracks.value.length > maxSongs) {
      message = `Für ${typeLabel} kannst du maximal ${maxSongs} ${maxSongs === 1 ? 'Song' : 'Songs'} haben. Aktuell: ${filteredTracks.value.length}.`;
    }
    
    console.warn(`⚠️ [FirstSection] ${message}`);
    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: { 
        message: message,
        type: 'warning'
      }
    }));
    return;
  }
  
  console.log('➡️ الانتقال إلى Shops - جميع الأغاني مكتملة وبالعدد المناسب');
  emit('next');
};

// ========== دوال الحذف ==========
const openDeletePopup = (track) => {
  songToDelete.value = track;
  showDeletePopup.value = true;
  console.log('🗑️ فتح popup حذف للأغنية:', track.title);
};

const cancelDelete = () => {
  showDeletePopup.value = false;
  songToDelete.value = null;
  console.log('❌ تم إلغاء الحذف');
};

const confirmDelete = async (songUuid) => {
  console.log('✅ تأكيد حذف الأغنية:', songUuid);
  
  showDeletePopup.value = false;
  
  const trackIndex = props.tracks.findIndex(t => t.uuid === songUuid);
  if (trackIndex !== -1) {
    emit('delete-track', songUuid);
    console.log('✅ تم إزالة الأغنية من القائمة المحلية');
  }
  
  try {
    await apiRequest.delete(`/releases/${props.releaseUuid}/songs/${songUuid}`);
    console.log('✅ تم حذف الأغنية بنجاح من الخادم');
    
    // ✅ بعد الحذف، تحقق من عدد الأغاني المتبقية
    const remainingTracks = props.tracks.filter(t => t.uuid !== songUuid);
    if (remainingTracks.length === 0) {
      console.log('📌 تم حذف آخر أغنية، القائمة فارغة');
      // ✅ تحديث حالة الأغاني في الـ Store
      releaseStore.setSongsComplete(false);
    }
    
  } catch (err) {
    console.error('❌ فشل حذف الأغنية من الخادم:', err);
    
    if (err.response?.status === 404) {
      console.warn('⚠️ الأغنية غير موجودة على الخادم (404)');
    } else {
      alert('Fehler beim Löschen des Songs. Bitte versuchen Sie es erneut.');
    }
  }
  
  songToDelete.value = null;
};

// ========== مراقبة التغييرات ==========

// ✅ عند تغيير قائمة الأغاني
watch(() => props.tracks, (newTracks) => {
  console.log('📊 [FirstSection] tracks updated:', newTracks.length);

  if (newTracks.length > 0) {
    isLoadingTracks.value = false;
  } else {
    setTimeout(() => {
      if (props.tracks.length === 0) {
        isLoadingTracks.value = false;
      }
    }, 1000);
  }

  const sorted = [...newTracks].sort((a, b) => (a.sort_order ?? 9999) - (b.sort_order ?? 9999));
  localOrder.value = sorted.map(t => t.uuid);

  updateAllTracksComplete();

  if (newTracks.length > 0) {
    isInitialLoad.value = false;
  }
}, { immediate: true, deep: true });

// ✅ عند تغيير audioQuality
watch(() => props.audioQuality, (newType) => {
  if (newType) {
    console.log('📌 [FirstSection] audioQuality changed to:', newType);
    // ✅ إعادة تحليل الأغاني
    updateAllTracksComplete();
  }
}, { immediate: true });

// ✅ عند تغيير Pre-release
watch(
  () => [isPreReleaseActive.value, uploadedImage.value, isReleaseDateSelected.value],
  () => {
    console.log('📌 [FirstSection] Pre-release status changed, rechecking tracks...');
    updateAllTracksComplete();
  },
  { deep: true, immediate: true }
);
// ========== مراقبة التغييرات في tabCompletion ==========
watch(
  () => releaseStore.tabCompletion,
  (newVal) => {
    console.log('📌 [FirstSection] tabCompletion changed:', newVal);
    // ✅ إعادة التحقق من اكتمال الأغاني
    updateAllTracksComplete();
  },
  { deep: true, immediate: true }
);

// ========== مراقبة Pre-release ==========
watch(
  () => [isPreReleaseActive.value, uploadedImage.value, isReleaseDateSelected.value],
  () => {
    console.log('📌 [FirstSection] Pre-release status changed, rechecking tracks...');
    updateAllTracksComplete();
  },
  { deep: true, immediate: true }
);

// ========== 🔥 مراقبة releaseType للتحديث ==========
watch(() => releaseType.value, (newType) => {
  console.log('📌 [FirstSection] releaseType changed to:', newType);
  // تحديث حالة الأغاني
  updateAllTracksComplete();
}, { immediate: true });

// ========== 🔥 دورة الحياة ==========
onMounted(async () => {
  console.log('🚀 [FirstSection] mounted');
  console.log('📌 tracks:', props.tracks.length);
  console.log('📌 audioQuality:', props.audioQuality);
  
  await nextTick();
  
  // ✅ إزالة جميع الـ tooltips من الأزرار
  document.querySelectorAll('.button-edit, .button-delete').forEach(el => {
    el.removeAttribute('title');
    const svg = el.querySelector('svg');
    if (svg) {
      svg.removeAttribute('title');
    }
  });
  
  if (props.tracks.length > 0) {
    isLoadingTracks.value = false;
    isInitialLoad.value = false;
    console.log('✅ [FirstSection] توجد أغاني، تحليلها...');
    // ✅ تحليل جميع الأغاني عند التحميل
    updateAllTracksComplete();
  } else {
    console.log('⏳ [FirstSection] لا توجد أغاني، انتظار...');
    isLoadingTracks.value = false;
  }
});

// ========== تصدير الدوال للمكون الأب ==========
defineExpose({
  updatePreReleaseStatus,
  isPreReleaseActive,
  uploadedImage,
  isReleaseDateSelected,
  isTrackComplete,
  allTracksComplete,
  addNewTrack,
  filteredTracks,
  getTrackDisplayTitle,
  getArtistNameFromRelease,
  canAddMoreSongs,
  canProceedToShops,
  releaseType,
  songLimits
});
</script>

<style lang="scss" scoped>
.contents {
  display: flex;
  position: relative;
  width: 100%;
  flex-direction: column;
  align-items: start;
  align-self: stretch;
  gap: 20px;
  flex-shrink: 0;
  padding-top: 20px;
}

.title {
  color: #FFF;
  font-family: Heebo;
  font-size: 20px;
  font-style: normal;
  font-weight: 700;
  line-height: 1;
  text-transform: uppercase;
}

.line {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 20px;
  align-self: stretch;
  max-height: 24px;
  border-radius: 8px;
  transition: background 0.2s ease;
  overflow: hidden;
}

.button-edit,
.button-delete {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  
  height: 32px;
  border-radius: 50%;
  background: transparent;
  border: none;
  padding: 0;
  flex-shrink: 0;
  
  svg {
    fill: #FFF;
    transition: all 0.3s ease;
    width: 20px;
    height: 20px;
  }
}

.button-edit:hover,
.button-delete:hover {
  svg {
    fill: #D15;
  }
}

.button-edit:active,
.button-delete:active {
  transform: scale(0.9);
}

.line .id {
  color: var(--Main-Colors-White, #FFF);
  font-family: Heebo;
  font-size: 16px;
  font-style: normal;
  font-weight: 700;
  letter-spacing: 0.8px;
  width: 30px;
  flex-shrink: 0;
}

.line .check,
.line .check-warning {
  width: 22px;
  text-align: center;
  flex-shrink: 0;
}

.line .check img,
.line .check-warning img {
  width: 20px;
}

.line .name-feeling {
  min-width: 525px;
  color: var(--Main-Colors-White, #FFF);
  font-family: Heebo;
  font-size: 16px;
  font-style: normal;
  font-weight: 700;
  line-height: 1;
  letter-spacing: 0.8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.line .subtitle {
  color: var(--Main-Colors-White, #FFF);
  font-family: Heebo;
  font-size: 16px;
  font-style: normal;
  font-weight: 300;
  line-height: normal;
  letter-spacing: 0.8px;
  flex: 1 0 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.line .check-warning {
  position: relative;
  top: -2px;
}

.tracks-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  max-height: calc(100vh - 300px);
}

.text-top {
  color: var(--Main-Colors-White, #FFF);
  text-align: center;
  font-family: Heebo;
  font-size: 18px;
  font-style: normal;
  font-weight: 300;
  line-height: 1;
  align-self: stretch;
}

/* ========== 🔥 أنماط زر الإضافة ========== */
.add-track {
  display: flex;
  height: 60px;
  padding: 10px 20px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
  align-self: stretch;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: var(--Main-Colors-Slate-Dark, #1B1C20);
}

.add-track:hover {
  background: var(--Strawberry);
}

.add-track .plus {
  width: 40px;
  height: 40px;
  aspect-ratio: 1/1;
  transition: opacity 0.3s ease;
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

.btn-right.active {
  background: var(--Main-Colors-Strawberry, #D15);
  color: #fff;
}

.btn-right.active:hover {
  background: var(--dark-red, #b30f45);
}

.btn-right.inactive {
  background: var(--Main-Colors-Slate-Light, #3A3E42);
  color: #6A6C6D;
  cursor: not-allowed;
}

.drag-handle {
  overflow: hidden;
  cursor: grab;
  color: #6A6C6D;
  flex-shrink: 0;

  transition: color 0.2s ease;
}

.drag-handle:active {
  cursor: grabbing;
}

.line:hover .drag-handle {
  color: #FFF;
}

.line.is-dragging {
  // opacity: 0.4;
}


</style>