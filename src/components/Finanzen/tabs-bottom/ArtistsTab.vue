```vue
<template>
  <div class="tab-content">
    <div class="section">
      <div class="p">Deine Top Artists</div>
      <div class="top-song">
        <div class="music-title" v-for="song in songs" :key="song.id">
          <div class="background-layer"></div>
          <div class="number-container">
            <div :class="song.id === 1 ? 'number-1' : 'number'">{{ song.id }}.</div>
          </div>
          <div class="image-overlay" :style="{ backgroundColor: song.backgroundColor }" :data-title-first="song.title.slice(0, 2)" :data-title-second="song.title.slice(2, 4)"></div>
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

// افتراض بيانات من API
const songs = ref([]);

const fetchSongs = async () => {
    // محاكاة استدعاء API
    const response = await new Promise(resolve => {
        setTimeout(() => {
            resolve([
                { id: 1, title: "Song Title 1", streams: "23.115", backgroundColor: "#CF7502" },
                { id: 2, title: "Digie", streams: "18.240", backgroundColor: "#5ACD96" },
                { id: 3, title: "Epic Track 3", streams: "15.200", backgroundColor: "#28A745" },
                { id: 4, title: "Melody Haven", streams: "12.800", backgroundColor: "#FFC107" },
                { id: 5, title: "Rhythm Beat", streams: "10.000", backgroundColor: "#6F42C1" },
                { id: 6, title: "Soul Vibe", streams: "8.900", backgroundColor: "#FD7E14" },
                { id: 7, title: "Harmony Flow", streams: "7.500", backgroundColor: "#20C997" },
                { id: 8, title: "Pulse Track", streams: "6.300", backgroundColor: "#DC3545" },
                { id: 9, title: "Chill Sound", streams: "5.100", backgroundColor: "#007BFF" },
                { id: 10, title: "Echo Wave", streams: "4.200", backgroundColor: "#6610F2" },
                { id: 11, title: "Dream Song", streams: "3.800", backgroundColor: "#E83E8C" },
                { id: 12, title: "Vibe Track", streams: "3.200", backgroundColor: "#17A2B8" },
                { id: 13, title: "Star Beat", streams: "2.900", backgroundColor: "#343A40" },
                { id: 14, title: "Night Melody", streams: "2.500", backgroundColor: "#F8F9FA" },
                { id: 15, title: "Sky Rhythm", streams: "2.100", backgroundColor: "#6C757D" },
                { id: 16, title: "Ocean Sound", streams: "1.800", backgroundColor: "#FFC107" },
                { id: 17, title: "Fire Track", streams: "1.500", backgroundColor: "#28A745" },
                { id: 18, title: "Moon Vibe", streams: "1.200", backgroundColor: "#DC3545" },
                { id: 19, title: "Cloud Song", streams: "1.000", backgroundColor: "#007BFF" },
                { id: 20, title: "Wind Beat", streams: "900", backgroundColor: "#6610F2" },
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
    z-index: 111;
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
    filter: saturate(40%); /* الفلتر قبل التمرير */
    transition: filter 0.6s ease; /* انتقال سلس كما في الكود الأول */
}

.music-title:hover .image-overlay {
    filter: saturate(100%); /* الفلتر عند التمرير */
}

.image-overlay::before {
    content: attr(data-title-first) "\A" attr(data-title-second);
    white-space: pre;
    position: absolute;
    left: 12px;
    bottom: -48px;
    color: var(--Main-Colors-Slate-Dark, #1B1C20);
    font-family: Heebo;
    font-size: 160px;
    font-style: normal;
    font-weight: 900;
    line-height: 120px;
    text-transform: uppercase;
    opacity: 0.5;
    z-index: 0;
    pointer-events: none;
}

.number-container {
    position: absolute;
    top: 16px;
    left: 16px;
    z-index: 5;
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
    opacity: .7;
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
}

.music-title:hover .sub-title,
.music-title:hover .info .p,
.music-title:hover .number,
.music-title:hover .number-1 {
    opacity:1;
}



@media (min-width:1440px) and (max-width:1599px) {
    .music-title {
      width: 160px;
      height: 160px;
    }

    .title .sub-title{
      overflow: hidden;
      text-overflow: ellipsis;
      line-height: 1;

    }

    .title .sub-title{
      font-size: 14px;
       overflow: hidden;
      text-overflow: ellipsis;
    }


    .info .p{
      font-size: 12px;
    }

    .title  span{
      font-size: 17px;
      line-height: .9;
    }


   
}
</style>
```