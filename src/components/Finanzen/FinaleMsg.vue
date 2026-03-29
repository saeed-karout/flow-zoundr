```vue
<template>
    <div class="mains">
        <div v-if="showTopRow" class="top-row">
            <div class="Guthaben">
                <div class="title">Dein Verfügbares Guthaben</div>
                <div class="number">2.761,66 EUR</div>
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

            <div class="content-images">
                <div class="column1">
                    <img class="img-test1" src="../../assets/images/column/col1/1.png" alt="Celebration Image">
                    <img class="img-test1" src="../../assets/images/column/col1/2.png" alt="Celebration Image">
                    <img class="img-test1" src="../../assets/images/column/col1/3.png" alt="Celebration Image">
                    <img class="img-test1" src="../../assets/images/column/col1/4.png" alt="Celebration Image">
                </div>
                <div class="column2">
                    <img class="img-test1" src="../../assets/images/column/col2/1.png" alt="Celebration Image">
                    <img class="img-test1" src="../../assets/images/column/col2/2.png" alt="Celebration Image">
                    <img class="img-test1" src="../../assets/images/column/col2/3.png" alt="Celebration Image">
                    <img class="img-test1" src="../../assets/images/column/col2/4.png" alt="Celebration Image">
                </div>
                <div class="column3">
                    <img class="img-test1" src="../../assets/images/column/col3/1.png" alt="Celebration Image">
                    <img class="img-test1" src="../../assets/images/column/col3/2.png" alt="Celebration Image">
                    <img class="img-test1" src="../../assets/images/column/col3/3.png" alt="Celebration Image">
                    <img class="img-test1" src="../../assets/images/column/col3/4.png" alt="Celebration Image">
                    <img class="img-test1" src="../../assets/images/column/col3/5.png" alt="Celebration Image">
                </div>
                <div class="column4">
                    <img class="img-test1" src="../../assets/images/column/col4/1.png" alt="Celebration Image">
                    <img class="img-test1" src="../../assets/images/column/col4/2.png" alt="Celebration Image">
                    <img class="img-test1" src="../../assets/images/column/col4/3.png" alt="Celebration Image">
                    <img class="img-test1" src="../../assets/images/column/col4/4.png" alt="Celebration Image">
                </div>
                <div class="column5">
                    <img class="img-test1" src="../../assets/images/column/col5/1.png" alt="Celebration Image">
                    <img class="img-test1" src="../../assets/images/column/col5/2.png" alt="Celebration Image">
                    <img class="img-test1" src="../../assets/images/column/col5/3.png" alt="Celebration Image">
                    <img class="img-test1" src="../../assets/images/column/col5/4.png" alt="Celebration Image">
                </div>
                <div class="column6">
                    <img class="img-test1" src="../../assets/images/column/col6/1.png" alt="Celebration Image">
                    <img class="img-test1" src="../../assets/images/column/col6/2.png" alt="Celebration Image">
                    <img class="img-test1" src="../../assets/images/column/col6/3.png" alt="Celebration Image">
                </div>
                <div class="column7">
                    <img class="img-test1" src="../../assets/images/column/col7/1.png" alt="Celebration Image">
                    <img class="img-test1" src="../../assets/images/column/col7/2.png" alt="Celebration Image">
                    <img class="img-test1" src="../../assets/images/column/col7/3.png" alt="Celebration Image">
                    <img class="img-test1" src="../../assets/images/column/col7/4.png" alt="Celebration Image">
                </div>
                <div class="column8">
                    <img class="img-test1" src="../../assets/images/column/col8/1.png" alt="Celebration Image">
                    <img class="img-test1" src="../../assets/images/column/col8/2.png" alt="Celebration Image">
                    <img class="img-test1" src="../../assets/images/column/col8/3.png" alt="Celebration Image">
                </div>
                <div class="column9">
                    <img class="img-test1" src="../../assets/images/column/col9/1.png" alt="Celebration Image">
                    <img class="img-test1" src="../../assets/images/column/col9/2.png" alt="Celebration Image">
                    <img class="img-test1" src="../../assets/images/column/col9/3.png" alt="Celebration Image">
                </div>
                <div class="column10">
                    <img class="img-test1" src="../../assets/images/column/col10/1.png" alt="Celebration Image">
                    <img class="img-test1" src="../../assets/images/column/col10/2.png" alt="Celebration Image">
                    <img class="img-test1" src="../../assets/images/column/col10/3.png" alt="Celebration Image">
                </div>
            </div>
            <div class="Fade"></div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import testImage from '@/assets/icons/dashboard/user/user.jpg';

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

.up-content .title {
    color: var(--Main-Colors-White, #FFF);
    font-family: Heebo;
    font-size: 92px;
    font-style: normal;
    font-weight: 700;
    line-height: .8;
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
    line-height: 1.2;
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

.content-images {
    display: flex;
    width: 100%;
    align-items: flex-start;
    gap: 20px;
    position: absolute;
    bottom: 0px;
    left: 0;
    right: 0;
    height: 550px; // Adjusted to fit within viewport
    overflow: hidden;
}

// Column animations
.content-images [class^="column"] {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
    flex: 1 0 0;
    animation: slideUpColumn 0.8s ease-out forwards;
}

.content-images .column1 { padding-top: 160px; animation-delay: 0s; }
.content-images .column2 { padding-top: 80px; animation-delay: 0.1s; }
.content-images .column3 { padding-top: 0; animation-delay: 0.2s; }
.content-images .column4 { padding-top: 80px; animation-delay: 0.3s; }
.content-images .column5 { padding-top: 160px; animation-delay: 0.4s; }
.content-images .column6 { padding-top: 240px; animation-delay: 0.5s; }
.content-images .column7 { padding-top: 160px; animation-delay: 0.6s; }
.content-images .column8 { padding-top: 240px; animation-delay: 0.7s; }
.content-images .column9 { padding-top: 320px; animation-delay: 0.8s; }
.content-images .column10 { padding-top: 240px; animation-delay: 0.9s; }

@keyframes slideUpColumn {
    0% {
        transform: translateY(50px);
        opacity: 0;
    }
    100% {
        transform: translateY(0);
        opacity: 1;
    }
}

.img-test1 {
    height: 136px;
    width: 100%;
    align-self: stretch;
    aspect-ratio: 1/1;
    border-radius: 12px;
    object-fit: cover;
}

.Fade {
    width: 100%;
    height: 100%; // Match up-content height
    position: absolute;
    right: 0;
    top: 12px;
    background: linear-gradient(180deg, rgba(27, 28, 32, 0.00) 0%, var(--primary) 100%);
}
</style>
```