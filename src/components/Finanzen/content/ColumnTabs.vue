<template>
    <div class="column2">
        <div class="youtube">
            <div class="video" @click="openVideoPopup">
                <img src="/icon/Play-youtube.svg" class="icon" alt="">
            </div>
        </div>
        <div v-for="(tab, index) in tabs" :key="index" :class="['tab-col', { active: activeTab === index }]"
            @click="$emit('set-active-tab', index)">
            <img src="/icon/Left_corner.svg" class="left-corner" alt="">
            <div class="Button">
                <img :src="tab.icon" class="icon-btn" alt="">
                <div class="p">{{ tab.title }}</div>
            </div>
            <img src="/icon/Left_corner.svg" class="right-corner" alt="">
        </div>
    </div>

    <!-- ✅ Video Popup مع دعم Esc -->
    <div v-if="showVideoPopup" class="video-popup-overlay" @click="closeVideoPopup">
        <div class="video-popup-container" @click.stop>
            <iframe 
                ref="vimeoRef"
                width="100%" 
                height="100%" 
                :src="vimeoEmbedUrl"
                frameborder="0"
                allow="autoplay; fullscreen; picture-in-picture"
                allowfullscreen
                loading="lazy"
                @error="handleIframeError"
            >
            </iframe>
            <button class="close-btn" @click="closeVideoPopup">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
            <div v-if="videoError" class="video-error">
                <p>⚠️ Fehler beim Laden des Videos.</p>
                <p class="video-id">Video ID: {{ videoId }}</p>
                <button @click="reloadVideo" class="reload-btn">Neu laden</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';

const props = defineProps({
    tabs: { type: Array, default: () => [] },
    activeTab: { type: Number, default: 0 },
    videoId: { type: String, default: '480705053' }
});

const emit = defineEmits(['set-active-tab']);

// ========== Video Popup ==========
const showVideoPopup = ref(false);
const videoId = ref(props.videoId || '480705053');
const vimeoRef = ref(null);
const videoError = ref(false);

// ========== بناء رابط Vimeo ==========
const vimeoEmbedUrl = computed(() => {
    const id = videoId.value?.replace(/\D/g, '') || '480705053';
    const params = new URLSearchParams({
        autoplay: '1',
        controls: '1',
        byline: '0',
        portrait: '0',
        title: '0',
        dnt: '1',
        transparent: '0',
        responsive: '1'
    });
    return `https://player.vimeo.com/video/${id}?${params.toString()}`;
});

// ========== دوال الفيديو ==========
const openVideoPopup = () => {
    console.log('🎬 [Column2] Opening Vimeo video with ID:', videoId.value);
    showVideoPopup.value = true;
    videoError.value = false;
    document.body.style.overflow = 'hidden';
};

const closeVideoPopup = () => {
    showVideoPopup.value = false;
    document.body.style.overflow = '';
    videoError.value = false;
};

const reloadVideo = () => {
    videoError.value = false;
    const iframe = vimeoRef.value;
    if (iframe) {
        const src = iframe.src;
        iframe.src = '';
        setTimeout(() => {
            iframe.src = src;
        }, 200);
    }
};

const handleIframeError = (error) => {
    console.error('❌ Vimeo iframe error:', error);
    videoError.value = true;
};

// ========== 🔥 مستمع حدث Esc ==========
const handleKeydown = (event) => {
    if (showVideoPopup.value && event.key === 'Escape') {
        console.log('⌨️ [Column2] Esc pressed, closing video popup');
        closeVideoPopup();
    }
};

// ========== دورة الحياة ==========
onMounted(() => {
    document.addEventListener('keydown', handleKeydown);
});

onBeforeUnmount(() => {
    document.removeEventListener('keydown', handleKeydown);
    document.body.style.overflow = '';
});
</script>

<style lang="scss" scoped>
.column2 {
    display: flex;
    width: 240px;
    flex-direction: column;
    align-items: flex-start;
    align-self: stretch;
    max-height: 0;
}

.column2 .youtube {
    display: flex;
    height: 143px;
    padding: 0px 0px 20px 20px;
    flex-direction: column;
    align-items: flex-end;
    gap: 7px;
    align-self: stretch;
    aspect-ratio: 240/143;
}

.youtube .video {
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
    background: var(--secondary);
    cursor: pointer;
    transition: border 0.3s ease;
}

.youtube .video .icon {
    width: 44px;
    height: 40px;
    flex-shrink: 0;
    fill: var(--selvar);
    transition: filter 0.3s ease;
}

.youtube .video:hover .icon {
    filter: brightness(0) invert(1);
}

.youtube .video:hover {
    border: 1px solid #D15;
}

.tab-col {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    flex: 1 0 0;
    align-self: stretch;
    position: relative;
}

.tab-col .left-corner,
.tab-col .right-corner {
    display: none;
    position: absolute;
    width: 20px;
    height: 20px;
    fill: var(--Main-Colors-Slate, #26282D);
    z-index: 10;
}

.tab-col .left-corner {
    top: -20px;
}

.tab-col .right-corner {
    bottom: -19px;
    transform: rotate(90deg);
}

.tab-col:nth-child(7) .right-corner {
    bottom: 0px;
    left: -20px;
    transform: rotate(270deg);
}

.tab-col.active .Button,
.tab-col:hover .Button {
    background: var(--secondary);
    border-radius: 0 20px 20px 0;
    cursor: pointer;
}

.tab-col.active .Button .p,
.tab-col:hover .Button .p {
    color: #FFF;
}

.tab-col.active .Button .icon-btn,
.tab-col:hover .Button .icon-btn {
    filter: brightness(0) invert(1);
}

.tab-col.active .left-corner,
.tab-col.active .right-corner,
.tab-col:hover .left-corner,
.tab-col:hover .right-corner {
    display: block;
}

.tab-col .Button {
    display: flex;
    padding: 14.75px 30px;
    align-items: center;
    gap: 20px;
    align-self: stretch;
    background: var(--primary);
    border-radius: 0;
}

.tab-col .Button .icon-btn {
    display: flex;
    padding: 2.5px 2px;
    align-items: center;
    gap: 10px;
}

.tab-col .Button .p {
    color: var(--selvar);
    font-family: 'Heebo';
    font-size: 20px;
    font-style: normal;
    font-weight: 400;
    line-height: 0.8;
    text-transform: uppercase;
}

img,
svg {
    vertical-align: 0;
}

/* ========== Video Popup Styles ========== */
.video-popup-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #1b1c20a6;
    z-index: 1000;
    display: flex;
    justify-content: center;
    align-items: center;
    backdrop-filter: blur(8px);
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

.video-error {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: white;
    text-align: center;
    z-index: 5;
    background: rgba(0, 0, 0, 0.85);
    padding: 30px 40px;
    border-radius: 12px;
    min-width: 250px;
}

.video-error .video-id {
    font-size: 12px;
    opacity: 0.6;
    margin-top: 8px;
}

.reload-btn {
    margin-top: 16px;
    padding: 8px 24px;
    background: var(--Strawberry, #DE1456);
    border: none;
    border-radius: 5px;
    color: white;
    cursor: pointer;
    font-family: Heebo, sans-serif;
    font-size: 14px;
    transition: background 0.3s ease;
}

.reload-btn:hover {
    background: #b01048;
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

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

/* ========== Responsive ========== */
@media (min-width:1440px) and (max-width:1599px) {
    .column2 {
        width: 180px;
    }

    .youtube .video {
        height: 105px;
        width: 160px;
        padding: 39px 75px;
    }

    .tab-col .Button {
        display: flex;
        padding: 14px 20px;
        align-items: center;
        gap: 16px;
        align-self: stretch;
        max-height: 53px;
    }

    .tab-col .Button .p {
        overflow: hidden;
        text-overflow: ellipsis;
        font-size: 16px;
    }
}

@media (min-height:1062px) {
    .tab-col:nth-child(7) .right-corner {
        bottom: -19px;
        left: 0;
        rotate: 180deg;
    }
}

@media (min-width:1440px) and (max-width:1599px) {
    @media (min-height:970px) {
        .tab-col:nth-child(7) .right-corner {
            bottom: -19px;
            left: 0;
            rotate: 180deg;
        }
    }
}
</style>