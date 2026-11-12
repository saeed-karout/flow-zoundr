<template>
  <div class="payment-success-wrapper">
    
    <!-- شاشة الانتظار -->
    <div class="progress-request-popup">
      <div class="box-popup">
        <img src="/logo.svg" class="logo" alt="">
        <div class="animation-3-points">
          <div class="point"></div>
          <div class="point"></div>
          <div class="point"></div>
        </div>
        <div class="title-popup">
          {{ isSubscription ? 'Dein Abonnement wird aktiviert...' : 'Deine Zahlung ist im Gange!' }}
        </div>
        <div class="subtitle-popup">
          {{ isSubscription 
            ? 'Bitte warten Sie einen Moment, während Ihr Abonnement aktiviert wird.' 
            : 'Dieses Fenster schließt automatisch, sobald Deine Bezahlung erfolgreich abgeschlossen wurde. Habe einen Moment Geduld!' 
          }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useSubscriptionStore } from '@/stores/subscription';
import { subscriptionService } from '@/services/subscriptionService';

const route = useRoute();
const subscriptionStore = useSubscriptionStore();
const isSubscription = ref(false);

// دالة لإرسال رسالة للنافذة الأم
const sendMessageToOpener = (type, data = null) => {
  if (window.opener && !window.opener.closed) {
    window.opener.postMessage({ 
      type: type,
      data: data
    }, window.location.origin);
    console.log(`📤 Message sent to opener: ${type}`, data);
  } else {
    console.warn('⚠️ No opener window found or it is closed');
  }
};

onMounted(async () => {
  console.log('📱 PaymentSuccess mounted with query:', route.query);
  
  // التحقق من نوع الدفع (اشتراك أو شراء عادي)
  const isSubscriptionFlow = route.query.type === 'subscription';
  isSubscription.value = isSubscriptionFlow;
  
  if (isSubscriptionFlow) {
    // تدفق الاشتراك
    console.log('📱 Processing subscription payment...');
    
    try {
      const data = await subscriptionService.getSubscriptionStatus();
      subscriptionStore.setSubscription(data);
      
      console.log('✅ Subscription verified:', data);
      
      sendMessageToOpener('SUBSCRIBE_SUCCESS', data);
      
      setTimeout(() => window.close(), 3000);
      
    } catch (error) {
      console.error('❌ Failed to verify subscription:', error);
      sendMessageToOpener('SUBSCRIBE_FAILED', { error: error.message });
      
      setTimeout(() => window.close(), 2000);
    }
    
  } else {
    // تدفق الدفع العادي (للإصدارات القديمة)
    console.log('📱 Processing regular payment...');
    
    // هنا يمكنك وضع كود الدفع العادي القديم
    // capturePayment() ...
    
    // مؤقتاً، نرسل رسالة نجاح
    sendMessageToOpener('PAYMENT_SUCCESS', { 
      paypalOrderId: route.query.token,
      releaseUuid: route.query.release 
    });
    
    setTimeout(() => window.close(), 3000);
  }
});
</script>

<style scoped>
.payment-success-wrapper {
  width: 100vw;
  height: 100vh;
  position: relative;
  background: #000;
}

.progress-request-popup {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(27, 28, 32, 0.95);
  backdrop-filter: blur(5px);
  z-index: 9999;
}

.progress-request-popup .box-popup {
  display: flex;
  width: 640px;
  height: 320px;
  padding: 52px 40px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 42px;
  flex-shrink: 0;
  border-radius: 20px;
  border: 2px solid var(--Main-Colors-Strawberry, #D15);
  background: var(--Main-Colors-Slate, #26282D);
}

.box-popup .logo {
  width: 166px;
  padding-top: 10px;
}

.box-popup .animation-3-points {
  width: 70px;
  height: 20px;
  display: flex;
  gap: 4px;
  flex-shrink: 0;
  aspect-ratio: 3/1;
}

.box-popup .title-popup {
  color: var(--Main-Colors-White, #FFF);
  text-align: center;
  font-family: Heebo;
  font-size: 28px;
  font-style: normal;
  font-weight: 700;
  line-height: 1;
  text-transform: uppercase;
}

.box-popup .subtitle-popup {
  color: var(--Main-Colors-White, #FFF);
  text-align: center;
  font-family: Heebo;
  font-size: 18px;
  font-style: normal;
  font-weight: 300;
  line-height: normal;
}

/* Animation للنقاط */
.point {
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background: var(--move);
  animation: bounce 1.4s infinite ease-in-out both;
}

.point:nth-child(1) { animation-delay: -0.32s; }
.point:nth-child(2) { animation-delay: -0.16s; }

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>