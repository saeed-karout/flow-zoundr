<template>
  <div class="popup-overlay">
    <div class="main">
      <div class="top-line">
        <div class="title">RECHTE & KI-MUSIK</div>
        <div class="subtitle">
         Wir bei ZOUNDR finden es großartig, dass heute jeder die Möglichkeit hat, sich auf seine eigene Weise musikalisch auszudrücken. ZOUNDR steht jedoch für echte Künstler, echte Kreativität und echte Musik. Deshalb akzeptieren und unterstützen wir keine KI-generierten Künstler oder Bands.
Mit dem Hochladen Deiner Inhalte bestätigst Du außerdem, dass Du alle erforderlichen Rechte an den eingereichten Inhalten besitzt. Verwendest Du Musik, Aufnahmen, Samples oder andere Inhalte Dritter, musst Du über die dafür notwendigen Urheber-, Nutzungs- und/oder Leistungsschutzrechte verfügen.

        </div>
      </div>
      <!-- <div class="content">
        <iframe
          ref="vimeo_ref"
          class="vimeo-iframe"
          :src="`https://player.vimeo.com/video/${videoId}?controls=1&background=0&muted=0`"
          frameborder="0"
          allow="autoplay;"
        ></iframe>
      </div> -->
      <div class="Buttons">
        <button class="button-primary" @click="$emit('deny')">
          <span class="p">VERSTANDEN</span>
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
  
  padding: 12px 20px 13px 20px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  border-radius: 5px;
  background:#dd1155;
  cursor: pointer;
  border: none;
}

.button-primary:hover {
  transition: 0.3s ease;
  background: #990033;
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