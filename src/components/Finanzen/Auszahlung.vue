```vue
<template>
    <div class="main">
        <div class="top-row">
            <div class="Guthaben">
                <div class="title">Dein Verfügbares Guthaben</div>
                <div class="number">2.761,66 EUR</div>
            </div>
        </div>

        <div class="Content">
            <div class="Box">
                <div class="Top-line">
                    <div class="title">Guthaben Auszahlen</div>
                    <div class="right">Deine IP-Adresse: 172.17.0.3</div>
                </div>

                <div class="form-amount">
                    <div class="number-Big">2.761,66</div>
                    <div class="form-CTA">
                        <div class="Form">
                            <input type="text" 
                                   v-model="displayValue" 
                                   @input="handleInput" 
                                   @focus="handleFocus"
                                   @blur="handleBlur"
                                   class="form-input" 
                                   placeholder="0,00 EUR" />
                        </div>
                        <div class="Form-btn">
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
                                        @input="handleInput(index)" @blur="handleBlur(index)"
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
                        <button class="button-primary">
                            <div class="p">Abbrechen</div>
                        </button>
                        <router-link to="/finale-msg">
                            <button class="button-primary" :disabled="!isFormValid"
                                :class="{ 'valid-style': isFormValid }">
                                <div class="p">Betrag Auszahlen</div>
                            </button>
                        </router-link>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useDataStore } from '@/stores/data';
import doneIcon from '@/assets/icons/y.png';
import eyeOpenIcon from '@/assets/icons/showpw.svg';
import eyeClosedIcon from '@/assets/icons/eye-open.svg';
import Dot from '@/assets/icons/pw.svg';

// Initialize the Pinia store
const dataStore = useDataStore();
const user = computed(() => dataStore.user);

// Fetch user data on component mount
onMounted(() => {
  dataStore.loadUser();
});

// Form fields configuration
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

// Password visibility toggle
const showPassword = ref(false);
const dotCount = computed(() => {
  const password = formFields.value[2].value;
  return password.length > 0 ? password.length : 8;
});

// Form validation
const isFormValid = computed(() => {
  const [email, confirmEmail, password] = formFields.value;
  return (
    email.value.trim() !== "" &&
    confirmEmail.value.trim() !== "" &&
    email.value === confirmEmail.value &&
    password.value.trim() !== "" &&
    amount.value !== null && 
    amount.value.toString().trim() !== ""
  );
});

// Amount handling
const amount = ref(null);
const displayValue = ref('');
const isFocused = ref(false);

const handleFocus = () => {
  isFocused.value = true;
  displayValue.value = displayValue.value.replace(' EUR', '');
};

const handleBlur = () => {
  isFocused.value = false;
  formatDisplayValue();
};

const handleInput = (event) => {
  let value = event.target.value;
  value = value.replace(/[^0-9,]/g, '');
  const commaIndex = value.indexOf(',');
  if (commaIndex >= 0) {
    value = value.substring(0, commaIndex + 1) + 
            value.substring(commaIndex + 1).replace(/,/g, '');
    const decimalPart = value.substring(commaIndex + 1);
    if (decimalPart.length > 2) {
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
  const numericStr = displayValue.value.replace(/\./g, '').replace(',', '.');
  amount.value = parseFloat(numericStr) || null;
};

const formatDisplayValue = () => {
  if (amount.value === null) {
    displayValue.value = '';
    return;
  }
  const formatted = new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount.value);
  displayValue.value = formatted + ' EUR';
};

watch(isFocused, (newVal) => {
  if (!newVal && amount.value !== null) {
    formatDisplayValue();
  }
});

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
    // padding-bottom: 55px;
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

.form-CTA .Form-btn {
    display: flex;
    padding: 16px 20px;
    align-items: center;
    gap: 477px;
    border-radius: 0px 5px 5px 0px;
    background: var(--primary);
    cursor: pointer;
    height: 46px;

    &:hover {
        background: var(--Strawberry);
        transition: .3s ease;
    }
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

    &:hover {
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

.valid-style:hover {
    background: var(--dark-red, #b00e44) !important;
}


 .Form-row1 .form1 .title{
        max-height: 10px;
    }

    .CTAs .button-primary{
        max-height: 36px;
    }
@media (min-width:1440px) and (max-width:1599px) {
    .number-Big{
        font-size: 120px;
        line-height: .7;
        letter-spacing: 6px;
    }

    .title-row1{
        font-size: 14px;
        line-height: .8;
    }

    .row2 .column2 .top-line{
        justify-content: center;
    }
    .href{
        width: 138px;
        font-size: 15px;
    }


    .row2 .column1 .p{
        font-size: 14px;
    }
    .row2 .column1 .p span,.row2 .column2 .p2 div{
        font-size: 14px;
    }


    .row2 .column2 .top-line{
        display: flex;
justify-content: center;
align-items: center;
gap: 10px;
align-self: stretch;
    }
    .row2 .column2 .top-line .title{
        flex: 1 0 0;
        
font-size: 15px;

    }


    .row2 .column1 .title{
        font-size: 15px;
    }
   
}



@media (min-width:1600px) and (max-width:2074px) {
    .number-Big{
        line-height: .7;
        padding-top: 10px;
    }

    .title-row1{
        font-size: 14px;
        line-height: .8;
    }


    .row2 .column1 .p2 div, .row2 .column2 .p2 div{
        font-size: 14px;
    }


    .row2 .column1 .p,.row2 .column1 .p span{
        line-height: 1.5;
        font-size: 14px;
    }
}

@media (min-width:2075px) and (max-width:2560px){
    .title-row1{
        font-size: 18px;
    }


      .row2 .column1 .p2 div, .row2 .column2 .p2 div{
        font-size: 18px;
    }


    .row2 .column1 .p,.row2 .column1 .p span{
      
        font-size: 18px;
    }
}
</style>