```vue
<template>
  <div class="combo-box" :style="{ borderRadius: isOpen ? '20px 20px 0 0' : '20px' }">
    <div class="frage" @click="toggleDropdown">
      <div class="text">
        <div class="p">{{ currentTitle }}</div>
      </div>
      <img  src="/icon/click-down.svg" class="icon" alt="dropdown icon">
    </div>
    <div v-if="isOpen" class="dropdown">
      <!-- استخدام slot للسماح بمحتوى مخصص -->
      <slot name="dropdown-content"></slot>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, provide } from 'vue';

// تعريف الـ props
const props = defineProps({
  title: String, // العنوان الافتراضي
});

const isOpen = ref(false); // حالة القائمة المنسدلة
const currentTitle = ref(props.title || ''); // تعيين العنوان الافتراضي من props.title

// فتح/إغلاق القائمة المنسدلة
const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

// تحديث العنوان (يتم استدعاؤه من المكون الأب عبر slot)
const updateTitle = (newTitle, value) => {
  currentTitle.value = newTitle; // تحديث العنوان
  isOpen.value = false; // إغلاق القائمة
  defineEmits(['select'])(value); // إصدار حدث للمكون الأب
};

// توفير updateTitle للمكونات الفرعية
provide('updateTitle', updateTitle);

// إغلاق القائمة عند النقر خارج المكون
const handleClickOutside = (event) => {
  if (!event.target.closest('.combo-box')) {
    isOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style lang="scss" scoped>
.combo-box {
  display: flex;
  height: 40px;
  padding: 12px 20px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 32px;
  flex: 1 0 0;
  background: var(--secondary);
  position: relative;
  box-sizing: border-box;
  width: 100%;
  height: auto;
}

.combo-box .frage {
  display: flex;
  align-items: center;
  gap: 20px;
  align-self: stretch;
  border-radius: 5px;
  cursor: pointer;
}

.combo-box .frage .text {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1 0 0;
}

.combo-box .frage .text .p {
  color: #fff;
  font-family: Heebo;
  font-size: 14px;
  font-style: normal;
  font-weight: 300;
  line-height: 120%;
  letter-spacing: 0.7px;
  text-transform: uppercase;
  flex: 1 0 0;
}

.combo-box .frage .icon {
  width: 14px;
  height: 10px;
  aspect-ratio: 7/5;
  fill: #fff;
  
}

.dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  width: 1541px; // يتكيف مع عرض العنصر الأب (.combo-box)
  background: var(--secondary);
  border-radius: 0 5px 5px 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  z-index: 10;
  max-height: 200px;
  overflow-y: auto;
  box-sizing: border-box;
  padding-bottom: 20px; // الاحتفاظ بـ padding-bottom
}
</style>
```