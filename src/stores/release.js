// src/stores/release.js
import { defineStore } from "pinia";

export const useReleaseStore = defineStore('release', {
  state: () => ({
    releaseType: null,
    currentReleaseId: null,
    pendingCoverFile: null,
    songUuid: null,         
    currentSongTitle: null,
  }),
  actions: {
    setReleaseType(type) {
      this.releaseType = type;
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
    setCurrentSongTitle(title) { // إضافة هذه الدالة
      this.currentSongTitle = title
    },
    setSongUuid(uuid) {       // ← جديد
      this.songUuid = uuid;
    },
    clearSongUuid() {         // ← جديد (اختياري)
      this.songUuid = null;
      this.currentSongTitle = null
    }
  }
});