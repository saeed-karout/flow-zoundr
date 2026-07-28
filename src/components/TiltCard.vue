```vue
<template>
  <div ref="tiltRef" class="tilt-card">
    <slot />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import VanillaTilt from 'vanilla-tilt';

const tiltRef = ref(null);

onMounted(() => {
  if (tiltRef.value) {
    VanillaTilt.init(tiltRef.value, {
      max: 5,
      speed: 400,
      scale: 1.02,
      glare: true,
      "max-glare": 0.2,
      gyroscope: true
    });
  }
});

onBeforeUnmount(() => {
  if (tiltRef.value?.vanillaTilt) {
    tiltRef.value.vanillaTilt.destroy();
  }
});
</script>

<style scoped>
.tilt-card {
  will-change: transform;
  transform-style: preserve-3d;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border-radius: 20px;

  &:hover{
        transition: .3s ease;
      box-shadow: 8px 8px 20px 19px rgba(0, 0, 0, 0.3);
  }
}
</style>
```