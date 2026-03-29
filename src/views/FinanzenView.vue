<template>
  <main>
    <div class="main">
      <TopRow  />
      
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
import TopRow from '@/components/Finanzen/content/TopRow.vue';
import ColumnTabs from '@/components/Finanzen/content/ColumnTabs.vue';
import RechnungenTab from '@/components/Finanzen/tabs/RechnungenTab.vue';
import DetailsTab from '@/components/Finanzen/tabs/DetailsTab.vue';
import BerichtesTab from '@/components/Finanzen/tabs/BerichtesTab.vue';
import GutschriftenTab from '@/components/Finanzen/tabs/GutschriftenTab.vue';
import EinnahmenTab from '@/components/Finanzen/tabs/EinnahmenTab.vue';
import AdressenTab from '@/components/Finanzen/tabs/AdressenTab.vue';
import SecondarySection from '@/components/Finanzen/Secondary-section/SecondarySection.vue';
import PublikumView from '@/views/PublikumView.vue';

const tabs = [
  { title: 'Einnahmen', icon: '/icon/icon-stream/einnahmen.svg', component:  EinnahmenTab },
  { title: 'Details', icon: '/icon/icon-Finanzen/details.svg', component: DetailsTab },
  { title: 'Berichte', icon: '/icon/icon-Finanzen/Berichte.svg', component: BerichtesTab },
  { title: 'Gutschriften', icon: '/icon/icon-Finanzen/Gutschriften.svg', component: GutschriftenTab },
  { title: 'Rechnungen', icon: '/icon/icon-Finanzen/Rechnungen.svg', component: RechnungenTab },
  { title: 'Adressen', icon: '/icon/icon-Finanzen/Re-Adresse.svg', component: AdressenTab },
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
  min-height: 488px;
}



@media (max-width:1599px) {
  .row2{
    min-height: 443px;
  }
}
</style>