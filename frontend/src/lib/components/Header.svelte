<script>
  import { createEventDispatcher } from 'svelte';
  import '$lib/styles/global.css';
  import logo from '$lib/images/LOGO.LEGGERO.trspnt.png';
  import emblemaRepubblica from '$lib/images/Emblema della Repubblica Italiana.svg';
  import worldMap from '$lib/images/world_map.png';

  const dispatch = createEventDispatcher();

  let { darkMode } = $props();

  function handleImageError(event) {
    event.target.src = '/api/placeholder/64/64';
    event.target.onerror = null;
  }

  function toggleDarkMode() {
    darkMode = !darkMode;
    document.body.classList.toggle('dark-mode', darkMode);
    dispatch('darkModeChange', { darkMode });
  }
</script>



<header class="relative shadow-lg bg-white z-0 py-4 px-6 flex items-center overflow-hidden">
  <!-- Sfondo -->
  <div class="absolute inset-0 flex justify-center items-center opacity-20 grayscale brightness-150 z-[-1]">
    <img src={worldMap} alt="Mappa del mondo"
         class="w-[1000px] translate-y-20 h-auto object-contain" />
  </div>

  <!-- Lato sinistro - Logo -->
  <div class="flex items-center w-32">
    <a href="/" class="hover:scale-105 transition-transform">
      <img src={logo} alt="Logo della scuola" class="h-16 w-16 cursor-pointer"
           on:error={handleImageError} />
    </a>
  </div>

  <!-- Centro - Titolo -->
  <div class="flex-1 flex justify-center">
    <h1 class="text-4xl font-medium castelli-title text-center">CastelliShelf</h1>
  </div>

  <!-- Lato destro - Pulsanti + Emblema -->
  <div class="flex items-center gap-4 w-32 justify-end">
    <!-- Tema -->
      <button 
        class="p-2 rounded-full hover:bg-gray-200 transition-colors text-[var(--primary-color)]" 
        on:click={toggleDarkMode}
        aria-label="Cambia tema"
      >
    {#if darkMode}
      <!-- Sole -->
      <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
          fill-rule="evenodd" clip-rule="evenodd">
        </path>
      </svg>
    {:else}
        <!-- Luna -->
        <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
        </svg>
      {/if}
    </button>


    <!-- Admin Button -->
    <a href="/admin" class="btn border-none outline-none primary-color text-white hover:bg-[var(--primary-color-darker)] transition-all duration-300 flex items-center gap-1">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.50 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
      Admin
    </a>


    <!-- Emblema -->
    <img src={emblemaRepubblica} alt="Logo Repubblica Italiana" class="h-16 w-16"
         on:error={handleImageError} />
  </div>
</header>
