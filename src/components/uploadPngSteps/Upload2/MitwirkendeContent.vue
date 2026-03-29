<template>
  <div class="tab-content">
    <div class="frame">
      <!-- Artist -->
      <div class="section">
        <div class="title">Artist</div>
        <div
          v-for="(input, index) in artistInputs"
          :key="index"
          class="form-field"
          :class="{ 
            'is-hovered': input.isHovered, 
            'has-checkmark': input.name && input.name.trim() !== '' 
          }"
          @mouseenter="input.isHovered = true"
          @mouseleave="input.isHovered = false"
        >
        
            <input
              type="text"
              class="input-field name-field"
              v-model="input.name"
              placeholder="Name"
              @input="updateArtistValue(index)"
            />
           
          
          
          <div v-if="input.name && input.name.trim() !== ''" class="checkmark">
            <img src="@/assets/icons/y.png" class="icon-y" alt="checkmark" />
          </div>
          
          <!-- Plus Icon -->
          <div
            v-if="index === 0 && input.isHovered"
            class="plus-icon"
            @click="addArtistInput"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </div>
          
          <!-- Minus Icon -->
          <div
            v-if="index > 0 && input.isHovered"
            class="minus-icon"
            @click="removeArtistInput(index)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </div>
          
          <div class="spacer" @click="emit('openVideoPopup', 'artist')">
            <div class="play" :class="{ visible: input.isHovered }">
              <img :src="iconPlay" class="icon" alt="play icon" />
            </div>
          </div>
        </div>
      </div>

      <!-- Feature -->
      <div class="section feature-section" :class="{ active: isFeatureActive }">
        <div class="top-line">
          <div class="title">Feature</div>
          <div class="btn-switch" @click="toggleFeature">
            <img src="/icon/circle.svg" class="circle" alt="circle" />
          </div>
        </div>
        <div
          v-for="(input, index) in featureInputs"
          :key="index"
          class="form-field"
          :class="{ 
            'is-hovered': input.isHovered, 
            'has-checkmark': input.name && input.name.trim() !== '' 
          }"
          @mouseenter="input.isHovered = true"
          @mouseleave="input.isHovered = false"
        >
          
            <input
              type="text"
              class="input-field name-field"
              v-model="input.name"
              placeholder="Name"
              :disabled="!isFeatureActive"
              @input="updateFeatureValue(index)"
            />
           
        
          
          <div v-if="input.name && input.name.trim() !== ''" class="checkmark">
            <img src="@/assets/icons/y.png" class="icon-y" alt="checkmark" />
          </div>
          
          <!-- Plus Icon -->
          <div
            v-if="index === 0 && input.isHovered && isFeatureActive"
            class="plus-icon"
            @click="addFeatureInput"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </div>
          
          <!-- Minus Icon -->
          <div
            v-if="index > 0 && input.isHovered && isFeatureActive"
            class="minus-icon"
            @click="removeFeatureInput(index)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </div>
          
          <div class="spacer" @click="emit('openVideoPopup', 'feature')">
            <div class="play" :class="{ visible: input.isHovered && isFeatureActive }">
              <img :src="iconPlay" class="icon" alt="play icon" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="frame1">
      <div class="section-frame">
        <!-- P-Line -->
        <div class="section">
          <div class="title">P-Line</div>
          <div
            v-for="(input, index) in pLineInputs"
            :key="index"
            class="form-field"
            :class="{ 
              'is-hovered': input.isHovered, 
              'has-checkmark': input.name && input.name.trim() !== '' 
            }"
            @mouseenter="input.isHovered = true"
            @mouseleave="input.isHovered = false"
          >
            
              <input
                type="text"
                class="input-field name-field"
                v-model="input.name"
                placeholder="P-Line (z.B. ℗ 2025)"
                @input="updatePLineValue(index)"
              />
             
          
            
            <div v-if="input.name && input.name.trim() !== ''" class="checkmark">
              <img src="@/assets/icons/y.png" class="icon-y" alt="checkmark" />
            </div>
            
            <!-- Plus Icon -->
            <div
              v-if="index === 0 && input.isHovered"
              class="plus-icon"
              @click="addPLineInput"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </div>
            
            <!-- Minus Icon -->
            <div
              v-if="index > 0 && input.isHovered"
              class="minus-icon"
              @click="removePLineInput(index)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </div>
            
            <div class="spacer" @click="emit('openVideoPopup', 'pline')">
              <div class="play" :class="{ visible: input.isHovered }">
                <img :src="iconPlay" class="icon" alt="play icon" />
              </div>
            </div>
          </div>
        </div>

        <!-- Produzent -->
        <div class="section">
          <div class="title">Produzent</div>
          <div
            v-for="(input, index) in produzentInputs"
            :key="index"
            class="form-field"
            :class="{ 
              'is-hovered': input.isHovered, 
              'has-checkmark': input.name && input.name.trim() !== '' 
            }"
            @mouseenter="input.isHovered = true"
            @mouseleave="input.isHovered = false"
          >
            
              <input
                type="text"
                class="input-field name-field"
                v-model="input.name"
                placeholder="Name"
                @input="updateProduzentValue(index)"
              />
             
           
            
            <div v-if="input.name && input.name.trim() !== ''" class="checkmark">
              <img src="@/assets/icons/y.png" class="icon-y" alt="checkmark" />
            </div>
            
            <!-- Plus Icon -->
            <div
              v-if="index === 0 && input.isHovered"
              class="plus-icon"
              @click="addProduzentInput"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </div>
            
            <!-- Minus Icon -->
            <div
              v-if="index > 0 && input.isHovered"
              class="minus-icon"
              @click="removeProduzentInput(index)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </div>
            
            <div class="spacer" @click="emit('openVideoPopup', 'produzent')">
              <div class="play" :class="{ visible: input.isHovered }">
                <img :src="iconPlay" class="icon" alt="play icon" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="section-frame">
        <!-- Jahr der Produktion -->
        <div class="section">
          <div class="title">Jahr der Produktion</div>
          <div
            class="form-field"
            :class="{ 
              'is-hovered': isHoveredJahr, 
              'has-checkmark': productionYearValid 
            }"
            @mouseenter="isHoveredJahr = true"
            @mouseleave="isHoveredJahr = false"
          >
            <input
              type="text"
              class="input-field"
              v-model="productionYear"
              placeholder="2025"
              maxlength="4"
              @input="updateProductionYear"
            />
            <div v-if="productionYearValid" class="checkmark">
              <img src="@/assets/icons/y.png" class="icon-y" alt="checkmark" />
            </div>
            <div class="spacer" @click="emit('openVideoPopup', 'jahr')">
              <div class="play" :class="{ visible: isHoveredJahr }">
                <img :src="iconPlay" class="icon" alt="play icon" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="frame2">
      <!-- Weitere Mitwirkende -->
      <div class="section weitere-section" :class="{ active: isWeitereActive }">
        <div class="top-line">
          <div class="title">Weitere Mitwirkende</div>
          <div class="btn-switch" @click="toggleWeitere">
            <img src="/icon/circle.svg" class="circle" alt="circle" />
          </div>
        </div>

        <div
          v-for="(input, index) in weitereInputs"
          :key="index"
          class="form-field-bottom"
          :class="{ 'is-hovered': input.isHovered }"
          @mouseenter="input.isHovered = true"
          @mouseleave="input.isHovered = false"
        >
          <div class="combo-box" :class="{ 'has-checkmark': input.role && input.role.trim() !== '' }">
            <div class="custom-select" @click="toggleRoleDropdown(index)">
              <div class="select-trigger" :class="{ 'selected': input.role && input.role.trim() !== '' }" :disabled="!isWeitereActive">
                {{ input.role || 'Rolle' }}
              </div>
              <div class="dropdown" v-show="input.isRoleDropdownOpen && isWeitereActive">
                <div class="option" @click.stop="selectRoleOption(index, 'Composer')">Composer</div>
                <div class="option" @click.stop="selectRoleOption(index, 'Lyricist')">Lyricist</div>
                <div class="option" @click.stop="selectRoleOption(index, 'Engineer')">Engineer</div>
                <div class="option" @click.stop="selectRoleOption(index, 'Mixing')">Mixing</div>
              </div>
            </div>
            <div v-if="input.role && input.role.trim() !== ''" class="checkmark">
              <img src="@/assets/icons/y.png" class="icon-y" alt="checkmark" />
            </div>
            <div v-else class="checkmark">
              <img src="@/assets/icons/step2/Icon DD.svg" class="icon-select" alt="dropdown" />
            </div>
          </div>

          <div
            class="form-field name-field-small"
            :class="{ 'has-checkmark': input.name && input.name.trim() !== '' && !isWeitereActive }"
            :disabled="!isWeitereActive"
          > 
           <input
              type="text"
              class="input-field name-field"
              v-model="input.name"
              placeholder="Name"
              :disabled="!isWeitereActive"
              @input="updateWeitereValue(index)"
            />  
            <div v-if="input.name && input.name.trim() !== '' && !isWeitereActive" class="checkmark">
              <img src="@/assets/icons/y.png" class="icon-y" alt="checkmark" />
            </div>
            </div>
          

          
          <!-- Plus Icon -->
          <div
            v-if="index === 0 && input.isHovered && isWeitereActive"
            class="plus-icon"
            @click="addWeitereInput"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </div>
          
          <!-- Minus Icon -->
          <div
            v-if="index > 0 && input.isHovered && isWeitereActive"
            class="minus-icon"
            @click="removeWeitereInput(index)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </div>
          
          <div class="spacer" @click="emit('openVideoPopup', 'weitere')">
            <div class="play" :class="{ visible: input.isHovered && isWeitereActive }">
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
  }
});

const emit = defineEmits(['openVideoPopup', 'save-song']);

// ─── تهيئة البيانات المحلية مع name و percentage ───
const artistInputs = ref([{ name: '', isHovered: false }]);
const featureInputs = ref([{ name: '', isHovered: false }]);
const pLineInputs = ref([{ name: '', isHovered: false }]);
const produzentInputs = ref([{ name: '', isHovered: false }]);
const productionYear = ref('');
const productionYearValid = ref(false);

// Weitere Mitwirkende
const weitereInputs = ref([
  { role: '', name: '', isHovered: false, isRoleDropdownOpen: false }
]);

// Toggle states
const isFeatureActive = ref(false);
const isWeitereActive = ref(false);

// Hover states
const isHoveredJahr = ref(false);

// تخزين القيم السابقة للمقارنة
const previousValues = ref({
  artist: [],
  feature: [],
  p_line: [],
  producer: [],
  production_year: null,
  other_contributors: []
});

// ─── تحديث البيانات من props ───
const updateFromProps = () => {
  if (!props.currentSong?.uuid) return;

  console.log('🔄 MitwirkendeContent: تحديث من currentSong', props.currentSong);

  // Artist
  if (props.currentSong.contributors?.artist) {
    const artistArray = Array.isArray(props.currentSong.contributors.artist) 
      ? props.currentSong.contributors.artist 
      : [];
    
    artistInputs.value = artistArray.length > 0 
      ? artistArray.map(item => ({ 
          name: item.name || '', 
          
          isHovered: false 
        }))
      : [{ name: '', isHovered: false }];
    
    previousValues.value.artist = JSON.parse(JSON.stringify(artistArray));
  }

  // Feature
  if (props.currentSong.contributors?.feature) {
    const featureArray = Array.isArray(props.currentSong.contributors.feature) 
      ? props.currentSong.contributors.feature 
      : [];
    
    featureInputs.value = featureArray.length > 0 
      ? featureArray.map(item => ({ 
          name: item.name || '', 
          
          isHovered: false 
        }))
      : [{ name: '', isHovered: false }];
    
    isFeatureActive.value = featureArray.length > 0;
    previousValues.value.feature = JSON.parse(JSON.stringify(featureArray));
  }

  // P-Line
  if (props.currentSong.contributors?.p_line) {
    const pLineArray = Array.isArray(props.currentSong.contributors.p_line) 
      ? props.currentSong.contributors.p_line 
      : [];
    
    pLineInputs.value = pLineArray.length > 0 
      ? pLineArray.map(item => ({ 
          name: item.name || '', 
          
          isHovered: false 
        }))
      : [{ name: '', isHovered: false }];
    
    previousValues.value.p_line = JSON.parse(JSON.stringify(pLineArray));
  }

  // Producer
  if (props.currentSong.contributors?.producer) {
    const producerArray = Array.isArray(props.currentSong.contributors.producer) 
      ? props.currentSong.contributors.producer 
      : [];
    
    produzentInputs.value = producerArray.length > 0 
      ? producerArray.map(item => ({ 
          name: item.name || '', 
          
          isHovered: false 
        }))
      : [{ name: '', isHovered: false }];
    
    previousValues.value.producer = JSON.parse(JSON.stringify(producerArray));
  }

  // Other Contributors
  if (props.currentSong.contributors?.other_contributors) {
    const otherArray = Array.isArray(props.currentSong.contributors.other_contributors) 
      ? props.currentSong.contributors.other_contributors 
      : [];
    
    if (otherArray.length > 0) {
      weitereInputs.value = otherArray.map(item => ({
        role: item.role || '',
        name: item.name || '',
       
        isHovered: false,
        isRoleDropdownOpen: false
      }));
      isWeitereActive.value = true;
    } else {
      weitereInputs.value = [{ role: '', name: '', isHovered: false, isRoleDropdownOpen: false }];
      isWeitereActive.value = false;
    }
    
    previousValues.value.other_contributors = JSON.parse(JSON.stringify(otherArray));
  }

  // Production Year
  if (props.currentSong.production_year) {
    productionYear.value = String(props.currentSong.production_year);
    productionYearValid.value = validateYear(productionYear.value);
    previousValues.value.production_year = props.currentSong.production_year;
  }
};

// ─── دوال التحقق ───
const validateYear = (year) => {
  if (!year) return false;
  const yearStr = String(year).trim();
  if (!/^[0-9]{4}$/.test(yearStr)) return false;
  const num = parseInt(yearStr, 10);
  return num >= 1900 && num <= 2100;
};

// ─── دالة إرسال التحديثات - ترسل فقط القيم المتغيرة ───
const sendUpdate = () => {
  if (!props.currentSong?.uuid) {
    console.warn('⚠️ MitwirkendeContent: لا يوجد UUID للأغنية');
    return;
  }

  // تجميع القيم الحالية
  const currentArtist = artistInputs.value
    .filter(input => input.name && input.name.trim() !== '')
    .map(input => ({ 
      name: input.name.trim(), 
     
    }));
  
  const currentFeature = featureInputs.value
    .filter(input => input.name && input.name.trim() !== '')
    .map(input => ({ 
      name: input.name.trim(), 
     
    }));
  
  const currentPLine = pLineInputs.value
    .filter(input => input.name && input.name.trim() !== '')
    .map(input => ({ 
      name: input.name.trim(), 
     
    }));
  
  const currentProducer = produzentInputs.value
    .filter(input => input.name && input.name.trim() !== '')
    .map(input => ({ 
      name: input.name.trim(), 
     
    }));
  
  const currentProductionYear = productionYearValid.value ? parseInt(productionYear.value, 10) : null;

  const currentOther = weitereInputs.value
    .filter(input => input.role && input.role.trim() !== '' && input.name && input.name.trim() !== '')
    .map(input => ({ 
      role: input.role.trim(),
      name: input.name.trim(), 
     
    }));

  const payload = { contributors: {} };
  let hasChanges = false;

  // مقارنة Artist
  if (JSON.stringify(currentArtist) !== JSON.stringify(previousValues.value.artist)) {
    payload.contributors['artist'] = currentArtist;
    console.log('🔄 تغيير في Artist:', { 
      قديم: previousValues.value.artist, 
      جديد: currentArtist 
    });
    hasChanges = true;
  }

  // مقارنة Feature
  if (JSON.stringify(currentFeature) !== JSON.stringify(previousValues.value.feature)) {
    payload.contributors['feature'] = currentFeature;
    console.log('🔄 تغيير في Feature:', { 
      قديم: previousValues.value.feature, 
      جديد: currentFeature 
    });
    hasChanges = true;
  }

  // مقارنة P-Line
  if (JSON.stringify(currentPLine) !== JSON.stringify(previousValues.value.p_line)) {
    payload.contributors['p_line'] = currentPLine;
    console.log('🔄 تغيير في P-Line:', { 
      قديم: previousValues.value.p_line, 
      جديد: currentPLine 
    });
    hasChanges = true;
  }

  // مقارنة Producer
  if (JSON.stringify(currentProducer) !== JSON.stringify(previousValues.value.producer)) {
    payload.contributors['producer'] = currentProducer;
    console.log('🔄 تغيير في Producer:', { 
      قديم: previousValues.value.producer, 
      جديد: currentProducer 
    });
    hasChanges = true;
  }

  // مقارنة Production Year
  if (currentProductionYear !== previousValues.value.production_year) {
    payload['production_year'] = currentProductionYear;
    console.log('🔄 تغيير في Production Year:', { 
      قديم: previousValues.value.production_year, 
      جديد: currentProductionYear 
    });
    hasChanges = true;
  }

  // مقارنة Other Contributors
  if (JSON.stringify(currentOther) !== JSON.stringify(previousValues.value.other_contributors)) {
    payload.contributors['other_contributors'] = currentOther;
    console.log('🔄 تغيير في Other Contributors:', { 
      قديم: previousValues.value.other_contributors, 
      جديد: currentOther 
    });
    hasChanges = true;
  }

  if (!hasChanges) {
    console.log('ℹ️ MitwirkendeContent: لا توجد تغييرات');
    return;
  }

  // إذا كان contributors فارغاً، نحذفه من الـ payload
  if (Object.keys(payload.contributors).length === 0) {
    delete payload.contributors;
  }

  console.log('📤 MitwirkendeContent: إرسال التغييرات فقط:', payload);

  // تحديث القيم السابقة
  previousValues.value = {
    artist: JSON.parse(JSON.stringify(currentArtist)),
    feature: JSON.parse(JSON.stringify(currentFeature)),
    p_line: JSON.parse(JSON.stringify(currentPLine)),
    producer: JSON.parse(JSON.stringify(currentProducer)),
    production_year: currentProductionYear,
    other_contributors: JSON.parse(JSON.stringify(currentOther))
  };

  // إرسال فقط التغييرات
  emit('save-song', payload);
};

// ─── إنشاء دالة debounce للإرسال ───
const debouncedSendUpdate = debounce(sendUpdate, 1500);

// ─── دوال إدارة Artist ───
const updateArtistValue = (index) => {
  debouncedSendUpdate();
};

const addArtistInput = () => {
  artistInputs.value.push({ name: '', isHovered: false });
  debouncedSendUpdate();
};

const removeArtistInput = (index) => {
  if (artistInputs.value.length > 1) {
    artistInputs.value.splice(index, 1);
    debouncedSendUpdate();
  }
};

// ─── دوال إدارة Feature ───
const updateFeatureValue = (index) => {
  debouncedSendUpdate();
};

const addFeatureInput = () => {
  featureInputs.value.push({ name: '', isHovered: false });
  debouncedSendUpdate();
};

const removeFeatureInput = (index) => {
  if (featureInputs.value.length > 1) {
    featureInputs.value.splice(index, 1);
    debouncedSendUpdate();
  }
};

const toggleFeature = () => {
  isFeatureActive.value = !isFeatureActive.value;
  if (!isFeatureActive.value) {
    featureInputs.value = [{ name: '', isHovered: false }];
  }
  debouncedSendUpdate();
};

// ─── دوال إدارة P-Line ───
const updatePLineValue = (index) => {
  debouncedSendUpdate();
};

const addPLineInput = () => {
  pLineInputs.value.push({ name: '', isHovered: false });
  debouncedSendUpdate();
};

const removePLineInput = (index) => {
  if (pLineInputs.value.length > 1) {
    pLineInputs.value.splice(index, 1);
    debouncedSendUpdate();
  }
};

// ─── دوال إدارة Produzent ───
const updateProduzentValue = (index) => {
  debouncedSendUpdate();
};

const addProduzentInput = () => {
  produzentInputs.value.push({ name: '', isHovered: false });
  debouncedSendUpdate();
};

const removeProduzentInput = (index) => {
  if (produzentInputs.value.length > 1) {
    produzentInputs.value.splice(index, 1);
    debouncedSendUpdate();
  }
};

// ─── دوال إدارة Production Year ───
const updateProductionYear = () => {
  productionYearValid.value = validateYear(productionYear.value);
  debouncedSendUpdate();
};

// ─── دوال إدارة Weitere Mitwirkende ───
const updateWeitereValue = (index) => {
  debouncedSendUpdate();
};

const addWeitereInput = () => {
  weitereInputs.value.push({ role: '', name: '', isHovered: false, isRoleDropdownOpen: false });
  debouncedSendUpdate();
};

const removeWeitereInput = (index) => {
  if (weitereInputs.value.length > 1) {
    weitereInputs.value.splice(index, 1);
    debouncedSendUpdate();
  }
};

const toggleWeitere = () => {
  isWeitereActive.value = !isWeitereActive.value;
  if (!isWeitereActive.value) {
    weitereInputs.value = [{ role: '', name: '', isHovered: false, isRoleDropdownOpen: false }];
  }
  debouncedSendUpdate();
};

const toggleRoleDropdown = (index) => {
  if (!isWeitereActive.value) return;
  weitereInputs.value.forEach((inp, i) => {
    inp.isRoleDropdownOpen = (i === index) ? !inp.isRoleDropdownOpen : false;
  });
};

const selectRoleOption = (index, role) => {
  weitereInputs.value[index].role = role;
  weitereInputs.value[index].isRoleDropdownOpen = false;
  debouncedSendUpdate();
};

// ─── مراقبة تغييرات currentSong ───
watch(() => props.currentSong, (newSong) => {
  if (newSong?.uuid) {
    updateFromProps();
  }
}, { deep: true, immediate: true });

// ─── إرسال تحديث فوري عند إزالة المكون ───
onUnmounted(() => {
  console.log('🗑️ MitwirkendeContent: تم إزالة المكون');
  if (debouncedSendUpdate.flush) {
    debouncedSendUpdate.flush();
  }
});

onMounted(() => {
  console.log('🚀 MitwirkendeContent: تم التحميل');
  updateFromProps();
});
</script>



<style lang="scss" scoped>
.tab-content {
  display: flex;
  padding-right: 40px;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  align-self: stretch;
  width: 100%;
}

.frame1 {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  align-self: stretch;
}

.frame{
  display: flex;
  align-items: start;
  gap: 20px;
  align-self: stretch;
  width: 100%;
}

.section-frame {
  display: flex;
  flex-direction: column;
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

.feature-section .form-field,
.weitere-section .form-field-bottom {
  pointer-events: none;
  opacity: 0.5;
}

.feature-section.active .form-field,
.weitere-section.active .form-field-bottom {
  pointer-events: auto;
  opacity: 1;
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

.form-field .input-field,
.form-field-name .input-field {
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
  width: 100%;
  box-sizing: border-box;
  position: relative;
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
.form-field .minus-icon,
.form-field-bottom .plus-icon,
.form-field-bottom .minus-icon {
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
  z-index: 5;
}

.form-field:hover .plus-icon,
.form-field:hover .minus-icon,
.form-field-bottom:hover .plus-icon,
.form-field-bottom:hover .minus-icon {
  opacity: 1;
}

.form-field .plus-icon:hover,
.form-field .minus-icon:hover,
.form-field-bottom .plus-icon:hover,
.form-field-bottom .minus-icon:hover {
  background: var(--move);
}

.form-field .plus-icon svg,
.form-field .minus-icon svg,
.form-field-bottom .plus-icon svg,
.form-field-bottom .minus-icon svg {
  width: 18px;
  height: 18px;
}

.form-field .spacer,
.form-field-bottom .spacer {
  display: flex;
  width: 34px;
  height: 46px;
  padding: 9px 10px;
  align-items: center;
  border-radius: 5px;
  position: relative;
  cursor: pointer;
}

.form-field .spacer .play,
.form-field-bottom .spacer .play {
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

.form-field .spacer .play.visible,
.form-field-bottom .spacer .play.visible {
  opacity: 1;
  right: -10px;
}

.form-field .spacer .play .icon,
.form-field-bottom .spacer .play .icon {
  width: 18px;
  height: 20px;
  flex-shrink: 0;
}

.form-field .spacer:hover .icon,
.form-field-bottom .spacer:hover .icon {
  filter: brightness(0) invert(1);
}

.form-field .input-field::placeholder,
.form-field-bottom .input-field::placeholder {
  color: var(--Main-Colors-Dove, #6A6C6D);
  font-family: Heebo;
  font-size: 20px;
  font-style: normal;
  font-weight: 300;
  line-height: normal;
  letter-spacing: 1px;
}

.top-line {
  display: flex;
  height: 20px;
  padding-right: 37px;
  justify-content: space-between;
  align-items: center;
  align-self: stretch;
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

.feature-section.active .btn-switch,
.weitere-section.active .btn-switch {
  background: var(--Main-Colors-Strawberry, #D15);
}

.btn-switch .circle {
  width: 16px;
  height: 16px;
  margin-left: 2px;
  transition: margin-left 0.3s ease;
}

.feature-section.active .btn-switch .circle,
.weitere-section.active .btn-switch .circle {
  margin-left: 20px;
}

.frame2 {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 8px;
  align-self: stretch;
}

.form-field-bottom {
  display: flex;
  align-items: center;
  gap: 2px;
  align-self: stretch;
  position: relative;
}

.combo-box {
  display: flex;
  align-items: center;
  position: relative;
  width: 220px;
}

.combo-box .custom-select {
  position: relative;
  flex: 1 0 0;
}

.combo-box .select-trigger {
  display: flex;
  padding: 12px 40px 12px 12px;
  justify-content: space-between;
  align-items: center;
  border-radius: 5px 0 0 5px;
  background: var(--primary, #1B1C20);
  color: #6A6C6D;
  font-family: Heebo;
  font-size: 20px;
  font-weight: 300;
  line-height: normal;
  letter-spacing: 1px;
  height: 46px;
  max-width: 100%;
  box-sizing: border-box;
  cursor: pointer;
}

.combo-box .select-trigger:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.combo-box.has-checkmark .select-trigger {
  color: #FFF;
  padding-right: 40px;
}

.combo-box .dropdown {
  position: absolute;
  top: calc(100% + 2px);
  left: 0;
  right: 0;
  background: var(--primary, #1B1C20);
  border-radius: 5px;
  z-index: 10;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  max-height: 200px;
  overflow-y: auto;
  width: 100%;
  transition: opacity 0.2s ease, transform 0.2s ease;
  opacity: 1;
  transform: translateY(0);
}

.combo-box .dropdown[style*="display: none"] {
  opacity: 0;
  transform: translateY(-10px);
}

.combo-box .dropdown .option {
  padding: 10px 12px;
  color: #FFF;
  font-family: Heebo;
  font-size: 20px;
  cursor: pointer;
}

.combo-box .dropdown .option:hover {
  background: var(--secondary, #26282D);
}

.combo-box .checkmark {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
}

.combo-box .checkmark .icon-y{
  width: 18px;
}
.combo-box .checkmark .icon-select {
  width: 12px;
}

.combo-box:hover .icon-select {
  filter: brightness(0) invert(1);
}

.form-field-name {
  display: flex;
  align-items: center;
  gap: 2px;
  flex: 1 0 0;
  position: relative;
}

.form-field-name .input-field {
  border-radius: 0 5px 5px 0;
}

.form-field-name.has-checkmark .input-field {
  padding-right: 40px;
}

.form-field-name .checkmark {
  position: absolute;
  right: 48px;
  top: 50%;
  transform: translateY(-50%);
}

.form-field-name .checkmark .icon-y {
  width: 18px;
}
</style>