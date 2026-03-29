<template>
    <div class="release-wrapper">
        <HeroCatalog topic="Takedowns" title="Deine Zurückgezogenen Releases"
            description="Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit, sed quia consequuntur." />
        <div class="music-grid">
            <div class="music-title">
                <div class="image-overlay">
                    <div class="icons">
                        <img src="../../assets/icons/reset.svg" alt="Zoundr_Icon_trash">
                    </div>
                    <div class="music-info">
                        <div class="title">Artist Music</div>
                        <div class="sub-title">This is wild</div>
                    </div>
                </div>
            </div>

            <div class="music-title">
                <div class="image-overlay">
                    <div class="icons">
                        <img src="../../assets/icons/reset.svg" alt="Zoundr_Icon_trash">
                    </div>
                    <div class="music-info">
                        <div class="title">Artist Music</div>
                        <div class="sub-title">Amet sollicitudin</div>
                    </div>
                </div>
            </div>

            <div class="music-title">
                <div class="image-overlay">
                    <div class="icons">
                        <img src="../../assets/icons/reset.svg" alt="Zoundr_Icon_trash">
                    </div>
                    <div class="music-info">
                        <p class="title">Artist Music</p>
                        <p class="sub-title">Id ultrices lacus</p>
                    </div>
                </div>
            </div>


        </div>
    </div>
</template>

<script>

import HeroCatalog from '@/components/modals/HeroCatalog.vue'
export default {
    components: {
        HeroCatalog

    },
    name: 'takedowns',
    data() {
        return {
        
            searchInput: '', // Tracks the input value
        };
    },
};
</script>

<style scoped>
.release-wrapper {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 20px;
  width: 100%;
  max-width: 2560px;
  margin: 0 auto;
  
}

/* ============== MUSIC GRID ============== */
.music-grid {
  display: grid;
  gap: 20px;
  align-self: stretch;
  width: 100%;
}

/* 4 أعمدة من 1440 فأعلى */
@media (min-width: 1440px) {
  .music-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* 2 أعمدة للشاشات الأصغر */
@media (max-width: 1439px) {
  .music-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* ============== MUSIC TITLE CARD ============== */
.music-title {
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  cursor: pointer;
  aspect-ratio: 1 / 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  background: #000;
  transition: transform 0.3s ease;
}

.music-title:hover {
  /* transform: scale(1.02); */
}

/* خلفية الصورة */
.music-title::before {
  content: '';
  position: absolute;
  inset: 0;
  background: url(../../assets/icons/dashboard/user/user.jpg) 50% / cover no-repeat;
  filter: saturate(var(--saturation, 40%));
  transition: filter 0.6s ease;
  z-index: 1;
}

.music-title:hover::before {
  filter: saturate(90%);
}

/* الـ overlay */
.image-overlay {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 20px;
  height: 100%;
  background: url('../../assets/icons/dashboard/user/shadow.png') center/cover no-repeat;
  background-blend-mode: saturation;
}

/* الحبوب */
.pill-state,
.pill-state2,
.pill-state3 {
  display: flex;
  padding: 8px 12px;
  border-radius: 13px;
  font-size: 14px;
  font-weight: 400;
  line-height: 0.8;
  align-self: flex-end;
}

.pill-state { background: #D15; color: #FFF; }
.pill-state2,
.pill-state3 { background: rgba(27, 28, 32, 0.7); color: #FFF; }
.pill-state3 p { opacity: 0.1; }

/* النصوص */
.music-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: auto;
}

.music-info .title,
.music-info .sub-title {
  color: #FFF;
  text-transform: uppercase;
  font-family: Heebo;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: opacity 0.3s ease;
}


.icons {
  display: flex;
  padding: 1px 2px;
  align-items: center;
  justify-content: end;
  gap: 10px;
  opacity: 0; /* Hide icons by default */
  transition: opacity 0.3s ease; /* Smooth transition for visibility */
}

.music-title:hover .icons {
  opacity: 1; /* Show icons on card hover */
}

.icons img {
  width: 20px;
  height: 22px;
  aspect-ratio: 10/11;
  fill: #FFF; /* Default fill color */
}

.icons img svg:hover {
  fill: var(--move); /* Purple color on icon hover, assuming --move is purple */
}

.music-info .title,
.music-info .sub-title {
    margin: 0;
    /* إزالة الهوامش */
    padding: 0;
    /* إزالة الـ padding */
    line-height: .9;
    /* ضبط الـ line-height لتحسين المحاذاة */
    display: block;
    /* تبسيط العرض لتجنب مشاكل -webkit-box */
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    /* منع التفاف النص */
    font-family: Heebo;
    color: var(--Main-Colors-White, #FFF);
    text-transform: uppercase;
}

.music-info .title {
    font-size: 40px;
    font-weight: 700;
    opacity: 0.3;
    position: relative;
    top: 5px;
}

.music-info .sub-title {
    font-size: 28px;
    font-weight: 700;
    opacity: 0.7;
}
.music-title:hover .title,
.music-title:hover .sub-title {
  opacity: 1;
}

/* ============================================= */
/* RESPONSIVE: حجم music-title بالضبط كما طلبت */
/* ============================================= */

/* 1440px → 1599px: من 250 → 290 */
@media (min-width: 1440px) and (max-width: 1599px) {
  .music-title {
    width: clamp(250px, 250px + 40 * (100vw - 1440px) / 159, 290px);
    height: clamp(250px, 250px + 40 * (100vw - 1440px) / 159, 290px);
  }
}

/* 1600px → 2074px: من 290 → 409 */
@media (min-width: 1600px) and (max-width: 2074px) {
  .music-title {
    width: clamp(290px, 290px + 119 * (100vw - 1600px) / 474, 409px);
    height: clamp(290px, 290px + 119 * (100vw - 1600px) / 474, 409px);
  }
}

/* 2075px → 2560px: من 409 → 530 */
@media (min-width: 2075px) and (max-width: 2560px) {
  .music-title {
    width: clamp(409px, 409px + 121 * (100vw - 2075px) / 485, 530px);
    height: clamp(409px, 409px + 121 * (100vw - 2075px) / 485, 530px);
  }
}

/* فوق 2560px */
@media (min-width: 2561px) {
  .music-title {
    width: 530px;
    height: 530px;
  }
}
</style>