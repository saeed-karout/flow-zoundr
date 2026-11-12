<template>
    <div class="Content-Box" ref="contentBox">
      <div class="services-container">
        <!-- Stores Section -->
        <div class="section">
          
          <div v-if="stores.length === 0" class="empty-message">Keine Stores ausgewählt</div>
          <div v-else class="stores-grid">
            <div
              v-for="store in visibleStores"
              :key="store.name"
              class="store-item"
            >
              <img
                :src="store.icon"
                :alt="store.name"
                :title="store.name"
                class="store-icon"
                @error="hideBrokenIcon"
              />
            </div>
          </div>
        </div>
      </div>
      <div class="fade"></div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue';
  import apiRequest from '@/lib/apiRequest';
import { formatDateDe } from '@/utils/date';
  import { storage_url } from '@/constants';

  const props = defineProps({
    release: {
      type: Object,
      default: () => ({})
    }
  });

  // أيقونات المتاجر تأتي من GET /stores لا من خريطة محلية ثابتة.
  // المفتاح اسم المتجر مُطبّعاً، والقيمة رابط الصورة الكامل.
  const storeIcons = ref({});

  // الأسماء في release.stores مطابقة حرفياً لأسماء /stores،
  // والتطبيع لمجرّد الأمان من فروق الحالة والمسافات.
  const normalizeStore = (name) =>
    String(name || '').toLowerCase().replace(/\s+/g, ' ').trim();

  onMounted(async () => {
    try {
      const res = await apiRequest.get('/stores');
      const list = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);

      const map = {};
      list.forEach((store) => {
        // image: null → لا أيقونة لهذا المتجر في الباكإند.
        if (!store?.name || !store?.image) return;
        const path = String(store.image).replace(/^\/+/, '');
        map[normalizeStore(store.name)] = `${storage_url}/${path}`;
      });
      storeIcons.value = map;
    } catch (e) {
      console.warn('⚠️ [Services] فشل جلب أيقونات المتاجر:', e?.message || e);
    }
  });

  const getStoreIcon = (storeName) => storeIcons.value[normalizeStore(storeName)] || null;

  // إخفاء أي صورة أيقونة فشل تحميلها (بدل ظهور أيقونة الصورة المكسورة).
  const hideBrokenIcon = (event) => {
    const item = event?.target?.closest('.store-item');
    if (item) item.style.display = 'none';
    else if (event?.target) event.target.style.display = 'none';
  };
  
  // بيانات المتاجر من الـ release
  const stores = computed(() => {
    return Array.isArray(props.release?.stores) ? props.release.stores : [];
  });

  // لا يُعرض إلا ما له صورة في الباكإند.
  // الترشيح في computed لا بـ v-if على عنصر v-for — فـ v-if يُقيّم قبل v-for في Vue 3.
  const visibleStores = computed(() =>
    stores.value
      .map((name) => ({ name, icon: getStoreIcon(name) }))
      .filter((s) => s.icon)
  );
  
  // التحقق من وجود Pre-Release
  const hasPreRelease = computed(() => {
    return props.release?.songs?.some(song => song.prerelease === true);
  });
  
  // التحقق من وجود Pre-Order
  const hasPreOrder = computed(() => {
    return props.release?.songs?.some(song => song.pre_order === true);
  });
  
  // تنسيق التاريخ
  const formatDate = (dateStr) => formatDateDe(dateStr);
  
  // مرجع صندوق المحتوى (السكرول يدوي عبر المستخدم فقط — أُزيل السكرول التلقائي).
  const contentBox = ref(null);
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

  }
  
  .section {
    display: flex;
    flex-direction: column;
    gap: 15px;
    width: 100%;
    height: 100%;

  }

  .stores-grid {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between; /* التباعد بينهم auto */
    align-items: center;
    
    gap: 60px;
    width: 100%;
    height: 100%;
    overflow: auto;
  }

  .store-item {
    display: flex;
    align-items: center;
    justify-content: center;
    /* أقل عرض/ارتفاع لكل صورة لا يقل عن 120×50 */
    min-width: 120px;
    min-height: 50px;
    border-radius: 8px;
    color: var(--Main-Colors-White, #FFF);
    font-family: Heebo;
    font-size: 15px;
    font-weight: 300;
    transition: all 0.3s ease;
    border: 1px solid transparent;
  }



  .store-icon {
    /* لا يقل عن 120×50، مع الحفاظ على نسبة الشعار */
    min-width: 120px;
    min-height: 50px;
    width: 120px;
    height: 50px;
    object-fit: contain;
    // filter: brightness(0) invert(1);
    transition: filter 0.3s ease;
  }
  
  .store-item:hover .store-icon {
    // filter: brightness(0) invert(1);
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
  
  /* Responsive: الصور تلتفّ تلقائياً (flex-wrap) مع بقاء كل صورة 120×50 كحدّ أدنى،
     فيقلّ عددها في السطر حسب عرض اللوحة دون أن تصغر الصورة. */
  @media (max-width: 1599px) {
    .Content-Box {
      height: 350px;
    }
  }
  </style>