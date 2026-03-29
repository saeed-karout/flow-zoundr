<template>
  <div class="main-content">
    <StepLayout
      :current-step="3"
      :steps="steps"
      :section-title="sectionTitle"
      :section-description="sectionDescription"
      :hasOuterContent="false"
    >
      <div class="content">
        <div class="form">
          <div class="scrollable-content" ref="scrollableContent" :style="{ minHeight: scrollableMaxHeight }">
            <div class="content-sections">
              <div class="files-section">
                <div v-if="!isLoading && fetchFiles.length && fetchAuthors.length" class="top-line">
                  <div class="span">Deine Werke</div>
                  <div class="Alle">
                    <div v-for="person in getPersonsForFile(fetchFiles[0]?.id)" :key="person.id" class="one-alle">
                      <div class="title">Alle</div>
                      <div class="checked" @click="handlePersonCheckboxChange(person.id)">
                        <img v-if="person.checked" :src="imageTrue" width="16px" height="12px" alt="icon" class="checkbox-icon" />
                      </div>
                    </div>
                  </div>
                </div>
                <div class="songs">
                  <div v-if="!isLoading && fetchFiles.length === 0" class="error-message">
                    Keine Daten verfügbar. Bitte versuche es erneut oder kontaktiere den Support.
                  </div>
                  <div v-else-if="!isLoading" v-for="(file, index) in fetchFiles" :key="file.id" class="row">
                    <div class="song-container">
                      <div class="song">
                        <div class="formfield">
                          <span>{{ index + 1 < 10 ? '0' + (index + 1) : index + 1 }}</span>
                        </div>
                        <div class="formfield2">
                          <div class="name-song">{{ file.file_name }}</div>
                        </div>
                      </div>
                      <div class="Urheber">
                        <div class="content-wrapper">
                          <div class="file-persons-group">
                            <div class="persons-list">
                              <div v-for="person in getPersonsForFile(file.id)" :key="person.id" class="person-card"
                                :style="{
                                  backgroundColor: isPersonSelectedForFile(person.id, file.id)
                                    ? person.color
                                    : '#3A3E42',
                                  opacity: isPersonSelectedForFile(person.id, file.id) ? 1 : 0.3,
                                }" @click="togglePersonSelection(person.id, file.id)">
                                <img src="@/assets/icons/dashboard/user/shadow.png" alt="Shadow" class="shadow" />
                                <div class="person-name">
                                  {{ isSmallScreen ? `${person.firstName.charAt(0)}${person.lastName.charAt(0)}` : `${person.firstName} ${person.lastName}` }}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-if="!isLoading && fetchFiles.length > maxVisibleFiles && !isAtBottom" class="shadow-blur files-shadow-bottom"></div>
              </div>
            </div>
          </div>
        </div>
        <div class="CTA">
          <div class="buttons">
            <div class="zuruck" @click="emit('prev')">
              <span>Zurück</span>
            </div>
            <div
              class="weiter"
              :class="{ disabled: fetchFiles.length === 0 || !isAtLeastOnePersonSelected() || isLoading }"
              @click="handleNext"
            >
              <span>{{ isLoading ? 'Weiter...' : 'Weiter' }}</span>
            </div>
          </div>
        </div>
      </div>
    </StepLayout>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import StepLayout from '@/components/Layout2.vue';
import imageTrue from '@/assets/icons/y.png';
import apiRequest from '@/lib/apiRequest';

const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(null, args), wait);
  };
};

defineProps({
  currentStep: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits(['prev', 'next']);

const fetchFiles = ref([]);
const fetchAuthors = ref([]);
const selectedPersonsPerFile = ref({});
const selectAll = ref(false);
const windowHeight = ref(window.innerHeight);
const windowWidth = ref(window.innerWidth);
const isLoading = ref(true);
const error = ref(null);
const hasFetched = ref(false);
const isInitialLoad = ref(true);

const isSmallScreen = computed(() => windowWidth.value <= 1599);

const formHeight = computed(() => {
  const minScreenHeight = 800;
  const maxScreenHeight = 1440;
  const minFormHeight = 374;
  const maxFormHeight = 1000;
  if (windowHeight.value <= minScreenHeight) return `${minFormHeight}px`;
  if (windowHeight.value >= maxScreenHeight) return `${maxFormHeight}px`;
  const height = minFormHeight + ((maxFormHeight - minFormHeight) * (windowHeight.value - minScreenHeight)) / (maxScreenHeight - minScreenHeight);
  return `${Math.round(height)}px`;
});

const maxVisibleFiles = computed(() => {
  const ctaHeight = 36;
  const ctaBottom = 20;
  const gap = 20;
  const separatorHeight = 1;
  const stepLayoutPadding = 40;
  const topLineHeight = 60;
  const baseHeight = 400;
  const minFiles = 5;
  const availableHeight = windowHeight.value - (windowHeight.value >= 600 ? (ctaHeight + ctaBottom + gap + separatorHeight) : 0) - stepLayoutPadding - 71 - 50 - topLineHeight;
  const heightRatio = availableHeight / baseHeight;
  const calculatedFiles = Math.floor(minFiles * heightRatio);
  return Math.max(minFiles, Math.min(calculatedFiles, fetchFiles.value.length));
});

const scrollableMaxHeight = computed(() => {
  const ctaHeight = 36;
  const ctaBottom = 20;
  const gap = 20;
  const separatorHeight = 1;
  const stepLayoutPadding = 40;
  const topLineHeight = 60;
  const availableHeight = windowHeight.value - (windowHeight.value >= 600 ? (ctaHeight + ctaBottom + gap + separatorHeight) : 0) - stepLayoutPadding - 71 - 50 - topLineHeight;
  return `${Math.max(availableHeight, 400)}px`;
});

const getPersonsForFile = (fileId) => {
  if (!fileId || !fetchAuthors.value.length) return [];
  return fetchAuthors.value.slice(0, 6).map(person => ({
    ...person,
    checked: selectedPersonsPerFile.value[fileId]?.includes(person.id) && fetchFiles.value.every(f => selectedPersonsPerFile.value[f.id]?.includes(person.id)) || false,
  }));
};

const isPersonSelectedForFile = (personId, fileId) => {
  return selectedPersonsPerFile.value[fileId]?.includes(personId) || false;
};

const isAtLeastOnePersonSelected = () => {
  return Object.values(selectedPersonsPerFile.value).some(persons => persons.length > 0);
};

const togglePersonSelection = (personId, fileId) => {
  if (isLoading.value) return;
  if (!selectedPersonsPerFile.value[fileId]) {
    selectedPersonsPerFile.value[fileId] = [];
  }
  const personIndex = selectedPersonsPerFile.value[fileId].indexOf(personId);
  if (personIndex === -1) {
    selectedPersonsPerFile.value[fileId].push(personId);
  } else {
    selectedPersonsPerFile.value[fileId].splice(personIndex, 1);
  }
  selectedPersonsPerFile.value = { ...selectedPersonsPerFile.value };
};

const handlePersonCheckboxChange = (personId) => {
  if (isLoading.value) return;
  const person = getPersonsForFile(fetchFiles.value[0]?.id).find(p => p.id === personId);
  if (!person) return;
  const isChecked = !person.checked;
  fetchFiles.value.forEach(file => {
    if (!selectedPersonsPerFile.value[file.id]) {
      selectedPersonsPerFile.value[file.id] = [];
    }
    const personIndex = selectedPersonsPerFile.value[file.id].indexOf(personId);
    if (isChecked && personIndex === -1) {
      selectedPersonsPerFile.value[file.id].push(personId);
    } else if (!isChecked && personIndex !== -1) {
      selectedPersonsPerFile.value[file.id].splice(personIndex, 1);
    }
  });
  selectedPersonsPerFile.value = { ...selectedPersonsPerFile.value };
};

const toggleAllPersons = () => {
  if (isLoading.value) return;
  selectAll.value = !selectAll.value;
  const persons = getPersonsForFile(fetchFiles.value[0]?.id);
  persons.forEach(person => {
    handlePersonCheckboxChange(person.id);
  });
};

const fileAuthorAssignments = computed(() => {
  const assignments = {};
  Object.entries(selectedPersonsPerFile.value).forEach(([fileId, authorIds]) => {
    const authorMap = {};
    authorIds.forEach((authorId, index) => {
      authorMap[index] = parseInt(authorId);
    });
    if (Object.keys(authorMap).length > 0) {
      assignments[fileId] = authorMap;
    }
  });
  return assignments;
});

const sendAssignmentsToAPI = async () => {
  if (isLoading.value) return;
  if (Object.keys(fileAuthorAssignments.value).length === 0) {
    console.log('No authors assigned, skipping API request.');
    return;
  }
  try {
    isLoading.value = true;
    const formData = new FormData();
    Object.entries(fileAuthorAssignments.value).forEach(([fileId, authorMap]) => {
      Object.entries(authorMap).forEach(([index, authorId]) => {
        formData.append(`media_file_author[${fileId}][${index}]`, authorId);
      });
    });
    const response = await apiRequest.post('/media_files/authors', formData);
    console.log('Data sent successfully:', response.data);
  } catch (error) {
    console.error('Failed to send assignments:', error);
    error.value = 'Failed to send assignments';
  } finally {
    isLoading.value = false;
  }
};

const debouncedSendAssignments = debounce(sendAssignmentsToAPI, 3000);

watch(
  selectedPersonsPerFile,
  () => {
    if (!isInitialLoad.value && Object.keys(fileAuthorAssignments.value).length > 0) {
      console.log('Triggering debouncedSendAssignments due to user change');
      debouncedSendAssignments();
    } else if (isInitialLoad.value) {
      console.log('Skipping debouncedSendAssignments during initial load');
    }
  },
  { deep: true }
);

const handleNext = async () => {
  if (fetchFiles.value.length > 0 && isAtLeastOnePersonSelected() && !isLoading.value) {
    await sendAssignmentsToAPI();
    emit('next');
  }
};

const steps = ref(['1', '2', '3', '4']);
const sectionTitle = ref('BETEILIGUNG DER URHEBER');
const sectionDescription = ref('Weise die Urheber Deinen Werken zu.');

const isAtBottom = ref(false);
const scrollableContent = ref(null);

const checkScroll = () => {
  if (scrollableContent.value) {
    const container = scrollableContent.value;
    isAtBottom.value = container.scrollTop + container.clientHeight >= container.scrollHeight - 1;
  }
};

const updateShadowPosition = () => {
  const scrollable = scrollableContent.value;
  const filesSection = document.querySelector('.files-section');
  const filesShadow = document.querySelector('.files-shadow-bottom');
  if (scrollable && filesSection && filesShadow) {
    const scrollableRect = scrollable.getBoundingClientRect();
    const filesRect = filesSection.getBoundingClientRect();
    filesShadow.style.bottom = `${0}px`;
    filesShadow.style.left = `${0}px`;
    filesShadow.style.width = `${100}%`;
  }
};

const debouncedHandleResize = debounce(() => {
  windowHeight.value = Math.round(window.innerHeight);
  windowWidth.value = Math.round(window.innerWidth);
  updateShadowPosition();
}, 100);

const handleScroll = () => {
  if (scrollableContent.value) {
    checkScroll();
    updateShadowPosition();
  }
};

const fetchMediaFiles = async () => {
  console.log('Fetching /media_files at:', new Date().toISOString());
  try {
    const response = await apiRequest.get('/media_files');
    console.log('GET /media_files response:', JSON.stringify(response.data, null, 2));
    fetchFiles.value = response.data.data.map(file => ({
      id: file.id,
      file_name: file.file_name,
      status: file.status || 'uploaded',
      authors_ids: file.authors_ids || [],
    }));
    fetchFiles.value.forEach(file => {
      selectedPersonsPerFile.value[file.id] = [...(file.authors_ids || [])];
    });
    selectedPersonsPerFile.value = { ...selectedPersonsPerFile.value };
  } catch (error) {
    console.error('Failed to fetch media files:', error);
    error.value = 'Failed to fetch media files';
  }
};

const fetchAuthorsData = async () => {
  console.log('Fetching /authors at:', new Date().toISOString());
  try {
    const response = await apiRequest.get('/authors');
    console.log('GET /authors response:', JSON.stringify(response.data, null, 2));
    fetchAuthors.value = response.data.data
      .filter(author => author.current === 1)
      .slice(0, 6)
      .map(author => ({
        id: author.id,
        firstName: author.first_name || '',
        lastName: author.last_name || '',
        color: author.color || '#FFFFFF',
      }));
  } catch (error) {
    console.error('Failed to fetch authors:', error);
    error.value = 'Failed to fetch authors';
  }
};

const fetchData = async () => {
  if (hasFetched.value) {
    console.log('fetchData skipped: Data already fetched');
    return;
  }
  console.log('fetchData called at:', new Date().toISOString());
  try {
    hasFetched.value = true;
    isLoading.value = true;
    await Promise.all([fetchMediaFiles(), fetchAuthorsData()]);
    console.log('fetchFiles:', fetchFiles.value);
    console.log('fetchAuthors:', fetchAuthors.value);
  } catch (error) {
    console.error('Failed to fetch data:', error);
    error.value = 'Failed to fetch data';
    hasFetched.value = false;
  } finally {
    isLoading.value = false;
    isInitialLoad.value = false;
    console.log('Initial load completed, isInitialLoad set to false');
  }
};

onMounted(() => {
  console.log('Component mounted at:', new Date().toISOString());
  window.addEventListener('resize', debouncedHandleResize);
  if (scrollableContent.value) {
    scrollableContent.value.addEventListener('scroll', handleScroll);
  }
  isInitialLoad.value = true;
  fetchData();
  updateShadowPosition();
  checkScroll();
});

onUnmounted(() => {
  window.removeEventListener('resize', debouncedHandleResize);
  if (scrollableContent.value) {
    scrollableContent.value.removeEventListener('scroll', handleScroll);
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

html, body {
  height: 100%;
  overflow: hidden;
}

.main-content {
  position: relative;
  display: flex;
  flex-direction: column;
  color: white;
  width: 100%;
  overflow: hidden;
}

.content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 28px;
  flex: 1 0 0;
  align-self: stretch;
  overflow: hidden;
}

.form {
  display: flex;
  height: v-bind(formHeight);
  flex-direction: column;
  align-items: flex-end;
  gap: 32px;
  align-self: stretch;
  overflow: hidden;
  position: relative;
  right: -4px;
}

.scrollable-content {
  max-height: v-bind(scrollableMaxHeight);
  min-height: v-bind(scrollableMaxHeight);
  overflow-y: auto;
  scrollbar-width: none;
  width: 100%;
  padding-bottom: 77px;
}

.scrollable-content::-webkit-scrollbar {
  display: none;
}

.files-section {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.top-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  align-self: stretch;
  background-color: var(--secondary);
  position: sticky;
  top: 0;
  z-index: 10;
  padding: 20px 10px 20px 0px;
}

.top-line .span {
  color: #fff;
  font-family: Heebo;
  font-size: 18px;
  font-weight: 300;
  line-height: 1;
  letter-spacing: 0.9px;
  text-transform: uppercase;
}

.top-line .Alle {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.top-line .Alle .one-alle {
  display: flex;
  width: 115px;
  padding: 8px 12px;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
  transition: .3s ease;
}

.top-line .Alle .one-alle .title {
  color: #fff;
  font-family: Heebo;
  font-size: 18px;
  font-weight: 300;
  line-height: 1;
  letter-spacing: 0.9px;
}

.top-line .Alle .one-alle .checked {
  display: flex;
  width: 28px;
  height: 28px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
  border-radius: 5px;
  background: #1B1C20;
  position: relative;
  z-index: 2;
  cursor: pointer;
}

.checkbox-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
}

.songs {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
  align-self: stretch;
}

.error-message {
  color: #FF5555;
  font-family: Heebo;
  font-size: 16px;
  text-align: center;
  padding: 20px;
}

.row {
  display: flex;
  align-items: center;
  gap: 40px;
  align-self: stretch;
  width: 100%;
}

.song-container {
  display: flex;
  align-items: center;
  gap: 40px;
  flex: 1;
  width: 100%;
}

.row .song {
  display: flex;
  align-items: center;
  gap: 2px;
  flex: 1;
  min-width: 0;
}

.row .song .formfield {
  display: flex;
  width: 50px;
  padding: 14px 12px;
  justify-content: center;
  align-items: center;
  border-radius: 5px 0px 0px 5px;
  background: #1B1C20;
}

.row .song .formfield span {
  color: #FFF;
  font-family: Heebo;
  font-size: 20px;
  font-weight: 300;
  line-height: 1;
  letter-spacing: 1px;
}

.row .song .formfield2 {
  display: flex;
  padding: 14px 20px;
  align-items: center;
  flex: 1;
  min-width: 0;
  border-radius: 0px 5px 5px 0px;
  background: #1B1C20;
}

.row .song .formfield2 .name-song {
  color: #FFF;
  font-family: Heebo;
  font-size: 20px;
  font-weight: 300;
  line-height: 1;
  letter-spacing: 1px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.Urheber {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 16px;
}

.content-wrapper {
  position: relative;
}

.file-persons-group {
  min-height: 50px;
}

.persons-list {
  display: flex;
  gap: 16px;
  position: relative;
  right: 4px;
}

.person-card {
  border-radius: 5px;
  padding: 12px;
  width: 115px;
  height: 50px;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  cursor: pointer;
  position: relative;
  transition: background-color 0.3s ease, opacity 0.3s ease;
}

.person-card:hover {
  opacity: 0.9;
}

.person-name {
  font-size: 14px;
  line-height: 14px;
  font-weight: 700;
  color: #fff;
  text-transform: uppercase;
  text-align: start;
  overflow: hidden;
  text-overflow: ellipsis;
  z-index: 2;
  width: 70px;
}

.shadow {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 50px;
  z-index: 1;
  opacity: 0.8;
}

.shadow-blur {
  position: absolute;
  height: 4rem;
  width: 100%;
  bottom: 0;
  left: 0;
  pointer-events: none;
  background: linear-gradient(to top, rgba(38, 40, 45, 0.8), transparent);
  transition: opacity 0.3s ease;
}

.files-shadow-bottom {
  opacity: v-bind('isAtBottom ? 0 : 1');
}

.separator {
  width: 100%;
  height: 1px;
  background-color: #3A3E42;
  position: fixed;
  bottom: 56px;
  z-index: 10;
}

.CTA {
  position: absolute;
  bottom: 30px;
  right: 30px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: flex-end;
  gap: 10px;
  flex: 1 0 0;
  align-self: stretch;
}

.CTA .buttons {
  display: flex;
  align-items: flex-start;
  gap: 20px;
}

.CTA .buttons .zuruck {
  display: flex;
  height: 36px;
  padding: 17px 20px 18px 20px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  border-radius: 5px;
  background: #3A3E42;
}

.CTA .buttons .zuruck:hover {
  background-color: #990033;
  transition: .3s ease-in-out;
  cursor: pointer;
}

.CTA .buttons .zuruck span {
  color: #FFF;
  font-family: Heebo;
  font-size: 16px;
  font-weight: 400;
  line-height: normal;
  text-transform: uppercase;
}

.CTA .buttons .weiter {
  display: flex;
  height: 36px;
  padding: 17px 20px 18px 20px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  border-radius: 5px;
  background: #DD1155;
}

.CTA .buttons .weiter:hover {
  background: #990033;
  transition: .3s ease;
  cursor: pointer;
}

.CTA .buttons .weiter.disabled {
  background: #3A3E42;
  color: #6A6C6D;
  cursor: not-allowed;
}

.CTA .buttons .weiter.disabled:hover {
  background: #3A3E42;
}

.CTA .buttons .weiter span {
  color: #FFF;
  font-family: Heebo;
  font-size: 16px;
  font-weight: 400;
  line-height: normal;
  text-transform: uppercase;
}

@media (max-width: 1599px) {
  .person-card {
    width: 60px;
  }
  .person-name {
    font-size: 18px;
    text-align: center;
    width: 100%;
  }
  .top-line .Alle .one-alle {
    width: 60px;
  }
  .top-line .Alle .one-alle .title {
    display: none;
  }
}

@media (min-width: 1600px) and (max-width: 2560px) {
  .top-line .Alle .one-alle {
    position: relative;
    right: 10px;
  }
}

@media (max-width: 767px) {
  .person-name {
    font-size: 12px;
    width: auto;
    white-space: nowrap;
  }
}

@media (max-height: 600px) {
  .CTA {
    position: static;
    margin-top: 20px;
    align-items: flex-end;
    padding-right: 20px;
  }
  .separator {
    position: static;
    margin-top: 20px;
  }
  .scrollable-content {
    padding-bottom: 0;
  }
}
</style>