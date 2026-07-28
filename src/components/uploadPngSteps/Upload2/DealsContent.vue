<template>
  <div class="tab-content">
    <div class="main-content">
      
      <!-- 🔥 Artist (Diggie) - هذا القسم فقط نشط وواضح -->
      <div class="section-top">
        <div class="topic">Diggie</div>
        <div class="anteil">
          <div class="frame-number">
            <span :class="{ 'zero-percentage': mainArtistPercentage === 0 }">{{ mainArtistPercentage }}%</span>
          </div>
          <div class="progress-bar">
            <div class="active" :style="{ width: mainArtistPercentage + '%' }"></div>
            <div class="inactive" :style="{ width: (100 - mainArtistPercentage) + '%' }"></div>
          </div>
        </div>
      </div>

      <!-- 🔥 القسم الباقي - معطل مع رسالة Coming Soon -->
      <div class="splitting-wrapper splitting-disabled">
        
        <div class="splitting">
          <div class="top-line">
            <div class="title">Werden Deine Einnahmen Gesplittet?</div>
            <div class="btn-switch">
              <img src="/icon/circle.svg" class="circle" alt="circle image" />
            </div>
          </div>

          <!-- Feature Artists -->
          <div v-for="(contributor, index) in featureContributors" :key="'feature-'+index" 
               class="share">
            <div class="name">{{ contributor.name }}</div>
            <div class="roller">Feature</div>
            <div class="anteil">
              <div class="input-percentage">
                <input
                  type="number"
                  v-model.number="contributor.percentage"
                  min="0"
                  max="100"
                  placeholder="0"
                  disabled
                  :class="{ 'zero-percentage': contributor.percentage === 0 }"
                />
                <span :class="{ 'zero-percentage': contributor.percentage === 0 }">%</span>
              </div>
              <div class="progress-bar" style="min-width: 244px;">
                <div class="active" :style="{ width: contributor.percentage + '%' }"></div>
                <div class="inactive" :style="{ width: (100 - contributor.percentage) + '%' }"></div>
              </div>
            </div>
          </div>

          <!-- Producers -->
          <div class="Produzent">
            <div v-for="(contributor, index) in producerContributors" :key="'producer-'+index" 
                 class="share">
              <div class="name">{{ contributor.name }}</div>
              <div class="roller">Produzent</div>
              <div class="anteil">
                <div class="input-percentage">
                  <input
                    type="number"
                    v-model.number="contributor.percentage"
                    min="0"
                    max="100"
                    placeholder="0"
                    disabled
                    :class="{ 'zero-percentage': contributor.percentage === 0 }"
                  />
                  <span :class="{ 'zero-percentage': contributor.percentage === 0 }">%</span>
                </div>
                <div class="progress-bar">
                  <div class="active" :style="{ width: contributor.percentage + '%' }"></div>
                  <div class="inactive" :style="{ width: (100 - contributor.percentage) + '%' }"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Other Contributors -->
          <div v-for="(contributor, index) in otherContributors" :key="'other-'+index" 
               class="share">
            <div class="name">{{ contributor.name }}</div>
            <div class="roller">{{ contributor.role }}</div>
            <div class="anteil">
              <div class="input-percentage">
                <input
                  type="number"
                  v-model.number="contributor.percentage"
                  min="0"
                  max="100"
                  placeholder="0"
                  disabled
                  :class="{ 'zero-percentage': contributor.percentage === 0 }"
                />
                <span :class="{ 'zero-percentage': contributor.percentage === 0 }">%</span>
              </div>
              <div class="progress-bar">
                <div class="active" :style="{ width: contributor.percentage + '%' }"></div>
                <div class="inactive" :style="{ width: (100 - contributor.percentage) + '%' }"></div>
              </div>
            </div>
          </div>

          <!-- P-Line -->
          <div v-for="(contributor, index) in pLineContributors" :key="'pline-'+index" 
               class="share">
            <div class="name">{{ contributor.name }}</div>
            <div class="roller">P-Line</div>
            <div class="anteil">
              <div class="input-percentage">
                <input
                  type="number"
                  v-model.number="contributor.percentage"
                  min="0"
                  max="100"
                  placeholder="0"
                  disabled
                  :class="{ 'zero-percentage': contributor.percentage === 0 }"
                />
                <span :class="{ 'zero-percentage': contributor.percentage === 0 }">%</span>
              </div>
              <div class="progress-bar">
                <div class="active" :style="{ width: contributor.percentage + '%' }"></div>
                <div class="inactive" :style="{ width: (100 - contributor.percentage) + '%' }"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- 🔥 رسالة Coming Soon - واضحة تماماً بدون أي فلتر -->
        <div class="coming-soon-overlay">
          <div class="coming-soon-box">
            <svg class="lock-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="white"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="white"/>
            </svg>
            <span class="coming-soon-text">Coming Soon</span>
            <span class="coming-soon-subtext">Diese Funktion ist in Kürze verfügbar.</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';

const props = defineProps({
  currentSong: {
    type: Object,
    default: () => ({})
  },
  formData: {
    type: Object,
    default: () => ({})
  },
  activeTab: {
    type: String,
    default: 'deals'
  }
});

const emit = defineEmits([
  'update:form-data',
  'save-song',
  'update-tab-completion'  // ✅ إضافة emit لـ tab completion
]);

// ========== ✅ بيانات ثابتة للتصميم ==========
const featureContributors = ref([
  { name: 'Artist Feature 1', percentage: 20 },
  { name: 'Artist Feature 2', percentage: 15 }
]);

const producerContributors = ref([
  { name: 'Producer 1', percentage: 10 },
  { name: 'Producer 2', percentage: 5 }
]);

const otherContributors = ref([
  { name: 'Composer 1', percentage: 10 },
  { name: 'Lyricist 1', percentage: 5 }
]);

const pLineContributors = ref([
  { name: 'P-Line 1', percentage: 10 }
]);

// ========== ✅ نسبة الفنان الرئيسي ==========
const mainArtistPercentage = 100;

// ========== ✅ tabCompletion = دائماً true ==========
const tabCompletion = computed(() => {
  // ✅ هذه الصفحة معطلة (Coming Soon) ولا ترسل API
  // لذلك دائماً complete = true
  const isComplete = true;
  console.log('📌 [DealsContent] tabCompletion (always true):', { deals: isComplete });
  return {
    deals: isComplete
  };
});

// ========== ✅ دالة التحقق من اكتمال التاب ==========
const isTabComplete = (tabId) => {
  if (tabId === 'deals') {
    // ✅ دائماً true لأن الصفحة معطلة
    console.log('📌 [DealsContent] isTabComplete: true (always)');
    return true;
  }
  return true; // جميع التابات الأخرى أيضاً true
};

// ========== ✅ إرسال تحديث الاكتمال ==========
const emitTabCompletion = () => {
  console.log('📌 [DealsContent] Emitting tab completion (always true)');
  
  // ✅ إرسال التحديث إلى المكون الأب
  emit('update-tab-completion', {
    deals: true
  });
  
  // ✅ إرسال تحديث form-data أيضاً
  emit('update:form-data', {
    tab: 'deals',
    data: { 
      isComplete: true,
      isSplittingActive: false,
      shares: []
    }
  });
};

// ========== ✅ دورة الحياة ==========
onMounted(() => {
  console.log('🚀 DealsContent: Mounted (Coming Soon - always complete)');
  
  // ✅ إرسال الاكتمال فور التحميل
  setTimeout(() => {
    emitTabCompletion();
  }, 300);
});

// ========== ✅ مراقبة التغييرات ==========
watch(
  () => props.activeTab,
  (newTab) => {
    if (newTab === 'deals') {
      console.log('📌 [DealsContent] Active tab changed to deals, emitting completion');
      setTimeout(() => {
        emitTabCompletion();
      }, 200);
    }
  },
  { immediate: true }
);

// ========== ✅ تصدير الدوال ==========
defineExpose({
  isTabComplete,
  tabCompletion,
  emitTabCompletion
});
</script>

<style lang="scss" scoped>
.tab-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  align-self: stretch;
  width: 100%;
}

.main-content {
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: flex-start;
  gap: 48px;
}

/* 🔥 section-top - نشط وواضح دائماً */
.section-top {
  display: flex;
  align-items: center;
  gap: 8px;
  align-self: stretch;
  position: relative;
  z-index: 5;
}

.section-top .topic {
  color: var(--Main-Colors-White, #FFF);
  font-family: Heebo;
  font-size: 42px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  letter-spacing: 2.1px;
  text-transform: uppercase;
  min-width: 454px;
}

.anteil {
  display: flex;
  align-items: center;
  gap: 20px;
  flex: 1 0 0;
}

.anteil .frame-number {
  display: flex;
  width: 60px;
  height: 32px;
  padding: 8px;
  justify-content: flex-end;
  align-items: center;
  border-radius: 5px;
}

.frame-number span {
  color: var(--Main-Colors-White, #FFF);
  font-family: Heebo;
  font-size: 32px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  letter-spacing: 1.6px;
}

.frame-number span.zero-percentage {
  color: var(--Main-Colors-Dove, #6A6C6D);
}

.progress-bar {
  display: flex;
  flex: 1 0 0;
  min-width: 246px;
  padding: 6px;
  align-items: flex-start;
  justify-content: center;
  border-radius: 10px;
  background: var(--Main-Colors-Slate-Dark, #1B1C20);
}

.progress-bar .active {
  height: 4px;
  border-radius: 4px;
  background: var(--Main-Colors-Strawberry, #D15);
}

.progress-bar .inactive {
  height: 0px;
  flex-shrink: 0;
  border-radius: 4px;
  background: var(--Main-Colors-Slate-Dark, #1B1C20);
}

/* ====== 🔥 القسم المعطل ====== */
.splitting-wrapper {
  position: relative;
  width: 100%;
  min-height: 400px;
}

.splitting {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 28px;
  align-self: stretch;
  opacity: 0.3;
  filter: blur(3px);
  pointer-events: none;
  user-select: none;
  cursor: not-allowed;
}

.splitting .top-line {
  display: flex;
  width: 524px;
  justify-content: space-between;
  align-items: flex-end;
}

.top-line .title {
  color: var(--Main-Colors-White, #FFF);
  font-family: Heebo;
  font-size: 18px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  letter-spacing: 0.9px;
  text-transform: uppercase;
}

.btn-switch {
  display: flex;
  width: 40px;
  height: 20px;
  padding: 2px;
  align-items: center;
  gap: 10px;
  border-radius: 10px;
  background: var(--primary, #1B1C20);
  cursor: default;
  transition: background 0.3s ease;
}

.btn-switch .circle {
  width: 16px;
  height: 16px;
  margin-left: 2px;
}

.share {
  opacity: 0.3;
  display: flex;
  align-items: center;
  gap: 32px;
  align-self: stretch;
}

.share .name {
  color: var(--Main-Colors-Dove, #6A6C6D);
  font-family: Heebo;
  font-size: 20px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  letter-spacing: 1px;
  min-width: 200px;
}

.share .roller {
  min-width: 200px;
  color: var(--Main-Colors-Dove, #6A6C6D);
  font-family: Heebo;
  font-size: 18px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  letter-spacing: 0.9px;
}

.anteil .input-percentage {
  display: flex;
  width: 60px;
  height: 32px;
  padding: 8px 6px;
  justify-content: flex-end;
  align-items: center;
  border-radius: 5px;
  background: var(--Main-Colors-Slate-Dark, #1B1C20);
}

.input-percentage input {
  width: 100%;
  background: transparent;
  border: none;
  outline: none;
  color: var(--Main-Colors-White, #FFF);
  font-family: Heebo;
  font-size: 17.5px;
  font-style: normal;
  font-weight: 300;
  line-height: normal;
  letter-spacing: 0.9px;
  text-align: right;
}

.input-percentage input.zero-percentage {
  color: var(--Main-Colors-Dove, #6A6C6D);
}

.input-percentage input:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.input-percentage input::-webkit-outer-spin-button,
.input-percentage input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.input-percentage input[type='number'] {
  -moz-appearance: textfield;
}

.input-percentage input::placeholder {
  color: var(--Main-Colors-Dove, #6A6C6D);
}

.input-percentage span {
  color: var(--Main-Colors-White, #FFF);
  font-family: Heebo;
  font-size: 17.5px;
  font-style: normal;
  font-weight: 300;
  line-height: normal;
  letter-spacing: 0.9px;
}

.input-percentage span.zero-percentage {
  color: var(--Main-Colors-Dove, #6A6C6D);
}

.Produzent {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  align-self: stretch;
}

/* ====== 🔥 رسالة Coming Soon - واضحة تماماً بدون أي فلتر ====== */
.coming-soon-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 100;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: none;
  filter: none !important;
  -webkit-filter: none !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}

.coming-soon-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: rgba(27, 28, 32, 0.95);
  padding: 40px 56px;
  border-radius: 20px;
  border: 2px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 16px 64px rgba(0, 0, 0, 0.6);
  max-width: 420px;
  width: 90%;
  text-align: center;
  pointer-events: none;
  filter: none !important;
  -webkit-filter: none !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
  opacity: 1 !important;
}

.lock-icon {
  width: 56px;
  height: 56px;
  color: var(--Main-Colors-Strawberry, #D15);
  flex-shrink: 0;
}

.coming-soon-text {
  color: #FFFFFF;
  font-family: Heebo;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: 1px;
}

.coming-soon-subtext {
  color: #AAAAAA;
  font-family: Heebo;
  font-size: 16px;
  font-weight: 300;
  line-height: 1.5;
}

@media (min-width:1440px) and (max-width:1599px){
  .topic{
    font-size: 32px;
    letter-spacing: 1.6px;
  }

  .top-line .title{
    font-size: 16px;
    letter-spacing: 0.8px;
  }
  
  .share .name ,.share .roller{
    font-size: 16px;
  }
  .anteil{
    gap: 12px;
  }
  
  .coming-soon-box {
    padding: 28px 32px;
    max-width: 340px;
  }
  
  .coming-soon-text {
    font-size: 22px;
  }
  
  .coming-soon-subtext {
    font-size: 14px;
  }
  
  .lock-icon {
    width: 40px;
    height: 40px;
  }
}

@media (min-width:2075px) and (max-width:2560px) {
  .coming-soon-box {
    padding: 48px 64px;
    max-width: 520px;
  }
  
  .coming-soon-text {
    font-size: 34px;
  }
  
  .coming-soon-subtext {
    font-size: 18px;
  }
  
  .lock-icon {
    width: 64px;
    height: 64px;
  }
}
</style>