<template>
    <div class="form-left" :class="{ 'show': show }">
        <!-- GTIN -->
        <div class="form6" :class="{ active: isForm6Active }">
            <div class="top-line">
                <div class="title">Hast du die GTIN?</div>
                <div class="btn-switch" @click="toggleForm6">
                    <img src="/icon/circle.svg" class="circle" alt="circle image" />
                </div>
            </div>
            <div class="section-input" 
                :class="{ 
                    'is-hovered': isHoveredForm6, 
                    'has-checkmark': isGtinValidComputed,
                    'has-error': gtinError 
                }"
                @mouseenter="$emit('mouseenterForm6')" 
                @mouseleave="$emit('mouseleaveForm6')">
                <input 
                    type="text" 
                    class="input-field" 
                    v-model="localGtin" 
                    placeholder="GTIN (13 Ziffern)"
                    :disabled="!isForm6Active" 
                    @input="onGtinInput"
                    @blur="validateGtinFinal"
                    maxlength="13"
                    inputmode="numeric"
                    pattern="[0-9]*"
                />
                <div v-if="isGtinValidComputed" class="checkmark">
                    <img src="@/assets/icons/y.png" class="icon-y" alt="checkmark" />
                </div>
                <div v-if="gtinError" class="error-icon">
                    <img src="/icon/warning.svg" class="icon-warning" alt="warning icon" />
                </div>
                <div class="spacer" @click="$emit('openVideoPopup', 'form6')">
                    <div class="play" :class="{ visible: isForm6Active && isHoveredForm6 }">
                        <img :src="iconPlay" class="icon" alt="image icon" />
                    </div>
                </div>
            </div>
            <!-- <div v-if="gtinError" class="error-message">
                {{ gtinErrorMessage }}
            </div> -->
        </div>

        <!-- Katalognummer -->
        <div class="form7" :class="{ active: isForm7Active }">
            <div class="top-line">
                <div class="title">Hast du die Katalognummer?</div>
                <div class="btn-switch" @click="toggleForm7">
                    <img src="/icon/circle.svg" class="circle" alt="circle image" />
                </div>
            </div>
            <div class="section-input" 
                :class="{ 
                    'is-hovered': isHoveredForm7, 
                    'has-checkmark': isCatalogValidComputed,
                    'has-error': catalogError 
                }"
                @mouseenter="$emit('mouseenterForm7')" 
                @mouseleave="$emit('mouseleaveForm7')">
                <input 
                    type="text" 
                    class="input-field" 
                    v-model="localCatalogNumber" 
                    placeholder="Katalognummer"
                    :disabled="!isForm7Active" 
                    @input="onCatalogInput"
                    @blur="validateCatalogFinal"
                />
                <div v-if="isCatalogValidComputed" class="checkmark">
                    <img src="@/assets/icons/y.png" class="icon-y" alt="checkmark" />
                </div>
                <div v-if="catalogError" class="error-icon">
                    <img src="/icon/warningicon.svg" class="icon-warning" alt="warning icon" />
                </div>
                <div class="spacer" @click="$emit('openVideoPopup', 'form7')">
                    <div class="play" :class="{ visible: isForm7Active && isHoveredForm7 }">
                        <img :src="iconPlay" class="icon" alt="image icon" />
                    </div>
                </div>
            </div>
            <div v-if="catalogError" class="error-message">
                {{ catalogErrorMessage }}
            </div>
        </div>
    </div>
</template>
<script setup>
import { ref, computed, watch, onUnmounted } from 'vue';
import { debounce } from '@/utils/debounce';
import iconPlay from '@/assets/icons/play.png';

const props = defineProps({
    gtin: { type: String, default: '' },
    catalogNumber: { type: String, default: '' },
    isForm6Active: { type: Boolean, default: false },
    isForm7Active: { type: Boolean, default: false },
    isForm6Selected: { type: Boolean, default: false },
    isForm7Selected: { type: Boolean, default: false },
    isHoveredForm6: { type: Boolean, default: false },
    isHoveredForm7: { type: Boolean, default: false },
    iconPlay: { type: String, required: true },
    releaseUuid: { type: String, default: null },
    show: { type: Boolean, default: false }
});

const emit = defineEmits([
    'update:gtin', 'update:catalogNumber', 'toggleForm6', 'toggleForm7',
    'updateForm6Selected', 'updateForm7Selected', 'mouseenterForm6', 'mouseleaveForm6',
    'mouseenterForm7', 'mouseleaveForm7', 'openVideoPopup',
    'gtin-error', 'catalog-error'
]);

// ========== Computed للتحقق من صحة GTIN ==========
const isGtinValidComputed = computed(() => {
    const gtin = props.gtin?.trim() || '';
    return props.isForm6Active && 
           props.isForm6Selected && 
           !gtinError.value && 
           /^\d{13}$/.test(gtin);
});

// ========== Computed للتحقق من صحة Katalognummer - بدون validation ==========
const isCatalogValidComputed = computed(() => {
    const catalog = props.catalogNumber || '';
    return props.isForm7Active && 
           props.isForm7Selected && 
           catalog && catalog.trim() !== '';
});

// ========== GTIN Validation - 13 digits only ==========
const gtinError = ref(false);
const gtinErrorMessage = ref('');
const isGtinValid = ref(false);

const validateGtinFormat = (gtin) => {
    const cleanGtin = gtin.replace(/\s/g, '');
    return /^\d{13}$/.test(cleanGtin);
};

const validateGtin = () => {
    const gtin = props.gtin?.trim() || '';
    
    if (!props.isForm6Active) {
        emit('updateForm6Selected', true);
        return;
    }
    
    if (!gtin) {
        gtinError.value = false;
        gtinErrorMessage.value = '';
        isGtinValid.value = false;
        emit('updateForm6Selected', false);
        return;
    }
    
    const cleanGtin = gtin.replace(/\s/g, '');
    if (cleanGtin !== gtin) {
        emit('update:gtin', cleanGtin);
    }
    
    const isValidFormat = validateGtinFormat(cleanGtin);
    
    if (!isValidFormat) {
        gtinError.value = true;
        gtinErrorMessage.value = 'GTIN muss genau 13 Ziffern enthalten.';
        isGtinValid.value = false;
        emit('updateForm6Selected', false);
        return;
    }
    
    gtinError.value = false;
    gtinErrorMessage.value = '';
    isGtinValid.value = true;
    emit('updateForm6Selected', true);
};

const debouncedValidateGtin = debounce(() => {
    validateGtin();
}, 300);

const onGtinInput = (event) => {
    const input = event.target;
    const value = input.value;
    
    const cleaned = value.replace(/[^0-9]/g, '');
    
    if (cleaned.length > 13) {
        input.value = cleaned.slice(0, 13);
        emit('update:gtin', cleaned.slice(0, 13));
        return;
    }
    
    if (cleaned !== value) {
        input.value = cleaned;
        emit('update:gtin', cleaned);
    }
    
    if (cleaned !== props.gtin) {
        emit('update:gtin', cleaned);
    }
    
    emit('updateForm6Selected', false);
    debouncedValidateGtin();
};

const validateGtinFinal = () => {
    validateGtin();
};

// ========== Catalog Number - بدون validation ==========
const catalogError = ref(false);
const catalogErrorMessage = ref('');
const isCatalogValid = ref(false);

// 🔥 إزالة التحقق بالكامل - السماح بأي إدخال
const validateCatalog = () => {
    const catalog = props.catalogNumber || '';
    
    if (!props.isForm7Active) {
        emit('updateForm7Selected', true);
        return;
    }
    
    // ✅ السماح بأي قيمة - فقط نتحقق إذا كان الحقل غير فارغ
    if (catalog && catalog.trim() !== '') {
        catalogError.value = false;
        catalogErrorMessage.value = '';
        isCatalogValid.value = true;
        emit('updateForm7Selected', true);
    } else {
        catalogError.value = false;
        catalogErrorMessage.value = '';
        isCatalogValid.value = false;
        emit('updateForm7Selected', false);
    }
};

const onCatalogInput = () => {
    const catalog = props.catalogNumber || '';
    if (catalog && catalog.trim() !== '') {
        emit('updateForm7Selected', true);
        catalogError.value = false;
        catalogErrorMessage.value = '';
        isCatalogValid.value = true;
    } else {
        emit('updateForm7Selected', false);
    }
};

const validateCatalogFinal = () => {
    const catalog = props.catalogNumber || '';
    if (catalog && catalog.trim() !== '') {
        emit('updateForm7Selected', true);
        catalogError.value = false;
        catalogErrorMessage.value = '';
        isCatalogValid.value = true;
    } else {
        emit('updateForm7Selected', false);
    }
};

// ========== Toggle Functions ==========
const toggleForm6 = () => {
    const newState = !props.isForm6Active;
    emit('toggleForm6');
    
    if (!newState) {
        gtinError.value = false;
        gtinErrorMessage.value = '';
        isGtinValid.value = false;
        emit('update:gtin', '');
        emit('updateForm6Selected', true);
    } else {
        const gtin = props.gtin?.trim() || '';
        if (!gtin) {
            emit('updateForm6Selected', false);
        } else {
            const cleanGtin = gtin.replace(/\s/g, '');
            const isValid = /^\d{13}$/.test(cleanGtin);
            emit('updateForm6Selected', isValid);
            if (!isValid) {
                gtinError.value = true;
                gtinErrorMessage.value = 'GTIN muss genau 13 Ziffern enthalten.';
            }
        }
    }
};

const toggleForm7 = () => {
    const newState = !props.isForm7Active;
    emit('toggleForm7');
    
    if (!newState) {
        catalogError.value = false;
        catalogErrorMessage.value = '';
        isCatalogValid.value = false;
        emit('update:catalogNumber', '');
        emit('updateForm7Selected', true);
    } else {
        const catalog = props.catalogNumber || '';
        if (!catalog || catalog.trim() === '') {
            emit('updateForm7Selected', false);
        } else {
            // ✅ بدون أي تحقق - فقط نعتبره صحيحاً
            catalogError.value = false;
            catalogErrorMessage.value = '';
            isCatalogValid.value = true;
            emit('updateForm7Selected', true);
        }
    }
};

// ========== Computed ==========
const localGtin = computed({
    get: () => props.gtin,
    set: (value) => {
        const cleaned = value.replace(/[^0-9]/g, '').slice(0, 13);
        emit('update:gtin', cleaned);
        if (gtinError.value) {
            gtinError.value = false;
            gtinErrorMessage.value = '';
        }
        emit('updateForm6Selected', false);
    }
});

const localCatalogNumber = computed({
    get: () => props.catalogNumber,
    set: (value) => {
        emit('update:catalogNumber', value);
        if (catalogError.value) {
            catalogError.value = false;
            catalogErrorMessage.value = '';
        }
        // ✅ فقط نحدد إذا كان الحقل غير فارغ
        if (value && value.trim() !== '') {
            emit('updateForm7Selected', true);
            isCatalogValid.value = true;
        } else {
            emit('updateForm7Selected', false);
            isCatalogValid.value = false;
        }
    }
});

// ========== Watchers ==========
watch(() => props.gtin, (newVal) => {
    if (!newVal && props.isForm6Active) {
        gtinError.value = false;
        gtinErrorMessage.value = '';
        isGtinValid.value = false;
        emit('updateForm6Selected', false);
    }
});

watch(() => props.catalogNumber, (newVal) => {
    if (!newVal && props.isForm7Active) {
        catalogError.value = false;
        catalogErrorMessage.value = '';
        isCatalogValid.value = false;
        emit('updateForm7Selected', false);
    }
});

// ========== Cleanup ==========
onUnmounted(() => {
    debouncedValidateGtin.cancel && debouncedValidateGtin.cancel();
});
</script>
<style lang="scss" scoped>
/* جميع الأنماط كما هي */
.form-left {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 32px;
    width: 100%;
    padding: 32px 0 0 0 ;
    border: none;
}

.form6, .form7 {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 10px;
    align-self: stretch;
    position: relative;
}

.form6 .top-line, .form7 .top-line {
    display: flex;
    height: 10px;
    padding-right: 42px;
    justify-content: space-between;
    align-items: center;
    align-self: stretch;
}

.form6 .top-line>.title, .form7 .top-line>.title {
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

      &:hover{
        border-radius: 5px 0 0 5px;
    }
}

.section-input .input-field:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.section-input.has-checkmark .input-field {
    padding-right: 94px;
}

.section-input.has-error .input-field {
    // border: 1px solid #FF4444;
}

.section-input .checkmark {
    position: absolute;
    right: 44px;
    top: 50%;
    transform: translateY(-50%);
}

.section-input .checkmark .icon-y {
    width: 18px;
    position: relative;
    right: 12px;
}

.section-input .error-icon {
    position: absolute;
    right: 43px;
    top: 50%;
    transform: translateY(-50%);
}

.section-input .error-icon .icon-warning {
    width: 20px;
    height: 20px;
    position: relative;
    right: 12px;
}

.error-message {
    color: #FF4444;
    font-family: Heebo;
    font-size: 12px;
    font-weight: 300;
    margin-top: 4px;
    padding-left: 4px;
    animation: fadeInError 0.3s ease;
}

@keyframes fadeInError {
    from {
        opacity: 0;
        transform: translateY(-5px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
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
    // height: 20px;
    flex-shrink: 0;
    aspect-ratio: 9/10;
}

.section-input .spacer:hover .icon {
    filter: brightness(0) invert(1);
}

.form6 .section-input, .form7 .section-input {
    pointer-events: none;
    opacity: 0.5;
}

.form6.active .section-input, .form7.active .section-input {
    pointer-events: auto;
    opacity: 1;
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

.form6.active .btn-switch, .form7.active .btn-switch {
    background: var(--Main-Colors-Strawberry, #D15);
}

.btn-switch .circle {
    width: 16px;
    height: 16px;
    margin-left: 2px;
    transition: margin-left 0.3s ease;
}

.form6.active .btn-switch .circle, .form7.active .btn-switch .circle {
    margin-left: 20px;
}

@media (max-width:1599px) {
    .form6 .top-line > .title, .form7 .top-line > .title{
        font-size: 12px;
        letter-spacing: 0.6px;
    }

    .form-left{
        gap: 20px;
        padding-top: 22px;
    }
}

@media (min-width:1600px){
    .form6 .top-line > .title, .form7 .top-line > .title{
        font-size: 14px;
        letter-spacing: 0.7px;
    }
}
</style>