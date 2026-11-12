<template>
  <!-- ✅ فقط إذا كنا في الخطوة 3 نعرض المحتوى -->
  <div
    v-if="props.currentStep === 3 && isMounted"
    class="component-container"
    :class="{ 'songs-main-view': currentView === 'main' && !forceInfosView && !isInSubLayout }"
    :key="props.releaseUuid"
  >
    <!-- عرض شاشة تحميل مؤقتة -->
    <div v-if="isInitialLoading" class="loading-container">
      <!-- <div class="spinner"></div> -->
    </div>

    <template v-else>
      <div v-if="currentView === 'main' && !forceInfosView && !isInSubLayout" class="content">
        
        <div class="option">
          <div class="card-songs" >
            <div class="image-overlay">
              <div class="Form">
                <div class="btn-primary1" @click.stop="handleNext(0)">
                  <div class="p">Weiter</div>
                </div>
              </div>
            </div>
            <div class="logo"></div>
          </div>
          <div class="description">
           WAV Audio in Stereo. Min. 44,1 kHz & 16 Bit | max. 192 kHz & 24 Bit. 50 % Deiner Tracks müssen länger als 45 Sek. sein. Keine abrupten Enden, kein Rauschen. Alle Tracks müssen im gleichen Format sein.

          </div>
        </div>

        <div class="option" @mouseenter="showFormField(1)" @mouseleave="hideFormField(1)">
          <div class="card-songs2">
            <div class="image-overlay" :class="{ 'no-overlay': formFields[1].email }">
              <div class="Form">
                <div class="Form-filed" :class="{ visible: formFields[1].visible || formFields[1].email }">
                  <input v-model="formFields[1].email" type="email" class="email-input"
                    :class="{ 'has-text': formFields[1].email }" placeholder="E-Mail Mastering Studio"
                    @input="validateEmail(1)" />
                  <img v-if="formFields[1].isValid" src="/icon/y.png" class="checkmark" alt="checkmark" />
                </div>
                <div class="btn-primary" :class="{ active: formFields[1].isValid }" @click.stop="handleNext(1)">
                  <div class="p">Weiter</div>
                </div>
              </div>
            </div>
            <div class="logo" :class="{ shifted: formFields[1].visible || formFields[1].email }"></div>
          </div>
          <div class="description">
            Höchste Qualität durch zertifizierte Mastering Engineers. Dein Engineer besitzt eine bei Apple verifizierte E-Mail-Adresse. Möchtest Du ADM erhalten? Wir sind ADM lizenziert, einfach bei uns melden. 
          </div>
        </div>

        <div class="option" @mouseenter="showFormField(2)" @mouseleave="hideFormField(2)">
          <div class="card-songs3">
            <div class="image-overlay" :class="{ 'no-overlay': formFields[2].email }">
              <div class="Form">
                <div class="Form-filed" :class="{ visible: formFields[2].visible || formFields[2].email }">
                  <input v-model="formFields[2].email" type="email" class="email-input"
                    :class="{ 'has-text': formFields[2].email }" placeholder="E-Mail Mastering Studio"
                    @input="validateEmail(2)" />
                  <img v-if="formFields[2].isValid" src="/icon/y.png" class="checkmark" alt="checkmark" />
                </div>
                <div class="btn-primary" :class="{ active: formFields[2].isValid }" @click.stop="handleNext(2)">
                  <div class="p">Weiter</div>
                </div>
              </div>
            </div>
            <div class="logo" :class="{ shifted: formFields[2].visible || formFields[2].email }"></div>
          </div>
          <div class="description">
           Spatial Audio als Dolby Atmos oder Sony 360 RA Master. Es muss zusätzlich auch immer ein Lossless Master pro Track hochgeladen werden. Die E-Mail-Adresse des Mastering Engineers wird überprüft. 
          </div>
        </div>

      </div>

      <!-- FirstSection: قائمة الأغاني + إضافة/تعديل/حذف -->
      <FirstSection 
        ref="firstSectionRef"
        v-if="currentView === 'firstSection'" 
        :sectionTitle="getSectionTitleForView('firstSection')"
        :selectedCardIndex="selectedCardIndex" 
        :tracks="tracks" 
        
        @delete-track="handleDeleteTrack"
        :release-uuid="props.releaseUuid" 
        :audio-quality="selectedSongType || 'lossless'"
        :release-title="releaseStore.metasData?.title || draftRelease?.value?.title || ''"
        :release-artists="releaseStore.metasData?.artists || draftRelease?.value?.artists || []"
       @next="handleNextFromFirstSection"
        @add-track="addNewSong"
        @edit-track="editSong"
        @reorder-tracks="handleReorderTracks"
        @back="handleBackClick"
        @update:topLineImage="updateTopLineImage"
      />

      <!-- ✅ Infos مع استقبال update-tab-completion -->
      <Infos 
        v-else-if="(isInSubLayout || forceInfosView) && currentView === 'infos'" 
        :active-tab="activeTab" 
        :current-song="currentSong" 
        :release-subtitle="releaseStore.metasData?.subtitle || draftRelease?.value?.subtitle || ''"
        :releaseCLine="releaseStore.metasData?.cLineName || ''"
        :releasePLine="releaseStore.metasData?.pLineName || ''"
        :releaseProductionYear="String(releaseStore.metasData?.productionYear || '')"
        @save-song="handleSaveSong" 
        @back="handleBackFromInfos"
        @next="$emit('next')" 
        :release-artists="releaseArtistsList"
        @back-to-tracklist="handleBackToTracklist"
        @enter-sub-layout="handleEnterSubLayout" 
        @exit-sub-layout="handleExitSubLayout" 
        @refresh-songs="fetchSongs"
        @refresh-current-song="refreshCurrentSong"
        :section-title="getSectionTitleForView('infos')"
        @update-tab="handleTabUpdate"
        @update:form-data="handleFormDataUpdateFromChild"
        @openVideoPopup="handleOpenVideoPopup"
        @update-tab-completion="handleTabCompletionUpdate"
      />

    </template>

   
  </div>
  
  <!-- ✅ عرض فارغ إذا لم نكن في الخطوة 3 -->
  <div v-else class="component-container-empty"></div>
</template>

<script setup>
import { ref, reactive, watch, onMounted, onUnmounted, inject, nextTick, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import apiRequest from '@/lib/apiRequest';
import FirstSection from './Upload2/FirstSection.vue';
import Infos from './Upload2/Infos1.vue';
import { useReleaseStore } from '@/stores/release';
import { computeTabCompletion, isSongComplete as isSongCompleteShared, isInstrumentalSong } from '@/utils/songCompletion';

import losslessIcon from '@/assets/icons/top-line/lossless.png';
import digitalMasterIcon from '@/assets/icons/top-line/digital-masters.png';
import admLosslessIcon from '@/assets/icons/top-line/ADM.png';

const route = useRoute();
const router = useRouter();
const releaseStore = useReleaseStore();
const isMounted = ref(false);

const props = defineProps({
  currentStep: Number,
  steps: Array,
  sectionTitle: [String, Object],
  activeTab: String,
  forceInfosView: Boolean,
  releaseUuid: { type: String, required: true },
  topLineImage: { type: String, default: null }
});

// ✅ تعريف emit مع update-tab-completion
const emit = defineEmits([
  'next', 
  'update:currentView', 
  'back', 
  'update:topLineImage',
  'enter-sub-layout', 
  'exit-sub-layout', 
  'change-audio-quality',
  'update-tab', 
  'update:form-data', 
  'openVideoPopup',
  'update-tab-completion'
]);

// ========== 🔥 متغيرات لمنع الحلقات اللانهائية ==========
const isPreventingStepUpdate = ref(false);
const isSaving = ref(false); // ✅ متغير لمنع الحفظ المتزامن
let lastSavedPayload = null; // ✅ لمنع الحفظ المتكرر لنفس البيانات
// ✅ طابور الحفظ المتزامن: عند وصول حفظ (من تاب آخر) أثناء حفظ قيد التنفيذ، لا نتخطّاه بل
//   نُجدوله ليُعالَج تسلسلياً بعد الانتهاء — فلا تُفقَد بيانات تاب عند التبديل السريع.
const pendingSaves = [];

// ========== tabCompletion المحلي ==========
const tabCompletionData = ref({
  infos: false,
  urheber: false,
  mitwirkende: false,
  deals: false,
  'pre-release': false
});

// ✅ الكاتب الوحيد لـ tabCompletion: بيانات الأغنية عبر @/utils/songCompletion — نفس
//    المصدر الذي تستخدمه FirstSection و release.js. كانت مكوّنات التبويبات تكتب رأيها
//    المبني على حقولها الحيّة (وفيها قيم مُعبّأة تلقائياً مثل Verlag/C-Line، وقيم قديمة
//    لم تُزامَن بعد مسحها على الخادم)، فتتعارض مع بيانات الأغنية وتتذبذب العلامة
//    بين true و false على نفس الأغنية.
const syncTabCompletionFromSong = () => {
  const song = currentSong.value
    || (tracks.value || []).find(s => s.uuid === releaseStore.songUuid)
    || null;

  const completion = computeTabCompletion(song);
  if (!completion) return;

  // ✅ لا نكتب فوق التبويب النشط: قيمته الحيّة يملكها مكوّنه، وبيانات الأغنية
  //    تتأخّر حتى يُدمَج ردّ الحفظ (وقد لا يقع حفظ أصلاً — مثل رفع الملف الصوتي عبر
  //    FormData حيث يعود مسار الـ JSON بـ «لا توجد تغييرات»).
  //
  //    بدون هذا الاستثناء تنشأ حلقة: التجاوز الحيّ يغيّر المخزّن ← يوقظ المراقب
  //    ← updateSongsCompleteStatus ← هذه الدالة ← تدهس القيمة الحيّة وتعيدها false.
  //    النتيجة: كاتبان لا يتداخلان — النشط من مكوّنه، والبقية من بيانات الأغنية.
  const activeTab = props.activeTab;
  if (activeTab && Object.prototype.hasOwnProperty.call(completion, activeTab)) {
    delete completion[activeTab];
  }

  releaseStore.updateTabCompletion(completion);
};

const handleTabCompletionUpdate = (completion) => {
  // ✅ الأساس دائماً من بيانات الأغنية (المصدر الموحّد).
  syncTabCompletionFromSong();

  // ✅ ثم نسمح للتبويب النشط وحده بتحديث قيمته الحيّة فوراً. بيانات الأغنية
  //    تتأخّر حتى ينتهي الحفظ ويُدمَج الردّ، وقد لا يحدث حفظ أصلاً («لا توجد تغييرات»
  //    بعد رفع الملف الصوتي مثلاً)، فكانت علامة INFOS لا تظهر إلا عند الانتقال إلى
  //    تبويب آخر (لأن التبديل يفرض حفظاً ثم دمجاً).
  //
  //    القيد على التبويب النشط مقصود: مكوّنات التبويبات تبقى حيّة داخل keep-alive
  //    وتبثّ رأيها حتى وهي مُعطّلة؛ وقبول رأي الجميع هو ما كان يُحدث تذبذب العلامة
  //    بين true و false على نفس الأغنية.
  const tab = props.activeTab;
  if (tab && completion && typeof completion === 'object' && typeof completion[tab] === 'boolean') {
    releaseStore.updateTabCompletion({ [tab]: completion[tab] });
  }
};

// ========== معالج next من FirstSection ==========
const handleNextFromFirstSection = () => {
  console.log('📌 [Upload2Component] handleNextFromFirstSection called');
  // ✅ إرسال الحدث إلى الأعلى (UploadPNG)
  emit('next');
  console.log('📌 [Upload2Component] emit("next") sent');
};

const scrollSongsToTop = () => {
  nextTick(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  });
};

const handleTabUpdate = (tabId) => {
  console.log('📌 [Upload2Component] Tab updated to:', tabId);
  emit('update-tab', tabId);
};

const handleFormDataUpdateFromChild = (updates) => {
  console.log('📌 [Upload2Component] Received update:form-data from child:', updates);
  emit('update:form-data', updates);
};

const firstSectionRef = ref(null);
const isAddingFromFirstSection = ref(false);
const currentView = ref('main');
const selectedCardIndex = ref(null);
const forceInfosView = ref(false);
const isInSubLayout = ref(false);
const tracks = ref([]);
const currentSong = ref(null);
const isFetchingSongs = ref(false);
const isUserSelectedType = ref(false);
const audioQuality = ref(null); 
const selectedSongType = ref('');
const showCardError = ref(false);
let errorTimeout = null;
const isInitialLoading = ref(true); 
const isNavigatingBack = ref(false);
let isFirstMount = true;
const draftRelease = inject('draftRelease', null);

const audioQualityImageMap = {
  'lossless': losslessIcon,
  'digital_master': digitalMasterIcon,
  'dolby_atmos': admLosslessIcon
};

watch(() => draftRelease?.value?.audio_quality, (quality) => {
  if (quality && !selectedSongType.value) {
    selectedSongType.value = quality;
    audioQuality.value = quality;
    console.log('📌 [draftRelease] تعيين selectedSongType من audio_quality:', quality);
  }
}, { immediate: true });

const handleOpenVideoPopup = (field) => {
  console.log('🎬 [Upload2Component] استقبال openVideoPopup من Infos للحقل:', field);
  emit('openVideoPopup', field);
};

// ========== 🔥 دالة استخراج اسم C-Line فقط بدون السنة ==========
const getReleaseCLineName = () => {
  const cLineName = releaseStore.metasData?.cLineName || '';
  const cLineYear = releaseStore.metasData?.cLineYear || '';
  
  if (cLineName && cLineName.trim() !== '') {
    return cLineName.trim();
  }
  
  const fullCLine = releaseStore.metasData?.cLineName || '';
  if (!fullCLine) return '';
  
  const match = fullCLine.match(/^\d{4}\s+(.+)$/);
  if (match) {
    return match[1].trim();
  }
  
  return fullCLine.trim();
};

const getSectionTitleForView = (view) => {
  let releaseTitle = '';
  
  console.log('📌 [getSectionTitleForView] releaseStore.metasData?.title:', releaseStore.metasData?.title);
  console.log('📌 [getSectionTitleForView] draftRelease?.value?.title:', draftRelease?.value?.title);
  
  if (releaseStore.metasData?.title && releaseStore.metasData.title.trim() !== '') {
    releaseTitle = releaseStore.metasData.title;
    console.log('📌 [getSectionTitleForView] استخدام title من metasData:', releaseTitle);
  } 
  else if (draftRelease?.value?.title && draftRelease.value.title.trim() !== '') {
    releaseTitle = draftRelease.value.title;
    console.log('📌 [getSectionTitleForView] استخدام title من draftRelease:', releaseTitle);
  } 
  else if (releaseStore.releaseType) {
    const typeMap = {
      'single': 'DEINE NEUE SINGLE',
      'extended player': 'DEINE NEUE EP',
      'album': 'DEIN NEUES ALBUM'
    };
    releaseTitle = typeMap[releaseStore.releaseType] || 'DEINE NEUE SINGLE';
    console.log('📌 [getSectionTitleForView] استخدام title من releaseType:', releaseTitle);
  } 
  else {
    releaseTitle = 'DEINE NEUE SINGLE';
    console.log('📌 [getSectionTitleForView] استخدام title افتراضي:', releaseTitle);
  }
  
  if (view === 'firstSection') {
    const result = `${releaseTitle} – Songs`;
    console.log('📌 [getSectionTitleForView] firstSection result:', result);
    return result;
  }
  
  if (view === 'infos') {
    const songNumber = releaseStore.currentSongNumber || '01';
    const songTitle = releaseStore.currentSongTitle || '';
    
    if (songNumber && songTitle) {
      return `${songNumber} ${songTitle}`;
    } else if (songTitle) {
      return songTitle;
    } else {
      return releaseTitle;
    }
  }
  
  return releaseTitle;
};

const formFields = reactive({
  1: { visible: false, email: '', isValid: false },
  2: { visible: false, email: '', isValid: false },
});

const audioQualityMap = {
  0: 'lossless',
  1: 'digital_master',
  2: 'dolby_atmos'
};

const logState = () => {
  console.group('📊 Upload2Component State');
  console.log('currentView:', currentView.value);
  console.log('isInSubLayout:', isInSubLayout.value);
  console.log('forceInfosView:', forceInfosView.value);
  console.log('selectedCardIndex:', selectedCardIndex.value);
  console.log('selectedSongType:', selectedSongType.value);
  console.log('tracks count:', tracks.value.length);
  console.log('props.currentStep:', props.currentStep);
  console.log('props.topLineImage:', props.topLineImage);
  console.groupEnd();
};

const releaseArtistsList = computed(() => {
  if (draftRelease?.value?.artists && draftRelease.value.artists.length > 0) {
    console.log('📌 Upload2: استخدام artists من draftRelease:', draftRelease.value.artists);
    return draftRelease.value.artists;
  }
  
  if (releaseStore.metasData?.artists && releaseStore.metasData.artists.length > 0) {
    console.log('📌 Upload2: استخدام artists من releaseStore:', releaseStore.metasData.artists);
    return releaseStore.metasData.artists;
  }
  
  console.log('⚠️ Upload2: لا يوجد artists متاح');
  return [];
});
// ✅ وكيل للمصدر المشترك @/utils/songCompletion — نفس ما يستخدمه FirstSection.isTrackComplete
//    و tabs.vue و Infos1 و stores/release.js، فلا تختلف نتيجة الاكتمال بين المكوّنات.
const isSongComplete = (song) => {
  if (!song) return false;

  const completion = computeTabCompletion(song);
  const complete = isSongCompleteShared(song);

  console.log(`  📌 tabs:`, completion);
  console.log(`  📌 isInstrumental: ${isInstrumentalSong(song)}`);
  console.log(`  ✅ isComplete: ${complete}`);

  return complete;
};

// ========== 🔥 دالة لإعادة تحديد الخطوة بعد اكتمال الأغاني ==========
// في Upload2Component.vue، دالة recheckStepAfterSongsComplete

// في Upload2Component.vue، دالة recheckStepAfterSongsComplete

const recheckStepAfterSongsComplete = () => {
    const releaseStore = useReleaseStore();
    const currentReleaseId = releaseStore.currentReleaseId || props.releaseUuid;
    
    if (!currentReleaseId || !releaseStore.draftRelease) {
        console.log('⏭️ [Upload2Component] لا يوجد Release أو draftRelease، تخطي إعادة تحديد الخطوة');
        return;
    }
    
    if (releaseStore.isSongsComplete) {
        console.log('🔄 [Upload2Component] الأغاني مكتملة، إعادة تحديد الخطوة...');

        // updateCurrentStep = false: only READ the suggested step. We decide below
        // whether to actually move, so this recheck can't mutate currentStep out
        // from under a user who is inside the Songs step.
        const targetStep = releaseStore.determineStepFromRelease(
            releaseStore.draftRelease,
            false,
            true,
            false
        );

        console.log(`📌 [Upload2Component] الخطوة المقترحة: ${targetStep}`);

        // ✅ إذا كان المستخدم داخل خطوة Songs (قائمة الأغاني firstSection أو أثناء
        //    تعديل أغنية infos/sub-layout)، نبقيه في Songs ولا ننقله إلى Publish.
        //    بدون فحص infos/isInSubLayout كان النقر على Edit يقذف المستخدم إلى Publish.
        if (currentView.value === 'firstSection' || currentView.value === 'infos' || isInSubLayout.value) {
            console.log('⏸️ [Upload2Component] المستخدم داخل Songs، البقاء في الخطوة 3');
            // ✅ نضمن أن currentStep تبقى 3
            releaseStore.setCurrentStep(3);

            // ملاحظة: لا نضبط isPublishComplete هنا. اكتمال Songs لا يعني اكتمال Publish —
            //   الأخير يُضبط حصرياً من Upload4Component بعد تعبئة الفورم والنقر على الموافقة.

            return;
        }
        
        // ✅ لا نُقدّم المستخدم تلقائياً للأمام (إلى Shops/Publish). الانتقال إلى Shops
        //    يجب أن يكون بنقر المستخدم على «Weiter zu Shops» فقط. لذا لا ننتقل إلا إذا
        //    كانت الخطوة المقترحة *ليست متقدّمة* عن الخطوة الحالية (أي مجرّد تأكيد لا دفع).
        //    كان اكتمال الأغاني عند الرجوع إلى FirstSection يقذف المستخدم إلى Shops.
        const currentStepNow = releaseStore.currentStep;
        if ((targetStep === 4 || targetStep === 5) && targetStep <= currentStepNow) {
            console.log(`🔄 [Upload2Component] تأكيد الخطوة ${targetStep} (غير متقدّمة)`);
            releaseStore.setCurrentStep(targetStep);
            
            window.dispatchEvent(new CustomEvent('store-updated', {
                detail: { 
                    type: 'step-changed',
                    step: targetStep,
                    timestamp: Date.now()
                }
            }));
            
            window.dispatchEvent(new CustomEvent('step-updated', {
                detail: { 
                    step: targetStep,
                    timestamp: Date.now()
                }
            }));
        }
    }
};

// ========== تعديل دالة updateSongsCompleteStatus ==========
const updateSongsCompleteStatus = () => {
    const songs = tracks.value || [];

    console.log('🔍 [updateSongsCompleteStatus] بدء التحقق من', songs.length, 'أغنية');

    // ✅ تحديث حالة رفع الصوت
    releaseStore.setHasUploadedAudio(
        songs.some(s => s.song_file && s.song_file !== null && s.song_file !== '')
    );

    if (songs.length === 0) {
        // While songs are still being fetched, `tracks` is momentarily empty.
        // Don't flip the step to "incomplete" here or the sidebar checkmark
        // flickers to a dot and back. The finally-block re-check below settles
        // the real state (genuinely-zero songs) once loading is done.
        if (isFetchingSongs.value) {
            console.log('⏳ [updateSongsCompleteStatus] جلب قيد التقدم، تخطي (تفادي الوميض)');
            return;
        }
        releaseStore.setSongsComplete(false);
        console.log('📌 حالة Songs: لا توجد أغاني ❌');
        return;
    }
    
    // ✅ نُزامن علامات التبويبات من بيانات الأغنية في كل مرّة تُعاد فيها الحسبة
    //    (بعد كل حفظ وعند كل تغيّر في tracks) كي تبقى مطابقة لقائمة FirstSection.
    syncTabCompletionFromSong();

    const allSongsComplete = songs.every(song => {
        const result = isSongComplete(song);
        console.log(`  ${result ? '✅' : '❌'} أغنية: ${song.title || 'Untitled'}`);
        return result;
    });
    
    if (releaseStore.isSongsComplete !== allSongsComplete) {
        releaseStore.setSongsComplete(allSongsComplete);
        console.log(`📌 حالة Songs النهائية: ${allSongsComplete ? 'مكتملة ✅' : 'غير مكتملة ❌'}`);
        
        // ✅ 🔥 إذا أصبحت الأغاني مكتملة، نعيد تحديد الخطوة
        if (allSongsComplete) {
            console.log('🔄 [Upload2Component] أصبحت الأغاني مكتملة، إعادة تحديد الخطوة...');
            
            // ✅ ننتظر قليلاً حتى يتم تحديث الـ Store
            setTimeout(() => {
                recheckStepAfterSongsComplete();
            }, 300);
        }
    } else {
        console.log(`📌 حالة Songs unchanged: ${allSongsComplete ? 'مكتملة ✅' : 'غير مكتملة ❌'}`);
    }
    
    const eventDetail = { 
        isComplete: allSongsComplete,
        songs: songs,
        songCount: songs.length,
        timestamp: Date.now()
    };
    
    window.dispatchEvent(new CustomEvent('songs-complete-status', {
        detail: eventDetail
    }));
    
    window.dispatchEvent(new CustomEvent('store-updated', {
        detail: { 
            type: 'songs-complete',
            value: allSongsComplete,
            timestamp: Date.now()
        }
    }));
};

const updateTopLineImage = (imagePath) => {
  if (imagePath) {
    emit('update:topLineImage', imagePath);
  } else if (selectedSongType.value && audioQualityImageMap[selectedSongType.value]) {
    emit('update:topLineImage', audioQualityImageMap[selectedSongType.value]);
  }
};

const handleChangeAudioQualityFromParent = () => {
  console.log('📢 [Upload2Component] استقبال change-audio-quality من المكون الأب');

  currentView.value = 'main';
  forceInfosView.value = false;
  isInSubLayout.value = false;
  currentSong.value = null;
  selectedCardIndex.value = null;
  selectedSongType.value = '';
  audioQuality.value = null;
  isUserSelectedType.value = false;
  updateAudioQuality(null);

  emit('update:topLineImage', null);
  emit('exit-sub-layout');
  emit('update:currentView', 'main');
  
  console.log('✅ [Upload2Component] تم العودة إلى شاشة الكروت (main)');
  logState();
};

const setTracksFromParent = (songs) => {
  console.log('📦 [Upload2Component] استلام أغاني من المكون الأب:', songs?.length || 0);
  
  if (!songs || songs.length === 0) {
    console.warn('⚠️ [Upload2Component] لا توجد أغاني مستلمة');
    tracks.value = [];
    releaseStore.setSongsComplete(false);
    return;
  }
  
  tracks.value = songs;
  console.log('✅ [Upload2Component] تم تحديث tracks:', tracks.value.length);
  
  updateSongsCompleteStatus();
  
  if (tracks.value.length > 0 && !selectedSongType.value) {
    const releaseAudioQuality = draftRelease?.value?.audio_quality || audioQuality.value;
    if (releaseAudioQuality) {
      selectedSongType.value = releaseAudioQuality;
      console.log('📌 تعيين selectedSongType من audio_quality:', selectedSongType.value);
      updateTopLineImage();
    }
  }
};

const changeAudioQuality = () => {
  console.log('🔄 [Upload2Component] بدء تغيير نوع الأغنية');

  // ✅ منع تغيير نوع الصوت بعد رفع ملف صوتي لأي أغنية
  if (releaseStore.hasUploadedAudio) {
    console.warn('⚠️ [Upload2Component] لا يمكن تغيير نوع الصوت بعد رفع ملف صوتي');
    return;
  }

  try {
    const currentQuery = { ...route.query };
    delete currentQuery.song;
    router.replace({ query: currentQuery });
    console.log('🔗 تم مسح songUuid من URL');
  } catch (error) {
    console.error('❌ فشل مسح URL:', error);
  }
  
  releaseStore.clearSongUuid();
  console.log('🗑️ تم مسح songUuid من store');
  
  currentView.value = 'main';
  forceInfosView.value = false;
  isInSubLayout.value = false;
  currentSong.value = null;
  selectedCardIndex.value = null;
  selectedSongType.value = '';
  audioQuality.value = null;
  isUserSelectedType.value = false;
  updateAudioQuality(null);

  emit('update:topLineImage', null);
  emit('exit-sub-layout');
  emit('change-audio-quality');

  window.dispatchEvent(new CustomEvent('change-audio-quality'));

  console.log('✅ [Upload2Component] تم العودة إلى شاشة اختيار نوع الأغنية (main)');
  logState();
};

const handleTopLineImageClick = () => {
  console.log('🖱️ [Upload2Component] تم النقر على الصورة العلوية');
  console.log('currentView قبل التغيير:', currentView.value);
  
  if (currentView.value === 'firstSection' || currentView.value === 'infos') {
    if (confirm('Möchten Sie den Songtyp ändern? Alle nicht gespeicherten Änderungen gehen verloren.')) {
      changeAudioQuality();
    }
  }
};

const handleDeleteTrack = (songUuid) => {
    console.log('🔄 Upload2Component: استقبال حدث delete-track:', songUuid);
    
    tracks.value = tracks.value.filter(s => s.uuid !== songUuid);
    console.log('📊 تم تحديث القائمة المحلية، عدد الأغاني:', tracks.value.length);
    
    updateSongsCompleteStatus();
    
    try {
        const savedState = localStorage.getItem('upload2_state');
        if (savedState) {
            const parsed = JSON.parse(savedState);
            if (parsed.tracks) {
                parsed.tracks = parsed.tracks.filter(s => s.uuid !== songUuid);
                localStorage.setItem('upload2_state', JSON.stringify(parsed));
                console.log('💾 تم تحديث localStorage');
            }
        }
    } catch (e) {
        console.warn('⚠️ Could not update localStorage:', e);
    }
    
    if (currentSong.value?.uuid === songUuid) {
        currentSong.value = null;
    }
};

const handleReorderTracks = (orderedUuids) => {
  const orderMap = {};
  orderedUuids.forEach((uuid, i) => { orderMap[uuid] = i; });
  tracks.value = [...tracks.value].sort((a, b) =>
    (orderMap[a.uuid] ?? 9999) - (orderMap[b.uuid] ?? 9999)
  );
  tracks.value.forEach((t, i) => { t.sort_order = i + 1; });
};

const showTemporaryError = () => {
  showCardError.value = true;
  if (errorTimeout) clearTimeout(errorTimeout);
  errorTimeout = setTimeout(() => {
    showCardError.value = false;
  }, 3000);
};

const clearSongUuidFromUrl = () => {
  try {
    const currentQuery = { ...route.query };
    delete currentQuery.song;
    
    const releaseId = props.releaseUuid || releaseStore.currentReleaseId;
    
    if (releaseId) {
      router.replace({
        path: `/releases/${releaseId}/edit`,
        query: currentQuery
      });
      console.log('🔗 تم مسح songUuid من URL، التوجيه إلى:', `/releases/${releaseId}/edit`);
    } else {
      router.replace({ query: currentQuery });
      console.log('🔗 تم مسح songUuid من URL');
    }
  } catch (error) {
    console.error('❌ فشل مسح URL:', error);
  }
};

const handleBackToFirstSection = () => {
    if (isNavigatingBack.value) {
        console.log('⚠️ [Upload2Component] تنفيذ الرجوع قيد التشغيل بالفعل، تخطي');
        return;
    }
    
    if (currentView.value === 'firstSection') {
        console.log('⚠️ [Upload2Component] بالفعل في firstSection، تخطي');
        return;
    }
    
    console.log('🔙 [Upload2Component] تنفيذ handleBackToFirstSection - العودة إلى FirstSection');
    
    isNavigatingBack.value = true;
    
    const { song, forceView, ...restQuery } = route.query;
    router.replace({ 
        path: route.path, 
        query: { ...restQuery, step: 3 } 
    }).catch(() => {});
    
    releaseStore.songUuid = null;
    
    const releaseAudioQuality = draftRelease?.value?.audio_quality || audioQuality.value;
    if (releaseAudioQuality && !selectedSongType.value) {
        selectedSongType.value = releaseAudioQuality;
        console.log('📌 [handleBackToFirstSection] تعيين selectedSongType من audio_quality:', selectedSongType.value);
    }

    currentView.value = 'firstSection';
    isInSubLayout.value = false;
    forceInfosView.value = false;
    currentSong.value = null;
    
    emit('update:currentView', currentView.value);
    updateTopLineImage();
    emit('exit-sub-layout');
    scrollSongsToTop();
    logState();
    
    setTimeout(() => {
        isNavigatingBack.value = false;
    }, 500);
};

const fetchSongs = async () => {
  if (isFetchingSongs.value) {
    console.log('⏳ [fetchSongs] جاري جلب الأغاني بالفعل، تخطي');
    return;
  }
  
  isFetchingSongs.value = true;
  
  try {
    if (!isMounted.value) {
      console.warn('⚠️ fetchSongs: المكون تم تدميره، تخطي');
      return;
    }

    if (!props.releaseUuid) {
      console.error('❌ fetchSongs: لا يوجد releaseUuid');
      return;
    }

    console.log('📡 جلب الأغاني لـ release:', props.releaseUuid);
    
    const res = await apiRequest.get(`/releases/${props.releaseUuid}/songs`);
    console.log('📥 Response from /songs:', res);
    
    let fetchedTracks = [];
    
    if (res.data && res.data.data) {
      fetchedTracks = res.data.data;
      console.log('✅ تم جلب الأغاني من data.data:', fetchedTracks);
    } else if (res.data && Array.isArray(res.data)) {
      fetchedTracks = res.data;
      console.log('✅ تم جلب الأغاني من data (array):', fetchedTracks);
    } else {
      console.warn('⚠️ تنسيق غير متوقع للبيانات:', res.data);
    }
    
    if (fetchedTracks.length > 0) {
      tracks.value = fetchedTracks;
      console.log('📌 تم تحديث tracks:', tracks.value.length, 'أغنية');
    } else {
      console.log('📌 لا توجد أغاني في الاستجابة');
      tracks.value = [];
    }
    
    updateSongsCompleteStatus();
    
  } catch (err) {
    console.error('❌ فشل جلب الأغاني:', err);
    
    try {
      console.log('🔄 محاولة جلب الأغاني من الـ Release الرئيسية...');
      const releaseRes = await apiRequest.get(`/releases/${props.releaseUuid}`);
      const releaseData = releaseRes.data?.data;
      
      if (releaseData && releaseData.songs && releaseData.songs.length > 0) {
        console.log('✅ تم جلب الأغاني من الـ Release الرئيسية:', releaseData.songs.length);
        tracks.value = releaseData.songs;
        updateSongsCompleteStatus();
      }
    } catch (releaseErr) {
      console.error('❌ فشل جلب الأغاني من الـ Release الرئيسية:', releaseErr);
    }
  } finally {
    isFetchingSongs.value = false;
    // Now that loading is truly finished, evaluate completeness once more so a
    // genuinely-empty release is correctly marked incomplete (the in-flight
    // guard above skips that case to avoid the flicker).
    updateSongsCompleteStatus();
  }
};

// ✅ يحلّ قيمة audio_quality للـ Release بشكل موثوق لتقرير عرض كروت الجودة (main) أم
//    قائمة الأغاني (firstSection). المصدر الموثوق هو releaseStore.draftRelease لأن الأب
//    (Parent.vue) يُعيد جلب الـ Release من الـ API عند كل mount فيكون طازجاً — بما في
//    ذلك عندما يتراجع المستخدم فتصبح القيمة null. لا نعتمد على selectedSongType /
//    audioQuality لأنها حالة واجهة قد تبقى قديمة (lossless) فتقذف المستخدم خطأً إلى
//    firstSection بعد التراجع. نعيد null صراحةً عند غياب الجودة.
const resolveReleaseAudioQuality = async () => {
  // 1) المصدر الموثوق الطازج: draftRelease في الـ store (يحمل مفتاح audio_quality دائماً).
  if (releaseStore.draftRelease && 'audio_quality' in releaseStore.draftRelease) {
    return releaseStore.draftRelease.audio_quality || null;
  }

  // 2) الـ draftRelease المحقون (injected) إن كان يحمل المفتاح صراحةً.
  const injected = draftRelease?.value;
  if (injected && 'audio_quality' in injected) {
    return injected.audio_quality || null;
  }

  // 3) احتياطي أخير: اسأل الـ API مباشرةً وخزّن النتيجة في الـ store.
  if (!props.releaseUuid) return null;
  try {
    const res = await apiRequest.get(`/releases/${props.releaseUuid}`);
    const rel = res.data?.data || res.data;
    const quality = rel?.audio_quality || null;
    if (releaseStore.draftRelease) {
      releaseStore.draftRelease.audio_quality = quality;
    } else if (rel) {
      releaseStore.setDraftRelease(rel);
    }
    console.log('📌 [resolveReleaseAudioQuality] audio_quality من الـ API:', quality);
    return quality;
  } catch (e) {
    console.warn('⚠️ تعذّر جلب audio_quality من الـ Release:', e?.message || e);
    return null;
  }
};

const refreshCurrentSong = async () => {
  if (!props.releaseUuid || !currentSong.value?.uuid) {
    console.warn('⚠️ لا يمكن تحديث الأغنية: لا يوجد releaseUuid أو uuid');
    return;
  }

  try {
    console.log(`↻ جلب الأغنية المحددة: ${currentSong.value.uuid}`);
    const res = await apiRequest.get(
      `/releases/${props.releaseUuid}/songs/${currentSong.value.uuid}`
    );

    const freshSong = res.data.data || res.data;

    if (freshSong?.uuid) {
      const updatedSong = { ...currentSong.value };
      
      Object.keys(freshSong).forEach(key => {
        if (freshSong[key] !== undefined && freshSong[key] !== null) {
          updatedSong[key] = freshSong[key];
        }
      });
      
      currentSong.value = updatedSong;
      
      if (currentSong.value.title) {
        const titleParts = currentSong.value.title.split(' ');
        if (titleParts.length > 0 && /^\d{2}$/.test(titleParts[0])) {
          releaseStore.setCurrentSongNumber(titleParts[0]);
          releaseStore.setCurrentSongTitle(titleParts.slice(1).join(' '));
          console.log('🎵 تحديث عنوان الأغنية في store من refreshCurrentSong (مع رقم):', {
            number: titleParts[0],
            title: titleParts.slice(1).join(' ')
          });
        } else {
          releaseStore.setCurrentSongTitle(currentSong.value.title);
          console.log('🎵 تحديث عنوان الأغنية في store من refreshCurrentSong (بدون رقم):', currentSong.value.title);
        }
      }
      
      console.log('✅ تم تحديث currentSong من الخادم');

      const index = tracks.value.findIndex(s => s.uuid === freshSong.uuid);
      if (index !== -1) {
        tracks.value[index] = { ...tracks.value[index], ...updatedSong };
      }
    }
  } catch (err) {
    console.error('❌ فشل جلب الأغنية المحددة:', err);
  }
};

const addNewSong = async (newSong) => {
    if (newSong && newSong.uuid) {
        console.log('📌 [Upload2Component] استلام أغنية جديدة من FirstSection:', newSong.title);
        
        const exists = tracks.value.some(t => t.uuid === newSong.uuid);
        if (!exists) {
            tracks.value.push(newSong);
            console.log('✅ [Upload2Component] تم إضافة الأغنية إلى القائمة المحلية');
        } else {
            console.log('⚠️ [Upload2Component] الأغنية موجودة بالفعل في القائمة');
        }
        
        updateSongsCompleteStatus();

        return;
    }
    
    console.warn('⚠️ [Upload2Component] addNewSong تم استدعاؤها بدون بيانات أغنية، تخطي');
};

const editSong = async (songUuid) => {
  console.log('🔍 جاري تحميل أغنية:', songUuid);
  
  if (!props.releaseUuid) {
    console.error('❌ لا يوجد releaseUuid');
    return;
  }
  
  if (songUuid === props.releaseUuid) {
    console.error('❌ خطأ: songUuid هو نفسه releaseUuid');
    return;
  }
  
  updateUrlWithSongUuid(songUuid);
  
  releaseStore.setSongUuid(songUuid);
  
  const existingTrack = tracks.value.find(track => track.uuid === songUuid);
  
  if (!existingTrack) {
    console.warn('⚠️ الأغنية غير موجودة في tracks، جلب من الخادم مباشرة');
    await fetchSongDirectly(songUuid);
    return;
  }
  
  try {
    currentSong.value = JSON.parse(JSON.stringify(existingTrack));
    
    const trackIndex = tracks.value.findIndex(t => t.uuid === songUuid);
    const trackNumber = (trackIndex + 1).toString().padStart(2, '0');
    
    let cleanTitle = existingTrack.title || '';
    const titleParts = cleanTitle.split(' ');
    if (titleParts.length > 0 && /^\d{2}$/.test(titleParts[0])) {
      cleanTitle = titleParts.slice(1).join(' ');
    }
    
    let releaseTitle = '';
    if (draftRelease?.value?.title) {
      releaseTitle = draftRelease.value.title;
    } else if (releaseStore.metasData?.title) {
      releaseTitle = releaseStore.metasData.title;
    }
    
    releaseStore.setCurrentSongNumber(trackNumber);
    
    const cleanTitleToSave = cleanTitle || releaseTitle || 'Songtitel';
    releaseStore.setCurrentSongTitle(cleanTitleToSave);
    
    currentSong.value.title = `${trackNumber} ${cleanTitleToSave}`;
    
    console.log('🎵 تحديث عنوان الأغنية في store (نظيف):', cleanTitleToSave);
    console.log('🔢 رقم الأغنية:', trackNumber);
    console.log('📌 العنوان الكامل للعرض:', currentSong.value.title);
    
    console.log('✅ تم تعيين currentSong من tracks المحلية');
    await refreshCurrentSong();
    
    window.dispatchEvent(new CustomEvent('preserve-metas-complete', {
      detail: { preserve: true, songUuid: songUuid }
    }));
    
    currentView.value = 'infos';
    isInSubLayout.value = true;
    forceInfosView.value = true;
    
    emit('update:currentView', currentView.value);
    console.log('📢 [Upload2Component] Emitted update:currentView:', currentView.value);

    emit('enter-sub-layout');
    updateTopLineImage();
    
    logState();
  } catch (err) {
    console.error('❌ فشل جلب تفاصيل الأغنية:', err);
  }
};

const updateUrlWithSongUuid = (songUuid) => {
  if (!songUuid || songUuid === props.releaseUuid) {
    console.error('❌ لا يمكن تحديث URL: songUuid غير صالح أو هو نفسه releaseUuid');
    return;
  }
  
  try {
    const newUrl = `/releases/${props.releaseUuid}/songs/${songUuid}/edit`;
    router.push(newUrl);
    console.log('🔗 تم تحديث URL إلى (مع /edit):', newUrl);
  } catch (error) {
    console.error('❌ فشل تحديث URL:', error);
  }
};

const fetchSongDirectly = async (songUuid) => {
  if (!isMounted.value) {
    console.warn('⚠️ fetchSongDirectly: المكون تم تدميره، تخطي');
    return;
  }
  if (!props.releaseUuid || !songUuid) {
    console.error('❌ fetchSongDirectly: لا يوجد releaseUuid أو songUuid');
    return;
  }
  
  if (songUuid === props.releaseUuid) {
    console.error('❌ خطأ: songUuid هو نفسه releaseUuid');
    return;
  }
  
  try {
    const res = await apiRequest.get(
      `/releases/${props.releaseUuid}/songs/${songUuid}`
    );

    if (!isMounted.value) {
      console.warn('⚠️ fetchSongDirectly: المكون تم تدميره أثناء جلب البيانات، تخطي التحديث');
      return;
    }

    const songData = res.data.data || res.data;

    if (!songData?.uuid) {
      console.error('❌ لم يتم جلب الأغنية بشكل صحيح');
      return;
    }

    currentSong.value = JSON.parse(JSON.stringify(songData));
    
    if (songData.title) {
      const titleParts = songData.title.split(' ');
      if (titleParts.length > 0 && /^\d{2}$/.test(titleParts[0])) {
        releaseStore.setCurrentSongNumber(titleParts[0]);
        releaseStore.setCurrentSongTitle(titleParts.slice(1).join(' '));
      } else {
        releaseStore.setCurrentSongTitle(songData.title);
      }
      console.log('🎵 تحديث عنوان الأغنية في store من fetchSongDirectly:', songData.title);
    }
    
    console.log('✅ تم جلب الأغنية مباشرة من الخادم');

    if (!tracks.value.find(t => t.uuid === songUuid)) {
      tracks.value.push({ ...songData });
    }

    currentView.value = 'infos';
    isInSubLayout.value = true;
    forceInfosView.value = true;
    
    emit('update:currentView', currentView.value);

    emit('enter-sub-layout');
    updateTopLineImage();
    
    logState();

  } catch (err) {
    console.error('❌ فشل جلب الأغنية مباشرة:', err);
  }
};

// ✅ يُرسل عنصراً مُجدوَلاً من الطابور مباشرةً (PUT بحمولة JSON) باستخدام الـ uuid
//    المضمَّن في العنصر نفسه — لا يعتمد على currentSong. يُستعمل عند تفريغ الطابور
//    بعد التنقّل (حين تُمسح currentSong)، فلا تُفقَد أعلام الاكتمال
//    (deals_step_completed / pre_release_step_completed) أو حفوظات تاب مُجدوَلة.
const savePendingItemDirect = async (data) => {
  const uuid = data?.uuid;
  if (!props.releaseUuid || !uuid) return;

  const payload = {};
  let hasFile = false;
  Object.keys(data).forEach((k) => {
    if (['uuid', 'release_uuid', 'created_at'].includes(k)) return;
    const v = data[k];
    if (k === 'song_file' || k === 'cover' || v instanceof File || v instanceof Blob) {
      hasFile = true;
      return;
    }
    payload[k] = v;
  });

  // حمولات الملفات تحتاج FormData/سياق الأغنية — نتخطاها هنا (نادرة في هذا المسار).
  if (hasFile || Object.keys(payload).length === 0) return;

  try {
    await apiRequest.put(`/releases/${props.releaseUuid}/songs/${uuid}`, payload);
    console.log('✅ [Upload2Component] حفظ مُجدوَل أُرسِل مباشرةً بعد التنقّل:', uuid, payload);
  } catch (e) {
    console.warn('⚠️ [Upload2Component] فشل إرسال حفظ مُجدوَل مباشر:', e?.response?.data || e);
  }
};

// ✅ يُفرّغ كل الطابور المتبقّي مباشرةً (لا يعتمد على currentSong ولا isMounted).
const flushPendingSongSaves = () => {
  while (pendingSaves.length > 0) {
    savePendingItemDirect(pendingSaves.shift());
  }
};

// ========== 🔥 دالة حفظ محسنة لمنع الحلقات اللانهائية ==========
const handleSaveSong = async (updatedData) => {
  if (!isMounted.value) {
    console.warn('⚠️ handleSaveSong: المكون تم تدميره، تخطي الحفظ');
    return;
  }

  if (!props.releaseUuid || !currentSong.value?.uuid) {
    console.error('❌ handleSaveSong: لا يوجد releaseUuid أو uuid للأغنية الحالية');
    return;
  }

  // ✅ نلتقط مرجعاً ثابتاً للأغنية الجاري حفظها + الـ uuid.
  //    أثناء الـ await قد ينقل التنقّل (مثل "Zur Tracklist") currentSong.value إلى null،
  //    فيرمي Object.assign(null,…) استثناءً يُجهض دمج البيانات المحلية وتحديث حالة
  //    الاكتمال، فتبقى الأغنية "غير مكتملة" رغم نجاح الحفظ على الخادم.
  const savedSongRef = currentSong.value;
  const savedSongUuid = currentSong.value.uuid;

  // ✅ حفظ آخر قيد التنفيذ → نُجدول هذا الحفظ بدل تخطّيه (كان التخطّي يُفقِد بيانات تاب
  //   عند تبديل سريع، مثل حفظ authors أثناء حفظ contributors). يُعالَج بعد انتهاء الحالي.
  if (isSaving.value) {
    const dupIndex = pendingSaves.findIndex(p => JSON.stringify(p) === JSON.stringify(updatedData));
    if (dupIndex === -1) {
      pendingSaves.push(updatedData);
      console.log('⏳ [Upload2Component] حفظ قيد التنفيذ، جدولة هذا الحفظ (طابور:', pendingSaves.length, ')');
    } else {
      console.log('⏭️ [Upload2Component] نفس البيانات موجودة في الطابور، تخطي التكرار');
    }
    return;
  }

  // ✅ معالجة العنوان الفارغ
  if (updatedData.title === null || updatedData.title === '') {
    updatedData.title = null;
    console.log('📌 تم تعيين العنوان إلى null للحذف');
  }

  if (updatedData.title) {
    const titleParts = updatedData.title.split(' ');
    if (titleParts.length > 0 && /^\d{2}$/.test(titleParts[0])) {
      updatedData.title = titleParts.slice(1).join(' ');
      console.log('📌 تم إزالة الرقم من العنوان قبل الحفظ:', updatedData.title);
    }
  }

  // ✅ التبويب المصدر يصل صراحةً من Infos1.compileAllData (إن وُجد). نلتقطه ونحذفه من
  //    البيانات قبل حساب بصمة التكرار وقبل بناء الـ payload.
  const explicitTab = typeof updatedData.__tab === 'string' ? updatedData.__tab : null;
  if (explicitTab !== null) delete updatedData.__tab;

  // ✅ منع الحفظ إذا كانت نفس البيانات
  const payloadString = JSON.stringify(updatedData);
  if (lastSavedPayload === payloadString) {
    console.log('⏭️ [Upload2Component] نفس البيانات، تخطي الحفظ');
    return;
  }

  isSaving.value = true;

  try {
    console.log('💾 بدء حفظ الأغنية:', currentSong.value.uuid);
    console.log('📤 البيانات المستلمة للحفظ:', updatedData);
    
    const hasSongFile = updatedData.song_file && 
                        (updatedData.song_file instanceof File || 
                         updatedData.song_file instanceof Blob ||
                         (typeof updatedData.song_file === 'object' && updatedData.song_file !== null));
    
    const hasCoverFile = updatedData.cover && (updatedData.cover instanceof File || 
                                               updatedData.cover instanceof Blob ||
                                               (typeof updatedData.cover === 'string' && 
                                                updatedData.cover.startsWith('data:image')));
    
    let coverFile = null;
    
    if (updatedData.cover && typeof updatedData.cover === 'string' && updatedData.cover.startsWith('data:image')) {
      try {
        const response = await fetch(updatedData.cover);
        const blob = await response.blob();
        coverFile = new File([blob], 'cover.jpg', { type: 'image/jpeg' });
        console.log('📤 تحويل Base64 إلى File:', coverFile);
      } catch (err) {
        console.error('❌ فشل تحويل Base64 إلى File:', err);
      }
    } else if (updatedData.cover instanceof File) {
      coverFile = updatedData.cover;
      console.log('📤 cover هو File:', coverFile.name, coverFile.type, coverFile.size);
    } else if (updatedData.cover instanceof Blob) {
      coverFile = new File([updatedData.cover], 'cover.jpg', { type: 'image/jpeg' });
      console.log('📤 cover هو Blob، تم تحويله إلى File:', coverFile);
    }
    
    if (hasSongFile || coverFile) {
      console.log('📤 رفع ملف/صور باستخدام FormData');
      
      const formData = new FormData();
      
      if (hasSongFile && updatedData.song_file) {
        if (updatedData.song_file instanceof File || updatedData.song_file instanceof Blob) {
          const fileName = updatedData.song_file.name || 'song.wav';
          formData.append('song_file', updatedData.song_file, fileName);
          console.log('📤 إضافة song_file إلى FormData (File/Blob):', fileName);
        } else {
          console.warn('⚠️ song_file ليس File أو Blob، تخطي');
        }
      }
      
      if (coverFile) {
        formData.append('cover', coverFile, 'cover.jpg');
        console.log('📤 إضافة cover إلى FormData:', coverFile.name, coverFile.type, coverFile.size);
      } else if (updatedData.cover === null) {
        formData.append('cover', 'null');
        console.log('📤 حذف cover (إرسال null)');
      }
      
      if (updatedData.prerelease !== undefined) {
        formData.append('prerelease', updatedData.prerelease);
      }
      
      if (updatedData.pre_order !== undefined) {
        formData.append('pre_order', updatedData.pre_order);
      }
      
      if (updatedData.release_date && updatedData.release_date !== null) {
        formData.append('release_date', updatedData.release_date);
      }
      
      if (updatedData.pre_release_image && updatedData.pre_release_image !== null) {
        formData.append('pre_release_image', updatedData.pre_release_image);
      }
      
      formData.append('_method', 'PUT');
      
      const response = await apiRequest.post(
        `/releases/${props.releaseUuid}/songs/${currentSong.value.uuid}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        }
      );
      
      console.log('✅ تم رفع الملفات بنجاح!', response.data);

      if (response.data.data) {
        if (savedSongRef) Object.assign(savedSongRef, response.data.data);

        if (response.data.data.song_file) {
          const filePath = response.data.data.song_file;
          console.log('✅ تم رفع الملف، المسار:', filePath);
          
          let fileName = filePath;
          if (fileName.includes('/')) {
            const parts = fileName.split('/');
            fileName = parts[parts.length - 1];
          }
          
          if (props.currentSong) {
            props.currentSong.song_file = fileName;
          }
        }
        
        if (response.data.data.title) {
          const titleParts = response.data.data.title.split(' ');
          if (titleParts.length > 0 && /^\d{2}$/.test(titleParts[0])) {
            releaseStore.setCurrentSongNumber(titleParts[0]);
            releaseStore.setCurrentSongTitle(titleParts.slice(1).join(' '));
          } else {
            releaseStore.setCurrentSongTitle(response.data.data.title);
          }
        }
      }
      
    } else {
      console.log('📤 إرسال بيانات نصية كـ JSON');
      
      const tabFields = {
        'infos': ['title', 'subtitle', 'song_type', 'explicit_lyrics', 'isrc', 'title_language', 'lyrics_language', 'song_lyrics', 'preview_enabled', 'preview_start'],
        'urheber': ['authors'],
        'mitwirkende': ['contributors', 'production_year'],
        'deals': ['is_splitting_active', 'shares'],
        'pre-release': ['prerelease', 'pre_order', 'pre_release_image', 'release_date']
      };
      
      // ✅ نُفضّل التبويب الصريح؛ والتخمين يبقى للمُرسِلين المباشرين (مثل UrheberContent
      //    الذي يبعث {authors} وحدها) حيث يكون الاستنتاج صحيحاً بالفعل.
      let currentTab = explicitTab;
      if (currentTab) { /* explicit */ }
      else if (updatedData.authors) currentTab = 'urheber';
      else if (updatedData.contributors) currentTab = 'mitwirkende';
      else if (updatedData.is_splitting_active !== undefined) currentTab = 'deals';
      else if (updatedData.prerelease !== undefined || 
               updatedData.pre_order !== undefined || 
               updatedData.pre_release_image !== undefined || 
               updatedData.release_date !== undefined) currentTab = 'pre-release';
      else currentTab = 'infos';
      
      console.log(`📌 التبويب المرسل: ${currentTab}`);
      
      const payload = {};
      let hasChanges = false;
      const allowedFields = tabFields[currentTab] || [];

      // Step-completion flags are not tab-specific — they must always pass the
      // per-tab field filter, otherwise clicking Deals never persists
      // deals_step_completed (and pre_release_step_completed is dropped too).
      const alwaysAllowedFields = ['deals_step_completed', 'pre_release_step_completed'];

      Object.keys(updatedData).forEach(key => {
        if (key === 'uuid' || key === 'release_uuid' || key === 'created_at' || key === 'song_file' || key === 'cover') {
          return;
        }

        if (!allowedFields.includes(key) && !alwaysAllowedFields.includes(key) && key !== 'authors' && key !== 'contributors') {
          console.log(`⏭️ تخطي ${key} - ليس من حقول التبويب ${currentTab}`);
          return;
        }
        
        let newValue = updatedData[key];
        const oldValue = currentSong.value[key];
        
        if (key === 'title' && newValue === null) {
          const currentTitle = currentSong.value.title ?? null;
          if (currentTitle !== null) {
            payload[key] = null;
            hasChanges = true;
            console.log(`🔄 تغيير في ${key}:`, { قديم: oldValue, جديد: null });
          }
          return;
        }
        
        if (key === 'subtitle') {
          const currentSubtitle = currentSong.value.subtitle ?? null;
          if ((newValue === null || newValue === '') && currentSubtitle !== null) {
            payload[key] = null;
            hasChanges = true;
            console.log(`🔄 تغيير في ${key} (إلى null):`, { قديم: currentSubtitle, جديد: null });
            return;
          }
          if (newValue !== null && newValue !== undefined && newValue !== currentSubtitle) {
            payload[key] = newValue;
            hasChanges = true;
            console.log(`🔄 تغيير في ${key}:`, { قديم: currentSubtitle, جديد: newValue });
            return;
          }
        }
        
        const isValueChanged = JSON.stringify(newValue) !== JSON.stringify(oldValue);
        
        if (newValue === null && oldValue !== null && key !== 'title' && key !== 'subtitle') {
          payload[key] = null;
          hasChanges = true;
          console.log(`🔄 تغيير في ${key} (إلى null):`, { قديم: oldValue, جديد: null });
          return;
        }
        
        if (isValueChanged && newValue !== null && newValue !== undefined) {
          payload[key] = newValue;
          hasChanges = true;
          console.log(`🔄 تغيير في ${key}`);
        }
      });
      
      if (updatedData.title === null && !payload.hasOwnProperty('title')) {
        const currentTitle = currentSong.value.title ?? null;
        if (currentTitle !== null) {
          payload.title = null;
          hasChanges = true;
          console.log('🔄 تغيير في title (إلى null):', { قديم: currentTitle, جديد: null });
        }
      }
      
      if (updatedData.subtitle === null && !payload.hasOwnProperty('subtitle')) {
        const currentSubtitle = currentSong.value.subtitle ?? null;
        if (currentSubtitle !== null) {
          payload.subtitle = null;
          hasChanges = true;
          console.log('🔄 تغيير في subtitle (إلى null):', { قديم: currentSubtitle, جديد: null });
        }
      }
      
      // ✅ نوع instrumental (لا نصوص) → لا كاتب نصوص: نُفرّغ authors.lyricist.
      //    نفعلها هنا في نقطة الحفظ الموحّدة لأن تغيير song_type يقع في تبويب Infos،
      //    بينما UrheberContent (صاحب مراقب isInstrumental) قد لا يكون مركّباً أصلاً
      //    فلا يُنفَّذ مراقبه ولا تُرسَل lyricist فارغة — وهو سبب بقاء القيمة على الخادم.
      //    ملاحظة: الخادم يستبدل كائن authors بالكامل، لذا نرسل نسخة كاملة مع تفريغ
      //    lyricist فقط، حتى لا تُمسح composer / verlog / c_line.
      const nextSongType = payload.song_type !== undefined
        ? payload.song_type
        : (currentSong.value?.song_type ?? currentSong.value?.song_typ);

      if (String(nextSongType || '').includes('instrumental')) {
        const baseAuthors = payload.authors || currentSong.value?.authors || {};
        const currentLyricist = Array.isArray(baseAuthors.lyricist)
          ? baseAuthors.lyricist.filter(v => v && String(v).trim() !== '')
          : [];

        if (currentLyricist.length > 0) {
          payload.authors = {
            composer: baseAuthors.composer || [],
            lyricist: [],
            verlog: baseAuthors.verlog || [],
            c_line: baseAuthors.c_line || []
          };
          hasChanges = true;
          console.log('🎼 instrumental → إرسال authors.lyricist فارغة:', payload.authors);
        }
      }

      if (!hasChanges || Object.keys(payload).length === 0) {
        console.log('ℹ️ لا توجد تغييرات');
        isSaving.value = false;
        return;
      }
      
      console.log('📤 Payload النهائي:', payload);
      
      // ✅ حفظ آخر payload لمنع الحفظ المتكرر
      lastSavedPayload = payloadString;
      
      const response = await apiRequest.put(
        `/releases/${props.releaseUuid}/songs/${currentSong.value.uuid}`,
        payload
      );
      
      console.log('✅ تم الحفظ بنجاح!', response.data);

      if (response.data.data) {
        if (savedSongRef) Object.assign(savedSongRef, response.data.data);

        if (payload.title !== undefined || response.data.data.title) {
          const newTitle = payload.title !== undefined ? payload.title : response.data.data.title;
          
          if (newTitle === null) {
            releaseStore.setCurrentSongTitle('');
            releaseStore.setCurrentSongNumber('01');
            console.log('🎵 تم حذف عنوان الأغنية من store');
          } else {
            const titleParts = newTitle.split(' ');
            if (titleParts.length > 0 && /^\d{2}$/.test(titleParts[0])) {
              releaseStore.setCurrentSongNumber(titleParts[0]);
              releaseStore.setCurrentSongTitle(titleParts.slice(1).join(' '));
            } else {
              releaseStore.setCurrentSongTitle(newTitle);
            }
            console.log('🎵 تحديث عنوان الأغنية في store من payload:', newTitle);
          }
        }
        
        if (payload.subtitle !== undefined) {
          const newSubtitle = payload.subtitle;
          console.log('📌 تم تحديث subtitle في الـ Store:', newSubtitle);
        }
      }
    }
    
    // ✅ نبثّ إشارة نجاح الحفظ دائماً (حتى لو دُمّر هذا المكوّن أثناء التنقّل) كي يستطيع
    //    أيّ مكوّن Upload2 حديث التركيب (بعد Zur Tracklist) أن يوفّق قائمة الأغاني مع
    //    الخادم ويعرض علم الاكتمال الصحيح — وهذا حدث نافذة عام يلتقطه أيّ مستمع مركّب.
    const mergedSong = savedSongRef || {};
    window.dispatchEvent(new CustomEvent('save-song-complete', {
      detail: {
        success: true,
        songUuid: savedSongUuid,
        data: mergedSong
      }
    }));

    if (!isMounted.value) {
      console.warn('⚠️ handleSaveSong: المكون تم تدميره أثناء الحفظ، تخطي تحديث الحالة المحلية');
      isSaving.value = false;
      return;
    }

    // ✅ نستخدم المرجع/الـ uuid الملتقطَين مسبقاً بدل currentSong.value الذي قد يكون
    //    أصبح null بفعل التنقّل. البيانات القادمة من الخادم (المدموجة في savedSongRef)
    //    تحمل أعلام deals_step_completed / pre_release_step_completed المحدّثة، فيتزامن
    //    الاكتمال محلياً فوراً وتظهر الأغنية مكتملة في FirstSection دون إعادة تعديل.
    const index = tracks.value.findIndex(s => s.uuid === savedSongUuid);
    if (index !== -1) {
      tracks.value[index] = { ...tracks.value[index], ...mergedSong };
    }

    // ✅ نُزامن أيضاً draftRelease.songs في المخزَّن كي يعتمد عليه tabs.vue
    //    (dataCompletion) بحالة *حديثة* — وإلا تبقى شرائح اكتمال التبويبات قديمة بعد
    //    تغيير مثل song_type (فيظهر urheber مكتملاً خطأً معتمداً على بيانات قديمة).
    try {
      const dr = releaseStore.draftRelease;
      if (dr && Array.isArray(dr.songs)) {
        const di = dr.songs.findIndex(s => s.uuid === savedSongUuid);
        if (di !== -1) {
          dr.songs.splice(di, 1, { ...dr.songs[di], ...mergedSong });
        }
      }
    } catch (e) {
      console.warn('⚠️ تعذّر مزامنة draftRelease.songs:', e);
    }

    console.log('🔄 تم تحديث البيانات المحلية');

    updateSongsCompleteStatus();
    
  } catch (err) {
    console.error('❌ فشل الحفظ:', {
      error: err,
      message: err.message,
      response: err.response?.data
    });

    if (!isMounted.value) {
      console.warn('⚠️ handleSaveSong: المكون تم تدميره، تخطي عرض الخطأ');
      isSaving.value = false;
      return;
    }
    
    window.dispatchEvent(new CustomEvent('save-song-complete', {
      detail: { 
        success: false, 
        songUuid: currentSong.value?.uuid,
        error: err.message 
      }
    }));
  } finally {
    // ✅ إعادة تعيين علم الحفظ بعد فترة، ثم معالجة أي حفظ مُجدوَل في الطابور تسلسلياً.
    setTimeout(() => {
      isSaving.value = false;
      if (pendingSaves.length > 0) {
        if (isMounted.value && currentSong.value?.uuid) {
          // مسار عادي داخل المحرّر: عبر handleSaveSong (فلترة التاب + دمج الرد).
          const next = pendingSaves.shift();
          console.log('▶️ [Upload2Component] معالجة حفظ مُجدوَل من الطابور (متبقٍّ:', pendingSaves.length, ')');
          handleSaveSong(next);
        } else {
          // ✅ لم تعد الأغنية محمّلة (تنقّل إلى FirstSection) — نُفرّغ الطابور مباشرةً
          //    بدل إسقاطه، كي تُحفظ أعلام الاكتمال المُجدوَلة (deals/pre_release).
          console.log('▶️ [Upload2Component] الأغنية غير محمّلة، تفريغ الطابور مباشرةً بعد التنقّل');
          flushPendingSongSaves();
        }
      }
    }, 500);
  }
};

const deleteSong = async (songUuid) => {
  console.log('🗑️ حذف أغنية:', songUuid);
  
  if (!songUuid) {
    console.error('❌ لا يوجد UUID للأغنية');
    return;
  }
  
  if (!props.releaseUuid) {
    console.error('❌ لا يوجد releaseUuid');
    return;
  }
  
  const songExists = tracks.value.some(s => s.uuid === songUuid);
  if (!songExists) {
    console.warn('⚠️ الأغنية غير موجودة في القائمة المحلية');
    tracks.value = tracks.value.filter(s => s.uuid !== songUuid);
    return;
  }
  
  try {
    const response = await apiRequest.delete(`/releases/${props.releaseUuid}/songs/${songUuid}`);
    console.log('✅ تم حذف الأغنية بنجاح:', response.data);
    
    tracks.value = tracks.value.filter(s => s.uuid !== songUuid);
    console.log('📊 تم تحديث القائمة المحلية، عدد الأغاني:', tracks.value.length);
    
    try {
      const savedState = localStorage.getItem('upload2_state');
      if (savedState) {
        const parsed = JSON.parse(savedState);
        if (parsed.tracks) {
          parsed.tracks = parsed.tracks.filter(s => s.uuid !== songUuid);
          localStorage.setItem('upload2_state', JSON.stringify(parsed));
          console.log('💾 تم تحديث localStorage بعد الحذف');
        }
      }
    } catch (e) {
      console.warn('⚠️ Could not update localStorage:', e);
    }
    
    if (currentSong.value?.uuid === songUuid) {
      currentSong.value = null;
    }
    
    updateSongsCompleteStatus();
    
  } catch (err) {
    console.error('❌ فشل حذف الأغنية:', err);
    
    if (err.response?.status === 404) {
      console.warn('⚠️ الأغنية غير موجودة (404)، إزالتها من القائمة المحلية');
      tracks.value = tracks.value.filter(s => s.uuid !== songUuid);
      
      try {
        const savedState = localStorage.getItem('upload2_state');
        if (savedState) {
          const parsed = JSON.parse(savedState);
          if (parsed.tracks) {
            parsed.tracks = parsed.tracks.filter(s => s.uuid !== songUuid);
            localStorage.setItem('upload2_state', JSON.stringify(parsed));
          }
        }
      } catch (e) {
        console.warn('⚠️ Could not update localStorage:', e);
      }
    }
  }
};

const handleBackFromInfos = () => {
  console.log('🔙 العودة من Infos');
  
  clearSongUuidFromUrl();
  releaseStore.songUuid = null;
  
  const releaseAudioQuality = draftRelease?.value?.audio_quality || audioQuality.value;
  if (releaseAudioQuality && !selectedSongType.value) {
    selectedSongType.value = releaseAudioQuality;
    console.log('📌 [handleBackFromInfos] تعيين selectedSongType من audio_quality:', selectedSongType.value);
  }

  currentView.value = 'firstSection';
  forceInfosView.value = false;
  isInSubLayout.value = false;
  currentSong.value = null;

  emit('exit-sub-layout');
  emit('update:currentView', currentView.value);
  updateTopLineImage();

  console.log('✅ تم العودة إلى FirstSection');
  logState();
};

const handleBackToTracklist = () => {
  console.log('🔄 Upload2Component: استقبال حدث back-to-tracklist، العودة إلى FirstSection');
  
  isPreventingStepUpdate.value = true;
  console.log('🔒 [Upload2Component] Preventing step updates');
  
  const tracksToSave = tracks.value && Array.isArray(tracks.value) ? tracks.value : [];
  
  let selectedType = selectedSongType.value || '';
  if (!selectedType) {
    const releaseAudioQuality = draftRelease?.value?.audio_quality || audioQuality.value;
    if (releaseAudioQuality) {
      selectedType = releaseAudioQuality;
      console.log('📌 [handleBackToTracklist] استخدام audio_quality من Release:', selectedType);
    }
  }
  
  try {
    const stateToSave = {
      view: 'firstSection',
      tracks: tracksToSave,
      selectedType: selectedType,
      selectedCardIndex: selectedCardIndex.value
    };
    localStorage.setItem('upload2_state', JSON.stringify(stateToSave));
    console.log('💾 تم حفظ الحالة في localStorage:', {
      view: stateToSave.view,
      tracksCount: stateToSave.tracks.length,
      selectedType: stateToSave.selectedType
    });
  } catch (e) {
    console.warn('⚠️ Could not save state:', e);
  }
  
  if (!selectedSongType.value && selectedType) {
    selectedSongType.value = selectedType;
    console.log('📌 تم تحديث selectedSongType إلى:', selectedType);
  }
  
  currentView.value = 'firstSection';
  isInSubLayout.value = false;
  forceInfosView.value = false;
  currentSong.value = null;
  
  clearSongUuidFromUrl();
  releaseStore.clearSongUuid();

  const targetReleaseId = releaseStore.currentReleaseId || props.releaseUuid;
  if (targetReleaseId) {
    router.replace({ path: `/releases/${targetReleaseId}/edit` });
  }
  
  window.dispatchEvent(new CustomEvent('prevent-step-update', {
    detail: { duration: 2000 }
  }));
  
  setTimeout(() => {
    window.dispatchEvent(new CustomEvent('force-full-height', {
      detail: { force: true }
    }));
  }, 100);
  
  emit('update:currentView', currentView.value);
  updateTopLineImage();
  emit('exit-sub-layout');
  
  console.log('✅ Upload2Component: تم العودة إلى FirstSection');
  logState();
  
  setTimeout(() => {
    isPreventingStepUpdate.value = false;
    console.log('🔓 [Upload2Component] Step updates re-enabled');
  }, 2000);
};

const handleForceEditSong = (event) => {
  const { songUuid } = event.detail;
  if (!isMounted.value) {
    console.warn('⚠️ editSong: المكون تم تدميره، تخطي');
    return;
  }
  console.log('🔍 جاري تحميل أغنية:', songUuid);
  if (!props.releaseUuid) {
    console.error('❌ لا يوجد releaseUuid');
    return;
  }
  
  if (songUuid === props.releaseUuid) {
    console.error('❌ خطأ: songUuid هو نفسه releaseUuid');
    return;
  }
  if (songUuid && props.releaseUuid && songUuid !== props.releaseUuid) {
    console.log('📩 تلقيت حدث force-edit-song:', songUuid);
    releaseStore.setSongUuid(songUuid);
    editSong(songUuid);
  } else {
    console.error('❌ حدث force-edit-song به خطأ: songUuid هو نفسه releaseUuid');
  }
};

const handleEnterSubLayout = () => {
  isInSubLayout.value = true;
  emit('enter-sub-layout');
};

const handleExitSubLayout = () => {
  isInSubLayout.value = false;
  emit('exit-sub-layout');
};

const restoreStateFromLocalStorage = () => {
  try {
    const savedState = localStorage.getItem('upload2_state');
    
    if (savedState) {
      const parsed = JSON.parse(savedState);
      console.log('📦 محاولة استعادة الحالة:', parsed);
      
      if (parsed.view === 'firstSection' && parsed.tracks && Array.isArray(parsed.tracks) && parsed.tracks.length > 0) {
        console.log('📦 [Upload2Component] استعادة الحالة من localStorage: firstSection');
        currentView.value = 'firstSection';
        tracks.value = parsed.tracks;
        
        let selectedType = parsed.selectedType || '';

        if (!selectedType) {
          const releaseAudioQuality = draftRelease?.value?.audio_quality || audioQuality.value;
          if (releaseAudioQuality) {
            selectedType = releaseAudioQuality;
            console.log('📌 استخدام audio_quality من Release كقيمة افتراضية:', selectedType);
          }
        }
        
        if (selectedType) {
          selectedSongType.value = selectedType;
          console.log('📌 تم استعادة selectedSongType:', selectedType);
        }
        
        if (parsed.selectedCardIndex !== undefined) {
          selectedCardIndex.value = parsed.selectedCardIndex;
        }
        
        localStorage.removeItem('upload2_state');
        isInitialLoading.value = false;
        logState();
        console.log('✅ تم استعادة tracks:', tracks.value.length, 'أغنية');
        console.log('✅ تم استعادة selectedSongType:', selectedSongType.value);

        // ✅ الحالة المستعادة من localStorage قد تكون قديمة: تُحفظ عند مغادرة تحرير أغنية
        //    (Zur Tracklist) بينما لا يزال ردّ آخر حفظ (مثل pre_release_step_completed)
        //    في الطريق، والمكوّن القديم يُدمَّر قبل تحديث tracks محلياً. لذلك نوفّق مع
        //    الخادم في الخلفية فتظهر أعلام الاكتمال الصحيحة فوراً دون إعادة تعديل الأغنية.
        if (props.releaseUuid) {
          fetchSongs();
        }
        return true;
      }
    }
    return false;
  } catch (e) {
    console.warn('⚠️ Could not restore state:', e);
    localStorage.removeItem('upload2_state');
    return false;
  }
};

const updateAudioQuality = async (quality) => {
  if (!props.releaseUuid) {
    console.error('❌ لا يوجد releaseUuid لتحديث جودة الصوت');
    return;
  }

  try {
    console.log('🎵 تحديث جودة الصوت:', quality);
    
    const payload = {
      audio_quality: quality,
      _method: 'PATCH'
    };

    const response = await apiRequest.post(`/releases/${props.releaseUuid}`, payload);
    console.log('✅ تم تحديث جودة الصوت بنجاح:', response.data);

    audioQuality.value = quality;

    // ✅ نُزامن قيمة الجودة في الـ store مباشرةً (بما في ذلك null عند التراجع) كي يبقى
    //    مصدر القرار (resolveReleaseAudioQuality) وصورة الـ Layout متسقين حتى قبل أي رفرش.
    if (releaseStore.draftRelease) {
      releaseStore.draftRelease.audio_quality = quality;
    }

  } catch (err) {
    console.error('❌ فشل تحديث جودة الصوت:', err.response?.data || err.message);
  }
};

const handleNext = async (cardIndex) => {
  if (cardIndex > 0 && !formFields[cardIndex].isValid) {
    console.warn('⚠️ يجب إدخال إيميل صحيح للمتابعة');
    showTemporaryError();
    return;
  }

  selectedCardIndex.value = cardIndex;
  // ✅ الكروت تختار جودة الصوت (audio_quality) وليس نوع الأغنية.
  const quality = audioQualityMap[cardIndex];

  console.log('🎵 تم اختيار جودة الصوت:', quality);

  isUserSelectedType.value = true;
  selectedSongType.value = quality; // يحمل جودة الصوت المختارة

  updateAudioQuality(quality);

  // بعد اختيار الجودة ننتقل مباشرةً إلى FirstSection (حتى لو لا توجد أغانٍ بعد).
  currentView.value = 'firstSection';
  emit('update:currentView', currentView.value);

  updateTopLineImage(audioQualityImageMap[quality]);

  logState();
};

const handleCardClick = (index) => {
  selectedCardIndex.value = index;
  if (index === 0) {
    handleNext(index);
  }
};

const handleBackClick = () => {
  console.log('🔙 العودة من FirstSection إلى شاشة اختيار الكروت');
  currentView.value = 'main';
  selectedCardIndex.value = null;
  selectedSongType.value = '';
  audioQuality.value = null;
  isUserSelectedType.value = false;
  updateAudioQuality(null);
  emit('update:currentView', currentView.value);
  emit('update:topLineImage', null);
  emit('exit-sub-layout');
  logState();
};

const showFormField = (cardIndex) => {
  formFields[cardIndex].visible = true;
};

const hideFormField = (cardIndex) => {
  if (!formFields[cardIndex].email) {
    formFields[cardIndex].visible = false;
  }
};

const validateEmail = (cardIndex) => {
  const email = formFields[cardIndex].email;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  formFields[cardIndex].isValid = emailRegex.test(email);
  
  if (email === 'test@example.com' || email === 'demo@test.com') {
    formFields[cardIndex].isValid = true;
  }
};

// ✅ عند نجاح حفظ أغنية بينما نحن في قائمة الأغاني (firstSection) — خاصة حفظ تمّ أثناء
//    التنقّل عبر "Zur Tracklist" وأنهى من مكوّن قديم دُمّر — نوفّق القائمة مع الخادم كي
//    تظهر أعلام الاكتمال المحدّثة (pre_release/deals) فوراً دون الحاجة لإعادة تعديل الأغنية.
const handleSaveSongCompleteReconcile = (event) => {
    if (
        event?.detail?.success &&
        currentView.value === 'firstSection' &&
        props.releaseUuid
    ) {
        console.log('🔄 [Upload2Component] حفظ اكتمل وأنا في firstSection → توفيق القائمة مع الخادم');
        fetchSongs();
    }
};

const handleNavigateToFirstSection = (event) => {
    console.log('📢 [Upload2Component] استقبال حدث navigate-to-first-section');
    
    if (event?.detail?.force) {
        console.log('🔄 [Upload2Component] الانتقال إلى FirstSection (force)');
        
        if (currentView.value === 'infos' || isInSubLayout.value) {
            handleBackToFirstSection();
            return;
        }
        
        if (currentView.value === 'main') {
            if (tracks.value.length > 0) {
                currentView.value = 'firstSection';
                emit('update:currentView', currentView.value);
                updateTopLineImage();
            scrollSongsToTop();
                logState();
            } else {
                console.log('⚠️ [Upload2Component] لا توجد أغانٍ، البقاء في main');
            }
        }
    }
};

const removeAllTooltips = () => {
  try {
    document.querySelectorAll('[title]').forEach(el => {
      el.removeAttribute('title');
    });
    
    document.querySelectorAll('svg[title]').forEach(el => {
      el.removeAttribute('title');
    });
    
    document.querySelectorAll('button[title]').forEach(el => {
      el.removeAttribute('title');
    });
    
    document.querySelectorAll('a[title]').forEach(el => {
      el.removeAttribute('title');
    });
    
    document.querySelectorAll('div[title]').forEach(el => {
      el.removeAttribute('title');
    });
    
    document.querySelectorAll('img[title]').forEach(el => {
      el.removeAttribute('title');
    });
  } catch (e) {
    // تجاهل الأخطاء
  }
};
// ========== مراقبة التغييرات في tabCompletion ==========
watch(
    () => releaseStore.tabCompletion,
    (newVal) => {
        console.log('📌 [Upload2Component] tabCompletion changed, rechecking songs status:', newVal);
        if (tracks.value.length > 0) {
            updateSongsCompleteStatus();
        }
    },
    { deep: true, immediate: true }
);
watch(
    () => route.query.forceView,
    (newVal) => {
        console.log('📌 [Upload2Component] forceView changed:', newVal);
        
        if (newVal === 'firstSection') {
            console.log('🔄 [Upload2Component] forceView = firstSection, الانتقال إلى FirstSection');
            
            const { forceView, ...restQuery } = route.query;
            router.replace({ query: restQuery }).catch(() => {});
            
            handleNavigateToFirstSection({ detail: { force: true } });
        }
    },
    { immediate: true }
);

watch(
    () => route.query.step,
    (newVal, oldVal) => {
        console.log('📌 [Upload2Component] step changed:', { old: oldVal, new: newVal });
        
        if (newVal === '3' && props.currentStep === 3) {
            if (!route.query.forceView) {
                if (currentView.value === 'infos' || isInSubLayout.value) {
                    console.log('🔄 [Upload2Component] العودة من infos إلى firstSection بسبب تغير step');
                    handleBackToFirstSection();
                }
                else if (currentView.value === 'main' && tracks.value.length > 0) {
                    console.log('🔄 [Upload2Component] الانتقال من main إلى firstSection');
                    currentView.value = 'firstSection';
                    emit('update:currentView', currentView.value);
                    updateTopLineImage();
                    logState();
                }
            }
        }
    },
    { immediate: true }
);

onMounted(async () => {
    isMounted.value = true; 
     
    console.log('🚀 Upload2Component mounted, currentStep:', props.currentStep);
    
    nextTick(() => {
        removeAllTooltips();
    });
    
    let observer = null;
    try {
        observer = new MutationObserver(() => {
            removeAllTooltips();
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['title']
        });
    } catch (e) {
        console.warn('⚠️ Could not create MutationObserver:', e);
    }
    
    if (observer) {
        window._tooltipObserver = observer;
    }
    
    if (route.query.forceView === 'firstSection') {
        console.log('🔄 [Upload2Component] forceView detected in URL, navigating to FirstSection');
        const { forceView, ...restQuery } = route.query;
        router.replace({ query: restQuery }).catch(() => {});
        setTimeout(() => {
            handleNavigateToFirstSection({ detail: { force: true } });
        }, 100);
    }
    
    if (props.currentStep !== 3) {
        console.log('⚠️ [Upload2Component] Not in step 3, skipping initialization');
        isInitialLoading.value = false;
        return;
    }
    
    window.addEventListener('change-audio-quality', handleChangeAudioQualityFromParent);
    window.addEventListener('prevent-step-update', (event) => {
        const duration = event.detail?.duration || 2000;
        isPreventingStepUpdate.value = true;
        console.log('🔒 [Upload2Component] Step updates prevented for', duration, 'ms');
        setTimeout(() => {
            isPreventingStepUpdate.value = false;
            console.log('🔓 [Upload2Component] Step updates re-enabled');
        }, duration);
    });
    
    window.addEventListener('navigate-to-first-section', handleNavigateToFirstSection);
    window.addEventListener('save-song-complete', handleSaveSongCompleteReconcile);

    const restored = restoreStateFromLocalStorage();
    if (restored) {
        if (!selectedSongType.value) {
            const releaseAudioQuality = draftRelease?.value?.audio_quality || audioQuality.value;
            if (releaseAudioQuality) {
                selectedSongType.value = releaseAudioQuality;
                console.log('📌 تعيين selectedSongType من audio_quality:', selectedSongType.value);
            }
        }
        updateSongsCompleteStatus();
        isInitialLoading.value = false;
        return;
    }
    
    try {
        const savedState = localStorage.getItem('upload2_state');
        
        if (savedState) {
            const parsed = JSON.parse(savedState);
            console.log('📦 محاولة استعادة الحالة:', parsed);
            
            if (parsed.view === 'firstSection' && parsed.tracks && Array.isArray(parsed.tracks) && parsed.tracks.length > 0) {
                console.log('📦 [Upload2Component] استعادة الحالة من localStorage: firstSection');
                currentView.value = 'firstSection';
                tracks.value = parsed.tracks;
                
                if (parsed.selectedType) {
                    selectedSongType.value = parsed.selectedType;
                    console.log('📌 تم استعادة selectedSongType:', parsed.selectedType);
                }
                
                if (parsed.selectedCardIndex !== undefined) {
                    selectedCardIndex.value = parsed.selectedCardIndex;
                }
                
                localStorage.removeItem('upload2_state');
                
                updateSongsCompleteStatus();
                
                isInitialLoading.value = false;
                logState();
                console.log('✅ تم استعادة tracks:', tracks.value.length, 'أغنية');
                console.log('✅ تم استعادة selectedSongType:', selectedSongType.value);
                return;
            }
        }
    } catch (e) {
        console.warn('⚠️ Could not restore state:', e);
        localStorage.removeItem('upload2_state');
    }
    
    if (!isFirstMount) {
        console.log('⚠️ [Upload2Component] تم تحميل المكون مسبقاً، تخطي إعادة التهيئة');
        if (tracks.value.length > 0) {
            updateSongsCompleteStatus();
        }
        isInitialLoading.value = false;
        return;
    }
    
    isFirstMount = false;
    isInitialLoading.value = true;
    
    logState();
    
    window.addEventListener('force-edit-song', handleForceEditSong);
    
    window.addEventListener('back-to-first-section-from-layout', () => {
        console.log('🔙 [Upload2Component] استقبال حدث الرجوع من Layout (via window)');
        handleBackToFirstSection();
    });
    
    try {
        if (tracks.value.length === 0) {
            console.log('📡 [onMounted] جلب الأغاني...');
            await fetchSongs();
            console.log('✅ [onMounted] تم جلب الأغاني:', tracks.value.length);
        } else {
            console.log('📦 الأغاني موجودة بالفعل، تخطي جلبها:', tracks.value.length);
            updateSongsCompleteStatus();
        }
        
        // ✅ نحلّ audio_quality بشكل موثوق مرّة واحدة (لا يُغيّر selectedSongType بذاته، آمن).
        //    هو وحده ما يقرّر عرض كروت الجودة (main) أم قائمة الأغاني (firstSection).
        const releaseQuality = await resolveReleaseAudioQuality();

        // ⚠️ مهم: نُطبّق قيمة الجودة على selectedSongType (وصورة top-line) للاستخدام في
        //    الطبقة الفرعية. مُعرّف كدالة لأن تعيين selectedSongType يُطلق مراقِبه الذي
        //    ينتقل إلى firstSection عندما تكون currentView === 'main'. لذلك لا نُعيّنها إلا
        //    بعد أن تستقرّ الوجهة (infos/subLayout أو firstSection) فيمنع حارس المراقِب
        //    أيّ انتقال زائد يسبّب ارتداد main→firstSection→infos وإعادة تركيب المكوّن.
        const applyReleaseQuality = () => {
            if (releaseQuality) {
                selectedSongType.value = releaseQuality;
                audioQuality.value = releaseQuality;
                updateTopLineImage(audioQualityImageMap[releaseQuality]);
            } else {
                selectedSongType.value = '';
                audioQuality.value = null;
            }
        };

        const songUuidToLoad = releaseStore.songUuid || route.query.song;

        // 1) تحميل أغنية محددة من Store/URL — أولوية عليا، وقبل تعيين selectedSongType.
        if (songUuidToLoad && props.releaseUuid && songUuidToLoad !== props.releaseUuid) {
            console.log('🔄 تحميل أغنية من الـ Store أو URL:', songUuidToLoad);

            const songExists = tracks.value.some(song => song.uuid === songUuidToLoad);

            if (songExists) {
                await editSong(songUuidToLoad);
            } else {
                console.warn('⚠️ الأغنية غير موجودة في القائمة:', songUuidToLoad);
                await fetchSongDirectly(songUuidToLoad);
            }
            // بعد editSong تصبح isInSubLayout=true فيمنع حارس المراقِب الانتقال إلى firstSection.
            applyReleaseQuality();
            updateSongsCompleteStatus();
            isInitialLoading.value = false;
            logState();
            return;
        }

        // 2) وضع تعديل الأغنية الأولى (forceInfosView) — أيضاً قبل تعيين selectedSongType.
        if (props.forceInfosView && tracks.value.length > 0 && currentView.value !== 'infos') {
            await editSong(tracks.value[0].uuid);
            applyReleaseQuality();
            updateSongsCompleteStatus();
            isInitialLoading.value = false;
            logState();
            return;
        }

        // 3) لا توجد أغنية محددة → القرار بين main و firstSection.
        //    ✅ نُظهر كروت اختيار الجودة (main) فقط عند عدم وجود أغانٍ إطلاقاً. إن وُجدت
        //    أغانٍ بالفعل (مثل العودة عبر زر الرجوع) نعرض قائمة الأغاني (firstSection)
        //    حتى لو غابت audio_quality على مستوى الـ Release.
        if (currentView.value !== 'infos') {
            if (releaseQuality || tracks.value.length > 0) {
                if (releaseQuality) {
                    selectedSongType.value = releaseQuality;
                    audioQuality.value = releaseQuality;
                    updateTopLineImage(audioQualityImageMap[releaseQuality]);
                }
                currentView.value = 'firstSection';
                emit('update:currentView', currentView.value);
                if (tracks.value.length > 0) scrollSongsToTop();
                console.log('📌 [onMounted] جودة محددة أو أغانٍ موجودة → FirstSection');
            } else {
                selectedSongType.value = '';
                audioQuality.value = null;
                currentView.value = 'main';
                emit('update:currentView', currentView.value);
                emit('update:topLineImage', null);
                console.log('📌 [onMounted] لا جودة ولا أغاني → عرض كروت اختيار الجودة (main)');
            }
        }

        isInitialLoading.value = false;
        logState();
        return;

    } catch (error) {
        console.error('❌ [onMounted] خطأ أثناء تحميل الأغاني:', error);
    } finally {
        updateSongsCompleteStatus();
        isInitialLoading.value = false;
        logState();
    }
});

onUnmounted(() => {
    // ✅ نُفرّغ أي حفظ مُجدوَل متبقٍّ مباشرةً قبل التدمير كي لا تُفقَد أعلام الاكتمال.
    flushPendingSongSaves();
    isMounted.value = false;
    console.log('🔄 Upload2Component unmounted');

    if (window._tooltipObserver) {
        try {
            window._tooltipObserver.disconnect();
        } catch (e) {
            // تجاهل
        }
        delete window._tooltipObserver;
    }
    
    window.removeEventListener('change-audio-quality', handleChangeAudioQualityFromParent);
    window.removeEventListener('force-edit-song', handleForceEditSong);
    window.removeEventListener('back-to-first-section-from-layout', () => {});
    window.removeEventListener('prevent-step-update', () => {});
    window.removeEventListener('navigate-to-first-section', handleNavigateToFirstSection);
    window.removeEventListener('save-song-complete', handleSaveSongCompleteReconcile);
    if (errorTimeout) clearTimeout(errorTimeout);
});

watch(
    () => tracks.value,
    (newTracks) => {
        if (isPreventingStepUpdate.value) {
            console.log('⏭️ [Upload2Component] Skipping tracks update during prevent');
            return;
        }
        
        console.log('📊 [Upload2Component] tracks changed:', newTracks?.length || 0);
        if (newTracks && newTracks.length > 0) {
            updateSongsCompleteStatus();
        } else {
            releaseStore.setSongsComplete(false);
        }
    },
    { deep: true, immediate: true }
);

watch(selectedSongType, (newVal, oldVal) => {
    console.log('📌 [Upload2Component] selectedSongType changed to:', newVal);

    if (!newVal) return;

    // ✅ جودة الصوت محددة بالفعل → لا نعرض كروت اختيار الجودة (main)؛ ننتقل إلى
    //    FirstSection مباشرةً (حتى لو لا توجد أغانٍ بعد).
    if (currentView.value === 'main' && !forceInfosView.value && !isInSubLayout.value) {
        currentView.value = 'firstSection';
        emit('update:currentView', currentView.value);
    }

    if (tracks.value.length === 0 && props.releaseUuid) {
        console.log('📌 [Upload2Component] tracks فارغة، جلب الأغاني');
        fetchSongs();
    }

    // ✅ نُحدّث صورة الـ top-line دائماً عند تحديد جودة الصوت — بما في ذلك أثناء جلب
    //    الأغاني. الحارس `!isFetchingSongs` القديم كان يُسقط الصورة في حالة الانتقال
    //    التلقائي إلى FirstSection (حيث يبدأ الجلب فوراً) فلا تظهر الصورة في Layout.
    if (audioQualityImageMap[newVal]) {
        updateTopLineImage(audioQualityImageMap[newVal]);
    }
}, { immediate: true });

watch(
    () => route.query.song,
    async (newSongUuid) => {
        if (newSongUuid && props.releaseUuid && props.currentStep === 3 && !isNavigatingBack.value) {
            if (newSongUuid === props.releaseUuid) {
                console.error('❌ خطأ في route.query.song: songUuid هو نفسه releaseUuid');
                clearSongUuidFromUrl();
                return;
            }
            
            console.log('🔄 تم اكتشاف تغير في route.query.song:', newSongUuid);
            if (newSongUuid !== currentSong.value?.uuid) {
                await editSong(newSongUuid);
            }
        } else if (!newSongUuid && currentView.value === 'infos') {
            handleBackFromInfos();
        }
    },
    { immediate: true }
);

watch(() => props.forceInfosView, (newVal) => {
    console.log('🔄 props.forceInfosView تغير:', newVal);
    if (newVal && tracks.value.length > 0 && !isNavigatingBack.value) {
        // Only fall back to the first track when NO specific song is selected.
        // Clicking "Edit" on a track sets the selected song and switches to the
        // infos view, which flips the parent's forceInfosView to true and fires
        // this watcher — without this guard it would override the clicked song
        // with tracks[0], sending the user to the wrong song's Infos.
        const selectedUuid = releaseStore.songUuid || route.query.song || currentSong.value?.uuid;
        if (selectedUuid) {
            console.log('⏭️ [Upload2Component] أغنية محددة مسبقاً، لا نستبدلها بالأولى:', selectedUuid);
            return;
        }
        editSong(tracks.value[0].uuid);
    }
}, { immediate: true });

watch(() => props.forceInfosView, (newVal, oldVal) => {
    console.log('🔄 props.forceInfosView تغير:', { old: oldVal, new: newVal });
    
    if (isNavigatingBack.value) {
        console.log('⏳ [Upload2Component] جاري الرجوع، تخطي تغيير forceInfosView');
        return;
    }
    
    if (oldVal === undefined) {
        console.log('⏳ [Upload2Component] أول مرة، تخطي تغيير forceInfosView');
        return;
    }
    
    if (!newVal && currentView.value === 'infos') {
        console.log('🔄 [Upload2Component] إلغاء forceInfosView - العودة إلى firstSection');
        currentView.value = 'firstSection';
        isInSubLayout.value = false;
        emit('update:currentView', 'firstSection');
        return;
    }
    
    if (newVal && currentView.value === 'firstSection' && !isNavigatingBack.value) {
        console.log('🔄 [Upload2Component] تفعيل forceInfosView - الانتقال إلى infos');
        currentView.value = 'infos';
        isInSubLayout.value = true;
        emit('update:currentView', 'infos');
    }
}, { immediate: true });

watch(
    () => currentView.value,
    () => {
        nextTick(() => {
            removeAllTooltips();
        });
    }
);

watch(
    () => isInSubLayout.value,
    () => {
        nextTick(() => {
            removeAllTooltips();
        });
    }
);

defineExpose({
    handleTopLineImageClick,
    changeAudioQuality,
    currentView,
    selectedSongType,
    handleBackToFirstSection,
    resetFirstMount: () => { isFirstMount = true; },
    isSongComplete,
    updateSongsCompleteStatus,
    fetchSongs,
    setTracksFromParent,
    tracks,
});
</script>

<style lang="scss" scoped>
.component-container {
  width: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  align-self: stretch;
}

.component-container.songs-main-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 100%;
}

.component-container-empty {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
  min-height: 0 !important;
  max-height: 0 !important;
  overflow: hidden !important;
  padding: 0 !important;
  margin: 0 !important;
  border: 0 !important;
  position: absolute !important;
  pointer-events: none !important;
  opacity: 0 !important;
}

*[title] {
  pointer-events: auto;
}

* {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
}

[title]::before,
[title]::after {
  display: none !important;
  content: none !important;
}

svg[title] {
  pointer-events: none;
}

svg[title] * {
  pointer-events: none;
}

button[title]::before,
button[title]::after,
a[title]::before,
a[title]::after,
div[title]::before,
div[title]::after,
img[title]::before,
img[title]::after {
  display: none !important;
  content: none !important;
}

.error-message {
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  background: #DE1456;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-family: Heebo;
  font-size: 14px;
  font-weight: 500;
  z-index: 1000;
  animation: fadeInOut 3s ease forwards;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

@keyframes fadeInOut {
  0% { opacity: 0; transform: translateX(-50%) translateY(20px); }
  15% { opacity: 1; transform: translateX(-50%) translateY(0); }
  85% { opacity: 1; transform: translateX(-50%) translateY(0); }
  100% { opacity: 0; transform: translateX(-50%) translateY(-20px); visibility: hidden; }
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  min-height: 400px;
  gap: 20px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: var(--Strawberry, #DE1456);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.content {
  display: flex;
  justify-content: center;
  align-items: stretch;
  gap: clamp(20px, 2vw, 60px);
  flex: 1 1 auto;
  align-self: stretch;
  width: 100%;
  height: 100% !important;
  min-height: 100% !important;
  padding: 50px 20px 50px 20px;
}

.option {
  display: flex;
  height: 100%;
  min-height: 0;
  flex-direction: column;
  align-items: center;
  gap: 30px;
  flex: 1;
  max-width: 440px;
}

.option .card-songs,
.option .card-songs2,
.option .card-songs3 {
  display: flex;
  width: 100%;
  aspect-ratio: 1/1;
  max-width: 440px;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  gap: 22px;
  border-radius: 20px;
  box-shadow: 4px 4px 20px 0 rgba(27, 28, 32, 0.70);
  position: relative;
  cursor: pointer;
  background-size: cover !important;
  background-position: center !important;
  background-repeat: no-repeat !important;
}

.card-songs { background: url('/img/bgCardSongs/card1.png') center/contain no-repeat; }
.card-songs2 { background: url('/img/bgCardSongs/card2.png') center/contain no-repeat; }
.card-songs3 { background: url('/img/bgCardSongs/card3.png') center/contain no-repeat; }

.image-overlay {
  display: flex;
  padding: 32px 28px;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
  flex: 1 0 0;
  align-self: stretch;
  border-radius: 20px;
  transition: background 0.5s ease;
  background: url(../../assets/icons/dashboard/user/shadows.png) 50% / cover no-repeat;
}

.option:hover .image-overlay,
.image-overlay.no-overlay {
  background: none !important;
}

.option .description {
  align-self: stretch;
  color: var(--Main-Colors-White, #FFF);
  text-align: center;
  font-family: Heebo;
  font-size: clamp(14px, 1.2vw, 18px);
  font-style: normal;
  font-weight: 300;
  line-height: 1.5;
  max-width: 444px;
}

.card-songs .logo {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 303px;
  height: 119px;
  background: url('/img/bgCardSongs/logo/logo1.png') 50% / cover no-repeat;
}

.card-songs2 .logo {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 303px;
  height: 119px;
  background: url('/img/bgCardSongs/logo/logo2.png') 50% / cover no-repeat;
  transition: top 0.5s ease, width 0.5s ease, height 0.5s ease;
}

.card-songs2 .logo.shifted {
  top: 190px;
  width: 302.7px;
  height: 107.1px;
}

.card-songs3 .logo {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 230px;
  height: 95px;
  background: url('/img/bgCardSongs/logo/logo3.png') 50% / cover no-repeat;
  transition: top 0.5s ease, width 0.5s ease, height 0.5s ease;
}

.card-songs3 .logo.shifted {
  top: 190px;
  width: 230px;
  height: 90px;
}

.Form {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  align-self: stretch;
  position: relative;
}

.Form .Form-filed {
  display: flex;
  width: 304px;
  padding: 8px 12px;
  justify-content: space-between;
  align-items: center;
  position: absolute;
  top: -65px;
  border-radius: 5px;
  background: var(--primary);
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.5s ease, transform 0.5s ease, border 0.3s ease;
  border: 1px solid var(--primary);
}

.Form .Form-filed.visible {
  opacity: 1;
  transform: translateY(0);
  color: #FFF;
}

.Form .Form-filed:hover {
  border: 1px solid var(--move);
}

.Form-filed .email-input {
  color: var(--Main-Colors-Dove, #6A6C6D);
  font-family: Heebo;
  font-size: 20px;
  font-style: normal;
  font-weight: 300;
  line-height: 1;
  letter-spacing: 1px;
  background: transparent;
  border: none;
  outline: none;
  flex: 1;
}

.Form-filed .email-input.has-text {
  color: var(--Main-Colors-White, #FFF);
}

.Form-filed .email-input::placeholder {
  color: var(--Main-Colors-Dove, #6A6C6D);
}

.Form-filed .checkmark {
  width: 20px;
}

.Form .btn-primary,
.btn-primary1 {
  display: flex;
  padding: 12px 20px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  border-radius: 5px;
  background: var(--Main-Colors-Slate-Light, #3A3E42);
  transition: background 0.3s ease;
}

.btn-primary1 {
  background: var(--Strawberry);
}

.btn-primary1:hover {
  background: var(--dark-red);
}

.Form .btn-primary.active {
  background: var(--Strawberry);
}

.Form .btn-primary.active:hover {
  background: var(--dark-red);
}

.btn-primary1 .p {
  font-family: Heebo;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: 1;
  text-transform: uppercase;
  color: #FFF;
}

.btn-primary .p {
  color: #6A6C6D;
  font-family: Heebo;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: 1;
  text-transform: uppercase;
}

.btn-primary.active .p {
  color: var(--Main-Colors-White, #FFF);
}

@media (max-width:1599px) {
  .content { gap: clamp(15px, 1.5vw, 30px); }
  .option .card-songs, 
  .option .card-songs2, 
  .option .card-songs3 {
    max-width: 362px;
  }


  .Form .Form-filed{
    width: 270px;
  }
  .card-songs .logo { width: 270px; height: 100px; }
  .card-songs2 .logo { width: 280px; height: 115px; }
  .card-songs3 .logo { width: 200px;height: 75px; }
  .card-songs3 .logo.shifted { top:128px; }
  .card-songs2 .logo.shifted { top:128px; }
}

@media (min-width:1600px) and (max-width:2074px) {
  .option .card-songs, 
  .option .card-songs2, 
  .option .card-songs3 {
    max-width: 380px;
  }
  .card-songs3 .logo.shifted,
  .card-songs2 .logo.shifted { top:128px; }
}

@media (min-width:2075px) and (max-width:2560px) {
  .content { gap: clamp(30px, 3vw, 60px); }
  .option .card-songs, 
  .option .card-songs2, 
  .option .card-songs3 {
    max-width: 440px;
  }
  
  .card-songs .logo { width: 340px; height: 142px; }
  .card-songs2 .logo { width: 350px; height: 150px; }
  .card-songs3 .logo { width: 230px; }
}
</style>