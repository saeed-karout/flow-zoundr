<template>
  <div class="Content-Box">
    <div class="column1">
      <div class="Head">
        <div class="head-title">#</div>
        <div class="head-title">Titel</div>
        <div class="head-title">Komponist</div>
        <div class="head-title">Verlag</div>
        <div class="head-title">Textdichter</div>
        <div class="head-title">Verlag</div>
      </div>

      <template v-if="songs.length === 0">
        <div class="no-data">Keine Urheberdaten verfügbar</div>
      </template>

      <div v-else v-for="(song, index) in songs" :key="song.uuid" style="width: 100%;">
        <div class="line">
          <div class="line1">
            <div class="value weight-3">{{ index + 1 }}</div>
            <div class="value">{{ toTitleCase(song.title || '—') }}</div>

            <!-- Komponist: من authors.composer (مصفوفة) -->
            <div class="value composers-list">
              <template v-if="song.authors?.composer?.length">
                <div v-for="(item, i) in song.authors.composer" :key="'comp-'+i">
                  {{ item }}
                </div>
              </template>
              <div v-else>—</div>
            </div>

            <!-- Verlag 1 (C-Line): من authors.verlog (مصفوفة) -->
            <div class="value weight-3 verlag-list">
              <template v-if="song.authors?.verlog?.length">
                <div v-for="(item, i) in song.authors.verlog" :key="'verlog-'+i">
                  {{ item }}
                </div>
              </template>
              <div v-else>—</div>
            </div>

            <!-- Textdichter: من authors.lyricist (مصفوفة) -->
            <div class="value autor-list">
              <template v-if="song.authors?.lyricist?.length">
                <div v-for="(item, i) in song.authors.lyricist" :key="'lyricist-'+i">
                  {{ item }}
                </div>
              </template>
              <div v-else>—</div>
            </div>

            <!-- Verlag 2 (P-Line): من authors.c_line (مصفوفة) -->
            <div class="value weight-3 verlag2-list">
              <template v-if="song.authors?.c_line?.length">
                <div v-for="(item, i) in song.authors.c_line" :key="'cline-'+i">
                  {{ item }}
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
import { toTitleCase } from '@/utils/formatText';
import { computed } from 'vue'

const props = defineProps({
  release: {
    type: Object,
    default: () => ({})
  }
})

const songs = computed(() => {
  return Array.isArray(props.release?.songs) ? props.release.songs : []
})
</script>

<style lang="scss" scoped>
.Content-Box {
  display: flex;
  padding: 20px;
  align-items: flex-start;
  gap: 20px;
  flex: 1 0 0;
  align-self: stretch;
  /* ✅ نفس Titelliste: الزاوية العلوية اليسرى قائمة لتتّصل بالتبويب النشط (بلا قفزة) */
  border-radius:  20px;
  background: var(--secondary);
  overflow-x: auto;
}

.composers-list,
.verlag-list,
.autor-list,
.verlag2-list {
  display: flex;
  flex-direction: column;
  gap: 8px; /* نفس Mitwirkende */
  line-height: 1.3;
}

.composers-list > div,
.verlag-list > div,
.autor-list > div,
.verlag2-list > div {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #FFF;
  font-family: Heebo;
  font-size: 18px; /* موحّد مع Titelliste / Mitwirkende */
  font-weight: 300;
  line-height: 24px; /* بدل 1.4 (25.2px) — كلّ صفّ 24px كما في Titelliste */
}

.column1 {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px; /* ✅ نفس Titelliste — يوحّد تباعد الصفوف فلا تقفز عند التنقّل */
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
  font-size: 18px;
  font-style: normal;
  font-weight: 700; /* ✅ نفس Titelliste (روح واحدة) */
  /* 24px = ارتفاع صف Titelliste (زرّ Anhören). هناك القيمة 14.4px متوسّطة داخل
     صفّ 24px فمركز النصّ عند 12px؛ هنا الصفّ مُحاذى للأعلى (flex-start)، فصندوق
     24px يضع المركز عند 12px أيضاً — فلا يقفز العنوان والرقم بين التابات. */
  line-height: 24px;
  letter-spacing: 0.9px;
  opacity: 0.7;
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



.line {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  align-self: stretch;
}

.line1 {
  display: flex;
  justify-content: flex-end;
  // align-items: center;
  gap: 20px;
  align-self: stretch;
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
    width: 165px;
  }

  .value {
    font-size: 16px;
  }

  /* نفس Titelliste في هذا المدى — وإلا تختلف الترويسة 14px مقابل 11.2px */
  .head-title {
    line-height: 1;
  }

  .head-title:nth-child(2),
  .value:nth-child(2) {
    flex: 1 0 0;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
    // overflow: hidden;
  }
  
  .composers-list > div,
  .verlag-list > div,
  .autor-list > div,
  .verlag2-list > div {
    font-size: 16px;
  }
}
</style>