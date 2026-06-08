<template>
    <div class="main">
        <div class="content-wrapper">
            <div class="bg-image" :style="bgImageStyle">
                <div class="image-blur">
                    <div class="content-songs">
                        <div class="head-section">
                            <ProgressBar :startColor="[51, 27, 39]" :endColor="[222, 20, 86]" :items="progressItems"
                                :with_transition="true" type="percent" :percent="progressPercent" />
                            <div class="top-line">
                                <div class="p">{{ sectionTitle }}</div>
                                
                                <!-- صورة نوع الأغنية (تظهر فقط في firstSection عندما currentStep === 2) -->
                                <img 
                                    v-if="currentStep === 2 && currentView === 'firstSection'"
                                    :src="displayTopLineImage" 
                                    alt="Top line image"
                                    class="top-line-image clickable"
                                    @click="handleTopLineImageClick"
                                    @error="handleImageError"
                                >
                                
                                <!-- صورة الرجوع (تظهر في infos فقط) -->
                                <img 
                                    v-if="currentView === 'infos'"
                                    src="/icon/upload2/backToCompFirstSection.svg"
                                    alt="Back to song list"
                                    class="top-line-image back-button"
                                    @click="handleBackToFirstSection"
                                    @load="() => console.log('✅ Back button image loaded successfully')"
                                    @error="(e) => console.error('❌ Back button image failed to load:', e.target.src)"
                                >
                            </div>
                        </div>

                        <div class="slot-container">
                            <slot></slot>
                        </div>
                    </div>
                </div>
            </div>

            <div class="column2">
                <div class="video" @click="openVideoPopup">
                    <div class="youtube">
                        <img src="/icon/play.png" alt="Play">
                    </div>
                </div>

                <tabs :server-cover-url="serverCoverUrl" @update-tab="$emit('update-tab', $event)"
                    @back="$emit('back')" />
            </div>
        </div>

        <div v-if="showVideoPopup" class="video-popup-overlay" @click="closeVideoPopup">
            <div class="video-popup-container" @click.stop>
                <iframe width="100%" height="100%" :src="'https://www.youtube.com/embed/' + videoId + '?autoplay=1'"
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture;"
                    allowfullscreen>
                </iframe>
                <button class="close-btn" @click="closeVideoPopup">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import ProgressBar from '@/zoundr/components/ProgressBar.vue';
import tabs from '../uploadPngSteps/Upload2/tabs.vue';

const props = defineProps({
    currentStep: { type: Number, required: true },
    steps: { type: Array, default: () => ['0', '1', '2', '3', '4'] },
    sectionTitle: { type: String, default: 'Dein Neue Single' },
    topLineImage: { type: [String, null], default: null },
    serverCoverUrl: { type: [String, null], default: null },
    currentView: { type: String, default: 'main' }
});

const emit = defineEmits(['update-tab', 'back', 'update:topLineImage', 'change-song-type', 'back-to-first-section']);

const showVideoPopup = ref(false);
const videoId = ref('WPni755-Krg');

// مراقبة تغييرات currentView
watch(() => props.currentView, (newVal, oldVal) => {
    console.log('📺 [PreReleaseLayout] currentView changed:', { old: oldVal, new: newVal });
}, { immediate: true });

// الصورة المعروضة لنوع الأغنية
const displayTopLineImage = computed(() => {
    return props.topLineImage || '/icons/top-line/lossless.png';
});

// دالة معالجة النقر على صورة نوع الأغنية (تغيير نوع الأغنية)
const handleTopLineImageClick = () => {
    console.log('🖱️ [PreReleaseLayout] تم النقر على الصورة العلوية');
    console.log('currentView:', props.currentView);
    
    if (props.currentView !== 'firstSection') {
        console.log('⚠️ الصورة غير قابلة للنقر في هذا الوضع');
        return;
    }
    
    if (confirm('Möchten Sie den Songtyp ändern? Alle nicht gespeicherten Änderungen gehen verloren.')) {
        console.log('✅ تم تأكيد تغيير نوع الأغنية');
        emit('change-song-type');
    }
};

// دالة معالجة النقر على زر الرجوع (العودة إلى FirstSection)
const handleBackToFirstSection = () => {
    console.log('🔙 [PreReleaseLayout] تم النقر على زر الرجوع - العودة إلى FirstSection');
    console.log('currentView before emit:', props.currentView);
    emit('back-to-first-section');
};

const openVideoPopup = () => {
    showVideoPopup.value = true;
    document.body.style.overflow = 'hidden';
};

const closeVideoPopup = () => {
    showVideoPopup.value = false;
    document.body.style.overflow = '';
};

const progressItems = computed(() => {
    return props.steps.map((_, index) => ({
        id: index,
        completed: index < props.currentStep,
    }));
});

const progressPercent = computed(() => {
    return (props.currentStep / props.steps.length) * 100;
});

const bgImageStyle = computed(() => {
    if (props.serverCoverUrl) {
        return {
            backgroundImage: `url(${props.serverCoverUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
        };
    }
    return { backgroundColor: 'var(--secondary)' };
});

const handleImageError = (event) => {
    console.error('Image failed to load:', event.target.src);
    event.target.src = '/icons/top-line/lossless.png';
};
</script>

<style lang="scss" scoped>
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Heebo', sans-serif;
}

.main {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border-radius: 20px;
    width: 100%;
    height: calc(100dvh - 71px - 50px);
}

.head-section {
    display: flex;
    width: 100%;
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
}

.top-line {
    display: flex;
    height: 14px;
    justify-content: space-between;
    align-items: center;
    align-self: stretch;
}

.top-line .p {
    color: #FFF;
    font-family: Heebo;
    font-size: 20px;
    font-style: normal;
    font-weight: 700;
    line-height: 1;
    text-transform: uppercase;
}

.top-line .top-line-image {
    height: 32px;
    width: auto;
    display: block;
    cursor: pointer;
    transition: transform 0.2s ease, opacity 0.2s ease;
}

.top-line .top-line-image.clickable {
    cursor: pointer;
}

.top-line .top-line-image.clickable:hover {
    transform: scale(1.05);
    opacity: 0.8;
}

.top-line .top-line-image.clickable:active {
    transform: scale(0.95);
}

/* زر الرجوع */
.top-line .back-button {
    cursor: pointer;
    width: 21px;
    transition: transform 0.2s ease, opacity 0.2s ease;
}

.top-line .back-button:hover {
    transform: scale(1.05);
    opacity: 0.8;
}

.top-line .back-button:active {
    transform: scale(0.95);
}

.content-wrapper {
    display: flex;
    width: 100%;
    height: 100%;
    flex-grow: 1;
    min-width: 0;
}

.content-songs {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    flex: 1 0 0;
    border-radius: 20px;
    position: relative;
    height: 100%;
    overflow: hidden;
    padding: 20px;
    gap: 20px;
}

.column2 {
    display: flex;
    width: 240px;
    height: 100%;
    flex-direction: column;
    align-items: flex-start;
    flex-shrink: 0;
}

.column2 .video {
    display: flex;
    height: 143px;
    padding: 0 0 20px 20px;
    flex-direction: column;
    align-items: flex-end;
    gap: 7px;
    flex-shrink: 0;
    align-self: stretch;
    aspect-ratio: 240/143;
}

.video .youtube {
    display: flex;
    width: 220px;
    height: 123px;
    padding: 39px 83px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
    aspect-ratio: 220/123;
    border-radius: 20px;
    background: var(--Main-Colors-Slate, #26282D);
    cursor: pointer;
}

.video .youtube:hover {
    transition: 0.3s ease;
    border: 1px solid var(--move);
}

.video .youtube:hover img {
    filter: brightness(0) invert(1);
}

.bg-image {
    display: flex;
    flex: 1 1 0;
    min-width: 0;
    flex-direction: column;
    align-items: flex-start;
    aspect-ratio: 1/1;
    border-radius: 20px;
}

.bg-image .image-blur {
    flex: 1 0 0;
    align-self: stretch;
    background: rgba(38, 40, 45, 0.80);
    backdrop-filter: blur(10px);
    border-radius: 20px;
}

.video-popup-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.6);
    z-index: 1000;
    display: flex;
    justify-content: center;
    align-items: center;
    animation: fadeIn 0.3s ease-out;
}

.video-popup-container {
    position: relative;
    width: 80%;
    max-width: 1000px;
    aspect-ratio: 16/9;
    background: #000;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.video-popup-container iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

.close-btn {
    position: absolute;
    top: 20px;
    right: 20px;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    border: none;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 10;
    transition: all 0.2s ease;
}

.close-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    color: var(--Strawberry, #DE1456);
}

.close-btn svg {
    width: 20px;
    height: 20px;
}

.slot-container {
    flex: 1;
    width: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    display: flex;
    flex-direction: column;
}

.slot-container::-webkit-scrollbar {
    width: 8px;
}

.slot-container::-webkit-scrollbar-track {
    background: transparent;
}

.slot-container::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 4px;
}

.slot-container::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.4);
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

@media (min-width:1440px) and (max-width:1599px) {
    .column2 {
        width: 180px;
    }
    .column2 .video {
        height: 110px;
    }
    .video .youtube {
        width: 160px;
        height: 90px;
    }
}

@media (min-width:2075px) and (max-width:2560px) {
    .column2 {
        width: 286px;
    }
    .column2 .video {
        height: 172px;
    }
    .video .youtube {
        width: 266px;
        height: 149px;
    }
}
</style>