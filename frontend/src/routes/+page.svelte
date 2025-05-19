<script>
  import { onMount, tick } from 'svelte';
  import { fade, slide, fly } from 'svelte/transition';
  import pianoTerra from '$lib/images/piano-terra.jpg';
  import pianoPrimo from '$lib/images/piano-primo.jpg';
  import pianoSecondo from '$lib/images/piano-secondo.jpg';

  import '$lib/styles/global.css';

  import Footer from '$lib/components/Footer.svelte';
  import Statistics from '$lib/components/Statistics.svelte';
  import Header from '$lib/components/Header.svelte';
  
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
  const defaultUserPosition = { x: 33, y: 85 };
  let userPositionPercent = { ...defaultUserPosition };
  
  // Stato per l'animazione
  let isAnimating = false;
  let selectedLibrary = null;
  let showDetailsPanel = false;
  
  // Termini di ricerca e filtri
  let searchTerm = "";
  let selectedCategory = "all";
  
  // Categorie di libri disponibili
  const books = [
  {
    codiceLibro: 16884,
    CDD: "035.1 ENC",
    numeroInventario: 4042,
    collocazione: "Biblioteca Corridoio Blu Piano Terra",
    autore: "ENCICLOPEDIA ITALIANA",
    titolo: "Enciclopedia italiana di scienze lettere ed arti - vol. XII - CROCE-DIR",
    casaEditrice: "TRECCANI",
    prestabile: "VERO",
    categoria: ["Enciclopedia"]
  },
  {
    codiceLibro: 14562,
    CDD: "500 SCI",
    numeroInventario: 3221,
    collocazione: "Biblioteca Corridoio Verde Piano Terra",
    autore: "Stephen Hawking",
    titolo: "Dal Big Bang ai buchi neri",
    casaEditrice: "BUR",
    prestabile: "VERO",
    categoria: ["Scienze"]
  },
  {
    codiceLibro: 11230,
    CDD: "800 ENG",
    numeroInventario: 2101,
    collocazione: "Biblioteca Corridoio Verde Primo Piano",
    autore: "William Shakespeare",
    titolo: "Romeo and Juliet",
    casaEditrice: "Penguin Classics",
    prestabile: "FALSO",
    categoria: ["Lingue", "Narrativa"]
  },
  {
    codiceLibro: 19203,
    CDD: "900 HIS",
    numeroInventario: 4760,
    collocazione: "Biblioteca Corridoio Blu Primo Piano",
    autore: "Alessandro Barbero",
    titolo: "La battaglia. Storia di Waterloo",
    casaEditrice: "Laterza",
    prestabile: "VERO",
    categoria: ["Storia"]
  },
  {
    codiceLibro: 15670,
    CDD: "600 TEC",
    numeroInventario: 3098,
    collocazione: "Biblioteca Corridoio Verde Secondo Piano",
    autore: "James Dyson",
    titolo: "Invention: A Life",
    casaEditrice: "Simon & Schuster",
    prestabile: "VERO",
    categoria: ["Tecnologia"]
  }
];

  
// Dati delle biblioteche con coordinate percentuali
const libraries = [
  {
    id: 1,
    name: 'Biblioteca Corridoio Verde Piano Terra',
    floor: 0,
    xPercent: 38,
    yPercent: 55,
    books: ['Dal Big Bang ai buchi neri'],
    description: 'Collezione specializzata in testi scientifici, manuali tecnici e riviste del settore.',
    favorites: 24
  },
  {
    id: 2,
    name: 'Biblioteca Corridoio Blu Piano Terra',
    floor: 0,
    xPercent: 85,
    yPercent: 77,
    books: ['Enciclopedia italiana di scienze lettere ed arti - vol. XII - CROCE-DIR'],
    description: 'Ampia collezione di letteratura classica e contemporanea, saggi storici e filosofici.',
    favorites: 42
  },
  {
    id: 3,
    name: 'Biblioteca Corridoio Verde Primo Piano',
    floor: 1,
    xPercent: 38,
    yPercent: 55,
    books: ['Romeo and Juliet'],
    description: 'Testi in diverse lingue straniere, dizionari e materiale didattico per l\'apprendimento linguistico.',
    favorites: 18
  },
  {
    id: 4,
    name: 'Biblioteca Corridoio Blu Primo Piano',
    floor: 1,
    xPercent: 85,
    yPercent: 77,
    books: ['La battaglia. Storia di Waterloo'],
    description: 'Risorse multimediali, film, audiolibri e software didattici.',
    favorites: 36
  },
  {
    id: 5,
    name: 'Biblioteca Corridoio Arancione Primo Piano',
    floor: 1,
    xPercent: 42,
    yPercent: 80,
    books: [],
    description: 'Risorse multimediali, film, audiolibri e software didattici.',
    favorites: 36
  },
  {
    id: 6,
    name: 'Biblioteca Corridoio Verde Secondo Piano',
    floor: 2,
    xPercent: 38,
    yPercent: 55,
    books: ['Invention: A Life'],
    description: 'Risorse multimediali, film, audiolibri e software didattici.',
    favorites: 36
  },
  {
    id: 7,
    name: 'Biblioteca Corridoio Blu Secondo Piano',
    floor: 2,
    xPercent: 85,
    yPercent: 77,
    books: [],
    description: 'Risorse multimediali, film, audiolibri e software didattici.',
    favorites: 36
  }
];




function handleDarkModeChange(event) {
    darkMode = event.detail.darkMode;
  }

// Funzione per estrarre il colore dal nome della biblioteca
function getCorridorColor(libraryName) {
  if (libraryName.includes('Corridoio Verde')) {
    return 'green';
  } else if (libraryName.includes('Corridoio Blu')) {
    return 'blue';
  } else if (libraryName.includes('Corridoio Arancione')) {
    return 'orange';
  } else {
    return 'default'; // Colore di default se non viene rilevato nessun corridoio
  }
}
  
  // Lista dei preferiti dell'utente
  let userFavorites = [];
  
  // Variabile reattiva che produce un array nuovo con le categorie estratte per ogni libreria
  $: librariesWithCategories = libraries.map(lib => {
    // per ogni titolo di libro nella libreria, cerco il libro completo e prendo le categorie
    const libCategories = lib.books
      .map(title => {
        const bookObj = books.find(b => b.titolo === title);
        return bookObj ? bookObj.categoria : [];
      })
      .flat();

    // estraggo solo categorie uniche
    const uniqueCategories = [...new Set(libCategories)];

    // restituisco una copia dell'oggetto libreria con solo la nuova proprietà categories calcolata
    return { ...lib, categories: uniqueCategories };
  });

  // Estrai tutte le categorie uniche dai libri
  $: allBookCategories = Array.from(
    new Set(books.flatMap(book => book.categoria))
  ).sort();

  // Aggiungi "Tutte le categorie" all'inizio
  $: categories = ["Tutte le categorie", ...allBookCategories];

  // Filtra le biblioteche in base al piano, ricerca e categoria
  $: visibleLibraries = librariesWithCategories
    .filter(lib => lib.floor === currentFloor)
    .filter(lib => lib.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(lib =>
      selectedCategory === "all" || selectedCategory === "Tutte le categorie"
        ? true
        : lib.categories.includes(selectedCategory) // qui usi lib.categories, non lib.books
    );

  
    // Gestione della selezione del piano
    function selectFloor(floorId) {
    currentFloor = floorId;
    // Resetta la posizione del pallino a quella di default
    userPositionPercent = { ...defaultUserPosition };
    selectedLibrary = null;
    showDetailsPanel = false;
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

  // Memorizza la biblioteca precedente
  const previousLibraryId = selectedLibrary ? selectedLibrary.id : null;
  
  selectedLibrary = library;
  isAnimating = true;
  showDetailsPanel = true;
  
  // Generiamo un percorso personalizzato per l'animazione
  const path = generatePath(
    userPositionPercent, 
    { x: library.xPercent, y: library.yPercent },
    library.id,
    previousLibraryId  // Aggiungiamo l'ID della biblioteca precedente
  );
  
  // Animiamo il movimento lungo il percorso
  for (const point of path) {
    userPositionPercent = point;
    await new Promise(resolve => setTimeout(resolve, 30));
  }
  
  // Attendiamo un momento prima di completare l'animazione
  setTimeout(() => {
    isAnimating = false;
  }, 300);
}
  
function generatePath(start, end, libraryId, previousLibraryId) {
  const steps = 15;
  
  // Definiamo alcuni percorsi standard riutilizzabili
  const standardRoutes = {
    // Percorso da sinistra a destra (tipo Scientifica → Umanistica)
    "leftToRight": [
      { x: 38, y: 55 },    // Punto partenza tipo Biblioteca Scientifica
      { x: 36, y: 55 },    // Leggermente a sinistra
      { x: 36, y: 79 },    // Discesa verticale
      { x: 85, y: 79 },    // Movimento orizzontale
      { x: 85, y: 77 }     // Aggiustamento finale e arrivo
    ],
    
    // Percorso da destra a sinistra (tipo Umanistica → Scientifica)
    "rightToLeft": [
      { x: 85, y: 77 },    // Punto partenza tipo Biblioteca Umanistica
      { x: 85, y: 79 },    // Leggermente verso l'alto
      { x: 36, y: 79 },    // Movimento orizzontale
      { x: 36, y: 55 },    // Salita verticale
      { x: 38, y: 55 }     // Aggiustamento finale e arrivo
    ],
    
 
    "5-3": [
      { x: 42, y: 80 },    // Punto partenza (supposto per Corridoio Arancione)
      { x: 36, y: 80 },    // Leggermente in basso
      { x: 36, y: 55 },    // Movimento orizzontale verso le scale
      { x: 38, y: 55 }
    ],
    

    "3-5": [
      { x: 38, y: 55 },    // Punto partenza al secondo piano
      { x: 36, y: 55 },    // Movimento verso le scale
      { x: 36, y: 80 },    // Discesa al primo piano
      { x: 42, y: 80 }
    ],
    

    "5-4": [
      { x: 42, y: 80 },    // Punto partenza (supposto per Corridoio Arancione)
      { x: 42, y: 78 },    // Leggermente in basso
      { x: 85, y: 78 },    // Movimento orizzontale verso le scale
      { x: 85, y: 77 }
    ],
    

    "4-5": [
      { x: 85, y: 77 },    // Punto partenza al secondo piano
      { x: 85, y: 78 },    // Movimento verso le scale
      { x: 42, y: 78 },    // Discesa al primo piano
      { x: 42, y: 80 }
    ]
  };
  
  // Mappa delle coppie che utilizzano percorsi standard
  const routePatterns = {

    "leftToRight": ["1-2", "3-4", "6-7"],
    "rightToLeft": ["2-1", "4-3", "7-6"],
    "5-3": ["5-3"],
    "3-5": ["3-5"],
    "5-4": ["5-4"],
    "4-5": ["4-5"]
  };

  // Controlla prima i percorsi speciali
  if (previousLibraryId) {
    const pathKey = `${previousLibraryId}-${libraryId}`;
    
    // Cerca se questa coppia usa uno dei percorsi standard
    for (const [routeType, pairs] of Object.entries(routePatterns)) {
      if (pairs.includes(pathKey)) {
        return interpolatePath(standardRoutes[routeType], steps);
      }
    }
  }
  
  // Percorsi personalizzati per singola biblioteca
  const customPaths = {
    1: [ // Biblioteca Corridoio Verde Piano Terra
      { x: start.x, y: start.y }, 
      { x: start.x + 3, y: start.y }, 
      { x: start.x + 3, y: end.y }, 
      { x: end.x, y: end.y } 
    ],
    2: [ // Biblioteca Corridoio Blu Piano Terra
      { x: start.x, y: start.y },
      { x: start.x + 3, y: start.y },
      { x: start.x + 3, y: start.y - 6 },
      { x: end.x, y: start.y - 6 },
      { x: end.x, y: end.y } 
    ],
    3: [ // Biblioteca Corridoio Verde Primo Piano
      { x: start.x, y: start.y }, 
      { x: start.x + 3, y: start.y },
      { x: start.x + 3, y: end.y }, 
      { x: end.x, y: end.y } 
    ],
    4: [ // Biblioteca Corridoio Blu Primo Piano
      { x: start.x, y: start.y },
      { x: start.x + 3, y: start.y },
      { x: start.x + 3, y: start.y - 6 },
      { x: end.x, y: start.y - 6 },
      { x: end.x, y: end.y } 
    ],
    5: [ // Biblioteca Corridoio Arancione Primo Piano
      { x: start.x, y: start.y },        
      { x: start.x + 3, y: start.y },         
      { x: start.x + 3, y: end.y },   
      { x: end.x, y: end.y }
    ],
    6: [ // Biblioteca Corridoio Verde Secondo Piano
      { x: start.x, y: start.y },
      { x: start.x + 3, y: start.y }, 
      { x: start.x + 3, y: end.y }, 
      { x: end.x, y: end.y } 
    ],
    7: [ // Biblioteca Corridoio Blu Secondo Piano
      { x: start.x, y: start.y },
      { x: start.x + 3, y: start.y }, 
      { x: start.x + 3, y: start.y - 6 }, 
      { x: end.x, y: start.y - 6 }, 
      { x: end.x, y: end.y } 
    ]
  };
  
  // Se esiste un percorso standard per questa biblioteca
  if (customPaths[libraryId]) {
    return interpolatePath(customPaths[libraryId], steps);
  }

  // Fallback vuoto (nessun movimento)
  return [end];
}

// Funzione di interpolazione del percorso
function interpolatePath(waypoints, stepsPerSegment) {
  const result = [];
  
  // Per ogni segmento tra due waypoints
  for (let i = 0; i < waypoints.length - 1; i++) {
    const start = waypoints[i];
    const end = waypoints[i + 1];
    
    // Crea steps punti interpolati tra start e end
    for (let step = 0; step <= stepsPerSegment; step++) {
      const t = step / stepsPerSegment;
      const x = start.x + (end.x - start.x) * t;
      const y = start.y + (end.y - start.y) * t;
      
      result.push({ x, y });
    }
    
    // Rimuovi l'ultimo punto per evitare duplicati (tranne per l'ultimo segmento)
    if (i < waypoints.length - 2) {
      result.pop();
    }
  }
  
  return result;
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
<Header {darkMode} on:darkModeChange={handleDarkModeChange}/>

<!-- Menu dei piani con header che occupa solo lo spazio necessario -->
<header class="flex sticky shadow-lg top-0 z-10 -mt-4 justify-between items-center mb-6 primary-color p-4 rounded-lg 
  w-full sm:w-10/12 md:w-8/12 lg:w-6/12 xl:w-auto mx-auto"> <!-- Gestire la larghezza in tutti i dispositivi -->
  
  <!-- Contenitore per i pulsanti dei piani -->
  <div class="flex space-x-6">
    {#each floors as floor}
      <button 
        class="py-3 px-6 text-lg font-medium rounded-lg transition-all transform hover:translate-y-[-4px] relative primary-color text-white hover:bg-blue-700"
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
          <div class="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-b-lg"></div>
        {/if}
      </button>
    {/each}
  </div>
</header>





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
      <!-- Barra di ricerca migliorata -->
<div class="search-box mb-6 w-full">
  <div class="relative">
    <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"></path>
    </svg>
    <input 
      type="text" 
      bind:value={searchTerm}
      placeholder="Cerca biblioteca..." 
      class="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 dark:border-gray-700 shadow-sm focus:ring-2 focus:ring-primary focus:border-primary dark:focus:border-primary transition-colors dark:bg-gray-800 dark:text-white"
    />
  </div>
  
  <!-- Filtro per categorie -->
  <div class="category-filter mt-3">
    <select 
      bind:value={selectedCategory}
      class="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-700 shadow-sm focus:ring-2 focus:ring-primary focus:border-primary dark:focus:border-primary transition-colors dark:bg-gray-800 dark:text-white"
    >
      <option value="all">Tutte le categorie</option>
      {#each allBookCategories as category}
        <option value={category}>{category}</option>
      {/each}
    </select>
  </div>
</div>
      
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
              <span class="text-2xl font-semibold">{selectedLibrary.books.length}</span>
            </div>
          
            <div class="stat-box p-3 rounded-lg">
              <span class="block text-sm opacity-70">Piano</span>
              <span class="text-2xl font-semibold">{selectedLibrary.floor}</span>
            </div>
          
            <div class="stat-box p-3 rounded-lg col-span-2">
              <span class="block text-sm opacity-70">Categorie</span>
              <div class="flex flex-wrap gap-2 mt-1">
                {#each selectedLibrary.categories as categoryId}
                  {#if categories.find(c => c === categoryId)}
                    <span class="category-tag px-2 py-1 text-xs rounded-full">
                      {categoryId}
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
      

    <div 
      class="absolute w-5 h-5 bg-blue-500 rounded-full border-2 border-white shadow-lg transform -translate-x-1/2 -translate-y-1/2"
      style="left: {userPositionPercent.x}%; top: {userPositionPercent.y}%; z-index: 10;"
    >
      <!-- Effetto ping migliorato -->
      <div class="ping-animation"></div>
    </div>
      

      {#each visibleLibraries as library}
    <button 
      class="absolute transform -translate-x-1/2 -translate-y-1/2 hover:scale-110 transition-transform duration-200 ease-in-out"
      style="left: {library.xPercent}%; top: {library.yPercent}%; z-index: 5;"
      on:click={() => handleLibraryClick(library)}
      title={library.name}
    >
      <div class="library-marker-container">
        <div class="library-marker {selectedLibrary && selectedLibrary.id === library.id ? 'active' : ''}"
        data-corridor-color={getCorridorColor(library.name)}>
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
        style="left: {library.xPercent}%; top: calc({library.yPercent}% - 40px); z-index: 20;" 
        transition:fade={{duration: 200}}
      >
        {library.name}
      </div>
    {/if}
    {/each}               
    </div>
  </div>
</main>
<Statistics {libraries}/>
<Footer />
</div>