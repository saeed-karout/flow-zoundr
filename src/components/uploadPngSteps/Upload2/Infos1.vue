<template>
  <div class="contentTrackList">
    <keep-alive>
      <component
        :is="currentTabComponent"
        :active-tab="activeTabLocal"
        :current-song="songData"
        :form-data="formData[activeTabLocal]"
        :release-artists="releaseArtists"
        :release-subtitle="releaseSubtitle"
        :releaseCLine="extractCLineName(releaseCLine)"
        :releasePLine="releasePLine"
        :releaseProductionYear="releaseProductionYear"
        @update:form-data="handleFormDataUpdate"
        @save-song="handleSaveSong"
        @back="$emit('back')"
        @next="$emit('next')"
        @back-to-tracklist="handleBackToTracklist" 
        @enter-sub-layout="$emit('enter-sub-layout')"
        @exit-sub-layout="$emit('exit-sub-layout')"
        @update-tab="handleTabUpdateFromChild"
        @openVideoPopup="handleOpenVideoPopup"
        @update-tab-completion="handleChildTabCompletion"
        :key="activeTabLocal"
        ref="tabContentRef"
      />
    </keep-alive>

    <!-- السهم العلوي - للرجوع للخلف -->
    <div class="button-arrow-top" 
         @click="handlePreviousTab"
         v-if="showArrows && activeTabIndex > 0">
      <img src="/icon/Arrow.svg" class="down" alt="down">
    </div>

    <!-- السهم السفلي - للمتابعة -->
    <div class="button-arrow" 
         @click="handleNextTab"
         :class="{ disabled: !isNextTabEnabled }"
         v-if="showArrows && activeTabIndex < tabsList.length - 1">
      <img src="/icon/Arrow.svg" class="down" alt="down">
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick, reactive, onUnmounted } from 'vue';
import { useReleaseStore } from '@/stores/release';
import { computeTabCompletion, getFirstIncompleteTab, TAB_ORDER } from '@/utils/songCompletion';
import { resolveSongTab } from '@/utils/corrections';
import { debounce } from '@/utils/debounce';

// استيراد المكونات الفرعية
import InfosContent from './InfosContent.vue';
import UrheberContent from './UrheberContent.vue';
import MitwirkendeContent from './MitwirkendeContent.vue';
import DealsContent from './DealsContent.vue';
import PreReleaseContent from './PreReleaseContent.vue';

const props = defineProps({
  activeTab: { type: String, default: 'infos' },
  currentSong: { type: Object, default: () => ({}) },
  releaseArtists: { type: Array, default: () => [] },
  releaseSubtitle: { type: String, default: '' },
  sectionTitle: { type: [String, Object], default: '' },
  showArrows: { type: Boolean, default: true },
  releaseCLine: { type: String, default: '' },
  releasePLine: { type: String, default: '' },
  releaseProductionYear: { type: String, default: '' },
  releaseTitle: { type: String, default: '' }
});

const emit = defineEmits([
  'back', 
  'next', 
  'save-song', 
  'enter-sub-layout', 
  'exit-sub-layout',
  'refresh-songs', 
  'back-to-tracklist', 
  'update:currentView', 
  'update-tab',
  'openVideoPopup', 
  'update:form-data', 
  'update-tab-completion'
]);

const releaseStore = useReleaseStore();
const tabContentRef = ref(null);

// ========== قائمة التبويبات بالترتيب ==========
const tabsList = [
  { key: 'infos', label: 'Infos' },
  { key: 'urheber', label: 'Urheber' },
  { key: 'mitwirkende', label: 'Mitwirkende' },
  { key: 'deals', label: 'Deals' },
  { key: 'pre-release', label: 'Pre-Release' }
];

// ========== حالة اكتمال التبويبات ==========
const tabCompletion = reactive({
  infos: false,
  urheber: false,
  mitwirkende: false,
  deals: false,
  'pre-release': false
});

// ========== البيانات المركزية ==========
const songData = ref(JSON.parse(JSON.stringify(props.currentSong || {})));
const activeTabLocal = ref(props.activeTab);
const autoSaveTimer = ref(null);
const isUpdatingFromChild = ref(false);
const isUpdatingFromParent = ref(false);
let lastSavedData = null;
let lastTabCompletionState = '';

const visitedTabs = reactive({ infos: false, urheber: false, mitwirkende: false, deals: false, 'pre-release': false });

// ========== حساب مؤشر التبويب الحالي ==========
const activeTabIndex = computed(() => {
  return tabsList.findIndex(tab => tab.key === activeTabLocal.value);
});

// ========== التحقق من اكتمال التبويب الحالي ==========
const isNextTabEnabled = computed(() => {
  const currentTab = activeTabLocal.value;
  
  // ✅ deals دائماً true (Coming Soon)
  if (currentTab === 'deals') {
    return true;
  }
  
  // ✅ pre-release: مكتمل إذا كان غير مفعل أو مكتمل
  if (currentTab === 'pre-release') {
    const isComplete = tabCompletion[currentTab] || false;
    const isActive = formData['pre-release']?.isPreReleaseActive || false;
    if (!isActive) {
      return true;
    }
    return isComplete;
  }
  
  return tabCompletion[currentTab] || false;
});

// ========== تحليل البيانات وتحديد التاب النشط ==========
// ✅ يُرجِع أول تبويب غير مكتمل حسب المصدر المشترك @/utils/songCompletion — نفس المنطق
//    الذي يستخدمه FirstSection.isTrackComplete و tabs.vue، فلا يفتح على تبويب لاحق
//    بينما تبويب سابق غير مكتمل، ويحترم تخطّي حقول النصوص عند نوع instrumental.
const analyzeDataAndGetActiveTab = (song) => {
  if (!song || !song.uuid) return 'infos';

  // ✏️ تبويب التصحيح أولى من كلّ ما بعده: أغنية في وضع correction تكون مكتملة،
  //    فـ getFirstIncompleteTab يعيد آخر تبويب (pre-release) بدل التبويب المطلوب.
  const correctionTab = resolveSongTab(releaseStore.correctionFields?.songs?.[song.uuid]);
  if (correctionTab) {
    console.log('✏️ [Infos1] تبويب التصحيح:', song.uuid, '->', correctionTab);
    return correctionTab;
  }

  // ✅ استعادة آخر تبويب فتحه المستخدم لهذه الأغنية عند العودة إلى تفاصيلها (المتطلب 103)
  const savedTab = releaseStore.lastSongTabs?.[song.uuid];
  if (savedTab && TAB_ORDER.includes(savedTab)) {
    console.log('📌 [Infos1] استعادة آخر تبويب للأغنية:', song.uuid, '->', savedTab);
    return savedTab;
  }

  return getFirstIncompleteTab(song);
};

// ========== ✅ معالج تحديث الاكتمال من الطفل ==========
const handleChildTabCompletion = (completion) => {
  console.log('📌 [Infos1] Received tab completion from child:', completion);
  
  if (completion && typeof completion === 'object') {
    // ✅ دمج القيم: نحتفظ بالقيم الحالية ونحدث فقط ما جاء من الطفل
    const currentValues = { ...tabCompletion };
    
    Object.keys(completion).forEach(key => {
      const value = completion[key];
      if (value !== undefined && value !== null) {
        if (visitedTabs[key] !== undefined && !visitedTabs[key]) {
          return;
        }
        tabCompletion[key] = value === true ? true : false;
      }
    });
    
    console.log('📌 [Infos1] Updated tabCompletion from child:', { ...tabCompletion });
    
    // ✅ إرسال التحديث إلى المكون الأب
    const completionString = JSON.stringify({ ...tabCompletion });
    if (completionString !== lastTabCompletionState) {
      lastTabCompletionState = completionString;
      emit('update-tab-completion', { ...tabCompletion });
    }
  }
};

// ========== تحديث حالة اكتمال التبويبات ==========
const updateTabCompletion = debounce(() => {
  console.log('📌 [Infos1] updateTabCompletion called');
  console.log('📌 [Infos1] Current tabCompletion before update:', { ...tabCompletion });
  
  // ✅ نسخ القيم الحالية كنسخة احتياطية
  const currentValues = { ...tabCompletion };
  
  // ✅ 1. استخدام tabCompletion من المكون الفرعي (أولوية قصوى)
  if (tabContentRef.value && typeof tabContentRef.value.tabCompletion === 'object') {
    const childTabCompletion = tabContentRef.value.tabCompletion;
    if (typeof childTabCompletion === 'object') {
      // ✅ دمج القيم: نأخذ من الطفل ما هو موجود، وما ليس موجوداً نحتفظ به من القيم الحالية
      Object.keys(currentValues).forEach(key => {
        if (childTabCompletion[key] !== undefined && childTabCompletion[key] !== null) {
          if (visitedTabs[key] !== undefined && !visitedTabs[key]) return;
          tabCompletion[key] = childTabCompletion[key] === true ? true : false;
        }
      });
      console.log('📌 [Infos1] Tab completion from child (priority):', { ...tabCompletion });
      
      const completionString = JSON.stringify({ ...tabCompletion });
      if (completionString !== lastTabCompletionState) {
        lastTabCompletionState = completionString;
        emit('update-tab-completion', { ...tabCompletion });
        console.log('📌 [Infos1] Emitted from child data:', { ...tabCompletion });
      }
      return;
    }
  }
  
  // ✅ 2. استخدام tabCompletion من الـ Store (نسخة احتياطية)
  const storeCompletion = releaseStore.tabCompletion;
  if (storeCompletion && typeof storeCompletion === 'object') {
    // ✅ دمج القيم: نأخذ من الـ Store ما هو موجود، وما ليس موجوداً نحتفظ به من القيم الحالية
    Object.keys(currentValues).forEach(key => {
      if (storeCompletion[key] !== undefined && storeCompletion[key] !== null) {
        if (visitedTabs[key] !== undefined && !visitedTabs[key]) return;
        tabCompletion[key] = storeCompletion[key] === true ? true : false;
      }
    });
    console.log('📌 [Infos1] Tab completion from Store (backup):', { ...tabCompletion });
    
    const completionString = JSON.stringify({ ...tabCompletion });
    if (completionString !== lastTabCompletionState) {
      lastTabCompletionState = completionString;
      emit('update-tab-completion', { ...tabCompletion });
      console.log('📌 [Infos1] Emitted from Store data:', { ...tabCompletion });
    }
    return;
  }
  
  // ✅ 3. إذا لم يكن هناك بيانات، نستخدم isTabComplete كنسخة احتياطية
  if (tabContentRef.value && typeof tabContentRef.value.isTabComplete === 'function') {
    const allTabs = ['infos', 'urheber', 'mitwirkende', 'deals', 'pre-release'];
    allTabs.forEach(tabId => {
      if (visitedTabs[tabId] !== undefined && !visitedTabs[tabId]) return;
      const isComplete = tabContentRef.value.isTabComplete(tabId);
      if (isComplete !== undefined) {
        tabCompletion[tabId] = isComplete === true ? true : false;
      }
    });
  }
  
  console.log('📌 [Infos1] Final tabCompletion:', { ...tabCompletion });
  
  const completionString = JSON.stringify({ ...tabCompletion });
  if (completionString !== lastTabCompletionState) {
    lastTabCompletionState = completionString;
    emit('update-tab-completion', { ...tabCompletion });
  }
}, 500);

// ========== إرسال جميع التابات ==========
const emitFullTabCompletion = () => {
  // ✅ التحقق من وجود currentSong
  if (!props.currentSong || !props.currentSong.uuid) {
    console.warn('⚠️ [Infos1] No currentSong available for emitFullTabCompletion');
    return;
  }

  // ✅ نحسب الاكتمال من بيانات الأغنية مباشرةً (المصدر الحقيقي) لكل التبويبات،
  //    بدون قيد "الزيارة" — حتى تظهر كل علامات التبويبات فور فتح الأغنية دون
  //    الحاجة لزيارة كل تبويب على حدة (كان هذا سبب ظهور علامات خاطئة عند الدخول).
  const source = computeTabCompletion(props.currentSong);
  if (source) {
    Object.keys(tabCompletion).forEach(key => {
      if (source[key] !== undefined && source[key] !== null) {
        tabCompletion[key] = source[key] === true ? true : false;
      }
    });
  }

  console.log('📌 [Infos1] Emitting full tabCompletion:', { ...tabCompletion });
  emit('update-tab-completion', { ...tabCompletion });
};

// ========== معالجة تحديثات النموذج ==========
const handleFormDataUpdate = (updates) => {
  console.log('🔄 Infos1 → استقبال تحديث formData:', {
    tab: updates.tab,
    hasData: !!updates.data
  });
  
  if (updates.tab && updates.data) {
    // ✅ تحديث حالة الاكتمال
    if (updates.data.isComplete !== undefined) {
      const tab = updates.tab;
      if (visitedTabs[tab] !== undefined && !visitedTabs[tab]) {
        // skip — tab not visited yet
      } else {
        tabCompletion[tab] = updates.data.isComplete === true ? true : false;
        console.log(`📌 [Infos1] Tab ${tab} completion updated to:`, tabCompletion[tab]);

        // ✅ نُثبّت علم pre_release_step_completed على الخادم فور تغيّر اكتمال Pre-Release
        //   (خاصة إلى false عند تفعيل الزر بلا غلاف/تاريخ). كان المسار الوحيد لحفظ العلم
        //   يعتمد على لقطة formData ولا يحفظ false أبداً، فتبقى الأغنية مكتملة خطأً في
        //   FirstSection. هنا نعتمد نتيجة PreReleaseContent.isTabComplete مباشرةً (مصدر
        //   الحقيقة) ونحفظها فقط عند اختلافها عن المحفوظ لتفادي حفظ زائد.
        if (tab === 'pre-release' && songData.value?.uuid) {
          // ✅ مزلاج: نثبّت true فقط، ولا نُرسل false أبداً لئلّا يُلغي تقدّماً محفوظاً.
          const complete = updates.data.isComplete === true;
          if (complete && songData.value.pre_release_step_completed !== true) {
            songData.value.pre_release_step_completed = true;
            emit('update-tab-completion', { ...tabCompletion });
            emit('save-song', { uuid: songData.value.uuid, pre_release_step_completed: true });
            console.log('💾 [Infos1] Persisted pre_release_step_completed = true');
          }
        }
      }
    }

    // ✅ ✅ ✅ تحديث جميع التابات من البيانات المستلمة
    if (updates.data && typeof updates.data === 'object') {
      Object.keys(updates.data).forEach(key => {
        if (key !== 'isComplete' && key !== 'tab') {
          if (typeof updates.data[key] === 'boolean') {
            if (visitedTabs[key] !== undefined && !visitedTabs[key]) return;
            tabCompletion[key] = updates.data[key];
          }
        }
      });
      
      console.log('📌 [Infos1] Updated tabCompletion from formData:', { ...tabCompletion });
      
      // ✅ إرسال التحديث إلى المكون الأب
      emit('update-tab-completion', { ...tabCompletion });
    }
  }
};
// ========== استخراج اسم C-Line ==========
const extractCLineName = (cLineText) => {
  if (!cLineText || cLineText.trim() === '') return '';
  const text = cLineText.trim();
  const match = text.match(/^\d{4}\s+(.+)$/);
  if (match) return match[1].trim();
  const parts = text.split(' ');
  if (parts.length > 1) {
    const firstPart = parts[0];
    if (/^\d{4}$/.test(firstPart)) {
      return parts.slice(1).join(' ').trim();
    }
  }
  return text;
};

// ========== معالج فتح الفيديو ==========
const handleOpenVideoPopup = (field) => {
  emit('openVideoPopup', field);
};

// ========== معالج الانتقال إلى التبويب التالي ==========
const handleNextTab = () => {
  if (!isNextTabEnabled.value) {
    const currentTab = activeTabLocal.value;
    const tabName = tabsList.find(t => t.key === currentTab)?.label || currentTab;
    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: { 
        message: `Bitte fülle alle erforderlichen Felder in "${tabName}" aus.`,
        type: 'warning'
      }
    }));
    return;
  }
  
  const allData = compileAllData();
  if (allData.uuid) {
    emit('save-song', allData);
  }
  
  const nextIndex = activeTabIndex.value + 1;
  if (nextIndex < tabsList.length) {
    const nextTab = tabsList[nextIndex].key;
    activeTabLocal.value = nextTab;
    emit('update-tab', nextTab);
    
    setTimeout(() => {
      updateTabCompletion();
    }, 300);
  }
};

// ========== معالج الانتقال إلى التبويب السابق ==========
const handlePreviousTab = () => {
  const prevIndex = activeTabIndex.value - 1;
  if (prevIndex >= 0) {
    const prevTab = tabsList[prevIndex].key;
    const allData = compileAllData();
    if (allData.uuid) {
      emit('save-song', allData);
    }
    activeTabLocal.value = prevTab;
    emit('update-tab', prevTab);
  } else if (prevIndex === -1) {
    handleBackToTracklist();
  }
};

// ========== معالج العودة إلى Tracklist ==========
const handleBackToTracklist = () => {
  const allData = compileAllData();
  if (allData.uuid) {
    emit('save-song', allData);
  }
  emit('back-to-tracklist');
  emit('update:currentView', 'firstSection');
};

// ========== معالج تحديث التبويب من المكون الفرعي ==========
const handleTabUpdateFromChild = (tabId) => {
  activeTabLocal.value = tabId;
  emit('update-tab', tabId);
};

// ========== تهيئة بيانات الأغنية ==========
const initFormDataFromSong = (song) => {
  if (!song || !song.uuid) {
    return getDefaultFormData();
  }

  let cleanTitle = song.title || '';
  let songNumber = '01';
  let isValidTitle = false;
  
  if (cleanTitle) {
    const titleParts = cleanTitle.split(' ');
    if (titleParts.length > 0 && /^\d{2}$/.test(titleParts[0])) {
      songNumber = titleParts[0];
      const displayTitle = titleParts.slice(1).join(' ');
      const releaseTitle = props.releaseTitle || releaseStore.metasData?.title || '';
      if (displayTitle && displayTitle !== 'Song Titel' && displayTitle.trim() !== '' && displayTitle !== releaseTitle) {
        cleanTitle = displayTitle;
        isValidTitle = true;
      } else {
        cleanTitle = '';
        isValidTitle = false;
      }
    } else {
      const releaseTitle = props.releaseTitle || releaseStore.metasData?.title || '';
      if (cleanTitle && cleanTitle !== 'Song Titel' && cleanTitle.trim() !== '' && cleanTitle !== releaseTitle) {
        isValidTitle = true;
      } else {
        cleanTitle = '';
        isValidTitle = false;
      }
    }
  }
  
  releaseStore.setCurrentSongNumber(songNumber);
  releaseStore.setCurrentSongTitle(isValidTitle ? cleanTitle : '');

  const subtitleValue = song.subtitle || '';
  const pLineFromRelease = props.releasePLine || '';
  const productionYearFromRelease = props.releaseProductionYear || '';
  const songPLine = song.contributors?.p_line?.[0]?.name || '';
  const finalPLine = songPLine || pLineFromRelease;
  const songProductionYear = song.production_year || '';
  const finalProductionYear = songProductionYear || productionYearFromRelease;
  
  return {
    infos: {
      title: cleanTitle,
      titleValid: isValidTitle,
      subtitle: subtitleValue,
      subtitleValid: !!subtitleValue,
      song_type: song.song_type || song.song_typ || '',
      explicit_lyrics: song.explicit_lyrics || '',
      isrc: song.isrc || '',
      title_language: song.title_language || '',
      lyrics_language: song.lyrics_language || '',
      song_lyrics: song.song_lyrics || '',
      preview_enabled: song.preview_enabled || false,
    },
    urheber: {
      komponist: song.authors?.composer || [''],
      textdichter: song.authors?.lyricist || [''],
      verlag: song.authors?.verlog?.[0] || '',
      c_line: song.authors?.c_line?.[0] || '',
    },
    mitwirkende: {
      artist: song.contributors?.artist?.map(a => a.name) || [''],
      feature: song.contributors?.feature?.map(f => f.name) || [''],
      p_line: finalPLine,
      produzent: song.contributors?.producer?.map(p => p.name) || [''],
      production_year: finalProductionYear,
      weitere_mitwirkende: song.contributors?.other_contributors || [],
      isFeatureActive: !!(song.contributors?.feature?.length > 0),
      isWeitereActive: !!(song.contributors?.other_contributors?.length > 0),
    },
    deals: {
      isSplittingActive: song.is_splitting_active || false,
      shares: song.shares || getDefaultShares(),
    },
    'pre-release': {
      isPreReleaseActive: song.is_pre_release_active || false,
      isFullReleaseActive: song.is_full_release_active || false,
      uploadedImage: song.pre_release_image || null,
      selectedReleaseDate: song.release_date || '',
      isReleaseDateSelected: !!song.release_date,
    }
  };
};

const getDefaultFormData = () => ({
  infos: {
    title: '',
    subtitle: '',
    song_type: '',
    explicit_lyrics: '',
    isrc: '',
    title_language: '',
    lyrics_language: '',
    song_lyrics: '',
    preview_enabled: false,
  },
  urheber: {
    komponist: [''],
    textdichter: [''],
    verlag: '',
    c_line: '',
  },
  mitwirkende: {
    artist: [''],
    feature: [''],
    p_line: props.releasePLine || '',
    produzent: [''],
    production_year: props.releaseProductionYear || '',
    weitere_mitwirkende: [],
    isFeatureActive: false,
    isWeitereActive: false,
  },
  deals: {
    isSplittingActive: false,
    shares: getDefaultShares(),
  },
  'pre-release': {
    isPreReleaseActive: false,
    isFullReleaseActive: false,
    uploadedImage: null,
    selectedReleaseDate: '',
    isReleaseDateSelected: false,
  }
});

const getDefaultShares = () => [
  { name: 'Sarah Doll', role: 'Feature', percentage: 0 },
  { name: 'Louis Bell', role: 'Produzent', percentage: 0 },
  { name: 'Lina Welling', role: 'Produzent', percentage: 0 },
  { name: 'Hannah Smith', role: 'Composer', percentage: 0 }
];

// ========== نموذج البيانات المركزي ==========
const formData = reactive(initFormDataFromSong(props.currentSong || {}));

// ========== جدولة الحفظ التلقائي ==========
const scheduleAutoSave = (data) => {
  const dataString = JSON.stringify(data);
  if (lastSavedData === dataString) {
    return;
  }
  
  clearTimeout(autoSaveTimer.value);
  autoSaveTimer.value = setTimeout(() => {
    lastSavedData = dataString;
    emit('save-song', data);
  }, 2000);
};
// ========== حساب اكتمال جميع التبويبات من بيانات الأغنية (تحقق صارم) ==========
// ✅ نفس منطق FirstSection.isTrackComplete و updateTabCompletionFromSong،
//    حتى تعكس علامات التبويبات الحالة الحقيقية للأغنية فور فتحها دون الحاجة لزيارة كل تبويب.



// ========== تجميع جميع البيانات ==========
// ✅ compileAllData لم يعد يُرسل بيانات الحقول إطلاقاً.
//
//    لماذا: formData في Infos1 مجرّد "مرآة" تُملأ مرّة واحدة عبر initFormDataFromSong
//    عند فتح أغنية مختلفة، ولا يكتب فيها أحد بعد ذلك — فمكوّنات التبويبات تبعث
//    update:form-data بقيم منطقية (isComplete) لا بقيم الحقول. لذلك كانت المرآة
//    تتجمّد على لقطة قديمة، ويُعيد كل تبديل تبويب إرسالها إلى الخادم فيدهس ما حفظه
//    المكوّن للتوّ: عاد Textdichter بعد تفريغه، وعاد song_type من medley إلى
//    original_instrumental، وهكذا.
//
//    كل تبويب يملك حفظه الخاص (autoSave / debouncedSendUpdate) مع تفريغ للطابور عند
//    مغادرته (onDeactivated)، فلا حاجة إلى "شبكة أمان" تُعيد كتابة لقطة قديمة.
//    يبقى هنا فقط ما تملكه Infos1 فعلاً: هوية الأغنية وأعلام اكتمال الخطوات.
const compileAllData = () => {
  const allData = {
    uuid: songData.value.uuid,
    // التبويب المصدر — يستخدمه Upload2Component لفلترة الحقول بدل تخمينه من المفاتيح.
    __tab: activeTabLocal.value
  };

  // ✅ Deals: لا حقول فيه → يكتمل بمجرّد فتح التبويب.
  // ✅ مزلاج: لا يُرسَل إلا true؛ وغياب المفتاح يعني «لا تُغيّر» فتبقى قيمة الخادم.
  const dealsDone =
    visitedTabs.deals === true || songData.value?.deals_step_completed === true;
  if (dealsDone) allData.deals_step_completed = true;

  // ✅ Pre-Release: نعتمد النتيجة الموثوقة التي حسبها PreReleaseContent (المثبَّتة في
  //    tabCompletion عبر handleFormDataUpdate)؛ وإن لم يُزَر التبويب نُبقي العلم المحفوظ.
  // ✅ مزلاج أيضاً: متى صار true على الخادم يبقى true، ولا نُرسل false إطلاقاً.
  const preReleaseDone =
    (visitedTabs['pre-release'] === true && tabCompletion['pre-release'] === true)
    || songData.value?.pre_release_step_completed === true;
  if (preReleaseDone) allData.pre_release_step_completed = true;

  return allData;
};

// ========== تعريف التبويبات ==========
const tabComponents = computed(() => ({
  infos: InfosContent,
  urheber: UrheberContent,
  mitwirkende: MitwirkendeContent,
  deals: DealsContent,
  'pre-release': PreReleaseContent,
}));

const currentTabComponent = computed(() => {
  return tabComponents.value[activeTabLocal.value] || InfosContent;
});

// ========== معالج حفظ مباشر ==========
const handleSaveSong = async (songDataToSave) => {
  emit('save-song', songDataToSave);
};

// ========== مراقبة التغييرات ==========

watch(() => props.activeTab, async (newTab, oldTab) => {
  if (newTab === oldTab) return;
  if (oldTab) {
    const allData = compileAllData();
    emit('save-song', allData);
  }
  activeTabLocal.value = newTab;
  await nextTick();
  setTimeout(() => {
    updateTabCompletion();
  }, 200);
}, { immediate: true });

watch(activeTabLocal, (tab) => {
  if (tab && visitedTabs[tab] !== undefined) {
    visitedTabs[tab] = true;
  }

  // ✅ Deals has no fields → opening the tab completes the step. Persist it right
  //    away (deals_step_completed: true) and show its checkmark immediately,
  //    instead of waiting for the user to leave the tab.
  if (tab === 'deals' && songData.value?.uuid && songData.value?.deals_step_completed !== true) {
    songData.value.deals_step_completed = true;
    tabCompletion.deals = true;
    emit('update-tab-completion', { ...tabCompletion });
    emit('save-song', { uuid: songData.value.uuid, deals_step_completed: true });
  }

  // ملاحظة: أزلنا "فرض" اكتمال Pre-Release عند دخول التبويب. كان يعتمد على لقطة
  //   formData التي قد تكون قديمة (isPreReleaseActive=false) فيحفظ pre_release_step_completed
  //   = true خطأً حتى عند تفعيل Pre-Release بلا غلاف/تاريخ. المصدر الوحيد الموثوق الآن هو
  //   PreReleaseContent.isTabComplete الذي يُبثّ عبر update:form-data ويُثبَّت في
  //   handleFormDataUpdate (يحفظ true و false بشكل صحيح).
}, { immediate: true });

watch(() => props.currentSong, (newSong, oldSong) => {
  if (newSong?.uuid === oldSong?.uuid && oldSong) {
    // Same song, but its fields were updated (e.g. after a save merged the server
    // response). Keep the local snapshot `songData` fresh so any tab component that
    // re-initialises from it sees ALL current fields — not just the ones that
    // existed when the song was first opened (title + song_file). Merge in place so
    // the prop reference is stable and we don't reset the live tab's inputs.
    if (newSong && songData.value) {
      Object.assign(songData.value, JSON.parse(JSON.stringify(newSong)));
    }
    return;
  }

  if (isUpdatingFromParent.value) {
    return;
  }
  
  if (newSong?.uuid) {
    isUpdatingFromParent.value = true;
    Object.keys(visitedTabs).forEach(k => { visitedTabs[k] = false; });

    songData.value = JSON.parse(JSON.stringify(newSong));
    
    const newFormData = initFormDataFromSong(newSong);
    if (newFormData && typeof newFormData === 'object') {
      Object.keys(newFormData).forEach(key => {
        if (formData[key] !== undefined) {
          formData[key] = newFormData[key];
        }
      });
    }
    
    const activeTabFromData = analyzeDataAndGetActiveTab(newSong);
    if (activeTabFromData && activeTabFromData !== activeTabLocal.value) {
      activeTabLocal.value = activeTabFromData;
      emit('update-tab', activeTabFromData);
    }

    // ✅ بعد تصفير visitedTabs أعلاه، نعلّم التبويب النشط (المعروض للمستخدم) كـ "مُزار".
    //    بدون هذا، عندما لا يتغيّر التبويب النشط عند فتح الأغنية، يبقى visitedTabs.infos=false
    //    فتتجاهل معالجات الاكتمال تحديثات infos حتى ينتقل المستخدم لتبويب آخر ويعود.
    if (activeTabLocal.value && visitedTabs[activeTabLocal.value] !== undefined) {
      visitedTabs[activeTabLocal.value] = true;
    }

    emit('enter-sub-layout');

    // ✅ حساب اكتمال جميع التبويبات من بيانات الأغنية وإرسالها فوراً
    //    حتى تظهر علامات الصح الصحيحة عند فتح الأغنية (وليس فقط للتبويب النشط).
    emitFullTabCompletion();

    setTimeout(() => {
      isUpdatingFromParent.value = false;
    }, 500);
  } else {
    emit('exit-sub-layout');
  }
}, { deep: true, immediate: true });

watch(() => formData.infos, () => {
  if (isUpdatingFromParent.value) return;
  nextTick(() => {
    setTimeout(() => {
      updateTabCompletion();
    }, 100);
  });
}, { deep: true });

watch(() => formData.urheber, () => {
  if (isUpdatingFromParent.value) return;
  nextTick(() => {
    setTimeout(() => {
      updateTabCompletion();
    }, 100);
  });
}, { deep: true });

watch(() => formData.mitwirkende, () => {
  if (isUpdatingFromParent.value) return;
  nextTick(() => {
    setTimeout(() => {
      updateTabCompletion();
    }, 100);
  });
}, { deep: true });

watch(() => formData.deals, () => {
  if (isUpdatingFromParent.value) return;
  nextTick(() => {
    setTimeout(() => {
      updateTabCompletion();
    }, 100);
  });
}, { deep: true });

watch(() => formData['pre-release'], () => {
  if (isUpdatingFromParent.value) return;
  nextTick(() => {
    setTimeout(() => {
      updateTabCompletion();
    }, 100);
  });
}, { deep: true });

watch(() => tabContentRef.value, (newRef) => {
  // ✅ التحقق من وجود newRef قبل محاولة الوصول إلى isTabComplete
  if (newRef && typeof newRef.isTabComplete === 'function') {
    setTimeout(() => {
      updateTabCompletion();
    }, 300);
  } else {
    // ✅ إذا لم يكن هناك ref، استخدم البيانات من الـ Store
    const storeCompletion = releaseStore.tabCompletion;
    if (storeCompletion) {
      Object.keys(storeCompletion).forEach(key => {
        if (storeCompletion[key] !== undefined && storeCompletion[key] !== null) {
          if (visitedTabs[key] !== undefined && !visitedTabs[key]) return;
          tabCompletion[key] = storeCompletion[key] === true ? true : false;
        }
      });
    }
  }
}, { immediate: true });

watch(() => activeTabLocal.value, () => {
  setTimeout(() => {
    updateTabCompletion();
  }, 300);
});

onMounted(async () => {
  console.log('🚀 Infos1 تم التحميل');
  
  // ✅ استخدام nextTick للتأكد من اكتمال التصيير
  await nextTick();
  
  // ✅ إذا كان هناك currentSong، تحليل البيانات وتحديد التاب
  if (props.currentSong?.uuid) {
    const activeTabFromData = analyzeDataAndGetActiveTab(props.currentSong);
    if (activeTabFromData && activeTabFromData !== activeTabLocal.value) {
      console.log(`📌 [Infos1] Mounted: Setting active tab to ${activeTabFromData} based on data`);
      activeTabLocal.value = activeTabFromData;
      emit('update-tab', activeTabFromData);
    }
    emit('enter-sub-layout');
  }
  
  // ✅ استخدام القيم من الـ Store مباشرة
  const storeCompletion = releaseStore.tabCompletion;
  if (storeCompletion) {
    // ✅ نبدأ من قيم المخزّن كما هي. كان هنا فرض false لكل تبويب غير مُزار في هذه الجلسة،
    //    فيُصفّر حالة صحيحة ثم يُبثّ التصفير إلى المخزّن عبر مراقب InfosContent الفوري قبل
    //    أن يُصحّحه emitFullTabCompletion بعد ~300ms → وميض علامات الاكتمال. المصدر الموثوق
    //    هو emitFullTabCompletion (يحسب من بيانات الأغنية دون قيد الزيارة).
    Object.keys(storeCompletion).forEach(key => {
      if (storeCompletion[key] !== undefined && storeCompletion[key] !== null) {
        tabCompletion[key] = storeCompletion[key] === true ? true : false;
      }
    });
    console.log('📌 [Infos1] Mounted: Using Store tabCompletion:', { ...tabCompletion });
  }
  
  // ✅ إرسال جميع التابات مع تأخير مناسب
  await nextTick();
  setTimeout(() => {
    emitFullTabCompletion();
    setTimeout(() => {
      updateTabCompletion();
    }, 300);
  }, 300);
  
  console.log('✅ [Infos1] Mounted - Full tab completion sent');
});
onUnmounted(() => {
  if (autoSaveTimer.value) {
    clearTimeout(autoSaveTimer.value);
    console.log('🧹 Infos1 → تم تنظيف مؤقت الحفظ التلقائي');
  }
});

onUnmounted(() => {
  if (autoSaveTimer.value) {
    clearTimeout(autoSaveTimer.value);
  }
});

// ========== تصدير الدوال ==========
defineExpose({
  tabCompletion,
  updateTabCompletion,
  isNextTabEnabled,
  analyzeDataAndGetActiveTab
});
</script>

<style lang="scss" scoped>
.contentTrackList {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  align-self: stretch;
  width: 100%;
  min-height: 100%;
  position: relative; 
  padding: 20px 0px 0px 0px;
  scrollbar-width: none;
  padding-right: 40px;
}

.button-arrow-top {
  display: flex;
  justify-content: center;
  width: 30px;
  height: 30px;
  padding: 12px 8px 10px 8px;
  align-items: center;
  position: absolute;
  right: 0;
  top: 20px;
  border-radius: 15px;
  background: #1B1C20;
  transition: background 0.3s ease;
  cursor: pointer;
  opacity: 0.3;
  z-index: 10;
  rotate: 180deg;
}

.button-arrow-top:hover {
  background: var(--dark-red);
  opacity: 1;
}

.button-arrow {
  display: flex;
  justify-content: center;
  width: 30px;
  height: 30px;
  padding: 12px 8px 10px 8px;
  align-items: center;
  position: fixed;
  right: 20px;
  bottom: 20px;
  transition: background 0.3s ease;
  border-radius: 15px;
  background: var(--Strawberry);
  cursor: pointer;
  z-index: 10;
}

.button-arrow:hover {
  background: var(--dark-red);
}

.button-arrow.disabled {
  background: #1B1C20;
  pointer-events: none;
  opacity: 0.3;
}
</style>