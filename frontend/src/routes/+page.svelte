<script>
  import { onMount, tick } from 'svelte';
  import { fade, slide, fly } from 'svelte/transition';
  import logo from '$lib/images/LOGO.LEGGERO.trspnt.png';
  import emblemaRepubblica from '$lib/images/Emblema della Repubblica Italiana.svg';
  import pianoTerra from '$lib/images/piano-terra.jpg';
  import pianoPrimo from '$lib/images/piano-primo.jpg';
  import pianoSecondo from '$lib/images/piano-secondo.jpg';
  
  // Stato per gestire il piano attualmente selezionato
  let currentFloor = 0;
  const floors = [
    { id: 0, name: 'Piano Terra', icon: 'home' },
    { id: 1, name: 'Primo Piano', icon: 'arrow-up-1' },
    { id: 2, name: 'Piano Secondo', icon: 'arrow-up-2' }
  ];
  
  // Percorsi delle immagini per i diversi piani
  const floorImages = [
    pianoTerra,
    pianoPrimo,
    pianoSecondo
  ];
  
  // Tema chiaro/scuro
  let darkMode = false;
  
  // Posizione del pallino che rappresenta l'utente
  let userPosition = { x: 525, y: 510 };
  
  // Stato per l'animazione
  let isAnimating = false;
  let selectedLibrary = null;
  let showDetailsPanel = false;
  
  // Termini di ricerca e filtri
  let searchTerm = "";
  let selectedCategory = "all";
  
  // Categorie di libri disponibili
  const categories = [
    { id: "all", name: "Tutte le categorie" },
    { id: "fiction", name: "Narrativa" },
    { id: "science", name: "Scienze" },
    { id: "history", name: "Storia" },
    { id: "languages", name: "Lingue" },
    { id: "tech", name: "Tecnologia" }
  ];
  
  // Dati delle biblioteche arricchiti
  const libraries = [
    { 
      id: 1, 
      name: 'Biblioteca Scientifica', 
      floor: 0, 
      x: 550, 
      y: 400, 
      books: 250,
      categories: ['science', 'tech'],
      description: 'Collezione specializzata in testi scientifici, manuali tecnici e riviste del settore.',
      openingHours: '8:30 - 16:30',
      favorites: 24
    },
    { 
      id: 2, 
      name: 'Biblioteca Umanistica', 
      floor: 1, 
      x: 300, 
      y: 300, 
      books: 320,
      categories: ['history', 'fiction'],
      description: 'Ampia collezione di letteratura classica e contemporanea, saggi storici e filosofici.',
      openingHours: '9:00 - 17:00',
      favorites: 42
    },
    { 
      id: 3, 
      name: 'Biblioteca Lingue', 
      floor: 1, 
      x: 450, 
      y: 250, 
      books: 180,
      categories: ['languages'],
      description: 'Testi in diverse lingue straniere, dizionari e materiale didattico per l\'apprendimento linguistico.',
      openingHours: '9:00 - 16:00',
      favorites: 18
    },
    { 
      id: 4, 
      name: 'Mediateca', 
      floor: 2, 
      x: 700, 
      y: 400, 
      books: 120,
      categories: ['tech', 'fiction', 'languages'],
      description: 'Risorse multimediali, film, audiolibri e software didattici.',
      openingHours: '10:00 - 18:00',
      favorites: 36
    }
  ];
  
  // Lista dei preferiti dell'utente
  let userFavorites = [];
  
  // Filtra le biblioteche per il piano corrente, termine di ricerca e categoria
  $: visibleLibraries = libraries
    .filter(lib => lib.floor === currentFloor)
    .filter(lib => lib.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(lib => selectedCategory === "all" || lib.categories.includes(selectedCategory));
  
  // Gestione della selezione del piano
  function selectFloor(floorId) {
    currentFloor = floorId;
    // Resetta la selezione quando si cambia piano
    selectedLibrary = null;
    showDetailsPanel = false;
  }
  
  // Toggle tema chiaro/scuro
  function toggleDarkMode() {
    darkMode = !darkMode;
    document.body.classList.toggle('dark-mode', darkMode);
  }
  
  // Gestione dei preferiti
  function toggleFavorite(libraryId) {
    if (userFavorites.includes(libraryId)) {
      userFavorites = userFavorites.filter(id => id !== libraryId);
    } else {
      userFavorites = [...userFavorites, libraryId];
    }
    // Salva preferiti in localStorage
    localStorage.setItem('favorites', JSON.stringify(userFavorites));
  }
  
  // Gestore per il click su una biblioteca
  async function handleLibraryClick(library) {
    if (isAnimating) return;
    
    if (selectedLibrary && selectedLibrary.id === library.id) {
      showDetailsPanel = !showDetailsPanel;
      return;
    }
    
    selectedLibrary = library;
    isAnimating = true;
    showDetailsPanel = true;
    
    // Generiamo un percorso semplice per l'animazione
    const path = generatePath(userPosition, { x: library.x, y: library.y });
    
    // Animiamo il movimento lungo il percorso
    for (const point of path) {
      userPosition = point;
      await new Promise(resolve => setTimeout(resolve, 30));
    }
    
    // Attendiamo un momento prima di completare l'animazione
    setTimeout(() => {
      isAnimating = false;
    }, 300);
  }
  
  // Genera un percorso semplice tra due punti
  function generatePath(start, end) {
    const path = [];
    const steps = 15; // Meno passi per un'animazione più veloce
    
    for (let i = 0; i <= steps; i++) {
      const ratio = i / steps;
      const x = start.x + (end.x - start.x) * ratio;
      const y = start.y + (end.y - start.y) * ratio;
      path.push({ x, y });
    }
    
    return path;
  }
  
  // Funzioni per gestire i fallimenti di caricamento delle immagini
  function handleImageError(event) {
    event.target.src = '/api/placeholder/64/64';
    event.target.onerror = null;
  }
  
  function handleMapImageError(event) {
    event.target.src = '/api/placeholder/800/600';
    event.target.onerror = null;
  }
  
  // Carica preferiti da localStorage quando il componente è montato
  onMount(() => {
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
      userFavorites = JSON.parse(savedFavorites);
    }
    
    // Controlla se l'utente preferisce il tema scuro
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDarkMode) {
      darkMode = true;
      document.body.classList.add('dark-mode');
    }
  });
</script>

<div class="app-container min-h-screen" class:dark-mode={darkMode}>
<!-- Header con logo e titolo -->
<header class="primary-color py-4 px-6 flex justify-between items-center">
  <div class="flex items-center">
    <img src={logo} alt="Logo della scuola" class="h-16 w-16 mr-4 hover:scale-105 transition-transform" 
         on:error={handleImageError} />
  </div>
  <h1 class="text-4xl font-medium text-center flex-grow text-white castelli-title">CastelliShelf</h1>
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

<!-- Barra di ricerca e filtri -->
<div class="search-container mx-auto px-6 py-4 flex flex-wrap gap-4 items-center justify-between">
  <div class="search-box relative w-full md:w-1/3">
    <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"></path>
    </svg>
    <input 
      type="text" 
      bind:value={searchTerm}
      placeholder="Cerca biblioteca..." 
      class="pl-10 pr-4 py-2 w-full rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:outline-none"
    />
  </div>
  
  <div class="filter-box w-full md:w-auto">
    <select 
      bind:value={selectedCategory}
      class="px-4 py-2 rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:outline-none appearance-none bg-no-repeat bg-right"
      style="background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23007CB2%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E');
      background-size: 12px 12px; padding-right: 28px;"
    >
      {#each categories as category}
        <option value={category.id}>{category.name}</option>
      {/each}
    </select>
  </div>
</div>

<!-- Menu dei piani -->
<div class="floor-selector flex justify-center mb-6">
  {#each floors as floor}
    <button 
      class="py-3 px-6 text-lg font-medium rounded-t-lg transition-all transform hover:translate-y-[-4px] relative {currentFloor === floor.id ? 'primary-color' : ''}"
      on:click={() => selectFloor(floor.id)}
    >
      <span class="flex items-center gap-2">
        <!-- Icon per il piano -->
        {#if floor.icon === 'home'}
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
          </svg>
        {:else if floor.icon === 'arrow-up-1'}
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
          </svg>
        {:else}
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 11l7-7 7 7M5 19l7-7 7 7"></path>
          </svg>
        {/if}
        {floor.name}
      </span>
      {#if currentFloor === floor.id}
        <div class="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t"></div>
      {/if}
    </button>
  {/each}
</div>

<!-- Container principale con la mappa e il pannello informativo -->
<main class="container mx-auto px-4 flex flex-col md:flex-row gap-6">
  <!-- Pannello informativo a sinistra -->
  <div class="w-full md:w-1/3 order-2 md:order-1">
    <div class="info-panel rounded-lg p-4 shadow-lg h-full">
      <h2 class="text-xl font-bold mb-4 flex items-center">
        <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
        </svg>
        Informazioni
      </h2>
      
      {#if selectedLibrary && showDetailsPanel}
        <div class="library-details rounded-lg p-5 mb-4" transition:slide>
          <div class="flex justify-between items-start">
            <h3 class="font-bold text-lg mb-3">{selectedLibrary.name}</h3>
            <button 
              class="favorite-btn p-1 rounded-full" 
              on:click={() => toggleFavorite(selectedLibrary.id)}
              aria-label={userFavorites.includes(selectedLibrary.id) ? "Rimuovi dai preferiti" : "Aggiungi ai preferiti"}
            >
              <svg class="w-6 h-6 {userFavorites.includes(selectedLibrary.id) ? 'text-yellow-500 fill-current' : 'text-gray-400'}" 
                   viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
              </svg>
            </button>
          </div>
          
          <div class="stats-grid grid grid-cols-2 gap-4 mb-4">
            <div class="stat-box p-3 rounded-lg">
              <span class="block text-sm opacity-70">Libri disponibili</span>
              <span class="text-2xl font-semibold">{selectedLibrary.books}</span>
            </div>
            <div class="stat-box p-3 rounded-lg">
              <span class="block text-sm opacity-70">Orari</span>
              <span class="text-lg">{selectedLibrary.openingHours}</span>
            </div>
            <div class="stat-box p-3 rounded-lg col-span-2">
              <span class="block text-sm opacity-70">Categorie</span>
              <div class="flex flex-wrap gap-2 mt-1">
                {#each selectedLibrary.categories as categoryId}
                  {#if categories.find(c => c.id === categoryId)}
                    <span class="category-tag px-2 py-1 text-xs rounded-full">
                      {categories.find(c => c.id === categoryId).name}
                    </span>
                  {/if}
                {/each}
              </div>
            </div>
          </div>
          
          <p class="text-sm mb-4">{selectedLibrary.description}</p>
          
          <div class="flex justify-between mt-4">
            <span class="flex items-center text-sm">
              <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
              </svg>
              {selectedLibrary.favorites} preferiti
            </span>
            <button class="primary-color px-4 py-2 rounded-lg text-white">
              Visualizza catalogo
            </button>
          </div>
        </div>
      {:else}
        <div class="empty-state p-6 rounded-lg text-center" transition:fade>
          <svg class="w-16 h-16 mx-auto mb-4 opacity-40" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1zm-5 8.274l-.818 2.552c.25.112.526.174.818.174.292 0 .569-.062.818-.174L5 10.274zm10 0l-.818 2.552c.25.112.526.174.818.174.292 0 .569-.062.818-.174L15 10.274z" clip-rule="evenodd"></path>
          </svg>
          <p>Seleziona una biblioteca sulla mappa per visualizzare le informazioni dettagliate.</p>
        </div>
        
        <!-- Sezione Preferiti, visibile solo quando non c'è una biblioteca selezionata -->
        {#if userFavorites.length > 0}
          <div class="favorites-section mt-6" transition:slide>
            <h3 class="text-lg font-semibold mb-3 flex items-center">
              <svg class="w-5 h-5 mr-2 text-yellow-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
              </svg>
              Le tue biblioteche preferite
            </h3>
            <ul class="space-y-2">
              {#each libraries.filter(lib => userFavorites.includes(lib.id)) as lib}
                <li class="favorite-item p-3 rounded-lg flex justify-between items-center" 
                    on:click={() => {
                      if (lib.floor !== currentFloor) {
                        selectFloor(lib.floor);
                        setTimeout(() => handleLibraryClick(lib), 100);
                      } else {
                        handleLibraryClick(lib);
                      }
                    }}>
                  <div>
                    <span class="font-medium">{lib.name}</span>
                    <span class="block text-xs opacity-70">{floors[lib.floor].name}</span>
                  </div>
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </li>
              {/each}
            </ul>
          </div>
        {/if}
      {/if}
    </div>
  </div>
  
  <!-- Mappa a destra -->
  <div class="w-full md:w-2/3 order-1 md:order-2 relative">
    <div class="map-container rounded-lg shadow-lg overflow-hidden">
      <!-- Immagine della mappa -->
      {#if floorImages[currentFloor]}
        <img 
          src={floorImages[currentFloor]} 
          alt={`Mappa ${floors[currentFloor].name}`}
          class="w-full border-0 rounded-lg"
          on:error={handleMapImageError}
        />
      {:else}
        <!-- Fallback quando l'immagine non è disponibile -->
        <div class="w-full h-96 flex items-center justify-center">
          <div class="text-center">
            <svg class="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path>
            </svg>
            <p class="text-lg font-medium">Mappa non disponibile</p>
            <p class="opacity-70">La mappa per {floors[currentFloor].name} non è ancora stata caricata</p>
          </div>
        </div>
      {/if}
      
      <!-- Pallino che rappresenta l'utente -->
      {#if currentFloor === 0}
        <div 
          class="absolute w-5 h-5 bg-blue-500 rounded-full border-2 border-white shadow-lg transform -translate-x-1/2 -translate-y-1/2"
          style="left: {userPosition.x}px; top: {userPosition.y}px; z-index: 10;"
        >
          <!-- Effetto ping migliorato -->
          <div class="ping-animation"></div>
        </div>
      {/if}
      
      <!-- Punti che rappresentano le biblioteche -->
      {#each visibleLibraries as library}
        <button 
          class="absolute transform -translate-x-1/2 -translate-y-1/2 hover:scale-110 transition-transform duration-200 ease-in-out"
          style="left: {library.x}px; top: {library.y}px; z-index: 5;"
          on:click={() => handleLibraryClick(library)}
          title={library.name}
        >
          <div class="library-marker-container">
            <div class="library-marker {selectedLibrary && selectedLibrary.id === library.id ? 'active' : ''}">
              <!-- Icona personalizzata in base alla categoria principale -->
              {#if library.categories.includes('science')}
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd"></path>
                </svg>
              {:else if library.categories.includes('languages')}
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fill-rule="evenodd" d="M7 2a1 1 0 011 1v1h3a1 1 0 110 2H9.578a18.87 18.87 0 01-1.724 4.78c.29.354.596.696.914 1.026a1 1 0 11-1.44 1.389c-.188-.196-.373-.396-.554-.6a19.098 19.098 0 01-3.107 3.567 1 1 0 01-1.334-1.49 17.087 17.087 0 003.13-3.733 18.992 18.992 0 01-1.487-2.494 1 1 0 111.79-.89c.234.47.489.928.764 1.372.417-.934.752-1.913.997-2.927H3a1 1 0 110-2h3V3a1 1 0 011-1zm6 6a1 1 0 01.894.553l2.991 5.982a.869.869 0 01.02.037l.99 1.98a1 1 0 11-1.79.895L15.383 16h-4.764l-.724 1.447a1 1 0 11-1.788-.894l.99-1.98.019-.038 2.99-5.982A1 1 0 0113 8zm-1.382 6h2.764L13 11.236 11.618 14z" clip-rule="evenodd"></path>
                </svg>
              {:else if library.categories.includes('tech')}
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fill-rule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clip-rule="evenodd"></path>
                </svg>
              {:else}
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"></path>
                </svg>
              {/if}
            </div>
            
            <!-- Badge per indicare i preferiti -->
            {#if userFavorites.includes(library.id)}
              <div class="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full border border-white"></div>
            {/if}
          </div>
        </button>
        
        <!-- Tooltip per il nome della biblioteca quando si passa sopra -->
        {#if selectedLibrary && selectedLibrary.id === library.id}
          <div 
            class="tooltip absolute px-3 py-2 rounded-lg shadow-lg text-sm font-medium"
            style="left: {library.x + 20}px; top: {library.y - 40}px; z-index: 20;" 
            transition:fade={{duration: 200}}
          >
            {library.name}
          </div>
        {/if}
      {/each}
      

      <!-- Controlli di zoom e navigazione -->
      <div class="map-controls absolute bottom-4 right-4 flex flex-col">
        <button class="p-2 map-control transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
        </button>
        <button class="p-2 map-control  transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 12H6"></path>
          </svg>
        </button>
        <div class="border-t border-gray-200 dark:border-gray-700"></div>
        <button class="p-2 map-control transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6">
            </path>
          </svg>
        </button>
      </div>                
    </div>
  </div>
</main>

<!-- Statistiche della biblioteca -->
<section class="stats-section container mx-auto px-4 py-6 mt-6">
  <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
    <div class="stat-card p-4 rounded-lg shadow-md">
      <h3 class="text-sm font-medium opacity-70">Totale Biblioteche</h3>
      <p class="text-3xl font-bold">{libraries.length}</p>
    </div>
    <div class="stat-card p-4 rounded-lg shadow-md">
      <h3 class="text-sm font-medium opacity-70">Totale Libri</h3>
      <p class="text-3xl font-bold">{libraries.reduce((total, lib) => total + lib.books, 0)}</p>
    </div>
    <div class="stat-card p-4 rounded-lg shadow-md">
      <h3 class="text-sm font-medium opacity-70">Categoria Principale</h3>
      <p class="text-3xl font-bold">Scienze</p>
    </div>
    <div class="stat-card p-4 rounded-lg shadow-md">
      <h3 class="text-sm font-medium opacity-70">Utenti Attivi</h3>
      <p class="text-3xl font-bold">127</p>
    </div>
  </div>
</section>

<!-- Footer -->
<footer class="copyright-custom-gray py-4 mt-8 text-center text-white">
  <div class="container mx-auto px-4">
    <div class="flex flex-col md:flex-row justify-between items-center">
      <div class="mb-4 md:mb-0">
        <p class="text-lg font-bold">CastelliShelf</p>
        <p class="opacity-70">Sistema di navigazione biblioteche</p>
      </div>
      
      <div class="flex space-x-4">
        <a href="#" class="footer-link hover:underline">Home</a>
        <a href="#" class="footer-link hover:underline">Biblioteche</a>
        <a href="#" class="footer-link hover:underline">Contatti</a>
        <a href="#" class="footer-link hover:underline">About</a>
      </div>
      
      <div>
        <p class="opacity-70">© 2025 CastelliShelf</p>
      </div>
    </div>
  </div>
</footer>
</div>

<style>
:global(body) {
  margin: 0;
  font-family: 'Inter', 'Segoe UI', 'Roboto', sans-serif;
  transition: background-color 0.3s, color 0.3s;
}

:root {
  --primary-color: rgb(54, 123, 198);
}

:root {
  --primary-color-darker: rgb(40, 90, 160);
}

:root {
  --secondary-color: rgb(235, 112, 45);
}

:root {
  --tertiary-color: rgb(113, 173, 147);
}

.map-controls {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.dark-mode .map-controls {
  background-color: #1e1e1e;
}



.app-container {
  background-color: #f8f9fa;
  color: #333;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.dark-mode.app-container {
  background-color: #121212;
  color: #f0f0f0;
}

.info-panel {
  background-color: white;
  border: 1px solid #e5e7eb;
}

.dark-mode .info-panel {
  background-color: #1e1e1e;
  border-color: #333;
}

.library-details {
  background-color: #f8fafc;
  border: 1px solid #e5e7eb;
}

.dark-mode .library-details {
  background-color: #2d2d2d;
  border-color: #444;
}

.empty-state {
  background-color: #f8fafc;
  border: 1px solid #e5e7eb;
}

.dark-mode .empty-state {
  background-color: #2d2d2d;
  border-color: #444;
}

.stat-box {
  background-color: #f0f9ff;
  border: 1px solid #e0f2fe;
}

.dark-mode .stat-box {
  background-color: #1e293b;
  border-color: #334155;
}

.category-tag {
  background-color: #e0f2fe;
  color: #0369a1;
}

.dark-mode .category-tag {
  background-color: #0c4a6e;
  color: #bae6fd;
}

button.primary-color:hover {
  background-color: var(--primary-color-darker);
  transition: background-color 0.2s;
}

.favorite-item {
  background-color: #f8fafc;
  border: 1px solid #e5e7eb;
  cursor: pointer;
  transition: all 0.2s;
}

.favorite-item:hover {
  background-color: #f0f9ff;
  transform: translateY(-2px);
}

.dark-mode .favorite-item {
  background-color: #2d2d2d;
  border-color: #444;
}

.dark-mode .favorite-item:hover {
  background-color: #374151;
}

.library-marker-container {
  position: relative;
}

.library-marker {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--secondary-color);
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
}

.library-marker.active {
  background-color: rgb(54, 123, 198);
  transform: scale(1.2);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.tooltip {
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  white-space: nowrap;
}

.dark-mode .tooltip {
  background-color: rgba(255, 255, 255, 0.9);
  color: #333;
}


/* le card sopra il footer */
.stat-card {
  background-color: white;
  border: 1px solid #e5e7eb;
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}


.dark-mode .stat-card {
  background-color: #1e1e1e;
  border-color: #333;
}

.ping-animation {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: rgba(59, 130, 246, 0.5);
  animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
}

@keyframes ping {
  0% {
    transform: scale(1);
    opacity: 0.8;
  }
  75%, 100% {
    transform: scale(2.5);
    opacity: 0;
  }
}


.footer-link {
  color: #93c5fd;
}

/* Input fields */
input, select {
  background-color: white;
  color: #333;
  border: 1px solid #e5e7eb;
}

/* il cerca e il menu a tendina */
.dark-mode input, .dark-mode select {
  background-color: #1e1e1e;
  color: #f0f0f0;
  border-color: #4b5563;
}

.castelli-title {
  font-family: 'Titillium Web', sans-serif;
}

.primary-color {
  background-color: var(--primary-color);
}
.secondary-color {
  background-color: var(--secondary-color);
}
.tertiary-color {
  background-color: var(--tertiary-color);
}
.footer-color {
	background-color: rgb(51, 51, 51);
}
.title-custom-blue {
	color: rgb(58, 77, 110);
}
.copyright-custom-gray {
	background-color: rgb(69, 69, 69);
} 
</style>