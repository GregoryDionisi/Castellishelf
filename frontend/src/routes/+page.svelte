<script>
    import { onMount } from 'svelte';
    import logo from '$lib/images/LOGO.LEGGERO.trspnt.png';
    import emblemaRepubblica from '$lib/images/Emblema della Repubblica Italiana.svg';
    import pianoTerra from '$lib/images/piano-terra.jpg';
    import pianoPrimo from '$lib/images/piano-primo.jpg';
    import pianoSecondo from '$lib/images/piano-secondo.jpg';
    
    // Stato per gestire il piano attualmente selezionato
    let currentFloor = 0;
    const floors = [
      { id: 0, name: 'Piano Terra' },
      { id: 1, name: 'Primo Piano' },
      { id: 2, name: 'Piano Secondo' }
    ];
    
    // Percorsi delle immagini per i diversi piani - importiamo direttamente le immagini
    const floorImages = [
      pianoTerra,
      pianoPrimo,  // Segnaposto per il primo piano (da aggiungere in futuro)
      pianoSecondo   // Segnaposto per il secondo piano (da aggiungere in futuro)
    ];
    
    // Posizione del pallino che rappresenta l'utente
    let userPosition = { x: 525, y: 510 }; // Posizione iniziale
    
    // Stato per l'animazione
    let isAnimating = false;
    let selectedLibrary = null;
    
    // Dati delle biblioteche (punti sulla mappa)
    const libraries = [
      { id: 1, name: 'Biblioteca Scientifica', floor: 0, x: 550, y: 400, books: 250 },
      { id: 2, name: 'Biblioteca Umanistica', floor: 1, x: 300, y: 300, books: 320 },
      { id: 3, name: 'Biblioteca Lingue', floor: 1, x: 450, y: 250, books: 180 },
      { id: 4, name: 'Mediateca', floor: 2, x: 700, y: 400, books: 120 }
    ];
    
    // Filtra le biblioteche per il piano corrente
    $: visibleLibraries = libraries.filter(lib => lib.floor === currentFloor);
    
    // Gestione della selezione del piano
    function selectFloor(floorId) {
      currentFloor = floorId;
    }
    
    // Gestore per il click su una biblioteca
    async function handleLibraryClick(library) {
      if (isAnimating) return;
      
      selectedLibrary = library;
      isAnimating = true;
      
      // Generiamo un percorso semplice per l'animazione
      const path = generatePath(userPosition, { x: library.x, y: library.y });
      
      // Animiamo il movimento lungo il percorso
      for (const point of path) {
        userPosition = point;
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      // Attendiamo un momento prima di navigare
      setTimeout(() => {
        isAnimating = false;
        // Qui potresti implementare la navigazione alla pagina della biblioteca
        // window.location.href = `/biblioteca/${library.id}`;
      }, 500);
    }
    
    // Genera un percorso semplice tra due punti
    function generatePath(start, end) {
      const path = [];
      const steps = 20; // Numero di passaggi nell'animazione
      
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
</script>
  
<div class="app-container bg-gray-200 min-h-screen">
  <!-- Header con logo e titolo -->
  <header class="bg-gray-200 py-4 px-6 flex justify-between items-center">
    <div class="flex items-center">
      <img src={logo} alt="Logo della scuola" class="h-16 w-16 mr-4" 
           on:error={handleImageError} />
    </div>
    <h1 class="text-4xl font-medium text-center flex-grow title-custom-blue castelli-title">CastelliShelf</h1>
    <div>
      <img src={emblemaRepubblica} alt="Logo Repubblica Italiana" class="h-16 w-16" 
           on:error={handleImageError} />
    </div>
  </header>

  <!-- Menu dei piani -->
  <div class="floor-selector primary-color text-white flex justify-center mb-4">
    {#each floors as floor}
      <button 
        class="py-3 px-6 text-lg font-medium {currentFloor === floor.id ? 'primary-color-darker' : ''}"
        on:click={() => selectFloor(floor.id)}
      >
        {floor.name}
      </button>
    {/each}
  </div>
  
  <!-- Container principale con la mappa e il pannello informativo -->
  <main class="container mx-auto px-4 flex gap-6">
    <!-- Pannello informativo a sinistra -->
    <div class="w-1/3">
      <div class="primary-color rounded-lg p-4 text-white h-96">
        <h2 class="text-xl font-bold mb-4">Informazioni</h2>
        {#if selectedLibrary}
          <div class="bg-white primary-color p-4 rounded">
            <h3 class="font-bold text-lg">{selectedLibrary.name}</h3>
            <p>Libri disponibili: {selectedLibrary.books}</p>
            <p>Piano: {floors[selectedLibrary.floor].name}</p>
          </div>
        {:else}
          <div class="bg-white primary-color p-4 rounded">
            <p>Seleziona una biblioteca sulla mappa per visualizzare le informazioni.</p>
          </div>
        {/if}
      </div>
    </div>
    
    <!-- Mappa a destra -->
    <div class="w-2/3 relative">
      <!-- Immagine della mappa -->
      {#if floorImages[currentFloor]}
        <img 
          src={floorImages[currentFloor]} 
          alt={`Mappa ${floors[currentFloor].name}`}
          class="w-full border-2 border-gray-300"
          on:error={handleMapImageError}
        />
      {:else}
        <!-- Fallback quando l'immagine non è disponibile -->
        <div class="w-full h-96 bg-gray-300 border-2 border-gray-400 flex items-center justify-center">
          <p class="text-gray-600 text-xl">Mappa non disponibile per {floors[currentFloor].name}</p>
        </div>
      {/if}
      
      <!-- Pallino che rappresenta l'utente -->
      {#if currentFloor === 0}
        <div 
          class="absolute w-4 h-4 bg-black rounded-full border-2 border-white shadow-md transform -translate-x-1/2 -translate-y-1/2"
          style="left: {userPosition.x}px; top: {userPosition.y}px; z-index: 10;"
        >
          <!-- Effetto ping -->
          <div class="ping-animation"></div>
        </div>
      {/if}
      
      <!-- Punti che rappresentano le biblioteche -->
      {#each visibleLibraries as library}
        <button 
          class="absolute w-4 h-4 bg-red-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 hover:scale-125 transition-transform"
          style="left: {library.x}px; top: {library.y}px; z-index: 5;"
          on:click={() => handleLibraryClick(library)}
          title={library.name}
        ></button>
      {/each}
      
      <!-- Tooltip per la biblioteca selezionata -->
      {#if selectedLibrary}
        <div 
          class="absolute bg-white p-2 rounded shadow-md text-sm"
          style="left: {selectedLibrary.x + 10}px; top: {selectedLibrary.y - 40}px; z-index: 20;"
        >
          {selectedLibrary.name}
        </div>
      {/if}
    </div>
  </main>
  
  <!-- Footer -->
  <footer class="copyright-custom-gray py-4 mt-8 text-center text-white">
    <p>© 2025 CastelliShelf - Sistema di navigazione biblioteche</p>
  </footer>
</div>

<style>
  :global(body) {
    margin: 0;
    font-family: 'Arial', sans-serif;
  }
  
  .ping-animation {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background-color: rgba(0, 0, 0, 0.5);
    animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
  }
  
  @keyframes ping {
    0% {
      transform: scale(1);
      opacity: 0.6;
    }
    75%, 100% {
      transform: scale(2);
      opacity: 0;
    }
  }

  .castelli-title {
    font-family: 'Titillium Web', sans-serif;
  }
</style>