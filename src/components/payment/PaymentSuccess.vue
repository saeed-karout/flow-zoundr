<template>
    <div class="payment-success-wrapper">
      <!-- شاشة الانتظار -->
      <div class="progress-request-popup" >
        <div class="box-popup">
          <img src="/logo.svg" class="logo" alt="">
          <div class="animation-3-points">
            <div class="point"></div>
            <div class="point"></div>
            <div class="point"></div>
          </div>
          <div class="title-popup">
            Deine Zahlung ist im Gange!
          </div>
          <div class="subtitle-popup">
            Dieses Fenster schließt automatisch, sobald Deine Bezahlung erfolgreich abgeschlossen wurde. Habe einen Moment Geduld!
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useRoute } from 'vue-router';
  import { useDataStore } from '@/stores/data';
  import apiRequest from '@/lib/apiRequest';
  import authHeader from '@/services/auth-header';
  
  const route = useRoute();
  const dataStore = useDataStore();
  const isProcessing = ref(true);
  const paymentStatus = ref(0); // 0: فشل، 1: نجاح
  
  // دالة لتحديث حالة الدفع في localStorage وإرسالها للنافذة الأم
  const updatePaymentStatus = (status) => {
    const statusValue = status ? '1' : '0';
    
    // تخزين في localStorage
    localStorage.setItem('paymentStatus', statusValue);
    paymentStatus.value = status ? 1 : 0;
    
    // إرسال للنافذة الأم إذا كانت مفتوحة
    if (window.opener && !window.opener.closed) {
      console.log('Sending message to opener with status:', statusValue);
      
      window.opener.postMessage({ 
        type: 'PAYMENT_STATUS_UPDATE', 
        status: statusValue 
      }, window.location.origin);
      
      // إرسال رسالة النجاح أو الفشل
      if (status) {
        window.opener.postMessage({ 
          type: 'PAYMENT_SUCCESS', 
          paypalOrderId: route.query.token,
          releaseUuid: route.query.release 
        }, window.location.origin);
      } else {
        window.opener.postMessage({ 
          type: 'PAYMENT_FAILED', 
          error: 'Payment processing failed' 
        }, window.location.origin);
      }
      
      console.log('Payment status sent to parent:', statusValue);
    } else {
      console.warn('No opener window found or it is closed');
    }
  };
  
  const capturePayment = async () => {
    const paypalOrderId = route.query.token;
    const releaseUuid = route.query.release;
    
    if (!releaseUuid) {
      console.error('No release UUID provided');
      updatePaymentStatus(false);
      isProcessing.value = false;
      setTimeout(() => window.close(), 1000);
      return;
    }
  
    if (!paypalOrderId) {
      console.error('No PayPal order ID provided');
      updatePaymentStatus(false);
      isProcessing.value = false;
      setTimeout(() => window.close(), 1000);
      return;
    }
  
    // Try to get form data from store
    let formData = dataStore.paymentFormData;
  
    // Fallback to localStorage if store data is missing
    if (!formData) {
      const storedData = localStorage.getItem('paymentFormData');
      if (storedData) {
        console.log('Loading paymentFormData from localStorage:', storedData);
        formData = JSON.parse(storedData);
        dataStore.setPaymentFormData(formData);
      }
    }
  
    console.log('paymentFormData:', JSON.stringify(formData, null, 2));
  
    if (
      !formData ||
      !formData.first_name ||
      !formData.last_name ||
      !formData.street_name ||
      !formData.street_number ||
      !formData.postal_code ||
      !formData.city ||
      !formData.country
    ) {
      console.error('Required form data is missing');
      updatePaymentStatus(false);
      isProcessing.value = false;
      setTimeout(() => {
        dataStore.clearPaymentFormData();
        localStorage.removeItem('paymentFormData');
        window.close();
      }, 300);
      return;
    }
  
    const apiCountry = formData.country.toLowerCase();
    const formDataToSend = new FormData();
    formDataToSend.append('company', formData.company || '');
    formDataToSend.append('first_name', formData.first_name);
    formDataToSend.append('last_name', formData.last_name);
    formDataToSend.append('street_name', formData.street_name);
    formDataToSend.append('street_number', formData.street_number);
    formDataToSend.append('postal_code', formData.postal_code);
    formDataToSend.append('city', formData.city);
    formDataToSend.append('country', apiCountry);
  
    try {
      console.log('Capturing payment for release:', releaseUuid, 'order ID:', paypalOrderId);
      
      // استخدام endpoint جديد لالتقاط الدفع
      const response = await apiRequest.post(
        `/releases/${releaseUuid}/capture-payment?order_id=${paypalOrderId}`, 
        formDataToSend, 
        { headers: { ...authHeader() } }
      );
  
      console.log('POST /releases/{release}/capture-payment response:', JSON.stringify(response.data, null, 2));
  
      if (response.status === 200 || response.status === 201) {
        console.log('Payment captured successfully');
        
        // تحديث localStorage مباشرة
        localStorage.setItem('paymentStatus', '1');
        
        // إرسال رسالة النجاح
        if (window.opener && !window.opener.closed) {
          console.log('Sending PAYMENT_SUCCESS message to opener');
          window.opener.postMessage({ 
            type: 'PAYMENT_SUCCESS', 
            paypalOrderId,
            releaseUuid
          }, window.location.origin);
        } else {
          console.warn('No opener window to send message to');
        }
        
        // الانتظار قليلاً ثم إغلاق النافذة
        setTimeout(() => {
          window.close();
        }, 2000);
        
      } else {
        console.warn(`Unexpected status code: ${response.status}`);
        localStorage.setItem('paymentStatus', '0');
        if (window.opener && !window.opener.closed) {
          window.opener.postMessage({ 
            type: 'PAYMENT_FAILED', 
            error: `Unexpected status: ${response.status}` 
          }, window.location.origin);
        }
        setTimeout(() => window.close(), 1000);
      }
    } catch (error) {
      console.error('Failed to capture payment:', error);
      localStorage.setItem('paymentStatus', '0');
      
      if (window.opener && !window.opener.closed) {
        window.opener.postMessage({
          type: 'PAYMENT_FAILED', 
          error: error.response?.data?.message || error.message 
        }, window.location.origin);
      }
      
      setTimeout(() => window.close(), 1000);
    } finally {
      isProcessing.value = false;
      // Clear form data
      dataStore.clearPaymentFormData();
      localStorage.removeItem('paymentFormData');
    }
  };
  
  onMounted(() => {
    console.log('PaymentSuccess mounted with query parameters:', route.query);
    capturePayment();
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