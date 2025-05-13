<script>
    import '$lib/styles/global.css';
    import logo from '$lib/images/LOGO.LEGGERO.trspnt.png';
    import emblemaRepubblica from '$lib/images/Emblema della Repubblica Italiana.svg';
    import { createEventDispatcher } from 'svelte';

    //crea un dispatcher per inviare eventi al componente padre (+page.svelte)
    const dispatch = createEventDispatcher();

    let { darkMode } = $props();

    // Funzioni per gestire i fallimenti di caricamento delle immagini
    function handleImageError(event) {
        event.target.src = '/api/placeholder/64/64';
        event.target.onerror = null;
    }
    
    // Toggle tema chiaro/scuro
    function toggleDarkMode() {
        darkMode = !darkMode;
        document.body.classList.toggle('dark-mode', darkMode);
        
        // Invia l'evento al componente padre con il nuovo valore
        dispatch('darkModeChange', { darkMode });
    }
</script>


<header class="bg-white z-0 py-4 px-6 flex justify-between items-center">
  <div class="flex items-center">
    <img src={logo} alt="Logo della scuola" class="h-16 w-16 mr-4 hover:scale-105 transition-transform" 
         on:error={handleImageError} />
  </div>
  <h1 class="text-4xl font-medium text-center flex-grow castelli-title">CastelliShelf</h1>
  <div class="flex items-center gap-4">
    <button 
      class="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" 
      on:click={toggleDarkMode}
      aria-label="Cambia tema"
    >
      {#if darkMode}
        <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" fill-rule="evenodd" clip-rule="evenodd"></path>
        </svg>
      {:else}
        <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
        </svg>
      {/if}
    </button>
    <img src={emblemaRepubblica} alt="Logo Repubblica Italiana" class="h-16 w-16" 
         on:error={handleImageError} />
  </div>
</header>