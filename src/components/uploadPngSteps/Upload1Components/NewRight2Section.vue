<template>
    <div class="new-right2" :class="{ 
        'slide-in': isNewRight2Visible && !isLeaving,
        'slide-out': isLeaving,
        'entering': isEntering,
        'leaving': isLeaving
    }">
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
                        <span class="value">{{ formatPrice(effectiveReleasePrice) }} EUR</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">Song Preis:</span>
                        <span class="value">{{ formatPrice(effectiveSongPrice) }} EUR</span>
                    </div>
                </div>
                <div class="rows">
                   <div class="summary-item">
                        <span class="label">Hauptgenre:</span>
                        <span class="value">{{ truncateText(mainGenre, 24) || 'undefined' }}</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">Subgenre:</span>
                        <span class="value">{{ truncateText(subGenre, 20) || 'Nicht verfügbar' }}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- القسم الأول (metas) -->
        <div v-if="!showFinalPage" class="metas" :class="{ visible: isNewFormsVisible }">
            <div class="row1">
                <div class="form8">
                    <div class="title">Label Name</div>
                    <div class="section-input"
                        :class="{ 'is-hovered': isHoveredForm8, 'has-checkmark': isForm8Selected}"
                        @mouseenter="$emit('update:isHoveredForm8', true)"
                        @mouseleave="$emit('update:isHoveredForm8', false)">
                        <input type="text" class="input-field" :class="{ 'is-correction': isCorrected('label') }" v-model="localLabelName" placeholder="Label Name"
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
                        :class="{ 'is-hovered': isHoveredForm9, 'has-checkmark': isForm9Selected}"
                        @mouseenter="$emit('update:isHoveredForm9', true)"
                        @mouseleave="$emit('update:isHoveredForm9', false)">
                        <input 
                            type="text" 
                            class="input-field" :class="{ 'is-correction': isCorrected('production_year') }" 
                            v-model="localProductionYear" 
                            placeholder="Produktionsjahr"
                            maxlength="4"
                            @input="(e) => { 
                                const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                                emit('update:productionYear', value);
                                updateProductionYearSelected();
                            }"
                        />
                        <div v-if="isForm9Selected && isValidYear(localProductionYear)" class="checkmark">
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
                        :class="{ 'is-hovered': isHoveredForm10, 'has-checkmark': isForm10Selected}"
                        @mouseenter="$emit('update:isHoveredForm10', true)"
                        @mouseleave="$emit('update:isHoveredForm10', false)">
                        <input 
                            type="text" 
                            class="input-field-small" :class="{ 'is-correction': isCorrected('c_line_name') || isCorrected('c_line_year') }" 
                            v-model="localCLineYear" 
                            placeholder="Jahr"
                            maxlength="4"
                            @input="(e) => {
                                const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                                emit('update:cLineYear', value);
                                updateCLineSelected();
                            }"
                        />
                        <input 
                            type="text" 
                            :class="{ 'is-correction': isCorrected('c_line_name') || isCorrected('c_line_year') }" 
                            class="border-r" 
                            v-model="localCLineName" 
                            placeholder="C-Line Name"
                            @input="updateCLineSelected" 
                        />
                        <div v-if="isForm10Selected && isValidYear(localCLineYear)" class="checkmark">
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
                        :class="{ 'is-hovered': isHoveredForm11, 'has-checkmark': isForm11Selected}"
                        @mouseenter="$emit('update:isHoveredForm11', true)"
                        @mouseleave="$emit('update:isHoveredForm11', false)">
                        <input 
                            type="text" 
                            class="input-field-small" :class="{ 'is-correction': isCorrected('p_line_name') || isCorrected('p_line_year') }" 
                            v-model="localPLineYear" 
                            placeholder="Jahr"
                            maxlength="4"
                            @input="(e) => {
                                const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                                emit('update:pLineYear', value);
                                updatePLineSelected();
                            }"
                        />
                        <input 
                            type="text" 
                            :class="{ 'is-correction': isCorrected('p_line_name') || isCorrected('p_line_year') }" 
                            class="border-r" 
                            v-model="localPLineName" 
                            placeholder="P-Line Name"
                            @input="updatePLineSelected" 
                        />
                        <div v-if="isForm11Selected && isValidYear(localPLineYear)" class="checkmark">
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

        <!-- القسم الثاني (info2 من finalPage) -->
        <div v-else class="info2" :class="{ visible: isNewFormsVisible }">
            <div class="row1">
                <div class="info">
                    <div class="label">Label:</div>
                    <div class="value">{{ labelName || 'undefined' }}</div>
                </div>


                <div class="info">
                    <div class="label">Produktionsjahr:</div>
                    <div class="value">{{ productionYear || 'undefined' }}</div>
                </div>
                
            </div>
            <div class="row1">
                <div class="info">
                    <div class="label">P-Line:</div>
                    <div class="value">{{ pLineName && pLineYear ? `${pLineYear} ${pLineName}` : 'undefined' }}</div>
                </div>
                

                <div class="info">
                    <div class="label">C-Line:</div>
                    <div class="value">{{ cLineName && cLineYear ? `${cLineYear} ${cLineName}` : 'undefined' }}</div>
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
import { computed, watch, ref, onMounted, nextTick } from 'vue';
import { useCorrections } from '@/composables/useCorrections';
import iconPlay from '@/assets/icons/play.png';
import { useReleaseStore } from '@/stores/release';

// حقول مطلوب تصحيحها (Korrektur) → بوردر أحمر على الحقل المعني.
const { isCorrected } = useCorrections();

const releaseStore = useReleaseStore();

const isMeaningfulPrice = (v) =>
    v !== null && v !== undefined && v !== '' && !Number.isNaN(Number(v));

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
    iconPlay: { type: String, required: true },
    isLeaving: { type: Boolean, default: false },
    isEntering: { type: Boolean, default: false }
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

// 🔥 متغير لتتبع ما إذا تم التهيئة أم لا
const isInitialized = ref(false);
// 🔥 متغير لتتبع ما إذا كان المستخدم قد قام بتعديل القيم يدوياً
const isUserEditing = ref(false);

// الحصول على اسم الفنان من artistInputs
const getArtistName = () => {
    return props.artistInputs[0]?.searchQuery || '';
};

const localLabelName = computed({
    get: () => props.labelName,
    set: (value) => {
        isUserEditing.value = true;
        emit('update:labelName', value);
    }
});

const localProductionYear = computed({
    get: () => props.productionYear,
    set: (value) => {
        isUserEditing.value = true;
        emit('update:productionYear', value);
    }
});

const localCLineYear = computed({
    get: () => props.cLineYear,
    set: (value) => {
        isUserEditing.value = true;
        emit('update:cLineYear', value);
    }
});

// ========== 🔥 دالة اختصار النص ==========
const truncateText = (text, maxLength = 15) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

const localCLineName = computed({
    get: () => props.cLineName,
    set: (value) => {
        isUserEditing.value = true;
        emit('update:cLineName', value);
    }
});

// ========== 🔥 دالة تنسيق الأرقام ==========
const formatPrice = (value) => {
    if (!value && value !== 0) return '0,00';
    let num = typeof value === 'string' ? parseFloat(value.replace(',', '.')) : value;
    if (isNaN(num)) return '0,00';
    return num.toFixed(2).replace('.', ',');
};

// ✅ القيمة الفعّالة للسعر: من الـ prop أولاً، وإلا من الـ store (draftRelease من الخادم
//    ثم metasData) — فيظهر السعر المخزَّن بدل 0,00 عند فراغ الـ prop بعد التنقّل.
const effectiveReleasePrice = computed(() => {
    if (isMeaningfulPrice(props.releasePrice)) return props.releasePrice;
    const d = releaseStore.draftRelease?.release_price;
    if (isMeaningfulPrice(d)) return d;
    const m = releaseStore.metasData?.releasePrice;
    if (isMeaningfulPrice(m)) return m;
    return props.releasePrice;
});

const effectiveSongPrice = computed(() => {
    if (isMeaningfulPrice(props.songPrice)) return props.songPrice;
    const d = releaseStore.draftRelease?.price_per_song;
    if (isMeaningfulPrice(d)) return d;
    const m = releaseStore.metasData?.songPrice;
    if (isMeaningfulPrice(m)) return m;
    return props.songPrice;
});

const localPLineYear = computed({
    get: () => props.pLineYear,
    set: (value) => {
        isUserEditing.value = true;
        emit('update:pLineYear', value);
    }
});

const localPLineName = computed({
    get: () => props.pLineName,
    set: (value) => {
        isUserEditing.value = true;
        emit('update:pLineName', value);
    }
});

// تحديث حالة isForm8Selected
const updateLabelNameSelected = () => {
    const isSelected = localLabelName.value.trim() !== '';
    emit('update:isForm8Selected', isSelected);
};

// تحديث حالة isForm9Selected
const updateProductionYearSelected = () => {
    const value = localProductionYear.value.trim();
    const isValid = isValidYear(value);
    emit('update:isForm9Selected', isValid);
    if (value && !isValid) {
        console.warn('⚠️ Produktionsjahr يجب أن يكون 4 أرقام:', value);
    }
};

// تحديث حالة isForm10Selected
const updateCLineSelected = () => {
    const yearValid = isValidYear(localCLineYear.value.trim());
    const nameValid = localCLineName.value.trim() !== '';
    const isSelected = yearValid && nameValid;
    emit('update:isForm10Selected', isSelected);
    if (localCLineYear.value.trim() && !yearValid) {
        console.warn('⚠️ C-Line Jahr يجب أن يكون 4 أرقام:', localCLineYear.value);
    }
};

// تحديث حالة isForm11Selected
const updatePLineSelected = () => {
    const yearValid = isValidYear(localPLineYear.value.trim());
    const nameValid = localPLineName.value.trim() !== '';
    const isSelected = yearValid && nameValid;
    emit('update:isForm11Selected', isSelected);
    if (localPLineYear.value.trim() && !yearValid) {
        console.warn('⚠️ P-Line Jahr يجب أن يكون 4 أرقام:', localPLineYear.value);
    }
};

// ========== 🔥 دالة التحقق من صحة السنة (4 أرقام) ==========
const isValidYear = (year) => {
    if (!year || year.trim() === '') return false;
    const yearStr = year.toString().trim();
    return /^\d{4}$/.test(yearStr);
};

// ========== 🔥 دالة التحقق من صحة السنة مع قيمة اختيارية ==========
const isValidYearOptional = (year) => {
    if (!year || year.trim() === '') return true;
    return isValidYear(year);
};

// 🔥 دالة التهيئة
const initializeDefaultValues = () => {
    if (isUserEditing.value) {
        console.log('🔒 المستخدم يعدل القيم - تخطي التهيئة');
        return;
    }
    if (isInitialized.value) {
        console.log('🔒 تم التهيئة مسبقاً - تخطي التهيئة');
        return;
    }
    
    const artistName = getArtistName();
    let hasChanges = false;
    
    if ((!props.labelName || props.labelName === '') && artistName) {
        emit('update:labelName', artistName);
        emit('update:isForm8Selected', true);
        hasChanges = true;
    } else if (props.labelName && props.labelName !== '') {
        emit('update:isForm8Selected', true);
    }
    
    if (!props.productionYear || props.productionYear === '') {
        emit('update:productionYear', currentYear.value);
        emit('update:isForm9Selected', true);
        hasChanges = true;
    } else if (props.productionYear && props.productionYear !== '') {
        emit('update:isForm9Selected', true);
    }
    
    if (!props.cLineYear || props.cLineYear === '') {
        emit('update:cLineYear', currentYear.value);
        hasChanges = true;
    }
    
    if ((!props.cLineName || props.cLineName === '') && artistName) {
        emit('update:cLineName', artistName);
        hasChanges = true;
    }
    
    if (!props.pLineYear || props.pLineYear === '') {
        emit('update:pLineYear', currentYear.value);
        hasChanges = true;
    }
    
    if ((!props.pLineName || props.pLineName === '') && artistName) {
        emit('update:pLineName', artistName);
        hasChanges = true;
    }
    
    updateCLineSelected();
    updatePLineSelected();
    
    if (hasChanges) {
        console.log('✅ تم تهيئة القيم الافتراضية');
    }
    isInitialized.value = true;
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

// 🔥 مراقبة تغييرات artistInputs
watch(() => props.artistInputs[0]?.searchQuery, (newArtistName, oldArtistName) => {
    if (isUserEditing.value) {
        console.log('🔒 المستخدم يعدل القيم - تخطي التحديث التلقائي');
        return;
    }
    if (newArtistName && newArtistName !== oldArtistName) {
        if (!props.labelName || props.labelName === oldArtistName || props.labelName === '') {
            emit('update:labelName', newArtistName);
            updateLabelNameSelected();
        }
        if (!props.cLineName || props.cLineName === oldArtistName || props.cLineName === '') {
            emit('update:cLineName', newArtistName);
        }
        if (!props.pLineName || props.pLineName === oldArtistName || props.pLineName === '') {
            emit('update:pLineName', newArtistName);
        }
        updateCLineSelected();
        updatePLineSelected();
    }
}, { immediate: true });

// 🔥 مراقبة تغييرات showFinalPage
watch(() => props.showFinalPage, (newVal) => {
    if (newVal) {
        if (!props.labelName && !props.productionYear && !props.cLineYear && !props.cLineName && !props.pLineYear && !props.pLineName) {
            isInitialized.value = false;
            isUserEditing.value = false;
            initializeDefaultValues();
        }
    }
}, { immediate: true });

// تنفيذ التهيئة عند تحميل المكون
onMounted(() => {
    setTimeout(() => {
        initializeDefaultValues();
    }, 300);
});

// 🔥 مراقبة التغييرات في props
watch(() => [props.artistInputs, props.labelName, props.productionYear, props.cLineYear, props.cLineName, props.pLineYear, props.pLineName], 
    (newVal, oldVal) => {
        if (isUserEditing.value) {
            console.log('🔒 المستخدم يعدل القيم - تخطي إعادة التهيئة');
            return;
        }
        const hasEmptyValues = !props.labelName && !props.productionYear && !props.cLineYear && !props.cLineName && !props.pLineYear && !props.pLineName;
        if (hasEmptyValues) {
            isInitialized.value = false;
            initializeDefaultValues();
        }
    }, 
    { immediate: true, deep: true }
);

// ========== 🔥 مراقبة تغييرات isNewRight2Visible ==========
watch(() => props.isNewRight2Visible, (newVal) => {
    console.log('🔄 NewRight2 visibility changed:', newVal);
}, { immediate: true });

// ========== 🔥 مراقبة isEntering ==========
watch(() => props.isEntering, (newVal) => {
    if (newVal) {
        console.log('🎬 NewRight2 entering animation');
    }
}, { immediate: true });

// ========== 🔥 مراقبة isLeaving ==========
watch(() => props.isLeaving, (newVal) => {
    if (newVal) {
        console.log('🎬 NewRight2 leaving animation');
    }
}, { immediate: true });
</script>

<style lang="scss" scoped>
.new-right2 {
    display: flex;
    width: 100%;
    padding-top: 28px;
    height: 100%;
    flex-direction: column;
    align-items: flex-start;
    flex-grow: 1;
    
    /* ===== أنيميشن الدخول ===== */
    transform: translateY(30px);
    opacity: 0;
    transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1), 
                opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

/* ===== أنيميشن الدخول ===== */
.new-right2.slide-in {
    transform: translateY(0);
    opacity: 1;
}

.new-right2.entering {
    animation: fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

/* ===== أنيميشن الخروج ===== */
.new-right2.slide-out {
    transform: translateY(-30px);
    opacity: 0;
}

.new-right2.leaving {
    animation: fadeOutDown 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes fadeInUp {
    0% {
        opacity: 0;
        transform: translateY(30px) scale(0.98);
    }
    100% {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

@keyframes fadeOutDown {
    0% {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
    100% {
        opacity: 0;
        transform: translateY(30px) scale(0.98);
    }
}

@keyframes fadeInDown {
    0% {
        opacity: 0;
        transform: translateY(50px) scale(0.95);
    }
    100% {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

.new-right2 .info {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 24px;
    width: 100%;
}

.new-right2 .info .title {
    color: #FFF;
    font-family: Heebo;
    font-size: clamp(32px, 3.2vw, 58px);
    font-style: normal;
    font-weight: 700;
    line-height: 0.8;
    text-transform: uppercase;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.new-right2 .info .subtitle {
    color: #FFF;
    font-family: Heebo;
    font-size: clamp(24px, 2.4vw, 40px);
    font-style: normal;
    font-weight: 700;
    line-height: 0.8;
    max-width: 100%;
    
    text-overflow: ellipsis;
    white-space: nowrap;
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
    font-size: clamp(14px, 1.2vw, 20px);
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
    
    /* 🔥 الانتقال السلس بين breakpoints */
    transition: padding 0.3s cubic-bezier(0.4, 0, 0.2, 1), gap 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.summary .rows {
    display: flex;
    align-items: flex-start;
    gap: 20px;
    align-self: stretch;
    
    /* 🔥 الانتقال السلس بين breakpoints */
    transition: gap 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.summary-item {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1 0 0;
    min-width: 0;
}

.summary-item .label {
    width: 180px;
    color: var(--Main-Colors-White, #FFF);
    font-family: Heebo;
    font-size: clamp(14px, 1.2vw, 20px);
    font-style: normal;
    font-weight: 300;
    line-height: 1;
    letter-spacing: 1px;
    flex-shrink: 0;
    
    /* 🔥 الانتقال السلس */
    transition: font-size 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.summary-item .value {
    color: var(--Main-Colors-White, #FFF);
    font-family: Heebo;
    font-size: clamp(14px, 1.2vw, 20px);
    font-style: normal;
    font-weight: 700;
    line-height: .9;
    letter-spacing: 1px;
    min-width: 80px;
    white-space: nowrap;
    // overflow: hidden;
    text-overflow: ellipsis;
    flex: 1;
    
    /* 🔥 الانتقال السلس */
    transition: font-size 0.3s cubic-bezier(0.4, 0, 0.2, 1), min-width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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
    transform: translateY(-30px);
    transition: padding 0.3s cubic-bezier(0.4, 0, 0.2, 1), gap 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    width: 100%;
}

.metas.visible {
    opacity: 1;
    transform: translateY(0);
    animation: fadeInDown 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.metas .row1 {
    display: flex;
    align-items: flex-start;
    gap: 20px;
    align-self: stretch;
    
    /* 🔥 الانتقال السلس */
    transition: gap 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.metas .row1 .form8, .row1 .form9 {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 8px;
    flex: 1 0 0;
    min-width: 0;
}

.metas .row2, .metas .row3 {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 32px;
    align-self: stretch;
    
    /* 🔥 الانتقال السلس */
    transition: gap 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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
    font-size: clamp(12px, 0.9vw, 14px);
    font-style: normal;
    font-weight: 300;
    line-height: 1;
    letter-spacing: 0.7px;
    text-transform: uppercase;
    
    /* 🔥 الانتقال السلس */
    transition: font-size 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.form10 .section-input, .form11 .section-input {
    display: flex;
    align-items: flex-start;
    gap: 2px;
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
    font-size: clamp(16px, 1.2vw, 20px);
    height: 46px;
    box-sizing: border-box;
    
    /* 🔥 الانتقال السلس */
    transition: font-size 0.3s cubic-bezier(0.4, 0, 0.2, 1), padding 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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
    font-size: clamp(16px, 1.2vw, 20px);
    height: 46px;
    box-sizing: border-box;
    
    /* 🔥 الانتقال السلس */
    transition: font-size 0.3s cubic-bezier(0.4, 0, 0.2, 1), padding 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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
    font-size: clamp(16px, 1.2vw, 20px);
    height: 46px;
    box-sizing: border-box;
    max-width: 100px;
    width: clamp(70px, 6vw, 100px);
    
    /* 🔥 الانتقال السلس */
    transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1), font-size 0.3s cubic-bezier(0.4, 0, 0.2, 1), padding 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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
    right: 22px;
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

/* ===== 🔥 أنماط info2 من finalPage ===== */
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
    transition: opacity 0.5s ease, padding 0.3s cubic-bezier(0.4, 0, 0.2, 1), gap 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    min-width: 0;
}

.info2.visible {
    opacity: 1;
}

.info2 .row1 {
    display: flex;
    align-items: flex-start;
    gap: 20px;
    align-self: stretch;
    min-width: 0;
    
    /* 🔥 الانتقال السلس */
    transition: gap 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.info2 .row1 .info {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-direction: row;
    flex: 1 0 0;
    min-width: 0;
    max-width: 100%;
}

.info2 .row1 .info .label {
    width: 180px;
    color: var(--Main-Colors-White, #FFF);
    font-family: Heebo;
    font-size: clamp(14px, 1.2vw, 20px);
    font-style: normal;
    font-weight: 300;
    line-height: 1;
    letter-spacing: 1px;
    flex-shrink: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    
    /* 🔥 الانتقال السلس */
    transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1), font-size 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.info2 .row1 .info .value {
    color: var(--Main-Colors-White, #FFF);
    font-family: Heebo;
    font-size: clamp(14px, 1.2vw, 20px);
    font-style: normal;
    font-weight: 700;
    line-height: 1;
    letter-spacing: 1px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex: 1 1 auto;
    min-width: 0;
    max-width: 100%;
    display: block;
    
    /* 🔥 الانتقال السلس */
    transition: font-size 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* ===== Responsive مع انتقال سلس ===== */
@media (min-width:1440px) and (max-width:1599px) {
    .new-right2 {
        padding-right: 20px !important;
        padding-top: 20px;
        gap: 0px;
        width: 100%;
        overflow: hidden;
    }

    .new-right2 .info{
        gap: 16px;
    }

    .section-input .error-icon{
        right: 43px;
    }

    .summary {
        padding: 16px 0 20px 30px !important;
        gap: 16px;
    }

    .summary .rows {
        gap: 12px;
    }

    .summary-item .label {
        width: 120px;
        font-size: 14px;
    }

    .summary-item .value {
        font-size: 14px;
        min-width: 70px;
    }

    .metas {
        padding-left: 30px !important;
        gap: 20px !important;
    }

    .metas .row1 {
        gap: 12px;
    }

    .metas .row1 .form8,
    .metas .row1 .form9 {
        flex: 1 1 calc(50% - 12px);
        min-width: 200px;
    }

    .metas .row2,
    .metas .row3 {
        gap: 16px;
    }

    .info2 {
        padding-left: 30px !important;
        gap: 16px;
    }

    .info2 .row1 {
        gap: 12px;
        flex-wrap: wrap;
    }

    .info2 .row1 .info {
        flex: 1 1 calc(50% - 12px);
        min-width: 0;
        max-width: 100%;
        gap: 4px;
    }

    .info2 .row1 .info .label {
        width: 120px;
        font-size: 14px;
    }

    .info2 .row1 .info .value {
        font-size: 14px;
    }

    .form10 .section-input,
    .form11 .section-input {
        gap: 2px;
        flex-wrap: wrap;
    }

    .form10 .section-input .input-field-small,
    .form11 .section-input .input-field-small {
        max-width: 70px;
        width: 70px;
    }

    .form10 .section-input .border-r,
    .form11 .section-input .border-r {
        flex: 1;
        min-width: 120px;
    }
}

@media (max-width:1670px) {
    .summary {
        padding: 16px 0 20px 30px !important;
        gap: 16px;
    }

    .summary .rows {
        gap: 12px;
        flex-wrap: wrap;
    }

    .summary-item {
        flex: 1 1 calc(50% - 12px);
        min-width: 0;
        max-width: 100%;
        gap: 4px;
    }

    .summary-item .label {
        width: 120px;
        font-size: 14px;
    }

    .summary-item .value {
        font-size: 14px;
        min-width: 70px;
    }

    .metas {
        padding-left: 30px !important;
        // gap: 20px !important;
        width: 100%;
        position: relative;
        top: 0 !important;
    }

    .metas .row1 {
        gap: 12px;
        flex-wrap: wrap;
    }

    .metas .row1 .form8,
    .metas .row1 .form9 {
        flex: 1 1 calc(50% - 12px);
        min-width: 200px;
        max-height: none !important;
    }

    .metas .row2,
    .metas .row3 {
        gap: 16px;
        width: 100%;
    }

    .title {
        font-size: 12px;
        letter-spacing: 0.5px;
    }

    .section-input .input-field,
    .section-input .border-r,
    .section-input .input-field-small {
        font-size: 16px;
        height: 46px;
        padding: 8px 12px;
    }

    .section-input .input-field-small {
        max-width: 80px;
        width: 80px;
    }

    .section-input.has-checkmark .input-field {
        padding-right: 74px;
    }

    .info2 {
        padding-left: 30px !important;
        gap: 16px;
    }

    .info2 .row1 {
        gap: 12px;
        flex-wrap: wrap;
    }

    .info2 .row1 .info {
        flex: 1 1 calc(50% - 12px);
        min-width: 0;
        max-width: 100%;
        gap: 4px;
    }

    .info2 .row1 .info .label {
        width: 120px;
        font-size: 14px;
    }

    .info2 .row1 .info .value {
        font-size: 14px;
    }
}

@media (min-width:1600px) and (max-width:2074px) {
    .summary {
        padding: 8px 0 28px 103px;
    }

    .summary-item .label {
        width: 170px;
        font-size: 16px;
    }

    .summary-item .value {
        font-size: 16px;
    }

    .metas {
        padding-left: 103px;
        gap: 28px;
    }

    .info2 {
        padding-left: 103px;
        gap: 24px;
    }

    .info2 .row1 .info .label {
        width: 170px;
        font-size: 16px;
    }

    .info2 .row1 .info .value {
        font-size: 16px;
    }

    .new-right2 {
        padding-right: 74px;
    }
}

@media (min-width:2075px) and (max-width:2560px) {
    .summary {
        padding: 8px 0 32px 126px;
    }

    .metas {
        padding-left: 126px;
        gap: 32px;
    }

    .info2 {
        padding-left: 126px;
        gap: 32px;
    }

    .info2 .row1 .info .label {
        width: 180px;
    }

    .new-right2 {
        padding-right: 113px;
    }
}
</style>