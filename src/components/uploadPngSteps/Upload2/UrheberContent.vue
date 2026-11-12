<template>
  <div class="tab-content">
    <div class="frame">
      <!-- Komponist -->
      <div class="section" >
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
            :class="{ 'is-correction': isSongCorrected('authors') }"
            v-model="input.value"
            placeholder="Vor- und Familienname"
            @input="updateKomponistValue(index, $event.target.value)"
          />
          <div v-if="isValidName(input.value)" class="checkmark">
            <img src="@/assets/icons/y.png" class="icon-y" alt="checkmark" />
          </div>
          
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

      <!-- Textdichter — يُعطَّل عند نوع instrumental (لا نصوص → لا كاتب نصوص) -->
      <div class="section" >
        <div class="title">Textdichter</div>
        <div
          v-for="(input, index) in textdichterInputs"
          :key="'textdichter-' + index"
          class="form-field"
          :class="{
            'is-hovered': input.isHovered,
            'has-checkmark': isValidName(input.value),
           
          }"
          @mouseenter="input.isHovered = true"
          @mouseleave="input.isHovered = false"
        >
          <input
            type="text"
            class="input-field"
            :class="{ 'section-disabled': isInstrumental,
            'is-correction': isSongCorrected('authors')}"
            v-model="input.value"
            placeholder="Vor- und Familienname"
            :disabled="isInstrumental"
            @input="updateTextdichterValue(index, $event.target.value)"
          />
          <div v-if="isValidName(input.value)" class="checkmark">
            <img src="@/assets/icons/y.png" class="icon-y" alt="checkmark" />
          </div>
          
          <div
            v-if="index === 0 "
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
      <div class="section" >
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
            :class="{ 'is-correction': isSongCorrected('authors') }"
            @input="updateVerlagValue(index, $event.target.value)"
          />
          <div v-if="input.value && input.value.trim() !== ''" class="checkmark">
            <img src="@/assets/icons/y.png" class="icon-y" alt="checkmark" />
          </div>
          
          <div
            v-if="index === 0"
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
      <div class="section" >
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
            :class="{ 'is-correction': isSongCorrected('authors') }"
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
import { ref, computed, watch, onMounted, onUnmounted, onDeactivated, nextTick } from 'vue';
import { useCorrections } from '@/composables/useCorrections';
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

// حقول مطلوب تصحيحها (Korrektur) → بوردر أحمر.
const { isSongCorrected } = useCorrections(() => props.currentSong?.uuid);

const emit = defineEmits(['openVideoPopup', 'update:form-data', 'save-song']);

// ✅ نوع instrumental (لا نصوص) → يُعطَّل Textdichter ولا يُطلَب للاكتمال.
const isInstrumental = computed(() =>
  String(props.currentSong?.song_type || props.currentSong?.song_typ || '').includes('instrumental')
);

// عند التحوّل إلى instrumental (أو عند فتح أغنية instrumental أصلاً): نُفرّغ Textdichter
// (lyricist) ونحفظ المصفوفة فارغة — لا كاتب نصوص لأغنية بلا نصوص.
watch(isInstrumental, (val) => {
  if (!val) return;
  const hadValue = textdichterInputs.value.some(i => i.value && i.value.trim() !== '');
  textdichterInputs.value = [{ value: '', isHovered: false }];
  if (hadValue && props.currentSong?.uuid) {
    markEdited();
    debouncedSendUpdate();
  }
});
// ملاحظة: بلا immediate عمداً — textdichterInputs يُعرَّف بعد هذا المراقب، فتشغيله فوراً
//   يسبب TDZ. حالة "الأغنية instrumental منذ الفتح" يغطّيها الحارس داخل updateFromProps.

// ──── حالة حفظ البيانات ────
const isSaving = ref(false);
const saveQueue = ref([]);
let savingTimeout = null;

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

// ──── حارس التعديلات غير المحفوظة ────
// عند كتابة المستخدم تُضبط hasUnsavedEdits = true فتُمنَع updateFromProps ودوال
// المزامنة من الكتابة فوق الحقول بقيم الخادم (التي قد تكون أقدم من ما كتبه المستخدم
// للتو) أثناء دورة الحفظ أو أثناء تصفير/إعادة تحميل currentSong بفعل التنقل.
// lastLoadedUuid يُميّز "إعادة تحميل نفس الأغنية" (لا نكتب فوقها) عن "التبديل لأغنية
// أخرى" (نحمّلها بالكامل). يُصفّى الحارس فقط بعد نجاح الحفظ وخلوّ قائمة الانتظار.
const hasUnsavedEdits = ref(false);
const lastLoadedUuid = ref(null);

const markEdited = () => {
  hasUnsavedEdits.value = true;
};



// ──── دوال Autofill لـ Verlag ────
const initializeVerlag = () => {
  if (verlagInputs.value.length === 1 && 
      (!verlagInputs.value[0].value || verlagInputs.value[0].value.trim() === '')) {
    verlagInputs.value[0].value = 'Copyright Control';
    updateVerlagValue(0, 'Copyright Control');
    console.log('📌 Verlag initialized with Copyright Control');
  }
};

// ──── مزامنة Textdichter من الأغنية ────
//   نظير syncVerlagFromSong / syncCLineFromSources، وكان غائباً — فلم يكن هناك أي مسار
//   يُفرّغ حقل Textdichter عندما يمسح الخادم lyricist (عند التحوّل إلى instrumental).
//   فيبقى الحقل يعرض القيمة القديمة، ويعتبرها isTabComplete صالحة، فتظهر urheber
//   "مكتملة" رغم أن بيانات الأغنية تقول العكس.
const syncTextdichterFromSong = (newLyricist) => {
  const incoming = Array.isArray(newLyricist)
    ? newLyricist.map(v => (v == null ? '' : String(v).trim())).filter(v => v !== '')
    : [];
  const shown = textdichterInputs.value
    .map(i => (i.value == null ? '' : String(i.value).trim()))
    .filter(v => v !== '');

  if (JSON.stringify(incoming) === JSON.stringify(shown)) return;

  // ✅ الخادم فرّغ القائمة → نُفرّغ الحقل دائماً (حتى لو كان معطّلاً بسبب instrumental).
  if (incoming.length === 0) {
    if (shown.length > 0) {
      textdichterInputs.value = [{ value: '', isHovered: false }];
      previousValues.value.textdichter = [];
      console.log('🧹 UrheberContent: الخادم فرّغ lyricist → تفريغ حقل Textdichter');
    }
    return;
  }

  // ✅ قيمة قادمة من الخادم: لا نكتب فوق ما يكتبه المستخدم الآن.
  if (hasUnsavedEdits.value) return;
  textdichterInputs.value = incoming.map(v => ({ value: v, isHovered: false }));
  previousValues.value.textdichter = [...incoming];
};

// ──── دالة تهيئة C-Line من الـ Release ────
const initializeCLineFromRelease = () => {
  if (props.releaseCLine && props.releaseCLine.trim() !== '') {
    const currentValues = cLineInputs.value.map(i => i.value);
    const releaseCLineValue = props.releaseCLine.trim();
    
    if (!currentValues.includes(releaseCLineValue)) {
      cLineInputs.value = [{ value: releaseCLineValue, isHovered: false }];
      previousValues.value.c_line = [];
      // ✅ إرسال التحديث فوراً بعد تعيين القيمة
      if (props.currentSong?.uuid) {
        console.log('📌 C-Line initialized from Release, sending update:', releaseCLineValue);
        debouncedSendUpdate();
      }
      console.log('📌 C-Line initialized from Release:', releaseCLineValue);
    }
  }
};

// ──── دالة تهيئة C-Line من مصادر متعددة ────
const syncCLineFromSources = (newCLineFromSong) => {
  // ملاحظة: لا نضع حارس hasUnsavedEdits العام هنا. هذه الدالة تملأ/تزامن حقل C-Line فقط
  //   ولديها حمايتها الخاصة (لا تلمس قيمة أدخلها المستخدم). الحارس العام كان يمنع
  //   autofill الـ C-Line عند تعديل حقل آخر (Komponist/Textdichter) فتظهر C-Line فارغة.
  const cLineArray = Array.isArray(newCLineFromSong) ? newCLineFromSong : [];
  const currentValues = cLineInputs.value.map(i => i.value);

  // 1. إذا كانت هناك قيمة من الأغنية، استخدمها
  if (cLineArray.length > 0) {
    if (JSON.stringify(currentValues) !== JSON.stringify(cLineArray)) {
      cLineInputs.value = cLineArray.map(value => ({ value: value || '', isHovered: false }));
      previousValues.value.c_line = [...cLineArray];
      emitTabCompletion();
    } else {
      previousValues.value.c_line = [...cLineArray];
    }
    return;
  }

  // 2. إذا لم تكن هناك قيمة من الأغنية، استخدم قيمة الـ Release
  const releaseCLineValue = props.releaseCLine?.trim() || '';
  if (releaseCLineValue) {
    // ✅ تحقق مما إذا كانت القيمة الحالية مختلفة عن قيمة الـ Release
    const hasReleaseValue = currentValues.some(v => v === releaseCLineValue);
    const hasOtherValues = currentValues.some(v => v && v.trim() !== '' && v !== releaseCLineValue);
    
    // إذا كانت هناك قيم أخرى غير قيمة الـ Release، لا نغيرها
    if (hasOtherValues) {
      console.log('📌 C-Line has other values, keeping them');
      return;
    }
    
    // إذا كانت القيمة الحالية مختلفة عن قيمة الـ Release
    if (!hasReleaseValue || currentValues.length === 0 || (currentValues.length === 1 && currentValues[0] === '')) {
      cLineInputs.value = [{ value: releaseCLineValue, isHovered: false }];
      previousValues.value.c_line = [];
      // ✅ إرسال التحديث فوراً
      if (props.currentSong?.uuid) {
        console.log('📌 C-Line synced from Release, sending update:', releaseCLineValue);
        debouncedSendUpdate();
      }
      emitTabCompletion();
      return;
    }
    
    // القيمة معروضة بالفعل في الحقل. لكن يجب ألا نعتبرها "محفوظة" إلا إذا كانت
    // موجودة فعلاً على الأغنية في الـ backend. وإلا فإن القيمة المعبّأة تلقائياً من
    // الـ Release تبقى غير محفوظة (previousValues == القيمة الحالية → لا يُرسل شيء).
    const songHasCLine = Array.isArray(props.currentSong?.authors?.c_line) &&
      props.currentSong.authors.c_line.some(v => (v || '').trim() === releaseCLineValue);

    if (!songHasCLine && props.currentSong?.uuid) {
      // معبّأة تلقائياً لكنها غير محفوظة بعد → أجبر الحفظ (debounce يمنع التكرار).
      previousValues.value.c_line = [];
      debouncedSendUpdate();
    } else if (previousValues.value.c_line.length === 0) {
      previousValues.value.c_line = [releaseCLineValue];
    }
    return;
  }

  // 3. إذا كانت جميع الحقول فارغة
  if (currentValues.some(value => value && value.trim() !== '')) {
    cLineInputs.value = [{ value: '', isHovered: false }];
    previousValues.value.c_line = [];
    emitTabCompletion();
  }
};

const syncVerlagFromSong = (newVerlog) => {
  // لا حارس عام هنا: الدالة تخصّ حقل Verlag فقط ولا تلمس قيمة أدخلها المستخدم.
  const verlogArray = Array.isArray(newVerlog) ? newVerlog : [];
  const currentValues = verlagInputs.value.map(i => i.value);

  if (verlogArray.length > 0) {
    if (JSON.stringify(currentValues) !== JSON.stringify(verlogArray)) {
      verlagInputs.value = verlogArray.map(value => ({ value: value || '', isHovered: false }));
      previousValues.value.verlag = [...verlogArray];
      emitTabCompletion();
    } else {
      previousValues.value.verlag = [...verlogArray];
    }
    return;
  }

  if (!verlagInputs.value[0]?.value || verlagInputs.value[0].value.trim() === '') {
    verlagInputs.value = [{ value: 'Copyright Control', isHovered: false }];
    previousValues.value.verlag = [];
    if (props.currentSong?.uuid) debouncedSendUpdate();
    emitTabCompletion();
  } else if (previousValues.value.verlag.length > 0) {
    previousValues.value.verlag = [];
  }
};



// في UrheberContent.vue
const isTabComplete = (tabId) => {
  if (tabId !== 'urheber') return true;
  
  const komponistValid = komponistInputs.value.length > 0 && komponistInputs.value.every(input => isValidName(input.value));

  // ✅ عند instrumental لا يُطلَب Textdichter (لا نصوص).
  const textdichterValid = isInstrumental.value ||
    (textdichterInputs.value.length > 0 && textdichterInputs.value.every(input => isValidName(input.value)));

  const verlagValid = verlagInputs.value.length > 0 && verlagInputs.value.every(input =>
    input.value && input.value.trim() !== ''
  );

  const cLineValid = cLineInputs.value.length > 0 && cLineInputs.value.every(input =>
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

  // ✅ لا نكتب فوق حقول يعدّلها المستخدم حالياً ولم تُحفَظ بعد.
  if (hasUnsavedEdits.value) {
    console.log('⏭️ UrheberContent: تخطي updateFromProps (توجد تعديلات غير محفوظة)');
    return;
  }

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
  //    نوع instrumental (لا نصوص): الحقل معطّل ولا يُطلَب — نُبقيه فارغاً دائماً ولا نعيد
  //    تعبئته من الخادم. وإن كان الخادم ما يزال يحمل قيماً قديمة (أغنية كانت غنائية ثم
  //    تحوّلت) نجدول حفظاً يُرسل lyricist: [] كي تتطابق البيانات مع حالة الواجهة.
  if (isInstrumental.value) {
    const serverLyricist = Array.isArray(props.currentSong.authors?.lyricist)
      ? props.currentSong.authors.lyricist.filter(v => v && String(v).trim() !== '')
      : [];

    textdichterInputs.value = [{ value: '', isHovered: false }];

    if (serverLyricist.length > 0 && props.currentSong?.uuid) {
      // previousValues يبقى بالقيم القديمة كي يُحتسب التغيير ويُرسل المصفوفة الفارغة.
      previousValues.value.textdichter = [...serverLyricist];
      console.log('🎼 UrheberContent: instrumental → تفريغ Textdichter وحفظ lyricist فارغة');
      markEdited();
      debouncedSendUpdate();
    } else {
      previousValues.value.textdichter = [];
    }
  } else if (props.currentSong.authors?.lyricist && props.currentSong.authors.lyricist.length > 0) {
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
      // ✅ القيمة الافتراضية معروضة فقط وغير محفوظة بعد → نترك previousValues فارغة ليُرسلها sendUpdate ويحفظها.
      previousValues.value.verlag = [];
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

  // ✅ حفظ القيم المعروضة تلقائياً (Verlag الافتراضي و C-Line من الـ Release) إن لم تكن محفوظة بعد.
  //    sendUpdate يتخطى تلقائياً عند عدم وجود فرق، لذا لا يحدث حفظ زائد للأغاني المحفوظة مسبقاً.
  if (props.currentSong?.uuid) {
    debouncedSendUpdate();
  }

  lastLoadedUuid.value = props.currentSong.uuid;

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

  if (savingTimeout) {
    clearTimeout(savingTimeout);
    savingTimeout = null;
  }
  isSaving.value = false;

  setTimeout(() => {
    if (saveQueue.value.length > 0) {
      console.log(`📦 UrheberContent: معالجة ${saveQueue.value.length} عناصر في قائمة الانتظار`);
      processSaveQueue();
    } else if (success) {
      // ✅ حُفظ كل شيء ولا يوجد ما ينتظر → أصبح المحلي = الخادم، فنسقط الحارس بأمان.
      hasUnsavedEdits.value = false;
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
  const prev = previousValues.value;

  // ✅ اكتشاف أي تغيير في أي حقل من حقول authors
  const authorsChanged =
    JSON.stringify(latestSave.komponist) !== JSON.stringify(prev.komponist || []) ||
    JSON.stringify(latestSave.textdichter) !== JSON.stringify(prev.textdichter || []) ||
    JSON.stringify(latestSave.verlag) !== JSON.stringify(prev.verlag || []) ||
    JSON.stringify(latestSave.c_line) !== JSON.stringify(prev.c_line || []);

  // ✅ لقطة كاملة لكل حقول authors عند أي تغيير (نفس منطق sendUpdate). نُرسل كل الحقول
  //   دائماً — بما فيها الفارغة — لأن الـ backend يستبدل كائن authors بالكامل، فلا يُفقَد
  //   أي حقل أدخله المستخدم.
  if (authorsChanged) {
    hasChanges = true;
    payload['authors'] = {
      composer: latestSave.komponist,
      lyricist: latestSave.textdichter,
      verlog: latestSave.verlag,
      c_line: latestSave.c_line
    };
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
  if (savingTimeout) clearTimeout(savingTimeout);
  savingTimeout = setTimeout(() => {
    console.warn('⚠️ UrheberContent: isSaving safety timeout (processSaveQueue)');
    isSaving.value = false;
    savingTimeout = null;
  }, 10000);
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
  const prev = previousValues.value;

  // ✅ التحقق من التغييرات في كل حقل على حدة
  const komponistChanged = JSON.stringify(currentKomponist) !== JSON.stringify(prev.komponist || []);
  const textdichterChanged = JSON.stringify(currentTextdichter) !== JSON.stringify(prev.textdichter || []);
  const verlagChanged = JSON.stringify(currentVerlag) !== JSON.stringify(prev.verlag || []);
  const cLineChanged = JSON.stringify(currentCLine) !== JSON.stringify(prev.c_line || []);

  // ✅ عند أي تغيير نرسل كائن authors كاملاً (composer + lyricist + verlog + c_line).
  //    الـ backend يستبدل كامل authors بما يُرسَل، فإرسال حقل واحد فقط (مثلاً composer)
  //    كان يمسح القيم المعبّأة تلقائياً (verlog / c_line). اللقطة الكاملة تحفظها جميعاً.
  if (komponistChanged || textdichterChanged || verlagChanged || cLineChanged) {
    hasChanges = true;
    payload.authors = {
      composer: currentKomponist,
      lyricist: currentTextdichter,
      verlog: currentVerlag,
      c_line: currentCLine
    };
  }

  if (!hasChanges) {
    console.log('ℹ️ UrheberContent: لا توجد تغييرات');
    isSaving.value = false;
    return;
  }

  console.log('📤 UrheberContent: إرسال التغييرات:', payload);

  // ✅ تحديث previousValues بالكامل
  previousValues.value = {
    komponist: [...currentKomponist],
    textdichter: [...currentTextdichter],
    verlag: [...currentVerlag],
    c_line: [...currentCLine]
  };

  isSaving.value = true;
  if (savingTimeout) clearTimeout(savingTimeout);
  savingTimeout = setTimeout(() => {
    console.warn('⚠️ UrheberContent: isSaving safety timeout (sendUpdate)');
    isSaving.value = false;
    savingTimeout = null;
  }, 10000);
  emit('save-song', payload);
};

const debouncedSendUpdate = debounce(() => {
  sendUpdate();
}, 800);

// ──── دوال إدارة Komponist ────
const updateKomponistValue = (index, value) => {
  if (komponistInputs.value[index]) {
    markEdited();
    komponistInputs.value[index].value = value || '';
    debouncedSendUpdate();
    setTimeout(() => emitTabCompletion(), 300);
  }
};

// ✅ دالة الإضافة - تعمل بشكل مباشر ومتكرر
const addKomponistInput = () => {
  markEdited();
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
  markEdited();
  if (komponistInputs.value.length > 1) {
    komponistInputs.value.splice(index, 1);
    komponistInputs.value.forEach(item => { item.isHovered = false; });
    if (!isSaving.value) debouncedSendUpdate();
  }
  setTimeout(() => emitTabCompletion(), 300);
};

// ──── دوال إدارة Textdichter ────
const updateTextdichterValue = (index, value) => {
  if (textdichterInputs.value[index]) {
    markEdited();
    textdichterInputs.value[index].value = value || '';
    debouncedSendUpdate();
    setTimeout(() => emitTabCompletion(), 300);
  }
};

const addTextdichterInput = () => {
  markEdited();
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
  markEdited();
  if (textdichterInputs.value.length > 1) {
    textdichterInputs.value.splice(index, 1);
    textdichterInputs.value.forEach(item => { item.isHovered = false; });
    if (!isSaving.value) debouncedSendUpdate();
  }
  setTimeout(() => emitTabCompletion(), 300);
};

// ──── دوال إدارة Verlag ────
const updateVerlagValue = (index, value) => {
  if (verlagInputs.value[index]) {
    markEdited();
    verlagInputs.value[index].value = value || '';
    debouncedSendUpdate();
    setTimeout(() => emitTabCompletion(), 300);
  }
};

const addVerlagInput = () => {
  markEdited();
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
  markEdited();
  if (verlagInputs.value.length > 1) {
    verlagInputs.value.splice(index, 1);
    verlagInputs.value.forEach(item => { item.isHovered = false; });
    if (!isSaving.value) debouncedSendUpdate();
  }
  setTimeout(() => emitTabCompletion(), 300);
};

// ──── دوال إدارة C-Line ────
const updateCLineValue = (index, value) => {
  if (cLineInputs.value[index]) {
    markEdited();
    cLineInputs.value[index].value = value || '';
    debouncedSendUpdate();
    setTimeout(() => emitTabCompletion(), 300);
  }
};

const addCLineInput = () => {
  markEdited();
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
  markEdited();
  if (cLineInputs.value.length > 1) {
    cLineInputs.value.splice(index, 1);
    cLineInputs.value.forEach(item => { item.isHovered = false; });
    if (!isSaving.value) debouncedSendUpdate();
  }
  setTimeout(() => emitTabCompletion(), 300);
};

// ──── مراقبة تغييرات currentSong ────
watch(() => props.currentSong, (newSong, oldSong) => {
  const newUuid = newSong?.uuid || null;

  // ✅ نقارن بآخر uuid حُمِّل فعلاً (وليس oldSong فقط)، لأن التنقل يصفّر currentSong
  //    إلى null ثم يعيد نفس الأغنية، فيبدو ذلك كتغيير uuid ويستدعي updateFromProps
  //    الذي يمسح تعديلات المستخدم غير المحفوظة. المقارنة بـ lastLoadedUuid تكشف أنها
  //    نفس الأغنية فنتخطّاها ونحافظ على ما كُتب.
  if (newUuid && newUuid === lastLoadedUuid.value) {
    // ✅ نفس الأغنية: نحمي تعديلات المستخدم غير المحفوظة فلا نُعيد التحميل فوقها.
    //    لكن إن لم تكن هناك تعديلات معلّقة واختلفت authors القادمة عمّا تعرضه الحقول
    //    (مثلاً بعد تفريغ lyricist عند التحوّل إلى instrumental) نُعيد المزامنة — وإلا
    //    بقي الحقل يعرض القيمة القديمة ثم أعاد إرسالها إلى الخادم عند أول حفظ.
    if (!hasUnsavedEdits.value && !isSaving.value) {
      const norm = (list) => (Array.isArray(list) ? list : [])
        .map(v => (v == null ? '' : String(v).trim()))
        .filter(v => v !== '');
      const shown = (inputs) => inputs.value
        .map(i => (i.value == null ? '' : String(i.value).trim()))
        .filter(v => v !== '');

      const incomingAuthors = JSON.stringify({
        composer: norm(newSong?.authors?.composer),
        lyricist: norm(newSong?.authors?.lyricist),
        verlog: norm(newSong?.authors?.verlog),
        c_line: norm(newSong?.authors?.c_line)
      });
      const shownAuthors = JSON.stringify({
        composer: shown(komponistInputs),
        lyricist: shown(textdichterInputs),
        verlog: shown(verlagInputs),
        c_line: shown(cLineInputs)
      });

      if (incomingAuthors !== shownAuthors) {
        console.log('🔄 UrheberContent: نفس الأغنية لكن authors تغيّرت على الخادم → إعادة مزامنة');
        updateFromProps();
        return;
      }
    }

    console.log('⏭️ UrheberContent: تخطي watch (نفس الأغنية المحمّلة)');
    return;
  }

  if (newSong?.uuid) {
    // تبديل فعلي لأغنية أخرى → نُحمّلها بالكامل ونُسقط حارس التعديلات القديمة.
    hasUnsavedEdits.value = false;
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

watch(() => props.currentSong?.authors?.lyricist, (newLyricist) => {
  syncTextdichterFromSong(newLyricist);
}, { deep: true, immediate: true });

watch(() => props.currentSong?.authors?.verlog, (newVerlog) => {
  syncVerlagFromSong(newVerlog);
}, { deep: true, immediate: true });

watch(() => props.currentSong?.authors?.c_line, (newCLine) => {
  syncCLineFromSources(newCLine);
}, { deep: true, immediate: true });

// ──── مراقبة تغييرات releaseCLine ────
watch(() => props.releaseCLine, () => {
  syncCLineFromSources(props.currentSong?.authors?.c_line);
}, { immediate: true });

// ──── دورة الحياة ────
onMounted(() => {
  console.log('🚀 UrheberContent: تم التحميل');
  updateFromProps();
  initializeVerlag();
  window.addEventListener('save-song-complete', handleSaveComplete);
});

// ✅ نُفرّغ أي حفظ مؤجّل عالق (debounce لم ينتهِ بعد) قبل مغادرة التاب أو تدميره.
//   السبب: Infos1 يلفّ التابات بـ <keep-alive>، فالتبديل لتاب آخر لا يُطلق onUnmounted بل
//   onDeactivated فقط. بدون التفريغ هنا كانت القيم المُلصَقة بسرعة تُفقَد إذا انتقل المستخدم
//   قبل انتهاء مهلة الـ debounce (800ms).
const flushPendingSave = () => {
  if (debouncedSendUpdate.flush) {
    debouncedSendUpdate.flush();
  } else if (debouncedSendUpdate.cancel) {
    debouncedSendUpdate.cancel();
  }
  if (saveQueue.value.length > 0 && !isSaving.value) {
    processSaveQueue();
  }
};

onDeactivated(() => {
  console.log('💤 UrheberContent: deactivated (keep-alive) → flush الحفظ المؤجّل');
  flushPendingSave();
});

onUnmounted(() => {
  console.log('🗑️ UrheberContent: تم إزالة المكون');
  window.removeEventListener('save-song-complete', handleSaveComplete);

  if (savingTimeout) {
    clearTimeout(savingTimeout);
    savingTimeout = null;
  }

  flushPendingSave();
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

/* ✅ تعطيل قسم Textdichter عند نوع instrumental */
.section-disabled {
  opacity: 0.5;
  pointer-events: none;
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