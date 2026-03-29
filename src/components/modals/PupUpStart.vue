<template>
  <div class="popup-overlay">
    <div class="main">
      <div class="top-line">
        <div class="title">Dein erster Release!</div>
        <div class="subtitle">
          Hey, Du erstellst gerade Deinen ersten Release bei uns, möchtest Du unsere Hilfe? 
          Du kannst die Hilfe auch später jederzeit Um-/Ein- oder Ausschalten.
        </div>
      </div>
      <div class="content">
        <iframe
          ref="vimeo_ref"
          class="vimeo-iframe"
          :src="`https://player.vimeo.com/video/${videoId}?controls=1&background=0&muted=0`"
          frameborder="0"
          allow="autoplay;"
        ></iframe>
      </div>
      <div class="Buttons">
        <button class="button-primary" @click="$emit('deny')">
          <span class="p">Nein Danke!</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import Player from '@vimeo/player';

// Vimeo video ID
const videoId = ref('480705053');
const vimeo_ref = ref(null);
const player = ref(null);

// Initialize Vimeo player on mount
onMounted(async () => {
  try {
    await nextTick();
    if (!vimeo_ref.value) {
      console.error('Vimeo iframe reference is null or not found');
      return;
    }
    player.value = new Player(vimeo_ref.value, {
      id: videoId.value,
      controls: true,
      byline: false,
      portrait: false,
      title: false,
      transparent: false,
    });
    await player.value.loadVideo(videoId.value);
    await player.value.setVolume(1);
    const availableQualities = await player.value.getQualities();
    console.log('Available qualities:', availableQualities);
  } catch (error) {
    console.error('Error initializing Vimeo player:', error);
  }
});

// Clean up Vimeo player on unmount
onUnmounted(() => {
  if (player.value) {
    player.value.destroy().catch((error) => {
      console.error('Error destroying Vimeo player:', error);
    });
  }
});
</script>

<style lang="scss" scoped>
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5); /* Semi-transparent background */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000; /* Ensures popup is above all content */
}

.main {
  display: flex;
  width: 800px;
  padding: 52px 32px 40px 32px;
  flex-direction: column;
  align-items: flex-end;
  gap: 24px;
  flex-shrink: 0;
  border-radius: 20px;
  border: 2px solid var(--Strawberry, #FF4D4D); /* Fallback color */
  background: var(--secondary, #333); /* Fallback color */
}

.top-line {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 28px;
  align-self: stretch;
}

.top-line .title {
  align-self: stretch;
  color: #FFF;
  text-align: center;
  font-family: Heebo, sans-serif;
  font-size: 28px;
  font-weight: 700;
  line-height: 1;
  text-transform: uppercase;
}

.top-line .subtitle {
  align-self: stretch;
  color: var(--Main-Colors-White, #FFF);
  text-align: center;
  font-family: Heebo, sans-serif;
  font-size: 18px;
  font-weight: 300;
  line-height: 1.2;
}

.content {
  display: flex;
  padding: 20px 0px;
  justify-content: center;
  align-items: center;
  gap: 24px;
  align-self: stretch;
}

.vimeo-iframe {
  width: 496px;
  height: 280px;
  border-radius: 20px;
  border: none;
}

.Buttons {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  align-self: stretch;
}

.button-primary {
  display: flex;
  width: 160px;
  padding: 12px 20px 13px 20px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  border-radius: 5px;
  background: var(--Main-Colors-Slate-Light, #3A3E42);
  cursor: pointer;
  border: none;
}

.button-primary:hover {
  transition: 0.3s ease;
  background: var(--Strawberry);
}

.button-primary .p {
  color: var(--Main-Colors-White, #FFF);
  font-family: Heebo, sans-serif;
  font-size: 16px;
  font-weight: 400;
  line-height: 1;
  text-transform: uppercase;
}
</style>