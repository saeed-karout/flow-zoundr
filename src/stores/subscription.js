import { defineStore } from 'pinia';
import { subscriptionService } from '@/services/subscriptionService';

export const useSubscriptionStore = defineStore('subscription', {
  state: () => ({
    subscription: null,
    isSubscribed: false,
    subscriptionStatus: null,
    expiresAt: null,
    isLoading: false,
    isInitialized: false,
  }),
  
  getters: {
    isActive: (state) => {
      if (!state.subscription) return false;
      if (!state.subscription.subscribed) return false;
      if (state.subscription.subscription?.status !== 'active') return false;
      
      const expiresAt = state.subscription.subscription?.expires_at;
      if (expiresAt) {
        return new Date(expiresAt) > new Date();
      }
      return true;
    },
    
    formattedExpiry: (state) => {
      const expiresAt = state.subscription?.subscription?.expires_at;
      if (!expiresAt) return null;
      return new Date(expiresAt).toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
  },
  
  actions: {
    async fetchSubscription() {
      if (this.isLoading) return;
      
      this.isLoading = true;
      try {
        const data = await subscriptionService.getSubscriptionStatus();
        this.setSubscription(data);
        this.isInitialized = true;
        console.log('✅ Subscription loaded:', data);
        return data;
      } catch (error) {
        console.error('❌ Failed to fetch subscription:', error);
        this.isInitialized = true;
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    
    setSubscription(data) {
      this.subscription = data;
      this.isSubscribed = data?.subscribed || false;
      this.subscriptionStatus = data?.subscription?.status || null;
      this.expiresAt = data?.subscription?.expires_at || null;
    },
    
    async refreshSubscription() {
      await this.fetchSubscription();
    },
    
    clearSubscription() {
      this.subscription = null;
      this.isSubscribed = false;
      this.subscriptionStatus = null;
      this.expiresAt = null;
      this.isInitialized = false;
    }
  }
});