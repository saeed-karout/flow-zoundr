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
  deals: true,
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
const analyzeDataAndGetActiveTab = (song) => {
  if (!song || !song.uuid) return 'infos';
  
  // ✅ التحقق من اكتمال Infos
  const infosComplete = 
    song.title && 
    song.title !== 'Song Titel' &&
    song.title.trim() !== '' &&
    song.explicit_lyrics &&
    song.title_language &&
    song.lyrics_language;
  
  if (!infosComplete) {
    return 'infos';
  }
  
  // ✅ التحقق من اكتمال Urheber
  const urheberComplete = 
    (song.authors?.composer && song.authors.composer.length > 0 && song.authors.composer.some(v => v?.trim())) ||
    (song.authors?.lyricist && song.authors.lyricist.length > 0 && song.authors.lyricist.some(v => v?.trim()));
  
  if (!urheberComplete) {
    return 'urheber';
  }
  
  // ✅ التحقق من اكتمال Mitwirkende
  const mitwirkendeComplete = 
    (song.contributors?.artist && song.contributors.artist.length > 0 && song.contributors.artist.some(v => v?.name?.trim())) ||
    (song.contributors?.producer && song.contributors.producer.length > 0 && song.contributors.producer.some(v => v?.name?.trim()));
  
  if (!mitwirkendeComplete) {
    return 'mitwirkende';
  }
  
  // ✅ Pre-Release
  const isPreReleaseActive = song.is_pre_release_active === true;
  const isFullReleaseActive = song.is_full_release_active === true;
  const hasPreReleaseData = song.pre_release_image || song.release_date;
  
  if (isPreReleaseActive || isFullReleaseActive || hasPreReleaseData) {
    return 'pre-release';
  }
  
  return 'pre-release';
};

// ========== ✅ معالج تحديث الاكتمال من الطفل ==========
const handleChildTabCompletion = (completion) => {
  console.log('📌 [Infos1] Received tab completion from child:', completion);
  
  if (completion && typeof completion === 'object') {
    // ✅ دمج القيم: نحتفظ بالقيم الحالية ونحدث فقط ما جاء من الطفل
    const currentValues = { ...tabCompletion };
    
    Object.keys(completion).forEach(key => {
      const value = completion[key];
      if (key === 'deals') {
        tabCompletion[key] = true;
      } else if (value !== undefined && value !== null) {
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
  
  // ✅ دائماً نجعل deals = true
  tabCompletion.deals = true;
  
  // ✅ نسخ القيم الحالية كنسخة احتياطية
  const currentValues = { ...tabCompletion };
  
  // ✅ 1. استخدام tabCompletion من المكون الفرعي (أولوية قصوى)
  if (tabContentRef.value && tabContentRef.value.tabCompletion) {
    const childTabCompletion = tabContentRef.value.tabCompletion;
    if (typeof childTabCompletion === 'object') {
      // ✅ دمج القيم: نأخذ من الطفل ما هو موجود، وما ليس موجوداً نحتفظ به من القيم الحالية
      Object.keys(currentValues).forEach(key => {
        if (key === 'deals') {
          tabCompletion[key] = true;
        } else if (childTabCompletion[key] !== undefined && childTabCompletion[key] !== null) {
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
      if (key === 'deals') {
        tabCompletion[key] = true;
      } else if (storeCompletion[key] !== undefined && storeCompletion[key] !== null) {
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
      if (tabId === 'deals') {
        tabCompletion.deals = true;
      } else {
        const isComplete = tabContentRef.value.isTabComplete(tabId);
        if (isComplete !== undefined) {
          tabCompletion[tabId] = isComplete === true ? true : false;
        }
      }
    });
  }
  
  // ✅ تأكد من أن deals دائماً true
  tabCompletion.deals = true;
  
  console.log('📌 [Infos1] Final tabCompletion:', { ...tabCompletion });
  
  const completionString = JSON.stringify({ ...tabCompletion });
  if (completionString !== lastTabCompletionState) {
    lastTabCompletionState = completionString;
    emit('update-tab-completion', { ...tabCompletion });
  }
}, 500);

// ========== معالجة تحديثات النموذج ==========
const handleFormDataUpdate = (updates) => {
  console.log('🔄 Infos1 → استقبال تحديث formData:', {
    tab: updates.tab,
    hasData: !!updates.data
  });
  
  if (updates.tab && updates.data) {
    // ✅ تحديث حالة الاكتمال
    if (updates.data.isComplete !== undefined) {
      if (updates.tab === 'deals') {
        tabCompletion[updates.tab] = true;
      } else {
        tabCompletion[updates.tab] = updates.data.isComplete === true ? true : false;
      }
      console.log(`📌 [Infos1] Tab ${updates.tab} completion updated to:`, tabCompletion[updates.tab]);
    }
    
    // ✅ ✅ ✅ تحديث جميع التابات من البيانات المستلمة
    if (updates.data && typeof updates.data === 'object') {
      // ✅ تحديث tabCompletion من البيانات
      Object.keys(updates.data).forEach(key => {
        if (key === 'deals') {
          tabCompletion[key] = true;
        } else if (key === 'pre-release') {
          tabCompletion[key] = true;
        } else if (key !== 'isComplete' && key !== 'tab') {
          if (typeof updates.data[key] === 'boolean') {
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
      song_type: song.song_type || '',
      song_typ: song.song_typ || '',
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
// ========== إرسال جميع التابات ==========
const emitFullTabCompletion = () => {
  // ✅ تأكد من أن deals دائماً true
  tabCompletion.deals = true;
  
  // ✅ استخدام القيم من الـ Store إذا كانت موجودة
  const storeCompletion = releaseStore.tabCompletion;
  if (storeCompletion) {
    Object.keys(storeCompletion).forEach(key => {
      if (key === 'deals') {
        tabCompletion[key] = true;
      } else if (storeCompletion[key] !== undefined && storeCompletion[key] !== null) {
        tabCompletion[key] = storeCompletion[key] === true ? true : false;
      }
    });
  }
  
  console.log('📌 [Infos1] Emitting full tabCompletion:', { ...tabCompletion });
  emit('update-tab-completion', { ...tabCompletion });
};
// ========== تجميع جميع البيانات ==========
const compileAllData = () => {
  const allData = { uuid: songData.value.uuid };
  const songNumber = releaseStore.currentSongNumber || '01';
  const titleValue = (formData.infos.title || '').trim();
  
  let finalTitle = titleValue;
  if (titleValue && !/^\d{2}\s/.test(titleValue)) {
    finalTitle = `${songNumber} ${titleValue}`;
  }
  
  Object.assign(allData, {
    title: finalTitle,
    subtitle: (formData.infos.subtitle || '').trim(),
    song_type: formData.infos.song_type || 'SONG',
    explicit_lyrics: formData.infos.explicit_lyrics || null,
    isrc: (formData.infos.isrc || '').trim().toUpperCase(),
    title_language: formData.infos.title_language || null,
    lyrics_language: formData.infos.lyrics_language || null,
    song_lyrics: (formData.infos.song_lyrics || '').trim(),
    preview_enabled: formData.infos.preview_enabled || false,
  });
  
  // Authors
  const komponistValues = (formData.urheber.komponist || []).filter(v => v && v.trim()).map(v => v.trim());
  const textdichterValues = (formData.urheber.textdichter || []).filter(v => v && v.trim()).map(v => v.trim());
  const verlagValue = (formData.urheber.verlag || '').trim();
  const cLineValue = (formData.urheber.c_line || '').trim();
  
  allData.authors = {};
  if (komponistValues.length > 0) allData.authors.composer = komponistValues;
  if (textdichterValues.length > 0) allData.authors.lyricist = textdichterValues;
  if (verlagValue) allData.authors.verlog = [verlagValue];
  if (cLineValue) allData.authors.c_line = [cLineValue];
  if (Object.keys(allData.authors).length === 0) delete allData.authors;
  
  // Contributors
  const artistValues = (formData.mitwirkende.artist || []).filter(v => v && v.trim()).map(v => ({ name: v.trim() }));
  const featureValues = formData.mitwirkende.isFeatureActive ? 
    (formData.mitwirkende.feature || []).filter(v => v && v.trim()).map(v => ({ name: v.trim() })) : [];
  const producerValues = (formData.mitwirkende.produzent || []).filter(v => v && v.trim()).map(v => ({ name: v.trim() }));
  
  allData.contributors = {};
  if (artistValues.length > 0) allData.contributors.artist = artistValues;
  if (featureValues.length > 0) allData.contributors.feature = featureValues;
  if (producerValues.length > 0) allData.contributors.producer = producerValues;
  if (formData.mitwirkende.p_line) {
    allData.contributors.p_line = [{ name: formData.mitwirkende.p_line.trim() }];
  }
  if (formData.mitwirkende.isWeitereActive && Array.isArray(formData.mitwirkende.weitere_mitwirkende)) {
    const otherValues = formData.mitwirkende.weitere_mitwirkende
      .filter(c => c.role && c.role.trim() && c.name && c.name.trim())
      .map(c => ({ role: c.role.trim(), name: c.name.trim(), percentage: c.percentage || 0 }));
    if (otherValues.length > 0) allData.contributors.other_contributors = otherValues;
  }
  if (formData.mitwirkende.production_year) {
    allData.production_year = formData.mitwirkende.production_year;
  }
  if (Object.keys(allData.contributors).length === 0) delete allData.contributors;
  
  // Deals
  allData.is_splitting_active = formData.deals.isSplittingActive || false;
  allData.shares = formData.deals.shares || [];
  
  // Pre-Release
  allData.is_pre_release_active = formData['pre-release'].isPreReleaseActive || false;
  allData.is_full_release_active = formData['pre-release'].isFullReleaseActive || false;
  allData.pre_release_image = formData['pre-release'].uploadedImage || null;
  allData.release_date = formData['pre-release'].selectedReleaseDate || null;
  
  Object.keys(allData).forEach(key => {
    if (key !== 'uuid' && (allData[key] === '' || allData[key] === undefined || allData[key] === null)) {
      delete allData[key];
    }
  });
  
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

watch(() => props.currentSong, (newSong, oldSong) => {
  if (newSong?.uuid === oldSong?.uuid && oldSong) {
    return;
  }
  
  if (isUpdatingFromParent.value) {
    return;
  }
  
  if (newSong?.uuid) {
    isUpdatingFromParent.value = true;
    
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
    
    emit('enter-sub-layout');
    
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
  if (newRef && typeof newRef.isTabComplete === 'function') {
    setTimeout(() => {
      updateTabCompletion();
    }, 300);
  }
}, { immediate: true });

watch(() => activeTabLocal.value, () => {
  setTimeout(() => {
    updateTabCompletion();
  }, 300);
});

// ========== دورة الحياة ==========
onMounted(async () => {
  console.log('🚀 Infos1 تم التحميل');
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
    Object.keys(storeCompletion).forEach(key => {
      if (key === 'deals') {
        tabCompletion[key] = true;
      } else if (storeCompletion[key] !== undefined && storeCompletion[key] !== null) {
        tabCompletion[key] = storeCompletion[key] === true ? true : false;
      }
    });
    console.log('📌 [Infos1] Mounted: Using Store tabCompletion:', { ...tabCompletion });
  }
  
  // ✅ إرسال جميع التابات
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