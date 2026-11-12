<template>
    <div class="mains">
        <div v-if="showTopRow" class="top-row">
            <div class="Guthaben">
                <div class="title">Dein Verfügbares Guthaben</div>
                <div class="number">{{ formattedBalance }}</div>
            </div>
        </div>
        <div v-else class="top-row-placeholder"></div>

        <div v-if="showUpContent" class="up-content">
            <div class="title">Katsching!</div>
            <div class="subtitle">Herzlichen Glückwunsch zu Deiner Auszahlung. Der gewünschte Betrag wird in 2-3
                Werktagen auf Deinem PayPal-Konto eingehen.</div>

            <div class="primary-btn">
                <router-link to="/">
                    <div class="p">Zurück zum Dashboard</div>
                </router-link>
            </div>

            <div class="final-bg" role="img" aria-label="Celebration Illustration"></div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useWalletStore } from '@/stores/wallet';

// الرصيد من مخزن المحفظة — كان رقماً ثابتاً مكتوباً في القالب.
// السحب يُحدّث المخزن (fetchBalance force في Auszahlung) قبل الانتقال إلى هنا.
const wallet = useWalletStore();
const formattedBalance = computed(() => wallet.formattedBalance);

// Control visibility of top-row and up-content
const showTopRow = ref(true);
const showUpContent = ref(false);

onMounted(() => {
    // Show up-content after 2 seconds
    setTimeout(() => {
        showUpContent.value = true;
    }, 2000);

    // Start top-row animation after 4.5 seconds (2s delay + 1s up-content animation + 2s wait)
    // Hide top-row after 5 seconds
    setTimeout(() => {
        showTopRow.value = false;
    }, 5000);
});
</script>

<style lang="scss" scoped>
.mains {
    display: flex;
    width: 100%;
    height: 88vh; // Full viewport height
    flex-direction: column;
    align-items: flex-start;
    gap: 100px;
    flex-shrink: 0;
    position: relative;
    overflow: hidden; // Prevent scrolling
}

// Top row and placeholder
.top-row {
    display: flex;
    align-items: center;
    gap: 20px;
    align-self: stretch;
    animation: slideUpOut 0.5s ease-out forwards;
    animation-delay: 4.5s; // Start after up-content appears + 2s wait
}

.top-row-placeholder {
    height: 68px; // Approximate height of top-row (20px padding + 28px font-size + padding)
    align-self: stretch;
}

@keyframes slideUpOut {
    0% {
        transform: translateY(0);
        opacity: 1;
    }
    100% {
        transform: translateY(-100px); // Slide up and disappear
        opacity: 0;
    }
}

.Guthaben {
    display: flex;
    padding: 20px;
    justify-content: space-between;
    align-items: center;
    flex: 1 0 0;
    align-self: stretch;
    border-radius: 20px;
    background: linear-gradient(90deg, var(--secondary) 0%, var(--Strawberry) 100%);
}

.title {
    color: #fff;
    font-family: Heebo;
    font-size: 28px;
    font-style: normal;
    font-weight: 700;
    line-height: 0.9;
    text-transform: uppercase;
}

.number {
    color: #fff;
    font-family: Heebo;
    font-size: 28px;
    font-style: normal;
    font-weight: 700;
    line-height: 0.9;
    text-transform: uppercase;
}

// up-content
.up-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 40px;
    align-self: stretch;
    position: absolute;
    top: 168px; // top-row (68px) + gap (100px)
    left: 0;
    right: 0;
    bottom: 0;
    animation: slideUp 1s ease-out forwards;
    overflow: hidden; // Ensure no internal overflow
}

@keyframes slideUp {
    0% {
        transform: translateY(100vh);
        opacity: 0;
    }
    100% {
        transform: translateY(0);
        opacity: 1;
    }
}

/* الخلفية عنصر موضَّع، فتُرسم فوق النصّ الساكن ما لم نرفعه. */
.up-content .title,
.up-content .subtitle {
    position: relative;
    z-index: 1;
}

.up-content .title {
    color: var(--Main-Colors-White, #FFF);
    font-family: Heebo;
    font-size: 92px;
    font-style: normal;
    font-weight: 700;
    line-height: .9;
    text-transform: uppercase;
}

.up-content .subtitle {
    width: 430px;
    color: var(--Main-Colors-White, #FFF);
    text-align: center;
    font-family: Heebo;
    font-size: 18px;
    font-style: normal;
    font-weight: 300;
    line-height: normal;
}

.up-content .primary-btn {
    display: flex;
    padding: 12px 20px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    border-radius: 5px;
    background: #DD1155;
    border: none;
    cursor: pointer;
    z-index: 5;
    transition: .3s ease;
}

.up-content .primary-btn:hover {
    background: var(--dark-red);
}

.up-content .primary-btn .p {
    color: var(--Main-Colors-White, #FFF);
    font-family: Heebo;
    font-size: 16px;
    font-style: normal;
    font-weight: 400;
    line-height: 1;
    text-transform: uppercase;
}

/* الصورة خلفيةٌ من طبقتين: التلاشي فوق والصورة تحته — نفس صفحة final.vue
   حتى تكون شاشة «شكراً» بعد السحب مطابقة لشاشة نهاية الإصدار. */
.final-bg {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    aspect-ratio: 1534 / 498;
    z-index: 0;
    pointer-events: none;
    background: linear-gradient(180deg, rgba(27, 28, 32, 0.00) 40%, var(--Main-Colors-Slate-Dark, #1B1C20) 100%),
                url('/img/thanks/thanks2.webp') center top / 100% auto no-repeat;
}

</style>
