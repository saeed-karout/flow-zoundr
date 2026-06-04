<template>
    <div class="upload" :style="{ gap: showNewRight || showNewRight2 ? '24px' : '150px', alignItems: showNewRight || showNewRight2 ? 'start' : 'center' }">
        <!-- Video Popup -->
        <div v-if="showVideoPopup" class="video-popup-overlay" @click="closeVideoPopup">
            <div class="video-popup-container" @click.stop>
                <iframe width="100%" height="100%" :src="'https://www.youtube.com/embed/' + videoId + '?autoplay=1'"
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture;"
                    allowfullscreen>
                </iframe>
                <button class="close-btn" @click="closeVideoPopup">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
        </div>

        <!-- Left Section -->
        <div class="">
            <!-- Left: Image Display Section -->
            <ImageUpload 
                :uploadedImage="uploadedImage"
                :server-cover-url="serverCoverUrl"
                :is-uploading="isUploading"
                :upload-progress="uploadProgress"
                @update:uploadedImage="uploadedImage = $event"
                @file-selected="updateCover"
            />
    
            <!-- Form Left Section -->
            <div v-if="showNewRight2 && isNewFormsVisible" class="form-left">
                <div class="form6" :class="{ active: isForm6Active }">
                    <div class="top-line">
                        <div class="title">
                            Nutzt du deine eigene GTIN?
                        </div>
                        <div class="btn-switch" @click="toggleForm6">
                            <img src="/icon/circle.svg" class="circle" alt="circle image" />
                        </div>
                    </div>
                    <div class="section-input" :class="{ 'is-hovered': isHoveredForm6, 'has-checkmark': isForm6Selected }"
                        @mouseenter="isHoveredForm6 = true" @mouseleave="isHoveredForm6 = false">
                        <input type="text" class="input-field" v-model="gtin" placeholder="GTIN"
                            :disabled="!isForm6Active" @input="updateForm6Selected" />
                        <div v-if="isForm6Selected" class="checkmark">
                            <img src="../../assets/icons/y.png" class="icon-y" alt="checkmark" />
                        </div>
                        <div class="spacer" @click="openVideoPopup('form6')">
                            <div class="play" :class="{ visible: isForm6Active && isHoveredForm6 }">
                                <img :src="iconPlay" class="icon" alt="image icon" />
                            </div>
                        </div>
                    </div>
                </div>
                <div class="form7" :class="{ active: isForm7Active }">
                    <div class="top-line">
                        <div class="title">
                            Nutzt du eine Katalognummer?
                        </div>
                        <div class="btn-switch" @click="toggleForm7">
                            <img src="/icon/circle.svg" class="circle" alt="circle image" />
                        </div>
                    </div>
                    <div class="section-input" :class="{ 'is-hovered': isHoveredForm7, 'has-checkmark': isForm7Selected }"
                        @mouseenter="isHoveredForm7 = true" @mouseleave="isHoveredForm7 = false">
                        <input type="text" class="input-field" v-model="catalogNumber" placeholder="Katalognummer"
                            :disabled="!isForm7Active" @input="updateForm7Selected" />
                        <div v-if="isForm7Selected" class="checkmark">
                            <img src="../../assets/icons/y.png" class="icon-y" alt="checkmark" />
                        </div>
                        <div class="spacer" @click="openVideoPopup('form7')">
                            <div class="play" :class="{ visible: isForm7Active && isHoveredForm7 }">
                                <img :src="iconPlay" class="icon" alt="image icon" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Right: Input Section -->
        <div v-if="!showNewRight && !showNewRight2" class="right" :class="{ 'slide-up': isSlidingUp }">
            <div class="form1">
                <div class="title">
                    Von Wem ist diese Single?
                </div>
                <div v-for="(input, index) in artistInputs" :key="index" class="section-input"
                    :class="{ 'is-hovered': input.isHovered, 'has-checkmark': input.isSelected }"
                    @mouseenter="input.isHovered = true" @mouseleave="input.isHovered = false">
                    <input type="text" class="input-field" v-model="input.searchQuery" placeholder="Künstler"
                        @focus="handleFocus(index)" @blur="handleBlur(index)" @input="updateSearchResults(index)" />
                    <div v-if="input.isSelected" class="checkmark">
                        <img src="../../assets/icons/y.png" class="icon-y" alt="checkmark icon" />
                    </div>
                    <div v-if="index === 0 && input.isSelected && input.isHovered && artistInputs.length < 2"
                        class="plus-icon" @click="addArtistInput">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                    </div>
                    <div v-if="index === 1 && input.isHovered && artistInputs.length === 2" class="minus-icon"
                        @click="removeArtistInput">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                    </div>
                    <div class="spacer" @click="openVideoPopup('form1')">
                        <div class="play" :class="{ visible: input.isFocused || input.isHovered }">
                            <img :src="iconPlay" class="icon" alt="image icon" />
                        </div>
                    </div>
                    <div class="search-result"
                        v-if="showSearchResults === index && (input.searchQuery || input.isFocused)"
                        :style="searchResultStyle">
                        <div class="search-item" v-for="(result, resultIndex) in filteredSearchResults" :key="result.id"
                            @click="selectSearchResult(result, index)">
                            <div class="profile">
                                <div class="profile-picture"
                                    :style="{ backgroundImage: `url(${result.image || '/icon/icon-picture.jpg'})` }">
                                </div>
                                <div class="p">{{ result.name }}</div>
                            </div>
                            <div class="spotify"></div>
                        </div>
                        <div class="line"></div>
                        <div class="add-more">
                            <div class="profile">
                                <div class="add-icon">
                                    <div class="icons">
                                        <img src="/icon/add-icon.svg" alt="">
                                    </div>
                                </div>
                                <div class="p">Als neuen Act anlegen</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="form2">
                <div class="title">
                    Wie lautet der Titel?
                </div>
                <div class="section-input" :class="{ 'is-hovered': isHoveredForm2, 'has-checkmark': isForm2Selected }"
                    @mouseenter="isHoveredForm2 = true" @mouseleave="isHoveredForm2 = false">
                    <input type="text" class="input-field" v-model="searchQuery2" placeholder="Releasetitel"
                        @input="onSearchQuery2Input" />
                    <div v-if="isForm2Selected" class="checkmark">
                        <img src="../../assets/icons/y.png" class="icon-y" alt="checkmark icon" />
                    </div>
                    <div class="spacer" @click="openVideoPopup('form2')">
                        <div class="play" :class="{ visible: isHoveredForm2 }">
                            <img :src="iconPlay" class="icon" alt="image icon" />
                        </div>
                    </div>
                </div>
            </div>
            <div class="form3" :class="{ active: isForm3Active }">
                <div class="top-line">
                    <div class="title">
                        Gibt es einen Untertitel?
                    </div>
                    <div class="btn-switch" @click="toggleForm3">
                        <img src="/icon/circle.svg" class="circle" alt="circle image" />
                    </div>
                </div>
                <div class="section-input" :class="{ 'is-hovered': isHoveredForm3, 'has-checkmark': isForm3Selected }"
                    @mouseenter="isHoveredForm3 = true" @mouseleave="isHoveredForm3 = false">
                    <input type="text" class="input-field" v-model="searchQuery3" placeholder="Release Untertitel"
                        :disabled="!isForm3Active" @input="updateForm3Selected" />
                    <div v-if="isForm3Selected" class="checkmark">
                        <img src="../../assets/icons/y.png" class="icon-y" alt="checkmark" />
                    </div>
                    <div class="spacer" @click="openVideoPopup('form3')">
                        <div class="play" :class="{ visible: isForm3Active && isHoveredForm3 }">
                            <img :src="iconPlay" class="icon" alt="image icon" />
                        </div>
                    </div>
                </div>
            </div>
            <div class="form4">
                <div class="title">
                    Release Date
                </div>
                <div class="section-input"
                    ref="form4Container"
                    :class="{ 'is-hovered': isHoveredForm4, 'is-focused': isInputFocused, 'has-checkmark': isForm4Selected }"
                    @mouseenter="isHoveredForm4 = true"
                    @mouseleave="isHoveredForm4 = false; if (!isInputFocused) isCalendarVisible = false">
                    <input type="text" class="input-field" :value="localSelectedDate" readonly
                        @click="openCalendar"
                        placeholder="21/07/25" />
                    <div v-if="isForm4Selected" class="checkmark">
                        <img src="../../assets/icons/y.png" class="icon-y" alt="checkmark icon" />
                    </div>
                    <div class="spacer" @click="openVideoPopup('form4')">
                        <div class="play" :class="{ visible: isInputFocused || isHoveredForm4 }">
                            <img :src="iconPlay" class="icon" alt="image icon" />
                        </div>
                    </div>
                    <img src="/icon/play-dark.svg" v-if="isCalendarVisible" class="play-dark"
                        alt="image play dark for calendar" />
                    <CalendarPicker 
                        v-if="isCalendarVisible" 
                        class="calendar-picker" 
                        v-model="localSelectedDate"
                        @update:model-value="handleDateSelect"
                    />
                </div>
            </div>
        </div>

        <!-- New Right Section -->
        <div class="new-right" v-if="showNewRight" :class="{ 'slide-in': showNewRight }">
            <div class="info">
                <div class="title">
                    {{ artistInputs[0]?.searchQuery || 'Diggie' }}
                </div>
                <div class="subtitle">
                    {{ searchQuery2 || 'Summer Feeling' }}
                </div>
                <div class="pill-state">
                    <div class="date">
                        {{ localSelectedDate || '21/07/2025' }}
                    </div>
                </div>
            </div>
            <div class="metas">
                <!-- باقي الميتاس كما هو -->
            </div>
        </div>

        <!-- New Right 2 Section -->
        <div class="new-right2" v-if="showNewRight2" :class="{ 'slide-in': showNewRight2, 'visible': isNewRight2Visible }">
            <!-- باقي المحتوى كما هو -->
        </div>

        <!-- Popup Component -->
        <PopUpDays :showPopup="showPopup" :selectedDate="localSelectedDate" :recommendedDate="recommendedDate"
            @update-date="updateToRecommendedDate" @close="showPopup = false" />

        <!-- Button Arrow Top -->
        <div class="button-arrow-top" v-if="showNewRight || showNewRight2" @click="handleButtonArrowTopClick">
            <img src="/icon/Arrow.svg" class="down" alt="down">
        </div>
    </div>
    <!-- Button Arrow Bottom -->
    <div class="button-arrow" v-if="isButtonArrowVisible" :class="{ disabled: isButtonArrowDisabled }"
        @click="handleButtonArrowClick">
        <img src="/icon/Arrow.svg" class="down" alt="down">
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import iconPlay from '@/assets/icons/Play.png';
import CalendarPicker from '../CalendarPicker.vue';
import PopUpDays from '../modals/PopUpDays.vue';
import dayjs from 'dayjs';
import apiRequest from '@/lib/apiRequest';
import { useReleaseStore } from '@/stores/release';
import ImageUpload from './Upload1Components/ImageUpload.vue';

// Define props
const props = defineProps({
    currentStep: { type: Number, required: true },
    steps: { type: Array, default: () => ['0', '1', '2', '3', '4'] },
    sectionTitle: { type: [String, Object], default: 'Cover Vorschau' },
    uploadedImage: { type: String, default: null },
    title: {
        type: String,
        default: '',
    },
    selectedDate: { type: String, default: null } 
});

// Define emits
const emit = defineEmits(['update:title', 'next', 'update:showNewRight2', 'update:selectedDate']);

// ========== إضافة متغيرات الصورة والرفع ==========
const serverCoverUrl = ref(null);
const isUploading = ref(false);
const uploadProgress = ref(0);
const releaseUuid = ref(null);
const releaseStore = useReleaseStore();
// =============================================

// Video Popup functionality
const showVideoPopup = ref(false);
const form4Container = ref(null);
const videoId = ref('');

const videoIds = {
    form1: 'WPni755-Krg',
    form2: 'dQw4w9WgXcQ',
    form3: 'kJQP7kiw5Fk',
    form4: '3tmd-ClpJxA',
    form5: 'x6QZn9xiuOE',
    form6: 'M7lc1UVf-VE',
    form7: 'y6120QOlsfU',
    form8: 'dQw4w9WgXcQ',
    form9: 'kJQP7kiw5Fk',
    form10: '3tmd-ClpJxA',
    form11: 'x6QZn9xiuOE'
};

// ========== تعريف جميع المتغيرات أولاً ==========
const artistInputs = ref([
    { searchQuery: '', isHovered: false, isFocused: false, isSelected: false }
]);
const showSearchResults = ref(null);
const searchResults = ref([]);
const searchQuery2 = ref('');
const searchQuery3 = ref('');
const releasePrice = ref('');
const songPrice = ref('');
const mainGenre = ref('');
const subGenre = ref('');
const gtin = ref('');
const catalogNumber = ref('');
const labelName = ref('');
const productionYear = ref('');
const cLineYear = ref('');
const cLineName = ref('');
const pLineYear = ref('');
const pLineName = ref('');
const isForm2Selected = ref(false);
const isForm3Selected = ref(false);
const isForm4Selected = ref(false);
const isReleasePriceSelected = ref(false);
const isSongPriceSelected = ref(false);
const isMainGenreSelected = ref(false);
const isSubGenreSelected = ref(false);
const isForm6Selected = ref(false);
const isForm7Selected = ref(false);
const isForm8Selected = ref(false);
const isForm9Selected = ref(false);
const isForm10Selected = ref(false);
const isForm11Selected = ref(false);
const isForm3Active = ref(false);
const isForm6Active = ref(false);
const isForm7Active = ref(false);
const isHoveredForm2 = ref(false);
const isHoveredForm3 = ref(false);
const isHoveredForm4 = ref(false);
const isHoveredReleasePrice = ref(false);
const isHoveredSongPrice = ref(false);
const isHoveredMainGenre = ref(false);
const isHoveredSubGenre = ref(false);
const isHoveredForm6 = ref(false);
const isHoveredForm7 = ref(false);
const isHoveredForm8 = ref(false);
const isHoveredForm9 = ref(false);
const isHoveredForm10 = ref(false);
const isHoveredForm11 = ref(false);
const isInputFocused = ref(false);
const isCalendarVisible = ref(false);
const showPopup = ref(false);
const showNewRight = ref(false);
const showNewRight2 = ref(false);
const isSlidingUp = ref(false);
const isSlidingOut = ref(false);
const isNewRight2Visible = ref(false);
const isNewFormsVisible = ref(false);
const daysDifference = ref(0);

// Mock data
const mockData = [
    { id: '1', name: 'Digger Barnes', type: 'artist', image: '/icon/icon-picture.jpg' },
    { id: '2', name: 'John Doe', type: 'artist', image: '/icon/icon-picture.jpg' },
    { id: '3', name: 'Jane Smith', type: 'artist', image: '/icon/icon-picture.jpg' },
    { id: '4', name: 'Alex Johnson', type: 'artist', image: '/icon/icon-picture.jpg' },
    { id: '5', name: 'Emma Wilson', type: 'artist', image: '/icon/icon-picture.jpg' },
    { id: '6', name: 'Michael Brown', type: 'artist', image: '/icon/icon-picture.jpg' },
    { id: '7', name: 'Sarah Davis', type: 'artist', image: '/icon/icon-picture.jpg' },
    { id: '8', name: 'Chris Lee', type: 'artist', image: '/icon/icon-picture.jpg' },
    { id: '9', name: 'Laura Taylor', type: 'artist', image: '/icon/icon-picture.jpg' },
    { id: '10', name: 'David Miller', type: 'artist', image: '/icon/icon-picture.jpg' },
];

// ========== متغير محلي للتاريخ ==========
const localSelectedDate = ref(props.selectedDate);

// ========== مراقبة التغييرات من prop ==========
watch(() => props.selectedDate, (newVal) => {
    console.log('📅 Upload1Component: props.selectedDate changed to:', newVal);
    if (newVal) {
        localSelectedDate.value = newVal;
        isForm4Selected.value = true;
    }
}, { immediate: true, deep: true });

// ========== دالة لفتح الكالندر ==========
const openCalendar = () => {
    console.log('📅 فتح الكالندر, localSelectedDate:', localSelectedDate.value);
    isInputFocused.value = true;
    isCalendarVisible.value = true;
};

// ========== دالة رفع الصورة ==========
const updateCover = async (file) => {
    if (!file) return;
    
    if (!releaseUuid.value) {
        console.error('❌ لا يوجد UUID للـ release');
        return;
    }

    isUploading.value = true;
    uploadProgress.value = 0;

    const formData = new FormData();
    formData.append('cover', file);
    formData.append('_method', 'PATCH');

    try {
        const response = await apiRequest.post(`/releases/${releaseUuid.value}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (progressEvent) => {
                if (progressEvent.total) {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    uploadProgress.value = percentCompleted;
                    console.log(`📤 تقدم الرفع: ${percentCompleted}%`);
                }
            }
        });

        console.log('✅ تم تحديث الصورة بنجاح:', response.data);

        if (response.data?.data?.cover) {
            serverCoverUrl.value = response.data.data.cover;
            console.log('🖼️ تم تحديث serverCoverUrl:', serverCoverUrl.value);
        }
        
    } catch (err) {
        console.error('❌ فشل تحديث الصورة:', err.response?.data || err);
    } finally {
        setTimeout(() => {
            isUploading.value = false;
        }, 500);
    }
};

// ========== دالة للتعامل مع النقر خارج الكالندر ==========
const handleClickOutside = (event) => {
    setTimeout(() => {
        if (isCalendarVisible.value && form4Container.value && !form4Container.value.contains(event.target)) {
            console.log('🔒 إغلاق الكالندر - نقر خارجي');
            isCalendarVisible.value = false;
            isInputFocused.value = false;
        }
    }, 50);
};

const openVideoPopup = (form) => {
    console.log(`Opening video popup for ${form}`);
    videoId.value = videoIds[form] || 'WPni755-Krg';
    showVideoPopup.value = true;
    document.body.style.overflow = 'hidden';
};

const closeVideoPopup = () => {
    showVideoPopup.value = false;
    videoId.value = '';
    document.body.style.overflow = '';
};

// ========== Fetch search results ==========
const fetchSpotifyResults = async (query) => {
    try {
        searchResults.value = mockData.filter(item =>
            item.type === 'artist' && item.name.toLowerCase().includes(query.toLowerCase().trim())
        );
    } catch (error) {
        console.error('Error fetching search results:', error);
        searchResults.value = [];
    }
};

// ========== Filtered search results ==========
const filteredSearchResults = computed(() => {
    const index = showSearchResults.value;
    if (index === null || index === undefined) return [];
    const query = artistInputs.value[index]?.searchQuery || '';
    const selectedArtists = artistInputs.value
        .map(input => input.searchQuery.trim().toLowerCase())
        .filter(name => name !== '');
    let results = mockData.filter(item => item.type === 'artist');
    if (query && query.trim()) {
        results = results.filter(item => item.name.toLowerCase().includes(query.toLowerCase().trim()));
    }
    results = results.filter(item => !selectedArtists.includes(item.name.toLowerCase()));
    return results;
});

// ========== Form handling functions ==========
const addArtistInput = () => {
    if (artistInputs.value.length < 2) {
        artistInputs.value.push({ searchQuery: '', isHovered: false, isFocused: false, isSelected: false });
    }
};

const removeArtistInput = () => {
    if (artistInputs.value.length === 2) {
        artistInputs.value.splice(1, 1);
    }
};

const handleFocus = (index) => {
    artistInputs.value[index].isFocused = true;
    showSearchResults.value = index;
    updateSearchResults(index);
};

const handleBlur = (index) => {
    setTimeout(() => {
        artistInputs.value[index].isFocused = false;
        if (!artistInputs.value[index].searchQuery.trim()) {
            showSearchResults.value = null;
            artistInputs.value[index].isSelected = false;
        }
    }, 200);
};

const updateSearchResults = async (index) => {
    if (artistInputs.value[index].searchQuery.trim() || artistInputs.value[index].isFocused) {
        showSearchResults.value = index;
        await fetchSpotifyResults(artistInputs.value[index].searchQuery);
    } else {
        showSearchResults.value = null;
        searchResults.value = [];
    }
    artistInputs.value[index].isSelected = artistInputs.value[index].searchQuery.trim() !== '';
};

const selectSearchResult = (result, index) => {
    artistInputs.value[index].searchQuery = result.name;
    artistInputs.value[index].isSelected = true;
    artistInputs.value[index].isFocused = false;
    setTimeout(() => {
        showSearchResults.value = null;
    }, 0);
};

const toggleForm3 = () => {
    isForm3Active.value = !isForm3Active.value;
    if (!isForm3Active.value) {
        searchQuery3.value = '';
        isForm3Selected.value = false;
    }
};

const toggleForm6 = () => {
    isForm6Active.value = !isForm6Active.value;
    if (!isForm6Active.value) {
        gtin.value = '';
        isForm6Selected.value = false;
    }
};

const toggleForm7 = () => {
    isForm7Active.value = !isForm7Active.value;
    if (!isForm7Active.value) {
        catalogNumber.value = '';
        isForm7Selected.value = false;
    }
};

const onSearchQuery2Input = (e) => {
    searchQuery2.value = e.target.value;
    isForm2Selected.value = searchQuery2.value.trim() !== '';
    emit('update:title', searchQuery2.value);
};

const updateForm3Selected = () => {
    isForm3Selected.value = isForm3Active.value && searchQuery3.value.trim() !== '';
};

const updateForm6Selected = () => {
    isForm6Selected.value = isForm6Active.value && gtin.value.trim() !== '';
};

const updateForm7Selected = () => {
    isForm7Selected.value = isForm7Active.value && catalogNumber.value.trim() !== '';
};

const updateForm8Selected = () => {
    isForm8Selected.value = labelName.value.trim() !== '';
};

const updateForm9Selected = () => {
    isForm9Selected.value = productionYear.value.trim() !== '';
};

const updateForm10Selected = () => {
    isForm10Selected.value = cLineYear.value.trim() !== '' && cLineName.value.trim() !== '';
};

const updateForm11Selected = () => {
    isForm11Selected.value = pLineYear.value.trim() !== '' && pLineName.value.trim() !== '';
};

const updateReleasePriceSelected = () => {
    isReleasePriceSelected.value = releasePrice.value.trim() !== '';
};

const updateSongPriceSelected = () => {
    isSongPriceSelected.value = songPrice.value.trim() !== '';
};

const updateMainGenreSelected = () => {
    isMainGenreSelected.value = mainGenre.value.trim() !== '';
};

const updateSubGenreSelected = () => {
    isSubGenreSelected.value = subGenre.value.trim() !== '';
};

const isSubGenreEnabled = computed(() => {
    return mainGenre.value.trim() !== '';
});

const currentDate = dayjs('2025-08-12');
const recommendedDate = computed(() => {
    return currentDate.add(14, 'day').format('DD/MM/YY');
});

// ========== دالة معالجة اختيار التاريخ من الكالندر ==========
const handleDateSelect = (formattedDate) => {
    if (!formattedDate || typeof formattedDate !== 'string') {
        return;
    }

    console.log('📅 Parent: استلام تاريخ من الكالندر:', formattedDate);
    
    localSelectedDate.value = formattedDate.trim();
    isForm4Selected.value = true;

    const selected = dayjs(formattedDate, 'DD/MM/YY');
    if (!selected.isValid()) {
        return;
    }

    const fullYear = selected.year() < 100 ? selected.year() + 2000 : selected.year();
    const correctedSelected = dayjs(`${fullYear}-${selected.month() + 1}-${selected.date()}`);

    const todayStart = currentDate.startOf('day');
    const selectedStart = correctedSelected.startOf('day');

    const diffInDays = selectedStart.diff(todayStart, 'day');
    daysDifference.value = diffInDays;

    showPopup.value = diffInDays >= 0 && diffInDays < 14;

    isCalendarVisible.value = false;
    isInputFocused.value = false;
    
    emit('update:selectedDate', localSelectedDate.value);
};

const updateToRecommendedDate = (newDate) => {
    localSelectedDate.value = newDate;
    isForm4Selected.value = true;
    showPopup.value = false;
    emit('update:selectedDate', localSelectedDate.value);
};

const handleButtonArrowClick = () => {
    if (!isButtonArrowDisabled.value) {
        console.log('Button Arrow Clicked');
        if (showNewRight2.value) {
            console.log('Moving to the next step from new-right2');
            isNewRight2Visible.value = false;
            isNewFormsVisible.value = false;
            showNewRight2.value = false;
            emit('update:showNewRight2', false);
            setTimeout(() => {
                emit('next');
            }, 500);
        } else if (showNewRight.value) {
            isSlidingOut.value = true;
            setTimeout(() => {
                showNewRight.value = false;
                showNewRight2.value = true;
                isSlidingOut.value = false;
                emit('update:showNewRight2', true);
                setTimeout(() => {
                    isNewRight2Visible.value = true;
                    setTimeout(() => {
                        isNewFormsVisible.value = true;
                    }, 2000);
                }, 500);
            }, 500);
        } else {
            isSlidingUp.value = true;
            setTimeout(() => {
                showNewRight.value = true;
                isSlidingUp.value = false;
                emit('update:showNewRight2', false);
            }, 500);
        }
    }
};

const handleButtonArrowTopClick = () => {
    console.log('Button Arrow Top Clicked');
    if (showNewRight2.value) {
        showNewRight2.value = false;
        isNewRight2Visible.value = false;
        isNewFormsVisible.value = false;
        emit('update:showNewRight2', false);
        setTimeout(() => {
            showNewRight.value = true;
        }, 500);
    } else if (showNewRight.value) {
        showNewRight.value = false;
        emit('update:showNewRight2', false);
        setTimeout(() => {
            isSlidingUp.value = false;
        }, 500);
    }
};

const isButtonArrowVisible = computed(() => {
    if (showNewRight2.value) {
        return true;
    } else if (showNewRight.value) {
        const allNewRightFieldsFilled = (
            isReleasePriceSelected.value &&
            isSongPriceSelected.value &&
            isMainGenreSelected.value &&
            isSubGenreSelected.value
        );
        return allNewRightFieldsFilled;
    } else {
        const allForm1Selected = artistInputs.value.length > 0 && artistInputs.value.every(input => input.isSelected);
        const isVisible = allForm1Selected && isForm2Selected.value && isForm4Selected.value;
        return isVisible;
    }
});

const isButtonArrowDisabled = computed(() => {
    return showNewRight.value
        ? false
        : isForm3Active.value && !isForm3Selected.value;
});

const searchResultStyle = computed(() => {
    return {
        position: 'absolute',
        top: '48px',
        left: 0,
        width: 'calc(100% + 2px)',
        zIndex: 1000,
        display: 'block',
        visibility: 'visible',
        borderRadius: '5px'
    };
});

// ========== دالة جلب بيانات الـ Release من API ==========
const fetchReleaseData = async () => {
    try {
        if (releaseStore.currentReleaseId) {
            releaseUuid.value = releaseStore.currentReleaseId;
            const response = await apiRequest.get(`/releases/${releaseUuid.value}`);
            const release = response.data?.data;
            
            if (release) {
                if (release.cover) {
                    serverCoverUrl.value = release.cover;
                    console.log('🖼️ تم تحميل الصورة من السيرفر:', serverCoverUrl.value);
                }
            }
        }
    } catch (err) {
        console.error('فشل جلب بيانات الـ Release:', err);
    }
};

// ========== مراقبة التغييرات ==========
watch(localSelectedDate, (newVal) => {
    if (newVal) {
        console.log('📅 localSelectedDate تغير:', newVal);
    }
});

watch([searchQuery2, searchQuery3, localSelectedDate, releasePrice, songPrice, mainGenre, subGenre, gtin, catalogNumber, labelName, productionYear, cLineYear, cLineName, pLineYear, pLineName], () => {
    isForm2Selected.value = searchQuery2.value.trim() !== '';
    isForm3Selected.value = isForm3Active.value && searchQuery3.value.trim() !== '';
    isForm4Selected.value = localSelectedDate.value !== null;
    isReleasePriceSelected.value = releasePrice.value.trim() !== '';
    isSongPriceSelected.value = songPrice.value.trim() !== '';
    isMainGenreSelected.value = mainGenre.value.trim() !== '';
    isSubGenreSelected.value = subGenre.value.trim() !== '';
    isForm6Selected.value = isForm6Active.value && gtin.value.trim() !== '';
    isForm7Selected.value = isForm7Active.value && catalogNumber.value.trim() !== '';
    isForm8Selected.value = labelName.value.trim() !== '';
    isForm9Selected.value = productionYear.value.trim() !== '';
    isForm10Selected.value = cLineYear.value.trim() !== '' && cLineName.value.trim() !== '';
    isForm11Selected.value = pLineYear.value.trim() !== '' && pLineName.value.trim() !== '';
}, { deep: true, immediate: true });

onMounted(() => {
    console.log('Component mounted');
    document.addEventListener('click', handleClickOutside);
    fetchReleaseData();
});

onUnmounted(() => {
    console.log('Component unmounted');
    document.body.style.overflow = '';
    document.removeEventListener('click', handleClickOutside);
});
</script>

<style lang="scss" scoped>
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Heebo', sans-serif;
}

img[alt] {
    text-indent: -9999px;
}

/* Video Popup Styles */
.video-popup-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.6);
    z-index: 1000;
    display: flex;
    justify-content: center;
    align-items: center;
    animation: fadeIn 0.3s ease-out;
}

.video-popup-container {
    position: relative;
    width: 80%;
    max-width: 1000px;
    aspect-ratio: 16/9;
    background: #000;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.video-popup-container iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

.close-btn {
    position: absolute;
    top: 20px;
    right: 20px;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    border: none;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 10;
    transition: all 0.2s ease;
}

.close-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    color: var(--Strawberry, #DE1456);
}

.close-btn svg {
    width: 20px;
    height: 20px;
}

.upload {
    display: flex;
    align-items: flex-start;
    align-self: stretch;
    position: relative;
}

/* Right section */
.right {
    display: flex;
    width: 760px;
    flex-direction: column;
    align-items: flex-start;
    gap: 32px;
    transition: transform 0.5s ease, opacity 0.5s ease;
}

.right.slide-up {
    transform: translateY(-20%);
    opacity: 0;
}

/* New Right and New Right 2 Sections */
.new-right,
.new-right2 {
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

.new-right.slide-in,
.new-right2.slide-in {
    transform: translateY(0);
    opacity: 1;
}

.new-right.slide-out {
    transform: translateY(-20%);
    opacity: 0;
}

.new-right2 .info.hidden,
.new-right2 .metas2.hidden,
.new-right2 .metas3.hidden {
    opacity: 0;
    transition: opacity 0.3s ease;
}

.new-right2 .info.visible,
.new-right2 .metas2.visible,
.new-right2 .metas3.visible {
    opacity: 1;
}

.new-right .info,
.new-right2 .info {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 24px;
}

.new-right .info .title,
.new-right2 .info .title {
    color: #FFF;
    font-family: Heebo;
    font-size: 58px;
    font-style: normal;
    font-weight: 700;
    line-height: .8;
    text-transform: uppercase;
}

.new-right .info .subtitle,
.new-right2 .info .subtitle {
    color: #FFF;
    font-family: Heebo;
    font-size: 40px;
    font-style: normal;
    font-weight: 700;
    line-height: .8;
}

.new-right .info .pill-state,
.new-right2 .info .pill-state {
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

.form1,
.form2,
.form3,
.form4,
.form5,
.form6,
.form7,
.form8,
.form9,
.form10,
.form11 {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 8px;
    align-self: stretch;
    position: relative;
}

.form1 .section-input {
    margin-bottom: 8px;
}

.form1>.title,
.form2>.title,
.form3 .top-line>.title,
.form4>.title,
.form5>.title,
.form6 .top-line>.title,
.form7 .top-line>.title,
.form8>.title,
.form9>.title,
.form10>.title,
.form11>.title {
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
    width: 100%;
    position: relative;
}

.section-input .input-field,
.section-input .main-genre-select,
.section-input .song-price-select {
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
    max-width: 100%;
    box-sizing: border-box;
}

.section-input .input-fields {
    display: flex;
    align-items: center;
    gap: 2px;
    flex: 1 0 0;
    position: relative;
}

.section-input .input-fields .input-field.year {
    width: 100px;
    max-width: 100px;
    border-radius: 5px 0 0 5px;
}

.section-input .input-fields .input-field.name {
    flex: 1 0 0;
    border-radius: 0 5px 5px 0;
}

.section-input .input-fields .input-field.name.has-checkmark {
    padding-right: 54px;
}

.section-input .main-genre-select,
.section-input .song-price-select,
.section-input select.input-field {
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
    background: var(--primary) url('/icon/chevron-down.svg') no-repeat calc(100% - 12px) center;
    background-size: 20px;
    cursor: pointer;
    width: 100%;
    border: none;
    outline: none;
    padding: 12px;
    border-radius: 5px;
    color: #fff;
    font-family: Heebo;
    font-size: 16px;
    height: 46px;
    max-width: 100%;
}

.section-input .main-genre-select option,
.section-input .song-price-select option,
.section-input select.input-field option {
    color: #fff;
    background: var(--primary);
    border: none;
    outline: none;  
}

.section-input .main-genre-select option[disabled][selected],
.section-input .song-price-select option[disabled][selected],
.section-input select.input-field option[disabled][selected] {
    color: #6A6C6D;
}

.section-input select.input-field:disabled,
.section-input .main-genre-select:disabled,
.section-input .song-price-select:disabled {
    cursor: not-allowed;
    opacity: 0.5;
}

.form1 .section-input.has-checkmark .input-field,
.form2 .section-input.has-checkmark .input-field,
.form3 .section-input.has-checkmark .input-field,
.form4 .section-input.has-checkmark .input-field,
.form5 .section-input.has-checkmark .input-field,
.form5 .section-input.has-checkmark .main-genre-select,
.form5 .section-input.has-checkmark .song-price-select,
.form6 .section-input.has-checkmark .input-field,
.form7 .section-input.has-checkmark .input-field,
.form8 .section-input.has-checkmark .input-field,
.form9 .section-input.has-checkmark .input-field {
    padding-right: 94px;
}

.section-input .checkmark {
    position: absolute;
    right: 34px;
    top: 50%;
    transform: translateY(-50%);
}

.section-input .input-fields .checkmark {
    right: 38px;
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

.section-input .checkmark .icon {
    width: 18px;
    height: 20px;
    flex-shrink: 0;
    aspect-ratio: 9/10;
}

.icon-y {
    width: 18px;
    position: relative;
    right: 12px;
}

.icon-y-step3 {
    width: 18px;
    position: relative;
    right: 38px;
}

.icon-select {
    position: relative;
    right: 12px;
    cursor: pointer;
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

.form1 .section-input .spacer .play.visible,
.form2 .section-input .spacer .play.visible,
.form3 .section-input .spacer .play.visible,
.form4 .section-input .spacer .play.visible,
.form5 .section-input .spacer .play.visible,
.form6 .section-input .spacer .play.visible,
.form7 .section-input .spacer .play.visible,
.form8 .section-input .spacer .play.visible,
.form9 .section-input .spacer .play.visible,
.form10 .section-input .spacer .play.visible,
.form11 .section-input .spacer .play.visible {
    right: -2px;
    opacity: 1;
}

.spacer:hover .icon {
    filter: brightness(0) invert(1);
}

.play .icon {
    width: 18px;
    height: 20px;
    flex-shrink: 0;
    aspect-ratio: 9/10;
}

.form3 .section-input,
.form6 .section-input,
.form7 .section-input {
    pointer-events: none;
    opacity: 0.5;
}

.form3.active .section-input,
.form6.active .section-input,
.form7.active .section-input {
    pointer-events: auto;
    opacity: 1;
}

.form3 .top-line,
.form6 .top-line,
.form7 .top-line {
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
    background: var(--primary);
    cursor: pointer;
    transition: background 0.3s ease;
}

.form3.active .btn-switch,
.form6.active .btn-switch,
.form7.active .btn-switch {
    background: var(--Main-Colors-Strawberry, #D15);
}

.btn-switch .circle {
    width: 16px;
    height: 16px;
    margin-left: 2px;
    transition: margin-left 0.3s ease;
}

.form3.active .btn-switch .circle,
.form6.active .btn-switch .circle,
.form7.active .btn-switch .circle {
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
    z-index: 10;
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

/* Search */
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
    padding: 4px 0px 0px 7px;
}

.add-more .profile {
    display: flex;
    height: 32px;
    align-items: center;
    gap: 8px;
}

.add-more .profile .add-icon {
    display: flex;
    width: 32px;
    height: 32px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    aspect-ratio: 1/1;
    border-radius: 16px;
    background: var(--Main-Colors-Slate, #26282D);
}

.add-more .profile .add-icon .icons {
    display: flex;
    padding: 1px;
    align-items: center;
    cursor: pointer;
}

.add-more .profile .add-icon .icons img {
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
    background: rgba(255, 255, 255, 0.1);
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

.profile:hover .p {
    color: #FFF;
    position: relative;
    transform: translate(15px);
}

.search-item .spotify {
    width: 24px;
    height: 24px;
    aspect-ratio: 1/1;
    border-radius: 24px;
    background: url('/icon/spotify.png') lightgray 50% / cover no-repeat;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.button-arrow-top {
    display: flex;
    justify-content: center;
    width: 30px;
    height: 30px;
    padding: 12px 8px 10px 8px;
    align-items: center;
    gap: 10px;
    position: absolute;
    right: -10px;
    top: 20px;
    border-radius: 15px;
    background: var(--primary);
    cursor: pointer;
    transition: background 0.3s ease;
    rotate: 180deg;
}

/* Button Arrow Styles */
.button-arrow {
    display: flex;
    justify-content: center;
    width: 30px;
    height: 30px;
    padding: 12px 8px 10px 8px;
    align-items: center;
    gap: 10px;
    position: absolute;
    right: 20px;
    bottom: 20px;
    border-radius: 15px;
    background: var(--Strawberry);
    cursor: pointer;
    transition: background 0.3s ease;
}

.button-arrow.disabled {
    background: var(--Main-Colors-Dove, #6A6C6D);
    pointer-events: none;
    opacity: 0.6;
}

.button-arrow .down {
    width: auto;
    flex-shrink: 0;
}

.metas2 {
    display: flex;
    padding: 40px 0 40px 126px;
    flex-direction: column;
    align-items: flex-start;
    gap: 32px;
    align-self: stretch;
}

.metas2 .row1 {
    display: flex;
    align-items: flex-start;
    gap: 20px;
    align-self: stretch;
}

.metas2 .row1 .info {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1 0 0;
    flex-direction: row;
}

.metas2 .row1 .info .title {
    width: 180px;
    color: var(--Main-Colors-White, #FFF);
    font-family: Heebo;
    font-size: 20px;
    font-style: normal;
    font-weight: 300;
    line-height: normal;
    letter-spacing: 1px;
}

.metas2 .row1 .info .value {
    color: var(--Main-Colors-White, #FFF);
    font-family: Heebo;
    font-size: 20px;
    font-style: normal;
    font-weight: 700;
    line-height: normal;
    letter-spacing: 1px;
}

/* Metas3 Styles */
.metas3 {
    display: flex;
    width: 889px;
    padding-left: 126px;
    flex-direction: column;
    align-items: flex-start;
    gap: 32px;
    align-self: stretch;
}

.metas3 .row1,
.metas3 .row2 {
    display: flex;
    align-items: flex-start;
    gap: 20px;
    align-self: stretch;
}

.metas3 .row1 .form,
.metas3 .row2 .form {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 8px;
    flex: 1 0 0;
    max-width: 100%;
}

.metas3 .row1 .form .title,
.metas3 .row2 .form .title {
    color: var(--Main-Colors-White, #FFF);
    font-family: Heebo;
    font-size: 14px;
    font-style: normal;
    font-weight: 300;
    line-height: 1;
    letter-spacing: 0.7px;
    text-transform: uppercase;
}

/* Form-left Styles */
.form-left {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 32px;
    width: 404px;
    padding: 20px;
    border: none;
}

@media (min-width: 1440px) and (max-width: 1599px) {
    .cards-upload-file {
        width: clamp(308px, calc(308px + 54 * (100vw - 1440px) / 159), 362px);
        height: auto;
    }
}

@media (min-width: 1600px) and (max-width: 2075px) {
    .cards-upload-file {
        width: clamp(362px, calc(-171.3333px + 33.3333vw), 520px);
        height: auto;
    }
}

@media (min-width: 2075px) and (max-width: 2560px) {
    .cards-upload-file {
        width: clamp(520px, calc(-173.048px + 33.3999vw), 682px);
        height: auto;
    }
}
</style>