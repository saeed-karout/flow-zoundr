<template>
  <img :src="iconPath" :alt="`${dspName} icon`" class="dsp-icon" />
</template>

<script setup>
import { computed } from 'vue';
import * as dspIcons from '@akashsarker/dsp-icons';

const props = defineProps({
  dspName: {
    type: String,
    required: true,
    default: 'default'
  }
});

const iconPath = computed(() => {
  try {
    // Check if the icon exists in the library
    if (dspIcons[props.dspName]) {
      return dspIcons[props.dspName];
    }
    // Return default icon if available
    return dspIcons.default || '';
  } catch (error) {
    console.error(`Icon for "${props.dspName}" not found.`);
    return '';
  }
});
</script>

<style scoped>
.dsp-icon {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
</style>