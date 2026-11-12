<script>
import { useDataStore } from '@/stores/data';
import { useReleaseStore } from '@/stores/release';
import { mapState } from 'pinia';
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue';

export default {
  name: 'SchutzenThankYou',
  computed: {
    ...mapState(useDataStore, ['user']),
  },
  setup() {
    const currentStep = ref(1);
    let stepTimer = null;
    const releaseStore = useReleaseStore();
    const dataStore = useDataStore();

    // 🔥 الحصول على صورة الغلاف من localStorage أو من الـ Store
    const coverImage = ref(null);

    // 🔥 دالة للحصول على الرابط الكامل للصورة
    const getCoverImageUrl = computed(() => {
      const cover = coverImage.value;
      if (!cover) return null;
      
      // إذا كان الرابط يبدأ بـ http، استخدمه مباشرة
      if (cover.startsWith('http://') || cover.startsWith('https://')) {
        return cover;
      }
      
      // إذا كان الرابط يبدأ بـ /، استخدمه مباشرة
      if (cover.startsWith('/')) {
        return cover;
      }
      
      // إذا كان الرابط يبدأ بـ 'covers/'، أضف storage URL
      const storageUrl = import.meta.env.VITE_STORAGE_URL || 'https://zoundr-flow-api.davinda.dev/storage';
      
      if (cover.startsWith('covers/') || cover.includes('/')) {
        return `${storageUrl}/${cover}`;
      }
      
      return `${storageUrl}/covers/${cover}`;
    });

    // مدة بقاء كلّ خطوة قبل الانتقال إلى التالية (مللي ثانية).
    // الخطوة 3 أخيرة فلا مدة لها. كان setInterval واحد بـ 3000 يفرض نفس المدة
    // على الجميع، فاستُبدل بـ setTimeout متسلسل تأخذ كلّ خطوة فيه مدتها.
    const STEP_DURATIONS = { 1: 3000, 2: 5000 };

    const startStepTransition = () => {
      if (stepTimer) {
        clearTimeout(stepTimer);
      }

      const scheduleNext = () => {
        const duration = STEP_DURATIONS[currentStep.value];
        if (!duration) return;            // آخر خطوة
        stepTimer = setTimeout(() => {
          currentStep.value = Math.min(currentStep.value + 1, 3);
          scheduleNext();
        }, duration);
      };

      scheduleNext();
    };

    // ✅ لا يبدأ عدّ الثلاث ثوانٍ إلا عندما تظهر البطاقة فعلاً على الشاشة.
    //
    //    لماذا لم يكفِ window.load ولا requestAnimationFrame: التطبيق SPA يمرّ بمصادقة
    //    Keycloak قبل تركيب المكوّن، فعند التحديث يكون readyState قد صار complete أصلاً
    //    وينطلق المؤقّت فوراً بينما الواجهة لم تُعرَض بعد. IntersectionObserver يقيس الأمر
    //    مباشرة: هل العنصر داخل إطار العرض ومرئي؟ ونضيف إليه شرط أن تكون
    //    اللسانة ظاهرة (لا في خلفية المتصفّح).
    const topContainerRef = ref(null);
    let visibilityObserver = null;
    let onVisibilityChange = null;

    const beginAfterPaint = () => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          startStepTransition();
        });
      });
    };

    const cleanupStartWatchers = () => {
      if (visibilityObserver) {
        visibilityObserver.disconnect();
        visibilityObserver = null;
      }
      if (onVisibilityChange) {
        document.removeEventListener('visibilitychange', onVisibilityChange);
        onVisibilityChange = null;
      }
    };

    const scheduleStepStart = () => {
      const tryBegin = () => {
        if (document.visibilityState !== 'visible') return false;
        cleanupStartWatchers();
        beginAfterPaint();
        return true;
      };

      nextTick(() => {
        const el = topContainerRef.value;

        // متصفّح بلا IntersectionObserver → نكتفي بإطاري رسم.
        if (!el || typeof IntersectionObserver === 'undefined') {
          beginAfterPaint();
          return;
        }

        // إن كانت اللسانة مخفيّة ننتظر عودتها قبل أن نبدأ.
        onVisibilityChange = () => {
          if (document.visibilityState === 'visible' && visibilityObserver === null) {
            tryBegin();
          }
        };
        document.addEventListener('visibilitychange', onVisibilityChange);

        visibilityObserver = new IntersectionObserver((entries) => {
          if (entries.some(e => e.isIntersecting && e.intersectionRatio > 0)) {
            if (document.visibilityState === 'visible') {
              tryBegin();
            } else {
              // العنصر مرئي لكن اللسانة في الخلفية → نترك مستمع visibilitychange يتولّى الأمر.
              visibilityObserver.disconnect();
              visibilityObserver = null;
            }
          }
        }, { threshold: 0.01 });

        visibilityObserver.observe(el);
      });
    };

    onMounted(() => {
      currentStep.value = 1;
      scheduleStepStart();
      localStorage.setItem('paymentStatus', '0');
      
      // 🔥 استرجاع صورة الغلاف من localStorage
      const savedCover = localStorage.getItem('releaseCover');
      if (savedCover) {
        coverImage.value = savedCover;
        console.log('🖼️ Cover image loaded from localStorage:', savedCover);
      } else {
        // محاولة الحصول من releaseStore كـ fallback
        if (releaseStore.cover) {
          coverImage.value = releaseStore.cover;
          console.log('🖼️ Cover image loaded from releaseStore:', releaseStore.cover);
        } else if (dataStore.releaseCover) {
          coverImage.value = dataStore.releaseCover;
          console.log('🖼️ Cover image loaded from dataStore:', dataStore.releaseCover);
        } else {
          console.log('⚠️ No cover image found');
        }
      }
      
      console.log('🖼️ Cover URL:', getCoverImageUrl.value);
    });

    onUnmounted(() => {
      if (stepTimer) {
        clearTimeout(stepTimer);
      }
      cleanupStartWatchers();
    });

    return {
      topContainerRef,
      currentStep,
      coverImage,
      getCoverImageUrl,
    };
  }
};
</script>

<template>
  <main>
    <div class="final-container">
      <div class="top-container" ref="topContainerRef">
        <div class="final-title">
          <h1>VIELEN DANK!</h1>
        </div>

        <!-- Step 1 -->
        <div v-if="currentStep === 1" class="step step-1" :class="{ 'fade-in': currentStep === 1 }">
          <p style="width: 313px; line-height: normal;">Du hast die Vorbereitungen für Deinen Release abgeschlossen.</p>
        </div>

        <!-- Step 2 -->
        <div v-else-if="currentStep === 2" class="step step-2" :class="{ 'fade-in': currentStep === 2 }">
          <div class="step2">
            <p>Nun beginnt unsere Arbeit. Wir prüfen nun Deine Angaben und melden uns schnellstmöglich wieder bei Dir.</p>
            <p>
              Solltest Du in der Zwischenzeit Fragen haben, erreichst Du uns gerne.
            </p>
          </div>
        </div>

        <!-- Step 3 -->
        <div v-else-if="currentStep === 3" class="step step-3" :class="{ 'fade-in': currentStep === 3 }">
          <div class="step3">
            <p>Was möchtest Du als nächstes tun?</p>
            <div class="cta-step3">
              <router-link to="/create-release" class="btn1-step3">
                <span>Neuen Release Anlegen</span>
              </router-link>
              <router-link to="/" class="btn2-step3">
                <span>Zurück zum Dashboard</span>
              </router-link>
            </div>
          </div>
        </div>

        <!-- 🔥 صورة الغلاف -->
        <div 
          class="img-cover" 
          :style="getCoverImageUrl ? { backgroundImage: `url(${getCoverImageUrl})` } : {}"
        >
         
        </div>
      </div>
      
      <div class="final-bg" role="img" aria-label="Certificate Illustration"></div>
    </div>
  </main>
</template>



<style lang="scss" scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Heebo', sans-serif;
}

p {
  color: var(--Main-Colors-White, #FFF);
  text-align: center;
  font-family: Heebo;
  font-size: 18px;
  font-style: normal;
  font-weight: 300;
  line-height: 1;
  letter-spacing: 0.9px;
  align-self: stretch;
}

.step {
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.5s ease-in-out;
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.step.fade-in {
  opacity: 1;
  transform: translateY(0);
}

/* ✅ تباعد الأسطر داخل الخطوة الثانية (القاعدة العامة p تضبطه على 1). */
.step-2 p {
  line-height: normal;
  letter-spacing: 0.9px;
}

.step2 {
  display: flex;
  width: 431px;
  flex-direction: column;
  align-items: flex-start;
  gap: 32px;
  
}

.step3 {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 32px;
  align-self: stretch;
}

.cta-step3 {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 32px;
  align-self: stretch;
}

.cta-step3 .btn1-step3 {
  display: flex;
  padding: 12px 20px 13px 20px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  border-radius: 5px;
  background: var(--Main-Colors-Strawberry, #D15);
  transition: background 0.3s ease;
  cursor: pointer;
}

.cta-step3 .btn2-step3 {
  display: flex;
  padding: 12px 20px 13px 20px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  border-radius: 5px;
  background: var(--Main-Colors-Slate-Light, #3A3E42);
  transition: background 0.3s ease;
  cursor: pointer;
}

.cta-step3 span {
  color: var(--Main-Colors-White, #FFF);
  font-family: Heebo;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  text-transform: uppercase;
}

.btn1-step3:hover, .btn2-step3:hover {
  background: var(--dark-red);
}

.top-container {
  display: flex;
  width: 759px;
  height: 520px;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
  z-index: 2;
  position: relative;
}

.img-cover {
  display: flex;
  width: 210px;
  height: 210px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
  aspect-ratio: 1/1;
  border-radius: 20px;
  background: #26282D 50% / cover no-repeat;
  box-shadow: 0 0 40px 0 var(--Main-Colors-Slate-Black, #0E0E10);
  z-index: 1;
  transition: background-image 0.5s ease;
  background-size: cover;
  background-position: center;
}

.placeholder-text {
  color: #6A6C6D;
  font-family: Heebo;
  font-size: 18px;
  font-weight: 300;
  letter-spacing: 1px;
}

main {
  display: flex;
  height: calc(100vh - 71px - 50px);
  width: 100%;
  position: relative;
  overflow: hidden;
}

.final-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  text-align: center;
  color: #fff;
  position: relative;
  padding: 40px 0;
}

.final-title {
  display: flex;
  width: 760px;
  flex-direction: column;
  justify-content: center;
  flex-shrink: 0;
}

.final-title h1 {
  color: #fff;
  text-align: center;
  font-family: Heebo;
  font-size: 78px;
  font-style: normal;
  font-weight: 700;
  line-height: 1;
  letter-spacing: 3.9px;
  text-transform: uppercase;
}

/* الصورة خلفيةٌ من طبقتين: التلاشي فوق والصورة تحته.
   القياس: 1534×498 على شاشة 1920 (وهو عرض عمود المحتوى كاملاً)، ولأنّ النسبة
   محفوظة بـ aspect-ratio يتقلّص الإطار بها نفسها على بقيّة الشاشات.
   خارج التدفّق وملتصقة بالأسفل، فتمتدّ خلف .top-container بلا قصّ ولا دفع. */
.final-bg {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  aspect-ratio: 1534 / 498;
  z-index: 0;
  pointer-events: none;
  background: linear-gradient(180deg, rgba(27, 28, 32, 0.00) 40%, var(--Main-Colors-Slate-Dark, #1B1C20) 100%),
              url('/img/thanks/thanks2.webp') center top / 100% auto no-repeat;
}

/* Animation for step transitions */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.step.fade-in {
  animation: fadeInUp 0.5s ease-out forwards;
}

/* Responsive Design */
@media (max-width: 1440px) {
  main {
    margin: 0 16px 20px !important;
    height: calc(100vh - 56.66px - 20px);
  }

  .final-title {
    width: 100%;
    height: auto;
  }

  .final-title h1 {
    font-size: 60px;
    letter-spacing: 3px;
  }

  .step2 {
    width: 100%;
    max-width: 431px;
  }

  .top-container {
    width: 100%;
    max-width: 551px;
  }
}

@media (max-width: 768px) {
  .final-title h1 {
    font-size: 48px;
    letter-spacing: 2.4px;
  }

  .step {
    min-height: 100px;
  }

  .step2, .step3 {
    gap: 24px;
  }

  .cta-step3 {
    flex-direction: column;
    gap: 16px;
  }

  .top-container {
    gap: 30px;
    width: 100%;
    padding: 0 20px;
  }

  .final-container {
    padding: 30px 0;
  }
}

@media (max-width: 480px) {
  .final-title h1 {
    font-size: 36px;
    letter-spacing: 1.8px;
  }

  p {
    font-size: 16px;
  }

  .step {
    min-height: 80px;
  }

  .step2, .step3 {
    gap: 20px;
  }

  .cta-step3 .btn1-step3,
  .cta-step3 .btn2-step3 {
    padding: 10px 16px;
    width: 100%;
  }

  .top-container {
    gap: 20px;
  }

  .final-container {
    padding: 20px 0;
  }
}
</style>