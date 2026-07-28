<template>
  <div class="main-shops">
    <div v-if="isLoading" class="loading-spinner">
      <div class="spinner"></div>
    </div>
    
    <template v-else>
      <div class="top-shops">
        <div class="option-switch">
          <span>Alle {{ stores.length }} Stores auswählen</span>
          <div class="btn-switch" :class="{ active: allStoresSelected }"  @click="toggleAllStores">
            <img src="/icon/circle.svg" class="circle" alt="circle image" />
          </div>
        </div>
        <div class="option-switch" >
          <span>Automatisch neue Stores hinzufügen</span>
          <div class="btn-switch" :class="{ active: autoAddStores }" @click="toggleAutoAdd">
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
              <span>{{ store.name }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="bottom-shops">
        <!-- Countries to Publish In -->
        <div class="form-field">
          <div class="title">In welchen Länder möchtest du veröffentlichen?</div>
          <div v-for="(input, index) in countryInputs" :key="index" class="search-box">
            <div class="section-input" 
                :class="{ 
                  'is-hovered': input.isHovered, 
                  'has-checkmark': input.isSelected,
                  'enabled': isCountryInputEnabled 
                }"
                @mouseenter="input.isHovered = true"
                @mouseleave="input.isHovered = false">
              <input type="text" 
                    class="input-field" 
                    v-model="input.searchQuery" 
                    :placeholder="index === 0 ? 'Start typing' : 'Weiteres Land'"
                    @focus="showCountryResults = index; input.isFocused = true; updateCountryResults(index)"
                    @blur="handleCountryBlur(index)"
                    @input="handleCountryInput(index)"
                    @keydown.tab="handleTab($event, index, 'country')"
                    @keydown.enter="handleEnter($event, index, 'country')"
                    :disabled="!isCountryInputEnabled"
                    ref="countryInputsRefs" />
              <div v-if="input.isSelected" class="checkmark">
                <img src="/icon/y.png" class="icon-y" alt="checkmark icon" />
              </div>
              <div v-if="input.isSelected && input.isHovered && isCountryInputEnabled" 
                  class="plus-icon" 
                  @click="addCountryInput">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </div>
              <div v-if="index > 0 && input.isHovered && isCountryInputEnabled" 
                  class="minus-icon" 
                  @click="removeCountryInput(index)">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </div>
              <div class="spacer">
                <div class="play" :class="{ visible: (input.isFocused || input.isHovered) && isCountryInputEnabled }">
                  <img src="/icon/play.png" class="icon" alt="play icon" />
                </div>
              </div>
            </div>
            <!-- نتائج البحث للدول -->
            <div v-if="showCountryResults === index && filteredCountryResults(index).length > 0" class="search-results">
              <div v-for="country in filteredCountryResults(index)" 
                  :key="country.id" 
                  class="search-result-item"
                  @mousedown.prevent="selectCountryResult(country, index)">
                <span>{{ country.name }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Countries to Exclude -->
        <div class="form-field" :class="{ 'disabled': !isExcludeInputEnabled }">
          <div class="title">Welche Länder möchtest du ausschliessen?</div>
          <div v-for="(input, index) in excludeInputs" :key="index" class="search-box">
            <div class="section-input" 
                :class="{ 
                  'is-hovered': input.isHovered, 
                  'has-checkmark': input.isSelected,
                  'enabled': isExcludeInputEnabled 
                }"
                @mouseenter="input.isHovered = true"
                @mouseleave="input.isHovered = false">
              <input type="text" 
                    class="input-field" 
                    v-model="input.searchQuery" 
                    :placeholder="index === 0 ? 'Keine Länder' : 'Weiteres Land ausschliessen'"
                    @focus="showExcludeResults = index; input.isFocused = true; updateExcludeResults(index)"
                    @blur="handleExcludeBlur(index)"
                    @input="handleExcludeInput(index)"
                    @keydown.tab="handleTab($event, index, 'exclude')"
                    @keydown.enter="handleEnter($event, index, 'exclude')"
                    :disabled="!isExcludeInputEnabled"
                    ref="excludeInputsRefs" />
              <div v-if="input.isSelected" class="checkmark">
                <img src="/icon/y.png" class="icon-y" alt="checkmark icon" />
              </div>
              <div v-if="input.isSelected && input.isHovered && isExcludeInputEnabled" 
                  class="plus-icon" 
                  @click="addExcludeInput">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </div>
              <div v-if="index > 0 && input.isHovered && isExcludeInputEnabled" 
                  class="minus-icon" 
                  @click="removeExcludeInput(index)">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </div>
              <div class="spacer">
                <div class="play" :class="{ visible: (input.isFocused || input.isHovered) && isExcludeInputEnabled }">
                  <img src="/icon/play.png" class="icon" alt="play icon" />
                </div>
              </div>
            </div>
            <!-- نتائج البحث للدول المستثناة -->
            <div v-if="showExcludeResults === index && filteredExcludeResults(index).length > 0" class="search-results">
              <div v-for="country in filteredExcludeResults(index)" 
                  :key="country.id" 
                  class="search-result-item"
                  @mousedown.prevent="selectExcludeResult(country, index)">
                <span>{{ country.name }}</span>
              </div>
            </div>
          </div>
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
    Weiter zu Fertig
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch, onUnmounted } from 'vue';
import { debounce } from '@/utils/debounce';
import apiRequest from '@/lib/apiRequest';
import generalDataService from '@/services/generalData';

const props = defineProps({
  selectedCardIndex: { type: Number, default: null },
  releaseUuid: { type: String, required: true },
  storesList: { type: Array, default: () => [] }
});

const emit = defineEmits(['next', 'back', 'save-release']);

// حالة التحميل
const isLoading = ref(false);
const loadError = ref(null);

// المتاجر (من الـ API) - فقط Online
const stores = ref([]);
// العدد الإجمالي للمتاجر قبل التصفية (للعرض)
const totalStoresCount = ref(0);

// الدول (من الـ API)
const countries = ref([]);

// إعدادات عامة
const allStoresSelected = ref(false);
const autoAddStores = ref(false);

// تخزين القيم السابقة للمقارنة
const previousValues = ref({
  stores: [],
  countries_included: [],
  countries_excluded: [],
  catalog_number: ''
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

// ========== دوال جلب البيانات من الـ API ==========

const fetchData = async () => {
  isLoading.value = true;
  loadError.value = null;
  
  try {
    // جلب البيانات العامة (المتاجر والدول)
    const [storesData, countriesData] = await Promise.all([
      generalDataService.getStores(),
      generalDataService.getCountries()
    ]);
    
    console.log('✅ تم جلب المتاجر:', storesData);
    console.log('✅ تم جلب الدول:', countriesData);
    
    // ========== معالجة بيانات المتاجر ==========
    let storesArray = [];
    
    if (Array.isArray(storesData)) {
      storesArray = storesData;
    } else if (storesData.data && Array.isArray(storesData.data)) {
      storesArray = storesData.data;
    }
    
    // حفظ العدد الإجمالي للعرض
    totalStoresCount.value = storesArray.length;
    
    // تصفية المتاجر التي حالتها "Online"
    const onlineStores = storesArray.filter(store => 
      store.status === 'Online' || store.status === 'online' || store.status === 'active'
    );
    
    // تجهيز قائمة المتاجر
    let processedStores = onlineStores.map((store, index) => ({
      id: store.id || index + 1,
      name: store.name || store,
      status: store.status || 'Online',
      selected: false,
      isSocial: SOCIAL_STORES.some(socialName => 
        store.name && store.name.toLowerCase().includes(socialName.toLowerCase())
      )
    }));
    
    // ========== استخدام المتاجر من props إذا وجدت ==========
    if (props.storesList && props.storesList.length > 0) {
      console.log('📦 استخدام المتاجر من props:', props.storesList.length);
      
      // مزامنة التحديد من props.storesList
      processedStores = processedStores.map(store => {
        const matchedStore = props.storesList.find(s => s.name === store.name);
        return {
          ...store,
          selected: matchedStore ? matchedStore.selected : false
        };
      });
    }
    
    // ========== تطبيق التحديد التلقائي حسب الكارد ==========
    if (props.selectedCardIndex === 0) {
      // الكارد 1: Alle Stores - تحديد جميع المتاجر
      processedStores = processedStores.map(store => ({
        ...store,
        selected: true
      }));
      allStoresSelected.value = true;
      console.log('✅ Alle Stores: تم تحديد جميع المتاجر');
      
    } else if (props.selectedCardIndex === 1) {
      // الكارد 2: Ohne Socials - تحديد جميع المتاجر ما عدا الاجتماعية
      processedStores = processedStores.map(store => ({
        ...store,
        selected: !store.isSocial
      }));
      allStoresSelected.value = false;
      console.log('✅ Ohne Socials: تم تحديد جميع المتاجر ما عدا الاجتماعية');
      
    } else if (props.selectedCardIndex === 2) {
      // الكارد 3: Individuell - لا تحديد تلقائي
      processedStores = processedStores.map(store => ({
        ...store,
        selected: false
      }));
      allStoresSelected.value = false;
      console.log('✅ Individuell: لا تحديد تلقائي');
    }
    
    stores.value = processedStores;
    
    console.log(`✅ تم تحميل ${processedStores.length} متجر Online`);
    console.log(`📊 المتاجر المختارة: ${processedStores.filter(s => s.selected).length}`);
    
    // ========== معالجة بيانات الدول باستخدام code2 ==========
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
    
    console.log(`✅ تم تحميل ${countries.value.length} دولة`);
    
    // بعد جلب البيانات الأساسية، جلب بيانات الـ Release
    await fetchReleaseData();
    
  } catch (error) {
    console.error('❌ فشل جلب البيانات:', error);
    loadError.value = error.message || 'فشل تحميل البيانات';
  } finally {
    isLoading.value = false;
  }
};

// دالة جلب بيانات الـ Release من السيرفر
const fetchReleaseData = async () => {
  if (!props.releaseUuid) {
    console.warn('⚠️ لا يوجد releaseUuid');
    return;
  }
  
  try {
    console.log('📡 جلب بيانات الـ Release:', props.releaseUuid);
    const response = await apiRequest.get(`/releases/${props.releaseUuid}`);
    const releaseData = response.data.data || response.data;
    
    console.log('✅ تم جلب بيانات الـ Release:', releaseData);
    
    // 🔥 التحقق مما إذا كانت بيانات المتاجر موجودة في السيرفر
    const hasStoresData = releaseData.stores && Array.isArray(releaseData.stores) && releaseData.stores.length > 0;
    
    if (hasStoresData) {
      // إذا كانت هناك بيانات متاجر من السيرفر، استخدمها
      console.log('📦 استخدام بيانات المتاجر من السيرفر');
      
      // إلغاء تحديد جميع المتاجر أولاً
      stores.value.forEach(store => { store.selected = false; });
      
      // تحديد المتاجر الموجودة في البيانات
      releaseData.stores.forEach(storeName => {
        const store = stores.value.find(s => s.name === storeName);
        if (store) {
          store.selected = true;
        } else {
          console.log(`⚠️ المتجر ${storeName} غير موجود في قائمة المتاجر Online`);
        }
      });
    } else {
      // 🔥 إذا لم تكن هناك بيانات متاجر من السيرفر، استخدم التحديد التلقائي بناءً على selectedCardIndex
      console.log('📦 لا توجد بيانات متاجر من السيرفر، استخدام التحديد التلقائي بناءً على selectedCardIndex:', props.selectedCardIndex);
      
      // تطبيق التحديد التلقائي حسب الكارد
      if (props.selectedCardIndex === 0) {
        // Alle Stores - تحديد جميع المتاجر
        stores.value.forEach(store => { store.selected = true; });
        allStoresSelected.value = true;
      } else if (props.selectedCardIndex === 1) {
        // Ohne Socials - تحديد جميع المتاجر ما عدا الاجتماعية
        stores.value.forEach(store => { 
          store.selected = !store.isSocial; 
        });
        allStoresSelected.value = false;
      } else if (props.selectedCardIndex === 2) {
        // Individuell - لا تحديد تلقائي
        stores.value.forEach(store => { store.selected = false; });
        allStoresSelected.value = false;
      }
    }
    
    // تحديث countries_included
    if (releaseData.countries_included && Array.isArray(releaseData.countries_included)) {
      if (releaseData.countries_included.length > 0) {
        const newInputs = releaseData.countries_included.map(code => {
          const country = countries.value.find(c => c.code === code);
          return {
            searchQuery: country ? country.name : code,
            isHovered: false,
            isFocused: false,
            isSelected: true
          };
        });
        
        countryInputs.value = newInputs;
      } else {
        countryInputs.value = [{ searchQuery: '', isHovered: false, isFocused: false, isSelected: false }];
      }
    }
    
    // نفس التعديل لـ countries_excluded
    if (releaseData.countries_excluded && Array.isArray(releaseData.countries_excluded)) {
      if (releaseData.countries_excluded.length > 0) {
        const newInputs = releaseData.countries_excluded.map(code => {
          const country = countries.value.find(c => c.code === code);
          return {
            searchQuery: country ? country.name : code,
            isHovered: false,
            isFocused: false,
            isSelected: true
          };
        });
        
        excludeInputs.value = newInputs;
      } else {
        excludeInputs.value = [{ searchQuery: '', isHovered: false, isFocused: false, isSelected: false }];
      }
    }
    
    // تحديث allStoresSelected
    allStoresSelected.value = stores.value.length > 0 && stores.value.every(store => store.selected);
    
    // تحديث القيم السابقة
    previousValues.value = getCurrentData();
    
    console.log('📊 بعد التحديث - المتاجر المختارة:', stores.value.filter(s => s.selected).length);
    
  } catch (error) {
    console.error('❌ فشل جلب بيانات الـ Release:', error);
    throw error;
  }
};

// ========== نهاية دوال جلب البيانات ==========

// ✅ حساب عدد المتاجر المختارة
const selectedStoresCount = computed(() => {
  return stores.value.filter(store => store.selected).length;
});

// ✅ تحديد إذا كان حقل الدول مفعلاً (عند اختيار متاجر)
const isCountryInputEnabled = computed(() => {
  return selectedStoresCount.value > 0;
});

// ✅ تحديد إذا كان حقل الاستثناء مفعلاً (عند إدخال دول للنشر)
const isExcludeInputEnabled = computed(() => {
  return countryInputs.value.some(input => input.searchQuery.trim() !== '');
});

// ✅ شرط تفعيل الزر - جميع الشروط
const isButtonActive = computed(() => {
  const hasSelectedStores = selectedStoresCount.value > 0;
  const hasCountries = countryInputs.value.some(input => input.searchQuery.trim() !== '');
  
  return hasSelectedStores && hasCountries;
});

// دالة مساعدة لتحويل اسم الدولة إلى رمز (code2 - ISO 3166-1 alpha-2)
const getCountryCode = (countryName) => {
  const country = countries.value.find(c => c.name === countryName);
  return country?.code || countryName.substring(0, 2).toUpperCase();
};

// دالة عكسية لتحويل رمز ISO (code2) إلى اسم الدولة
const getCountryNameFromCode = (code) => {
  const country = countries.value.find(c => c.code === code);
  return country?.name || code;
};

// دالة تجميع البيانات الحالية مع التصحيح
const getCurrentData = () => {
  const selectedStoreNames = stores.value
    .filter(store => store.selected)
    .map(store => store.name);
  
  const includedCountries = countryInputs.value
    .filter(input => input.searchQuery.trim() !== '')
    .map(input => getCountryCode(input.searchQuery));
  
  const excludedCountries = excludeInputs.value
    .filter(input => input.searchQuery.trim() !== '')
    .map(input => getCountryCode(input.searchQuery));
  
  return {
    stores: selectedStoreNames,
    countries_included: includedCountries,
    countries_excluded: excludedCountries,
    catalog_number: ''
  };
};

// دالة إرسال التحديثات إلى السيرفر
const sendUpdate = async () => {
  if (!props.releaseUuid) {
    console.warn('⚠️ لا يوجد releaseUuid');
    return;
  }
  
  const currentData = getCurrentData();
  const payload = {};
  let hasChanges = false;
  
  // مقارنة stores
  if (JSON.stringify(currentData.stores) !== JSON.stringify(previousValues.value.stores)) {
    payload.stores = currentData.stores;
    console.log('🔄 تغيير في stores:', { 
      قديم: previousValues.value.stores, 
      جديد: currentData.stores 
    });
    hasChanges = true;
  }
  
  // مقارنة countries_included
  if (JSON.stringify(currentData.countries_included) !== JSON.stringify(previousValues.value.countries_included)) {
    payload.countries_included = currentData.countries_included;
    console.log('🔄 تغيير في countries_included:', { 
      قديم: previousValues.value.countries_included, 
      جديد: currentData.countries_included 
    });
    hasChanges = true;
  }
  
  // مقارنة countries_excluded
  if (JSON.stringify(currentData.countries_excluded) !== JSON.stringify(previousValues.value.countries_excluded)) {
    payload.countries_excluded = currentData.countries_excluded;
    console.log('🔄 تغيير في countries_excluded:', { 
      قديم: previousValues.value.countries_excluded, 
      جديد: currentData.countries_excluded 
    });
    hasChanges = true;
  }
  
  if (!hasChanges) {
    console.log('ℹ️ لا توجد تغييرات');
    return;
  }
  
  console.log('📤 إرسال التحديثات إلى السيرفر:', payload);
  
  try {
    // 🔥 إرسال إلى السيرفر مباشرة
    const response = await apiRequest.put(
      `/releases/${props.releaseUuid}`,
      payload
    );
    
    console.log('✅ تم حفظ التغييرات بنجاح:', response.data);
    
    // تحديث القيم السابقة
    previousValues.value = { ...currentData };
    
    // إرسال إلى الأب (Upload3Component)
    emit('save-release', payload);
    
  } catch (error) {
    console.error('❌ فشل حفظ التغييرات:', error);
    throw error;
  }
};

// إنشاء دالة debounce للإرسال
const debouncedSendUpdate = debounce(sendUpdate, 1500);

// مراقبة التغييرات في المتاجر
watch(
  () => stores.value.map(s => s.selected),
  () => {
    console.log('تغيير في المتاجر المختارة');
    allStoresSelected.value = stores.value.every(store => store.selected);
    debouncedSendUpdate();
  },
  { deep: true }
);

// مراقبة التغييرات في حقول الدول
watch(
  [countryInputs, excludeInputs],
  () => {
    console.log('تغيير في حقول الدول');
    debouncedSendUpdate();
  },
  { deep: true }
);

// تقسيم المتاجر إلى أعمدة
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

// نتائج البحث للدول مع الإكمال التلقائي
const filteredCountryResults = (index) => {
  const query = countryInputs.value[index].searchQuery.toLowerCase();
  if (!query) return [];
  
  return countries.value.filter(country => 
    country.name.toLowerCase().includes(query)
  );
};

const filteredExcludeResults = (index) => {
  const query = excludeInputs.value[index].searchQuery.toLowerCase();
  if (!query) return [];
  
  return countries.value.filter(country => 
    country.name.toLowerCase().includes(query)
  );
};

// دوال المتاجر
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

const toggleAutoAdd = () => {
  autoAddStores.value = !autoAddStores.value;
};

// دوال البحث والاختيار للدول
const updateCountryResults = (index) => {
  countryInputs.value[index].isSelected = countryInputs.value[index].searchQuery.length > 0;
};

const updateExcludeResults = (index) => {
  excludeInputs.value[index].isSelected = excludeInputs.value[index].searchQuery.length > 0;
};

const handleCountryInput = (index) => {
  updateCountryResults(index);
};

const handleExcludeInput = (index) => {
  updateExcludeResults(index);
};

const selectCountryResult = (country, index) => {
  if (!isCountryInputEnabled.value) return;
  
  countryInputs.value[index].searchQuery = country.name;
  countryInputs.value[index].isSelected = true;
  showCountryResults.value = null;
  
  nextTick(() => {
    if (countryInputsRefs.value[countryInputs.value.length - 1]) {
      countryInputsRefs.value[countryInputs.value.length - 1].focus();
    }
  });
  
  debouncedSendUpdate();
};

const selectExcludeResult = (country, index) => {
  if (!isExcludeInputEnabled.value) return;
  
  excludeInputs.value[index].searchQuery = country.name;
  excludeInputs.value[index].isSelected = true;
  showExcludeResults.value = null;
  
  nextTick(() => {
    if (excludeInputsRefs.value[excludeInputs.value.length - 1]) {
      excludeInputsRefs.value[excludeInputs.value.length - 1].focus();
    }
  });
  
  debouncedSendUpdate();
};

// دوال إضافة وحذف المدخلات
const addCountryInput = () => {
  if (!isCountryInputEnabled.value) return;
  
  countryInputs.value.push({ 
    searchQuery: '', 
    isHovered: false, 
    isFocused: false, 
    isSelected: false 
  });
};

const removeCountryInput = (index) => {
  if (!isCountryInputEnabled.value) return;
  
  if (countryInputs.value.length > 1) {
    countryInputs.value.splice(index, 1);
    debouncedSendUpdate();
  }
};

const addExcludeInput = () => {
  if (!isExcludeInputEnabled.value) return;
  
  excludeInputs.value.push({ 
    searchQuery: '', 
    isHovered: false, 
    isFocused: false, 
    isSelected: false 
  });
};

const removeExcludeInput = (index) => {
  if (!isExcludeInputEnabled.value) return;
  
  if (excludeInputs.value.length > 1) {
    excludeInputs.value.splice(index, 1);
    debouncedSendUpdate();
  }
};

// معالجة مفاتيح Tab و Enter
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

const handleCountryBlur = (index) => {
  setTimeout(() => {
    countryInputs.value[index].isFocused = false;
    showCountryResults.value = null;
  }, 200);
};

const handleExcludeBlur = (index) => {
  setTimeout(() => {
    excludeInputs.value[index].isFocused = false;
    showExcludeResults.value = null;
  }, 200);
};

// ✅ دالة Next - مع حفظ التغييرات
const handleNext = async () => {
  if (isButtonActive.value) {
    console.log('ShopsPage: Next clicked', {
      selectedStores: selectedStoresCount.value,
      hasCountries: countryInputs.value.some(input => input.searchQuery.trim() !== ''),
      isButtonActive: isButtonActive.value
    });
    
    try {
      // 🔥 إرسال التحديثات فوراً قبل الانتقال
      await sendUpdate();
      emit('next');
    } catch (error) {
      console.error('❌ فشل حفظ التغييرات قبل الانتقال:', error);
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { 
          message: 'Fehler beim Speichern der Daten. Bitte versuchen Sie es erneut.', 
          type: 'error' 
        }
      }));
    }
  }
};

// مراقبة التغييرات
watch(selectedStoresCount, (newCount) => {
  console.log('Selected stores count:', newCount);
});

watch(() => countryInputs.value, (newInputs) => {
  console.log('Country inputs updated:', newInputs);
}, { deep: true });

// إرسال التحديثات عند إزالة المكون
onUnmounted(() => {
  if (debouncedSendUpdate.flush) {
    debouncedSendUpdate.flush();
  }
});

// جلب البيانات عند تحميل المكون
onMounted(async () => {
  console.log('🚀 ShopsPage mounted with releaseUuid:', props.releaseUuid);
  console.log('📌 selectedCardIndex:', props.selectedCardIndex);
  await fetchData();
});
</script>

<style lang="scss" scoped>
/* جميع الأنماط كما هي - لم يتم تغيير أي شيء */
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
}

.store .name-store span {
  overflow: hidden;
  color: #FFF;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: Heebo;
  font-size: 14px;
  font-style: normal;
  font-weight: 300;
  line-height: 1;
  letter-spacing: 0.7px;
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

.section-input.enabled {
  opacity: 1;
  pointer-events: auto;
  cursor: default;
}

.section-input .input-field {
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


  &:hover{
    border-radius: 5px 0 0 5px;
  }
}

.section-input:not(.enabled) .input-field {
  opacity: 0.5;
  cursor: not-allowed;
}

.section-input.enabled .input-field {
  opacity: 1;
  cursor: text;
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

.section-input .plus-icon,
.section-input .minus-icon {
  position: absolute;
  right: 70px;
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

.section-input.enabled:hover .plus-icon,
.section-input.enabled:hover .minus-icon {
  opacity: 1;
  transition: 0.3s ease-in-out;
}

.section-input .plus-icon:hover,
.section-input .minus-icon:hover {
  background: var(--move);
  transition: 0.3s ease;
}

.section-input .plus-icon svg,
.section-input .minus-icon svg {
  width: 18px;
  height: 18px;
}

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

.section-input .spacer .play {
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

.section-input.enabled .spacer .play.visible {
  right: -10px;
  opacity: 1;
}

.section-input .spacer .play .icon {
  width: 18px;
  height: 20px;
  flex-shrink: 0;
  aspect-ratio: 9/10;
}

.section-input.enabled .spacer:hover .icon {
  filter: brightness(0) invert(1);
}

/* أنماط نتائج البحث */
.search-results {
  position: absolute;
  top: calc(100% + 3px);
  left: 0;
  right: 0;
  background: var(--primary);
  border-radius: 5px;
  z-index: 100;
  max-height: 100px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  overflow: auto;
  scrollbar-width: none;
  width: calc(100% + 10px);
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
  // background: var(--secondary);
  color: #fff;
}

/* أنماط زر Next */
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

/* أنماط التحميل */
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

@media (min-width:2075px) and (max-width:2560px){
  .top-shops{
      padding-right: 331px; 
      gap: 20px;
    }

    .bottom-shops{
         padding-right: 331px; 
    }
}
</style>