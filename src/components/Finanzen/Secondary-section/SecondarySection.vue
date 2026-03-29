<template>
    <div class="section-secondary">
        <div class="Fade-left"></div>
        <div class="Tab-content">
            <div class="Tabs">
                <TabButtonBottom v-for="tab in tabsBottom" :key="tab" :tab-name="tab"
                    :is-active="activeTabBottom === tab" @set-active="setActiveTabBottom" />
            </div>
            <div class="Content-Box">

                <component :is="currentTabComponent" />

            </div>
        </div>
        <div class="Fade"></div>
    </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import TabButtonBottom from '@/components/Finanzen/Secondary-section/TabButton.vue';
import SongsTabBottom from '@/components/Finanzen/tabs-bottom/SongsTab.vue';
import ReleasesTabBottom from '@/components/Finanzen/tabs-bottom/ReleasesTab.vue';
import ArtistsTabBottom from '@/components/Finanzen/tabs-bottom/ArtistsTab.vue';
import StoresTabBottom from '@/components/Finanzen/tabs-bottom/StoresTab.vue';
import LänderTabBottom from '@/components/Finanzen/tabs-bottom/LänderTab.vue';

const tabsBottom = ['Songs', 'Releases', 'Artists', 'Stores', 'Länder'];
const activeTabBottom = ref('Songs');

const tabComponents = {
    'Songs': SongsTabBottom,
    'Releases': ReleasesTabBottom,
    'Artists': ArtistsTabBottom, 
    'Stores': StoresTabBottom,
    'Länder': LänderTabBottom,
};

const currentTabComponent = computed(() => tabComponents[activeTabBottom.value]);

const setActiveTabBottom = (tab) => {
    activeTabBottom.value = tab;
};
</script>
<style lang="scss" scoped>
.section-secondary {
    display: flex;
    align-items: flex-start;
    gap: 20px;
    flex: 1 0 0;
    align-self: stretch;
    width: 100%;
    max-width: 100%;
    position: relative;
    min-height: 347px;
    max-height: 347px;
}

.Tab-content {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    flex: 1 0 0;
    height: 100%;
    width: 100%;
    max-width: 100%;
}

.Tab-content .Tabs {
    display: flex;
    align-items: flex-start;
    // justify-content: space-between;
    width: 100%;
    max-height: 66px;
}

.Content-Box {
    display: flex;
    align-items: flex-start;
    gap: 20px;
    flex: 1 0 0;
    align-self: stretch;
    border-radius: 20px;
    background: var(--secondary);
    width: 100%;
    max-width: 100%;
    position: relative;
    max-height: 287px;
}


.Fade {
    width: 50px;
    height: 235px;
    // transform: rotate(-90deg);
    position: absolute;
    right: 0px;
    bottom: 0;
    border-radius: 0 20px 20px 0;
    background: linear-gradient(-90deg, var(--Main-Colors-Slate, #26282D) 30%, rgba(38, 40, 45, 0.00) 100%);
}


.Fade-left {
    width: 50px;
    height: 235px;
    // transform: rotate(90deg);
    position: absolute;
    left: 0px;
    bottom: 0;
    border-radius: 20px 0 20px 20px;
    background: linear-gradient(90deg, var(--Main-Colors-Slate, #26282D) 30%, rgba(38, 40, 45, 0.00) 100%);
    z-index: 50;
}

@media (max-width:1600px) {
    .Fade,.Fade-left{
        height: 180px;
    }

    .section-secondary {
        min-height: 300px;
    }
}

@media (min-width:1600px) {
    .section-secondary{
        // min-height: 450px;
    }
}
</style>