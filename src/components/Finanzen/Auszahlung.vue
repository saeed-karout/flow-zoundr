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
                            <!-- حقل كلمة المرور في <form> مستقلّ لا يحوي أيّ حقل نصّ آخر:
                                 مدير كلمات المرور يملأ اسم المستخدم المرتبط بكلمة المرور داخل
                                 النموذج نفسه، فحين لا يجد حقلاً كهذا يملأ كلمة المرور وحدها
                                 ولا يمسّ حقلَي البريد. -->
                            <component :is="field.type === 'password' ? 'form' : 'div'"
                                class="form1" v-for="(field, index) in formFields" :key="index"
                                @submit.prevent>
                                <div class="title" v-html="field.label"></div>
                                <div class="input-container">
                                    <input
                                        :type="field.type === 'password' && showPassword ? 'text' : field.type"
                                        v-model="field.value" class="formField"
                                        :autocomplete="field.type === 'password' ? 'current-password' : 'off'"
                                        :placeholder="field.placeholder"
                                        @input="handleInputField(index); syncPwSelection($event)"
                                        @blur="handleBlurField(index); clearPwSelection()"
                                        @select="syncPwSelection" @keyup="syncPwSelection"
                                        @mouseup="syncPwSelection" @focus="syncPwSelection" />
                                    <!-- قناع كلمة المرور بقياسات التصميم (دائرة 8×8 وفجوة 8px) مستقلّة عن حجم الخط.
                                         الحقل الأصلي تحته يستقبل الإدخال ونصّه شفّاف، فلا تُرسم النقاط مرّتين. -->
                                    <div v-if="field.type === 'password' && !showPassword" class="pw-mask" aria-hidden="true">
                                        <div class="pw-track">
                                            <template v-if="field.value">
                                                <span v-for="n in field.value.length" :key="'f' + n"
                                                    class="pw-dot is-filled"
                                                    :class="{ 'is-selected': isPwDotSelected(n) }"></span>
                                            </template>
                                            <template v-else>
                                                <span v-for="n in 8" :key="'p' + n" class="pw-dot is-placeholder"></span>
                                            </template>
                                            <span v-show="!hasPwSelection" class="pw-caret"></span>
                                        </div>
                                    </div>
                                    <!-- علامة الصحّ لبريد صالح فعلاً (ومطابق في حقل التأكيد)، لا لأيّ نصّ مكتوب. -->
                                    <img v-if="field.type !== 'password' && isEmailFieldValid(index)" :src="doneIcon" alt="Done"
                                        class="done-icon" />
                                    <img v-if="field.type === 'password'"
                                        :src="showPassword ? eyeOpenIcon : eyeClosedIcon" alt="Toggle Password"
                                        class="eye-icon" @click="togglePassword" />
                                </div>
                            </component>
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
                                <div>{{ billingName || 'Name' }}</div>
                                <div>{{ billingStreet || 'Straße und Hausnummer' }}</div>
                                <div>{{ billingCityLine || 'PLZ und Ort' }}</div>
                                <div>{{ billingCountry || 'Land' }}</div>
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
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useDataStore } from '@/stores/data';
import { useWalletStore } from '@/stores/wallet';
import { readCurrentUser } from '@/utils/currentUser';
import apiRequest from '@/lib/apiRequest';
import doneIcon from '@/assets/icons/y.png';
import eyeOpenIcon from '@/assets/icons/showpw.svg';
import eyeClosedIcon from '@/assets/icons/eye-open.svg';

const router = useRouter();
const dataStore = useDataStore();
const user = computed(() => dataStore.user);

// ========== Gutschriftadresse (من الملف الشخصي) ==========
// مفاتيح الـ API الفعلية — billing_address / billing_zip غير موجودين فكان العنوان يظهر فارغاً.
const joinParts = (...parts) => parts.filter(v => v && String(v).trim() !== '').join(' ');

const countryDisplayName = (c) => {
  if (!c) return '';
  const n = String(c).toLowerCase();
  if (n === 'germany' || n === 'de') return 'Deutschland';
  if (n === 'austria' || n === 'at') return 'Österreich';
  if (n === 'switzerland' || n === 'ch') return 'Schweiz';
  return c;
};

const billingName     = computed(() => joinParts(user.value?.billing_first_name, user.value?.billing_last_name));
const billingStreet   = computed(() => joinParts(user.value?.billing_street_name, user.value?.billing_street_number));
const billingCityLine = computed(() => joinParts(user.value?.billing_postal_code, user.value?.billing_city));
const billingCountry  = computed(() => countryDisplayName(user.value?.billing_country));

// ========== State ==========
// الرصيد من مخزن المحفظة — مصدر واحد مشترك مع Guthaben ولوحة القيادة.
const wallet = useWalletStore();
const balance = computed(() => wallet.balance);
const isLoading = computed(() => wallet.isLoading);
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

// ========== Email Validation ==========
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const isValidEmail = (value) => EMAIL_PATTERN.test(String(value || '').trim());

// حقل 0: بريد صالح. حقل 1: صالح ومطابق للأول.
// محسوب من القيم مباشرةً لا من أحداث input، فيتحدّث حقل التأكيد عند تعديل الأول أيضاً.
const isEmailFieldValid = (index) => {
  const [email, confirm] = formFields.value;
  if (index === 0) return isValidEmail(email.value);
  if (index === 1) return isValidEmail(confirm.value) && confirm.value.trim() === email.value.trim();
  return false;
};

// ========== Password ==========
const showPassword = ref(false);

// تحديد نصّ كلمة المرور. الحقل الأصلي نصّه شفّاف، لكنّ المتصفّح يُعيد رسم
// المحدَّد منه بلونه الخاصّ فتظهر نقاطه الأصلية فوق القناع. لذا نُخفي تحديد
// المتصفّح بالكامل ونرسمه بأنفسنا على نقاط القناع.
const pwSelection = ref({ start: 0, end: 0 });

const syncPwSelection = (event) => {
  const el = event.target;
  if (el.type !== 'password') return;
  pwSelection.value = { start: el.selectionStart ?? 0, end: el.selectionEnd ?? 0 };
};

const clearPwSelection = () => {
  pwSelection.value = { start: 0, end: 0 };
};

// n مؤشّر النقطة (يبدأ من 1) → الحرف رقم n-1 داخل مجال التحديد.
const isPwDotSelected = (n) => n > pwSelection.value.start && n <= pwSelection.value.end;

// لا مؤشّر أثناء وجود تحديد، كما في أيّ حقل نصّ.
const hasPwSelection = computed(() => pwSelection.value.end > pwSelection.value.start);

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
    isValidEmail(emailValue) &&
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

// العرف الألماني: النقطة فاصل آلاف (نرسمها نحن) والفاصلة للكسور.
const groupThousands = (digits) =>
  digits.replace(/^0+(?=\d)/, '').replace(/\B(?=(\d{3})+(?!\d))/g, '.');

const handleInput = (event) => {
  if (balance.value === 0) return;

  const el = event.target;
  const caret = el.selectionStart ?? el.value.length;
  let value = el.value;

  if (event.data === '.' || event.data === ',') {
    // ما يكتبه المستخدم من نقطة أو فاصلة هو الفاصلة العشرية — نقطة لوحة
    // الأرقام تُكتب '.' فلا تصحّ معاملتها كفاصل آلاف.
    value = value.slice(0, caret - 1) + ',' + value.slice(caret);
  } else if (event.inputType === 'insertFromPaste') {
    // نصّ ملصوق: آخر فاصل يليه رقمان أو أقلّ هو الفاصلة العشرية.
    const match = value.match(/[.,](\d{0,2})$/);
    if (match) value = value.slice(0, match.index) + ',' + match[1];
  }

  // عدد المحارف ذات المعنى قبل المؤشّر — نعيده إلى موضعه بعد إعادة التنسيق،
  // وإلا قفز إلى النهاية مع كلّ نقطة آلاف تُضاف.
  let significantBefore = (value.slice(0, caret).match(/[0-9,]/g) || []).length;

  // النقاط الباقية فواصل آلاف من الرسم السابق: تُحذف ويُعاد بناؤها.
  const cleaned = value.replace(/\./g, '').replace(/[^0-9,]/g, '');
  const [intRaw = '', ...rest] = cleaned.split(',');
  const hasComma = cleaned.includes(',');
  const decimals = rest.join('').slice(0, 2);

  let formatted = groupThousands(intRaw);
  if (hasComma) formatted = (formatted || '0') + ',' + decimals;

  displayValue.value = formatted;

  // لا يُسحب أكثر من الرصيد: كان الرقم المكتوب يبقى معروضاً بينما القيمة
  // المُرسَلة مقصوصة إلى الرصيد — فيرى المستخدم مبلغاً غير الذي سيُسحب.
  if (updateNumericValue()) {
    formatDisplayValue();
    formatted = displayValue.value;
    significantBefore = Number.MAX_SAFE_INTEGER;
  }

  nextTick(() => {
    let pos = 0;
    let seen = 0;
    while (pos < formatted.length && seen < significantBefore) {
      if (/[0-9,]/.test(formatted[pos])) seen += 1;
      pos += 1;
    }
    el.setSelectionRange(pos, pos);
  });
};

// يُرجع true إن تجاوز المكتوب الرصيد فقُصّ إليه.
const updateNumericValue = () => {
  if (!displayValue.value) {
    amount.value = null;
    return false;
  }

  // تحويل من التنسيق الألماني إلى رقم
  // إزالة النقاط (فاصل الآلاف) واستبدال الفاصلة بنقطة
  let cleanValue = displayValue.value.replace(/\./g, '');
  cleanValue = cleanValue.replace(',', '.');

  const val = parseFloat(cleanValue);

  if (!isNaN(val) && val >= 0) {
    amount.value = Math.min(val, balance.value);
    return val > balance.value;
  }

  amount.value = null;
  return false;
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
  clearPwSelection();
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
  clearPwSelection();
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
// المصدر هو ردّ ‎/user‎ في مخزن البيانات فقط. كانت الدالّة تقرأ 'user' من
// localStorage أوّلاً، وهو مفتاح تكتبه تطبيقات ZOUNDR الأخرى على النطاق نفسه،
// فكانت بيانات حساب آخر تُرسَل إلى ‎/wallet/balance‎ وإلى طلب السحب.
const getUserData = () => {
  const current = readCurrentUser();

  if (!current) {
    userUuid.value = null;
    userName.value = null;
    userEmail.value = null;
    console.warn('⚠️ No user data found');
    return false;
  }

  userUuid.value = current.uuid;
  userName.value = current.name;
  userEmail.value = current.email;
  console.log('👤 User data loaded from store:', current.email);
  return true;
};

// ========== Fetch Balance ==========
// المنطق كلّه في src/stores/wallet.js؛ هنا نتعامل مع أثر النتيجة على النموذج.
const fetchBalance = async ({ force = false } = {}) => {
  const value = await wallet.fetchBalance({ force });
  if (!value) {
    displayValue.value = '';
    amount.value = null;
  }
  return value;
};

// ========== Submit Payout ==========
const submitPayout = async () => {
  if (!userName.value || !userEmail.value) {
    const userLoaded = getUserData();
    if (!userLoaded) {
     
      return;
    }
  }
  
  if (!isFormValid.value) {
   
    alert('Bitte füllen Sie alle Felder korrekt aus.');
    return;
  }
  
  if (balance.value <= 0) {
    
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
    // المبلغ تغيّر على الخادم — نُحدّث المخزن فتتبعه كلّ الشاشات.
    wallet.fetchBalance({ force: true });
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
    // صفحة السحب تعرض مبلغاً يُتصرَّف به، فتُحدّثه دائماً ولا تكتفي بالمحفوظ.
    await fetchBalance({ force: true });
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
    /* حقل كلمة المرور يُصيَّر <form>، فنُصفّر هامشه الافتراضي. */
    margin: 0;
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

            /* النقاط يرسمها .pw-mask بقياسات التصميم. الحقل هنا يستقبل الكتابة فقط:
               نصّه ومؤشّره شفّافان حتى لا تتراكب نقاط المتصفّح مع القناع. */
            &[type="password"] {
                color: transparent;
                -webkit-text-fill-color: transparent;
                caret-color: transparent;

                /* المتصفّح يتجاهل شفافية النصّ عند التحديد ويرسمه بلون التحديد،
                   فتظهر نقاطه الأصلية فوق القناع. التحديد يرسمه .pw-dot.is-selected. */
                &::selection {
                    color: transparent;
                    -webkit-text-fill-color: transparent;
                    background: transparent;
                }

                &::-moz-selection {
                    color: transparent;
                    background: transparent;
                }
            }

            /* الملء التلقائي: المتصفّح يفرض خلفيةً فاتحة على الحقل ولا تُلغيها
               background ولا !important. نغطّيها بظلّ داخليّ بلون الحاوية،
               ونؤخّر انتقال اللون طويلاً فلا تظهر ولو لحظة.
               :-webkit-autofill لكروم وسفاري، و:autofill المعياريّة لفايرفوكس
               (يتجاهل البادئة تماماً فتبقى خلفيته الصفراء بلا الثانية). */
            &:-webkit-autofill,
            &:-webkit-autofill:hover,
            &:-webkit-autofill:focus,
            &:-webkit-autofill:active,
            &:autofill,
            &:autofill:hover,
            &:autofill:focus,
            &:autofill:active {
                -webkit-box-shadow: 0 0 0 1000px var(--primary) inset;
                box-shadow: 0 0 0 1000px var(--primary) inset;
                /* فايرفوكس لا يعرف ‎-webkit-text-fill-color‎ فيلزمه color. */
                color: var(--Main-Colors-White, #fff) !important;
                -webkit-text-fill-color: var(--Main-Colors-White, #fff);
                caret-color: var(--Main-Colors-White, #fff);
                transition: background-color 600000s 0s, color 600000s 0s;
            }

            /* كلمة المرور: النقاط يرسمها .pw-mask، فيبقى نصّ الحقل ومؤشّره شفّافين
               حتى بعد الملء التلقائي. */
            &[type="password"]:-webkit-autofill,
            &[type="password"]:-webkit-autofill:hover,
            &[type="password"]:-webkit-autofill:focus,
            &[type="password"]:-webkit-autofill:active,
            &[type="password"]:autofill,
            &[type="password"]:autofill:hover,
            &[type="password"]:autofill:focus,
            &[type="password"]:autofill:active {
                color: transparent !important;
                -webkit-text-fill-color: transparent;
                caret-color: transparent;
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

/* 236 — عند النقر في الحقل يختفي نصّ الإرشاد فتبدأ الكتابة مباشرة.
   يشمل نقاط كلمة المرور لأنها صارت placeholder حقيقياً لا طبقة صور. */
.formField:focus::placeholder,
.form-input:focus::placeholder {
    color: transparent !important;
}

/* ========== قناع كلمة المرور ==========
   الإطار: من حشو الحقل الأيسر (12px) حتى ما قبل أيقونة العين (12 + 20 + 8 = 40px).
   الطول الزائد: .pw-mask يحاذي إلى النهاية و.pw-track عرضه 100% كحدّ أدنى —
   فالنقاط تبدأ من اليسار ما دامت تتّسع، وإن فاضت يُقصّ أوّلها ويبقى آخرها
   والمؤشّر ظاهرَين، كما في أيّ حقل نصّ. */
.pw-mask {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 12px;
    right: 40px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    overflow: hidden;
    pointer-events: none;
}

.pw-track {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 100%;
    flex-shrink: 0;
}

/* النقطة نفسها في ::after حتى يبقى ::before (شريط التحديد) تحتها في ترتيب الرسم. */
.pw-dot {
    position: relative;
    width: 8px;
    height: 8px;
    aspect-ratio: 1 / 1;
    flex-shrink: 0;
}

.pw-dot::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: var(--pw-dot-color, var(--Main-Colors-White, #FFF));
}

.pw-dot.is-placeholder {
    --pw-dot-color: var(--Main-Colors-Dove, #6A6C6D);
}

.pw-dot.is-filled {
    --pw-dot-color: var(--Main-Colors-White, #FFF);
}

/* شريط التحديد: يمتدّ 5px يميناً ويساراً فيملأ الفجوة (8px) بين نقطتين
   متجاورتين محدَّدتين ويتداخل 2px مع جاره، فلا يظهر خطّ فاصل بينهما،
   ويبدو شريطاً واحداً متّصلاً بلون تحديد النظام. */
.pw-dot.is-selected::before {
    content: '';
    position: absolute;
    top: -11px;
    bottom: -11px;
    left: -5px;
    right: -5px;
    background: Highlight;
}

/* 236 — عند النقر يختفي الـ placeholder وتبدأ الكتابة مباشرة */
.input-container:focus-within .pw-dot.is-placeholder {
    display: none;
}

/* مؤشّر مرسوم بعد آخر نقطة، لأنّ مؤشّر الحقل الأصلي شفّاف */
.pw-caret {
    display: none;
    width: 1px;
    height: 18px;
    flex-shrink: 0;
    background: var(--Main-Colors-White, #FFF);
    animation: pw-caret-blink 1s step-end infinite;
}

.input-container:focus-within .pw-caret {
    display: block;
}

@keyframes pw-caret-blink {
    50% { opacity: 0; }
}
</style>