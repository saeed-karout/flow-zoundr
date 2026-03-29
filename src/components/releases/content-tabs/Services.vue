<template>
    <div class="Content-Box" ref="contentBox" @mouseover="startScroll" @mouseleave="stopScroll">
      <div class="services-container">
        <!-- Stores Section -->
        <div class="section">
          
          <div v-if="stores.length === 0" class="empty-message">Keine Stores ausgewählt</div>
          <div v-else class="stores-grid">
            <div v-for="(store, index) in stores" :key="index" class="store-item">
              <img :src="getStoreIcon(store)" :alt="store" class="store-icon" />
              <!-- <span class="store-name">{{ store }}</span> -->
            </div>
          </div>
        </div>
      </div>
      <div class="fade"></div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue';
  
  const props = defineProps({
    release: {
      type: Object,
      default: () => ({})
    }
  });
  
  // دالة للحصول على أيقونة المتجر
  const getStoreIcon = (storeName) => {
    // تحويل اسم المتجر إلى مسار الصورة
    // إزالة المسافات وتحويل إلى أحرف صغيرة واستبدال الرموز
    const iconName = storeName
      .toLowerCase()
      .replace(/[&]/g, 'and')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    return `/icon/stores/${iconName}.png`;
  };
  
  // بيانات المتاجر من الـ release
  const stores = computed(() => {
    return Array.isArray(props.release?.stores) ? props.release.stores : [];
  });
  
  // التحقق من وجود Pre-Release
  const hasPreRelease = computed(() => {
    return props.release?.songs?.some(song => song.prerelease === true);
  });
  
  // التحقق من وجود Pre-Order
  const hasPreOrder = computed(() => {
    return props.release?.songs?.some(song => song.pre_order === true);
  });
  
  // تنسيق التاريخ
  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleDateString('de-DE', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };
  
  // Scroll functionality
  const contentBox = ref(null);
  const scrollInterval = ref(null);
  
  const startScroll = () => {
    scrollInterval.value = setInterval(() => {
      if (contentBox.value) {
        contentBox.value.scrollBy({ top: 2, behavior: 'smooth' });
      }
    }, 50);
  };
  
  const stopScroll = () => {
    clearInterval(scrollInterval.value);
    scrollInterval.value = null;
  };
  </script>
  
  <style lang="scss" scoped>
  .Content-Box {
    position: relative;
    padding: 20px;
    border-radius: 20px;
    background: var(--secondary);
    overflow-y: auto;
    scroll-behavior: smooth;
    height: 400px;
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  
  .Content-Box::-webkit-scrollbar {
    display: none;
  }
  
  .services-container {
    display: flex;
    flex-direction: column;
    gap: 30px;
    padding-bottom: 30px;
  }
  
  .section {
    display: flex;
    flex-direction: column;
    gap: 15px;
    width: 100%;
  }

  .stores-grid {
    display: flex;
padding: 20px;
justify-content: space-between;
align-items: flex-start;
align-self: stretch;
  }
  
  .store-item {
    display: flex;
    align-items: center;
    gap: 10px;
    // padding: 10px 15px;
    // background: var(--primary);
    border-radius: 8px;
    color: var(--Main-Colors-White, #FFF);
    font-family: Heebo;
    font-size: 15px;
    font-weight: 300;
    transition: all 0.3s ease;
    border: 1px solid transparent;
  }
  
 
  
  .store-icon {
    width: 120px;
height: 50px;
aspect-ratio: 12/5;
    object-fit: contain;
    filter: brightness(0) invert(1); 
    transition: filter 0.3s ease;
  }
  
  .store-item:hover .store-icon {
    filter: brightness(0) invert(1); /* تبقى بيضاء عند التحويم */
  }
  
  .store-name {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .empty-message {
    color: var(--Main-Colors-Dove, #6A6C6D);
    font-family: Heebo;
    font-size: 14px;
    font-style: italic;
    padding: 15px;
    text-align: center;
    // background: var(--primary);
    border-radius: 8px;
  }
  
  .fade {
    position: sticky;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 64px;
    background: linear-gradient(0deg, var(--secondary) 30%, rgba(27, 28, 32, 0.00) 100%);
    z-index: 10;
    pointer-events: none;
  }
  
  /* Responsive */
  @media (min-width: 1440px) and (max-width: 1599px) {
    .Content-Box {
      height: 350px;
    }
    
    .section-title {
      font-size: 16px;
    }
    
    .store-item {
      font-size: 14px;
      padding: 8px 12px;
    }
    
    .store-icon {
      width: 20px;
      height: 20px;
    }
  }
  </style>