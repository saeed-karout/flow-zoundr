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
              <div class="topic">Brutto</div>
              <div class="total-price">{{ displayTotalPrice }} EUR</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- الفورم - تظهر دائماً ولكن مع تعطيل الحقول إذا كان المستخدم مشتركاً -->
    <div class="Rechnungsadresse">
      <div class="title">Rechnungsadresse</div>
      <form class="payment-form" @submit.prevent="handlePublish">
        <div class="form-container">
          <!-- Left Section -->
          <div class="left-section">
            <div class="form-row">
              <div class="form-group">
                <input v-model="formData.company" type="text" placeholder="Firma (optional)"
                  class="input-field" :class="{ 'filled': formData.company }"
                  :disabled="isFieldDisabled.company || isSubscriptionActive" />
                <span class="checkmark" v-if="isFieldDisabled.company || formData.company">
                  <img :src="isFieldDisabled.company || isSubscriptionActive ? iconDisabled : iconCorrect" alt="completed" />
                </span>
              </div>
            </div>
            <div class="form-row flex">
              <div class="form-group w-50">
                <input v-model="formData.firstName" type="text" placeholder="Vorname" class="input-field"
                  :class="{ 'filled': formData.firstName, 'error': errors.firstName }"
                  :disabled="isFieldDisabled.firstName || isSubscriptionActive" />
                <span class="checkmark" v-if="formData.firstName && !errors.firstName">
                  <img :src="isFieldDisabled.firstName || isSubscriptionActive ? iconDisabled : iconCorrect" alt="completed" />
                </span>
                <span class="error-message" v-if="errors.firstName">{{ errors.firstName }}</span>
              </div>
              <div class="form-group w-50">
                <input v-model="formData.lastName" type="text" placeholder="Nachname" class="input-field"
                  :class="{ 'filled': formData.lastName, 'error': errors.lastName }"
                  :disabled="isFieldDisabled.lastName || isSubscriptionActive" />
                <span class="checkmark" v-if="formData.lastName && !errors.lastName">
                  <img :src="isFieldDisabled.lastName || isSubscriptionActive ? iconDisabled : iconCorrect" alt="completed" />
                </span>
                <span class="error-message" v-if="errors.lastName">{{ errors.lastName }}</span>
              </div>
            </div>
            <div class="form-row flex">
              <div class="form-group w-75">
                <input v-model="formData.street" type="text" placeholder="Straße" class="input-field"
                  :class="{ 'filled': formData.street, 'error': errors.street }" 
                  :disabled="isFieldDisabled.street || isSubscriptionActive" />
                <span class="checkmark" v-if="formData.street && !errors.street">
                  <img :src="isFieldDisabled.street || isSubscriptionActive ? iconDisabled : iconCorrect" alt="completed" />
                </span>
                <span class="error-message" v-if="errors.street">{{ errors.street }}</span>
              </div>
              <div class="input-wrapper w-33">
                <input v-model="formData.streetNr" type="text" placeholder="Nr." class="input-field"
                  :class="{ 'filled': formData.streetNr, 'error': errors.streetNr }"
                  :disabled="isFieldDisabled.streetNr || isSubscriptionActive" />
                <span class="checkmark" v-if="formData.streetNr && !errors.streetNr">
                  <img :src="isFieldDisabled.streetNr || isSubscriptionActive ? iconDisabled : iconCorrect" alt="completed" />
                </span>
                <span class="error-message" v-if="errors.streetNr">{{ errors.streetNr }}</span>
              </div>
            </div>
            <div class="form-row flex">
              <div class="input-wrapper w-33">
                <input v-model="formData.postalCode" type="text" placeholder="PLZ" class="input-field"
                  :class="{ 'filled': formData.postalCode, 'error': errors.postalCode }"
                  :disabled="isFieldDisabled.postalCode || isSubscriptionActive" />
                <span class="checkmark" v-if="formData.postalCode && !errors.postalCode">
                  <img :src="isFieldDisabled.postalCode || isSubscriptionActive ? iconDisabled : iconCorrect" alt="completed" />
                </span>
                <span class="error-message" v-if="errors.postalCode">{{ errors.postalCode }}</span>
              </div>
              <div class="form-group w-67">
                <input v-model="formData.city" type="text" placeholder="Ort" class="input-field"
                  :class="{ 'filled': formData.city, 'error': errors.city }" 
                  :disabled="isFieldDisabled.city || isSubscriptionActive" />
                <span class="checkmark" v-if="formData.city && !errors.city">
                  <img :src="isFieldDisabled.city || isSubscriptionActive ? iconDisabled : iconCorrect" alt="completed" />
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
                    @click="isLandFocused = !isLandFocused && !isFieldDisabled.country && !isSubscriptionActive"
                    :class="{ 'filled': formData.country, 'error': errors.country, 'disabled': isFieldDisabled.country || isSubscriptionActive }">
                    <span>{{ countryDisplayName(formData.country) }}</span>
                    <span class="checkmark">
                      <img v-if="formData.country && !errors.country && (isFieldDisabled.country || isSubscriptionActive)"
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
                  <ul class="options" v-if="isLandFocused && !isFieldDisabled.country && !isSubscriptionActive">
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
                  :class="{ 'filled': formData.ustId, 'error': errors.ustId }" 
                  :disabled="isFieldDisabled.ustId || isSubscriptionActive" />
                <button type="button" class="confirm-btn" @click="validateUstId"
                  :disabled="!formData.ustId || isLoading || isFieldDisabled.ustId || isSubscriptionActive">
                  Bestätigen
                </button>
                <span class="checkmark" v-if="isUstIdValid && !errors.ustId">
                  <img :src="isFieldDisabled.ustId || isSubscriptionActive ? iconDisabled : iconCorrect" alt="completed" />
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
                  :class="{ 'error': errors.agreement }" :disabled="isSubscriptionActive" />
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
      <div class="pay-button" @click="handlePublish" 
        :disabled="isLoading || isProcessing || !isFormValid">
        {{ buttonLabel }}
      </div>
    </div>
  </div>

  <!-- 🔥 Popup تنبيه عدم وجود اشتراك -->
  <Teleport to="body">
    <div v-if="showSubscriptionPopup" class="subscription-popup-overlay" @click.self="closeSubscriptionPopup">
      <div class="subscription-popup">
        <div class="popup-header">
          <button class="popup-close" @click="closeSubscriptionPopup">✕</button>
        </div>
        <div class="popup-body">
          <h3>Kein aktives Abonnement</h3>
          <p>
            Sie haben kein aktives Abonnement. Um Ihr Release zu veröffentlichen, 
            benötigen Sie ein gültiges Abonnement.
          </p>
          <p class="popup-detail">
            Bitte füllen Sie das Formular aus und klicken Sie auf 
            <strong>"Abonnieren & Veröffentlichen"</strong>, um fortzufahren.
          </p>
        </div>
        <div class="popup-footer">
          <button class="popup-btn primary" @click="closeSubscriptionPopup">Verstanden</button>
          <button class="popup-btn secondary" @click="goToSubscription">Zum Abonnement</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useDataStore } from '@/stores/data';
import { useSubscriptionStore } from '@/stores/subscription';
import apiRequest from '@/lib/apiRequest';
import authHeader from '@/services/auth-header';
import { subscriptionService } from '@/services/subscriptionService';
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
const subscriptionStore = useSubscriptionStore();

// ========== حالة الاشتراك ==========
const subscriptionStatus = ref(null);
const isSubscriptionActive = ref(false);
const isProcessing = ref(false);
const showSubscriptionPopup = ref(false);

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

// ========== الأخطاء ==========
const errors = ref({ 
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
const isUstIdValid = ref(false);
const isLoading = ref(false);

// ========== الحسابات ==========
const pricePerSong = 9.5;
const totalWithTax = computed(() => songCount.value * pricePerSong);

const taxRate = computed(() => {
  if (isSubscriptionActive.value) return 0;
  
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

const displayTotalPrice = computed(() => {
  if (isSubscriptionActive.value) return '0,00';
  return totalWithTax.value.toFixed(2);
});

const totalPrice = computed(() => totalWithTax.value.toFixed(2));
const taxRateDisplay = computed(() => taxRate.value === 0 ? '(0%)' : `(${taxRate.value * 100}%)`);
const isReverseCharge = computed(() => formData.value.country === 'austria' && formData.value.ustId && isUstIdValid.value);

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

const countryDisplayName = (c) => countryDisplayMap[c] || c || 'Land';

// ========== التحقق من الاشتراك وعرض الـ Popup ==========
const checkSubscriptionAndShowPopup = () => {
  if (subscriptionStatus.value && !isSubscriptionActive.value) {
    showSubscriptionPopup.value = true;
  }
};

// ========== إغلاق الـ Popup ==========
const closeSubscriptionPopup = () => {
  showSubscriptionPopup.value = false;
};

// ========== الذهاب إلى الاشتراك ==========
const goToSubscription = () => {
  showSubscriptionPopup.value = false;
  const formElement = document.querySelector('.Rechnungsadresse');
  if (formElement) {
    formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
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
  if (!formData.value.ustId || formData.value.country !== 'austria' || isFieldDisabled.value.ustId || isSubscriptionActive.value) return;
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

const validateForm = () => {
  if (isSubscriptionActive.value) return true;
  
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
  if (isSubscriptionActive.value) return true;
  
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

// ========== جلب حالة الاشتراك ==========
const fetchSubscriptionStatus = async () => {
  if (isFetchingSubscription.value) {
    console.log('⏳ Subscription fetch already in progress');
    return;
  }
  
  const now = Date.now();
  if (now - lastFetchTime.value < 2000) {
    console.log('⏳ Too many requests, waiting...');
    return;
  }
  
  if (fetchAttempts.value >= MAX_ATTEMPTS) {
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
    
    if (!isActive) {
      checkSubscriptionAndShowPopup();
    }
    
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

// ========== 🔥 دالة إرسال الـ Release للنشر ==========
const submitRelease = async () => {
  try {
    console.log(`📤 Submitting release: ${props.releaseUuid}`);
    
    const response = await apiRequest.post(
      `/releases/${props.releaseUuid}/submit`,
      {},
      { headers: { ...authHeader() } }
    );
    
    console.log('✅ Release submitted successfully:', response.data);
    
    // 🔥 تخزين releaseUuid في localStorage للاستخدام في صفحة thanks
    localStorage.setItem('submittedReleaseUuid', props.releaseUuid);
    localStorage.setItem('submittedReleaseData', JSON.stringify({
      title: releaseTitle.value,
      artist: releaseArtist.value,
      cover: releaseCover.value
    }));
    
    // 🔥 التوجيه إلى صفحة thanks
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
    
    // 🔥 إرسال الطلب إلى /submit
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

// ========== بدء عملية الاشتراك ==========
const initiateSubscription = async () => {
  if (!validateForm()) return;
  
  await fetchSubscriptionStatus();
  
  if (isSubscriptionActive.value) {
    console.log('✅ User already has active subscription, publishing directly');
    await publishRelease();
    return;
  }
  
  isProcessing.value = true;
  
  try {
    console.log('📤 Creating subscription...');
    
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
    
    dataStore.setPaymentFormData(billingDetails);
    localStorage.setItem('paymentFormData', JSON.stringify(billingDetails));
    
    const subscriptionData = await subscriptionService.createSubscription();
    console.log('✅ Subscription created:', subscriptionData);
    
    const approvalUrl = subscriptionData.approval_url;
    if (!approvalUrl) {
      throw new Error('No approval URL received');
    }
    
    const popup = window.open(approvalUrl, 'paypal_subscription_popup', 'width=900,height=950');
    if (!popup) throw new Error('Popup blocked');
    
    let paymentSuccess = false;
    
    const onMessage = async (e) => {
      const allowed = [window.location.origin, 'https://www.paypal.com'];
      if (!allowed.includes(e.origin)) return;
      
      console.log('Received message from popup:', e.data);
      
      if (e.data.type === 'PAYMENT_SUCCESS' || e.data.type === 'SUBSCRIBE_SUCCESS') {
        console.log('✅ Payment/Subscription completed successfully');
        paymentSuccess = true;
        
        if (popup && !popup.closed) {
          popup.close();
        }
        
        await fetchSubscriptionStatus();
        await publishRelease();
      }
    };
    
    window.addEventListener('message', onMessage);
    
    const monitor = setInterval(async () => {
      if (popup.closed) {
        clearInterval(monitor);
        console.log('Subscription popup closed');
        
        if (!paymentSuccess) {
          await fetchSubscriptionStatus();
          
          if (isSubscriptionActive.value) {
            await publishRelease();
          } else {
            console.log('Subscription popup closed without success');
          }
        }
      }
    }, 500);
    
  } catch (error) {
    console.error('❌ Failed to initiate subscription:', error);
    
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

// ========== دالة النشر الرئيسية ==========
const handlePublish = async () => {
  if (isLoading.value || isProcessing.value) return;
  
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
      
      if (!isSubscriptionActive.value) {
        checkSubscriptionAndShowPopup();
      }
    }
  },
  { immediate: true }
);

watch(
  () => subscriptionStore.isSubscribed,
  (isSubscribed) => {
    console.log('🔄 Subscription store isSubscribed changed:', isSubscribed);
    isSubscriptionActive.value = isSubscribed || subscriptionStore.isActive || false;
    
    if (!isSubscribed) {
      subscriptionStatus.value = subscriptionStore.subscription;
      checkSubscriptionAndShowPopup();
    }
  },
  { immediate: true }
);

watch(
  () => subscriptionStore.isActive,
  (isActive) => {
    console.log('🔄 Subscription store isActive changed:', isActive);
    isSubscriptionActive.value = isActive || subscriptionStore.isSubscribed || false;
    
    if (!isActive) {
      subscriptionStatus.value = subscriptionStore.subscription;
      checkSubscriptionAndShowPopup();
    }
  },
  { immediate: true }
);

// ========== Lifecycle ==========
onMounted(async () => {
  console.log('🚀 Upload4Component mounted with releaseUuid:', props.releaseUuid);
  
  if (subscriptionStore.isInitialized) {
    subscriptionStatus.value = subscriptionStore.subscription;
    isSubscriptionActive.value = subscriptionStore.isSubscribed || subscriptionStore.isActive || false;
    console.log('📦 Using existing subscription from store:', isSubscriptionActive.value);
    if (!isSubscriptionActive.value) {
      checkSubscriptionAndShowPopup();
    }
  } else {
    await fetchSubscriptionStatus();
  }
  
  await fetchReleaseData();
  
  if (dataStore.user) {
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
  }
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

/* ========== باقي الأنماط ========== */
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

/* ========== أنماط الفورم ========== */
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

/* ========== Price and Buttons Section ========== */
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
}

.pay-button:disabled {
  cursor: not-allowed;
  background-color: #3A3E42;
  color: #6A6C6D;
}

.pay-button:hover:not(:disabled) {
  background-color: #990033;
}

/* ========== Popup الاشتراك ========== */
.subscription-popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease;
}

.subscription-popup {
  background: var(--Main-Colors-Slate, #26282D);
  border-radius: 20px;
  max-width: 500px;
  width: 90%;
  padding: 30px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  animation: slideUp 0.3s ease;
  border: 1px solid rgba(255, 152, 0, 0.3);
  position: relative;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: absolute;
  top: 20px;
  right: 20px;
}

.popup-close {
  background: none;
  border: none;
  color: #FFF;
  font-size: 24px;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.popup-close:hover {
  opacity: 1;
}

.popup-body h3 {
  color: #FF9800;
  font-family: Heebo;
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 12px;
}

.popup-body p {
  color: #FFF;
  font-family: Heebo;
  font-size: 16px;
  font-weight: 300;
  line-height: 1.6;
  margin-bottom: 10px;
}

.popup-detail {
  color: #AAA !important;
  font-size: 14px !important;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 12px;
  margin-top: 12px;
}

.popup-footer {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.popup-btn {
  padding: 8px 12px;
  border: none;
  border-radius: 8px;
  font-family: Heebo;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.popup-btn.primary {
  background: var(--Strawberry, #D15);
  color: white;
}

.popup-btn.primary:hover {
  background: #b00e44;
  transform: scale(1.02);
}

.popup-btn.secondary {
  background: transparent;
  color: #FFF;
}

.popup-btn.secondary:hover {
  border-color: #FFF;
  background: rgba(255, 255, 255, 0.05);
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

/* ========== Responsive ========== */
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