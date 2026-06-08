<template>
    <div class="new-right2" :class="{ 'slide-in': isNewRight2Visible }">
        <!-- القسم المشترك -->
        <div class="info">
            <div class="title">{{ artistInputs[0]?.searchQuery || 'Diggie' }}</div>
            <div class="subtitle">{{ searchQuery2 || 'Summer Feeling' }}</div>
            <div class="pill-state">
                <div class="date">{{ selectedDate || '21/07/2025' }}</div>
            </div>
            <div class="summary">
                <div class="rows">
                    <div class="summary-item">
                        <span class="label">Release Preis:</span>
                        <span class="value">{{ releasePrice || 'undefined' }}</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">Song Preis:</span>
                        <span class="value">{{ songPrice || 'undefined' }}</span>
                    </div>
                </div>
                <div class="rows">
                    <div class="summary-item">
                        <span class="label">Hauptgenre:</span>
                        <span class="value">{{ mainGenre || 'undefined' }}</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">Subgenre:</span>
                        <span class="value">{{ subGenre || 'undefined' }}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- القسم الأول (metas) يظهر عندما showFinalPage = false -->
        <div v-if="!showFinalPage" class="metas" :class="{ visible: isNewFormsVisible }">
            <div class="row1">
                <div class="form8">
                    <div class="title">Label Name</div>
                    <div class="section-input"
                        :class="{ 'is-hovered': isHoveredForm8, 'has-checkmark': isForm8Selected }"
                        @mouseenter="$emit('update:isHoveredForm8', true)"
                        @mouseleave="$emit('update:isHoveredForm8', false)">
                        <input type="text" class="input-field" v-model="localLabelName" placeholder="Label Name"
                            @input="updateLabelNameSelected" />
                        <div v-if="isForm8Selected" class="checkmark">
                            <img src="../../../assets/icons/y.png" class="icon-y" alt="checkmark icon" />
                        </div>
                        <div class="spacer" @click="$emit('openVideoPopup', 'form8')">
                            <div class="play" :class="{ visible: isHoveredForm8 }">
                                <img :src="iconPlay" class="icon" alt="play icon" />
                            </div>
                        </div>
                    </div>
                </div>
                <div class="form9">
                    <div class="title">Produktionsjahr</div>
                    <div class="section-input"
                        :class="{ 'is-hovered': isHoveredForm9, 'has-checkmark': isForm9Selected }"
                        @mouseenter="$emit('update:isHoveredForm9', true)"
                        @mouseleave="$emit('update:isHoveredForm9', false)">
                        <input type="text" class="input-field" v-model="localProductionYear" placeholder="Produktionsjahr"
                            @input="updateProductionYearSelected" />
                        <div v-if="isForm9Selected" class="checkmark">
                            <img src="../../../assets/icons/y.png" class="icon-y" alt="checkmark icon" />
                        </div>
                        <div class="spacer" @click="$emit('openVideoPopup', 'form9')">
                            <div class="play" :class="{ visible: isHoveredForm9 }">
                                <img :src="iconPlay" class="icon" alt="play icon" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row2">
                <div class="form10">
                    <div class="title">Wie lautet deine C-Line?</div>
                    <div class="section-input"
                        :class="{ 'is-hovered': isHoveredForm10, 'has-checkmark': isForm10Selected }"
                        @mouseenter="$emit('update:isHoveredForm10', true)"
                        @mouseleave="$emit('update:isHoveredForm10', false)">
                        <input type="text" class="input-field-small" v-model="localCLineYear" placeholder="C-Line Jahr"
                            @input="updateCLineSelected" />
                        <input type="text" class="border-r" v-model="localCLineName" placeholder="C-Line Name"
                            @input="updateCLineSelected" />
                        <div v-if="isForm10Selected" class="checkmark">
                            <img src="../../../assets/icons/y.png" class="icon-y" alt="checkmark icon" />
                        </div>
                        <div class="spacer" @click="$emit('openVideoPopup', 'form10')">
                            <div class="play" :class="{ visible: isHoveredForm10 }">
                                <img :src="iconPlay" class="icon" alt="play icon" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row3">
                <div class="form11">
                    <div class="title">Wie lautet deine P-Line?</div>
                    <div class="section-input"
                        :class="{ 'is-hovered': isHoveredForm11, 'has-checkmark': isForm11Selected }"
                        @mouseenter="$emit('update:isHoveredForm11', true)"
                        @mouseleave="$emit('update:isHoveredForm11', false)">
                        <input type="text" class="input-field-small" v-model="localPLineYear" placeholder="P-Line Jahr"
                            @input="updatePLineSelected" />
                        <input type="text" class="border-r" v-model="localPLineName" placeholder="P-Line Name"
                            @input="updatePLineSelected" />
                        <div v-if="isForm11Selected" class="checkmark">
                            <img src="../../../assets/icons/y.png" class="icon-y" alt="checkmark icon" />
                        </div>
                        <div class="spacer" @click="$emit('openVideoPopup', 'form11')">
                            <div class="play" :class="{ visible: isHoveredForm11 }">
                                <img :src="iconPlay" class="icon" alt="play icon" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- القسم الثاني (info2 من finalPage) يظهر عندما showFinalPage = true -->
        <div v-else class="info2" :class="{ visible: isNewFormsVisible }">
            <div class="row1">
                <div class="info">
                    <div class="label">Label:</div>
                    <div class="value">{{ labelName || 'undefined' }}</div>
                </div>
                <div class="info">
                    <div class="label">C-Line:</div>
                    <div class="value">{{ cLineName && cLineYear ? `${cLineYear} ${cLineName}` : 'undefined' }}</div>
                </div>
            </div>
            <div class="row1">
                <div class="info">
                    <div class="label">P-Line:</div>
                    <div class="value">{{ pLineName && pLineYear ? `${pLineYear} ${pLineName}` : 'undefined' }}</div>
                </div>
                <div class="info">
                    <div class="label">Produktionsjahr:</div>
                    <div class="value">{{ productionYear || 'undefined' }}</div>
                </div>
            </div>
            <div class="row1">
                <div class="info">
                    <div class="label">GTIN:</div>
                    <div class="value">{{ gtin || '–' }}</div>
                </div>
                <div class="info">
                    <div class="label">Katalognummer:</div>
                    <div class="value">{{ catalogNumber || '–' }}</div>
                </div>
            </div>
        </div>

    </div>
</template>

<script setup>
import { computed, watch, ref, onMounted } from 'vue';
import iconPlay from '@/assets/icons/play.png';

const props = defineProps({
    artistInputs: { type: Array, required: true },
    searchQuery2: { type: String, default: '' },
    selectedDate: { type: String, default: null },
    releasePrice: { type: String, default: '' },
    songPrice: { type: String, default: '' },
    mainGenre: { type: String, default: '' },
    subGenre: { type: String, default: '' },
    labelName: { type: String, default: '' },
    productionYear: { type: String, default: '' },
    cLineYear: { type: String, default: '' },
    cLineName: { type: String, default: '' },
    pLineYear: { type: String, default: '' },
    pLineName: { type: String, default: '' },
    gtin: { type: String, default: '' },
    catalogNumber: { type: String, default: '' },
    isNewRight2Visible: { type: Boolean, default: false },
    isNewFormsVisible: { type: Boolean, default: false },
    isForm8Selected: { type: Boolean, default: false },
    isForm9Selected: { type: Boolean, default: false },
    isForm10Selected: { type: Boolean, default: false },
    isForm11Selected: { type: Boolean, default: false },
    isHoveredForm8: { type: Boolean, default: false },
    isHoveredForm9: { type: Boolean, default: false },
    isHoveredForm10: { type: Boolean, default: false },
    isHoveredForm11: { type: Boolean, default: false },
    showFinalPage: { type: Boolean, default: false },
    iconPlay: { type: String, required: true }
});

const emit = defineEmits([
    'update:labelName', 'update:productionYear', 'update:cLineYear', 'update:cLineName',
    'update:pLineYear', 'update:pLineName', 'update:isForm8Selected', 'update:isForm9Selected',
    'update:isForm10Selected', 'update:isForm11Selected', 'update:isHoveredForm8',
    'update:isHoveredForm9', 'update:isHoveredForm10', 'update:isHoveredForm11',
    'openVideoPopup', 'next'
]);

// الحصول على السنة الحالية
const currentYear = ref(new Date().getFullYear().toString());

// الحصول على اسم الفنان من artistInputs
const getArtistName = () => {
    return props.artistInputs[0]?.searchQuery || '';
};

const localLabelName = computed({
    get: () => props.labelName,
    set: (value) => emit('update:labelName', value)
});

const localProductionYear = computed({
    get: () => props.productionYear,
    set: (value) => emit('update:productionYear', value)
});

const localCLineYear = computed({
    get: () => props.cLineYear,
    set: (value) => emit('update:cLineYear', value)
});

const localCLineName = computed({
    get: () => props.cLineName,
    set: (value) => emit('update:cLineName', value)
});

const localPLineYear = computed({
    get: () => props.pLineYear,
    set: (value) => emit('update:pLineYear', value)
});

const localPLineName = computed({
    get: () => props.pLineName,
    set: (value) => emit('update:pLineName', value)
});

// تحديث حالة isForm8Selected بناءً على قيمة Label Name
const updateLabelNameSelected = () => {
    const isSelected = localLabelName.value.trim() !== '';
    emit('update:isForm8Selected', isSelected);
};

// تحديث حالة isForm9Selected بناءً على قيمة Production Year
const updateProductionYearSelected = () => {
    const isSelected = localProductionYear.value.trim() !== '';
    emit('update:isForm9Selected', isSelected);
};

// تحديث حالة isForm10Selected بناءً على قيم C-Line
const updateCLineSelected = () => {
    const isSelected = localCLineYear.value.trim() !== '' && localCLineName.value.trim() !== '';
    emit('update:isForm10Selected', isSelected);
};

// تحديث حالة isForm11Selected بناءً على قيم P-Line
const updatePLineSelected = () => {
    const isSelected = localPLineYear.value.trim() !== '' && localPLineName.value.trim() !== '';
    emit('update:isForm11Selected', isSelected);
};

// تهيئة القيم الافتراضية
const initializeDefaultValues = () => {
    const artistName = getArtistName();
    
    // تعيين Label Name باسم الفنان إذا كان فارغاً
    if ((!props.labelName || props.labelName === '') && artistName) {
        emit('update:labelName', artistName);
        emit('update:isForm8Selected', true);
    } else if (props.labelName && props.labelName !== '') {
        emit('update:isForm8Selected', true);
    }
    
    // تعيين Produktionsjahr بالسنة الحالية إذا كان فارغاً
    if (!props.productionYear || props.productionYear === '') {
        emit('update:productionYear', currentYear.value);
        emit('update:isForm9Selected', true);
    } else if (props.productionYear && props.productionYear !== '') {
        emit('update:isForm9Selected', true);
    }
    
    // تعيين C-Line Jahr بالسنة الحالية إذا كان فارغاً
    if (!props.cLineYear || props.cLineYear === '') {
        emit('update:cLineYear', currentYear.value);
    }
    
    // تعيين C-Line Name باسم الفنان إذا كان فارغاً
    if ((!props.cLineName || props.cLineName === '') && artistName) {
        emit('update:cLineName', artistName);
    }
    
    // تعيين P-Line Jahr بالسنة الحالية إذا كان فارغاً
    if (!props.pLineYear || props.pLineYear === '') {
        emit('update:pLineYear', currentYear.value);
    }
    
    // تعيين P-Line Name باسم الفنان إذا كان فارغاً
    if ((!props.pLineName || props.pLineName === '') && artistName) {
        emit('update:pLineName', artistName);
    }
    
    // تحديث حالة C-Line و P-Line
    updateCLineSelected();
    updatePLineSelected();
};

// مراقبة تغييرات Label Name
watch(localLabelName, () => {
    updateLabelNameSelected();
}, { immediate: true });

// مراقبة تغييرات Production Year
watch(localProductionYear, () => {
    updateProductionYearSelected();
}, { immediate: true });

// مراقبة تغييرات C-Line
watch([localCLineYear, localCLineName], () => {
    updateCLineSelected();
}, { immediate: true });

// مراقبة تغييرات P-Line
watch([localPLineYear, localPLineName], () => {
    updatePLineSelected();
}, { immediate: true });

// مراقبة تغييرات artistInputs لتحديث Label Name, C-Line Name, P-Line Name تلقائياً
watch(() => props.artistInputs[0]?.searchQuery, (newArtistName, oldArtistName) => {
    if (newArtistName && newArtistName !== oldArtistName) {
        // تحديث Label Name إذا كان لا يزال يساوي الاسم القديم أو إذا كان فارغاً
        if (!props.labelName || props.labelName === oldArtistName || props.labelName === '') {
            emit('update:labelName', newArtistName);
            updateLabelNameSelected();
        }
        
        // تحديث C-Line Name إذا كان لا يزال يساوي الاسم القديم أو إذا كان فارغاً
        if (!props.cLineName || props.cLineName === oldArtistName || props.cLineName === '') {
            emit('update:cLineName', newArtistName);
        }
        
        // تحديث P-Line Name إذا كان لا يزال يساوي الاسم القديم أو إذا كان فارغاً
        if (!props.pLineName || props.pLineName === oldArtistName || props.pLineName === '') {
            emit('update:pLineName', newArtistName);
        }
        
        // تحديث الحالات
        updateCLineSelected();
        updatePLineSelected();
    }
}, { immediate: true });

// تنفيذ التهيئة عند تحميل المكون
onMounted(() => {
    initializeDefaultValues();
});

// مراقبة التغييرات في props لإعادة التهيئة إذا لزم الأمر
watch(() => [props.artistInputs, props.labelName, props.productionYear, props.cLineYear, props.cLineName, props.pLineYear, props.pLineName], () => {
    initializeDefaultValues();
}, { immediate: true, deep: true });
</script>

<style lang="scss" scoped>
.new-right2 {
    display: flex;
    width: 889px;
    padding-top: 28px;
    height: 100%    ;
    flex-direction: column;
    align-items: flex-start;
    gap: 32px;
    transform: translateY(100%);
    opacity: 0;
    transition: transform 0.5s ease, opacity 0.5s ease;
    flex-grow: 1;
}

.new-right2.slide-in {
    transform: translateY(0);
    opacity: 1;
}

.new-right2 .info {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 24px;
}

.new-right2 .info .title {
    color: #FFF;
    font-family: Heebo;
    font-size: 58px;
    font-style: normal;
    font-weight: 700;
    line-height: 0.8;
    text-transform: uppercase;
}

.new-right2 .info .subtitle {
    color: #FFF;
    font-family: Heebo;
    font-size: 40px;
    font-style: normal;
    font-weight: 700;
    line-height: 0.8;
}

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

.summary {
    display: flex;
    padding: 40px 0 40px 126px;
    flex-direction: column;
    align-items: flex-start;
    gap: 32px;
    align-self: stretch;
}

.summary .rows {
    display: flex;
    align-items: flex-start;
    gap: 20px;
    align-self: stretch;
}

.summary-item {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1 0 0;
}

.summary-item .label {
    width: 180px;
    color: var(--Main-Colors-White, #FFF);
    font-family: Heebo;
    font-size: 20px;
    font-style: normal;
    font-weight: 300;
    line-height: 1;
    letter-spacing: 1px;
}

.summary-item .value {
    color: var(--Main-Colors-White, #FFF);
    font-family: Heebo;
    font-size: 20px;
    font-style: normal;
    font-weight: 700;
    line-height: 1;
    letter-spacing: 1px;
    min-width: 120px;

    display: -webkit-box;
-webkit-box-orient: vertical;
-webkit-line-clamp: 1;
flex: 1 0 0;
overflow: hidden;
text-overflow: ellipsis;
}

.metas {
    display: flex;
    padding-left: 126px;
    flex-direction: column;
    justify-content: flex-end;
    align-items: flex-start;
    gap: 32px;
    flex: 1 0 0;
    opacity: 0;
    transition: opacity 0.5s ease;
      width: 100%;

}

.metas.visible {
    opacity: 1;
}

.metas .row1 {
    display: flex;
    align-items: flex-start;
    gap: 20px;
    align-self: stretch;
}

.metas .row1 .form8, .row1 .form9 {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 8px;
    flex: 1 0 0;
}

.metas .row2, .metas .row3 {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 32px;
    align-self: stretch;
}

.row2 .form10 {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 8px;
    align-self: stretch;
}

.row3 .form11 {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 8px;
    align-self: stretch;
}

.title {
    color: var(--Main-Colors-White, #FFF);
    font-family: Heebo;
    font-size: 14px;
    font-style: normal;
    font-weight: 300;
    line-height: 1;
    letter-spacing: 0.7px;
    text-transform: uppercase;
}

.form10 .section-input, .form11 .section-input {
    display: flex;
    align-items: flex-start;
    gap: 2px;
    align-self: stretch;
}

.w-l {
    width: 100px;
    max-width: 100px;
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
    box-sizing: border-box;
}

.border-r {
    border-radius: 0 5px 5px 0;
    display: flex;
    padding: 12px;
    justify-content: space-between;
    align-items: center;
    flex: 1 0 0;
    background: var(--primary);
    outline: none;
    border: 0;
    color: #fff;
    font-family: Heebo;
    font-size: 16px;
    height: 46px;
    box-sizing: border-box;
}

.border-r:hover {
    border-radius: 0;
}

.spacer:hover .border-r, .spacer:hover .input-field, .input-field:hover {
    border-radius: 0;
}

.input-field-small {
    display: flex;
    padding: 12px;
    justify-content: space-between;
    align-items: center;
    flex: 1 0 0;
    border-radius: 5px 0 0 5px;
    background: var(--primary);
    outline: none;
    border: 0;
    color: #fff;
    font-family: Heebo;
    font-size: 16px;
    height: 46px;
    box-sizing: border-box;
    max-width: 100px;
    width: 100px;
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

/* أنماط info2 من finalPage */
.info2 {
    display: flex;
    padding-left: 126px;
    flex-direction: column;
    align-items: flex-start;
    gap: 32px;
    align-self: stretch;
    flex-grow: 1;
    justify-content: flex-start;
    opacity: 0;
    transition: opacity 0.5s ease;
}

.info2.visible {
    opacity: 1;
}

.info2 .row1 {
    display: flex;
    align-items: flex-start;
    gap: 20px;
    align-self: stretch;
}

.info2 .row1 .info {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-direction: row;
}

.info2 .row1 .info .label {
    width: 180px;
    color: var(--Main-Colors-White, #FFF);
    font-family: Heebo;
    font-size: 20px;
    font-style: normal;
    font-weight: 300;
    line-height: 1;
    letter-spacing: 1px;
    overflow: hidden;
    text-overflow: ellipsis;
}

.info2 .row1 .info .value {
    color: var(--Main-Colors-White, #FFF);
    font-family: Heebo;
    font-size: 20px;
    font-style: normal;
    font-weight: 700;
    line-height: 1;
    letter-spacing: 1px;
}

.row>*{
    padding-right: 0;
    padding-left: 0px;
    margin-right: 0px;
    margin-left: 0px;
}

/* أنماط btn-right من finalPage */
.btn-right {
    position: absolute;
    right: -10px;
    bottom: -0px;
    border-radius: 5px;
    background: #D15;
    display: flex;
    padding: 12px 20px 12px 20px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    height: 36px;
    color: var(--Main-Colors-White, #FFF);
    font-family: Heebo;
    font-size: 16px;
    font-style: normal;
    font-weight: 400;
    line-height: 0.9;
    text-transform: uppercase;
    cursor: pointer;
    z-index: 11;

    &:hover{
        transition: .3s ease;
        background: var(--dark-red);
    }
}


@media (min-width:1440px) and (max-width:1599px) {
    .new-right2 .info .title{
        font-size: 48px;
    }

    .new-right2 .info .subtitle{
        font-size: 32px;
    }

    .new-right2 .info{
        gap: 16px;
    }

    .info2{
        padding-left: 89px;
    }
    .summary-item .label,.info2 .row1 .info .label{
        width: 120px;
        font-size: 16px;
    }

    .summary-item .value,.info2 .row1 .info .value{
        width: 85px;
        font-size: 16px;
    }

    .title{
        font-size: 12px;
    }

    .metas .row1 .form8, .row1 .form9,.metas .row2, .metas .row3{
        max-height: 63px;
    }

    .metas{
        gap: 20px;
        padding-left: 90px;
        position: relative;
        top: -35px;
    }

    .summary{
        padding: 0 0 28px 103px;
    }


      .new-right2{
        padding-right: 60px;
    }
 
}


@media (min-width:1600px) and (max-width:2074px) {
    .new-right2 .info .title{
        font-size: 58px;
    }

    .info2 .row1 .info .label{
        width: 170px;
    }

    .info2{
        padding-left: 103px;
    }

    .summary{
        padding: 0 0 28px 103px;
    }

     .summary-item .label{
        width: 170px;
        font-size: 20px;
    }

    .summary-item .value{
        width: 170px;
        font-size: 20px;
    }
    .info2 .row1 .info .value{
        min-width: 170px;
    }


     .metas{
        gap: 32px;
        padding-left: 103px;
    }

     .new-right2{
        padding-right: 74px;
    }
}
@media (max-width:1790px) {
        .summary-item .value{
            max-width: 140px;
        }
}

@media (min-width:2075px) and (max-width:2560px) {
    .new-right2 .info .title{
        font-size: 48px;
    }

    .info2 .row1 .info .label{
        width: 180px;
    }

    .info2{
        padding-left: 126px;
    }

    .info2 .row1 .info .value{
        width: 120px;
    }

    .new-right2{
        padding-right: 113px;
    }
}
</style>