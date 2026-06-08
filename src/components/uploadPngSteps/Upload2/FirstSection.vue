<template>
  <div class="contents">
    <div v-if="filteredTracks.length === 0" class="text-top">
      Füge Deinen ersten Song hinzu!
    </div>
    <div v-else class="tracks-list">
      <div class="title">Deine Songlist </div>

      <div v-for="(track, index) in filteredTracks" :key="track.uuid" class="line" :class="{ 'has-warning': !isTrackComplete(track) }">
        <div class="id">{{ index + 1 }}</div>
        <!-- عرض علامة الاكتمال أو التحذير -->
        <div class="check" v-if="isTrackComplete(track)">
          <img src="/icon/y.png" alt="Completed">
        </div>
        <div class="check-warning" v-else>
          <img src="/icon/warningicon.svg" alt="Warning">
        </div>
        <div class="name-feeling">{{ track.title || "Untitled" }}</div>
        <div class="subtitle">{{ getArtistName(track) || "artist name" }}</div>
        <div class="button-edit" @click="editTrack(track.uuid)">
          <img src="/icon/edit.svg" alt="Edit">
        </div>
        <div class="button-delete" @click="deleteTrack(track.uuid)">
          <img src="/icon/tresh.svg" alt="Delete">
        </div>
      </div>
    </div>

    <div class="add-track" @click="addNewTrack">
      <img src="/icon/upload2/Plus.svg" alt="icon plus" class="plus">
    </div>
   
  </div>
  <!-- زر Weiter zu Shops - يظهر فقط إذا كان هناك أغاني من نفس النوع -->
  <div v-if="filteredTracks.length > 0" class="btn-right" 
     :class="{
       'active': allTracksComplete && (!isPreReleaseActive || (uploadedImage && isReleaseDateSelected)),
       'inactive': !allTracksComplete || (isPreReleaseActive && (!uploadedImage || !isReleaseDateSelected))
     }"
     @click="handleNext">
    Weiter zu Shops
  </div>
</template>

<script setup>
import { ref, computed, inject } from 'vue';
import { useRouter } from 'vue-router';
import apiRequest from '@/lib/apiRequest';

const router = useRouter();

const props = defineProps({
  sectionTitle: { type: String, required: true },
  selectedCardIndex: { type: [Number, null], default: null },
  tracks: { type: Array, default: () => [] },
  releaseUuid: { type: String, required: true },
  songType: { type: String, default: '' }
});

const emit = defineEmits(['back', 'update:topLineImage', 'add-track', 'edit-track', 'delete-track', 'next']);

// هذه المتغيرات يجب أن تأتي من الـ store أو من الـ parent
const isPreReleaseActive = ref(false);
const uploadedImage = ref(null);
const isReleaseDateSelected = ref(false);

// عرض اسم نوع الأغنية بشكل جميل
const songTypeDisplay = computed(() => {
  switch (props.songType) {
    case 'lossless':
      return 'Lossless';
    case 'digital_master':
      return 'Digital Master';
    case 'dobly_atmos':
      return 'Dolby Atmos';
    default:
      return 'Songs';
  }
});

// تصفية الأغاني لعرض فقط التي لها نفس النوع المختار
const filteredTracks = computed(() => {
  if (!props.songType) {
    return props.tracks.filter(track => !track.song_type || track.song_type === '');
  }
  return props.tracks.filter(track => track.song_type === props.songType);
});

// ========== دوال التحقق من اكتمال بيانات الأغنية ==========

// التحقق من وجود مؤلفين (authors)
const hasValidAuthors = (track) => {
  if (!track.authors) return false;
  
  // التحقق من وجود مؤلفين في أي من الحقول
  const hasComposer = track.authors.composer && track.authors.composer.length > 0;
  const hasVerlog = track.authors.verlog && track.authors.verlog.length > 0;
  const hasCLine = track.authors.c_line && track.authors.c_line.length > 0;
  const hasLyricist = track.authors.lyricist && track.authors.lyricist.length > 0;
  
  return hasComposer || hasVerlog || hasCLine || hasLyricist;
};

// التحقق من وجود مساهمين (contributors)
const hasValidContributors = (track) => {
  if (!track.contributors) return false;
  
  const hasArtist = track.contributors.artist && track.contributors.artist.length > 0;
  const hasFeature = track.contributors.feature && track.contributors.feature.length > 0;
  const hasProducer = track.contributors.producer && track.contributors.producer.length > 0;
  const hasPLine = track.contributors.p_line && track.contributors.p_line.length > 0;
  const hasOther = track.contributors.other_contributors && track.contributors.other_contributors.length > 0;
  
  return hasArtist || hasFeature || hasProducer || hasPLine || hasOther;
};

// الحصول على اسم الفنان من contributors
const getArtistName = (track) => {
  if (track.contributors?.artist && track.contributors.artist.length > 0) {
    return track.contributors.artist[0];
  }
  return null;
};

// التحقق من اكتمال الأغنية بشكل كامل
const isTrackComplete = (track) => {
  // 1. التحقق من العنوان
  const hasTitle = track.title && track.title.trim() !== '';
  
  // 2. التحقق من وجود ملف الصوت
  const hasSongFile = track.song_file && track.song_file !== null;
  
  // 3. التحقق من وجود غلاف
  const hasCover = track.cover && track.cover !== null;
  
  // 4. التحقق من وجود مؤلفين
  const hasAuthors = hasValidAuthors(track);
  
  // 5. التحقق من وجود مساهمين (فنانين على الأقل)
  const hasContributors = hasValidContributors(track);
  
  // 6. التحقق من تاريخ الإصدار (اختياري في بعض الحالات)
  // const hasReleaseDate = track.release_date && track.release_date !== null;
  
  // 7. التحقق من نوع الأغنية
  const hasSongType = track.song_type && track.song_type !== '';
  
  // الأغنية مكتملة إذا توفرت:
  // - العنوان
  // - ملف الصوت
  // - الغلاف
  // - مؤلفين
  // - فنانين (مساهمين)
  // - نوع الأغنية
  
  const isComplete = hasTitle && hasSongFile && hasCover && hasAuthors && hasContributors && hasSongType;
  
  // للتطوير: يمكن طباعة سبب عدم الاكتمال
  if (!isComplete) {
    console.log(`⚠️ أغنية ${track.title || 'Untitled'} غير مكتملة:`, {
      hasTitle,
      hasSongFile,
      hasCover,
      hasAuthors,
      hasContributors,
      hasSongType
    });
  }
  
  return isComplete;
};

// التحقق من أن جميع الأغاني مكتملة
const allTracksComplete = computed(() => {
  if (filteredTracks.value.length === 0) return false;
  return filteredTracks.value.every(track => isTrackComplete(track));
});

// إضافة أغنية جديدة
const addNewTrack = async () => {
  if (!props.releaseUuid) {
    console.error('❌ releaseUuid غير موجود');
    return;
  }

  if (!props.songType) {
    console.error('❌ نوع الأغنية غير محدد، الرجاء اختيار نوع أولاً');
    return;
  }

  try {
    const formData = new FormData();
    const songNumber = filteredTracks.value.length + 1;
    formData.append('title', `Song ${songNumber}`);
    formData.append('subtitle', '');
    formData.append('song_type', props.songType);
    
    console.log('🎵 إنشاء أغنية جديدة من نوع:', props.songType);

    const res = await apiRequest.post(`/releases/${props.releaseUuid}/songs`, formData);
    const newSong = res.data.data;
    
    // إضافة الأغنية مع hasWarning محسوب
    emit('add-track', newSong);
    console.log('✅ تم إنشاء أغنية جديدة:', newSong);
  } catch (err) {
    console.error('❌ فشل إنشاء الأغنية:', err);
  }
};

// تعديل أغنية
const editTrack = (songUuid) => {
  console.log('✏️ تعديل أغنية:', songUuid);
  const targetPath = `/releases/${props.releaseUuid}/songs/${songUuid}/edit`;
  console.log('🎯 التوجيه إلى:', targetPath);
  
  router.push(targetPath);
};

// حذف أغنية
const deleteTrack = async (songUuid) => {
  console.log('🗑️ حذف أغنية:', songUuid);
  
  try {
    await apiRequest.delete(`/releases/${props.releaseUuid}/songs/${songUuid}`);
    emit('delete-track', songUuid);
    console.log('✅ تم حذف الأغنية بنجاح');
  } catch (err) {
    console.error('❌ فشل حذف الأغنية:', err);
  }
};

// الانتقال إلى الخطوة التالية (يتم تعطيله إذا كانت البيانات ناقصة)
const handleNext = () => {
  if (!allTracksComplete.value) {
    console.warn('⚠️ لا يمكن المتابعة: بعض الأغاني غير مكتملة');
    return;
  }
  
  console.log('➡️ الانتقال إلى Shops - جميع الأغاني مكتملة');
  emit('next');
};
</script>

<style lang="scss" scoped>
.contents {
  display: flex;
  width: 100%;
  height: 100%;
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
  padding: 8px 0;
  border-radius: 8px;
  transition: background 0.2s ease;
}



.button-delete:hover,
.button-edit:hover {
  cursor: pointer;
  opacity: 0.7;
}

.line .id {
  color: var(--Main-Colors-White, #FFF);
  font-family: Heebo;
  font-size: 16px;
  font-style: normal;
  font-weight: 700;
  // line-height: 1;
  letter-spacing: 0.8px;
  width: 30px;
}

.line .check,
.line .check-warning {
  width: 22px;
  text-align: center;
}

.line .check img,
.line .check-warning img {
  width: 20px;
  height: 20px;
}

.line .name-feeling {
  width: 200px;
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

.tracks-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  overflow-y: auto;
  padding-right: 10px;
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
  padding: 20px;
}

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
  background: var(--Main-Colors-Slate-Dark, #1B1C20);
  cursor: pointer;
  transition: background 0.3s ease;
}

.add-track:hover {
  background: var(--Strawberry);
}

.add-track .plus {
  width: 40px;
  height: 40px;
  aspect-ratio: 1/1;
}

.btn-right {
  position: absolute;
  right: 0px;
  bottom: 0px;
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
</style>