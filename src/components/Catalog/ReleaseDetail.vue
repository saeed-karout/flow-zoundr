<template>
  <main>
    <div class="main">
      <div class="section-primary">
        
        <div class="content-small" v-if="loading">
          <div class="loading">Loading release details...</div>
        </div>

        <template v-else-if="error">
          <div class="error">errors : {{ error }}</div>
        </template>

        <template v-else-if="release">
          <div class="music-cover" :style="coverStyle"></div>

         
          <div class="HeadLine-small">
            <div class="title">{{ release.title || 'unTitle' }}</div>
            <div class="subtitle">{{ release.subtitle || 'There is no description' }}</div>
            <div class="info-bar">
              <div class="status-pill" :class="getReleasePillClass(release.release_status)">
                {{ getReleasePillLabel(release.release_status) }}
              </div>
              <div class="Buttons">
                <div class="buttonCom">Trends</div>
                <div class="buttonCom">Labelcopy</div>
                <div class="buttonCom" @click="handleTakedown">Takedown</div>
              </div>
            </div>
          </div>

          <div class="information">
            <div class="HeadLine">
              <div class="title">{{ release.title || 'un title' }}</div>
              <div class="subtitle">{{ release.subtitle || 'There is no description' }}</div>
              <div class="info-bar">
                <div class="status-pill" :class="getReleasePillClass(release.release_status)">
                  {{ getReleasePillLabel(release.release_status) }}
                </div>
                <div class="Buttons">
                  <div class="buttonCom">Trends</div>
                  <div class="buttonCom">Labelcopy</div>
                  <div class="buttonCom" @click="handleTakedown">Takedown</div>
                </div>
              </div>
            </div>

            <div class="ContextBox">
              <div class="column1">
                <div class="line">
                  <div class="key">Label</div>
                  <div class="value">{{ release.label || 'undefined' }}</div>
                </div>
                <div class="line">
                  <div class="key">KAT.#</div>
                  <div class="value">{{ release.catalog_number || 'undefined' }}</div>
                </div>
                <div class="line">
                  <div class="key">GTIN</div>
                  <div class="value">{{ release.GTIN || 'undefined' }}</div>
                </div>
                <div class="line">
                  <div class="key">C-Line</div>
                  <div class="value">{{ release.c_line_name || 'undefined' }}</div>
                </div>
                <div class="line">
                  <div class="key">P-Line</div>
                  <div class="value">{{ release.p_line_name || 'undefined' }}</div>
                </div>
                
                <div class="line">
                  <div class="key">Jahr</div>
                  <div class="value">{{ release.production_year || 'undefined' }}</div>
                </div>
                <div class="line">
                  <div class="key">Preis</div>
                  <div class="value">{{ release.release_price ? release.release_price + ' EUR' : 'undefined' }}</div>
                </div>
              </div>

              <div class="column2">
                <div class="line">
                  <div class="key">Releaseart</div>
                  <div class="value">{{ release.release_type || 'undefined' }}</div>
                </div>
                <div class="line">
                  <div class="key">Laufzeit</div>
                  <div class="value">{{ release.total_duration || 'unavailable' }}</div>
                </div>
                <div class="line">
                  <div class="key">Genre</div>
                  <div class="value">{{ release.main_genre || 'undefined' }}</div>
                </div>
                <div class="line">
                  <div class="key">Explicit Lyrics</div>
                  <div class="value">{{ release.explicit ? 'Ja' : 'Nein' }}</div>
                </div>
                <div class="line">
                  <div class="key">Veröffentlichung</div>
                  <div class="value">{{ formatDate(release.release_date) || 'undefined' }}</div>
                </div>
                <div class="line">
                  <div class="key">Erstellungsdatum</div>
                  <div class="value">{{ formatDate(release.created_at) || 'undefined' }}</div>
                </div>
                <div class="line">
                  <div class="key">Audio Qualität</div>
                  <div class="value">{{ release.audio_quality || 'undefined' }}</div>
                </div>
              </div>

              <div class="column3">

                <div class="line">
                  <div class="key">Jahr</div>
                  <div class="value">{{ release.production_year || 'undefined' }}</div>
                </div>
                <div class="line">
                  <div class="key">Preis</div>
                  <div class="value">{{ release.release_price ? release.release_price + ' EUR' : 'undefined' }}</div>
                </div>

                <div class="line">
                  <div class="key">Erstellungsdatum</div>
                  <div class="value">{{ release.created_at }}</div>
                </div>

                <div class="line">
                  <div class="key">Audio Qualität</div>
                  <div class="value">{{ release.audio_quality || 'undefined' }}</div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>

      <!-- الـ Tabs -->
      <div class="section-secondary">
        <div class="Tab-content">
          <div class="Tabs">
            <TabButton v-for="tab in tabs" :key="tab" :tab-name="tab" :is-active="activeTab === tab"
              @set-active="setActiveTab" />
          </div>
          <div class="Content-Box">
            <component :is="currentTabComponent" :release="release" />
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import apiRequest from '@/lib/apiRequest'

import TabButton from '@/components/releases/TabButton.vue'
import Titelliste from '@/components/releases/content-tabs/Titelliste.vue'
import Urheber from '@/components/releases/content-tabs/Urheber.vue'
import Mitwirkende from '@/components/releases/content-tabs/Mitwirkende.vue'
import Deals from '@/components/releases/content-tabs/Deals.vue'
import Services from '@/components/releases/content-tabs/Services.vue'
import Gebiete from '@/components/releases/content-tabs/Gebiete.vue'
import { storage_url } from '@/constants'

const route = useRoute()

const release = ref(null)
const loading = ref(true)
const error = ref(null)
const takedownLoading = ref(false)
const activeTab = ref('Titelliste')

const tabs = ['Titelliste', 'Urheber', 'Mitwirkende', 'Deals', 'Services', 'Gebiete']


// لون ونص الـ pill حسب الحالة
const getReleasePillClass = (status) => {
  if (!status) return 'status-unknown'

  const lower = status.toLowerCase().trim()

  if (lower === 'online') return 'status-online'
  if (lower === 'out_for_delivery') return 'status-delivery'
  if (lower === 'submitted') return 'status-submitted'

  return 'status-unknown'
}

const getReleasePillLabel = (status) => {
  if (!status) return 'undefined'

  const map = {
    online: 'Online',
    out_for_delivery: 'In Auslieferung',
    submitted: 'Eingereicht'
  }

  return map[status.toLowerCase().trim()] || status
}


const handleTakedown = async () => {
  const uuid = route.params.uuid
  if (!uuid) {
    console.error('No release UUID found')
    return
  }


  takedownLoading.value = true 

  try {
    console.log(`📤 Sending takedown request for release: ${uuid}`)
    
    const response = await apiRequest.post(`/releases/${uuid}/takedown`)
    
    if (response.status === 200 || response.status === 201) {
      console.log('✅ Takedown successful:', response.data)
      
      // تحديث بيانات الـ release بعد التاكداون
      await fetchRelease()
      
      // يمكن إظهار رسالة نجاح للمستخدم
      console.log('Release wurde erfolgreich takedown gesetzt.');
      
    } else {
      throw new Error('Unexpected response status')
    }
  } catch (err) {
    console.error('❌ Takedown failed:', err)
    console.log("Fehler beim Takedown. Bitte versuchen Sie es später erneut.");
    
  } finally {
    takedownLoading.value = false
  }
}

const currentTabComponent = computed(() => {
  const map = {
    Titelliste,
    Urheber,
    Mitwirkende,
    Deals,
    Services,
    Gebiete
  }
  return map[activeTab.value] || Titelliste
})

const coverStyle = computed(() => {
  if (!release.value?.cover) return {}
  return {
    backgroundImage: `url(${storage_url}/${release.value.cover})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  }
})

const fetchRelease = async () => {
  const uuid = route.params.uuid
  if (!uuid) {
    error.value = 'Version ID is missing'
    loading.value = false
    return
  }

  try {
    loading.value = true
    error.value = null

    const response = await apiRequest.get(`/releases/${uuid}`)
    release.value = response.data?.data || response.data || null

    if (!release.value) {
      error.value = 'Release not found'
    }
  } catch (err) {
    console.error('Error fetching release:', err)
    error.value = err.message || 'Failed to load release details'
  } finally {
    loading.value = false
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return null
  const date = new Date(dateStr)
  return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const getStatusClass = (status) => {
  const map = {
    online: 'online',
    out_for_delivery: 'out-for-delivery',
    submitted: 'submitted'
  }
  return map[status] || 'unknown'
}

const getStatusLabel = (status) => {
  const map = {
    online: 'Online',
    out_for_delivery: 'In Auslieferung',
    submitted: 'Eingereicht'
  }
  return map[status] || status || 'unknown'
}

const setActiveTab = (tab) => {
  activeTab.value = tab
}

onMounted(fetchRelease)
</script>



<style lang="scss" scoped>
main {
  display: flex;
  height: calc(100vh - 71px - 50px);
  position: relative;
}

.loading,
.error {
  padding: 60px;
  text-align: center;
  font-size: 1.3rem;
  color: #aaa;
}

.error {
  color: #ff6b6b;
}

.main {
  display: flex;
  width: 100%;
  height: auto;
  flex-direction: column;
  align-items: flex-start;
  gap: 20px;
  flex-shrink: 0;
}

.section-primary {
  display: flex;
  height: auto;
  align-items: center;
  gap: 20px;
  flex-shrink: 0;
  align-self: stretch;
}

.music-cover {
  display: flex;
  width: 456px;
  height: 456px;
  justify-content: space-between;
  align-items: flex-end;
  aspect-ratio: 1/1;
  border-radius: 20px;
  background: url(/img/releases-card.jpg) lightgray 50% / cover no-repeat;
}

.information {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 20px;
  flex: 1 0 0;
  // height: 100%;
  width: 100%;
  align-self: flex-end;
}

.HeadLine {
  display: flex;
  flex-direction: column;
  align-items: start;
  gap: 20px;
  align-self: stretch;
  padding-top: 16px;
}

.HeadLine-small {
  display: none;
  flex-direction: column;
  align-items: start;
  gap: 16px;
  align-self: stretch;
  padding-top: 16px;
}

.HeadLine .title,
.HeadLine-small .title {
  color: #FFF;
  text-overflow: ellipsis;
  font-family: Heebo;
  font-size: 58px;
  font-style: normal;
  font-weight: 700;
  line-height: .6;
  text-transform: uppercase;
  display: -webkit-box;
  -webkit-box-orient: vertical;
}

.HeadLine-small .title {
  font-size: 48px;
}

.HeadLine .subtitle,
.HeadLine-small .subtitle {
  color: #FFF;
  text-overflow: ellipsis;
  font-family: Heebo;
  font-size: 40px;
  font-style: normal;
  font-weight: 700;
  line-height: .8;
  text-transform: uppercase;
  display: -webkit-box;
  -webkit-box-orient: vertical;
}

.HeadLine-small .subtitle {
  font-size: 32px;
  line-height: .6;
}

.info-bar {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  align-self: stretch;
}

.pill-state {
  display: flex;
  height: 24px;
  padding: 4px 12px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  border-radius: 12px;
  background: var(--Strawberry);
  color: var(--Main-Colors-White, #FFF);
  font-family: Heebo;
  font-size: 18px;
  font-style: normal;
  font-weight: 400;
  line-height: .9;
}

.Buttons {
  display: flex;
  align-items: center;
  gap: 20px;
}

.Buttons .buttonCom {
  display: flex;
  padding: 17px 20px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  border-radius: 5px;
  background: var(--secondary);
  color: #FFF;
  font-family: Heebo;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: .9;
  text-transform: uppercase;
  max-height: 46px;
}

.Buttons .buttonCom:hover {
  background-color: var(--dark-red);
  cursor: pointer;
}

.ContextBox {
  display: flex;
  height: auto;
  padding: 20px;
  align-items: flex-start;
  gap: 20px;
  align-self: stretch;
  border-radius: 20px;
  background: var(--secondary);
  // height: 100%;
}

.ContextBox .column1,
.ContextBox .column2,
.ContextBox .column3 {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 20px;
  flex: 1 0 0;
}

.column1 .line,
.column2 .line,
.column3 .line {
  display: flex;
  align-items: flex-start;
  gap: 20px;
}



.line .key {
  width: 100px;
  color: var(--selvar);
  font-family: Heebo;
  font-size: 18px;
  font-style: normal;
  font-weight: 300;
  line-height: .8;
  letter-spacing: 0.9px;
  opacity: 0.7;
}

.column2 .line .key {
  width: 170px;
}

.column3 .line .key {
  width: 170px;
}

.line .value {
  color: var(--selvar);
  font-family: Heebo;
  font-size: 18px;
  font-style: normal;
  font-weight: 700;
  line-height: .8;
  letter-spacing: 0.9px;
}

.section-secondary {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  flex: 1 0 0;
  align-self: stretch;
}

.Tab-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  flex: 1 0 0;
  height: 100%;
}

.Tab-content .Tabs {
  display: flex;
  align-items: flex-start;
  gap: -40px;
}

.Tabs .tab-btn {
  display: flex;
  height: 66px;
  justify-content: center;
  align-items: flex-end;
  position: relative;
  cursor: pointer;
}

.tab-btn .Button-tab {
  display: flex;
  padding: 26px 30px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  border-radius: 20px 20px 0px 0px;
  background: rgba(38, 40, 45, 0.00);
  color: var(--selvar);
  font-family: Heebo;
  font-size: 20px;
  font-style: normal;
  font-weight: 400;
  line-height: .8;
  text-transform: uppercase;
  position: relative;
  z-index: 11;
}

.tab-btn:hover .Button-tab {
  background: var(--secondary);
}

.tab-btn.active .Button-tab {
  background: var(--secondary);
  position: relative;
}

/* Hide corner elements by default */
.tab-btn .left-corner,
.tab-btn .right-corner {
  display: none;
  opacity: 0;
}

/* Show corner elements for active tab or on hover */
.tab-btn.active .left-corner,
.tab-btn.active .right-corner,
.tab-btn:hover .left-corner,
.tab-btn:hover .right-corner {
  display: block;
  opacity: 1;
  width: 20px;
  height: 20px;
  fill: var(--Main-Colors-Slate, #26282D);
  position: absolute;
  bottom: 0;
}

.tab-btn.active .left-corner,
.tab-btn:hover .left-corner {
  left: -20px;
}

.tab-btn.active .right-corner,
.tab-btn:hover .right-corner {
  right: -20px;
}

.right-corner .rectangle3 {
  width: 20px;
  height: 20px;
  background: var(--Main-Colors-Slate, #26282D);
  position: relative;
}

.right-corner .rectangle2 {
  width: 20px;
  height: 20px;
  border-radius: 0px 0px 0px 20px;
  background: var(--primary);
  position: absolute;
  top: 0px;
  right: 0px;
  z-index: 2;
}

.left-corner .rectangle3 {
  width: 20px;
  height: 20px;
  background: var(--Main-Colors-Slate, #26282D);
  position: relative;
}

.left-corner .rectangle2 {
  width: 20px;
  height: 20px;
  background: var(--primary);
  border-radius: 0 0 20px 0;
  position: absolute;
  top: 0px;
  left: 0;
  z-index: 2;
}

/* Handle Services tab's nested structure */
.tab-btn .left-corner .rectangle3 .rectangle2,
.tab-btn .right-corner .rectangle3 .rectangle2 {
  width: 20px;
  height: 20px;
  background: var(--primary);
  position: absolute;
  top: 0;
  z-index: 2;
}

.tab-btn .left-corner .rectangle3 .rectangle2 {
  border-radius: 0 0 20px 0;
  left: 0;
}

.tab-btn .right-corner .rectangle3 .rectangle2 {
  border-radius: 0 0 0 20px;
  right: 0;
}

/* Ensure active tab's corners have default backgrounds */
.tab-btn.active .left-corner .rectangle3,
.tab-btn.active .right-corner .rectangle3 {
  background: var(--Main-Colors-Slate, #26282D);
}

.tab-btn.active .left-corner .rectangle2,
.tab-btn.active .right-corner .rectangle2,
.tab-btn.active .left-corner .rectangle3 .rectangle2,
.tab-btn.active .right-corner .rectangle3 .rectangle2 {
  background: var(--primary);
}

/* When hovering the tab to the left of the active tab */
.tab-btn:hover+.tab-btn.active .left-corner .rectangle2,
.tab-btn:hover+.tab-btn.active .left-corner .rectangle3 .rectangle2 {
  background: var(--secondary);
}

/* When hovering the tab to the right of the active tab */
.tab-btn.active+.tab-btn:hover .left-corner .rectangle2,
.tab-btn.active+.tab-btn:hover .left-corner .rectangle3 .rectangle2 {
  background: var(--secondary);
}

.tab-btn.active .right-corner .rectangle2,
.tab-btn.active .right-corner .rectangle3 .rectangle2 {
  background: var(--primary);
}

/* Ensure non-shared corners retain default background during hover */
.tab-btn:hover .left-corner .rectangle2,
.tab-btn:hover .left-corner .rectangle3 .rectangle2,
.tab-btn.active+.tab-btn:hover .right-corner .rectangle2,
.tab-btn:hover+.tab-btn.active .right-corner .rectangle2,
.tab-btn:hover+.tab-btn.active .right-corner .rectangle3 .rectangle2,
.tab-btn.active .left-corner .rectangle2,
.tab-btn.active .left-corner .rectangle3 .rectangle2 {
  background: var(--primary);
}

/* Ensure active tab's right-corner .rectangle3 is not overridden by hover */
.tab-btn.active .right-corner .rectangle3:not(.tab-btn:hover + .tab-btn.active .right-corner .rectangle3) {
  background: var(--secondary);
}

.Content-Box {
  width: 100%;
  height: 100%;
}

/* استجابة للشاشات بين 1440px و 1599px */
@media (min-width: 1440px) and (max-width: 1599px) {
  .section-primary {
    flex-direction: column;
    align-items: flex-start;
  }

  .line .value {
    font-size: 16px;
  }

  .line .key {
    font-size: 16px;
  }

  .content-small {
    display: flex;
    width: 100%;
    gap: 20px;
    align-items: center;
  }

  .value {
    line-height: 1;
  }

  .music-cover {
    width: 125px;
    height: 125px;
    // margin-bottom: 20px;
  }

  .Buttons .buttonCom {
    max-height: 36px;
  }

  .HeadLine {
    padding-top: 0;
    width: 100%;
    display: none;
  }

  .HeadLine-small {
    padding-top: 10px;
    width: 100%;
    display: flex;
  }

  .ContextBox {
    flex-wrap: wrap;
    width: 100%;
    padding: 32px 20px;
  }

  .ContextBox .column1,
  .ContextBox .column2,
  .ContextBox .column3 {
    flex: 0 0 calc(33.333% - 14px);
    gap: 16px;
  }

  .ContextBox .column1 .line:nth-child(n+6),
  .ContextBox .column2 .line:nth-child(n+6) {
    display: none;
  }

  .ContextBox .column3 {
    display: flex;
  }
}

/* استجابة للشاشات بين 1600px و 2074px */
@media (min-width: 1600px) and (max-width: 2074px) {
  .ContextBox .column3 {
    display: none;
  }

  .ContextBox .column1,
  .ContextBox .column2 {
    flex: 1 0 0;
  }
}

/* استجابة للشاشات بين 2075px و 2560px */
@media (min-width: 2075px) and (max-width: 2560px) {
  .music-cover {
    width: 500px;
    height: 500px;
  }

  .ContextBox {
    flex-wrap: wrap;
  }

  .ContextBox .column1,
  .ContextBox .column2,
  .ContextBox .column3 {
    flex: 0 0 calc(33.333% - 14px);
    gap: 15px;
  }

  .ContextBox .column1 .line:nth-child(n+6),
  .ContextBox .column2 .line:nth-child(n+6) {
    display: none;
  }

  .ContextBox .column3 {
    display: flex;
  }
}

@media (min-width:2560px) {
  .music-cover {
    width: 500px;
    height: 500px;
  }

  .ContextBox {
    flex-wrap: wrap;
  }

  .ContextBox .column1,
  .ContextBox .column2,
  .ContextBox .column3 {
    flex: 0 0 calc(33.333% - 14px);
    gap: 15px;
  }

  .ContextBox .column1 .line:nth-child(n+6),
  .ContextBox .column2 .line:nth-child(n+6) {
    display: none;
  }

  .ContextBox .column3 {
    display: flex;
  }
}



/* Pill لحالة الإصدار (في صفحة التفاصيل) */
.status-pill {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px 14px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  line-height: 1;
  color: white;
  z-index: 10;
}

/* الألوان حسب الحالة - مطابقة لما طلبت */
.status-online {
  background: var(--Main-Colors-Strawberry, #D15);
}

.status-delivery {
  background:var(--secondary);
}

.status-submitted {
  background:var(--secondary);

  opacity: 0.3;
}

.status-unknown {
  background: #9e9e9e;
  opacity: 0.7;
}

/* تحسين عند الـ hover (اختياري لكن يعطي تجربة أفضل) */
.info-bar:hover .status-pill,
.HeadLine-small:hover .status-pill {
  transform: scale(1.05);
  transition: transform 0.2s ease;
}
</style>