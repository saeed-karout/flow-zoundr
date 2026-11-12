<template>
  <main>
    <!-- الانتظار يغطّي الصفحة كلّها: التبويبات ولوحتها كانت تُرسم فارغة
         (release = null) بينما الجزء العلويّ وحده يُظهر الدوّارة. -->
    <div class="page-loading" v-if="loading">
      <div class="spinner"></div>
    </div>

    <div class="main" v-else>
      <div class="section-primary">

        <template v-if="error">
          <div class="error">errors : {{ error }}</div>
        </template>

        <template v-else-if="release">
          <div class="music-cover" :style="coverStyle"></div>

         
          <div class="HeadLine-small">
            <div class="title">{{ toTitleCase(artistName) }}</div>
            <div class="subtitle">{{ toTitleCase(release.title || '—') }}</div>
            <div class="info-bar">
              <div class="status-pill" :class="getReleasePillClass(release.release_status)">
                {{ toTitleCase(getReleasePillLabel(release.release_status)) }}
              </div>
              <div class="Buttons">
                <div class="buttonCom" :class="{ 'is-disabled': !isOnline }" :aria-disabled="!isOnline">Trends</div>
                <div class="buttonCom" :class="{ 'is-disabled': !isOnline }" :aria-disabled="!isOnline" @click="handleLabelcopy">Labelcopy</div>
                <div class="buttonCom" :class="{ 'is-disabled': !isOnline }" :aria-disabled="!isOnline" @click="handleTakedown">Takedown</div>
              </div>
            </div>
          </div>

          <div class="information">
            <div class="HeadLine">
              <div class="title">{{ toTitleCase(artistName) }}</div>
              <div class="subtitle">{{ toTitleCase(release.title || '—') }}</div>
              <div class="info-bar">
                <div class="status-pill" :class="getReleasePillClass(release.release_status)">
                  {{ toTitleCase(getReleasePillLabel(release.release_status)) }}
                </div>
                <div class="Buttons">
                  <router-link v-if="isOnline" to="/trends" class="buttonCom">Trends</router-link>
                  <div v-else class="buttonCom is-disabled" aria-disabled="true">Trends</div>
                  <div class="buttonCom" :class="{ 'is-disabled': !isOnline }" :aria-disabled="!isOnline" @click="handleLabelcopy">Labelcopy</div>
                  <div class="buttonCom" :class="{ 'is-disabled': !isOnline }" :aria-disabled="!isOnline" @click="handleTakedown">Takedown</div>
                </div>
              </div>
            </div>

            <div class="ContextBox">
              <div class="column1">
                <div class="line">
                  <div class="key">Label</div>
                  <div class="value">{{ toTitleCase(release.label || '—') }}</div>
                </div>
                <div class="line">
                  <div class="key">KAT.#</div>
                  <div class="value">{{ toTitleCase(release.catalog_number || '—') }}</div>
                </div>
                <div class="line">
                  <div class="key">GTIN</div>
                  <div class="value">{{ toTitleCase(release.GTIN || '—') }}</div>
                </div>
                <div class="line">
                  <div class="key">C-Line</div>
                  <div class="value">{{ toTitleCase(release.c_line_name || '—') }}</div>
                </div>
                <div class="line">
                  <div class="key">P-Line</div>
                  <div class="value">{{ toTitleCase(release.p_line_name || '—') }}</div>
                </div>
                
                <div class="line">
                  <div class="key">Jahr</div>
                  <div class="value">{{ toTitleCase(release.production_year || '—') }}</div>
                </div>
                <div class="line">
                  <div class="key">Preis</div>
                  <div class="value">{{ toTitleCase(release.release_price ? release.release_price + ' EUR' : '—') }}</div>
                </div>
              </div>

              <div class="column2">
                <div class="line">
                  <div class="key">Releaseart</div>
                  <div class="value">{{ toTitleCase(release.release_type || '—') }}</div>
                </div>
                <div class="line">
                  <div class="key">Laufzeit</div>
                  <div class="value">{{ toTitleCase(totalDuration) }}</div>
                </div>
                <div class="line">
                  <div class="key">Genre</div>
                  <div class="value">{{ toTitleCase(release.main_genre || '—') }}</div>
                </div>
                <div class="line">
                  <div class="key">Explicit Lyrics</div>
                  <div class="value">{{ toTitleCase(release.explicit ? 'Ja' : 'Nein') }}</div>
                </div>
                <div class="line">
                  <div class="key">Veröffentlichung</div>
                  <div class="value">{{ toTitleCase(formatDate(release.release_date) || '—') }}</div>
                </div>
                <div class="line">
                  <div class="key">Erstellungsdatum</div>
                  <div class="value">{{ toTitleCase(formatDate(release.created_at) || '—') }}</div>
                </div>
                <div class="line">
                  <div class="key">Audio Qualität</div>
                  <div class="value">{{ toTitleCase(release.audio_quality || '—') }}</div>
                </div>
              </div>

              <div class="column3">

                <div class="line">
                  <div class="key">Jahr</div>
                  <div class="value">{{ toTitleCase(release.production_year || '—') }}</div>
                </div>
                <div class="line">
                  <div class="key">Preis</div>
                  <div class="value">{{ toTitleCase(release.release_price ? release.release_price + ' EUR' : '—') }}</div>
                </div>

                <div class="line">
                  <div class="key">Erstellungsdatum</div>
                  <div class="value">{{ toTitleCase(release.created_at || '—') }}</div>
                </div>

                <div class="line">
                  <div class="key">Audio Qualität</div>
                  <div class="value">{{ toTitleCase(release.audio_quality || '—') }}</div>
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
          <div class="tab-panel">
            <component :is="currentTabComponent" :release="release" />
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { toTitleCase } from '@/utils/formatText';
import { formatDateDe } from '@/utils/date';
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
import router from '@/router'

const route = useRoute()

const release = ref(null)
// أزرار Trends / Labelcopy / Takedown متاحة فقط لـ release منشور (release_status: "online").
const isOnline = computed(() => String(release.value?.release_status || '').toLowerCase().trim() === 'online')
const loading = ref(true)
const error = ref(null)
const takedownLoading = ref(false)
const activeTab = ref('Titelliste')

const tabs = ['Titelliste', 'Urheber', 'Mitwirkende',  'Services', 'Gebiete']


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
  if (!status) return '—'

  const map = {
    online: 'Online',
    out_for_delivery: 'In Auslieferung',
    submitted: 'Eingereicht'
  }

  return map[status.toLowerCase().trim()] || status
}


const handleTakedown = async () => {
  if (!isOnline.value) return
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

// ========== اسم الفنّان ==========
//   artists تصل من الـ API كمصفوفة نصوص، مثل: ["Phillip Phillips"].
const artistName = computed(() => {
  const artists = release.value?.artists;
  if (Array.isArray(artists) && artists.length) {
    return artists
      .map(a => (typeof a === 'string' ? a : a?.name))
      .filter(a => a && String(a).trim() !== '')
      .join(', ') || '—';
  }
  if (typeof artists === 'string' && artists.trim() !== '') return artists;
  return '—';
});

// ========== مدة الإصدار ==========
//   الـ API لا يُرجع total_duration، لكن كل أغنية تحمل duration بالثواني،
//   فنجمعها. وإن لم تتوفر أي مدة نعرض نص الحالة الفارغة.
const totalDuration = computed(() => {
  const direct = release.value?.total_duration;
  if (direct) return direct;

  const songs = release.value?.songs || [];
  const seconds = songs.reduce((sum, song) => sum + (Number(song?.duration) || 0), 0);
  if (!seconds) return '—';

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const sec = Math.floor(seconds % 60);
  const pad = (n) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`;
});


// ========== Labelcopy: تنزيل PDF عبر blob ==========
//   GET /releases/{uuid}/labelcopy  → application/pdf
const labelcopyLoading = ref(false);

const handleLabelcopy = async () => {
  if (!isOnline.value) return;
  if (labelcopyLoading.value) return;

  const uuid = route.params.uuid;
  if (!uuid) {
    console.error('No release UUID found');
    return;
  }

  labelcopyLoading.value = true;

  try {
    const response = await apiRequest.get(`/releases/${uuid}/labelcopy`, {
      responseType: 'blob',
      headers: { Accept: 'application/pdf' }
    });

    const blob = new Blob([response.data], { type: 'application/pdf' });
    const objectUrl = URL.createObjectURL(blob);

    // اسم الملف: من Content-Disposition إن وُجد، وإلا من عنوان الإصدار
    const safeTitle = String(release.value?.title || 'release').replace(/[\/:*?"<>|]/g, '_');
    let fileName = `Labelcopy - ${safeTitle}.pdf`;

    const disposition = response.headers?.['content-disposition'];
    if (disposition) {
      const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(disposition);
      if (match?.[1]) fileName = decodeURIComponent(match[1]);
    }

    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // تأخير بسيط قبل التحرير لضمان بدء التنزيل في كل المتصفحات
    setTimeout(() => URL.revokeObjectURL(objectUrl), 500);
  } catch (err) {
    // عند responseType: 'blob' يأتي جسم الخطأ (مثل 404) كـ Blob أيضاً
    if (err?.response?.status === 404) {
      console.error('Labelcopy nicht gefunden für Release:', uuid);
    } else {
      console.error('❌ [Labelcopy] فشل التنزيل:', err);
    }
  } finally {
    labelcopyLoading.value = false;
  }
};

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

const formatDate = (dateStr) => formatDateDe(dateStr)

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

.error {
  padding: 60px;
  text-align: center;
  font-size: 1.3rem;
  color: #aaa;
}

/* أيقونة انتظار بدل نصّ التحميل — نفس دوّارة الكاتالوج، في وسط الصفحة. */
.page-loading {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-loading .spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-top-color: var(--Strawberry, #D15);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
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

/* معطّل ما دام release_status ليس online: بهتان، ومؤشّر not-allowed، ولا تلوين hover.
   (بلا pointer-events: none حتى يظهر المؤشّر — النقر محجوب في الدوالّ.) */
.Buttons .buttonCom.is-disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.Buttons .buttonCom.is-disabled:hover {
  background-color: var(--secondary);
  cursor: not-allowed;
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
  align-items: stretch;
  gap: 20px;
  flex: 1 1 0;
  align-self: stretch;
  /* مهم للسماح للأبناء بالانكماش داخل الفليكس حتى يعمل السكرول بدل تمدد المحتوى */
  min-height: 0;
  /* بدون overflow:hidden هنا — وإلا تُقصّ زوايا أزرار التبويبات (.Tabs).
     التمرير والقصّ يحدثان داخل .tab-panel فقط. */
}

.Tab-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  flex: 1 1 0;
  height: 100%;
  min-height: 0;
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

/* لوحة التبويب: تملأ المساحة المتبقية بعد أزرار التبويبات وتُحدّد ارتفاعاً ثابتاً
   (عبر flex) كي يعمل السكرول داخلها. سُمّيت باسم فريد لتجنّب التصادم مع class
   "Content-Box" المستخدَم أيضاً كجذر لكل مكوّن تبويب. */
.tab-panel {
  flex: 1 1 0;
  min-height: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* توحيد كل التبويبات: جذر كل تبويب (يحمل class="Content-Box") يملأ اللوحة بنفس
   الارتفاع ويمرّر عند تجاوز المحتوى. التحديد (0,2,0) أعلى من أنماط التبويب
   الداخلية (0,1,0) فيتغلّب عليها مهما كان ترتيب التحميل. */
.tab-panel > :deep(.Content-Box) {
  flex: 1 1 auto;
  width: 100%;
  height: auto;
  min-height: 0;
  max-height: 100%;
  overflow: auto;
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.tab-panel > :deep(.Content-Box)::-webkit-scrollbar {
  display: none;
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
  transition: transform 0.2s ease;
}
</style>