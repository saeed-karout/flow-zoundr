<template>
  <div class="column2">
    <div class="circle"></div>
    <div class="tabs">
      <div
        v-for="(tab, index) in tabs"
        :key="tab.id"
        class="tab-buttons"
        :class="{
          active: activeTab === tab.id,
          completed: isTabCompleted(tab.id) && activeTab !== tab.id
        }"
      >
        <!-- <div class="top-corner" :style="getCornerBackground(index, 'top')"> -->
        <div class="top-corner" >

          <div class="image-blur"></div>
        </div>

        <!-- <div
          class="btn-tab"
          @click="selectTab(tab.id)"
          @mouseenter="isHovered[tab.id] = true"
          @mouseleave="isHovered[tab.id] = false"
          :style="getTabBackground(index)"
        > -->
          <div
          class="btn-tab"
          @click="selectTab(tab.id)"
          @mouseenter="isHovered[tab.id] = true"
          @mouseleave="isHovered[tab.id] = false"
        >
          <div v-if="activeTab === tab.id" class="tab-blur-overlay"></div>

          <div class="tab-content">
            <div class="icons">
              <img :src="tab.icon" class="icon" alt="">
            </div>
            <div class="title">{{ tab.title }}</div>
            
            <!-- ✅ علامة التشيك للتبويبات المكتملة (تظهر دائماً) -->
            <div v-if="isTabCompleted(tab.id)" class="checkmark-tab">
              <img src="/icon/y.png" class="checkmark-icon" alt="completed" />
            </div>
            
          
          </div>
        </div>

        <!-- <div class="down-corner" :style="getCornerBackground(index, 'down')"> -->
        <div class="down-corner" >

          <div class="image-blur"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue';
import { useReleaseStore } from '@/stores/release';
import { computeTabCompletion } from '@/utils/songCompletion';

const props = defineProps({
  serverCoverUrl: { type: String, default: null },
  activeTab: { type: String, default: 'infos' }
});

const emit = defineEmits(['update-tab', 'back']);

const releaseStore = useReleaseStore();

const tabs = [
  { id: 'infos',        title: 'Infos',        icon: '/icon/info-step2/Angebot.svg' },
  { id: 'urheber',      title: 'Urheber',      icon: '/icon/info-step2/urheber (1).svg' },
  { id: 'mitwirkende',  title: 'ROLLEN',       icon: '/icon/info-step2/Vector (4).svg' },
  { id: 'deals',        title: 'Deals',        icon: '/icon/info-step2/share.svg' },
  { id: 'pre-release',  title: 'Pre-UP',  icon: '/icon/info-step2/Group.svg' },
];

const activeTab = ref(props.activeTab || 'infos');
const isHovered = reactive({
  infos: false,
  urheber: false,
  mitwirkende: false,
  deals: false,
  'pre-release': false,
});

// ========== ترتيب التبويبات ==========
const tabOrder = ['infos', 'urheber', 'mitwirkende', 'deals', 'pre-release'];

// ✅ التابوات التي تتطلب اكتمال للوصول إلى التالي
const tabsRequiringCompletion = ['infos', 'urheber', 'mitwirkende'];

// ========== الحصول على فهرس التبويب ==========
const getTabIndex = (tabId) => {
  return tabOrder.indexOf(tabId);
};

// ========== ✅ خلفية الغلاف على التبويب وزواياه ==========
//   نستخدم غلافاً مثبّتاً بالنافذة (background-attachment: fixed) بمقاس cover — تماماً
//   كخلفية PreReleaseLayout على اليسار. هكذا يعرض كل من التبويب والزاويتين والخلفية
//   اليسرى *نفس* شريحة الغلاف المطابِقة لموضعها على الشاشة، فتبدو صورةً واحدة متّصلة
//   يساراً ويمتد التبويب كتتمّة لها — ويتكيّف تلقائياً مع كل القياسات دون أرقام ثابتة.
//   ملحوظة: serverCoverUrl يصل الآن من backgroundFullUrl في التخطيط — أي العنوان نفسه
//   تماماً الذي ترسم به ‎.bg-image (مُطبّع عبر getFullImageUrl وبلا طابع زمني).
//   كان سابقاً يصل الـ prop الخام للتخطيط، فيختلف عن الصورة اليسرى (خاصةً بعد
//   رفع غلاف جديد حيث تسبق uploadedImage) → فاصل مرئي بين التبويب والخلفية.
const coverBackgroundStyle = () => ({
  backgroundImage: `url("${props.serverCoverUrl}")`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundAttachment: 'fixed',
  backgroundRepeat: 'no-repeat',
});

// لا نرسم الغلاف إن غاب أو كان صورة الخلفية الافتراضية — وإلا ظهر التبويط بصورة
// لا تطابق ما يعرضه التخطيط.
const hasCoverBackground = () => {
  const url = props.serverCoverUrl;
  return !!url && !url.includes('bgCardSongs/card1.png');
};

// ========== ✅ دالة خلفية التبويب ==========
const getTabBackground = (index) => {
  if (activeTab.value !== tabs[index]?.id || !hasCoverBackground()) {
    return {};
  }
  return coverBackgroundStyle();
};

// ========== ✅ خلفية زوايا التبويب (top-corner / down-corner) ==========
//   نفس الغلاف المثبّت بالنافذة → الزاويتان تُكمّلان شريحة التبويب والصورة اليسرى تلقائياً.
const getCornerBackground = (index /*, corner */) => {
  if (activeTab.value !== tabs[index]?.id || !hasCoverBackground()) {
    return {};
  }
  return coverBackgroundStyle();
};

// ========== ✅ اكتمال التبويبات من بيانات الأغنية (لا يعتمد على زيارة كل تبويب) ==========
//   releaseStore.tabCompletion لا يُملأ إلا عند تحميل مكوّن كل تبويب، فعند العودة تظهر
//   التبويبات غير مكتملة حتى يُنقَر عليها. لذلك نحسب الحالة من بيانات الأغنية عبر المصدر
//   المشترك @/utils/songCompletion — نفس ما يستخدمه FirstSection.isTrackComplete تماماً.
const currentSongData = computed(() => {
  const uuid = releaseStore.songUuid;
  if (!uuid) return null;
  const songs = releaseStore.draftRelease?.songs || [];
  return songs.find(s => s.uuid === uuid) || null;
});

const dataCompletion = computed(() => computeTabCompletion(currentSongData.value));

// ========== ✅ دالة التحقق من اكتمال التبويب ==========
const isTabCompleted = (tabId) => {
  const storeVal = (releaseStore.tabCompletion || {})[tabId] === true;

  // التبويب النشط: نثق بالقيمة الحيّة من المكوّن (قد يكون المستخدم يعدّل الآن).
  if (tabId === activeTab.value) return storeVal;

  // غير النشط: نعتمد بيانات الأغنية (تُزامَن في المخزَّن عند كل حفظ فتبقى حديثة) —
  //   فتظهر الحالة الصحيحة فور العودة، وتتحدّث فوراً بعد تغييرات مثل song_type دون
  //   الاعتماد على قيمة tabCompletion قد تكون قديمة. إن غابت البيانات نرجع للمخزَّن.
  const dc = dataCompletion.value;
  if (dc) return dc[tabId] === true;
  return storeVal;
};

// ✅ التبويبات الأساسية التي يجب إكمالها قبل فتح deals و pre-release
const coreTabsComplete = () => {
  return isTabCompleted('infos') && isTabCompleted('urheber') && isTabCompleted('mitwirkende');
};

// ========== ✅ دالة التحقق من إمكانية الوصول ==========
const isTabAccessible = (tabId) => {
  // التبويب النشط دائماً قابل للوصول
  if (tabId === activeTab.value) return true;

  const currentIndex = getTabIndex(activeTab.value);
  const targetIndex = getTabIndex(tabId);

  // التبويبات السابقة دائماً قابلة للوصول
  if (targetIndex < currentIndex) return true;

  // ✅ deals و pre-release مقفلتان حتى تكتمل infos + urheber + mitwirkende
  if (tabId === 'deals' || tabId === 'pre-release') {
    const unlocked = coreTabsComplete();
    console.log(`📌 [Column2] isTabAccessible: ${tabId} unlocked=${unlocked} (needs infos+urheber+mitwirkende)`);
    return unlocked;
  }

  // ✅ إذا كان التبويب مكتملاً، يمكن الوصول إليه دائماً
  if (isTabCompleted(tabId)) return true;

  // ✅ التبويبات التالية: يتطلب اكتمال التبويب الحالي وجميع السابقة
  if (targetIndex > currentIndex) {
    const isCurrentComplete = isTabCompleted(activeTab.value);

    let allPreviousComplete = true;
    for (let i = 0; i < targetIndex; i++) {
      const prevTabId = tabOrder[i];
      if (prevTabId !== activeTab.value && !isTabCompleted(prevTabId)) {
        allPreviousComplete = false;
        break;
      }
    }

    console.log(`📌 [Column2] isTabAccessible: target=${tabId}, current=${activeTab.value}`);
    console.log(`   - isCurrentComplete: ${isCurrentComplete}`);
    console.log(`   - allPreviousComplete: ${allPreviousComplete}`);

    return isCurrentComplete && allPreviousComplete;
  }

  return false;
};

// ========== ✅ tabs.vue قارئ فقط لحالة الاكتمال ==========
//   أُزيلت هنا ثلاث آفات كانت تُفسد المزامنة:
//   1) sendCompletionStatus كان يبعث 'update-step-completion' ولا مستمع له إطلاقاً.
//   2) كان يكتب افتراضات (deals/pre-release = true) عند غياب القيمة، فيضع علامة اكتمال
//      على تبويب لم يزره المستخدم.
//   3) كل نداءاته للمخزَّن كانت بصيغة updateTabCompletion('deals', true) بينما الـ action
//      يستقبل كائناً واحداً → كانت تُرفَض بتحذير "invalid completion data" وتُهمَل.
//   الكتابة في tabCompletion صارت مسؤولية Infos1 وحدها (من مكوّنات التبويبات عبر
//   update:form-data)، وهذا المكوّن يقرأ فقط — فلا تتضارب المصادر.

// ========== اختيار التبويب ==========
const selectTab = (tabId) => {
  if (tabId === activeTab.value) return;
  
  console.log(`📌 [Column2] selectTab: ${tabId}`);
  console.log(`📌 [Column2] tabCompletion from Store:`, releaseStore.tabCompletion);
  
  activeTab.value = tabId;
  emit('update-tab', tabId);
};

// ========== مراقبة التغييرات في prop.activeTab ==========
watch(
  () => props.activeTab,
  (newTab) => {
    if (newTab && newTab !== activeTab.value) {
      console.log('📌 [Column2] تحديث التبويب من prop:', newTab);
      activeTab.value = newTab;
    }
  },
  { immediate: true }
);

// ========== مراقبة التغييرات في Store tabCompletion (للتشخيص فقط) ==========
watch(
  () => releaseStore.tabCompletion,
  (newVal) => {
    console.log('📌 [Column2] Store tabCompletion updated:', { ...newVal });
  },
  { deep: true }
);

// ========== تصدير الدوال ==========
defineExpose({
  isTabCompleted,
  isTabAccessible,
  selectTab,
  getTabBackground
});
</script>

<style lang="scss" scoped>
/* نفس الـ style الموجود */
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

@media (max-width:1599px) {
  .title{
    font-size: 15px !important;
  }

  .tab-buttons .btn-tab{
  padding: 15px 12px 15px 20px;

  }
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
}

.tab-buttons.active .btn-tab {
  color: #FFF;
  z-index: 12;
}

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

.title {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  flex: 1 0 0;
  overflow: hidden;
  color: #6A6C6D;
  leading-trim: both;
  text-edge: cap;
  text-overflow: ellipsis;
  font-family: Heebo;
  font-size: 20px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  text-transform: uppercase;
}

.tab-buttons.active .btn-tab {
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

.tab-buttons.active .top-corner,
.tab-buttons.active .down-corner {
  z-index: 4;
}

.tab-buttons.active .icons { filter: brightness(0) invert(1); }
.tab-buttons.active .title { color: #FFF; }
.btn-tab:hover .icons { filter: brightness(0) invert(1); }
.btn-tab:hover .title { color: #FFF; }

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

.checkmark-tab {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: auto;
  flex-shrink: 0;
  min-width: 20px;
}

.checkmark-tab .checkmark-icon {
  width: 16px;
  height: 16px;
  filter: brightness(0) invert(1);
}

.lock-tab {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: auto;
  flex-shrink: 0;
  min-width: 20px;
}

.lock-tab .lock-icon {
  width: 14px;
  height: 14px;
  opacity: 0.5;
}

.tab-buttons.completed .btn-tab {
  color: #FFF;
}

.tab-buttons.completed .btn-tab .title {
  color: #FFF;
}

/* ✅ التبويب المكتمل (وغير النشط): تحويل الأيقونة إلى الأبيض مثل التبويب النشط */
.tab-buttons.completed .icons {
  filter: brightness(0) invert(1);
}

.tab-buttons.completed .checkmark-tab .checkmark-icon {
  filter: brightness(0) invert(1);
}

.tab-buttons.disabled .btn-tab {
  cursor: not-allowed;
  opacity: 0.4;
}

.tab-buttons.disabled .btn-tab .title {
  color: #6A6C6D;
}

.tab-buttons.disabled:hover .btn-tab .icons {
  // filter: none;
}

.tab-buttons.disabled .lock-tab .lock-icon {
  opacity: 0.4;
}

@media (min-width:2075px) and (max-width:2560px) {
  .tabs { width: 286px; }
}
</style>