<template>
    <div class="box-stream">
        <div class="p">{{ data.label }}</div>
        <div class="bar"></div>
        <div class="dates"></div>
        <div v-if="data.type === 'number'" class="number">{{ data.value }}</div>
        <div v-else-if="data.type === 'currency'" class="number">{{ formatCurrency(data.value) }}</div>
        <ul v-else-if="data.type === 'list'" class="list">
            <li v-for="(item, index) in data.items" :key="index">{{ item }}</li>
        </ul>
        <div v-else-if="data.type === 'text'" class="text">{{ data.value }}</div>
    </div>
</template>

<script setup>
import { computed } from 'vue';

defineProps(['data']);

// دالة لتنسيق العملة
const formatCurrency = (value) => {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value);
};
</script>

<style lang="scss" scoped>
.box-stream {
    height: 100%;
    display: flex;
    padding: 20px 30px;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 20px;
    flex: 1 0 0;
    border-radius: 20px;
    background: var(--secondary);
    position: relative;
}

.box-stream .p {
    color: #FFF;
    font-family: Heebo;
    font-size: 18px;
    font-style: normal;
    font-weight: 700;
    line-height: 0.8;
    letter-spacing: 0.9px;
    text-transform: uppercase;
    align-self: stretch;
}

.box-stream .bar {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: -258px;
    align-self: stretch;
}

.box-stream .dates {
    display: flex;
    padding-bottom: 10px;
    justify-content: space-between;
    align-items: center;
    align-self: stretch;
}

.box-stream .number {
    color: var(--selvar);
    font-family: Heebo;
    font-size: 180px;
    font-style: normal;
    font-weight: 700;
    line-height: 0.8;
    letter-spacing: 9px;
    text-transform: uppercase;
    position: absolute;
    right: 285px;
    top: 133px;
    opacity: 0.1;
}

.box-stream .list {
    color: #FFF;
    font-family: Heebo;
    font-size: 16px;
    font-style: normal;
    font-weight: 400;
    line-height: 1.5;
    list-style: none;
    padding: 0;
    align-self: stretch;
}

.box-stream .text {
    color: #FFF;
    font-family: Heebo;
    font-size: 16px;
    font-style: normal;
    font-weight: 400;
    line-height: 1.5;
    align-self: stretch;
}
</style>