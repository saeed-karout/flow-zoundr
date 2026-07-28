<template>
    <Teleport to="body">
        <div v-if="show" class="video-popup-overlay" @click="$emit('close')">
            <div class="video-popup-container" @click.stop>
                <!-- ✅ تأكد من استخدام iframe الصحيح -->
                <iframe
                    ref="vimeoRef"
                    class="vimeo-iframe"
                    :src="`https://player.vimeo.com/video/${videoId}?autoplay=1&controls=1&byline=0&portrait=0&title=0`"
                    frameborder="0"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowfullscreen
                    loading="lazy"
                ></iframe>
                
                <button class="close-btn" @click="handleClose" aria-label="Close video">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
        </div>
    </Teleport>
</template>

<script setup>
import { ref, watch, nextTick, onMounted, onBeforeUnmount } from 'vue';

const props = defineProps({
    show: { type: Boolean, required: true },
    videoId: { type: String, required: true }
});

const emit = defineEmits(['close']);

const vimeoRef = ref(null);

// ✅ إعادة تحميل الفيديو عند تغيير videoId
watch(() => props.videoId, (newId) => {
    if (newId && props.show) {
        nextTick(() => {
            const iframe = vimeoRef.value;
            if (iframe) {
                // إعادة تحميل iframe
                const src = iframe.src;
                iframe.src = '';
                setTimeout(() => {
                    iframe.src = `https://player.vimeo.com/video/${newId}?autoplay=1&controls=1&byline=0&portrait=0&title=0`;
                }, 100);
            }
        });
    }
}, { immediate: true });

// ✅ إغلاق الفيديو عند الضغط على Escape
const handleKeydown = (event) => {
    if (event.key === 'Escape' && props.show) {
        handleClose();
    }
};

// ✅ إضافة وإزالة مستمع الأحداث
onMounted(() => {
    document.addEventListener('keydown', handleKeydown);
});

onBeforeUnmount(() => {
    document.removeEventListener('keydown', handleKeydown);
});

const handleClose = () => {
    emit('close');
};
</script>

<style lang="scss" scoped>
.video-popup-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(27, 28, 32, 0.85);
    z-index: 99999;
    display: flex;
    justify-content: center;
    align-items: center;
    animation: fadeIn 0.3s ease-out;
    padding: 20px;
    backdrop-filter: blur(8px);
}

.video-popup-container {
    position: relative;
    width: 90%;
    max-width: 1000px;
    aspect-ratio: 16 / 9;
    background: #000;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
    animation: scaleIn 0.3s ease-out;
}

.video-popup-container .vimeo-iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: none;
}

/* ===== Close Button ===== */
.close-btn {
    position: absolute;
    top: 16px;
    right: 16px;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    border: 2px solid rgba(255, 255, 255, 0.2);
    width: 44px;
    height: 44px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 10;
    transition: all 0.3s ease;
    backdrop-filter: blur(4px);
}

.close-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: var(--Strawberry, #DE1456);
    transform: scale(1.1);
}

.close-btn:active {
    transform: scale(0.95);
}

.close-btn svg {
    width: 20px;
    height: 20px;
    stroke: white;
    transition: stroke 0.3s ease;
}

.close-btn:hover svg {
    stroke: var(--Strawberry, #DE1456);
}

/* ===== Video Controls (optional) ===== */
.video-controls {
    position: absolute;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10;
    display: flex;
    gap: 12px;
    background: rgba(0, 0, 0, 0.6);
    padding: 10px 20px;
    border-radius: 30px;
    backdrop-filter: blur(4px);
    opacity: 0;
    transition: opacity 0.3s ease;
}

.video-popup-container:hover .video-controls {
    opacity: 1;
}

.control-btn {
    background: transparent;
    border: none;
    color: white;
    cursor: pointer;
    padding: 4px;
    transition: transform 0.2s ease, color 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
}

.control-btn:hover {
    color: var(--Strawberry, #DE1456);
    transform: scale(1.1);
}

.control-btn:active {
    transform: scale(0.95);
}

.control-btn svg {
    width: 24px;
    height: 24px;
}

/* ===== Animations ===== */
@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes scaleIn {
    from {
        opacity: 0;
        transform: scale(0.9) translateY(20px);
    }
    to {
        opacity: 1;
        transform: scale(1) translateY(0);
    }
}

/* ===== Responsive ===== */
@media (max-width: 768px) {
    .video-popup-container {
        width: 95%;
        border-radius: 12px;
    }
    
    .close-btn {
        top: 10px;
        right: 10px;
        width: 36px;
        height: 36px;
    }
    
    .close-btn svg {
        width: 16px;
        height: 16px;
    }
    
    .video-controls {
        bottom: 16px;
        padding: 8px 14px;
    }
    
    .control-btn svg {
        width: 18px;
        height: 18px;
    }
}

@media (max-width: 480px) {
    .video-popup-container {
        width: 98%;
        border-radius: 8px;
    }
    
    .close-btn {
        top: 8px;
        right: 8px;
        width: 32px;
        height: 32px;
    }
    
    .close-btn svg {
        width: 14px;
        height: 14px;
    }
    
    .video-controls {
        bottom: 12px;
        padding: 6px 12px;
    }
    
    .control-btn svg {
        width: 16px;
        height: 16px;
    }
}
</style>