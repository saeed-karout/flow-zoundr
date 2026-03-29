<template>
  <div class="contentTrackList">
    <!-- عرض التبويب النشط -->
    <component
      :is="currentTabComponent"
      :active-tab="activeTabLocal"
      :current-song="songData"
      :form-data="formData[activeTabLocal]"
      @update:form-data="handleFormDataUpdate"
      @save-song="handleSaveSong"
      @back="$emit('back')"
      @next="$emit('next')"
      @back-to-tracklist="handleBackToTracklist" 
      @enter-sub-layout="$emit('enter-sub-layout')"
      @exit-sub-layout="$emit('exit-sub-layout')"
      :key="`tab-${activeTabLocal}-${songData?.uuid || 'no-song'}-${componentKey}`"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick, reactive, onUnmounted } from 'vue';

// استيراد المكونات الفرعية
import InfosContent from './InfosContent.vue';
import UrheberContent from './UrheberContent.vue';
import MitwirkendeContent from './MitwirkendeContent.vue';
import DealsContent from './DealsContent.vue';
import PreReleaseContent from './PreReleaseContent.vue';

const props = defineProps({
  activeTab: { type: String, default: 'infos' },
  currentSong: { type: Object, default: () => ({}) }
});

const emit = defineEmits([
  'back',
  'next',
  'save-song',
  'enter-sub-layout',
  'exit-sub-layout',
  'refresh-songs',
  'back-to-tracklist'  // إضافة حدث جديد
]);

// ──── البيانات المركزية للتبويبات ────
const songData = ref(JSON.parse(JSON.stringify(props.currentSong || {})));
const activeTabLocal = ref(props.activeTab);
const autoSaveTimer = ref(null);
const componentKey = ref(0);

// ──── تهيئة formData من currentSong ────
const initFormDataFromSong = (song) => {
  console.log('🎬 Infos1 → تهيئة formData من الأغنية:', {
    uuid: song.uuid,
    title: song.title,
    is_full_release_active: song.is_full_release_active
  });
  
  return {
    infos: {
      title: song.title || '',
      subtitle: song.subtitle || '',
      song_type: song.song_type || 'SONG',
      explicit_lyrics: song.explicit_lyrics || '',
      isrc: song.isrc || '',
      title_language: song.title_language || '',
      lyrics_language: song.lyrics_language || '',
      song_lyrics: song.song_lyrics || '',
      preview_enabled: song.preview_enabled || false,
      titleValid: !!song.title,
      subtitleValid: !!song.subtitle,
      songTypeValid: !!song.song_type,
      explicitLyricsValid: !!song.explicit_lyrics,
      isrcValid: !!song.isrc,
      titleLanguageValid: !!song.title_language,
      textLanguageValid: !!song.lyrics_language,
      lyricsValid: !!song.song_lyrics,
      fileUploaded: false,
      lyricsEnabled: !!song.song_lyrics,
      isrcEnabled: !!song.isrc,
      subtitleEnabled: !!song.subtitle,
    },
    urheber: {
      komponist: Array.isArray(song.authors?.composer) ? 
        song.authors.composer : 
        (song.composer ? String(song.composer).split(',').map(n => (n || '').trim()).filter(n => n !== '') : ['']),
      textdichter: Array.isArray(song.authors?.lyricist) ? 
        song.authors.lyricist : 
        (song.lyricist ? String(song.lyricist).split(',').map(n => (n || '').trim()).filter(n => n !== '') : ['']),
      verlag: Array.isArray(song.authors?.verlog) ? song.authors.verlog[0] || '' : (song.publisher || ''),
      c_line: Array.isArray(song.authors?.c_line) ? song.authors.c_line[0] || '' : (song.c_line || ''),
    },
    mitwirkende: {
      artist: Array.isArray(song.contributors?.artist) ? 
        song.contributors.artist.map(a => a.name || '') : 
        (song.artist ? String(song.artist).split(',').map(n => (n || '').trim()).filter(n => n !== '') : ['']),
      feature: Array.isArray(song.contributors?.feature) ? 
        song.contributors.feature.map(f => f.name || '') : 
        (song.feature ? String(song.feature).split(',').map(n => (n || '').trim()).filter(n => n !== '') : ['']),
      p_line: Array.isArray(song.contributors?.p_line) ? 
        song.contributors.p_line[0]?.name || '' : 
        (song.p_line || ''),
      produzent: Array.isArray(song.contributors?.producer) ? 
        song.contributors.producer.map(p => p.name || '') : 
        (song.producer ? String(song.producer).split(',').map(n => (n || '').trim()).filter(n => n !== '') : ['']),
      production_year: song.production_year || '',
      weitere_mitwirkende: Array.isArray(song.contributors?.other_contributors) ? 
        song.contributors.other_contributors : [],
      isFeatureActive: !!(Array.isArray(song.contributors?.feature) && song.contributors.feature.length > 0),
      isWeitereActive: !!(Array.isArray(song.contributors?.other_contributors) && song.contributors.other_contributors.length > 0),
    },
    deals: {
      isSplittingActive: false,
      shares: [
        { name: 'Sarah Doll', role: 'Feature', percentage: 0 },
        { name: 'Louis Bell', role: 'Produzent', percentage: 0 },
        { name: 'Lina Welling', role: 'Produzent', percentage: 0 },
        { name: 'Hannah Smith', role: 'Composer', percentage: 0 }
      ],
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

// ──── نموذج بيانات مركزي لجميع التبويبات ────
const formData = reactive(initFormDataFromSong(props.currentSong || {}));

// ──── تحديث البيانات من استجابة الـ API ────
const updateFromApiResponse = (apiResponse) => {
  if (!apiResponse?.data) return;
  
  const songDataFromApi = apiResponse.data.data || apiResponse.data;
  
  console.log('📥 Infos1 → تحديث البيانات من استجابة الـ API:', {
    uuid: songDataFromApi.uuid,
    is_full_release_active: songDataFromApi.is_full_release_active
  });
  
  // تحديث songData
  if (songDataFromApi.uuid) {
    songData.value = JSON.parse(JSON.stringify(songDataFromApi));
  }
  
  // تحديث formData
  if (songDataFromApi) {
    // تحديث بيانات Infos
    if (songDataFromApi.title !== undefined) formData.infos.title = songDataFromApi.title;
    if (songDataFromApi.subtitle !== undefined) formData.infos.subtitle = songDataFromApi.subtitle;
    if (songDataFromApi.song_type !== undefined) formData.infos.song_type = songDataFromApi.song_type;
    if (songDataFromApi.explicit_lyrics !== undefined) formData.infos.explicit_lyrics = songDataFromApi.explicit_lyrics;
    if (songDataFromApi.isrc !== undefined) formData.infos.isrc = songDataFromApi.isrc;
    if (songDataFromApi.title_language !== undefined) formData.infos.title_language = songDataFromApi.title_language;
    if (songDataFromApi.lyrics_language !== undefined) formData.infos.lyrics_language = songDataFromApi.lyrics_language;
    if (songDataFromApi.song_lyrics !== undefined) formData.infos.song_lyrics = songDataFromApi.song_lyrics;
    if (songDataFromApi.preview_enabled !== undefined) formData.infos.preview_enabled = songDataFromApi.preview_enabled;
    
    // تحديث بيانات Urheber
    if (songDataFromApi.authors) {
      formData.urheber.komponist = Array.isArray(songDataFromApi.authors.composer) ? 
        songDataFromApi.authors.composer : [''];
      formData.urheber.textdichter = Array.isArray(songDataFromApi.authors.lyricist) ? 
        songDataFromApi.authors.lyricist : [''];
      formData.urheber.verlag = Array.isArray(songDataFromApi.authors.verlog) ? 
        songDataFromApi.authors.verlog[0] || '' : '';
      formData.urheber.c_line = Array.isArray(songDataFromApi.authors.c_line) ? 
        songDataFromApi.authors.c_line[0] || '' : '';
    }
    
    // تحديث بيانات Mitwirkende
    if (songDataFromApi.contributors) {
      formData.mitwirkende.artist = Array.isArray(songDataFromApi.contributors.artist) ? 
        songDataFromApi.contributors.artist.map(a => a.name || '') : [''];
      formData.mitwirkende.feature = Array.isArray(songDataFromApi.contributors.feature) ? 
        songDataFromApi.contributors.feature.map(f => f.name || '') : [''];
      formData.mitwirkende.p_line = Array.isArray(songDataFromApi.contributors.p_line) ? 
        songDataFromApi.contributors.p_line[0]?.name || '' : '';
      formData.mitwirkende.produzent = Array.isArray(songDataFromApi.contributors.producer) ? 
        songDataFromApi.contributors.producer.map(p => p.name || '') : [''];
      formData.mitwirkende.weitere_mitwirkende = Array.isArray(songDataFromApi.contributors.other_contributors) ? 
        songDataFromApi.contributors.other_contributors : [];
      formData.mitwirkende.isFeatureActive = !!(Array.isArray(songDataFromApi.contributors.feature) && 
        songDataFromApi.contributors.feature.length > 0);
      formData.mitwirkende.isWeitereActive = !!(Array.isArray(songDataFromApi.contributors.other_contributors) && 
        songDataFromApi.contributors.other_contributors.length > 0);
    }
    
    // تحديث بيانات Production Year
    if (songDataFromApi.production_year !== undefined) {
      formData.mitwirkende.production_year = songDataFromApi.production_year || '';
    }
    
    // تحديث بيانات PreRelease
    if (songDataFromApi.is_pre_release_active !== undefined) {
      formData['pre-release'].isPreReleaseActive = songDataFromApi.is_pre_release_active;
    }
    if (songDataFromApi.is_full_release_active !== undefined) {
      console.log('📥 Infos1 → تحديث is_full_release_active في formData:', songDataFromApi.is_full_release_active);
      formData['pre-release'].isFullReleaseActive = songDataFromApi.is_full_release_active;
    }
    if (songDataFromApi.pre_release_image !== undefined) {
      formData['pre-release'].uploadedImage = songDataFromApi.pre_release_image;
    }
    if (songDataFromApi.release_date !== undefined) {
      formData['pre-release'].selectedReleaseDate = songDataFromApi.release_date || '';
      formData['pre-release'].isReleaseDateSelected = !!songDataFromApi.release_date;
    }
  }
  
  // إعادة تحميل المكون
  componentKey.value++;
};

// ──── تحديث songData فقط (بدون التأثير على formData) ────
const updateSongDataOnly = (newSong) => {
  console.log('📥 Infos1 → تحديث songData فقط (لا يؤثر على formData):', {
    uuid: newSong.uuid,
    title: newSong.title
  });
  
  // تحديث songData فقط (للعرض)
  songData.value = JSON.parse(JSON.stringify(newSong));
};

// ──── تجميع جميع البيانات من formData فقط ────
const compileAllData = () => {
  const allData = {
    uuid: songData.value.uuid,
  };
  
  // بيانات Infos
  Object.assign(allData, {
    title: (formData.infos.title || '').trim(),
    subtitle: formData.infos.subtitleEnabled ? 
      (formData.infos.subtitle || '').trim() : '',
    song_type: formData.infos.song_type || 'SONG',
    explicit_lyrics: formData.infos.explicit_lyrics || null,
    isrc: formData.infos.isrcEnabled ? 
      (formData.infos.isrc || '').trim().toUpperCase() : '',
    title_language: formData.infos.title_language || null,
    lyrics_language: formData.infos.lyrics_language || null,
    song_lyrics: formData.infos.lyricsEnabled ? 
      (formData.infos.song_lyrics || '').trim() : '',
    preview_enabled: formData.infos.preview_enabled || false,
  });
  
  // بيانات Urheber (بصيغة authors)
  const komponistValues = (formData.urheber.komponist || [])
    .filter(v => v && v.trim())
    .map(v => v.trim());
    
  const textdichterValues = (formData.urheber.textdichter || [])
    .filter(v => v && v.trim())
    .map(v => v.trim());
    
  const verlagValue = (formData.urheber.verlag || '').trim();
  const cLineValue = (formData.urheber.c_line || '').trim();
  
  allData.authors = {};
  if (komponistValues.length > 0) allData.authors.composer = komponistValues;
  if (textdichterValues.length > 0) allData.authors.lyricist = textdichterValues;
  if (verlagValue) allData.authors.verlog = [verlagValue];
  if (cLineValue) allData.authors.c_line = [cLineValue];
  
  // بيانات Mitwirkende (بصيغة contributors)
  const artistValues = (formData.mitwirkende.artist || [])
    .filter(v => v && v.trim())
    .map(v => ({ name: v.trim(), percentage: 0 }));
    
  const featureValues = formData.mitwirkende.isFeatureActive ? 
    (formData.mitwirkende.feature || []).filter(v => v && v.trim()).map(v => ({ name: v.trim(), percentage: 0 })) : [];
    
  const producerValues = (formData.mitwirkende.produzent || [])
    .filter(v => v && v.trim())
    .map(v => ({ name: v.trim(), percentage: 0 }));
    
  const pLineValues = formData.mitwirkende.p_line ? 
    [{ name: formData.mitwirkende.p_line.trim(), percentage: 0 }] : [];
  
  allData.contributors = {};
  if (artistValues.length > 0) allData.contributors.artist = artistValues;
  if (featureValues.length > 0) allData.contributors.feature = featureValues;
  if (producerValues.length > 0) allData.contributors.producer = producerValues;
  if (pLineValues.length > 0) allData.contributors.p_line = pLineValues;
  
  // Other contributors
  if (formData.mitwirkende.isWeitereActive && Array.isArray(formData.mitwirkende.weitere_mitwirkende)) {
    const otherValues = formData.mitwirkende.weitere_mitwirkende
      .filter(c => c.role && c.role.trim() && c.name && c.name.trim())
      .map(c => ({ 
        role: c.role.trim(), 
        name: c.name.trim(), 
        percentage: c.percentage || 0 
      }));
    if (otherValues.length > 0) allData.contributors.other_contributors = otherValues;
  }
  
  // Production Year
  if (formData.mitwirkende.production_year) {
    allData.production_year = formData.mitwirkende.production_year;
  }
  
  // بيانات Deals
  Object.assign(allData, {
    is_splitting_active: formData.deals.isSplittingActive || false,
    shares: Array.isArray(formData.deals.shares) ? formData.deals.shares : [],
  });
  
  // بيانات Pre-Release
  Object.assign(allData, {
    is_pre_release_active: formData['pre-release'].isPreReleaseActive || false,
    is_full_release_active: formData['pre-release'].isFullReleaseActive || false,
    pre_release_image: formData['pre-release'].uploadedImage || null,
    release_date: formData['pre-release'].selectedReleaseDate || null,
  });
  
  // تنظيف القيم الفارغة
  Object.keys(allData).forEach(key => {
    if (key !== 'uuid' && (allData[key] === '' || allData[key] === undefined)) {
      allData[key] = null;
    }
  });
  
  // حذف الكائنات الفارغة
  if (allData.authors && Object.keys(allData.authors).length === 0) delete allData.authors;
  if (allData.contributors && Object.keys(allData.contributors).length === 0) delete allData.contributors;
  
  console.log('📦 Infos1 → البيانات المجمعة من formData:', {
    uuid: allData.uuid,
    is_full_release_active: allData.is_full_release_active,
    totalFields: Object.keys(allData).filter(k => allData[k] !== null).length
  });
  
  return allData;
};

// ──── تعريف التبويبات ────
const tabComponents = computed(() => ({
  infos: InfosContent,
  urheber: UrheberContent,
  mitwirkende: MitwirkendeContent,
  deals: DealsContent,
  'pre-release': PreReleaseContent,
}));

const currentTabComponent = computed(() => {
  const comp = tabComponents.value[activeTabLocal.value] || InfosContent;
  return comp;
});

// ──── معالجة تحديثات النموذج من المكونات الفرعية ────
const handleFormDataUpdate = (updates) => {
  console.log('🔄 Infos1 → استقبال تحديث formData:', {
    tab: updates.tab,
    hasData: !!updates.data,
    timestamp: new Date().toISOString()
  });
  
  if (updates.tab && updates.data) {
    // تحديث البيانات للتبويب المحدد
    Object.assign(formData[updates.tab], updates.data);
    
    // تجميع جميع البيانات
    const allData = compileAllData();
    
    // جدولة الحفظ التلقائي فقط إذا كان هناك uuid
    if (allData.uuid) {
      scheduleAutoSave(allData);
    } else {
      console.warn('⚠️ Infos1 → لا يوجد uuid، تخطي الحفظ');
    }
  }
};

// ──── معالجة حفظ مباشر من المكونات الفرعية ────
const handleSaveSong = async (songDataToSave) => {
  console.log('💾 Infos1 → استقبال حدث save-song مباشر من المكون:', {
    data: songDataToSave,
    timestamp: new Date().toISOString()
  });
  
  // إرسال الحدث إلى المكون الأب
  emit('save-song', songDataToSave);
};

// ──── معالج العودة إلى Tracklist ────
const handleBackToTracklist = () => {
  console.log('🔄 Infos1 → استقبال حدث back-to-tracklist، إعادة توجيه إلى Upload2Component');
  emit('back-to-tracklist');  // إعادة توجيه الحدث إلى Upload2Component
};

// ──── جدولة الحفظ التلقائي ────
const scheduleAutoSave = (data) => {
  clearTimeout(autoSaveTimer.value);
  
  console.log('⏰ Infos1 → جدولة الحفظ التلقائي بعد 2 ثانية:', {
    uuid: data.uuid,
    is_full_release_active: data.is_full_release_active
  });
  
  autoSaveTimer.value = setTimeout(() => {
    console.log('🚀 Infos1 → تشغيل الحفظ التلقائي الآن!');
    emit('save-song', data);
    console.log('✅ Infos1 → تم إرسال حدث save-song بنجاح');
  }, 2000);
};

// ──── عند تغيير التبويب → حفظ البيانات الحالية أولاً ────
watch(
  () => props.activeTab,
  async (newTab, oldTab) => {
    if (newTab === oldTab) return;

    console.log(`🔄 Infos1 → تغيير التبويب من ${oldTab || '(بدون)'} إلى ${newTab}`);

    // حفظ البيانات الحالية قبل تغيير التبويب
    if (oldTab) {
      const allData = compileAllData();
      console.log(`💾 Infos1 → حفظ بيانات تبويب ${oldTab} قبل الانتقال`);
      emit('save-song', allData);
    }

    activeTabLocal.value = newTab;
    componentKey.value++; // إعادة render المكون

    await nextTick();
  },
  { immediate: true }
);

// ──── عند تغيير currentSong (من الـ API) ────
watch(
  () => props.currentSong,
  (newSong) => {
    console.log('📥 Infos1 → استقبال currentSong جديد من الـ API:', {
      uuid: newSong?.uuid,
      title: newSong?.title,
      is_full_release_active: newSong?.is_full_release_active
    });

    if (newSong?.uuid) {
      // تحديث songData
      updateSongDataOnly(newSong);
      
      // تحديث formData من البيانات الجديدة
      const newFormData = initFormDataFromSong(newSong);
      Object.keys(newFormData).forEach(key => {
        formData[key] = newFormData[key];
      });
      
      emit('enter-sub-layout');
    } else {
      emit('exit-sub-layout');
    }
  },
  { deep: true, immediate: true }
);

// ──── التهيئة عند التحميل ────
onMounted(async () => {
  console.log('🚀 Infos1 تم التحميل');
  await nextTick();

  if (props.currentSong?.uuid) {
    emit('enter-sub-layout');
  }
});

// تنظيف المؤقت عند إزالة المكون
onUnmounted(() => {
  if (autoSaveTimer.value) {
    clearTimeout(autoSaveTimer.value);
    console.log('🧹 Infos1 → تم تنظيف مؤقت الحفظ التلقائي');
  }
});
</script>
<style lang="scss" scoped>
.contentTrackList {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 20px;
  align-self: stretch;
  width: 100%;
  height: 100%;
  position: relative; 
  overflow-y: auto;
  padding: 20px 0px 0px 0px;
  scrollbar-width: none;
}

.no-song-selected {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 40px;
  text-align: center;
  background: rgba(38, 40, 45, 0.8);
  border-radius: 12px;
  border: 2px dashed #ff6b6b;
}

.error-icon {
  font-size: 48px;
  color: #ff6b6b;
  margin-bottom: 20px;
}

.error-title {
  color: #ff6b6b;
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 20px;
  font-family: Heebo;
}

.error-details {
  background: rgba(27, 28, 32, 0.6);
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  text-align: left;
  max-width: 400px;
}

.error-details div {
  margin: 5px 0;
  color: #aaa;
  font-family: monospace;
  font-size: 14px;
}

.back-button {
  padding: 10px 30px;
  background: #DE1456;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-family: Heebo;
  font-size: 16px;
  font-weight: 500;
  transition: background 0.3s;
}

.back-button:hover {
  background: #c0124b;
}
</style>