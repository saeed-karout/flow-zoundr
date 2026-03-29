<template>
  <div class="main">
    <div class="content-publish">
      <div class="row1">
        <div class="column1">
          <div class="Title">
            <div class="release">
              <div class="card" :style="{ backgroundImage: releaseCover ? `url(${releaseCover})` : 'none' }">
                <!-- Background image is set in CSS or inline style -->
              </div>
              <div class="info">
                <div class="name">
                  <div class="first">{{ releaseArtist || 'Diggie' }}</div>
                  <div class="second">{{ releaseTitle || 'Summer Feeling' }}</div>
                </div>
                <span>{{ releaseTypeText }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="column2">
          <div class="info">
            <div class="name">
              <span>Release Zusammenfassung</span>
            </div>

            <div class="list">
              <div class="line1">
                <p>Release Typ:</p>
                <span>{{ releaseType || 'Single' }}</span>
              </div>
              <div class="line2">
                <p>Anzahl Songs:</p>
                <span>{{ songCount }} Songs</span>
              </div>
            </div>

            <div class="last-line">
              <div class="topic">
                Brutto
              </div>

              <div class="total-price">
                {{ totalPrice }} EUR
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- الفورم -->
    <div class="Rechnungsadresse">
      <div class="title">Rechnungsadresse</div>
      <form class="payment-form" @submit.prevent="initiatePayment">
        <div class="form-container">
          <!-- Left Section -->
          <div class="left-section">
            <div class="form-row">
              <div class="form-group">
                <input v-model="formData.company" type="text" placeholder="Firma (optional)"
                  class="input-field" :class="{ 'filled': formData.company }"
                  :disabled="isFieldDisabled.company" />
                <span class="checkmark" v-if="isFieldDisabled.company || formData.company">
                  <img :src="isFieldDisabled.company ? iconDisabled : iconCorrect" alt="completed" />
                </span>
              </div>
            </div>
            <div class="form-row flex">
              <div class="form-group w-50">
                <input v-model="formData.firstName" type="text" placeholder="Vorname" class="input-field"
                  :class="{ 'filled': formData.firstName, 'error': errors.firstName }"
                  :disabled="isFieldDisabled.firstName" />
                <span class="checkmark" v-if="formData.firstName && !errors.firstName">
                  <img :src="isFieldDisabled.firstName ? iconDisabled : iconCorrect" alt="completed" />
                </span>
                <span class="error-message" v-if="errors.firstName">{{ errors.firstName }}</span>
              </div>
              <div class="form-group w-50">
                <input v-model="formData.lastName" type="text" placeholder="Nachname" class="input-field"
                  :class="{ 'filled': formData.lastName, 'error': errors.lastName }"
                  :disabled="isFieldDisabled.lastName" />
                <span class="checkmark" v-if="formData.lastName && !errors.lastName">
                  <img :src="isFieldDisabled.lastName ? iconDisabled : iconCorrect" alt="completed" />
                </span>
                <span class="error-message" v-if="errors.lastName">{{ errors.lastName }}</span>
              </div>
            </div>
            <div class="form-row flex">
              <div class="form-group w-75">
                <input v-model="formData.street" type="text" placeholder="Straße" class="input-field"
                  :class="{ 'filled': formData.street, 'error': errors.street }" :disabled="isFieldDisabled.street" />
                <span class="checkmark" v-if="formData.street && !errors.street">
                  <img :src="isFieldDisabled.street ? iconDisabled : iconCorrect" alt="completed" />
                </span>
                <span class="error-message" v-if="errors.street">{{ errors.street }}</span>
              </div>
              <div class="input-wrapper w-33">
                <input v-model="formData.streetNr" type="text" placeholder="Nr." class="input-field"
                  :class="{ 'filled': formData.streetNr, 'error': errors.streetNr }"
                  :disabled="isFieldDisabled.streetNr" />
                <span class="checkmark" v-if="formData.streetNr && !errors.streetNr">
                  <img :src="isFieldDisabled.streetNr ? iconDisabled : iconCorrect" alt="completed" />
                </span>
                <span class="error-message" v-if="errors.streetNr">{{ errors.streetNr }}</span>
              </div>
            </div>
            <div class="form-row flex">
              <div class="input-wrapper w-33">
                <input v-model="formData.postalCode" type="text" placeholder="PLZ" class="input-field"
                  :class="{ 'filled': formData.postalCode, 'error': errors.postalCode }"
                  :disabled="isFieldDisabled.postalCode" />
                <span class="checkmark" v-if="formData.postalCode && !errors.postalCode">
                  <img :src="isFieldDisabled.postalCode ? iconDisabled : iconCorrect" alt="completed" />
                </span>
                <span class="error-message" v-if="errors.postalCode">{{ errors.postalCode }}</span>
              </div>
              <div class="form-group w-67">
                <input v-model="formData.city" type="text" placeholder="Ort" class="input-field"
                  :class="{ 'filled': formData.city, 'error': errors.city }" :disabled="isFieldDisabled.city" />
                <span class="checkmark" v-if="formData.city && !errors.city">
                  <img :src="isFieldDisabled.city ? iconDisabled : iconCorrect" alt="completed" />
                </span>
                <span class="error-message" v-if="errors.city">{{ errors.city }}</span>
              </div>
            </div>
          </div>

          <!-- Right Section -->
          <div class="right-section">
            <div class="form-row">
              <div class="form-group">
                <div class="custom-select" :class="{ 'focused': isLandFocused }">
                  <div class="select-button"
                    @click="isLandFocused = !isLandFocused && !isFieldDisabled.country"
                    :class="{ 'filled': formData.country, 'error': errors.country, 'disabled': isFieldDisabled.country }">
                    <span>{{ countryDisplayName(formData.country) }}</span>
                    <span class="checkmark">
                      <img v-if="formData.country && !errors.country && isFieldDisabled.country"
                        :src="iconDisabled" alt="locked" />
                      <img v-else-if="formData.country && !errors.country" :src="iconCorrect" alt="completed" />
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
                  <ul class="options" v-if="isLandFocused && !isFieldDisabled.country">
                    <li @click="selectCountry('germany')">Deutschland</li>
                    <li @click="selectCountry('austria')">Österreich</li>
                    <li @click="selectCountry('switzerland')">Schweiz</li>
                  </ul>
                </div>
                <span class="error-message" v-if="errors.country">{{ errors.country }}</span>
              </div>
            </div>

            <div class="form-row" v-if="formData.country === 'austria'">
              <div class="form-group ustid-group">
                <input v-model="formData.ustId" type="text" placeholder="UST-ID" class="input-field"
                  :class="{ 'filled': formData.ustId, 'error': errors.ustId }" :disabled="isFieldDisabled.ustId" />
                <button type="button" class="confirm-btn" @click="validateUstId"
                  :disabled="!formData.ustId || isLoading || isFieldDisabled.ustId">
                  Bestätigen
                </button>
                <span class="checkmark" v-if="isUstIdValid && !errors.ustId">
                  <img :src="isFieldDisabled.ustId ? iconDisabled : iconCorrect" alt="completed" />
                </span>
                <span class="error-message" v-if="errors.ustId">{{ errors.ustId }}</span>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <input v-model="formData.email" id="email" type="email" class="input-field"
                  :class="{ 'filled': formData.email }" disabled />
                <span class="checkmark" v-if="formData.email">
                  <img :src="iconDisabled" alt="locked" />
                </span>
              </div>
            </div>

            <div class="form-row checkbox-row">
              <div class="checkbox-container">
                <input v-model="formData.agreement" type="checkbox" id="agreement" class="person-checkbox"
                  :class="{ 'error': errors.agreement }" />
                <label for="agreement" class="checkbox-label">
                  Ich habe die AGBs, das Widerrufsrecht und die Datenschutzerklärung gelesen, verstanden und stimme zu.
                </label>
              </div>
              <span class="error-message" v-if="errors.agreement">{{ errors.agreement }}</span>
            </div>
          </div>
        </div>

      </form>
    </div>
  </div>
  <!-- Price and Buttons Section -->
  <div class="price-section">
  
    <div class="form-buttons">
    
      <button class="pay-button" @click="initiatePayment" :disabled="!isFormValid || isLoading">
        {{ paymentButtonLabel }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useDataStore } from '@/stores/data';
import apiRequest from '@/lib/apiRequest';
import authHeader from '@/services/auth-header';
import iconDisabled from '@/assets/icons/Icon_awesome-lock.png';
import iconCorrect from '@/assets/icons/y.png';

const props = defineProps({
  currentStep: { type: Number, required: true },
  steps: { type: Array, default: () => ['0', '1', '2', '3', '4', '5'] },
  releaseUuid: { type: String, required: true }
});

const emit = defineEmits(['next', 'back']);

const router = useRouter();
const dataStore = useDataStore();

// بيانات المستخدم
const userEmail = computed(() => dataStore.user?.email || '');
const billingFirstName = computed(() => dataStore.user?.billing_first_name || '');
const billingLastName = computed(() => dataStore.user?.billing_last_name || '');
const billingStreetName = computed(() => dataStore.user?.billing_street_name || '');
const billingStreetNumber = computed(() => dataStore.user?.billing_street_number || '');
const billingPostalCode = computed(() => dataStore.user?.billing_postal_code || '');
const billingCity = computed(() => dataStore.user?.billing_city || '');
const billingCountry = computed(() => dataStore.user?.billing_country || '');
const billingCompany = computed(() => dataStore.user?.billing_company || '');
const billingVatId = computed(() => dataStore.user?.billing_vat_id || '');

// بيانات الـ Release
const releaseCover = ref(null);
const releaseArtist = ref('Diggie');
const releaseTitle = ref('Summer Feeling');
const releaseType = ref('Single');
const audioQuality = ref('lossless')
const songCount = ref(2);
const releaseTypeText = computed(() => {
  return `${audioQuality.value} – ${releaseType.value} (${songCount.value} Song${songCount.value > 1 ? 's' : ''})`;
});

// النموذج
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

const isFieldDisabled = computed(() => ({
  company: !!billingFirstName.value,
  firstName: !!billingFirstName.value,
  lastName: !!billingLastName.value,
  street: !!billingFirstName.value,
  streetNr: !!billingFirstName.value,
  postalCode: !!billingFirstName.value,
  city: !!billingFirstName.value,
  country: !!billingFirstName.value,
  ustId: !!billingFirstName.value,
  email: true,
}));

// الأخطاء والحالة
const errors = ref({ firstName: '', lastName: '', street: '', streetNr: '', postalCode: '', city: '', country: '', ustId: '', agreement: '' });
const isLandFocused = ref(false);
const isUstIdValid = ref(false);
const isLoading = ref(false);
const paymentStatus = ref(0);

// الحسابات
const pricePerSong = 9.5; // سعر كل أغنية - يمكن تعديله حسب الحاجة
const totalWithTax = computed(() => songCount.value * pricePerSong);

const taxRate = computed(() => {
  if (formData.value.country === 'germany') return 0.19;
  if (formData.value.country === 'austria') return formData.value.ustId && isUstIdValid.value ? 0 : 0.19;
  if (formData.value.country === 'switzerland') return 0;
  return 0;
});

const netPrice = computed(() => {
  if (taxRate.value === 0) return totalWithTax.value.toFixed(2);
  const net = totalWithTax.value / (1 + taxRate.value);
  return net.toFixed(2);
});

const tax = computed(() => {
  if (taxRate.value === 0) return '0,00';
  return (totalWithTax.value - parseFloat(netPrice.value)).toFixed(2);
});

const totalPrice = computed(() => totalWithTax.value.toFixed(2));
const taxRateDisplay = computed(() => taxRate.value === 0 ? '(0%)' : `(${taxRate.value * 100}%)`);
const isReverseCharge = computed(() => formData.value.country === 'austria' && formData.value.ustId && isUstIdValid.value);
const paymentButtonLabel = computed(() => totalWithTax.value === 0 ? 'Kostenlos fortfahren' : 'Zahlung per Paypal');

const countryDisplayMap = { 
  germany: 'Deutschland', 
  austria: 'Österreich', 
  switzerland: 'Schweiz' 
};
const countryDisplayName = (c) => countryDisplayMap[c] || c || 'Land';

const selectCountry = (country) => {
  formData.value.country = country;
  isLandFocused.value = false;
  errors.value.country = '';
  
  // إعادة تعيين UST-ID إذا تغيرت الدولة
  if (country !== 'austria') {
    formData.value.ustId = '';
    isUstIdValid.value = false;
  }
};

// UST-ID Validation
const validateUstId = async () => {
  if (!formData.value.ustId || formData.value.country !== 'austria' || isFieldDisabled.value.ustId) return;
  isLoading.value = true;
  try {
    // محاكاة التحقق - في الواقع يجب استدعاء API حقيقي
    await new Promise(resolve => setTimeout(resolve, 500));
    const isValid = formData.value.ustId.startsWith('AT');
    isUstIdValid.value = isValid;
    errors.value.ustId = isValid ? '' : 'Ungültige UST-ID';
  } catch {
    isUstIdValid.value = false;
    errors.value.ustId = 'Fehler beim Überprüfen der UST-ID';
  } finally {
    isLoading.value = false;
  }
};

// جلب بيانات الـ Release
const fetchReleaseData = async () => {
  if (!props.releaseUuid) return;
  
  try {
    const response = await apiRequest.get(`/releases/${props.releaseUuid}`);
    const release = response.data.data || response.data;
    
    if (release) {
      releaseArtist.value = release.artist_name || 'artist name';
      releaseTitle.value = release.title || 'undefine title';
      releaseType.value = release.release_type || 'undefine releaseType';
      audioQuality.value = release.audio_quality || 'undefine audio quality';
      
      // جلب عدد الأغاني
      const songsResponse = await apiRequest.get(`/releases/${props.releaseUuid}/songs`);
      const songs = songsResponse.data.data || [];
      songCount.value = songs.length;
      
      // صورة الغلاف
      if (release.cover) {
        releaseCover.value = release.cover.startsWith('http') 
          ? release.cover 
          : `${import.meta.env.VITE_STORAGE_URL}/${release.cover}`;
      }
    }
  } catch (error) {
    console.error('❌ فشل جلب بيانات الـ Release:', error);
  }
};

// دالة العودة للخطوة السابقة
const goBack = () => {
  console.log('🔙 العودة للخطوة السابقة');
  emit('back');
};

// التحقق من النموذج
const validateForm = () => {
  errors.value = { 
    firstName: '', lastName: '', street: '', streetNr: '', 
    postalCode: '', city: '', country: '', ustId: '', agreement: '' 
  };
  let ok = true;
  const f = formData.value;
  const d = isFieldDisabled.value;

  if (!f.firstName.trim() && !d.firstName) { errors.value.firstName = 'Vorname ist erforderlich'; ok = false; }
  if (!f.lastName.trim() && !d.lastName) { errors.value.lastName = 'Nachname ist erforderlich'; ok = false; }
  if (!f.street.trim() && !d.street) { errors.value.street = 'Straße ist erforderlich'; ok = false; }
  if (!f.streetNr.trim() && !d.streetNr) { errors.value.streetNr = 'Hausnummer ist erforderlich'; ok = false; }
  if (!f.postalCode.trim() && !d.postalCode) { errors.value.postalCode = 'PLZ ist erforderlich'; ok = false; }
  if (!f.city.trim() && !d.city) { errors.value.city = 'Ort ist erforderlich'; ok = false; }
  if (!f.country && !d.country) { errors.value.country = 'Land ist erforderlich'; ok = false; }
  if (f.country === 'austria' && f.ustId && !isUstIdValid.value && !d.ustId) {
    errors.value.ustId = 'Bitte bestätigen Sie eine gültige UST-ID';
    ok = false;
  }
  if (!f.agreement) { errors.value.agreement = 'Sie müssen den AGBs zustimmen'; ok = false; }
  return ok;
};

const isFormValid = computed(() => {
  const f = formData.value;
  const d = isFieldDisabled.value;
  return (
    (f.firstName.trim() || d.firstName) &&
    (f.lastName.trim() || d.lastName) &&
    (f.street.trim() || d.street) &&
    (f.streetNr.trim() || d.streetNr) &&
    (f.postalCode.trim() || d.postalCode) &&
    (f.city.trim() || d.city) &&
    (f.country || d.country) &&
    (f.country !== 'austria' || !f.ustId || isUstIdValid.value || d.ustId) &&
    f.agreement
  );
});



// دالة الدفع باستخدام /releases/{release}/request-payment
const initiatePayment = async () => {
  if (!validateForm()) return;
  isLoading.value = true;

  // تجهيز بيانات الفوترة بالشكل المطلوب
  const billingDetails = {
    company: formData.value.company || '',
    first_name: formData.value.firstName,
    last_name: formData.value.lastName,
    street_name: formData.value.street,
    street_number: formData.value.streetNr,
    postal_code: formData.value.postalCode,
    city: formData.value.city,
    country: formData.value.country,
    vat_id: formData.value.ustId || null
  };

  // حفظ بيانات الفوترة في المتجر
  dataStore.setPaymentFormData(billingDetails);
  localStorage.setItem('paymentFormData', JSON.stringify(billingDetails));
  dataStore.setTotalPrice(parseFloat(totalPrice.value));

  try {
    // استخدام endpoint جديد لطلب الدفع مع الـ payload المطلوب
    const payload = {
      country: formData.value.country,
      amount: parseFloat(totalPrice.value),
      billing_details: billingDetails,
      currency: 'EUR',
      success_url: `${window.location.origin}/payment/success?release=${props.releaseUuid}`,
      cancel_url: `${window.location.origin}/payment/canceled?release=${props.releaseUuid}`,
    };

    console.log('📤 إرسال طلب الدفع:', payload);
    
    const response = await apiRequest.post(
      `/releases/${props.releaseUuid}/request-payment`, 
      payload, 
      { headers: { ...authHeader() } }
    );

    if (response.status !== 200 && response.status !== 201) throw new Error('Unexpected status');

    console.log('✅ تم استلام رد الدفع:', response.data);
    
    localStorage.setItem('paymentStatus', '0');
    paymentStatus.value = 0;

    // إذا كان السعر 0، انتقل مباشرة إلى صفحة النجاح
    if (totalWithTax.value === 0) {
      router.push('/thanks');
      return;
    }

    // دفع PayPal - فتح نافذة الدفع
    const paymentUrl = response.data.payment_url || response.data.url;
    if (!paymentUrl || paymentUrl === '-') throw new Error('No payment URL');

    const popup = window.open(paymentUrl, 'paypal_payment_popup', 'width=900,height=950');
    if (!popup) throw new Error('Popup blocked');

    // الاستماع لرسائل من نافذة الدفع
    const onMessage = async (e) => {
      const allowed = [window.location.origin, 'https://www.paypal.com'];
      if (!allowed.includes(e.origin)) return;

      console.log('Received message from popup:', e.data);

      if (e.data.type === 'PAYMENT_STATUS_UPDATE' || e.data.type === 'PAYMENT_SUCCESS') {
        localStorage.setItem('paymentStatus', '1');
        paymentStatus.value = 1;
        
        // تنظيف البيانات والانتقال إلى صفحة الشكر
        dataStore.clearPaymentFormData();
        localStorage.removeItem('paymentFormData');
        await dataStore.loadUser();
        
        // **مهم**: إعادة تعيين paymentStatus بعد الانتقال
        setTimeout(() => {
          localStorage.setItem('paymentStatus', '0');
          paymentStatus.value = 0;
          console.log('✅ Payment status reset to 0');
        }, 100);
        
        // الانتقال إلى صفحة thanks
        console.log('✅ Payment successful, redirecting to /thanks');
        router.push('/thanks');
      }
    };
    window.addEventListener('message', onMessage);

    // مراقبة إغلاق النافذة
    const monitor = setInterval(() => {
      if (popup.closed) {
        clearInterval(monitor);
        const currentStatus = localStorage.getItem('paymentStatus');
        console.log('Popup closed, payment status:', currentStatus);
        
        // إذا كانت حالة الدفع نجاح، انتقل إلى thanks
        if (currentStatus === '1') {
          dataStore.clearPaymentFormData();
          localStorage.removeItem('paymentFormData');
          
          // **مهم**: إعادة تعيين paymentStatus بعد الانتقال
          setTimeout(() => {
            localStorage.setItem('paymentStatus', '0');
            paymentStatus.value = 0;
            console.log('✅ Payment status reset to 0');
          }, 100);
          
          router.push('/thanks');
        } else {
          console.log('Payment popup closed without success');
        }
      }
    }, 500);

  } catch (error) {
    console.error('❌ فشل في طلب الدفع:', error);
  } finally {
    isLoading.value = false;
  }
};

// مراقبة تغييرات المستخدم
watch(userEmail, (v) => (formData.value.email = v));

watch(() => dataStore.user, (u) => {
  if (u?.billing_first_name) {
    Object.assign(formData.value, {
      company: u.billing_company || '',
      firstName: u.billing_first_name || '',
      lastName: u.billing_last_name || '',
      street: u.billing_street_name || '',
      streetNr: u.billing_street_number || '',
      postalCode: u.billing_postal_code || '',
      city: u.billing_city || '',
      country: u.billing_country || '',
      ustId: u.billing_vat_id || '',
      email: u.email || '',
      agreement: true,
    });
  } else {
    Object.assign(formData.value, {
      company: '', firstName: '', lastName: '', street: '', streetNr: '',
      postalCode: '', city: '', country: '', ustId: '', email: u?.email || '', agreement: false
    });
  }
}, { immediate: true, deep: true });

onMounted(async () => {
  console.log('🚀 Upload4Component mounted with releaseUuid:', props.releaseUuid);
  await fetchReleaseData();
  
  const saved = localStorage.getItem('paymentStatus');
  if (saved) paymentStatus.value = parseInt(saved);
});
</script>

<style lang="scss" scoped>
.main {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 60px;
  flex: 1 0 0;
  align-self: stretch;
  width: 100%;
  position: relative;
}

.content-publish {
  display: flex;
  align-items: center;
  gap: 20px;
  align-self: stretch;
}

.row1 {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex: 1 0 0;
}

.row1 .column1 {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 52px;
  flex: 1 0 0;
}

.column1 .Title {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 24px;
  align-self: stretch;
}

.column1 .Title .release {
  display: flex;
  align-items: center;
  gap: 20px;
}

.release .card {
  display: flex;
  width: 210px;
  height: 210px;
  padding: 140px 20px 80px 20px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 112px;
  aspect-ratio: 1/1;
  border-radius: 20px;
  background: url() lightgray 50% / cover no-repeat;
  box-shadow: 4px 4px 20px 0 rgba(27, 28, 32, 0.20);
}

.release .info {
  display: flex;
  height: 210px;
  padding: 20px 0;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 32px;
}

.info .name {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 20px;
}

.info .name .first {
  color: var(--Main-Colors-White, #FFF);
  font-family: Heebo;
  font-size: 58px;
  font-style: normal;
  font-weight: 700;
  line-height: 1;
  text-transform: uppercase;
}

.info .name .second {
  color: var(--Main-Colors-White, #FFF);
  font-family: Heebo;
  font-size: 40px;
  font-style: normal;
  font-weight: 700;
  line-height: 1;
}

.info span {
  color: var(--Main-Colors-White, #FFF);
  font-family: Heebo;
  font-size: 18px;
  font-style: normal;
  font-weight: 300;
  line-height: 1;
  text-transform: uppercase;
}

.column2 {
  display: flex;
  padding-left: 285px;
  align-items: flex-start;
  gap: 20px;
  flex: 1 0 0;
}

.column2 .info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 32px;
  flex: 1 0 0;
  align-self: stretch;
}

.column2 .info .name {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 20px;
}

.column2 .info .name span {
  color: var(--Main-Colors-White, #FFF);
  font-family: Heebo;
  font-size: 20px;
  font-style: normal;
  font-weight: 700;
  line-height: 1;
  text-transform: uppercase;
}

.column2 .info .list {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 24px;
  align-self: stretch;
}

.column2 .info .list .line1,
.column2 .info .list .line2 {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  align-self: stretch;
}

.column2 .info .list .line1 p,
.column2 .info .list .line2 p {
  color: var(--Main-Colors-White, #FFF);
  font-family: Heebo;
  font-size: 20px;
  font-style: normal;
  font-weight: 300;
  line-height: 1;
}

.column2 .info .list .line1 span,
.column2 .info .list .line2 span {
  color: var(--Main-Colors-White, #FFF);
  font-family: Heebo;
  font-size: 20px;
  font-style: normal;
  font-weight: 700;
  line-height: 1;
  text-transform: uppercase;
}

.column2 .info .list .line2 p {
  font-size: 18px;
}

.column2 .info .list .line2 span {
  color: var(--Main-Colors-White, #FFF);
  font-family: Heebo;
  font-size: 18px;
  font-style: normal;
  font-weight: 300;
  line-height: 1;
  text-transform: uppercase;
}

.column2 .info .last-line {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  align-self: stretch;
}

.column2 .info .last-line .topic {
  color: var(--Main-Colors-White, #FFF);
  font-family: Heebo;
  font-size: 28px;
  font-style: normal;
  font-weight: 700;
  line-height: 1;
}

.column2 .info .last-line .total-price {
  color: var(--Main-Colors-White, #FFF);
  font-family: Heebo;
  font-size: 28px;
  font-style: normal;
  font-weight: 700;
  line-height: 1;
  text-transform: uppercase;
}

/* أنماط الفورم */
.Rechnungsadresse {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
  align-self: stretch;
}

.Rechnungsadresse .title {
  color: var(--Main-Colors-White, #FFF);
  font-family: Heebo;
  font-size: 20px;
  font-style: normal;
  font-weight: 700;
  line-height: 1;
  text-transform: uppercase;
  letter-spacing: 1px;
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
  gap: 16px;
}

.form-row {
  display: flex;
  gap: 12px;
  align-items: center;
  width: 100%;
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

.w-50 {
  width: 50% !important;
}

.w-75 {
  width: 75% !important;
}

.w-33 {
  width: 33.3% !important;
}

.w-67 {
  width: 60% !important;
}

.input-field {
  padding: 12px 16px;
  width: 100%;
  background-color: var(--primary);
  border: 1px solid var(--primary);
  border-radius: 5px;
  color: var(--selvar);
  outline: none;
  transition: background-color 0.3s, color 0.3s;
  max-height: 50px;
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

.input-field::placeholder {
  color: var(--Main-Colors-Dove, #6A6C6D);
  font-size: 18px;
  font-weight: 300;
  line-height: 1;
  letter-spacing: 1px;
}

.input-field:disabled {
  color: #6A6C6D;
  background-color: var(--primary);
  opacity: 0.7;
  cursor: not-allowed;
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
  min-height: 50px;
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
  font-family: Heebo;
  font-size: 18px;
  font-weight: 300;
  line-height: 1;
  letter-spacing: 1px;
}

.select-button.filled span {
  color: #fff;
}

.select-button.disabled {
  color: #6A6C6D;
  background-color: var(--primary);
  opacity: 0.7;
  cursor: not-allowed;
}

.select-button.disabled span {
  color: #6A6C6D;
}

.select-button.error {
  border-color: #ff4d4f;
}

.custom-select.focused .select-button {
  border-color: var(--move);
  border-radius: 5px 5px 0 0;
  background-color: var(--secondary);
  border: 1px solid var(--move);
  border-bottom: 1px solid transparent;
}

.options {
  position: absolute;
  top: 95%;
  left: 0;
  right: 0;
  margin-top: 2px;
  background-color: var(--secondary);
  border: 1px solid var(--move);
  border-top: 1px solid var(--secondary);
  border-radius: 0 0 5px 5px;
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

.confirm-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.confirm-btn:hover:not(:disabled) {
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

/* Price and Buttons Section */
.price-section {
  display: flex;
  padding-top: 24px;
  align-items: flex-end;
  gap: 16px;
  align-self: stretch;
  margin-top: 20px;
}

.price-details {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
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

.form-buttons {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 16px;
  flex: 1 0 0;
}

.back-btn {
  display: flex;
  height: 42px;
  padding: 17px 20px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  border-radius: 5px;
  background: var(--Main-Colors-Slate-Light, #3A3E42);
  cursor: pointer;
  color: #FFF;
  font-family: Heebo;
  font-size: 16px;
  font-weight: 400;
  line-height: 1;
  text-transform: uppercase;
}

.back-btn:hover {
  background-color: #990033;
  color: white;
  transition: 0.3s ease;
}

.pay-button {
  display: flex;
  height: 44px;
  padding: 12px 20px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  border-radius: 5px;
  background-color: var(--Strawberry, #D15);
  color: white;
  border: none;
  cursor: pointer;
  font-family: Heebo;
  font-size: 16px;
  font-weight: 400;
  text-transform: uppercase;
  min-width: 200px;
}

.pay-button:disabled {
  cursor: not-allowed;
  background-color: #3A3E42;
  color: #6A6C6D;
}

.pay-button:hover:not(:disabled) {
  background-color: #990033;
}

.reverse-charge {
  color: #fff;
  font-family: Heebo;
  font-size: 14px;
  font-weight: 400;
  line-height: 1;
  letter-spacing: 0.7px;
}

/* Responsive */
@media (min-width:1440px) and (max-width:1599px) {
  .info .name .first {
    font-size: 48px;
    line-height: .8;
  }

  .checkbox-label {
    font-size: 12px !important;
  }

  .info .name .second {
    font-size: 32px;
    width: 236px;
    line-height: .8;
  }

  .info .name {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .release .card {
    width: 130px;
    height: 130px;
    padding: 0;
  }

  .info span {
    font-size: 16px;
    max-width: 300px;
    line-height: .8;
  }

  .release .info {
    gap: 24px;
  }

  .column2 {
    padding-left: 180px;
  }

  .release .info {
    min-width: 298px;
  }

  .column2 .info .last-line .total-price,
  .column2 .info .last-line .topic {
    font-size: 28px;
  }

  .column2 .info .list .line1 p,
  .column2 .info .list .line2 p {
    font-size: 18px;
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

  .input-field,
  .select-button {
    padding: 8px 20px;
  }

  .checkbox-row {
    padding: 0;
  }

  .select-button {
    min-height: 43px;
  }
}

@media (min-width:1600px) and (max-width:2074px) {
  /* يمكن إضافة تعديلات هنا */
}

@media (min-width:2075px) and (max-width:2560px) {
  .checkbox-label {
    width: 490px;
    max-width: 490px;
  }

  .select-button {
    min-height: 48px;
  }
}
</style>