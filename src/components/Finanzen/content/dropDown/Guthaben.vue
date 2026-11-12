<template>
    <div class="main">
        <div class="left">Dein Verfügbares Guthaben</div>
        <div class="right">{{ formattedBalance }}</div>
    </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useWalletStore } from '@/stores/wallet';

// الرصيد من مخزن المحفظة — مصدر واحد مشترك مع Auszahlung واللوحة.
const wallet = useWalletStore();
const formattedBalance = computed(() => wallet.formattedBalance);

onMounted(() => wallet.fetchBalance());

defineExpose({
    refreshBalance: () => wallet.fetchBalance({ force: true }),
});
</script>

<style lang="scss" scoped>
.main {
    display: flex;
    padding: 13px 20px 13px 20px;
    justify-content: space-between;
    align-items: center;
    flex: 1 0 0;
    align-self: stretch;
    border-radius: 20px 5px 5px 20px;
    background: linear-gradient(90deg, var(--secondary) 0%, var(--Strawberry) 100%);
}

.left {
    color: #fff;
    font-family: Heebo;
    font-size: 18px;
    font-style: normal;
    font-weight: 700;
    line-height: .6;
    text-transform: uppercase;
}

.right {
    color: #FFF;
    font-family: Heebo;
    font-size: 20px;
    font-style: normal;
    font-weight: 700;
    line-height: .6;
    text-transform: uppercase;
    white-space: nowrap; /* منع التفاف النص */
}

/* حالة التحميل */
.loading {
    opacity: 0.6;
    animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
    0%, 100% { opacity: 0.6; }
    50% { opacity: 1; }
}

@media (min-width: 1440px) and (max-width: 1599px) {
    .left {
        font-size: 14px;
    }
    .right {
        font-size: 18px;
    }
}

@media (max-width: 1439px) {
    .left {
        font-size: 14px;
    }
    .right {
        font-size: 16px;
    }
}
</style>