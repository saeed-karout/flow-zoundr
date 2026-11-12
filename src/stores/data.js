


// stores/data.js
import { defineStore } from 'pinia';
import axios from 'axios';
import { api_url } from '@/constants';
import authHeader from '@/services/auth-header';
import { user_api_url } from '@/zoundr/constants';

let broadcastChannel = null;
// سفاري لم يدعم BroadcastChannel قبل 15.4، والاستدعاء المباشر يرمي
// ReferenceError عند تحميل الوحدة فيسقط التطبيق كلّه.
if (typeof window !== 'undefined' && typeof BroadcastChannel !== 'undefined') {
  broadcastChannel = new BroadcastChannel('schutzen_session_channel');
}

export const useDataStore = defineStore('data', {
  state: () => ({
    user: null,
    totalPrice: 0,
    fileCount: 0,
    sessionKey: null,
    paymentFormData: null,
  }),

  actions: {
    loadFromStorage() {
      const data = localStorage.getItem('schutzen_session');
      if (data) {
        try {
          const parsed = JSON.parse(data);
          this.fileCount = parsed.fileCount || 0;
          this.sessionKey = parsed.sessionKey || null;
          this.totalPrice = parsed.totalPrice || 0;
        } catch (e) {
          this.clearSession();
        }
      }
    },

    setFileCount(count) {
      this.fileCount = count;
      if (count > 0 && !this.sessionKey) {
        this.sessionKey = Date.now().toString(36) + Math.random().toString(36).substr(2);
      }
      this.saveToStorage();
      this.broadcastUpdate(); // ← مهم جدًا
    },

    setTotalPrice(price) {
      this.totalPrice = price;
      this.saveToStorage();
    },

    saveToStorage() {
      const data = {
        fileCount: this.fileCount,
        sessionKey: this.sessionKey,
        totalPrice: this.totalPrice,
      };
      localStorage.setItem('schutzen_session', JSON.stringify(data));
    },

    // إرسال تحديث لكل التبويبات
    broadcastUpdate() {
      if (broadcastChannel) {
        broadcastChannel.postMessage({
          type: 'SESSION_UPDATE',
          fileCount: this.fileCount,
          sessionKey: this.sessionKey,
        });
      }
    },

    clearSession() {
      this.fileCount = 0;
      this.sessionKey = null;
      this.totalPrice = 0;
      this.paymentFormData = null;
      localStorage.removeItem('schutzen_session');
      localStorage.removeItem('authorSelections');
      localStorage.removeItem('paymentFormData');
      localStorage.removeItem('paymentStatus');
      this.broadcastUpdate(); // ← مهم: نخبر كل التبويبات أن الجلسة انتهت
    },

    loadUser() {
      return axios.get(`${user_api_url}/user`, {
        headers: { ...authHeader() }
      }).then((response) => {
        this.user = response.data.data;
      }).catch(error => {
        console.error('Error loading user:', error);
      });
    },

    setTotalPrice(price) {
      this.totalPrice = price;
      this.saveToStorage();
    },
    setPaymentFormData(data) {
      this.paymentFormData = data;
    },
    clearPaymentFormData() {
      this.paymentFormData = null;
    },
  },
});