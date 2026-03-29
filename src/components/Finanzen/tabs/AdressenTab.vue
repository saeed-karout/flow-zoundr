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
          </div>
        </div>
        <div class="CTAs">
          <div class="Button-primary" @click="enableEditing">Bearbeiten</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useDataStore } from '@/stores/data'; // Adjust path as needed

// Initialize the store
const dataStore = useDataStore();

// Reactive data object for the form fields
const data = ref({
  column1: [
    { label: "Firma", type: "text", placeholder: "Diggie GbR", value: "" },
    { label: "Strasse + Hausnummer", type: "text", placeholder: "Rudhartstr. 17", value: "" },
    { label: "E-Mail", type: "text", placeholder: "info@zoundr.com", value: "" },
  ],
  column2: [
    { label: "Vorname", type: "text", placeholder: "Emanuel", value: "" },
    { label: "PLZ", type: "text", placeholder: "80999", value: "" }, // Changed to text to handle null
    { label: "Telefon", type: "text", placeholder: "+49 129 232 194", value: "" }, // Changed to text
  ],
  column3: [
    { label: "Name", type: "text", placeholder: "Kellner", value: "" },
    { label: "ORT", type: "text", placeholder: "München", value: "" },
    { label: "LAND", type: "text", placeholder: "Deutschland", value: "" },
  ],
});

// Reactive state for enabling/disabling inputs
const isEditable = ref(false);

// Fetch user data when the component mounts
onMounted(async () => {
  await dataStore.loadUser();
  if (dataStore.user) {
    // Map user data to form fields, handle null values
    data.value.column1[0].value = dataStore.user.billing_company || "";
    data.value.column1[1].value = dataStore.user.billing_address || "";
    data.value.column1[2].value = dataStore.user.billing_email || dataStore.user.email || "";
    data.value.column2[0].value = dataStore.user.billing_first_name || "";
    data.value.column2[1].value = dataStore.user.billing_zip || "";
    data.value.column2[2].value = dataStore.user.billing_phone || "";
    data.value.column3[0].value = dataStore.user.billing_last_name || "";
    data.value.column3[1].value = dataStore.user.billing_city || "";
    data.value.column3[2].value = dataStore.user.billing_country || "";
  }
});

// Function to toggle edit mode
const enableEditing = () => {
  isEditable.value = !isEditable.value;
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
  font-size: 16px;
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