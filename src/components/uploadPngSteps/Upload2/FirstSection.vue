<template>
  <div class="contents">
    <div v-if="tracks.length === 0" class="text-top">
      Füge Deinen ersten Song hinzu!
    </div>
    <div v-else class="tracks-list">
      <div class="title">Deine Songlist</div>

      <div v-for="(track, index) in tracks" :key="track.uuid" class="line" :class="{ 'has-warning': track.hasWarning }">
        <div class="id">{{ index + 1 }}</div>
        <div class="check" v-if="!track.hasWarning">
          <img src="/icon/y.png" alt="Completed">
        </div>
        <div class="check-warning" v-else>
          <img src="/icon/warning.svg" alt="Warning">
        </div>
        <div class="name-feeling">{{ track.title  }}</div>
        <div class="subtitle">{{ track.artist_name || "artist name" }}</div>
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
  <!-- زر Weiter zu Shops - يظهر فقط إذا كان هناك أغاني -->
  <div v-if="tracks.length > 0" class="btn-right" 
     :class="{
       'active': !isPreReleaseActive || (uploadedImage && isReleaseDateSelected),
       'inactive': isPreReleaseActive && (!uploadedImage || !isReleaseDateSelected)
     }"
     @click="handleNext">
    Weiter zu Shops
  </div>
</template>

<script setup>
import { ref } from 'vue';
import apiRequest from '@/lib/apiRequest';
import { useRouter } from 'vue-router';

const router = useRouter();

const props = defineProps({
  sectionTitle: { type: String, required: true },
  selectedCardIndex: { type: [Number, null], default: null },
  tracks: { type: Array, default: () => [] },
  releaseUuid: { type: String, required: true }
});

const emit = defineEmits(['back', 'update:topLineImage', 'add-track', 'edit-track', 'delete-track', 'next']);

// هذه المتغيرات يجب أن تأتي من الـ store أو من الـ parent
// يمكنك استيرادها من الـ store إذا كانت موجودة، أو تمريرها كـ props
const isPreReleaseActive = ref(false);
const uploadedImage = ref(null);
const isReleaseDateSelected = ref(false);

// إضافة أغنية جديدة → POST مباشرة هنا + إضافة السطر محليًا
const addNewTrack = async () => {
  if (!props.releaseUuid) {
    console.error('releaseUuid غير موجود');
    return;
  }

  try {
    const formData = new FormData();
    formData.append('title', 'Neuer Song');
    formData.append('subtitle', '');
    formData.append('song_type', 'SONG'); // إضافة نوع الأغنية الافتراضي

    const res = await apiRequest.post(`/releases/${props.releaseUuid}/songs`, formData);
    const newSong = res.data.data;

    // أضف الأغنية الجديدة مباشرة إلى القائمة (بدون انتقال)
    emit('add-track', newSong);
    console.log('✅ تم إنشاء أغنية جديدة:', newSong);
  } catch (err) {
    console.error('❌ فشل إنشاء الأغنية:', err);
  }
};

// تعديل أغنية → إرسال الحدث مع uuid الأغنية فقط
const editTrack = (songUuid) => {
  console.log('✏️ تعديل أغنية:', songUuid);
  emit('edit-track', songUuid);
};

// حذف أغنية → إرسال الحدث مع uuid الأغنية
const deleteTrack = (songUuid) => {
  console.log('🗑️ حذف أغنية:', songUuid);
  emit('delete-track', songUuid);
};

// الانتقال إلى الخطوة التالية
const handleNext = () => {
  console.log('➡️ الانتقال إلى Shops');
  emit('next');
};
</script>

<style lang="scss" scoped>
/* الأنماط كما هي تمامًا - لا تغيير */
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
}


.button-delete:hover,.button-edit:hover{
  cursor: pointer;
}
.line .id {
  color: var(--Main-Colors-White, #FFF);
  font-family: Heebo;
  font-size: 16px;
  font-style: normal;
  font-weight: 700;
  line-height: 1;
  letter-spacing: 0.8px;
}

.line .check,
.line .check-warning {
  width: 24px;
  text-align: center;
}

.line .name-feeling {
  width: 326px;
  color: var(--Main-Colors-White, #FFF);
  font-family: Heebo;
  font-size: 16px;
  font-style: normal;
  font-weight: 700;
  line-height: 1;
  letter-spacing: 0.8px;
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
}

.btn-back {
  display: flex;
  padding: 12px 20px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  border-radius: 5px;
  background: var(--Main-Colors-Slate-Light, #3A3E42);
  color: var(--Main-Colors-White, #FFF);
  font-family: Heebo;
  font-size: 16px;
  font-weight: 400;
  line-height: 1;
  text-transform: uppercase;
  position: absolute;
  bottom: 20px;
  left: 20px;
  cursor: pointer;
}

.tracks-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  overflow-y: auto;
  padding-right: 10px;
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

/* زر التالي عندما يكون PreRelease غير نشط - أخضر */
.btn-right:not(.inactive) {
  background: var(--Main-Colors-Strawberry, #D15);
  color: #fff;
}

.btn-right:not(.inactive):hover {
  background: var(--dark-red, #b30f45);
}

/* زر التالي عندما يكون PreRelease نشطاً والبيانات ناقصة - رمادي معطل */
.btn-right.inactive {
  background: var(--Main-Colors-Slate-Light, #3A3E42);
  color: #6A6C6D;
  cursor: not-allowed;
}
</style>