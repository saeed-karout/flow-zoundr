<template>
    <div class="right" :class="{ 'slide-up': isSlidingUp }">
        <div class="form1">
            <div class="title">Von Wem ist diese Single?</div>
            <div v-for="(input, index) in artistInputs" :key="index" class="section-input"
                :class="{ 'is-hovered': input.isHovered, 'has-checkmark': input.isSelected }"
                @mouseenter="input.isHovered = true; $emit('update:artistInputs', artistInputs)"
                @mouseleave="input.isHovered = false; $emit('update:artistInputs', artistInputs)">
                <input type="text" class="input-field" v-model="input.searchQuery" placeholder="Künstler"
                    @focus="$emit('update:showSearchResults', index); $emit('updateSearchResults', index); input.isFocused = true"
                    @blur="handleBlur(index)" @input="$emit('updateSearchResults', index)" />
                <div v-if="input.isSelected" class="checkmark">
                    <img src="../../../assets/icons/y.png" class="icon-y" alt="checkmark icon" />
                </div>
                <div v-if="index === 0 && input.isSelected && input.isHovered && artistInputs.length < 2"
                    class="plus-icon" @click="$emit('addArtistInput')">

                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>


                </div>
                <div v-if="index === 1 && input.isHovered && artistInputs.length === 2" class="minus-icon"
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
                    <div class="search-item" v-for="(result, resultIndex) in filteredSearchResults" :key="result.id"
                        @click="$emit('selectSearchResult', result, index)">
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
            <div class="title">Wie lautet der Titel?</div>
            <div class="section-input" :class="{ 'is-hovered': isHoveredForm2, 'has-checkmark': isForm2Selected }"
                @mouseenter="$emit('update:isHoveredForm2', true)" @mouseleave="$emit('update:isHoveredForm2', false)">
                <input type="text" class="input-field" v-model="localSearchQuery2" placeholder="Releasetitel"
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
                'has-checkmark': isForm3Selected
            }" @mouseenter="$emit('update:isHoveredForm3', true)" @mouseleave="$emit('update:isHoveredForm3', false)">
                <input type="text" class="input-field" v-model="localSearchQuery3" placeholder="Release Untertitel"
                    :disabled="!isForm3Active"
                    @input="$emit('update:isForm3Selected', isForm3Active && localSearchQuery3.trim() !== '')" />
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
        <div class="form4">
            <div class="title">Release Date</div>
            <div class="section-input"
                :class="{ 'is-hovered': isHoveredForm4, 'is-focused': isInputFocused, 'has-checkmark': isForm4Selected }"
                @mouseenter="$emit('update:isHoveredForm4', true)"
                @mouseleave="$emit('update:isHoveredForm4', false); if (!isInputFocused) $emit('update:isCalendarVisible', false)">
                <input type="text" class="input-field" :value="selectedDate" readonly
                    @focus="$emit('update:isInputFocused', true); $emit('update:isCalendarVisible', true)"
                    placeholder="21/07/25" />
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
import { computed } from 'vue';
import CalendarPicker from '@/components/CalendarPicker.vue';
import iconPlay from '@/assets/icons/play.png'
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
    isSlidingUp: { type: Boolean, default: false }
});

const emit = defineEmits([
    'update:artistInputs', 'update:showSearchResults', 'update:searchQuery2', 'update:searchQuery3',
    'update:selectedDate', 'update:isForm2Selected', 'update:isForm3Selected', 'update:isForm4Selected',
    'toggleForm3', 'update:isHoveredForm2', 'update:isHoveredForm3', 'update:isHoveredForm4',
    'update:isInputFocused', 'update:isCalendarVisible', 'openVideoPopup', 'addArtistInput',
    'removeArtistInput', 'selectSearchResult', 'updateSearchResults'
]);

const handleDateSelect = (date) => {
    console.log('📅 RightSection: تم اختيار التاريخ:', date);
    
    // إرسال التاريخ إلى الـ parent
    emit('update:selectedDate', date);
    
    // إغلاق الكالندر وإلغاء التركيز
    emit('update:isCalendarVisible', false);
    emit('update:isInputFocused', false);
    
    // تعيين isForm4Selected إلى true
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
    set: (value) => emit('update:searchQuery3', value)
});

const handleBlur = (index) => {
    setTimeout(() => {
        props.artistInputs[index].isFocused = false;
        if (!props.artistInputs[index].searchQuery.trim()) {
            emit('update:showSearchResults', null);
            props.artistInputs[index].isSelected = false;
        }
        emit('update:artistInputs', props.artistInputs);
    }, 200);
};
</script>

<style lang="scss" scoped>
.right {
    display: flex;
    width: 100%;
    flex-direction: column;
    align-items: flex-start;
    gap: 32px;
    transition: transform 0.5s ease, opacity 0.5s ease;
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
    max-height: 63.2px;
}

.form1 .section-input {
    // margin-bottom: 8px;
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
    // background: var(--secondary);
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
    height: 20px;
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


@media (max-width:1599px) {
    .right {
        gap: 20px;
        padding-right: 60px; //to 73px

    }
}

@media (min-width:1600px) and (max-width:2074px) {
    .right {
        gap: 32px;
        padding-right: 73px; //to 113px

    }
}

@media (min-width:2075px) and (max-width:2560px) {
    .right {
        gap: 32px;
        padding-right: 113px; //to 153px

    }
}
</style>