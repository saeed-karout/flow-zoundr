```vue
<template>
  <div class="main">
    <div class="contents">
      <Popup v-if="showPopup" @allow="allowPopup" @deny="denyPopup" />
      <div class="Box">
        <div class="title">Was möchtest du releasen?</div>
        <div class="Cards">
          <RouterLink to="/upload">
            <TiltCard
              class="Card card1"
              ref="card1"
              @mousemove="handleMouseMove($event, 'card1')"
              @mouseleave="handleMouseLeave('card1')"
              @click="setReleaseType('DEINE NEUE SINGLE')"
              :class="{
                'hover-tl': activeCorners.card1 === 'tl',
                'hover-tr': activeCorners.card1 === 'tr',
                'hover-bl': activeCorners.card1 === 'bl',
                'hover-br': activeCorners.card1 === 'br'
              }"
            >
              <div class="title">Single</div>
              <div class="subtitle">1-3 Songs</div>
            </TiltCard>
          </RouterLink>
          <TiltCard
            class="Card card2"
            ref="card2"
            @mousemove="handleMouseMove($event, 'card2')"
            @mouseleave="handleMouseLeave('card2')"
            @click="navigateToUpload('DEINE NEUE EP')"
            :class="{
              'hover-tl': activeCorners.card2 === 'tl',
              'hover-tr': activeCorners.card2 === 'tr',
              'hover-bl': activeCorners.card2 === 'bl',
              'hover-br': activeCorners.card2 === 'br'
            }"
          >
            <div class="title" style="position: relative; top: -20px;">DEINE NEUE EP</div>
            <div class="subtitle" >3-6 Songs</div>
          </TiltCard>
          <TiltCard
            class="Card card3"
            ref="card3"
            @mousemove="handleMouseMove($event, 'card3')"
            @mouseleave="handleMouseLeave('card3')"
            @click="navigateToUpload('DEIN NEUES ALBUM')"
            :class="{
              'hover-tl': activeCorners.card3 === 'tl',
              'hover-tr': activeCorners.card3 === 'tr',
              'hover-bl': activeCorners.card3 === 'bl',
              'hover-br': activeCorners.card3 === 'br'
            }"
          >
            <div class="title">Album</div>
            <div class="subtitle">7-∞ Songs</div>
          </TiltCard>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useReleaseStore } from '@/stores/release';
import TiltCard from '@/components/TiltCard.vue';
import Popup from '@/components/modals/PupUpStart.vue';

const router = useRouter();
const releaseStore = useReleaseStore();

const showPopup = ref(true);

const allowPopup = () => {
  showPopup.value = false;
  console.log('Popup allowed');
  if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
    DeviceMotionEvent.requestPermission()
      .then(permissionState => {
        if (permissionState === 'granted') {
          console.log('Gyroscope permission granted');
        }
      })
      .catch(console.error);
  }
};

const denyPopup = () => {
  showPopup.value = false;
  console.log('Popup denied');
};

const activeCorners = reactive({
  card1: null,
  card2: null,
  card3: null
});

const card1 = ref(null);
const card2 = ref(null);
const card3 = ref(null);

const cornerSize = 100;

const handleMouseMove = (event, cardId) => {
  const cardRef = { card1, card2, card3 }[cardId];
  const card = cardRef.value?.$el;
  if (!card || typeof card.getBoundingClientRect !== 'function') {
    console.error(`Card with ref ${cardId} is not a valid DOM element`);
    return;
  }
  const rect = card.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const width = rect.width;
  const height = rect.height;

  console.log(`Card: ${cardId}, X: ${x}, Y: ${y}, Active: ${activeCorners[cardId]}`);

  let corner = null;
  if (x < cornerSize && y < cornerSize) {
    corner = 'tl';
  } else if (x > width - cornerSize && y < cornerSize) {
    corner = 'tr';
  } else if (x < cornerSize && y > height - cornerSize) {
    corner = 'bl';
  } else if (x > width - cornerSize && y > height - cornerSize) {
    corner = 'br';
  }

  activeCorners[cardId] = corner;
};

const handleMouseLeave = (cardId) => {
  activeCorners[cardId] = null;
};

const navigateToUpload = (releaseType) => {
  releaseStore.setReleaseType(releaseType);
  router.push('/upload');
};

const setReleaseType = (releaseType) => {
  releaseStore.setReleaseType(releaseType);
};
</script>

<style lang="scss" scoped>
.main {
  display: flex;
  height: calc(100vh - 71px - 50px);
  position: relative;
  overflow-x: hidden;
}

.contents {
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  align-self: stretch;
}

.Box {
  display: flex;
  height: 80%;
  padding: 64px 152px;
  flex-direction: column;
  align-items: center;
  gap: 80px;
  flex-shrink: 0;
  align-self: stretch;
  border-radius: 20px;
  background: linear-gradient(180deg, var(--secondary) 0%, var(--primary) 100%);
}

.title {
  color: #FFF;
  font-family: Heebo, sans-serif;
  font-size: 40px;
  font-weight: 700;
  line-height: 1;
  text-transform: uppercase;
  pointer-events: none;
}

.Cards {
  display: flex;
  justify-content: space-between;
  align-items: center;
  align-self: stretch;
}

.Card {
  display: flex;
  width: 340px;
  height: 340px;
  padding: 116px 20px 80px 20px;
  flex-direction: column;
  align-items: center;
  gap: 48px;
  border-radius: 20px;
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  cursor: pointer;
  position: relative;
  transition: border 0.3s ease;
}

.card1 {
  background-image: url('../assets/images/bg-card-release/1-min.png');
}

.card2 {
  background-image: url('../assets/images/bg-card-release/2-min.png');
}

.card3 {
  background-image: url('../assets/images/bg-card-release/3-min.png');
}

.Cards .title {
  height: 100px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: #FFF;
  text-align: center;
  font-family: Heebo, sans-serif;
  font-size: 58px;
  font-weight: 700;
  text-transform: uppercase;
  pointer-events: none;
  z-index: 2;
}

.Cards .subtitle {
  color: #FFF;
  font-family: Heebo, sans-serif;
  font-size: 16px;
  font-weight: 700;
  text-transform: uppercase;
  pointer-events: none;
  z-index: 2;
  height: 24px;
  display: flex;
  align-items: center;
}

.Card::before {
  content: '';
  position: absolute;
  opacity: 0;
  transition: opacity 0.3s ease;
  width: 50px;
  height: 50px;
  z-index: 3;
}

.Card::after {
  content: '';
  position: absolute;
  opacity: 0;
  transition: opacity 0.3s ease;
  width: 100%;
  height: 100%;
}

.hover-tl::before {
  top: 0;
  left: 0;
  border-right: none;
  border-bottom: none;
  border-radius: 20px 0 0 0;
  opacity: 1;
  animation: fadeOutBorder 1.5s ease forwards;
}

.hover-tl::after {
  opacity: 1;
}

.hover-tr::before {
  top: 0;
  right: 0;
  border-left: none;
  border-bottom: none;
  border-radius: 0 20px 0 0;
  opacity: 1;
  animation: fadeOutBorder 1.5s ease forwards;
}

.hover-tr::after {
  opacity: 1;
}

.hover-bl::before {
  bottom: 0;
  left: 0;
  border-right: none;
  border-top: none;
  border-radius: 0 0 0 20px;
  opacity: 1;
  animation: fadeOutBorder 1.5s ease forwards;
}

.hover-bl::after {
  opacity: 1;
}

.hover-br::before {
  bottom: 0;
  right: 0;
  border-left: none;
  border-top: none;
  border-radius: 0 0 20px 0;
  opacity: 1;
  animation: fadeOutBorder 1.5s ease forwards;
}

.hover-br::after {
  opacity: 1;
}

@keyframes fadeOutBorder {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}


@media (max-width:1599px) {
    .Box{
      padding: 64px 32px;
    }


    .Card{
      width:clamp(308px, calc(308px + 54 * (100vw - 1440px) / 159), 362px);
      height:clamp(308px, calc(308px + 54 * (100vw - 1440px) / 159), 362px);
    }


    .Cards .title{
      font-size: 52px;
    }

    .Cards .subtitle{
      position: absolute;
      bottom: 50px;
    }
}


@media (min-width:1600px) and (max-width:2074px){
   .Box{
      padding: 64px 72px;
    }

    .Card{
      width: 340px;
      height: 340px;
    }


    

    .Cards .subtitle{
      position: absolute;
      bottom: clamp(40px,2px,63px); 
    }
}


@media (min-width:2075px) and (max-width:2560px){
 .Box{
      padding: 160px 132px;
      position: relative;
      
    }


    .Cards .title{
      font-size: 72px;
      line-height: 1;
      
    }

    .Cards{
   display: flex;
max-width: 1560px;
position: absolute;
width: 100%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);


      
    }


    .Card:nth-child(2) .title{
      padding-top: 50px;

    }

    .Card{
      width: 440px;
      height: 440px;
      padding: 152px 20px 80px 20px;
      gap: 112px;
      align-items: center;
    }

    .Cards .subtitle{
      position: absolute;
      bottom: clamp(50px,2px,63px); 
    }
}
</style>
```