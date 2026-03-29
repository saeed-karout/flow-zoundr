<template>
  <div class="main-content">
    <StepLayout :current-step="currentStep" :steps="steps" :section-title="sectionTitle"
      :section-description="sectionDescription" :hasOuterContent="true">
      <div class="form-container">
        <div class="form-component">
          <div class="form-title">NEUEN URHEBER ANLEGEN</div>
          <div class="schutzen-form">
            <form @submit.prevent="editingPersonId ? saveEdit() : addPerson()" class="schutzen-form-details">
              <!-- حقل Composer -->
              <div class="schutzen-item custom-select" :class="{ 'focused': composerFocused }"
                @click="composerFocused = !composerFocused">
                <div class="select-button" :class="{ 'filled': formData.composer }">
                  {{ formData.composer || 'Bitte wählen' }}
                  <span class="checkmark">
                    <img v-show="validation.composer && !isEditing" src="@/assets/icons/y.png" alt="completed" />
                    <svg v-show="!validation.composer || isEditing" xmlns="http://www.w3.org/2000/svg" width="12"
                      height="22" viewBox="0 0 12 22" fill="none">
                      <path
                        d="M6.75349 0.393499C6.37575 -0.131167 5.62425 -0.131166 5.2465 0.3935L0.192358 7.41338C-0.277267 8.06566 0.166457 9 0.945854 9L11.0541 9C11.8335 9 12.2773 8.06566 11.8076 7.41338L6.75349 0.393499Z"
                        :fill="composerFocused ? '#FFFFFF' : '#6A6C6D'" />
                      <path
                        d="M6.75349 21.6065C6.37575 22.1312 5.62425 22.1312 5.2465 21.6065L0.192358 14.5866C-0.277267 13.9343 0.166457 13 0.945854 13L11.0541 13C11.8335 13 12.2773 13.9343 11.8076 14.5866L6.75349 21.6065Z"
                        :fill="composerFocused ? '#FFFFFF' : '#6A6C6D'" />
                    </svg>
                  </span>
                </div>
                <ul class="options" v-if="composerFocused">
                  <li @click.stop="selectOption('composer', 'Komponist')">Komponist</li>
                  <li @click.stop="selectOption('composer', 'Textdichter')">Textdichter</li>
                  <li @click.stop="selectOption('composer', 'Komponist und Textdichter')">
                    Komponist und Textdichter
                  </li>
                  <li @click.stop="selectOption('composer', 'Arrangeur')">Arrangeur</li>
                </ul>
              </div>
              <!-- حقل Vorname -->
              <div class="schutzen-item">
                <input v-model="formData.firstName" type="text" class="item-input"
                  :class="{ 'filled': formData.firstName }" placeholder="Vorname" />
                <span class="checkmark" v-show="validation.firstName && !isEditing">
                  <img src="@/assets/icons/y.png" alt="completed" />
                </span>
              </div>
              <!-- حقل Nachname -->
              <div class="schutzen-item">
                <input v-model="formData.lastName" type="text" class="item-input"
                  :class="{ 'filled': formData.lastName }" placeholder="Nachname" />
                <span class="checkmark" v-show="validation.lastName && !isEditing">
                  <img src="@/assets/icons/y.png" alt="completed" />
                </span>
              </div>
              <!-- حقل Straße و Nr. -->
              <div class="schutzen-half">
                <div class="schutzen-half-item">
                  <input v-model="formData.street" type="text" class="item-input" :class="{ 'filled': formData.street }"
                    placeholder="Straße" />
                  <span class="checkmark" v-show="validation.street && !isEditing">
                    <img src="@/assets/icons/y.png" alt="completed" />
                  </span>
                </div>
                <div class="schutzen-half-item-small">
                  <input v-model="formData.streetNumber" type="text" class="item-input"
                    :class="{ 'filled': formData.streetNumber }" placeholder="Nr." />
                  <span class="checkmark" v-show="validation.streetNumber && !isEditing">
                    <img src="@/assets/icons/y.png" alt="completed" />
                  </span>
                </div>
              </div>
              <!-- حقل PLZ و Ort -->
              <div class="schutzen-half">
                <div class="schutzen-half-item-small small">
                  <input v-model="formData.postalCode" type="text" class="item-input"
                    :class="{ 'filled': formData.postalCode }" placeholder="PLZ" />
                  <span class="checkmark" v-show="validation.postalCode && !isEditing">
                    <img src="@/assets/icons/y.png" alt="completed" />
                  </span>
                </div>
                <div class="schutzen-half-item">
                  <input v-model="formData.city" type="text" class="item-input" :class="{ 'filled': formData.city }"
                    placeholder="Ort" />
                  <span class="checkmark" v-show="validation.city && !isEditing">
                    <img src="@/assets/icons/y.png" alt="completed" />
                  </span>
                </div>
              </div>
              <!-- حقل Land -->
              <div class="schutzen-item">
                <input v-model="formData.land" type="text" class="item-input" :class="{ 'filled': formData.land }"
                  placeholder="Land" />
                <span class="checkmark" v-show="validation.land && !isEditing">
                  <img src="@/assets/icons/y.png" alt="completed" />
                </span>
              </div>
              <!-- أزرار النموذج -->
              <div class="schutzen-form-group-btn">
                <button v-if="!editingPersonId" type="submit" class="schutzen-submit-btn" :disabled="!allFieldsValid">
                  <span>HINZUFÜGEN</span>
                </button>
                <div v-else class="schutzen-edit-buttons">
                  <button type="button" class="schutzen-cancel-btn" @click="cancelEdit">
                    ZURÜCK
                  </button>
                  <div class="schutzen-right-edit">
                    <button type="button" class="schutzen-cancel-btn" @click="deletePerson">
                      Löschen
                    </button>
                    <button type="submit" class="schutzen-save-btns" :disabled="!allFieldsValid">
                      Speichern
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
        <div class="divider"></div>
        <div class="selected-section" @dragover="dragOver" @drop="dropPerson">
          <div v-if="personsStore.selectedPersons.length === 0" class="placeholder">
            <p class="placeholder-text">Du hast noch keineN Urheber angelegt</p>
          </div>
          <div v-else v-for="person in personsStore.selectedPersons" :key="person.id"
            :class="['card', { 'selected': editingPersonId === person.id }]"
            :style="{ backgroundColor: person.backgroundColor }" draggable="true"
            @dragstart="dragStartSelected($event, person)" @dragend="dragEndSelected($event)">
            <div class="initials">{{ person.initials }}</div>
            <img src="@/assets/icons/dashboard/user/shadow.png" alt="Shadow" class="shadow" />
            <div class="schutzen-details-select">
              <div class="schutzen-text-container">
                <h4 class="name">
                  {{ truncateText(`${person.firstName} ${person.lastName}`) }}
                </h4>
                <p class="composer">{{ truncateText(person.composer) }}</p>
              </div>
              <div class="edit-icon" @click="editPerson(person)">
                <img src="@/assets/icons/dashboard/user/Edit.svg" class="edit-btn" alt="edit btn" />
              </div>
            </div>
          </div>
          <div v-if="
            personsStore.selectedPersons.length > 0 &&
            personsStore.selectedPersons.length < 9
          " class="placeholder"></div>
        </div>
      </div>
      <div class="button-container">
        <div class="nav-btn" @click="$emit('prev')">
          <span>Zurück</span>
        </div>
        <div class="next-btn" :class="{ disabled: personsStore.selectedPersons.length === 0 }"
          @click="personsStore.selectedPersons.length > 0 && $emit('next')">
          <span>Weiter</span>
        </div>
      </div>
    </StepLayout>
    <div class="favorite-section">
      <div class="schutzen-favorite">
        <div v-if="favoritesStore.persons.length === 0" class="schutzen-placeholder">
          <p class="schutzen-placeholder-text">Du hast noch keine Favoriten</p>
        </div>
        <div v-else v-for="person in favoritesStore.persons" :key="person.id" class="schutzen-card-fav"
          :style="{ backgroundColor: person.backgroundColor }" draggable="true" @dragstart="dragStart($event, person)"
          @dragend="dragEnd($event)" @dragover.prevent>
          <div class="initials">{{ person.initials }}</div>
          <img src="@/assets/icons/dashboard/user/shadow.png" alt="Shadow" class="shadow" />
          <div class="schutzen-details">
            <h4 class="name">
              {{ truncateText(`${person.firstName} ${person.lastName}`) }}
            </h4>
            <p class="composer">{{ truncateText(person.composer) }}</p>
          </div>
        </div>
        <div class="Fade-right"></div>
        <div class="Fade"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useStep2PersonsStore } from '@/stores/step2Persons';
import { useFavoritesStore } from '@/stores/favorites';
import StepLayout from '@/components/Layout2.vue';

defineProps({
  currentStep: {
    type: Number,
    required: true,
  },
});

const formData = ref({
  composer: '',
  firstName: '',
  lastName: '',
  street: '',
  streetNumber: '',
  postalCode: '',
  city: '',
  land: '',
});

const personsStore = useStep2PersonsStore();
const favoritesStore = useFavoritesStore();
const editingPersonId = ref(null);
const composerFocused = ref(false);
const landFocused = ref(false);
const isEditing = ref(false);

// إصلاح تنسيق الألوان (إزالة الفواصل الزائدة وتنسيق القيم بشكل صحيح)
const customColors = ref(['#CF7502', '#FE4042', '#B30037', '#F0559E', '#BC87CD', '#5C5FCB', '#0543D4', '#0C87C3', '#73CFC8', '#5ACD96', '#70C666', '#D0BF00']);

const windowWidth = ref(window.innerWidth);

const updateWindowWidth = () => {
  windowWidth.value = window.innerWidth;
};

onMounted(() => {
  window.addEventListener('resize', updateWindowWidth);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateWindowWidth);
});

const truncateText = (text, maxLength = 10) => {
  if (!text) return 'N/A';
  if (windowWidth.value >= 2100) return text;
  if (windowWidth.value <= 2099) return text;

  return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
};

const getRandomColor = () => {
  let newColor;
  do {
    const randomIndex = Math.floor(Math.random() * customColors.value.length);
    newColor = customColors.value[randomIndex];
  } while (newColor === personsStore.lastColor && customColors.value.length > 1);
  return newColor;
};

const validation = ref({
  composer: false,
  firstName: false,
  lastName: false,
  street: false,
  streetNumber: false,
  postalCode: false,
  city: false,
  land: false,
});

const steps = ref(['تحميل', 'معلمات', 'مراجعة', 'إكمال']);
const sectionTitle = ref('Urheber');
const sectionDescription = ref('Hier trägst Du alle beteiligten Urheber ein.');

watch(
  formData,
  (newData) => {
    validation.value.composer = newData.composer && newData.composer !== '';
    validation.value.firstName = newData.firstName.trim().length > 0;
    validation.value.lastName = newData.lastName.trim().length > 0;
    validation.value.street = newData.street.trim().length > 0;
    validation.value.streetNumber = newData.streetNumber.trim().length > 0;
    validation.value.postalCode = newData.postalCode.trim().length > 0;
    validation.value.city = newData.city.trim().length > 0;
    validation.value.land = newData.land && newData.land !== '';
  },
  { deep: true }
);

const allFieldsValid = computed(() => {
  return Object.values(validation.value).every((isValid) => isValid);
});

const selectOption = (field, value) => {
  formData.value[field] = value;
  if (field === 'composer') composerFocused.value = false;
  if (field === 'land') landFocused.value = false;
};

const addPerson = () => {
  if (allFieldsValid.value) {
    const initials = (
      formData.value.firstName.charAt(0) + formData.value.lastName.charAt(0)
    ).toUpperCase();
    const newPerson = {
      ...formData.value,
      id: Date.now(),
      initials: initials,
      backgroundColor: getRandomColor(),
    };
    personsStore.addPerson(newPerson);
    if (
      favoritesStore.persons.length < 9 &&
      !favoritesStore.persons.some((p) => p.id === newPerson.id)
    ) {
      favoritesStore.addToFavorites({ ...newPerson });
    }
    formData.value = {
      composer: '',
      firstName: '',
      lastName: '',
      street: '',
      streetNumber: '',
      postalCode: '',
      city: '',
      land: '',
    };
    editingPersonId.value = null;
    isEditing.value = false;
  }
};

const editPerson = (person) => {
  editingPersonId.value = person.id;
  formData.value = { ...person };
  isEditing.value = true;
};

const saveEdit = () => {
  if (!editingPersonId.value || !allFieldsValid.value) return;
  const updatedPerson = {
    ...formData.value,
    id: editingPersonId.value,
    initials: (
      formData.value.firstName.charAt(0) + formData.value.lastName.charAt(0)
    ).toUpperCase(),
    backgroundColor:
      personsStore.selectedPersons.find((p) => p.id === editingPersonId.value)
        ?.backgroundColor || getRandomColor(),
  };
  personsStore.editPerson(updatedPerson);
  formData.value = {
    composer: '',
    firstName: '',
    lastName: '',
    street: '',
    streetNumber: '',
    postalCode: '',
    city: '',
    land: '',
  };
  editingPersonId.value = null;
  isEditing.value = false;
};

const deletePerson = () => {
  if (!editingPersonId.value) return;
  personsStore.deletePerson(editingPersonId.value);
  formData.value = {
    composer: '',
    firstName: '',
    lastName: '',
    street: '',
    streetNumber: '',
    postalCode: '',
    city: '',
    land: '',
  };
  editingPersonId.value = null;
  isEditing.value = false;
};

const cancelEdit = () => {
  formData.value = {
    composer: '',
    firstName: '',
    lastName: '',
    street: '',
    streetNumber: '',
    postalCode: '',
    city: '',
    land: '',
  };
  editingPersonId.value = null;
  isEditing.value = false;
};

const dragStart = (event, person) => {
  event.dataTransfer.setData('personId', person.id);
  const cardElement = event.currentTarget;
  const rect = cardElement.getBoundingClientRect();
  const offsetX = event.clientX - rect.left - 5; // إضافة 5 بكسل للضبط
  const offsetY = event.clientY - rect.top + 150;
  event.dataTransfer.setDragImage(cardElement, offsetX, offsetY);
  cardElement.classList.add('dragging');
};

const dragEnd = (event) => {
  event.currentTarget.classList.remove('dragging');
};

const dragOver = (event) => {
  event.preventDefault();
};

const dropPerson = (event) => {
  event.preventDefault();
  const personId = event.dataTransfer.getData('personId');
  let person = favoritesStore.persons.find((p) => p.id === Number(personId));
  if (!person) {
    person = personsStore.selectedPersons.find((p) => p.id === Number(personId));
  }
  if (
    person &&
    personsStore.selectedPersons.length < 6 &&
    !personsStore.selectedPersons.some((p) => p.id === person.id)
  ) {
    personsStore.addPerson({
      ...person,
      backgroundColor: person.backgroundColor || getRandomColor(),
    });
  }
};

const dragStartSelected = (event, person) => {
  event.dataTransfer.setData('personId', person.id);
  const cardElement = event.currentTarget;
  const rect = cardElement.getBoundingClientRect();
  const offsetX = event.clientX - rect.left + 5; // إضافة 5 بكسل للضبط
  const offsetY = event.clientY - rect.top + 150;
  event.dataTransfer.setDragImage(cardElement, offsetX, offsetY);
  cardElement.classList.add('dragging');
};

const dragEndSelected = (event) => {
  event.currentTarget.classList.remove('dragging');
};
</script>






<style lang="scss" scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Heebo', sans-serif;
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  color: white;
  background: transparent;
  height: calc(100dvh - 71px - 50px);
}

.form-container {
  display: flex;
  align-items: flex-start;
  gap: 55px;
  align-self: stretch;
  min-height: 500px;
}

.form-component {
  display: flex;
  align-items: flex-start;
  align-content: flex-start;
  gap: 24px;
  align-self: stretch;
  flex-wrap: wrap;
  border-radius: 20px;
  box-sizing: border-box;
  max-width: 520px;
  z-index: 9;
  position: relative;
  right: -4px;
  top: 2px;
}

.schutzen-form {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 24px;
  flex: 1 0 0;
}

.form-title {
  align-self: stretch;
  color: #FFF;
  font-family: Heebo;
  font-size: 18px;
  font-weight: 300;
  line-height: 0.7;
  letter-spacing: 0.9px;
  text-transform: uppercase;
}

.schutzen-form-details {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
  align-self: stretch;
  min-height: 400px;
}

.schutzen-item {
  display: flex;
  padding: 14px 20px;
  justify-content: space-between;
  align-items: center;
  align-self: stretch;
  border-radius: 5px;
  background: var(--Main-Colors-Slate-Dark);
  position: relative;
  transition: .3s ease;
  height: 50px;
}

.item-input {
  flex: 0 0 90%;
  background: transparent;
  border: none;
  outline: none;
  color: var(--Main-Colors-Dove);
  font-family: Heebo;
  font-weight: 300;
  font-size: 20px;
  line-height: 1;
  letter-spacing: 1px;
  height: 20px;
  z-index: 2;
  padding-right: 20px;
}

.item-input.filled {
  color: #FFF;
  font-size: 20px;
  line-height: 1;
}

.item-input::placeholder {
  color: var(--Main-Colors-Dove);
  font-family: Heebo;
  font-size: 20px;
  font-weight: 300;
  line-height: 1;
  letter-spacing: 1px;
}

.schutzen-form-details .schutzen-item span img {
  width: 20px;
  height: 20px;
}

.schutzen-half {
  display: flex;
  align-items: center;
  gap: 20px;
  align-self: stretch;
  flex: 0 0 70%;
}

.schutzen-half-item {
  display: flex;
  padding: 14px 20px;
  justify-content: space-between;
  align-items: center;
  flex: 1 0 0;
  border-radius: 5px;
  background: var(--Main-Colors-Slate-Dark);
  position: relative;
  border: 1px solid transparent;
  height: 50px;
}

.schutzen-half-item .item-input,
.schutzen-half-item-small .item-input {
  width: 90%;
  padding-right: 25px;
}

.schutzen-half-item .checkmark,
.schutzen-half-item-small .checkmark {
  right: 10px;
}

.schutzen-half-item-small {
  display: flex;
  width: 33%;
  padding: 14px 20px;
  justify-content: space-between;
  align-items: center;
  border-radius: 5px;
  background: var(--Main-Colors-Slate-Dark);
  position: relative;
  height: 50px;
}

.small {
  width: 33%;
}

.divider {
  height: 100%;
  flex-shrink: 0;
  align-self: stretch;
  border-right: 1px solid #1B1C20;
  min-height: 450px;
}

.custom-select {
  position: relative;
  width: 100%;
  cursor: pointer;
  display: flex;
  padding: 14px;
  justify-content: space-between;
  align-items: center;
  align-self: stretch;
  border-radius: 5px;
  position: relative;
}

.select-button {
  color: var(--Main-Colors-Dove);
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: Heebo;
  font-size: 20px;
  font-weight: 300;
  line-height: 1;
  letter-spacing: 1px;
  width: 100%;
  height: 16px;
}

.select-button.filled {
  color: #FFF;
}

.custom-select.focused {
  background: var(--secondary);
  border: 1px solid var(--move);
  border-bottom: 0;
  border-bottom-right-radius: 0;
  border-bottom-left-radius: 0;
}

.options {
  position: absolute;
  top: 100%;
  left: -1px;
  right: -1px;
  background: var(--secondary);
  border-radius: 0 0 5px 5px;
  list-style: none;
  padding: 0;
  margin: 0;
  z-index: 1000;
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid var(--move);
  border-top: 0;
}

.options li {
  padding: 8px 20px;
  color: var(--Main-Colors-Dove);
  cursor: pointer;
  font-family: Heebo;
  font-size: 20px;
  font-weight: 300;
  line-height: 1;
}

.options li:hover {
  background: var(--move);
  color: #FFF;
}

.checkmark {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
}

.checkmark img {
  height: auto;
}

.schutzen-form-group-btn {
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: flex-end;
  gap: 24px;
  margin-top: 10px;
}

.schutzen-submit-btn {
  display: flex;
  padding: 12px 20px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  border-radius: 0.5rem;
  background-color: var(--move);
  color: #fff;
  border: none;
  outline: none;
  cursor: pointer;
  font-family: Heebo;
  font-size: 16px;
  font-weight: 400;
  line-height: 1;
  text-transform: uppercase;
  transition: background-color 0.3s ease;
}

.schutzen-submit-btn:hover {
  background-color: #990033;
}

.schutzen-submit-btn:disabled {
  background-color: #3a3e42;
  color: #6a6c6d;
  cursor: not-allowed;
}

.schutzen-submit-btn span {
  color: #fff;
  font-family: Heebo;
  font-size: 16px;
  font-weight: 400;
  line-height: 1;
  text-transform: uppercase;
}

.schutzen-edit-buttons {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  align-self: stretch;
}

.schutzen-right-edit {
  display: flex;
  align-items: flex-start;
  gap: 20px;
}

.schutzen-save-btns:hover, .schutzen-cancel-btn:hover {
  background-color: #990033;
}

.schutzen-save-btns {
  display: flex;
  padding: 12px 20px;
  justify-content: center;
  align-items: center;
  border-radius: 0.5rem;
  background: var(--move);
  color: #fff;
  border: none;
  outline: none;
  cursor: pointer;
  font-family: Heebo;
  font-size: 16px;
  font-weight: 400;
  line-height: 1;
  text-transform: uppercase;
  transition: background-color 0.3s ease;
}

.schutzen-save-btns:hover {
  background-color: #990033;
}

.schutzen-save-btns:disabled {
  background: #3a3e42;
  color: #6a6c6d;
  cursor: not-allowed;
}

.schutzen-cancel-btn {
  display: flex;
  padding: 12px 20px;
  justify-content: center;
  align-items: center;
  border-radius: 0.5rem;
  background: #3a3e42;
  color: #fff;
  border: none;
  outline: none;
  cursor: pointer;
  font-family: Heebo;
  font-size: 16px;
  font-weight: 400;
  line-height: 1;
  text-transform: uppercase;
  transition: background-color 0.3s ease;
}

.selected-section {
  display: flex;
  flex: 3 0 55%;
  width: clamp(730px, calc(730px + 5vw), 950px);
  align-items: flex-start;
  align-content: flex-start;
  gap: 20px;
  align-self: stretch;
  flex-wrap: wrap;
  border-radius: 20px;
  box-sizing: border-box;
  transition: .3s ease;
}

.card,
.placeholder {
  display: flex;
  width: 263px;
  height: 140px;
  padding: 20px;
  justify-content: space-between;
  align-items: flex-end;
  flex-shrink: 0;
  border-radius: 20px;
  position: relative;
  cursor: pointer;
  overflow: hidden;
  transition: opacity 0.3s, border 0.3s;
  flex: 0 0 calc(33.333% - 14px);
  box-sizing: border-box;
  border: 2px solid var(--secondary);
}

.placeholder {
  border: 1px dashed var(--Main-Colors-Slate-Light, #3A3E42);
  background: var(--Main-Colors-Slate, #26282D);
  display: flex;
  justify-content: center;
  align-items: center;
}

.schutzen-placeholder {
  display: flex;
  height: 140px;
  padding: 20px;
  justify-content: center;
  align-items: center;
  border-radius: 20px;
  border: 1px dashed var(--Main-Colors-Slate-Light);
  background: var(--Main-Colors-Slate);
}

.placeholder-text {
  color: var(--Main-Colors-Slate-Light, #3A3E42);
  text-align: center;
  font-family: Heebo;
  font-size: 14px;
  font-weight: 400;
  line-height: normal;
  letter-spacing: 0.7px;
  text-transform: uppercase;
}

.schutzen-placeholder-text {
  color: var(--Main-Colors-Slate-Light, #3A3E42);
  text-align: center;
  font-family: Heebo;
  font-size: 14px;
  font-weight: 400;
  line-height: 1;
  letter-spacing: 0.7px;
  text-transform: uppercase;
}

.card:hover {
  opacity: 0.9;
}

.card.selected {
  border: 2px solid var(--move);
}

.card.dragging, .schutzen-card-fav.dragging {
  opacity: 0.5;
}

.schutzen-card-fav {
  display: flex;
  width: 270px;
  height: 140px;
  padding: 20px;
  justify-content: space-between;
  align-items: flex-end;
  border-radius: 20px;
  position: relative;
  cursor: move;
  overflow: hidden;
  transition: opacity 0.3s, transform 0.2s;
}

.schutzen-card-fav:hover {
  opacity: 0.8;
  transform: scale(1.02);
}

.initials {
  position: absolute;
  top: -10px;
  left: 4px;
  color: #1B1C20;
  font-size: 180px;
  font-weight: 800;
  opacity: 0.5;
  line-height: 1;
  z-index: 1;
}

.shadow {
  position: absolute;
  bottom: -20px;
  left: -20px;
  opacity: 0.85;
  z-index: 2;
  object-fit: contain;
}

.schutzen-details-select {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: absolute;
  z-index: 10;
  width: 100%;
  bottom: 17px;
  left: 20px;
  line-height: 1;
  gap: 10px;
}

.schutzen-text-container {
  width: 75%;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.schutzen-details {
  position: relative;
  z-index: 3;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.name {
  color: #FFF;
  font-family: Heebo;
  font-size: 18px;
  font-weight: bold;
  text-transform: uppercase;
}

.composer {
  color: #FFF;
  font-family: Heebo;
  font-size: 16px;
  font-weight: 200;
  line-height: 1;
}

.edit-icon {
  position: absolute;
  right: 40px;
  opacity: 0;
  transition: opacity 0.3s;
}

.card:hover .edit-icon {
  opacity: 1;
}

.edit-btn {
  width: 24px;
}

.button-container {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  position: absolute;
  right: 30px;
  bottom: 30px;
}

.nav-btn {
  display: flex;
  height: 36px;
  padding: 17px 20px 18px 20px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  border-radius: 5px;
  background: var(--Main-Colors-Slate-Light, #3A3E42);
  cursor: pointer;
}

.nav-btn {
  color: var(--Main-Colors-Dove, #6A6C6D);
  font-family: Heebo;
  font-size: 16px;
  font-weight: 400;
  line-height: 1;
  text-transform: uppercase;
}

.nav-btn:hover,
.nav-btn span:hover {
  background-color: var(--dark-red);
  color: white;
  transition: .3s ease;
}

.next-btn {
  display: flex;
  height: 36px;
  padding: 17px 20px 18px 20px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  border-radius: 5px;
  background: var(--move);
  cursor: pointer;
}

.next-btn span {
  color: #fff;
  font-family: Heebo;
  font-size: 16px;
  font-weight: 400;
  line-height: 1;
  text-transform: uppercase;
}

.next-btn.disabled {
  background-color: #3A3E42;
  color: #6A6C6D;
  cursor: not-allowed;
}

.next-btn.disabled:hover {
  background-color: #3A3E42;
}

.next-btn:hover {
  background-color: #990033;
  transition: .3s ease;
}

.favorite-section {
  display: flex;
  padding: 20px 30px;
  flex-direction: column;
  justify-content: center;
  align-items: start;
  gap: 20px;
  align-self: stretch;
  border-radius: 20px;
  background: var(--Main-Colors-Slate);
  position: relative; /* ضروري لتثبيت .Fade و .Fade-right */
  overflow-x: auto;
  scroll-behavior: smooth;
}

.favorite-section::-webkit-scrollbar {
  display: none; /* إخفاء شريط التمرير */
}

.schutzen-favorite {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 0px 0px;
  position: relative;
  z-index: 1;
  flex-shrink: 0;
}

.schutzen-favorite::-webkit-scrollbar {
  display: none; /* إخفاء شريط التمرير */
}

.Fade {
  width: 70px;
  height: 180px;
  position: sticky; /* تغيير من sticky إلى absolute */
  top: 0; /* تثبيت القيمة */
  right: -31px; /* تعديل إلى right: 0 بدلاً من right: -32px لتجنب الإزاحة */
  border-radius: 0 20px 20px 0;
  background: linear-gradient(270deg, var(--Main-Colors-Slate, #26282D) 0%, rgba(38, 40, 45, 0.00) 100%);
  z-index: 2;
  pointer-events: none;
}
.Fade-right {
  width: 70px;
  height: 180px;
  position: absolute;
  top: 0; /* تثبيت القيمة */
  left: -31px;
  border-radius: 20px 0 0 20px;
  background: linear-gradient(270deg, rgba(38, 40, 45, 0.00) 0%, var(--Main-Colors-Slate, #26282D) 100%);
  z-index: 2;
  pointer-events: none;
}

[draggable="true"] {
  cursor: move;
}

input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus,
input:-webkit-autofill:active {
  -webkit-box-shadow: 0 0 0 1000px var(--Main-Colors-Slate-Dark) inset !important;
  -webkit-text-fill-color: white !important;
  caret-color: white !important;
}

@media (min-height: 0px) and (max-height: 950px) {
  .main-content {
    overflow-y: auto;
    height: auto;
    // scroll-behavior: smooth;
  }

  .form-container {
    min-height: calc(100dvh - 71px - 50px - 390px);
  }
}

@media (min-height: 951px) {
  .main-content {
    height: calc(100dvh - 71px - 50px);
    overflow-y: auto;
  }

  .form-container {
    // height: calc(100dvh - 71px - 50px - 390px);
  }
}

@media (min-height: 1000px) {
  .form-container {
    // height: calc(100dvh - 71px - 50px - 50px);
  }
}

@media (min-height: 1200px) {
  .form-container {
    height: calc(100dvh - 71px - 50px - 460px);
  }
}

@media (min-width: 1440px) and (max-width: 1599px) {
  .form-component {
    width: 400px;
    flex-shrink: 0;
  }

  .schutzen-form-details .schutzen-item,
  .schutzen-half-item,
  .schutzen-half-item-small {
    padding: 8px 20px;
    height: 54px;
    width: 100%;
  }

  .schutzen-right-edit {
    gap: 20px;
  }

  .schutzen-edit-buttons {
    gap: 0px;
  }

  .schutzen-cancel-btn {
    padding: 12px 20px;
    gap: 10px;
  }

  .schutzen-half-item {
    width: 200px;
  }

  .schutzen-half-item-small {
    width: 35%;
  }

  .selected-section {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
    width: 100%;
    border-radius: 20px;
    box-sizing: border-box;
  }

  .card,
  .placeholder {
    display: flex;
    width: 100%;
    height: 110px;
    padding: 15px;
    justify-content: space-between;
    align-items: flex-end;
    border-radius: 15px;
    position: relative;
    cursor: pointer;
    overflow: hidden;
    transition: all 0.3s ease;
    flex: 0 0 auto;
    box-sizing: border-box;
  }

  .placeholder {
    border: 1px dashed var(--Main-Colors-Slate-Light, #3A3E42);
    background: var(--Main-Colors-Slate, #26282D);
    align-items: center;
  }

  .form-container {
    gap: 33px;
  }
}

@media (min-width: 1600px) and (max-width: 2074px) {
  .form-container {
    gap: clamp(62px, calc(62px + 20 * (100vw - 1600px) / 474), 82px);
    padding-top: 15px;
  }

  .schutzen-form {
    width: clamp(366px, calc(366px + 1vw), 500px);
    max-width: 570px;
  }

  .schutzen-form-details .schutzen-item,
  .schutzen-half-item,
  .schutzen-half-item-small {
    padding: 14px 20px;
  }

  .small {
    // width: auto;
  }

  .selected-section {
    display: grid;
    grid-template-columns: repeat(3, minmax(205px, 1fr));
    gap: 20px;
    width: 100%;
    max-width: 1100px;
    margin: 0 auto;
    border-radius: 20px;
    box-sizing: border-box;
  }

  .card,
  .placeholder {
    width: 100%;
    max-width: 310px;
    height: 140px;
    padding: 15px;
    border-radius: 15px;
    position: relative;
    cursor: pointer;
    overflow: hidden;
    transition: all 0.3s ease;
    box-sizing: border-box;
  }

  .placeholder {
    border: 1px dashed var(--Main-Colors-Slate-Light, #3A3E42);
    background: var(--Main-Colors-Slate, #26282D);
  }

  .form-container {
    margin-top: 10px;
  }
}

@media (min-width: 2075px) and (max-width: 2560px) {
  .form-container {
    gap: clamp(80px, calc(80px + 20 * (100vw - 2075px) / 485), 20px);
    flex-direction: row;
    align-items: flex-start;
    // overflow-y: auto;
    margin-top: 30px;
  }

  .form-component {
    max-width: 520px;
  }

  .selected-section {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    width: 100%;
    max-width: none;
    gap: 20px;
    height: auto;
    align-content: flex-start;
  }

  .card,
  .placeholder {
    width: 100%;
    max-width: 380px;
    height: 180px;
    padding: 15px;
    border-radius: 15px;
    position: relative;
    cursor: pointer;
    overflow: hidden;
    transition: all 0.3s ease;
    box-sizing: border-box;
  }

  .placeholder {
    border: 1px dashed var(--Main-Colors-Slate-Light, #3A3E42);
    background: var(--Main-Colors-Slate, #26282D);
  }
}

@media (min-width: 2560px) {
  .form-container {
    gap: auto;
  }

  .card,
  .placeholder {
    width: auto;
    max-width: auto;
    height: 180px;
    padding: 15px;
    border-radius: 15px;
    position: relative;
    cursor: pointer;
    overflow: hidden;
    transition: all 0.3s ease;
    box-sizing: border-box;
  }

  .placeholder {
    border: 1px dashed var(--Main-Colors-Slate-Light, #3A3e42);
    background: var(--Main-Colors-Slate, #26282D);
  }
}
</style>



