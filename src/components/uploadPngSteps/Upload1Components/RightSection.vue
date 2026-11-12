<template>
    <div class="right" :class="{ 
        'slide-in': isSlidingIn && !isLeaving,
        'slide-out': isLeaving 
    }">
        <div class="form1">
            <div class="title">Von Wem ist diese Single?</div>
            <div v-for="(input, index) in artistInputs" :key="index" class="section-input"
                :class="{ 'is-hovered': input.isHovered, 'has-checkmark': input.isSelected}"
                @mouseenter="input.isHovered = true; $emit('update:artistInputs', artistInputs)"
                @mouseleave="input.isHovered = false; $emit('update:artistInputs', artistInputs)">
                <input type="text" class="input-field" :class="{ 'is-correction': isCorrected('artists') }" v-model="input.searchQuery" placeholder="Künstler eintippen"
                    @focus="$emit('update:showSearchResults', index); $emit('updateSearchResults', index, input.searchQuery); input.isFocused = true"
                    @blur="handleBlur(index)" @input="handleInput(index, input.searchQuery)" />
                
                <!-- ✅ مؤشر التحميل
                <div v-if="input.isSearching" class="loading-spinner">
                    <div class="spinner"></div>
                </div> -->
                
                <!-- ✅ checkmark - يظهر فقط عند الانتهاء من التحميل وليس أثناءه -->
                <div v-if="input.isSelected && !input.isSearching" class="checkmark">
                    <img src="../../../assets/icons/y.png" class="icon-y" alt="checkmark icon" />
                </div>
                
                <!-- ✅ plus-icon - يظهر فقط عند الانتهاء من التحميل -->
                <div v-if="index === 0 && input.isSelected && input.isHovered && artistInputs.length < 2 && !input.isSearching"
                    class="plus-icon" @click="$emit('addArtistInput')">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                </div>
                
                <!-- ✅ minus-icon - يظهر فقط عند الانتهاء من التحميل -->
                <div v-if="index === 1 && input.isHovered && artistInputs.length === 2 && !input.isSearching" class="minus-icon"
                    @click="$emit('removeArtistInput')">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                </div>
                
                <div class="spacer" @click="$emit('openVideoPopup', 'form1')">
                    <div class="play" :class="{ visible: input.isFocused || input.isHovered }">
                        <img :src="iconPlay" class="icon" alt="image icon" />
                    </div>
                </div>
                <div class="search-result" v-if="showSearchResults === index && (input.searchQuery || input.isFocused)"
                    :style="searchResultStyle">
                    
                    <!-- ✅ مؤشر التحميل في نتائج البحث -->
                    <div v-if="input.isSearching" class="search-loading">
                        <div class="spinner"></div>
                        <span>Suche...</span>
                    </div>

                    <template v-else>
                        <!-- زر إضافة فنان جديد -->
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
                            @click="$emit('selectSearchResult', result, index)">
                            <div class="profile">
                                <div class="profile-picture"
                                    :style="{ backgroundImage: `url(${getArtistImage(result)})` }">
                                </div>
                                <div class="p">{{ result.name }}</div>
                            </div>
                            <div class="platforms">
                                <div class="platform-column">
                                   <div v-if="result.spotify && result.spotify.id" 
    class="platform-icon-container"
    @mouseenter="showTooltip(result.spotify.id, 'spotify', resultIndex)"
    @mouseleave="hideTooltip(resultIndex, 'spotify')"
    @click.stop="openSpotifyProfile(result.spotify.id)">
    <div class="spotify-icon"></div>
</div>
                                    <div v-else class="platform-icon-placeholder"></div>
                                </div>
                                <div class="platform-column">
                                    <div v-if="result.apple && result.apple.id" 
                                        class="platform-icon-container"
                                        @mouseenter="showTooltip(result.apple.id, 'apple', resultIndex)"
                                        @mouseleave="hideTooltip(resultIndex, 'apple')"
                                        @click.stop="openProfile(result.apple.href, 'apple')">
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

        <!-- باقي الفورمات كما هي -->
        <div class="form2">
            <div class="title">Wie lautet der Titel?</div>
            <div class="section-input" :class="{ 'is-hovered': isHoveredForm2, 'has-checkmark': isForm2Selected}"
                @mouseenter="$emit('update:isHoveredForm2', true)" @mouseleave="$emit('update:isHoveredForm2', false)">
                <input type="text" class="input-field" :class="{ 'is-correction': isCorrected('title') }" v-model="localSearchQuery2" placeholder="Releasetitel"
                    @input="$emit('update:isForm2Selected', localSearchQuery2.trim() !== '')" />
                <div v-if="isForm2Selected" class="checkmark">
                    <img src="../../../assets/icons/y.png" class="icon-y" alt="checkmark icon" />
                </div>
                <div class="spacer" @click="$emit('openVideoPopup', 'form2')">
                    <div class="play" :class="{ visible: isHoveredForm2 }">
                        <img :src="iconPlay" class="icon" alt="image icon" />
                    </div>
                </div>
            </div>
        </div>

        <div class="form3" :class="{ active: isForm3Active }">
            <div class="top-line">
                <div class="title">Gibt es einen Untertitel?</div>
                <div class="btn-switch" @click="$emit('toggleForm3')">
                    <img src="/icon/circle.svg" class="circle" alt="circle image" />
                </div>
            </div>
            <div class="section-input" :class="{
                'is-hovered': isHoveredForm3,
                'has-checkmark': isForm3Selected}" @mouseenter="$emit('update:isHoveredForm3', true)" @mouseleave="$emit('update:isHoveredForm3', false)">
                <input type="text" class="input-field" :class="{ 'is-correction': isCorrected('subtitle') }" v-model="localSearchQuery3" placeholder="Release Untertitel"
                    :disabled="!isForm3Active"
                    @input="handleForm3Input" />
                <div v-if="isForm3Selected" class="checkmark">
                    <img src="../../../assets/icons/y.png" class="icon-y" alt="checkmark" />
                </div>
                <div class="spacer" @click="$emit('openVideoPopup', 'form3')">
                    <div class="play" :class="{ visible: isForm3Active && isHoveredForm3 }">
                        <img :src="iconPlay" class="icon" alt="image icon" />
                    </div>
                </div>
            </div>
        </div>

        <!-- ✅ تنسيق التاريخ بصيغة DD.MM.YY -->
        <div class="form4">
            <div class="title">Release Date</div>
            <div class="section-input"
                :class="{ 'is-hovered': isHoveredForm4, 'is-focused': isInputFocused, 'has-checkmark': isForm4Selected}"
                @mouseenter="$emit('update:isHoveredForm4', true)"
                @mouseleave="$emit('update:isHoveredForm4', false); if (!isInputFocused) $emit('update:isCalendarVisible', false)">
                <input type="text" class="input-field" :class="{ 'is-correction': isCorrected('release_date') }" :value="formattedSelectedDate" readonly
                    @focus="$emit('update:isInputFocused', true); $emit('update:isCalendarVisible', true)"
                    :placeholder="formattedRecommendedDate || '21.07.26'" />
                <div v-if="isForm4Selected" class="checkmark">
                    <img src="../../../assets/icons/y.png" class="icon-y" alt="checkmark icon" />
                </div>
                <div class="spacer" @click="$emit('openVideoPopup', 'form4')">
                    <div class="play" :class="{ visible: isInputFocused || isHoveredForm4 }">
                        <img :src="iconPlay" class="icon" alt="image icon" />
                    </div>
                </div>
                <img src="/icon/play-dark.svg" v-if="isCalendarVisible" class="play-dark"
                    alt="image play dark for calendar" />
                <CalendarPicker v-if="isCalendarVisible" class="calendar-picker"
                    @select="handleDateSelect" @update:modelValue="handleDateSelect" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useCorrections } from '@/composables/useCorrections';
import CalendarPicker from '@/components/CalendarPicker.vue';
import iconPlay from '@/assets/icons/play.png'

// حقول مطلوب تصحيحها (Korrektur) → بوردر أحمر.
const { isCorrected } = useCorrections();

const props = defineProps({
    artistInputs: { type: Array, required: true },
    showSearchResults: { type: Number, default: null },
    filteredSearchResults: { type: Array, required: true },
    searchQuery2: { type: String, default: '' },
    searchQuery3: { type: String, default: '' },
    selectedDate: { type: String, default: null },
    isForm2Selected: { type: Boolean, default: false },
    isForm3Selected: { type: Boolean, default: false },
    isForm4Selected: { type: Boolean, default: false },
    isForm3Active: { type: Boolean, default: false },
    isHoveredForm2: { type: Boolean, default: false },
    isHoveredForm3: { type: Boolean, default: false },
    isHoveredForm4: { type: Boolean, default: false },
    isInputFocused: { type: Boolean, default: false },
    isCalendarVisible: { type: Boolean, default: false },
    iconPlay: { type: String, required: true },
    searchResultStyle: { type: Object, required: true },
    isSlidingUp: { type: Boolean, default: false },
    recommendedDate: { type: String, default: '' },
    // 🔥 إضافة props للأنيميشن
    isSlidingIn: { type: Boolean, default: true },
    isLeaving: { type: Boolean, default: false }
});

const emit = defineEmits([
    'update:artistInputs', 'update:showSearchResults', 'update:searchQuery2', 'update:searchQuery3',
    'update:selectedDate', 'update:isForm2Selected', 'update:isForm3Selected', 'update:isForm4Selected',
    'toggleForm3', 'update:isHoveredForm2', 'update:isHoveredForm3', 'update:isHoveredForm4',
    'update:isInputFocused', 'update:isCalendarVisible', 'openVideoPopup', 'addArtistInput',
    'removeArtistInput', 'selectSearchResult', 'updateSearchResults',
    'addNewArtist'
]);

// ========== 🔥 تنسيق التاريخ من DD/MM/YY إلى DD.MM.YY ==========
const formatDate = (dateStr) => {
    if (!dateStr) return '';
    if (dateStr.includes('/')) {
        return dateStr.replace(/\//g, '.');
    }
    return dateStr;
};

// ========== 🔥 التاريخ المنسق للعرض ==========
const formattedSelectedDate = computed(() => {
    return formatDate(props.selectedDate);
});

const formattedRecommendedDate = computed(() => {
    return formatDate(props.recommendedDate);
});

// ========== دوال الـ Tooltip ==========
const activeTooltip = ref(null);
const hoveredId = ref('');
const tooltipTimeouts = ref({});

const showTooltip = (id, platform, index) => {
    const tooltipKey = `${platform}-${index}`;
    
    if (tooltipTimeouts.value[tooltipKey]) {
        clearTimeout(tooltipTimeouts.value[tooltipKey]);
        delete tooltipTimeouts.value[tooltipKey];
    }
    
    hoveredId.value = id;
    activeTooltip.value = tooltipKey;
    console.log(`🎯 Show tooltip for ${platform}:`, id);
};
// فتح بروفايل Spotify بالشكل: https://open.spotify.com/artist/{id}
const openSpotifyProfile = (id) => {
    if (!id) {
        
        return;
    }
    const url = `https://open.spotify.com/artist/${encodeURIComponent(id)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
};
const hideTooltip = (index, platform) => {
    const tooltipKey = `${platform}-${index}`;
    
    tooltipTimeouts.value[tooltipKey] = setTimeout(() => {
        if (activeTooltip.value === tooltipKey) {
            activeTooltip.value = null;
            hoveredId.value = '';
        }
        delete tooltipTimeouts.value[tooltipKey];
    }, 100);
};

const openProfile = (url, platform) => {
    if (url) {
        window.open(url, '_blank', 'noopener,noreferrer');
        console.log(`🔗 فتح بروفايل ${platform}:`, url);
    } else {
        console.warn(`⚠️ لا يوجد رابط للـ ${platform}`);
    }
};

const getArtistImage = (artist) => {
    if (!artist) return '/icon/icon-picture.jpg';
    
    if (artist.spotify && artist.spotify.cover) {
        return artist.spotify.cover;
    }
    
    if (artist.apple && artist.apple.cover) {
        return artist.apple.cover;
    }
    
    if (artist.spotify && artist.spotify.id) {
        return '/icon/spotify.png';
    }
    
    return '/icon/icon-picture.jpg';
};

const handleForm3Input = () => {
    const value = localSearchQuery3.value?.trim() || '';
    if (props.isForm3Active) {
        emit('update:isForm3Selected', value !== '');
    }
};

const handleAddNewArtist = (index) => {
    const searchQuery = props.artistInputs[index]?.searchQuery?.trim();
    
    if (!searchQuery) {
        console.warn('⚠️ لا يوجد اسم فنان للإضافة');
        return;
    }
    
    console.log('➕ إضافة فنان جديد:', searchQuery);
    
    const newArtist = {
        name: searchQuery,
        spotify: null,
        apple: null
    };
    
    emit('addNewArtist', newArtist, index);
    emit('update:showSearchResults', null);
};

const handleInput = (index, query) => {
    // 🔥 تفعيل مؤشر التحميل
    if (props.artistInputs[index]) {
        props.artistInputs[index].isSearching = true;
    }
    emit('updateSearchResults', index, query);
};

const handleDateSelect = (date) => {
    console.log('📅 RightSection: تم اختيار التاريخ:', date);
    
    emit('update:selectedDate', date);
    emit('update:isCalendarVisible', false);
    emit('update:isInputFocused', false);
    
    if (date && date.trim() !== '') {
        emit('update:isForm4Selected', true);
    }
};

const localSearchQuery2 = computed({
    get: () => props.searchQuery2,
    set: (value) => emit('update:searchQuery2', value)
});

const localSearchQuery3 = computed({
    get: () => props.searchQuery3,
    set: (value) => {
        emit('update:searchQuery3', value);
        if (props.isForm3Active && value && value.trim() !== '') {
            emit('update:isForm3Selected', true);
        } else if (props.isForm3Active && (!value || value.trim() === '')) {
            emit('update:isForm3Selected', false);
        }
    }
});

const handleBlur = (index) => {
    setTimeout(() => {
        if (props.artistInputs[index]) {
            props.artistInputs[index].isFocused = false;
            props.artistInputs[index].isSearching = false;
            if (!props.artistInputs[index].searchQuery.trim()) {
                emit('update:showSearchResults', null);
                props.artistInputs[index].isSelected = false;
            }
            emit('update:artistInputs', props.artistInputs);
        }
    }, 200);
};

watch(() => props.filteredSearchResults, (newResults) => {
    console.log('📊 filteredSearchResults updated:', newResults.length, 'results');
    // 🔥 إيقاف مؤشر التحميل عند ظهور النتائج
    if (props.artistInputs) {
        props.artistInputs.forEach(input => {
            if (input.isSearching) {
                input.isSearching = false;
            }
        });
    }
}, { deep: true });

watch(() => props.showSearchResults, (newVal) => {
    console.log('🔍 showSearchResults changed to:', newVal);
});

watch(() => props.isForm3Active, (newVal) => {
    if (!newVal) {
        localSearchQuery3.value = '';
        emit('update:isForm3Selected', false);
    }
});

// ========== ✅ إضافة isSearching إلى كل artistInput ==========
watch(() => props.artistInputs, (newInputs) => {
    if (newInputs) {
        newInputs.forEach(input => {
            if (input.isSearching === undefined) {
                input.isSearching = false;
            }
        });
    }
}, { immediate: true, deep: true });

// ========== 🔥 مراقبة تغييرات isSlidingIn و isLeaving ==========
watch(() => props.isSlidingIn, (newVal) => {
    console.log('🔄 RightSection isSlidingIn changed:', newVal);
}, { immediate: true });

watch(() => props.isLeaving, (newVal) => {
    console.log('🔄 RightSection isLeaving changed:', newVal);
}, { immediate: true });
</script>

<style lang="scss" scoped>
/* جميع الأنماط كما هي مع إضافة أنماط التحميل */

.right {
    display: flex;
    width: 100%;
    flex-direction: column;
    align-items: flex-start;
    gap: 32px;
    
    /* ===== أنيميشن الدخول ===== */
    transform: translateY(30px);
    opacity: 0;
    transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.right.slide-in {
    transform: translateY(0);
    opacity: 1;
}

/* ===== أنيميشن الخروج ===== */
.right.slide-out {
    transform: translateY(-30px);
    opacity: 0;
}

.right.slide-up {
    transform: translateY(-20%);
    opacity: 0;
}

.form1,
.form2,
.form3,
.form4 {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 8px;
    align-self: stretch;
    position: relative;
}

.form1>.title,
.form2>.title,
.form3 .top-line>.title,
.form4>.title {
    color: var(--Main-Colors-White, #FFF);
    font-family: Heebo;
    font-size: 14px;
    font-style: normal;
    font-weight: 300;
    line-height: .7;
    letter-spacing: 0.7px;
    text-transform: uppercase;
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

.section-input .input-field {
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
    font-size: 20px;
    height: 46px;
    max-width: 100%;
    box-sizing: border-box;

    &:hover {
        border-radius: 5px 0 0 5px;
    }
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

/* ===== مؤشر التحميل ===== */
.section-input .loading-spinner {
    position: absolute;
    right: 45px;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 5;
}

.section-input .loading-spinner .spinner {
    width: 18px;
    height: 18px;
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-top-color: var(--Strawberry, #D15);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

/* ===== مؤشر التحميل في نتائج البحث ===== */
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

@keyframes spin {
    to { transform: rotate(360deg); }
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

.section-input:hover .plus-icon,
.section-input:hover .minus-icon {
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
    background: var(--primary);
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

.form3 .section-input {
    pointer-events: none;
    opacity: 0.5;
}

.form3.active .section-input {
    pointer-events: auto;
    opacity: 1;
}

.form3 .top-line {
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
    height: 22px;
    padding: 2px;
    align-items: center;
    gap: 10px;
    border-radius: 10px;
    background: var(--primary);
    cursor: pointer;
    transition: background 0.3s ease;
}

.form3.active .btn-switch {
    background: var(--Main-Colors-Strawberry, #D15);
}

.btn-switch .circle {
    width: 16px;
    height: 16px;
    margin-left: 2px;
    transition: margin-left 0.3s ease;
}

.form3.active .btn-switch .circle {
    margin-left: 20px;
}

.form4 .section-input {
    display: flex;
    width: calc(404px);
    align-items: center;
    gap: 2px;
    border-radius: 5px;
    position: relative;
    cursor: pointer;
}

.form4 .input-field {
    cursor: pointer;
}

.form4 .calendar-picker {
    position: absolute;
    top: 0;
    left: calc(100% + 18px);
    z-index:10;
    background: var(--primary);
    padding: 20px;
    border-radius: 10px;
    box-shadow: 7px 3px 10px -3px var(--Main-Colors-Slate-Black, #0E0E10);
}

.form4 .play-dark {
    position: absolute;
    right: -20px;
    top: 50%;
    transform: translateY(-50%);
    width: 18px;
    height: 20px;
    z-index: 11;
}

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
}

.line {
    width: 100%;
    height: 1px;
    background: var(--Main-Colors-Slate-Black, #0E0E10);
}

.add-more {
    display: flex;
    justify-content: space-between;
    align-items: center;
    align-self: stretch;
    padding: 0px 0px 4px 7px;
    cursor: pointer;
    
    &:hover {
        .p {
            color: #D15;
            position: relative;
        }

        .add-icon {
            background: var(--Main-Colors-Strawberry, #D15) !important;
            transition: background 0.3s ease;
            
            .icons svg {
                // stroke: #FFF;
                transition: stroke 0.3s ease;
            }
        }
    }
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

.search-item:hover {
    .profile .p {
        color: #FFF;
        position: relative;
        transform: translate(15px);
    }
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
    transform: scale(1.1);
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

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
}


@media (max-width:1700px) {
    
    .form4 .section-input{
        max-width: 180px;
    }

    .form4 .play-dark{
        right: -65px;
    }

    .form4 .calendar-picker{
        left: calc(100% + 60px);
    }

    .form4 .section-input .spacer .play.visible{
        right: -25px;
    }

    .form4 .section-input.has-checkmark .input-field{
        padding-right: 20px;
    }

    // ✅ تطبيق فقط على form4
    .form4 .section-input .checkmark{
        right: 0px;
    }
}
@media (max-width:1599px) {
    .right { gap: 20px; padding-right: 60px; }

}

@media (min-width:1600px) and (max-width:2074px) {
    .right { gap: 32px; padding-right: 73px; }
}

@media (min-width:2075px) and (max-width:2560px) {
    .right { gap: 32px; padding-right: 113px; }
}
</style>