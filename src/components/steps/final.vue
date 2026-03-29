<script>
import { useDataStore } from '@/stores/data';
import { mapState } from 'pinia';
import { ref, onMounted, onUnmounted } from 'vue';

export default {
  name: 'SchutzenThankYou',
  computed: {
    ...mapState(useDataStore, ['user']),
  },
  setup() {
    const currentStep = ref(1);
    let stepTimer = null;

    const startStepTransition = () => {
      // إعادة تعيين المؤقت إذا كان موجوداً
      if (stepTimer) {
        clearTimeout(stepTimer);
      }

      // تبديل الخطوات كل ثانيتين
      stepTimer = setInterval(() => {
        currentStep.value++;
        if (currentStep.value > 3) {
          currentStep.value = 3; // توقف عند الخطوة الثالثة
          clearInterval(stepTimer);
        }
      }, 3000);
    };

    onMounted(() => {
      startStepTransition();
    });

    onMounted(() => {
  // إعادة تعيين paymentStatus عند تحميل صفحة الشكر
  localStorage.setItem('paymentStatus', '0');
  
});

    onUnmounted(() => {
      if (stepTimer) {
        clearInterval(stepTimer);
      }
    });

    return {
      currentStep,
    };
  }
};
</script>

<template>
  <main>
    <div class="final-container">
      <div class="top-container">
        <div class="final-title">
          <h1>VIELEN DANK!</h1>
        </div>

        <!-- Step 1 -->
        <div v-if="currentStep === 1" class="step step-1" :class="{ 'fade-in': currentStep === 1 }">
          <p>Su hast die Vorbereitungen für Deinen Release abgeschlossen.</p>
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
            <p>Was möchtest du als nächstes tun?</p>
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

        <div class="img-cover"></div>
      </div>
      
      <div class="final-bg">
        <img src="/img/thanks/thanks.png" alt="Certificate Illustration" />
      </div>
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
  padding: 140px 20px 80px 20px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 112px;
  flex-shrink: 0;
  aspect-ratio: 1/1;
  border-radius: 20px;
  background: url(<path-to-image>) lightgray 50% / cover no-repeat;
  box-shadow: 0 0 40px 0 var(--Main-Colors-Slate-Black, #0E0E10);
  z-index: 1;
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
  // height: 133px;
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

.final-bg {
  width: 100%;
  height: 326px;
  flex-shrink: 0;
  background: linear-gradient(180deg, rgba(27, 28, 32, 0) 78.51%, var(--primary) 100%);
  display: flex;
  justify-content: center;
  align-items: flex-end;
  z-index: 1;
}

.final-bg img {
  max-width: 100%;
  height: auto;
  display: block;
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