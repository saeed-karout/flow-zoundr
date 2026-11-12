// services/subscriptionService.js

import apiRequest from '@/lib/apiRequest';
import authHeader from './auth-header';

export const subscriptionService = {
  /**
   * إنشاء اشتراك جديد مع بيانات الفوترة
   * @param {Object} billingData - بيانات الفوترة (مع بادئة billing_)
   */
  async createSubscription(billingData = null) {
    try {
      // ✅ إرسال البيانات مع بادئة billing_
      const payload = billingData || {};
      
      console.log('📤 Creating subscription with payload:', JSON.stringify(payload, null, 2));
      
      const response = await apiRequest.post('/subscription', payload, {
        headers: { ...authHeader() }
      });
      
      return response.data;
    } catch (error) {
      console.error('❌ Error creating subscription:', error);
      if (error.response?.data) {
        console.error('📝 Error details:', error.response.data);
      }
      throw error;
    }
  },

  /**
   * التحقق (verify) من إتمام عملية الدفع لاشتراك محدّد.
   * الباك يتحقّق من الدفع لهذا subscription_id ويعيد نتيجة تُبيّن إن تمّ.
   * @param {string|number} subscriptionId
   */
  async verifySubscription(subscriptionId) {
    try {
      const response = await apiRequest.get(
        `/subscription/verify/${subscriptionId}`,
        { headers: { ...authHeader() } }
      );
      return response.data;
    } catch (error) {
      console.error('❌ Error verifying subscription:', error);
      if (error.response?.data) {
        console.error('📝 Verify error details:', error.response.data);
      }
      throw error;
    }
  },

  /**
   * هل تؤكّد نتيجة verify أن الدفع تمّ/الاشتراك مفعّل؟ (نتحقّق من عدّة صيغ محتملة)
   */
  isVerifiedActive(data) {
    if (!data) return false;
    const d = data.data || data;
    return (
      d.paid === true ||
      d.verified === true ||
      d.subscribed === true ||
      d.is_active === true ||
      d.status === 'active' ||
      d.subscription?.status === 'active'
    );
  },

  /**
   * جلب حالة الاشتراك الحالية
   */
  async getSubscriptionStatus() {
    try {
      const response = await apiRequest.get('/subscription', {
        headers: { ...authHeader() }
      });
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching subscription status:', error);
      throw error;
    }
  },

  /**
   * التحقق من نشاط الاشتراك
   */
  isSubscriptionActive(data) {
    if (!data) return false;
    if (!data.subscribed) return false;
    if (data.subscription?.status !== 'active') return false;
    
    const expiresAt = data.subscription?.expires_at;
    if (expiresAt) {
      return new Date(expiresAt) > new Date();
    }
    return true;
  }
};