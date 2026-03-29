<template>
  <div class="main-content">
    <StepLayout :current-step="1" :steps="steps" :section-title="sectionTitle"
      :section-description="sectionDescription" :hasOuterContent="false" :restrictOverflow="currentStep === 1">
      <div class="schutzen-main-content">
        <!-- Left: Upload Section -->
        <div class="schutzen-upload-section">
          <label for="file-upload" class="schutzen-upload-label" aria-label="Upload audio files"
            @dragover.prevent="handleDragOver" @dragenter.prevent="handleDragEnter" @dragleave.prevent="handleDragLeave"
            @drop.prevent="handleDrop" :class="{ 'schutzen-drag-over': isDragging }">
            <img src="@/assets/images/bg-img.png" alt="Upload Background" class="schutzen-upload-icon"
              :class="{ 'schutzen-uploading': isUploading }" />
            <img v-if="!isUploading" src="@/assets/images/File Icons.png" class="schutzen-file-icon" alt="File Icons" />
            <span v-if="!isUploading" class="schutzen-upload-text" :class="{ 'schutzen-hidden': isUploading }">
              DATEIEN SUCHEN
            </span>
            <div v-if="isUploading" class="schutzen-progress-container">
              <div class="schutzen-progress-wrapper">
                <CircleProgress :percent="files.find((f) => f.status === 'uploading')?.progress || 0" :size="circleSize"
                  :border-width="borderWidth" :border-bg-width="7" fill-color="#DE1456" empty-color="#4B5563"
                  :show-percent="false" background="#26282D" />
                <span class="schutzen-progress-text">
                  {{files.find((f) => f.status === 'uploading')?.progress || 0}}%
                </span>
              </div>
            </div>
          </label>
          <input id="file-upload" type="file" :accept="allowedFileTypes.join(',')" multiple
            class="schutzen-hidden-input" @change="handleFileUpload" />

          <!-- Pricing Section -->
          <div v-if="showFileList" class="schutzen-pricing-section">
            <div class="schutzen-pricing-item">
              <span>Preis für {{ files.length }} Stück:</span>
              <span>{{ (dataStore.fileCount * 15).toFixed(2) }} EUR</span>
            </div>
            <div class="schutzen-pricing-item">
              <span>Dein Rabatt:</span>
              <span>-{{ discount.toFixed(2) }} EUR</span>
            </div>
            <div class="schutzen-total-price">
              <span class="schutzen-total-price-label" data-full="Gesamtpreis:" data-short="Gesamt:"></span>
              <span>{{ totalPrice.toFixed(2) }} EUR</span>
            </div>
          </div>

          <!-- Instructions -->
          <div v-if="!showFileList" class="schutzen-instructions">
            Du kannst Songs, Ideen, Texte, Instrumentale, Beats und alles weitere
            rechtssicher schützen lassen. Maximale Dateigröße 99 MB.
            <h1>
              Beachte: keine .txt Daten oder gepackten Dateiformate wie .zip etc.
            </h1>
          </div>
        </div>

        <!-- Werken Upload Text -->
        <div v-if="!showFileList" class="schutzen-werken-upload-text">
          <h1 class="schutzen-upload-header">
            Werke Upload per Drag & Drop <br />oder
            <span class="schutzen-text-move">Suche deine Dateien.</span>
          </h1>
        </div>

        <!-- Right: File List -->
        <div v-if="showFileList" class="schutzen-file-list-section">
          <div class="schutzen-file-list-header">
            <h2 class="schutzen-file-list-title">DEINE WERKE</h2>
            <span class="schutzen-file-count">{{ files.length }} STÜCK</span>
          </div>
          <div class="schutzen-file-list-container">
            <div class="schutzen-file-list">
              <div v-for="(file, index) in files" :key="file.id" class="schutzen-file-item"
                @mouseenter="hoveredIndex = index" @mouseleave="hoveredIndex = null">
                <span class="schutzen-file-name">{{ file.name }}</span>
                <div class="schutzen-file-actions">
                  <span v-if="file.status === 'completed'" class="schutzen-completed-icon">
                    <img src="@/assets/icons/y.png" alt="Completed" />
                  </span>
                </div>
              </div>
            </div>
            <div v-if="files.length >= shadowThreshold" class="schutzen-shadow-blur"></div>
          </div>
          <!-- Separate Delete Buttons Container -->
          <div class="schutzen-delete-container">
            <div v-for="(file, index) in files" :key="'delete-' + file.id" class="schutzen-delete-wrapper"
              :class="{ 'visible': hoveredIndex === index }" @mouseenter="hoveredIndex = index"
              @mouseleave="hoveredIndex = null" @click="deleteFile(index)">
              <div class="schutzen-delete-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="21" height="24" viewBox="0 0 21 24" fill="none">
                  <path
                    d="M19.7342 3.59506H16.9151V1.91975C16.9151 1.12469 16.2822 0.5 15.4767 0.5H5.49452C4.68904 0.5 4.05616 1.12469 4.05616 1.91975V3.59506H1.23699C0.575343 3.59506 0 4.16296 0 4.84444V7.79752H21V4.81604C20.9712 4.16296 20.4247 3.59506 19.7342 3.59506ZM5.78219 2.2037H15.189V3.59506H5.78219V2.2037Z"
                    fill="#6A6C6D" />
                  <path
                    d="M1.03564 9.4729V22.2791C1.03564 22.9605 1.58222 23.5 2.27263 23.5H18.7274C19.3891 23.5 19.9644 22.9321 19.9644 22.2507V9.4729H1.03564ZM6.47263 19.5815C6.47263 20.2062 5.95482 20.7173 5.32195 20.7173C4.68907 20.7173 4.17126 20.2062 4.17126 19.5815V13.3914C4.17126 12.7667 4.68907 12.2556 5.32195 12.2556C5.95482 12.2556 6.47263 12.7667 6.47263 13.3914V19.5815ZM11.6507 19.5815C11.6507 20.2062 11.1329 20.7173 10.5 20.7173C9.86715 20.7173 9.34934 20.2062 9.34934 19.5815V13.3914C9.34934 12.7667 9.86715 12.2556 10.5 12.2556C11.1329 12.2556 11.6507 12.7667 11.6507 13.3914V19.5815ZM16.8288 19.5815C16.8288 20.2062 16.311 20.7173 15.6781 20.7173C15.0452 20.7173 14.5274 20.2062 14.5274 19.5815V13.3914C14.5274 12.7667 15.0452 12.2556 15.6781 12.2556C16.311 12.2556 16.8288 12.7667 16.8288 13.3914V19.5815Z"
                    fill="#6A6C6D" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        
      </div>
      <!-- Action Buttons -->
      <div v-if="showFileList" class="schutzen-action-buttons">
        <button class="schutzen-continue-button"
          :disabled="files.length === 0 || files.some((file) => file.status === 'uploading')" @click="$emit('next')">
          WEITER
        </button>
        <button v-if="currentStep === steps.length - 1" @click="reset" class="schutzen-repeat-button">
          Repeat
        </button>
      </div>
    </StepLayout>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useDataStore } from '@/stores/data';
import StepLayout from '@/components/Layout2.vue';
import CircleProgress from 'vue3-circle-progress';
import apiRequest from '@/lib/apiRequest';

defineProps({
  currentStep: {
    type: Number,
    required: true,
  },
});

const dataStore = useDataStore();
const user = computed(() => dataStore.user);

const files = ref([]);
const pricePerPiece = ref(15.0);
const totalPrice = ref(0);
const discount = ref(0);
const steps = ref(['1', '2', '3', '4']);
const showFileList = ref(false);
const isUploading = ref(false);
const isDragging = ref(false);
const hoveredIndex = ref(null);
const circleSize = ref(350);
const borderWidth = ref(7);
const screenWidth = ref(window.innerWidth);

// مراقبة hoveredIndex لتغيير border-radius
watch(hoveredIndex, (newIndex) => {
  const fileItems = document.querySelectorAll('.schutzen-file-item');
  fileItems.forEach((item, index) => {
    if (index === newIndex) {
      item.style.borderRadius = '5px 0 0 5px';
    } else {
      item.style.borderRadius = '5px';
    }
  });
});

// Compute shadow threshold based on screen width
const shadowThreshold = computed(() => {
  const width = screenWidth.value;
  if (width >= 1440 && width < 1600) {
    const minThreshold = 4;
    const maxThreshold = 5;
    const minWidth = 1440;
    const maxWidth = 1599;
    return Math.round(
      minThreshold + (maxThreshold - minThreshold) * (width - minWidth) / (maxWidth - minWidth)
    );
  } else if (width >= 1600 && width < 2075) {
    const minThreshold = 6;
    const maxThreshold = 10;
    const minWidth = 1600;
    const maxWidth = 2075;
    return Math.round(
      minThreshold + (maxThreshold - minThreshold) * (width - minWidth) / (maxWidth - minWidth)
    );
  } else if (width >= 2075 && width <= 2560) {
    const minThreshold = 11;
    const maxThreshold = 13;
    const minWidth = 2075;
    const maxWidth = 2560;
    return Math.round(
      minThreshold + (maxThreshold - minThreshold) * (width - minWidth) / (maxWidth - minWidth)
    );
  }
  return 7;
});

const updateCircleSize = () => {
  screenWidth.value = window.innerWidth;
  if (screenWidth.value < 1599) {
    circleSize.value = 250;
    borderWidth.value = 5;
  } else if (screenWidth.value >= 1600 && screenWidth.value < 2075) {
    circleSize.value = 340;
    borderWidth.value = 6;
  } else if (screenWidth.value >= 2075) {
    circleSize.value = 480;
    borderWidth.value = 7;
  }
};

onMounted(() => {
  updateCircleSize();
  window.addEventListener('resize', updateCircleSize);
  fetchFiles();
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateCircleSize);
  files.value.forEach((file) => {
    if (file.status === 'uploading' && file.intervalId) {
      clearInterval(file.intervalId);
    }
  });
});

const sectionTitle = computed(() =>
  showFileList.value && !isUploading.value && files.value.length > 0
    ? 'Lade Dein Werk hoch'
    : 'Lade Dein Werk hoch'
);
const sectionDescription = ref('Lade hier alle Deine Werke hoch, die du schützen möchtest');

// Fetch files on page load
const fetchFiles = async () => {
  try {
    const response = await apiRequest.get('/media_files');
    if (response.data && Array.isArray(response.data.data)) {
      files.value = response.data.data.map((file) => ({
        id: file.id,
        name: file.file_name,
        status: 'completed',
        progress: 100,
        fileType: getFileTypeFromName(file.file_name),
      }));
      updatePrices();
      showFileList.value = files.value.length > 0;
    }
  } catch (error) {
    console.error('Error fetching files:', error);
  }
};

// List of allowed file types
const allowedFileTypes = [
  'audio/mpeg',
  'audio/wav',
  'audio/x-ms-wma',
  'audio/aiff',
  'audio/flac',
  'application/pdf',
  'application/msword',
  'application/vnd.oasis.opendocument.text',
  'image/jpeg',
  'image/bmp',
  'image/png',
  'image/x-raw',
  'application/illustrator',
  'application/x-indesign',
  'image/vnd.adobe.photoshop',
  'application/postscript',
];

const handleFileUpload = (event) => {
  const uploadedFiles = Array.from(event.target.files || event.dataTransfer.files);

  uploadedFiles.forEach((file, idx) => {
    if (allowedFileTypes.includes(file.type) && file.size <= 99 * 1024 * 1024) {
      const newFile = {
        id: Date.now() + idx,
        name: file.name,
        file: file,
        type: file.type.split('/')[0],
        status: 'uploading',
        progress: 0,
        fileType: getFileTypeFromName(file.name),
      };
      files.value.push(newFile);
    } else {
      console.warn(`File ${file.name} is not an allowed type or exceeds 99MB.`);
    }
  });

  showFileList.value = true;
  if (files.value.length > 0) {
    const firstFile = files.value.find((f) => f.status === 'uploading');
    if (firstFile) {
      uploadFile(firstFile);
    }
  }
};

// Determine file type based on name
const getFileTypeFromName = (fileName) => {
  const extension = fileName.split('.').pop().toLowerCase();
  const types = {
    mp3: 'MP3',
    wav: 'WAV',
    wma: 'WMA',
    aiff: 'AIF',
    flac: 'FLAC',
    pdf: 'PDF',
    doc: 'DOC',
    odt: 'ODT',
    jpg: 'JPG',
    bmp: 'BMP',
    png: 'PNG',
    raw: 'RAW',
    ai: 'AI',
    indd: 'INDD',
    psd: 'PSD',
    eps: 'EPS',
  };
  return types[extension] || extension.toUpperCase();
};

const uploadFile = async (file) => {
  isUploading.value = true;
  const formData = new FormData();
  formData.append('media_file', file.file);

  try {
    const response = await apiRequest.post('/media_files', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = progressEvent.total
          ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
          : 0;
        file.progress = percentCompleted;
      },
    });
    file.id = response.data.id;
    file.status = 'completed';
    file.progress = 100;
    updatePrices();
    const nextFile = files.value.find((f) => f.status === 'uploading');
    if (nextFile) {
      uploadFile(nextFile);
    } else {
      isUploading.value = false;
    }
  } catch (error) {
    console.error('Error uploading file:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    file.status = 'failed';
    const nextFile = files.value.find((f) => f.status === 'uploading');
    if (nextFile) {
      uploadFile(nextFile);
    } else {
      isUploading.value = false;
    }
  }
};

const updatePrices = () => {
  const completedFiles = files.value.filter((file) => file.status === 'completed').length;
  const basePrice = completedFiles * 15.0;
  discount.value = completedFiles >= 2 ? 15.0 : 0.0;
  totalPrice.value = basePrice - discount.value;
  pricePerPiece.value = completedFiles > 0 ? 15.0 : 0.0;
  dataStore.setTotalPrice(totalPrice.value);
  dataStore.setFileCount(completedFiles);
};

const deleteFile = async (index) => {
  const file = files.value[index];
  if (file.status === 'uploading' && file.intervalId) clearInterval(file.intervalId);
  if (file.id) {
    try {
      await apiRequest.delete(`/media_files/${file.id}`);
      console.log(`File ${file.name} deleted successfully`);
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  }
  files.value.splice(index, 1);
  updatePrices();
  const next = files.value.find((f) => f.status === 'uploading');
  if (next) uploadFile(next);
  else isUploading.value = false;
};

// Drag and Drop event handlers
const handleDragOver = (event) => {
  event.preventDefault();
};

const handleDragEnter = (event) => {
  event.preventDefault();
  isDragging.value = true;
};

const handleDragLeave = (event) => {
  event.preventDefault();
  isDragging.value = false;
};

const handleDrop = (event) => {
  event.preventDefault();
  isDragging.value = false;
  const files = event.dataTransfer.files;
  if (files.length > 0) {
    const simulatedEvent = { target: { files } };
    handleFileUpload(simulatedEvent);
  }
};

const reset = () => {
  files.value = [];
  totalPrice.value = 0;
  discount.value = 0;
  showFileList.value = false;
  isUploading.value = false;
  fetchFiles();
};
</script>

<style lang="scss" scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Heebo', sans-serif;
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: 44px;
  color: white;
  position: relative;
}

.schutzen-main-content {
  display: inline-flex;
  align-items: start;
  gap: 64px;
}

.schutzen-upload-section {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 48px;
  // align-self: stretch;
  position: relative;
  right: -4px;
}

.schutzen-upload-label {
  width: 100%;
  border-radius: 20px;
  cursor: pointer;
  position: relative;
  border: 3px dashed #fff;
  background-color: transparent;
  transition: border-color 0.3s ease, background-color 0.3s ease;
}

.schutzen-upload-label.schutzen-drag-over {
  border-color: #DE1456;
  background-color: rgba(222, 20, 86, 0.1);
}

.schutzen-upload-icon {
  width: 100%;
  transition: all 0.3s ease;
  border-radius: 20px;
  opacity: 0.75;
}

.schutzen-upload-icon.schutzen-uploading {
  filter: brightness(0.75);
}

.schutzen-total-price-label::before {
  content: attr(data-full);
}

.schutzen-file-icon {
  position: absolute;
  background-size: contain;
  object-fit: cover;
  height: 70%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.schutzen-upload-text {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  text-align: center;
  font-size: 2.8rem;
  font-weight: bold;
  opacity: 0;
  transition: opacity 0.05s ease;
  text-transform: uppercase;
  background-color: rgba(0, 0, 0, 0.4);
  border-radius: 20px;
}

.schutzen-upload-label:hover .schutzen-upload-text {
  opacity: 1;
}

.schutzen-upload-label:hover .schutzen-file-icon {
  display: none;
}

.schutzen-progress-container {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.4);
  border-radius: 20px;
}

.schutzen-progress-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.schutzen-progress-text {
  position: absolute;
  color: white;
  font-size: 6rem;
  font-weight: bold;
}

.schutzen-hidden-input {
  display: none;
}

.schutzen-pricing-section {
  width: 100%;
  text-align: center;
  color: white;
  gap: 16px;
  display: flex;
  flex-direction: column;
  font-family: Heebo;
  font-size: 14px;
  font-weight: 300;
  line-height: 1;
  letter-spacing: 0.7px;
}

.schutzen-pricing-item {
  display: flex;
  justify-content: space-between;
}

.schutzen-total-price {
  display: flex;
  justify-content: space-between;
  font-size: 1.875rem;
  font-weight: bold;
}

.schutzen-total-price-label {
  color: #fff;
  font-family: Heebo;
  font-size: 32px;
  font-weight: 200;
  line-height: 1;
  letter-spacing: 1.6px;
  text-transform: uppercase;
}

.schutzen-instructions {
  color: #fff;
  font-family: Heebo;
  font-size: 14px;
  font-weight: 300;
  line-height: normal;
  letter-spacing: 0.7px;
  max-width: 470px;
  margin-left: 3px;
}

.schutzen-instructions h1 {
  color: #de1456;
  font-family: Heebo;
  font-size: 14px;
  font-weight: 300;
  line-height: 1;
  letter-spacing: 0.7px;
  margin-top: 12px;
}

.schutzen-werken-upload-text {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.schutzen-upload-header {
  color: #fff;
  font-family: Heebo;
  font-size: 42px;
  font-weight: 700;
  line-height: 48px;
  text-transform: uppercase;
}

.schutzen-upload-header .schutzen-text-move {
  color: var(--move);
}

.schutzen-file-list-section {
  width: 100%;
  position: relative;
  width: clamp(534px, calc(-272px + 55.9748vw), 623px);
  display: flex;
  flex-direction: column;
  gap: 10px;
  position: relative;
}

.schutzen-file-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 300;
}

.schutzen-file-list-title {
  color: #fff;
  font-family: Heebo;
  font-size: 18px;
  font-weight: 300;
  line-height: 1;
  letter-spacing: 0.9px;
  text-transform: uppercase;
}

.schutzen-file-count {
  font-size: 18px;
  line-height: 1;
  font-weight: 300;
  letter-spacing: 0.9px;
}

.schutzen-file-list-container {
  position: relative;
  max-height: 50vh;
  overflow-y: auto;
  -ms-overflow-style: none;
  scrollbar-width: none;
  scroll-behavior: smooth;
}

.schutzen-file-list-container::-webkit-scrollbar {
  display: none;
}

.schutzen-file-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.schutzen-file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
  width: 100%;
  background-color: var(--primary);
  border-radius: 5px;
  height: 3rem;
  transition: all 0.3s ease;
}

.schutzen-file-item:hover {
  border-radius: 5px 0 0 5px;
}

.schutzen-file-name {
  color: #fff;
  font-family: Heebo;
  font-size: 20px;
  font-weight: 300;
  line-height: normal;
  letter-spacing: 1px;
}

/* Separate Delete Buttons Container */
.schutzen-delete-container {
  position: absolute;
  right: -54px;
  top: 41px;
  width: 60px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 2;
  overflow: hidden;
  height: 100%;
}

.schutzen-delete-wrapper {
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  cursor: pointer;
}

.schutzen-delete-wrapper.visible {
  opacity: 1;
}

.schutzen-delete-icon {
  background-color: var(--primary);
  padding: 11.9px 12px;
  border-radius: 0 5px 5px 0;
  transition: background-color 0.3s ease;
}

.schutzen-delete-icon:hover {
  background-color: var(--move);
}

.schutzen-delete-icon:hover svg path {
  fill: #fff;
}

.schutzen-file-actions {
  display: flex;
  align-items: center;
}

.schutzen-completed-icon {
  color: var(--move);
  margin-right: 0.5rem;
}

.schutzen-shadow-blur {
  position: sticky;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 4rem;
  pointer-events: none;
  background: linear-gradient(to top,
      rgba(38, 40, 45, 0.9) 0%,
      rgba(38, 40, 45, 0.5) 50%,
      transparent 100%);
  margin-top: -4rem;
  z-index: 1;
}

.schutzen-action-buttons {
  position: absolute;
 
  bottom: 20px;
  right: 20px;
  display: flex;
  gap: 16px;
  z-index: 100;
}

.schutzen-continue-button,
.schutzen-repeat-button {
  padding: 0.5rem 1.5rem;
  border-radius: 5px;
  color: white;
  background-color: var(--move);
  font-family: Heebo;
  font-size: 16px;
  font-weight: 400;
  line-height: 1;
  text-transform: uppercase;
  border: none;
 
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.schutzen-continue-button:hover,
.schutzen-repeat-button:hover {
  background-color: #990033;
}

.schutzen-continue-button:disabled {
  background-color: #3a3e42;
  color: #6a6c6d;
  cursor: not-allowed;
}

/* Circle Progress Styles */
:deep(.circle-progress__text) {
  display: none;
}

:deep(.circle-progress__circle) {
  transform: rotate(-90deg);
}

:deep(.circle-progress__circle-foreground) {
  stroke: var(--move) !important;
  transition: stroke-dashoffset 0.1s linear;
}

@media (min-width: 1440px) and (max-width: 1599px) {
  .schutzen-main-content {
    gap: 48px;
    // margin-top: 28px;
    max-height: 375px;
  }

  .schutzen-upload-header {
    font-size: 38px;
  }

  .schutzen-file-list-section {
    gap: 23px;
    width: clamp(534px, calc(-272px + 55.9748vw), 623px);
  
  }

  .schutzen-upload-section {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: flex-start;
    // align-self: stretch;
    width: clamp(308px, calc(308px + 54 * (100vw - 1440px) / 159), 362px);
    // height: auto;
    aspect-ratio: 362/95;
  }

  .schutzen-werken-upload-text {
    height: 350px;
  }

  // .schutzen-file-list-container {
  //   max-height: min(60vh, 400px);
  // }

  .schutzen-instructions {
    font-size: 9px;
    font-weight: 300;
    letter-spacing: 0.5px;
  }

  .schutzen-instructions h1 {
    font-size: 10px;
    font-weight: 300;
  }

  .schutzen-total-price-label {
    font-size: 24px;
  }

  .schutzen-total-price-label span {
    font-size: 24px;
  }

  .schutzen-total-price-label::before {
    content: attr(data-short);
  }

  .schutzen-shadow-blur {
    height: 5rem;
    margin-top: -5rem;
    background: linear-gradient(to top,
        rgba(38, 40, 45, 0.95) 0%,
        rgba(38, 40, 45, 0.6) 50%,
        transparent 100%);
  }
}

@media (min-width: 1600px) and (max-width: 2075px) {
   .schutzen-upload-section {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: flex-start;
    // align-self: stretch;
    width: clamp(362px, calc(-171.3333px + 33.3333vw), 520px);
    // height: auto;
    aspect-ratio: 362/95;
    gap: 64px;
  }
}

@media (min-width: 1600px) and (max-width: 2075px) {
  .schutzen-main-content {
    gap: 64px;
    margin-top: 10px;
 
  }

  .schutzen-upload-header {
    font-size: 40px;
  }

  .schutzen-file-list-section {
    gap: 23px;
    width: clamp(623px, calc(-274.8896px + 56.1181vw), 889px);
    
  }

 

  .schutzen-werken-upload-text {
    height: clamp(362px, calc(-171.3333px + 33.3333vw), 520px);
  }

  .schutzen-instructions {
    font-size: 11px;
    font-weight: 300;
    letter-spacing: 0.55px;
  }

  .schutzen-instructions h1,
  .schutzen-instructions span {
    font-size: 11px;
    font-weight: 300;
  }

  .schutzen-total-price-label {
    font-size: 32px;
  }

  .schutzen-total-price-label span {
    font-size: 32px;
  }

  .schutzen-total-price-label::before {
    content: attr(data-short);
  }

  .schutzen-shadow-blur {
    height: 6rem;
    margin-top: -6rem;
  }
}

@media (min-width: 2075px) and (max-width: 2560px) {
  .schutzen-main-content {
    gap: 64px;
    padding-top: 30px;
    max-height: 900px;
  }

  .schutzen-upload-header {
    font-size: 40px;
  }

  .schutzen-file-list-section {
    gap: 23px;
    width: clamp(889px, calc(-300.3816px + 57.3196vw), 1167px);
    max-height: 860px;
  }

  .schutzen-file-list-container {
    max-height: 80vh;
  }

  .schutzen-upload-section {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: flex-start;
    // align-self: stretch;
    width: clamp(520px, calc(-173.048px + 33.3999vw), 682px);
    // height: auto;
    aspect-ratio: 362/95;
    gap: 64px;
  }

  .schutzen-werken-upload-text {
    height: clamp(362px, calc(-171.3333px + 33.3333vw), 520px);
  }

  .schutzen-instructions {
    font-size: clamp(11px, calc(0.8734px + 0.632911vw), 14px);
    font-weight: 300;
    letter-spacing: 0.8px;
  }

  .schutzen-instructions h1 {
    font-size: clamp(11px, calc(0.8734px + 0.632911vw), 14px);
    font-weight: 300;
  }

  .schutzen-total-price-label {
    font-size: 32px;
  }

  .schutzen-total-price-label span {
    font-size: 32px;
  }
}


@media (min-height:850px) and (min-height:950px) {
  
}
</style>