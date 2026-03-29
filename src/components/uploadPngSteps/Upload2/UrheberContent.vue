<template>
  <div class="tab-content">
    <div class="frame">
      <!-- Komponist -->
      <div class="section">
        <div class="title">Komponist</div>
        <div
          v-for="(input, index) in komponistInputs"
          :key="index"
          class="form-field"
          :class="{ 
            'is-hovered': input.isHovered, 
            'has-checkmark': input.value && input.value.trim() !== '' 
          }"
          @mouseenter="input.isHovered = true"
          @mouseleave="input.isHovered = false"
        >
          <input
            type="text"
            class="input-field"
            v-model="input.value"
            placeholder="Name Komponist"
            @input="updateKomponistValue(index, $event.target.value)"
          />
          <div v-if="input.value && input.value.trim() !== ''" class="checkmark">
            <img src="@/assets/icons/y.png" class="icon-y" alt="checkmark" />
          </div>
          
          <!-- Plus Icon - يظهر دائماً عند الهوفر على الحقل الأول -->
          <div
            v-if="index === 0 && input.isHovered"
            class="plus-icon"
            @click="addKomponistInput"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </div>
          
          <!-- Minus Icon - يظهر دائماً عند الهوفر على الحقول الإضافية -->
          <div
            v-if="index > 0 && input.isHovered"
            class="minus-icon"
            @click="removeKomponistInput(index)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </div>
          
          <div class="spacer" @click="emit('openVideoPopup', 'komponist')">
            <div class="play" :class="{ visible: input.isHovered }">
              <img :src="iconPlay" class="icon" alt="play icon" />
            </div>
          </div>
        </div>
      </div>

      <!-- Textdichter -->
      <div class="section">
        <div class="title">Textdichter</div>
        <div
          v-for="(input, index) in textdichterInputs"
          :key="index"
          class="form-field"
          :class="{ 
            'is-hovered': input.isHovered, 
            'has-checkmark': input.value && input.value.trim() !== '' 
          }"
          @mouseenter="input.isHovered = true"
          @mouseleave="input.isHovered = false"
        >
          <input
            type="text"
            class="input-field"
            v-model="input.value"
            placeholder="Name Textdichter"
            @input="updateTextdichterValue(index, $event.target.value)"
          />
          <div v-if="input.value && input.value.trim() !== ''" class="checkmark">
            <img src="@/assets/icons/y.png" class="icon-y" alt="checkmark" />
          </div>
          
          <!-- Plus Icon - يظهر دائماً عند الهوفر على الحقل الأول -->
          <div
            v-if="index === 0 && input.isHovered"
            class="plus-icon"
            @click="addTextdichterInput"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </div>
          
          <!-- Minus Icon - يظهر دائماً عند الهوفر على الحقول الإضافية -->
          <div
            v-if="index > 0 && input.isHovered"
            class="minus-icon"
            @click="removeTextdichterInput(index)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </div>
          
          <div class="spacer" @click="emit('openVideoPopup', 'textdichter')">
            <div class="play" :class="{ visible: input.isHovered }">
              <img :src="iconPlay" class="icon" alt="play icon" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="frame">
      <!-- Verlag -->
      <div class="section">
        <div class="title">Verlag</div>
        <div
          v-for="(input, index) in verlagInputs"
          :key="index"
          class="form-field"
          :class="{ 
            'is-hovered': input.isHovered, 
            'has-checkmark': input.value && input.value.trim() !== '' 
          }"
          @mouseenter="input.isHovered = true"
          @mouseleave="input.isHovered = false"
        >
          <input
            type="text"
            class="input-field"
            v-model="input.value"
            placeholder="Name Verlag"
            @input="updateVerlagValue(index, $event.target.value)"
          />
          <div v-if="input.value && input.value.trim() !== ''" class="checkmark">
            <img src="@/assets/icons/y.png" class="icon-y" alt="checkmark" />
          </div>
          
          <!-- Plus Icon - يظهر دائماً عند الهوفر على الحقل الأول -->
          <div
            v-if="index === 0 && input.isHovered"
            class="plus-icon"
            @click="addVerlagInput"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </div>
          
          <!-- Minus Icon - يظهر دائماً عند الهوفر على الحقول الإضافية -->
          <div
            v-if="index > 0 && input.isHovered"
            class="minus-icon"
            @click="removeVerlagInput(index)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </div>
          
          <div class="spacer" @click="emit('openVideoPopup', 'verlag')">
            <div class="play" :class="{ visible: input.isHovered }">
              <img :src="iconPlay" class="icon" alt="play icon" />
            </div>
          </div>
        </div>
      </div>

      <!-- C-Line -->
      <div class="section">
        <div class="title">C-Line</div>
        <div
          v-for="(input, index) in cLineInputs"
          :key="index"
          class="form-field"
          :class="{ 
            'is-hovered': input.isHovered, 
            'has-checkmark': input.value && input.value.trim() !== '' 
          }"
          @mouseenter="input.isHovered = true"
          @mouseleave="input.isHovered = false"
        >
          <input
            type="text"
            class="input-field"
            v-model="input.value"
            placeholder="C-Line"
            @input="updateCLineValue(index, $event.target.value)"
          />
          <div v-if="input.value && input.value.trim() !== ''" class="checkmark">
            <img src="@/assets/icons/y.png" class="icon-y" alt="checkmark" />
          </div>
          
          <!-- Plus Icon - يظهر دائماً عند الهوفر على الحقل الأول -->
          <div
            v-if="index === 0 && input.isHovered"
            class="plus-icon"
            @click="addCLineInput"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </div>
          
          <!-- Minus Icon - يظهر دائماً عند الهوفر على الحقول الإضافية -->
          <div
            v-if="index > 0 && input.isHovered"
            class="minus-icon"
            @click="removeCLineInput(index)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </div>
          
          <div class="spacer" @click="emit('openVideoPopup', 'cline')">
            <div class="play" :class="{ visible: input.isHovered }">
              <img :src="iconPlay" class="icon" alt="play icon" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';
import iconPlay from '@/assets/icons/play.png';
import { debounce } from '@/utils/debounce';

const props = defineProps({
  currentSong: {
    type: Object,
    default: () => ({})
  },
  formData: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['openVideoPopup', 'update:form-data', 'save-song']);

// ──── تهيئة البيانات المحلية ────
const komponistInputs = ref([{ value: '', isHovered: false }]);
const textdichterInputs = ref([{ value: '', isHovered: false }]);
const verlagInputs = ref([{ value: '', isHovered: false }]);
const cLineInputs = ref([{ value: '', isHovered: false }]);

// تخزين القيم السابقة للمقارنة
const previousValues = ref({
  komponist: [],
  textdichter: [],
  verlag: [],
  c_line: []
});

// ──── تحديث البيانات من props ────
const updateFromProps = () => {
  if (!props.currentSong?.uuid) return;

  console.log('🔄 UrheberContent: تحديث من currentSong', props.currentSong);

  // Komponist - من authors.composer
  if (props.currentSong.authors?.composer) {
    const composerArray = Array.isArray(props.currentSong.authors.composer) 
      ? props.currentSong.authors.composer 
      : props.currentSong.authors.composer ? [props.currentSong.authors.composer] : [];
    
    komponistInputs.value = composerArray.length > 0 
      ? composerArray.map(value => ({ value: value || '', isHovered: false }))
      : [{ value: '', isHovered: false }];
    
    previousValues.value.komponist = [...composerArray];
  }

  // Textdichter - من authors.lyricist
  if (props.currentSong.authors?.lyricist) {
    const lyricistArray = Array.isArray(props.currentSong.authors.lyricist) 
      ? props.currentSong.authors.lyricist 
      : props.currentSong.authors.lyricist ? [props.currentSong.authors.lyricist] : [];
    
    textdichterInputs.value = lyricistArray.length > 0 
      ? lyricistArray.map(value => ({ value: value || '', isHovered: false }))
      : [{ value: '', isHovered: false }];
    
    previousValues.value.textdichter = [...lyricistArray];
  }

  // Verlag - من authors.verlog (ملاحظة: verlog وليس verlag)
  if (props.currentSong.authors?.verlog) {
    const verlogArray = Array.isArray(props.currentSong.authors.verlog) 
      ? props.currentSong.authors.verlog 
      : props.currentSong.authors.verlog ? [props.currentSong.authors.verlog] : [];
    
    verlagInputs.value = verlogArray.length > 0 
      ? verlogArray.map(value => ({ value: value || '', isHovered: false }))
      : [{ value: '', isHovered: false }];
    
    previousValues.value.verlag = [...verlogArray];
  }

  // C-Line - من authors.c_line
  if (props.currentSong.authors?.c_line) {
    const cLineArray = Array.isArray(props.currentSong.authors.c_line) 
      ? props.currentSong.authors.c_line 
      : props.currentSong.authors.c_line ? [props.currentSong.authors.c_line] : [];
    
    cLineInputs.value = cLineArray.length > 0 
      ? cLineArray.map(value => ({ value: value || '', isHovered: false }))
      : [{ value: '', isHovered: false }];
    
    previousValues.value.c_line = [...cLineArray];
  }
};

// ──── دالة إرسال التحديثات - ترسل فقط القيم المتغيرة ────
const sendUpdate = () => {
  if (!props.currentSong?.uuid) {
    console.warn('⚠️ UrheberContent: لا يوجد UUID للأغنية');
    return;
  }

  // تجميع القيم الحالية
  const currentKomponist = komponistInputs.value
    .map(input => (input.value || '').trim())
    .filter(value => value !== '');
  
  const currentTextdichter = textdichterInputs.value
    .map(input => (input.value || '').trim())
    .filter(value => value !== '');
  
  const currentVerlag = verlagInputs.value
    .map(input => (input.value || '').trim())
    .filter(value => value !== '');
  
  const currentCLine = cLineInputs.value
    .map(input => (input.value || '').trim())
    .filter(value => value !== '');

  const payload = {};
  let hasChanges = false;

  // مقارنة Komponist
  if (JSON.stringify(currentKomponist) !== JSON.stringify(previousValues.value.komponist)) {
    payload['authors'] = payload['authors'] || {};
    payload['authors']['composer'] = currentKomponist.length > 0 ? currentKomponist : [];
    console.log('🔄 تغيير في Komponist:', { 
      قديم: previousValues.value.komponist, 
      جديد: currentKomponist 
    });
    hasChanges = true;
  }

  // مقارنة Textdichter
  if (JSON.stringify(currentTextdichter) !== JSON.stringify(previousValues.value.textdichter)) {
    payload['authors'] = payload['authors'] || {};
    payload['authors']['lyricist'] = currentTextdichter.length > 0 ? currentTextdichter : [];
    console.log('🔄 تغيير في Textdichter:', { 
      قديم: previousValues.value.textdichter, 
      جديد: currentTextdichter 
    });
    hasChanges = true;
  }

  // مقارنة Verlag (ملاحظة: verlog وليس verlag)
  if (JSON.stringify(currentVerlag) !== JSON.stringify(previousValues.value.verlag)) {
    payload['authors'] = payload['authors'] || {};
    payload['authors']['verlog'] = currentVerlag.length > 0 ? currentVerlag : [];
    console.log('🔄 تغيير في Verlag:', { 
      قديم: previousValues.value.verlag, 
      جديد: currentVerlag 
    });
    hasChanges = true;
  }

  // مقارنة C-Line
  if (JSON.stringify(currentCLine) !== JSON.stringify(previousValues.value.c_line)) {
    payload['authors'] = payload['authors'] || {};
    payload['authors']['c_line'] = currentCLine.length > 0 ? currentCLine : [];
    console.log('🔄 تغيير في C-Line:', { 
      قديم: previousValues.value.c_line, 
      جديد: currentCLine 
    });
    hasChanges = true;
  }

  if (!hasChanges) {
    console.log('ℹ️ UrheberContent: لا توجد تغييرات');
    return;
  }

  console.log('📤 UrheberContent: إرسال التغييرات فقط:', payload);

  // تحديث القيم السابقة
  previousValues.value = {
    komponist: [...currentKomponist],
    textdichter: [...currentTextdichter],
    verlag: [...currentVerlag],
    c_line: [...currentCLine]
  };

  // إرسال فقط التغييرات
  emit('save-song', payload);
};

// ──── إنشاء دالة debounce للإرسال ────
const debouncedSendUpdate = debounce(sendUpdate, 1500);

// ──── دوال إدارة Komponist ────
const updateKomponistValue = (index, value) => {
  if (komponistInputs.value[index]) {
    komponistInputs.value[index].value = value || '';
    debouncedSendUpdate();
  }
};

const addKomponistInput = () => {
  komponistInputs.value.push({ value: '', isHovered: false });
  debouncedSendUpdate();
};

const removeKomponistInput = (index) => {
  if (komponistInputs.value.length > 1) {
    komponistInputs.value.splice(index, 1);
    debouncedSendUpdate();
  }
};

// ──── دوال إدارة Textdichter ────
const updateTextdichterValue = (index, value) => {
  if (textdichterInputs.value[index]) {
    textdichterInputs.value[index].value = value || '';
    debouncedSendUpdate();
  }
};

const addTextdichterInput = () => {
  textdichterInputs.value.push({ value: '', isHovered: false });
  debouncedSendUpdate();
};

const removeTextdichterInput = (index) => {
  if (textdichterInputs.value.length > 1) {
    textdichterInputs.value.splice(index, 1);
    debouncedSendUpdate();
  }
};

// ──── دوال إدارة Verlag ────
const updateVerlagValue = (index, value) => {
  if (verlagInputs.value[index]) {
    verlagInputs.value[index].value = value || '';
    debouncedSendUpdate();
  }
};

const addVerlagInput = () => {
  verlagInputs.value.push({ value: '', isHovered: false });
  debouncedSendUpdate();
};

const removeVerlagInput = (index) => {
  if (verlagInputs.value.length > 1) {
    verlagInputs.value.splice(index, 1);
    debouncedSendUpdate();
  }
};

// ──── دوال إدارة C-Line ────
const updateCLineValue = (index, value) => {
  if (cLineInputs.value[index]) {
    cLineInputs.value[index].value = value || '';
    debouncedSendUpdate();
  }
};

const addCLineInput = () => {
  cLineInputs.value.push({ value: '', isHovered: false });
  debouncedSendUpdate();
};

const removeCLineInput = (index) => {
  if (cLineInputs.value.length > 1) {
    cLineInputs.value.splice(index, 1);
    debouncedSendUpdate();
  }
};

// ──── مراقبة تغييرات currentSong ────
watch(() => props.currentSong, (newSong) => {
  if (newSong?.uuid) {
    updateFromProps();
  }
}, { deep: true, immediate: true });

// ──── إرسال تحديث فوري عند إزالة المكون ────
onUnmounted(() => {
  console.log('🗑️ UrheberContent: تم إزالة المكون');
  if (debouncedSendUpdate.flush) {
    debouncedSendUpdate.flush();
  }
});

onMounted(() => {
  console.log('🚀 UrheberContent: تم التحميل');
  updateFromProps();
});
</script>

<style lang="scss" scoped>
.tab-content {
  display: flex;
  justify-content: start;
  align-items: flex-start;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  padding-right: 40px;
}

.frame {
  display: flex;
  width: 100%;
  align-items: flex-start;
  gap: 32px;
  flex: 1 0 0;
}

.section {
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: flex-start;
  gap: 8px;
  align-self: stretch;
  position: relative;
  width: 100%;
}

.title {
  color: var(--Main-Colors-White, #FFF);
  font-family: Heebo;
  font-size: 14px;
  font-style: normal;
  font-weight: 300;
  line-height: normal;
  letter-spacing: 0.7px;
  text-transform: uppercase;
}

.form-field {
  display: flex;
  align-items: center;
  gap: 2px;
  align-self: stretch;
  border-radius: 5px;
  width: 100%;
  position: relative;
}

.form-field .input-field {
  display: flex;
  padding: 12px 40px 12px 12px;
  justify-content: space-between;
  align-items: center;
  flex: 1 0 0;
  border-radius: 5px;
  background: var(--primary, #1B1C20);
  outline: none;
  border: 0;
  color: #fff;
  font-family: Heebo;
  font-size: 20px;
  height: 46px;
  max-width: 100%;
  box-sizing: border-box;
}

.form-field .input-field:hover {
  border-radius: 5px 0 0 5px;
}

.form-field.has-checkmark .input-field {
  padding-right: 40px;
}

.form-field .checkmark {
  position: absolute;
  right: 48px;
  top: 50%;
  transform: translateY(-50%);
}

.form-field .checkmark .icon-y {
  width: 18px;
}

.form-field .plus-icon,
.form-field .minus-icon {
  position: absolute;
  right: 76px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  display: flex;
  background: #fff;
  cursor: pointer;
  border-radius: 50%;
  color: var(--primary);
  transition: opacity 0.3s ease-in-out;
  opacity: 0;
}

.form-field:hover .plus-icon,
.form-field:hover .minus-icon {
  opacity: 1;
}

.form-field .plus-icon:hover,
.form-field .minus-icon:hover {
  background: var(--move);
}

.form-field .plus-icon svg,
.form-field .minus-icon svg {
  width: 18px;
  height: 18px;
}

.form-field .spacer {
  display: flex;
  width: 34px;
  height: 46px;
  padding: 9px 10px;
  align-items: center;
  border-radius: 5px;
  position: relative;
  cursor: pointer;
}

.form-field .spacer .play {
  display: flex;
  padding: 13px;
  align-items: center;
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  opacity: 0;
  border-radius: 0 5px 5px 0;
  background: var(--primary, #1B1C20);
  transition: opacity 0.3s ease, right 0.3s ease;
}

.form-field .spacer .play.visible {
  opacity: 1;
  right: -10px;
}

.form-field .spacer .play .icon {
  width: 18px;
  height: 20px;
  flex-shrink: 0;
}

.form-field .spacer:hover .icon {
  filter: brightness(0) invert(1);
}

.form-field .input-field::placeholder {
  color: var(--Main-Colors-Dove, #6A6C6D);
  font-family: Heebo;
  font-size: 20px;
  font-style: normal;
  font-weight: 300;
  line-height: normal;
  letter-spacing: 1px;
}

@media (min-width:1440px) and (max-width:1599px){
  .title{
    font-size: 12px;
  }
  .section{
    min-width: 380px;
  }
}
</style>