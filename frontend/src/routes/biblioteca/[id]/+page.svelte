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
    import '$lib/styles/global.css';
    
    const EMAILJS_SERVICE_ID = 'service_opxdmeg';
    const EMAILJS_TEMPLATE_ID = 'template_0jmtcw9'; 
    const EMAILJS_PUBLIC_KEY = 'a6ieldfCHB9FESOfG';

    let searchTerm = $state("");
    let selectedCategory = $state("all");
    let highlightedBookIndex = $state(null);
    let selectedBook = $state(null);
    let showBookModal = $state(false);
    let bookingSuccess = $state(false);
    let { data } = $props();
    $inspect(data);
    $inspect(showBookModal);
  
    const library = data.library;
    const bookDetails = data.bookDetails;
    let isDarkMode = $state(false);
    let categories = $state([]);
    let filteredBooks = $state([]);

    // funzione per ottenere l'immagine del libro in base alla posizione
    function getBookImage(index) {
        const pattern = [primoLibro, terzoLibro, quartoLibro];
        return pattern[index % pattern.length];
    }

    // posizioni statiche predefinite per i libri sulla scaffalatura
    const staticBookPositions = [
        { image: libri, left: '7%', top: '29%', width: '36%' },
        { image: libri, left: '59%', top: '29%', width: '36%' },
        { image: libri, left: '7%', top: '53%', width: '36%' },
        { image: libri, left: '59%', top: '53%', width: '36%' },
        { image: libri, left: '7%', top: '77%', width: '36%' },
        { image: libri, left: '59%', top: '77%', width: '36%' }
    ];

    function generateBookPositions(count) {
        return Array.from({ length: count }).map((_, i) => {
            const left = `${9 + (i * 5.1)}%`;
            return {
                left: left,
                top: '4%',
                width: '5%'
            };
        });
    }

    // calcola le posizioni in base al numero di libri nella biblioteca
    let bookPositions = $derived(
        library?.books ? generateBookPositions(library.books.length) : []
    );

    function handleBookClick(bookTitle) {
    console.log("handleBookClick chiamato con:", bookTitle);
    console.log("bookDetails disponibili:", Object.keys(bookDetails));
    
    // verifica solo se esistono i dettagli del libro
    if (!bookDetails[bookTitle]) {
        console.error("Dettagli libro non trovati in bookDetails:", bookTitle);
        console.log("Titoli disponibili:", Object.keys(bookDetails));
        return;
    }

    // trova l'indice del libro per l'immagine (se esiste in library.books)
    const bookIndex = library?.books ? library.books.indexOf(bookTitle) : 0;
    
    selectedBook = {
        title: bookTitle,
        details: bookDetails[bookTitle],
        // usa l'immagine dal database o una immagine generata in base all'indice
        image: bookDetails[bookTitle].immagine || getBookImage(Math.max(0, bookIndex))
    };
    
    console.log("Libro selezionato:", selectedBook);
    console.log("Impostando showBookModal a true");
    
    showBookModal = true;
    bookingSuccess = false;
    
    // forza un re-render (se necessario)
    setTimeout(() => {
        console.log("showBookModal dopo timeout:", showBookModal);
    }, 100);
}

    function handleBookImageHover(index) {
        highlightedBookIndex = index;
    }

    function handleBookImageLeave() {
        highlightedBookIndex = null;
    }

    function handleListItemHover(bookTitle) {
        const bookIndex = library.books.indexOf(bookTitle);
        highlightedBookIndex = bookIndex;
    }

    function handleListItemLeave() {
        highlightedBookIndex = null;
    }

    function isBookHighlighted(bookTitle) {
        const bookIndex = library.books.indexOf(bookTitle);
        return highlightedBookIndex === bookIndex;
    }

    async function handleBooking() {
    if (!selectedBook) {
        showToast('Errore: nessun libro selezionato', 'error');
        return;
    }

    if (typeof emailjs === 'undefined') {
        showToast('Errore: servizio email non disponibile', 'error');
        return;
    }

    try {
        bookingSuccess = false;
        showToast('Invio prenotazione in corso...', 'info');
        
        // parametri semplici per EmailJS
        const templateParams = {
            libro_titolo: selectedBook.title,
            libro_autore: selectedBook.details.autore || 'Non specificato',
            libro_codice: selectedBook.details.codiceLibro || 'Non specificato',
            biblioteca_nome: library?.name || 'Non specificata',
            data_prenotazione: new Date().toLocaleDateString('it-IT'),
            ora_prenotazione: new Date().toLocaleTimeString('it-IT'),
            utente_nome: 'Gregory Aaron Dionisi', //informazioni da aggiungere per eventuale profilo
            utente_classe: '5BI'
        };

        console.log('Invio email a: gregoryd324@gmail.com');
        console.log('Parametri:', templateParams);

        // usa emailjs.send con 4 parametri
        const result = await emailjs.send(
            'service_opxdmeg',      // Service ID
            'template_0jmtcw9',     // Template ID  
            templateParams,         // Parametri
            'a6ieldfCHB9FESOfG'    // Public Key
        );

        console.log('SUCCESS!', result.status, result.text);
        
        // successo
        bookingSuccess = true;
        showToast(`Prenotazione inviata per "${selectedBook.title}"!`, 'success');
        
        // chiudi dopo 3 secondi
        setTimeout(() => {
            bookingSuccess = false;
            showBookModal = false;
        }, 3000);
        
    } catch (error) {
        console.error('FAILED...', error);
        showToast(`Errore: ${error.text || error.message || 'Riprova più tardi'}`, 'error');
    }
}



// FUNZIONI DI SUPPORTO
function saveBookingLocally(book, params) {
    // salva in memoria per la sessione (non localStorage per Claude.ai)
    if (!window.bookingHistory) {
        window.bookingHistory = [];
    }
    
    window.bookingHistory.push({
        id: Date.now(),
        book: book,
        params: params,
        timestamp: new Date().toISOString()
    });
}

function showToast(message, type = 'info') {
    // crea un toast notification semplice
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 transition-all duration-300 ${
        type === 'success' ? 'bg-green-500 text-white' : 
        type === 'error' ? 'bg-red-500 text-white' : 
        'bg-blue-500 text-white'
    }`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // rimuovi dopo 4 secondi
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => document.body.removeChild(toast), 300);
    }, 4000);
    
    return toast;
}
  
    // sottoscrizione allo store darkMode
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
  
    function filterBooks() {
        if (!library?.books) return [];
        
        return library.books.filter(bookTitle => {
            const details = bookDetails[bookTitle];
            if (!details) return false;
            
            const matchesSearch = searchTerm === "" || 
                bookTitle.toLowerCase().includes(searchTerm.toLowerCase()) || 
                details.autore?.toLowerCase().includes(searchTerm.toLowerCase());
            
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
    // inizializza EmailJS se disponibile
    if (typeof emailjs !== 'undefined') {
        try {
            emailjs.init(EMAILJS_PUBLIC_KEY);
            console.log('EmailJS inizializzato correttamente');
        } catch (error) {
            console.error('Errore inizializzazione EmailJS:', error);
        }
    } else {
        console.warn('EmailJS non trovato. Le prenotazioni non funzioneranno.');
    }

    // gestione dark mode
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
                    <!-- pannello info -->
                    <div class="w-full md:w-1/3 order-2 md:order-1">
                        <div class="rounded-lg p-4 shadow-lg h-full" class:bg-gray-800={isDarkMode} class:bg-white={!isDarkMode}>
                            <h2 class="text-xl font-bold mb-4 flex items-center dark:text-white">
                                <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
                                </svg>
                                Informazioni
                            </h2>

                            <!-- barra ricerca -->
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

                                <!-- filtro categoria -->
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

                            <!-- lista libri -->
                            <div>
                                <h3 class="text-lg font-semibold mb-3 dark:text-white">Libri disponibili ({filteredBooks.length})</h3>
                                <div class="max-h-full overflow-y-auto">
                                    {#if filteredBooks.length === 0}
                                        <p class="text-gray-500 dark:text-gray-400">Nessun libro trovato</p>
                                    {:else}
                                        <ul class="divide-y divide-gray-200 dark:divide-gray-700">
                                            {#each filteredBooks as bookTitle}
                                                <li 
                                                    class="book-item py-3 cursor-pointer transition-all duration-200 rounded-md px-2 hover:bg-blue-100 dark:hover:bg-blue-900"
                                                    class:bg-blue-100={isBookHighlighted(bookTitle) && !isDarkMode}
                                                    class:dark:bg-blue-900={isBookHighlighted(bookTitle) && isDarkMode}
                                                    class:ring-2={isBookHighlighted(bookTitle)}
                                                    class:ring-blue-400={isBookHighlighted(bookTitle)}
                                                    style="outline: none !important; border: none !important; -webkit-tap-highlight-color: transparent;"
                                                    onclick={() => handleBookClick(bookTitle)}
                                                    onmouseenter={() => handleListItemHover(bookTitle)}
                                                    onmouseleave={handleListItemLeave}
                                                    tabindex="0"
                                                    role="button"
                                                    aria-label="Seleziona libro {bookTitle}"
                                                >
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

                    <!-- mappa con libri -->
                    <div class="w-full md:w-2/3 order-1 md:order-2 relative">
                        <div class="rounded-lg shadow-lg overflow-hidden relative" class:bg-gray-900={isDarkMode} class:bg-white={!isDarkMode}>
                            {#if bookshelf}
                                <img
                                    src={bookshelf}
                                    alt="bookshelf"
                                    class="w-full border-0 rounded-lg"
                                    onerror={handleImageError}
                                />

                                <!-- scaffalature statiche -->
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

                                <!-- libri singoli generati dinamicamente -->
                                {#if library?.books}
                                    {#each bookPositions as pos, i}
                                        <img 
                                            src={getBookImage(i)} 
                                            alt={`Libro ${i+1}: ${library.books[i]}`} 
                                            class="absolute cursor-pointer transition-all duration-300 hover:scale-110"
                                            class:ring-4={highlightedBookIndex === i}
                                            class:ring-yellow-400={highlightedBookIndex === i}
                                            class:brightness-125={highlightedBookIndex === i}
                                            class:shadow-lg={highlightedBookIndex === i}
                                            class:drop-shadow-lg={highlightedBookIndex === i}
                                            style={`
                                                left: ${pos.left};
                                                top: ${pos.top};
                                                width: ${pos.width};
                                                z-index: ${highlightedBookIndex === i ? 10 : 1};
                                            `}
                                            onmouseenter={() => handleBookImageHover(i)}
                                            onmouseleave={handleBookImageLeave}
                                            onclick={() => handleBookClick(library.books[i])}
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
    <!-- modal del libro -->
    {#if showBookModal && selectedBook}
    <div 
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        style="background-color: rgba(0, 0, 0, 0.5); position: fixed; top: 0; left: 0; right: 0; bottom: 0;"
    >
        <div 
            class="relative rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300"
            class:bg-white={!isDarkMode}
            class:bg-gray-800={isDarkMode}
            style="opacity: 1; transform: scale(1);"
        >
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
                <!-- colonna sinistra - copertina -->
                <div class="md:col-span-1 flex flex-col items-center">
                    <img 
                        src={selectedBook.image} 
                        alt={`Copertina di ${selectedBook.title}`}
                        class="w-full h-auto max-h-96 object-contain rounded-lg shadow-md"
                        onerror={(e) => { e.target.src = primoLibro; }}
                    />
                </div>
                
                <!-- colonna destra - dettagli -->
                <div class="md:col-span-2">
                    <h2 class="text-2xl font-bold mb-2" class:text-white={isDarkMode}>
                        {selectedBook.title}
                    </h2>
                    
                    <div class="space-y-4">
                        <div>
                            <h3 class="text-lg font-semibold" class:text-gray-300={isDarkMode}>Autore</h3>
                            <p class:text-gray-200={isDarkMode}>
                                {selectedBook.details.autore || 'Non specificato'}
                            </p>
                        </div>
                        
                        <div>
                            <h3 class="text-lg font-semibold" class:text-gray-300={isDarkMode}>Casa Editrice</h3>
                            <p class:text-gray-200={isDarkMode}>
                                {selectedBook.details.casaEditrice || 'Non specificata'}
                            </p>
                        </div>
                        
                        <div>
                            <h3 class="text-lg font-semibold" class:text-gray-300={isDarkMode}>Categorie</h3>
                            <div class="flex flex-wrap gap-2">
                                {#each selectedBook.details.categoria || [] as cat}
                                    <span class="px-3 py-1 rounded-full text-sm"
                                        class:bg-blue-100={!isDarkMode}
                                        class:text-blue-800={!isDarkMode}
                                        class:bg-blue-900={isDarkMode}
                                        class:text-blue-200={isDarkMode}>
                                        {cat}
                                    </span>
                                {/each}
                            </div>
                        </div>
                        
                        <div>
                            <h3 class="text-lg font-semibold" class:text-gray-300={isDarkMode}>Disponibilità</h3>
                            <p class:text-gray-200={isDarkMode}>
                                {selectedBook.details.prestabile === 'VERO' ? 
                                    'Disponibile per il prestito' : 
                                    'Solo consultazione in biblioteca'}
                            </p>
                        </div>
                        
                        <div>
                            <h3 class="text-lg font-semibold" class:text-gray-300={isDarkMode}>Collocazione</h3>
                            <p class:text-gray-200={isDarkMode}>
                                {selectedBook.details.collocazione || 'Non specificata'}
                            </p>
                        </div>

                        <div>
                            <h3 class="text-lg font-semibold" class:text-gray-300={isDarkMode}>Codice Libro</h3>
                            <p class:text-gray-200={isDarkMode}>
                                {selectedBook.details.codiceLibro || 'Non specificato'}
                            </p>
                        </div>
                    </div>
                    
                    <!-- messaggio di successo o pulsante Prenota -->
                    {#if bookingSuccess}
                        <div class="mt-6 p-4 rounded-lg"
                            class:bg-green-100={!isDarkMode}
                            class:bg-green-900={isDarkMode}>
                            <p class="font-medium"
                            class:text-green-800={!isDarkMode}
                            class:text-green-200={isDarkMode}>
                                Prenotazione confermata per "{selectedBook.title}"!
                            </p>
                            <p class="text-sm mt-1"
                            class:text-green-600={!isDarkMode}
                            class:text-green-300={isDarkMode}>
                                Riceverai una notifica quando il libro sarà pronto per il ritiro.
                            </p>
                        </div>
                    {:else}
                        <div class="mt-6 flex justify-end">
                            <button 
                                onclick={handleBooking}
                                class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                                disabled={selectedBook.details.prestabile !== 'VERO'}
                            >
                                Prenota
                            </button>
                        </div>
                    {/if}
                </div>
            </div>
            
            <!-- pulsante chiusura -->
            <button 
                onclick={() => showBookModal = false}
                class="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label="Chiudi"
            >
                <svg class="w-6 h-6 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    </div>
    {/if}
</div>