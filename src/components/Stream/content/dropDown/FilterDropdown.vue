<template>
  <div v-if="isOpen" class="backdrop" @click="closeDropdown"></div>

  <div class="filter-combo-box-container" >
    <div class="filter-combo-box" :style="{
      borderRadius: isOpen ? '20px 20px 0 0' : '20px',
      '--show-after': isOpen ? 'block' : 'none',
      '--show-before': isOpen ? 'block' : 'none',
      cursor: 'pointer'
    }">
      <div class="frage" @click="toggleDropdown">
        <div class="text">
          <div class="p">{{ currentTitle }}</div>
        </div>
        <img src="/icon/click-down.svg" class="icon" :style="{ transform: isOpen ? 'rotate(180deg)' : '' }"
          alt="dropdown icon">
      </div>
      <div v-if="isOpen" class="dropdown">
        <div class="filter">
          <div class="column1">
            <div class="form">
              <div class="title">song</div>
              <input v-model="tempFilters.song" class="formField" placeholder="Alle" />
            </div>
            <div class="form">
              <div class="title">Release</div>
              <input v-model="tempFilters.release" class="formField" placeholder="Alle" />
            </div>
            <div class="form">
              <div class="title">Artist</div>
              <input v-model="tempFilters.artist" class="formField" placeholder="Alle" />
            </div>
            <div class="form">
              <div class="title">Store</div>
              <input v-model="tempFilters.store" class="formField" placeholder="Alle" />
            </div>
          </div>
          <div class="column2">
            <div class="form">
              <div class="title">ISRC</div>
              <input v-model="tempFilters.isrc" class="formField" placeholder="Alle" />
            </div>
            <div class="form">
              <div class="title">GTIN/UPC</div>
              <input v-model="tempFilters.gtin" class="formField" placeholder="Alle" />
            </div>
            <div class="form">
              <div class="title">Feature</div>
              <input v-model="tempFilters.feature" class="formField" placeholder="Alle" />
            </div>
            <div class="form">
              <div class="title">Länder</div>
              <input v-model="tempFilters.country" class="formField" placeholder="Alle" />
            </div>
          </div>
          <div class="column3">
            <div class="form">
              <div class="title">Urheber</div>
              <input v-model="tempFilters.urheber" class="formField" placeholder="Alle" />
            </div>
            <div class="form">
              <div class="title">Produzent</div>
              <input v-model="tempFilters.producer" class="formField" placeholder="Alle" />
            </div>
            <div class="form">
              <div class="title">Mitwirkende</div>
              <input v-model="tempFilters.mitwirkende" class="formField" placeholder="Alle" />
            </div>
            <div class="CTAs">
              <div class="Button-primary" @click="clearFilters">Löschen</div>
              <div class="Button-primary" style="background: var(--Strawberry);" @click="applyFilters">Anwenden</div>
            </div>
          </div>
        </div>
        <div class="line"></div>
        <div class="data"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  title: String,
});

const emit = defineEmits(['select']);

// ========== المتغيرات الأساسية ==========
const isOpen = ref(false);
const currentTitle = ref(props.title || 'Filter');

// ========== الفلاتر النشطة (المرسلة للـ API) ==========
const activeFilters = reactive({
  song: '',
  release: '',
  artist: '',
  store: '',
  isrc: '',
  gtin: '',
  feature: '',
  country: '',
  urheber: '',
  producer: '',
  mitwirkende: ''
});

// ========== الفلاتر المؤقتة (التي يتم تعديلها في الـ dropdown) ==========
const tempFilters = reactive({
  song: '',
  release: '',
  artist: '',
  store: '',
  isrc: '',
  gtin: '',
  feature: '',
  country: '',
  urheber: '',
  producer: '',
  mitwirkende: ''
});

// ========== تحديث عنوان الفلتر بناءً على الفلاتر النشطة ==========
const updateTitle = () => {
  const hasActiveFilters = Object.values(activeFilters).some(val => val && val.trim());
  if (hasActiveFilters) {
    const activeCount = Object.values(activeFilters).filter(val => val && val.trim()).length;
    currentTitle.value = `Filter (${activeCount})`;
  } else {
    currentTitle.value = 'Filter';
  }
};

// ========== دوال القائمة المنسدلة ==========
const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    // نسخ الفلاتر النشطة إلى الفلاتر المؤقتة عند فتح القائمة
    Object.assign(tempFilters, activeFilters);
  } else {
    updateTitle();
  }
};

const closeDropdown = () => {
  isOpen.value = false;
  updateTitle();
};

// ========== دوال الفلاتر ==========
const applyFilters = () => {
  // نسخ الفلاتر المؤقتة إلى الفلاتر النشطة
  Object.assign(activeFilters, tempFilters);
  
  // تحويل الفلاتر إلى الصيغة المطلوبة للـ API
  const filterData = {};
  
  if (activeFilters.song && activeFilters.song.trim()) filterData.song = [activeFilters.song.trim()];
  if (activeFilters.release && activeFilters.release.trim()) filterData.release = [activeFilters.release.trim()];
  if (activeFilters.artist && activeFilters.artist.trim()) filterData.artist = [activeFilters.artist.trim()];
  if (activeFilters.store && activeFilters.store.trim()) filterData.store = [activeFilters.store.trim()];
  if (activeFilters.isrc && activeFilters.isrc.trim()) filterData.isrc = [activeFilters.isrc.trim()];
  if (activeFilters.gtin && activeFilters.gtin.trim()) filterData.gtin = [activeFilters.gtin.trim()];
  if (activeFilters.feature && activeFilters.feature.trim()) filterData.feature = [activeFilters.feature.trim()];
  if (activeFilters.country && activeFilters.country.trim()) filterData.country = [activeFilters.country.trim()];
  if (activeFilters.urheber && activeFilters.urheber.trim()) filterData.contributer = [activeFilters.urheber.trim()];
  if (activeFilters.producer && activeFilters.producer.trim()) filterData.producer = [activeFilters.producer.trim()];
  if (activeFilters.mitwirkende && activeFilters.mitwirkende.trim()) filterData.cLine = [activeFilters.mitwirkende.trim()];
  
  console.log('📊 تطبيق الفلاتر:', filterData);
  
  // إرسال الفلاتر إلى المكون الأب
  emit('select', filterData);
  
  // تحديث العنوان
  updateTitle();
  
  // إغلاق القائمة المنسدلة
  closeDropdown();
};

const clearFilters = () => {
  // مسح الفلاتر المؤقتة
  tempFilters.song = '';
  tempFilters.release = '';
  tempFilters.artist = '';
  tempFilters.store = '';
  tempFilters.isrc = '';
  tempFilters.gtin = '';
  tempFilters.feature = '';
  tempFilters.country = '';
  tempFilters.urheber = '';
  tempFilters.producer = '';
  tempFilters.mitwirkende = '';
  
  // نسخ الفلاتر الفارغة إلى الفلاتر النشطة
  Object.assign(activeFilters, tempFilters);
  
  // إرسال فلاتر فارغة لتحديث البيانات
  console.log('📊 مسح جميع الفلاتر');
  emit('select', {});
  
  // تحديث العنوان
  updateTitle();
  
  // إغلاق القائمة المنسدلة
  closeDropdown();
};

// ========== إغلاق القائمة عند النقر خارجها ==========
const handleClickOutside = (event) => {
  if (!event.target.closest('.filter-combo-box')) {
    closeDropdown();
  }
};

// ========== دورة حياة المكون ==========
onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  updateTitle();
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style lang="scss" scoped>
.filter-combo-box-container {
  position: relative;
  flex: 1;
  z-index: 10000;
}

.backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(27, 28, 32, 0.8);
  z-index: 999;
  cursor: pointer;
}

.filter-combo-box {
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

  &::before {
    content: '';
    position: absolute;
    width: calc(100% + 20px);
    height: 30px;
    background: var(--secondary);
    bottom: -30px;
    left: 0;
    display: var(--show-before);
  }

  &::after {
    content: '';
    position: absolute;
    width: 20px;
    height: 20px;
    background: var(--primary);
    bottom: -20px;
    right: -20px;
    display: var(--show-after);
    align-self: flex-end;
    align-items: end;
    justify-content: end;
    z-index: 5;
    border-radius: 0 0 0 20px;
  }
}

.filter-combo-box .frage {
  display: flex;
  align-items: center;
  gap: 20px;
  align-self: stretch;
  border-radius: 5px;
  cursor: pointer;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    width: 40px;
    height: 30px;
    background: var(--secondary);
    bottom: -40px;
    left: -40px;
    display: var(--show-before);
  }

  &::after {
    content: '';
    position: absolute;
    width: 20px;
    height: 25px;
    background: var(--primary);
    bottom: -32px;
    left: -40px;
    display: var(--show-after);
    align-self: flex-end;
    align-items: end;
    justify-content: end;
    z-index: 5;
    border-radius: 0 0 20px 0;
  }
}

.filter-combo-box .frage .text {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1 0 0;
}

.filter-combo-box .frage .text .p {
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

.filter-combo-box .frage .icon {
  width: 14px;
  height: 10px;
  aspect-ratio: 7/5;
  fill: #fff;
  transition: .3s ease;
}

.dropdown {
  position: fixed;
  top: calc(81px + 70px);
  left: 300px;
  right: 80px;
  max-width: 100%;
  background: var(--secondary);
  padding: 32px;
  z-index: 1000;
  border-radius: 20px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  align-self: stretch;
  animation: slideIn 0.3s ease forwards;
  box-shadow: 0 4px 5px rgba(0, 0, 0, 0.2);
}

.filter {
  display: flex;
  align-items: center;
  gap: 20px;
  align-self: stretch;
  width: 100%;
}

.column1,
.column2 {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 20px;
  flex: 1 0 0;
  align-self: stretch;
}

.column3 {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: flex-end;
  gap: 20px;
  flex: 1 0 0;
  align-self: stretch;
}

.form {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 8px;
  align-self: stretch;
  width: 100%;
}

.form .title {
  color: #fff;
  font-family: 'Heebo';
  font-size: 14px;
  font-style: normal;
  font-weight: 300;
  line-height: .7;
  letter-spacing: 0.7px;
  text-transform: uppercase;
}

.form .formField {
  display: flex;
  width: 100%;
  padding: 12px;
  align-items: center;
  gap: 12px;
  border-radius: 5px;
  background: var(--primary);
  border: 0;
  height: 38px;
  color: #fff;
}

.form .formField:focus-visible {
  border: 0px;
  outline: 0;
  color: #fff;
}

.form .formField::placeholder {
  color: #6A6C6D;
}

.column3 .form {
  position: relative;
  top: 0px;
}

.CTAs {
  display: flex;
  padding-top: 20px;
  justify-content: flex-end;
  align-items: center;
  gap: 20px;
}

.CTAs .Button-primary {
  display: flex;
  padding: 12px 20px 13px 20px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  border-radius: 5px;
  color: #FFF;
  font-family: Heebo;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: .8;
  text-transform: uppercase;
  background: var(--Main-Colors-Slate-Light, #3A3E42);
  cursor: pointer;
  transition: background 0.3s ease;
}

.CTAs .Button-primary:hover {
  background: var(--dark-red);
}

/* تأثير الظهور */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>