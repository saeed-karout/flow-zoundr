<template>
    <div class="main">
        <div class="top-row">
            <div class="Guthaben">
                <div class="title">Dein Verfügbares Guthaben</div>
                <div class="number">{{ formattedBalance }}</div>
            </div>
        </div>

        <div class="Content">
            <div class="Box">
                <div class="Top-line">
                    <div class="title">Guthaben Auszahlen</div>
                    <div class="right">Deine IP-Adresse: {{ userIp }}</div>
                </div>

                <div class="form-amount">
                    <div class="number-Big">{{ displayBigNumber }}</div>
                    <div class="form-CTA">
                        <div class="Form">
                            <input type="text" 
                                   v-model="displayValue" 
                                   @input="handleInput" 
                                   @focus="handleFocus"
                                   @blur="handleBlur"
                                   class="form-input" 
                                   :disabled="balance === 0"
                                   placeholder="0,00 EUR" />
                        </div>
                        <div class="Form-btn" @click="setMaxAmount" :class="{ 'btn-disabled': balance === 0 }">
                            <div class="p">Alles</div>
                        </div>
                    </div>
                </div>

                <div class="form-info">
                    <div class="row1">
                        <div class="title-row1">
                            Trage bitte Deine PayPal Adresse ein. Dein Geld wird innerhalb von 3-4 Werktagen überwiesen.
                        </div>

                        <div class="Form-row1">
                            <div class="form1" v-for="(field, index) in formFields" :key="index">
                                <div class="title" v-html="field.label"></div>
                                <div class="input-container">
                                    <input
                                        :type="field.type === 'password' && showPassword && index === 2 ? 'text' : field.type"
                                        v-model="field.value" class="formField"
                                        :placeholder="field.type === 'password' ? '' : field.placeholder"
                                        @input="handleInputField(index)" @blur="handleBlurField(index)"
                                        style="caret-color: transparent;" />
                                    <div v-if="field.type === 'password' && !showPassword && !field.value"
                                        class="password-placeholder">
                                        <img v-for="n in 8" :key="n" :src="Dot" alt="Placeholder Dot"
                                            class="dot-icon" />
                                    </div>
                                    <div v-if="field.type === 'password' && !showPassword && field.value"
                                        class="password-dots">
                                        <img v-for="n in dotCount" :key="n" :src="Dot" alt="Input Dot"
                                            class="dot-icon active" />
                                    </div>
                                    <img v-if="field.showIcon && field.type !== 'password'" :src="doneIcon" alt="Done"
                                        class="done-icon" />
                                    <img v-if="field.type === 'password'"
                                        :src="showPassword ? eyeOpenIcon : eyeClosedIcon" alt="Toggle Password"
                                        class="eye-icon" @click="togglePassword" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="row2">
                        <div class="column1">
                            <div class="title">Wichtiger Hinweis</div>
                            <div class="p">
                                Bitte beachte, dass die Länder-/Gebietsinformationen für gesetzliche und steuerliche
                                Zwecke korrekt angegeben werden müssen. Weitere Informationen findest du in den
                                <a href="https://www.zoundr.com/agb" target="_blank">
                                    <span>Allgemeinen Geschäftsbedingungen.</span>
                                </a>
                            </div>
                        </div>

                        <div class="column2">
                            <div class="top-line">
                                <div class="title">Gutschriftadresse</div>
                                <a href="https://user.zoundr.dev/profile" target="_blank" class="href">
                                    Im Profil bearbeiten
                                </a>
                            </div>
                            <div class="p2">
                                <div v-if="user">{{ user.billing_first_name }} {{ user.billing_last_name }} || Name</div>
                                <div v-else> Name</div>
                                <div v-if="user && user.billing_address">{{ user.billing_address }} || Billing Address</div>
                                <div v-else> Billing Address</div>
                                <div v-if="user && user.billing_zip && user.billing_city">{{ user.billing_zip }} {{ user.billing_city }} || ZIP City</div>
                                <div v-else> ZIP City</div>
                                <div v-if="user && user.billing_country">{{ user.billing_country }} || Billing Country</div>
                                <div v-else> Billing Country</div>
                            </div>
                        </div>

                        <div class="column1"></div>
                    </div>

                    <div class="CTAs">
                        <RouterLink class="button-primary" to="/finanzen">
                        <!-- <button class="button-primary" @click="resetForm"> -->

                            <div class="p">Abbrechen</div>
                        </RouterLink>
                        <button class="button-primary" 
                                :disabled="!isFormValid || isSubmitting"
                                :class="{ 'valid-style': isFormValid && !isSubmitting }"
                                @click="submitPayout">
                            <div class="p" v-if="!isSubmitting">Betrag Auszahlen</div>
                            <div class="p" v-else>Wird bearbeitet...</div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useDataStore } from '@/stores/data';
import apiRequest from '@/lib/apiRequest';
import doneIcon from '@/assets/icons/y.png';
import eyeOpenIcon from '@/assets/icons/showpw.svg';
import eyeClosedIcon from '@/assets/icons/eye-open.svg';
import Dot from '@/assets/icons/pw.svg';

const router = useRouter();
const dataStore = useDataStore();
const user = computed(() => dataStore.user);

// ========== State ==========
const balance = ref(0);
const isLoading = ref(false);
const isSubmitting = ref(false);
const userIp = ref('...');
const userUuid = ref(null);
const userName = ref(null);
const userEmail = ref(null);

// ========== Form Fields ==========
const formFields = ref([
  {
    label: "Deine Paypal e-mail-Adresse",
    type: "email",
    placeholder: "PayPal E-Mail-Adresse",
    value: "",
    showIcon: false,
  },
  {
    label: "Bestätige Deine Paypal e-mail-Adresse",
    type: "email",
    placeholder: "PayPal E-Mail-Adresse",
    value: "",
    showIcon: false,
  },
  {
    label: "Dein <span style='color: #DD1155;'>ZOUNDR World</span> Passwort",
    type: "password",
    placeholder: "",
    value: "",
    showIcon: true,
  },
]);

// ========== Password ==========
const showPassword = ref(false);
const dotCount = computed(() => {
  const password = formFields.value[2].value;
  return password.length > 0 ? password.length : 8;
});

// ========== Amount ==========
const amount = ref(null);
const displayValue = ref('');
const isFocused = ref(false);

const displayBigNumber = computed(() => {
  if (balance.value === 0) return '0,00';
  return balance.value.toLocaleString('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
});

const formattedBalance = computed(() => {
  if (balance.value === null || balance.value === undefined || balance.value === 0) {
    return '0,00 EUR';
  }
  return balance.value.toLocaleString('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }) + ' EUR';
});

// ========== Form Validation ==========
const isFormValid = computed(() => {
  const [email, confirmEmail, password] = formFields.value;
  
  const emailValue = email.value.trim();
  const confirmValue = confirmEmail.value.trim();
  const passwordValue = password.value.trim();
  const amountValue = amount.value;
  const isAmountValid = amountValue !== null && amountValue > 0 && amountValue <= balance.value;
  
  return (
    emailValue !== "" &&
    confirmValue !== "" &&
    emailValue === confirmValue &&
    passwordValue !== "" &&
    isAmountValid &&
    balance.value > 0
  );
});

// ========== Amount Handlers ==========
const handleFocus = () => {
  if (balance.value === 0) return;
  isFocused.value = true;
  // إزالة "EUR" عند التركيز
  displayValue.value = displayValue.value.replace(' EUR', '');
};

const handleBlur = () => {
  if (balance.value === 0) return;
  isFocused.value = false;
  formatDisplayValue();
};

const handleInput = (event) => {
  if (balance.value === 0) return;
  
  let value = event.target.value;
  
  // إزالة كل ما ليس رقم، فاصلة أو نقطة
  value = value.replace(/[^0-9,.]/g, '');
  
  // إذا كان هناك أكثر من فاصلة، نحتفظ فقط بالأولى
  const commaCount = (value.match(/,/g) || []).length;
  if (commaCount > 1) {
    const firstCommaIndex = value.indexOf(',');
    value = value.substring(0, firstCommaIndex + 1) + 
            value.substring(firstCommaIndex + 1).replace(/,/g, '');
  }
  
  // تحديد منزلتين عشريتين فقط بعد الفاصلة
  const commaIndex = value.indexOf(',');
  if (commaIndex >= 0) {
    const afterComma = value.substring(commaIndex + 1);
    if (afterComma.length > 2) {
      value = value.substring(0, commaIndex + 3);
    }
  }
  
  displayValue.value = value;
  updateNumericValue();
};

const updateNumericValue = () => {
  if (!displayValue.value) {
    amount.value = null;
    return;
  }
  
  // تحويل من التنسيق الألماني إلى رقم
  // إزالة النقاط (فاصل الآلاف) واستبدال الفاصلة بنقطة
  let cleanValue = displayValue.value.replace(/\./g, '');
  cleanValue = cleanValue.replace(',', '.');
  
  const val = parseFloat(cleanValue);
  
  if (!isNaN(val) && val >= 0) {
    amount.value = Math.min(val, balance.value);
  } else {
    amount.value = null;
  }
};

const formatDisplayValue = () => {
  if (amount.value === null) {
    displayValue.value = '';
    return;
  }
  const formatted = amount.value.toLocaleString('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  displayValue.value = formatted;
};

const setMaxAmount = () => {
  if (balance.value > 0) {
    amount.value = balance.value;
    formatDisplayValue();
  }
};

// ========== Form Field Handlers ==========
const handleInputField = (index) => {
  if (formFields.value[index].type !== 'password') {
    formFields.value[index].showIcon = formFields.value[index].value.trim() !== "";
  }
};

const handleBlurField = (index) => {
  if (formFields.value[index].type !== 'password') {
    formFields.value[index].showIcon = formFields.value[index].value.trim() !== "";
  }
};

const togglePassword = () => {
  showPassword.value = !showPassword.value;
};

// ========== Reset Form ==========
const resetForm = () => {
  formFields.value.forEach(field => {
    field.value = '';
    field.showIcon = false;
  });
  amount.value = null;
  displayValue.value = '';
  showPassword.value = false;
};

// ========== Get User IP ==========
const getUserIp = async () => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    userIp.value = data.ip;
  } catch (error) {
    console.error('❌ Error fetching IP:', error);
    userIp.value = 'unbekannt';
  }
};

// ========== Get User Data ==========
const getUserData = () => {
  try {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsed = JSON.parse(userData);
      const userObj = parsed.data || parsed;
      
      userUuid.value = userObj.uuid || userObj.id || userObj.user_uuid;
      userName.value = userObj.name || userObj.username || userObj.user_name || userObj.first_name;
      userEmail.value = userObj.email || userObj.user_email;
      
      if (userUuid.value && userName.value && userEmail.value) {
        console.log('👤 User data loaded from localStorage');
        return true;
      }
    }
    
    const sessionUser = sessionStorage.getItem('user');
    if (sessionUser) {
      const parsed = JSON.parse(sessionUser);
      const userObj = parsed.data || parsed;
      
      userUuid.value = userObj.uuid || userObj.id || userObj.user_uuid;
      userName.value = userObj.name || userObj.username || userObj.user_name || userObj.first_name;
      userEmail.value = userObj.email || userObj.user_email;
      
      if (userUuid.value && userName.value && userEmail.value) {
        console.log('👤 User data loaded from sessionStorage');
        return true;
      }
    }
    
    if (user.value) {
      const userObj = user.value.data || user.value;
      
      userUuid.value = userObj.uuid || userObj.id || userObj.user_uuid;
      userName.value = userObj.name || userObj.username || userObj.user_name || userObj.first_name;
      userEmail.value = userObj.email || userObj.user_email;
      
      if (userUuid.value && userName.value && userEmail.value) {
        console.log('👤 User data loaded from store');
        return true;
      }
    }
    
    console.warn('⚠️ No user data found');
    return false;
  } catch (error) {
    console.error('❌ Error parsing user data:', error);
    return false;
  }
};

// ========== Fetch Balance ==========
const fetchBalance = async () => {
  if (!userUuid.value || !userName.value || !userEmail.value) {
    console.warn('⚠️ Missing user data, cannot fetch balance');
    return;
  }
  
  isLoading.value = true;
  try {
    const params = new URLSearchParams();
    params.append('user_uuid', userUuid.value);
    params.append('user_name', userName.value);
    params.append('user_email', userEmail.value);
    
    const url = `/wallet/balance?${params.toString()}`;
    console.log('💰 Fetching balance from:', url);
    
    const response = await apiRequest.get(url);
    console.log('📦 Response data:', response.data);
    
    let balanceValue = 0;
    
    if (response.data) {
      if (response.data.user_balance !== undefined) {
        const rawBalance = response.data.user_balance;
        balanceValue = typeof rawBalance === 'string' ? parseFloat(rawBalance) : rawBalance;
      } else if (response.data.balance !== undefined) {
        balanceValue = typeof response.data.balance === 'string' ? parseFloat(response.data.balance) : response.data.balance;
      } else if (response.data.data?.balance !== undefined) {
        balanceValue = typeof response.data.data.balance === 'string' ? parseFloat(response.data.data.balance) : response.data.data.balance;
      } else if (typeof response.data === 'number') {
        balanceValue = response.data;
      }
      
      if (isNaN(balanceValue)) {
        balanceValue = 0;
      }
    }
    
    balance.value = balanceValue;
    console.log('💰 Final balance:', balance.value);
    
    // إذا كان الرصيد 0، امسح حقل المبلغ
    if (balance.value === 0) {
      displayValue.value = '';
      amount.value = null;
    }
    
  } catch (error) {
    console.error('❌ Error fetching balance:', error);
    balance.value = 0;
    displayValue.value = '';
    amount.value = null;
  } finally {
    isLoading.value = false;
  }
};

// ========== Submit Payout ==========
const submitPayout = async () => {
  if (!userName.value || !userEmail.value) {
    const userLoaded = getUserData();
    if (!userLoaded) {
      alert('Benutzerdaten konnten nicht geladen werden. Bitte melden Sie sich erneut an.');
      return;
    }
  }
  
  if (!isFormValid.value) {
    console.warn('⚠️ Form is not valid');
    alert('Bitte füllen Sie alle Felder korrekt aus.');
    return;
  }
  
  if (balance.value <= 0) {
    alert('Sie haben kein verfügbares Guthaben.');
    return;
  }
  
  if (isSubmitting.value) {
    console.warn('⚠️ Already submitting');
    return;
  }
  
  isSubmitting.value = true;
  
  try {
    const [email, confirmEmail, password] = formFields.value;
    
    if (!userName.value || !userEmail.value) {
      throw new Error('Benutzerdaten fehlen. Bitte laden Sie die Seite neu.');
    }
    
    const formData = new FormData();
    formData.append('date', new Date().toISOString().split('T')[0]);
    formData.append('gross_amount', amount.value);
    formData.append('paypal_email', email.value);
    formData.append('user_name', userName.value);
    formData.append('user_email', userEmail.value);
    
    console.log('📤 Submitting payout:', {
      date: new Date().toISOString().split('T')[0],
      gross_amount: amount.value,
      paypal_email: email.value,
      user_name: userName.value,
      user_email: userEmail.value
    });
    
    const response = await apiRequest.post('/credits', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    console.log('✅ Payout submitted successfully');
    router.push('/finale-msg');
    
  } catch (error) {
    console.error('❌ Error submitting payout:', error);
    
    if (error.response?.data?.message) {
      alert(`Fehler: ${error.response.data.message}`);
    } else if (error.response?.data?.errors) {
      const errors = Object.values(error.response.data.errors).flat();
      alert(`Fehler: ${errors.join('\n')}`);
    } else {
      alert(error.message || 'Ein Fehler ist aufgetreten. Bitte versuche es später erneut.');
    }
  } finally {
    isSubmitting.value = false;
  }
};

// ========== Lifecycle ==========
onMounted(async () => {
  console.log('🚀 Component mounted');
  
  await getUserIp();
  await dataStore.loadUser();
  
  const userLoaded = getUserData();
  
  if (!userLoaded) {
    console.log('⏳ Retrying user data load...');
    setTimeout(() => {
      getUserData();
    }, 500);
  }
  
  if (userUuid.value && userName.value && userEmail.value) {
    await fetchBalance();
  } else {
    console.warn('⚠️ Cannot fetch balance - missing user data');
  }
  
  console.log('🏁 Page initialized:', {
    balance: balance.value,
    userName: userName.value,
    userEmail: userEmail.value,
    userUuid: userUuid.value
  });
});

// ========== Watch for user changes ==========
watch(
  () => user.value,
  (newUser) => {
    if (newUser && !userUuid.value) {
      console.log('🔄 User data changed in store, reloading...');
      getUserData();
      if (userUuid.value && userName.value && userEmail.value) {
        fetchBalance();
      }
    }
  },
  { deep: true }
);

// ========== Expose ==========
defineExpose({
  refreshBalance: fetchBalance,
  resetForm
});
</script>

<style lang="scss" scoped>
.main {
    display: flex;
    width: 100%;
    height: calc(100vh - 71px - 50px);
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
    flex-shrink: 0;
}

.top-row {
    display: flex;
    align-items: center;
    gap: 20px;
    align-self: stretch;
    max-height: 60px;
}

.Guthaben {
    display: flex;
    padding: 20px;
    justify-content: space-between;
    align-items: center;
    flex: 1 0 0;
    align-self: stretch;
    border-radius: 20px;
    background: linear-gradient(90deg, var(--secondary) 0%, var(--Strawberry) 100%);
}

.title {
    color: #fff;
    font-family: Heebo;
    font-size: 28px;
    font-style: normal;
    font-weight: 700;
    line-height: 0.9;
    text-transform: uppercase;
}

.number {
    color: #fff;
    font-family: Heebo;
    font-size: 28px;
    font-style: normal;
    font-weight: 700;
    line-height: 0.9;
    text-transform: uppercase;
}

.Content {
    display: flex;
    align-items: flex-start;
    flex: 1 0 0;
    align-self: stretch;
    height: 100%;
}

.Content .Box {
    display: flex;
    padding: 20px 30px;
    flex-direction: column;
    align-items: flex-start;
    gap: 44px;
    flex: 1 0 0;
    align-self: stretch;
    border-radius: 20px;
    background: var(--secondary);
}

.Box .Top-line {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
    align-self: stretch;
}

.Top-line .title {
    color: #fff;
    font-family: Heebo;
    font-size: 18px;
    font-style: normal;
    font-weight: 700;
    line-height: 1;
    letter-spacing: 0.9px;
    text-transform: uppercase;
    flex: 1 0 0;
}

.Top-line .right {
    color: #fff;
    text-align: right;
    font-family: Heebo;
    font-size: 18px;
    font-style: normal;
    font-weight: 300;
    line-height: 1;
    letter-spacing: 0.9px;
    opacity: 0.7;
}

.form-amount {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 10px;
    flex: 1 0 0;
    align-self: stretch;
    height: 100%;
}

.number-Big {
    color: var(--Main-Colors-Dove, #6a6c6d);
    font-family: Heebo;
    font-size: 220px;
    font-style: normal;
    font-weight: 700;
    line-height: 1;
    letter-spacing: 11px;
    text-transform: uppercase;
    opacity: 0.1;
    pointer-events: none;
}

.form-CTA {
    display: flex;
    align-items: center;
    gap: 2px;
    z-index: 10;
}

.form-CTA .Form {
    display: flex;
    width: 470px;
    padding: 16px 12px;
    align-items: center;
    justify-content: center;
    align-self: center;
    border-radius: 5px 0px 0px 5px;
    background: var(--primary);
    height: 46px;
    transition: .3s ease;

    &:hover {
        border: 1px solid var(--Strawberry);
    }

    &:focus-within {
        opacity: 1 !important;
        filter: none !important;
    }
}

.form-CTA .Form .form-input {
    width: 100%;
    border: none;
    outline: none;
    background: transparent;
    color: var(--Main-Colors-Dove, #6a6c6d);
    font-family: Heebo;
    font-size: 20px;
    font-style: normal;
    font-weight: 700;
    line-height: 1;
    letter-spacing: 1px;
    text-transform: uppercase;
    text-align: center;
    padding-right: 8px;
}

.form-CTA .Form .form-input:not(:placeholder-shown),
.form-CTA .Form .form-input:focus {
    color: #fff;
    opacity: 1 !important;
}

.form-CTA .Form .form-input::placeholder {
    color: var(--Main-Colors-Dove, #6a6c6d);
    font-family: Heebo;
    font-size: 20px;
    font-style: normal;
    font-weight: 700;
    line-height: 1;
    letter-spacing: 1px;
    text-align: center;
}

.form-CTA .Form .form-input:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.form-CTA .Form-btn {
    display: flex;
    padding: 16px 20px;
    align-items: center;
    gap: 477px;
    border-radius: 0px 5px 5px 0px;
    background: var(--primary);
    cursor: pointer;
    height: 46px;

    &:hover:not(.btn-disabled) {
        background: var(--Strawberry);
        transition: .3s ease;
    }
}

.form-CTA .Form-btn.btn-disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.form-CTA .Form-btn .p {
    color: #fff;
    font-family: Heebo;
    font-size: 20px;
    font-style: normal;
    font-weight: 300;
    line-height: 1;
    letter-spacing: 1px;
    text-transform: uppercase;
}

.form-info {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 40px;
    align-self: stretch;
}

.row1 {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
    align-self: stretch;
}

.title-row1 {
    width: 838px;
    color: var(--Main-Colors-Dove, #6a6c6d);
    font-family: Heebo;
    font-size: 18px;
    font-style: normal;
    font-weight: 300;
    line-height: 1;
}

.Form-row1 {
    display: flex;
    align-items: flex-start;
    gap: 20px;
    align-self: stretch;
}

.Form-row1 .form1 {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 8px;
    flex: 1 0 0;

    .title {
        color: var(--Main-Colors-White, #fff);
        font-family: Heebo;
        font-size: 14px;
        font-style: normal;
        font-weight: 300;
        line-height: .9;
        letter-spacing: 0.7px;
        text-transform: uppercase;
    }

    .title span {
        color: var(--Strawberry, #DD1155) !important;
    }

    .input-container {
        display: flex;
        align-items: center;
        gap: 8px;
        align-self: stretch;
        border-radius: 5px;
        background: var(--primary);
        padding: 8px 12px;
        position: relative;
        height: 38px;

        .formField {
            flex: 1;
            border: none;
            outline: none;
            background: transparent;
            color: var(--Main-Colors-Dove, #6a6c6d);
            font-family: Heebo;
            font-size: 20px;
            font-style: normal;
            font-weight: 300;
            line-height: 1;
            letter-spacing: 1px;

            &[type="password"] {
                -webkit-text-security: none;
                font-family: monospace;
                letter-spacing: 4px;
            }

            &:not(:placeholder-shown),
            &:focus {
                color: #fff;
            }

            &::placeholder {
                color: var(--Main-Colors-Dove, #6a6c6d);
                font-family: Heebo;
                font-size: 20px;
                font-style: normal;
                font-weight: 300;
                line-height: 1;
                letter-spacing: 1px;
            }
        }

        .password-placeholder,
        .password-dots {
            display: flex;
            align-items: center;
            gap: 7px;
            position: absolute;
            left: 15px;
            top: 52%;
            transform: translateY(-50%);

            .dot-icon {
                width: 8px;
                height: 8px;
                filter: invert(42%) sepia(6%) saturate(473%) hue-rotate(169deg) brightness(92%) contrast(88%);

                &.active {
                    filter: brightness(0) invert(1);
                }
            }
        }

        .done-icon,
        .eye-icon {
            width: 20px;
            position: absolute;
            right: 12px;
            cursor: pointer;
        }
    }
}

.row2 {
    display: flex;
    align-items: flex-start;
    gap: 20px;
    align-self: stretch;
}

.row2 .column1,
.row2 .column2 {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
    flex: 1 0 0;
}

.row2 .column1 .title,
.row2 .column2 .top-line .title {
    align-self: stretch;
    color: #fff;
    font-family: Heebo;
    font-size: 18px;
    font-style: normal;
    font-weight: 700;
    line-height: 1;
    letter-spacing: 0.9px;
    text-transform: uppercase;
}

.row2 .column1 .p {
    align-self: stretch;
    color: var(--Main-Colors-Dove, #6a6c6d);
    font-family: Heebo;
    font-size: 18px;
    font-style: normal;
    font-weight: 300;
    line-height: 1.4;
}

.row2 .column1 .p span {
    color: var(--Strawberry, #DD1155) !important;
    font-family: Heebo;
    font-size: 18px;
    font-style: normal;
    font-weight: 300;
    line-height: 1;
    text-decoration-line: underline;

    &:hover {
        color: var(--dark-red) !important;
        text-decoration-line: none;
        transition: .3s ease;
    }
}

.row2 .column2 .p2 {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    align-self: stretch;
}

.row2 .column2 .top-line {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    align-self: stretch;
}

.row2 .column1 .p2 div,
.row2 .column2 .p2 div {
    color: var(--Main-Colors-White, #fff);
    font-family: Heebo;
    font-size: 18px;
    font-style: normal;
    font-weight: 300;
    line-height: 1;
}

.CTAs {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 20px;
    align-self: stretch;
}

.CTAs .button-primary {
    display: flex;
    padding: 12px 20px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    border-radius: 5px;
    background: var(--Main-Colors-Slate-Light, #3a3e42);
    border: none;
    outline: none;
    cursor: pointer;

    &:hover:not(:disabled) {
        transition: .3s ease;
        background: var(--dark-red, #b00e44);
    }
}

.CTAs .button-primary:disabled {
    background: var(--Main-Colors-Slate-Light, #3a3e42);
    opacity: 0.5;
    cursor: not-allowed;
}

.CTAs .button-primary .p {
    color: var(--Main-Colors-White, #fff);
    font-family: Heebo;
    font-size: 16px;
    font-style: normal;
    font-weight: 400;
    line-height: 0.9;
    text-transform: uppercase;
}

.CTAs .button-primary:disabled .p {
    color: var(--Main-Colors-Dove, #6a6c6d);
}

.href {
    color: var(--Main-Colors-White, #fff);
    font-family: Heebo;
    font-size: 16px;
    font-style: normal;
    font-weight: 300;
    line-height: 1;
    text-decoration-line: underline;
}

.valid-style {
    background: var(--Strawberry, #DD1155) !important;
}

.valid-style:hover:not(:disabled) {
    background: var(--dark-red, #b00e44) !important;
}

.Form-row1 .form1 .title {
    max-height: 10px;
}

.CTAs .button-primary {
    max-height: 36px;
}

@media (min-width:1440px) and (max-width:1599px) {
    .number-Big {
        font-size: 120px;
        line-height: .7;
        letter-spacing: 6px;
    }

    .title-row1 {
        font-size: 14px;
        line-height: .8;
    }

    .row2 .column2 .top-line {
        justify-content: center;
    }
    .href {
        width: 138px;
        font-size: 15px;
    }

    .row2 .column1 .p {
        font-size: 14px;
    }
    .row2 .column1 .p span,
    .row2 .column2 .p2 div {
        font-size: 14px;
    }

    .row2 .column2 .top-line {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 10px;
        align-self: stretch;
    }
    .row2 .column2 .top-line .title {
        flex: 1 0 0;
        font-size: 15px;
    }

    .row2 .column1 .title {
        font-size: 15px;
    }
}

@media (min-width:1600px) and (max-width:2074px) {
    .number-Big {
        line-height: .7;
        padding-top: 10px;
    }

    .title-row1 {
        font-size: 14px;
        line-height: .8;
    }

    .row2 .column1 .p2 div,
    .row2 .column2 .p2 div {
        font-size: 14px;
    }

    .row2 .column1 .p,
    .row2 .column1 .p span {
        line-height: 1.5;
        font-size: 14px;
    }
}

@media (min-width:2075px) and (max-width:2560px) {
    .title-row1 {
        font-size: 18px;
    }

    .row2 .column1 .p2 div,
    .row2 .column2 .p2 div {
        font-size: 18px;
    }

    .row2 .column1 .p,
    .row2 .column1 .p span {
        font-size: 18px;
    }
}
</style>