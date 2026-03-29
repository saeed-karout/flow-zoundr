```vue
<template>
  <div class="tab-content">
    <div class="section">
      <div class="p">Deine Top Länder</div>
      <div class="top-song">
        <div class="music-title" v-for="song in songs" :key="song.id">
          <div class="background-layer" :style="{ backgroundImage: `url(${song.flagUrl})` }"></div>
          <div class="number-container">
            <div :class="song.id === 1 ? 'number-1' : 'number'">{{ song.id }}.</div>
          </div>
          <div class="image-overlay"></div>
          <div class="info">
            <div class="title">
              <div class="span">{{ song.title }}</div>
            </div>
            <div class="p">{{ song.streams }} Streams</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Ger from '@/assets/images/Lander/G.png';
import at from '@/assets/images/Lander/at.png';
import us from '@/assets/images/Lander/us.png';

// افتراض بيانات من API
const songs = ref([]);

const fetchSongs = async () => {
    // محاكاة استدعاء API
    const response = await new Promise(resolve => {
        setTimeout(() => {
            resolve([
                { id: 1, title: "Germany", streams: "15.242", flagUrl: Ger },
                { id: 2, title: "Austria", streams: "18.240", flagUrl: at },
                { id: 3, title: "United States", streams: "15.200", flagUrl: us },
                { id: 4, title: "France", streams: "12.800", flagUrl: "https://example.com/flags/france.jpg" },
                { id: 5, title: "Italy", streams: "10.000", flagUrl: "https://example.com/flags/italy.jpg" },
                { id: 6, title: "Spain", streams: "8.900", flagUrl: "https://example.com/flags/spain.jpg" },
                { id: 7, title: "Portugal", streams: "7.500", flagUrl: "https://example.com/flags/portugal.jpg" },
                { id: 8, title: "Netherlands", streams: "6.300", flagUrl: "https://example.com/flags/netherlands.jpg" },
                { id: 9, title: "Belgium", streams: "5.100", flagUrl: "https://example.com/flags/belgium.jpg" },
                { id: 10, title: "Denmark", streams: "4.200", flagUrl: "https://example.com/flags/denmark.jpg" },
                { id: 11, title: "Sweden", streams: "3.800", flagUrl: "https://example.com/flags/sweden.jpg" },
                { id: 12, title: "Norway", streams: "3.200", flagUrl: "https://example.com/flags/norway.jpg" },
                { id: 13, title: "Finland", streams: "2.900", flagUrl: "https://example.com/flags/finland.jpg" },
                { id: 14, title: "Poland", streams: "2.500", flagUrl: "https://example.com/flags/poland.jpg" },
                { id: 15, title: "Czech Republic", streams: "2.100", flagUrl: "https://example.com/flags/czech.jpg" },
                { id: 16, title: "Hungary", streams: "1.800", flagUrl: "https://example.com/flags/hungary.jpg" },
                { id: 17, title: "Slovakia", streams: "1.500", flagUrl: "https://example.com/flags/slovakia.jpg" },
                { id: 18, title: "Croatia", streams: "1.200", flagUrl: "https://example.com/flags/croatia.jpg" },
                { id: 19, title: "Slovenia", streams: "1.000", flagUrl: "https://example.com/flags/slovenia.jpg" },
                { id: 20, title: "Romania", streams: "900", flagUrl: "https://example.com/flags/romania.jpg" },
            ]);
        }, 1000);
    });
    songs.value = response;
};

onMounted(() => {
    fetchSongs();
});
</script>

<style lang="scss" scoped>
.tab-content {
  display: flex;
  align-items: flex-start;
  align-self: stretch;
  border-radius: 20px;
  width: 100%;
  max-width: 100%;
  min-height: 281px;
}

.section {
  display: flex;
  padding: 20px;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 20px;
  flex: 1 0 0;
  border-radius: 20px;
  background: var(--Main-Colors-Slate, #26282D);
  position: relative;
  width: 100%;
  max-width: 100%;
}

.section .p {
  color: #FFF;
  font-family: Heebo;
  font-size: 18px;
  font-style: normal;
  font-weight: 700;
  line-height: 0.6;
  letter-spacing: 0.9px;
  text-transform: uppercase;
  padding-top: 3px;
}

.top-song {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  align-self: stretch;
  overflow-x: auto;
  padding-right: 80px;
  scrollbar-width: none;
  border-radius: 20px;
  flex-wrap: nowrap;
  min-width: auto;
}

.top-song::-webkit-scrollbar {
  height: 8px;
}

.top-song::-webkit-scrollbar-track {
  background: #26282D;
}

.top-song::-webkit-scrollbar-thumb {
  background: #6A6C6D;
  border-radius: 4px;
}

.top-song::-webkit-scrollbar-thumb:hover {
  background: #D15;
}

.music-title {
  display: flex;
  width: 207px;
  height: 207px;
  justify-content: space-between;
  align-items: flex-end;
  border-radius: 20px;
  position: relative;
  cursor: pointer;
  isolation: isolate;
  flex-shrink: 0;
}

.background-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 20px;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  filter: saturate(var(--saturation, 40%));
  transition: filter 0.6s ease;
  z-index: 1;
}

.music-title:hover .background-layer {
  filter: saturate(80%);
}

.image-overlay {
  display: flex;
  padding: 16px;
  flex-direction: column;
  justify-content: flex-end;
  align-items: flex-start;
  flex: 1 0 0;
  align-self: stretch;
  border-radius: 20px;
  background: url('../../../assets/icons/dashboard/user/shadow.png') 50% / cover no-repeat;
  position: relative;
  z-index: 2;
  isolation: isolate;
}

.number-container {
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 3;
  isolation: isolate;
}

.number,
.number-1 {
  display: flex;
  width: auto;
  padding: 8px 6px;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
  border-radius: 13px;
  color: var(--Main-Colors-White, #FFF);
  font-family: Heebo;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 0.6;
  transition: opacity 0.3s ease;
  z-index: 3;
  background: rgba(0, 0, 0, 0.7);
}

.number-1 {
  background: var(--Strawberry, #FF4D4F);
}

.number {
  background: var(--secondary, #6A6C6D);
}

.info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  align-self: stretch;
  position: absolute;
  bottom: 16px;
  left: 16px;
  z-index: 150;
  opacity: 0.7;
  transition: opacity 0.3s ease;
  transform: translateZ(0); /* تحسين الأداء لمنع الـ "jump" */
}

.music-title:hover .info {
  opacity: 1;
}

.info .title {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  align-self: stretch;
}

.title .span {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  align-self: stretch;
  color: var(--Main-Colors-White, #FFF);
  text-overflow: ellipsis;
  font-family: Heebo;
  font-size: 18px;
  font-style: normal;
  font-weight: 700;
  line-height: 0.6;
  text-transform: uppercase;
  z-index: 150;
}

.info .p {
  align-self: stretch;
  color: var(--Main-Colors-White, #FFF);
  font-family: Heebo;
  font-size: 14px;
  font-style: normal;
  font-weight: 300;
  line-height: 0.6;
  padding-top: 2px;
  z-index: 150;
}
</style>
```