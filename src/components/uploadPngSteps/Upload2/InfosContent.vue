<template>
  <div class="infos-content">
    <div class="Form">
      <!-- Titel -->
      <div class="form-field">
        <div class="title">Titel</div>
        <div class="section-input" :class="{ 'is-hovered': isHoveredTitle, 'has-checkmark': formData.titleValid }"
          @mouseenter="isHoveredTitle = true" @mouseleave="isHoveredTitle = false">
          <input type="text" class="input-field" v-model="formData.title" placeholder="Song Titel"
            @input="validateTitle" />
          <div v-if="formData.titleValid" class="checkmark">
            <img src="/icon/y.png" class="icon-y" alt="checkmark icon" />
          </div>
          <div class="spacer" @click="$emit('openVideoPopup', 'title')">
            <div class="play" :class="{ visible: isHoveredTitle }">
              <img :src="iconPlay" class="icon" alt="play icon" />
            </div>
          </div>
        </div>
      </div>

      <!-- Untertitel -->
      <div class="form-field toggleable" :class="{ active: formData.subtitleEnabled }">
        <div class="top-line">
          <div class="title">Gibt es einen Untertitel?</div>
          <div class="btn-switch" @click="toggleSubtitle">
            <img src="/icon/circle.svg" class="circle" alt="circle image" />
          </div>
        </div>
        <div class="section-input" :class="{ 'is-hovered': isHoveredSubtitle, 'has-checkmark': formData.subtitleValid }"
          @mouseenter="isHoveredSubtitle = true" @mouseleave="isHoveredSubtitle = false">
          <input type="text" class="input-field" v-model="formData.subtitle" placeholder="Untertitel"
            :disabled="!formData.subtitleEnabled" @input="validateSubtitle" />
          <div v-if="formData.subtitleValid" class="checkmark">
            <img src="/icon/y.png" class="icon-y" alt="checkmark icon" />
          </div>
          <div class="spacer" @click="$emit('openVideoPopup', 'subtitle')">
            <div class="play" :class="{ visible: isHoveredSubtitle }">
              <img :src="iconPlay" class="icon" alt="play icon" />
            </div>
          </div>
        </div>
      </div>

      <!-- Song Typ -->
      <div class="form-field">
        <div class="title">Song Typ</div>
        <div class="section-input" :class="{ 'is-hovered': isHoveredSongType, 'has-checkmark': formData.songTypeValid }"
          @mouseenter="isHoveredSongType = true" @mouseleave="isHoveredSongType = false">
          <div class="custom-select" @click="toggleDropdown('songType')">
            <div class="select-trigger" :class="{ 'selected': formData.songTypeValid }">
              {{ formData.songType || 'Song Typ' }}
            </div>
            <div class="dropdown" v-show="isSongTypeDropdownOpen">
              <div class="option" @click.stop="selectOption('songType', 'Original')">Original</div>
              <div class="option" @click.stop="selectOption('songType', 'Cover')">Cover</div>
              <div class="option" @click.stop="selectOption('songType', 'Remix')">Remix</div>
            </div>
          </div>
          <div v-if="formData.songTypeValid" class="checkmark">
            <img src="/icon/y.png" class="icon-y" alt="checkmark icon" />
          </div>
          <div v-else class="checkmark">
            <img src="/icon/icon-select.svg" class="icon-select" alt="select icon" />
          </div>
          <div class="spacer" @click="$emit('openVideoPopup', 'songType')">
            <div class="play" :class="{ visible: isHoveredSongType }">
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
              {{ formData.explicitLyrics || 'Explicit Lyrics' }}
            </div>
            <div class="dropdown" v-show="isExplicitLyricsDropdownOpen">
              <div class="option" @click.stop="selectOption('explicitLyrics', 'Yes')">Yes</div>
              <div class="option" @click.stop="selectOption('explicitLyrics', 'No')">No</div>
            </div>
          </div>
          <div v-if="formData.explicitLyricsValid" class="checkmark">
            <img src="/icon/y.png" class="icon-y" alt="checkmark icon" />
          </div>
          <div v-else class="checkmark">
            <img src="/icon/icon-select.svg" class="icon-select" alt="select icon" />
          </div>
          <div class="spacer" @click="$emit('openVideoPopup', 'explicitLyrics')">
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
        <div class="section-input" :class="{ 'is-hovered': isHoveredIsrc, 'has-checkmark': formData.isrcValid }"
          @mouseenter="isHoveredIsrc = true" @mouseleave="isHoveredIsrc = false">
          <input type="text" class="input-field" v-model="formData.isrc" placeholder="ISRC"
            :disabled="!formData.isrcEnabled" @input="validateIsrc" />
          <div v-if="formData.isrcValid" class="checkmark">
            <img src="/icon/y.png" class="icon-y" alt="checkmark icon" />
          </div>
          <div class="spacer" @click="$emit('openVideoPopup', 'isrc')">
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
              {{ formData.titleLanguage || 'Sprache Titel' }}
            </div>
            <div class="dropdown" v-show="isTitleLanguageDropdownOpen">
              <div class="option" @click.stop="selectOption('titleLanguage', 'German')">German</div>
              <div class="option" @click.stop="selectOption('titleLanguage', 'English')">English</div>
              <div class="option" @click.stop="selectOption('titleLanguage', 'Spanish')">Spanish</div>
            </div>
          </div>
          <div v-if="formData.titleLanguageValid" class="checkmark">
            <img src="/icon/y.png" class="icon-y" alt="checkmark icon" />
          </div>
          <div v-else class="checkmark">
            <img src="/icon/icon-select.svg" class="icon-select" alt="select icon" />
          </div>
          <div class="spacer" @click="$emit('openVideoPopup', 'titleLanguage')">
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
              {{ formData.textLanguage || 'Sprache Text' }}
            </div>
            <div class="dropdown" v-show="isTextLanguageDropdownOpen">
              <div class="option" @click.stop="selectOption('textLanguage', 'German')">German</div>
              <div class="option" @click.stop="selectOption('textLanguage', 'English')">English</div>
              <div class="option" @click.stop="selectOption('textLanguage', 'Spanish')">Spanish</div>
            </div>
          </div>
          <div v-if="formData.textLanguageValid" class="checkmark">
            <img src="/icon/y.png" class="icon-y" alt="checkmark icon" />
          </div>
          <div v-else class="checkmark">
            <img src="/icon/icon-select.svg" class="icon-select" alt="select icon" />
          </div>
          <div class="spacer" @click="$emit('openVideoPopup', 'textLanguage')">
            <div class="play" :class="{ visible: isHoveredTextLanguage }">
              <img :src="iconPlay" class="icon" alt="play icon" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="section2">
      <div class="Form">
        <!-- Wav File Upload – رفع حقيقي الآن -->
        <div class="form-field" :class="{ 'hidden': isLyricsExpanded }">
          <div class="title">Wav File Upload*</div>
          <div class="box">
            <div v-if="!formData.fileUploaded" class="upload-file" @dragover.prevent @drop="handleFileDrop"
              @mouseenter="isHoveredFileUpload = true" @mouseleave="isHoveredFileUpload = false">
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
              <input type="file" accept=".wav" class="file-input" ref="fileInput" @change="handleFileSelect" hidden />
              <div class="play" :class="{ visible: isHoveredFileUpload }"
                @click="$emit('openVideoPopup', 'fileUpload')">
                <img :src="iconPlay" class="icon" alt="play icon" />
              </div>
            </div>

            <div v-if="formData.fileUploaded && !isLyricsExpanded" class="song-form">
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
                    <div class="">
                      <img src="/icon/tresh.svg" class="icon" alt="remove" @click="removeFile" />
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
            <textarea v-model="formData.song_lyrics" class="textarea" placeholder="Enter song lyrics..."
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

const props = defineProps({
  currentSong: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits([
  'openVideoPopup',
  'update:isSubtitleSelected',
  'update:isIsrcSelected',
  'save-song'
]);

// ========== Form Data - متوافق مع API ==========
const formData = reactive({
  title: props.currentSong?.title || '',
  titleValid: !!props.currentSong?.title,
  subtitleEnabled: !!props.currentSong?.subtitle,
  subtitle: props.currentSong?.subtitle || '',
  subtitleValid: !!props.currentSong?.subtitle,
  songType: props.currentSong?.song_type || '',
  songTypeValid: !!props.currentSong?.song_type,
  explicitLyrics: props.currentSong?.explicit_lyrics || '',
  explicitLyricsValid: !!props.currentSong?.explicit_lyrics,
  isrcEnabled: !!props.currentSong?.isrc,
  isrc: props.currentSong?.isrc || '',
  isrcValid: !!props.currentSong?.isrc,
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
});

// ========== File Upload ==========
const fileInput = ref(null);
const isUploading = ref(false);
const uploadProgress = ref(0);
const uploadError = ref(null);
const uploadedFile = ref(null);
const uploadedFileInfo = ref(null);
let uploadCancelled = false;
let progressInterval = null;

// ========== WaveSurfer ==========
const waveSurfer = ref(null);
const isPlaying = ref(false);
const currentTime = ref(0);
const totalDuration = ref(0);
const isLyricsExpanded = ref(false);
let region = ref(null);

// ========== Dropdown states ==========
const isSongTypeDropdownOpen = ref(false);
const isExplicitLyricsDropdownOpen = ref(false);
const isTitleLanguageDropdownOpen = ref(false);
const isTextLanguageDropdownOpen = ref(false);

// ========== Hover states ==========
const isHoveredTitle = ref(false);
const isHoveredSubtitle = ref(false);
const isHoveredSongType = ref(false);
const isHoveredExplicitLyrics = ref(false);
const isHoveredIsrc = ref(false);
const isHoveredTitleLanguage = ref(false);
const isHoveredTextLanguage = ref(false);
const isHoveredFileUpload = ref(false);

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

// ========== Format time ==========
const formatTime = (seconds) => {
  if (!seconds && seconds !== 0) return '00:00';
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// ========== Auto-save ==========
const autoSave = debounce(() => {
  if (!props.currentSong?.uuid) {
    console.warn('No UUID → auto-save stopped');
    return;
  }

  const payload = {};
  let hasChanges = false;

  const fields = {
    title: formData.title,
    subtitle: formData.subtitleEnabled ? formData.subtitle : null,
    song_type: formData.songType,
    explicit_lyrics: formData.explicitLyrics || null,
    isrc: formData.isrcEnabled ? formData.isrc : null,
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
      console.log(`🔄 تغيير في ${key}:`, { قديم: oldValue, جديد: newValue });
    }
  });

  if (!hasChanges) {
    console.log('ℹ️ لا يوجد تغييرات');
    return;
  }

  console.log('📤 إرسال حفظ تلقائي:', payload);
  emit('save-song', payload);
}, 2000);

// ========== Watch for changes ==========
watch(formData, () => {
  autoSave();
}, { deep: true });

// ========== رفع الملف عبر axios مع FormData (رفع حقيقي) ==========
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

  const maxSize = 100 * 1024 * 1024;
  if (file.size > maxSize) {
    uploadError.value = 'Dateigröße überschreitet das Limit von 100MB';
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

    const response = await apiRequest.post(
      `/releases/${releaseUuid}/songs/${songUuid}`,
      formDataObj,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            uploadProgress.value = percentCompleted;
            console.log(`📤 Upload progress: ${percentCompleted}%`);
          }
        }
      }
    );

    console.log('✅ Server response:', response.data);

    const filePath = response.data.song_file || response.data.data?.song_file;
    
    if (filePath) {
      console.log('✅ File uploaded successfully, path:', filePath);
      
      const cleanPath = filePath.replace(/^\/+/, '');
      
      formData.fileUploaded = true;
      
      uploadedFileInfo.value = {
        name: file.name,
        size: file.size,
        type: 'audio/wav',
        path: cleanPath
      };
      
      // تحديث currentSong مؤقتاً
      if (props.currentSong) {
        props.currentSong.song_file = cleanPath;
      }
      
      nextTick(() => {
        // استخدام proxy بدلاً من الرابط المباشر
        loadAudioViaProxy(cleanPath, file.name);
      });
    }

    isUploading.value = false;

  } catch (error) {
    console.error('❌ File upload failed:', error);
    uploadError.value = error.response?.data?.message || error.message || 'Upload fehlgeschlagen';
    formData.fileUploaded = false;
    uploadedFile.value = null;
    isUploading.value = false;
  }
};

// ========== تحميل الصوت عبر proxy لتجنب CORS ==========
const loadAudioViaProxy = (filePath, fileName) => {
  const proxyUrl = `/storage/${filePath.replace(/^\/+/, '')}`;
  console.log('🔗 Loading audio via proxy:', proxyUrl);
  
  // استخدام fetch للحصول على الملف كـ blob
  fetch(proxyUrl, {
    method: 'GET',
    mode: 'cors',
    credentials: 'omit',
    headers: {
      'Accept': 'audio/wav, audio/*',
      'X-Requested-With': 'XMLHttpRequest',
    }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.blob();
  })
  .then(blob => {
    console.log('✅ Audio loaded as blob, size:', blob.size);
    const blobUrl = URL.createObjectURL(blob);
    initializeWaveSurferWithBlob(blobUrl, fileName);
  })
  .catch(error => {
    console.error('❌ Failed to load audio via proxy:', error);
    // محاولة بديلة باستخدام XHR
    loadAudioViaXHR(filePath, fileName);
  });
};

// ========== تحميل الصوت عبر XHR ==========
const loadAudioViaXHR = (filePath, fileName) => {
  const proxyUrl = `/storage/${filePath.replace(/^\/+/, '')}`;
  console.log('📥 Loading audio via XHR from:', proxyUrl);
  
  const xhr = new XMLHttpRequest();
  xhr.open('GET', proxyUrl, true);
  xhr.responseType = 'blob';
  xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
  
  xhr.onload = function() {
    if (this.status === 200) {
      const blob = this.response;
      console.log('✅ Audio loaded via XHR, size:', blob.size);
      const blobUrl = URL.createObjectURL(blob);
      initializeWaveSurferWithBlob(blobUrl, fileName);
    } else {
      console.error('❌ XHR failed:', this.status);
    }
  };
  
  xhr.onerror = function() {
    console.error('❌ XHR network error');
  };
  
  xhr.send();
};

// ========== تهيئة WaveSurfer مع Blob URL ==========
const initializeWaveSurferWithBlob = (blobUrl, fileName) => {
  const container = document.querySelector('#waveform');
  if (!container) return;

  if (waveSurfer.value) {
    waveSurfer.value.destroy();
    waveSurfer.value = null;
  }

  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, container.offsetWidth, 0);
    gradient.addColorStop(0, '#808080');
    gradient.addColorStop(0.5, '#FFFFFF');
    gradient.addColorStop(1, '#808080');

    const progressGradient = ctx.createLinearGradient(0, 0, container.offsetWidth, 0);
    progressGradient.addColorStop(0, '#DD1155');
    progressGradient.addColorStop(0.5, '#DD1155');
    progressGradient.addColorStop(1, '#DD1155');

    waveSurfer.value = WaveSurfer.create({
      container: '#waveform',
      waveColor: gradient,
      progressColor: progressGradient,
      cursorColor: '#FFFFFF',
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      height: 62,
      responsive: true,
      normalize: true,
      plugins: [RegionsPlugin.create()],
      backend: 'WebAudio',
    });

    waveSurfer.value.on('ready', () => {
      totalDuration.value = waveSurfer.value.getDuration();
      if (formData.previewEnabled) addPreviewRegion();
      console.log('✅ WaveSurfer ready, duration:', totalDuration.value);
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
    console.error('Failed to initialize WaveSurfer:', error);
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

const handleFileDrop = async (event) => {
  event.preventDefault();
  const file = event.dataTransfer.files[0];
  if (file) {
    await uploadFileToServer(file);
  }
};

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

// ========== Toggle Functions ==========
const toggleSubtitle = () => {
  formData.subtitleEnabled = !formData.subtitleEnabled;
  if (!formData.subtitleEnabled) {
    formData.subtitle = '';
    formData.subtitleValid = false;
    emit('update:isSubtitleSelected', false);
  }
};

const toggleIsrc = () => {
  formData.isrcEnabled = !formData.isrcEnabled;
  if (!formData.isrcEnabled) {
    formData.isrc = '';
    formData.isrcValid = false;
    emit('update:isIsrcSelected', false);
  }
};

const toggleLyrics = () => {
  formData.lyricsEnabled = !formData.lyricsEnabled;
  
  if (!formData.lyricsEnabled) {
    isLyricsExpanded.value = false;
    formData.song_lyrics = '';
    formData.lyricsValid = false;
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
};

// ========== Dropdown Functions ==========
const toggleDropdown = (field) => {
  isSongTypeDropdownOpen.value = field === 'songType' ? !isSongTypeDropdownOpen.value : false;
  isExplicitLyricsDropdownOpen.value = field === 'explicitLyrics' ? !isExplicitLyricsDropdownOpen.value : false;
  isTitleLanguageDropdownOpen.value = field === 'titleLanguage' ? !isTitleLanguageDropdownOpen.value : false;
  isTextLanguageDropdownOpen.value = field === 'textLanguage' ? !isTextLanguageDropdownOpen.value : false;
};

const selectOption = (field, value) => {
  if (field === 'songType') {
    formData.songType = value;
    formData.songTypeValid = value.trim() !== '';
    isSongTypeDropdownOpen.value = false;
  } else if (field === 'explicitLyrics') {
    formData.explicitLyrics = value;
    formData.explicitLyricsValid = value.trim() !== '';
    isExplicitLyricsDropdownOpen.value = false;
  } else if (field === 'titleLanguage') {
    formData.titleLanguage = value;
    formData.titleLanguageValid = value.trim() !== '';
    isTitleLanguageDropdownOpen.value = false;
  } else if (field === 'textLanguage') {
    formData.textLanguage = value;
    formData.textLanguageValid = value.trim() !== '';
    isTextLanguageDropdownOpen.value = false;
  }
};

// ========== Validation Functions ==========
const validateTitle = () => {
  formData.titleValid = formData.title.trim().length > 0;
};

const validateSubtitle = () => {
  formData.subtitleValid = formData.subtitleEnabled && formData.subtitle.trim().length > 0;
  emit('update:isSubtitleSelected', formData.subtitleValid);
};

const validateIsrc = () => {
  const isrcRegex = /^[A-Z]{2}-?[A-Z0-9]{3}-?[0-9]{2}-?[0-9]{5}$/;
  formData.isrcValid = formData.isrcEnabled && isrcRegex.test(formData.isrc);
  emit('update:isIsrcSelected', formData.isrcValid);
};

const validateLyrics = () => {
  formData.lyricsValid = formData.song_lyrics.trim().length > 0;
};

// ========== Lifecycle ==========
onMounted(() => {
  console.log('InfosContent mounted → currentSong:', props.currentSong);
  
  if (props.currentSong?.song_file && props.currentSong?.uuid) {
    const filePath = props.currentSong.song_file;
    const fileName = filePath.split('/').pop() || 'audio.wav';
    
    console.log('🔗 Loading existing audio from path:', filePath);
    
    formData.fileUploaded = true;
    uploadedFile.value = { name: fileName };
    uploadedFileInfo.value = {
      name: fileName,
      path: filePath
    };
    
    nextTick(() => {
      loadAudioViaProxy(filePath, fileName);
    });
  }
});

onUnmounted(() => {
  if (waveSurfer.value) {
    waveSurfer.value.destroy();
    waveSurfer.value = null;
  }
  if (region.value) {
    region.value.remove();
    region.value = null;
  }
});
</script>




<style lang="scss" scoped>
/* إضافة هذه الأنماط الجديدة */

/* تحسين ظهور واختفاء song-text */
.Form-field-song-text .song-text {
  display: flex;
  // height: 334px;
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
  // width: 660px;
  position: relative;
  
  &.expanded {
    // height: 640px;
  }
}

/* إضافة تأثيرات انتقالية للظهور والاختفاء */
.Form-field-song-text {
  transition: all 0.3s ease;
}

/* تحسين مظهر التبديل */
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

/* إخفاء قسم رفع الملف عند التوسيع */
.form-field.hidden {
  opacity: 0;
  height: 0;
  margin: 0;
  padding: 0;
  overflow: hidden;
  pointer-events: none;
}

/* بقية الأنماط تبقى كما هي ... */

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
  // width: 470px;
  flex-direction: column;
  align-items: flex-start;
  gap: 32px;
  min-width: 366px;
}

.section2 {
  display: flex;
  padding-right: 40px;
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
  // width: 100%;
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
  border: 2px dashed var(--Main-Colors-White, #FFF);
  background: rgba(38, 40, 45, 0.30);
  transition: background 0.3s ease;
  position: relative;
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

.song-form .file-name .name{
  color: var(--Main-Colors-Strawberry, #D15);

font-family: Heebo;
font-size: 18px;
font-style: normal;
font-weight: 700;
line-height: 1;
letter-spacing: 0.9px;
}

.file-details {
  display: flex;
  flex-direction: column;
  // align-items: center;/
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

.file-size {
  font-size: 14px;
  color: var(--Main-Colors-Dove, #6A6C6D);
}

.file-actions {
  display: flex;
  gap: 10px;
}

.replace-btn,
.remove-btn {
  padding: 8px 16px;
  border-radius: 5px;
  background: var(--Strawberry);
  color: var(--Main-Colors-White, #FFF);
  font-family: Heebo;
  font-size: 14px;
  font-weight: 400;
  text-transform: uppercase;
  border: none;
  
  transition: background 0.3s ease;

  &:hover{
  }
}

.replace-btn:hover,
.remove-btn:hover {
  background: var(--Main-Colors-Strawberry, #D15);
  cursor: pointer;

}

.box .upload-file:hover {
  background: var(--secondary);
  border-radius: 20px 0 0 20px;
}

.box .upload-file .play {
  display: flex;
  width: 34px;
  height: 238px;
  padding: 9px 10px;
  align-items: center;
  position: absolute;
  right: -0px;
  top: 1;
  opacity: 0;
  border-radius: 0 5px 5px 0;
  background: var(--secondary);
  transition: right 0.3s ease, opacity 0.3s ease;
  cursor: pointer;
}

.box .upload-file .play.visible {
  right: -38px;
  opacity: 1;
  z-index: 2;
}

.box .upload-file .play .icon {
  width: 18px;
  height: 20px;
  flex-shrink: 0;
  aspect-ratio: 9/10;
}

.box .upload-file:hover .play .icon {
  filter: brightness(0) invert(1);
}

.box .spacer {
  display: none;
  width: 34px;
  height: 238px;
  padding: 9px 10px;
  align-items: center;
  border-radius: 5px;
  position: relative;
}

.box .upload-file:hover+.spacer,
.box .spacer.file-uploaded {
  display: flex;
}

.box .spacer .checkmark {
  position: absolute;
  right: 34px;
  top: 50%;
  transform: translateY(-50%);
}

.box .spacer .checkmark .icon-y {
  width: 18px;
  position: relative;
  right: 12px;
  z-index: 5;
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
  // height: 100%;
}

.song-text .textarea::placeholder {
  color: var(--Main-Colors-Dove, #6A6C6D);
}

.Form-field-song-text .top-line {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  align-self: stretch;
  // width: 660px;
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
    border-radius: 0 5px 5px 0;
    background: var(--secondary);
    cursor: pointer;
    position: absolute;
    right: -36px;

    .play {
      display: flex;
      padding: 13px 9px;
      align-items: center;
      position: absolute;
      right: 20px;
      opacity: 0;
      border-radius: 0 5px 5px 0;
      background: var(--primary);
      transition: right 0.3s ease, opacity 0.3s ease;

      &.visible {
        right: -2px;
        opacity: 1;
      }

      .icon {
        width: 18px;
        height: 20px;
        flex-shrink: 0;
        aspect-ratio: 9/10;
      }
    }
  }

  &:hover .spacer .play .icon {
    filter: brightness(0) invert(1);
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
  font-size: 16px;
  height: 46px;
  max-width: 100%;
  box-sizing: border-box;
}

.section-input.has-checkmark .input-field {
  padding-right: 94px;
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

.section-input .spacer .checkmark {
  position: absolute;
  right: 34px;
  top: 50%;
  transform: translateY(-50%);
}

.section-input .spacer .checkmark .icon-y {
  width: 18px;
  position: relative;
  right: 12px;
}

.custom-select {
  position: relative;
  flex: 1 0 0;
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
  font-size: 16px;
  height: 46px;
  max-width: 100%;
  box-sizing: border-box;
  cursor: pointer;
}

.section-input.has-checkmark .select-trigger {
  color: #FFF;
  padding-right: 94px;
}

.dropdown {
  position: absolute;
  top: calc(100% + 2px);
  left: 0;
  right: 0;
  background: var(--primary);
  border-radius: 5px;
  z-index: 10;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  max-height: 200px;
  overflow-y: auto;
  width: calc(100% + 38px);
  transition: opacity 0.2s ease, transform 0.2s ease;
  opacity: 1;
  transform: translateY(0);
}

.dropdown[style*="display: none"] {
  opacity: 0;
  transform: translateY(-10px);
}

.dropdown .option {
  padding: 10px 12px;
  color: #FFF;
  font-family: Heebo;
  font-size: 16px;
  cursor: pointer;
}

.dropdown .option:hover {
  background: var(--secondary);
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

.fade {
  width: 662px;
  height: 52px;
  position: absolute;
  bottom: 0;
  background: linear-gradient(180deg, rgba(27, 28, 32, 0.00) 0%, var(--Main-Colors-Slate-Dark, #1B1C20) 100%);
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
}

#waveform {
  width: 100%;
  height: 62px;
  cursor: pointer;
}

.timer {
  position: absolute;
  left: 60px;
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
  padding: 9px;
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
  width: 16px;
  height: 16px;
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

.waveform-overlay {
  position: absolute;
  bottom: 25px;
  left: 20px;
  width: 60px;
  height: 100px;
  border-radius: 5px 5px 0 0;
background: linear-gradient(0deg, var(--Main-Colors-Slate-Dark, #1B1C20) 0%, rgba(38, 40, 45, 0.30) 20.97%);
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.waveform-overlay.active {
  opacity: 1;
}

.fade-song{
  position: absolute;
bottom: 0;
left: 0;
// width: 662px;
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
  min-width: 366px; //to 520px

}
}


@media (min-width:2075px) and (max-width:2560px){
.Form{
  min-width: 520px; //to 686px

}
}
</style>