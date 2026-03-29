<template>
  <div class="tab-content">
    <div class="main-content">
      <!-- Artist (Diggie) -->
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

      <div class="splitting">
        <div class="top-line">
          <div class="title">Werden Deine Einnahmen Gesplittet?</div>
          <div class="btn-switch" :class="{ active: isSplittingActive }" @click="toggleSplitting">
            <img src="/icon/circle.svg" class="circle" alt="circle image" />
          </div>
        </div>

        <!-- Feature Artists -->
        <div v-for="(contributor, index) in featureContributors" :key="'feature-'+index" 
             class="share" :class="{ active: isSplittingActive }">
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
                :disabled="!isSplittingActive"
                @input="updateContributorPercentage('feature', index, $event.target.value)"
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
               class="share" :class="{ active: isSplittingActive }">
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
                  :disabled="!isSplittingActive"
                  @input="updateContributorPercentage('producer', index, $event.target.value)"
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

        <!-- Other Contributors (Composer, etc) -->
        <div v-for="(contributor, index) in otherContributors" :key="'other-'+index" 
             class="share" :class="{ active: isSplittingActive }">
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
                :disabled="!isSplittingActive"
                @input="updateOtherContributorPercentage(index, $event.target.value)"
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
             class="share" :class="{ active: isSplittingActive }">
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
                :disabled="!isSplittingActive"
                @input="updateContributorPercentage('p_line', index, $event.target.value)"
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
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { debounce } from '@/utils/debounce';

const props = defineProps({
  currentSong: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['openVideoPopup', 'save-song']);

// State for splitting toggle
const isSplittingActive = ref(false);

// بيانات المساهمين
const artistContributors = ref([]);
const featureContributors = ref([]);
const producerContributors = ref([]);
const pLineContributors = ref([]);
const otherContributors = ref([]);

// تخزين القيم السابقة للمقارنة
const previousValues = ref({
  artist: [],
  feature: [],
  producer: [],
  p_line: [],
  other_contributors: []
});

// ─── تحديث البيانات من props ───
const updateFromProps = () => {
  if (!props.currentSong?.uuid) return;

  console.log('🔄 DealsContent: تحديث من currentSong', props.currentSong);

  // تحديث بيانات المساهمين من contributors
  if (props.currentSong.contributors) {
    // Artist
    artistContributors.value = props.currentSong.contributors.artist 
      ? JSON.parse(JSON.stringify(props.currentSong.contributors.artist))
      : [];
    
    // Feature
    featureContributors.value = props.currentSong.contributors.feature
      ? JSON.parse(JSON.stringify(props.currentSong.contributors.feature))
      : [];
    
    // Producer
    producerContributors.value = props.currentSong.contributors.producer
      ? JSON.parse(JSON.stringify(props.currentSong.contributors.producer))
      : [];
    
    // P-Line
    pLineContributors.value = props.currentSong.contributors.p_line
      ? JSON.parse(JSON.stringify(props.currentSong.contributors.p_line))
      : [];
    
    // Other Contributors
    otherContributors.value = props.currentSong.contributors.other_contributors
      ? JSON.parse(JSON.stringify(props.currentSong.contributors.other_contributors))
      : [];

    // التحقق مما إذا كان هناك أي نسب مئوية أكبر من 0
    const hasAnyPercentage = [
      ...featureContributors.value,
      ...producerContributors.value,
      ...otherContributors.value,
      ...pLineContributors.value
    ].some(c => c.percentage > 0);

    isSplittingActive.value = hasAnyPercentage;

    // تخزين القيم السابقة
    previousValues.value = {
      artist: JSON.parse(JSON.stringify(artistContributors.value)),
      feature: JSON.parse(JSON.stringify(featureContributors.value)),
      producer: JSON.parse(JSON.stringify(producerContributors.value)),
      p_line: JSON.parse(JSON.stringify(pLineContributors.value)),
      other_contributors: JSON.parse(JSON.stringify(otherContributors.value))
    };
  }
};

// حساب نسبة الفنان الرئيسي (Diggie)
const mainArtistPercentage = computed(() => {
  // جمع كل النسب من جميع المساهمين
  let totalOthersPercentage = 0;
  
  featureContributors.value.forEach(c => totalOthersPercentage += c.percentage );
  producerContributors.value.forEach(c => totalOthersPercentage += c.percentage );
  otherContributors.value.forEach(c => totalOthersPercentage += c.percentage );
  pLineContributors.value.forEach(c => totalOthersPercentage += c.percentage );
  
  // نسبة الفنان الرئيسي هي 100% ناقص مجموع نسب الآخرين
  return Math.max(0, 100 - totalOthersPercentage);
});

// تحديث نسبة مساهم
const updateContributorPercentage = (type, index, value) => {
  let percentage = parseInt(value) ;
  if (percentage < 0) percentage = 0;
  if (percentage > 100) percentage = 100;

  // تحديث القيمة في المصفوفة المناسبة
  switch(type) {
    case 'feature':
      featureContributors.value[index].percentage = percentage;
      break;
    case 'producer':
      producerContributors.value[index].percentage = percentage;
      break;
    case 'p_line':
      pLineContributors.value[index].percentage = percentage;
      break;
  }

  // التأكد من أن المجموع لا يتجاوز 100%
  validatePercentages();
  
  debouncedSendUpdate();
};

// تحديث نسبة other contributor
const updateOtherContributorPercentage = (index, value) => {
  let percentage = parseInt(value) ;
  if (percentage < 0) percentage = 0;
  if (percentage > 100) percentage = 100;

  otherContributors.value[index].percentage = percentage;
  
  validatePercentages();
  debouncedSendUpdate();
};

// التحقق من أن مجموع النسب لا يتجاوز 100%
const validatePercentages = () => {
  let total = 0;
  
  featureContributors.value.forEach(c => total += c.percentage );
  producerContributors.value.forEach(c => total += c.percentage );
  otherContributors.value.forEach(c => total += c.percentage );
  pLineContributors.value.forEach(c => total += c.percentage );

  // إذا تجاوز المجموع 100%، نقوم بتعديل آخر قيمة تم تغييرها
  if (total > 100) {
    // يمكن إضافة منطق لتعديل القيم تلقائياً
    console.warn('Total percentages exceed 100%');
  }
};

// Toggle splitting
const toggleSplitting = () => {
  isSplittingActive.value = !isSplittingActive.value;
  if (!isSplittingActive.value) {
    // إعادة تعيين جميع النسب إلى 0
    featureContributors.value.forEach(c => c.percentage = 0);
    producerContributors.value.forEach(c => c.percentage = 0);
    otherContributors.value.forEach(c => c.percentage = 0);
    pLineContributors.value.forEach(c => c.percentage = 0);
  }
  debouncedSendUpdate();
};

// ─── دالة إرسال التحديثات - ترسل فقط القيم المتغيرة ───
const sendUpdate = () => {
  if (!props.currentSong?.uuid) {
    console.warn('⚠️ DealsContent: لا يوجد UUID للأغنية');
    return;
  }

  const payload = { contributors: {} };
  let hasChanges = false;

  // مقارنة Artist
  if (JSON.stringify(artistContributors.value) !== JSON.stringify(previousValues.value.artist)) {
    payload.contributors['artist'] = artistContributors.value;
    console.log('🔄 تغيير في Artist:', { 
      قديم: previousValues.value.artist, 
      جديد: artistContributors.value 
    });
    hasChanges = true;
  }

  // مقارنة Feature
  if (JSON.stringify(featureContributors.value) !== JSON.stringify(previousValues.value.feature)) {
    payload.contributors['feature'] = featureContributors.value;
    console.log('🔄 تغيير في Feature:', { 
      قديم: previousValues.value.feature, 
      جديد: featureContributors.value 
    });
    hasChanges = true;
  }

  // مقارنة Producer
  if (JSON.stringify(producerContributors.value) !== JSON.stringify(previousValues.value.producer)) {
    payload.contributors['producer'] = producerContributors.value;
    console.log('🔄 تغيير في Producer:', { 
      قديم: previousValues.value.producer, 
      جديد: producerContributors.value 
    });
    hasChanges = true;
  }

  // مقارنة P-Line
  if (JSON.stringify(pLineContributors.value) !== JSON.stringify(previousValues.value.p_line)) {
    payload.contributors['p_line'] = pLineContributors.value;
    console.log('🔄 تغيير في P-Line:', { 
      قديم: previousValues.value.p_line, 
      جديد: pLineContributors.value 
    });
    hasChanges = true;
  }

  // مقارنة Other Contributors
  if (JSON.stringify(otherContributors.value) !== JSON.stringify(previousValues.value.other_contributors)) {
    payload.contributors['other_contributors'] = otherContributors.value;
    console.log('🔄 تغيير في Other Contributors:', { 
      قديم: previousValues.value.other_contributors, 
      جديد: otherContributors.value 
    });
    hasChanges = true;
  }

  if (!hasChanges) {
    console.log('ℹ️ DealsContent: لا توجد تغييرات');
    return;
  }

  // إذا كان contributors فارغاً، نحذفه من الـ payload
  if (Object.keys(payload.contributors).length === 0) {
    delete payload.contributors;
  }

  console.log('📤 DealsContent: إرسال التغييرات فقط:', payload);

  // تحديث القيم السابقة
  previousValues.value = {
    artist: JSON.parse(JSON.stringify(artistContributors.value)),
    feature: JSON.parse(JSON.stringify(featureContributors.value)),
    producer: JSON.parse(JSON.stringify(producerContributors.value)),
    p_line: JSON.parse(JSON.stringify(pLineContributors.value)),
    other_contributors: JSON.parse(JSON.stringify(otherContributors.value))
  };

  // إرسال فقط التغييرات
  emit('save-song', payload);
};

// ─── إنشاء دالة debounce للإرسال ───
const debouncedSendUpdate = debounce(sendUpdate, 1500);

// ─── مراقبة تغييرات currentSong ───
watch(() => props.currentSong, (newSong) => {
  if (newSong?.uuid) {
    updateFromProps();
  }
}, { deep: true, immediate: true });

// ─── إرسال تحديث فوري عند إزالة المكون ───
onUnmounted(() => {
  console.log('🗑️ DealsContent: تم إزالة المكون');
  if (debouncedSendUpdate.flush) {
    debouncedSendUpdate.flush();
  }
});

onMounted(() => {
  console.log('🚀 DealsContent: تم التحميل');
  updateFromProps();
});
</script>

<style lang="scss" scoped>
.tab-content {
  display: flex;
  padding-right: 40px;
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

.section-top {
  display: flex;
  align-items: center;
  gap: 8px;
  align-self: stretch;
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

.splitting {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 28px;
  align-self: stretch;
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
  cursor: pointer;
  transition: background 0.3s ease;
}

.btn-switch.active {
  background: var(--Main-Colors-Strawberry, #D15);
}

.btn-switch .circle {
  width: 16px;
  height: 16px;
  margin-left: 2px;
  transition: margin-left 0.3s ease;
}

.btn-switch.active .circle {
  margin-left: 20px;
}

.share {
  opacity: 0.3;
  display: flex;
  align-items: center;
  gap: 32px;
  align-self: stretch;
}

.share.active {
  opacity: 1;
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
}
</style>