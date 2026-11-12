<template>
    <div class="Content-Box">
      <div class="column1">
        <div class="Head">
          <div class="head-title">#</div>
          <div class="head-title">Titel</div>
          <div class="head-title">Komponist</div>
          <div class="head-title">Anteil</div>
          <div class="head-title">Vertrag</div>
        </div>
  
        <template v-if="songs.length === 0">
          <div class="no-data">Keine Deals verfügbar</div>
        </template>
  
        <div v-else v-for="(song, songIndex) in songs" :key="song.uuid" class="song-deals">
          <!-- جمع كل المساهمين مع نسبهم -->
          <template v-if="getAllContributorsWithPercentage(song).length > 0">
            <div v-for="(contributor, contIndex) in getAllContributorsWithPercentage(song)" :key="contIndex" class="line1">
              <!-- رقم الأغنية يظهر فقط في أول مساهم -->
              <div class="value weight-3" v-if="contIndex === 0">{{ songIndex + 1 }}</div>
              <div class="value" v-else></div>
              
              <!-- عنوان الأغنية يظهر فقط في أول مساهم -->
              <div class="value" v-if="contIndex === 0">{{ song.title || 'Unbenannter Titel' }}</div>
              <div class="value" v-else></div>
              
              <!-- اسم المساهم (مع الدور إذا كان متاحاً) -->
              <div class="value weight-3 contributor-name">
                {{ contributor.name }}
              
              </div>
              
              <!-- النسبة المئوية مع شريط التقدم -->
              <div class="Anteil">
                <div class="p">{{ contributor.percentage }}%</div>
                <div class="progress-bar">
                  <div class="true" :style="{ width: contributor.percentage + '%' }"></div>
                </div>
              </div>
              
              <!-- عمود Vertrag (ثابت كـ "Standard") -->
              <div class="role">download</div>
            </div>
          </template>
          
          <!-- إذا لم يكن هناك مساهمون بنسب مئوية -->
          <div v-else class="line1 no-percentages">
            <div class="value weight-3">{{ songIndex + 1 }}</div>
            <div class="value">{{ song.title || 'Unbenannter Titel' }}</div>
            <div class="value weight-3">—</div>
            <div class="Anteil">
              <div class="p">0%</div>
              <div class="progress-bar">
                <div class="true" style="width: 0%"></div>
              </div>
            </div>
            <div class="role">—</div>
          </div>
          
          <div class="Trenner" v-if="songIndex < songs.length - 1"></div>
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
  
  // دالة لجلب جميع المساهمين الذين لديهم نسب مئوية > 0
  const getAllContributorsWithPercentage = (song) => {
    if (!song.contributors) return [];
    
    const contributors = [];
    const contribData = song.contributors;
    
    // إضافة Artists
    if (contribData.artist && Array.isArray(contribData.artist)) {
      contribData.artist.forEach(artist => {
        if (artist.percentage > 0) {
          contributors.push({
            name: artist.name,
            percentage: artist.percentage,
            type: 'Artist',
            role: null
          });
        }
      });
    }
    
    // إضافة Features
    if (contribData.feature && Array.isArray(contribData.feature)) {
      contribData.feature.forEach(feature => {
        if (feature.percentage > 0) {
          contributors.push({
            name: feature.name,
            percentage: feature.percentage,
            type: 'Feature',
            role: null
          });
        }
      });
    }
    
    // إضافة Producers
    if (contribData.producer && Array.isArray(contribData.producer)) {
      contribData.producer.forEach(producer => {
        if (producer.percentage > 0) {
          contributors.push({
            name: producer.name,
            percentage: producer.percentage,
            type: 'Produzent',
            role: null
          });
        }
      });
    }
    
    // إضافة P-Line
    if (contribData.p_line && Array.isArray(contribData.p_line)) {
      contribData.p_line.forEach(pLine => {
        if (pLine.percentage > 0) {
          contributors.push({
            name: pLine.name,
            percentage: pLine.percentage,
            type: 'P-Line',
            role: null
          });
        }
      });
    }
    
    // إضافة Other Contributors
    if (contribData.other_contributors && Array.isArray(contribData.other_contributors)) {
      contribData.other_contributors.forEach(other => {
        if (other.percentage > 0) {
          contributors.push({
            name: other.name,
            percentage: other.percentage,
            type: other.role || 'Weitere',
            role: other.role
          });
        }
      });
    }
    
    // ترتيب حسب النسبة (من الأعلى إلى الأقل)
    return contributors.sort((a, b) => b.percentage - a.percentage);
  };
  </script>
  
  <style lang="scss" scoped>
  .Content-Box {
    display: flex;
    padding: 20px;
    align-items: flex-start;
    gap: 20px;
    flex: 1 0 0;
    align-self: stretch;
    /* ✅ نفس Titelliste: الزاوية العلوية اليسرى قائمة + خلفية secondary (بلا قفزة) */
    border-radius:  20px;
    background: var(--secondary);
    overflow-x: auto;
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
    font-size: 18px;
    opacity: 0.7; /* ✅ نفس Titelliste (روح واحدة) */
    white-space: nowrap;
    text-overflow: ellipsis;
    letter-spacing: 0.9px;
  }
  
  .head-title:nth-child(1),
  .value:nth-child(1) {
    width: 60px;
  }
  
  .head-title:nth-child(2),
  .value:nth-child(2) {
    flex: 1 0 0;
    min-width: 200px;
    font-weight: 700;
  }
  
  /* العنوان الرابع (Anteil) */
  .head-title:nth-child(4) {
    width: 556px;
  }
  
  /* العمود الرابع (Anteil) */
  .value:nth-child(4) {
    width: 556px;
  }
  
  .head-title:nth-child(5),
  .value:nth-child(5) {
    width: 103px;
  }
  
  .weight-3 {
    font-weight: 300 !important;
  }
  
  .song-deals {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    align-self: stretch;
    width: 100%;
  }
  
  .line1 {
    display: flex;
    justify-content: flex-end;
    gap: 20px;
    align-self: stretch;
  }
  
  .line1.no-percentages {
    opacity: 0.7;
  }
  
  .contributor-name {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }
  
  .role-badge {
    font-size: 11px;
    color: var(--Strawberry);
    background: rgba(209, 17, 85, 0.1);
    padding: 2px 6px;
    border-radius: 10px;
    white-space: nowrap;
    font-weight: 300;
  }
  
  .role {
    display: flex;
    height: 24px;
    padding: 4px 20px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    border-radius: 12px;
    background: var(--icon);
    color: #FFF;
    font-family: Heebo;
    font-size: 14px;
    font-style: normal;
    font-weight: 300;
    line-height: .8;
    white-space: nowrap;
    min-width: 103px;
    text-align: center;
  }
  
  .role:hover {
    background: var(--move);
    cursor: pointer;
  }
  
  /* حاوية Anteil - نفس عرض العنوان الرابع */
  .Anteil {
    display: flex;
    align-items: center;
    gap: 20px;
    width: 556px; /* نفس عرض .head-title:nth-child(4) */
  }
  
  .Anteil .p {
    color: var(--Main-Colors-White, #FFF);
    font-family: Heebo;
    font-size: 18px;
    font-style: normal;
    font-weight: 300;
    line-height: .8;
    letter-spacing: 0.9px;
    opacity: 0.7;
    min-width: 45px;
  }
  
  .Anteil .progress-bar {
    display: flex;
    flex: 1; /* يأخذ المساحة المتبقية */
    padding: 6px;
    align-items: flex-start;
    border-radius: 10px;
    background: var(--primary);
  }
  
  .progress-bar .true {
    height: 4px;
    border-radius: 4px;
    background: var(--Strawberry);
    transition: width 0.3s ease;
  }
  
  .Trenner {
    height: .8px;
    width: 100%;
    background: var(--Main-Colors-Slate-Dark, #1B1C20);
    margin-top: 8px;
  }
  
  .no-data {
    padding: 40px;
    text-align: center;
    color: #aaa;
    font-size: 1.1rem;
    width: 100%;
  }
  
  @media (min-width: 1440px) and (max-width: 1599px) {
    .head-title:nth-child(4),
    .value:nth-child(4) {
      width: 456px;
    }
    
    .head-title,
    .value {
      width: 160px;
    }
    
    .value {
      font-size: 16px;
    }
    
    /* حاوية Anteil فيレスポンシブ */
    .Anteil {
      width: 456px;
    }
    
    .role {
      min-width: 70px;
      font-size: 13px;
      padding: 4px 12px;
    }
  }
  </style>