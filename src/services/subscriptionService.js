import apiRequest from '@/lib/apiRequest';

export const subscriptionService = {
  async getSubscriptionStatus() {
    try {
      const response = await apiRequest.get('/subscription');
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching subscription status:', error);
      throw error;
    }
  },

  async createSubscription() {
    try {
      const response = await apiRequest.post('/subscription');
      return response.data;
    } catch (error) {
      console.error('❌ Error creating subscription:', error);
      throw error;
    }
  },

  isSubscriptionActive(subscriptionData) {
    if (!subscriptionData) return false;
    if (!subscriptionData.subscribed) return false;
    
    const subscription = subscriptionData.subscription;
    if (!subscription) return false;
    if (subscription.status !== 'active') return false;
    
    if (subscription.expires_at) {
      const expiresAt = new Date(subscription.expires_at);
      const now = new Date();
      if (expiresAt < now) return false;
    }
    
    return true;
  }
};