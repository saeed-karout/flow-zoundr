<template>
  <div class="column2">
    <div class="circle"></div>
    <div class="tabs">
      <div
        v-for="(tab, index) in tabs"
        :key="tab.id"
        class="tab-buttons"
        :class="{ active: activeTab === tab.id }"
      >
        <div class="top-corner">
          <div class="image-blur"></div>
        </div>

        <div
          class="btn-tab"
          @click="selectTab(tab.id)"
          @mouseenter="isHovered[tab.id] = true"
          @mouseleave="isHovered[tab.id] = false"
          :style="getTabBackground(index)"
        >
          <!-- طبقة الفلتر فقط للتب النشط -->
          <div v-if="activeTab === tab.id" class="tab-blur-overlay"></div>

          <!-- المحتوى يبقى واضحاً -->
          <div class="tab-content">
            <div class="icons">
              <img :src="tab.icon" class="icon" alt="">
            </div>
            <div class="title">{{ tab.title }}</div>
          </div>
        </div>

        <div class="down-corner">
          <div class="image-blur"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';

// استقبال رابط الكفر من الأب
const props = defineProps({
  serverCoverUrl: {
    type: String,
    default: null
  }
});

const emit = defineEmits(['update-tab', 'back']);

const tabs = [
  { id: 'infos',        title: 'infos',        icon: '/icon/info-step2/Angebot.svg' },
  { id: 'urheber',      title: 'Urheber',      icon: '/icon/info-step2/urheber (1).svg' },
  { id: 'mitwirkende',  title: 'Mitwirkende',  icon: '/icon/info-step2/Vector (4).svg' },
  { id: 'deals',        title: 'Deals',        icon: '/icon/info-step2/share.svg' },
  { id: 'pre-release',  title: 'Pre-Release',  icon: '/icon/info-step2/Group.svg' },
];

const activeTab = ref('infos');
const isHovered = reactive({
  infos: false,
  urheber: false,
  mitwirkende: false,
  deals: false,
  'pre-release': false,
});

const selectTab = (tabId) => {
  activeTab.value = tabId;
  emit('update-tab', tabId);
};

// دالة لإرجاع الـ style الديناميكي مع الحفاظ على position/size الأصلي
const getTabBackground = (index) => {
  if (activeTab.value !== tabs[index].id || !props.serverCoverUrl) {
    return {};
  }

  // نفس الإحداثيات والأبعاد الأصلية لكل تب
  const positions = [
    { btn: '0px -20.437px / 100% 579.439%', top: '0px -0.009px / 1035% 1336.875%', down: '0px -40.437px / 1035% 1336.875%' },
    { btn: '0px -74.437px / 100% 579.439%', top: '0px -54.015px / 1200% 1550%', down: '0px -94.437px / 1200% 1550%' },
    { btn: '0px -128.002px / 100% 579.439%', top: '0px -107.996px / 1200% 1550%', down: '0px -148.002px / 1200% 1550%' },
    { btn: '0px -181.994px / 100% 579.439%', top: '0px -162.005px / 1200% 1550%', down: '0px -202.005px / 1200% 1550%' },
    { btn: '0px -238.883px / 100% 579.439%', top: '0px -215.995px / 1200% 1550%', down: '0px -258.883px / 1200% 1550%' }
  ];

  const pos = positions[index] || positions[0];

  return {
    background: `url(${props.serverCoverUrl})  ${pos.btn} no-repeat`,
    backgroundSize: 'cover', // لضمان ملء الصورة بشكل جيد
    backgroundPosition: ' center center' // تحسين العرض
  };
};
</script>

<style lang="scss" scoped>
/* الستايل الأصلي كامل بدون أي تغيير */
.column2 {
  display: flex;
  padding: 0 0 20px 0px;
  flex-direction: column;
  align-items: flex-end;
  gap: 7px;
  position: fixed;
  right: 0;
  bottom: 0;
  background: var(--primary);
  width: 100%;
  max-width: 240px;
  height: 100%;
  align-self: stretch;
  z-index: 10;
  position: relative;
}

.circle { display: none; }

.tabs {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  flex: 1 0 0;
  align-self: stretch;
  position: relative;
  background: var(--primary);
  z-index: 11;

  &::before {
    position: absolute;
    content: '';
    top: -20px;
    left: 0;
    background: var(--primary);
    width: 20px;
    height: 20px;
  }

  &::after {
    position: absolute;
    content: '';
    top: -20px;
    left: 0;
    background: var(--primary);
    width: 20px;
    height: 20px;
    border-radius: 0 0 0 20px;
  }
}

.tab-buttons {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  align-self: stretch;
  height: 54px;
  overflow: visible;
  z-index: 11;
}

.tab-buttons.active {
  z-index: 20;
}

.tab-buttons .btn-tab {
  display: flex;
  padding: 15px 12px 15px 30px;
  align-items: center;
  gap: 20px;
  align-self: stretch;
  border-radius: 0 20px 20px 0;
  background: var(--primary);
  cursor: pointer;
  color: #8a8b8b;
  position: relative;
  z-index: 2;
  transition: color 0.3s ease;

  &:hover {
    color: #FFF;
  }
}

/* طبقة الفلتر - تظهر فقط للتب النشط */
.tab-blur-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(38, 40, 45, 0.80);
  backdrop-filter: blur(10px);
  border-radius: 0 20px 20px 0;
  z-index: 1;
  pointer-events: none;
}

/* المحتوى يبقى واضحاً فوق الفلتر */
.tab-content {
  display: flex;
  align-items: center;
  gap: 20px;
  position: relative;
  z-index: 3;
  width: 100%;
}

.top-corner,
.down-corner {
  position: absolute;
  left: 0;
  width: 20px;
  height: 20px;
  pointer-events: none;
  z-index: 15;
  display: none;
  background-repeat: no-repeat;
  overflow: hidden;
}

.top-corner  { top: -20px; }
.down-corner { bottom: -20px; }

/* تطبيق الفلتر على الزوايا */
.top-corner .image-blur,
.down-corner .image-blur {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(38, 40, 45, 0.80);
  backdrop-filter: blur(10px);
}

.tab-buttons.active .top-corner,
.tab-buttons.active .down-corner {
  display: block;
}

/* حذف كل الخلفيات الثابتة تمامًا - الآن يتم التحكم بها من :style في الـ template */

.image-blur {
  background: rgba(38, 40, 45, 0.80);
  backdrop-filter: blur(10px);
}

.title {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  flex: 1 0 0;
}

/* جعل before و after ظاهرين فوق الفلتر */
.tab-buttons.active .btn-tab {
  color: #FFF;
  z-index: 12;

  &::before {
    content: '';
    position: absolute;
    top: -20px;
    left: 0;
    width: 20px;
    height: 20px;
    background: var(--primary);
    border-radius: 0 0 0 20px;
    z-index: 5;
    pointer-events: none;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -20px;
    left: 0;
    width: 20px;
    height: 20px;
    background: var(--primary);
    border-radius: 20px 0 0 0px;
    z-index: 5;
    pointer-events: none;
  }
}

/* تأكد من أن الزوايا تحت before و after */
.tab-buttons.active .top-corner,
.tab-buttons.active .down-corner {
  z-index: 4;
}

.tab-buttons.active .icons { filter: brightness(0) invert(1); }
.btn-tab:hover .icons { filter: brightness(0) invert(1); }

.btn-tab .icons {
  display: flex;
  padding: 1px;
  align-items: center;
  gap: 10px;
}

.btn-tab .icon {
  width: 22px;
  height: 22px;
  aspect-ratio: 1/1;
}

img, svg { vertical-align: 0; }

@media (min-width:2075px) and (max-width:2560px) {
  .tabs { width: 286px; }
}
</style>