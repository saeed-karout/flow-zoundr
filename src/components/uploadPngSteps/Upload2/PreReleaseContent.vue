<template>
  <div class="tab-content">
    <div class="card-upload-single-cover" :class="{ 
      'active-opacity': isPreReleaseActive,
      'has-image': uploadedImage && !isUploading,
      'drag-over': isDragging 
    }">
      <!-- Upload area that covers the entire card -->
      <div class="upload-full-area">
        <label for="cover-upload" class="upload-label" aria-label="Upload cover image"
          @dragover.prevent="handleDragOver" @dragenter.prevent="handleDragEnter" @dragleave.prevent="handleDragLeave"
          @drop.prevent="handleDrop" :class="{ 'drag-over': isDragging }" :disabled="!isPreReleaseActive">
          
          <!-- Uploaded image covering the entire card -->
          <div v-if="uploadedImage && !isUploading" class="uploaded-image-container">
            <img :src="storage_url+'/'+uploadedImage" alt="Uploaded Cover" class="uploaded-image-full" />
          </div>
          
          <!-- Default content when no image -->
          <div v-if="!isUploading && !uploadedImage" class="default-upload-content">
            <span class="file-icon"></span>
          </div>
          
          <!-- Progress during upload -->
          <div v-if="isUploading" class="progress-overlay">
            <div class="progress-container">
              <div class="progress-wrapper">
                <CircleProgress :percent="fileProgress" :size="circleSize" :border-width="borderWidth" :border-bg-width="7"
                  fill-color="#DE1456" empty-color="#4B5563" :show-percent="false" background="#26282D" />
                <span class="progress-text">
                  {{ fileProgress }}%
                </span>
              </div>
            </div>
          </div>
          
          <!-- Error message -->
          <div v-if="errorMessage && !isUploading" class="error-message">
            {{ errorMessage }}
          </div>
        </label>
        <input id="cover-upload" type="file" :accept="allowedFileTypes.join(',')" class="hidden-input"
          @change="handleFileUpload" :disabled="!isPreReleaseActive" ref="fileInput" />
      </div>

      <!-- Text content that appears over the image - HIDDEN WHEN IMAGE IS UPLOADED -->
      <div class="text-content-overlay" v-if="!isUploading && !uploadedImage">
        <div class="text1">
          <span>Cover Upload via Drag & Drop</span>
          <div class="text-link-bold">
            Or <span @click="triggerFileInput" :class="{ 'disabled': !isPreReleaseActive }">browse your file.</span>
          </div>
        </div>

        <div class="text2">
          <span>Don't have a cover for this single yet?</span>
          <div class="text-link">
            <span>Use album cover image</span>
          </div>
        </div>
      </div>
    </div>

    <div class="column2">
      <div class="preRelease-info">
        <div class="top-line">
          <span>Do you want to pre-release this song?</span>
          <div class="btn-switch" :class="{ active: isPreReleaseActive }" @click="togglePreRelease">
            <img src="/icon/circle.svg" class="circle" alt="circle image" />
          </div>
        </div>

        <div class="infos" :class="{ 'active-opacity': isPreReleaseActive }">
          <div class="headline">
            <div class="title" :class="{ 'active-text': isPreReleaseActive }">{{ props.currentSong?.artist_name || 'artist name' }}</div>
            <div class="subtitle" :class="{ 'active-text': isPreReleaseActive }">{{ props.currentSong?.title || 'song title' }}</div>
          </div>

          <div class="Form">
            <div class="top-line" style="gap: 16px;">
              <span>Should the entire release be pre-orderable with this single?</span>
              <div class="btn-switch" :class="{ active: isPreOrderActive }" @click="togglePreOrder">
                <img src="/icon/circle.svg" class="circle" alt="circle image" />
              </div>
            </div>

            <div class="form">
              <span>Release Date for this single</span>
              <div class="section-input"
                :class="{ 
                  'is-hovered': isHoveredReleaseDate, 
                  'is-focused': isInputFocusedReleaseDate, 
                  'has-checkmark': isReleaseDateSelected 
                }"
                @mouseenter="isHoveredReleaseDate = true"
                @mouseleave="isHoveredReleaseDate = false; if (!isInputFocusedReleaseDate) isCalendarVisibleReleaseDate = false">
                <input 
                  type="text" 
                  class="input-field" 
                  :value="selectedReleaseDate" 
                  readonly
                  @focus="isInputFocusedReleaseDate = true; isCalendarVisibleReleaseDate = true"
                  placeholder="DD/MM/YY" 
                  :disabled="!isPreReleaseActive"
                />
                <div v-if="isReleaseDateSelected" class="checkmark">
                  <img src="../../../assets/icons/y.png" class="icon-y" alt="checkmark icon" />
                </div>
                <div class="spacer" @click="$emit('openVideoPopup', 'releaseDate')">
                  <div class="play" :class="{ visible: isInputFocusedReleaseDate || isHoveredReleaseDate }">
                    <img :src="iconPlay" class="icon" alt="image icon" />
                  </div>
                </div>
                <img 
                  src="/icon/play-dark.svg" 
                  v-if="isCalendarVisibleReleaseDate" 
                  class="play-dark"
                  alt="image play dark for calendar" 
                />
                <CalendarPicker 
                  v-if="isCalendarVisibleReleaseDate" 
                  class="calendar-picker" 
                  @select="updateReleaseDate($event)" 
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>


    <div class="btn-right" 
       :class="{
         'active': !isPreReleaseActive || (uploadedImage && isReleaseDateSelected),
         'inactive': isPreReleaseActive && (!uploadedImage || !isReleaseDateSelected)
       }"
       @click="GotoFirstSection">
       Zur Tracklist
     </div>
    
   
  </div>
  
</template>

<script setup>
  import { ref, onMounted, onBeforeUnmount, watch, defineProps, nextTick } from 'vue';
  import CalendarPicker from '@/components/CalendarPicker.vue';
  import CircleProgress from 'vue3-circle-progress';
  import iconPlay from '@/assets/icons/play.png';
  import { storage_url } from '@/constants';
  
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
      default: 'pre-release'
    }
  });
  
  const emit = defineEmits([
    'update:form-data',
    'save-song',
    'openVideoPopup',
    'next',
    'enter-sub-layout',
    'exit-sub-layout',
    'back-to-tracklist'  // حدث جديد للعودة إلى قائمة الأغاني
  ]);
  
  // ──── Data initialization ────
  const isPreReleaseActive = ref(false);  // First switch - prerelease
  const isPreOrderActive = ref(false);    // Second switch - pre_order
  const uploadedImage = ref(null);
  const uploadedImageBase64 = ref(null);
  const selectedReleaseDate = ref('');
  const isReleaseDateSelected = ref(false);
  
  // Store previous values for comparison
  const previousValues = ref({
    prerelease: 0,
    pre_order: 0,
    cover: null,
    release_date: null
  });
  
  // State for release date input
  const isHoveredReleaseDate = ref(false);
  const isInputFocusedReleaseDate = ref(false);
  const isCalendarVisibleReleaseDate = ref(false);
  
  // State for image upload
  const file = ref(null);
  const fileProgress = ref(0);
  const isUploading = ref(false);
  const isDragging = ref(false);
  const circleSize = ref(352);
  const borderWidth = ref(12);
  const allowedFileTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  const fileInput = ref(null);
  const errorMessage = ref('');
  
  // ──── Update data from props ────
  const updateFromProps = () => {
    if (!props.currentSong?.uuid) return;
    
    console.log('🔄 PreReleaseContent: Updating from currentSong', {
      uuid: props.currentSong.uuid,
      prerelease: props.currentSong.prerelease,
      pre_order: props.currentSong.pre_order,
      hasCover: !!props.currentSong.cover,
      release_date: props.currentSong.release_date
    });
    
    // Update values from currentSong
    // First switch: prerelease (0 or 1)
    if (props.currentSong.prerelease !== undefined) {
      const newPreReleaseActive = props.currentSong.prerelease === 1 || props.currentSong.prerelease === true;
      if (newPreReleaseActive !== isPreReleaseActive.value) {
        console.log('📥 PreReleaseContent: Updating isPreReleaseActive to', newPreReleaseActive);
        isPreReleaseActive.value = newPreReleaseActive;
      }
    }
    
    // Second switch: pre_order (0 or 1)
    if (props.currentSong.pre_order !== undefined) {
      const newPreOrderActive = props.currentSong.pre_order === 1 || props.currentSong.pre_order === true;
      if (newPreOrderActive !== isPreOrderActive.value) {
        console.log('📥 PreReleaseContent: Updating isPreOrderActive to', newPreOrderActive);
        isPreOrderActive.value = newPreOrderActive;
      }
    }
    
    // Convert release date from YYYY-MM-DD to DD/MM/YY for display
    if (props.currentSong.release_date) {
      const newDate = formatDateForDisplay(props.currentSong.release_date);
      if (newDate !== selectedReleaseDate.value) {
        selectedReleaseDate.value = newDate;
        isReleaseDateSelected.value = true;
      }
    } else {
      selectedReleaseDate.value = '';
      isReleaseDateSelected.value = false;
    }
    
    // Pre-release image
    if (props.currentSong.cover) {
      if (props.currentSong.cover !== uploadedImage.value) {
        uploadedImage.value = props.currentSong.cover;
        uploadedImageBase64.value = props.currentSong.cover;
      }
    } else {
      uploadedImage.value = null;
      uploadedImageBase64.value = null;
    }
    
    // Store previous values for comparison
    previousValues.value = {
      prerelease: isPreReleaseActive.value ? 1 : 0,
      pre_order: isPreOrderActive.value ? 1 : 0,
      cover: uploadedImageBase64.value,
      release_date: props.currentSong.release_date || null
    };
  };
  
  // ──── Format date from YYYY-MM-DD to DD/MM/YY for display ────
const formatDateForDisplay = (dateString) => {
  if (!dateString) return '';
  
  try {
    // If date is in ISO format with time (YYYY-MM-DDT00:00:00.000000Z)
    if (dateString.includes('T')) {
      // Extract only the date part
      dateString = dateString.split('T')[0];
    }
    
    // If date is in YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      const [year, month, day] = dateString.split('-');
      const shortYear = year.slice(-2);
      return `${day}/${month}/${shortYear}`; // DD/MM/YY
    }
    
    return dateString;
  } catch (error) {
    console.error('❌ Error formatting date for display:', error);
    return '';
  }
};

// ──── Format date from DD/MM/YY to YYYY-MM-DD for API ────
  const formatDateForAPI = (dateString) => {
    if (!dateString) return null;
    
    try {
      // If date is in DD/MM/YY format
      if (dateString.includes('/')) {
        const parts = dateString.split('/');
        if (parts.length === 3) {
          const day = parts[0].padStart(2, '0');
          const month = parts[1].padStart(2, '0');
          let year = parts[2];
          
          // Convert 2-digit year to 4 digits
          if (year.length === 2) {
            const currentYear = new Date().getFullYear();
            const currentCentury = Math.floor(currentYear / 100) * 100;
            const yearNum = parseInt(year, 10);
            year = (currentCentury + yearNum).toString();
          }
          
          return `${year}-${month}-${day}`; // YYYY-MM-DD
        }
      }
      
      // If date is already in YYYY-MM-DD format
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return dateString;
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error formatting date for API:', error);
      return null;
    }
  };
  
  // ──── Read image as Base64 ────
  const readImageAsBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // Remove prefix (data:image/jpeg;base64,)
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  };
  
  // ──── Send updates - sends only changed values ───
  const sendUpdate = () => {
    if (!props.currentSong?.uuid) {
      console.warn('⚠️ PreReleaseContent: No song UUID');
      return;
    }
    
    const apiFormattedDate = formatDateForAPI(selectedReleaseDate.value);
    const payload = {};
    let hasChanges = false;
    
    // Compare prerelease (0 or 1)
    const prereleaseValue = isPreReleaseActive.value ? 1 : 0;
    if (prereleaseValue !== previousValues.value.prerelease) {
      payload['prerelease'] = prereleaseValue;
      console.log('🔄 Change in prerelease:', { 
        old: previousValues.value.prerelease, 
        new: prereleaseValue 
      });
      hasChanges = true;
      
      // If PreRelease is deactivated (prerelease: 0), send null for other fields
      if (prereleaseValue === 0) {
        // Send null for other fields to deactivate them
        payload['pre_order'] = null;
        payload['cover'] = null;
        payload['release_date'] = null;
        
        console.log('🔄 PreRelease deactivated, sending null for other fields');
        
        // Update previous values
        previousValues.value.pre_order = null;
        previousValues.value.cover = null;
        previousValues.value.release_date = null;
        
        // Update local values as well
        isPreOrderActive.value = false;
        uploadedImageBase64.value = null;
        uploadedImage.value = null;
        selectedReleaseDate.value = '';
        isReleaseDateSelected.value = false;
        
        hasChanges = true;
      }
    }
    
    // If PreRelease is active, check other changes
    if (isPreReleaseActive.value) {
      // Compare pre_order (0 or 1)
      const preOrderValue = isPreOrderActive.value ? 1 : 0;
      if (preOrderValue !== previousValues.value.pre_order) {
        payload['pre_order'] = preOrderValue;
        console.log('🔄 Change in pre_order:', { 
          old: previousValues.value.pre_order, 
          new: preOrderValue 
        });
        hasChanges = true;
      }
      
      // Compare cover - only if image changed
      if (uploadedImageBase64.value !== previousValues.value.cover) {
        payload['cover'] = uploadedImageBase64.value;
        console.log('🔄 Change in cover:', { 
          old: previousValues.value.cover ? 'Image exists' : 'No image', 
          new: uploadedImageBase64.value ? 'New image' : 'No image'
        });
        hasChanges = true;
      }
      
      // Compare release_date - only if date changed
      if (apiFormattedDate !== previousValues.value.release_date) {
        payload['release_date'] = apiFormattedDate;
        console.log('🔄 Change in release_date:', { 
          old: previousValues.value.release_date, 
          new: apiFormattedDate 
        });
        hasChanges = true;
      }
    }
    
    if (!hasChanges) {
      console.log('ℹ️ PreReleaseContent: No changes');
      return;
    }
    
    console.log('📤 PreReleaseContent: Sending changes only:', payload);
    
    // Update previous values immediately to prevent repeated sending
    previousValues.value = {
      prerelease: prereleaseValue,
      pre_order: isPreReleaseActive.value ? (isPreOrderActive.value ? 1 : 0) : null,
      cover: isPreReleaseActive.value ? uploadedImageBase64.value : null,
      release_date: isPreReleaseActive.value ? apiFormattedDate : null
    };
    
    // Send only the changes
    emit('save-song', payload);
  };
  
  // ──── Toggle functions ────
  const togglePreRelease = () => {
    const newValue = !isPreReleaseActive.value;
    console.log('🔄 PreReleaseContent: Toggling PreRelease to', newValue);
    isPreReleaseActive.value = newValue;
    
    // If deactivated, reset local values
    if (!newValue) {
      // Reset local values
      isPreOrderActive.value = false;
      uploadedImageBase64.value = null;
      uploadedImage.value = null;
      selectedReleaseDate.value = '';
      isReleaseDateSelected.value = false;
      
      console.log('🔄 PreReleaseContent: Reset values due to deactivation');
    }
    
    // Send update immediately
    sendUpdate();
  };
  
  const togglePreOrder = () => {
    const newValue = !isPreOrderActive.value;
    console.log('🔄 PreReleaseContent: Toggling PreOrder to', newValue);
    isPreOrderActive.value = newValue;
    
    // Send update immediately
    sendUpdate();
  };
  
  // ──── Update release date ────
  const updateReleaseDate = (displayDate) => {
    if (!isPreReleaseActive.value) return;
    
    selectedReleaseDate.value = displayDate;
    isReleaseDateSelected.value = true;
    isCalendarVisibleReleaseDate.value = false;
    
    console.log('📅 PreReleaseContent: Release date selected:', {
      display: displayDate,
      apiFormat: formatDateForAPI(displayDate)
    });
    
    sendUpdate(); // Send immediately
  };
  
  // ──── Handle image upload ────
  const triggerFileInput = () => {
    if (!isPreReleaseActive.value) return;
    if (fileInput.value) {
      fileInput.value.click();
    }
  };
  
  const handleFileUpload = async (event) => {
    if (!isPreReleaseActive.value) return;
    
    const uploadedFile = event.target.files[0] || event.dataTransfer.files[0];
    if (!uploadedFile) {
      errorMessage.value = 'No file selected.';
      return;
    }
  
    if (!allowedFileTypes.includes(uploadedFile.type)) {
      errorMessage.value = 'Please upload a JPEG or PNG file.';
      return;
    }
  
    if (uploadedFile.size > 10 * 1024 * 1024) {
      errorMessage.value = 'File exceeds maximum size of 10 MB.';
      return;
    }
  
    errorMessage.value = '';
    file.value = {
      id: Date.now(),
      name: uploadedFile.name,
      file: uploadedFile,
      status: 'uploading',
      progress: 0,
    };
    fileProgress.value = 0;
    isUploading.value = true;
    
    await uploadFile(file.value);
  };
  
  // ========== محاكاة حقيقية لنسبة التحميل ==========
  const uploadFile = async (fileObj) => {
    try {
      // حساب وقت التحميل بناءً على حجم الملف (محاكاة)
      const fileSize = fileObj.file.size; // حجم الملف بالبايت
      const fileSizeMB = (fileSize / 1024 / 1024).toFixed(2);
      
      // تقدير وقت التحميل: 1 ميجابايت ≈ 1.5 ثانية (للمحاكاة)
      // الملفات الصغيرة تتحمل بسرعة، الكبيرة تأخذ وقت أطول
      const estimatedTimeMs = Math.min(6000, Math.max(1500, fileSize / 800)); // بين 1.5-6 ثواني
      const updateInterval = 100; // تحديث كل 100ms
      const totalSteps = estimatedTimeMs / updateInterval;
      const baseProgressPerStep = 100 / totalSteps;
      
      console.log(`📊 بدء رفع الملف: ${fileSizeMB} MB, الوقت المقدر: ${(estimatedTimeMs / 1000).toFixed(1)} ثانية`);
      
      // بدء التقدم من 0%
      let progress = 0;
      fileObj.progress = 0;
      fileProgress.value = 0;
      
      // محاكاة التقدم الحقيقي مع تباين في السرعة
      const interval = setInterval(() => {
        // إضافة تقدم عشوائي بين 1-5% لكل خطوة لمحاكاة تباين سرعة التحميل
        // كلما كان الملف أكبر، كان التقدم أبطأ قليلاً
        const varianceFactor = Math.min(1.5, Math.max(0.5, 1 / (fileSize / 500000)));
        const randomIncrement = (baseProgressPerStep * (0.5 + Math.random())) * varianceFactor;
        
        progress += randomIncrement;
        
        // التأكد من عدم تجاوز 95% قبل الاكتمال (نترك مساحة للمراحل النهائية)
        if (progress >= 95) {
          progress = 95;
        }
        
        fileObj.progress = Math.min(95, Math.round(progress));
        fileProgress.value = fileObj.progress;
        
        // سجل التقدم كل 10% للتتبع
        if (fileProgress.value % 10 === 0 || fileProgress.value === 5 || fileProgress.value === 15) {
          console.log(`📤 تقدم الرفع: ${fileProgress.value}%`);
        }
        
        // إذا وصلنا إلى 95% ولا يزال التحميل جارياً
        if (progress >= 95) {
          // لا نوقف المؤقت هنا، سنتركه حتى اكتمال التحويل إلى Base64
        }
      }, updateInterval);
  
      // تحويل الصورة إلى Base64 (هذه العملية تأخذ وقتاً أيضاً)
      console.log('🔄 جاري تحويل الصورة إلى Base64...');
      const base64Image = await readImageAsBase64(fileObj.file);
      
      // إكمال التقدم إلى 100%
      clearInterval(interval);
      
      // محاكاة الخطوات الأخيرة من 95% إلى 100%
      for (let i = 95; i <= 100; i++) {
        fileObj.progress = i;
        fileProgress.value = i;
        
        // سجل فقط عند الوصول إلى 100%
        if (i === 100) {
          console.log(`📤 تقدم الرفع: ${fileProgress.value}%`);
        }
        
        // تأخير بسيط لإظهار التقدم (أسرع للمراحل النهائية)
        await new Promise(resolve => setTimeout(resolve, 30));
      }
      
      // إنشاء URL للعرض
      const imageUrl = URL.createObjectURL(fileObj.file);
      
      fileObj.id = Date.now();
      fileObj.status = 'completed';
      
      uploadedImage.value = imageUrl;
      uploadedImageBase64.value = base64Image;
      
      // تأخير بسيط قبل إخفاء شريط التقدم
      setTimeout(() => {
        isUploading.value = false;
        console.log('✅ PreReleaseContent: Image uploaded successfully');
        console.log(`📊 حجم الملف: ${fileSizeMB} MB`);
        console.log(`⏱️ وقت التحميل الفعلي: ${(estimatedTimeMs / 1000).toFixed(1)} ثانية`);
        sendUpdate(); // Send immediately after upload
      }, 300);
      
    } catch (error) {
      console.error('❌ PreReleaseContent: Failed to upload image:', error);
      errorMessage.value = 'Error uploading file.';
      fileObj.status = 'failed';
      fileProgress.value = 0;
      isUploading.value = false;
      file.value = null;
      uploadedImage.value = null;
      uploadedImageBase64.value = null;
    }
  };
  // ==================================================
  
  // ──── Drag and drop handlers ────
  const handleDragOver = (event) => {
    if (!isPreReleaseActive.value) return;
    event.preventDefault();
  };
  
  const handleDragEnter = (event) => {
    if (!isPreReleaseActive.value) return;
    event.preventDefault();
    isDragging.value = true;
  };
  
  const handleDragLeave = (event) => {
    if (!isPreReleaseActive.value) return;
    event.preventDefault();
    isDragging.value = false;
  };
  
  const handleDrop = (event) => {
    if (!isPreReleaseActive.value) return;
    event.preventDefault();
    isDragging.value = false;
    
    const files = event.dataTransfer.files;
    if (files.length > 1) {
      errorMessage.value = 'Only one file can be uploaded.';
      return;
    }
    
    if (files.length === 1) {
      const simulatedEvent = { target: { files } };
      handleFileUpload(simulatedEvent);
    }
  };
  
  // ──── دالة العودة إلى Tracklist ────
  const GotoFirstSection = () => {
    // First check if we can proceed based on PreRelease state
    if (isPreReleaseActive.value && (!uploadedImage.value || !isReleaseDateSelected.value)) {
      console.warn('⚠️ PreReleaseContent: Cannot proceed, incomplete data');
      return;
    }
  
    console.log('➡️ PreReleaseContent: Returning to FirstSection');
    
    // First: Send exit-sub-layout event to exit sub-layout mode
    emit('exit-sub-layout');
    
    // Second: Send back-to-tracklist event to return to FirstSection
    emit('back-to-tracklist');
  };
  
  // ──── Update circle size based on screen width ────
  const updateCircleSize = () => {
    const screenWidth = window.innerWidth;
    if (screenWidth < 1599) {
      circleSize.value = 250;
      borderWidth.value = 8;
    } else if (screenWidth >= 1600 && screenWidth < 2075) {
      circleSize.value = 300;
      borderWidth.value = 10;
    } else {
      circleSize.value = 352;
      borderWidth.value = 12;
    }
  };
  
  // ──── Watch for currentSong changes ───
  watch(() => props.currentSong, (newSong) => {
    if (newSong?.uuid) {
      // Use nextTick to ensure values are updated after API response
      nextTick(() => {
        updateFromProps();
      });
    }
  }, { deep: true, immediate: true });
  
  // ──── Lifecycle ───
  onMounted(() => {
    updateCircleSize();
    window.addEventListener('resize', updateCircleSize);
    console.log('🚀 PreReleaseContent: Mounted');
    updateFromProps();
  });
  
  onBeforeUnmount(() => {
    window.removeEventListener('resize', updateCircleSize);
    if (uploadedImage.value && uploadedImage.value.startsWith('blob:')) {
      URL.revokeObjectURL(uploadedImage.value);
    }
  });
</script>


<style lang="scss" scoped>
/* الأنماط كما هي من الكود الأصلي */
.tab-content {
  display: flex;
  padding-right: 40px;
  justify-content: center;
  align-items: flex-start;
  gap: 20px;
  align-self: stretch;
  width: 100%;
  position: relative;
}

.btn-right {
  position: absolute;
  right: 20px;
  bottom: 20px;
  border-radius: 5px;
  display: flex;
  padding: 12px 20px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  height: 36px;
  font-family: Heebo;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: 0.9;
  text-transform: uppercase;
  z-index: 11;
  transition: background 0.3s ease, color 0.3s ease;
  cursor: pointer;
}

/* زر التالي عندما يكون PreRelease غير نشط - أخضر */
.btn-right:not(.inactive) {
  background: var(--Main-Colors-Strawberry, #D15);
  color: #fff;
}

.btn-right:not(.inactive):hover {
  background: var(--dark-red, #b30f45);
}

/* زر التالي عندما يكون PreRelease نشطاً والبيانات ناقصة - رمادي معطل */
.btn-right.inactive {
  background: var(--Main-Colors-Slate-Light, #3A3E42);
  color: #6A6C6D;
  cursor: not-allowed;
}

/* زر التالي عندما يكون PreRelease نشطاً والبيانات كاملة - أخضر فاتح */
.btn-right.active {
  // background: var(--Main-Colors-Slate-Light, #3A3E42);
  background: var(--Main-Colors-Strawberry, #D15);

  color: #FFF;
  cursor: pointer;
}

.btn-right.active:hover {
  background: var(--dark-red);

  color: #fff;
}

.card-upload-single-cover {
  display: flex;
  width: 310px;
  height: 310px;
  min-width: 310px;
  min-height: 310px;
  padding: 180px 20px 32px 20px;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  gap: 144px;
  aspect-ratio: 1/1;
  border-radius: 20px;
  border: 2px dashed var(--Main-Colors-White, #FFF);
  opacity: 0.3;
  background: #26282D;
  box-shadow: 4px 4px 20px 0 rgba(27, 28, 32, 0.20);
  transition: opacity 0.3s ease, border-color 0.3s ease;
  position: relative;
  overflow: hidden;
}

.card-upload-single-cover.active-opacity {
  opacity: 1;
}

.card-upload-single-cover.has-image {
  border: 2px solid var(--Main-Colors-White, #FFF);
}

.card-upload-single-cover.drag-over {
  border: 12px solid var(--Main-Colors-Strawberry, #D15);
  background: rgba(209, 17, 85, 0.1);
}

/* Upload area covering the entire card */
.upload-full-area {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.upload-label {
  width: 100%;
  height: 100%;
  border-radius: 20px;
  cursor: pointer;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.upload-label:disabled {
  cursor: not-allowed;
}

/* Uploaded image covering entire card */
.uploaded-image-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 20px;
  overflow: hidden;
}

.uploaded-image-full {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 20px;
}

/* Default upload content */
.default-upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  color: var(--Main-Colors-White, #FFF);
}

.file-icon {
  font-size: 90px;
  font-weight: 700;
  text-transform: uppercase;
}

/* Progress overlay */
.progress-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(38, 40, 45, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 20px;
}

.progress-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.progress-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.progress-text {
  position: absolute;
  color: white;
  font-family: Heebo;
  font-size: 4rem;
  font-weight: bold;
}

.hidden-input {
  display: none;
}

.error-message {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  color: var(--Main-Colors-Strawberry, #D15);
  font-family: Heebo;
  font-size: 16px;
  font-weight: 500;
  text-align: center;
  background: rgba(0, 0, 0, 0.7);
  padding: 10px 20px;
  border-radius: 8px;
  z-index: 3;
}

/* Text content overlay */
.text-content-overlay {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 144px;
  width: 100%;
}

.text1 {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.text1 span {
  color: var(--Main-Colors-White, #FFF);
  text-align: center;
  font-family: Heebo;
  font-size: 20px;
  font-style: normal;
  font-weight: 700;
  line-height: 100%;
  text-transform: uppercase;
}

.text1 .text-link-bold {
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

.text-link-bold span {
  color: var(--Main-Colors-Strawberry, #D15);
  font-family: Heebo;
  font-size: 20px;
  font-style: normal;
  font-weight: 700;
  line-height: 1;
  text-transform: uppercase;
  cursor: pointer;
}

.text-link-bold span.disabled {
  color: var(--Main-Colors-White, #6A6C6D);
  cursor: not-allowed;
}

.text-link-bold span:hover:not(.disabled) {
  text-decoration: underline;
}

.text2 {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.text2 span {
  color: var(--Main-Colors-White, #FFF);
  text-align: center;
  font-family: Heebo;
  font-size: 18px;
  font-style: normal;
  font-weight: 700;
  line-height: 100%;
}

.text2 .text-link {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.text2 .text-link span {
  color: var(--Main-Colors-White, #FFF);
  font-family: Heebo;
  font-size: 18px;
  font-style: normal;
  font-weight: 300;
  line-height: 1;
  text-decoration-line: underline;
  text-decoration-style: solid;
  text-decoration-skip-ink: none;
  text-decoration-thickness: auto;
  text-underline-offset: auto;
  text-underline-position: from-font;
}

:deep(.circle-progress__circle) {
  transform: rotate(-90deg);
}

:deep(.circle-progress__circle-foreground) {
  stroke: var(--Main-Colors-Strawberry, #D15) !important;
  transition: stroke-dashoffset 0.1s linear;
}

.column2 {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 48px;
  flex: 1 0 0;
}

.preRelease-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 48px;
  align-self: stretch;
}

.preRelease-info .top-line {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  align-self: stretch;
}

.preRelease-info .top-line span {
  color: var(--Main-Colors-White, #FFF);
  font-family: Heebo;
  font-size: 18px;
  font-style: normal;
  font-weight: 700;
  line-height: 1;
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

.infos {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 52px;
  align-self: stretch;
  opacity: 0.3;
  transition: opacity 0.3s ease;
}

.infos.active-opacity {
  opacity: 1;
}

.infos .headline {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 20px;
}

.infos .headline .title {
  color: var(--Main-Colors-White, #6A6C6D);
  font-family: Heebo;
  font-size: 58px;
  font-style: normal;
  font-weight: 700;
  line-height: .8;
  text-transform: uppercase;
  transition: color 0.3s ease;
}

.infos .headline .title.active-text {
  color: var(--Main-Colors-White, #FFF);
}

.infos .headline .subtitle {
  color: var(--Main-Colors-White, #6A6C6D);
  font-family: Heebo;
  font-size: 40px;
  font-style: normal;
  font-weight: 700;
  line-height: .8;
  transition: color 0.3s ease;
}

.infos .headline .subtitle.active-text {
  color: var(--Main-Colors-White, #FFF);
}

.infos .Form {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 32px;
  align-self: stretch;
}

.infos .Form .top-line {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  align-self: stretch;
}

.infos .Form .top-line span {
  color: var(--Main-Colors-White, #FFF);
  font-family: Heebo;
  font-size: 14px;
  font-style: normal;
  font-weight: 300;
  line-height: 1;
  letter-spacing: 0.7px;
  text-transform: uppercase;
}

.infos .Form .form {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 8px;
  align-self: stretch;
}

.Form .form span {
  color: var(--Main-Colors-White, #FFF);
  font-family: Heebo;
  font-size: 14px;
  font-style: normal;
  font-weight: 300;
  line-height: 1;
  letter-spacing: 0.7px;
  text-transform: uppercase;
}

.section-input {
  display: flex;
  align-items: center;
  gap: 2px;
  align-self: stretch;
  border-radius: 5px;
  width: 404px;
  position: relative;
}

.section-input .input-field {
  display: flex;
  padding: 12px;
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
  cursor: pointer;
}

.section-input .input-field:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.section-input.has-checkmark .input-field {
  padding-right: 94px;
}

.section-input .checkmark {
  position: absolute;
  right: 34px;
  top: 50%;
  transform: translateY(-50%);
}

.section-input .checkmark .icon-y {
  width: 18px;
  position: relative;
  right: 12px;
}

.section-input .spacer {
  display: flex;
  width: 34px;
  height: 46px;
  padding: 9px 10px;
  align-items: center;
  border-radius: 5px;
  // background: var(--secondary, #26282D);
  position: relative;
  cursor: pointer;
}

.section-input .spacer .play {
  display: flex;
  padding: 13px 13px;
  align-items: center;
  position: absolute;
  right: 20px;
  opacity: 0;
  border-radius: 0 5px 5px 0;
  background: var(--primary, #1B1C20);
  transition: right 0.3s ease, opacity 0.3s ease;
}

.section-input .spacer .play.visible {
  right: -10px;
  opacity: 1;
}

.section-input .spacer .play .icon {
  width: 18px;
  height: 20px;
  flex-shrink: 0;
  aspect-ratio: 9/10;
}

.section-input .spacer:hover .icon {
  filter: brightness(0) invert(1);
}

.calendar-picker {
  position: absolute;
  top: 0;
  left: calc(100% + 18px);
  z-index: 10;
  background: var(--primary, #1B1C20);
  padding: 20px;
  border-radius: 10px;
  box-shadow: 7px 3px 10px -3px var(--Main-Colors-Slate-Black, #0E0E10);
}

.play-dark {
  position: absolute;
  right: -20px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 20px;
  z-index: 11;
}

@media (min-width: 1440px) and (max-width: 1599px) {
  .file-icon {
    font-size: 60px;
  }

  .progress-text {
    font-size: 3rem;
  }

  .card-upload-single-cover{
    width: clamp(310px, -113.75px + 33.33vw, 365px);
    height: clamp(310px, -113.75px + 33.33vw, 365px);
    min-width: clamp(310px, -113.75px + 33.33vw, 365px);
    min-height: clamp(310px, -113.75px + 33.33vw, 365px);
  }

  .text-content-overlay{
    gap: 80px;
  }

  .text1 span,.text1 .text-link-bold{
    font-size: 16px;
  }

  .text2 span,.text2 .text-link span{
    font-size: 14px;
  }

  .preRelease-info .top-line span{
    font-size: 15.5px;
    letter-spacing: 0.8px;
  }

  .preRelease-info{
    gap: 32px;
  }

  .infos .headline .subtitle{
    font-size: 32px;
  }

  .infos .headline .title{
    font-size: 48px;
  }

  .infos .Form .top-line span,.Form .form span{
    font-size: 12px;
  }
}

@media (min-width: 1600px) and (max-width: 2074px) {
  .file-icon {
    font-size: 70px;
  }

  .progress-text {
    font-size: 3.5rem;
  }


    .card-upload-single-cover{
  width: clamp(366px, -346px + 41.05vw, 520px);
    height: clamp(366px, -346px + 41.05vw, 520px);
    min-width: clamp(366px, -346px + 41.05vw, 520px);
    min-height: clamp(366px, -346px + 41.05vw, 520px);
  }
}

@media (min-width: 2075px) and (max-width: 2560px){
    .card-upload-single-cover{
   width: clamp(378px, -625px + 48.3vw, 503px);
    height: clamp(378px, -625px + 48.3vw, 503px);
    min-width: clamp(378px, -625px + 48.3vw, 503px);
    min-height: clamp(378px, -625px + 48.3vw, 503px);
  }
}


@media (min-width: 2561px) {
     .card-upload-single-cover{
      width: 503px;
    height: 503px;
    min-width: 503px;
    min-height: 503px;
     }
}
</style>