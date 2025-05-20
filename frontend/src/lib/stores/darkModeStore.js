// src/lib/stores/darkModeStore.js
import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// Funzione per creare uno store persistente
function createDarkModeStore() {
  // Inizializza lo store cercando il valore nel localStorage se siamo nel browser
  // altrimenti usa false come valore predefinito
  const initialValue = browser && localStorage.getItem('darkMode') 
    ? JSON.parse(localStorage.getItem('darkMode')) 
    : false;
  
  // Crea lo store writable con il valore iniziale
  const { subscribe, set, update } = writable(initialValue);
  
  return {
    subscribe,
    // Aggiorna lo store e salva nel localStorage
    toggle: () => update(value => {
      const newValue = !value;
      if (browser) {
        localStorage.setItem('darkMode', JSON.stringify(newValue));
        // Aggiorna anche la classe sul body
        document.body.classList.toggle('dark-mode', newValue);
      }
      return newValue;
    }),
    // Imposta un valore specifico
    set: (value) => {
      if (browser) {
        localStorage.setItem('darkMode', JSON.stringify(value));
        // Aggiorna anche la classe sul body
        document.body.classList.toggle('dark-mode', value);
      }
      set(value);
    }
  };
}

// Esporta l'istanza dello store
export const darkMode = createDarkModeStore();