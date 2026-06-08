<template>
    <div class="form-left">
        <div class="form6" :class="{ active: isForm6Active }">
            <div class="top-line">
                <div class="title">Hast du die GTIN?</div>
                <div class="btn-switch" @click="$emit('toggleForm6')">
                    <img src="/icon/circle.svg" class="circle" alt="circle image" />
                </div>
            </div>
            <div class="section-input" :class="{ 'is-hovered': isHoveredForm6, 'has-checkmark': isForm6Selected }"
                @mouseenter="$emit('mouseenterForm6')" @mouseleave="$emit('mouseleaveForm6')">
                <input type="text" class="input-field" v-model="localGtin" placeholder="GTIN"
                    :disabled="!isForm6Active" @input="$emit('updateForm6Selected')" />
                <div v-if="isForm6Selected" class="checkmark">
                    <img src="@/assets/icons/y.png" class="icon-y" alt="checkmark" />
                </div>
                <div class="spacer" @click="$emit('openVideoPopup', 'form6')">
                    <div class="play" :class="{ visible: isForm6Active && isHoveredForm6 }">
                        <img :src="iconPlay" class="icon" alt="image icon" />
                    </div>
                </div>
            </div>
        </div>
        <div class="form7" :class="{ active: isForm7Active }">
            <div class="top-line">
                <div class="title">Hast du die Katalognummer?</div>
                <div class="btn-switch" @click="$emit('toggleForm7')">
                    <img src="/icon/circle.svg" class="circle" alt="circle image" />
                </div>
            </div>
            <div class="section-input" :class="{ 'is-hovered': isHoveredForm7, 'has-checkmark': isForm7Selected }"
                @mouseenter="$emit('mouseenterForm7')" @mouseleave="$emit('mouseleaveForm7')">
                <input type="text" class="input-field" v-model="localCatalogNumber" placeholder="Katalognummer"
                    :disabled="!isForm7Active" @input="$emit('updateForm7Selected')" />
                <div v-if="isForm7Selected" class="checkmark">
                    <img src="@/assets/icons/y.png" class="icon-y" alt="checkmark" />
                </div>
                <div class="spacer" @click="$emit('openVideoPopup', 'form7')">
                    <div class="play" :class="{ visible: isForm7Active && isHoveredForm7 }">
                        <img :src="iconPlay" class="icon" alt="image icon" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';
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
    iconPlay: { type: String, required: true }
});

const emit = defineEmits([
    'update:gtin', 'update:catalogNumber', 'toggleForm6', 'toggleForm7',
    'updateForm6Selected', 'updateForm7Selected', 'mouseenterForm6', 'mouseleaveForm6',
    'mouseenterForm7', 'mouseleaveForm7', 'openVideoPopup'
]);

const localGtin = computed({
    get: () => props.gtin,
    set: (value) => emit('update:gtin', value)
});

const localCatalogNumber = computed({
    get: () => props.catalogNumber,
    set: (value) => emit('update:catalogNumber', value)
});
</script>

<style lang="scss" scoped>
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
    padding-right: 37px;
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
    // background: var(--secondary);
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
    }
}

@media (min-width:1600px){
  .form6 .top-line > .title, .form7 .top-line > .title{
        font-size: 14px;
        letter-spacing: 0.7px;
    }
}
</style>