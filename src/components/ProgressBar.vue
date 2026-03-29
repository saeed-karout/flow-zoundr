<template>
  <div class="progress-container">
    <div class="progress-wrapper">
      <!-- حاوية شريط التقدم -->
      <div class="progress-bar">
        <!-- الجزء المملوء -->
        <div
          class="progress-filled"
          :style="{
            width: steps ? `${((currentStep + 1) / steps.length) * 100}%` : '0%'
          }"
        ></div>

        <!-- المراحل -->
        <div
          v-if="steps"
          v-for="(stage, index) in steps.length"
          :key="index"
          class="progress-step"
          :class="{
            'step-transparent': index <= currentStep,
            'step-primary': index > currentStep
          }"
        ></div>

        <!-- الفواصل -->
        <div
          v-if="steps"
          v-for="index in steps.length - 1"
          :key="'separator-' + index"
          class="progress-separator"
          :style="{ left: `${(index / steps.length) * 100}%` }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    currentStep: {
      type: Number,
      required: true,
    },
    steps: {
      type: Array,
      required: true,
      default: () => [],
    },
  },
};
</script>

<style scoped>
.progress-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.progress-wrapper {
  width: 100%;
}

.progress-bar {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: var(--primary); 
  border-radius: 1rem 0.75rem 0.75rem 1rem;
  height: 24px;
  /* margin-top: 0.5rem; */
  overflow: hidden;
}

.progress-filled {
  position: absolute;
  top: 0;
  left: 5px;
  height: 100%;
  background: linear-gradient(to right, var(--primary), var(--move)); 
  overflow: hidden;
  transition: width 0.6s ease;
  transform: skewX(-45deg);
  transform-origin: right;
}

.progress-step {
  flex: 1;
  height: 100%;
  transform: skewX(-45deg);

}

.step-transparent {
  background-color: transparent;
}

.step-primary {
  background-color: var(--primary); 
}

.progress-separator {
  position: absolute;
  width: 4px;
  height: 56px;
  top: -50%;
  background-color: var(--secondary);
  transform: rotate(45deg);
}
</style>
