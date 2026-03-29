import { defineStore } from 'pinia';

export const usePersonsStore = defineStore('persons', {
  state: () => ({
    persons: JSON.parse(localStorage.getItem('persons')) || [], // المفضلة (Favorites)
    selectedPersons: JSON.parse(localStorage.getItem('selectedPersons')) || [], // الأشخاص المختارون
    lastColor: localStorage.getItem('lastColor') || null, // اللون الأخير المستخدم
  }),
  actions: {
    
    addPerson(person) {
      const maxSelected = 6; // الحد الأقصى للأشخاص المختارين

      // إضافة الشخص إلى selectedPersons فقط إذا كان أقل من الحد الأقصى وغير موجود مسبقًا
      if (this.selectedPersons.length < maxSelected && !this.selectedPersons.some(p => p.id === person.id)) {
        this.selectedPersons.push(person);
        localStorage.setItem('selectedPersons', JSON.stringify(this.selectedPersons));
      }

      // تحديث اللون الأخير
      localStorage.setItem('lastColor', person.backgroundColor);
      this.lastColor = person.backgroundColor;
    },
    editPerson(updatedPerson) {
      const personsIndex = this.persons.findIndex(p => p.id === updatedPerson.id);
      if (personsIndex !== -1) {
        this.persons[personsIndex] = updatedPerson;
        localStorage.setItem('persons', JSON.stringify(this.persons));
      }

      const selectedIndex = this.selectedPersons.findIndex(p => p.id === updatedPerson.id);
      if (selectedIndex !== -1) {
        this.selectedPersons[selectedIndex] = updatedPerson;
        localStorage.setItem('selectedPersons', JSON.stringify(this.selectedPersons));
      }
    },
    deletePerson(personId) {
      // إزالة الشخص من selectedPersons إذا كان موجودًا
      const selectedIndex = this.selectedPersons.findIndex(p => p.id === personId);
      if (selectedIndex !== -1) {
        this.selectedPersons.splice(selectedIndex, 1);
        localStorage.setItem('selectedPersons', JSON.stringify(this.selectedPersons));
      }
      // إزالة الشخص من persons (favorites) إذا كان موجودًا
      const personsIndex = this.persons.findIndex(p => p.id === personId);
      if (personsIndex !== -1) {
        this.persons.splice(personsIndex, 1);
        localStorage.setItem('persons', JSON.stringify(this.persons));
      }
    },
  },
});