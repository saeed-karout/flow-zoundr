<template>
  <div class="infos-content">
    <div class="Form">
      <!-- Titel -->
      <div class="form-field">
        <div class="title">Titel</div>
        <div class="section-input" :class="{ 'is-hovered': isHoveredTitle, 'has-checkmark': formData.titleValid }"
          @mouseenter="isHoveredTitle = true" @mouseleave="isHoveredTitle = false">
          <input 
            type="text" 
            class="input-field" 
            v-model="displayTitle" 
            placeholder="Song Titel"
            @input="onTitleInput"
          />
          <div v-if="formData.titleValid" class="checkmark">
            <img src="/icon/y.png" class="icon-y" alt="checkmark icon" />
          </div>
          <div class="spacer" @click="openVideoPopup('title')">
            <div class="play" :class="{ visible: isHoveredTitle }">
              <img :src="iconPlay" class="icon" alt="play icon" />
            </div>
          </div>
        </div>
      </div>

      <!-- Untertitel -->
      <div class="form-field toggleable" :class="{ active: formData.subtitleEnabled }">
        <div class="top-line">
          <div class="title">Version / Untertitel</div>
          <div class="btn-switch" @click="toggleSubtitle">
            <img src="/icon/circle.svg" class="circle" alt="circle image" />
          </div>
        </div>
        <div class="section-input" :class="{ 
          'is-hovered': isHoveredSubtitle, 
          'has-checkmark': formData.subtitleValid 
        }" @mouseenter="isHoveredSubtitle = true" @mouseleave="isHoveredSubtitle = false">
          <input 
            type="text" 
            class="input-field" 
            v-model="formData.subtitle" 
            placeholder="Song Untertitel"
            :disabled="!formData.subtitleEnabled"
            @input="validateSubtitle" 
          />
          <div v-if="formData.subtitleValid" class="checkmark">
            <img src="/icon/y.png" class="icon-y" alt="checkmark icon" />
          </div>
          <div class="spacer" @click="openVideoPopup('subtitle')">
            <div class="play" :class="{ visible: isHoveredSubtitle }">
              <img :src="iconPlay" class="icon" alt="play icon" />
            </div>
          </div>
        </div>
      </div>

      <!-- Song Typ -->
      <div class="form-field">
        <div class="title">Song Typ</div>
        <div class="section-input" :class="{ 'is-hovered': isHoveredSongTyp, 'has-checkmark': formData.songTypValid }"
          @mouseenter="isHoveredSongTyp = true" @mouseleave="isHoveredSongTyp = false">
          <div class="custom-select" @click="toggleDropdown('songTyp')">
            <div class="select-trigger" :class="{ 'selected': formData.songTypValid }">
              {{ getSongTypLabel(formData.songTyp) || 'Bitte wählen' }}
            </div>
            <transition name="dropdown-fade">
              <div class="dropdown" v-show="isSongTypDropdownOpen">
                <div class="option" @click.stop="selectOption('songTyp', 'original')">Original</div>
                <div class="option" @click.stop="selectOption('songTyp', 'original_instrumental')">Original Instrumental</div>
                <div class="option" @click.stop="selectOption('songTyp', 'medley')">Medley</div>
                <div class="option" @click.stop="selectOption('songTyp', 'acapella')">Acapella</div>
                <div class="option" @click.stop="selectOption('songTyp', 'live_version')">Live Version</div>
              </div>
            </transition>
          </div>
          <div v-if="formData.songTypValid" class="checkmark">
            <img src="/icon/y.png" class="icon-y" alt="checkmark icon" />
          </div>
          <div v-else class="checkmark">
            <img src="/icon/icon-select.svg" class="icon-select" alt="select icon" />
          </div>
          <div class="spacer" @click="openVideoPopup('songTyp')">
            <div class="play" :class="{ visible: isHoveredSongTyp }">
              <img :src="iconPlay" class="icon" alt="play icon" />
            </div>
          </div>
        </div>
      </div>

      <!-- Explicit Lyrics -->
      <div class="form-field">
        <div class="title">Explicit Lyrics</div>
        <div class="section-input"
          :class="{ 'is-hovered': isHoveredExplicitLyrics, 'has-checkmark': formData.explicitLyricsValid }"
          @mouseenter="isHoveredExplicitLyrics = true" @mouseleave="isHoveredExplicitLyrics = false">
          <div class="custom-select" @click="toggleDropdown('explicitLyrics')">
            <div class="select-trigger" :class="{ 'selected': formData.explicitLyricsValid }">
              {{ getExplicitLyricsLabel(formData.explicitLyrics) || 'Harte Texte' }}
            </div>
            <transition name="dropdown-fade">
              <div class="dropdown" v-show="isExplicitLyricsDropdownOpen">
                <div class="option" @click.stop="selectOption('explicitLyrics', 'Yes')">Ja</div>
                <div class="option" @click.stop="selectOption('explicitLyrics', 'No')">Nein</div>
              </div>
            </transition>
          </div>
          <div v-if="formData.explicitLyricsValid" class="checkmark">
            <img src="/icon/y.png" class="icon-y" alt="checkmark icon" />
          </div>
          <div v-else class="checkmark">
            <img src="/icon/icon-select.svg" class="icon-select" alt="select icon" />
          </div>
          <div class="spacer" @click="openVideoPopup('explicitLyrics')">
            <div class="play" :class="{ visible: isHoveredExplicitLyrics }">
              <img :src="iconPlay" class="icon" alt="play icon" />
            </div>
          </div>
        </div>
      </div>

      <!-- ISRC -->
      <div class="form-field toggleable" :class="{ active: formData.isrcEnabled }">
        <div class="top-line">
          <div class="title">ISRC</div>
          <div class="btn-switch" @click="toggleIsrc">
            <img src="/icon/circle.svg" class="circle" alt="circle image" />
          </div>
        </div>
        <div class="section-input" 
          :class="{ 
            'is-hovered': isHoveredIsrc, 
            'has-checkmark': formData.isrcEnabled && formData.isrcValid 
          }"
          @mouseenter="isHoveredIsrc = true" 
          @mouseleave="isHoveredIsrc = false">
          <input 
            type="text" 
            class="input-field" 
            v-model="formData.isrc" 
            placeholder="ISRC "
            :disabled="!formData.isrcEnabled" 
            @input="onIsrcInput"
            @blur="validateIsrcFinal"
            @keydown="onIsrcKeydown"
            @paste="onIsrcPaste"
            @click.stop
            maxlength="12"
          />
          <div v-if="formData.isrcEnabled && formData.isrcValid && !formData.isrcError" class="checkmark">
            <img src="/icon/y.png" class="icon-y" alt="checkmark icon" />
          </div>
          <div class="spacer" @click="openVideoPopup('isrc')">
            <div class="play" :class="{ visible: isHoveredIsrc }">
              <img :src="iconPlay" class="icon" alt="play icon" />
            </div>
          </div>
        </div>
      </div>

      <!-- Sprache Titel -->
      <div class="form-field">
        <div class="title">Sprache Titel</div>
        <div class="section-input"
          :class="{ 'is-hovered': isHoveredTitleLanguage, 'has-checkmark': formData.titleLanguageValid }"
          @mouseenter="isHoveredTitleLanguage = true" @mouseleave="isHoveredTitleLanguage = false">
          <div class="custom-select" @click="toggleDropdown('titleLanguage')">
            <div class="select-trigger" :class="{ 'selected': formData.titleLanguageValid }">
              <input 
                type="text" 
                class="search-input-trigger" 
                v-model="titleLanguageSearch" 
                :placeholder="formData.titleLanguageValid ? getLanguageDisplayName(formData.titleLanguage) : 'Sprache suchen...'"
                @click.stop
                @input="filterTitleLanguages"
                @focus="isTitleLanguageDropdownOpen = true"
                @blur="closeTitleLanguageDropdown"
              />
            </div>
            <transition name="dropdown-fade">
              <div class="dropdown" v-show="isTitleLanguageDropdownOpen">
                <div 
                  class="option" 
                  v-for="lang in filteredTitleLanguages" 
                  :key="lang.value"
                  @click.stop="selectOption('titleLanguage', lang.value)"
                >
                  {{ lang.name }}
                </div>
                <div v-if="filteredTitleLanguages.length === 0" class="option no-results">
                  Keine Ergebnisse gefunden
                </div>
              </div>
            </transition>
          </div>
          <div v-if="formData.titleLanguageValid" class="checkmark">
            <img src="/icon/y.png" class="icon-y" alt="checkmark icon" />
          </div>
          <div v-else class="checkmark">
            <img src="/icon/icon-select.svg" class="icon-select" alt="select icon" />
          </div>
          <div class="spacer" @click="openVideoPopup('titleLanguage')">
            <div class="play" :class="{ visible: isHoveredTitleLanguage }">
              <img :src="iconPlay" class="icon" alt="play icon" />
            </div>
          </div>
        </div>
      </div>

      <!-- Sprache Text -->
      <div class="form-field">
        <div class="title">Sprache Text</div>
        <div class="section-input"
          :class="{ 'is-hovered': isHoveredTextLanguage, 'has-checkmark': formData.textLanguageValid }"
          @mouseenter="isHoveredTextLanguage = true" @mouseleave="isHoveredTextLanguage = false">
          <div class="custom-select" @click="toggleDropdown('textLanguage')">
            <div class="select-trigger" :class="{ 'selected': formData.textLanguageValid }">
              <input 
                type="text" 
                class="search-input-trigger" 
                v-model="textLanguageSearch" 
                :placeholder="formData.textLanguageValid ? getLanguageDisplayName(formData.textLanguage) : 'Sprache suchen...'"
                @click.stop
                @input="filterTextLanguages"
                @focus="isTextLanguageDropdownOpen = true"
                @blur="closeTextLanguageDropdown"
              />
            </div>
            <transition name="dropdown-fade">
              <div class="dropdown" v-show="isTextLanguageDropdownOpen">
                <div 
                  class="option" 
                  v-for="lang in filteredTextLanguages" 
                  :key="lang.value"
                  @click.stop="selectOption('textLanguage', lang.value)"
                >
                  {{ lang.name }}
                </div>
                <div v-if="filteredTextLanguages.length === 0" class="option no-results">
                  Keine Ergebnisse gefunden
                </div>
              </div>
            </transition>
          </div>
          <div v-if="formData.textLanguageValid" class="checkmark">
            <img src="/icon/y.png" class="icon-y" alt="checkmark icon" />
          </div>
          <div v-else class="checkmark">
            <img src="/icon/icon-select.svg" class="icon-select" alt="select icon" />
          </div>
          <div class="spacer" @click="openVideoPopup('textLanguage')">
            <div class="play" :class="{ visible: isHoveredTextLanguage }">
              <img :src="iconPlay" class="icon" alt="play icon" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="section2">
      <div class="Form">
        <!-- Wav File Upload -->
        <div class="form-field" :class="{ 'hidden': isLyricsExpanded }">
          <div class="title">Wav File Upload*</div>
      <div class="box" 
     @mouseenter="handleBoxMouseEnter"
     @mouseleave="handleBoxMouseLeave"
     @dragover.prevent="handleDragOver"
     @dragenter.prevent="handleDragEnter"
     @dragleave.prevent="handleDragLeave"
     @drop.prevent="handleFileDrop"
     :class="{ 'drag-over': isDragOver }">
  <div 
    v-if="!formData.fileUploaded" 
    class="upload-file" 
    ref="uploadFileRef"
  >
    <div class="upload-content">
      <div v-if="!isUploading" class="text">Song Upload per Drag & Drop</div>
      <div v-if="!isUploading" class="text-link-block">
        Oder <span @click="triggerFileInput">suche deine Datei.</span>
      </div>
      <div v-if="isUploading" class="progress-container">
        <div class="progress-wrapper">
          <CircleProgress :percent="uploadProgress" :size="200" :border-width="5" :border-bg-width="5"
            fill-color="#DE1456" empty-color="#4B5563" :show-percent="false" background="#26282D" />
          <span class="progress-text">{{ uploadProgress }}%</span>
        </div>
        <div class="text-upload">
          Dein Song wird <br>
          Gerade hochgeladen
        </div>
      </div>
    </div>
    <input type="file" accept=".wav" class="file-input" ref="fileInput" @change="handleFileSelect" hidden />
    <div class="play" :class="{ visible: isHoveredBox }"
      @click="openVideoPopup('fileUpload')">
      <img :src="iconPlay" class="icon" alt="play icon" />
    </div>
  </div>

  <div v-if="formData.fileUploaded && !isLyricsExpanded" class="song-form">
    <!-- محتوى song-form كما هو -->
    <div class="waveform-container">
      <button class="play-pause-btn" @click="togglePlayPause">
        <img :src="isPlaying ? iconPause : iconPlay" class="play-pause-icon" alt="play/pause" />
      </button>
      <div class="timer">{{ formatTime(currentTime) }}</div>
      <div id="waveform" style="width: 100%; height: 62px; position: relative;"></div>
      <div v-if="formData.previewEnabled" class="view-time-overlay" :style="viewTimeOverlayStyle">
        <svg class="play-pause-icon-red" width="16" height="16" viewBox="0 0 16 16" fill="none" @click="playPreview">
          <path d="M3 2L13 8L3 14V2Z" fill="#DD1155" />
        </svg>
        <span>00:30</span>
      </div>
      <div class="time-music">{{ formatTime(totalDuration) }}</div>
    </div>

    <div v-if="formData.fileUploaded && !isLyricsExpanded" class="uploaded-file-info">
      <div class="file-details">
        <div class="file-name">
          <div class="name">
            {{ uploadedFile?.name || 'Song uploaded' }}
          </div>
          <div class="icon-wrapper" @click="removeFile">
            <svg 
              class="trash-icon" 
              width="20" 
              height="22" 
              viewBox="0 0 20 22" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M18.7945 2.96049H16.1096V1.35802C16.1096 0.597531 15.5068 0 14.7397 0H5.23288C4.46575 0 3.86301 0.597531 3.86301 1.35802V2.96049H1.17808C0.547945 2.96049 0 3.5037 0 4.15556V6.98025H20V4.1284C19.9726 3.5037 19.4521 2.96049 18.7945 2.96049ZM5.50685 1.62963H14.4658V2.96049H5.50685V1.62963Z" fill="white"/>
              <path d="M0.986301 8.58272V20.8321C0.986301 21.4839 1.50685 22 2.16438 22H17.8356C18.4658 22 19.0137 21.4568 19.0137 20.8049V8.58272H0.986301ZM6.16438 18.2519C6.16438 18.8494 5.67123 19.3383 5.06849 19.3383C4.46575 19.3383 3.9726 18.8494 3.9726 18.2519V12.3309C3.9726 11.7333 4.46575 11.2444 5.06849 11.2444C5.67123 11.2444 6.16438 11.7333 6.16438 12.3309V18.2519ZM11.0959 18.2519C11.0959 18.8494 10.6027 19.3383 10 19.3383C9.39726 19.3383 8.90411 18.8494 8.90411 18.2519V12.3309C8.90411 11.7333 9.39726 11.2444 10 11.2444C10.6027 11.2444 11.0959 11.7333 11.0959 12.3309V18.2519ZM16.0274 18.2519C16.0274 18.8494 15.5342 19.3383 14.9315 19.3383C14.3288 19.3383 13.8356 18.8494 13.8356 18.2519V12.3309C13.8356 11.7333 14.3288 11.2444 14.9315 11.2444C15.5342 11.2444 16.0274 11.7333 16.0274 12.3309V18.2519Z" fill="white"/>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <div class="description-song">
      <span>Willst du eine Vorhörzeit von 30 sec einstellen?</span>
      <div class="switch" :class="{ active: formData.previewEnabled }" @click="togglePreviewTime">
        <div class="switch-circle"></div>
      </div>
    </div>
  </div>
</div>
        </div>

        <!-- Song Lyrics -->
        <div class="Form-field-song-text">
          <div class="top-line">
            <div class="title">Song Lyrics</div>
            <div class="switch" :class="{ active: formData.lyricsEnabled }" @click="toggleLyrics">
              <div class="switch-circle"></div>
            </div>
          </div>
          <div v-if="formData.lyricsEnabled" class="song-text" :class="{ 'expanded': isLyricsExpanded }">
            <textarea v-model="formData.song_lyrics" class="textarea" placeholder="Songtext eingeben..."
              @input="validateLyrics"></textarea>
            <div class="fade-song" :class="{ 'hidden': isLyricsExpanded }"></div>
            <div class="icons">
              <div class="icon" @click="toggleLyricsExpansion">
                <img :src="isLyricsExpanded ? '/icon/upload2/zoom-out.svg' : '/icon/upload2/zoom-out.svg'" class="zoom" alt="zoom" />
              </div>
              <img v-if="formData.song_lyrics && formData.song_lyrics.trim().length > 0" src="/icon/y.png" class="checkmark" alt="valid" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { debounce } from '@/utils/debounce';
import CircleProgress from 'vue3-circle-progress';
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.js';
import iconPlay from '@/assets/icons/play.png';
import iconPause from '@/assets/icons/pause.png';
import apiRequest from '@/lib/apiRequest';
import { useReleaseStore } from '@/stores/release';
import { storage_url } from '@/constants';

const releaseStore = useReleaseStore();

const props = defineProps({
  currentSong: {
    type: Object,
    default: () => ({})
  },
  releaseSubtitle: {
    type: String,
    default: ''
  },
  activeTab: {
    type: String,
    default: 'infos'
  }
});

const emit = defineEmits([
  'openVideoPopup',
  'update:isSubtitleSelected',
  'update:isIsrcSelected',
  'save-song',
  'show-error',
  'update:form-data',
  'update-tab-completion'
]);

// ========== حالة حفظ البيانات ==========
const isSaving = ref(false);
const saveQueue = ref([]);


const isHoveredBox = ref(false);
let boxHoverTimeout = null;


// ========== Title Debounce ==========
const titleDebounceTimer = ref(null);
const activeTabLocal = ref(props.activeTab || 'infos');

// ========== قائمة اللغات ==========
const languages = ref([]);
const titleLanguageSearch = ref('');
const textLanguageSearch = ref('');
const languagesLoaded = ref(false);

const getLanguageDisplayName = (value) => {
  if (!value) return '';
  const lang = languages.value.find(l => l.value === value);
  if (lang) return lang.name;
  if (value === 'ar') return 'Arabic';
  return value;
};

const filteredTitleLanguages = computed(() => {
  if (!titleLanguageSearch.value) return languages.value;
  const query = titleLanguageSearch.value.toLowerCase();
  return languages.value.filter(lang => 
    lang.name.toLowerCase().includes(query) || 
    lang.value.toLowerCase().includes(query)
  );
});

const filteredTextLanguages = computed(() => {
  if (!textLanguageSearch.value) return languages.value;
  const query = textLanguageSearch.value.toLowerCase();
  return languages.value.filter(lang => 
    lang.name.toLowerCase().includes(query) || 
    lang.value.toLowerCase().includes(query)
  );
});

const filterTitleLanguages = () => {};
const filterTextLanguages = () => {};

// ========== دالة للحصول على Shares افتراضية ==========
const getDefaultShares = () => [
  { name: 'Sarah Doll', role: 'Feature', percentage: 0 },
  { name: 'Louis Bell', role: 'Produzent', percentage: 0 },
  { name: 'Lina Welling', role: 'Produzent', percentage: 0 },
  { name: 'Hannah Smith', role: 'Composer', percentage: 0 }
];

// ========== تحميل اللغات ==========
const fetchLanguages = async () => {
  try {
    const response = await apiRequest.get('/languages');
    languages.value = response.data || [];
    languagesLoaded.value = true;
    await updateLanguageSearchFields();
  } catch (error) {
    console.error('❌ Failed to load languages:', error);
    languages.value = [
      { value: 'de', name: 'German' },
      { value: 'en', name: 'English' },
      { value: 'es', name: 'Spanish' },
      { value: 'fr', name: 'French' },
      { value: 'it', name: 'Italian' },
      { value: 'pt', name: 'Portuguese' },
      { value: 'nl', name: 'Dutch' },
      { value: 'pl', name: 'Polish' },
      { value: 'ru', name: 'Russian' },
      { value: 'ja', name: 'Japanese' },
      { value: 'ko', name: 'Korean' },
      { value: 'ar', name: 'Arabic' }
    ];
    languagesLoaded.value = true;
  }
};

const updateLanguageSearchFields = () => {
  if (formData.titleLanguage) {
    const lang = languages.value.find(l => l.value === formData.titleLanguage);
    titleLanguageSearch.value = lang ? lang.name : formData.titleLanguage;
  }
  if (formData.textLanguage) {
    const lang = languages.value.find(l => l.value === formData.textLanguage);
    textLanguageSearch.value = lang ? lang.name : formData.textLanguage;
  }
};

// ========== معالجة قائمة الانتظار ==========
const processSaveQueue = () => {
  if (saveQueue.value.length === 0) {
    isSaving.value = false;
    console.log('✅ InfosContent: جميع التغييرات تم حفظها');
    return;
  }
  
  const latestSave = saveQueue.value.pop();
  console.log(`📦 InfosContent: معالجة أحدث عنصر من قائمة الانتظار (${saveQueue.value.length} متبقي)`);
  saveQueue.value = [];
  
  isSaving.value = true;
  emit('save-song', latestSave);
};

const handleSaveComplete = (event) => {
  const { success, songUuid, error } = event.detail || {};
  
  if (success) {
    console.log('✅ InfosContent: تم استلام إشارة نجاح الحفظ للأغنية:', songUuid);
  } else {
    console.warn('⚠️ InfosContent: فشل الحفظ:', error);
  }
  
  isSaving.value = false;
  
  setTimeout(() => {
    if (saveQueue.value.length > 0) {
      console.log(`📦 InfosContent: معالجة ${saveQueue.value.length} عناصر في قائمة الانتظار`);
      processSaveQueue();
    } else {
      console.log('✅ InfosContent: قائمة الانتظار فارغة');
    }
  }, 200);
};

// ========== إغلاق القوائم ==========
const handleClickOutside = (event) => {
  const dropdowns = document.querySelectorAll('.custom-select');
  let clickedInside = false;
  
  dropdowns.forEach(dropdown => {
    if (dropdown.contains(event.target)) {
      clickedInside = true;
    }
  });
  
  if (!clickedInside) {
    isSongTypeDropdownOpen.value = false;
    isExplicitLyricsDropdownOpen.value = false;
    isTitleLanguageDropdownOpen.value = false;
    isTextLanguageDropdownOpen.value = false;
    isSongTypDropdownOpen.value = false;
  }
};

const closeTitleLanguageDropdown = () => {
  setTimeout(() => {
    isTitleLanguageDropdownOpen.value = false;
  }, 300);
};

const closeTextLanguageDropdown = () => {
  setTimeout(() => {
    isTextLanguageDropdownOpen.value = false;
  }, 300);
};
// ========== Box Hover Handlers ==========
const handleBoxMouseEnter = () => {
  if (boxHoverTimeout) {
    clearTimeout(boxHoverTimeout);
    boxHoverTimeout = null;
  }
  isHoveredBox.value = true;
};

const handleBoxMouseLeave = (event) => {
  const relatedTarget = event.relatedTarget;
  const box = event.currentTarget;
  
  // التحقق إذا كان الماوس انتقل إلى عنصر داخل الـ box
  if (box && box.contains(relatedTarget)) {
    return;
  }
  
  if (boxHoverTimeout) {
    clearTimeout(boxHoverTimeout);
    boxHoverTimeout = null;
  }
  
  boxHoverTimeout = setTimeout(() => {
    const boxElement = document.querySelector('.box');
    if (boxElement && boxElement.matches(':hover')) {
      return;
    }
    isHoveredBox.value = false;
    boxHoverTimeout = null;
  }, 50);
};
// ========== فتح فيديو Vimeo ==========
const openVideoPopup = (field) => {
  console.log('🎬 [InfosContent] فتح فيديو Vimeo للحقل:', field);
  emit('openVideoPopup', field);
};

const getExplicitLyricsLabel = (value) => {
  const labels = {
    'Yes': 'Ja',
    'No': 'Nein'
  };
  return labels[value] || value || '';
};

// ========== Form Data ==========
const formData = reactive({
  fullTitle: props.currentSong?.title || '',
  displayTitle: '',
  titleValid: !!props.currentSong?.title,
  subtitleEnabled: !!props.currentSong?.subtitle || false,
  subtitle: props.currentSong?.subtitle || '',
  subtitleValid: !!props.currentSong?.subtitle,
  songType: props.currentSong?.song_type || '',
  songTypeValid: !!props.currentSong?.song_type,
  songTyp: props.currentSong?.song_typ || '',
  songTypValid: true,
  explicitLyrics: props.currentSong?.explicit_lyrics || '',
  explicitLyricsValid: !!props.currentSong?.explicit_lyrics,
  isrcEnabled: !!props.currentSong?.isrc,
  isrc: props.currentSong?.isrc || '',
  isrcValid: !!props.currentSong?.isrc,
  isrcError: false,
  isrcErrorMessage: '',
  titleLanguage: props.currentSong?.title_language || '',
  titleLanguageValid: !!props.currentSong?.title_language,
  textLanguage: props.currentSong?.lyrics_language || '',
  textLanguageValid: !!props.currentSong?.lyrics_language,
  fileUploaded: !!props.currentSong?.song_file,
  fileUuid: props.currentSong?.uuid || null,
  releaseUuid: props.currentSong?.release_uuid || null,
  lyricsEnabled: !!props.currentSong?.song_lyrics,
  song_lyrics: props.currentSong?.song_lyrics || '',
  lyricsValid: !!props.currentSong?.song_lyrics,
  previewEnabled: props.currentSong?.preview_enabled || false,
  // ✅ إضافة deals و pre-release
  deals: {
    isSplittingActive: props.currentSong?.is_splitting_active || false,
    shares: props.currentSong?.shares || getDefaultShares(),
  },
  'pre-release': {
    isPreReleaseActive: props.currentSong?.is_pre_release_active || false,
    isFullReleaseActive: props.currentSong?.is_full_release_active || false,
    uploadedImage: props.currentSong?.pre_release_image || null,
    selectedReleaseDate: props.currentSong?.release_date || '',
    isReleaseDateSelected: !!props.currentSong?.release_date,
  }
});

const getSongTypLabel = (value) => {
  const labels = {
    'original': 'Original',
    'original_instrumental': 'Original Instrumental',
    'medley': 'Medley',
    'acapella': 'Acapella',
    'live_version': 'Live Version'
  };
  return labels[value] || value || '';
};

const displayTitle = computed({
  get: () => {
    if (!formData.fullTitle) return '';
    const parts = formData.fullTitle.split(' ');
    if (parts.length > 0 && /^\d{2}$/.test(parts[0])) {
      const title = parts.slice(1).join(' ');
      if (!title || title === 'Song Titel') {
        return '';
      }
      return title;
    }
    return formData.fullTitle;
  },
  set: (value) => {
    const parts = formData.fullTitle.split(' ');
    const hasNumber = parts.length > 0 && /^\d{2}$/.test(parts[0]);
    const currentNumber = hasNumber ? parts[0] : '01';
    
    const cleanValue = value?.trim() || '';
    let newFullTitle = '';
    let isValid = false;
    
    if (cleanValue === '') {
      newFullTitle = `${currentNumber} Song Titel`;
      isValid = false;
      releaseStore.setCurrentSongTitle('');
    } else if (cleanValue === 'Song Titel') {
      newFullTitle = `${currentNumber} Song Titel`;
      isValid = false;
      releaseStore.setCurrentSongTitle('');
    } else {
      newFullTitle = `${currentNumber} ${cleanValue}`;
      isValid = true;
      releaseStore.setCurrentSongTitle(cleanValue);
    }
    
    formData.fullTitle = newFullTitle;
    formData.titleValid = isValid;
  }
});

const emitSaveTitle = (titleValue) => {
  const payload = { title: titleValue };
  console.log('📤 إرسال حفظ العنوان:', payload);
  emit('save-song', payload);
};

// ========== دالة معالجة الإدخال مع debounce ==========
const onTitleInput = () => {
  if (titleDebounceTimer.value) {
    clearTimeout(titleDebounceTimer.value);
    titleDebounceTimer.value = null;
  }
  
  const parts = formData.fullTitle.split(' ');
  const hasNumber = parts.length > 0 && /^\d{2}$/.test(parts[0]);
  const currentNumber = hasNumber ? parts[0] : '01';
  
  const cleanText = displayTitle.value?.trim() || '';
  let newFullTitle = '';
  let isValid = false;
  
  if (cleanText === '') {
    newFullTitle = `${currentNumber} Song Titel`;
    isValid = false;
    releaseStore.setCurrentSongTitle('');
  } else if (cleanText === 'Song Titel') {
    newFullTitle = `${currentNumber} Song Titel`;
    isValid = false;
    releaseStore.setCurrentSongTitle('');
  } else {
    newFullTitle = `${currentNumber} ${cleanText}`;
    isValid = true;
    releaseStore.setCurrentSongTitle(cleanText);
  }
  
  formData.fullTitle = newFullTitle;
  formData.titleValid = isValid;
  
  titleDebounceTimer.value = setTimeout(() => {
    const titleToSave = isValid ? cleanText : null;
    emitSaveTitle(titleToSave);
    titleDebounceTimer.value = null;
  }, 2000);
};

// ========== ISRC ==========
const isrcRegexStrict = /^[A-Z]{2}[A-Z0-9]{3}[0-9]{2}[0-9]{5}$/;

const cleanIsrc = (isrc) => {
  return isrc.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
};

// ========== File Upload ==========
const fileInput = ref(null);
const isUploading = ref(false);
const uploadProgress = ref(0);
const uploadError = ref(null);
const uploadedFile = ref(null);
const uploadedFileInfo = ref(null);
let uploadCancelled = false;

// ========== Drag and Drop ==========
const isDragOver = ref(false);

// ========== WaveSurfer ==========
const waveSurfer = ref(null);
const isPlaying = ref(false);
const currentTime = ref(0);
const totalDuration = ref(0);
const isLyricsExpanded = ref(false);
let region = ref(null);
let isAudioLoading = false;
let audioLoaded = false;

// ========== Dropdown states ==========
const isSongTypeDropdownOpen = ref(false);
const isExplicitLyricsDropdownOpen = ref(false);
const isTitleLanguageDropdownOpen = ref(false);
const isTextLanguageDropdownOpen = ref(false);
const isSongTypDropdownOpen = ref(false);

// ========== Hover states ==========
const isHoveredTitle = ref(false);
const isHoveredSubtitle = ref(false);
const isHoveredSongType = ref(false);
const isHoveredExplicitLyrics = ref(false);
const isHoveredIsrc = ref(false);
const isHoveredTitleLanguage = ref(false);
const isHoveredTextLanguage = ref(false);
const isHoveredFileUpload = ref(false);
const isHoveredSongTyp = ref(false);

// ========== مرجع العنصر ==========
const uploadFileRef = ref(null);

// ========== متغير لتتبع وجود الماوس داخل العنصر ==========
const isMouseOverUpload = ref(false);
let hoverTimeout = null;

const handleContentMouseOver = () => {
  if (hoverTimeout) {
    clearTimeout(hoverTimeout);
    hoverTimeout = null;
  }
  isMouseOverUpload.value = true;
  isHoveredFileUpload.value = true;
};

const handleContentMouseOut = (event) => {
  const relatedTarget = event.relatedTarget;
  const uploadFile = uploadFileRef.value;
  
  if (uploadFile && uploadFile.contains(relatedTarget)) {
    return;
  }
  
  if (hoverTimeout) {
    clearTimeout(hoverTimeout);
    hoverTimeout = null;
  }
  
  hoverTimeout = setTimeout(() => {
    const isMouseInside = uploadFile?.matches(':hover');
    if (!isMouseInside) {
      isMouseOverUpload.value = false;
      isHoveredFileUpload.value = false;
    }
    hoverTimeout = null;
  }, 100);
};

const handleMouseLeave = (event) => {
  const relatedTarget = event.relatedTarget;
  const uploadFile = uploadFileRef.value;
  
  if (uploadFile && uploadFile.contains(relatedTarget)) {
    return;
  }
  
  if (hoverTimeout) {
    clearTimeout(hoverTimeout);
    hoverTimeout = null;
  }
  
  hoverTimeout = setTimeout(() => {
    isMouseOverUpload.value = false;
    isHoveredFileUpload.value = false;
    hoverTimeout = null;
  }, 50);
};

// ========== دالة saveSubtitle مع debounce ==========
const saveSubtitle = debounce((value) => {
  if (!props.currentSong?.uuid) {
    console.warn('No UUID → save subtitle stopped');
    return;
  }
  
  const finalValue = value === '' ? null : value;
  const payload = { subtitle: finalValue };
  
  const currentValue = props.currentSong?.subtitle ?? null;
  if (finalValue === currentValue) {
    console.log('ℹ️ subtitle value unchanged, skipping save');
    return;
  }
  
  console.log('📤 إرسال subtitle (من saveSubtitle):', payload);
  emit('save-song', payload);
}, 1000);

// ========== Computed ==========
const viewTimeOverlayStyle = computed(() => {
  if (!waveSurfer.value || !waveSurfer.value.isReady) return {};
  const duration = waveSurfer.value.getDuration();
  const container = document.querySelector('#waveform');
  if (!container) return {};
  const width = container.offsetWidth;
  const previewTime = Math.min(30, duration);
  const leftPosition = (previewTime / duration) * width - 49;
  return {
    left: `${leftPosition}px`,
    width: '98px',
    padding: '4px 8px',
    borderRadius: '20px',
    background: '#1B1C20',
    position: 'absolute',
    bottom: '-22px'
  };
});

const formatTime = (seconds) => {
  if (!seconds && seconds !== 0) return '00:00';
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const showToast = (message, type = 'error') => {
  if (window.toast) {
    window.toast(message, type);
  } else {
    emit('show-error', { message, type });
  }
};

// ========== Toggle Functions ==========
const toggleSubtitle = () => {
  formData.subtitleEnabled = !formData.subtitleEnabled;
  
  if (!formData.subtitleEnabled) {
    formData.subtitle = '';
    formData.subtitleValid = false;
    emit('update:isSubtitleSelected', false);
    
    if (saveSubtitle.cancel) {
      saveSubtitle.cancel();
    }
    
    const currentValue = props.currentSong?.subtitle ?? null;
    if (currentValue !== null) {
      const payload = { subtitle: null };
      console.log('📤 إرسال subtitle: null (تم إلغاء التفعيل)');
      emit('save-song', payload);
    } else {
      console.log('ℹ️ subtitle already null, skipping save');
    }
    
  } else {
    const value = formData.subtitle?.trim() || '';
    if (value) {
      formData.subtitleValid = true;
      emit('update:isSubtitleSelected', true);
      saveSubtitle(value);
    } else {
      formData.subtitleValid = false;
      emit('update:isSubtitleSelected', false);
      saveSubtitle(null);
    }
  }
};

const toggleIsrc = () => {
  formData.isrcEnabled = !formData.isrcEnabled;
  console.log('🔍 [toggleIsrc] isrcEnabled now:', formData.isrcEnabled);
  
  if (!formData.isrcEnabled) {
    formData.isrc = '';
    formData.isrcValid = false;
    formData.isrcError = false;
    formData.isrcErrorMessage = '';
    emit('update:isIsrcSelected', false);
    autoSave();
  } else {
    if (formData.isrc) {
      validateIsrcFinal();
    } else {
      autoSave();
    }
  }
};

const toggleLyrics = () => {
  formData.lyricsEnabled = !formData.lyricsEnabled;
  if (!formData.lyricsEnabled) {
    isLyricsExpanded.value = false;
    formData.song_lyrics = '';
    formData.lyricsValid = false;
    autoSave();
  }
};

const toggleLyricsExpansion = () => {
  isLyricsExpanded.value = !isLyricsExpanded.value;
};

const togglePreviewTime = () => {
  formData.previewEnabled = !formData.previewEnabled;
  if (waveSurfer.value && waveSurfer.value.isReady) {
    if (formData.previewEnabled) {
      addPreviewRegion();
    } else {
      if (region.value) {
        region.value.remove();
        region.value = null;
      }
    }
  }
  autoSave();
};

// ========== Validation ==========
const validateTitle = () => {
  formData.titleValid = formData.fullTitle.trim().length > 0;
};

const validateSubtitle = () => {
  const value = formData.subtitle?.trim() || '';
  formData.subtitleValid = formData.subtitleEnabled && value.length > 0;
  emit('update:isSubtitleSelected', formData.subtitleValid);
};

const validateLyrics = () => {
  formData.lyricsValid = formData.song_lyrics.trim().length > 0;
};

// ========== ISRC Validation ==========
const onIsrcInput = (event) => {
  const value = event.target.value || '';
  
  const cleaned = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  
  if (cleaned !== value.toUpperCase()) {
    formData.isrc = cleaned;
    event.target.value = cleaned;
    return;
  }
  
  if (cleaned.length > 12) {
    formData.isrc = cleaned.slice(0, 12);
    event.target.value = cleaned.slice(0, 12);
    return;
  }
  
  if (cleaned.length === 0) {
    formData.isrcError = false;
    formData.isrcErrorMessage = '';
    formData.isrcValid = false;
    return;
  }
  
  if (cleaned.length === 12) {
    if (isrcRegexStrict.test(cleaned)) {
      formData.isrc = cleaned;
      formData.isrcError = false;
      formData.isrcErrorMessage = '';
      formData.isrcValid = true;
      emit('update:isIsrcSelected', true);
      console.log('📤 [onIsrcInput] ISRC valid, sending autoSave with:', cleaned);
      autoSave();
    } else {
      console.log('❌ [onIsrcInput] ISRC format invalid:', cleaned);
      formData.isrcError = true;
      formData.isrcErrorMessage = 'Ungültiges ISRC-Format. Format: CCXXXYYXXXXX (z.B. DEA123456789)';
      formData.isrcValid = false;
    }
  } else {
    formData.isrcError = true;
    formData.isrcErrorMessage = `ISRC muss genau 12 Zeichen enthalten. (${cleaned.length}/12)`;
    formData.isrcValid = false;
  }
};

const validateIsrcFinal = () => {
  const rawIsrc = formData.isrc?.trim() || '';
  
  if (!rawIsrc) {
    formData.isrcError = false;
    formData.isrcErrorMessage = '';
    formData.isrcValid = false;
    if (formData.isrcEnabled) {
      autoSave();
    }
    return;
  }
  
  const cleanIsrcValue = rawIsrc.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  
  if (cleanIsrcValue !== rawIsrc.toUpperCase()) {
    formData.isrc = cleanIsrcValue;
  }
  
  if (cleanIsrcValue.length !== 12) {
    formData.isrcError = true;
    formData.isrcErrorMessage = `ISRC muss genau 12 Zeichen enthalten. (${cleanIsrcValue.length}/12)`;
    formData.isrcValid = false;
    return;
  }
  
  if (!isrcRegexStrict.test(cleanIsrcValue)) {
    formData.isrcError = true;
    formData.isrcErrorMessage = 'Ungültiges ISRC-Format. Format: CCXXXYYXXXXX (z.B. DEA123456789)';
    formData.isrcValid = false;
    return;
  }
  
  formData.isrc = cleanIsrcValue;
  formData.isrcError = false;
  formData.isrcErrorMessage = '';
  formData.isrcValid = true;
  
  if (formData.isrcEnabled) {
    emit('update:isIsrcSelected', true);
    autoSave();
  }
};

// ========== دالة autoSave ==========
const autoSave = async () => {
  if (!props.currentSong?.uuid) {
    console.warn('No UUID → auto-save stopped');
    return;
  }

  const payload = {};
  let hasChanges = false;

  let titleValue = formData.fullTitle || '';
  const cleanTitle = titleValue.replace(/^\d{2}\s/, '').trim();
  
  if (!cleanTitle || cleanTitle === 'Song Titel') {
    titleValue = null;
  }
  
  let isrcValue = null;
  if (formData.isrcEnabled) {
    const cleanIsrcValue = formData.isrc ? cleanIsrc(formData.isrc) : '';
    if (cleanIsrcValue && cleanIsrcValue.length === 12 && isrcRegexStrict.test(cleanIsrcValue)) {
      isrcValue = cleanIsrcValue;
      formData.isrc = cleanIsrcValue;
      formData.isrcError = false;
      formData.isrcErrorMessage = '';
      formData.isrcValid = true;
    } else if (cleanIsrcValue && cleanIsrcValue.length > 0) {
      isrcValue = null;
      formData.isrcValid = false;
    }
  }
  
  const fields = {
    title: titleValue,
    subtitle: formData.subtitleEnabled ? formData.subtitle : null,
    song_type: formData.songType,
    song_typ: formData.songTyp || null,
    explicit_lyrics: formData.explicitLyrics || null,
    isrc: isrcValue,
    title_language: formData.titleLanguage || null,
    lyrics_language: formData.textLanguage || null,
    song_lyrics: formData.lyricsEnabled ? formData.song_lyrics?.trim() || null : null,
    preview_enabled: formData.previewEnabled
  };

  Object.entries(fields).forEach(([key, newValue]) => {
    let oldValue = props.currentSong[key];
    if (newValue === undefined || newValue === '') newValue = null;
    if (oldValue === undefined || oldValue === '') oldValue = null;

    if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
      payload[key] = newValue;
      hasChanges = true;
    }
  });

  if (!hasChanges) {
    console.log('ℹ️ لا يوجد تغييرات');
    return;
  }

  console.log('📤 إرسال حفظ تلقائي:', payload);
  
  try {
    await emit('save-song', payload);
    if (formData.isrcEnabled && isrcValue) {
      formData.isrcError = false;
      formData.isrcErrorMessage = '';
      formData.isrcValid = true;
    }
  } catch (error) {
    console.error('❌ فشل الحفظ:', error);
    
    if (error.response?.data?.errors?.isrc) {
      const isrcErrors = error.response.data.errors.isrc;
      const isrcErrorMsg = isrcErrors.join(' ');
      
      if (isrcErrorMsg.toLowerCase().includes('already exists') || 
          isrcErrorMsg.toLowerCase().includes('duplicate') ||
          isrcErrorMsg.toLowerCase().includes('bereits verwendet') ||
          isrcErrorMsg.toLowerCase().includes('existiert bereits') ||
          isrcErrorMsg.toLowerCase().includes('must be unique')) {
        
        formData.isrcError = true;
        formData.isrcErrorMessage = 'Diese ISRC wird bereits verwendet. Bitte gib eine andere ISRC ein.';
        formData.isrcValid = false;
        showToast('Diese ISRC wird bereits verwendet. Bitte gib eine andere ISRC ein.', 'error');
      } else {
        formData.isrcError = true;
        formData.isrcErrorMessage = isrcErrorMsg;
        formData.isrcValid = false;
      }
    } else if (error.response?.data?.message) {
      showToast(error.response.data.message, 'error');
    }
  }
};

const onIsrcKeydown = (event) => {
  const allowedKeys = [
    'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
    'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
    'Home', 'End', 'PageUp', 'PageDown'
  ];
  
  if (allowedKeys.includes(event.key)) {
    return;
  }
  
  if (!/^[A-Za-z0-9]$/.test(event.key)) {
    event.preventDefault();
  }
};

const onIsrcPaste = (event) => {
  const pastedData = (event.clipboardData || window.clipboardData).getData('text');
  const cleaned = pastedData.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  
  if (cleaned !== pastedData.toUpperCase()) {
    event.preventDefault();
    const input = event.target;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const currentValue = input.value;
    
    const newValue = currentValue.substring(0, start) + cleaned + currentValue.substring(end);
    const cleanFinal = newValue.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 12);
    formData.isrc = cleanFinal;
    input.value = cleanFinal;
    
    const newCursorPos = Math.min(start + cleaned.length, cleanFinal.length);
    input.setSelectionRange(newCursorPos, newCursorPos);
    onIsrcInput({ target: input });
  }
};

// ========== Watchers ==========
watch(() => formData.isrc, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    console.log('🔄 ISRC changed:', { old: oldVal, new: newVal });
    if (formData.isrcEnabled && newVal && newVal.length === 12) {
      const clean = cleanIsrc(newVal);
      if (isrcRegexStrict.test(clean)) {
        formData.isrc = clean;
        formData.isrcValid = true;
        formData.isrcError = false;
        formData.isrcErrorMessage = '';
        autoSave();
      }
    }
  }
});

watch(() => formData.titleLanguage, (newVal) => {
  if (newVal && languagesLoaded.value) {
    titleLanguageSearch.value = getLanguageDisplayName(newVal) || newVal;
  } else if (newVal) {
    const lang = languages.value.find(l => l.value === newVal);
    titleLanguageSearch.value = lang ? lang.name : newVal;
  } else {
    titleLanguageSearch.value = '';
  }
}, { immediate: true });

watch(() => formData.textLanguage, (newVal) => {
  if (newVal && languagesLoaded.value) {
    textLanguageSearch.value = getLanguageDisplayName(newVal) || newVal;
  } else if (newVal) {
    const lang = languages.value.find(l => l.value === newVal);
    textLanguageSearch.value = lang ? lang.name : newVal;
  } else {
    textLanguageSearch.value = '';
  }
}, { immediate: true });

watch(() => formData.subtitle, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    console.log('🔄 subtitle changed:', { old: oldVal, new: newVal });
    validateSubtitle();
    
    if (formData.subtitleEnabled) {
      const valueToSend = newVal?.trim() || null;
      const storeValue = props.currentSong?.subtitle ?? null;
      if (valueToSend !== storeValue) {
        console.log('📤 إرسال subtitle (من watch):', valueToSend);
        saveSubtitle(valueToSend);
      } else {
        console.log('ℹ️ subtitle value same as store, skipping');
      }
    }
  }
}, { immediate: false });

watch(() => formData.subtitleEnabled, (newVal) => {
  console.log('🔄 subtitleEnabled changed:', newVal);
  if (!newVal) {
    formData.subtitle = '';
    formData.subtitleValid = false;
    emit('update:isSubtitleSelected', false);
    
    if (saveSubtitle.cancel) {
      saveSubtitle.cancel();
    }
    
    const payload = { subtitle: null };
    console.log('📤 إرسال subtitle: null (تم إلغاء التفعيل من watch)');
    emit('save-song', payload);
  }
});

watch(() => formData.fullTitle, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    console.log('🔄 fullTitle changed:', { old: oldVal, new: newVal });
    
    if (newVal && newVal.includes('Song Titel')) {
      const titleParts = newVal.split(' ');
      if (titleParts.length > 0 && /^\d{2}$/.test(titleParts[0])) {
        const displayText = titleParts.slice(1).join(' ');
        if (displayText === 'Song Titel') {
          console.log('📌 تم اكتشاف "Song Titel"');
        }
      }
    }
  }
}, { immediate: true });

watch(() => props.currentSong, (newSong) => {
  if (!newSong) return;
  
  console.log('🔄 InfosContent: currentSong changed, updating formData');
  
  const subtitleValue = newSong.subtitle || '';
  
  let cleanTitle = newSong.title || '';
  let titleValid = false;
  let number = '01';
  
  const releaseTitle = releaseStore.metasData?.title || '';
  
  if (cleanTitle) {
    const titleParts = cleanTitle.split(' ');
    if (titleParts.length > 0 && /^\d{2}$/.test(titleParts[0])) {
      number = titleParts[0];
      const displayTitleText = titleParts.slice(1).join(' ');
      
      if (displayTitleText && 
          displayTitleText !== 'Song Titel' && 
          displayTitleText.trim() !== '' &&
          displayTitleText !== releaseTitle) {
        cleanTitle = displayTitleText;
        titleValid = true;
      } else {
        cleanTitle = '';
        titleValid = false;
      }
    } else {
      if (cleanTitle && 
          cleanTitle !== 'Song Titel' && 
          cleanTitle.trim() !== '' &&
          cleanTitle !== releaseTitle) {
        titleValid = true;
      } else {
        cleanTitle = '';
        titleValid = false;
      }
    }
  }
  
  releaseStore.setCurrentSongNumber(number);
  releaseStore.setCurrentSongTitle(titleValid ? cleanTitle : '');
  
  if (cleanTitle && titleValid) {
    formData.fullTitle = `${number} ${cleanTitle}`;
  } else {
    formData.fullTitle = `${number} Song Titel`;
  }
  formData.titleValid = titleValid;
  
  formData.subtitleEnabled = !!subtitleValue;
  formData.subtitle = subtitleValue;
  formData.subtitleValid = !!subtitleValue;
  
  formData.songType = newSong.song_type || '';
  formData.songTypeValid = !!newSong.song_type;
  
  formData.songTyp = newSong.song_typ || '';
  formData.songTypValid = true;
  
  formData.explicitLyrics = newSong.explicit_lyrics || '';
  formData.explicitLyricsValid = !!newSong.explicit_lyrics;
  formData.isrcEnabled = !!newSong.isrc;
  formData.isrc = newSong.isrc || '';
  formData.isrcValid = !!newSong.isrc;
  formData.titleLanguage = newSong.title_language || '';
  formData.titleLanguageValid = !!newSong.title_language;
  formData.textLanguage = newSong.lyrics_language || '';
  formData.textLanguageValid = !!newSong.lyrics_language;
  formData.fileUploaded = !!newSong.song_file;
  formData.fileUuid = newSong.uuid || null;
  formData.releaseUuid = newSong.release_uuid || null;
  formData.lyricsEnabled = !!newSong.song_lyrics;
  formData.song_lyrics = newSong.song_lyrics || '';
  formData.lyricsValid = !!newSong.song_lyrics;
  formData.previewEnabled = newSong.preview_enabled || false;
  
  // ✅ تحديث deals
  formData.deals = {
    isSplittingActive: newSong.is_splitting_active || false,
    shares: newSong.shares || getDefaultShares(),
  };
  
  // ✅ تحديث pre-release
  formData['pre-release'] = {
    isPreReleaseActive: newSong.is_pre_release_active || false,
    isFullReleaseActive: newSong.is_full_release_active || false,
    uploadedImage: newSong.pre_release_image || null,
    selectedReleaseDate: newSong.release_date || '',
    isReleaseDateSelected: !!newSong.release_date,
  };
  
  formData.isrcError = false;
  formData.isrcErrorMessage = '';
  
  if (formData.titleLanguage) {
    if (languagesLoaded.value) {
      titleLanguageSearch.value = getLanguageDisplayName(formData.titleLanguage);
    } else {
      titleLanguageSearch.value = formData.titleLanguage;
    }
  } else {
    titleLanguageSearch.value = '';
  }
  
  if (formData.textLanguage) {
    if (languagesLoaded.value) {
      textLanguageSearch.value = getLanguageDisplayName(formData.textLanguage);
    } else {
      textLanguageSearch.value = formData.textLanguage;
    }
  } else {
    textLanguageSearch.value = '';
  }
  
  const newSongFile = newSong.song_file;
  const oldSongFile = props.currentSong?.song_file;
  
  if (newSongFile === oldSongFile && waveSurfer.value && waveSurfer.value.isReady) {
    console.log('⚠️ نفس الملف موجود بالفعل، تخطي التحميل');
    return;
  }
  
  if (newSongFile && newSongFile !== oldSongFile && !audioLoaded && !isAudioLoading) {
    let fileName = newSongFile;
    if (fileName.includes('/')) {
      const parts = fileName.split('/');
      fileName = parts[parts.length - 1];
    }
    
    audioLoaded = false;
    isAudioLoading = false;
    
    if (waveSurfer.value) {
      waveSurfer.value.destroy();
      waveSurfer.value = null;
    }
    
    formData.fileUploaded = true;
    uploadedFile.value = { name: fileName };
    uploadedFileInfo.value = {
      name: fileName,
      path: fileName
    };
    
    nextTick(() => {
      setTimeout(() => {
        if (!waveSurfer.value) {
          loadAudioViaProxy(fileName, fileName);
        }
      }, 500);
    });
  }
}, { deep: true, immediate: true });

// ========== رفع الملف ==========
const uploadFileToServer = async (file) => {
  if (!file) return;
  
  const songUuid = formData.fileUuid || props.currentSong?.uuid;
  const releaseUuid = formData.releaseUuid || props.currentSong?.release_uuid;
  
  if (!songUuid || !releaseUuid) {
    uploadError.value = 'No song UUID or release UUID available. Please save the song first.';
    return;
  }

  const isWav = file.type === 'audio/wav' || file.name.toLowerCase().endsWith('.wav');
  if (!isWav) {
    uploadError.value = 'Nur WAV-Dateien sind erlaubt. Bitte wähle eine .wav Datei aus.';
    return;
  }

  const maxSize = 200 * 1024 * 1024;
  if (file.size > maxSize) {
    uploadError.value = 'Dateigröße überschreitet das Limit von 200MB';
    return;
  }

  try {
    isUploading.value = true;
    uploadError.value = null;
    uploadProgress.value = 0;
    uploadedFile.value = file;
    uploadCancelled = false;

    const formDataObj = new FormData();
    formDataObj.append('song_file', file);
    formDataObj.append('_method', 'PUT');

    let currentTitle = formData.fullTitle || '';
    const cleanTitle = currentTitle.replace(/^\d{2}\s/, '').trim();
    if (cleanTitle && cleanTitle !== 'Song Titel') {
      formDataObj.append('title', cleanTitle);
    }
    
    if (formData.subtitleEnabled && formData.subtitle) {
      formDataObj.append('subtitle', formData.subtitle);
    }
    
    if (formData.songTyp) {
      formDataObj.append('song_typ', formData.songTyp);
    }
    
    if (formData.explicitLyrics) {
      formDataObj.append('explicit_lyrics', formData.explicitLyrics);
    }
    
    if (formData.isrcEnabled && formData.isrc) {
      formDataObj.append('isrc', formData.isrc);
    }
    
    if (formData.titleLanguage) {
      formDataObj.append('title_language', formData.titleLanguage);
    }
    
    if (formData.textLanguage) {
      formDataObj.append('lyrics_language', formData.textLanguage);
    }
    
    if (formData.lyricsEnabled && formData.song_lyrics) {
      formDataObj.append('song_lyrics', formData.song_lyrics);
    }
    
    if (formData.previewEnabled) {
      formDataObj.append('preview_enabled', '1');
    }

    const response = await apiRequest.post(
      `/releases/${releaseUuid}/songs/${songUuid}`,
      formDataObj,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000,
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            uploadProgress.value = percentCompleted;
          }
        }
      }
    );

    console.log('✅ Server response:', response.data);
    
    const filePath = response.data.data?.song_file;
    if (!filePath) {
      throw new Error('No file path returned from server');
    }

    let fileName = filePath;
    if (fileName.includes('/')) {
      const parts = fileName.split('/');
      fileName = parts[parts.length - 1];
    }

    formData.fileUploaded = true;
    uploadedFileInfo.value = {
      name: file.name,
      size: file.size,
      type: 'audio/wav',
      path: fileName
    };

    if (response.data.data) {
      const updatedSong = { ...props.currentSong, ...response.data.data };
      
      if (formData.fullTitle && formData.fullTitle !== 'Song Titel') {
        updatedSong.title = formData.fullTitle;
      }
      if (formData.subtitleEnabled && formData.subtitle) {
        updatedSong.subtitle = formData.subtitle;
      }
      if (formData.songTyp) {
        updatedSong.song_typ = formData.songTyp;
      }
      
      Object.assign(props.currentSong, updatedSong);
    }

    audioLoaded = false;
    isAudioLoading = false;
    
    if (waveSurfer.value) {
      waveSurfer.value.destroy();
      waveSurfer.value = null;
    }
    
    nextTick(() => {
      setTimeout(() => {
        if (!waveSurfer.value) {
          loadAudioViaProxy(fileName, file.name);
        }
      }, 500);
    });
    
    const completeData = {
      song_file: fileName,
      title: formData.fullTitle.replace(/^\d{2}\s/, '').trim(),
      subtitle: formData.subtitleEnabled ? formData.subtitle : null,
      song_typ: formData.songTyp || null,
      explicit_lyrics: formData.explicitLyrics || null,
      isrc: formData.isrcEnabled ? formData.isrc : null,
      title_language: formData.titleLanguage || null,
      lyrics_language: formData.textLanguage || null,
      song_lyrics: formData.lyricsEnabled ? formData.song_lyrics?.trim() || null : null,
      preview_enabled: formData.previewEnabled
    };
    
    Object.keys(completeData).forEach(key => {
      if (completeData[key] === '' || completeData[key] === null || completeData[key] === undefined) {
        delete completeData[key];
      }
    });
    
    emit('save-song', completeData);

  } catch (error) {
    console.error('❌ File upload failed:', error);
    uploadError.value = error.response?.data?.message || error.message || 'Upload fehlgeschlagen';
    formData.fileUploaded = false;
    uploadedFile.value = null;
    isUploading.value = false;
  } finally {
    isUploading.value = false;
  }
};

// ========== Drag and Drop Handlers ==========
const handleDragOver = (event) => {
  event.preventDefault();
  // ✅ منع انتشار الحدث إلى العناصر الأب
  event.stopPropagation();
};

const handleDragEnter = (event) => {
  event.preventDefault();
  event.stopPropagation();
  isDragOver.value = true;
};

const handleDragLeave = (event) => {
  event.preventDefault();
  event.stopPropagation();
  
  // ✅ التحقق من أن الماوس غادر الـ box بالفعل وليس عنصراً داخلياً
  const box = event.currentTarget;
  const relatedTarget = event.relatedTarget;
  
  if (box && box.contains(relatedTarget)) {
    return;
  }
  
  isDragOver.value = false;
};


const handleFileDrop = async (event) => {
  event.preventDefault();
  event.stopPropagation();
  isDragOver.value = false;
  
  const files = event.dataTransfer.files;
  if (files.length > 0) {
    const file = files[0];
    if (file.type === 'audio/wav' || file.name.toLowerCase().endsWith('.wav')) {
      await uploadFileToServer(file);
    } else {
      uploadError.value = 'Bitte wähle eine .wav Datei aus.';
      showToast('Bitte wähle eine .wav Datei aus.', 'error');
    }
  }
};

// ========== تحميل الصوت ==========
const loadAudioViaProxy = (filePath, fileName, retryCount = 0) => {
  if (isAudioLoading) {
    console.log('⚠️ Audio loading already in progress, skipping');
    return;
  }
  
  if (audioLoaded) {
    console.log('⚠️ Audio already loaded, skipping');
    return;
  }
  
  if (waveSurfer.value && waveSurfer.value.isReady) {
    console.log('⚠️ WaveSurfer already exists and ready, skipping load');
    return;
  }
  
  console.log('🔧 [loadAudioViaProxy] Input path:', filePath);
  
  // ✅ استخراج اسم الملف فقط من المسار مع الحفاظ على البادئة
  let fileNameOnly = filePath;
  if (fileNameOnly.includes('/')) {
    const parts = fileNameOnly.split('/');
    fileNameOnly = parts[parts.length - 1];
  }
  
  // ✅ ✅ ✅ لا نزيل بادئة songs_ لأنها جزء من اسم الملف
  // فقط نزيل storage_ و audio_ إذا وجدت
  fileNameOnly = fileNameOnly.replace(/^(storage_|audio_)/, '');
  
  // ✅ التأكد من أن الملف له امتداد .wav
  if (!fileNameOnly.endsWith('.wav')) {
    fileNameOnly = `${fileNameOnly}.wav`;
  }
  
  const container = document.querySelector('#waveform');
  if (!container) {
    console.warn('⚠️ Waveform container not found, waiting...');
    setTimeout(() => {
      loadAudioViaProxy(filePath, fileName, retryCount);
    }, 300);
    return;
  }
  
  isAudioLoading = true;
  
  // ✅ ✅ ✅ المسار الصحيح: /storage/audio/ + اسم الملف الكامل (مع songs_)
  const proxyUrl = `/storage/audio/${encodeURIComponent(fileNameOnly)}`;
  
  console.log('🔗 Loading audio via proxy:', proxyUrl);
  
  // ✅ استخدام apiRequest مع baseURL: '' لاستخدام المسار النسبي
  apiRequest.get(proxyUrl, {
    responseType: 'arraybuffer',
    headers: {
      'Accept': 'audio/wav, audio/*',
    },
    timeout: 120000,
    baseURL: '',
  })
  .then(response => {
    console.log('📡 Response status:', response.status);
    console.log('📡 Content-Type:', response.headers['content-type']);
    
    if (!response.data || response.data.byteLength === 0) {
      throw new Error('Empty file received');
    }
    
    const contentType = response.headers['content-type'];
    if (contentType && !contentType.includes('audio')) {
      console.error('❌ Response is not audio, it\'s:', contentType);
      throw new Error(`Server returned ${contentType} instead of audio`);
    }
    
    const arrayBuffer = response.data;
    console.log('✅ Audio loaded, size:', arrayBuffer.byteLength, 'bytes');
    
    const view = new Uint8Array(arrayBuffer);
    const isWav = view.length > 44 && 
                  view[0] === 0x52 && view[1] === 0x49 &&
                  view[2] === 0x46 && view[3] === 0x46 &&
                  view[8] === 0x57 && view[9] === 0x41 &&
                  view[10] === 0x56 && view[11] === 0x45;
    
    if (!isWav) {
      console.error('❌ Not a valid WAV file! First 12 bytes:', 
        Array.from(view.slice(0, 12)).map(b => b.toString(16)).join(' '));
      throw new Error('Invalid WAV file format');
    }
    
    const blob = new Blob([arrayBuffer], { type: 'audio/wav' });
    const blobUrl = URL.createObjectURL(blob);
    console.log('📦 Blob URL created:', blobUrl);
    
    initializeWaveSurferWithBlob(blobUrl, fileName);
    isAudioLoading = false;
  })
  .catch(error => {
    console.error('❌ Failed to load audio:', error);
    isAudioLoading = false;
    
    if (retryCount < 3) {
      console.log(`🔄 Retrying... (${retryCount + 1}/3)`);
      setTimeout(() => {
        loadAudioViaProxy(filePath, fileName, retryCount + 1);
      }, 2000);
    } else {
      uploadError.value = 'Failed to load audio file. Please try refreshing the page.';
      showToast('Fehler beim Laden der Audiodatei. Bitte versuche es erneut.', 'error');
    }
  });
};
// ========== تهيئة WaveSurfer ==========
const initializeWaveSurferWithBlob = (blobUrl, fileName) => {
  if (waveSurfer.value) {
    waveSurfer.value.destroy();
    waveSurfer.value = null;
  }
  
  nextTick(() => {
    const container = document.querySelector('#waveform');
    if (!container) {
      setTimeout(() => {
        const retryContainer = document.querySelector('#waveform');
        if (retryContainer) {
          initWaveSurfer(blobUrl, fileName);
        }
      }, 300);
      return;
    }
    
    initWaveSurfer(blobUrl, fileName);
  });
};

const initWaveSurfer = (blobUrl, fileName) => {
  const container = document.querySelector('#waveform');
  if (!container) {
    console.error('❌ Waveform container not found');
    return;
  }

  if (waveSurfer.value) {
    waveSurfer.value.destroy();
    waveSurfer.value = null;
  }

  if (!blobUrl) {
    console.error('❌ No blob URL provided');
    return;
  }

  try {
    waveSurfer.value = WaveSurfer.create({
      container: '#waveform',
      waveColor: '#808080',
      progressColor: '#DD1155',
      cursorColor: '#FFFFFF',
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      height: 62,
      responsive: true,
      normalize: true,
      plugins: [RegionsPlugin.create()],
      backend: 'WebAudio',
      audioContext: new (window.AudioContext || window.webkitAudioContext)(),
      decodeAudioData: true
    });

    waveSurfer.value.on('error', (error) => {
      console.error('❌ WaveSurfer error:', error);
      uploadError.value = 'Fehler beim Laden der Audiodatei. Bitte versuche es erneut.';
    });

    waveSurfer.value.on('ready', () => {
      totalDuration.value = waveSurfer.value.getDuration();
      if (formData.previewEnabled) addPreviewRegion();
      console.log('✅ WaveSurfer ready, duration:', totalDuration.value);
      uploadError.value = null;
      audioLoaded = true;
      isAudioLoading = false;
    });

    waveSurfer.value.on('audioprocess', (time) => {
      currentTime.value = time;
      if (formData.previewEnabled && time >= 30) {
        waveSurfer.value.pause();
        isPlaying.value = false;
        currentTime.value = 30;
      }
    });

    waveSurfer.value.on('play', () => { isPlaying.value = true; });
    waveSurfer.value.on('pause', () => { isPlaying.value = false; });
    waveSurfer.value.on('finish', () => {
      isPlaying.value = false;
      currentTime.value = 0;
    });

    waveSurfer.value.load(blobUrl);
    uploadedFile.value = { name: fileName };

  } catch (error) {
    console.error('❌ Failed to initialize WaveSurfer:', error);
    uploadError.value = 'Fehler beim Laden der Audiodatei. Bitte versuche es erneut.';
  }
};

// ========== File Handlers ==========
const triggerFileInput = () => {
  fileInput.value.click();
};

const handleFileSelect = async (event) => {
  const file = event.target.files[0];
  if (file) {
    await uploadFileToServer(file);
  }
};

// ========== حذف الملف ==========
// ========== حذف الملف ==========
const removeFile = async () => {
  const songUuid = formData.fileUuid || props.currentSong?.uuid;
  const releaseUuid = formData.releaseUuid || props.currentSong?.release_uuid;
  
  if (songUuid && releaseUuid && uploadedFileInfo.value?.path) {
    try {
      await apiRequest.post(
        `/releases/${releaseUuid}/songs/${songUuid}`,
        { song_file: null, _method: 'PUT' }
      );
      console.log('✅ File deleted from server');
    } catch (error) {
      console.error('❌ Failed to delete file:', error);
    }
  }

  emit('save-song', { song_file: null });

  formData.fileUploaded = false;
  uploadedFile.value = null;
  uploadedFileInfo.value = null;
  uploadError.value = null;
  
  if (fileInput.value) fileInput.value.value = '';
  
  if (waveSurfer.value) {
    waveSurfer.value.destroy();
    waveSurfer.value = null;
  }
  
  isPlaying.value = false;
  currentTime.value = 0;
  totalDuration.value = 0;
  audioLoaded = false;
  isAudioLoading = false;
  
  if (region.value) {
    region.value.remove();
    region.value = null;
  }
  
  isLyricsExpanded.value = false;
};
// ========== WaveSurfer Functions ==========
const togglePlayPause = () => {
  if (waveSurfer.value) waveSurfer.value.playPause();
};

const addPreviewRegion = () => {
  if (!waveSurfer.value || !waveSurfer.value.isReady) return;
  if (region.value) {
    region.value.remove();
    region.value = null;
  }
  const duration = waveSurfer.value.getDuration();
  const endTime = Math.min(30, duration);
  region.value = waveSurfer.value.addRegion({
    start: 0,
    end: endTime,
    color: 'rgba(255, 255, 255, 0.5)',
    drag: false,
    resize: false
  });
};

const playPreview = () => {
  if (waveSurfer.value) {
    waveSurfer.value.setTime(0);
    waveSurfer.value.play();
    isPlaying.value = true;
  }
};

// ========== Dropdown Functions ==========
const toggleDropdown = (field) => {
  if (field === 'songType' && isSongTypeDropdownOpen.value) {
    isSongTypeDropdownOpen.value = false;
    return;
  }
  if (field === 'explicitLyrics' && isExplicitLyricsDropdownOpen.value) {
    isExplicitLyricsDropdownOpen.value = false;
    return;
  }
  if (field === 'titleLanguage' && isTitleLanguageDropdownOpen.value) {
    isTitleLanguageDropdownOpen.value = false;
    return;
  }
  if (field === 'textLanguage' && isTextLanguageDropdownOpen.value) {
    isTextLanguageDropdownOpen.value = false;
    return;
  }
  if (field === 'songTyp' && isSongTypDropdownOpen.value) {
    isSongTypDropdownOpen.value = false;
    return;
  }
  
  isSongTypeDropdownOpen.value = false;
  isExplicitLyricsDropdownOpen.value = false;
  isTitleLanguageDropdownOpen.value = false;
  isTextLanguageDropdownOpen.value = false;
  isSongTypDropdownOpen.value = false;
  
  if (field === 'songType') {
    isSongTypeDropdownOpen.value = true;
  } else if (field === 'explicitLyrics') {
    isExplicitLyricsDropdownOpen.value = true;
  } else if (field === 'titleLanguage') {
    isTitleLanguageDropdownOpen.value = true;
    titleLanguageSearch.value = getLanguageDisplayName(formData.titleLanguage) || '';
  } else if (field === 'textLanguage') {
    isTextLanguageDropdownOpen.value = true;
    textLanguageSearch.value = getLanguageDisplayName(formData.textLanguage) || '';
  } else if (field === 'songTyp') {
    isSongTypDropdownOpen.value = true;
  }
};

const selectOption = (field, value) => {
  if (field === 'songType') {
    formData.songType = value;
    formData.songTypeValid = value.trim() !== '';
    isSongTypeDropdownOpen.value = false;
    autoSave();
  } else if (field === 'explicitLyrics') {
    formData.explicitLyrics = value;
    formData.explicitLyricsValid = value.trim() !== '';
    isExplicitLyricsDropdownOpen.value = false;
    autoSave();
  } else if (field === 'titleLanguage') {
    formData.titleLanguage = value;
    formData.titleLanguageValid = value.trim() !== '';
    titleLanguageSearch.value = getLanguageDisplayName(value);
    isTitleLanguageDropdownOpen.value = false;
    autoSave();
  } else if (field === 'textLanguage') {
    formData.textLanguage = value;
    formData.textLanguageValid = value.trim() !== '';
    textLanguageSearch.value = getLanguageDisplayName(value);
    isTextLanguageDropdownOpen.value = false;
    autoSave();
  } else if (field === 'songTyp') {
    formData.songTyp = value;
    formData.songTypValid = true;
    isSongTypDropdownOpen.value = false;
    autoSave();
  }
  
  isSongTypeDropdownOpen.value = false;
  isExplicitLyricsDropdownOpen.value = false;
  isTitleLanguageDropdownOpen.value = false;
  isTextLanguageDropdownOpen.value = false;
  isSongTypDropdownOpen.value = false;
};

// ========== Tab Completion ==========
const tabCompletion = computed(() => {
  const infosComplete = 
    formData.titleValid &&
    formData.explicitLyricsValid &&
    formData.titleLanguageValid &&
    formData.textLanguageValid;

  const urheberComplete = 
    (formData.urheber?.komponist?.length > 0 && formData.urheber.komponist.some(v => v && v.trim() !== '')) ||
    (formData.urheber?.textdichter?.length > 0 && formData.urheber.textdichter.some(v => v && v.trim() !== ''));
  
  const mitwirkendeComplete = 
    (formData.mitwirkende?.artist?.length > 0 && formData.mitwirkende.artist.some(v => v && v.trim() !== '')) ||
    (formData.mitwirkende?.produzent?.length > 0 && formData.mitwirkende.produzent.some(v => v && v.trim() !== ''));
  
  // ✅ deals دائماً true (Coming Soon)
  const dealsComplete = true;
  
  // ✅ pre-release دائماً true (لأنه غير مفعل)
  const preReleaseComplete = true;

  return {
    infos: infosComplete || false,
    urheber: urheberComplete || false,
    mitwirkende: mitwirkendeComplete || false,
    deals: dealsComplete,
    'pre-release': preReleaseComplete
  };
});
// ========== Tab Completion ==========
const isTabComplete = (tabId) => {
  // ✅ استخدام computed tabCompletion للحصول على القيم
  const completion = tabCompletion.value;
  const result = completion[tabId] || false;
  console.log(`📌 [InfosContent] isTabComplete called for ${tabId}:`, result);
  return result;
};

// ========== مراقبة formData لتحديث tabCompletion ==========
watch(
  () => formData,
  () => {
    console.log('🔄 [InfosContent] formData changed, emitting tab completion...');
    const completion = tabCompletion.value;
    // ✅ تأكد من أن deals و pre-release دائماً true
    const finalCompletion = {
      ...completion,
      deals: true,
      'pre-release': true
    };
    console.log('📤 [InfosContent] Emitting tab completion from watch:', finalCompletion);
    emit('update:form-data', {
      tab: activeTabLocal.value || 'infos',
      data: { ...finalCompletion }
    });
  },
  { deep: true, immediate: true }
);

// ========== Lifecycle ==========
onMounted(async () => {
  console.log('InfosContent mounted → currentSong:', props.currentSong);
  
  document.addEventListener('click', handleClickOutside);
  window.addEventListener('save-song-complete', handleSaveComplete);
  
  await fetchLanguages();
  updateLanguageSearchFields();
  
  const songFile = props.currentSong?.song_file;
  if (songFile && props.currentSong?.uuid && !audioLoaded && !isAudioLoading) {
    if (!waveSurfer.value) {
      let filePath = songFile;
      let fileName = filePath;
      if (fileName.includes('/')) {
        const parts = fileName.split('/');
        fileName = parts[parts.length - 1];
      }
      
      formData.fileUploaded = true;
      uploadedFile.value = { name: fileName };
      uploadedFileInfo.value = {
        name: fileName,
        path: fileName
      };
      
      nextTick(() => {
        setTimeout(() => {
          if (!waveSurfer.value) {
            loadAudioViaProxy(fileName, fileName);
          } else {
            console.log('⚠️ WaveSurfer already exists, skipping load');
          }
        }, 500);
      });
    } else {
      console.log('⚠️ WaveSurfer already exists, skipping load');
    }
  }
  
  if (formData.isrcEnabled && formData.isrc) {
    validateIsrcFinal();
  }
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  window.removeEventListener('save-song-complete', handleSaveComplete);
  
  if (saveSubtitle.cancel) {
    saveSubtitle.cancel();
  }
  
  if (titleDebounceTimer.value) {
    clearTimeout(titleDebounceTimer.value);
    titleDebounceTimer.value = null;
  }
  
  if (waveSurfer.value) {
    waveSurfer.value.destroy();
    waveSurfer.value = null;
  }
  if (region.value) {
    region.value.remove();
    region.value = null;
  }
  
  if (hoverTimeout) {
    clearTimeout(hoverTimeout);
    hoverTimeout = null;
  }
  
  if (saveQueue.value.length > 0) {
    if (!isSaving.value) {
      processSaveQueue();
    }
  }
});

defineExpose({
  validateIsrc: validateIsrcFinal,
  formData,
  autoSave,
  isTabComplete,
  tabCompletion,
  getSongTypLabel
});
</script>

<style lang="scss" scoped>
/* نفس الـ style الموجود */
.custom-select{
  width: 100%;
}

.search-input-trigger {
  background: transparent;
  border: none;
  outline: none;
  color: #FFF;
  font-family: Heebo;
  font-size: 20px;
  width: 100%;
  padding: 0;
  margin: 0;
  
  &::placeholder {
    color: #6A6C6D;
  }
  
  &:focus {
    outline: none;
  }
}

.select-trigger {
  display: flex;
  padding: 12px;
  justify-content: space-between;
  align-items: center;
  border-radius: 5px;
  background: var(--primary);
  color: #6A6C6D;
  font-family: Heebo;
  font-size: 20px;
  height: 46px;
  max-width: 100%;
  box-sizing: border-box;
  cursor: pointer;
}

.select-trigger.selected {
  color: #FFF;
}

.section-input.has-checkmark .select-trigger {
  padding-right: 94px;
}

.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.dropdown-fade-enter-from {
  opacity: 0;
  transform: translateY(-12px) scale(0.95);
}

.dropdown-fade-enter-to {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.dropdown-fade-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-12px) scale(0.95);
}

.dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: var(--primary, #1B1C20);
  border-radius: 5px;
  z-index: 100;
  max-height: 400px;
  overflow-y: auto;
  scrollbar-width: none;
  width: calc(100% + 45px);
  transform-origin: top center;
  
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    border-radius: 2px;
  }
}

.dropdown .option {
  padding: 12px 16px;
  color: #6A6C6D;
  font-family: Heebo;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  
  &:hover {
    color: #FFF;
  }
  
  &:active {
    transform: scale(0.98);
  }
}

.dropdown .no-results {
  color: var(--Main-Colors-Dove, #6A6C6D);
  cursor: default;
  padding: 12px;
  text-align: center;
  font-style: italic;
}

.Form-field-song-text .song-text {
  display: flex;
  height: 100%;
  padding: 16px 12px;
  align-items: flex-start;
  gap: 10px;
  align-self: stretch;
  border-radius: 5px;
  background: var(--Main-Colors-Slate-Dark, #1B1C20);
  opacity: 1;
  transform: translateY(0);
  transition: all 0.3s ease;
  position: relative;
}

.Form-field-song-text {
  transition: all 0.3s ease;
}

.switch {
  display: flex;
  width: 40px;
  height: 20px;
  border-radius: 10px;
  background: var(--Main-Colors-Slate-Light, #3A3E42);
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
  }
}

.switch.active {
  background: var(--Strawberry);
}

.switch .switch-circle {
  width: 16px;
  height: 16px;
  background: var(--Main-Colors-White, #FFF);
  border-radius: 50%;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: transform 0.3s ease;
}

.switch.active .switch-circle {
  transform: translateX(20px);
}

.form-field.hidden {
  opacity: 0;
  height: 0;
  margin: 0;
  padding: 0;
  overflow: hidden;
  pointer-events: none;
}

.infos-content {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 20px;
  align-self: stretch;
  width: 100%;
}

.Form {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 32px;
  min-width: 366px;
}

.section2 {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  flex: 1 0 0;
  align-self: stretch;
}

.section2 .Form {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 20px;
  align-self: stretch;
  height: 100%;
}

.section2 .Form .box {
  display: flex;
  justify-content: center;
  align-items: start;
  gap: 2px;
  border-radius: 20px;
  flex-direction: column;
  width: 100%;
  overflow: visible !important;
}

.box .upload-file {
  display: flex;
  width: 100%;
  height: 238px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 12px;
  border-radius: 20px;
  border: 3px dashed var(--Main-Colors-White, #FFF);
  background: rgba(38, 40, 45, 0.30);
  transition: background 0.3s ease;
  position: relative;
  overflow: visible !important;
}

.upload-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 12px;
  width: 100%;
  z-index: 2;
  cursor: default;
}

.upload-content .text-link-block span {
  pointer-events: auto;
  cursor: pointer;
}

// ✅ DRAG & OVER على كامل الـ BOX
.box {
  position: relative;
  transition: all 0.3s ease;
  border-radius: 20px;
  
  &.drag-over {
    .upload-file {
      // border-color: var(--Strawberry, #D15) !important;
      background: var(--secondary) !important;
      border-radius: 20px;
      transition: all 0.3s ease;

      .text-link-block span {
        text-decoration: underline;
      }
    
    }
    
    // box-shadow: 0 0 0 2px var(--Strawberry, #D15);
  }
  
  &:hover {
    .upload-file .play:not(.visible) {
      opacity: 0.3;
      right: 0;
    }
  }
}

.box .upload-file:hover {
  border-radius: 20px 0 0 20px;
  background: var(--secondary);

  .text-link-block span {
    text-decoration: underline;
  }
}

.box .uploaded-file-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 20px;
  align-self: stretch;
}

.box .song-form {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 32px;
  align-self: stretch;
  width: 100%;
  overflow: visible !important;
}

.song-form .description-song {
  display: flex;
  height: 20px;
  justify-content: space-between;
  align-items: flex-end;
  align-self: stretch;
}

.description-song span {
  color: var(--Main-Colors-White, #FFF);
  font-family: Heebo;
  font-size: 14px;
  font-style: normal;
  font-weight: 300;
  line-height: 1;
  letter-spacing: 0.7px;
  text-transform: uppercase;
}

.song-form .file-name {
  display: flex;
  justify-content: space-between;
  align-items: center;
  align-self: stretch;
  color: var(--Main-Colors-Strawberry, #D15);
  font-family: Heebo;
  font-size: 18px;
  font-style: normal;
  font-weight: 700;
  line-height: 1;
  letter-spacing: 0.9px;
}

.song-form .file-name .name {
  color: var(--Main-Colors-Strawberry, #D15);
  font-family: Heebo;
  font-size: 18px;
  font-style: normal;
  font-weight: 700;
  line-height: 1;
  letter-spacing: 0.9px;
}

.song-form .file-name .icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.song-form .file-name .icon-wrapper:hover .trash-icon path {
  fill: #DD1155;
  transition: fill 0.3s ease;
}

.file-details {
  display: flex;
  flex-direction: column;
  gap: 10px;
  color: var(--Main-Colors-White, #FFF);
  font-family: Heebo;
  font-size: 16px;
  font-weight: 400;
  text-align: center;
  width: 100%;
}

.file-name {
  font-size: 20px;
  font-weight: 700;
  text-transform: uppercase;
  display: flex;  
  justify-content: space-between;
}

.box .upload-file .play {
  display: flex;
  width: 40px;
  height: 240px;
  padding: 9px 10px;
  align-items: center;
  position: absolute;
  opacity: 0;
  right: 0;
  top: -3px;
  border-radius: 0 5px 5px 0;
  background: var(--secondary);
  transition: right 0.3s ease, opacity 0.3s ease;
  cursor: pointer;
  pointer-events: none;
  z-index: 10;
  
  &::before,
  &::after {
    display: none !important;
    content: none !important;
  }

  .icon {
    pointer-events: none;
    user-select: none;
    -webkit-user-drag: none;
    width: 18px;
    height: 20px;
    flex-shrink: 0;
    aspect-ratio: 9/10;
    transition: filter 0.3s ease;
  }

}

.box .upload-file .play.visible {
  opacity: 1;
  pointer-events: auto;
  right: -42px;
}
.box .upload-file .play.visible:hover .icon {
  filter: brightness(0) invert(1);
}

.box .upload-file:hover .play:not(.visible) {
  opacity: 0.3;
  right: 0;
}

.box .upload-file .play .icon {
  width: 18px;
  height: 20px;
  flex-shrink: 0;
  aspect-ratio: 9/10;

  &:hover {
    cursor: pointer;
  }
}

.box .text {
  color: var(--Main-Colors-White, #FFF);
  text-align: center;
  font-family: Heebo;
  font-size: 20px;
  font-style: normal;
  font-weight: 700;
  line-height: 100%;
  text-transform: uppercase;
}

.box .text-link-block {
  display: flex;
  align-items: center;
  gap: 5px;
  color: var(--Main-Colors-White, #FFF);
  font-family: Heebo;
  font-size: 20px;
  font-style: normal;
  font-weight: 700;
  line-height: 1;
  text-transform: uppercase;
}

.box .text-link-block span {
  color: var(--Strawberry);
  font-family: Heebo;
  font-size: 20px;
  font-style: normal;
  font-weight: 700;
  line-height: 1;
  text-transform: uppercase;
  cursor: pointer;
}

.section2 .Form .form-field {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 8px;
  align-self: stretch;
}

.section2 .Form-field-song-text {
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: flex-start;
  gap: 8px;
  align-self: stretch;
  height: 100%;
}

.song-text .textarea {
  flex: 1 0 0;
  color: var(--Main-Colors-White, #FFF);
  font-family: Heebo;
  font-size: 20px;
  font-style: normal;
  font-weight: 300;
  line-height: 1;
  letter-spacing: 1px;
  background: transparent;
  border: none;
  outline: none;
  resize: none;
  height: 100%;
  scroll-snap-type: none;
  scrollbar-width: none;
  padding-bottom: 24px;
}

.song-text .textarea::placeholder {
  color: var(--Main-Colors-Dove, #6A6C6D);
}

.Form-field-song-text .top-line {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  align-self: stretch;
  color: #FFF;
}

.form-field {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 8px;
  align-self: stretch;
}

.form-field .top-line {
  display: flex;
  height: 20px;
  padding-right: 37px;
  justify-content: space-between;
  align-items: center;
  align-self: stretch;
}

.form-field .title {
  color: var(--Main-Colors-White, #FFF);
  font-family: Heebo;
  font-size: 14px;
  font-style: normal;
  font-weight: 300;
  line-height: 1;
  letter-spacing: 0.7px;
  text-transform: uppercase;
}

.form-field .section-input {
  display: flex;
  align-items: center;
  gap: 2px;
  align-self: stretch;
  border-radius: 5px;
  width: 92%;
  position: relative;

  &.is-hovered,
  &:hover {
    .spacer {
      display: flex !important;
      opacity: 1;
    }

    .input-field,
    .select-trigger {
      border-radius: 5px 0 0 5px;
    }
  }

  .spacer {
    display: none;
    opacity: 0;
    transition: opacity 0.3s ease;
    width: 34px;
    height: 46px;
    padding: 9px 10px;
    align-items: center;
    border-radius: 5px;
    position: relative;
    cursor: pointer;
    position: absolute;
    right: -43px;

    &:hover {
      .play .icon {
        filter: brightness(0) invert(1);
      }
    }
    
    .play {
      display: flex;
      padding: 13px 13px;
      align-items: center;
      position: absolute;
      right: 20px;
      opacity: 0;
      border-radius: 0 5px 5px 0;
      background: var(--primary);
      transition: right 0.3s ease, opacity 0.3s ease;

      &.visible {
        right: -1px;
        opacity: 1;
      }

      .icon {
        width: 17px;
        flex-shrink: 0;
      }
    }
  }

 
}

.form-field.toggleable:not(.active) .section-input {
  pointer-events: none;
  opacity: 0.5;
}

.form-field.active .section-input {
  pointer-events: auto;
  opacity: 1;
}

.form-field .input-field {
  display: flex;
  padding: 12px;
  justify-content: space-between;
  align-items: center;
  flex: 1 0 0;
  border-radius: 5px;
  background: var(--primary);
  outline: none;
  border: 0;
  color: #fff;
  font-family: Heebo;
  font-size: 20px;
  height: 46px;
  max-width: 100%;
  box-sizing: border-box;
}

.section-input.has-checkmark .input-field {
  padding-right: 94px;
}

.section-input.has-error .input-field {
  border: 1px solid #FF4444;
}

.error-message {
  color: #FF4444;
  font-family: Heebo;
  font-size: 12px;
  font-weight: 300;
  margin-top: 4px;
  padding-left: 4px;
  animation: fadeInError 0.3s ease;
}

.error-icon {
  position: absolute;
  right: 34px;
  top: 50%;
  transform: translateY(-50%);
}

.error-icon .icon-warning {
  width: 20px;
  height: 20px;
  position: relative;
  right: 12px;
}
// ============================================
// ✅ DRAG & DROP - تطبيق drag-over على كامل الـ box
// ============================================

// ✅ DRAG & DROP - إظهار spacer عند drag-over
.box {
  position: relative;
  transition: all 0.3s ease;
  border-radius: 20px;
  
  &.drag-over {
    .upload-file {
      border-color: var(--Strawberry, #D15) !important;
      background: var(--secondary) !important;
      border-radius: 20px 0 0 20px;
      transition: all 0.3s ease;
      border-style: dashed;

      .text-link-block span {
        text-decoration: underline;
      }
    }
    
    // ✅ ✅ ✅ إظهار زر التشغيل (play) عند drag-over
    .upload-file .play {
      opacity: 1 !important;
      pointer-events: auto !important;
      right: -42px !important;
      
      .icon {
        filter: brightness(0) invert(1);
      }
    }
   
  }
  
  &:hover {
    .upload-file .play:not(.visible) {
      opacity: 0.3;
      right: 0;
    }
  }
}

// ✅ إزالة الـ drag-over القديم من .upload-file
// احذف أو علق على هذا الكود:
// .box .upload-file.drag-over { ... }
@keyframes fadeInError {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.section-input .checkmark {
  position: absolute;
  right: 0px;
  top: 50%;
  transform: translateY(-50%);
}

.section-input .checkmark .icon-y {
  width: 18px;
  position: relative;
  right: 12px;
}

.section-input .checkmark .icon-select {
  position: relative;
  right: 12px;
}

.section-input:hover .icon-select {
  filter: brightness(0) invert(1);
}

.btn-switch {
  display: flex;
  width: 40px;
  height: 20px;
  padding: 2px;
  align-items: center;
  gap: 10px;
  border-radius: 10px;
  background: var(--primary);
  cursor: pointer;
  transition: background 0.3s ease;
}

.form-field.active .btn-switch {
  background: var(--Main-Colors-Strawberry, #D15);
}

.btn-switch .circle {
  width: 16px;
  height: 16px;
  margin-left: 2px;
  transition: margin-left 0.3s ease;
}

.form-field.active .btn-switch .circle {
  margin-left: 20px;
}

.song-text .icons {
  display: flex;
  width: 24px;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  align-self: stretch;
  z-index: 100 !important;
}

.song-text .icons .icon {
  display: flex;
  padding: 1px;
  align-items: center;
  gap: 10px;
}

.song-text .icons .icon .checkmark{
  z-index: 5;
}

.text-upload {
  color: var(--Main-Colors-White, #FFF);
  font-family: Heebo;
  font-size: 20px;
  font-style: normal;
  font-weight: 700;
  line-height: 120%;
  text-transform: uppercase;
}

.progress-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.progress-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 200px;
  height: 200px;
}

.progress-text {
  position: absolute;
  color: white;
  font-size: 3rem;
  font-weight: bold;
  font-family: Heebo;
}

.waveform-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 10px;
  border-radius: 5px;
  position: relative;
  overflow: visible !important;
}

#waveform {
  width: 100%;
  height: 62px;
  cursor: pointer;
}

.timer {
  position: absolute;
  left: 75px;
  display: flex;
  padding: 4px 8px;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
  background: rgba(27, 28, 32, 0.30);
  transition: background 0.3s ease, color 0.3s ease;
  color: #ffffff6b;
  font-family: Heebo;
  font-size: 10px;
  font-style: normal;
  font-weight: 300;
  line-height: 1;
  letter-spacing: 0.5px;
  z-index: 10;
  cursor: pointer;

  &:hover {
    background: #1B1C20;
    color: #FFF;
  }
}

.time-music {
  position: absolute;
  right: 20px;
  display: flex;
  padding: 4px 8px;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
  background: rgba(27, 28, 32, 0.30);
  transition: background 0.3s ease, color 0.3s ease;
  color: #ffffff6b;
  font-family: Heebo;
  font-size: 10px;
  font-style: normal;
  font-weight: 300;
  line-height: 1;
  letter-spacing: 0.5px;
  z-index: 10;
  cursor: pointer;

  &:hover {
    background: #1B1C20;
    color: #FFF;
  }
}

.play-pause-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 13px;
  gap: 10px;
  border-radius: 200px;
  background: var(--primary);
  border: none;
  cursor: pointer;
  transition: background 0.3s ease;
}

.play-pause-btn:hover {
  background: #D15;
}

.play-pause-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
  filter: brightness(0) invert(1);
}

.view-time-overlay {
  display: flex;
  width: 98px;
  padding: 4px 8px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  position: absolute;
  left: 90px;
  bottom: -22px;
  border-radius: 20px;
  background: var(--Main-Colors-Slate-Dark, #1B1C20);
}

.view-time-overlay span{
  color: #FFF;
  font-family: Heebo;
  font-size: 14px;
  font-style: normal;
  font-weight: 300;
  line-height: normal;
  letter-spacing: 0.7px;
}

.play-pause-icon-red {
  cursor: pointer;
}

.fade-song{
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 52px;
  background: linear-gradient(180deg, rgba(27, 28, 32, 0.00) 0%, var(--Main-Colors-Slate-Dark, #1B1C20) 100%);
  border-radius: 0 0 5px 5px;
}

.zoom{
  cursor: pointer;
}

@media (min-width:1440px) and (max-width:1599px) {
  .Form{
    gap: 20px;
    min-width: 300px;
  }

  .box .upload-file .play{
    height: 215px;
  }
  .Form-field-song-text .song-text{
    min-height: 295px;
  }

  .form-field .title{
    font-size: 12px;
  }

  .top-line .title{
    font-size: 12px;
  }

  .box .upload-file{
    height: 213px;
  }
}

@media (min-width:1600px) and (max-width:2074px){
  .Form{
    min-width: 366px;
  }
}

@media (min-width:2075px) and (max-width:2560px){
  .Form{
    min-width: 520px;
  }
}
</style>