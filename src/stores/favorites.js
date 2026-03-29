import { defineStore } from 'pinia';

export const useFavoritesStore = defineStore('favorites', {
  state: () => ({
    persons: JSON.parse(localStorage.getItem('favorites')) || [],
    lastColor: localStorage.getItem('favoritesLastColor') || null,
  }),
  actions: {
    addToFavorites(person) {
      const maxFavorites = 9;
      try {
        if (!person.id || !person.backgroundColor) {
          console.error('Invalid person data:', person);
          return;
        }
        if (this.persons.length < maxFavorites && !this.persons.some(p => p.id === person.id)) {
          this.persons.push(person);
          localStorage.setItem('favorites', JSON.stringify(this.persons));
        }
        this.lastColor = person.backgroundColor;
        localStorage.setItem('favoritesLastColor', person.backgroundColor);
      } catch (error) {
        console.error('Error adding to favorites:', error);
      }
    },
    editFavorite(updatedPerson) {
      try {
        const index = this.persons.findIndex(p => p.id === updatedPerson.id);
        if (index !== -1) {
          this.persons[index] = updatedPerson;
          localStorage.setItem('favorites', JSON.stringify(this.persons));
        }
      } catch (error) {
        console.error('Error editing favorite:', error);
      }
    },
    deleteFromFavorites(personId) {
      try {
        const index = this.persons.findIndex(p => p.id === personId);
        if (index !== -1) {
          this.persons.splice(index, 1);
          localStorage.setItem('favorites', JSON.stringify(this.persons));
        }
      } catch (error) {
        console.error('Error deleting from favorites:', error);
      }
    },
    reorderFavorites(draggedPersonId, targetPersonId) {
      try {
        const draggedPerson = this.persons.find(p => p.id === draggedPersonId);
        if (!draggedPerson || draggedPersonId === targetPersonId) return;
        const index = this.persons.findIndex(p => p.id === draggedPersonId);
        if (index !== -1) {
          this.persons.splice(index, 1);
        }
        const targetIndex = this.persons.findIndex(p => p.id === targetPersonId);
        if (targetIndex !== -1) {
          this.persons.splice(targetIndex + 1, 0, draggedPerson);
        } else {
          this.persons.push(draggedPerson);
        }
        localStorage.setItem('favorites', JSON.stringify(this.persons));
      } catch (error) {
        console.error('Error reordering favorites:', error);
      }
    },
  },
});