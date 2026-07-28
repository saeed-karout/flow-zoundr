<template>
    <div class="section-secondary">
        <div class="Tab-content">
            <div class="Tabs">
                <TabButtonBottom 
                    v-for="tab in tabsBottom" 
                    :key="tab" 
                    :tab-name="tab"
                    :is-active="activeTabBottom === tab" 
                    @set-active="setActiveTabBottom" 
                />
            </div>
            <div class="Content-Box">
                <div class="Fade-left"></div>
                <div class="component-wrapper">
                    <component 
                        :is="currentTabComponent" 
                        :data="currentTabData"
                        :filters="filters"
                    />
                </div>
                <div class="Fade"></div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import TabButtonBottom from '@/components/Stream/Secondary-section/TabButton.vue';
import SongsTabBottom from '@/components/Stream/tabs-bottom/SongsTab.vue';
import ReleasesTabBottom from '@/components/Stream/tabs-bottom/ReleasesTab.vue';
import ArtistsTabBottom from '@/components/Stream/tabs-bottom/ArtistsTab.vue';
import FeaturesTabBottom from '@/components/Stream/tabs-bottom/FeaturesTab.vue';
import UrheberTabBottom from '@/components/Stream/tabs-bottom/UrheberTab.vue';
import ProduzentenTabBottom from '@/components/Stream/tabs-bottom/ProduzentenTab.vue';
import MitwirkendeTabBottom from '@/components/Stream/tabs-bottom/MitwirkendeTab.vue';
import StoresTabBottom from '@/components/Stream/tabs-bottom/StoresTab.vue';
import LänderTabBottom from '@/components/Stream/tabs-bottom/LänderTab.vue';
import SavesTabBottom from '@/components/Stream/tabs-bottom/SavesTab.vue';

const props = defineProps({
    allData: {
        type: Object,
        default: () => ({})
    },
    filters: {
        type: Object,
        default: () => ({})
    }
});

const tabsBottom = ['Songs', 'Releases', 'Artists', 'Features', 'Urheber', 'Produzenten', 'Mitwirkende', 'Stores', 'Länder', 'Saves'];
const activeTabBottom = ref('Songs');

// تعريف المكونات مع البيانات الخاصة بكل تاب
const tabComponents = {
    'Songs': SongsTabBottom,
    'Releases': ReleasesTabBottom,
    'Artists': ArtistsTabBottom,
    'Features': FeaturesTabBottom,
    'Urheber': UrheberTabBottom,
    'Produzenten': ProduzentenTabBottom,
    'Mitwirkende': MitwirkendeTabBottom,
    'Stores': StoresTabBottom,
    'Länder': LänderTabBottom,
    'Saves': SavesTabBottom,
};

// خريطة لتحديد المفتاح المناسب لكل تاب من البيانات
const tabDataKeys = {
    'Songs': 'songs',
    'Releases': 'releases',
    'Artists': 'artists',
    'Features': 'features',
    'Urheber': 'c_lines',
    'Produzenten': 'producers',
    'Mitwirkende': 'contributers',
    'Stores': 'stores',
    'Länder': 'countries',
    'Saves': 'saves',
};

const currentTabComponent = computed(() => tabComponents[activeTabBottom.value]);

// الحصول على البيانات الخاصة بالتاب الحالي
const currentTabData = computed(() => {
    const key = tabDataKeys[activeTabBottom.value];
    if (!key) return [];
    return props.allData?.[key] || [];
});

const setActiveTabBottom = (tab) => {
    activeTabBottom.value = tab;
};
</script>

<style lang="scss" scoped>
.section-secondary {
    display: flex;
    align-items: flex-start;
    gap: 20px;
    flex-shrink: 0;
    align-self: stretch;
    width: 100%;
    max-width: 100%;
    min-height: 347px;
    height: auto;
}

.Tab-content {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    flex: 1 0 0;
    width: 100%;
    max-width: 100%;
    min-height: 0;
    height: 100%;
}

.Tab-content .Tabs {
    display: flex;
    align-items: stretch;
    // justify-content: space-between;
    width: 100%;
    flex-shrink: 0;
}

.Content-Box {
    display: flex;
    align-items: flex-start;
    gap: 20px;
    flex: 1;
    align-self: stretch;
    border-radius: 20px;
    background: var(--secondary);
    width: 100%;
    max-width: 100%;
    position: relative;
    min-height: 0;
    overflow: hidden;
}

.component-wrapper {
    flex: 1;
    min-height: 0;
    overflow: auto;
    width: 100%;
    height: 100%;
}

.Fade {
    width: 270px;
    height: 54px;
    transform: rotate(-90deg);
    position: absolute;
    right: -105px;
    top: 110px;
    border-radius: 0 20px 20px 0;
    background: linear-gradient(0deg, var(--Main-Colors-Slate, #26282D) 30%, rgba(38, 40, 45, 0.00) 100%);
    pointer-events: none;
}

.Fade-left {
    width: 240px;
    height: 50px;
    transform: rotate(90deg);
    position: absolute;
    left: -95px;
    top: 128px;
    border-radius: 20px 0 20px 20px;
    background: linear-gradient(0deg, var(--Main-Colors-Slate, #26282D) 30%, rgba(38, 40, 45, 0.00) 100%);
    z-index: 50;
    pointer-events: none;
}

@media (min-width:2075px) and (max-width:2560px) {
    .Tab-content .Tabs {
        justify-content: start;
    }
}
</style>