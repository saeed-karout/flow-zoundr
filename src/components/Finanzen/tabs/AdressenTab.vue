<template>
  <div class="box-stream">
    <div class="p">Gutschriften- & Rechnungsadresse</div>
    <div class="form">
      <div class="column1">
        <div v-for="(field, index) in data.column1" :key="index" class="form-field">
          <div class="title">{{ field.label }}</div>
          <div class="input-container">
            <input
              :type="field.type"
              v-model="field.value"
              class="form-filed"
              :placeholder="field.placeholder"
              disabled
            />
            <!-- قفل على جميع الحقول متى وُجدت أي بيانات فوترة،
                 حتى الحقول الاختيارية الفارغة — نفس منطق Upload4Component. -->
            <span class="checkmark" v-if="hasBillingData">
              <img :src="iconDisabled" alt="Gesperrt" />
            </span>
          </div>
        </div>
      </div>
      <div class="column2">
        <div v-for="(field, index) in data.column2" :key="index" class="form-field">
          <div class="title">{{ field.label }}</div>
          <div class="input-container">
            <input
              :type="field.type"
              v-model="field.value"
              class="form-filed"
              :placeholder="field.placeholder"
              disabled
            />
            <!-- قفل على جميع الحقول متى وُجدت أي بيانات فوترة،
                 حتى الحقول الاختيارية الفارغة — نفس منطق Upload4Component. -->
            <span class="checkmark" v-if="hasBillingData">
              <img :src="iconDisabled" alt="Gesperrt" />
            </span>
          </div>
        </div>
      </div>
      <div class="column3">
        <div v-for="(field, index) in data.column3" :key="index" class="form-field">
          <div class="title">{{ field.label }}</div>
          <div class="input-container">
            <input
              :type="field.type"
              v-model="field.value"
              class="form-filed"
              :placeholder="field.placeholder"
              disabled
            />
            <!-- قفل على جميع الحقول متى وُجدت أي بيانات فوترة،
                 حتى الحقول الاختيارية الفارغة — نفس منطق Upload4Component. -->
            <span class="checkmark" v-if="hasBillingData">
              <img :src="iconDisabled" alt="Gesperrt" />
            </span>
          </div>
        </div>
        <div class="CTAs">
          <div class="Button-primary"  @click="goToProfile" >Bearbeiten</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { app_code, user_url } from '@/zoundr/constants';
import { noSplashScreen } from '@/zoundr/utils';
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useDataStore } from '@/stores/data'; // Adjust path as needed
import iconDisabled from '@/assets/icons/Icon_awesome-lock.png';

const router = useRouter();

// Initialize the store
const dataStore = useDataStore();

// Reactive data object for the form fields
const data = ref({
  column1: [
    { label: "Firma", type: "text", placeholder: "Firma eingeben", value: "" },
    { label: "Strasse + Hausnummer", type: "text", placeholder: "Strasse und Hausnummer eingeben", value: "" },
    { label: "E-Mail", type: "text", placeholder: "E-Mail-Adresse eingeben", value: "" },
  ],
  column2: [
    { label: "Vorname", type: "text", placeholder: "Vorname eingeben", value: "" },
    { label: "PLZ", type: "text", placeholder: "PLZ eingeben", value: "" },
    { label: "Telefon", type: "text", placeholder: "Telefonnummer eingeben", value: "" },
  ],
  column3: [
    { label: "Name", type: "text", placeholder: "Nachname eingeben", value: "" },
    { label: "ORT", type: "text", placeholder: "Ort eingeben", value: "" },
    { label: "LAND", type: "text", placeholder: "Land auswählen", value: "" },
  ],
});

// وجود أي حقل فوترة يقفل النموذج بأكمله — مطابق لـ hasBillingData في Upload4Component.
const hasBillingData = computed(() => {
  const u = dataStore.user;
  if (!u) return false;
  return !!(u.billing_first_name || u.billing_last_name || u.billing_street_name ||
            u.billing_street_number || u.billing_postal_code || u.billing_city ||
            u.billing_country || u.billing_company);
});

// الـ API يرجّع رمز الدولة بالإنكليزية (germany)، والواجهة ألمانية بالكامل.
// نفس خريطة countryDisplayName المستعملة في Upload4Component.
const countryDisplayName = (c) => {
  if (!c) return "";
  const normalized = String(c).toLowerCase();
  if (normalized === 'germany' || normalized === 'de') return 'Deutschland';
  if (normalized === 'austria' || normalized === 'at') return 'Österreich';
  if (normalized === 'switzerland' || normalized === 'ch') return 'Schweiz';
  return c;
};

// Fetch user data when the component mounts
onMounted(async () => {
  await dataStore.loadUser();
  const u = dataStore.user;
  if (!u) return;

  // الشارع ورقمه حقلان منفصلان في الـ API ويُعرضان معاً.
  const street = [u.billing_street_name, u.billing_street_number]
    .filter(v => v && String(v).trim() !== '')
    .join(' ');

  data.value.column1[0].value = u.billing_company || "";
  data.value.column1[1].value = street;
  data.value.column1[2].value = u.email || "";
  data.value.column2[0].value = u.billing_first_name || "";
  data.value.column2[1].value = u.billing_postal_code || "";
  data.value.column2[2].value = u.phone || "";
  data.value.column3[0].value = u.billing_last_name || "";
  data.value.column3[1].value = u.billing_city || "";
  data.value.column3[2].value = countryDisplayName(u.billing_country);
});

// Function to toggle edit mode
const goToProfile = () => {
  // إغلاق السايدبار إذا كان مفتوحاً (اختياري)
  // يمكنك إضافة emit هنا إذا كان المكون يحتاج إلى إغلاق السايدبار
  
  // الانتقال إلى صفحة البروفايل
  if (app_code === 'user') {
    // استخدام Vue Router للتطبيق الرئيسي
    router.push('/profile');
  } else {
    // استخدام الرابط المباشر للتطبيقات الفرعية
    noSplashScreen();
    window.location.href = user_url + '/profile';
  }
};
</script>

<style lang="scss" scoped>
.box-stream {
  display: flex;
  height: 100%;
  padding: 20px 30px;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 32px;
  flex: 1 0 0;
  border-radius: 20px;
  background: var(--secondary, #26282d);
  position: relative;
}

.box-stream .p {
  color: #fff;
  font-family: Heebo;
  font-size: 18px;
  font-style: normal;
  font-weight: 700;
  line-height: 0.8;
  letter-spacing: 0.9px;
  text-transform: uppercase;
  align-self: stretch;
}

.form {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  flex: 1 0 0;
  align-self: stretch;
}

.column1,
.column2,
.column3 {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 20px;
  flex: 1 0 0;
  align-self: stretch;
}

.column3 {
  align-items: flex-end;
}

/* ✅ أيقونة القفل — نفس قياس وموضع Upload4Component.
   .input-container فيه flex مع gap، فتقع الأيقونة يمين الحقل تلقائياً
   (الإدخال يأخذ flex: 1) دون حاجة إلى وضع مطلق. */
.checkmark {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.checkmark img {
  width: 16px;
  height: auto;
}

.form-field {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 8px;
  align-self: stretch;
}

.title {
  color: #fff;
  font-family: Heebo;
  font-size: 14px;
  font-style: normal;
  font-weight: 300;
  line-height: 1;
  letter-spacing: 0.7px;
  text-transform: uppercase;
}

.input-container {
  display: flex;
  align-items: center;
  gap: 8px;
  align-self: stretch;
  border-radius: 5px;
  background: var(--primary, #ffffff);
  padding: 8px 12px;
  cursor: not-allowed;
  height: 38px;
}

.form-filed {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  color: var(--Main-Colors-Slate-Light, #3a3e42);
  font-family: Heebo;
  font-size: 20px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  letter-spacing: 0.8px;
}

.form-filed::placeholder {
  color: var(--Main-Colors-Slate-Light, #3a3e42);
  font-family: Heebo;
  font-size: 20px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  letter-spacing: 0.8px;
  opacity: 1;
}

.form-filed:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.CTAs {
  display: flex;
  padding-top: 20px;
  justify-content: flex-end;
  align-items: center;
  gap: 20px;
}

.Button-primary {
  display: flex;
  padding: 12px 20px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  border-radius: 5px;
  background: var(--Strawberry, #d11515);
  color: #fff;
  font-family: Heebo;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: .9;
  text-transform: uppercase;
}

.Button-primary:hover {
  background: var(--dark-red, #a11212);
  transition: 0.3s ease;
  cursor: pointer;
}



</style>