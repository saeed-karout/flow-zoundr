<template>
    <div class="switch">
        <div :class="['p', { 'active': !isSwitchActive }]" @click="$emit('toggle-switch')">Streams</div>
        <div class="switch-child" @click="$emit('toggle-switch')">
            <img src="/icon/circle.svg" :class="['circle', { 'circle-right': isSwitchActive }]" alt="">
        </div>
        <div :class="['p2', { 'active': isSwitchActive }]" @click="$emit('toggle-switch')">Publikum</div>
    </div>
</template>

<script setup>
defineProps(['isSwitchActive']);
defineEmits(['toggle-switch']);
</script>

<style lang="scss" scoped>
.switch {
    display: flex;
    width: 220px;
    justify-content: space-between;
    align-items: center;
}

.switch .p,
.switch .p2 {
    color: var(--selvar);
    font-family: Heebo;
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: 0.8;
    letter-spacing: 0.7px;
    text-transform: uppercase;
    cursor: pointer;
}

.switch .active {
    color: #FFF;
}

.switch .switch-child {
    display: flex;
    width: 40px;
    height: 20px;
    padding: 2px;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
    border-radius: 10px;
    background: var(--Strawberry);
    cursor: pointer;
    position: relative;
}

.switch-child .circle {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    fill: var(--Main-Colors-Slate, #26282D);
    transition: transform 0.3s ease;
}

.switch-child .circle-right {
    transform: translateX(20px);
}
</style>