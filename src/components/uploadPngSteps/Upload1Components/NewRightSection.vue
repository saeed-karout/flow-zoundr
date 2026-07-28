<template>
    <div class="new-right" :class="{ 
        'slide-in': shouldShowAnimation,
        'slide-out': isLeaving 
    }">
        <!-- 🔥 عرض الـ loading مع ارتفاع ثابت -->
        <div v-if="isLoading" class="loading-spinner">
            <div class="spinner"></div>
            <span class="loading-text">Lade Daten...</span>
        </div>
        
        <!-- 🔥 عرض المحتوى مع v-show بدلاً من v-if -->
        <div v-show="!isLoading" class="content-wrapper">
            <div class="info">
                <div class="title">{{ artistInputs[0]?.searchQuery || 'Diggie' }}</div>
                <div class="subtitle">{{ searchQuery2 || 'Summer Feeling' }}</div>
                <div class="pill-state">
                    <div class="date">{{ selectedDate || '21/07/2025' }}</div>
                </div>
            </div>
            <div class="metas">
                <div class="row1">
                    <!-- Preis deines Releases -->
                    <div class="form">
                        <div class="form5">
                            <div class="title">Preis deines Releases?</div>
                            <div class="section-input"
                                :class="{ 
                                    'is-hovered': isHoveredReleasePrice || isReleasePriceDropdownOpen, 
                                    'has-checkmark': isReleasePriceSelected 
                                }"
                                @mouseenter="setHoverState('releasePrice', true)"
                                @mouseleave="setHoverState('releasePrice', false)">
                                <div class="custom-select" @click="toggleDropdown('releasePrice')">
                                    <div class="select-trigger" :class="{ 'selected': isReleasePriceSelected }">
                                        {{ displayReleasePrice || 'Preis auswählen' }}
                                    </div>
                                    <div class="dropdown" 
                                        v-show="isReleasePriceDropdownOpen"
                                        @mouseenter="setHoverState('releasePrice', true)"
                                        @mouseleave="setHoverState('releasePrice', false)">
                                        <div class="option" @click.stop="selectOption('releasePrice', '9,99 EUR')">9,99 EUR</div>
                                        <div class="option" @click.stop="selectOption('releasePrice', '12,99 EUR')">12,99 EUR</div>
                                        <div class="option" @click.stop="selectOption('releasePrice', '15,99 EUR')">15,99 EUR</div>
                                        <div class="option" @click.stop="selectOption('releasePrice', '17,99 EUR')">17,99 EUR</div>
                                        <div class="option" @click.stop="selectOption('releasePrice', '21,99 EUR')">21,99 EUR</div>
                                    </div>
                                </div>
                                <div v-if="isReleasePriceSelected" class="checkmark">
                                    <img src="../../../assets/icons/y.png" class="icon-y" alt="checkmark icon" />
                                </div>
                                <div v-else class="checkmark">
                                    <img src="/icon/icon-select.svg" class="icon-select" alt="select icon" />
                                </div>
                                <div class="spacer" @click="$emit('openVideoPopup', 'form5')">
                                    <div class="play" :class="{ visible: isHoveredReleasePrice || isReleasePriceDropdownOpen }">
                                        <img :src="iconPlay" class="icon" alt="play icon" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Preis pro Song -->
                    <div class="form">
                        <div class="form5">
                            <div class="title">Preis pro Song?</div>
                            <div class="section-input"
                                :class="{ 
                                    'is-hovered': isHoveredSongPrice || isSongPriceDropdownOpen, 
                                    'has-checkmark': isSongPriceSelected 
                                }"
                                @mouseenter="setHoverState('songPrice', true)"
                                @mouseleave="setHoverState('songPrice', false)">
                                <div class="custom-select" @click="toggleDropdown('songPrice')">
                                    <div class="select-trigger" :class="{ 'selected': isSongPriceSelected }">
                                        {{ displaySongPrice || 'Preis auswählen' }}
                                    </div>
                                    <div class="dropdown" 
                                        v-show="isSongPriceDropdownOpen"
                                        @mouseenter="setHoverState('songPrice', true)"
                                        @mouseleave="setHoverState('songPrice', false)">
                                        <div class="option" @click.stop="selectOption('songPrice', '1,99 EUR')">1,99 EUR</div>
                                        <div class="option" @click.stop="selectOption('songPrice', '2,99 EUR')">2,99 EUR</div>
                                        <div class="option" @click.stop="selectOption('songPrice', '3,99 EUR')">3,99 EUR</div>
                                    </div>
                                </div>
                                <div v-if="isSongPriceSelected" class="checkmark">
                                    <img src="../../../assets/icons/y.png" class="icon-y" alt="checkmark icon" />
                                </div>
                                <div v-else class="checkmark">
                                    <img src="/icon/icon-select.svg" class="icon-select" alt="select icon" />
                                </div>
                                <div class="spacer" @click="$emit('openVideoPopup', 'form6')">
                                    <div class="play" :class="{ visible: isHoveredSongPrice || isSongPriceDropdownOpen }">
                                        <img :src="iconPlay" class="icon" alt="play icon" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="row1">
                    <!-- Hauptgenre -->
                    <div class="form">
                        <div class="form5">
                            <div class="title">Hauptgenre?</div>
                            <div class="section-input"
                                :class="{ 
                                    'is-hovered': isHoveredMainGenre || isMainGenreDropdownOpen, 
                                    'has-checkmark': isMainGenreSelected 
                                }"
                                @mouseenter="setHoverState('mainGenre', true)"
                                @mouseleave="setHoverState('mainGenre', false)">
                                <div class="custom-select" @click="toggleDropdown('mainGenre')">
                                    <div class="select-trigger" :class="{ 'selected': isMainGenreSelected }">
                                        <input 
                                            type="text" 
                                            class="search-input-trigger" 
                                            v-model="mainGenreSearch" 
                                            :placeholder="localMainGenreDisplay || 'Hauptgenre'"
                                            @click.stop
                                            @input="filterMainGenres"
                                            @focus="handleMainGenreFocus"
                                            @blur="handleMainGenreBlur"
                                        />
                                    </div>
                                    <div class="dropdown" 
                                        v-show="isMainGenreDropdownOpen"
                                        @mouseenter="setHoverState('mainGenre', true)"
                                        @mouseleave="setHoverState('mainGenre', false)">
                                        <div class="option" 
                                            v-for="genre in filteredMainGenres" 
                                            :key="genre.id"
                                            @click.stop="selectMainGenre(genre)">
                                            {{ genre.name }}
                                        </div>
                                        <div v-if="filteredMainGenres.length === 0" class="option no-results">
                                            Keine Ergebnisse gefunden
                                        </div>
                                    </div>
                                </div>
                                <div v-if="isMainGenreSelected" class="checkmark">
                                    <img src="../../../assets/icons/y.png" class="icon-y" alt="checkmark icon" />
                                </div>
                                <div v-else class="checkmark">
                                    <img src="/icon/icon-select.svg" class="icon-select" alt="select icon" />
                                </div>
                                <div class="spacer" @click="$emit('openVideoPopup', 'form7')">
                                    <div class="play" :class="{ visible: isHoveredMainGenre || isMainGenreDropdownOpen }">
                                        <img :src="iconPlay" class="icon" alt="play icon" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Subgenre -->
                    <div class="form subgenre-wrapper" :class="{ 'disabled': !isSubGenreEnabled }">
                        <div class="form5">
                            <div class="title">
                                Subgenre?
                            </div>
                            <div class="section-input"
                                :class="{ 
                                    'is-hovered': isHoveredSubGenre || isSubGenreDropdownOpen, 
                                    'has-checkmark': isSubGenreSelected,
                                    'no-subgenres': !hasSubGenres && isSubGenreEnabled
                                }"
                                @mouseenter="setHoverState('subGenre', true)"
                                @mouseleave="setHoverState('subGenre', false)">
                                
                                <div v-if="!hasSubGenres && isSubGenreEnabled" class="no-subgenres-message">
                                    <span class="message-text">Nicht verfügbar</span>
                                </div>
                                
                                <div v-else class="custom-select" @click="toggleDropdown('subGenre', isSubGenreEnabled)">
                                    <div class="select-trigger" 
                                        :class="{ 'selected': isSubGenreSelected, 'disabled': !isSubGenreEnabled }">
                                        <input 
                                            type="text" 
                                            class="search-input-trigger" 
                                            v-model="subGenreSearch" 
                                            :placeholder="localSubGenreDisplay || 'Subgenre suchen...'"
                                            :disabled="!isSubGenreEnabled"
                                            @click.stop
                                            @input="filterSubGenres"
                                            @focus="handleSubGenreFocus"
                                            @blur="handleSubGenreBlur"
                                        />
                                    </div>
                                    <div class="dropdown" 
                                        v-show="isSubGenreDropdownOpen && isSubGenreEnabled && hasSubGenres"
                                        @mouseenter="setHoverState('subGenre', true)"
                                        @mouseleave="setHoverState('subGenre', false)">
                                        <div class="option" 
                                            v-for="subGenre in filteredSubGenres" 
                                            :key="subGenre.id"
                                            @click.stop="selectSubGenre(subGenre)">
                                            {{ subGenre.genre_name }}
                                        </div>
                                        <div v-if="filteredSubGenres.length === 0" class="option no-results">
                                            Keine Ergebnisse gefunden
                                        </div>
                                    </div>
                                </div>
                                
                                <div v-if="isSubGenreSelected" class="checkmark">
                                    <img src="../../../assets/icons/y.png" class="icon-y" alt="checkmark icon" />
                                </div>
                                <div v-else-if="hasSubGenres && isSubGenreEnabled" class="checkmark">
                                    <img src="/icon/icon-select.svg" class="icon-select" alt="select icon" />
                                </div>
                                
                                <div class="spacer" @click="$emit('openVideoPopup', 'form8')">
                                    <div class="play" :class="{ visible: (isHoveredSubGenre || isSubGenreDropdownOpen) && isSubGenreEnabled }">
                                        <img :src="iconPlay" class="icon" alt="play icon" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, ref, watch, onMounted, onUnmounted, nextTick } from 'vue';
import iconPlay from '@/assets/icons/play.png';
import apiRequest from '@/lib/apiRequest';

// ========== Props ==========
const props = defineProps({
    releasePrice: { type: Number, default: null },
    songPrice: { type: Number, default: null },
    mainGenre: { type: String, default: '' },
    subGenre: { type: String, default: '' },
    isReleasePriceSelected: { type: Boolean, default: false },
    isSongPriceSelected: { type: Boolean, default: false },
    isMainGenreSelected: { type: Boolean, default: false },
    isSubGenreSelected: { type: Boolean, default: false },
    isHoveredReleasePrice: { type: Boolean, default: false },
    isHoveredSongPrice: { type: Boolean, default: false },
    isHoveredMainGenre: { type: Boolean, default: false },
    isHoveredSubGenre: { type: Boolean, default: false },
    artistInputs: { type: Array, required: true },
    searchQuery2: { type: String, default: '' },
    selectedDate: { type: String, default: null },
    iconPlay: { type: String, required: true },
    isSlidingIn: { type: Boolean, default: true },
    isLeaving: { type: Boolean, default: false }
});

const emit = defineEmits([
    'update:releasePrice', 'update:songPrice', 'update:mainGenre', 'update:subGenre',
    'update:isReleasePriceSelected', 'update:isSongPriceSelected', 'update:isMainGenreSelected',
    'update:isSubGenreSelected', 'update:isHoveredReleasePrice', 'update:isHoveredSongPrice',
    'update:isHoveredMainGenre', 'update:isHoveredSubGenre',
    'update:hasSubGenres',
    'openVideoPopup'
]);

// ========== بيانات الـ API ==========
const genresMap = ref({});
const genresList = ref([]);
const subGenresList = ref([]);
const isLoading = ref(true);
const loadError = ref(null);
const isDataLoaded = ref(false);

// ========== 🔥 التحكم في الأنيميشن ==========
const shouldShowAnimation = ref(false);

// ========== بحث الأنواع ==========
const mainGenreSearch = ref('');
const subGenreSearch = ref('');

// ========== الأنواع المفلترة ==========
const filteredMainGenres = computed(() => {
    if (!mainGenreSearch.value) return genresList.value;
    const query = mainGenreSearch.value.toLowerCase();
    return genresList.value.filter(genre => 
        genre.name.toLowerCase().includes(query) || 
        genre.id.toLowerCase().includes(query)
    );
});

const filteredSubGenres = computed(() => {
    if (!subGenreSearch.value) return subGenresList.value;
    const query = subGenreSearch.value.toLowerCase();
    return subGenresList.value.filter(subGenre => 
        subGenre.genre_name.toLowerCase().includes(query)
    );
});

// ========== دوال التصفية ==========
const filterMainGenres = () => {};
const filterSubGenres = () => {};

// حالات القوائم المنسدلة
const isReleasePriceDropdownOpen = ref(false);
const isSongPriceDropdownOpen = ref(false);
const isMainGenreDropdownOpen = ref(false);
const isSubGenreDropdownOpen = ref(false);

// ========== حالات الـ hover الموحدة ==========
const hoverStates = ref({
    releasePrice: false,
    songPrice: false,
    mainGenre: false,
    subGenre: false
});

// ========== دالة تعيين حالة الـ hover ==========
const setHoverState = (field, value) => {
    hoverStates.value[field] = value;
    
    const emitMap = {
        releasePrice: 'update:isHoveredReleasePrice',
        songPrice: 'update:isHoveredSongPrice',
        mainGenre: 'update:isHoveredMainGenre',
        subGenre: 'update:isHoveredSubGenre'
    };
    
    if (emitMap[field]) {
        emit(emitMap[field], value);
    }
};

// ========== 🔥 دوال معالجة الـ Focus و Blur (المعدلة) ==========
const handleMainGenreFocus = () => {
    isMainGenreDropdownOpen.value = true;
};

const handleMainGenreBlur = () => {
    // 🔥 استخدام window.setTimeout بدلاً من setTimeout مباشرة
    window.setTimeout(() => {
        isMainGenreDropdownOpen.value = false;
    }, 300);
};

const handleSubGenreFocus = () => {
    if (isSubGenreEnabled.value && hasSubGenres.value) {
        isSubGenreDropdownOpen.value = true;
    }
};

const handleSubGenreBlur = () => {
    // 🔥 استخدام window.setTimeout بدلاً من setTimeout مباشرة
    window.setTimeout(() => {
        isSubGenreDropdownOpen.value = false;
    }, 300);
};

// ========== Computed ==========

const hasSubGenres = computed(() => {
    return subGenresList.value && subGenresList.value.length > 0;
});

const isSubGenreEnabled = computed(() => {
    if (props.mainGenre && props.mainGenre.trim() !== '') {
        return true;
    }
    return false;
});

// عرض القيم مع EUR
const displayReleasePrice = computed(() => {
    if (props.releasePrice === null || props.releasePrice === undefined) return '';
    return new Intl.NumberFormat('de-DE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(props.releasePrice) + ' EUR';
});

const displaySongPrice = computed(() => {
    if (props.songPrice === null || props.songPrice === undefined) return '';
    return new Intl.NumberFormat('de-DE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(props.songPrice) + ' EUR';
});

const localMainGenreDisplay = computed(() => {
    if (!props.mainGenre) return '';
    return props.mainGenre;
});

const localSubGenreDisplay = computed(() => {
    if (!props.subGenre) return '';
    return props.subGenre;
});

// ========== دوال اختيار القيم ==========

const toggleDropdown = (field, isEnabled = true) => {
    if (field === 'subGenre' && (!isEnabled || !hasSubGenres.value)) return;

    // إغلاق جميع القوائم المنسدلة الأخرى
    isReleasePriceDropdownOpen.value = false;
    isSongPriceDropdownOpen.value = false;
    isMainGenreDropdownOpen.value = false;
    isSubGenreDropdownOpen.value = false;
    
    // فتح القائمة المطلوبة
    if (field === 'releasePrice') {
        isReleasePriceDropdownOpen.value = true;
    } else if (field === 'songPrice') {
        isSongPriceDropdownOpen.value = true;
    } else if (field === 'mainGenre') {
        isMainGenreDropdownOpen.value = true;
        mainGenreSearch.value = '';
    } else if (field === 'subGenre') {
        isSubGenreDropdownOpen.value = true;
        subGenreSearch.value = '';
    }
};

const selectOption = (field, value) => {
    if (field === 'releasePrice') {
        const numericValue = parseFloat(value.replace(' EUR', '').replace(',', '.'));
        emit('update:releasePrice', numericValue);
        emit('update:isReleasePriceSelected', true);
        isReleasePriceDropdownOpen.value = false;
        console.log('💰 Release Price selected:', numericValue);
    } else if (field === 'songPrice') {
        const numericValue = parseFloat(value.replace(' EUR', '').replace(',', '.'));
        emit('update:songPrice', numericValue);
        emit('update:isSongPriceSelected', true);
        isSongPriceDropdownOpen.value = false;
        console.log('💰 Song Price selected:', numericValue);
    }
};

const selectMainGenre = (genre) => {
    console.log('🔄 Main genre selected:', genre.name, 'ID:', genre.id);
    
    mainGenreSearch.value = genre.name;
    emit('update:mainGenre', genre.name);
    emit('update:isMainGenreSelected', true);
    emit('update:subGenre', '');
    emit('update:isSubGenreSelected', false);
    isMainGenreDropdownOpen.value = false;
    
    fetchSubGenres(genre.id);
};

const selectSubGenre = (subGenre) => {
    console.log('🔄 Sub genre selected:', subGenre.genre_name);
    
    subGenreSearch.value = subGenre.genre_name;
    emit('update:subGenre', subGenre.genre_name);
    emit('update:isSubGenreSelected', true);
    isSubGenreDropdownOpen.value = false;
};

// ========== جلب البيانات من الـ API ==========

const fetchGenres = async () => {
    isLoading.value = true;
    try {
        const response = await apiRequest.get('/genres');
        console.log('📦 Genres API Response:', response.data);
        
        const data = response.data;
        
        if (data && typeof data === 'object' && !Array.isArray(data)) {
            genresMap.value = data;
            genresList.value = Object.entries(data).map(([id, name]) => ({
                id: id,
                name: name
            }));
            genresList.value.sort((a, b) => a.name.localeCompare(b.name));
            console.log(`✅ Loaded ${genresList.value.length} genres`);
        } else {
            console.warn('⚠️ Unexpected data format from /genres:', data);
            genresMap.value = {};
            genresList.value = [];
        }
        
    } catch (error) {
        console.error('❌ Error fetching genres:', error);
        loadError.value = error.message;
        genresMap.value = {};
        genresList.value = [];
    } finally {
        isLoading.value = false;
        isDataLoaded.value = true;
        console.log('✅ Data loaded');
        
        // 🔥 بدء الأنيميشن بعد تحميل البيانات
        nextTick(() => {
            shouldShowAnimation.value = true;
            console.log('🎬 Animation started');
        });
    }
};

const fetchSubGenres = async (genreId) => {
    console.log('🔍 fetchSubGenres called with genreId:', genreId);
    
    if (!genreId) {
        subGenresList.value = [];
        emit('update:hasSubGenres', false);
        console.log('📤 Emitting hasSubGenres: false (no genreId)');
        return;
    }
    
    try {
        const response = await apiRequest.get(`/subgenres?genre_id=${genreId}`);
        console.log(`📦 Subgenres for ${genreId}:`, response.data);
        
        if (Array.isArray(response.data)) {
            subGenresList.value = response.data;
            const hasSubGenres = response.data.length > 0;
            emit('update:hasSubGenres', hasSubGenres);
            console.log(`📤 Emitting hasSubGenres: ${hasSubGenres} (${subGenresList.value.length} subgenres)`);
            
            if (!hasSubGenres) {
                console.log('📤 No subgenres found, auto-selecting...');
                emit('update:isSubGenreSelected', true);
                emit('update:subGenre', '');
                subGenreSearch.value = '';
            } else {
                emit('update:isSubGenreSelected', false);
                emit('update:subGenre', '');
                subGenreSearch.value = '';
            }
        } else {
            console.warn(`⚠️ Unexpected subgenres data format:`, response.data);
            subGenresList.value = [];
            emit('update:hasSubGenres', false);
        }
        
    } catch (error) {
        console.error(`❌ Error fetching subgenres for ${genreId}:`, error);
        subGenresList.value = [];
        emit('update:hasSubGenres', false);
    }
};

// ========== مراقبة التغييرات من المكون الأب ==========
watch(() => props.mainGenre, (newVal) => {
    if (newVal && newVal.trim() !== '') {
        mainGenreSearch.value = newVal;
    } else {
        mainGenreSearch.value = '';
    }
}, { immediate: true });

watch(() => props.subGenre, (newVal) => {
    if (newVal && newVal.trim() !== '') {
        subGenreSearch.value = newVal;
    } else {
        subGenreSearch.value = '';
    }
}, { immediate: true });

// ========== إغلاق القوائم عند النقر خارجها ==========
const handleClickOutside = (event) => {
    const target = event.target;
    if (!target.closest('.custom-select')) {
        isReleasePriceDropdownOpen.value = false;
        isSongPriceDropdownOpen.value = false;
        isMainGenreDropdownOpen.value = false;
        isSubGenreDropdownOpen.value = false;
        
        // إعادة تعيين حالات الـ hover عند الإغلاق
        hoverStates.value.releasePrice = false;
        hoverStates.value.songPrice = false;
        hoverStates.value.mainGenre = false;
        hoverStates.value.subGenre = false;
    }
};

// ========== مراقبة تغييرات mainGenreSearch (حذف القيم) ==========
watch(mainGenreSearch, (newVal, oldVal) => {
    if (!newVal || newVal.trim() === '') {
        emit('update:mainGenre', '');
        emit('update:isMainGenreSelected', false);
        emit('update:subGenre', '');
        emit('update:isSubGenreSelected', false);
        subGenresList.value = [];
        emit('update:hasSubGenres', false);
        console.log('🗑️ Main genre cleared');
    }
}, { immediate: true });

// ========== مراقبة تغييرات subGenreSearch (حذف القيم) ==========
watch(subGenreSearch, (newVal) => {
    if (!newVal || newVal.trim() === '') {
        emit('update:subGenre', '');
        emit('update:isSubGenreSelected', false);
        console.log('🗑️ Subgenre cleared');
    }
}, { immediate: true });

// ========== Lifecycle ==========
onMounted(() => {
    console.log('🚀 NewRightSection mounted, starting data fetch...');
    
    // 🔥 تحميل البيانات
    fetchGenres();
    document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
});

// ========== مراقبة تغييرات isSlidingIn و isLeaving ==========
watch(() => props.isSlidingIn, (newVal) => {
    console.log('🔄 NewRightSection isSlidingIn changed:', newVal);
}, { immediate: true });

watch(() => props.isLeaving, (newVal) => {
    console.log('🔄 NewRightSection isLeaving changed:', newVal);
}, { immediate: true });
</script>

<style lang="scss" scoped>
.new-right {
    display: flex;
    padding-top: 28px;
    flex-direction: column;
    align-items: flex-start;
    gap: 32px;
    flex-grow: 1;
    min-height: 500px;
    
    /* 🔥 الأنيميشن مخفي في البداية */
    transform: translateY(30px);
    opacity: 0;
    transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 🔥 عند تفعيل الأنيميشن */
.new-right.slide-in {
    transform: translateY(0);
    opacity: 1;
}

.new-right.slide-out {
    transform: translateY(-30px);
    opacity: 0;
}

/* ===== مؤشر التحميل ===== */
.loading-spinner {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 100%;
    min-height: 400px;
    gap: 20px;
}

.loading-spinner .spinner {
    width: 50px;
    height: 50px;
    border: 4px solid rgba(255, 255, 255, 0.1);
    border-top-color: var(--Strawberry, #D15);
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

.loading-spinner .loading-text {
    color: var(--Main-Colors-Dove, #6A6C6D);
    font-family: Heebo;
    font-size: 18px;
    font-weight: 300;
    letter-spacing: 0.5px;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

/* ===== حاوية المحتوى ===== */
.content-wrapper {
    width: 100%;
    height: 100%;
}

/* ===== باقي الأنماط ===== */
.new-right .info {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 24px;
}

.new-right .info .title {
    color: #FFF;
    font-family: Heebo;
    font-size: 58px;
    font-style: normal;
    font-weight: 700;
    line-height: 0.8;
    text-transform: uppercase;
}

.new-right .info .subtitle {
    color: #FFF;
    font-family: Heebo;
    font-size: 40px;
    font-style: normal;
    font-weight: 700;
    line-height: 0.8;
}

.new-right .info .pill-state {
    display: flex;
    height: 28px;
    padding: 0 8px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    border-radius: 12px;
    background: var(--Strawberry, #D15);
}

.pill-state .date {
    color: var(--Main-Colors-White, #FFF);
    font-family: Heebo;
    font-size: 20px;
    font-style: normal;
    font-weight: 700;
    line-height: 1;
}

.metas {
    display: flex;
    padding-left: 126px;
    flex-direction: column;
    align-items: flex-start;
    gap: 32px;
    align-self: stretch;
}

.metas .row1 {
    display: flex;
    align-items: flex-start;
    gap: 20px;
    align-self: stretch;
}

.metas .row1 .form {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 8px;
    flex: 1 0 0;
    max-width: 100%;
}

.metas .row1 .form .title {
    color: var(--Main-Colors-White, #FFF);
    font-family: Heebo;
    font-size: 14px;
    font-style: normal;
    font-weight: 300;
    line-height: 1;
    letter-spacing: 0.7px;
    text-transform: uppercase;
}

.optional-badge {
    color: var(--Main-Colors-Dove, #6A6C6D);
    font-size: 12px;
    font-weight: 300;
    margin-left: 4px;
}

.subgenre-wrapper.disabled {
    opacity: 0.5;
    pointer-events: none;
}

.select-trigger.disabled {
    cursor: not-allowed;
    color: #6A6C6D;
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
    position: relative;
}

.search-input-trigger {
    width: 100%;
    background: transparent;
    border: none;
    outline: none;
    color: #FFF;
    font-family: Heebo;
    font-size: 20px;
    padding: 0;
    margin: 0;
    
    &::placeholder {
        color: #6A6C6D;
    }
    
    &:focus {
        outline: none;
    }
    
    &:disabled {
        color: #6A6C6D;
        cursor: not-allowed;
    }
}

.select-trigger.selected {
    color: #FFF;
}

.select-trigger.selected .search-input-trigger {
    color: #FFF;
}

.form5 {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 8px;
    align-self: stretch;
}

.section-input {
    display: flex;
    align-items: center;
    gap: 2px;
    align-self: stretch;
    border-radius: 5px;
    width: 100%;
    position: relative;
}

.section-input.no-subgenres {
    opacity: 0.7;
}

.no-subgenres-message {
    display: flex;
    padding: 12px;
    align-items: center;
    border-radius: 5px;
    background: var(--primary);
    color: var(--Main-Colors-Dove, #6A6C6D);
    font-family: Heebo;
    font-size: 16px;
    font-weight: 300;
    height: 46px;
    max-width: 100%;
    box-sizing: border-box;
    flex: 1;
}

.no-subgenres-message .message-text {
    color: var(--Main-Colors-Dove, #6A6C6D);
    font-size: 18px;
}

.custom-select {
    position: relative;
    flex: 1 0 0;
}

.section-input.has-checkmark .select-trigger {
    padding-right: 94px;
}

.dropdown {
    position: absolute;
    top: calc(100% + 2px);
    left: 0;
    right: 0;
    background: var(--primary);
    border-radius: 5px;
    z-index: 100;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
    max-height: 260px;
    overflow-y: auto;
    width: calc(100% + 46px);
    scrollbar-width: none;
}

.dropdown::-webkit-scrollbar {
    display: none;
}

.dropdown .option {
    padding: 10px 12px;
    color: var(--Main-Colors-Dove);
    font-family: Heebo;
    font-size: 20px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.dropdown .option:hover {
    color: var(--Main-Colors-White, #FFF);
}

.dropdown .option.no-results {
    color: var(--Main-Colors-Dove, #6A6C6D);
    cursor: default;
    text-align: center;
    font-style: italic;
}

.dropdown .option.no-results:hover {
    background: transparent;
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
    right: 22px;
}

.section-input .checkmark .icon-select {
    position: relative;
    right: 22px;
}

.section-input:hover .icon-select {
    filter: brightness(0) invert(1);
}

.section-input .spacer {
    display: flex;
    width: 42px;
    height: 46px;
    padding: 9px 10px;
    align-items: center;
    border-radius: 5px;
    position: relative;
    cursor: pointer;
    flex-shrink: 0;
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

.section-input .spacer .play.visible {
    right: -2px;
    opacity: 1;
}

.section-input .spacer .play .icon {
    width: 18px;
    flex-shrink: 0;
    aspect-ratio: 9/10;
}

.section-input .spacer:hover .icon {
    filter: brightness(0) invert(1);
}

@media (max-width:1599px) {
    .new-right .info .title{
        font-size: 48px;
    }
    .new-right .info .subtitle{
        font-size: 32px;
    }
    .new-right .info{
        gap: 16px;
    }
}

@media (min-width:1600px) and (max-width:2074px) {
    .new-right .info .title{
        font-size: 58px;
    }
}

@media (min-width:2075px) and (max-width:2560px) {
    .new-right .info .title{
        font-size: 58px;
    }
}
</style>