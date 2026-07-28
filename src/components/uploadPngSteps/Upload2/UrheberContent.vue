<template>
  <div class="tab-content">
    <div class="frame">
      <!-- Komponist -->
      <div class="section">
        <div class="title">Komponist</div>
        <div
          v-for="(input, index) in komponistInputs"
          :key="'komponist-' + index"
          class="form-field"
          :class="{ 
            'is-hovered': input.isHovered, 
            'has-checkmark': isValidName(input.value)
          }"
          @mouseenter="input.isHovered = true"
          @mouseleave="input.isHovered = false"
        >
          <input
            type="text"
            class="input-field"
            v-model="input.value"
            placeholder="Vor- und Familienname"
            @input="updateKomponistValue(index, $event.target.value)"
          />
          <div v-if="isValidName(input.value)" class="checkmark">
            <img src="@/assets/icons/y.png" class="icon-y" alt="checkmark" />
          </div>
          
          <!-- ✅ Plus icon يظهر عند hover فقط (بدون شرط isValidName) -->
          <div
            v-if="index === 0 "
            class="plus-icon"
            @click="addKomponistInput"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </div>
          
          <div
            v-if="index > 0 "
            class="minus-icon"
            @click="removeKomponistInput(index)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </div>
          
          <div v-if="index === 0" class="spacer" @click="emit('openVideoPopup', 'komponist')">
            <div class="play" :class="{ visible: input.isHovered }">
              <img :src="iconPlay" class="icon" alt="play icon" />
            </div>
          </div>
          <div v-else class="spacer-empty"></div>
        </div>
      </div>

      <!-- Textdichter -->
      <div class="section">
        <div class="title">Textdichter</div>
        <div
          v-for="(input, index) in textdichterInputs"
          :key="'textdichter-' + index"
          class="form-field"
          :class="{ 
            'is-hovered': input.isHovered, 
            'has-checkmark': isValidName(input.value)
          }"
          @mouseenter="input.isHovered = true"
          @mouseleave="input.isHovered = false"
        >
          <input
            type="text"
            class="input-field"
            v-model="input.value"
            placeholder="Vor- und Familienname"
            @input="updateTextdichterValue(index, $event.target.value)"
          />
          <div v-if="isValidName(input.value)" class="checkmark">
            <img src="@/assets/icons/y.png" class="icon-y" alt="checkmark" />
          </div>
          
          <div
            v-if="index === 0"
            class="plus-icon"
            @click="addTextdichterInput"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </div>
          
          <div
            v-if="index > 0 && input.isHovered"
            class="minus-icon"
            @click="removeTextdichterInput(index)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </div>
          
          <div v-if="index === 0" class="spacer" @click="emit('openVideoPopup', 'textdichter')">
            <div class="play" :class="{ visible: input.isHovered }">
              <img :src="iconPlay" class="icon" alt="play icon" />
            </div>
          </div>
          <div v-else class="spacer-empty"></div>
        </div>
      </div>
    </div>

    <div class="frame">
      <!-- Verlag -->
      <div class="section">
        <div class="title">Verlag</div>
        <div
          v-for="(input, index) in verlagInputs"
          :key="'verlag-' + index"
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
          
          <div
            v-if="index === 0 "
            class="plus-icon"
            @click="addVerlagInput"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </div>
          
          <div
            v-if="index > 0 && input.isHovered"
            class="minus-icon"
            @click="removeVerlagInput(index)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </div>
          
          <div v-if="index === 0" class="spacer" @click="emit('openVideoPopup', 'verlag')">
            <div class="play" :class="{ visible: input.isHovered }">
              <img :src="iconPlay" class="icon" alt="play icon" />
            </div>
          </div>
          <div v-else class="spacer-empty"></div>
        </div>
      </div>

      <!-- C-Line -->
      <div class="section">
        <div class="title">C-Line</div>
        <div
          v-for="(input, index) in cLineInputs"
          :key="'cline-' + index"
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
          
          <div
            v-if="index > 0 && input.isHovered"
            class="minus-icon"
            @click="removeCLineInput(index)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </div>
          
          <div v-if="index === 0" class="spacer" @click="emit('openVideoPopup', 'cline')">
            <div class="play" :class="{ visible: input.isHovered }">
              <img :src="iconPlay" class="icon" alt="play icon" />
            </div>
          </div>
          <div v-else class="spacer-empty"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue';
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
  },
  activeTab: {
    type: String,
    default: 'urheber'
  },
  releaseCLine: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['openVideoPopup', 'update:form-data', 'save-song']);

// ──── حالة حفظ البيانات ────
const isSaving = ref(false);
const saveQueue = ref([]);

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



// ──── دوال Autofill لـ Verlag ────
const initializeVerlag = () => {
  if (verlagInputs.value.length === 1 && 
      (!verlagInputs.value[0].value || verlagInputs.value[0].value.trim() === '')) {
    verlagInputs.value[0].value = 'Copyright Control';
    updateVerlagValue(0, 'Copyright Control');
    console.log('📌 Verlag initialized with Copyright Control');
  }
};

// ──── دالة تهيئة C-Line من الـ Release ────
const initializeCLineFromRelease = () => {
  if (props.releaseCLine && props.releaseCLine.trim() !== '') {
    const currentValues = cLineInputs.value.map(i => i.value);
    const releaseCLineValue = props.releaseCLine.trim();
    
    if (!currentValues.includes(releaseCLineValue)) {
      cLineInputs.value = [{ value: releaseCLineValue, isHovered: false }];
      previousValues.value.c_line = [releaseCLineValue];
      console.log('📌 C-Line initialized from Release:', releaseCLineValue);
    }
  }
};

// في UrheberContent.vue
const isTabComplete = (tabId) => {
  if (tabId !== 'urheber') return true;
  
  // ✅ التحقق من Komponist - يجب أن يكون لدينا على الأقل اسم واحد صالح
  const komponistValid = komponistInputs.value.some(input => 
    input.value && input.value.trim() !== '' && isValidName(input.value)
  );
  
  // ✅ التحقق من Textdichter - يجب أن يكون لدينا على الأقل اسم واحد صالح
  const textdichterValid = textdichterInputs.value.some(input => 
    input.value && input.value.trim() !== '' && isValidName(input.value)
  );
  
  // ✅ التحقق من Verlag - يجب أن يكون لدينا على الأقل قيمة واحدة غير فارغة
  const verlagValid = verlagInputs.value.some(input => 
    input.value && input.value.trim() !== ''
  );
  
  // ✅ التحقق من C-Line - يجب أن يكون لدينا على الأقل قيمة واحدة غير فارغة
  const cLineValid = cLineInputs.value.some(input => 
    input.value && input.value.trim() !== ''
  );
  
  const isComplete = komponistValid && textdichterValid && verlagValid && cLineValid;
  
  console.log(`📌 [UrheberContent] isTabComplete: ${isComplete}`);
  console.log(`   - Komponist valid: ${komponistValid}`);
  console.log(`   - Textdichter valid: ${textdichterValid}`);
  console.log(`   - Verlag valid: ${verlagValid}`);
  console.log(`   - C-Line valid: ${cLineValid}`);
  
  return isComplete;
};

// دالة التحقق من صحة الاسم (4 أحرف على الأقل + مسافة)
const isValidName = (value) => {
  if (!value || value.trim() === '') return false;
  const trimmed = value.trim();
  const lettersOnly = trimmed.replace(/\s/g, '');
  return lettersOnly.length >= 4 && trimmed.includes(' ');
};
// ========== ✅ دالة إرسال تحديث الاكتمال ==========
const emitTabCompletion = () => {
  const isComplete = isTabComplete('urheber');
  console.log('📌 [UrheberContent] Emitting tab completion:', isComplete);
  
  emit('update:form-data', {
    tab: 'urheber',
    data: { isComplete }
  });
};

// ──── تحديث البيانات من props ────
const updateFromProps = () => {
  if (!props.currentSong?.uuid) return;

  console.log('🔄 UrheberContent: تحديث من currentSong', props.currentSong);

  // ✅ Komponist
  if (props.currentSong.authors?.composer && props.currentSong.authors.composer.length > 0) {
    const composerArray = Array.isArray(props.currentSong.authors.composer) 
      ? props.currentSong.authors.composer 
      : [props.currentSong.authors.composer];
    
    const currentValues = komponistInputs.value.map(i => i.value);
    if (JSON.stringify(currentValues) !== JSON.stringify(composerArray)) {
      komponistInputs.value = composerArray.map(value => ({ value: value || '', isHovered: false }));
    }
    previousValues.value.komponist = [...composerArray];
  } else {
    komponistInputs.value = [{ value: '', isHovered: false }];
    previousValues.value.komponist = [];
  }

  // ✅ Textdichter
  if (props.currentSong.authors?.lyricist && props.currentSong.authors.lyricist.length > 0) {
    const lyricistArray = Array.isArray(props.currentSong.authors.lyricist) 
      ? props.currentSong.authors.lyricist 
      : [props.currentSong.authors.lyricist];
    
    const currentValues = textdichterInputs.value.map(i => i.value);
    if (JSON.stringify(currentValues) !== JSON.stringify(lyricistArray)) {
      textdichterInputs.value = lyricistArray.map(value => ({ value: value || '', isHovered: false }));
    }
    previousValues.value.textdichter = [...lyricistArray];
  } else {
    textdichterInputs.value = [{ value: '', isHovered: false }];
    previousValues.value.textdichter = [];
  }

  // ✅ Verlag
  if (props.currentSong.authors?.verlog && props.currentSong.authors.verlog.length > 0) {
    const verlogArray = Array.isArray(props.currentSong.authors.verlog) 
      ? props.currentSong.authors.verlog 
      : [props.currentSong.authors.verlog];
    
    const currentValues = verlagInputs.value.map(i => i.value);
    if (JSON.stringify(currentValues) !== JSON.stringify(verlogArray)) {
      verlagInputs.value = verlogArray.map(value => ({ value: value || '', isHovered: false }));
    }
    previousValues.value.verlag = [...verlogArray];
  } else {
    if (!verlagInputs.value[0]?.value || verlagInputs.value[0].value.trim() === '') {
      verlagInputs.value = [{ value: 'Copyright Control', isHovered: false }];
      previousValues.value.verlag = ['Copyright Control'];
    }
  }

  // ✅ C-Line
  initializeCLineFromRelease();
  
  if (props.currentSong.authors?.c_line && props.currentSong.authors.c_line.length > 0) {
    const cLineArray = Array.isArray(props.currentSong.authors.c_line) 
      ? props.currentSong.authors.c_line 
      : [props.currentSong.authors.c_line];
    
    const currentValues = cLineInputs.value.map(i => i.value);
    if (JSON.stringify(currentValues) !== JSON.stringify(cLineArray)) {
      cLineInputs.value = cLineArray.map(value => ({ value: value || '', isHovered: false }));
    }
    previousValues.value.c_line = [...cLineArray];
  } else if (!props.releaseCLine || props.releaseCLine.trim() === '') {
    cLineInputs.value = [{ value: '', isHovered: false }];
    previousValues.value.c_line = [];
  }

  setTimeout(() => {
    emitTabCompletion();
  }, 100);
};

// ──── دالة معالجة نجاح الحفظ ────
const handleSaveComplete = (event) => {
  const { success, songUuid, error } = event.detail || {};
  
  if (success) {
    console.log('✅ UrheberContent: تم استلام إشارة نجاح الحفظ للأغنية:', songUuid);
  } else {
    console.warn('⚠️ UrheberContent: فشل الحفظ:', error);
  }
  
  isSaving.value = false;
  
  setTimeout(() => {
    if (saveQueue.value.length > 0) {
      console.log(`📦 UrheberContent: معالجة ${saveQueue.value.length} عناصر في قائمة الانتظار`);
      processSaveQueue();
    }
  }, 200);
};

// ──── دالة معالجة قائمة الانتظار ────
const processSaveQueue = () => {
  if (saveQueue.value.length === 0) {
    isSaving.value = false;
    console.log('✅ UrheberContent: جميع التغييرات تم حفظها');
    return;
  }
  
  const latestSave = saveQueue.value.pop();
  saveQueue.value = [];
  
  const payload = {};
  let hasChanges = false;
  
  if (JSON.stringify(latestSave.komponist) !== JSON.stringify(previousValues.value.komponist)) {
    payload['authors'] = payload['authors'] || {};
    payload['authors']['composer'] = latestSave.komponist;
    hasChanges = true;
  }
  
  if (JSON.stringify(latestSave.textdichter) !== JSON.stringify(previousValues.value.textdichter)) {
    payload['authors'] = payload['authors'] || {};
    payload['authors']['lyricist'] = latestSave.textdichter;
    hasChanges = true;
  }
  
  if (JSON.stringify(latestSave.verlag) !== JSON.stringify(previousValues.value.verlag)) {
    payload['authors'] = payload['authors'] || {};
    payload['authors']['verlog'] = latestSave.verlag;
    hasChanges = true;
  }
  
  if (JSON.stringify(latestSave.c_line) !== JSON.stringify(previousValues.value.c_line)) {
    payload['authors'] = payload['authors'] || {};
    payload['authors']['c_line'] = latestSave.c_line;
    hasChanges = true;
  }
  
  if (!hasChanges) {
    isSaving.value = false;
    return;
  }
  
  if (payload['authors'] && Object.keys(payload['authors']).length === 0) {
    delete payload['authors'];
  }
  
  previousValues.value = {
    komponist: [...latestSave.komponist],
    textdichter: [...latestSave.textdichter],
    verlag: [...latestSave.verlag],
    c_line: [...latestSave.c_line]
  };
  
  isSaving.value = true;
  emit('save-song', payload);
};

// ──── دالة إرسال التحديثات ────
const sendUpdate = () => {
  if (!props.currentSong?.uuid) {
    console.warn('⚠️ UrheberContent: لا يوجد UUID للأغنية');
    return;
  }

  if (isSaving.value) {
    const dataToSave = {
      komponist: komponistInputs.value
        .map(input => (input.value || '').trim())
        .filter(value => value !== ''),
      textdichter: textdichterInputs.value
        .map(input => (input.value || '').trim())
        .filter(value => value !== ''),
      verlag: verlagInputs.value
        .map(input => (input.value || '').trim())
        .filter(value => value !== ''),
      c_line: cLineInputs.value
        .map(input => (input.value || '').trim())
        .filter(value => value !== '')
    };
    
    const isDuplicate = saveQueue.value.some(item => 
      JSON.stringify(item) === JSON.stringify(dataToSave)
    );
    
    if (!isDuplicate) {
      saveQueue.value.push(dataToSave);
    }
    return;
  }

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

  if (JSON.stringify(currentKomponist) !== JSON.stringify(previousValues.value.komponist)) {
    payload['authors'] = payload['authors'] || {};
    payload['authors']['composer'] = currentKomponist;
    hasChanges = true;
  }

  if (JSON.stringify(currentTextdichter) !== JSON.stringify(previousValues.value.textdichter)) {
    payload['authors'] = payload['authors'] || {};
    payload['authors']['lyricist'] = currentTextdichter;
    hasChanges = true;
  }

  if (JSON.stringify(currentVerlag) !== JSON.stringify(previousValues.value.verlag)) {
    payload['authors'] = payload['authors'] || {};
    payload['authors']['verlog'] = currentVerlag;
    hasChanges = true;
  }

  if (JSON.stringify(currentCLine) !== JSON.stringify(previousValues.value.c_line)) {
    payload['authors'] = payload['authors'] || {};
    payload['authors']['c_line'] = currentCLine;
    hasChanges = true;
  }

  if (!hasChanges) {
    console.log('ℹ️ UrheberContent: لا توجد تغييرات');
    isSaving.value = false;
    return;
  }

  if (payload['authors'] && Object.keys(payload['authors']).length === 0) {
    delete payload['authors'];
  }

  console.log('📤 UrheberContent: إرسال التغييرات:', payload);
  
  previousValues.value = {
    komponist: [...currentKomponist],
    textdichter: [...currentTextdichter],
    verlag: [...currentVerlag],
    c_line: [...currentCLine]
  };

  isSaving.value = true;
  emit('save-song', payload);
};

const debouncedSendUpdate = debounce(() => {
  sendUpdate();
}, 1200);

// ──── دوال إدارة Komponist ────
const updateKomponistValue = (index, value) => {
  if (komponistInputs.value[index]) {
    komponistInputs.value[index].value = value || '';
    debouncedSendUpdate();
    setTimeout(() => emitTabCompletion(), 300);
  }
};

// ✅ دالة الإضافة - تعمل بشكل مباشر ومتكرر
const addKomponistInput = () => {
  komponistInputs.value.push({ value: '', isHovered: false });
  // تعيين isHovered على العنصر الجديد فوراً
  const newIndex = komponistInputs.value.length - 1;
  komponistInputs.value[newIndex].isHovered = true;
  // إزالة isHovered من جميع العناصر الأخرى
  komponistInputs.value.forEach((item, i) => {
    if (i !== newIndex) {
      item.isHovered = false;
    }
  });
  if (!isSaving.value) debouncedSendUpdate();
  setTimeout(() => emitTabCompletion(), 300);
};

// ✅ دالة الحذف - تعمل بشكل مباشر ومتكرر
const removeKomponistInput = (index) => {
  if (komponistInputs.value.length > 1) {
    komponistInputs.value.splice(index, 1);
    // تعيين isHovered على العنصر التالي فوراً
    if (komponistInputs.value[index]) {
      komponistInputs.value[index].isHovered = true;
      komponistInputs.value.forEach((item, i) => {
        if (i !== index) {
          item.isHovered = false;
        }
      });
    } else if (komponistInputs.value.length > 0) {
      const lastIndex = komponistInputs.value.length - 1;
      komponistInputs.value[lastIndex].isHovered = true;
      komponistInputs.value.forEach((item, i) => {
        if (i !== lastIndex) {
          item.isHovered = false;
        }
      });
    }
    if (!isSaving.value) debouncedSendUpdate();
  }
  setTimeout(() => emitTabCompletion(), 300);
};

// ──── دوال إدارة Textdichter ────
const updateTextdichterValue = (index, value) => {
  if (textdichterInputs.value[index]) {
    textdichterInputs.value[index].value = value || '';
    debouncedSendUpdate();
    setTimeout(() => emitTabCompletion(), 300);
  }
};

const addTextdichterInput = () => {
  textdichterInputs.value.push({ value: '', isHovered: false });
  const newIndex = textdichterInputs.value.length - 1;
  textdichterInputs.value[newIndex].isHovered = true;
  textdichterInputs.value.forEach((item, i) => {
    if (i !== newIndex) {
      item.isHovered = false;
    }
  });
  if (!isSaving.value) debouncedSendUpdate();
  setTimeout(() => emitTabCompletion(), 300);
};

const removeTextdichterInput = (index) => {
  if (textdichterInputs.value.length > 1) {
    textdichterInputs.value.splice(index, 1);
    if (textdichterInputs.value[index]) {
      textdichterInputs.value[index].isHovered = true;
      textdichterInputs.value.forEach((item, i) => {
        if (i !== index) {
          item.isHovered = false;
        }
      });
    } else if (textdichterInputs.value.length > 0) {
      const lastIndex = textdichterInputs.value.length - 1;
      textdichterInputs.value[lastIndex].isHovered = true;
      textdichterInputs.value.forEach((item, i) => {
        if (i !== lastIndex) {
          item.isHovered = false;
        }
      });
    }
    if (!isSaving.value) debouncedSendUpdate();
  }
  setTimeout(() => emitTabCompletion(), 300);
};

// ──── دوال إدارة Verlag ────
const updateVerlagValue = (index, value) => {
  if (verlagInputs.value[index]) {
    verlagInputs.value[index].value = value || '';
    debouncedSendUpdate();
    setTimeout(() => emitTabCompletion(), 300);
  }
};

const addVerlagInput = () => {
  verlagInputs.value.push({ value: '', isHovered: false });
  const newIndex = verlagInputs.value.length - 1;
  verlagInputs.value[newIndex].isHovered = true;
  verlagInputs.value.forEach((item, i) => {
    if (i !== newIndex) {
      item.isHovered = false;
    }
  });
  if (!isSaving.value) debouncedSendUpdate();
  setTimeout(() => emitTabCompletion(), 300);
};

const removeVerlagInput = (index) => {
  if (verlagInputs.value.length > 1) {
    verlagInputs.value.splice(index, 1);
    if (verlagInputs.value[index]) {
      verlagInputs.value[index].isHovered = true;
      verlagInputs.value.forEach((item, i) => {
        if (i !== index) {
          item.isHovered = false;
        }
      });
    } else if (verlagInputs.value.length > 0) {
      const lastIndex = verlagInputs.value.length - 1;
      verlagInputs.value[lastIndex].isHovered = true;
      verlagInputs.value.forEach((item, i) => {
        if (i !== lastIndex) {
          item.isHovered = false;
        }
      });
    }
    if (!isSaving.value) debouncedSendUpdate();
  }
  setTimeout(() => emitTabCompletion(), 300);
};

// ──── دوال إدارة C-Line ────
const updateCLineValue = (index, value) => {
  if (cLineInputs.value[index]) {
    cLineInputs.value[index].value = value || '';
    debouncedSendUpdate();
    setTimeout(() => emitTabCompletion(), 300);
  }
};

const addCLineInput = () => {
  cLineInputs.value.push({ value: '', isHovered: false });
  const newIndex = cLineInputs.value.length - 1;
  cLineInputs.value[newIndex].isHovered = true;
  cLineInputs.value.forEach((item, i) => {
    if (i !== newIndex) {
      item.isHovered = false;
    }
  });
  if (!isSaving.value) debouncedSendUpdate();
  setTimeout(() => emitTabCompletion(), 300);
};

const removeCLineInput = (index) => {
  if (cLineInputs.value.length > 1) {
    cLineInputs.value.splice(index, 1);
    if (cLineInputs.value[index]) {
      cLineInputs.value[index].isHovered = true;
      cLineInputs.value.forEach((item, i) => {
        if (i !== index) {
          item.isHovered = false;
        }
      });
    } else if (cLineInputs.value.length > 0) {
      const lastIndex = cLineInputs.value.length - 1;
      cLineInputs.value[lastIndex].isHovered = true;
      cLineInputs.value.forEach((item, i) => {
        if (i !== lastIndex) {
          item.isHovered = false;
        }
      });
    }
    if (!isSaving.value) debouncedSendUpdate();
  }
  setTimeout(() => emitTabCompletion(), 300);
};

// ──── مراقبة تغييرات currentSong ────
watch(() => props.currentSong, (newSong, oldSong) => {
  if (newSong?.uuid === oldSong?.uuid && oldSong) {
    console.log('⏭️ UrheberContent: تخطي watch (نفس UUID)');
    return;
  }
  
  if (newSong?.uuid) {
    if (newSong.authors?.composer) {
      previousValues.value.komponist = [...newSong.authors.composer];
    }
    if (newSong.authors?.lyricist) {
      previousValues.value.textdichter = [...newSong.authors.lyricist];
    }
    if (newSong.authors?.verlog) {
      previousValues.value.verlag = [...newSong.authors.verlog];
    }
    if (newSong.authors?.c_line) {
      previousValues.value.c_line = [...newSong.authors.c_line];
    }
    updateFromProps();
  }
}, { deep: true, immediate: true });

// ──── مراقبة تغييرات releaseCLine ────
watch(() => props.releaseCLine, (newCLine) => {
  if (newCLine && newCLine.trim() !== '') {
    const currentValues = cLineInputs.value.map(i => i.value);
    if (!currentValues.includes(newCLine.trim())) {
      cLineInputs.value = [{ value: newCLine.trim(), isHovered: false }];
      previousValues.value.c_line = [newCLine.trim()];
      console.log('📌 C-Line updated from Release:', newCLine);
      emitTabCompletion();
    }
  }
}, { immediate: true });

// ──── دورة الحياة ────
onMounted(() => {
  console.log('🚀 UrheberContent: تم التحميل');
  updateFromProps();
  initializeVerlag();
  window.addEventListener('save-song-complete', handleSaveComplete);
});

onUnmounted(() => {
  console.log('🗑️ UrheberContent: تم إزالة المكون');
  window.removeEventListener('save-song-complete', handleSaveComplete);
  
  if (debouncedSendUpdate.cancel) {
    debouncedSendUpdate.cancel();
  }
  
  if (saveQueue.value.length > 0) {
    if (!isSaving.value) {
      processSaveQueue();
    }
  }
});

// ========== ✅ تصدير الدوال ==========
defineExpose({
  isTabComplete
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

/* ✅ أيقونات تظهر عند hover مع z-index عالي */
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
  transition: opacity 0.2s ease-in-out;
  opacity: 0;
  z-index: 10;
  align-items: center;
  justify-content: center;
}

/* ✅ تظهر عند hover على الحقل */
.form-field:hover .plus-icon,
.form-field:hover .minus-icon {
  opacity: 1;
}

/* ✅ تظهر أيضاً عندما يكون isHovered = true */
.form-field.is-hovered .plus-icon,
.form-field.is-hovered .minus-icon {
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

.form-field .spacer-empty {
  display: flex;
  width: 34px;
  height: 46px;
  padding: 9px 10px;
  align-items: center;
  border-radius: 5px;
  position: relative;
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