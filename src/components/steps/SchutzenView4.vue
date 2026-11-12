<template>
  <div class="main-content">
    <StepLayout
      :current-step="4"
      :steps="steps"
      :section-title="sectionTitle"
      :section-description="sectionDescription"
      :hasOuterContent="true"
    >
      <div class="content-container">
        <div class="section-form-price">
          <form class="payment-form" @submit.prevent="initiatePayment">
            <div class="form-container">
              <!-- Left Section (unchanged) -->
              <div class="left-section">
                <div class="form-row">
                  <div class="form-group">
                    <input v-model="formData.company" type="text" placeholder="Firma (optional)" class="input-field"
                      :class="{ 'filled': formData.company }" />
                    <span class="checkmark" v-if="formData.company">
                      <img src="@/assets/icons/y.png" alt="completed" />
                    </span>
                  </div>
                </div>
                <div class="form-row flex">
                  <div class="form-group w-50">
                    <input v-model="formData.firstName" type="text" placeholder="Vorname" class="input-field"
                      :class="{ 'filled': formData.firstName, 'error': errors.firstName }" />
                    <span class="checkmark" v-if="formData.firstName && !errors.firstName">
                      <img src="@/assets/icons/y.png" alt="completed" />
                    </span>
                    <span class="error-message" v-if="errors.firstName">{{ errors.firstName }}</span>
                  </div>
                  <div class="form-group w-50">
                    <input v-model="formData.lastName" type="text" placeholder="Nachname" class="input-field"
                      :class="{ 'filled': formData.lastName, 'error': errors.lastName }" />
                    <span class="checkmark" v-if="formData.lastName && !errors.lastName">
                      <img src="@/assets/icons/y.png" alt="completed" />
                    </span>
                    <span class="error-message" v-if="errors.lastName">{{ errors.lastName }}</span>
                  </div>
                </div>
                <div class="form-row flex">
                  <div class="form-group w-75">
                    <input v-model="formData.street" type="text" placeholder="Straße" class="input-field"
                      :class="{ 'filled': formData.street, 'error': errors.street }" />
                    <span class="checkmark" v-if="formData.street && !errors.street">
                      <img src="@/assets/icons/y.png" alt="completed" />
                    </span>
                    <span class="error-message" v-if="errors.street">{{ errors.street }}</span>
                  </div>
                  <div class="input-wrapper w-33">
                    <input v-model="formData.streetNr" type="text" placeholder="Nr." class="input-field"
                      :class="{ 'filled': formData.streetNr, 'error': errors.streetNr }" />
                    <span class="checkmark" v-if="formData.streetNr && !errors.streetNr">
                      <img src="@/assets/icons/y.png" alt="completed" />
                    </span>
                    <span class="error-message" v-if="errors.streetNr">{{ errors.streetNr }}</span>
                  </div>
                </div>
                <div class="form-row flex">
                  <div class="input-wrapper w-33">
                    <input v-model="formData.postalCode" type="text" placeholder="PLZ" class="input-field"
                      :class="{ 'filled': formData.postalCode, 'error': errors.postalCode }" />
                    <span class="checkmark" v-if="formData.postalCode && !errors.postalCode">
                      <img src="@/assets/icons/y.png" alt="completed" />
                    </span>
                    <span class="error-message" v-if="errors.postalCode">{{ errors.postalCode }}</span>
                  </div>
                  <div class="form-group w-67">
                    <input v-model="formData.city" type="text" placeholder="Ort" class="input-field"
                      :class="{ 'filled': formData.city, 'error': errors.city }" />
                    <span class="checkmark" v-if="formData.city && !errors.city">
                      <img src="@/assets/icons/y.png" alt="completed" />
                    </span>
                    <span class="error-message" v-if="errors.city">{{ errors.city }}</span>
                  </div>
                </div>
              </div>
              <!-- Right Section (unchanged) -->
              <div class="right-section">
                <div class="form-row">
                  <div class="form-group">
                    <div class="custom-select" :class="{ 'focused': isLandFocused }">
                      <div class="select-button" @click="isLandFocused = !isLandFocused"
                        :class="{ 'filled': formData.country, 'error': errors.country }">
                        <span>{{ formData.country || 'Land' }}</span>
                        <span class="checkmark">
                          <img v-if="formData.country && !errors.country" src="@/assets/icons/y.png" alt="completed" />
                          <svg v-else xmlns="http://www.w3.org/2000/svg" width="12" height="22" viewBox="0 0 12 22"
                            fill="none">
                            <path
                              d="M6.75349 0.393499C6.37575 -0.131167 5.62425 -0.131166 5.2465 0.3935L0.192358 7.41338C-0.277267 8.06566 0.166457 9 0.945854 9L11.0541 9C11.8335 9 12.2773 8.06566 11.8076 7.41338L6.75349 0.393499Z"
                              :fill="isLandFocused ? '#FFFFFF' : '#6A6C6D'" />
                            <path
                              d="M6.75349 21.6065C6.37575 22.1312 5.62425 22.1312 5.2465 21.6065L0.192358 14.5866C-0.277267 13.9343 0.166457 13 0.945854 13L11.0541 13C11.8335 13 12.2773 13.9343 11.8076 14.5866L6.75349 21.6065Z"
                              :fill="isLandFocused ? '#FFFFFF' : '#6A6C6D'" />
                          </svg>
                        </span>
                      </div>
                      <ul class="options" v-if="isLandFocused">
                        <li @click="selectCountry('Deutschland')">Deutschland</li>
                        <li @click="selectCountry('Österreich')">Österreich</li>
                        <li @click="selectCountry('Schweiz')">Schweiz</li>
                      </ul>
                    </div>
                    <span class="error-message" v-if="errors.country">{{ errors.country }}</span>
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <input v-model="formData.email" id="email" type="email" class="input-field"
                      :class="{ 'filled': formData.email }" disabled />
                    <span class="checkmark" v-if="formData.email">
                      <img src="@/assets/icons/Icon_awesome-lock.png" alt="completed" />
                    </span>
                  </div>
                </div>
                <div class="form-row checkbox-row">
                  <div class="checkbox-container">
                    <input v-model="formData.agreement" type="checkbox" id="agreement" class="person-checkbox"
                      :class="{ 'error': errors.agreement }" />
                    <label for="agreement" class="checkbox-label">
                      Ich habe die AGBs, das Widerrufsrecht und die Datenschutzerklärung gelesen, verstanden und stimme
                      zu.
                    </label>
                  </div>
                  <span class="error-message" v-if="errors.agreement">{{ errors.agreement }}</span>
                </div>
              </div>
            </div>
          </form>
          <!-- Price Section -->
          <div class="price-section">
            <div class="price-details">
              <div class="title">
                <span>Nettopreis:</span>
                <span>Gesetzliche Mehrwertsteuer {{ taxRateDisplay }}</span>
                <span v-if="isReverseCharge" class="reverse-charge">Reverse charge</span>
                <span class="span">GESAMTPREIS:</span>
              </div>
              <div class="price-row">
                <span>{{ netPrice }} EUR</span>
                <span>{{ tax }} EUR</span>
                <span class="price">{{ totalPrice }} EUR</span>
              </div>
            </div>
            <div class="buttons-form">
              <div class="zuruck" @click="$emit('prev')">
                Zurück
              </div>
              <div id="paypal-button-container" :class="{ disabled: !isFormValid }"></div>
            </div>
          </div>
        </div>
      </div>
    </StepLayout>

    <!-- Points Section (unchanged) -->
    <div class="points-container">
      <div class="points-left">
        <div class="header-left">
          <h3>DEINE PUNKTE</h3>
          <p>Du sammelst für jedes geschützte Werk Punkte</p>
        </div>
        <div class="pries">
          <div class="points-details">
            <span class="span1">Punkte pro Werk:</span>
            <span class="span2">GESAMT:</span>
          </div>
          <div class="points-total">
            <span class="punket">10 PUNKTE</span>
            <span class="punket2">{{ totalPoints }} PUNKTE</span>
          </div>
        </div>
      </div>
      <div class="points-right">
        <div class="right-comp">
          <h3 class="title">PUNKTE SAMMELN UND EINLÖSEN</h3>
          <p class="description">
            Mollis sem elit vulputate imperdiet nunc ullamcorper sed. Nam tempor duis nulla ipsum augue sagittis tincidunt
            ultrices. Pretium at lobortis purus quis consectetur. Velit at eget rutrum quam ipsum tellus nisl felis commodo.
            Dui facilisis aliquam at risus elit dictum malesuada elementum est.
          </p>
        </div>
      </div>
    </div>

    <div class="bg-fade" v-if="screenWidth >= 1440 && screenWidth <= 1490" :style="{ opacity: bgFadeOpacity }"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import StepLayout from '@/components/Layout2.vue';
import { mapState } from 'pinia';
import { useDataStore } from '@/stores/data';

defineProps({
  currentStep: {
    type: Number,
    required: true,
  },
});

const router = useRouter();
const dataStore = useDataStore();
const { user } = mapState(useDataStore, ['user']);

const userEmail = computed(() => dataStore.user?.email || '');

const formData = ref({
  company: '',
  country: '',
  firstName: '',
  lastName: '',
  ustId: '',
  street: '',
  streetNr: '',
  email: userEmail.value,
  postalCode: '',
  city: '',
  agreement: false,
});

const errors = ref({
  firstName: '',
  lastName: '',
  street: '',
  streetNr: '',
  postalCode: '',
  city: '',
  country: '',
  agreement: '',
});

const isLandFocused = ref(false);
const isUstIdValid = ref(false);

const pointsPerFile = 10;

const totalPoints = computed(() => dataStore.fileCount * pointsPerFile);

const pricePerFileWithTax = 15;

const taxRate = computed(() => {
  if (formData.value.country === 'Deutschland') return 0.19;
  if (formData.value.country === 'Österreich') {
    return formData.value.ustId && isUstIdValid.value ? 0 : 0.19;
  }
  if (formData.value.country === 'Schweiz') return 0;
  return 0;
});

const taxRateDisplay = computed(() => {
  return taxRate.value > 0 ? `${(taxRate.value * 100).toFixed(0)} %` : '0 %';
});

const isReverseCharge = computed(() => {
  return formData.value.country === 'Österreich' && formData.value.ustId && isUstIdValid.value;
});

const totalWithTax = computed(() => dataStore.fileCount * pricePerFileWithTax);

const netPrice = computed(() => {
  if (taxRate.value === 0) return totalWithTax.value.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const net = totalWithTax.value / (1 + taxRate.value);
  return net.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
});

const tax = computed(() => {
  if (taxRate.value === 0) return '0,00';
  const net = parseFloat(netPrice.value.replace(',', '.'));
  const taxValue = totalWithTax.value - net;
  return taxValue.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
});

const totalPrice = computed(() => {
  return totalWithTax.value.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
});

const steps = ref(['1', '2', '3', '4']);
const sectionTitle = ref('BEZAHLUNG & FINALISIERUNG');
const sectionDescription = ref('Umgehend nach der Bezahlung wird Deine Urkunde erstellt.');

const selectCountry = (country) => {
  formData.value.country = country;
  isLandFocused.value = false;
  errors.value.country = '';
  if (country !== 'Österreich') {
    formData.value.ustId = '';
    isUstIdValid.value = false;
  }
};

const validateUstId = async () => {
  if (formData.value.ustId && formData.value.country === 'Österreich') {
    try {
      const response = await simulateUstIdValidation(formData.value.ustId);
      isUstIdValid.value = response.isValid;
      if (!response.isValid) {
        alert('UST-ID غير صحيح');
      }
    } catch (error) {
      isUstIdValid.value = false;
      alert('فشل التحقق من UST-ID');
    }
  }
};

const simulateUstIdValidation = (ustId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ isValid: ustId.startsWith('AT') });
    }, 500);
  });
};

const validateForm = () => {
  let isValid = true;
  errors.value = {
    firstName: '',
    lastName: '',
    street: '',
    streetNr: '',
    postalCode: '',
    city: '',
    country: '',
    agreement: '',
  };

  if (!formData.value.firstName.trim()) {
    errors.value.firstName = 'Vorname ist erforderlich';
    isValid = false;
  }
  if (!formData.value.lastName.trim()) {
    errors.value.lastName = 'Nachname ist erforderlich';
    isValid = false;
  }
  if (!formData.value.street.trim()) {
    errors.value.street = 'Straße ist erforderlich';
    isValid = false;
  }
  if (!formData.value.streetNr.trim()) {
    errors.value.streetNr = 'Hausnummer ist erforderlich';
    isValid = false;
  }
  if (!formData.value.postalCode.trim()) {
    errors.value.postalCode = 'PLZ ist erforderlich';
    isValid = false;
  }
  if (!formData.value.city.trim()) {
    errors.value.city = 'Ort ist erforderlich';
    isValid = false;
  }
  if (!formData.value.country) {
    errors.value.country = 'Land ist erforderlich';
    isValid = false;
  }
  if (!formData.value.agreement) {
    errors.value.agreement = 'Sie müssen den AGBs zustimmen';
    isValid = false;
  }

  return isValid;
};

const isFormValid = computed(() => {
  return (
    formData.value.firstName.trim() &&
    formData.value.lastName.trim() &&
    formData.value.street.trim() &&
    formData.value.streetNr.trim() &&
    formData.value.postalCode.trim() &&
    formData.value.city.trim() &&
    formData.value.country &&
    formData.value.agreement
  );
});

watch(userEmail, (newVal) => {
  formData.value.email = newVal;
});

const initiatePayment = () => {
  if (validateForm()) {
    // PayPal button will handle the payment process
    console.log('Form validated, ready for PayPal payment');
  } else {
    console.log('Form validation failed');
  }
};

// PayPal Integration
const loadPayPalSDK = () => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=YOUR_PAYPAL_CLIENT_ID&currency=EUR`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load PayPal SDK'));
    document.head.appendChild(script);
  });
};

const renderPayPalButton = () => {
  if (window.paypal) {
    window.paypal.Buttons({
      style: {
        layout: 'vertical',
        color: 'gold',
        shape: 'rect',
        label: 'paypal',
        height: 44,
      },
      createOrder: (data, actions) => {
        if (!validateForm()) {
          alert('Bitte füllen Sie alle erforderlichen Felder aus.');
          return false;
        }
        return actions.order.create({
          purchase_units: [{
            amount: {
              value: totalWithTax.value.toFixed(2),
              currency_code: 'EUR',
            },
            description: `Payment for ${dataStore.fileCount} protected works`,
          }],
        });
      },
      onApprove: async (data, actions) => {
        try {
          const order = await actions.order.capture();
          console.log('Payment successful:', order);
          // Optionally save form data or order details to your backend here
          router.push('/final');
        } catch (error) {
          console.error('Payment capture failed:', error);
          alert('Zahlung fehlgeschlagen. Bitte versuchen Sie es erneut.');
        }
      },
      onError: (err) => {
        console.error('PayPal error:', err);
        alert('Ein Fehler ist bei der PayPal-Zahlung aufgetreten.');
      },
      onCancel: () => {
        console.log('Payment cancelled');
      },
    }).render('#paypal-button-container').catch((error) => {
      console.error('Failed to render PayPal button:', error);
    });
  }
};

onMounted(async () => {
  window.addEventListener('resize', updateScreenWidth);
  updateScreenWidth();
  try {
    await loadPayPalSDK();
    renderPayPalButton();
  } catch (error) {
    console.error('PayPal SDK loading failed:', error);
    alert('PayPal-Zahlungsdienst konnte nicht geladen werden.');
  }
});

onUnmounted(() => {
  window.removeEventListener('resize', updateScreenWidth);
});

const bgFadeOpacity = computed(() => {
  if (screenWidth.value >= 1439 && screenWidth.value <= 1490) {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);
    return Math.min(distanceFromBottom / 40, 1);
  }
  return 0;
});

const screenWidth = ref(window.innerWidth);

const updateScreenWidth = () => {
  screenWidth.value = window.innerWidth;
};
</script>

<style lang="scss" scoped>

#paypal-button-container {
  display: flex;
  height: 44px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  border-radius: 5px;
  min-width: 200px;
}

#paypal-button-container.disabled {
  opacity: 0.5;
  pointer-events: none;
}

// Ensure the button container aligns with other buttons
.buttons-form {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 16px;
  flex: 1 0 0;
}


* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Heebo', sans-serif;
}

html, body {
  height: 100dvh; /* ضمان أن العناصر الأب تملأ الشاشة الديناميكية */
  margin: 0;
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  color: white;
  background: transparent;
  height: calc(100dvh - 71px - 50px); /* الارتفاع المطلوب بعد خصم الهيدر والفوتر */
  overflow: hidden; /* منع التمرير غير المرغوب */
}

.content-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex: 1; /* شغل المساحة المتاحة */
  align-self: stretch;
     height: 100%;
    // padding-bottom: 30px;
}

.section-form-price {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  align-self: stretch;
  flex: 1; /* شغل المساحة المتاحة */
  // overflow-y: auto; 
  scrollbar-width: thin; /* تخصيص شريط التمرير لـ Firefox */
  
}

.section-form-price::-webkit-scrollbar {
  width: 8px; /* عرض شريط التمرير لـ Webkit */
}

.section-form-price::-webkit-scrollbar-track {
  background: var(--Main-Colors-Slate-Dark, #1B1C20); /* خلفية شريط التمرير */
  border-radius: 4px;
}

.section-form-price::-webkit-scrollbar-thumb {
  background: var(--move); /* لون مقبض التمرير */
  border-radius: 4px;
}

.section-form-price::-webkit-scrollbar-thumb:hover {
  background: #990033; /* لون عند التمرير فوقه */
}

.payment-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-self: stretch;
}

.form-container {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  align-self: stretch;
}

.left-section,
.right-section {
  width: 50%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-row {
  display: flex;
  gap: 12px;
  align-items: center;
  width: 100%;
  // min-height: 48px;
}

.form-group {
  position: relative;
  flex: 1;
}

.input-wrapper {
  position: relative;
  width: 80%;
}

.flex {
  display: flex;
  gap: 12px;
  width: 100%;
}

.w-50 { width: 50% !important; }
.w-75 { width: 75% !important; }
.w-25 { width: 25% !important; }
.w-67 { width: 60% !important; }
.w-33 { width: 33.3% !important; }

.input-field {
  padding: 12px 16px;
  width: 100%;
  background-color: var(--primary);
  border: 1px solid var(--primary);
  border-radius: 5px;
  color: var(--selvar);
  outline: none;
  transition: background-color 0.3s, color 0.3s;
  max-height: 48px;
}

.input-field.filled {
  color: #fff;
  padding-right: 50px;
  font-family: Heebo;
  font-size: 18px;
  font-weight: 300;
  line-height: 1;
  letter-spacing: 1px;
}

.select-button span {
  font-family: Heebo;
  font-size: 18px;
  font-weight: 300;
  line-height: 1;
  letter-spacing: 1px;
}

.input-field::placeholder {
  color: var(--Main-Colors-Dove, #6A6C6D);
  font-size: 18px;
  font-weight: 300;
  line-height: 1;
  letter-spacing: 1px;
}

.input-field:disabled {
  color: var(--selvar);
  background-color: var(--primary);
  opacity: 0.7;
}

.input-field.error {
  border-color: #ff4d4f;
}

.error-message {
  color: #ff4d4f;
  font-size: 12px;
  margin-top: 4px;
  position: absolute;
  bottom: -18px;
  left: 0;
}

.custom-select {
  position: relative;
  width: 100%;
  // min-height: 48px;
}

.select-button {
  display: flex;
  padding: 12px 16px;
  justify-content: space-between;
  align-items: center;
  align-self: stretch;
  border: 1px solid var(--primary);
  cursor: pointer;
  border-radius: 5px;
  background: var(--primary);
  min-height: 48px;
}

.select-button span {
  color: var(--selvar);
}

.select-button.filled span {
  color: #fff;
}

.select-button.error {
  border-color: #ff4d4f;
}

.custom-select.focused .select-button {
  border-color: var(--move);
  border-radius: 5px 5px 0 0;
  background-color: var(--secondary);
  border: 1px solid var(--move);
  border-bottom: 0;
}

.options {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  top: 43px;
  margin-top: 2px;
  background-color: var(--secondary);
  border: 1px solid var(--move);
  border-top: none;
  border-bottom-right-radius: 5px;
  border-bottom-left-radius: 5px;
  list-style: none;
  padding: 0;
  margin: 0;
  z-index: 1000;
  max-height: 200px;
  overflow-y: auto;
}

.options li {
  padding: 8px 16px;
  color: #a3b3bc;
  cursor: pointer;
  transition: background-color 0.3s;
  font-family: Heebo;
  font-size: 18px;
  font-weight: 300;
  line-height: 1;
  letter-spacing: 1px;
}

.options li:hover {
  background-color: var(--move);
  color: #fff;
}

.checkmark {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
}

.checkmark img {
  width: 16px;
  height: auto;
}

.ustid-group {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  transition: opacity 0.3s ease;
}

.ustid-group .input-field {
  flex: 1;
}

.ustid-group {
  position: relative;
}

.ustid-group .confirm-btn {
  padding: 12px 16px;
  border-radius: 5px;
  background-color: var(--Main-Colors-Slate-Light, #3A3E42);
  color: var(--Main-Colors-Dove, #6A6C6D);
  border: none;
  cursor: pointer;
  text-transform: uppercase;
  white-space: nowrap;
  font-family: Heebo;
  font-size: 16px;
  font-weight: 400;
  line-height: 1;
}

.confirm-btn {
  padding: 12px 16px;
  border-radius: 5px;
  background-color: var(--icon);
  color: var(--selvar);
  border: none;
  cursor: pointer;
  background: var(--Main-Colors-Slate-Light, #3A3E42);
  text-transform: uppercase;
  white-space: nowrap;
}

.confirm-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.ustid-group {
  transition: opacity 0.3s ease;
}

.confirm-btn:hover {
  background-color: var(--move);
  color: #fff;
}

.checkbox-row {
  width: 100%;
  display: flex;
  align-items: center;
}

.checkbox-container {
  display: flex;
  align-items: center;
  gap: 10px;
  align-self: stretch;
  height: 48px;
}

.person-checkbox {
  appearance: none;
  width: 28px;
  height: 28px;
  background-color: var(--primary);
  border: 1px solid var(--primary);
  border-radius: 4px;
  cursor: pointer;
  position: relative;
}

.person-checkbox.error {
  border-color: #ff4d4f;
}

.person-checkbox:checked::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 16px;
  height: 16px;
  background-image: url('@/assets/icons/Check.png');
  background-position: center;
  background-repeat: no-repeat;
  background-size: contain;
}

.checkbox-label {
  color: #fff;
  font-family: Heebo;
  font-size: 14px;
  font-weight: 300;
  line-height: 1.5;
  flex: 1;
  max-width: 491px;
  width: 490px;
}

.price-section {
  display: flex;
  padding-top: 24px;
  align-items: flex-end;
  gap: 16px;
  align-self: stretch;
}

.price-details {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex: 1 0 0;
}

.price-details .title {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  flex: 1;
}

.price-details .title span {
  color: var(--Main-Colors-Dove, #6A6C6D);
  font-family: Heebo;
  font-size: 14px;
  font-weight: 400;
  line-height: 1;
  letter-spacing: 0.7px;
}

.price-details .title .span {
  color: #FFF;
  font-family: Heebo;
  font-size: 28px;
  font-weight: 300;
  line-height: 1;
  letter-spacing: 1.6px;
  text-transform: uppercase;
}

.price-row {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
  flex: 1;
}

.zuruck {
  display: flex;
  height: 42px;
  padding: 17px 20px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  border-radius: 5px;
  background: var(--Main-Colors-Slate-Light, #3A3E42);
  cursor: pointer;
  color: var(--Main-Colors-Dove, #6A6C6D);
  font-family: Heebo;
  font-size: 16px;
  font-weight: 400;
  line-height: 1;
  text-transform: uppercase;
}

.zuruck:hover {
  background-color: #990033;
  color: white;
  transition: 0.3s ease;
}

.price-row span {
  color: var(--Main-Colors-Dove, #6a6c6d);
  text-align: right;
  font-family: Heebo;
  font-size: 14px;
  font-weight: 400;
  line-height: 1;
  letter-spacing: 0.7px;
  text-transform: uppercase;
  width: 219px;
}

.price-row .price {
  color: #fff;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: 1.6px;
}

.buttons-form {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 16px;
  flex: 1 0 0;
}

.back-button,
.pay-btn {
  display: flex;
  height: 44px;
  padding: 14px 16px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  border-radius: 5px;
}

.back-button:hover,
.pay-btn:hover {
  background: #990033;
  transition: .3s ease;
  cursor: pointer;
}

.back-button {
  background: var(--Main-Colors-Slate-Light, #3a3e42);
}

.back-button span,
.pay-btn span {
  color: #fff;
  font-family: Heebo;
  font-size: 16px;
  font-weight: 400;
  line-height: 1;
  text-transform: uppercase;
}

.pay-btn {
  background: var(--move);
}

.pay-btn.disabled {
  background: #3a3e42;
  cursor: not-allowed;
}

.pay-btn.disabled span {
  color: #6a6c6d;
}

.points-container {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  align-self: stretch;
  flex: 0 0 auto; /* لا يتوسع، يأخذ الحجم الطبيعي */
  min-height: 120px; /* ارتفاع أدنى لضمان الظهور */
  max-height: 200px; /* ارتفاع أقصى لمنع التوسع الزائد */
}

.points-left,
.points-right {
  background-color: var(--secondary);
  border-radius: 20px;
  flex: 1;
  min-height: 120px;
  max-height: 200px;
  overflow: hidden;
}

.points-left {
  display: flex;
  padding: 24px;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  align-self: stretch;
}

.points-right {
  display: flex;
  padding: 24px;
  flex-direction: column;
  align-items: flex-start;
  gap: 20px;
  align-self: stretch;
}

.points-right .right-comp {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
  align-self: stretch;
}

.points-left .header-left {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
}

.points-left h3,
.points-right .title {
  color: #fff;
  font-family: Heebo;
  font-size: 20px;
  font-weight: 700;
  line-height: 1;
  letter-spacing: 1.1px;
  text-transform: uppercase;
}

.points-left p,
.points-right .description {
  color: var(--selvar);
  font-family: Heebo;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
  letter-spacing: 0.7px;
}

.pries {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  align-self: stretch;
}

.points-details {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  flex: 1;
}

.points-details .span1,
.points-total .punket {
  color: var(--Main-Colors-Dove, #6a6c6d);
  font-family: Heebo;
  font-size: 14px;
  font-weight: 400;
  line-height: 1;
  letter-spacing: 0.7px;
}

.points-details .span2 {
  color: #fff;
  font-family: Heebo;
  font-size: 22px;
  font-weight: 300;
  line-height: 1;
  letter-spacing: 1.2px;
  text-transform: uppercase;
}

.points-total {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
  flex: 1;
}

.points-total .punket2 {
  color: var(--Main-Colors-Strawberry, #d15);
  text-align: right;
  font-family: Heebo;
  font-size: 22px;
  font-weight: 400;
  line-height: 1;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  width: 219px;
}

/* :autofill المعياريّة لفايرفوكس؛ البادئة لكروم وسفاري. */
input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus,
input:-webkit-autofill:active,
input:autofill,
input:autofill:hover,
input:autofill:focus,
input:autofill:active {
  -webkit-box-shadow: 0 0 0 1000px var(--primary) inset !important;
  box-shadow: 0 0 0 1000px var(--primary) inset !important;
  /* فايرفوكس لا يعرف ‎-webkit-text-fill-color‎. */
  color: #a3b3bc !important;
  -webkit-text-fill-color: #a3b3bc !important;
  caret-color: #a3b3bc !important;
}

.bg-fade {
  width: 100%;
  height: 64px;
  position: fixed;
  bottom: 0;
  background: linear-gradient(0deg, var(--Main-Colors-Slate, #26282D) 30%, rgba(38, 40, 45, 0.00) 100%);
  transition: opacity 0.3s ease;
  pointer-events: none;
  z-index: 1000;
}

/* Width-based adjustments for .points-container */
@media (min-width: 1440px) and (max-width: 1599px) {

 
  .points-container {
    min-height: 160px;
    max-height: 180px;
  }
  .points-left,
  .points-right {
    min-height: 160px;
    max-height: 180px;
  }
  .input-field::placeholder {
    font-size: medium;
  }
  .confirm-btn {
    display: flex;
    padding: 8px 20px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    align-self: stretch;
    border-radius: 5px;
    background: var(--Main-Colors-Slate-Light, #3A3E42);
  }
  .confirm-btn span {
    color: var(--Main-Colors-Dove, #6A6C6D);
    font-family: Heebo;
    font-size: 16px;
    font-weight: 400;
    line-height: 0.9;
    text-transform: uppercase;
  }
  .input-field,
  .select-button {
    padding: 8px 20px;
  }
  .checkbox-label {
    font-size: 12px;
  }
  .checkbox-row {
    padding: 0;
  }

   .select-button {
    min-height: 43px;
  }

  .section-form-price{
    padding-bottom: 28px;
  }
  
 
}

@media (min-width: 1600px) and (max-width: 2074px) {
  .points-container {
    min-height: 160px;
    max-height: 200px;
  }
  .points-left,
  .points-right {
    min-height: 160px;
    max-height: 200px;
  }
}

@media (min-width: 1901px) {
  .points-container {
    min-height: 185px;
    max-height: 200px;
  }
  .points-left,
  .points-right {
    min-height: 185px;
    max-height: 200px;
  }
}

@media (min-width: 2075px) and (max-width: 2560px) {
  .content-container {
    padding-top: 30px;
  }
  .points-container {
    min-height: 185px;
    max-height: 200px;
  }
  .points-left,
  .points-right {
    min-height: 185px;
    max-height: 200px;
  }


  .checkbox-label {
    width: 650px;
    max-width: 650px;
  }


    .select-button {
    min-height: 48px;
  }
}

/* Style for Reverse charge */
.reverse-charge {
  color: #fff;
  font-family: Heebo;
  font-size: 14px;
  font-weight: 400;
  line-height: 1;
  letter-spacing: 0.7px;
}
</style>



