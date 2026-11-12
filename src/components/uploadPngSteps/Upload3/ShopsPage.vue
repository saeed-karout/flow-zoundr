<template>
  <div class="main-shops">
    <div v-if="isLoading" class="loading-spinner">
      <div class="spinner"></div>
    </div>
    
    <template v-else>
      <div class="top-shops">
        <div class="option-switch">
          <span>Alle {{ stores.length }} Stores auswählen</span>
          <div class="btn-switch" :class="{ active: allStoresSelected, 'is-correction': isCorrected('stores') }"  @click="toggleAllStores">
            <img src="/icon/circle.svg" class="circle" alt="circle image" />
          </div>
        </div>
        <div class="option-switch" >
          <span>Automatisch neue Stores hinzufügen</span>
          <div class="btn-switch" :class="{ active: autoAddStores, 'is-correction': isCorrected('add_new_stores') }" @click="toggleAutoAdd">
            <img src="/icon/circle.svg" class="circle" alt="circle image" />
          </div>
        </div>
      </div>

      <div class="stores">
        <div class="column-stores" v-for="(column, colIndex) in storeColumns" :key="colIndex">
          <div class="store" 
              v-for="store in column" 
              :key="store.id"
              @click="toggleStore(store.id)"
              :class="{ selected: store.selected }">
            <div class="checkmark">
              <img v-if="store.selected" src="/icon/y.png" class="icon-y" alt="selected icon" />
            </div>
            <div class="name-store">
              {{ store.name }}
            </div>
          </div>
        </div>
      </div>

      <div class="bottom-shops">
        <!-- Countries to Publish In -->
        <div class="form-field" >
          <div class="title">In welchen Länder möchtest du veröffentlichen?</div>
          <!-- Auto mode: all countries included -->
          <div v-if="isAllCountriesModeForInclude" class="search-box" @mouseenter="isIncludeHovered = true" @mouseleave="isIncludeHovered = false">
            <div class="section-input has-checkmark enabled">
              <input type="text" class="input-field" :class="{ 'is-correction': isCorrected('countries_included') }" v-model="allCountriesText" @input="handleAllCountriesInput('include')" />
              <div v-if="allCountriesText" class="checkmark">
                <img src="/icon/y.png" class="icon-y" alt="checkmark icon" />
              </div>
              <div class="spacer" @click="$emit('openVideoPopup', 'shopsCountriesInclude')">
                <div class="play" :class="{ visible: isIncludeHovered }">
                  <img src="/icon/play.png" class="icon" alt="play icon" />
                </div>
              </div>
            </div>
          </div>
          <!-- Manual mode for include -->
          <template v-else>
            <div v-for="(input, index) in countryInputs" :key="'country-' + index" class="search-box" :ref="el => { if (el) countrySearchRefs[index] = el }">
              <div :class="[
                  index === 0 ? 'section-input' : 'section-input2',
                  {
                    'is-hovered': input.isHovered,
                    'has-checkmark': input.isSelected,
                    'enabled': isCountryInputEnabled
                  }
                ]"
                  @mouseenter="input.isHovered = true"
                  @mouseleave="input.isHovered = false">
                <input type="text"
                      class="input-field"
                      v-model="input.searchQuery"
                      :placeholder="index === 0 ? 'Land suchen' : 'Weiteres Land'"
                      @focus="handleCountryFocus(index)"
                      @blur="handleCountryBlur(index)"
                      @input="handleCountryInput(index)"
                      @keydown.tab="handleTab($event, index, 'country')"
                      @keydown.enter="handleEnter($event, index, 'country')"
                      :disabled="!isCountryInputEnabled"
                      :ref="el => { if (el) countryInputsRefs[index] = el }" />
                <div v-if="input.isSelected" class="checkmark">
                  <img src="/icon/y.png" class="icon-y" alt="checkmark icon" />
                </div>
                <!-- زر الزائد (plus-icon) يظهر في السطر الأول فقط -->
                <div v-if="index === 0 && input.searchQuery.trim() !== '' && input.isHovered && isCountryInputEnabled"
                    class="plus-icon"
                    @click="addCountryInput">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </div>
                <!-- زر الناقص (minus-icon) يظهر في السطور التالية -->
                <div v-if="index > 0 && isCountryInputEnabled"
                    class="minus-icon"
                    :class="{ 'minus-visible': input.isHovered || input.searchQuery.trim() === '' }"
                    @click="removeCountryInput(index)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </div>
                <!-- spacer يظهر فقط في السطر الأول -->
                <div v-if="index === 0" class="spacer" @click="$emit('openVideoPopup', 'shopsCountriesInclude')">
                  <div class="play" :class="{ visible: (input.isFocused || input.isHovered) && isCountryInputEnabled }">
                    <img src="/icon/play.png" class="icon" alt="play icon" />
                  </div>
                </div>
              </div>
              <!-- نتائج البحث للدول -->
              <div v-if="showCountryResults === index && filteredCountryResults(index).length > 0" 
                   :class="['search-results', { 'search-results2': index > 0 }]">
                <div v-for="country in filteredCountryResults(index)"
                    :key="country.id"
                    class="search-result-item"
                    @mousedown.prevent="selectCountryResult(country, index)">
                  <span>{{ country.name }}</span>
                  <!-- السبيسر يظهر فقط في السطر الأول (index === 0) -->
                  <div v-if="index === 0" class="spacer"></div>
                </div>
              </div>
            </div>
          </template>
        </div>

        <!-- Countries to Exclude -->
        <div class="form-field" :class="{ 'disabled': !isExcludeInputEnabled,  }">
          <div class="title">Welche Länder möchtest du ausschliessen?</div>
          <!-- Auto mode: no excluded countries -->
          <div v-if="isAllCountriesModeForExclude" class="search-box" @mouseenter="isExcludeHovered = true" @mouseleave="isExcludeHovered = false">
            <div class="section-input has-checkmark enabled">
              <input type="text" class="input-field" :class="{'is-correction': isCorrected('countries_excluded')}" v-model="noCountriesText" @input="handleAllCountriesInput('exclude')" />
              <div v-if="noCountriesText" class="checkmark">
                <img src="/icon/y.png" class="icon-y" alt="checkmark icon" />
              </div>
              <div class="spacer" @click="$emit('openVideoPopup', 'shopsCountriesExclude')">
                <div class="play" :class="{ visible: isExcludeHovered }">
                  <img src="/icon/play.png" class="icon" alt="play icon" />
                </div>
              </div>
            </div>
          </div>
          <!-- Manual mode for exclude -->
          <template v-else>
            <div v-for="(input, index) in excludeInputs" :key="'exclude-' + index" class="search-box" :ref="el => { if (el) excludeSearchRefs[index] = el }">
              <div :class="[
                  index === 0 ? 'section-input' : 'section-input2',
                  {
                    'is-hovered': input.isHovered,
                    'has-checkmark': input.isSelected,
                    'enabled': isExcludeInputEnabled
                  }
                ]"
                  @mouseenter="input.isHovered = true"
                  @mouseleave="input.isHovered = false">
                <input type="text"
                      class="input-field"
                      v-model="input.searchQuery"
                      :placeholder="index === 0 ? 'Keine Länder' : 'Weiteres Land ausschliessen'"
                      @focus="handleExcludeFocus(index)"
                      @blur="handleExcludeBlur(index)"
                      @input="handleExcludeInput(index)"
                      @keydown.tab="handleTab($event, index, 'exclude')"
                      @keydown.enter="handleEnter($event, index, 'exclude')"
                      :disabled="!isExcludeInputEnabled"
                      :ref="el => { if (el) excludeInputsRefs[index] = el }" />
                <div v-if="input.isSelected" class="checkmark">
                  <img src="/icon/y.png" class="icon-y" alt="checkmark icon" />
                </div>
                <!-- زر الزائد (plus-icon) يظهر في السطر الأول فقط -->
                <div v-if="index === 0 && input.searchQuery.trim() !== '' && input.isHovered && isExcludeInputEnabled"
                    class="plus-icon"
                    @click="addExcludeInput">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </div>
                <!-- زر الناقص (minus-icon) يظهر في السطور التالية -->
                <div v-if="index > 0 && isExcludeInputEnabled"
                    class="minus-icon"
                    :class="{ 'minus-visible': input.isHovered || input.searchQuery.trim() === '' }"
                    @click="removeExcludeInput(index)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </div>
                <!-- spacer يظهر فقط في السطر الأول -->
                <div v-if="index === 0" class="spacer" @click="$emit('openVideoPopup', 'shopsCountriesExclude')">
                  <div class="play" :class="{ visible: (input.isFocused || input.isHovered) && isExcludeInputEnabled }">
                    <img src="/icon/play.png" class="icon" alt="play icon" />
                  </div>
                </div>
              </div>
              <!-- نتائج البحث للدول المستثناة -->
              <div v-if="showExcludeResults === index && filteredExcludeResults(index).length > 0" 
                   :class="['search-results', { 'search-results2': index > 0 }]">
                <div v-for="country in filteredExcludeResults(index)"
                    :key="country.id"
                    class="search-result-item"
                    @mousedown.prevent="selectExcludeResult(country, index)">
                  <span>{{ country.name }}</span>
                  <!-- السبيسر يظهر فقط في السطر الأول (index === 0) -->
                  <div v-if="index === 0" class="spacer"></div>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>

    </template>
  </div>
  <!-- زر Next -->
  <div class="btn-right" 
      :class="{ 
        'active': isButtonActive 
      }" 
      @click="handleNext">
  WEITER ZU PUBLISH
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch, onUnmounted } from 'vue';
import { useCorrections } from '@/composables/useCorrections';
import { debounce } from '@/utils/debounce';
import apiRequest from '@/lib/apiRequest';
import generalDataService from '@/services/generalData';

// حقول مطلوب تصحيحها (Korrektur) ← بوردر أحمر.
const { isCorrected } = useCorrections();

const props = defineProps({
  selectedCardIndex: { type: Number, default: null },
  releaseUuid: { type: String, required: true },
  storesList: { type: Array, default: () => [] }
});

const emit = defineEmits(['next', 'back', 'save-release', 'openVideoPopup']);

// حالة التحميل
const isLoading = ref(false);
const loadError = ref(null);

// المتاجر (من الـ API) - فقط Online
const stores = ref([]);
const totalStoresCount = ref(0);

// الدول (من الـ API)
const countries = ref([]);

// إعدادات عامة
const allStoresSelected = ref(false);
const autoAddStores = ref(false);

// ===== فصل حالات "جميع الدول" للحقلين بشكل مستقل =====
const isAllCountriesModeForInclude = ref(true);
const isAllCountriesModeForExclude = ref(true);

const allCountriesText = ref('Alle Länder');
const noCountriesText = ref('Keine Länder');

// متغيرات للهوفر في الوضع التلقائي
const isIncludeHovered = ref(false);
const isExcludeHovered = ref(false);

// تخزين القيم السابقة للمقارنة
const previousValues = ref({
  stores: [],
  countries_included: [],
  countries_excluded: [],
  catalog_number: '',
  add_new_stores: 0
});

// إعدادات البحث للدول
const countryInputs = ref([
  { searchQuery: '', isHovered: false, isFocused: false, isSelected: false }
]);

const excludeInputs = ref([
  { searchQuery: '', isHovered: false, isFocused: false, isSelected: false }
]);

const showCountryResults = ref(null);
const showExcludeResults = ref(null);

const countryInputsRefs = ref([]);
const excludeInputsRefs = ref([]);
const countrySearchRefs = ref([]);
const excludeSearchRefs = ref([]);

// ========== قائمة المتاجر الاجتماعية ==========
const SOCIAL_STORES = [
  'META (Facebook, Instagram)',
  'TikTok / Resso',
  'TikTok PMVs (Video)',
  'YouTube (Content ID)',
  'YouTube Music',
  'Spotify',
  'Spotify (Video)',
  'Spotify Audiobooks',
  'Apple Music (Audiobook)',
  'iTunes Store / Apple Music (VIDEO)',
  'iTunes Store / Apple Music / Shazam (Service)',
  'Pandora',
  'Deezer'
];

// ========== دوال جلب البيانات ==========

const fetchData = async () => {
  isLoading.value = true;
  loadError.value = null;
  
  try {
    const [storesData, countriesData] = await Promise.all([
      generalDataService.getStores(),
      generalDataService.getCountries()
    ]);
    
    let storesArray = [];
    if (Array.isArray(storesData)) {
      storesArray = storesData;
    } else if (storesData.data && Array.isArray(storesData.data)) {
      storesArray = storesData.data;
    }
    
    totalStoresCount.value = storesArray.length;
    
    // ✅ الصيغة الحالية: { id, name, is_active }. نعرض النشطة فقط (is_active === true)،
    //    مع توافق رجعي مع الحقل القديم status ('Online'/'online'/'active').
    const onlineStores = storesArray.filter(store =>
      store.is_active === true ||
      store.status === 'Online' || store.status === 'online' || store.status === 'active'
    );
    
    let processedStores = onlineStores.map((store, index) => ({
      id: store.id || index + 1,
      name: store.name || store,
      status: store.status || 'Online',
      selected: false,
      isSocial: SOCIAL_STORES.some(socialName => 
        store.name && store.name.toLowerCase().includes(socialName.toLowerCase())
      )
    }));
    
    if (props.storesList && props.storesList.length > 0) {
      processedStores = processedStores.map(store => {
        const matchedStore = props.storesList.find(s => s.name === store.name);
        return {
          ...store,
          selected: matchedStore ? matchedStore.selected : false
        };
      });
    }
    
    if (props.selectedCardIndex === 0) {
      processedStores = processedStores.map(store => ({ ...store, selected: true }));
      allStoresSelected.value = true;
      autoAddStores.value = true;
      previousValues.value.add_new_stores = 1;
    } else if (props.selectedCardIndex === 1) {
      processedStores = processedStores.map(store => ({ ...store, selected: !store.isSocial }));
      allStoresSelected.value = false;
      autoAddStores.value = false;
      previousValues.value.add_new_stores = 0;
    } else if (props.selectedCardIndex === 2) {
      processedStores = processedStores.map(store => ({ ...store, selected: false }));
      allStoresSelected.value = false;
      autoAddStores.value = false;
      previousValues.value.add_new_stores = 0;
    }
    
    stores.value = processedStores;
    
    let countriesArray = [];
    if (Array.isArray(countriesData)) {
      countriesArray = countriesData;
    } else if (countriesData.data && Array.isArray(countriesData.data)) {
      countriesArray = countriesData.data;
    }
    
    countries.value = countriesArray.map((country, index) => ({
      id: country.id || index + 1,
      name: country.name || country,
      code: country.code || country.iso || country.iso2 || country.code2 || '',
      flag: country.flag || country.flag_url || '/icon/default-flag.png'
    }));
    
    await fetchReleaseData();
    
  } catch (error) {
    console.error('❌ فشل جلب البيانات:', error);
    loadError.value = error.message || 'فشل تحميل البيانات';
  } finally {
    isLoading.value = false;
  }
};

const fetchReleaseData = async () => {
  if (!props.releaseUuid) return;
  
  try {
    const response = await apiRequest.get(`/releases/${props.releaseUuid}`);
    const releaseData = response.data.data || response.data;
    
    const hasStoresData = releaseData.stores && Array.isArray(releaseData.stores) && releaseData.stores.length > 0;
    
    if (hasStoresData) {
      stores.value.forEach(store => { store.selected = false; });
      releaseData.stores.forEach(storeName => {
        const store = stores.value.find(s => s.name === storeName);
        if (store) store.selected = true;
      });
    }
    
    if (releaseData.countries_included && Array.isArray(releaseData.countries_included)) {
      if (releaseData.countries_included.length > 0) {
        isAllCountriesModeForInclude.value = false;
        countryInputs.value = releaseData.countries_included.map(code => {
          const country = countries.value.find(c => c.code === code);
          return {
            searchQuery: country ? country.name : code,
            isHovered: false,
            isFocused: false,
            isSelected: true
          };
        });
      } else {
        isAllCountriesModeForInclude.value = true;
        allCountriesText.value = 'Alle Länder';
        countryInputs.value = [{ searchQuery: '', isHovered: false, isFocused: false, isSelected: false }];
      }
    }

    if (releaseData.countries_excluded && Array.isArray(releaseData.countries_excluded)) {
      if (releaseData.countries_excluded.length > 0) {
        isAllCountriesModeForExclude.value = false;
        excludeInputs.value = releaseData.countries_excluded.map(code => {
          const country = countries.value.find(c => c.code === code);
          return {
            searchQuery: country ? country.name : code,
            isHovered: false,
            isFocused: false,
            isSelected: true
          };
        });
      } else {
        isAllCountriesModeForExclude.value = true;
        noCountriesText.value = 'Keine Länder';
        excludeInputs.value = [{ searchQuery: '', isHovered: false, isFocused: false, isSelected: false }];
      }
    }
    
    // استرجاع قيمة add_new_stores من الـ API إذا كانت موجودة
    if (releaseData.add_new_stores !== undefined) {
      autoAddStores.value = releaseData.add_new_stores === 1 || releaseData.add_new_stores === true;
      previousValues.value.add_new_stores = releaseData.add_new_stores === 1 || releaseData.add_new_stores === true ? 1 : 0;
    }
    
    allStoresSelected.value = stores.value.length > 0 && stores.value.every(store => store.selected);
    previousValues.value = getCurrentData();
    
  } catch (error) {
    console.error('❌ فشل جلب بيانات الـ Release:', error);
  }
};

// ========== دوال المساعدة ==========

const selectedStoresCount = computed(() => {
  return stores.value.filter(store => store.selected).length;
});

const isCountryInputEnabled = computed(() => {
  return selectedStoresCount.value > 0;
});

const isExcludeInputEnabled = computed(() => {
  return true;
});

// ===== التحقق من وجود حقول فارغة غير مستخدمة =====
const hasEmptyInputs = computed(() => {
  let hasEmptyCountry = false;
  if (!isAllCountriesModeForInclude.value) {
    hasEmptyCountry = countryInputs.value.some(input => 
      input.searchQuery.trim() === '' && !input.isSelected
    );
  }
  
  let hasEmptyExclude = false;
  if (!isAllCountriesModeForExclude.value) {
    hasEmptyExclude = excludeInputs.value.some(input => 
      input.searchQuery.trim() === '' && !input.isSelected
    );
  }
  
  return hasEmptyCountry || hasEmptyExclude;
});

// ===== شرط تفعيل زر Next =====
const isButtonActive = computed(() => {
  const hasSelectedStores = selectedStoresCount.value > 0;
  
  if (!hasSelectedStores) {
    return false;
  }
  
  if (hasEmptyInputs.value) {
    return false;
  }
  
  if (isAllCountriesModeForInclude.value) {
    return true;
  }
  
  const hasCountries = countryInputs.value.some(input => input.searchQuery.trim() !== '');
  return hasCountries;
});

// دالة تجميع البيانات الحالية
const getCurrentData = () => {
  const selectedStoreNames = stores.value
    .filter(store => store.selected)
    .map(store => store.name);

  let includedCountries = [];
  if (!isAllCountriesModeForInclude.value) {
    includedCountries = countryInputs.value
      .filter(input => input.searchQuery.trim() !== '')
      .map(input => getCountryCode(input.searchQuery));
  }

  let excludedCountries = [];
  if (!isAllCountriesModeForExclude.value) {
    excludedCountries = excludeInputs.value
      .filter(input => input.searchQuery.trim() !== '')
      .map(input => getCountryCode(input.searchQuery));
  }

  return {
    stores: selectedStoreNames,
    countries_included: includedCountries,
    countries_excluded: excludedCountries,
    catalog_number: '',
    add_new_stores: autoAddStores.value ? 1 : 0
  };
};

const getCountryCode = (countryName) => {
  const country = countries.value.find(c => c.name === countryName);
  return country?.code || countryName.substring(0, 2).toUpperCase();
};

// ========== معالجة وضع "جميع الدول" ==========
const handleAllCountriesInput = (field) => {
  // ✅ عندما يبدأ المستخدم بالكتابة، ننتقل إلى الوضع اليدوي تلقائياً
  if (field === 'include' && allCountriesText.value && allCountriesText.value.trim() !== '') {
    // إذا كانت الكتابة مختلفة عن "Alle Länder"، ننتقل إلى الوضع اليدوي
    if (allCountriesText.value !== 'Alle Länder') {
      isAllCountriesModeForInclude.value = false;
      // البحث عن الدولة التي يكتبها المستخدم
      const searchTerm = allCountriesText.value.trim();
      const foundCountry = countries.value.find(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      if (foundCountry) {
        countryInputs.value = [{ 
          searchQuery: foundCountry.name, 
          isHovered: false, 
          isFocused: true, 
          isSelected: true 
        }];
        showCountryResults.value = 0;
        previousValues.value.countries_included = [foundCountry.code];
        debouncedSendUpdate();
      } else {
        countryInputs.value = [{ 
          searchQuery: searchTerm, 
          isHovered: false, 
          isFocused: true, 
          isSelected: false 
        }];
        showCountryResults.value = 0;
      }
    }
    return;
  }
  
  if (field === 'include' && (!allCountriesText.value || !allCountriesText.value.trim())) {
    isAllCountriesModeForInclude.value = false;
    countryInputs.value = [{ searchQuery: '', isHovered: false, isFocused: true, isSelected: false }];
    nextTick(() => {
      showCountryResults.value = 0;
      updateCountryResults(0);
      if (countryInputsRefs.value[0]) {
        countryInputsRefs.value[0].focus();
      }
    });
  }
  
  if (field === 'exclude' && (!noCountriesText.value || !noCountriesText.value.trim())) {
    isAllCountriesModeForExclude.value = false;
    excludeInputs.value = [{ searchQuery: '', isHovered: false, isFocused: true, isSelected: false }];
    nextTick(() => {
      showExcludeResults.value = 0;
      updateExcludeResults(0);
      if (excludeInputsRefs.value[0]) {
        excludeInputsRefs.value[0].focus();
      }
    });
  }
};

// ========== دوال التركيز ======
const handleCountryFocus = (index) => {
  if (countryInputs.value[index]) {
    countryInputs.value[index].isFocused = true;
    showCountryResults.value = index;
    updateCountryResults(index);
  }
};

const handleExcludeFocus = (index) => {
  if (excludeInputs.value[index]) {
    excludeInputs.value[index].isFocused = true;
    showExcludeResults.value = index;
    updateExcludeResults(index);
  }
};

// ========== معالجة الـ Blur - لا نعود إلى "Alle Länder" تلقائياً ==========
const handleCountryBlur = (index) => {
  setTimeout(() => {
    if (countryInputs.value[index]) {
      countryInputs.value[index].isFocused = false;
    }
    
    // ✅ عند إفراغ الحقل، نجعله غير محدد ولا نعود إلى "Alle Länder" تلقائياً
    if (countryInputs.value[index] && countryInputs.value[index].searchQuery.trim() === '') {
      countryInputs.value[index].isSelected = false;
    }
    
    // ✅ فقط إذا كان هناك سطر واحد وفارغ، نعود إلى وضع "Alle Länder"
    // ولكن فقط إذا لم يكن المستخدم يكتب
    if (countryInputs.value.length === 1 && 
        countryInputs.value[0].searchQuery.trim() === '' && 
        !countryInputs.value[0].isSelected &&
        !countryInputs.value[0].isFocused) {
      // لا نعود تلقائياً إلى "Alle Länder"، نترك الحقل فارغاً
      // المستخدم يجب أن يختار من القائمة يدوياً
    }
  }, 200);
};

const handleExcludeBlur = (index) => {
  setTimeout(() => {
    if (excludeInputs.value[index]) {
      excludeInputs.value[index].isFocused = false;
    }
    
    if (excludeInputs.value[index] && excludeInputs.value[index].searchQuery.trim() === '') {
      excludeInputs.value[index].isSelected = false;
    }
  }, 200);
};

// ========== دوال البحث والاختيار ==========
const updateCountryResults = (index) => {
  if (countryInputs.value[index]) {
    countryInputs.value[index].isSelected = countryInputs.value[index].searchQuery.length > 0;
  }
};

const updateExcludeResults = (index) => {
  if (excludeInputs.value[index]) {
    excludeInputs.value[index].isSelected = excludeInputs.value[index].searchQuery.length > 0;
  }
};

const handleCountryInput = (index) => {
  updateCountryResults(index);
  if (countryInputs.value[index]) {
    showCountryResults.value = index;
    if (countryInputs.value[index].searchQuery.trim() === '') {
      countryInputs.value[index].isSelected = false;
    }
  }
};

const handleExcludeInput = (index) => {
  updateExcludeResults(index);
  if (excludeInputs.value[index]) {
    showExcludeResults.value = index;
    if (excludeInputs.value[index].searchQuery.trim() === '') {
      excludeInputs.value[index].isSelected = false;
    }
  }
};

const filteredCountryResults = (index) => {
  const query = countryInputs.value[index]?.searchQuery?.toLowerCase() || '';
  
  const selectedCountries = countryInputs.value
    .filter((_, i) => i !== index)
    .map(input => input.searchQuery.trim().toLowerCase())
    .filter(name => name !== '');
  
  let results = countries.value.filter(country => {
    const countryName = country.name.toLowerCase();
    const isSelected = selectedCountries.includes(countryName);
    return !isSelected;
  });
  
  if (query) {
    results = results.filter(country => country.name.toLowerCase().includes(query));
  }
  
  // ✅ إضافة "Alle Länder" في بداية القائمة دائماً
  const allLanderOption = { id: 'all', name: 'Alle Länder', code: 'ALL' };
  results = [allLanderOption, ...results];
  
  return results;
};

const filteredExcludeResults = (index) => {
  const query = excludeInputs.value[index]?.searchQuery?.toLowerCase() || '';
  
  const selectedCountries = excludeInputs.value
    .filter((_, i) => i !== index)
    .map(input => input.searchQuery.trim().toLowerCase())
    .filter(name => name !== '');
  
  let results = countries.value.filter(country => {
    const countryName = country.name.toLowerCase();
    const isSelected = selectedCountries.includes(countryName);
    return !isSelected;
  });
  
  if (query) {
    results = results.filter(country => country.name.toLowerCase().includes(query));
  }
  
  // ✅ إضافة "Keine Länder" في بداية القائمة دائماً
  const keineLanderOption = { id: 'none', name: 'Keine Länder', code: 'NONE' };
  results = [keineLanderOption, ...results];
  
  return results;
};

// ========== دوال اختيار الدولة ==========
const selectCountryResult = (country, index) => {
  if (!isCountryInputEnabled.value) return;
  
  // ✅ إذا اختار "Alle Länder"
  if (country.id === 'all') {
    isAllCountriesModeForInclude.value = true;
    allCountriesText.value = 'Alle Länder';
    countryInputs.value = [{ searchQuery: '', isHovered: false, isFocused: false, isSelected: false }];
    showCountryResults.value = null;
    debouncedSendUpdate();
    return;
  }
  
  countryInputs.value[index].searchQuery = country.name;
  countryInputs.value[index].isSelected = true;
  countryInputs.value[index].isFocused = false;
  showCountryResults.value = null;
  
  debouncedSendUpdate();
};

const selectExcludeResult = (country, index) => {
  if (!isExcludeInputEnabled.value) return;
  
  // ✅ إذا اختار "Keine Länder"
  if (country.id === 'none') {
    isAllCountriesModeForExclude.value = true;
    noCountriesText.value = 'Keine Länder';
    excludeInputs.value = [{ searchQuery: '', isHovered: false, isFocused: false, isSelected: false }];
    showExcludeResults.value = null;
    debouncedSendUpdate();
    return;
  }
  
  excludeInputs.value[index].searchQuery = country.name;
  excludeInputs.value[index].isSelected = true;
  excludeInputs.value[index].isFocused = false;
  showExcludeResults.value = null;
  
  debouncedSendUpdate();
};

// ========== دوال إضافة وحذف المدخلات ==========
const removeCountryInput = (index) => {
  if (!isCountryInputEnabled.value) return;
  
  if (countryInputs.value.length > 1) {
    countryInputs.value.splice(index, 1);
    countryInputs.value.forEach(input => {
      input.isSelected = input.searchQuery.trim() !== '';
    });
    // ✅ تنظيف الحالة بعد الحذف
    nextTick(() => {
      if (countryInputs.value.length > 0) {
        const lastIndex = countryInputs.value.length - 1;
        if (countryInputs.value[lastIndex].searchQuery.trim() === '') {
          showCountryResults.value = lastIndex;
          countryInputs.value[lastIndex].isFocused = true;
          if (countryInputsRefs.value[lastIndex]) {
            countryInputsRefs.value[lastIndex].focus();
          }
        }
      }
    });
    debouncedSendUpdate();
  } else {
    // ✅ إذا كان هناك سطر واحد فقط، امسح القيمة ولا نعود إلى "Alle Länder"
    countryInputs.value[0].searchQuery = '';
    countryInputs.value[0].isSelected = false;
    countryInputs.value[0].isHovered = false;
    // ✅ لا نغلق الوضع اليدوي، بل نترك الحقل فارغاً مع إظهار زر الحذف
    debouncedSendUpdate();
  }
};

const removeExcludeInput = (index) => {
  if (excludeInputs.value.length > 1) {
    excludeInputs.value.splice(index, 1);
    excludeInputs.value.forEach(input => {
      input.isSelected = input.searchQuery.trim() !== '';
    });
    nextTick(() => {
      if (excludeInputs.value.length > 0) {
        const lastIndex = excludeInputs.value.length - 1;
        if (excludeInputs.value[lastIndex].searchQuery.trim() === '') {
          showExcludeResults.value = lastIndex;
          excludeInputs.value[lastIndex].isFocused = true;
          if (excludeInputsRefs.value[lastIndex]) {
            excludeInputsRefs.value[lastIndex].focus();
          }
        }
      }
    });
    debouncedSendUpdate();
  } else {
    excludeInputs.value[0].searchQuery = '';
    excludeInputs.value[0].isSelected = false;
    excludeInputs.value[0].isHovered = false;
    debouncedSendUpdate();
  }
};

// ========== دوال إضافة مدخل جديد ==========
const addCountryInput = () => {
  if (!isCountryInputEnabled.value) return;
  
  const hasEmptyInput = countryInputs.value.some(input => input.searchQuery.trim() === '');
  if (!hasEmptyInput) {
    countryInputs.value.push({ 
      searchQuery: '', 
      isHovered: false, 
      isFocused: true, 
      isSelected: false 
    });
    nextTick(() => {
      const lastIndex = countryInputs.value.length - 1;
      if (countryInputsRefs.value[lastIndex]) {
        countryInputsRefs.value[lastIndex].focus();
        countryInputs.value[lastIndex].isHovered = false;
        showCountryResults.value = lastIndex;
        updateCountryResults(lastIndex);
      }
    });
  }
};

const addExcludeInput = () => {
  if (!isExcludeInputEnabled.value) return;
  
  const hasEmptyInput = excludeInputs.value.some(input => input.searchQuery.trim() === '');
  if (!hasEmptyInput) {
    excludeInputs.value.push({ 
      searchQuery: '', 
      isHovered: false, 
      isFocused: true, 
      isSelected: false 
    });
    nextTick(() => {
      const lastIndex = excludeInputs.value.length - 1;
      if (excludeInputsRefs.value[lastIndex]) {
        excludeInputsRefs.value[lastIndex].focus();
        excludeInputs.value[lastIndex].isHovered = false;
        showExcludeResults.value = lastIndex;
        updateExcludeResults(lastIndex);
      }
    });
  }
};

// ========== معالجة مفاتيح ==========
const handleTab = (event, index, type) => {
  if (type === 'country' && !isCountryInputEnabled.value) return;
  if (type === 'exclude' && !isExcludeInputEnabled.value) return;
  
  const results = type === 'country' ? filteredCountryResults(index) : filteredExcludeResults(index);
  if (results.length > 0 && results[0]) {
    event.preventDefault();
    const selectedCountry = results[0];
    if (type === 'country') {
      selectCountryResult(selectedCountry, index);
    } else {
      selectExcludeResult(selectedCountry, index);
    }
  }
};

const handleEnter = (event, index, type) => {
  if (type === 'country' && !isCountryInputEnabled.value) return;
  if (type === 'exclude' && !isExcludeInputEnabled.value) return;
  
  const results = type === 'country' ? filteredCountryResults(index) : filteredExcludeResults(index);
  if (results.length > 0 && results[0]) {
    event.preventDefault();
    const selectedCountry = results[0];
    if (type === 'country') {
      selectCountryResult(selectedCountry, index);
    } else {
      selectExcludeResult(selectedCountry, index);
    }
  }
};

// ========== دوال المتاجر ==========
const toggleAllStores = () => {
  allStoresSelected.value = !allStoresSelected.value;
  stores.value.forEach(store => {
    store.selected = allStoresSelected.value;
  });
};

const toggleStore = (storeId) => {
  const store = stores.value.find(s => s.id === storeId);
  if (store) {
    store.selected = !store.selected;
  }
};

// ========== دالة تبديل autoAdd ==========
const toggleAutoAdd = async () => {
  autoAddStores.value = !autoAddStores.value;
  
  // ✅ إرسال القيمة إلى السيرفر
  const payload = {
    add_new_stores: autoAddStores.value ? 1 : 0
  };
  
  console.log('📤 إرسال autoAddStores:', payload);
  
  try {
    const response = await apiRequest.put(
      `/releases/${props.releaseUuid}`,
      payload
    );
    
    console.log('✅ تم حفظ add_new_stores بنجاح:', response.data);
    previousValues.value.add_new_stores = payload.add_new_stores;
    emit('save-release', payload);
    
  } catch (error) {
    console.error('❌ فشل حفظ add_new_stores:', error);
    // إعادة الحالة السابقة في حالة الفشل
    autoAddStores.value = !autoAddStores.value;
    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: { 
        message: 'Fehler beim Speichern der Einstellung. Bitte versuchen Sie es erneut.', 
        type: 'error' 
      }
    }));
  }
};

// ========== إرسال التحديثات ==========
const sendUpdate = async () => {
  if (!props.releaseUuid) {
    console.warn('⚠️ لا يوجد releaseUuid');
    return;
  }
  
  const currentData = getCurrentData();
  const payload = {};
  let hasChanges = false;
  
  if (JSON.stringify(currentData.stores) !== JSON.stringify(previousValues.value.stores)) {
    payload.stores = currentData.stores;
    hasChanges = true;
  }
  
  if (JSON.stringify(currentData.countries_included) !== JSON.stringify(previousValues.value.countries_included)) {
    payload.countries_included = currentData.countries_included;
    hasChanges = true;
  }
  
  if (JSON.stringify(currentData.countries_excluded) !== JSON.stringify(previousValues.value.countries_excluded)) {
    payload.countries_excluded = currentData.countries_excluded;
    hasChanges = true;
  }
  
  if (currentData.add_new_stores !== previousValues.value.add_new_stores) {
    payload.add_new_stores = currentData.add_new_stores;
    hasChanges = true;
  }
  
  if (!hasChanges) {
    console.log('ℹ️ لا توجد تغييرات');
    return;
  }
  
  console.log('📤 إرسال التحديثات إلى السيرفر:', payload);
  
  try {
    const response = await apiRequest.put(
      `/releases/${props.releaseUuid}`,
      payload
    );
    
    console.log('✅ تم حفظ التغييرات بنجاح:', response.data);
    previousValues.value = { ...currentData };
    emit('save-release', payload);
    
  } catch (error) {
    console.error('❌ فشل حفظ التغييرات:', error);
    throw error;
  }
};

const debouncedSendUpdate = debounce(sendUpdate, 1500);

// ========== دوال Next ==========
const handleNext = async () => {
  console.log('🔘 handleNext called, isButtonActive:', isButtonActive.value);
  
  if (isButtonActive.value) {
    try {
      await sendUpdate();
      emit('next');
    } catch (error) {
      console.error('❌ فشل حفظ التغييرات:', error);
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { 
          message: 'Fehler beim Speichern der Daten. Bitte versuchen Sie es erneut.', 
          type: 'error' 
        }
      }));
    }
  }
};

// ========== معالجة النقر خارج الـ Dropdown ==========
const handleClickOutside = (event) => {
  let isClickInsideCountry = false;
  countrySearchRefs.value.forEach((ref) => {
    if (ref && ref.contains(event.target)) {
      isClickInsideCountry = true;
    }
  });
  
  let isClickInsideExclude = false;
  excludeSearchRefs.value.forEach((ref) => {
    if (ref && ref.contains(event.target)) {
      isClickInsideExclude = true;
    }
  });
  
  if (!isClickInsideCountry && !isClickInsideExclude) {
    showCountryResults.value = null;
    showExcludeResults.value = null;
    
    countryInputs.value.forEach(input => input.isFocused = false);
    excludeInputs.value.forEach(input => input.isFocused = false);
    
    // ✅ لا نعود إلى "Alle Länder" تلقائياً عند النقر خارجاً
    // نترك الحقل كما هو
  }
};

// ========== دوال المراقبة ==========
watch(
  () => stores.value.map(s => s.selected),
  () => {
    allStoresSelected.value = stores.value.every(store => store.selected);
    debouncedSendUpdate();
  },
  { deep: true }
);

watch(
  [countryInputs, excludeInputs, isAllCountriesModeForInclude, isAllCountriesModeForExclude],
  () => {
    debouncedSendUpdate();
  },
  { deep: true }
);

// ========== تقسيم المتاجر إلى أعمدة ==========
const storeColumns = computed(() => {
  const columns = [];
  const itemsPerColumn = Math.ceil(stores.value.length / 5);
  
  for (let i = 0; i < 5; i++) {
    const start = i * itemsPerColumn;
    const end = start + itemsPerColumn;
    columns.push(stores.value.slice(start, end));
  }
  
  return columns.filter(column => column.length > 0);
});

// ========== دورة الحياة ==========
onMounted(async () => {
  console.log('🚀 ShopsPage mounted');
  await fetchData();
  
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  if (debouncedSendUpdate.flush) {
    debouncedSendUpdate.flush();
  }
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style lang="scss" scoped>
/* جميع الأنماط */
.main-shops {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40px;
  flex: 1 0 0;
  align-self: stretch;
  height: 100%;
  width: 100%;
  position: relative;
}

.top-shops {
  display: flex;
  justify-content: space-between;
  align-items: center;
  align-self: stretch;
}

.top-shops .option-switch {
  display: flex;
  width: 488px;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}

.option-switch span {
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

.stores {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  align-self: stretch;
}

.column-stores {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  flex: 1 0 0;
}

.column-stores .store {
  display: flex;
  align-items: center;
  gap: 10px;
  align-self: stretch;
  cursor: pointer;
  transition: background-color 0.3s ease;
  border-radius: 5px;
}

.store .checkmark {
  display: flex;
  width: 28px;
  height: 28px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  border-radius: 5px;
  background: var(--Main-Colors-Slate-Dark, #1B1C20);
}

.store .checkmark .icon-y {
  width: 16px;
}

.store .name-store {
  display: flex;
  height: 13px;
  flex-direction: column;
  justify-content: center;
  flex: 1 0 0;
  overflow: hidden;
  color: #FFF;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: Heebo;
  font-size: 12px;
  font-style: normal;
  font-weight: 300;
  line-height: normal;
  letter-spacing: 0.6px;
  text-transform: uppercase;
}

.bottom-shops {
  display: flex;
  align-items: flex-start;
  gap: 40px;
  align-self: stretch;
}

.form-field {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 8px;
  flex: 1 0 0;
  position: relative;
  transition: opacity 0.3s ease;
}

.form-field.disabled {
  opacity: 0.5;
  pointer-events: none;
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

.search-box {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-self: stretch;
  position: relative;
  width: 100%;
}

/* ===== styles for section-input (first row with plus-icon) ===== */
.section-input {
  display: flex;
  align-items: center;
  gap: 2px;
  align-self: stretch;
  border-radius: 5px;
  width: 100%;
  position: relative;
  transition: opacity 0.3s ease;
  opacity: 0.5;
  pointer-events: none;
  cursor: not-allowed;
}

/* ===== styles for section-input2 (rows with minus-icon, index > 0) ===== */
.section-input2 {
  display: flex;
  align-items: center;
  gap: 2px;
  align-self: stretch;
  border-radius: 5px;
  width: calc(100% - 36px);
  position: relative;
  transition: opacity 0.3s ease;
  opacity: 0.5;
  pointer-events: none;
  cursor: not-allowed;
}

.section-input.enabled,
.section-input2.enabled {
  opacity: 1;
  pointer-events: auto;
  cursor: default;
}

.section-input .input-field,
.section-input2 .input-field {
  display: flex;
  height: 46px;
  padding: 12px;
  justify-content: space-between;
  align-items: center;
  flex: 1 0 0;
  border-radius: 5px;
  background: var(--Main-Colors-Slate-Dark, #1B1C20);
  outline: none;
  border: 0;
  color: #fff;
  font-family: Heebo;
  font-size: 18px;
  transition: opacity 0.3s ease;
}

.section-input:not(.enabled) .input-field,
.section-input2:not(.enabled) .input-field {
  opacity: 0.5;
  cursor: not-allowed;
}

.section-input.enabled .input-field,
.section-input2.enabled .input-field {
  opacity: 1;
  cursor: text;
}

.section-input.has-checkmark .input-field,
.section-input2.has-checkmark .input-field {
  padding-right: 94px;
}

.section-input .checkmark {
  position: absolute;
  right: 34px;
  top: 50%;
  transform: translateY(-50%);
}

.section-input2 .checkmark {
   position: absolute;
  right: 0px;
  top: 50%;
  transform: translateY(-50%);
}

.section-input .checkmark .icon-y
 {
  width: 18px;
  position: relative;
  right: 12px;
}

.section-input2 .checkmark .icon-y {
  width: 18px;
  position: relative;
  right: 12px;
}

.section-input .plus-icon,
.section-input .minus-icon{
  position: absolute;
  right: 75px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  display: flex;
  background: #fff;
  cursor: pointer;
  border-radius: 50%;
  color: var(--primary);
  transition: 0.3s ease-in-out;
  opacity: 0;
}

.section-input2 .plus-icon,
.section-input2 .minus-icon {
  position: absolute;
  right: 40px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  display: flex;
  background: #fff;
  cursor: pointer;
  border-radius: 50%;
  color: var(--primary);
  transition: 0.3s ease-in-out;
  opacity: 0;
}

/* ✅ إضافة كلاس minus-visible لجعل زر الحذف ظاهراً دائماً عند إفراغ الحقل */
.section-input2 .minus-icon.minus-visible,
.section-input .minus-icon.minus-visible {
  opacity: 1 !important;
}

.section-input.enabled:hover .plus-icon,
.section-input.enabled:hover .minus-icon,
.section-input2.enabled:hover .plus-icon,
.section-input2.enabled:hover .minus-icon {
  opacity: 1;
  transition: 0.3s ease-in-out;
}

.section-input .plus-icon:hover,
.section-input .minus-icon:hover,
.section-input2 .plus-icon:hover,
.section-input2 .minus-icon:hover {
  background: var(--move);
  transition: 0.3s ease;
}

.section-input .plus-icon svg,
.section-input .minus-icon svg,
.section-input2 .plus-icon svg,
.section-input2 .minus-icon svg {
  width: 18px;
  height: 18px;
}

/* spacer فقط في section-input (السطر الأول) */
.section-input .spacer {
  display: flex;
  width: 34px;
  height: 46px;
  padding: 9px 10px;
  align-items: center;
  border-radius: 5px;
  position: relative;
  cursor: pointer;
  transition: opacity 0.3s ease;
}

.section-input:not(.enabled) .spacer {
  opacity: 0.5;
  cursor: not-allowed;
}

/* لا يوجد spacer في section-input2 */
.section-input2 .spacer {
  display: none !important;
}

.section-input .spacer .play,
.section-input2 .spacer .play {
  display: flex;
  padding: 13px 13px;
  align-items: center;
  position: absolute;
  right: 20px;
  opacity: 0;
  border-radius: 0 5px 5px 0;
  background: var(--primary);
  transition: right 0.3s ease, opacity 0.3s ease;
}

.section-input.enabled .spacer .play.visible,
.section-input2.enabled .spacer .play.visible {
  right: -10px;
  opacity: 1;
}

.section-input .spacer .play .icon,
.section-input2 .spacer .play .icon {
  width: 18px;
  height: 20px;
  flex-shrink: 0;
  aspect-ratio: 9/10;
}

.section-input.enabled .spacer:hover .icon,
.section-input2.enabled .spacer:hover .icon {
  filter: brightness(0) invert(1);
}

/* الكلاس الأساسي لنتائج البحث - يظهر في السطر الأول (index === 0) مع plus-icon */
.search-results {
  position: absolute;
  top: calc(100% + 3px);
  left: 0;
  right: 0;
  background: var(--primary);
  border-radius: 5px;
  z-index: 100;
  max-height: 200px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  overflow: auto;
  scrollbar-width: none;
  width: calc(100% + 10px);
}

/* الكلاس search-results2 - يستخدم في السطور التي تحتوي على minus-icon (index > 0) */
.search-results2 {
  position: absolute;
  top: calc(100% + 3px);
  left: 0;
  right: 0;
  background: var(--primary);
  border-radius: 5px;
  z-index: 100;
  max-height: 200px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  overflow: auto;
  scrollbar-width: none;
  width: calc(100% - 36px);
}

/* السبيسر يظهر فقط في search-results (السطر الأول مع plus-icon) */
.search-results .search-result-item .spacer {
  width: 34px;
  height: 20px;
  background: transparent;
  margin-left: auto;
  display: flex !important;
}

/* في search-results2 (عند وجود minus-icon) نخفي السبيسر نهائياً */
.search-results2 .search-result-item .spacer {
  display: none !important;
}

.search-result-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  cursor: pointer;
  transition: background 0.2s ease;
  color: var(--Main-Colors-Slate-Light);
}

.search-result-item:hover {
  color: #fff;
}

.btn-right {
  position: absolute;
  right: 0;
  bottom: 0;
  border-radius: 5px;
  display: flex;
  padding: 12px 20px 13px 20px;
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
  cursor: not-allowed;
  background: var(--Main-Colors-Slate-Light, #3A3E42);
  color: #6A6C6D;
}

.btn-right.active {
  background: var(--Main-Colors-Strawberry, #D15);
  color: #fff;
  cursor: pointer;
}

.btn-right.active:hover {
  background: var(--dark-red);
  color: #fff;
}

.loading-spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
  min-height: 300px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 3px solid var(--Main-Colors-Slate-Dark, #1B1C20);
  border-top-color: var(--Main-Colors-Strawberry, #D15);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (min-width:1440px) and (max-width:1599px) {
  .top-shops{
    padding-right: 204px; 
    gap: 20px;
  }
  .store .name-store {
    max-width: 150px;
  }
  .option-switch span{
    font-size: 15px;
    letter-spacing: 0.8px;
  }
  .column-stores{
    gap: 8px;
  }
  .main-shops{
    gap: 24px;
  }
  .bottom-shops{
    padding-right: 204px;
  }
  .form-field .title{
    font-size: 12px;
  }
}

@media (min-width:1600px) and (max-width:1900px) {
  .store .name-store{
    max-width: 200px;
  }
}

@media (min-width:1600px) and (max-width:2074px){
  .top-shops{
    padding-right: 236px; 
    gap: 20px;
  }
  .bottom-shops{
    padding-right: 236px;
  }
  .btn-right{
    padding: 12px 20px 13px 20px;
  }
}

@media (min-width:2075px) and (max-width:3000px){
  .top-shops{
    padding-right: 331px; 
    gap: 20px;
  }
  .bottom-shops{
    padding-right: 331px; 
  }
}
</style>