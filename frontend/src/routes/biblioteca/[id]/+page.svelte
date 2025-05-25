<script>
    import { onMount } from 'svelte';
    import { darkMode } from '$lib/stores/darkModeStore';
    import Header from '$lib/components/Header.svelte';
    import Footer from '$lib/components/Footer.svelte';
    import bookshelf from '$lib/images/bookshelf.png';
    import libri from '$lib/images/libri lv2.png';
    import primoLibro from '$lib/images/primo libro.png';
    import terzoLibro from '$lib/images/terzo libro.png';
    import quartoLibro from '$lib/images/quarto libro.png';
    
    let searchTerm = $state("");
    let selectedCategory = $state("all");
    let { data } = $props();
    $inspect(data);
  
    const library = data.library;
    const bookDetails = data.bookDetails;
    let isDarkMode = $state(false);
    let categories = $state([]);
    let filteredBooks = $state([]);

    // Funzione per ottenere l'immagine del libro in base alla posizione
    function getBookImage(index) {
        const pattern = [primoLibro, terzoLibro, quartoLibro];
        return pattern[index % pattern.length];
    }

    // Posizioni statiche predefinite per i libri sulla scaffalatura
    const staticBookPositions = [
        { image: libri, left: '7%', top: '29%', width: '36%' },
        { image: libri, left: '59%', top: '29%', width: '36%' },
        { image: libri, left: '7%', top: '53%', width: '36%' },
        { image: libri, left: '59%', top: '53%', width: '36%' },
        { image: libri, left: '7%', top: '77%', width: '36%' },
        { image: libri, left: '59%', top: '77%', width: '36%' }
    ];

    // Posizioni statiche per i singoli libri (primo, terzo, quarto)
    const singleBookPositions = [
        { left: '20%', top: '30%', width: '15%' },  // primoLibro
        { left: '40%', top: '25%', width: '12%' },   // terzoLibro
        { left: '60%', top: '35%', width: '18%' },   // quartoLibro
        { left: '80%', top: '20%', width: '10%' },   // primoLibro (ripetuto)
        { left: '30%', top: '50%', width: '8%' },    // terzoLibro (ripetuto)
        { left: '70%', top: '45%', width: '9%' }     // quartoLibro (ripetuto)
    ];
  
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
  
    // Estrae tutte le categorie uniche dai libri
    function extractCategories() {
        const allCategories = new Set();
        if (library?.books) {
            library.books.forEach(bookTitle => {
                const details = bookDetails[bookTitle];
                if (details?.categoria) {
                    details.categoria.forEach(cat => allCategories.add(cat));
                }
            });
        }
        categories = Array.from(allCategories).sort();
    }
  
    // Filtra i libri in base alla ricerca e categoria
    function filterBooks() {
        if (!library?.books) return [];
        
        return library.books.filter(bookTitle => {
            const details = bookDetails[bookTitle];
            if (!details) return false;
            
            // Filtro per testo di ricerca
            const matchesSearch = searchTerm === "" || 
                bookTitle.toLowerCase().includes(searchTerm.toLowerCase()) || 
                details.autore?.toLowerCase().includes(searchTerm.toLowerCase());
            
            // Filtro per categoria
            const matchesCategory = selectedCategory === "all" || 
                (details.categoria && details.categoria.includes(selectedCategory));
            
            return matchesSearch && matchesCategory;
        });
    }
  
    $effect(() => {
        extractCategories();
        filteredBooks = filterBooks();
    });
  
    $effect(() => {
        filteredBooks = filterBooks();
    });
  
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
                <h1 class="text-3xl font-bold mb-2 dark:text-white">{library?.name || 'Biblioteca non trovata'}</h1>
                {#if library}
                    <div class="flex items-center">
                        <span class="mr-4 px-3 py-1 rounded-full bg-gray-200 dark:bg-gray-700 text-sm text-black dark:text-white">Piano {library.floor}</span>
                    </div>
                {/if}
            </header>

            {#if !library}
                <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
                    <p>La biblioteca richiesta non è stata trovata.</p>
                </div>
            {:else}
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
                                        placeholder="Cerca libro o autore..."
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
                                        {#each categories as category}
                                            <option value={category}>{category}</option>
                                        {/each}
                                    </select>
                                </div>
                            </div>

                            <!-- Lista libri -->
                            <div>
                                <h3 class="text-lg font-semibold mb-3 dark:text-white">Libri disponibili ({filteredBooks.length})</h3>
                                <div class="max-h-96 overflow-y-auto">
                                    {#if filteredBooks.length === 0}
                                        <p class="text-gray-500 dark:text-gray-400">Nessun libro trovato</p>
                                    {:else}
                                        <ul class="divide-y divide-gray-200 dark:divide-gray-700">
                                            {#each filteredBooks as bookTitle}
                                                <li class="py-3">
                                                    <div class="flex flex-col">
                                                        <span class="font-medium dark:text-white">{bookTitle}</span>
                                                        {#if bookDetails[bookTitle]?.autore}
                                                            <span class="text-sm text-gray-600 dark:text-gray-300">di {bookDetails[bookTitle].autore}</span>
                                                        {/if}
                                                        <div class="mt-1 flex flex-wrap gap-1">
                                                            {#if bookDetails[bookTitle]?.categoria}
                                                                {#each bookDetails[bookTitle].categoria as cat}
                                                                    <span class="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">{cat}</span>
                                                                {/each}
                                                            {/if}
                                                            {#if bookDetails[bookTitle]?.prestabile}
                                                                <span class="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Prestabile</span>
                                                            {:else}
                                                                <span class="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">Consultazione</span>
                                                            {/if}
                                                        </div>
                                                    </div>
                                                </li>
                                            {/each}
                                        </ul>
                                    {/if}
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Mappa con libri -->
                    <div class="w-full md:w-2/3 order-1 md:order-2 relative">
                        <div class="rounded-lg shadow-lg overflow-hidden relative" class:bg-gray-900={isDarkMode} class:bg-white={!isDarkMode}>
                            {#if bookshelf}
                                <img
                                    src={bookshelf}
                                    alt="bookshelf"
                                    class="w-full border-0 rounded-lg"
                                    onerror={handleImageError}
                                />

                                <!-- Scaffalature statiche (rimangono sempre) -->
                                {#each staticBookPositions as pos, i}
                                    <img 
                                        src={pos.image} 
                                        alt={`Libri livello ${i+1}`} 
                                        class="absolute" 
                                        style={`
                                            left: ${pos.left};
                                            top: ${pos.top};
                                            width: ${pos.width};
                                        `}
                                    />
                                {/each}

                                <!-- Libri singoli generati dinamicamente -->
                                {#if library?.books}
                                    {#each Array(Math.min(library.books.length, singleBookPositions.length)) as _, i}
                                        <img 
                                            src={getBookImage(i)} 
                                            alt={`Libro ${i+1}`} 
                                            class="absolute" 
                                            style={`
                                                left: ${singleBookPositions[i].left};
                                                top: ${singleBookPositions[i].top};
                                                width: ${singleBookPositions[i].width};
                                            `}
                                        />
                                    {/each}
                                {/if}
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
            {/if}
        </div>
    </main>

    <Footer />
</div>