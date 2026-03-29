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
            {{ song.title || 'Unbenannter Titel' }}
            <span v-if="song.subtitle" class="subtitle-small">({{ song.subtitle }})</span>
          </div>
          <div class="value weight-7">{{ song.song_type || 'Original' }}</div> 
          <div class="value">{{ song.duration || '00:00' }}</div> 
          <div class="value">{{ song.lyrics_language || 'unbekannt' }}</div>
          <div class="value">{{ hasDeals(song) ? 'Ja' : 'Nein' }}</div>
          <div class="value">{{ song.isrc || 'kein ISRC' }}</div>
          <div class="play-button">
            <div class="play-music" @click="playSong(song)">
              <div class="icon"></div>
            </div>
          </div>
        </div>

        <div class="Trenner" v-if="index < songs.length - 1"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  release: {
    type: Object,
    default: () => ({})
  }
});

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
  if (!seconds) return '00:00';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const playSong = (song) => {
  console.log('Play song:', song.title);
  // يمكن إضافة منطق تشغيل الأغنية هنا
};
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
  align-items: flex-start;
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

.value {
  font-size: 18px;
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
  letter-spacing: 0.7px;
  opacity: 0.7;
}

.line {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 20px;
  align-self: stretch;
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
  align-items: flex-end;
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

.weight-7 {
  font-weight: 700;
}

.subtitle-small {
  font-size: 0.9em;
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