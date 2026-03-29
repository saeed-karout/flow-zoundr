<template>
  <main>
    <div class="main">
      <TopRow :isSwitchActive="isSwitchActive" @toggle-switch="toggleSwitch" />
      
      <template v-if="isSwitchActive">
        <PublikumView />
      </template>
      <template v-else>
        <div class="row2">
          <component :is="tabs[activeTab].component" :data="tabs[activeTab].data" />
          <ColumnTabs :tabs="tabs" :activeTab="activeTab" @set-active-tab="setActiveTab" />
        </div>
        <SecondarySection />
      </template>
    </div>
  </main>
</template>

<script setup>
import { ref } from 'vue';
import TopRow from '@/components/Stream/content/TopRow.vue';
import ColumnTabs from '@/components/Stream/content/ColumnTabs.vue';
import StreamingTab from '@/components/Stream/tabs/StreamingTab.vue';
import SongsTab from '@/components/Stream/tabs/SongsTab.vue';
import ReleasesTab from '@/components/Stream/tabs/ReleasesTab.vue';
import ShazamsTab from '@/components/Stream/tabs/ShazamsTab.vue';
import EinnahmenTab from '@/components/Stream/tabs/EinnahmenTab.vue';
import StoresTab from '@/components/Stream/tabs/StoresTab.vue';
import SecondarySection from '@/components/Stream/Secondary-section/SecondarySection.vue';
import PublikumView from '@/views/PublikumView.vue';

const tabs = [
  { title: 'Streaming', icon: '/icon/icon-stream/music.svg', component: StreamingTab },
  { title: 'Songs', icon: '/icon/icon-stream/songs.svg', component: SongsTab },
  { title: 'Releases', icon: '/icon/icon-stream/release.svg', component: ReleasesTab },
  { title: 'Shazams', icon: '/icon/icon-stream/release.svg', component: ShazamsTab },
  { title: 'Einnahmen', icon: '/icon/icon-stream/einnahmen.svg', component: EinnahmenTab },
  { title: 'Stores', icon: '/icon/icon-stream/stores.svg', component: StoresTab },
];

const activeTab = ref(0);
const isSwitchActive = ref(false);

const setActiveTab = (index) => {
  activeTab.value = index;
};

const toggleSwitch = () => {
  isSwitchActive.value = !isSwitchActive.value;
};
</script>

<style lang="scss" scoped>
main {
  display: flex;
  justify-content: center;
  height: calc(100vh - 71px - 50px);
  position: relative;
  overflow: hidden;
}

.main {
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: flex-start;
  gap: 20px;
}

.row2 {
  display: flex;
  align-items: flex-start;
  align-self: stretch;
  height: 100%;
}
</style>