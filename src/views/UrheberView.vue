
<template>
  <div class="main">
    <div class="primary">
      <div class="schutzen-container">
        <SchutzenHeader title="Die UrHeber"
          description="Hier siehst Du alle angelegten Urheber und kannst diese bearbeiten, oder einen Neuen Urheber anlegen." />
        <div class="schutzen-content">
          <div class="Urheber1">
            <div class="schutzen-form">
              <p>Neuen Urheber Anlegen</p>
              <form @submit.prevent="editingPersonId ? saveEdit() : addPerson()" class="schutzen-form-details">
                <div class="schutzen-item custom-select" @click="composerFocused = !composerFocused"
                  :class="{ 'focused': composerFocused }">
                  <div class="select-button" :class="{ 'filled': formData.composer }">
                    {{ formData.composer || 'Bitte wählen' }}
                    <span class="checkmark">
                      <img v-if="validation.composer && !isEditing" src="../assets/icons/y.png" alt="completed" />
                      <svg v-else xmlns="http://www.w3.org/2000/svg" width="12" height="22" viewBox="0 0 12 22"
                        fill="none">
                        <path
                          d="M6.75349 0.393499C6.37575 -0.131167 5.62425 -0.131166 5.2465 0.3935L0.192358 7.41338C-0.277267 8.06566 0.166457 9 0.945854 9L11.0541 9C11.8335 9 12.2773 8.06566 11.8076 7.41338L6.75349 0.393499Z"
                          :fill="composerFocused ? '#FFFFFF' : '#6A6C6D'" />
                        <path
                          d="M6.75349 21.6065C6.37575 22.1312 5.62425 22.1312 5.2465 21.6065L0.192358 14.5866C-0.277267 13.9343 0.166457 13 0.945854 13L11.0541 13C11.8335 13 12.2773 13.9343 11.8076 14.5866L6.75349 21.6065Z"
                          :fill="composerFocused ? '#FFFFFF' : '#6A6C6D'" />
                      </svg>
                    </span>
                  </div>
                  <ul class="options" v-if="composerFocused" @click.stop>
                    <li @click.stop="selectOption('composer', 'Komponist')">Komponist</li>
                    <li @click.stop="selectOption('composer', 'Textdichter')">Textdichter</li>
                    <li @click.stop="selectOption('composer', 'Komponist und Textdichter')">Komponist und Textdichter
                    </li>
                    <li @click.stop="selectOption('composer', 'Arrangeur')">Arrangeur</li>
                  </ul>
                </div>
                <div class="schutzen-item">
                  <input v-model="formData.firstName" type="text" class="item-input"
                    :class="{ 'filled': formData.firstName }" placeholder="Vorname" :disabled="isLoading" />
                  <span class="checkmark" v-if="validation.firstName && !isEditing">
                    <img src="../assets/icons/y.png" alt="completed" />
                  </span>
                </div>
                <div class="schutzen-item">
                  <input v-model="formData.lastName" type="text" class="item-input"
                    :class="{ 'filled': formData.lastName }" placeholder="Nachname" :disabled="isLoading" />
                  <span class="checkmark" v-if="validation.lastName && !isEditing">
                    <img src="../assets/icons/y.png" alt="completed" />
                  </span>
                </div>
                <div class="schutzen-half">
                  <div class="schutzen-half-item">
                    <input v-model="formData.street" type="text" class="item-input"
                      :class="{ 'filled': formData.street }" placeholder="Straße" :disabled="isLoading" />
                    <span class="checkmark" v-if="validation.street && !isEditing">
                      <img src="../assets/icons/y.png" alt="completed" />
                    </span>
                  </div>
                  <div class="schutzen-half-item-small">
                    <input v-model="formData.streetNumber" type="text" class="item-input"
                      :class="{ 'filled': formData.streetNumber }" placeholder="Nr." :disabled="isLoading" />
                    <span class="checkmark" v-if="validation.streetNumber && !isEditing">
                      <img src="../assets/icons/y.png" alt="completed" />
                    </span>
                  </div>
                </div>
                <div class="schutzen-half">
                  <div class="schutzen-half-item-small small">
                    <input v-model="formData.postalCode" type="text" class="item-input"
                      :class="{ 'filled': formData.postalCode }" placeholder="PLZ" :disabled="isLoading" />
                    <span class="checkmark" v-if="validation.postalCode && !isEditing">
                      <img src="../assets/icons/y.png" alt="completed" />
                    </span>
                  </div>
                  <div class="schutzen-half-item">
                    <input v-model="formData.city" type="text" class="item-input" :class="{ 'filled': formData.city }"
                      placeholder="Ort" :disabled="isLoading" />
                    <span class="checkmark" v-if="validation.city && !isEditing">
                      <img src="../assets/icons/y.png" alt="completed" />
                    </span>
                  </div>
                </div>
                <div class="schutzen-item">
                  <input v-model="formData.land" type="text" class="item-input"
                    :class="{ 'filled': formData.land }" placeholder="Land" :disabled="isLoading" />
                  <span class="checkmark" v-if="validation.land && !isEditing">
                    <img src="../assets/icons/y.png" alt="completed" />
                  </span>
                </div>
                <div class="schutzen-form-group-btn">
                  <button v-if="!editingPersonId" type="submit" class="schutzen-submit-btn"
                    :disabled="!allFieldsValid || isLoading">
                    <span>{{ isLoading ? 'HINZUFÜGEN' : 'HINZUFÜGEN' }}</span>
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
                        Speichern
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>

          <div class="Urheber2" @dragover="dragOver" @drop="dropPerson">
            <div v-if="fetchCurrent.length === 0" class="schutzen-placeholder">
              <p class="schutzen-placeholder-text">Du hast noch keineN Urheber angelegt</p>
            </div>
            <div v-else v-for="person in fetchCurrent" :key="person.id"
              :class="['schutzen-card', { 'selected': editingPersonId === person.id }]"
              :style="{ backgroundColor: person.color }" draggable="true"
              @dragstart="dragStart($event, person)" @dragend="dragEnd($event)" @dragover="dragOver">
              <div class="initials">{{ person.initials }}</div>
              <img src="../assets/icons/dashboard/user/shadow.png" alt="Shadow" class="shadow">
              <div class="schutzen-details-select">
                <div class="schutzen-text-container">
                  <h4 class="name">{{ truncateText(`${person.firstName} ${person.lastName}`) }}</h4>
                  <div class="composer">
                    {{ truncateText(person.composer, 10) }}
                  </div>
                </div>
                <div class="edit-icon" @click="editPerson(person)">
                  <img src="../assets/icons/dashboard/user/Edit.svg" class="edit-btn" alt="edit btn">
                </div>
              </div>
            </div>
            <div v-if="fetchCurrent.length < 6 && fetchCurrent.length > 0" class="add-more"></div>
          </div>

        </div>
        <div class="schutzen-saved-wrapper">
          <p class="p">Deine Favoriten</p>
          <div class="schutzen-saved" ref="savedContainer" @dragover="dragOver" @drop="dropToFavorites">
            <div class="schutzen-favorite">
              <div class="Fade FadeLeft"></div>
              <div v-if="fetchFavorite.length === 0" class="schutzen-placeholder2">
                <p class="schutzen-placeholder-text">Du hast noch keine Favoriten</p>
              </div>
              <template v-else>
                <div v-for="person in fetchFavorite" :key="person.id" class="schutzen-card-fav"
                  :style="{ backgroundColor: person.color }" draggable="true"
                  @dragstart="dragStart($event, person)" @dragend="dragEnd($event)" @dragover.prevent
                  @drop="reorderFavorites($event, person)">
                  <div class="initials">{{ person.initials }}</div>
                  <img src="../assets/icons/dashboard/user/shadow.png" alt="Shadow" class="shadow">
                  <div class="schutzen-details">
                    <div class="name">{{ truncateText(`${person.firstName} ${person.lastName}`) }}</div>
                    <div class="composer">{{ truncateText(person.composer, 10) }}</div>
                  </div>
                </div>
                <div v-if="fetchFavorite.length > 0 && fetchFavorite.length < 9"
                  class="schutzen-placeholder-fav"></div>
              </template>
              <div class="Fade FadeRight"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>



<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import SchutzenHeader from '@/components/TitleSection.vue';
import apiRequest from '@/lib/apiRequest';

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
const editingPersonId = ref(null);
const composerFocused = ref(false);
const isEditing = ref(false);
const isLoading = ref(false);
const fetchFavorite = ref([]);
const fetchCurrent = ref([]);
const draggedPerson = ref(null);
const customColors = ref(['#CF7502', '#FE4042', '#B30037', '#F0559E', '#BC87CD', '#5C5FCB', '#0543D4', '#0C87C3', '#73CFC8', '#5ACD96', '#70C666', '#D0BF00']);
let lastColor = null;

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

const allFieldsValid = computed(() => {
  return Object.values(validation.value).every(isValid => isValid);
});

watch(formData, (newData) => {
  validation.value.composer = newData.composer && newData.composer !== '';
  validation.value.firstName = newData.firstName.trim().length > 0;
  validation.value.lastName = newData.lastName.trim().length > 0;
  validation.value.street = newData.street.trim().length > 0;
  validation.value.streetNumber = newData.streetNumber.trim().length > 0;
  validation.value.postalCode = newData.postalCode.trim().length > 0;
  validation.value.city = newData.city.trim().length > 0;
  validation.value.land = newData.land && newData.land !== '';
}, { deep: true });

const selectOption = (field, value) => {
  formData.value[field] = value;
  if (field === 'composer') composerFocused.value = false;
  validation.value[field] = value && value !== '';
};

const windowWidth = ref(window.innerWidth);

const updateWindowWidth = () => {
  windowWidth.value = window.innerWidth;
};

const truncateText = (text, maxLength = 10) => {
  if (!text) return 'N/A';
  if (windowWidth.value >= 2100) return text;
  return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
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
    initials: (formData.value.firstName.charAt(0) + formData.value.lastName.charAt(0)).toUpperCase(),
    favorite: fetchFavorite.value.length + 1,
    current: 1,
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
      color: newPerson.backgroundColor,
      favorite: newPerson.favorite,
      current: newPerson.current,
    });
    console.log('POST /authors response:', JSON.stringify(response.data, null, 2));

    resetForm();
    await fetchAuthors();
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
    initials: (formData.value.firstName.charAt(0) + formData.value.lastName.charAt(0)).toUpperCase(),
    favorite: fetchFavorite.value.find((p) => p.id === editingPersonId.value)?.favorite || 0,
    current: fetchCurrent.value.find((p) => p.id === editingPersonId.value)?.current || 0,
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
      color: updatedPerson.color,
      favorite: updatedPerson.favorite,
      current: updatedPerson.current,
    });
    console.log('PUT /authors for edit:', { id: editingPersonId.value, ...updatedPerson });

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

  const person = fetchFavorite.value.find((p) => p.id === editingPersonId.value) || 
                fetchCurrent.value.find((p) => p.id === editingPersonId.value);
  if (person) {
    try {
      await apiRequest.put(`/authors/${editingPersonId.value}`, {
        ...person,
        favorite: 0,
      });
      console.log('PUT /authors to remove favorite:', { id: editingPersonId.value, favorite: 0 });
      resetForm();
      await fetchAuthors();
    } catch (error) {
      console.error('Failed to remove person from favorites:', error);
    } finally {
      isLoading.value = false;
    }
  } else {
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
    // ضبط تأثير الإفلات ليكون "move"
    event.dataTransfer.dropEffect = 'move';
  }
};

const savedContainer = ref(null);
let isDragging = false;
let startX = 0;
let scrollLeft = 0;

const handleTouchStart = (e) => {
  isDragging = true;
  startX = e.touches[0].pageX - scrollLeft;
  savedContainer.value.style.scrollBehavior = 'auto';
};

const handleTouchMove = (e) => {
  if (!isDragging) return;
  e.preventDefault();
  const x = e.touches[0].pageX;
  scrollLeft = x - startX;
  savedContainer.value.scrollLeft = scrollLeft * -1;
};

const handleTouchEnd = () => {
  isDragging = false;
  savedContainer.value.style.scrollBehavior = 'smooth';
};

const handleWheel = (e) => {
  e.preventDefault();
  const delta = e.deltaY || e.detail || e.wheelDelta;
  savedContainer.value.scrollLeft += delta * 0.5;
};

onMounted(() => {
  window.addEventListener('resize', updateWindowWidth);
  if (savedContainer.value) {
    savedContainer.value.addEventListener('touchstart', handleTouchStart, { passive: false });
    savedContainer.value.addEventListener('touchmove', handleTouchMove, { passive: false });
    savedContainer.value.addEventListener('touchend', handleTouchEnd);
    savedContainer.value.addEventListener('wheel', handleWheel, { passive: false });
  }
  fetchAuthors();
});

onUnmounted(() => {
  window.removeEventListener('resize', updateWindowWidth);
  if (savedContainer.value) {
    savedContainer.value.removeEventListener('touchstart', handleTouchStart);
    savedContainer.value.removeEventListener('touchmove', handleTouchMove);
    savedContainer.value.removeEventListener('touchend', handleTouchEnd);
    savedContainer.value.removeEventListener('wheel', handleWheel);
  }
});

const dropPerson = async (event) => {
  event.preventDefault();
  if (isLoading.value) return;
  isLoading.value = true;

  const personId = event.dataTransfer.getData('personId');
  const person = fetchFavorite.value.find((p) => p.id === Number(personId));
  if (person) {
    try {
      await apiRequest.put(`/authors/${person.id}`, {
        ...person,
        favorite: 0,
      });
      console.log('PUT /authors to remove favorite on drop to Urheber2:', { id: person.id, favorite: 0 });
      await fetchAuthors();
    } catch (error) {
      console.error('Failed to remove person from favorites on drop:', error);
    } finally {
      isLoading.value = false;
    }
  } else {
    isLoading.value = false;
  }
};

const dropToFavorites = async (event) => {
  event.preventDefault();
  if (isLoading.value) return;
  isLoading.value = true;

  const personId = event.dataTransfer.getData('personId');
  const person = fetchCurrent.value.find((p) => p.id === Number(personId));
  if (person && fetchFavorite.value.length < 9 && !fetchFavorite.value.some((p) => p.id === person.id)) {
    try {
      const newFavoriteValue = fetchFavorite.value.length + 1;
      await apiRequest.put(`/authors/${person.id}`, {
        ...person,
        favorite: newFavoriteValue,
      });
      console.log('PUT /authors for favorite:', { id: person.id, favorite: newFavoriteValue });
      await fetchAuthors();
    } catch (error) {
      console.error('Failed to add to favorites:', error);
    } finally {
      isLoading.value = false;
    }
  } else {
    isLoading.value = false;
  }
};

const reorderFavorites = async (event, targetPerson) => {
  event.preventDefault();
  event.stopPropagation();
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

const removeFromFavorites = async (event) => {
  event.preventDefault();
  if (isLoading.value) return;
  isLoading.value = true;

  const personId = event.dataTransfer.getData('personId');
  const person = fetchFavorite.value.find((p) => p.id === Number(personId));
  if (person) {
    try {
      await apiRequest.put(`/authors/${person.id}`, {
        ...person,
        favorite: 0,
      });
      console.log('PUT /authors for remove favorite:', { id: person.id, favorite: 0 });
      await fetchAuthors();
    } catch (error) {
      console.error('Failed to remove from favorites:', error);
    } finally {
      isLoading.value = false;
    }
  } else {
    isLoading.value = false;
  }
};

const removeFromFavoritesDirect = async (personId) => {
  if (isLoading.value) return;
  isLoading.value = true;

  const person = fetchFavorite.value.find((p) => p.id === Number(personId));
  if (person) {
    try {
      await apiRequest.put(`/authors/${person.id}`, {
        ...person,
        favorite: 0,
      });
      console.log('PUT /authors for direct remove favorite:', { id: person.id, favorite: 0 });
      await fetchAuthors();
    } catch (error) {
      console.error('Failed to remove from favorites directly:', error);
    } finally {
      isLoading.value = false;
    }
  } else {
    isLoading.value = false;
  }
};
</script>

<style lang="scss" scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Heebo', sans-serif;
}

.main {
  display: flex;
  height: calc(100vh - 71px - 50px);
  position: relative;
  overflow-x: hidden;
}

.primary {
  width: 100%;
  height: 100%;
  background: var(--primary);
}

.schutzen-container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 20px;
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
  background-repeat: no-repeat;
  border-radius: 20px;
}

.add-more {
  display: flex;
  height: 140px;
  width: 263px;
  padding: 15px;
  justify-content: space-between;
  align-items: center;
  border-radius: 15px;
  border: 1px dashed var(--Main-Colors-Slate-Light, #3A3E42);
  background: var(--Main-Colors-Slate, #26282D);
  min-width: 200px;
}

.small {
  width: 35%;
}

.schutzen-content {
  flex: 1;
  display: flex;
  align-items: flex-start;
  gap: 20px;
  width: 100%;
}

.Urheber1 {
  display: flex;
  flex: 1 0 40%;
  width: clamp(366px, calc(366px + 1.5vw), 520px);
  padding: 30px;
  align-items: flex-start;
  align-content: flex-start;
  gap: 20px;
  align-self: stretch;
  flex-wrap: wrap;
  border-radius: 20px;
  background: var(--Main-Colors-Slate);
  box-sizing: border-box;
  transition: .3s ease;
}

.Urheber2 {
  display: flex;
  flex: 3 0 55%;
  width: clamp(730px, calc(730px + 5vw), 900px);
  padding: 30px;
  align-items: flex-start;
  align-content: flex-start;
  gap: 20px;
  align-self: stretch;
  flex-wrap: wrap;
  border-radius: 20px;
  background: var(--Main-Colors-Slate);
  box-sizing: border-box;
  transition: .3s ease;
}

.schutzen-form {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 24px;
  flex: 1 0 0;
}

.schutzen-form p {
  align-self: stretch;
  color: #FFF;
  leading-trim: both;
  text-edge: cap;
  font-family: Heebo;
  font-size: 18px;
  font-style: normal;
  font-weight: 300;
  line-height: 1;
  letter-spacing: 0.9px;
  text-transform: uppercase;
}

.schutzen-form-details {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
  align-self: stretch;
}

.schutzen-form-details .schutzen-item {
  display: flex;
  padding: 14px 20px;
  justify-content: space-between;
  align-items: center;
  align-self: stretch;
  border-radius: 5px;
  background: var(--Main-Colors-Slate-Dark);
  position: relative;
  border: 1px solid transparent;
  transition: .3s ease;
  height: 50px;
}

.schutzen-form-details .item-input {
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

.schutzen-form-details .item-input.filled {
  color: #FFF;
  font-size: 20px;
  line-height: 1;
}

.schutzen-form-details .item-input::placeholder {
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
  height: 50px;
  border-radius: 5px;
  background: var(--Main-Colors-Slate-Dark);
  position: relative;
  border: 1px solid transparent;
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
  width: 35%;
  padding: 14px 20px;
  height: 50px;
  justify-content: space-between;
  align-items: center;
  border-radius: 5px;
  background: var(--Main-Colors-Slate-Dark);
  position: relative;
  border: 1px solid transparent;
}

.custom-select {
  position: relative;
  width: 100%;
  cursor: pointer;
  display: flex;
  padding: 14px 20px;
  justify-content: space-between;
  align-items: center;
  align-self: stretch;
  border-radius: 5px;
  background: var(--Main-Colors-Slate-Dark);
  position: relative;
  border: 1px solid transparent;
  cursor: pointer;
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
  padding: 5px 20px;
  color: var(--Main-Colors-Dove);
  cursor: pointer;
  font-family: Heebo;
  font-size: 20px;
  font-weight: 300;
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
  z-index: 3;
}

.checkmark img {
  width: 20px;
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

button.schutzen-submit-btn {
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

button.schutzen-submit-btn:hover {
  background-color: #990033;
}

button.schutzen-submit-btn:disabled {
  background-color: #3a3e42;
  color: #6a6c6d;
  cursor: not-allowed;
}

button.schutzen-submit-btn span {
  color: #fff;
  leading-trim: both;
  text-edge: cap;
  font-family: Heebo;
  font-size: 16px;
  font-style: normal;
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

button.schutzen-save-btns {
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

button.schutzen-save-btns:hover {
  background-color: #990033;
}

button.schutzen-save-btns:disabled {
  background: #3a3e42;
  color: #6a6c6d;
  cursor: not-allowed;
}

button.schutzen-cancel-btn {
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

button.schutzen-cancel-btn:hover, .schutzen-save-btns:hover {
  background-color: #990033;
}

.schutzen-card {
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
  flex: 0 0 calc(33.333% - 14px);
  border: 2px solid var(--secondary);
  transition: opacity 0.3s, border 0.3s;
}

.schutzen-card:hover {
  opacity: 0.9;
}

.schutzen-card.selected {
  border: 2px solid var(--move);
  transition: 0s;
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
  bottom: -32px;
  left: -11px;
  opacity: 0.85;
  z-index: 2;
  object-fit: contain;
}

.schutzen-details-select {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 10;
  gap: 10px;
  width: 100%;
}

.schutzen-text-container {
  width: 80%;
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
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: inline-block;
  line-height: 1;
}

.composer {
  color: #FFF;
  font-family: Heebo;
  font-size: 16px;
  font-weight: 200;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: inline-block;
  line-height: 1;
}

.edit-icon {
  margin-left: 10px;
  opacity: 0;
}

.schutzen-card:hover .edit-icon {
  opacity: 1;
}

.edit-btn {
  width: 24px;
}

.schutzen-saved-wrapper {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-self: stretch;
  background: var(--Main-Colors-Slate, #26282D);
  border-radius: 20px;
}

.schutzen-saved {
  display: flex;
  padding: 0 30px 20px 30px;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 20px;
  align-self: stretch;
  border-radius: 20px;
  background: var(--Main-Colors-Slate, #26282D);
  overflow-x: auto;
  overflow-y: hidden;
  position: relative;
  -webkit-overflow-scrolling: touch;
  width: 100%;
  min-height: 180px;
  scroll-behavior: smooth;
  touch-action: pan-x;
}

.schutzen-saved::-webkit-scrollbar {
  height: 0px;
}

.schutzen-saved::-webkit-scrollbar-track {
  background: var(--Main-Colors-Slate-Dark, #1B1C20);
  border-radius: 4px;
}

.schutzen-saved::-webkit-scrollbar-thumb {
  background: #fff;
  border-radius: 4px;
}

.schutzen-saved::-webkit-scrollbar-thumb:hover {
  background: #990033;
}

.schutzen-saved-wrapper .p {
  color: #FFF;
  font-family: Heebo;
  font-size: 22px;
  font-weight: 700;
  line-height: 1;
  letter-spacing: 1.1px;
  text-transform: uppercase;
  width: 100%;
  padding: 20px 0px 0px 30px;
}

.schutzen-favorite {
  display: flex;
  align-items: center;
  gap: 20px;
  position: relative;
  right: 60px;
  scroll-behavior: smooth;
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.schutzen-favorite::-webkit-scrollbar {
  display: none;
}

.schutzen-card-fav {
  display: flex;
  width: 265px;
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

.schutzen-card-fav.dragging {
  opacity: 0.5;
  transform: scale(0.98);
}

.schutzen-details {
  z-index: 3;
  display: flex;
  flex-direction: column;
  gap: 5px;
  position: absolute;
  bottom: 20px;
  left: 20px;
}

.schutzen-card-fav {
  z-index: 3;
}

.schutzen-placeholder {
  display: flex;
  width: 263px;
  height: 140px;
  padding: 20px;
  justify-content: center;
  align-items: center;
  border-radius: 20px;
  border: 1px dashed var(--Main-Colors-Slate-Light);
  background: var(--Main-Colors-Slate);
}

.schutzen-placeholder2 {
  display: flex;
  width: 263px;
  height: 140px;
  padding: 20px;
  justify-content: center;
  align-items: center;
  border-radius: 20px;
  border: 1px dashed var(--Main-Colors-Slate-Light);
  background: var(--Main-Colors-Slate);
}

.schutzen-placeholder-fav {
  display: flex;
  width: 263px;
  height: 140px;
  padding: 20px;
  justify-content: center;
  align-items: center;
  border-radius: 20px;
  border: 1px dashed var(--Main-Colors-Slate-Light);
  background: var(--Main-Colors-Slate);
}

.schutzen-placeholder-text {
  color: var(--Main-Colors-Slate-Light, #3A3E42);
  text-align: center;
  leading-trim: both;
  text-edge: cap;
  font-family: Heebo;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 1.5;
  letter-spacing: 0.7px;
  text-transform: uppercase;
}

[draggable="true"] {
  cursor: move;
}

.Fade {
  width: 40px;
  height: 100%;
  z-index: 9;
  pointer-events: none;
  transition: opacity 0.3s ease;
}

.FadeRight {
  background: linear-gradient(270deg, var(--Main-Colors-Slate, #26282D) 0%, rgba(38, 40, 45, 0.00) 100%);
  position: sticky;
  top: 0;
  right: -31px;
  height: 160px;
  border-radius: 0 20px 20px 0;
}

.FadeLeft {
  background: linear-gradient(90deg, var(--Main-Colors-Slate, #26282D) 0%, rgba(38, 40, 45, 0.00) 100%);
  position: sticky;
  top: 0;
  left: -30px;
  height: 160px;
  border-radius: 20px 0 0 20px;
}

@media (min-height: 800px) and (max-height: 950px) {
}

@media (min-height: 951px) {
  .schutzen-container {
    height: 100%;
    overflow-y: hidden;
  }
}

@media (min-width: 1440px) and (max-width: 1599px) {
  .Urheber1,
  .schutzen-form {
    width: clamp(310px, calc(210px + 6.94vw), 366px);
    transition: .3s ease;
  }

  .add-more,
  .schutzen-placeholder {
    width: 100%;
    height: 110px;
  }

  .schutzen-placeholder2 {
    height: 140px;
  }

  .schutzen-details-select {
    top: 0;
  }

  .schutzen-half-item-small {
    // height: 38px;
  }

  .schutzen-half-item {
    width: 58%;
  }

  .Urheber2 {
    display: grid;
    grid-template-columns: repeat(2, minmax(165px, 1fr));
    gap: 20px;
    width: clamp(580px, calc(580px + 12.5vw), 780px);
    padding: 30px;
    align-content: flex-start;
    border-radius: 20px;
    background: var(--Main-Colors-Slate);
    box-sizing: border-box;
  }

  .schutzen-card {
    width: 100%;
    height: 110px;
    padding: 15px;
    border-radius: 15px;
    position: relative;
    cursor: pointer;
    overflow: hidden;
    transition: all 0.3s ease;
    flex: 0 0 auto;
  }

  .schutzen-form-details .schutzen-item,
  .schutzen-half-item,
  .schutzen-half-item-small {
    padding: 8px 20px;
    // height: 38px;
  }

  .schutzen-card-fav {
    width: 265px;
    height: 140px;
  }
}

@media (min-width: 1600px) and (max-width: 2074px) {
  .Urheber1 {
    width: clamp(366px, calc(366px + 1vw), 500px);
    max-width: 570px;
    transition: .3s ease;
  }

  .Urheber2 {
    display: grid;
    grid-template-columns: repeat(3, minmax(205px, 1fr));
    gap: 20px;
    width: 100%;
    max-width: 1100px;
    padding: 30px;
    margin: 0 auto;
    border-radius: 20px;
    background: var(--Main-Colors-Slate);
    box-sizing: border-box;
  }

  .schutzen-card {
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

  .add-more,
  .schutzen-placeholder {
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

  .schutzen-card-fav {
    width: 265px;
    height: 140px;
  }
}

@media (min-width: 2075px) and (max-width: 2560px) {
  .Urheber1 {
    width: clamp(366px, calc(366px + 1vw), 500px);
    max-width: 570px;
    transition: .3s ease;
  }

  .schutzen-content {
    gap: 20px;
    transition: .3s ease;
  }

  .schutzen-container {
    gap: 20px;
  }

  .Urheber2 {
    display: grid;
    grid-template-columns: repeat(4, minmax(220px, 1fr));
    justify-content: center;
    gap: 20px;
    width: 100%;
    max-width: 1590px;
    padding: 30px;
    border-radius: 20px;
    background: var(--Main-Colors-Slate);
    box-sizing: border-box;
  }

  .schutzen-card {
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

  .add-more,
  .schutzen-placeholder {
    width: 100%;
    height: 180px;
    padding: 15px;
    border-radius: 15px;
    position: relative;
    cursor: pointer;
    overflow: hidden;
    transition: all 0.3s ease;
    box-sizing: border-box;
  }

  .schutzen-card-fav {
    width: 265px;
    height: 140px;
    padding: 20px;
    border-radius: 20px;
    position: relative;
    cursor: move;
    overflow: hidden;
    transition: opacity 0.3s, transform 0.2s;
  }
}
</style>