<template>
  <div class="Content-Box">
    <div class="column1">
      <div class="Head">
        <div class="head-title">#</div>
        <div class="head-title">Titel</div>
        <div class="head-title">Version</div>
        <div class="head-title">Laufzeit</div>
        <div class="head-title">Lyrics</div>
        <div class="head-title">Deals</div>
        <div class="head-title">ISRC</div>
        <div class="Frame">Anhören</div>
      </div>

      <template v-if="songs.length === 0">
        <div class="no-data">Keine Songs verfügbar</div>
      </template>

      <div v-else v-for="(song, index) in songs" :key="song.uuid" class="song-row" style="width: 100%;">
        <div class="line">
          <div class="value">{{ index + 1 }}</div>
          <div class="value weight-7">
            {{ toTitleCase(song.title || '—') }}
            <span v-if="song.subtitle" class="subtitle-small">({{ toTitleCase(song.subtitle) }})</span>
          </div>
          <div class="value weight-7">{{ toTitleCase(song.song_type || '—') }}</div> 
          <div class="value">{{ formatDuration(song.duration) }}</div> 
          <div class="value">{{ toTitleCase(getLanguageDisplayName(song.lyrics_language) || '—') }}</div>
          <div class="value">{{ hasDeals(song) ? 'Ja' : 'Nein' }}</div>
          <div class="value">{{ toTitleCase(song.isrc || '—') }}</div>
          <div class="play-button">
            <div class="play-music" @click="playSong(song)">
              <div class="icon" :class="{ 'is-pause': playingUuid === song.uuid }"></div>
            </div>
          </div>
        </div>

        <div class="Trenner" v-if="index < songs.length - 1"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { toTitleCase } from '@/utils/formatText';
import apiRequest from '@/lib/apiRequest';
import { computed, ref, onBeforeUnmount, onMounted } from 'vue';
import { storage_url } from '@/constants';

const props = defineProps({
  release: {
    type: Object,
    default: () => ({})
  }
});

// أسماء اللغات من GET /languages — نفس مصدر ومنطق getLanguageDisplayName في InfosContent.
// الـ API يحفظ الرمز (ar / sq / en_MT) والقائمة تربطه بالاسم.
const languages = ref([]);

onMounted(async () => {
  try {
    const response = await apiRequest.get('/languages');
    languages.value = Array.isArray(response.data) ? response.data : (response.data?.data ?? []);
  } catch (error) {
    console.warn('⚠️ [Titelliste] فشل تحميل اللغات:', error?.message || error);
  }
});

// لا تُعرض الأكواد أبداً. القيمة قد تكون رمز لغة مع منطقة (en_MT / en-MT)
// بينما قائمة /languages تحوي اللغة الأساسية فقط (en) — فكانت المطابقة الحرفية
// تفشل ويُعرض الرمز نفسه ("En MT"). ترتيب المحاولات:
//   1) القائمة بمطابقة مُطبّعة (حالة الأحرف، _ و -)
//   2) اللغة الأساسية من القائمة + اسم المنطقة    en_MT → English (Malta)
//   3) Intl.DisplayNames بالألمانية                         sq → Albanisch
//   4) — (بدل الرمز)
const langKey = (v) => String(v || '').trim().toLowerCase().replace(/-/g, '_');

const intlName = (type, code) => {
  try {
    const name = new Intl.DisplayNames(['de'], { type }).of(code);
    return name && name.toLowerCase() !== String(code).toLowerCase() ? name : '';
  } catch {
    return '';
  }
};

const getLanguageDisplayName = (value) => {
  if (!value) return '';
  const key = langKey(value);
  const [base, region] = key.split('_');

  const exact = languages.value.find(l => langKey(l.value) === key);
  if (exact?.name) return exact.name;

  const baseLang = languages.value.find(l => langKey(l.value) === base);
  const regionName = region ? intlName('region', region.toUpperCase()) : '';
  if (baseLang?.name) return regionName ? `${baseLang.name} (${regionName})` : baseLang.name;

  const tag = region ? `${base}-${region.toUpperCase()}` : base;
  return intlName('language', tag) || intlName('language', base) || '—';
};              

const songs = computed(() => {
  return Array.isArray(props.release?.songs) ? props.release.songs : [];
});

// التحقق من وجود Deals (نسب مئوية في المساهمين)
const hasDeals = (song) => {
  if (!song.contributors) return false;
  
  const contributors = song.contributors;
  const hasPercentages = 
    (contributors.artist?.some(a => a.percentage > 0)) ||
    (contributors.feature?.some(f => f.percentage > 0)) ||
    (contributors.producer?.some(p => p.percentage > 0)) ||
    (contributors.p_line?.some(p => p.percentage > 0)) ||
    (contributors.other_contributors?.some(o => o.percentage > 0));
  
  return hasPercentages;
};

// حساب مدة الأغنية (إذا كانت متوفرة)
const formatDuration = (seconds) => {
  if (!seconds) return '—'; // لا مدّة متاحة — لا '00:00' الذي يبدو كقيمة حقيقية
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// ========== تشغيل / إيقاف الأغنية ==========
//   الزر يتحوّل إلى pause أثناء التشغيل فقط — بلا أي تأثيرات بصرية أخرى.
const playingUuid = ref(null);
let audio = null;

const buildAudioUrl = (path) => {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  const fileName = String(path).split('/').pop();
  return `${storage_url}/audio/${encodeURIComponent(fileName)}`;
};

const stopPlayback = () => {
  if (audio) {
    audio.pause();
    audio.src = '';
    audio = null;
  }
  playingUuid.value = null;
};

const playSong = (song) => {
  // نفس الأغنية قيد التشغيل → إيقاف مؤقّت.
  if (playingUuid.value === song.uuid) {
    stopPlayback();
    return;
  }

  // أغنية أخرى → نوقف الحالية أولاً (مشغّل واحد في كل مرة).
  stopPlayback();

  const url = buildAudioUrl(song.song_file);
  if (!url) {
    console.warn('⚠️ [Titelliste] لا يوجد ملف صوتي لهذه الأغنية:', song.title);
    return;
  }

  audio = new Audio(url);
  audio.addEventListener('ended', stopPlayback);
  audio.addEventListener('error', () => {
    console.error('❌ [Titelliste] تعذّر تشغيل الملف:', url);
    stopPlayback();
  });

  playingUuid.value = song.uuid;
  audio.play().catch(err => {
    console.error('❌ [Titelliste] فشل التشغيل:', err);
    stopPlayback();
  });
};

// إيقاف الصوت عند مغادرة التبويب حتى لا يستمرّ في الخلفية.
onBeforeUnmount(stopPlayback);
</script>

<style lang="scss" scoped>
/* الأنماط كما هي من الكود الأصلي */
.Content-Box {
  display: flex;
  padding: 20px;
  align-items: flex-start;
  gap: 20px;
  flex: 1 0 0;
  align-self: stretch;
  border-radius: 0 20px 20px 20px;
  background: var(--secondary);
}

.column1 {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  flex: 1 0 0;
}

.Head {
  display: flex;
  padding-bottom: 16px;
  align-items: flex-start;
  gap: 20px;
  align-self: stretch;
}

.head-title,
.value {
  color: var(--Main-Colors-White, #FFF);
  font-family: Heebo;
  font-size: 14px;
  font-style: normal;
  font-weight: 300;
  line-height: .8;
  letter-spacing: 0.7px;
  opacity: 0.7;
  width: 120px;
}

/* قيم التابات الثلاثة (Titelliste / Urheber / Mitwirkende) موحّدة:
   18px افتراضياً و16px بين 1440 و1599، وتباعد أحرف 0.9px. */
.value {
  font-size: 18px;
  letter-spacing: 0.9px;
}

.head-title:nth-child(1),
.value:nth-child(1) {
  width: 60px;
}

.head-title:nth-child(2),
.value:nth-child(2) {
  flex: 1 0 0;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  // overflow: hidden;
  letter-spacing: 0.9px;
}

.head-title:nth-child(3),
.value:nth-child(3) {
  width: 160px;
}

/* ✅ Version: قصّ النص الطويل بـ … عند تجاوز عرض العمود (مثل original_instrumental).
   الـ padding/margin المتعاكسان مقصودان: overflow: hidden يقصّ عند صندوق الحشو،
   ولأن line-height هنا 0.8 (أقصر من ارتفاع الحرف) كان القصّ سيأكل أعلى الحروف
   وأسفلها — وهو سبب تعطيل overflow بتعليق في عمود العنوان. الحشو يوسّع منطقة
   القصّ رأسياً، والهامش السالب يلغي أثره على التخطيط فلا يتغير ارتفاع الصف. */
.value:nth-child(3) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-block: 6px;
  margin-block: -6px;
}

.head-title:nth-child(7),
.value:nth-child(7) {
  width: 200px;
}

.Frame {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  color: var(--Main-Colors-White, #FFF);
  font-family: Heebo;
  font-size: 14px;
  font-style: normal;
  font-weight: 300;
  line-height: .8;
  letter-spacing: 0.9px;
  opacity: 0.7;
}

.line {
  display: flex;
  justify-content: flex-end;
  gap: 20px;
  align-self: stretch;
  align-items: center;
}

.Trenner {
  width: 100%;
  height: .8px;
  background: var(--primary);
  margin-top: 10px;
}

.play-button {
  display: flex;
  width: 56px;
  flex-direction: column;
 
  gap: 10px;
}

.play-music {
  display: flex;
  height: 24px;
  padding: 4px 20px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  border-radius: 12px;
  background: var(--Strawberry);
  cursor: pointer;
}

.play-music:hover {
  background: var(--dark-red);
}

.play-music .icon {
  width: 9px;
  aspect-ratio: 3/4;
  background-image: url('/icon/Play-youtube.svg');
  background-repeat: no-repeat;
  background-size: contain;
  filter: brightness(0) invert(1);
}

/* ✅ أثناء التشغيل: شريطا إيقاف بدل المثلّث — بنفس القياس واللون،
   ولا شيء آخر يتغيّر في الزر. مرسومان بـ CSS لأنّه لا توجد أيقونة pause في المشروع. */
.play-music .icon.is-pause {
  background-image: none;
  filter: none;
  display: flex;
  justify-content: space-between;
}

.play-music .icon.is-pause::before,
.play-music .icon.is-pause::after {
  content: '';
  width: 3px;
  height: 100%;
  background: #fff;
}

.weight-7 {
  font-weight: 700;
}

.subtitle-small {
  font-size: inherit; /* نفس حجم القيمة — التمييز بالشفافية والوزن لا بالحجم */
  opacity: 0.7;
  font-weight: 400;
}

.no-data {
  padding: 40px;
  text-align: center;
  color: #aaa;
  font-size: 1.1rem;
}

@media (min-width: 1440px) and (max-width: 1599px) {
  .head-title,
  .value {
    width: 84px;
    line-height: 1;
  }
  .value {
    font-size: 16px;
  }

  .head-title:nth-child(1),
  .value:nth-child(1) {
    width: 60px;
  }

  .head-title:nth-child(2),
  .value:nth-child(2) {
    flex: 1 0 0;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
    // overflow: hidden;
  }

  .head-title:nth-child(3),
  .value:nth-child(3) {
    width: 160px;
  }

  .head-title:nth-child(7),
  .value:nth-child(7) {
    width: 200px;
  }
}
</style>