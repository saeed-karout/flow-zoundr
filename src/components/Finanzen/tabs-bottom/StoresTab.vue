<template>
  <div class="tab-content">
    <div class="section">
      <div class="p">Deine Top Stores </div>
      <div class="top-song">
        <!-- Loading State -->
        <div v-if="isLoading" class="loading-state">
          <div class="spinner"></div>
        </div>
        
        <!-- Stores List -->
        <div v-else class="stores-container">
          <div class="music-title" v-for="(store, index) in data" :key="store.name || index">
            <div class="background-layer"></div>
            <div class="number-container">
              <div :class="index === 0 ? 'number-1' : 'number'">{{ index + 1 }}.</div>
            </div>
            <div class="image-overlay" :style="{ backgroundColor: getStoreColor(store.name || '') }">
              <div class="store-image-wrapper">
                <img 
                  :src="getStoreLogo(store.name || '')" 
                  :alt="store.name + ' icon'"
                  class="store-icon"
                  @error="handleImageError"
                />
              </div>
            </div>
            <div class="info">
              <div class="title">
                <div class="sub-title">{{ store.name || 'Unknown Store' }}</div>
              </div>
              <div class="p">{{ formatCurrency(store.revenue) }} </div>
            </div>
          </div>
        </div>
        
        <!-- Empty State -->
        <div v-if="!isLoading && (!data || data.length === 0)" class="empty-state">
          <div class="empty-message">Keine Stores gefunden</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// ========== Props ==========
const props = defineProps({
  data: {
    type: Array,
    default: () => []
  },
  filters: {
    type: Object,
    default: () => ({})
  }
});

// ========== Reactive Data ==========
const isLoading = ref(false);

const getStoreColor = (storeName) => {
  if (!storeName) return '#6C757D';
  
  const colors = {
    'spotify': '#1DB954',
    'apple': '#A2AAAD',
    'apple music': '#A2AAAD',
    'amazon': '#FF9900',
    'amazon music': '#FF9900',
    'deezer': '#2D96C8',
    'tidal': '#ffffff',
    'youtube': '#FF0000',
    'youtube music': '#FF0000',
    'soundcloud': '#FF5500',
    'pandora': '#005483',
    'napster': '#ffffff',
    'anghami': '#1ED760',
    'google': '#4285F4',
    'google play': '#4285F4',
    'facebook': '#1877F2',
    'meta': '#1877F2',
    'tiktok': '#ffffff',
    'kkbox': '#1ED760',
    'qobuz': '#1D9BF0',
    'tencent': '#1ED760',
    'netease': '#D43D3D'
  };
  
  const lowerName = storeName.toLowerCase();
  for (const [key, color] of Object.entries(colors)) {
    if (lowerName.includes(key)) {
      return color;
    }
  }
  return '#6C757D';
};

const getStoreLogo = (storeName) => {
  if (!storeName) return '';
  
  const lowerName = storeName.toLowerCase().trim();
  
  // خريطة أسماء المتاجر إلى أسماء الملفات
  const logoMap = {
    'vialma': 'vialma.svg',
    'vk': 'VK.svg.png',
    'trebel': 'Trebel.png',
    'tiger media': 'Tiger_Media.png',
    'tiger': 'Tiger_Media.png',
    'tencent': 'Tencent_Music.svg',
    'tencent music': 'Tencent_Music.svg',
    'rokk': 'rokk.png',
    'realnetwork': 'RealNetwork.png',
    'rakuten': 'Rakuten_Global.svg',
    'qobuz': 'Qobuz.svg',
    'pretzel': 'Pretzel.png',
    'netease': 'NetEase_Music.png',
    'netease music': 'NetEase_Music.png',
    'maxdome': 'Maxdome.svg.png',
    '7digital': '7digital.png',
    'lyricfind': 'LyricFind.png',
    'lyric find': 'LyricFind.png',
    'kkbox': 'KKBOX.svg',
    'idagio': 'idagio.jpg',
    'meta': 'Meta_Platforms.svg',
    'meta platforms': 'Meta_Platforms.svg',
    'claro musica': 'claro-musica.svg',
    'claro': 'claro-musica.svg',
    'boomplay': 'Boomplay_Music.png',
    'boomplay music': 'Boomplay_Music.png',
    'bookbeat': 'BookBeat.svg.png',
    'anghami': 'Anghami.png',
    'awa': 'AWA.png',
    'yousee': 'YouSee.svg',
    'pandora': 'pandora-music.png',
    'pandora music': 'pandora-music.png',
    'soundcloud': 'SoundCloud.png',
    'youtube music': 'YouTube_Music.png',
    'youtube': 'YouTube_Music.png',
    'napster': 'Napster.svg',
    'yandex': 'YANDEX.png',
    'itunes': 'ITUNES.png',
    'itunes store': 'ITUNES.png',
    'btp': 'BTP.png',
    'phonenet': 'PHONENet.png',
    'tiktok': 'TIKTOK.png',
    'tidal': 'TIDAL_Music.png',
    'tidal music': 'TIDAL_Music.png',
    'deezer': 'Deezer.png',
    'spotify': 'Spotify.png',
    'amazon': 'Amazon_Music.png',
    'amazon music': 'Amazon_Music.png',
    'presto': 'presto-music.svg',
    'presto music': 'presto-music.svg',
    'apple music': 'Apple_Music.svg',
    'apple': 'Apple_Music.svg'
  };
  
  // البحث التام
  if (logoMap[lowerName]) {
    return `/logo_stores/${logoMap[lowerName]}`;
  }
  
  // البحث الجزئي
  for (const [key, fileName] of Object.entries(logoMap)) {
    if (lowerName.includes(key)) {
      return `/logo_stores/${fileName}`;
    }
  }
  
  // البحث في قائمة الصور المتاحة
  const searchName = lowerName.replace(/[^a-z0-9]/g, '');
  for (const fileName of logoStoresList) {
    const fileNameLower = fileName.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (fileNameLower.includes(searchName) || searchName.includes(fileNameLower)) {
      return `/logo_stores/${fileName}`;
    }
  }
  
  return '';
};


// ========== تنسيق العملة ==========
const formatCurrency = (num) => {
  if (!num && num !== 0) return '€0.00';
  return new Intl.NumberFormat('de-DE', { 
    style: 'currency', 
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
};

// ========== معالجة خطأ الصورة ==========
const handleImageError = (event) => {
  // أيقونة افتراضية (متجر)
  event.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0id2hpdGUiPjxwYXRoIGQ9Ik0xMiAyQzYuNDggMiAyIDYuNDggMiAxMnM0LjQ4IDEwIDEwIDEwIDEwLTQuNDggMTAtMTBTMTcuNTIgMiAxMiAyem0tMSAxNy45M2MtMy45NS0uNDktNy0zLjg1LTctNy45MyAwLS42Mi4wOC0xLjIxLjIxLTEuNzlMOSAxNXYxYzAgMS4xLjkgMiAyIDJ2MS45M3ptNi45LTIuNTRjLS4yNi0uODEtMS0xLjM5LTEuOS0xLjM5aC0xdi0zYzAtLjU1LS40NS0xLTEtMUg4di0yaDJjLjU1IDAgMS0uNDUgMS0xVjdoMmMxLjEgMCAyLS45IDItMnYtLjQxYzIuOTMgMS4xOSA1IDQuMDYgNSA3LjQxIDAgMi4wOC0uOCAzLjk3LTIuMSA1LjM5eiIvPjwvc3ZnPg==';
};
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
  height: 100%;
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
  height: 100%;
  min-height: 0;
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
  flex-shrink: 0;
}

.top-song {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  align-self: stretch;
  overflow-x: auto;
  scrollbar-width: none;
  border-radius: 20px;
  flex-wrap: nowrap;
  min-width: auto;
  flex: 1;
  min-height: 0;
}

.stores-container {
  display: flex;
  gap: 20px;
  flex-wrap: nowrap;
  height: 100%;
  align-items: stretch;
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
  min-width: 207px;
  height: 100%;
  min-height: 207px;
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
  filter: brightness(70%);
  transition: filter 0.6s ease;
}

.music-title:hover .image-overlay {
  filter: brightness(100%);
}

.store-image-wrapper {
  width: 100px;
  height: 100px;
  position: absolute;
  right: 55px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 0;
  opacity: 0.6;
  display: flex;
  justify-content: center;
  align-items: center;
}

.store-icon {
  width: 100%;
  height: 100%;
  object-fit: contain;
    filter: brightness(0) saturate(100%) invert(7%) sepia(99%) saturate(0%) hue-rotate(180deg) brightness(95%) contrast(105%);
  transition: filter 0.3s ease;
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
  /* line-height: 0.8 يجعل صندوق السطر 14.4px بينما صندوق المحرف 18px،
     فيفيض 1.8px فوق وتحت ويقصّه overflow: hidden. نوسّع صندوق القصّ
     بـ padding ونلغي أثره بـ margin سالب مساوٍ: المقاس الخارجي لا يتغيّر،
     والـ gap في flexbox يُقاس بين الصناديق الخارجية — فالمسافات ثابتة تماماً. */
  padding-block: 6px;
  margin-block: -6px;
  /* سطر واحد مع ... — nowrap أوثق من -webkit-line-clamp
     الذي لا يقصّ في Chromium دون overflow: hidden. */
  display: block;
  align-self: stretch;
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  
color: var(--Main-Colors-White, #FFF);
leading-trim: both;
text-edge: cap;
font-family: Heebo;
font-size: 18px;
font-style: normal;
font-weight: 700;
line-height: 0.8;
text-transform: uppercase;
  opacity: 0.7;
  transition: opacity 0.3s ease;
}

.info .p {
  /* سطر واحد مع قصّ بـ ... للنص الطويل.
     الـ line-height أصغر من 1 فيفيض المحرف خارج صندوق المحتوى،
     وـ overflow: hidden وحده كان سيقصّ أعلى الحروف وأسفلها؛
     لذلك نوسّع صندوق القصّ بـ padding ونلغي أثره بـ margin سالب
     — فلا يتغيّر المقاس النهائي ولا الـ gap بين العناصر. */
  display: block;
  align-self: stretch;
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  // padding-top: 8px;
  // padding-bottom: 6px;
 color: var(--Main-Colors-White, #FFF);
leading-trim: both;
text-edge: cap;
font-family: Heebo;
font-size: 14px;
font-style: normal;
font-weight: 300;
line-height: 1;
align-self: stretch;
  opacity: 0.7;
  transition: opacity 0.3s ease;
}

.music-title:hover .sub-title,
.music-title:hover .info .p,
.music-title:hover .number,
.music-title:hover .number-1 {
  opacity: 1;
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 207px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(221, 17, 85, 0.1);
  border-top-color: #DD1155;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 207px;
}

.empty-message {
  color: #FFF;
  font-family: Heebo;
  font-size: 16px;
  font-weight: 300;
  opacity: 0.5;
  text-align: center;
}

/* ========== تعديلات Responsive ========== */
@media (max-width: 1599px) {
  .store-image-wrapper {
    width: 120px;
    height: 120px;
    right: 45px;
  }
}

@media (min-width: 2075px) and (max-width: 2560px) {
  .store-image-wrapper {
    width: 130px;
    height: 130px;
    right: 36px;
  }
}
</style>