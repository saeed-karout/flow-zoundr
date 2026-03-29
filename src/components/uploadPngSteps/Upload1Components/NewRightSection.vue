<template>
    <div class="new-right" :class="{ 'slide-in': true }">
        <div v-if="isLoading" class="loading-spinner">
            <div class="spinner"></div>
        </div>
        
        <template v-else>
            <div class="info">
                <div class="title">{{ artistInputs[0]?.searchQuery || 'Diggie' }}</div>
                <div class="subtitle">{{ searchQuery2 || 'Summer Feeling' }}</div>
                <div class="pill-state">
                    <div class="date">{{ selectedDate || '21/07/2025' }}</div>
                </div>
            </div>
            <div class="metas">
                <div class="row1">
                    <div class="form">
                        <div class="form5">
                            <div class="title">Preis deines Releases?</div>
                            <div class="section-input"
                                :class="{ 'is-hovered': isHoveredReleasePrice, 'has-checkmark': isReleasePriceSelected }"
                                @mouseenter="$emit('update:isHoveredReleasePrice', true)"
                                @mouseleave="$emit('update:isHoveredReleasePrice', false)">
                                <div class="custom-select" @click="toggleDropdown('releasePrice')">
                                    <div class="select-trigger" :class="{ 'selected': isReleasePriceSelected }">
                                        {{ localReleasePrice || 'Preis auswählen' }}
                                    </div>
                                    <div class="dropdown" v-show="isReleasePriceDropdownOpen">
                                        <div class="option" @click.stop="selectOption('releasePrice', '9,99 EUR')">9,99 EUR</div>
                                        <div class="option" @click.stop="selectOption('releasePrice', '12,99 EUR')">12,99 EUR</div>
                                        <div class="option" @click.stop="selectOption('releasePrice', '15,99 EUR')">15,99 EUR</div>
                                    </div>
                                </div>
                                <div v-if="isReleasePriceSelected" class="checkmark">
                                    <img src="../../../assets/icons/y.png" class="icon-y" alt="checkmark icon" />
                                </div>
                                <div v-else class="checkmark">
                                    <img src="/icon/icon-select.svg" class="icon-select" alt="select icon" />
                                </div>
                                <div class="spacer" @click="$emit('openVideoPopup', 'form5')">
                                    <div class="play" :class="{ visible: isHoveredReleasePrice }">
                                        <img :src="iconPlay" class="icon" alt="play icon" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="form">
                        <div class="form5">
                            <div class="title">Preis pro Song?</div>
                            <div class="section-input"
                                :class="{ 'is-hovered': isHoveredSongPrice, 'has-checkmark': isSongPriceSelected }"
                                @mouseenter="$emit('update:isHoveredSongPrice', true)"
                                @mouseleave="$emit('update:isHoveredSongPrice', false)">
                                <div class="custom-select" @click="toggleDropdown('songPrice')">
                                    <div class="select-trigger" :class="{ 'selected': isSongPriceSelected }">
                                        {{ localSongPrice || 'Preis auswählen' }}
                                    </div>
                                    <div class="dropdown" v-show="isSongPriceDropdownOpen">
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
                                    <div class="play" :class="{ visible: isHoveredSongPrice }">
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
        <div class="search-box-container">
            <div class="section-input search-mode"
                :class="{ 
                    'is-hovered': isHoveredMainGenre, 
                    'has-checkmark': isMainGenreSelected,
                    'is-focused': isMainGenreFocused
                }"
                @mouseenter="isHoveredMainGenre = true"
                @mouseleave="isHoveredMainGenre = false">
                <input 
                    type="text" 
                    class="input-field" 
                    v-model="mainGenreSearch"
                    placeholder="Hauptgenre suchen..."
                    @focus="isMainGenreFocused = true; isMainGenreDropdownOpen = true"
                    @blur="handleMainGenreBlur"
                    @input="handleMainGenreInput"
                />
                <div v-if="isMainGenreSelected" class="checkmark">
                    <img src="../../../assets/icons/y.png" class="icon-y" alt="checkmark icon" />
                </div>
                <div v-else class="checkmark">
                    <img src="/icon/icon-select.svg" class="icon-select" alt="select icon" />
                </div>
                <div class="spacer" @click="$emit('openVideoPopup', 'form7')">
                    <div class="play" :class="{ visible: isHoveredMainGenre || isMainGenreFocused }">
                        <img :src="iconPlay" class="icon" alt="play icon" />
                    </div>
                </div>
            </div>
            
            <!-- نتائج البحث للأنواع الرئيسية -->
            <div v-if="isMainGenreDropdownOpen && filteredMainGenres.length > 0" class="search-results">
                <div v-for="genre in filteredMainGenres" 
                     :key="genre.id" 
                     class="search-result-item"
                     @mousedown.prevent="selectMainGenre(genre)">
                    {{ genre.genre_name }}
                </div>
            </div>
            <div v-else-if="isMainGenreDropdownOpen && mainGenreSearch && filteredMainGenres.length === 0" class="search-results no-results">
                Keine Ergebnisse
            </div>
        </div>
    </div>
</div>

<!-- Subgenre -->
<div class="form">
    <div class="form5">
        <div class="title">Subgenre?</div>
        <div class="search-box-container">
            <div class="section-input search-mode"
                :class="{ 
                    'is-hovered': isHoveredSubGenre, 
                    'has-checkmark': isSubGenreSelected,
                    'is-focused': isSubGenreFocused,
                    'disabled': !isSubGenreEnabled
                }"
                :style="{ opacity: isSubGenreEnabled ? 1 : 0.5 }"
                @mouseenter="isHoveredSubGenre = true"
                @mouseleave="isHoveredSubGenre = false">
                <input 
                    type="text" 
                    class="input-field" 
                    v-model="subGenreSearch"
                    placeholder="Subgenre suchen..."
                    @focus="isSubGenreFocused = true; isSubGenreDropdownOpen = true"
                    @blur="handleSubGenreBlur"
                    @input="handleSubGenreInput"
                    :disabled="!isSubGenreEnabled"
                />
                <div v-if="isSubGenreSelected" class="checkmark">
                    <img src="../../../assets/icons/y.png" class="icon-y" alt="checkmark icon" />
                </div>
                <div v-else class="checkmark">
                    <img src="/icon/icon-select.svg" class="icon-select" alt="select icon" />
                </div>
                <div class="spacer" @click="$emit('openVideoPopup', 'form8')">
                    <div class="play" :class="{ visible: (isHoveredSubGenre || isSubGenreFocused) && isSubGenreEnabled }">
                        <img :src="iconPlay" class="icon" alt="play icon" />
                    </div>
                </div>
            </div>
            
            <!-- نتائج البحث للأنواع الفرعية -->
            <div v-if="isSubGenreDropdownOpen && isSubGenreEnabled && filteredSubGenresWithSearch.length > 0" class="search-results">
                <div v-for="subGenre in filteredSubGenresWithSearch" 
                     :key="subGenre.id" 
                     class="search-result-item"
                     @mousedown.prevent="selectSubGenre(subGenre)">
                    {{ subGenre.genre_name }}
                </div>
            </div>
            <div v-else-if="isSubGenreDropdownOpen && isSubGenreEnabled && subGenreSearch && filteredSubGenresWithSearch.length === 0" class="search-results no-results">
                Keine Ergebnisse
            </div>
        </div>
    </div>
</div>
                </div>
            </div>
        </template>
    </div>
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue';
import iconPlay from '@/assets/icons/play.png';
import generalDataService from '@/services/generalData';

const props = defineProps({
    releasePrice: { type: String, default: '' },
    songPrice: { type: String, default: '' },
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
    iconPlay: { type: String, required: true }
});

const emit = defineEmits([
    'update:releasePrice', 'update:songPrice', 'update:mainGenre', 'update:subGenre',
    'update:isReleasePriceSelected', 'update:isSongPriceSelected', 'update:isMainGenreSelected',
    'update:isSubGenreSelected', 'update:isHoveredReleasePrice', 'update:isHoveredSongPrice',
    'update:isHoveredMainGenre', 'update:isHoveredSubGenre', 'update:isSubGenreEnabled',
    'openVideoPopup'
]);

// ========== بيانات الـ API ==========
const genres = ref([]);           // جميع الأنواع
const isLoading = ref(false);
const loadError = ref(null);

// حالات القوائم المنسدلة
const isReleasePriceDropdownOpen = ref(false);
const isSongPriceDropdownOpen = ref(false);
const isMainGenreDropdownOpen = ref(false);
const isSubGenreDropdownOpen = ref(false);

// حالات التركيز
const isMainGenreFocused = ref(false);
const isSubGenreFocused = ref(false);
const isHoveredSubGenre = ref(false);

// متغيرات البحث
const mainGenreSearch = ref('');
const subGenreSearch = ref('');

// ========== دوال معالجة البحث ==========
const handleMainGenreBlur = () => {
    setTimeout(() => {
        isMainGenreFocused.value = false;
        isMainGenreDropdownOpen.value = false;
    }, 200);
};

const handleSubGenreBlur = () => {
    setTimeout(() => {
        isSubGenreFocused.value = false;
        isSubGenreDropdownOpen.value = false;
    }, 200);
};

const handleMainGenreInput = () => {
    isMainGenreDropdownOpen.value = true;
};

const handleSubGenreInput = () => {
    isSubGenreDropdownOpen.value = true;
};

const selectMainGenre = (genre) => {
    mainGenreSearch.value = genre.genre_name;
    localMainGenre.value = genre.genre_name;
    emit('update:isMainGenreSelected', true);
    isMainGenreDropdownOpen.value = false;
    isMainGenreFocused.value = false;
    
    // إعادة تعيين Subgenre
    subGenreSearch.value = '';
    localSubGenre.value = '';
    emit('update:isSubGenreSelected', false);
    
    console.log('🔄 Main genre selected:', genre.genre_name);
};

const selectSubGenre = (subGenre) => {
    subGenreSearch.value = subGenre.genre_name;
    localSubGenre.value = subGenre.genre_name;
    emit('update:isSubGenreSelected', true);
    isSubGenreDropdownOpen.value = false;
    isSubGenreFocused.value = false;
};

// ========== معالجة الأنواع ==========

// جميع الأنواع الرئيسية (كل الأنواع)
const mainGenres = computed(() => {
    return genres.value;
});

// توليد أنواع فرعية افتراضية من الأنواع الرئيسية
const generateSubGenres = (mainGenreName) => {
    // كلمات مفتاحية للأنواع الفرعية الشائعة
    const subGenreKeywords = [
        'Rock', 'Pop', 'Metal', 'Jazz', 'Blues', 'Folk', 'Electronic',
        'Hip Hop', 'R&B', 'Soul', 'Funk', 'Disco', 'House', 'Techno',
        'Trance', 'Dubstep', 'Ambient', 'Classical', 'Country', 'Reggae',
        'Ska', 'Punk', 'Hardcore', 'Grunge', 'Alternative', 'Indie',
        'Experimental', 'Avant-Garde', 'World', 'Latin', 'Bossa Nova',
        'Samba', 'Tango', 'Flamenco', 'Gospel', 'Christian', 'Holiday',
        'Children', 'Comedy', 'Spoken Word', 'Audiobook', 'Podcast'
    ];
    
    // إنشاء 5-8 أنواع فرعية عشوائية
    const count = 5 + Math.floor(Math.random() * 4);
    const subGenres = [];
    
    for (let i = 0; i < count; i++) {
        const keyword = subGenreKeywords[Math.floor(Math.random() * subGenreKeywords.length)];
        subGenres.push({
            id: `sub-${mainGenreName}-${i}`,
            genre_name: `${mainGenreName} ${keyword}`,
            parent_genre_name: mainGenreName
        });
    }
    
    // إضافة بعض الأنواع الفرعية الشائعة
    const commonSubs = [
        `${mainGenreName} Classics`,
        `${mainGenreName} Modern`,
        `${mainGenreName} Underground`,
        `Contemporary ${mainGenreName}`,
        `Traditional ${mainGenreName}`
    ];
    
    return [...subGenres, ...commonSubs.map((name, i) => ({
        id: `common-${mainGenreName}-${i}`,
        genre_name: name,
        parent_genre_name: mainGenreName
    }))];
};

// خريطة لتخزين الأنواع الفرعية المولدة لكل نوع رئيسي
const generatedSubGenresMap = ref(new Map());

// الحصول على الأنواع الفرعية لنوع رئيسي معين
const getSubGenresForMain = (mainGenreName) => {
    if (!mainGenreName) return [];
    
    // إذا كانت الأنواع الفرعية موجودة مسبقاً، استخدمها
    if (generatedSubGenresMap.value.has(mainGenreName)) {
        return generatedSubGenresMap.value.get(mainGenreName);
    }
    
    // وإلا، قم بتوليدها
    const newSubGenres = generateSubGenres(mainGenreName);
    generatedSubGenresMap.value.set(mainGenreName, newSubGenres);
    return newSubGenres;
};

// الأنواع الرئيسية المفلترة حسب البحث
const filteredMainGenres = computed(() => {
    if (!mainGenreSearch.value) return mainGenres.value;
    
    const search = mainGenreSearch.value.toLowerCase();
    return mainGenres.value.filter(g => 
        g.genre_name.toLowerCase().includes(search)
    );
});

// الأنواع الفرعية للنوع الرئيسي المختار
const subGenresForCurrentMain = computed(() => {
    if (!props.mainGenre) return [];
    return getSubGenresForMain(props.mainGenre);
});

// الأنواع الفرعية المفلترة حسب البحث
const filteredSubGenresWithSearch = computed(() => {
    let result = subGenresForCurrentMain.value;
    
    if (subGenreSearch.value) {
        const search = subGenreSearch.value.toLowerCase();
        result = result.filter(sg => 
            sg.genre_name.toLowerCase().includes(search)
        );
    }
    
    return result;
});

// تحديد ما إذا كان يجب تفعيل حقل Subgenre
const isSubGenreEnabled = computed(() => {
    const enabled = props.mainGenre.trim() !== '' && subGenresForCurrentMain.value.length > 0;
    console.log('🔘 isSubGenreEnabled:', enabled, {
        mainGenre: props.mainGenre,
        subGenresCount: subGenresForCurrentMain.value.length
    });
    return enabled;
});

// جلب البيانات من الـ API
const fetchGenres = async () => {
    isLoading.value = true;
    try {
        const genresData = await generalDataService.getGenres();
        
        console.log('✅ تم جلب الأنواع:', genresData);
        
        if (genresData.data && Array.isArray(genresData.data)) {
            genres.value = genresData.data;
        } else if (Array.isArray(genresData)) {
            genres.value = genresData;
        }
        
        console.log(`📊 تم تحميل ${genres.value.length} نوع`);
        console.log('📋 عينة من الأنواع:', genres.value.slice(0, 5).map(g => g.genre_name));
        
    } catch (error) {
        console.error('❌ فشل جلب الأنواع:', error);
        loadError.value = error.message;
    } finally {
        isLoading.value = false;
    }
};

// ========== دوال القوائم المنسدلة الأخرى ==========
const toggleDropdown = (field) => {
    console.log(`Toggling dropdown for ${field}`);
    
    if (field === 'releasePrice') {
        isReleasePriceDropdownOpen.value = !isReleasePriceDropdownOpen.value;
        isSongPriceDropdownOpen.value = false;
        isMainGenreDropdownOpen.value = false;
        isSubGenreDropdownOpen.value = false;
    } else if (field === 'songPrice') {
        isSongPriceDropdownOpen.value = !isSongPriceDropdownOpen.value;
        isReleasePriceDropdownOpen.value = false;
        isMainGenreDropdownOpen.value = false;
        isSubGenreDropdownOpen.value = false;
    }
};

const selectOption = (field, value) => {
    console.log(`Selected ${field}: ${value}`);
    
    if (field === 'releasePrice') {
        localReleasePrice.value = value;
        emit('update:isReleasePriceSelected', value.trim() !== '');
        isReleasePriceDropdownOpen.value = false;
    } else if (field === 'songPrice') {
        localSongPrice.value = value;
        emit('update:isSongPriceSelected', value.trim() !== '');
        isSongPriceDropdownOpen.value = false;
    }
};

// ========== Computed properties للقيم ==========
const sanitize = (value) => {
    if (typeof value === 'string') {
        return value.replace(/<!--[\s\S]*?-->/g, '').trim();
    }
    return value || '';
};

const localReleasePrice = computed({
    get: () => sanitize(props.releasePrice),
    set: (value) => emit('update:releasePrice', sanitize(value))
});

const localSongPrice = computed({
    get: () => sanitize(props.songPrice),
    set: (value) => emit('update:songPrice', sanitize(value))
});

const localMainGenre = computed({
    get: () => sanitize(props.mainGenre),
    set: (value) => emit('update:mainGenre', sanitize(value))
});

const localSubGenre = computed({
    get: () => sanitize(props.subGenre),
    set: (value) => emit('update:subGenre', sanitize(value))
});

// ========== Watchers ==========
watch(localMainGenre, (newValue) => {
    emit('update:isSubGenreEnabled', newValue.trim() !== '' && subGenresForCurrentMain.value.length > 0);
});

// مزامنة البحث مع القيم من props
watch(() => props.mainGenre, (newVal) => {
    if (newVal && newVal !== mainGenreSearch.value) {
        mainGenreSearch.value = newVal;
    }
}, { immediate: true });

watch(() => props.subGenre, (newVal) => {
    if (newVal && newVal !== subGenreSearch.value) {
        subGenreSearch.value = newVal;
    }
}, { immediate: true });

// ========== Initialization ==========
onMounted(() => {
    fetchGenres();
});
</script>

<style lang="scss" scoped>
.new-right {
    display: flex;
    width: 889px;
    padding-top: 28px;
    flex-direction: column;
    align-items: flex-start;
    gap: 32px;
    transform: translateY(100%);
    opacity: 0;
    transition: transform 0.5s ease, opacity 0.5s ease;
    flex-grow: 1;
    height: 100%;
}

.new-right.slide-in {
    transform: translateY(0);
    opacity: 1;
}

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

/* أنماط وضع البحث */
.section-input.search-mode .input-field {
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
    width: 100%;
    box-sizing: border-box;
}

.section-input.search-mode .input-field:disabled {
    cursor: not-allowed;
    opacity: 0.5;
}

.section-input.search-mode.has-checkmark .input-field {
    padding-right: 94px;
}

/* نتائج البحث */
.search-box-container {
    position: relative;
    width: 100%;
}

.search-results {
    position: absolute;
    top: calc(100% + 5px);
    left: 0;
    right: 0;
    background: var(--primary);
    border-radius: 5px;
    z-index: 100;
    max-height: 250px;
    overflow-y: auto;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.search-result-item {
    padding: 12px 16px;
    color: #FFF;
    font-family: Heebo;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.search-result-item:last-child {
    border-bottom: none;
}

.search-result-item:hover {
    // background: var(--Strawberry, #DE1456);
    padding-left: 20px;
}

.search-results.no-results {
    padding: 20px 16px;
    color: rgba(255, 255, 255, 0.5);
    text-align: center;
    font-style: italic;
}

/* حالة التركيز */
.section-input.search-mode.is-focused {
    // outline: 2px solid var(--Strawberry, #DE1456);
}

/* تعديل موضع السبيسر */
.section-input.search-mode .spacer {
    background: var(--secondary);
}

.section-input.search-mode .spacer .play {
    background: var(--primary);
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
    color: #6A6C6D; /* اللون الافتراضي قبل التحديد */
    font-family: Heebo;
    font-size: 16px;
    height: 46px;
    max-width: 100%;
    box-sizing: border-box;
    cursor: pointer;
}

.section-input.has-checkmark .select-trigger {
    color: #FFF; /* اللون الأبيض بعد التحديد */
    padding-right: 94px;
}

.dropdown {
    position: absolute;
    top: calc(100% + 2px); /* إزاحة القائمة المنسدلة 2 بكسل للأسفل */
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

.section-input .checkmark .icon-select {
    position: relative;
    right: 12px;
}

.section-input:hover .icon-select {
    filter: brightness(0) invert(1);
}

.section-input .spacer {
    display: flex;
    width: 34px;
    height: 46px;
    padding: 9px 10px;
    align-items: center;
    border-radius: 5px;
    background: var(--secondary);
    position: relative;
    cursor: pointer;
}

.section-input .spacer .play {
    display: flex;
    padding: 13px 9px;
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
    height: 20px;
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