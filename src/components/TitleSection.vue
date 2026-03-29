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
      max: 15, // ميل معتدل
      speed: 500, // سرعة انتقال سلسة
      scale: 1.05, // تكبير طفيف
      glare: true, // تفعيل التوهج
      'max-glare': 0.2, // توهج خفيف
      gyroscope: true, // دعم الجيروسكوب
      perspective: 800, // منظور أقوى لتأثير ثلاثي أبعاد
      reset: true, // إعادة تعيين عند المغادرة
      transition: true, // انتقالات سلسة
      easing: 'cubic-bezier(.03,.98,.52,.99)' // تحريك سلس
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
  border: 2px solid rgba(255, 255, 255, 0.2); 
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3); 
}
</style>
```