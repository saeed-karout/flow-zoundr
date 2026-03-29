```vue
<template>
  <div class="tab-content">
    <div class="section">
      <div class="p">Deine Top Stores</div>
      <div class="top-song">
        <div class="music-title" v-for="song in songs" :key="song.id">
          <div class="background-layer"></div>
          <div class="number-container">
            <div :class="song.id === 1 ? 'number-1' : 'number'">{{ song.id }}.</div>
          </div>
          <div class="image-overlay" :style="{ backgroundColor: song.backgroundColor }">
            <div class="song-image" :style="{ backgroundImage: `url(${song.imageUrl})` }"></div>
          </div>
          <div class="info">
            <div class="title">
              <div class="sub-title">{{ song.title }}</div>
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
import Spotify from '@/assets/images/brand/Spotify.png'
import Apple from '@/assets/images/brand/Apple.png'

// افتراض بيانات من API
const songs = ref([]);

const fetchSongs = async () => {
    // محاكاة استدعاء API
    const response = await new Promise(resolve => {
        setTimeout(() => {
            resolve([
                { id: 1, title: "Spotify", streams: "15.242", backgroundColor: "#73CFC8", imageUrl: Spotify },
                { id: 2, title: "Apple Music", streams: "18.240", backgroundColor: "#555", imageUrl: Apple},
                { id: 3, title: "Epic Track 3", streams: "15.200", backgroundColor: "#28A745", imageUrl: "https://example.com/images/store3.jpg" },
                { id: 4, title: "Melody Haven", streams: "12.800", backgroundColor: "#FFC107", imageUrl: "https://example.com/images/store4.jpg" },
                { id: 5, title: "Rhythm Beat", streams: "10.000", backgroundColor: "#6F42C1", imageUrl: "https://example.com/images/store5.jpg" },
                { id: 6, title: "Soul Vibe", streams: "8.900", backgroundColor: "#FD7E14", imageUrl: "https://example.com/images/store6.jpg" },
                { id: 7, title: "Harmony Flow", streams: "7.500", backgroundColor: "#20C997", imageUrl: "https://example.com/images/store7.jpg" },
                { id: 8, title: "Pulse Track", streams: "6.300", backgroundColor: "#DC3545", imageUrl: "https://example.com/images/store8.jpg" },
                { id: 9, title: "Chill Sound", streams: "5.100", backgroundColor: "#007BFF", imageUrl: "https://example.com/images/store9.jpg" },
                { id: 10, title: "Echo Wave", streams: "4.200", backgroundColor: "#6610F2", imageUrl: "https://example.com/images/store10.jpg" },
                { id: 11, title: "Dream Song", streams: "3.800", backgroundColor: "#E83E8C", imageUrl: "https://example.com/images/store11.jpg" },
                { id: 12, title: "Vibe Track", streams: "3.200", backgroundColor: "#17A2B8", imageUrl: "https://example.com/images/store12.jpg" },
                { id: 13, title: "Star Beat", streams: "2.900", backgroundColor: "#343A40", imageUrl: "https://example.com/images/store13.jpg" },
                { id: 14, title: "Night Melody", streams: "2.500", backgroundColor: "#F8F9FA", imageUrl: "https://example.com/images/store14.jpg" },
                { id: 15, title: "Sky Rhythm", streams: "2.100", backgroundColor: "#6C757D", imageUrl: "https://example.com/images/store15.jpg" },
                { id: 16, title: "Ocean Sound", streams: "1.800", backgroundColor: "#FFC107", imageUrl: "https://example.com/images/store16.jpg" },
                { id: 17, title: "Fire Track", streams: "1.500", backgroundColor: "#28A745", imageUrl: "https://example.com/images/store17.jpg" },
                { id: 18, title: "Moon Vibe", streams: "1.200", backgroundColor: "#DC3545", imageUrl: "https://example.com/images/store18.jpg" },
                { id: 19, title: "Cloud Song", streams: "1.000", backgroundColor: "#007BFF", imageUrl: "https://example.com/images/store19.jpg" },
                { id: 20, title: "Wind Beat", streams: "900", backgroundColor: "#6610F2", imageUrl: "https://example.com/images/store20.jpg" },
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
    background: linear-gradient(135deg, rgba(0, 0, 0, 0.5), transparent);
}

.background-layer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 20px;
    background: url('../../../assets/icons/dashboard/user/shadow.png') 50% / cover no-repeat;
    z-index: 2;
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
    position: relative;
    z-index: 1;
    isolation: isolate;
    overflow: hidden;
    filter: brightness(70%); /* محاكاة saturate(40%) للون الخلفية */
    transition: filter 0.6s ease; /* انتقال سلس كما في الكود المرجعي */
}

.music-title:hover .image-overlay {
    filter: brightness(100%); /* محاكاة saturate(80%) عند التمرير */
}

.song-image {
    width: 216px;
    height: 119px;
    position: absolute;
    right: -21px;
    top: 32px;
    background: 50% / contain no-repeat;
    z-index: 0;
    opacity: 0.7;
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
    width: 26px;
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
    z-index: 100;
}

.info .title {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    align-self: stretch;
}

.title .sub-title {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    color: #FFF;
    text-overflow: ellipsis;
    font-family: Heebo;
    font-size: 18px;
    font-style: normal;
    font-weight: 700;
    line-height: 0.6;
    text-transform: uppercase;
    transition: opacity 0.3s ease;
    z-index: 150;
    opacity: .7;
}

.info .p {
    align-self: stretch;
    color: #FFF;
    font-family: Heebo;
    font-size: 14px;
    font-style: normal;
    font-weight: 300;
    line-height: 0.6;
    padding-top: 2px;
    transition: opacity 0.3s ease;
    z-index: 150;
    opacity: .7;
}

.music-title:hover .sub-title,
.music-title:hover .info .p,
.music-title:hover .number,
.music-title:hover .number-1 {
    opacity: 1;
}
</style>
```