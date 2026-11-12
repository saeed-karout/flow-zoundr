<template>
  <div class="tab-content">
    <div class="frame">
      <!-- Artist -->
      <div class="section" >
        <div class="title">Artist</div>
        <div
          v-for="(input, index) in artistInputs"
          :key="'artist-' + index"
          class="form-field"
          :class="{ 
            'is-hovered': input.isHovered, 
            'has-checkmark': hasNonEmptyValue(input.name)
          }"
          @mouseenter="input.isHovered = true"
          @mouseleave="input.isHovered = false"
        >
          <input
            type="text"
            class="input-field name-field"
            :class="{ 'is-correction': isSongCorrected('contributors') }"
            v-model="input.name"
            placeholder="Name"
            @input="handleArtistInput(index, $event.target.value)"
            @focus="handleArtistFocus(index)"
            @blur="handleArtistBlur(index)"
          />
          
          <div v-if="isValidName(input.name) && !input.isSearching" class="checkmark">
            <img src="@/assets/icons/y.png" class="icon-y" alt="checkmark" />
          </div>
          
          <div
            v-if="index === 0 && input.isHovered && !input.isSearching && artistInputs.length < 2"
            class="plus-icon"
            @click="addArtistInput"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </div>
          
          <div
            v-if="index > 0 && input.isHovered && !input.isSearching"
            class="minus-icon"
            @click="removeArtistInput(index)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </div>
          
          <div v-if="index === 0" class="spacer" @click="emit('openVideoPopup', 'artist')">
            <div class="play" :class="{ visible: input.isHovered }">
              <img :src="iconPlay" class="icon" alt="play icon" />
            </div>
          </div>
          <div v-else class="spacer-empty"></div>
          
          <div 
  v-if="showSearchResults === index && (input.searchQuery || input.isFocused)" 
  class="search-result" 
  :style="{ width: hasMinusIcon ? 'calc(100% - 41px)' : 'calc(100% + 5px)' }"
>
            <div v-if="input.isSearching" class="search-loading">
              <div class="spinner"></div>
              <span>Suche...</span>
            </div>
            <template v-else>
              <div class="add-more" @click="handleAddNewArtist(index)">
                <div class="profile">
                  <div class="add-icon">
                    <div class="icons">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                    </div>
                  </div>
                  <div class="p">
                    {{ filteredSearchResults.length === 0 ? `"${artistInputs[index]?.searchQuery || ''}" als neuen Act anlegen` : 'Als neuen Act anlegen' }}
                  </div>
                </div>
              </div>
              <div class="line" v-if="filteredSearchResults.length > 0"></div>
              <div class="search-item" v-for="(result, resultIndex) in filteredSearchResults" :key="resultIndex"
                @click="selectSearchResult(result, index)">
                <div class="profile">
                  <div class="profile-picture" :style="{ backgroundImage: `url(${getArtistImage(result)})` }"></div>
                  <div class="p">{{ result.name }}</div>
                </div>
                <div class="platforms">
                  <div class="platform-column">
                    <div v-if="result.spotify && result.spotify.id" class="platform-icon-container">
                      <div class="spotify-icon"></div>
                    </div>
                    <div v-else class="platform-icon-placeholder"></div>
                  </div>
                  <div class="platform-column">
                    <div v-if="result.apple && result.apple.id" class="platform-icon-container">
                      <img src="/icon/apple.png" class="apple-icon" alt="icon apple">
                    </div>
                    <div v-else class="platform-icon-placeholder"></div>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>

      <!-- Feature مع وظيفة البحث -->
      <div class="section feature-section" :class="{ active: isFeatureActive,}">
        <div class="top-line">
          <div class="title">Feature</div>
          <div class="btn-switch" @click="toggleFeature">
            <img src="/icon/circle.svg" class="circle" alt="circle" />
          </div>
        </div>
        <div
          v-for="(input, index) in featureInputs"
          :key="'feature-' + index"
          class="form-field"
          :class="{ 
            'is-hovered': input.isHovered, 
            'has-checkmark': isValidName(input.name)
          }"
          @mouseenter="input.isHovered = true"
          @mouseleave="input.isHovered = false"
        >
          <input
            type="text"
            class="input-field name-field"
            :class="{ 'is-correction': isSongCorrected('contributors') }"
            v-model="input.name"
            placeholder="Name"
            :disabled="!isFeatureActive"
            @input="handleFeatureInput(index, $event.target.value)"
            @focus="handleFeatureFocus(index)"
            @blur="handleFeatureBlur(index)"
          />
          
          <div v-if="isValidName(input.name) && !input.isSearching" class="checkmark">
            <img src="@/assets/icons/y.png" class="icon-y" alt="checkmark" />
          </div>
          
          <div
            v-if="index === 0 && input.isHovered && isFeatureActive && !input.isSearching && featureInputs.length < 2"
            class="plus-icon"
            @click="addFeatureInput"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </div>
          
          <div
            v-if="index > 0 && input.isHovered && isFeatureActive && !input.isSearching"
            class="minus-icon"
            @click="removeFeatureInput(index)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </div>
          
          <div v-if="index === 0" class="spacer" @click="emit('openVideoPopup', 'feature')">
            <div class="play" :class="{ visible: input.isHovered && isFeatureActive }">
              <img :src="iconPlay" class="icon" alt="play icon" />
            </div>
          </div>
          <div v-else class="spacer-empty"></div>
          
          <div 
  v-if="showFeatureSearchResults === index && (input.searchQuery || input.isFocused) && isFeatureActive" 
  class="search-result" 
  :style="{ width: hasMinusIcon ? 'calc(100% - 41px)' : 'calc(100% + 5px)' }"
>
            <div v-if="input.isSearching" class="search-loading">
              <div class="spinner"></div>
              <span>Suche...</span>
            </div>
            <template v-else>
              <div class="add-more" @click="handleAddNewFeature(index)">
                <div class="profile">
                  <div class="add-icon">
                    <div class="icons">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                    </div>
                  </div>
                  <div class="p">
                    {{ filteredFeatureSearchResults.length === 0 ? `"${featureInputs[index]?.searchQuery || ''}" als neuen Feature anlegen` : 'Als neuen Feature anlegen' }}
                  </div>
                </div>
              </div>
              <div class="line" v-if="filteredFeatureSearchResults.length > 0"></div>
              <div class="search-item" v-for="(result, resultIndex) in filteredFeatureSearchResults" :key="resultIndex"
                @click="selectFeatureSearchResult(result, index)">
                <div class="profile">
                  <div class="profile-picture" :style="{ backgroundImage: `url(${getArtistImage(result)})` }"></div>
                  <div class="p">{{ result.name }}</div>
                </div>
                <div class="platforms">
                  <div class="platform-column">
                    <div v-if="result.spotify && result.spotify.id" class="platform-icon-container">
                      <div class="spotify-icon"></div>
                    </div>
                    <div v-else class="platform-icon-placeholder"></div>
                  </div>
                  <div class="platform-column">
                    <div v-if="result.apple && result.apple.id" class="platform-icon-container">
                      <img src="/icon/apple.png" class="apple-icon" alt="icon apple">
                    </div>
                    <div v-else class="platform-icon-placeholder"></div>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>

    <div class="frame1">
      <div class="section-frame">
        <!-- P-Line -->
        <div class="section" >
          <div class="title">P-Line</div>
          <div
            v-for="(input, index) in pLineInputs"
            :key="'pline-' + index"
            class="form-field"
            :class="{ 
              'is-hovered': input.isHovered, 
              'has-checkmark': isValidName(input.name)
            }"
            @mouseenter="input.isHovered = true"
            @mouseleave="input.isHovered = false"
          >
            <input
              type="text"
              class="input-field name-field"
              :class="{ 'is-correction': isSongCorrected('contributors') }"
              v-model="input.name"
              placeholder="P-Line Name"
              @input="updatePLineValue(index)"
            />
            
            <div v-if="hasNonEmptyValue(input.name)" class="checkmark">
              <img src="@/assets/icons/y.png" class="icon-y" alt="checkmark" />
            </div>
            
            <div
              v-if="index > 0 && input.isHovered"
              class="minus-icon"
              @click="removePLineInput(index)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </div>
            
            <div v-if="index === 0" class="spacer" @click="emit('openVideoPopup', 'pline')">
              <div class="play" :class="{ visible: input.isHovered }">
                <img :src="iconPlay" class="icon" alt="play icon" />
              </div>
            </div>
            <div v-else class="spacer-empty"></div>
          </div>
        </div>

        <!-- Produzent -->
        <div class="section" >
          <div class="title">Produzent</div>
          <div
            v-for="(input, index) in produzentInputs"
            :key="'produzent-' + index"
            class="form-field"
            :class="{ 
              'is-hovered': input.isHovered, 
              'has-checkmark': hasNonEmptyValue(input.name)
            }"
            @mouseenter="input.isHovered = true"
            @mouseleave="input.isHovered = false"
          >
            <input
              type="text"
              class="input-field name-field"
              :class="{ 'is-correction': isSongCorrected('contributors') }"
              v-model="input.name"
              placeholder="Name"
              @input="updateProduzentValue(index)"
            />
            
            <div v-if="hasNonEmptyValue(input.name)" class="checkmark">
              <img src="@/assets/icons/y.png" class="icon-y" alt="checkmark" />
            </div>
            
            <div
              v-if="index === 0 && hasNonEmptyValue(input.name) && input.isHovered && produzentInputs.length < 2"
              class="plus-icon"
              @click="addProduzentInput"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </div>
            
            <div
              v-if="index > 0 && input.isHovered"
              class="minus-icon"
              @click="removeProduzentInput(index)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </div>
            
            <div v-if="index === 0" class="spacer" @click="emit('openVideoPopup', 'produzent')">
              <div class="play" :class="{ visible: input.isHovered }">
                <img :src="iconPlay" class="icon" alt="play icon" />
              </div>
            </div>
            <div v-else class="spacer-empty"></div>
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
               :class="{ 'is-correction': isSongCorrected('production_year') }"
              v-model="productionYear"
              placeholder="2026"
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
      <div class="section weitere-section" :class="{ active: isWeitereActive, }">
        <div class="top-line">
          <div class="title">Weitere Mitwirkende</div>
          <div class="btn-switch" @click="toggleWeitere">
            <img src="/icon/circle.svg" class="circle" alt="circle" />
          </div>
        </div>
        <div class="list-of-roll">
          <div
            v-for="(input, index) in weitereInputs"
            :key="'weitere-' + index"
            class="form-field-bottom"
            :class="{ 
              'is-hovered': input.isHovered,
              'has-checkmark': input.role && input.role.trim() !== '' && isValidName(input.name),
              
            }"
            @mouseenter="input.isHovered = true"
            @mouseleave="input.isHovered = false"
          >
            <div class="combo-box" :class="{ 'has-checkmark': input.role && input.role.trim() !== '', }">
              <div class="custom-select" @click.stop="toggleRoleDropdown(index)">
                <div class="select-trigger" :class="{ 'selected': input.role && input.role.trim() !== '' ,'is-correction': isSongCorrected('contributors')}" :disabled="!isWeitereActive">
                  <input 
                    type="text" 
                    class="search-input-trigger" 
                    :class="{ }"
                    :value="input.role && input.role.trim() !== '' ? input.role : input.searchQuery"
                    @input="handleSearchInput(index, $event.target.value)"
                    :placeholder="'Rolle suchen...'"
                    @click.stop
                    @focus="input.isRoleDropdownOpen = true"
                    :disabled="!isWeitereActive"
                  />
                </div>
                <div class="dropdown"  v-show="input.isRoleDropdownOpen && isWeitereActive" @click.stop>
                  <div 
                    class="option" 
                    
                    v-for="role in filteredRoles(input.searchQuery)" 
                    :key="role.id"
                    @click.stop="selectRoleOption(index, role.name)"
                  >
                    {{ role.name }}
                  </div>
                  <div v-if="filteredRoles(input.searchQuery).length === 0" class="option no-results">
                    Keine Ergebnisse gefunden
                  </div>
                </div>
              </div>
              <div v-if="input.role && input.role.trim() !== ''" class="checkmark">
                <img src="@/assets/icons/y.png" class="icon-y" alt="checkmark" />
              </div>
              <div v-else class="checkmark">
                <img src="@/assets/icons/step2/Icon DD.svg" class="icon-select" alt="dropdown" />
              </div>
            </div>

            <!-- form-field-name مع has-spacer -->
            <div
              class="form-field-name"
              :class="{ 
                'has-checkmark': isValidName(input.name) && isWeitereActive,
                'has-spacer': index === 0 && isWeitereActive
              }"
            > 
              <input
                type="text"
                class="input-field name-field"
                   :class="{'is-correction': isSongCorrected('contributors') }"
                v-model="input.name"
                placeholder="Name"
                :disabled="!isWeitereActive"
                @input="updateWeitereValue(index)"
              />  
              <div v-if="isValidName(input.name) && isWeitereActive" class="checkmark">
                <img src="@/assets/icons/y.png" class="icon-y" alt="checkmark" />
              </div>
            </div>
            
            <div
              v-if="index === 0 && input.isHovered && isWeitereActive && input.role && input.role.trim() !== ''"
              class="plus-icon "
              @click="addWeitereInput"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </div>
            
            <div
              v-if="index > 0 && input.isHovered && isWeitereActive"
              class="minus-icon"
              @click="removeWeitereInput(index)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </div>
            
            <div v-if="index === 0" class="spacer" @click="emit('openVideoPopup', 'weitere')">
              <div class="play" :class="{ visible: input.isHovered && isWeitereActive }">
                <img :src="iconPlay" class="icon" alt="play icon" />
              </div>
            </div>
            <div v-else class="spacer-empty"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, onDeactivated, computed, nextTick } from 'vue';
import { useCorrections } from '@/composables/useCorrections';
import iconPlay from '@/assets/icons/play.png';
import { debounce } from '@/utils/debounce';
import apiRequest from '@/lib/apiRequest';
import { useReleaseStore } from '@/stores/release';

// ─── Props ───
const props = defineProps({
  currentSong: {
    type: Object,
    default: () => ({})
  },
  releaseArtists: {
    type: Array,
    default: () => []
  },
  activeTab: {
    type: String,
    default: 'mitwirkende'
  },
  formData: {
    type: Object,
    default: () => ({})
  },
  releasePLine: {
    type: String,
    default: ''
  },
  releaseProductionYear: {
    type: String,
    default: ''
  }
});

// حقول مطلوب تصحيحها (Korrektur) → بوردر أحمر.
const { isSongCorrected } = useCorrections(() => props.currentSong?.uuid);

const emit = defineEmits(['openVideoPopup', 'save-song', 'update:form-data']);

const releaseStore = useReleaseStore();

// ─── قائمة الأدوار من الـ API ───
const rolesOptions = ref([]);
const isLoadingRoles = ref(false);

// ─── حالة حفظ البيانات ───
const isSaving = ref(false);
const saveQueue = ref([]);
let savingTimeout = null;

// ─── حالة البحث عن الفنانين ───
const searchArtistsResults = ref([]);
const showSearchResults = ref(null);

// ─── حالة البحث عن الـ Feature ───
const featureSearchResults = ref([]);
const showFeatureSearchResults = ref(null);

// ─── جلب الفنانين من الـ API مع debounce ───
const updateArtistSearch = debounce(async (index, query) => {
  if (!query || query.trim() === '') {
    searchArtistsResults.value = [];
    if (artistInputs.value[index]) {
      artistInputs.value[index].isSearching = false;
    }
    return;
  }
  
  try {
    const response = await apiRequest.get(`/artists?q=${encodeURIComponent(query.trim())}&limit=20`);
    
    let artists = [];
    if (response.data?.data && Array.isArray(response.data.data)) {
      artists = response.data.data;
    } else if (response.data && Array.isArray(response.data)) {
      artists = response.data;
    } else if (response.data?.artists && Array.isArray(response.data.artists)) {
      artists = response.data.artists;
    }
    
    searchArtistsResults.value = artists;
  } catch (error) {
    console.error('❌ خطأ في جلب الفنانين:', error);
    searchArtistsResults.value = [];
  } finally {
    if (artistInputs.value[index]) {
      artistInputs.value[index].isSearching = false;
    }
  }
}, 300);

// ─── جلب الفنانين لـ Feature ───
const updateFeatureSearch = debounce(async (index, query) => {
  if (!query || query.trim() === '') {
    featureSearchResults.value = [];
    if (featureInputs.value[index]) {
      featureInputs.value[index].isSearching = false;
    }
    return;
  }
  
  try {
    const response = await apiRequest.get(`/artists?q=${encodeURIComponent(query.trim())}&limit=20`);
    
    let artists = [];
    if (response.data?.data && Array.isArray(response.data.data)) {
      artists = response.data.data;
    } else if (response.data && Array.isArray(response.data)) {
      artists = response.data;
    } else if (response.data?.artists && Array.isArray(response.data.artists)) {
      artists = response.data.artists;
    }
    
    featureSearchResults.value = artists;
  } catch (error) {
    console.error('❌ خطأ في جلب الفنانين لـ Feature:', error);
    featureSearchResults.value = [];
  } finally {
    if (featureInputs.value[index]) {
      featureInputs.value[index].isSearching = false;
    }
  }
}, 300);

// ─── تصفية نتائج البحث ───
const filteredSearchResults = computed(() => {
  const results = searchArtistsResults.value.filter(item => item && item.name);
  return results;
});

const filteredFeatureSearchResults = computed(() => {
  const results = featureSearchResults.value.filter(item => item && item.name);
  return results;
});

// ─── جلب الأدوار من الـ API ───
const fetchRoles = async () => {
  if (isLoadingRoles.value) return;
  isLoadingRoles.value = true;
  
  try {
    const response = await apiRequest.get('/roles');
    const data = response.data || {};
    
    // ✅ التعامل مع البيانات كمصفوفة
    if (Array.isArray(data)) {
      rolesOptions.value = data;
    } else if (data.data && Array.isArray(data.data)) {
      rolesOptions.value = data.data;
    } else if (typeof data === 'object') {
      // تحويل الكائن إلى مصفوفة مع الاحتفاظ بالمفتاح كـ id
      rolesOptions.value = Object.entries(data).map(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          return { id: key, ...value };
        }
        return { id: key, name: value };
      });
    } else {
      rolesOptions.value = [];
    }
    
    console.log('📌 [MitwirkendeContent] Roles loaded:', rolesOptions.value.length);
  } catch (error) {
    console.error('❌ فشل جلب الأدوار:', error);
    rolesOptions.value = [];
  } finally {
    isLoadingRoles.value = false;
  }
};

// ─── تصفية الأدوار ───
// ─── تصفية الأدوار ───
const filteredRoles = (searchQuery) => {
  if (!rolesOptions.value || rolesOptions.value.length === 0) return [];
  if (!searchQuery || searchQuery.trim() === '') return rolesOptions.value;
  
  const query = searchQuery.toLowerCase().trim();
  return rolesOptions.value.filter(role => {
    const name = role.name?.toLowerCase() || '';
    return name.includes(query);
  });
};
// ─── التحقق من وجود عناصر إضافية (minus-icon) في Artist أو Feature ───
const hasMinusIcon = computed(() => {
  // التحقق من Artist: يوجد أكثر من عنصر واحد
  const hasArtistMinus = artistInputs.value.length > 1;
  
  // التحقق من Feature: يوجد أكثر من عنصر واحد والـ Feature مفعل
  const hasFeatureMinus = featureInputs.value.length > 1 && isFeatureActive.value;
  
  return hasArtistMinus || hasFeatureMinus;
});
// ─── التحقق من وجود كلمة "minas" في Artist أو Feature ───
const hasMinas = computed(() => {
  const allArtistNames = artistInputs.value.map(i => i.name?.toLowerCase() || '');
  const allFeatureNames = featureInputs.value.map(i => i.name?.toLowerCase() || '');
  const allNames = [...allArtistNames, ...allFeatureNames];
  return allNames.some(name => name.includes('minas'));
});

// ─── تهيئة البيانات المحلية ───
const artistInputs = ref([{ name: '', isHovered: false, isSearching: false, isFocused: false, searchQuery: '' }]);
const featureInputs = ref([{ name: '', isHovered: false, isSearching: false, isFocused: false, searchQuery: '' }]);
const pLineInputs = ref([{ name: '', isHovered: false }]);
const produzentInputs = ref([{ name: '', isHovered: false }]);
const productionYear = ref('');
const productionYearValid = ref(false);

const weitereInputs = ref([
  { 
    role: '', 
    name: '', 
    isHovered: false, 
    isRoleDropdownOpen: false,
    searchQuery: '' 
  }
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

// ─── علامات لمنع التحديثات المتكررة ───
const isUpdatingFromUser = ref(false);
const isUpdatingFromProps = ref(false);

// ─── حارس التعديلات غير المحفوظة ───
// نفس منطق UrheberContent: يبقى true من أول ضغطة مفتاح حتى نجاح الحفظ وخلوّ قائمة
// الانتظار، فيمنع updateFromProps ودوال المزامنة من الكتابة فوق ما يكتبه المستخدم
// أثناء دورة الحفظ أو أثناء تصفير/إعادة تحميل currentSong بفعل التنقل. أما
// isUpdatingFromUser القديم فكان يُصفّى بعد 300ms (أقصر من debounce=800ms) فلا يحمي.
const hasUnsavedEdits = ref(false);
const lastLoadedUuid = ref(null);

const markEdited = () => {
  hasUnsavedEdits.value = true;
};

// ─── الحصول على صورة الفنان ───
const getArtistImage = (artist) => {
  if (!artist) return '/icon/icon-picture.jpg';
  if (artist.spotify && artist.spotify.cover) return artist.spotify.cover;
  if (artist.apple && artist.apple.cover) return artist.apple.cover;
  return '/icon/icon-picture.jpg';
};

// ─── اختيار نتيجة البحث (Artist) ───
const selectSearchResult = (result, index) => {
  if (artistInputs.value[index]) {
    artistInputs.value[index].name = result.name;
    artistInputs.value[index].searchQuery = result.name;
    artistInputs.value[index].isSelected = true;
    artistInputs.value[index].isFocused = false;
    artistInputs.value[index].isSearching = false;
  }
  showSearchResults.value = null;
  searchArtistsResults.value = [];
  updateArtistValue(index);
};

// ─── إضافة فنان جديد (Artist) ───
const handleAddNewArtist = (index) => {
  const searchQuery = artistInputs.value[index]?.searchQuery?.trim();
  if (!searchQuery) return;
  
  if (artistInputs.value[index]) {
    artistInputs.value[index].name = searchQuery;
    artistInputs.value[index].searchQuery = searchQuery;
    artistInputs.value[index].isSelected = true;
    artistInputs.value[index].isFocused = false;
    artistInputs.value[index].isSearching = false;
  }
  showSearchResults.value = null;
  searchArtistsResults.value = [];
  updateArtistValue(index);
};

// ─── معالجة التركيز (Artist) ───
const handleArtistFocus = (index) => {
  if (artistInputs.value[index]) {
    artistInputs.value[index].isFocused = true;
    artistInputs.value[index].isSearching = true;
    showSearchResults.value = index;
    const query = artistInputs.value[index].searchQuery || '';
    if (query.trim()) {
      updateArtistSearch(index, query);
    }
  }
};

// ─── معالجة إدخال النص (Artist) ───
const handleArtistInput = (index, query) => {
  if (artistInputs.value[index]) {
    markEdited();
    artistInputs.value[index].searchQuery = query || '';
    artistInputs.value[index].name = query || '';
    artistInputs.value[index].isSearching = true;
    showSearchResults.value = index;
    if (query && query.trim()) {
      updateArtistSearch(index, query);
    } else {
      searchArtistsResults.value = [];
      artistInputs.value[index].isSearching = false;
    }
    // ✅ نحفظ الاسم المكتوب مباشرةً (مثل Komponist) حتى دون اختيار من نتائج البحث،
    //   وإلا كان الفنان المُدخَل لا يُرسَل إطلاقاً إن لم ينقر المستخدم على نتيجة.
    debouncedSendUpdate();
    setTimeout(() => emitTabCompletion(), 300);
  }
};

// ─── معالجة إزالة التركيز (Artist) ───
const handleArtistBlur = (index) => {
  setTimeout(() => {
    if (artistInputs.value[index]) {
      artistInputs.value[index].isFocused = false;
      artistInputs.value[index].isSearching = false;
      if (!artistInputs.value[index].name?.trim()) {
        showSearchResults.value = null;
        searchArtistsResults.value = [];
      }
    }
  }, 300);
};

// ==================== دوال البحث لـ Feature ====================

// ─── اختيار نتيجة البحث (Feature) ───
const selectFeatureSearchResult = (result, index) => {
  if (featureInputs.value[index]) {
    featureInputs.value[index].name = result.name;
    featureInputs.value[index].searchQuery = result.name;
    featureInputs.value[index].isSelected = true;
    featureInputs.value[index].isFocused = false;
    featureInputs.value[index].isSearching = false;
  }
  showFeatureSearchResults.value = null;
  featureSearchResults.value = [];
  updateFeatureValue(index);
};

// ─── إضافة Feature جديد ───
const handleAddNewFeature = (index) => {
  const searchQuery = featureInputs.value[index]?.searchQuery?.trim();
  if (!searchQuery) return;
  
  if (featureInputs.value[index]) {
    featureInputs.value[index].name = searchQuery;
    featureInputs.value[index].searchQuery = searchQuery;
    featureInputs.value[index].isSelected = true;
    featureInputs.value[index].isFocused = false;
    featureInputs.value[index].isSearching = false;
  }
  showFeatureSearchResults.value = null;
  featureSearchResults.value = [];
  updateFeatureValue(index);
};

// ─── معالجة التركيز (Feature) ───
const handleFeatureFocus = (index) => {
  if (!isFeatureActive.value) return;
  if (featureInputs.value[index]) {
    featureInputs.value[index].isFocused = true;
    featureInputs.value[index].isSearching = true;
    showFeatureSearchResults.value = index;
    const query = featureInputs.value[index].searchQuery || '';
    if (query.trim()) {
      updateFeatureSearch(index, query);
    }
  }
};

// ─── معالجة إدخال النص (Feature) ───
const handleFeatureInput = (index, query) => {
  if (!isFeatureActive.value) return;
  if (featureInputs.value[index]) {
    markEdited();
    featureInputs.value[index].searchQuery = query || '';
    featureInputs.value[index].name = query || '';
    featureInputs.value[index].isSearching = true;
    showFeatureSearchResults.value = index;
    if (query && query.trim()) {
      updateFeatureSearch(index, query);
    } else {
      featureSearchResults.value = [];
      featureInputs.value[index].isSearching = false;
    }
    // ✅ نحفظ اسم الـ Feature المكتوب مباشرةً حتى دون اختيار من نتائج البحث.
    debouncedSendUpdate();
    setTimeout(() => emitTabCompletion(), 300);
  }
};

// ─── معالجة إزالة التركيز (Feature) ───
const handleFeatureBlur = (index) => {
  setTimeout(() => {
    if (featureInputs.value[index]) {
      featureInputs.value[index].isFocused = false;
      featureInputs.value[index].isSearching = false;
      if (!featureInputs.value[index].name?.trim()) {
        showFeatureSearchResults.value = null;
        featureSearchResults.value = [];
      }
    }
  }, 300);
};

// ─── تهيئة P-Line من الـ Release ───
const initializePLineFromRelease = () => {
  if (props.releasePLine && props.releasePLine.trim() !== '') {
    const currentValues = pLineInputs.value.map(i => i.name);
    const releasePLineValue = props.releasePLine.trim();
    
    if (!currentValues.includes(releasePLineValue)) {
      pLineInputs.value = [{ name: releasePLineValue, isHovered: false }];

      // ✅ previousValues يجب أن يعكس ما لدى الخادم لا ما عبّأناه للتوّ. كان تسجيل
      //    القيمة المُعبّأة تلقائياً هنا يُلغي كشف التغيير في sendUpdate فلا تُحفظ أبداً.
      const songPLine = props.currentSong?.contributors?.p_line?.[0]?.name?.trim() || '';
      previousValues.value.p_line = songPLine ? [{ name: songPLine }] : [];

      if (songPLine !== releasePLineValue && props.currentSong?.uuid && !isSaving.value) {
        console.log('💾 [MitwirkendeContent] P-Line مُعبّأة تلقائياً → حفظها:', releasePLineValue);
        debouncedSendUpdate();
      }
    }
  }
};

// ─── تهيئة Jahr der Produktion من الـ Release ───
const initializeProductionYearFromRelease = () => {
  const yearStr = String(props.releaseProductionYear || '');
  if (yearStr.trim() !== '') {
    const year = yearStr.trim();
    if (/^\d{4}$/.test(year)) {
      productionYear.value = year;
      productionYearValid.value = true;

      // ✅ نفس القاعدة: previousValues = قيمة الخادم، ثم نحفظ إن اختلفت.
      const songYear = props.currentSong?.production_year != null
        ? parseInt(props.currentSong.production_year, 10)
        : null;
      previousValues.value.production_year = songYear;

      if (songYear !== parseInt(year, 10) && props.currentSong?.uuid && !isSaving.value) {
        console.log('💾 [MitwirkendeContent] Produktionsjahr مُعبّأ تلقائياً → حفظه:', year);
        debouncedSendUpdate();
      }
    }
  }
};

// في MitwirkendeContent.vue
const isTabComplete = (tabId) => {
  if (tabId !== 'mitwirkende') return true;
  
  const hasArtist = artistInputs.value.length > 0 && artistInputs.value.every(input => isValidName(input.name));

  let hasFeature = true;
  if (isFeatureActive.value) {
    hasFeature = featureInputs.value.length > 0 && featureInputs.value.every(input => isValidName(input.name));
  }

  const hasPLine = pLineInputs.value.length > 0 && pLineInputs.value.every(input => hasNonEmptyValue(input.name));

  const hasProducer = produzentInputs.value.length > 0 && produzentInputs.value.every(input => hasNonEmptyValue(input.name));

  let hasWeitere = true;
  if (isWeitereActive.value) {
    hasWeitere = weitereInputs.value.length > 0 && weitereInputs.value.every(input =>
      input.role && input.role.trim() !== '' && isValidName(input.name)
    );
  }
  
  const hasProductionYear = productionYearValid.value;

  const isComplete = hasArtist && hasFeature && hasPLine && hasProducer && hasWeitere && hasProductionYear;

  console.log(`📌 [MitwirkendeContent] isTabComplete: ${isComplete}`);
  console.log(`   - Artist valid: ${hasArtist}`);
  console.log(`   - Feature valid: ${hasFeature}`);
  console.log(`   - P-Line valid: ${hasPLine}`);
  console.log(`   - Produzent valid: ${hasProducer}`);
  console.log(`   - Weitere valid: ${hasWeitere}`);
  console.log(`   - ProductionYear valid: ${hasProductionYear}`);

  return isComplete;
};

// ========== دالة التحقق من صحة الاسم ==========
const isValidName = (value) => {
  if (!value || value.trim() === '') return false;
  const trimmed = value.trim();
  
  // ✅ إزالة المسافات وحساب عدد الأحرف
  const lettersOnly = trimmed.replace(/\s/g, '');
  
  // ✅ يجب أن يكون على الأقل 4 أحرف (مع أو بدون مسافة)
  return lettersOnly.length >= 4;
};

const hasNonEmptyValue = (value) => {
  return Boolean(value && value.trim() !== '');
};

// ========== دالة إرسال تحديث الاكتمال ==========
const emitTabCompletion = () => {
  const isComplete = isTabComplete('mitwirkende');
  emit('update:form-data', {
    tab: 'mitwirkende',
    data: { isComplete }
  });
};

// ─── دوال التحقق ───
const validateYear = (year) => {
  if (!year) return false;
  const yearStr = String(year).trim();
  if (!/^[0-9]{4}$/.test(yearStr)) return false;
  const num = parseInt(yearStr, 10);
  return num >= 1900 && num <= 2100;
};

// ─── إغلاق القائمة عند النقر خارجها ───
const handleClickOutside = (event) => {
  const dropdowns = document.querySelectorAll('.custom-select');
  const plusIcons = document.querySelectorAll('.plus-icon');
  const minusIcons = document.querySelectorAll('.minus-icon');
  const spacers = document.querySelectorAll('.spacer');
  const searchResults = document.querySelectorAll('.search-result');
  let clickedInside = false;
  
  dropdowns.forEach(dropdown => {
    if (dropdown.contains(event.target)) {
      clickedInside = true;
    }
  });
  
  plusIcons.forEach(icon => {
    if (icon.contains(event.target)) {
      clickedInside = true;
    }
  });
  
  minusIcons.forEach(icon => {
    if (icon.contains(event.target)) {
      clickedInside = true;
    }
  });
  
  spacers.forEach(spacer => {
    if (spacer.contains(event.target)) {
      clickedInside = true;
    }
  });
  
  searchResults.forEach(result => {
    if (result.contains(event.target)) {
      clickedInside = true;
    }
  });
  
  if (!clickedInside) {
    weitereInputs.value.forEach(input => {
      input.isRoleDropdownOpen = false;
    });
    showSearchResults.value = null;
    showFeatureSearchResults.value = null;
  }
};

// استبدل دالة updateFromProps الحالية بهذه النسخة المحسنة
const updateFromProps = () => {
  if (isUpdatingFromUser.value) {
    return;
  }

  // ✅ لا نكتب فوق حقول يعدّلها المستخدم حالياً ولم تُحفَظ بعد.
  if (hasUnsavedEdits.value) {
    console.log('⏭️ MitwirkendeContent: تخطي updateFromProps (توجد تعديلات غير محفوظة)');
    return;
  }

  isUpdatingFromProps.value = true;
  lastLoadedUuid.value = props.currentSong?.uuid || lastLoadedUuid.value;
  let hasArtistChanges = false;
  let hasWeitereChanges = false;
  let hasPLineChanges = false;
  let hasProductionYearChanges = false;

  // Artist
  if (props.releaseArtists && props.releaseArtists.length > 0) {
    const artistArray = Array.isArray(props.releaseArtists) ? props.releaseArtists : [];
    const currentNames = artistInputs.value.map(i => i.name);
    const newNames = artistArray.map(name => name);
    
    if (JSON.stringify(currentNames) !== JSON.stringify(newNames)) {
      artistInputs.value = artistArray.length > 0 
        ? artistArray.map(name => ({ 
            name: name, 
            isHovered: false,
            isSearching: false,
            isFocused: false,
            searchQuery: name
          }))
        : [{ name: '', isHovered: false, isSearching: false, isFocused: false, searchQuery: '' }];
      hasArtistChanges = true;
    }

    // ✅ previousValues = قائمة فنّاني الأغنية على الخادم، لا قائمة الـ Release المُعبّأة.
    const songArtists = Array.isArray(props.currentSong?.contributors?.artist)
      ? props.currentSong.contributors.artist
          .map(a => ({ name: (a?.name || '').trim() }))
          .filter(a => a.name !== '')
      : [];
    previousValues.value.artist = songArtists;

    const filledArtists = artistArray.map(name => ({ name: String(name || '').trim() }));
    if (JSON.stringify(songArtists) !== JSON.stringify(filledArtists)) hasArtistChanges = true;
  } else {
    artistInputs.value = [{ name: '', isHovered: false, isSearching: false, isFocused: false, searchQuery: '' }];
    previousValues.value.artist = [];
  }

  // Feature
  if (props.currentSong?.contributors?.feature) {
    const featureArray = Array.isArray(props.currentSong.contributors.feature) 
      ? props.currentSong.contributors.feature 
      : [];
    
    const currentNames = featureInputs.value.map(i => i.name);
    const newNames = featureArray.map(i => i.name);
    
    if (JSON.stringify(currentNames) !== JSON.stringify(newNames)) {
      featureInputs.value = featureArray.length > 0 
        ? featureArray.map(item => ({ 
            name: item.name || '', 
            isHovered: false,
            isSearching: false,
            isFocused: false,
            searchQuery: item.name || ''
          }))
        : [{ name: '', isHovered: false, isSearching: false, isFocused: false, searchQuery: '' }];
    }
    
    isFeatureActive.value = featureArray.length > 0;
    previousValues.value.feature = JSON.parse(JSON.stringify(featureArray));
  } else {
    featureInputs.value = [{ name: '', isHovered: false, isSearching: false, isFocused: false, searchQuery: '' }];
    isFeatureActive.value = false;
    previousValues.value.feature = [];
  }

  // ✅ P-Line - تحسين التحديث
  const pLineFromRelease = props.releasePLine?.trim() || '';
  const pLineFromSong = props.currentSong?.contributors?.p_line?.[0]?.name?.trim() || '';
  const finalPLine = pLineFromSong || pLineFromRelease;
  
  if (finalPLine) {
    const currentValues = pLineInputs.value.map(i => i.name);
    if (!currentValues.includes(finalPLine)) {
      pLineInputs.value = [{ name: finalPLine, isHovered: false }];

      // ✅ previousValues = قيمة الخادم. كان تسجيل finalPLine هنا يجعل contributorsChanged
      //    تساوي false داخل sendUpdate، فيخرج بـ "لا توجد تغييرات" رغم استدعائه.
      const songPLine = props.currentSong?.contributors?.p_line?.[0]?.name?.trim() || '';
      previousValues.value.p_line = songPLine ? [{ name: songPLine }] : [];
      hasPLineChanges = true;
      console.log('📌 [MitwirkendeContent] P-Line updated in updateFromProps:', finalPLine);
    }
  } else {
    // إذا كانت P-Line فارغة
    const hasData = pLineInputs.value.some(i => i.name && i.name.trim() !== '');
    if (hasData) {
      pLineInputs.value = [{ name: '', isHovered: false }];
      previousValues.value.p_line = [];
      hasPLineChanges = true;
      console.log('📌 [MitwirkendeContent] P-Line cleared in updateFromProps');
    }
  }

  // Producer
  if (props.currentSong?.contributors?.producer) {
    const producerArray = Array.isArray(props.currentSong.contributors.producer) 
      ? props.currentSong.contributors.producer 
      : [];
    
    const currentNames = produzentInputs.value.map(i => i.name);
    const newNames = producerArray.map(i => i.name);
    
    if (JSON.stringify(currentNames) !== JSON.stringify(newNames)) {
      produzentInputs.value = producerArray.length > 0 
        ? producerArray.map(item => ({ 
            name: item.name || '', 
            isHovered: false 
          }))
        : [{ name: '', isHovered: false }];
    }
    
    previousValues.value.producer = JSON.parse(JSON.stringify(producerArray));
  } else {
    produzentInputs.value = [{ name: '', isHovered: false }];
    previousValues.value.producer = [];
  }

  // Production Year
  const yearFromRelease = String(props.releaseProductionYear || '').trim();
  if (yearFromRelease !== '' && /^\d{4}$/.test(yearFromRelease)) {
    if (productionYear.value !== yearFromRelease) {
      productionYear.value = yearFromRelease;
      productionYearValid.value = true;

      // ✅ previousValues = قيمة الخادم (لا القيمة المُعبّأة) كي يكتشف sendUpdate الفرق.
      const songYear = props.currentSong?.production_year != null
        ? parseInt(props.currentSong.production_year, 10)
        : null;
      previousValues.value.production_year = songYear;
      if (songYear !== parseInt(yearFromRelease, 10)) hasProductionYearChanges = true;
    }
  }
  
  if (props.currentSong?.production_year) {
    const newYear = String(props.currentSong.production_year);
    if (productionYear.value !== newYear) {
      productionYear.value = newYear;
      productionYearValid.value = validateYear(productionYear.value);
    }
    previousValues.value.production_year = props.currentSong.production_year;
  }

  // Other Contributors
  if (props.currentSong?.contributors?.other_contributors) {
    const otherArray = Array.isArray(props.currentSong.contributors.other_contributors) 
      ? props.currentSong.contributors.other_contributors 
      : [];
    
    const currentData = weitereInputs.value.map(i => ({ role: i.role, name: i.name }));
    const newData = otherArray.map(i => ({ role: i.role || '', name: i.name || '' }));
    
    if (JSON.stringify(currentData) !== JSON.stringify(newData)) {
      if (otherArray.length > 0) {
        weitereInputs.value = otherArray.map(item => ({
          role: item.role || '',
          name: item.name || '',
          isHovered: false,
          isRoleDropdownOpen: false,
          searchQuery: ''
        }));
        isWeitereActive.value = true;
        hasWeitereChanges = true;
      } else {
        weitereInputs.value = [{ 
          role: '', 
          name: '', 
          isHovered: false, 
          isRoleDropdownOpen: false,
          searchQuery: '' 
        }];
        isWeitereActive.value = false;
        hasWeitereChanges = true;
      }
    }
    
    previousValues.value.other_contributors = JSON.parse(JSON.stringify(otherArray));
  } else {
    weitereInputs.value = [{ 
      role: '', 
      name: '', 
      isHovered: false, 
      isRoleDropdownOpen: false,
      searchQuery: '' 
    }];
    isWeitereActive.value = false;
    previousValues.value.other_contributors = [];
  }
  
  isUpdatingFromProps.value = false;
  
  // ✅ إرسال التحديث إذا كانت هناك تغييرات
  if (hasArtistChanges || hasWeitereChanges || hasPLineChanges || hasProductionYearChanges) {
    debouncedSendUpdate();
  }
  
  setTimeout(() => {
    emitTabCompletion();
  }, 300);
};

// ─── دالة معالجة قائمة الانتظار ───
const processSaveQueue = () => {
  if (saveQueue.value.length === 0) {
    isSaving.value = false;
    return;
  }
  
  const latestSave = saveQueue.value.pop();
  saveQueue.value = [];
  
  const payload = { contributors: {} };
  let hasChanges = false;
  const prev = previousValues.value;

  // ✅ اكتشاف أي تغيير فعلي في أي حقل من حقول المساهمين
  const contributorsChanged =
    JSON.stringify(latestSave.artist) !== JSON.stringify(prev.artist || []) ||
    JSON.stringify(latestSave.feature) !== JSON.stringify(prev.feature || []) ||
    JSON.stringify(latestSave.pLine) !== JSON.stringify(prev.p_line || []) ||
    JSON.stringify(latestSave.producer) !== JSON.stringify(prev.producer || []) ||
    JSON.stringify(latestSave.other) !== JSON.stringify(prev.other_contributors || []);

  // ✅ ✅ ✅ نُرسل لقطة كاملة لكل حقول المساهمين عند أي تغيير (نفس منطق sendUpdate)
  //     لتجنّب حذف الحقول غير المتغيّرة (مثل Produzent) بسبب الاستبدال الكامل في الـ backend.
  if (contributorsChanged) {
    hasChanges = true;
    // ✅ لقطة كاملة دائماً (نفس منطق sendUpdate) — الـ backend يستبدل contributors بالكامل.
    payload.contributors = {
      artist: latestSave.artist,
      feature: latestSave.feature,
      p_line: latestSave.pLine,
      producer: latestSave.producer,
      other_contributors: latestSave.other
    };
  }

  if (latestSave.productionYear !== prev.production_year) {
    payload['production_year'] = latestSave.productionYear;
    hasChanges = true;
  }

  if (!hasChanges) {
    isSaving.value = false;
    return;
  }
  
  if (Object.keys(payload.contributors).length === 0) {
    delete payload.contributors;
  }
  
  previousValues.value = {
    artist: JSON.parse(JSON.stringify(latestSave.artist)),
    feature: JSON.parse(JSON.stringify(latestSave.feature)),
    p_line: JSON.parse(JSON.stringify(latestSave.pLine)),
    producer: JSON.parse(JSON.stringify(latestSave.producer)),
    production_year: latestSave.productionYear,
    other_contributors: JSON.parse(JSON.stringify(latestSave.other))
  };

  isSaving.value = true;
  if (savingTimeout) clearTimeout(savingTimeout);
  savingTimeout = setTimeout(() => {
    if (isSaving.value) {
      console.warn('⚠️ [MitwirkendeContent] isSaving stuck after queue processing, resetting');
      isSaving.value = false;
      if (saveQueue.value.length > 0) processSaveQueue();
    }
  }, 10000);

  emit('save-song', payload);
};

// ─── دالة إرسال التحديثات ───
const sendUpdate = () => {
  if (!props.currentSong?.uuid) {
    return;
  }

  if (isSaving.value) {
    const dataToSave = {
      artist: artistInputs.value
        .filter(input => input.name && input.name.trim() !== '' && isValidName(input.name))
        .map(input => ({ name: input.name.trim() })),
      feature: featureInputs.value
        .filter(input => input.name && input.name.trim() !== '' && isValidName(input.name))
        .map(input => ({ name: input.name.trim() })),
      pLine: pLineInputs.value
        .filter(input => hasNonEmptyValue(input.name))
        .map(input => ({ name: input.name.trim() })),
      producer: produzentInputs.value
        .filter(input => hasNonEmptyValue(input.name))
        .map(input => ({ name: input.name.trim() })),
      productionYear: productionYearValid.value ? parseInt(productionYear.value, 10) : null,
      other: weitereInputs.value
        .filter(input => input.role && input.role.trim() !== '' && input.name && input.name.trim() !== '')
        .map(input => ({ role: input.role.trim(), name: input.name.trim() }))
    };
    
    const isDuplicate = saveQueue.value.some(item => 
      JSON.stringify(item) === JSON.stringify(dataToSave)
    );
    
    if (!isDuplicate) {
      saveQueue.value.push(dataToSave);
    }
    return;
  }

  // ✅ جمع البيانات الحالية
  const currentArtist = artistInputs.value
    .filter(input => input.name && input.name.trim() !== '' && isValidName(input.name))
    .map(input => ({ name: input.name.trim() }));
  
  const currentFeature = featureInputs.value
    .filter(input => input.name && input.name.trim() !== '' && isValidName(input.name))
    .map(input => ({ name: input.name.trim() }));
  
  const currentPLine = pLineInputs.value
    .filter(input => hasNonEmptyValue(input.name))
    .map(input => ({ name: input.name.trim() }));
  
  const currentProducer = produzentInputs.value
    .filter(input => hasNonEmptyValue(input.name))
    .map(input => ({ name: input.name.trim() }));
  
  const currentProductionYear = productionYearValid.value ? parseInt(productionYear.value, 10) : null;

  const currentOther = weitereInputs.value
    .filter(input => input.role && input.role.trim() !== '' && input.name && input.name.trim() !== '')
    .map(input => ({ 
      role: input.role.trim(),
      name: input.name.trim()
    }));

  const payload = { contributors: {} };
  let hasChanges = false;
  const prev = previousValues.value;

  // ✅ اكتشاف أي تغيير فعلي في أي حقل من حقول المساهمين
  const contributorsChanged =
    JSON.stringify(currentArtist) !== JSON.stringify(prev.artist || []) ||
    JSON.stringify(currentFeature) !== JSON.stringify(prev.feature || []) ||
    JSON.stringify(currentPLine) !== JSON.stringify(prev.p_line || []) ||
    JSON.stringify(currentProducer) !== JSON.stringify(prev.producer || []) ||
    JSON.stringify(currentOther) !== JSON.stringify(prev.other_contributors || []);

  // ✅ ✅ ✅ عند وجود أي تغيير، نُرسل لقطة كاملة لكل حقول المساهمين.
  //     السبب: الـ backend يستبدل كائن contributors بالكامل، فإرسال جزء منه فقط
  //     كان يحذف بقية الحقول (خاصةً Produzent وFeature وP-Line) عند تعديل حقل آخر.
  if (contributorsChanged) {
    hasChanges = true;
    // ✅ نُرسل لقطة كاملة لكل الحقول دائماً (بما فيها الفارغة) لأن الـ backend يستبدل كائن
    //   contributors بالكامل. الإدراج الشرطي القديم كان يحذف حقلاً فارغاً حالياً، لكنه أيضاً
    //   كان مصدر ارتباك؛ اللقطة الكاملة تضمن حفظ كل ما أدخله المستخدم دون فقدان أي حقل.
    payload.contributors = {
      artist: currentArtist,
      feature: currentFeature,
      p_line: currentPLine,
      producer: currentProducer,
      other_contributors: currentOther
    };
  }

  if (currentProductionYear !== prev.production_year) {
    payload['production_year'] = currentProductionYear;
    hasChanges = true;
  }

  if (!hasChanges) {
    console.log('ℹ️ [MitwirkendeContent] لا توجد تغييرات لإرسالها');
    isSaving.value = false;
    return;
  }

  if (Object.keys(payload.contributors).length === 0) {
    delete payload.contributors;
  }

  console.log('📤 [MitwirkendeContent] إرسال التحديثات:', payload);
  
  // ✅ تحديث previousValues
  if (payload.contributors?.artist) {
    previousValues.value.artist = JSON.parse(JSON.stringify(payload.contributors.artist));
  }
  if (payload.contributors?.feature) {
    previousValues.value.feature = JSON.parse(JSON.stringify(payload.contributors.feature));
  }
  if (payload.contributors?.p_line) {
    previousValues.value.p_line = JSON.parse(JSON.stringify(payload.contributors.p_line));
  }
  if (payload.contributors?.producer) {
    previousValues.value.producer = JSON.parse(JSON.stringify(payload.contributors.producer));
  }
  if (payload.contributors?.other_contributors) {
    previousValues.value.other_contributors = JSON.parse(JSON.stringify(payload.contributors.other_contributors));
  }
  if (payload.production_year !== undefined) {
    previousValues.value.production_year = payload.production_year;
  }

  isSaving.value = true;
  if (savingTimeout) clearTimeout(savingTimeout);
  savingTimeout = setTimeout(() => {
    if (isSaving.value) {
      console.warn('⚠️ [MitwirkendeContent] isSaving stuck for 10s, force resetting');
      isSaving.value = false;
      if (saveQueue.value.length > 0) processSaveQueue();
    }
  }, 10000);

  emit('save-song', payload);
};

// ─── دالة معالجة نجاح الحفظ ───
const handleSaveComplete = (event) => {
  const { success, songUuid, error } = event.detail || {};

  if (savingTimeout) {
    clearTimeout(savingTimeout);
    savingTimeout = null;
  }

  if (success) {
    console.log('✅ MitwirkendeContent: تم استلام إشارة نجاح الحفظ للأغنية:', songUuid);
  } else {
    console.warn('⚠️ MitwirkendeContent: فشل الحفظ:', error);
  }

  isSaving.value = false;

  setTimeout(() => {
    if (saveQueue.value.length > 0) {
      console.log(`📦 MitwirkendeContent: معالجة ${saveQueue.value.length} عناصر في قائمة الانتظار`);
      processSaveQueue();
    } else if (success) {
      // ✅ حُفظ كل شيء ولا يوجد ما ينتظر → المحلي = الخادم، فنسقط حارس التعديلات بأمان.
      hasUnsavedEdits.value = false;
    }
  }, 200);
};

// ✅ تعريف debouncedSendUpdate قبل أي watch يستخدمها
const debouncedSendUpdate = debounce(() => {
  sendUpdate();
}, 800);
const syncPLineFromSources = () => {
  // لا نضع hasUnsavedEdits هنا: هذه الدالة تخصّ autofill حقل P-Line فقط، وحظرها عند تعديل
  //   حقل آخر (Artist/Producer) كان يمنع تعبئة P-Line من الـ Release فتظهر فارغة.
  if (isUpdatingFromUser.value) return;

  const pLineFromSong = props.currentSong?.contributors?.p_line?.[0]?.name?.trim() || '';
  const pLineFromRelease = props.releasePLine?.trim() || '';
  const isPLineFromSong = Boolean(pLineFromSong);
  const finalPLine = pLineFromSong || pLineFromRelease;

  if (finalPLine) {
    const currentValues = pLineInputs.value.map(i => i.name);
    if (!currentValues.includes(finalPLine)) {
      pLineInputs.value = [{ name: finalPLine, isHovered: false }];
      previousValues.value.p_line = isPLineFromSong ? [{ name: finalPLine }] : [];
      console.log('📌 [MitwirkendeContent] P-Line synced:', finalPLine);
      emitTabCompletion();
      if (!isSaving.value) {
        debouncedSendUpdate();
      }
    }
    if (!isPLineFromSong && previousValues.value.p_line.length > 0) {
      previousValues.value.p_line = [];
      if (!isSaving.value) {
        debouncedSendUpdate();
      }
    }
  } else {
    const hasData = pLineInputs.value.some(i => i.name && i.name.trim() !== '');
    if (hasData) {
      pLineInputs.value = [{ name: '', isHovered: false }];
      previousValues.value.p_line = [];
      console.log('📌 [MitwirkendeContent] P-Line cleared');
      emitTabCompletion();
    }
  }
};

watch(() => props.releasePLine, () => {
  syncPLineFromSources();
}, { immediate: true });

// ─── مراقبة تغييرات currentSong لتحديث P-Line ───
watch(() => props.currentSong?.contributors?.p_line, () => {
  syncPLineFromSources();
}, { deep: true, immediate: true });

watch(() => props.currentSong?.contributors?.producer, (newProducer) => {
  if (isUpdatingFromUser.value || hasUnsavedEdits.value) return;

  const producerArray = Array.isArray(newProducer) ? newProducer : [];
  const newNames = producerArray.map(item => item?.name || '');
  const currentNames = produzentInputs.value.map(input => input.name);

  if (JSON.stringify(currentNames) !== JSON.stringify(newNames)) {
    produzentInputs.value = producerArray.length > 0
      ? producerArray.map(item => ({ name: item.name || '', isHovered: false }))
      : [{ name: '', isHovered: false }];
    previousValues.value.producer = JSON.parse(JSON.stringify(producerArray));
    emitTabCompletion();
  } else {
    previousValues.value.producer = JSON.parse(JSON.stringify(producerArray));
  }
}, { deep: true, immediate: true });
// ─── مراقبة تغييرات releaseArtists وإرسالها تلقائياً ───
watch(() => props.releaseArtists, (newArtists, oldArtists) => {
  if (JSON.stringify(newArtists) === JSON.stringify(oldArtists) && oldArtists) {
    return;
  }

  if (isUpdatingFromUser.value || hasUnsavedEdits.value) {
    return;
  }
  
  // ✅ تحديث artistInputs من releaseArtists
  if (newArtists && newArtists.length > 0) {
    const artistArray = Array.isArray(newArtists) ? newArtists : [];
    const currentNames = artistInputs.value.map(i => i.name);
    const newNames = artistArray.map(name => name);
    
    if (JSON.stringify(currentNames) !== JSON.stringify(newNames)) {
      artistInputs.value = artistArray.length > 0 
        ? artistArray.map(name => ({ 
            name: name, 
            isHovered: false,
            isSearching: false,
            isFocused: false,
            searchQuery: name
          }))
        : [{ name: '', isHovered: false, isSearching: false, isFocused: false, searchQuery: '' }];
      
      previousValues.value.artist = artistArray.map(name => ({ name: name }));
      
      // ✅ إرسال التحديث فوراً
      debouncedSendUpdate();
    }
  } else {
    // إذا كانت releaseArtists فارغة، نقوم بإفراغ artistInputs
    const hasData = artistInputs.value.some(input => input.name && input.name.trim() !== '');
    if (hasData) {
      artistInputs.value = [{ name: '', isHovered: false, isSearching: false, isFocused: false, searchQuery: '' }];
      previousValues.value.artist = [];
      debouncedSendUpdate();
    }
  }
  
  updateFromProps();
}, { deep: true, immediate: true });

// ─── مراقبة تغييرات releaseProductionYear ───
watch(() => props.releaseProductionYear, (newYear) => {
  const yearStr = String(newYear || '');
  if (yearStr.trim() !== '' && /^\d{4}$/.test(yearStr.trim())) {
    const year = yearStr.trim();
    if (productionYear.value !== year) {
      productionYear.value = year;
      productionYearValid.value = true;

      // ✅ Auto-save the auto-filled year to the song, unless the song already
      //    has it. Marking previousValues as saved (as before) prevented sendUpdate
      //    from ever persisting the auto-filled value.
      const songHasYear = String(props.currentSong?.production_year || '') === year;
      if (!songHasYear && props.currentSong?.uuid) {
        previousValues.value.production_year = null; // force change detection
        if (!isSaving.value) debouncedSendUpdate();
      } else {
        previousValues.value.production_year = parseInt(year, 10);
      }
      emitTabCompletion();
    }
  }
}, { immediate: true });

// ─── مراقبة تغييرات weitereInputs وإرسال التحديث ───
watch(
  () => weitereInputs.value,
  (newVal, oldVal) => {
    if (isUpdatingFromUser.value) {
      return;
    }
    
    // ✅ تأكد من وجود تغيير فعلي
    const hasData = newVal.some(input => input.role && input.role.trim() !== '' && input.name && input.name.trim() !== '');
    const oldHasData = oldVal?.some(input => input.role && input.role.trim() !== '' && input.name && input.name.trim() !== '');
    
    if (hasData || oldHasData) {
      console.log('📤 [MitwirkendeContent] weitereInputs changed, sending update');
      debouncedSendUpdate();
    }
  },
  { deep: true }
);

// ─── مراقبة تغييرات currentSong ───
watch(() => props.currentSong, (newSong, oldSong) => {
  if (isUpdatingFromUser.value) {
    return;
  }

  const newUuid = newSong?.uuid || null;

  // ✅ نفس منطق Urheber: نقارن بآخر uuid حُمّل فعلاً لكشف "إعادة تحميل نفس الأغنية"
  //    (بعد تصفير currentSong إلى null بفعل التنقل) وتخطّيها كي لا تُمسح تعديلات
  //    المستخدم غير المحفوظة.
  if (newUuid && newUuid === lastLoadedUuid.value) {
    return;
  }

  if (newSong?.uuid) {
    // تبديل فعلي لأغنية أخرى → نُحمّلها ونُسقط حارس التعديلات القديمة.
    hasUnsavedEdits.value = false;
    // ✅ تحديث previousValues
    if (newSong.contributors?.artist) {
      previousValues.value.artist = JSON.parse(JSON.stringify(newSong.contributors.artist));
    }
    if (newSong.contributors?.feature) {
      previousValues.value.feature = JSON.parse(JSON.stringify(newSong.contributors.feature));
    }
    if (newSong.contributors?.p_line) {
      previousValues.value.p_line = JSON.parse(JSON.stringify(newSong.contributors.p_line));
    }
    if (newSong.contributors?.producer) {
      previousValues.value.producer = JSON.parse(JSON.stringify(newSong.contributors.producer));
    }
    if (newSong.contributors?.other_contributors) {
      previousValues.value.other_contributors = JSON.parse(JSON.stringify(newSong.contributors.other_contributors));
    }
    if (newSong.production_year) {
      previousValues.value.production_year = newSong.production_year;
    }
    
    updateFromProps();
    
    // ✅ ✅ ✅ إرسال البيانات بعد التحديث
    nextTick(() => {
      debouncedSendUpdate();
      console.log('📤 [MitwirkendeContent] إرسال البيانات بعد تحديث currentSong');
    });
  }
}, { deep: true, immediate: true });

// ─── دوال إدارة Artist ───
const updateArtistValue = (index) => {
  markEdited();
  debouncedSendUpdate();
  setTimeout(() => emitTabCompletion(), 300);
};

const addArtistInput = () => {
  artistInputs.value.push({ 
    name: '', 
    isHovered: false, 
    isSearching: false, 
    isFocused: false, 
    searchQuery: '' 
  });
  if (!isSaving.value) {
    debouncedSendUpdate();
  }
  setTimeout(() => emitTabCompletion(), 300);
};

const removeArtistInput = (index) => {
  if (artistInputs.value.length > 1) {
    artistInputs.value.splice(index, 1);
    artistInputs.value.forEach(item => { item.isHovered = false; });
    if (!isSaving.value) {
      debouncedSendUpdate();
    }
  }
  setTimeout(() => emitTabCompletion(), 300);
};

// ─── دوال إدارة Feature ───
const updateFeatureValue = (index) => {
  markEdited();
  debouncedSendUpdate();
  setTimeout(() => emitTabCompletion(), 300);
};

const addFeatureInput = () => {
  featureInputs.value.push({ 
    name: '', 
    isHovered: false,
    isSearching: false,
    isFocused: false,
    searchQuery: '' 
  });
  if (!isSaving.value) {
    debouncedSendUpdate();
  }
  setTimeout(() => emitTabCompletion(), 300);
};

const removeFeatureInput = (index) => {
  if (featureInputs.value.length > 1) {
    featureInputs.value.splice(index, 1);
    featureInputs.value.forEach(item => { item.isHovered = false; });
    if (!isSaving.value) {
      debouncedSendUpdate();
    }
  }
  setTimeout(() => emitTabCompletion(), 300);
};

const toggleFeature = () => {
  markEdited();
  isFeatureActive.value = !isFeatureActive.value;
  if (!isFeatureActive.value) {
    featureInputs.value = [{ name: '', isHovered: false, isSearching: false, isFocused: false, searchQuery: '' }];
  }
  if (!isSaving.value) {
    debouncedSendUpdate();
  }
  setTimeout(() => emitTabCompletion(), 300);
};

// ─── دوال إدارة P-Line ───
const updatePLineValue = (index) => {
  markEdited();
  debouncedSendUpdate();
  setTimeout(() => emitTabCompletion(), 300);
};

const removePLineInput = (index) => {
  if (pLineInputs.value.length > 1) {
    pLineInputs.value.splice(index, 1);
    pLineInputs.value.forEach(item => { item.isHovered = false; });
    if (!isSaving.value) {
      debouncedSendUpdate();
    }
  }
  setTimeout(() => emitTabCompletion(), 300);
};

// ─── دوال إدارة Produzent ───
const updateProduzentValue = (index) => {
  markEdited();
  debouncedSendUpdate();
  setTimeout(() => emitTabCompletion(), 300);
};

const addProduzentInput = () => {
  produzentInputs.value.push({ name: '', isHovered: false });
  if (!isSaving.value) {
    debouncedSendUpdate();
  }
  setTimeout(() => emitTabCompletion(), 300);
};

const removeProduzentInput = (index) => {
  if (produzentInputs.value.length > 1) {
    produzentInputs.value.splice(index, 1);
    produzentInputs.value.forEach(item => { item.isHovered = false; });
    if (!isSaving.value) {
      debouncedSendUpdate();
    }
  }
  setTimeout(() => emitTabCompletion(), 300);
};

// ─── دوال إدارة Production Year ───
const updateProductionYear = () => {
  markEdited();
  productionYearValid.value = validateYear(productionYear.value);
  debouncedSendUpdate();
  setTimeout(() => emitTabCompletion(), 300);
};

// ─── دوال إدارة Weitere Mitwirkende ───
const updateWeitereValue = (index) => {
  console.log('📤 [MitwirkendeContent] updateWeitereValue called, index:', index);
  markEdited();
  isUpdatingFromUser.value = true;
  
  // ✅ تأكد من وجود بيانات صالحة
  const currentInput = weitereInputs.value[index];
  if (currentInput && currentInput.role && currentInput.role.trim() !== '' && currentInput.name && currentInput.name.trim() !== '') {
    console.log('📤 [MitwirkendeContent] Weitere data ready for send:', {
      role: currentInput.role,
      name: currentInput.name
    });
  }
  
  debouncedSendUpdate();
  setTimeout(() => {
    isUpdatingFromUser.value = false;
    emitTabCompletion();
  }, 300);
};

const addWeitereInput = () => {
  console.log('📤 [MitwirkendeContent] addWeitereInput called');
  isUpdatingFromUser.value = true;
  
  weitereInputs.value.push({ 
    role: '', 
    name: '', 
    isHovered: false, 
    isRoleDropdownOpen: false,
    searchQuery: '' 
  });
  
  weitereInputs.value.forEach((inp, i) => {
    inp.isRoleDropdownOpen = false;
  });
  
  if (!isSaving.value) {
    debouncedSendUpdate();
  }
  
  setTimeout(() => {
    isUpdatingFromUser.value = false;
    emitTabCompletion();
  }, 300);
};

const removeWeitereInput = (index) => {
  console.log('📤 [MitwirkendeContent] removeWeitereInput called, index:', index);
  isUpdatingFromUser.value = true;
  if (weitereInputs.value.length > 1) {
    weitereInputs.value.splice(index, 1);
    weitereInputs.value.forEach(item => { item.isHovered = false; });
    if (!isSaving.value) {
      debouncedSendUpdate();
    }
  }
  setTimeout(() => {
    isUpdatingFromUser.value = false;
    emitTabCompletion();
  }, 300);
};

const toggleWeitere = () => {
  markEdited();
  isUpdatingFromUser.value = true;
  isWeitereActive.value = !isWeitereActive.value;
  if (!isWeitereActive.value) {
    weitereInputs.value = [{ 
      role: '', 
      name: '', 
      isHovered: false, 
      isRoleDropdownOpen: false,
      searchQuery: '' 
    }];
  }
  if (!isSaving.value) {
    debouncedSendUpdate();
  }
  setTimeout(() => {
    isUpdatingFromUser.value = false;
    emitTabCompletion();
  }, 300);
};

const toggleRoleDropdown = (index) => {
  if (!isWeitereActive.value) return;
  
  const currentState = weitereInputs.value[index].isRoleDropdownOpen;
  
  weitereInputs.value.forEach((inp, i) => {
    inp.isRoleDropdownOpen = false;
  });
  
  if (!currentState) {
    weitereInputs.value[index].isRoleDropdownOpen = true;
    if (weitereInputs.value[index].role) {
      weitereInputs.value[index].searchQuery = weitereInputs.value[index].role;
    } else {
      weitereInputs.value[index].searchQuery = '';
    }
  }
};

const handleSearchInput = (index, value) => {
  weitereInputs.value[index].searchQuery = value;
  weitereInputs.value[index].isRoleDropdownOpen = true;
  
  if (weitereInputs.value[index].role && value !== weitereInputs.value[index].role) {
    weitereInputs.value[index].role = '';
  }
};

const selectRoleOption = (index, role) => {
  console.log('📤 [MitwirkendeContent] selectRoleOption called, index:', index, 'role:', role);
  markEdited();
  isUpdatingFromUser.value = true;
  
  weitereInputs.value[index].role = role;
  weitereInputs.value[index].searchQuery = role;
  weitereInputs.value[index].isRoleDropdownOpen = false;
  
  if (!isSaving.value) {
    debouncedSendUpdate();
  }
  setTimeout(() => {
    isUpdatingFromUser.value = false;
    emitTabCompletion();
  }, 300);
};


// ─── دورة الحياة ───
onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  fetchRoles();
  updateFromProps();
  
  window.addEventListener('save-song-complete', handleSaveComplete);
  
  // ✅ ✅ ✅ إرسال البيانات تلقائياً بعد التحميل
  nextTick(() => {
    // تأكد من وجود artist في releaseArtists
    if (props.releaseArtists && props.releaseArtists.length > 0) {
      const artistArray = Array.isArray(props.releaseArtists) ? props.releaseArtists : [];
      const hasValidArtist = artistArray.some(name => name && name.trim() !== '' && isValidName(name));
      
      if (hasValidArtist) {
        // ✅ تحديث artistInputs
        artistInputs.value = artistArray.map(name => ({ 
          name: name, 
          isHovered: false,
          isSearching: false,
          isFocused: false,
          searchQuery: name
        }));
        previousValues.value.artist = artistArray.map(name => ({ name: name }));
        
        // ✅ إرسال التحديث فوراً
        debouncedSendUpdate();
        console.log('📤 [MitwirkendeContent] إرسال artist من onMounted:', artistArray);
      }
    }
    
    // ✅ إرسال البيانات الأخرى إذا كانت موجودة
    const hasOtherData =
      pLineInputs.value.some(i => i.name && i.name.trim() !== '') ||
      produzentInputs.value.some(i => i.name && i.name.trim() !== '') ||
      (isWeitereActive.value && weitereInputs.value.some(i => i.role && i.role.trim() !== '' && i.name && i.name.trim() !== '')) ||
      productionYearValid.value;
    
    if (hasOtherData) {
      debouncedSendUpdate();
      console.log('📤 [MitwirkendeContent] إرسال بيانات أخرى من onMounted');
    }
  });
});

// ✅ نُفرّغ أي حفظ مؤجّل عالق قبل مغادرة التاب أو تدميره. Infos1 يلفّ التابات بـ
//   <keep-alive> فالتبديل لا يُطلق onUnmounted بل onDeactivated فقط — وبدون التفريغ هنا
//   تُفقَد القيم المُلصَقة بسرعة إن انتقل المستخدم قبل انتهاء مهلة الـ debounce.
const flushPendingSave = () => {
  if (debouncedSendUpdate.flush) {
    debouncedSendUpdate.flush();
  } else if (debouncedSendUpdate.cancel) {
    debouncedSendUpdate.cancel();
    sendUpdate();
  }
  if (saveQueue.value.length > 0) {
    isSaving.value = false;
    processSaveQueue();
  }
};

onDeactivated(() => {
  console.log('💤 MitwirkendeContent: deactivated (keep-alive) → flush الحفظ المؤجّل');
  flushPendingSave();
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  window.removeEventListener('save-song-complete', handleSaveComplete);

  if (savingTimeout) {
    clearTimeout(savingTimeout);
    savingTimeout = null;
  }

  flushPendingSave();
});

defineExpose({
  isTabComplete
});
</script>

<style lang="scss" scoped>
.tab-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  align-self: stretch;
  width: 100%;
  flex: 1;
  min-height: 100%;
}

.frame1 {
  display: flex;
  align-items: flex-start;
  gap: 32px;
  align-self: stretch;
}

.frame{
  display: flex;
  align-items: start;
  gap: 32px;
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

/* ========== form-field (العامة) ========== */
.form-field {
  display: flex;
  align-items: center;
  gap: 2px;
  align-self: stretch;
  border-radius: 5px;
  width: 100%;
  position: relative;
}

.form-field .input-field {
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
.form-field .minus-icon {
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
  transition: opacity 0.3s ease-in-out;
  opacity: 0;
  z-index: 5;
}


.form-field-bottom .plus-icon,
.form-field-bottom .minus-icon{
  position: absolute;
  right: 78px;
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

.form-field .spacer{
   display: flex;
  width: 34px;
  height: 46px;
  padding: 9px 10px;
  align-items: center;
  border-radius: 5px;
  position: relative;
  cursor: pointer;
}

.form-field-bottom .spacer{
   display: flex;
  width: 36px;
  height: 46px;
  padding: 9px 10px;
  align-items: center;
  border-radius: 5px;
  position: relative;
  cursor: pointer;
  max-width: 40px;
}

.form-field .spacer-empty,
.form-field-bottom .spacer-empty {
  display: flex;
  width: 36px;
  height: 46px;
  padding: 9px 10px;
  align-items: center;
  border-radius: 5px;
  position: relative;
  flex-shrink: 0;
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

.form-field .spacer .play.visible{
  opacity: 1;
  right: -10px;
}

.form-field-bottom .spacer .play.visible {
    opacity: 1;
  right: -8px;
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

/* ========== top-line و btn-switch ========== */
.top-line {
  display: flex;
  height: 20.5px;
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

/* ========== Frame2 ========== */
.frame2 {
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: flex-start;
  gap: 8px;
  align-self: stretch;
  flex: 1;
  min-height: 100%;
  overflow: visible;
  scrollbar-width: none;
}

.weitere-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 100%;
  overflow: visible;
  width: 100%;
}

/* ========== list-of-roll ========== */
.list-of-roll {
  display: flex;
  width: 100%;
  gap: 10px;
  flex-direction: column;
  // overflow-y: auto;
  flex: 1;
  min-height: 0;
  scrollbar-width: none;
  padding-bottom: 10px;
  // padding-right: 4px;
  overflow-x: visible;
}

/* ========== form-field-bottom ========== */
.form-field-bottom {
  display: flex;
  align-items: center;
  gap: 2px;
  align-self: stretch;
  position: relative;
  flex-shrink: 0;
  overflow: visible;
  z-index: 1;
}

/* ========== combo-box ========== */
.combo-box {
  display: flex;
  align-items: center;
  position: relative;
  width: 350px;
  flex-shrink: 0;
}

.combo-box .custom-select {
  position: relative;
  flex: 1 0 0;
}

.combo-box .select-trigger {
  display: flex;
  padding: 12px 12px 12px 12px;
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
  width: 100%;
}

.combo-box .select-trigger:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.combo-box.has-checkmark .select-trigger {
  color: #FFF;
  padding-right: 40px;
}

/* حقل البحث داخل select-trigger */
.search-input-trigger {
  background: transparent;
  border: none;
  outline: none;
  color: #6A6C6D;
  font-family: Heebo;
  font-size: 20px;
  width: 100%;
  padding: 0;
  margin: 0;
  height: 46px;
  cursor: pointer;
  line-height: 46px;
}

.search-input-trigger::placeholder {
  color: #6A6C6D;
}

.search-input-trigger:focus {
  outline: none;
}

.select-trigger.selected .search-input-trigger {
  color: #FFF;
}

.search-input-trigger:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* dropdown */
.combo-box .dropdown {
  position: absolute;
  top: calc(100% + 2px);
  left: 0;
  right: 0;
  background: var(--primary, #1B1C20);
  border-radius: 5px;
  z-index: 9999;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  max-height: 200px;
  overflow-y: auto;
  width: 100%;
  scrollbar-width: none;
  min-width: 100%;
}

.combo-box .dropdown .option {
  padding: 10px 12px;
  color: #6A6C6D;
  font-family: Heebo;
  font-size: 20px;
  cursor: pointer;
  transition: background 0.2s ease;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.combo-box .dropdown .option:hover {
  color: #FFF;
}

.combo-box .dropdown .no-results {
  color: #6A6C6D;
  cursor: default;
  padding: 12px;
  text-align: center;
}

.combo-box .dropdown::-webkit-scrollbar {
  width: 4px;
}

.combo-box .dropdown::-webkit-scrollbar-track {
  background: transparent;
}

.combo-box .dropdown::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

/* checkmark داخل combo-box */
.combo-box .checkmark {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 5;
}

.combo-box .checkmark .icon-y {
  width: 18px;
}

.combo-box .checkmark .icon-select {
  width: 12px;
}

.combo-box:hover .icon-select {
  filter: brightness(0) invert(1);
}

/* ========== form-field-name ========== */
.form-field-name {
  display: flex;
  align-items: center;
  gap: 2px;
  flex: 1 0 0;
  position: relative;
  min-width: 0;
}

.form-field-name .input-field {
  display: flex;
  padding: 12px 40px 12px 12px;
  justify-content: space-between;
  align-items: center;
  border-radius: 5px;
  background: var(--primary, #1B1C20);
  outline: none;
  border: 0;
  color: #fff;
  font-family: Heebo;
  font-size: 20px;
  height: 46px;
  width: calc(100%);
  box-sizing: border-box;
  position: relative;
  min-width: 0;
  transition: all 0.3s ease;
}

/* عرض input-field بدون spacer (العرض الكامل) */
.form-field-name .input-field {
  border-radius: 0 5px 5px 0;
}

/* عند وجود spacer (has-spacer) */
.form-field-name.has-spacer .input-field {
  border-radius: 0 5px 5px 0;
  &:hover{
    border-radius: 5px 0 0 5px;
  }
}

/* عند وجود checkmark فقط */
.form-field-name.has-checkmark .input-field {
  padding-right: 40px;
}

/* عند وجود checkmark و spacer معاً */
.form-field-name.has-checkmark.has-spacer .input-field {
  padding-right: 40px;
  width: 100%;
}

/* icon داخل input-field (مثل checkmark) */
.form-field-name .checkmark {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 5;
  pointer-events: none;
}

.form-field-name .checkmark .icon-y {
  width: 18px;
}

/* spacer في form-field-name */
.form-field-name .spacer {
  display: flex;
  width: 34px;
  height: 46px;
  padding: 9px 10px;
  align-items: center;
  border-radius: 5px;
  position: relative;
  cursor: pointer;
  flex-shrink: 0;
  background: var(--primary, #1B1C20);
  border-radius: 0 5px 5px 0;
}

.form-field-name .spacer .play {
  display: flex;
  padding: 13px;
  align-items: center;
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  opacity: 0;
  border-radius: 5px;
  background: var(--primary, #1B1C20);
  transition: opacity 0.3s ease, right 0.3s ease;
}

.form-field-name .spacer .play.visible {
  opacity: 1;
  right: -2px;
}

.form-field-name .spacer .play .icon {
  width: 18px;
  height: 20px;
  flex-shrink: 0;
}

.form-field-name .spacer:hover .play .icon {
  filter: brightness(0) invert(1);
}

/* ========== أنماط البحث ========== */
.search-result {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  border-radius: 5px;
  background: var(--Main-Colors-Slate-Dark, #1B1C20);
  padding: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  max-height: 350px;
  overflow-y: scroll;
  scroll-behavior: smooth;
  scrollbar-width: none;
  animation: fadeIn 0.2s ease-in;
  visibility: visible;
  position: absolute;
  top: calc(100% + 2px);
  left: 0;
  right: 0;
  z-index: 100;
  /* width محذوفة لأنها ستُحدد ديناميكياً */
}

.search-loading {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  width: 100%;
  color: var(--Main-Colors-White, #FFF);
  font-family: Heebo;
  font-size: 16px;
}

.search-loading .spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-top-color: var(--Strawberry, #D15);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.loading-spinner {
  position: absolute;
  right: 45px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 5;
}

.loading-spinner .spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-top-color: var(--Strawberry, #D15);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.add-more {
  display: flex;
  justify-content: space-between;
  align-items: center;
  align-self: stretch;
  padding: 0px 0px 4px 7px;
  cursor: pointer;
}

.add-more:hover .p {
  color: #D15;
}

.add-more:hover .add-icon {
  background: var(--Main-Colors-Strawberry, #D15) !important;
}

.add-more .profile {
  display: flex;
  height: 32px;
  align-items: center;
  gap: 8px;
}

.add-more .profile .add-icon {
  display: flex;
  width: 20px;
  height: 20px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  aspect-ratio: 1/1;
  border-radius: 16px;
  background: #fff;
}

.add-more .profile .add-icon .icons {
  display: flex;
  padding: 1px;
  align-items: center;
  cursor: pointer;
}

.add-more .profile .add-icon .icons svg {
  width: 22px;
  height: 22px;
  aspect-ratio: 1/1;
  fill: var(--Main-Colors-White, #FFF);
}

.add-more .p {
  color: var(--Main-Colors-White, #FFF);
  font-family: Heebo;
  font-size: 18px;
  font-style: normal;
  font-weight: 300;
  line-height: 1;
}

.search-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  align-self: stretch;
  cursor: pointer;
  padding: 8px;
}

.search-item:hover .profile .p {
  color: #FFF;
  transform: translate(15px);
}

.search-item .profile {
  display: flex;
  height: 32px;
  align-items: center;
  gap: 8px;
  transition: right .3s ease;
}

.profile .profile-picture {
  width: 32px;
  height: 32px;
  aspect-ratio: 1/1;
  border-radius: 32px;
  background-size: cover;
  background-position: center;
}

.profile .p {
  color: var(--Main-Colors-Dove, #6A6C6D);
  font-family: Heebo;
  font-size: 18px;
  font-style: normal;
  font-weight: 400;
  line-height: 1;
  transition: .3s ease;
  cursor: pointer;
}

.search-item .platforms {
  display: flex;
  gap: 12px;
  align-items: center;
  min-width: 70px;
}

.platform-column {
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 28px;
}

.platform-icon-container {
  position: relative;
  display: inline-flex;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.platform-icon-container:hover {
  transform: scale(1);
}

.spotify-icon {
  width: 24px;
  height: 24px;
  aspect-ratio: 1/1;
  border-radius: 24px;
  background: url('/icon/spotify.png') lightgray 50% / cover no-repeat;
}

.apple-icon {
  width: 20px;
  height: 22px;
  aspect-ratio: 1/1;
  border-radius: 24px;
  background: #FFF;
  padding: 2px;
}

.platform-icon-placeholder {
  width: 24px;
  height: 24px;
  opacity: 0;
  pointer-events: none;
}

.line {
  width: 100%;
  height: 1px;
  background: var(--Main-Colors-Slate-Black, #0E0E10);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>