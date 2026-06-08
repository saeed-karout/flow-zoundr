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
                    <!-- Hauptgenre - مثل الـ Price تماماً -->
                    <div class="form">
                        <div class="form5">
                            <div class="title">Hauptgenre?</div>
                            <div class="section-input"
                                :class="{ 'is-hovered': isHoveredMainGenre, 'has-checkmark': isMainGenreSelected }"
                                @mouseenter="isHoveredMainGenre = true"
                                @mouseleave="isHoveredMainGenre = false">
                                <div class="custom-select" @click="toggleDropdown('mainGenre')">
                                    <div class="select-trigger" :class="{ 'selected': isMainGenreSelected }">
                                        {{ localMainGenreDisplay || 'Genre auswählen' }}
                                    </div>
                                    <div class="dropdown" v-show="isMainGenreDropdownOpen">
                                        <div class="option" 
                                            v-for="genre in mainGenres" 
                                            :key="genre.id"
                                            @click.stop="selectMainGenre(genre)">
                                            {{ genre.genre_name }}
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
                                    <div class="play" :class="{ visible: isHoveredMainGenre }">
                                        <img :src="iconPlay" class="icon" alt="play icon" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Subgenre - مثل الـ Price تماماً (يظهر فقط بعد اختيار Hauptgenre) -->
                    <div class="form" v-if="isSubGenreEnabled">
                        <div class="form5">
                            <div class="title">Subgenre?</div>
                            <div class="section-input"
                                :class="{ 'is-hovered': isHoveredSubGenre, 'has-checkmark': isSubGenreSelected }"
                                @mouseenter="isHoveredSubGenre = true"
                                @mouseleave="isHoveredSubGenre = false">
                                <div class="custom-select" @click="toggleDropdown('subGenre')">
                                    <div class="select-trigger" :class="{ 'selected': isSubGenreSelected }">
                                        {{ localSubGenreDisplay || 'Subgenre auswählen' }}
                                    </div>
                                    <div class="dropdown" v-show="isSubGenreDropdownOpen">
                                        <div class="option" 
                                            v-for="subGenre in subGenresForCurrentMain" 
                                            :key="subGenre.id"
                                            @click.stop="selectSubGenre(subGenre)">
                                            {{ subGenre.genre_name }}
                                        </div>
                                    </div>
                                </div>
                                <div v-if="isSubGenreSelected" class="checkmark">
                                    <img src="../../../assets/icons/y.png" class="icon-y" alt="checkmark icon" />
                                </div>
                                <div v-else class="checkmark">
                                    <img src="/icon/icon-select.svg" class="icon-select" alt="select icon" />
                                </div>
                                <div class="spacer" @click="$emit('openVideoPopup', 'form8')">
                                    <div class="play" :class="{ visible: isHoveredSubGenre }">
                                        <img :src="iconPlay" class="icon" alt="play icon" />
                                    </div>
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

// حالات الـ hover
const isHoveredMainGenre = ref(false);
const isHoveredSubGenre = ref(false);

// ========== معالجة الأنواع ==========

// جميع الأنواع الرئيسية (كل الأنواع)
const mainGenres = computed(() => {
    return genres.value;
});

// تخزين الأنواع الفرعية المولدة
const generatedSubGenresMap = ref(new Map());

// توليد أنواع فرعية من النوع الرئيسي المختار
const generateSubGenresForMain = (mainGenreName) => {
    // إذا كانت الأنواع الفرعية موجودة مسبقاً، استخدمها
    if (generatedSubGenresMap.value.has(mainGenreName)) {
        return generatedSubGenresMap.value.get(mainGenreName);
    }
    
    // قائمة بالأنواع الفرعية الشائعة
    const subGenreList = [
        { id: `sub-${mainGenreName}-1`, genre_name: `${mainGenreName} Rock` },
        { id: `sub-${mainGenreName}-2`, genre_name: `${mainGenreName} Pop` },
        { id: `sub-${mainGenreName}-3`, genre_name: `${mainGenreName} Metal` },
        { id: `sub-${mainGenreName}-4`, genre_name: `${mainGenreName} Jazz` },
        { id: `sub-${mainGenreName}-5`, genre_name: `${mainGenreName} Blues` },
        { id: `sub-${mainGenreName}-6`, genre_name: `${mainGenreName} Electronic` },
        { id: `sub-${mainGenreName}-7`, genre_name: `${mainGenreName} Hip Hop` },
        { id: `sub-${mainGenreName}-8`, genre_name: `${mainGenreName} Classical` },
        { id: `sub-${mainGenreName}-9`, genre_name: `${mainGenreName} Country` },
        { id: `sub-${mainGenreName}-10`, genre_name: `${mainGenreName} Reggae` }
    ];
    
    generatedSubGenresMap.value.set(mainGenreName, subGenreList);
    return subGenreList;
};

// الأنواع الفرعية للنوع الرئيسي المختار
const subGenresForCurrentMain = computed(() => {
    if (!props.mainGenre) return [];
    return generateSubGenresForMain(props.mainGenre);
});

// تحديد ما إذا كان يجب تفعيل حقل Subgenre
const isSubGenreEnabled = computed(() => {
    return props.mainGenre && props.mainGenre.trim() !== '';
});

// عرض القيم
const localMainGenreDisplay = computed(() => {
    if (!props.mainGenre) return '';
    const found = mainGenres.value.find(g => g.genre_name === props.mainGenre);
    return found ? found.genre_name : props.mainGenre;
});

const localSubGenreDisplay = computed(() => {
    if (!props.subGenre) return '';
    const found = subGenresForCurrentMain.value.find(sg => sg.genre_name === props.subGenre);
    return found ? found.genre_name : props.subGenre;
});

// ========== دوال اختيار القيم ==========

const toggleDropdown = (field) => {
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
    } else if (field === 'subGenre') {
        isSubGenreDropdownOpen.value = true;
    }
};

const selectOption = (field, value) => {
    if (field === 'releasePrice') {
        emit('update:releasePrice', value);
        emit('update:isReleasePriceSelected', true);
        isReleasePriceDropdownOpen.value = false;
    } else if (field === 'songPrice') {
        emit('update:songPrice', value);
        emit('update:isSongPriceSelected', true);
        isSongPriceDropdownOpen.value = false;
    }
};

const selectMainGenre = (genre) => {
    emit('update:mainGenre', genre.genre_name);
    emit('update:isMainGenreSelected', true);
    // إعادة تعيين Subgenre عند تغيير Hauptgenre
    emit('update:subGenre', '');
    emit('update:isSubGenreSelected', false);
    isMainGenreDropdownOpen.value = false;
    console.log('🔄 Main genre selected:', genre.genre_name);
};

const selectSubGenre = (subGenre) => {
    emit('update:subGenre', subGenre.genre_name);
    emit('update:isSubGenreSelected', true);
    isSubGenreDropdownOpen.value = false;
    console.log('🔄 Sub genre selected:', subGenre.genre_name);
};

// ========== إغلاق القوائم عند النقر خارجها ==========
const handleClickOutside = (event) => {
    const target = event.target;
    if (!target.closest('.custom-select')) {
        isReleasePriceDropdownOpen.value = false;
        isSongPriceDropdownOpen.value = false;
        isMainGenreDropdownOpen.value = false;
        isSubGenreDropdownOpen.value = false;
    }
};

// ========== جلب البيانات من الـ API ==========
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

// ========== Watchers ==========
watch(() => props.mainGenre, (newValue) => {
    console.log('📌 Main genre changed to:', newValue);
});

watch(() => props.subGenre, (newValue) => {
    console.log('📌 Sub genre changed to:', newValue);
});

// ========== Initialization ==========
onMounted(() => {
    fetchGenres();
    document.addEventListener('click', handleClickOutside);
});

// تنظيف المستمع عند إلغاء تحميل المكون
import { onUnmounted } from 'vue';
onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
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
    width: 100%;
    scrollbar-width: none;
}

.dropdown .option {
    padding: 10px 12px;
    color: #FFF;
    font-family: Heebo;
    font-size: 20px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.dropdown .option:hover {
    // background: var(--secondary);
    padding-left: 20px;
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

.loading-spinner {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 200px;
    width: 100%;
}

.spinner {
    width: 40px;
    height: 40px;
    border: 3px solid var(--secondary);
    border-top-color: var(--Strawberry, #D15);
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
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