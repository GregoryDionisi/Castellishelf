<script>
  import { onMount } from 'svelte';
  import { darkMode } from '$lib/stores/darkModeStore';
  import Header from '$lib/components/Header.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import bookshelf from '$lib/images/bookshelf.png';
  
  let searchTerm = $state("");
  let selectedCategory = $state("all");
  let { data } = $props();
  $inspect(data);

  const library = data.library;
  let isDarkMode = $state(false);

  // Sottoscrizione allo store darkMode
  const unsubscribe = darkMode.subscribe(value => {
      isDarkMode = value;
      updateDarkModeClass();
  });

  function updateDarkModeClass() {
      if (typeof document !== 'undefined') {
          if (isDarkMode) {
              document.documentElement.classList.add('dark');
              document.body.classList.add('dark-mode');
          } else {
              document.documentElement.classList.remove('dark');
              document.body.classList.remove('dark-mode');
          }
      }
  }

  function handleImageError(event) {
      event.target.src = '/api/placeholder/800/600';
      event.target.onerror = null;
  }

  function getCorridorColor(libraryName) {
      if (libraryName.includes('Corridoio Verde')) return 'green';
      if (libraryName.includes('Corridoio Blu')) return 'blue';
      if (libraryName.includes('Corridoio Arancione')) return 'orange';
      return 'default';
  }

  onMount(() => {
      // Inizializza lo stato del dark mode
      if (typeof document !== 'undefined') {
          const hasDarkMode = document.documentElement.classList.contains('dark');
          darkMode.set(hasDarkMode);
      }
      
      return () => {
          unsubscribe();
      };
  });

  function handleDarkModeChange(event) {
      darkMode.set(event.detail.darkMode);
  }

  const corridorColor = library ? getCorridorColor(library.name) : 'default';
</script>

<div class="app-container min-h-screen flex flex-col" class:dark-mode={isDarkMode}>
  <Header darkMode={isDarkMode} on:darkModeChange={handleDarkModeChange} />

  <main class="flex-grow">
      <div class="container mx-auto px-4 py-8">
          <div class="mb-6">
              <a href="/" class="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Torna alla mappa
              </a>
          </div>

          <header class="mb-8">
              <h1 class="text-3xl font-bold mb-2 dark:text-white">{library.name}</h1>
              <div class="flex items-center">
                  <span class="mr-4 px-3 py-1 rounded-full bg-gray-200 dark:bg-gray-700 text-sm text-black dark:text-white">Piano {library.floor}</span>
              </div>
          </header>

          <div class="flex flex-col md:flex-row gap-8">
              <!-- Pannello Info -->
              <div class="w-full md:w-1/3 order-2 md:order-1">
                  <div class="rounded-lg p-4 shadow-lg h-full" class:bg-gray-800={isDarkMode} class:bg-white={!isDarkMode}>
                      <h2 class="text-xl font-bold mb-4 flex items-center dark:text-white">
                          <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
                          </svg>
                          Informazioni
                      </h2>

                      <!-- Barra ricerca -->
                      <div class="mb-6 w-full">
                          <div class="relative">
                              <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
                              </svg>
                              <input
                                  type="text"
                                  bind:value={searchTerm}
                                  placeholder="Cerca libro..."
                                  class="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 dark:border-gray-700 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                              />
                          </div>

                          <!-- Filtro categoria -->
                          <div class="mt-3">
                              <select
                                  bind:value={selectedCategory}
                                  class="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-700 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                              >
                                  <option value="all">Tutte le categorie</option>
                              </select>
                          </div>
                      </div>
                  </div>
              </div>

              <!-- Mappa -->
              <div class="w-full md:w-2/3 order-1 md:order-2 relative">
                  <div class="rounded-lg shadow-lg overflow-hidden" class:bg-gray-900={isDarkMode} class:bg-white={!isDarkMode}>
                      {#if bookshelf}
                          <img
                              src={bookshelf}
                              alt="bookshelf"
                              class="w-full border-0 rounded-lg"
                              onerror={handleImageError}
                          />
                      {:else}
                          <div class="w-full h-96 flex items-center justify-center">
                              <div class="text-center" class:text-gray-300={isDarkMode} class:text-gray-600={!isDarkMode}>
                                  <svg class="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                  </svg>
                                  <p class="text-lg font-medium">Biblioteca non disponibile</p>
                                  <p class="opacity-70">La biblioteca non è ancora stata caricata</p>
                              </div>
                          </div>
                      {/if}
                  </div>
              </div>
          </div>
      </div>
  </main>

  <Footer />
</div>