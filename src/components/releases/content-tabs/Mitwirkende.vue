<template>
  <div class="Content-Box">
    <div class="column1">
      <div class="Head">
        <div class="head-title">#</div>
        <div class="head-title">Titel</div>
        <div class="head-title">Artists</div>
        <div class="head-title">Features</div>
        <div class="head-title">Produzenten</div>
        <div class="head-title">Weitere</div>
      </div>

      <template v-if="songs.length === 0">
        <div class="no-data">Keine Mitwirkende verfügbar</div>
      </template>

      <div v-else v-for="(song, index) in songs" :key="song.uuid" style="width: 100%;">
        <div class="line">
          <!-- السطر الأول: البيانات الأساسية -->
          <div class="line1">
            <div class="value weight-3">{{ index + 1 }}</div>
            <div class="value">{{ song.title || 'Unbenannter Titel' }}</div>
            
            <!-- Artists (متعدد) -->
            <div class="value artists-list">
              <template v-if="song.contributors?.artist?.length">
                <div v-for="(artist, i) in song.contributors.artist" :key="'artist-'+i">
                  {{ artist.name }}
                  <span v-if="artist.percentage > 0" class="percentage">({{ artist.percentage }}%)</span>
                </div>
              </template>
              <div v-else>—</div>
            </div>

            <!-- Features (متعدد) -->
            <div class="value features-list">
              <template v-if="song.contributors?.feature?.length">
                <div v-for="(feature, i) in song.contributors.feature" :key="'feature-'+i">
                  {{ feature.name }}
                 
                </div>
              </template>
              <div v-else>—</div>
            </div>

            <!-- Produzenten (متعدد) -->
            <div class="value producers-list">
              <template v-if="song.contributors?.producer?.length">
                <div v-for="(producer, i) in song.contributors.producer" :key="'producer-'+i">
                  {{ producer.name }}
                  
                </div>
              </template>
              <div v-else>—</div>
            </div>

            <!-- Weitere Mitwirkende (متعدد) -->
            <div class="value others-list">
              <template v-if="song.contributors?.other_contributors?.length">
                <div v-for="(other, i) in song.contributors.other_contributors" :key="'other-'+i">
                  {{ other.name }} 
                 
                </div>
              </template>
              <div v-else>—</div>
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
</script>

<style lang="scss" scoped>
.Content-Box {
  display: flex;
  height: 100%;
  padding: 20px;
  align-items: flex-start;
  gap: 20px;
  align-self: stretch;
  border-radius: 20px;
  background: var(--secondary);
  overflow-x: auto;
}

.column1 {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 20px;
  flex: 1 0 0;
  min-width: min-content;
}

.Head {
  display: flex;
  padding-bottom: 16px;
  align-items: flex-start;
  gap: 20px;
  align-self: stretch;
  min-width: fit-content;
}

.head-title,
.value {
  color: #FFF;
  font-family: Heebo;
  font-size: 14px;
  font-style: normal;
  font-weight: 300;
  line-height: .8;
  letter-spacing: 0.7px;
  opacity: 0.7;
  width: 200px;
}

.value {
  color: #FFF;
  font-family: Heebo;
  font-size: 16px;
  font-style: normal;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: 0.9px;
  opacity: 1;
}

.head-title:nth-child(1),
.value:nth-child(1) {
  width: 60px;
}

.head-title:nth-child(2),
.value:nth-child(2) {
  flex: 1 0 0;
  min-width: 200px;
}

.artists-list,
.features-list,
.producers-list,
.others-list,
.p-line-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  line-height: 1.3;
}

.artists-list > div,
.features-list > div,
.producers-list > div,
.others-list > div,
.p-line-list > div {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #FFF;
  font-family: Heebo;
  font-size: 15px;
  font-weight: 300;
  line-height: 1.4;
}

.percentage {
  color: var(--Strawberry, #D15);
  font-weight: 700;
  margin-left: 4px;
  font-size: 13px;
}

.line {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  align-self: stretch;
}

.line1,
.line2 {
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
  gap: 20px;
  align-self: stretch;
}

.line2 {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed rgba(255,255,255,0.1);
}

.Trenner {
  width: 100%;
  height: .8px;
  background: var(--primary);
  margin-top: 10px;
}

.weight-3 {
  font-weight: 300;
}

.no-data {
  padding: 40px;
  text-align: center;
  color: #aaa;
  font-size: 1.1rem;
  width: 100%;
}

@media (min-width: 1440px) and (max-width: 1599px) {
  .head-title,
  .value {
    width: 170px;
  }

  .value {
    font-size: 15px;
  }
  
  .artists-list > div,
  .features-list > div,
  .producers-list > div,
  .others-list > div,
  .p-line-list > div {
    font-size: 14px;
  }
}
</style>