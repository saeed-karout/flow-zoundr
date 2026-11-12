<template>
  <div class="content">
    <div v-if="loading" class="loading"></div>
    <div v-else-if="error" class="error">the errors: {{ error }}</div>
    <div v-else class="rows">
      <div
        class="cards"
        v-for="card in cards"
        :key="card.title"
        @click="navigateToRoute(card.title)"
      >
        <div
          class="card-background"
          :style="[getBackgroundStyle(card.background), { '--saturation': `${card.saturation}%` }]"
        ></div>
        <div class="info">
          <div class="title">
            {{ card.title }}
          </div>
          <div class="subtitle">
            {{ card.count }} {{ getSubtitleUnit(card.title, card.count) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import apiRequest from '@/lib/apiRequest';

// ── الصور ثابتة (كما كانت) ──
import Releases   from "@/assets/icons/catalog/bg-primary/hero-relese.jpg?url";
import Takedowns  from "@/assets/icons/catalog/bg-primary/Takedowns.jpg?url";
import Entwürfe   from "@/assets/icons/catalog/bg-primary/Entwürfe.jpg?url";
import Korrektur  from "@/assets/icons/catalog/bg-primary/Korrektur.jpg?url";
import shadowImage from "@/assets/icons/dashboard/user/shadow.png?url";

// ── تعريف الكروت الأساسية (ثابتة) ──
const baseCards = [
  { title: "Releases",   background: Releases,   saturation: 20 },
  { title: "Entwürfe",   background: Entwürfe,   saturation: 20 },
  { title: "Korrektur",  background: Korrektur,  saturation: 20 },
  { title: "Takedowns",  background: Takedowns,  saturation: 20 },
];

// ── الحالة ──
const cards = ref([]);
const loading = ref(true);
const error   = ref(null);

const route = useRoute();
const router = useRouter();

// ── دالة لجلب جميع الصفحات ──
const fetchAllPages = async () => {
  let allReleases = [];
  let currentPage = 1;
  let lastPage = 1;
  
  try {
    // جلب الصفحة الأولى أولاً لمعرفة عدد الصفحات
    const firstResponse = await apiRequest.get('/releases', {
      params: {
        per_page: 100,
        page: currentPage
      }
    });
    
    const firstPageData = firstResponse.data?.data ?? [];
    allReleases = [...firstPageData];
    
    const meta = firstResponse.data?.meta;
    if (meta) {
      lastPage = meta.last_page || meta.total_pages || 1;
      console.log(`📊 إجمالي الصفحات: ${lastPage}`);
    } else {
      console.log('⚠️ لا توجد meta في الاستجابة');
      return allReleases;
    }
    
    for (let page = 2; page <= lastPage; page++) {
      console.log(`📡 جلب الصفحة ${page} من ${lastPage}`);
      const response = await apiRequest.get('/releases', {
        params: {
          per_page: 100,
          page: page
        }
      });
      
      const pageData = response.data?.data ?? [];
      allReleases = [...allReleases, ...pageData];
    }
    
    console.log(`✅ تم جلب ${allReleases.length} عنصر من ${lastPage} صفحات`);
    return allReleases;
    
  } catch (err) {
    console.error("❌ خطأ في جلب الصفحات:", err);
    throw err;
  }
};

// ── جلب البيانات ──
const fetchCounts = async () => {
  try {
    loading.value = true;
    error.value = null;

    const allReleases = await fetchAllPages();

    const counts = {
      Releases:  allReleases.filter(r => r.status === 'release' || r.status === null || r.status === 'published').length,
      Entwürfe:  allReleases.filter(r => r.status === 'draft').length,
      Korrektur: allReleases.filter(r => r.status === 'correction' || r.status === 'review').length,
      Takedowns: allReleases.filter(r => r.status === 'takedown' || r.status === 'deleted').length,
    };

    console.log('📊 الإحصائيات:', counts);

    cards.value = baseCards.map(card => ({
      ...card,
      count: counts[card.title] ?? 0
    }));

  } catch (err) {
    console.error("API Error:", err);
    error.value = err.message || "فشل جلب البيانات";
  } finally {
    loading.value = false;
  }
};

// ── تنقل عند الضغط ──
const navigateToRoute = (title) => {
  const path = title.toLowerCase();
  console.log(`🔀 التنقل إلى /catalog/${path}`);
  router.push(`/catalog/${path}`);
};

// ── نص الـ subtitle مع مراعاة المفرد والجمع ──
const getSubtitleUnit = (title, count) => {
  const map = {
    Releases: {
      singular: "Veröffentlichung",
      plural: "Veröffentlichungen"
    },
    Entwürfe: {
      singular: "Entwurf",
      plural: "Entwürfe"
    },
    Korrektur: {
      singular: "Korrektur",
      plural: "Korrekturen"
    },
    Takedowns: {
      singular: "Takedown",      
      plural: "Takedowns"        
    }
  };
  
  const unit = map[title];
  if (!unit) return "";
  
  // المفرد فقط عند 1؛ أما 0 و2 فأكثر فتُستخدم صيغة الجمع (0 Veröffentlichungen).
  return count === 1 ? unit.singular : unit.plural;
};

// ── دالة تنسيق الخلفية (كما كانت) ──
const getBackgroundStyle = (background) => {
  return background ? { backgroundImage: `url(${background})` } : {};
};

// ========== 🔥 مراقبة تغيير المسار ==========
watch(
  () => route.path,
  (newPath, oldPath) => {
    console.log(`🔄 [CatalogHome] تغير المسار من ${oldPath} إلى ${newPath}`);
    
    // 🔥 إذا كنا في صفحة الكروت الرئيسية (أو أي صفحة فرعية)، نعيد تحميل البيانات
    // ولكن نتحقق من أننا في الصفحة الرئيسية وليس في صفحة تفاصيل
    if (newPath === '/catalog' || newPath === '/catalog/') {
      console.log('🔄 [CatalogHome] العودة إلى الصفحة الرئيسية، إعادة تحميل البيانات');
      fetchCounts();
    }
  },
  { immediate: false }
);

// ========== 🔥 مراقبة تغيير params ==========
watch(
  () => route.params,
  (newParams, oldParams) => {
    console.log('🔄 [CatalogHome] تغير params:', newParams);
    // إذا كان هناك param مثل status، نعيد تحميل البيانات
    if (route.path === '/catalog' || route.path === '/catalog/') {
      fetchCounts();
    }
  },
  { deep: true, immediate: false }
);

// ========== دورة الحياة ==========
onMounted(() => {
  console.log('🚀 [CatalogHome] mounted');
  fetchCounts();
});

// ========== تصدير ==========
defineExpose({
  fetchCounts,
  cards,
  loading
});
</script>

<style lang="scss" scoped>
/* جميع الأنماط كما هي - لم يتغير شيء */
.content {
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: flex-start;
  gap: 20px;
}

.rows {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 20px;
  align-self: stretch;
}

.cards {
  position: relative;
  display: flex;
  height: 350px;
  width: calc((100% - 40px) / 3);
  max-width: calc((100% - 40px) / 3);
  align-items: flex-end;
  gap: 5px;
  border-radius: 20px;
  border: 0;
  cursor: pointer;
  overflow: hidden;
}

.card-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: lightgray 50% / cover no-repeat;
  filter: saturate(var(--saturation, 20%));
  transition: filter 0.6s ease;
  z-index: 1;
}

.cards:hover .card-background {
  filter: saturate(70%);
}

.info {
  position: relative;
  z-index: 2;
  display: flex;
  padding: 20px;
  flex-direction: column;
  justify-content: flex-end;
  align-items: flex-start;
  gap: 25px;
  flex: 1 0 0;
  align-self: stretch;
  border-radius: 20px;
  background: url('../../assets/icons/dashboard/user/shadows.png') 50% / cover no-repeat;
  background-blend-mode: normal;
  transition: background 0.3s ease;
}

.info:hover {
  background: url('../../assets/icons/dashboard/user/shadows.png') 50% / cover no-repeat;
}

.cards:hover .title,
.cards:hover .subtitle {
  opacity: 1;
}

.title {
  color: var(--Main-Colors-White, #FFF);
  font-family: Heebo;
  font-size: 48px;
  font-style: normal;
  font-weight: 700;
  line-height: .8;
  text-transform: uppercase;
  opacity: 0.7;
  transition: opacity 0.3s ease;
  position: relative;
  top: 5px;
}

.subtitle {
  color: var(--Main-Colors-White, #FFF);
  font-family: Heebo;
  font-size: 18px;
  font-style: normal;
  font-weight: 200;
  line-height: .6;
  opacity: 0.7;
  transition: opacity 0.3s ease;
}

@media (min-width:1440px) and (max-width:1599px) {
    .cards{
      height: 300px;
    }
}

@media (min-width:2075px) and (max-width:2560px) {
  .cards{
    width: calc((100% - 60px)/4);
    max-width: calc((100% - 60px) / 4);
  }
}

@media (min-width:2560px) {
  .cards{
    width: calc((100% - 60px)/4);
    max-width: calc((100% - 60px) / 4);
  }
}
</style>