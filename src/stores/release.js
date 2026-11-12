// src/stores/release.js - Updated version
import { defineStore } from "pinia";
import { computeTabCompletion, isSongComplete, isInstrumentalSong } from "@/utils/songCompletion";

export const useReleaseStore = defineStore('release', {
  state: () => ({
    releaseType: null,
    releaseTypeValue: null,
    currentReleaseId: null,
    pendingCoverFile: null,
    songUuid: null,         
    currentSongTitle: null,
    currentSongNumber: null,
    currentStep: 1,
    metasPage: 'right',
    isMetasComplete: false,
    isSongsComplete: false,
    hasUploadedAudio: false,
    isShopsComplete: false,
    isPublishComplete: false,
    draftRelease: null,
    serverCoverUrl: null,
    _startComplete: false,
    _isUpdating: false,
    _isReturningFromSongs: false,
    _preserveSongsComplete: false,
    
    tabCompletion: {
      infos: false,
      urheber: false,
      mitwirkende: false,
      deals: false,
      'pre-release': false
    },

    lastSongTabs: {},

    // حقول التصحيح القادمة من الباكإند (status: correction).
    // release: مصفوفة أسماء حقول — songs: { [songUuid]: [أسماء حقول] }
    correctionFields: { release: [], songs: {} },
    // أوّل موضع يحتاج تدخّل المستخدم {step, view, tab, songUuid, field}
    // Korrektur: حقل مطلوب تصحيحه — Entwürfe: حقل ناقص.
    editTarget: null,

    metasData: {
      title: '',
      subtitle: '',
      releaseDate: null,
      artists: [],
      releasePrice: null,
      songPrice: null,
      mainGenre: '',
      subGenre: '',
      label: '',
      productionYear: null,
      cLineYear: null,
      cLineName: '',
      pLineYear: null,
      pLineName: '',
      gtin: '',
      catalogNumber: ''
    }
  }),
  
  getters: {
    hasCover: (state) => {
      if (state.metasData?.cover) return true;
      if (state.serverCoverUrl && state.serverCoverUrl !== '/img/bgCardSongs/card1.png') return true;
      if (state.draftRelease?.cover) return true;
      return false;
    },
    
    isStartComplete: (state) => {
      if (state._startComplete !== undefined && state._startComplete !== null) {
        return state._startComplete === true;
      }
      const hasReleaseType = !!(state.releaseType || state.releaseTypeValue);
      return hasReleaseType && state.hasCover;
    },
    
    isCurrentStepComplete: (state) => {
      switch (state.currentStep) {
        case 1: return state.isStartComplete === true;
        case 2: return state.isMetasComplete === true;
        case 3: return state.isSongsComplete === true;
        case 4: return state.isShopsComplete === true;
        case 5: return state.isPublishComplete === true;
        default: return false;
      }
    },
    
    hasBasicMetasData: (state) => {
      const hasTitle = Boolean(state.metasData.title && state.metasData.title.trim() !== '');
      const hasArtists = Boolean(
        state.metasData.artists &&
        state.metasData.artists.length > 0 && 
        state.metasData.artists.some(a => a && a.trim() !== '')
      );
      const hasReleaseDate = Boolean(state.metasData.releaseDate && state.metasData.releaseDate.trim() !== '');
      return hasTitle && hasArtists && hasReleaseDate;
    },
    
    getMetasData: (state) => {
      return { ...state.metasData };
    },
    
    getMetasPage: (state) => {
      return state.metasPage;
    },
    
    isTabComplete: (state) => (tabId) => {
      return state.tabCompletion[tabId] || false;
    },
    
    getCompletedTabs: (state) => {
      return Object.keys(state.tabCompletion).filter(key => state.tabCompletion[key] === true);
    },
    
    areAllTabsComplete: (state) => {
      return Object.values(state.tabCompletion).every(value => value === true);
    }
  },
  
  actions: {
    setStartComplete(value) {
      const booleanValue = value === true;
      if (this._startComplete !== booleanValue) {
        this._startComplete = booleanValue;
        console.log('📌 Store: _startComplete set to', booleanValue);
        
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('store-updated', {
            detail: { 
              type: 'start-complete', 
              value: booleanValue,
              timestamp: Date.now()
            }
          }));
        }
      }
    },
    
    setReleaseType(type) {
      this.releaseType = type;
      this.updateStartComplete();
    },
    
    setReleaseTypeValue(value) {
      this.releaseTypeValue = value;
      this.updateStartComplete();
    },
    
    updateStartComplete() {
      const hasReleaseType = !!(this.releaseType || this.releaseTypeValue);
      const hasCover = this.hasCover;
      const isComplete = hasReleaseType && hasCover;
      
      if (this._startComplete !== isComplete) {
        this._startComplete = isComplete;
        console.log('📌 Store: _startComplete auto-updated to', isComplete);
        
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('store-updated', {
            detail: { 
              type: 'start-complete', 
              value: isComplete,
              timestamp: Date.now()
            }
          }));
        }
      }
    },
    
    setCurrentReleaseId(id) {
      this.currentReleaseId = id;
    },
    
    setPendingCover(file) {
      this.pendingCoverFile = file;
    },
    
    clearPendingCover() {
      this.pendingCoverFile = null;
    },
    
    setDraftRelease(release) {
      this.draftRelease = release;
      if (release?.cover) {
        const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || 'https://zoundr-flow-api.davinda.dev/storage';
        const coverUrl = release.cover.startsWith('http') ? release.cover : `${STORAGE_URL}/${release.cover}`;
        this.serverCoverUrl = coverUrl;
        console.log('🖼️ Store: draftRelease and serverCoverUrl updated');
        this.updateStartComplete();
      }
    },
    
    setServerCoverUrl(url) {
      this.serverCoverUrl = url;
      console.log('🖼️ Store: serverCoverUrl set to:', url);
      this.updateStartComplete();
    },
    
    setCurrentSongTitle(title) {
      this.currentSongTitle = title;
      console.log('🎵 Store: currentSongTitle set to:', title);
    },
    
    setCurrentSongNumber(number) {
      this.currentSongNumber = number;
      console.log('🔢 Store: currentSongNumber set to:', number);
    },
    
    getFullSongTitle() {
      if (this.currentSongNumber && this.currentSongTitle) {
        return `${this.currentSongNumber} ${this.currentSongTitle}`;
      }
      return this.currentSongTitle || '';
    },
    
    setSongUuid(uuid) {
      this.songUuid = uuid;
      console.log('🎵 Store: songUuid set to:', uuid);
    },
    
    clearSongUuid() {
      this.songUuid = null;
      this.currentSongTitle = null;
      this.currentSongNumber = null;
      console.log('🗑️ Store: songUuid and song details cleared');
    },
    
    setCurrentStep(step) {
      if (step >= 1 && step <= 5) {
        if (this.currentStep !== step) {
          if (this.currentStep === 3 && step === 2) {
            console.log('🔄 Store: الانتقال من Songs إلى Metas - الحفاظ على isMetasComplete:', this.isMetasComplete);
            console.log('🔄 Store: الانتقال من Songs إلى Metas - الحفاظ على isSongsComplete:', this.isSongsComplete);
            this._isReturningFromSongs = true;
            this._preserveSongsComplete = true;
          }
          
          this.currentStep = step;
          console.log('📌 Store: currentStep set to', step);
        }
      }
    },
    
    resetCurrentStep() {
      this.currentStep = 1;
    },
    
    setMetasComplete(value) {
      const booleanValue = value === true;

      if (this._isReturningFromSongs) {
        console.log('🔄 Store: عودة من Songs، الحفاظ على isMetasComplete:', this.isMetasComplete);
        return;
      }

      // NOTE: no shared _isUpdating lock here — it used to block a concurrent
      // setSongsComplete/setPublishComplete (they share the same flag), leaving
      // completion states unset. The value-change guard below already prevents loops.
      if (this.isMetasComplete !== booleanValue) {
        this.isMetasComplete = booleanValue;
        console.log('📌 Store: isMetasComplete set to', booleanValue);

        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('store-updated', {
            detail: {
              type: 'metas-complete',
              value: booleanValue,
              timestamp: Date.now()
            }
          }));
        }
      } else {
        console.log('📌 Store: isMetasComplete unchanged (already', booleanValue, ')');
      }
    },

    setSongsComplete(value) {
      const booleanValue = value === true;

      if (this._preserveSongsComplete) {
        console.log('🔄 Store: عودة من Songs، الحفاظ على isSongsComplete:', this.isSongsComplete);
        return;
      }

      if (this.isSongsComplete !== booleanValue) {
        this.isSongsComplete = booleanValue;
        console.log('📌 Store: isSongsComplete set to', booleanValue);

        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('store-updated', {
            detail: {
              type: 'songs-complete',
              value: booleanValue,
              timestamp: Date.now()
            }
          }));
        }
      } else {
        console.log('📌 Store: isSongsComplete unchanged (already', booleanValue, ')');
      }
    },
    
    // يستخرج corrections من الـ release وأغانيه ويحفظها لتحديد الحقول ببوردر أحمر.
    setCorrections(release) {
      const asList = (v) =>
        Array.isArray(v) ? v.filter((x) => typeof x === 'string' && x.trim() !== '') : [];

      const songs = {};
      (Array.isArray(release?.songs) ? release.songs : []).forEach((song) => {
        const fields = asList(song?.corrections);
        if (song?.uuid && fields.length) songs[song.uuid] = fields;
      });

      this.correctionFields = { release: asList(release?.corrections), songs };
      console.log('✏️ Store: correctionFields', this.correctionFields);
    },

    setEditTarget(target) {
      this.editTarget = target || null;
      console.log('✏️ Store: editTarget', this.editTarget);
    },

    clearCorrections() {
      this.correctionFields = { release: [], songs: {} };
      this.editTarget = null;
    },

    setLastSongTab(uuid, tab) {
      const validTabs = ['infos', 'urheber', 'mitwirkende', 'deals', 'pre-release'];
      if (!uuid || !validTabs.includes(tab)) return;
      this.lastSongTabs = { ...this.lastSongTabs, [uuid]: tab };
      console.log('📌 Store: lastSongTab set:', uuid, '->', tab);
    },

    setHasUploadedAudio(value) {
      const booleanValue = value === true;
      if (this.hasUploadedAudio !== booleanValue) {
        this.hasUploadedAudio = booleanValue;
        console.log('📌 Store: hasUploadedAudio set to', booleanValue);
      }
    },

    setShopsComplete(value) {
      const booleanValue = value === true;
      
      if (this.isShopsComplete !== booleanValue) {
        this.isShopsComplete = booleanValue;
        console.log('📌 Store: isShopsComplete set to', booleanValue);
        
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('store-updated', {
            detail: { 
              type: 'shops-complete',
              value: booleanValue,
              timestamp: Date.now()
            }
          }));
        }
      } else {
        console.log('📌 Store: isShopsComplete unchanged (already', booleanValue, ')');
      }
    },
    
    setPublishComplete(value) {
      const booleanValue = value === true;

      if (this.isPublishComplete !== booleanValue) {
        this.isPublishComplete = booleanValue;
        console.log('📌 Store: isPublishComplete set to', booleanValue);

        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('store-updated', {
            detail: {
              type: 'publish-complete',
              value: booleanValue,
              timestamp: Date.now()
            }
          }));
        }
      } else {
        console.log('📌 Store: isPublishComplete unchanged (already', booleanValue, ')');
      }
    },
    
    setMetasPage(page) {
      if (this.metasPage !== page) {
        this.metasPage = page;
        console.log('📌 Store: metasPage set to', page);
      }
    },
    
    updateTabCompletion(completion) {
      if (!completion || typeof completion !== 'object') {
        console.warn('⚠️ Store: invalid completion data', completion);
        return;
      }
      
      const validKeys = Object.keys(this.tabCompletion);
      let hasChanges = false;
      
      Object.keys(completion).forEach(key => {
        if (validKeys.includes(key) && typeof completion[key] === 'boolean') {
          if (this.tabCompletion[key] !== completion[key]) {
            this.tabCompletion[key] = completion[key];
            hasChanges = true;
          }
        }
      });
      
      if (hasChanges) {
        console.log('📌 Store: tabCompletion updated:', this.tabCompletion);
        
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('tab-completion-updated', {
            detail: { 
              tabCompletion: { ...this.tabCompletion },
              timestamp: Date.now()
            }
          }));
        }
      }
    },
    
    resetTabCompletion() {
      this.tabCompletion = {
        infos: false,
        urheber: false,
        mitwirkende: false,
        deals: false,
        'pre-release': false
      };
      console.log('📌 Store: tabCompletion reset');
    },
    
    resetTabCompletionForNewSong() {
      // All tabs start incomplete for a new song. Deals/Pre-Release only become
      // complete once the user opens them (see Infos1.compileAllData), matching the
      // backend flags deals_step_completed / pre_release_step_completed.
      this.tabCompletion = {
        infos: false,
        urheber: false,
        mitwirkende: false,
        deals: false,
        'pre-release': false
      };
      console.log('🧹 Store: tabCompletion reset for new song (all incomplete)');
    },
    
    checkTabComplete(tabId) {
      return this.tabCompletion[tabId] || false;
    },
    
    getNextIncompleteTab(currentTab, tabOrder) {
      const order = tabOrder || ['infos', 'urheber', 'mitwirkende', 'deals', 'pre-release'];
      const currentIndex = order.indexOf(currentTab);
      
      if (currentIndex === -1) return null;
      
      for (let i = currentIndex + 1; i < order.length; i++) {
        const tabId = order[i];
        if (!this.tabCompletion[tabId]) {
          return tabId;
        }
      }
      return null;
    },
    
    getFirstIncompleteTab(tabOrder) {
      const order = tabOrder || ['infos', 'urheber', 'mitwirkende', 'deals', 'pre-release'];
      
      for (let i = 0; i < order.length; i++) {
        const tabId = order[i];
        if (!this.tabCompletion[tabId]) {
          return tabId;
        }
      }
      return null;
    },
    
    updateMetasData(data) {
      if (this._isReturningFromSongs) {
        console.log('🔄 Store: عودة من Songs، تحديث metasData فقط دون تغيير isMetasComplete');
        this.metasData = {
          ...this.metasData,
          ...data
        };
        console.log('📌 Store: metasData updated (preserving isMetasComplete:', this.isMetasComplete, ')');
        return;
      }
      
      this.metasData = {
        ...this.metasData,
        ...data
      };
      
      const hasTitle = Boolean(this.metasData.title && this.metasData.title.trim() !== '');
      const hasArtists = Boolean(
        this.metasData.artists &&
        this.metasData.artists.length > 0 &&
        this.metasData.artists.some(a => a && a.trim() !== '')
      );
      const hasReleaseDate = Boolean(this.metasData.releaseDate && this.metasData.releaseDate.trim() !== '');
      
      const isComplete = hasTitle && hasArtists && hasReleaseDate;
      
      if (this.isMetasComplete !== isComplete) {
        this.setMetasComplete(isComplete);
      }
      
      console.log('📌 Store: metasData updated, complete:', isComplete);
    },
    
    resetAllData() {
      this.releaseType = null;
      this.releaseTypeValue = null;
      this.currentReleaseId = null;
      this.pendingCoverFile = null;
      this.songUuid = null;
      this.currentSongTitle = null;
      this.currentSongNumber = null;
      this.currentStep = 1;
      this.metasPage = 'right';
      this.isMetasComplete = false;
      this.isSongsComplete = false;
      this.hasUploadedAudio = false;
      this.lastSongTabs = {};
      this.isShopsComplete = false;
      this.isPublishComplete = false;
      this.draftRelease = null;
      this.serverCoverUrl = null;
      this._startComplete = false;
      this._isUpdating = false;
      this._isReturningFromSongs = false;
      this._preserveSongsComplete = false;
      
      this.resetTabCompletion();
      
      this.metasData = {
        title: '',
        subtitle: '',
        releaseDate: null,
        artists: [],
        releasePrice: null,
        songPrice: null,
        mainGenre: '',
        subGenre: '',
        label: '',
        productionYear: null,
        cLineYear: null,
        cLineName: '',
        pLineYear: null,
        pLineName: '',
        gtin: '',
        catalogNumber: ''
      };
      
      try {
        localStorage.removeItem('upload_server_cover_url');
        localStorage.removeItem('upload2_state');
        localStorage.removeItem('upload2_selectedType');
        localStorage.removeItem('upload1_state');
        localStorage.removeItem('upload_component_state');
        localStorage.removeItem('upload3_state');
        localStorage.removeItem('upload4_state');
        localStorage.removeItem('last_metas_page');
      } catch (e) {
        console.warn('⚠️ Could not clear localStorage:', e);
      }
      
      console.log('🔄 Store: All data reset including serverCoverUrl and localStorage');
    },
    
    isStepComplete(stepNumber) {
      switch (stepNumber) {
        case 1: return this.isStartComplete === true;
        case 2: return this.isMetasComplete === true;
        case 3: return this.isSongsComplete === true;
        case 4: return this.isShopsComplete === true;
        case 5: return this.isPublishComplete === true;
        default: return false;
      }
    },
    
    canNavigateToStep(stepNumber, currentStep) {
      const current = currentStep || this.currentStep;
      
      if (stepNumber === 1) return true;
      if (stepNumber > current + 1) return false;
      if (stepNumber <= current) return true;
      
      return this.isStepComplete(current);
    },
    
    determineMetasPage(release) {
      if (!release) return 'right';

      // ✏️ صفحة التصحيح أولى من استنتاج "توجد بيانات متقدّمة".
      if (this.editTarget && this.editTarget.step === 2 && this.editTarget.view) {
        this.setMetasPage(this.editTarget.view);
        return this.editTarget.view;
      }
      
      const hasAdvancedData = release.label || 
                             release.production_year || 
                             release.c_line_name || 
                             release.c_line_year || 
                             release.p_line_name || 
                             release.p_line_year;
      
      if (hasAdvancedData) {
        console.log('📌 توجد بيانات متقدمة → NewRight2');
        this.setMetasPage('newRight2');
        return 'newRight2';
      }
      
      const hasPricingData = release.release_price || 
                            release.price_per_song || 
                            release.main_genre || 
                            release.sub_genre;
      
      if (hasPricingData) {
        console.log('📌 توجد بيانات السعر والنوع → NewRight');
        this.setMetasPage('newRight');
        return 'newRight';
      }
      
      if (this.metasPage && this.metasPage !== 'right') {
        console.log(`📌 استعادة الصفحة المحفوظة: ${this.metasPage}`);
        return this.metasPage;
      }
      
      console.log('📌 الصفحة الافتراضية → Right');
      this.setMetasPage('right');
      return 'right';
    },
    
    determineStepFromRelease(release, updateCurrentStep = true, preserveMetasComplete = false, preserveSongsComplete = false, preventPublishAutoNav = false) {
      if (!release) {
        console.warn('⚠️ No release data provided, defaulting to step 2');
        return 2;
      }

      console.log('📌 Determining step from release data:', release.uuid);

      this.setDraftRelease(release);

      // ========== 1. تحليل بيانات Metas ==========
      const hasTitle = Boolean(release.title && release.title.trim() !== '');
      const hasArtists = Boolean(release.artists && release.artists.length > 0);
      const hasReleaseDate = Boolean(release.release_date);
      const hasCover = Boolean(release.cover && release.cover.trim() !== '');
      const isMetasComplete = hasTitle && hasArtists && hasReleaseDate && hasCover;
      
      if (preserveMetasComplete || this._isReturningFromSongs) {
        console.log(`📌 الحفاظ على isMetasComplete: ${this.isMetasComplete} (لا نغير)`);
        this.metasData = {
          ...this.metasData,
          title: release.title || '',
          subtitle: release.subtitle || '',
          releaseDate: release.release_date || null,
          artists: release.artists || [],
          releasePrice: release.release_price || null,
          songPrice: release.price_per_song || null,
          mainGenre: release.main_genre || '',
          subGenre: release.sub_genre || '',
          label: release.label || '',
          productionYear: release.production_year || null,
          cLineYear: release.c_line_year || null,
          cLineName: release.c_line_name || '',
          pLineYear: release.p_line_year || null,
          pLineName: release.p_line_name || '',
          gtin: release.GTIN || '',
          catalogNumber: release.catalog_number || ''
        };
        console.log('📌 Store: metasData updated (preserving isMetasComplete:', this.isMetasComplete, ')');
      } else {
        if (this.isMetasComplete !== isMetasComplete) {
          this.setMetasComplete(isMetasComplete);
          console.log(`📌 Store: isMetasComplete set to ${isMetasComplete}`);
        }
        
        this.updateMetasData({
          title: release.title || '',
          subtitle: release.subtitle || '',
          releaseDate: release.release_date || null,
          artists: release.artists || [],
          releasePrice: release.release_price || null,
          songPrice: release.price_per_song || null,
          mainGenre: release.main_genre || '',
          subGenre: release.sub_genre || '',
          label: release.label || '',
          productionYear: release.production_year || null,
          cLineYear: release.c_line_year || null,
          cLineName: release.c_line_name || '',
          pLineYear: release.p_line_year || null,
          pLineName: release.p_line_name || '',
          gtin: release.GTIN || '',
          catalogNumber: release.catalog_number || ''
        });
      }

      // ========== 2. تحليل بيانات Songs ==========
      const songs = release.songs || [];
      const hasSongs = songs.length > 0;

      let newSongsComplete = false;
      if (hasSongs) {
        console.log(`📌 تحليل ${songs.length} أغاني...`);
        
        // ✅ المصدر المشترك @/utils/songCompletion — مطابق تماماً لـ
        //    FirstSection.isTrackComplete و tabs.vue و Infos1 و Upload2Component.
        newSongsComplete = songs.every(song => {
          const complete = isSongComplete(song);
          console.log(`  🎵 أغنية "${song.title || 'untitled'}"`, {
            ...computeTabCompletion(song),
            isInstrumental: isInstrumentalSong(song),
            hasSongFile: !!song.song_file,
            isComplete: complete
          });
          return complete;
        });
      }

      if (preserveSongsComplete || this._preserveSongsComplete) {
        console.log(`📌 الحفاظ على isSongsComplete: ${this.isSongsComplete} (لا نغير)`);
      } else {
        if (this.isSongsComplete !== newSongsComplete) {
          this.setSongsComplete(newSongsComplete);
        }
        console.log(`📌 Songs ${newSongsComplete ? 'مكتملة ✅' : 'غير مكتملة ❌'}`);
      }

      // ========== 3. تحليل بيانات Shops ==========
      const hasStores = release.stores && release.stores.length > 0;
      
      // ✅ تحديث isShopsComplete مباشرة
      if (this.isShopsComplete !== hasStores) {
        this.isShopsComplete = hasStores;
        console.log('📌 Store: isShopsComplete set to', hasStores);
        
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('store-updated', {
            detail: { 
              type: 'shops-complete',
              value: hasStores,
              timestamp: Date.now()
            }
          }));
        }
      }
      console.log(`📌 Shops ${hasStores ? 'محددة ✅' : 'غير محددة ❌'}`);
      console.log(`📌 isShopsComplete في الـ Store: ${this.isShopsComplete}`);

      // ========== 4. تحليل بيانات Publish ==========
      // isPublishReady = خطوة Publish أصبحت "قابلة للتعبئة" (كل ما قبلها مكتمل)، وليست
      // "مكتملة". اكتمال Publish يُضبط حصرياً من Upload4Component بعد تعبئة الفورم والنقر
      // على الموافقة (زر التشيك مارك) — لا من مجرّد اكتمال Shops. لذلك لا نضبطه true هنا؛
      // نكتفي بإعادته إلى false عند فقدان المتطلبات كي لا يبقى مكتملاً زوراً.
      const isPublishReady = release.status === 'draft' &&
                             this.isMetasComplete &&
                             hasSongs &&
                             this.isSongsComplete &&
                             hasStores;

      if (!isPublishReady && this.isPublishComplete) {
        this.setPublishComplete(false);
      }

      console.log('📊 تحليل البيانات:');
      console.log('  📌 Metas:', { hasTitle, hasArtists, hasReleaseDate, hasCover, isMetasComplete: this.isMetasComplete });
      console.log('  📌 Songs:', { hasSongs, isSongsComplete: this.isSongsComplete });
      console.log('  📌 Shops:', { hasStores, isShopsComplete: this.isShopsComplete });
      console.log('  📌 Publish:', { isPublishReady });
      console.log('  📌 Current Step:', this.currentStep);
      console.log('  📌 preventPublishAutoNav:', preventPublishAutoNav);

      this.determineMetasPage(release);

      // ========== 7. تحديد الخطوة المناسبة ==========
      let targetStep = this.currentStep;
      const songsComplete = newSongsComplete;

      if (songsComplete) {
        if (this.isMetasComplete) {
          if (hasStores) {
            if (preventPublishAutoNav) {
              console.log('⏸️ [Store] preventPublishAutoNav is true, going to Shops (step 4) instead of Publish');
              targetStep = 4;
              // ملاحظة: لا نضبط isPublishComplete هنا. اكتمال Publish حصراً من Upload4
              // (فورم معبّأ + موافقة)، وليس لمجرّد اكتمال Shops.
            } else {
              console.log('📌 Metas + Songs + Shops مكتملة ✅ → الانتقال إلى Publish (الخطوة 5)');
              targetStep = 5;
            }
          } else {
            // ✅ لا انتقال تلقائي إلى Shops. اكتمال Songs لا يعني أن المستخدم أنهى
            //    عمله فيها؛ Shops خطوة يدخلها بنقر «Weiter zu Shops» أو من القائمة
            //    الجانبية. كان القفز هنا يسحبه من Songs أثناء العمل رغم أنه لم يختر
            //    أي متجر بعد (hasStores = false).
            console.log('📌 Metas + Songs مكتملة ✅ لكن لا متاجر → البقاء في Songs (الخطوة 3)');
            targetStep = 3;
          }
        } else {
          console.log('📌 Songs مكتملة لكن Metas غير مكتملة → الانتقال إلى Metas (الخطوة 2)');
          targetStep = 2;
        }
      } else if (hasSongs) {
        console.log('📌 توجد Songs غير مكتملة → الانتقال إلى Songs (الخطوة 3)');
        targetStep = 3;
      } else if (this.isMetasComplete) {
        console.log('📌 Metas مكتملة ✅ ولا توجد Songs → الانتقال إلى Metas (الخطوة 2)');
        targetStep = 2;
      } else if (hasCover) {
        console.log('📌 يوجد cover (اكتملت Start) → الانتقال إلى Metas (الخطوة 2)');
        targetStep = 2;
      } else {
        console.log('📌 لا توجد بيانات كافية → البقاء في Start (الخطوة 1)');
        targetStep = 1;
      }

      console.log(`✅ الخطوة النهائية: ${targetStep}`);
      console.log(`📌 updateCurrentStep: ${updateCurrentStep}, currentStep الحالي: ${this.currentStep}`);

      if (updateCurrentStep) {
        if (this.currentStep !== targetStep) {
          this.setCurrentStep(targetStep);
          console.log(`📌 تم تحديث currentStep إلى: ${targetStep}`);
        } else {
          console.log(`📌 currentStep unchanged (already ${this.currentStep})`);
        }
        return targetStep;
      }
      
      console.log(`📌 updateCurrentStep = false, keeping currentStep at ${this.currentStep}`);
      return this.currentStep;
    },
    
    resetReturningFromSongs() {
      this._isReturningFromSongs = false;
      this._preserveSongsComplete = false;
      console.log('🔄 Store: reset _isReturningFromSongs and _preserveSongsComplete to false');
    }
  }
});