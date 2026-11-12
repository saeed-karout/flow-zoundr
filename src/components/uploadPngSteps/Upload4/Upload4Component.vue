<template>
  <div class="main">

    <div class="content-publish">
      <div class="row1">
        <div class="column1">
          <div class="Title">
            <div class="release">
              <div class="card" :style="{ backgroundImage: releaseCover ? `url(${releaseCover})` : 'none' }">
              </div>
              <div class="info">
                <div class="name">
                  <div class="first">{{ releaseArtist || 'Diggie' }}</div>
                  <div class="second">{{ releaseTitle || 'Summer Feeling' }}</div>
                </div>
                <span :class="{ 'is-correction': isCorrected('audio_quality') || isCorrected('audio_quality_email') }">{{ releaseTypeText }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="column2">
          <div class="info">
            <div class="name">
              <span>Flow Unlimited</span>
            </div>

            <div class="list">
              <div class="line1">
                <p>Netto:</p>
                <span>{{ netPrice }} EUR</span>
              </div>
              <div class="line2">
                <p>MwSt.:</p>
                <span>{{ tax }} EUR {{ taxRateDisplay }}</span>
              </div>
            </div>

            <div class="last-line">
              <div class="topic">Brutto</div>
              <div class="total-price">{{ displayTotalPrice }} EUR</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- الفورم -->
    <div class="Rechnungsadresse">
      <div class="title">Rechnungsadresse</div>
      <form class="payment-form" @submit.prevent="handlePublish">
        <div class="form-container">
          <!-- Left Section -->
          <div class="left-section">
            <div class="form-row">
              <div class="form-group">
                <input v-model="formData.company" type="text" placeholder="Firma (optional)"
                  class="input-field" :class="{ 'filled': formData.company, 'error': errors.company }"
                  :disabled="isFieldDisabled.company" />
                <span class="checkmark" v-if="(formData.company && !errors.company) || isFieldDisabled.company">
                  <img :src="isFieldDisabled.company ? iconDisabled : iconCorrect" alt="completed" />
                </span>
              </div>
            </div>
            <div class="form-row flex">
              <div class="form-group w-50">
                <input v-model="formData.firstName" type="text" placeholder="Vorname" class="input-field"
                  :class="{ 'filled': formData.firstName, 'error': errors.firstName }"
                  :disabled="isFieldDisabled.firstName" />
                <span class="checkmark" v-if="(formData.firstName && !errors.firstName) || isFieldDisabled.firstName">
                  <img :src="isFieldDisabled.firstName ? iconDisabled : iconCorrect" alt="completed" />
                </span>
                <span class="error-message" v-if="errors.firstName">{{ errors.firstName }}</span>
              </div>
              <div class="form-group w-50">
                <input v-model="formData.lastName" type="text" placeholder="Nachname" class="input-field"
                  :class="{ 'filled': formData.lastName, 'error': errors.lastName }"
                  :disabled="isFieldDisabled.lastName" />
                <span class="checkmark" v-if="(formData.lastName && !errors.lastName) || isFieldDisabled.lastName">
                  <img :src="isFieldDisabled.lastName ? iconDisabled : iconCorrect" alt="completed" />
                </span>
                <span class="error-message" v-if="errors.lastName">{{ errors.lastName }}</span>
              </div>
            </div>
            <div class="form-row flex">
              <div class="form-group w-75">
                <input v-model="formData.street" type="text" placeholder="Straße" class="input-field"
                  :class="{ 'filled': formData.street, 'error': errors.street }" 
                  :disabled="isFieldDisabled.street" />
                <span class="checkmark" v-if="(formData.street && !errors.street) || isFieldDisabled.street">
                  <img :src="isFieldDisabled.street ? iconDisabled : iconCorrect" alt="completed" />
                </span>
                <span class="error-message" v-if="errors.street">{{ errors.street }}</span>
              </div>
              <div class="input-wrapper w-33">
                <input v-model="formData.streetNr" type="text" placeholder="Nr." class="input-field"
                  :class="{ 'filled': formData.streetNr, 'error': errors.streetNr }"
                  :disabled="isFieldDisabled.streetNr" />
                <span class="checkmark" v-if="(formData.streetNr && !errors.streetNr) || isFieldDisabled.streetNr">
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
                <span class="checkmark" v-if="(formData.postalCode && !errors.postalCode) || isFieldDisabled.postalCode">
                  <img :src="isFieldDisabled.postalCode ? iconDisabled : iconCorrect" alt="completed" />
                </span>
                <span class="error-message" v-if="errors.postalCode">{{ errors.postalCode }}</span>
              </div>
              <div class="form-group w-67">
                <input v-model="formData.city" type="text" placeholder="Ort" class="input-field"
                  :class="{ 'filled': formData.city, 'error': errors.city }" 
                  :disabled="isFieldDisabled.city" />
                <span class="checkmark" v-if="(formData.city && !errors.city) || isFieldDisabled.city">
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
                <div class="custom-select" ref="landSelectRef" :class="{ 'focused': isLandFocused }">
                  <div class="select-button"
                    @click.stop="isLandFocused = !isLandFocused && !isFieldDisabled.country"
                    :class="{ 'filled': formData.country, 'error': errors.country, 'disabled': isFieldDisabled.country }">
                    <span>{{ countryDisplayName(formData.country) }}</span>
                    <span class="checkmark">
                      <img v-if="formData.country && !errors.country && (isFieldDisabled.country)"
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
                  <transition name="land-dropdown">
                    <ul class="options" v-if="isLandFocused && !isFieldDisabled.country">
                      <li @click="selectCountry('germany')">Deutschland</li>
                      <li @click="selectCountry('austria')">Österreich</li>
                      <li @click="selectCountry('switzerland')">Schweiz</li>
                    </ul>
                  </transition>
                </div>
                <span class="error-message" v-if="errors.country">{{ errors.country }}</span>
              </div>
            </div>

            <!-- UST-ID -->
            <div class="form-row"
              :style="{ opacity: shouldShowUstId ? 1 : 0.3, pointerEvents: shouldShowUstId ? 'auto' : 'none' }">
              <div class="form-group ustid-group">
                <input v-model="formData.ustId" type="text" placeholder="UST-ID" class="input-field"
                  :class="{ 'filled': formData.ustId, 'error': errors.ustId }"
                  :disabled="isFieldDisabled.ustId || !shouldShowUstId" />
                <button type="button" class="confirm-btn" @click="validateUstId"
                  :disabled="!formData.ustId || isLoading || isFieldDisabled.ustId || !shouldShowUstId">
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
                  <span>Widerruf, AGB, Datenschutz, Urheber- und Nutzungsrechte</span><br>
                  Ich habe die AGBs, das Widerrufsrecht und die Datenschutzerklärung gelesen, verstanden und stimme zu. Ich besitze alle erforderlichen Urheber- und Nutzungsrechte bzw. Lizenzrechte zur Vervielfältigung.
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
      <div class="pay-button" @click="handlePublish"
        :class="{ disabled: isLoading || isProcessing || !isFormValid }"
        :aria-disabled="isLoading || isProcessing || !isFormValid">
        {{ buttonLabel }}
      </div>
    </div>
  </div>

  <!-- ✅ بوب اب "الدفع قيد التنفيذ" يظهر في التاب الرئيسية أثناء فتح PayPal في تاب جديدة -->
  <!-- Teleport إلى body ليظهر منتصف الشاشة تماماً ولا يتأثر بأي عنصر أب (transform/overflow/z-index) -->
  <Teleport to="body">
    <transition name="payment-popup-fade">
      <div class="progress-request-popup" v-if="showPaymentPopup">
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
    </transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useCorrections } from '@/composables/useCorrections';
import { useRouter, useRoute } from 'vue-router';
import { useDataStore } from '@/stores/data';
import { useSubscriptionStore } from '@/stores/subscription';
import { useReleaseStore } from '@/stores/release';
import apiRequest from '@/lib/apiRequest';
import authHeader from '@/services/auth-header';
import { subscriptionService } from '@/services/subscriptionService';
import iconDisabled from '@/assets/icons/Icon_awesome-lock.png';
import iconCorrect from '@/assets/icons/y.png';

// حقول مطلوب تصحيحها (Korrektur) ← بوردر أحمر.
const { isCorrected } = useCorrections();

const props = defineProps({
  currentStep: { type: Number, required: true },
  steps: { type: Array, default: () => ['0', '1', '2', '3', '4', '5'] },
  releaseUuid: { type: String, required: true }
});

const emit = defineEmits(['next', 'back']);

const router = useRouter();
const route = useRoute();
const dataStore = useDataStore();
const subscriptionStore = useSubscriptionStore();
const releaseStore = useReleaseStore();

// ========== حالة الاشتراك ==========
const subscriptionStatus = ref(null);
const isSubscriptionActive = ref(false);
const isProcessing = ref(false);
const showSubscriptionPopup = ref(false);
// ✅ بوب اب "الدفع قيد التنفيذ" (النقاط) في التاب الرئيسية أثناء فتح PayPal
const showPaymentPopup = ref(false);

const isFetchingSubscription = ref(false);
const lastFetchTime = ref(0);
const fetchAttempts = ref(0);
const MAX_ATTEMPTS = 3;

// ========== بيانات المستخدم ==========
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

// ========== بيانات الـ Release ==========
const releaseCover = ref(null);
const releaseArtist = ref('Diggie');
const releaseTitle = ref('Summer Feeling');
const releaseType = ref('Single');
const audioQuality = ref('lossless');
const songCount = ref(2);
const releaseTypeText = computed(() => {
  return `${audioQuality.value} – ${releaseType.value} (${songCount.value} Song${songCount.value > 1 ? 's' : ''})`;
});

// ========== النموذج ==========
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

// ========== ✅ التحقق من وجود بيانات الفواتير الفعلية ==========
const hasBillingData = computed(() => {
  return !!(billingFirstName.value || billingLastName.value || billingStreetName.value || billingStreetNumber.value ||
            billingPostalCode.value || billingCity.value || billingCountry.value);
});

// ========== ✅ تحديد ما إذا كانت الحقول معطلة ==========
const isFieldDisabled = computed(() => {
  const hasData = hasBillingData.value;
  
  return {
    // ✅ عند قفل الفورم (وجود بيانات فوترة) نقفل Firma أيضاً حتى لو كانت فارغة —
    //    فهي جزء من الفورم المقفل ولا يجب أن تبقى قابلة للتعديل وحدها.
    company: hasData,
    firstName: hasData && !!billingFirstName.value && billingFirstName.value.trim() !== '',
    lastName: hasData && !!billingLastName.value && billingLastName.value.trim() !== '',
    street: hasData && !!billingStreetName.value && billingStreetName.value.trim() !== '',
    streetNr: hasData && !!billingStreetNumber.value && billingStreetNumber.value.trim() !== '',
    postalCode: hasData && !!billingPostalCode.value && billingPostalCode.value.trim() !== '',
    city: hasData && !!billingCity.value && billingCity.value.trim() !== '',
    country: hasData && !!billingCountry.value && billingCountry.value.trim() !== '',
    ustId: hasData && !!billingVatId.value && billingVatId.value.trim() !== '',
    email: true,
  };
});

// ========== تحديد ما إذا كان يجب عرض UST-ID ==========
const shouldShowUstId = computed(() => {
  if (formData.value.country === 'austria') return true;
  const country = formData.value.country || billingCountry.value;
  if (country === 'austria' || country === 'at' || country === 'Austria' || country === 'AT') return true;
  return false;
});

// ========== الأخطاء ==========
const errors = ref({ 
  company: '',
  firstName: '', 
  lastName: '', 
  street: '', 
  streetNr: '', 
  postalCode: '', 
  city: '', 
  country: '', 
  ustId: '', 
  agreement: '' 
});

const isLandFocused = ref(false);
const landSelectRef = ref(null);

// ✅ إغلاق قائمة Land عند النقر خارجها.
const handleLandClickOutside = (event) => {
  if (!isLandFocused.value) return;
  if (landSelectRef.value && !landSelectRef.value.contains(event.target)) {
    isLandFocused.value = false;
  }
};
const isUstIdValid = ref(false);
const isLoading = ref(false);

// ========== ✅ الأسعار الثابتة ==========
const FIXED_PRICES = {
  netto: 15.97,
  tax: 3.03,
  brutto: 19.00
};

const netPrice = computed(() => {
  if (isSubscriptionActive.value) return '0,00';
  return FIXED_PRICES.netto.toFixed(2).replace('.', ',');
});

const tax = computed(() => {
  if (isSubscriptionActive.value) return '0,00';
  return FIXED_PRICES.tax.toFixed(2).replace('.', ',');
});

const displayTotalPrice = computed(() => {
  if (isSubscriptionActive.value) return '0,00';
  return FIXED_PRICES.brutto.toFixed(2).replace('.', ',');
});

const taxRateDisplay = computed(() => {
  if (isSubscriptionActive.value) return '';
  return '';
});

// ========== زر النشر ==========
const buttonLabel = computed(() => {
  if (isLoading.value) return 'Wird geladen...';
  if (isProcessing.value) return 'Wird bearbeitet...';
  if (isSubscriptionActive.value) return 'Veröffentlichen';
  return 'Abonnieren & Veröffentlichen';
});

const countryDisplayMap = { 
  germany: 'Deutschland', 
  austria: 'Österreich', 
  switzerland: 'Schweiz' 
};

const countryDisplayName = (c) => {
  if (!c) return 'Land';
  const normalized = c.toLowerCase();
  if (normalized === 'germany' || normalized === 'de') return 'Deutschland';
  if (normalized === 'austria' || normalized === 'at') return 'Österreich';
  if (normalized === 'switzerland' || normalized === 'ch') return 'Schweiz';
  return countryDisplayMap[c] || c || 'Land';
};

// ========== دوال النموذج ==========
const selectCountry = (country) => {
  formData.value.country = country;
  isLandFocused.value = false;
  errors.value.country = '';
  
  if (country !== 'austria') {
    formData.value.ustId = '';
    isUstIdValid.value = false;
  }
};

const validateUstId = async () => {
  const country = formData.value.country || billingCountry.value;
  const isAustria = country === 'austria' || country === 'at' || country === 'Austria' || country === 'AT';
  
  if (!formData.value.ustId || !isAustria || isFieldDisabled.value.ustId) return;
  isLoading.value = true;
  try {
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

// ========== ✅ دالة validateForm المحسنة ==========
const validateForm = () => {
  // ✅ إعادة تعيين الأخطاء
  errors.value = { 
    company: '',
    firstName: '', 
    lastName: '', 
    street: '', 
    streetNr: '', 
    postalCode: '', 
    city: '', 
    country: '', 
    ustId: '', 
    agreement: '' 
  };
  
  let ok = true;
  const f = formData.value;
  const d = isFieldDisabled.value;

  // ✅ التحقق من الحقول المعطلة (إذا كانت معطلة، تعتبر مكتملة)
  if (!f.firstName.trim() && !d.firstName) { 
    errors.value.firstName = 'Vorname ist erforderlich'; 
    ok = false; 
  }
  if (!f.lastName.trim() && !d.lastName) { 
    errors.value.lastName = 'Nachname ist erforderlich'; 
    ok = false; 
  }
  if (!f.street.trim() && !d.street) { 
    errors.value.street = 'Straße ist erforderlich'; 
    ok = false; 
  }
  if (!f.streetNr.trim() && !d.streetNr) { 
    errors.value.streetNr = 'Hausnummer ist erforderlich'; 
    ok = false; 
  }
  if (!f.postalCode.trim() && !d.postalCode) { 
    errors.value.postalCode = 'PLZ ist erforderlich'; 
    ok = false; 
  }
  if (!f.city.trim() && !d.city) { 
    errors.value.city = 'Ort ist erforderlich'; 
    ok = false; 
  }
  if (!f.country && !d.country) { 
    errors.value.country = 'Land ist erforderlich'; 
    ok = false; 
  }
  
  // ✅ UST-ID اختيارية — لا فاليديشن يمنع زر الدفع (لا شرط عليها حتى للنمسا).

  // ✅ التحقق من checkbox
  if (!f.agreement) { 
    errors.value.agreement = 'Bitte akzeptieren Sie die AGBs'; 
    ok = false; 
  }
  
  return ok;
};

// ========== ✅ التحقق من صحة النموذج ==========
const isFormValid = computed(() => {
  const f = formData.value;
  const d = isFieldDisabled.value;
  
  // ✅ يجب أن يكون checkbox محدد
  if (!f.agreement) {
    return false;
  }
  
  // ✅ إذا كانت الحقول معطلة (توجد بيانات من المستخدم)، نعتبرها مكتملة
  // ✅ فقط نتحقق من checkbox
  if (d.firstName && d.lastName && d.street && d.streetNr && d.postalCode && d.city && d.country) {
    // ✅ UST-ID اختيارية — لا تمنع زر الدفع.
    return true;
  }
  
  // ✅ التحقق من جميع الحقول المطلوبة (للمستخدمين الجدد)
  const hasRequiredFields = 
    (f.firstName.trim() || d.firstName) &&
    (f.lastName.trim() || d.lastName) &&
    (f.street.trim() || d.street) &&
    (f.streetNr.trim() || d.streetNr) &&
    (f.postalCode.trim() || d.postalCode) &&
    (f.city.trim() || d.city) &&
    (f.country || d.country);
  
  if (!hasRequiredFields) {
    return false;
  }

  // ✅ UST-ID اختيارية — لا تمنع زر الدفع.

  return true;
});

// ========== ✅ دالة تحديث حالة Publish في الـ Store ==========
const updatePublishStatus = () => {
  if (route.query.forceView === 'firstSection') {
    console.log('⏸️ [Upload4] ForceView is firstSection, skipping publish status update');
    return;
  }
  
  if (releaseStore.isPublishComplete === true) {
    console.log('⏸️ [Upload4] isPublishComplete already true, preserving value');
    return;
  }
  
  const isValid = isFormValid.value;
  
  if (isValid && formData.value.agreement) {
    console.log('✅ [Upload4] Publish is COMPLETE');
    releaseStore.setPublishComplete(true);
    
    window.dispatchEvent(new CustomEvent('publish-complete', {
      detail: { isComplete: true }
    }));
    
    window.dispatchEvent(new CustomEvent('store-updated', {
      detail: { type: 'publish-complete', value: true }
    }));
    
  } else {
    console.log('❌ [Upload4] Publish is NOT complete');
    releaseStore.setPublishComplete(false);
  }
};

// ========== ✅ مراقبة تغيير checkbox ==========
watch(
  () => formData.value.agreement,
  (newValue) => {
    console.log('📌 [Upload4] Checkbox changed to:', newValue);
    updatePublishStatus();
  },
  { immediate: true }
);

// ========== ✅ مراقبة تغيير النموذج بالكامل ==========
watch(
  () => [
    formData.value.agreement,
    formData.value.firstName,
    formData.value.lastName,
    formData.value.street,
    formData.value.streetNr,
    formData.value.postalCode,
    formData.value.city,
    formData.value.country,
    formData.value.ustId,
    isUstIdValid.value,
    isFieldDisabled.value
  ],
  () => {
    // ✅ عرض الأخطاء في الوقت الفعلي (بدون مسح)
    const f = formData.value;
    const d = isFieldDisabled.value;
    
    if (!f.firstName.trim() && !d.firstName && f.firstName !== '') {
      errors.value.firstName = 'Vorname ist erforderlich';
    } else if (f.firstName.trim() || d.firstName) {
      errors.value.firstName = '';
    }
    
    if (!f.lastName.trim() && !d.lastName && f.lastName !== '') {
      errors.value.lastName = 'Nachname ist erforderlich';
    } else if (f.lastName.trim() || d.lastName) {
      errors.value.lastName = '';
    }
    
    if (!f.street.trim() && !d.street && f.street !== '') {
      errors.value.street = 'Straße ist erforderlich';
    } else if (f.street.trim() || d.street) {
      errors.value.street = '';
    }
    
    if (!f.streetNr.trim() && !d.streetNr && f.streetNr !== '') {
      errors.value.streetNr = 'Hausnummer ist erforderlich';
    } else if (f.streetNr.trim() || d.streetNr) {
      errors.value.streetNr = '';
    }
    
    if (!f.postalCode.trim() && !d.postalCode && f.postalCode !== '') {
      errors.value.postalCode = 'PLZ ist erforderlich';
    } else if (f.postalCode.trim() || d.postalCode) {
      errors.value.postalCode = '';
    }
    
    if (!f.city.trim() && !d.city && f.city !== '') {
      errors.value.city = 'Ort ist erforderlich';
    } else if (f.city.trim() || d.city) {
      errors.value.city = '';
    }
    
    if (!f.country && !d.country && f.country !== '') {
      errors.value.country = 'Land ist erforderlich';
    } else if (f.country || d.country) {
      errors.value.country = '';
    }
    
    updatePublishStatus();
  },
  { deep: true }
);

// ========== جلب حالة الاشتراك ==========
const fetchSubscriptionStatus = async (force = false) => {
  if (isFetchingSubscription.value) {
    console.log('⏳ Subscription fetch already in progress');
    return;
  }

  const now = Date.now();
  // ✅ عند force (مثلاً بعد اكتمال الدفع) نتجاوز مانع التكرار وحدّ المحاولات
  //    كي نحصل على حالة اشتراك حديثة من الخادم بدل قيمة مخزّنة قديمة (false).
  if (!force && now - lastFetchTime.value < 2000) {
    console.log('⏳ Too many requests, waiting...');
    return;
  }

  if (!force && fetchAttempts.value >= MAX_ATTEMPTS) {
    console.log('❌ Max attempts reached');
    return;
  }
  
  isFetchingSubscription.value = true;
  lastFetchTime.value = now;
  
  try {
    console.log(`📡 Fetching subscription status (attempt ${fetchAttempts.value + 1}/${MAX_ATTEMPTS})...`);
    const data = await subscriptionService.getSubscriptionStatus();
    subscriptionStatus.value = data;
    
    const isActive = subscriptionService.isSubscriptionActive(data);
    isSubscriptionActive.value = isActive;
    
    try {
      if (subscriptionStore && typeof subscriptionStore.setSubscription === 'function') {
        subscriptionStore.setSubscription(data);
      }
      if (subscriptionStore) {
        subscriptionStore.isSubscribed = isActive;
        subscriptionStore.isActive = isActive;
        subscriptionStore.isInitialized = true;
        subscriptionStore.subscriptionStatus = data.subscription?.status || (data.subscribed ? 'active' : 'inactive');
        subscriptionStore.expiresAt = data.subscription?.expires_at || null;
      }
    } catch (storeError) {
      console.warn('⚠️ Could not update subscription store:', storeError);
    }
    
    console.log('✅ Subscription status:', data);
    console.log('✅ Is active:', isActive);
    
    fetchAttempts.value = 0;
    return data;
  } catch (error) {
    console.error('❌ Failed to fetch subscription:', error);
    fetchAttempts.value++;
    subscriptionStatus.value = null;
    isSubscriptionActive.value = false;
  } finally {
    isFetchingSubscription.value = false;
  }
};

// ========== جلب بيانات الـ Release ==========
const fetchReleaseData = async () => {
  if (!props.releaseUuid) {
    console.warn('⚠️ No release UUID provided');
    return;
  }
  
  try {
    console.log(`📡 Fetching release data for: ${props.releaseUuid}`);
    
    const response = await apiRequest.get(`/releases/${props.releaseUuid}`);
    const release = response.data.data || response.data;
    
    if (!release) {
      console.warn('⚠️ No release data found');
      return;
    }
    
    console.log('📦 Release data:', release);
    
    releaseArtist.value = release.artist_name || release.artists?.[0] || 'artist name';
    releaseTitle.value = release.title || 'untitled release';
    releaseType.value = release.release_type || 'Single';
    audioQuality.value = release.audio_quality || 'lossless';
    
    try {
      const songsResponse = await apiRequest.get(`/releases/${props.releaseUuid}/songs`);
      const songs = songsResponse.data.data || [];
      songCount.value = songs.length;
      console.log(`🎵 Found ${songCount.value} songs`);
      
      if (songs.length > 0 && songs[0].cover) {
        const coverPath = songs[0].cover;
        releaseCover.value = coverPath.startsWith('http') 
          ? coverPath 
          : `${import.meta.env.VITE_STORAGE_URL}/${coverPath}`;
        console.log('🖼️ Cover from first song:', releaseCover.value);
      }
    } catch (songsError) {
      console.warn('⚠️ Could not fetch songs:', songsError);
      songCount.value = 0;
    }
    
    if (!releaseCover.value && release.cover) {
      const coverPath = release.cover;
      let fullCoverPath = coverPath;
      
      if (coverPath.startsWith('covers/')) {
        fullCoverPath = `${import.meta.env.VITE_STORAGE_URL}/${coverPath}`;
      } else if (coverPath.startsWith('storage/')) {
        fullCoverPath = `${import.meta.env.VITE_STORAGE_URL}/${coverPath.replace('storage/', '')}`;
      } else if (coverPath.startsWith('/storage/')) {
        fullCoverPath = `${import.meta.env.VITE_STORAGE_URL}${coverPath}`;
      } else if (coverPath.startsWith('http')) {
        fullCoverPath = coverPath;
      } else {
        fullCoverPath = `${import.meta.env.VITE_STORAGE_URL}/${coverPath}`;
      }
      
      releaseCover.value = fullCoverPath;
      console.log('🖼️ Cover from release:', releaseCover.value);
    }
    
    if (!releaseCover.value) {
      releaseCover.value = '/img/bgCardSongs/card1.png';
      console.log('🖼️ Using default cover image');
    }
    
    console.log('✅ Release data loaded successfully');
    
  } catch (error) {
    console.error('❌ فشل جلب بيانات الـ Release:', error);
    releaseArtist.value = 'artist name';
    releaseTitle.value = 'untitled release';
    releaseType.value = 'Single';
    audioQuality.value = 'lossless';
    songCount.value = 0;
    releaseCover.value = '/img/bgCardSongs/card1.png';
  }
};

// ========== دالة إرسال الـ Release للنشر ==========
const submitRelease = async () => {
  try {
    console.log(`📤 Submitting release: ${props.releaseUuid}`);
    
    const response = await apiRequest.post(
      `/releases/${props.releaseUuid}/submit`,
      {},
      { headers: { ...authHeader() } }
    );
    
    console.log('✅ Release submitted successfully:', response.data);
    
    releaseStore.setPublishComplete(true);
    
    window.dispatchEvent(new CustomEvent('publish-complete', {
      detail: { isComplete: true }
    }));
    
    localStorage.setItem('submittedReleaseUuid', props.releaseUuid);
    localStorage.setItem('submittedReleaseData', JSON.stringify({
      title: releaseTitle.value,
      artist: releaseArtist.value,
      cover: releaseCover.value
    }));
    
    router.push('/thanks');
    
    return response.data;
    
  } catch (error) {
    console.error('❌ Failed to submit release:', error);
    
    let errorMessage = 'Fehler beim Einreichen des Releases. Bitte versuchen Sie es erneut.';
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    }
    
    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: { message: errorMessage, type: 'error' }
    }));
    
    throw error;
  }
};

// ========== نشر الـ Release ==========
const publishRelease = async () => {
  if (isProcessing.value) {
    console.log('⏳ Already processing, skipping...');
    return;
  }
  
  isProcessing.value = true;
  
  try {
    console.log('📤 Publishing release...');
    
    await fetchSubscriptionStatus();
    
    if (!isSubscriptionActive.value) {
      console.warn('⚠️ No active subscription, cannot publish');
      showSubscriptionPopup.value = true;
      isProcessing.value = false;
      return;
    }
    
    if (releaseCover.value) {
      localStorage.setItem('releaseCover', releaseCover.value);
      console.log('💾 Cover image saved to localStorage:', releaseCover.value);
    }
    
    await submitRelease();
    
  } catch (error) {
    console.error('❌ Failed to publish release:', error);
    
    let errorMessage = 'Fehler beim Veröffentlichen des Releases. Bitte versuchen Sie es erneut.';
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    }
    
    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: { message: errorMessage, type: 'error' }
    }));
    
  } finally {
    isProcessing.value = false;
  }
};

const initiateSubscription = async () => {
  if (!validateForm()) {
    // ✅ عرض رسالة خطأ عامة
    const errorMessages = Object.values(errors.value).filter(msg => msg !== '');
    if (errorMessages.length > 0) {
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { 
          message: errorMessages.join('. '),
          type: 'error'
        }
      }));
    }
    return;
  }

  await fetchSubscriptionStatus();
  
  if (isSubscriptionActive.value) {
    console.log('✅ User already has active subscription, publishing directly');
    await publishRelease();
    return;
  }
  
  isProcessing.value = true;
  
  try {
    console.log('📤 Creating subscription with billing data...');
    
    // ✅ تجهيز بيانات الفوترة مع user_uuid
    const billingDetails = {
      user_uuid: dataStore.user?.uuid || null, // ✅ مهم: ربط البيانات بالمستخدم
      billing_first_name: formData.value.firstName || '',
      billing_last_name: formData.value.lastName || '',
      billing_street_name: formData.value.street || '',
      billing_street_number: formData.value.streetNr || '',
      billing_postal_code: formData.value.postalCode || '',
      billing_city: formData.value.city || '',
      billing_country: formData.value.country || '',
      billing_company: formData.value.company || '',
      billing_vat_id: formData.value.ustId || null
    };
    
    console.log('📤 Billing details being sent:', billingDetails);
    
    // حفظ في localStorage للاستخدام المؤقت
    dataStore.setPaymentFormData(billingDetails);
    localStorage.setItem('paymentFormData', JSON.stringify(billingDetails));

    // ✅ إرسال بيانات الفوترة مع طلب الاشتراك مباشرة
    const subscriptionData = await subscriptionService.createSubscription(billingDetails);
    console.log('✅ Subscription created:', subscriptionData);

    // ✅ نلتقط subscription_id (بصيغ محتملة مختلفة) لاستخدامه في verify بعد الدفع.
    const subscriptionId =
      subscriptionData.subscription_id ??
      subscriptionData.id ??
      subscriptionData.data?.subscription_id ??
      subscriptionData.data?.id ??
      subscriptionData.subscription?.id ??
      null;
    console.log('🆔 subscription_id:', subscriptionId);

    const approvalUrl = subscriptionData.approval_url;
    if (!approvalUrl) {
      throw new Error('No approval URL received');
    }
    
    const popup = window.open(approvalUrl, '_blank');
    if (!popup) throw new Error('Popup blocked');

    // ✅ نُظهر بوب اب النقاط في التاب الرئيسية طوال فترة الدفع في PayPal.
    showPaymentPopup.value = true;

    let paymentFlowDone = false;
    let monitor = null;

    // ✅ يُستدعى مرّة واحدة عند انتهاء الدفع (رسالة نجاح أو إغلاق نافذة الدفع):
    //    نُبقي بوب اب النقاط ثانيتين، ثم نُغلقه، ثم نُعيد طلب حالة الاشتراك — وإن كانت
    //    مفعّلة (true) نُرسل submit مباشرة.
    const finishPaymentFlow = async () => {
      if (paymentFlowDone) return;
      paymentFlowDone = true;

      if (monitor) { clearInterval(monitor); monitor = null; }
      window.removeEventListener('message', onMessage);
      if (popup && !popup.closed) popup.close();

      // ✅ نُبقي بوب اب النقاط ظاهراً طوال فترة إعادة الطلبات — لأن الخادم يحتاج
      //    لحظة بعد الدفع؛ مباشرةً بعد الدفع قد يعيد الاشتراك false، وبعد لحظة يصبح
      //    active (نفس ما يحدث عند التحديث اليدوي).
      // ننتظر ~3 ثوانٍ أولاً، ثم نُعيد طلب API الاشتراك و API المستخدم معاً بقوة
      //    (force) لتجاوز مانع التكرار. وإن لم يُفعَّل بعد نُعيد المحاولة مرّة أخرى.
      const refreshSubscriptionAndUser = async () => {
        await Promise.all([
          fetchSubscriptionStatus(true),
          dataStore.loadUser()
        ]);
      };

      try {
        await new Promise((resolve) => setTimeout(resolve, 3000));

        let verified = false;
        // ✅ نتحقّق من إتمام الدفع عبر endpoint الـ verify بـ subscription_id (حتى
        //    محاولتين مع مهلة). هذا مصدر التأكيد من الباك؛ وعند نجاحه نُرسل submit.
        for (let attempt = 0; attempt < 2 && !verified; attempt++) {
          if (attempt > 0) await new Promise((r) => setTimeout(r, 2000));

          if (subscriptionId) {
            try {
              const result = await subscriptionService.verifySubscription(subscriptionId);
              console.log('🔎 verify result:', result);
              verified = subscriptionService.isVerifiedActive(result);
            } catch (e) {
              console.warn('⚠️ verify فشل:', e?.response?.data || e);
            }
          }

          // نُحدّث حالة الاشتراك والمستخدم (لتحديث الواجهة، واحتياطاً إن غاب subscription_id).
          await refreshSubscriptionAndUser();
          if (!verified && isSubscriptionActive.value) verified = true;
        }

        // نُخفي البوب اب بعد اكتمال التحقّق.
        showPaymentPopup.value = false;

        if (verified) {
          console.log('✅ تمّ التحقّق من الدفع → submit');
          if (releaseCover.value) {
            localStorage.setItem('releaseCover', releaseCover.value);
          }
          isSubscriptionActive.value = true;
          await submitRelease();
        } else {
          console.log('ℹ️ لم يتأكّد الدفع بعد');
          isProcessing.value = false;
        }
      } catch (e) {
        console.warn('⚠️ خطأ أثناء التحقّق/الإرسال بعد الدفع:', e?.response?.data || e);
        showPaymentPopup.value = false;
        isProcessing.value = false;
      }
    };

    function onMessage(e) {
      const allowed = [window.location.origin, 'https://www.paypal.com'];
      if (!allowed.includes(e.origin)) return;

      console.log('Received message from popup:', e.data);

      if (e.data?.type === 'PAYMENT_SUCCESS' || e.data?.type === 'SUBSCRIBE_SUCCESS') {
        console.log('✅ Payment/Subscription completed successfully');
        finishPaymentFlow();
      }
    }

    window.addEventListener('message', onMessage);

    // مراقبة إغلاق نافذة الدفع (سواء أُغلقت تلقائياً بعد النجاح أو يدوياً).
    monitor = setInterval(() => {
      if (popup.closed) {
        console.log('Subscription popup closed');
        finishPaymentFlow();
      }
    }, 500);

  } catch (error) {
    console.error('❌ Failed to initiate subscription:', error);
    // إخفاء بوب اب النقاط عند حدوث خطأ في بدء الاشتراك/الدفع.
    showPaymentPopup.value = false;

    const errorMsg = error.response?.data?.message || error.message || '';
    if (errorMsg.includes('active subscription')) {
      console.log('🔄 User already has active subscription, trying to publish directly');
      isProcessing.value = false;
      await fetchSubscriptionStatus();
      if (isSubscriptionActive.value) {
        await publishRelease();
        return;
      }
    }
    
    let errorMessage = 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.';
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: { message: errorMessage, type: 'error' }
    }));
    
  } finally {
    isProcessing.value = false;
  }
};

// ========== ✅ دالة النشر الرئيسية ==========
const handlePublish = async () => {
  if (isLoading.value || isProcessing.value || !isFormValid.value) {
    console.log('⚠️ Cannot publish: isLoading:', isLoading.value, 'isProcessing:', isProcessing.value, 'isFormValid:', isFormValid.value);
    return;
  }
  
  if (!formData.value.agreement) {
    errors.value.agreement = 'Bitte akzeptieren Sie die AGBs';
    return;
  }
  
  await fetchSubscriptionStatus();
  
  if (isSubscriptionActive.value) {
    await publishRelease();
  } else {
    if (!validateForm()) {
      return;
    }
    await initiateSubscription();
  }
};

// ========== مراقبة التغييرات ==========
watch(userEmail, (v) => (formData.value.email = v));

// ✅ مراقبة بيانات المستخدم - تعبئة الحقول فقط إذا كانت البيانات موجودة وفعلية
watch(() => dataStore.user, (u) => {
  if (u) {
    const hasFullBillingData = !!(u.billing_first_name || u.billing_last_name || u.billing_street_name || 
                                   u.billing_street_number || u.billing_postal_code || u.billing_city || u.billing_country);
    
    if (hasFullBillingData) {
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
      });
      console.log('✅ [Upload4] تم تعبئة بيانات الفواتير من المستخدم');
    } else {
      formData.value.email = u.email || '';
      console.log('📝 [Upload4] لا توجد بيانات فواتير، الفورم مفتوح للإدخال');
    }
  }
}, { immediate: true, deep: true });

// ========== مراقبة الـ Store ==========
watch(
  () => subscriptionStore.isInitialized,
  (isInitialized) => {
    if (isInitialized) {
      subscriptionStatus.value = subscriptionStore.subscription;
      isSubscriptionActive.value = subscriptionStore.isSubscribed || subscriptionStore.isActive || false;
      
      console.log('📦 Using subscription from store:', {
        isSubscribed: subscriptionStore.isSubscribed,
        isActive: subscriptionStore.isActive,
        status: subscriptionStore.subscriptionStatus,
        expiresAt: subscriptionStore.expiresAt
      });
    }
  },
  { immediate: true }
);

watch(
  () => subscriptionStore.isSubscribed,
  (isSubscribed) => {
    console.log('🔄 Subscription store isSubscribed changed:', isSubscribed);
    isSubscriptionActive.value = isSubscribed || subscriptionStore.isActive || false;
  },
  { immediate: true }
);

watch(
  () => subscriptionStore.isActive,
  (isActive) => {
    console.log('🔄 Subscription store isActive changed:', isActive);
    isSubscriptionActive.value = isActive || subscriptionStore.isSubscribed || false;
  },
  { immediate: true }
);

// ========== ✅ مراقبة تغيير حالة Publish في الـ Store ==========
watch(
  () => releaseStore.isPublishComplete,
  (newValue) => {
    console.log('🔄 [Upload4] Store isPublishComplete changed to:', newValue);
    
    window.dispatchEvent(new CustomEvent('publish-complete', {
      detail: { isComplete: newValue }
    }));
  }
);

// ========== Lifecycle ==========
onMounted(async () => {
  console.log('🚀 Upload4Component mounted with releaseUuid:', props.releaseUuid);
  
  if (route.query.forceView === 'firstSection') {
    console.log('⏸️ [Upload4] ForceView is firstSection, skipping publish status update');

    // ملاحظة: لا نضبط isPublishComplete = true هنا. الاكتمال يعتمد فقط على تعبئة الفورم
    //   والنقر على الموافقة (updatePublishStatus)، لا على مجرّد المرور بالمكوّن.

    if (subscriptionStore.isInitialized) {
      subscriptionStatus.value = subscriptionStore.subscription;
      isSubscriptionActive.value = subscriptionStore.isSubscribed || subscriptionStore.isActive || false;
      console.log('📦 Using existing subscription from store:', isSubscriptionActive.value);
    } else {
      await fetchSubscriptionStatus();
    }
    
    await fetchReleaseData();
    
    if (dataStore.user) {
      const hasFullBillingData = !!(dataStore.user.billing_first_name || dataStore.user.billing_last_name || 
                                     dataStore.user.billing_street_name || dataStore.user.billing_street_number ||
                                     dataStore.user.billing_postal_code || dataStore.user.billing_city || dataStore.user.billing_country);
      
      if (hasFullBillingData) {
        Object.assign(formData.value, {
          company: dataStore.user.billing_company || '',
          firstName: dataStore.user.billing_first_name || '',
          lastName: dataStore.user.billing_last_name || '',
          street: dataStore.user.billing_street_name || '',
          streetNr: dataStore.user.billing_street_number || '',
          postalCode: dataStore.user.billing_postal_code || '',
          city: dataStore.user.billing_city || '',
          country: dataStore.user.billing_country || '',
          ustId: dataStore.user.billing_vat_id || '',
          email: dataStore.user.email || '',
        });
        console.log('✅ [Upload4] onMounted - تم تعبئة بيانات الفواتير من المستخدم');
      } else {
        formData.value.email = dataStore.user.email || '';
        console.log('📝 [Upload4] onMounted - لا توجد بيانات فواتير، الفورم مفتوح للإدخال');
      }
    }
    
    return;
  }
  
  if (subscriptionStore.isInitialized) {
    subscriptionStatus.value = subscriptionStore.subscription;
    isSubscriptionActive.value = subscriptionStore.isSubscribed || subscriptionStore.isActive || false;
    console.log('📦 Using existing subscription from store:', isSubscriptionActive.value);
  } else {
    await fetchSubscriptionStatus();
  }
  
  await fetchReleaseData();
  
  if (dataStore.user) {
    const hasFullBillingData = !!(dataStore.user.billing_first_name || dataStore.user.billing_last_name || 
                                   dataStore.user.billing_street_name || dataStore.user.billing_street_number ||
                                   dataStore.user.billing_postal_code || dataStore.user.billing_city || dataStore.user.billing_country);
    
    if (hasFullBillingData) {
      Object.assign(formData.value, {
        company: dataStore.user.billing_company || '',
        firstName: dataStore.user.billing_first_name || '',
        lastName: dataStore.user.billing_last_name || '',
        street: dataStore.user.billing_street_name || '',
        streetNr: dataStore.user.billing_street_number || '',
        postalCode: dataStore.user.billing_postal_code || '',
        city: dataStore.user.billing_city || '',
        country: dataStore.user.billing_country || '',
        ustId: dataStore.user.billing_vat_id || '',
        email: dataStore.user.email || '',
      });
      console.log('✅ [Upload4] onMounted - تم تعبئة بيانات الفواتير من المستخدم');
    } else {
      formData.value.email = dataStore.user.email || '';
      console.log('📝 [Upload4] onMounted - لا توجد بيانات فواتير، الفورم مفتوح للإدخال');
    }
  }
  
  document.addEventListener('click', handleLandClickOutside);

  if (!releaseStore.isPublishComplete) {
    setTimeout(() => {
      updatePublishStatus();
    }, 500);
  } else {
    console.log('⏸️ [Upload4] isPublishComplete is already true, skipping update');
  }
});

onBeforeUnmount(() => {
  window.removeEventListener('publish-complete', () => {});
  document.removeEventListener('click', handleLandClickOutside);
});
</script>

<style lang="scss" scoped>
/* جميع الأنماط كما هي */
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
  min-width: 631px;
}

.release .card {
  display: flex;
  min-width: 210px;
  max-width: 210px;
  max-height: 210px;
  padding: 140px 20px 80px 20px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 112px;
  aspect-ratio: 1/1;
  border-radius: 20px;
  background: url() 50% / cover no-repeat;
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
  justify-content: end;
}

.column2 .info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 32px;
  flex: 1 0 0;
  align-self: flex-end;
  max-width: 682px;
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
  border-bottom: 0px solid transparent;
}

.options {
  position: absolute;
  /* ✅ ملاصقة لأسفل الزر مهما كان ارتفاعه (يكبر على الشاشات الكبيرة) — بدل top:45px
     الثابت الذي كان يتداخل مع الزر (min-height:50px) فيكسر حدّ الالتقاء العلوي. */
  top: 85%;
  left: 0;
  right: 0;
  background-color: var(--secondary);
  border: 2px solid var(--move);
  border-top: 0px solid var(--secondary);
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
  padding: 16px;
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
padding: 7px 0 8px 0;
align-items: flex-start;
gap: 12px;
align-self: stretch;
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
  flex-shrink: 0;
}

.person-checkbox:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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
  background-image: url('@/assets/icons/y.png');
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
  cursor: pointer;
}

.checkbox-label span{
  overflow: hidden;
color: var(--Main-Colors-White, #FFF);
text-overflow: ellipsis;
white-space: nowrap;
font-family: Heebo;
font-size: 14px;
font-style: normal;
font-weight: 700;
line-height: normal;
letter-spacing: 0.7px;
text-transform: uppercase;
}

.price-section {
  display: flex;
  padding-top: 24px;
  align-items: flex-end;
  gap: 16px;
  align-self: stretch;
  margin-top: 20px;
}

.form-buttons {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 16px;
  flex: 1 0 0;
}

.pay-button {
  display: flex;
  cursor: pointer;
  padding: 12px 20px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  border-radius: 5px;
  background-color: var(--Strawberry, #D15);
  color: var(--Main-Colors-White, #FFF);
  font-family: Heebo;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: .8;
  text-transform: uppercase;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.pay-button:disabled {
  cursor: not-allowed;
  background-color: #3A3E42;
  color: #6A6C6D;
}

.pay-button.disabled {
  cursor: not-allowed;
  background-color: #3A3E42;
  color: #6A6C6D;
  pointer-events: none;
}

.pay-button:hover:not(.disabled) {
  background-color: #990033;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (min-width:1440px) and (max-width:1599px) {
  .info .name .first {
    font-size: 48px;
    line-height: 1;
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
  
  }
  .checkbox-row {
    padding: 0;
  }
  .select-button {
    min-height: 43px;
  }
  .column2 {
    padding-left: clamp(150px, 10vw, 208px);
  }

  .column1 .Title .release{
    min-width: 570px;
  }
}

@media (min-width:1600px) and (max-width:2074px) {
  .column2 {
    padding-left: clamp(150px, 11vw, 285px);
  }

 
}

@media (min-width:2075px) and (max-width:2560px) {
  .select-button {
    min-height: 50px;
  }
  .column2 {
    padding-left: clamp(235px, 11vw, 338px);
  }
}

/* ========== أنيميشن فتح/إغلاق قائمة Land ========== */
.options {
  transform-origin: top center;
}

.land-dropdown-enter-active {
  transition: opacity 0.22s ease, transform 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}
.land-dropdown-leave-active {
  transition: opacity 0.16s ease, transform 0.16s ease;
}
.land-dropdown-enter-from,
.land-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px) scaleY(1);
}
.land-dropdown-enter-to,
.land-dropdown-leave-from {
  opacity: 1;
  transform: translateY(0) scaleY(1);
}

/* ========== بوب اب "الدفع قيد التنفيذ" (النقاط) ========== */
.payment-popup-fade-enter-active {
  transition: opacity 0.3s ease;
}
.payment-popup-fade-leave-active {
  transition: opacity 0.4s ease;
}
.payment-popup-fade-enter-from,
.payment-popup-fade-leave-to {
  opacity: 0;
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
  max-width: 90vw;
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
  animation: payment-box-in 0.35s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes payment-box-in {
  from { opacity: 0; transform: translateY(16px) scale(0.96); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
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
  font-weight: 700;
  line-height: 1;
  text-transform: uppercase;
}

.box-popup .subtitle-popup {
  color: var(--Main-Colors-White, #FFF);
  text-align: center;
  font-family: Heebo;
  font-size: 18px;
  font-weight: 300;
  line-height: normal;
}

.progress-request-popup .point {
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background: var(--move);
  animation: payment-bounce 1.4s infinite ease-in-out both;
}

.progress-request-popup .point:nth-child(1) { animation-delay: -0.32s; }
.progress-request-popup .point:nth-child(2) { animation-delay: -0.16s; }

@keyframes payment-bounce {
  0%, 80%, 100% { transform: scale(0); opacity: 0.5; }
  40% { transform: scale(1); opacity: 1; }
}
</style>