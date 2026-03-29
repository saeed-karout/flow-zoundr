import { defineStore } from 'pinia';

export const useStep2PersonsStore = defineStore('step2Persons', {
  state: () => ({
    selectedPersons: JSON.parse(localStorage.getItem('step2SelectedPersons')) || [],
    lastColor: localStorage.getItem('step2LastColor') || null,
  }),
  actions: {
    addPerson(person) {
      const maxSelected = 6;
      try {
        if (!person.id || !person.backgroundColor) {
          console.error('Invalid person data:', person);
          return;
        }
        if (this.selectedPersons.length < maxSelected && !this.selectedPersons.some(p => p.id === person.id)) {
          this.selectedPersons.push(person);
          localStorage.setItem('step2SelectedPersons', JSON.stringify(this.selectedPersons));
        }
        this.lastColor = person.backgroundColor;
        localStorage.setItem('step2LastColor', person.backgroundColor);
      } catch (error) {
        console.error('Error adding person:', error);
      }
    },
    editPerson(updatedPerson) {
      try {
        const selectedIndex = this.selectedPersons.findIndex(p => p.id === updatedPerson.id);
        if (selectedIndex !== -1) {
          this.selectedPersons[selectedIndex] = updatedPerson;
          localStorage.setItem('step2SelectedPersons', JSON.stringify(this.selectedPersons));
        }
      } catch (error) {
        console.error('Error editing person:', error);
      }
    },
    deletePerson(personId) {
      try {
        const selectedIndex = this.selectedPersons.findIndex(p => p.id === personId);
        if (selectedIndex !== -1) {
          this.selectedPersons.splice(selectedIndex, 1);
          localStorage.setItem('step2SelectedPersons', JSON.stringify(this.selectedPersons));
        }
      } catch (error) {
        console.error('Error deleting person:', error);
      }
    },
  },
});