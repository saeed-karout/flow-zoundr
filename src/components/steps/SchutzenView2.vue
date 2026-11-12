<template>
  <div class="main-content">
    <StepLayout :current-step="2" :steps="steps" :section-title="sectionTitle"
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
                  :class="{ 'filled': formData.firstName }" placeholder="Vorname" :disabled="isLoading" />
                <span class="checkmark" v-show="validation.firstName && !isEditing">
                  <img src="@/assets/icons/y.png" alt="completed" />
                </span>
              </div>
              <!-- حقل Nachname -->
              <div class="schutzen-item">
                <input v-model="formData.lastName" type="text" class="item-input"
                  :class="{ 'filled': formData.lastName }" placeholder="Nachname" :disabled="isLoading" />
                <span class="checkmark" v-show="validation.lastName && !isEditing">
                  <img src="@/assets/icons/y.png" alt="completed" />
                </span>
              </div>
              <!-- حقل Straße و Nr. -->
              <div class="schutzen-half">
                <div class="schutzen-half-item">
                  <input v-model="formData.street" type="text" class="item-input" :class="{ 'filled': formData.street }"
                    placeholder="Straße" :disabled="isLoading" />
                  <span class="checkmark" v-show="validation.street && !isEditing">
                    <img src="@/assets/icons/y.png" alt="completed" />
                  </span>
                </div>
                <div class="schutzen-half-item-small">
                  <input v-model="formData.streetNumber" type="text" class="item-input"
                    :class="{ 'filled': formData.streetNumber }" placeholder="Nr." :disabled="isLoading" />
                  <span class="checkmark" v-show="validation.streetNumber && !isEditing">
                    <img src="@/assets/icons/y.png" alt="completed" />
                  </span>
                </div>
              </div>
              <!-- حقل PLZ و Ort -->
              <div class="schutzen-half">
                <div class="schutzen-half-item-small small">
                  <input v-model="formData.postalCode" type="text" class="item-input"
                    :class="{ 'filled': formData.postalCode }" placeholder="PLZ" :disabled="isLoading" />
                  <span class="checkmark" v-show="validation.postalCode && !isEditing">
                    <img src="@/assets/icons/y.png" alt="completed" />
                  </span>
                </div>
                <div class="schutzen-half-item">
                  <input v-model="formData.city" type="text" class="item-input" :class="{ 'filled': formData.city }"
                    placeholder="Ort" :disabled="isLoading" />
                  <span class="checkmark" v-show="validation.city && !isEditing">
                    <img src="@/assets/icons/y.png" alt="completed" />
                  </span>
                </div>
              </div>
              <!-- حقل Land -->
              <div class="schutzen-item">
                <input v-model="formData.land" type="text" class="item-input" :class="{ 'filled': formData.land }"
                  placeholder="Land" :disabled="isLoading" />
                <span class="checkmark" v-show="validation.land && !isEditing">
                  <img src="@/assets/icons/y.png" alt="completed" />
                </span>
              </div>
              <!-- أزرار النموذج -->
              <div class="schutzen-form-group-btn">
                <button v-if="!editingPersonId" type="submit" class="schutzen-submit-btn"
                  :disabled="!allFieldsValid || isLoading">
                  <span>{{ isLoading ? ' HINZUFÜGEN' : 'HINZUFÜGEN' }}</span>
                </button>
                <div v-else class="schutzen-edit-buttons">
                  <button type="button" class="schutzen-cancel-btn" @click="cancelEdit" :disabled="isLoading">
                    ZURÜCK
                  </button>
                  <div class="schutzen-right-edit">
                    <button type="button" class="schutzen-cancel-btn" @click="deletePerson" :disabled="isLoading">
                      Löschen
                    </button>
                    <button type="submit" class="schutzen-save-btns" :disabled="!allFieldsValid || isLoading">
                      <span>{{ isLoading ? "Speichern" : 'Speichern' }}</span>
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
        <div class="divider"></div>
        <div class="selected-section" @dragover="dragOver" @drop="dropPerson" :class="{ 'disabled': isLoading }">
          <div v-if="fetchCurrent.length === 0" class="placeholder">
            <p class="placeholder-text">Du hast noch keineN Urheber angelegt</p>
          </div>
          <div v-else v-for="person in fetchCurrent" :key="person.id"
            :class="['card', { 'selected': editingPersonId === person.id }]"
            :style="{ backgroundColor: person.color }" draggable="!isLoading"
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
            fetchCurrent.length > 0 &&
            fetchCurrent.length < 6
          " class="placeholder"></div>
        </div>
      </div>
      <div class="button-container">
        <div class="nav-btn" @click="$emit('prev')" :class="{ 'disabled': isLoading }">
          <span>Zurück</span>
        </div>
        <div class="next-btn" :class="{ disabled: fetchCurrent.length === 0 || isLoading }"
          @click="fetchCurrent.length > 0 && !isLoading && $emit('next')">
          <span>Weiter</span>
        </div>
      </div>
    </StepLayout>
    <div class="favorite-section" ref="favoriteContainer">
  <div class="schutzen-favorite" :class="{ 'disabled': isLoading }">
    <div class="Fade-right"></div>
    <div v-if="fetchFavorite.length === 0" class="schutzen-placeholder">
      <p class="schutzen-placeholder-text">Du hast noch keine Favoriten</p>
    </div>
    <div v-else v-for="person in fetchFavorite" :key="person.id" class="schutzen-card-fav"
      :style="{ backgroundColor: person.color }" draggable="!isLoading" @dragstart="dragStart($event, person)"
      @dragend="dragEnd($event)" @dragover="dragOverFavorite($event, person)" @drop="dropFavorite($event, person)">
      <div class="initials">{{ person.initials }}</div>
      <img src="@/assets/icons/dashboard/user/shadow.png" alt="Shadow" class="shadow" />
      <div class="schutzen-details">
        <h4 class="name">
          {{ truncateText(`${person.firstName} ${person.lastName}`) }}
        </h4>
        <p class="composer">{{ truncateText(person.composer) }}</p>
      </div>
    </div>
    <div v-if="fetchFavorite.length > 0 && fetchFavorite.length < 9" class="schutzen-placeholder"></div>
    <div class="Fade"></div>
  </div>
</div>
  </div>
</template>



<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import StepLayout from '@/components/Layout2.vue';
import apiRequest from '@/lib/apiRequest';

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

const fetchFavorite = ref([]);
const fetchCurrent = ref([]);
const editingPersonId = ref(null);
const composerFocused = ref(false);
const landFocused = ref(false);
const isEditing = ref(false);
const draggedPerson = ref(null);
const isLoading = ref(false);

const windowWidth = ref(window.innerWidth);

const updateWindowWidth = () => {
  windowWidth.value = window.innerWidth;
};

onMounted(() => {
  window.addEventListener('resize', updateWindowWidth);
  fetchAuthors();
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

const steps = ref(['1', '2', '3', '4']);
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

const resetForm = () => {
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
  console.log('Form reset:', JSON.stringify(formData.value, null, 2));
};

const fetchAuthors = async () => {
  try {
    isLoading.value = true;
    const response = await apiRequest.get('/authors');
    console.log('GET /authors response:', JSON.stringify(response.data.data, null, 2));

    const newFavorites = [];
    const newCurrent = [];

    response.data.data.forEach((author) => {
      const person = {
        id: author.id,
        composer: author.composer || 'Komponist',
        firstName: author.first_name || '',
        lastName: author.last_name || '',
        street: author.street_name || '',
        streetNumber: author.street_number || '',
        postalCode: author.postal_code || '',
        city: author.city || '',
        land: author.country || '',
        initials: ((author.first_name || '').charAt(0) + (author.last_name || '').charAt(0)).toUpperCase(),
        color: author.color || '#FFFFFF',
        favorite: author.favorite || 0,
        current: author.current || 0,
      };

      if (person.favorite > 0 && newFavorites.length < 9) {
        newFavorites.push(person);
      }
      if (person.current === 1) {
        newCurrent.push(person);
      }
    });

    newFavorites.sort((a, b) => a.favorite - b.favorite);

    fetchFavorite.value = [...newFavorites];
    fetchCurrent.value = [...newCurrent];
    console.log('Updated fetchCurrent:', JSON.stringify(fetchCurrent.value, null, 2));
    console.log('Updated fetchFavorite:', JSON.stringify(fetchFavorite.value, null, 2));
  } catch (error) {
    console.error('Failed to fetch authors:', error);
  } finally {
    isLoading.value = false;
  }
};

const addPerson = async () => {
  if (!allFieldsValid.value || isLoading.value) return;
  isLoading.value = true;

  const newPerson = {
    ...formData.value,
    favorite: 0,
    current: 1,
    color: '#FFFFFF',
    initials: (formData.value.firstName.charAt(0) + formData.value.lastName.charAt(0)).toUpperCase(),
  };

  try {
    const response = await apiRequest.post('/authors', {
      composer: newPerson.composer,
      first_name: newPerson.firstName,
      last_name: newPerson.lastName,
      street_name: newPerson.street,
      street_number: newPerson.streetNumber,
      postal_code: newPerson.postalCode,
      city: newPerson.city,
      country: newPerson.land,
      favorite: newPerson.favorite,
      current: newPerson.current,
      color: newPerson.color,
    });
    console.log('POST /authors full response:', JSON.stringify(response, null, 2));

    if (response.status === 200 || response.status === 201) {
      // Access id assuming response.data.id (adjust based on actual structure)
      const authorId = response.data?.id;
      if (!authorId) {
        throw new Error('Author ID not found in POST response');
      }

      resetForm();

      if (fetchFavorite.value.length < 9) {
        const newFavoriteValue = fetchFavorite.value.length + 1;
        await apiRequest.put(`/authors/${authorId}`, {
          ...newPerson,
          id: authorId,
          favorite: newFavoriteValue,
        });
        console.log('PUT /authors for favorite:', { id: authorId, favorite: newFavoriteValue });
      }

      await fetchAuthors();
    } else {
      console.warn(`Unexpected status code: ${response.status}`);
    }
  } catch (error) {
    console.error('Failed to add person:', error);
  } finally {
    isLoading.value = false;
  }
};

const editPerson = (person) => {
  if (!isLoading.value) {
    editingPersonId.value = person.id;
    formData.value = { ...person };
    isEditing.value = true;
  }
};

const saveEdit = async () => {
  if (!editingPersonId.value || !allFieldsValid.value || isLoading.value) return;
  isLoading.value = true;
  const updatedPerson = {
    ...formData.value,
    id: editingPersonId.value,
    initials: (
      formData.value.firstName.charAt(0) + formData.value.lastName.charAt(0)
    ).toUpperCase(),
    color: fetchCurrent.value.find((p) => p.id === editingPersonId.value)?.color || '#FFFFFF',
    favorite: fetchFavorite.value.find((p) => p.id === editingPersonId.value)?.favorite || 0,
    current: 1,
  };

  try {
    await apiRequest.put(`/authors/${editingPersonId.value}`, {
      composer: updatedPerson.composer,
      first_name: updatedPerson.firstName,
      last_name: updatedPerson.lastName,
      street_name: updatedPerson.street,
      street_number: updatedPerson.streetNumber,
      postal_code: updatedPerson.postalCode,
      city: updatedPerson.city,
      country: updatedPerson.land,
      favorite: updatedPerson.favorite,
      current: updatedPerson.current,
      color: updatedPerson.color,
    });

    resetForm();
    await fetchAuthors();
  } catch (error) {
    console.error('Failed to save edit:', error);
  } finally {
    isLoading.value = false;
  }
};

const deletePerson = async () => {
  if (!editingPersonId.value || isLoading.value) return;
  isLoading.value = true;
  try {
    const person = fetchCurrent.value.find((p) => p.id === editingPersonId.value);
    if (person) {
      await apiRequest.put(`/authors/${editingPersonId.value}`, {
        ...person,
        current: 0,
      });
      console.log('PUT /authors for removal:', { id: editingPersonId.value, current: 0 });
    }
    resetForm();
    await fetchAuthors();
  } catch (error) {
    console.error('Failed to remove person:', error);
  } finally {
    isLoading.value = false;
  }
};

const cancelEdit = () => {
  if (!isLoading.value) {
    resetForm();
  }
};

const dragStart = (event, person) => {
  if (!isLoading.value) {
    event.dataTransfer.setData('personId', person.id);
    draggedPerson.value = person;

    // إنشاء نسخة من الكارد بدون صورة الظل
    const cardElement = event.currentTarget;
    const clone = cardElement.cloneNode(true);
    const shadow = clone.querySelector('.shadow');
    if (shadow) {
      // إزالة صورة الظل من النسخة
    }

    // إضافة النسخة إلى الـ DOM مؤقتًا لاستخدامها كصورة السحب
    clone.style.position = 'absolute';
    clone.style.top = '-9999px';
    document.body.appendChild(clone);

    // تعيين النسخة كصورة السحب
    const rect = cardElement.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const offsetY = event.clientY - rect.top + 160;
    event.dataTransfer.setDragImage(clone, offsetX, offsetY);

    // إزالة النسخة بعد تعيينها
    setTimeout(() => document.body.removeChild(clone), 0);

    // ضبط تأثير السحب ليكون "move" لمنع إشارة "+"
    event.dataTransfer.effectAllowed = 'move';

    cardElement.classList.add('dragging');
  }
};

const dragEnd = (event) => {
  event.currentTarget.classList.remove('dragging');
  draggedPerson.value = null;
};

const dragOver = (event) => {
  if (!isLoading.value) {
    event.preventDefault();
  }
};

const dragOverFavorite = (event, person) => {
  if (!isLoading.value) {
    event.preventDefault();
  }
};

const dropPerson = async (event) => {
  event.preventDefault();
  if (isLoading.value) return;
  isLoading.value = true;
  const personId = event.dataTransfer.getData('personId');
  let person = fetchFavorite.value.find((p) => p.id === Number(personId));
  if (!person) {
    person = fetchCurrent.value.find((p) => p.id === Number(personId));
  }
  if (
    person &&
    fetchCurrent.value.length < 6 &&
    !fetchCurrent.value.some((p) => p.id === person.id)
  ) {
    try {
      await apiRequest.put(`/authors/${person.id}`, {
        ...person,
        current: 1,
      });
      console.log('PUT /authors for current:', { id: person.id, current: 1 });
      await fetchAuthors();
    } catch (error) {
      console.error('Failed to update person current status:', error);
    } finally {
      isLoading.value = false;
    }
  } else {
    isLoading.value = false;
  }
};

const dropFavorite = async (event, targetPerson) => {
  event.preventDefault();
  if (!draggedPerson.value || draggedPerson.value.id === targetPerson.id || isLoading.value) return;
  isLoading.value = true;

  const draggedId = draggedPerson.value.id;
  const draggedFavorite = draggedPerson.value.favorite;
  const targetFavorite = targetPerson.favorite;

  console.log('Reordering favorites:', {
    dragged: { id: draggedId, favorite: draggedFavorite },
    target: { id: targetPerson.id, favorite: targetFavorite },
  });

  try {
    let newDraggedFavorite = targetFavorite;
    if (draggedFavorite < targetFavorite) {
      newDraggedFavorite = targetFavorite;
    } else {
      newDraggedFavorite = targetFavorite;
    }

    await apiRequest.put(`/authors/${draggedId}`, {
      ...draggedPerson.value,
      favorite: newDraggedFavorite,
    });

    const affectedFavorites = fetchFavorite.value.filter(
      (p) => p.id !== draggedId && p.favorite >= Math.min(draggedFavorite, targetFavorite) && p.favorite <= Math.max(draggedFavorite, targetFavorite)
    );

    for (const person of affectedFavorites) {
      let newFavorite = person.favorite;
      if (draggedFavorite < targetFavorite) {
        if (person.favorite <= targetFavorite) {
          newFavorite = person.favorite - 1;
        }
      } else {
        if (person.favorite >= targetFavorite) {
          newFavorite = person.favorite + 1;
        }
      }

      if (newFavorite !== person.favorite) {
        await apiRequest.put(`/authors/${person.id}`, {
          ...person,
          favorite: newFavorite,
        });
      }
    }

    console.log('Favorites after reorder:', fetchFavorite.value.map(p => ({ id: p.id, favorite: p.favorite })));
    await fetchAuthors();
  } catch (error) {
    console.error('Failed to reorder favorite:', error);
  } finally {
    isLoading.value = false;
  }
};


const dragStartSelected = (event, person) => {
  if (!isLoading.value) {
    event.dataTransfer.setData('personId', person.id);
    draggedPerson.value = person;

    // إنشاء نسخة من الكارد بدون صورة الظل
    const cardElement = event.currentTarget;
    const clone = cardElement.cloneNode(true);
    const shadow = clone.querySelector('.shadow');
    if (shadow) {
      // إزالة صورة الظل من النسخة
    }

    // إضافة النسخة إلى الـ DOM مؤقتًا لاستخدامها كصورة السحب
    clone.style.position = 'absolute';
    clone.style.top = '-9999px';
    document.body.appendChild(clone);

    // تعيين النسخة كصورة السحب
    const rect = cardElement.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const offsetY = event.clientY - rect.top + 160;
    event.dataTransfer.setDragImage(clone, offsetX, offsetY);

    // إزالة النسخة بعد تعيينها
    setTimeout(() => document.body.removeChild(clone), 0);

    // ضبط تأثير السحب ليكون "move" لمنع إشارة "+"
    event.dataTransfer.effectAllowed = 'move';

    cardElement.classList.add('dragging');
  }
};

const dragEndSelected = (event) => {
  event.currentTarget.classList.remove('dragging');
  draggedPerson.value = null;
};

const favoriteContainer = ref(null);
let isDragging = false;
let startX = 0;
let scrollLeft = 0;

const handleTouchStart = (e) => {
  if (isLoading.value) return;
  isDragging = true;
  startX = e.touches[0].pageX - scrollLeft;
  favoriteContainer.value.style.scrollBehavior = 'auto';
};

const handleTouchMove = (e) => {
  if (!isDragging || isLoading.value) return;
  e.preventDefault();
  const x = e.touches[0].pageX;
  scrollLeft = x - startX;
  favoriteContainer.value.scrollLeft = scrollLeft * -1;
};

const handleTouchEnd = () => {
  if (isLoading.value) return;
  isDragging = false;
  favoriteContainer.value.style.scrollBehavior = 'smooth';
};

const handleWheel = (e) => {
  if (isLoading.value) return;
  e.preventDefault();
  const delta = e.deltaY || e.detail || e.wheelDelta;
  favoriteContainer.value.scrollLeft += delta * 0.5;
};

onMounted(() => {
  window.addEventListener('resize', updateWindowWidth);
  if (favoriteContainer.value) {
    favoriteContainer.value.addEventListener('touchstart', handleTouchStart, { passive: false });
    favoriteContainer.value.addEventListener('touchmove', handleTouchMove, { passive: false });
    favoriteContainer.value.addEventListener('touchend', handleTouchEnd);
    favoriteContainer.value.addEventListener('wheel', handleWheel, { passive: false });
  }
});

onUnmounted(() => {
  window.removeEventListener('resize', updateWindowWidth);
  if (favoriteContainer.value) {
    favoriteContainer.value.removeEventListener('touchstart', handleTouchStart);
    favoriteContainer.value.removeEventListener('touchmove', handleTouchMove);
    favoriteContainer.value.removeEventListener('touchend', handleTouchEnd);
    favoriteContainer.value.removeEventListener('wheel', handleWheel);
  }
});
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
  min-height: calc(100dvh - 71px - 50px);
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
  width: 270px;
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
  align-items: flex-start;
  gap: 20px;
  align-self: stretch;
  border-radius: 20px;
  background: var(--Main-Colors-Slate, #26282D);
  position: relative;
  overflow-x: auto;
  overflow-y: hidden;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  touch-action: pan-x; /* السماح بالتمرير الأفقي فقط */
}

/* فايرفوكس لا يعرف ::-webkit-scrollbar — يخفيه scrollbar-width. */
.favorite-section {
  scrollbar-width: none;
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

/* إخفاء شريط التمرير في فايرفوكس أيضاً — ::-webkit-scrollbar خاصّ بكروم وسفاري. */
.schutzen-favorite {
  scrollbar-width: none;
  -ms-overflow-style: none;
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

/* :autofill المعياريّة لفايرفوكس؛ البادئة لكروم وسفاري. */
input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus,
input:-webkit-autofill:active,
input:autofill,
input:autofill:hover,
input:autofill:focus,
input:autofill:active {
  -webkit-box-shadow: 0 0 0 1000px var(--Main-Colors-Slate-Dark) inset !important;
  box-shadow: 0 0 0 1000px var(--Main-Colors-Slate-Dark) inset !important;
  color: white !important;
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
    // min-height: calc(100dvh - 71px - 50px - 390px);
  }
}

@media (min-height: 951px) {
  .main-content {
    // height: calc(100dvh - 71px - 50px);
    overflow-y: auto;
    height: auto;
  }

  .form-container {
    // height: calc(100dvh - 71px - 50px - 390px);
  }
}

@media (min-height: 1000px) {
  .form-container {
    // height: calc(100dvh - 71px - 50px - 50px);
  }
  .main-content{
    height: auto;
  }
}

@media (min-height: 1200px) {
  .form-container {
    // height: calc(100dvh - 71px - 50px - 460px);
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
    // margin-top: 10px;
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



