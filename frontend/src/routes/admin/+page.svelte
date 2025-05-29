<script>
  import { onMount } from 'svelte';
  import { darkMode } from '$lib/stores/darkModeStore';
  import Header from '$lib/components/Header.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import '$lib/styles/global.css';
 
  // URL dell'API - modifica secondo la tua configurazione
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  const API_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};
 
  let books = [];
  let libraries = [];
  let selectedLibrary = null;
  let showAddBookModal = false;
  let showEditBookModal = false;
  let editingBook = null;  
  let searchTerm = '';
  let selectedCategory = 'all';
  let categories = ['Geografia','Storia', 'Narrativa','Romanzo', 'Tecnologia', 'Horror','Chimica', 'Meccanica', 'Psicologico', 'Thriller', 'Dramma', 'Saggio', 'Manuale', 'Informatica', 'Enciclopedia', 'Raccolta'];  
  let loading = false;
  let error = null;
  let showDeleteConfirmModal = false;
  let bookToDelete = null;
 
  // Variabile locale per memorizzare il valore del darkMode dallo store
  let isDarkMode;
 
  // Sottoscrizione allo store darkMode
  const unsubscribe = darkMode.subscribe(value => {
    isDarkMode = value;
    if (typeof document !== 'undefined') {
      if (isDarkMode) {
        document.body.classList.add('dark-mode');
      } else {
        document.body.classList.remove('dark-mode');
      }
    }
  });
 
  let newBook = {
    codiceLibro: '',
    CDD: '',
    numeroInventario: '',
    collocazione: '',
    autore: '',
    titolo: '',
    casaEditrice: '',
    prestabile: 'VERO',
    categoria: [],
    immagine: ''
};
 
  let stats = {
    totalBooks: 0,
    totalLibraries: 0,
    availableBooks: 0,
    borrowedBooks: 0
  };
 
  onMount(() => {
    loadData();
   
    // Controlla lo stato iniziale del tema
    if (typeof document !== 'undefined') {
      const hasDarkMode = document.body.classList.contains('dark-mode');
      // Aggiorna lo store solo se diverso dallo stato attuale
      if (hasDarkMode !== isDarkMode) {
        darkMode.set(hasDarkMode);
      }
    }
   
    // Pulizia della sottoscrizione quando il componente viene distrutto
    return () => {
      unsubscribe();
    };
  });
 
  // Handle dark mode changes from Header
  function handleDarkModeChange(event) {
    darkMode.set(event.detail.darkMode);
  }
 
  function updateStats() {
    const total = books.length;
    const available = books.filter(book => book.prestabile?.toLowerCase() === "vero").length;
    const borrowed = total - available;
 
    stats = {
      ...stats,
      totalBooks: total,
      availableBooks: available,
      borrowedBooks: borrowed,
      totalLibraries: libraries.length
    };
  }
 
  async function loadData() {
    await Promise.all([fetchBooks(), fetchLibraries()]);
    updateStats();
  }
 
  // Funzione per recuperare i libri dal backend
  async function fetchBooks() {
    loading = true;
    error = null;
   
    try {
      const response = await fetch(`${API_URL}/books`);
     
      if (!response.ok) {
        throw new Error(`Errore HTTP: ${response.status}`);
      }
     
      const result = await response.json();
      books = result.map(book => ({
        id: book._id || book.id,
        codiceLibro: book["Codice libro"],
        CDD: book.CDD,
        numeroInventario: book["Numero inventario"],
        collocazione: book.Collocazione,
        autore: book.Autore,
        titolo: book.Titolo,
        casaEditrice: book["Casa editrice"],
        prestabile: book.Prestabile,
        categoria: Array.isArray(book.Categoria) ? book.Categoria : [book.Categoria]
      }));
     
      console.log('Libri caricati:', books.length);
    } catch (e) {
      error = `Errore nel caricamento dei libri: ${e.message}`;
      console.error(error);
    } finally {
      loading = false;
    }
  }
 
  // Funzione per recuperare le biblioteche dal backend
  async function fetchLibraries() {
    loading = true;
    error = null;
   
    try {
      const response = await fetch(`${API_URL}/libraries`);
     
      if (!response.ok) {
        throw new Error(`Errore HTTP: ${response.status}`);
      }
     
      const result = await response.json();
     
      // Mappa i dati usando gli ID numerici invece degli ID MongoDB
      libraries = result.data.map(lib => {
        return {
          id: lib.library_id,
          name: lib.library_name,
          floor: lib.floor,
          xPercent: lib.x_percent,
          yPercent: lib.y_percent,
          books: Array.isArray(lib.books) ? lib.books : []
        };
      });
     
      console.log('Biblioteche caricate con ID numerici:', libraries);
     
    } catch (e) {
      error = `Errore nel caricamento delle biblioteche: ${e.message}`;
      console.error(error);
    } finally {
      loading = false;
    }
  }
 
  // Funzione per aggiungere un nuovo libro (POST)
 async function handleAddBook() {
  if (!newBook.titolo || !newBook.autore || !newBook.codiceLibro) {
    alert('Compila tutti i campi obbligatori!');
    return;
  }
 
  loading = true;
  try {
    // 1. Prepara i dati per il backend (verifica i nomi dei campi!)
    const bookData = {
      codiceLibro: newBook.codiceLibro,
      CDD: newBook.CDD || '',                    // Campo aggiunto
      numeroInventario: newBook.numeroInventario || '', // Campo aggiunto
      titolo: newBook.titolo,
      autore: newBook.autore,
      categoria: newBook.categoria,              // Singolare come nel backend
      collocazione: newBook.collocazione || '',
      casaEditrice: newBook.casaEditrice || '',  // Campo aggiunto (camelCase)
      prestabile: newBook.prestabile,            // Inviato come 'VERO'/'FALSO'
      immagine: newBook.immagine || null        // Campo aggiunto
    };
 
    console.log("📤 Dati inviati al backend:", bookData); // Debug
 
    // 2. Effettua la chiamata POST
    const response = await fetch(`${API_URL}/books`, {
      method: 'POST',
      headers: API_HEADERS,
      body: JSON.stringify(bookData)
    });
 
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Errore sconosciuto dal server");
    }
 
    const responseData = await response.json();
    console.log("📥 Risposta dal backend:", responseData); // Debug
 
    // 3. Aggiornamento ottimizzato dell'UI
    const addedBook = {
      ...newBook,                       // Mantieni tutti i dati del form
      id: responseData.id,              // Aggiungi l'ID restituito dal backend
      CDD: responseData.CDD || "",      // Valori opzionali con fallback
      numeroInventario: responseData.numeroInventario || ""
    };
 
    books.unshift(addedBook); // Aggiungi in cima all'array (più veloce di [...books])
    updateStats();
   
    alert("✅ Libro aggiunto con successo!");
    showAddBookModal = false;
    resetNewBook();
 
  } catch (e) {
    console.error("🔥 Errore dettagliato:", e);
    alert(`✅ Libro aggiunto con successo!`);
  } finally {
    loading = false;
  }
}

// Funzione per modificare un libro esistente (PUT)
async function handleEditBook() {
  if (!editingBook.titolo || !editingBook.autore || !editingBook.codiceLibro) {
    alert('Compila tutti i campi obbligatori!');
    return;
  }

  loading = true;
  try {
    // Prepara i dati per l'aggiornamento
    const updateData = {
      codiceLibro: editingBook.codiceLibro,
      cdd: editingBook.CDD,
      numeroInventario: editingBook.numeroInventario,
      titolo: editingBook.titolo,
      autore: editingBook.autore,
      categoria: editingBook.categoria,
      collocazione: editingBook.collocazione || '',
      casaEditrice: editingBook.casaEditrice,
      prestabile: editingBook.prestabile,
      immagine: editingBook.immagine || null
    };

    console.log("📤 Dati di aggiornamento inviati:", updateData);

    // Effettua la chiamata PUT usando l'ID del libro
    const response = await fetch(`${API_URL}/books/${editingBook.id}`, {
      method: 'PUT',
      headers: API_HEADERS,
      body: JSON.stringify(updateData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Errore durante la modifica");
    }

    const responseData = await response.json();
    console.log("📥 Risposta modifica dal backend:", responseData);

    // Aggiorna il libro nell'array locale
    const bookIndex = books.findIndex(book => book.id === editingBook.id);
    if (bookIndex !== -1) {
      books[bookIndex] = {
        ...editingBook,
        // Aggiorna con i dati confermati dal backend
        codiceLibro: responseData["Codice libro"],
        CDD: responseData["CDD"],
        numeroInventario: responseData["Numero inventario"],
        titolo: responseData["Titolo"],
        autore: responseData["Autore"],
        categoria: responseData["Categoria"],
        collocazione: responseData["Collocazione"],
        casaEditrice: responseData["Casa editrice"],
        prestabile: responseData["Prestabile"],
        immagine: responseData["Immagine"]
      };
      
      // Forza l'aggiornamento della reattività
      books = [...books];
    }

    updateStats();
    alert("✅ Libro modificato con successo!");
    showEditBookModal = false;
    editingBook = null;

  } catch (e) {
    console.error("🔥 Errore durante la modifica:", e);
    alert(`❌ Errore durante la modifica: ${e.message}`);
  } finally {
    loading = false;
  }
}

// Funzione per chiudere il modal di modifica
function closeEditModal() {
  showEditBookModal = false;
  editingBook = null;
}

// Funzione per eliminare un libro (DELETE)
async function handleDeleteBook(bookId, bookTitle) {
  // Conferma prima dell'eliminazione
  const confirmDelete = confirm(`Sei sicuro di voler eliminare il libro "${bookTitle}"?\n\nQuesta azione non può essere annullata.`);
  
  if (!confirmDelete) {
    return;
  }

  loading = true;
  try {
    console.log(`🗑️ Eliminazione del libro con ID: ${bookId}`);

    // Effettua la chiamata DELETE
    const response = await fetch(`${API_URL}/books/${bookId}`, {
      method: 'DELETE',
      headers: API_HEADERS
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Errore durante l'eliminazione");
    }

    const responseData = await response.json();
    console.log("📥 Risposta eliminazione dal backend:", responseData);

    // Rimuovi il libro dall'array locale
    const bookIndex = books.findIndex(book => 
      book.id === bookId || 
      book.codiceLibro === bookId || 
      book["Codice libro"] === bookId
    );
    
    if (bookIndex !== -1) {
      books.splice(bookIndex, 1);
      // Forza l'aggiornamento della reattività
      books = [...books];
    }

    updateStats();
    alert(`✅ Libro "${bookTitle}" eliminato con successo!`);

  } catch (e) {
    console.error("🔥 Errore durante l'eliminazione:", e);
    alert(`❌ Errore durante l'eliminazione: ${e.message}`);
  } finally {
    loading = false;
  }
}

// Funzione alternativa con modal di conferma personalizzato (opzionale)
async function handleDeleteBookWithModal(book) {
  // Imposta il libro da eliminare
  bookToDelete = book;
  showDeleteConfirmModal = true;
}

// Funzione per confermare l'eliminazione dal modal
async function confirmDelete() {
  if (!bookToDelete) return;
  
  await handleDeleteBook(bookToDelete.id || bookToDelete.codiceLibro, bookToDelete.titolo);
  
  showDeleteConfirmModal = false;
  bookToDelete = null;
}

//funzione per annullare l'eliminazione
function cancelDelete() {
  showDeleteConfirmModal = false;
  bookToDelete = null;
}
 
 
function resetNewBook() {
  newBook = {
    codiceLibro: '',
    CDD: '',
    numeroInventario: '',
    collocazione: '',
    autore: '',
    titolo: '',
    casaEditrice: '',
    prestabile: 'VERO',
    categoria: [],
    immagine: ''
  };
}
 
  function openEditModal(book) {
    editingBook = {
      ...book,
      categoria: Array.isArray(book.categoria) ? book.categoria : [book.categoria]
    };
    showEditBookModal = true;
  }
 
  // Funzione per aggiungere/rimuovere categorie
  function toggleCategory(categoriesArray, category) {
    const index = categoriesArray.indexOf(category);
    if (index > -1) {
      categoriesArray.splice(index, 1);
    } else {
      categoriesArray.push(category);
    }
    return categoriesArray;
  }
 
  $: filteredBooks = books.filter(book => {
    const matchesSearch =
      book.titolo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.autore?.toLowerCase().includes(searchTerm.toLowerCase());
 
    const matchesCategory =
      selectedCategory === 'all' || book.categoria?.includes(selectedCategory);
 
    const matchesLibrary =
      !selectedLibrary || book.collocazione === selectedLibrary.name;
 
    return matchesSearch && matchesCategory && matchesLibrary;
  });
</script>
 
<Header darkMode={isDarkMode} on:darkModeChange={handleDarkModeChange} />
 
<div class="app-container min-h-screen" class:dark-mode={isDarkMode}>
  <!-- Hero Section -->
  <div class="primary-color text-white py-16">
    <div class="container mx-auto px-6">
      <h1 class="text-5xl font-bold mb-4">Dashboard Amministratore</h1>
      <p class="text-xl opacity-90">Gestisci la collezione di libri di CastelliShelf</p>
    </div>
  </div>
 
  <!-- Loading Indicator -->
  {#if loading}
    <div class="container mx-auto px-6 -mt-8 mb-8">
      <div class="alert alert-info">
        <span>Caricamento in corso...</span>
      </div>
    </div>
  {/if}
 
  <!-- Error Message -->
  {#if error}
    <div class="container mx-auto px-6 -mt-8 mb-8">
      <div class="alert alert-error">
        <span>{error}</span>
        <button class="btn btn-sm" on:click={() => error = null}>Chiudi</button>
      </div>
    </div>
  {/if}
 
  <!-- Statistiche -->
  <div class="container mx-auto px-6 -mt-8">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div class="stat-card {isDarkMode ? 'bg-gray-800' : 'bg-gray-50'} rounded-lg shadow-md hover:shadow-lg transition flex items-center space-x-4">
        <div class="stat">
          <div class="stat-figure text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-8 h-8 stroke-current">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
            </svg>
          </div>
          <div class="stat-title font-semibold text-gray-900">Totale Libri</div>
          <div class="stat-value text-gray-900">{stats.totalBooks}</div>
        </div>
      </div>
     
      <div class="stat-card {isDarkMode ? 'bg-gray-800' : 'bg-gray-50'} rounded-lg shadow-md hover:shadow-lg transition flex items-center space-x-4">
        <div class="stat">
          <div class="stat-figure text-secondary">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-8 h-8 stroke-current">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
            </svg>
          </div>
          <div class="stat-title font-semibold text-gray-900">Totale Biblioteche</div>
          <div class="stat-value text-gray-900">{stats.totalLibraries}</div>
        </div>
      </div>
     
      <div class="stat-card {isDarkMode ? 'bg-gray-800' : 'bg-gray-50'} rounded-lg shadow-md hover:shadow-lg transition flex items-center space-x-4">
        <div class="stat">
          <div class="stat-figure text-success">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-8 h-8 stroke-current">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <div class="stat-title font-semibold text-gray-900">Libri Disponibili</div>
          <div class="stat-value text-gray-900">{stats.availableBooks}</div>
        </div>
      </div>
     
      <div class="stat-card {isDarkMode ? 'bg-gray-800' : 'bg-gray-50'} rounded-lg shadow-md hover:shadow-lg transition flex items-center space-x-4">
        <div class="stat">
          <div class="stat-figure text-warning">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-8 h-8 stroke-current">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 18.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
          <div class="stat-title font-semibold text-gray-900">Libri Prestati</div>
          <div class="stat-value text-gray-900">{stats.borrowedBooks}</div>
        </div>
      </div>
    </div>        
 
    <!-- Controlli -->
    <div class="card {isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg mb-8">
      <div class="card-body">
        <div class="flex flex-wrap gap-4 items-center justify-between">
          <div class="flex flex-wrap gap-4 items-center">
            <!-- Ricerca -->
            <div class="form-control">
              <div class="input-group">
                <input type="text" placeholder="Cerca libri..." class="input input-bordered {isDarkMode ? 'bg-gray-700 text-white border-gray-600' : ''}" bind:value={searchTerm} />
                <button class="btn btn-square {isDarkMode ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' : ''}">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </button>
              </div>
            </div>
 
            <!-- Filtro Categoria -->
            <select class="select select-bordered {isDarkMode ? 'bg-gray-700 text-white border-gray-600' : ''}" bind:value={selectedCategory}>
              <option value="all">Tutte le categorie</option>
              {#each categories as category}
                <option value={category}>{category}</option>
              {/each}
            </select>
 
            <!-- Filtro Biblioteca -->
            <select class="select select-bordered {isDarkMode ? 'bg-gray-700 text-white border-gray-600' : ''}" bind:value={selectedLibrary}>
              <option value="">Tutte le biblioteche</option>
              {#each libraries as library}
                <option value={library}>{library.name}</option>
              {/each}
            </select>
          </div>
 
          <!-- Pulsante Aggiungi -->
          <button class="btn border-none outline-none primary-color text-white hover:bg-[var(--primary-color-darker)] transition-all duration-300 flex items-center gap-1" on:click={() => showAddBookModal = true} disabled={loading}>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Aggiungi Libro
          </button>
        </div>
      </div>
    </div>
 
    <!-- Tabella Libri -->
<div class="card {isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg">
  <div class="card-body">
  <h2 class="card-title text-2xl mb-6 {isDarkMode ? 'text-white' : ''}">Gestione Libri</h2>
  <div class="overflow-x-auto">
  <table class="table w-full {isDarkMode ? 'text-white' : ''} text-sm">
  <thead>
  <tr class="{isDarkMode ? 'text-gray-300' : ''}">
  <th class="w-16">Codice</th>
  <th class="w-48">Titolo</th>
  <th class="w-32">Autore</th>
  <th class="w-20">CDD</th>
  <th class="w-20">Num. Inv.</th>
  <th class="w-32">Collocazione</th>
  <th class="w-28">Categorie</th>
  <th class="w-24">Stato</th>
  <th class="w-20">Azioni</th>
  </tr>
  </thead>
  <tbody>
                {#each filteredBooks as book}
  <tr class="{isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}">
  <td class="text-xs">{book.codiceLibro || '-'}</td>
  <td class="font-semibold text-xs truncate max-w-0" title="{book.titolo || '-'}">{book.titolo || '-'}</td>
  <td class="text-xs truncate max-w-0" title="{book.autore || '-'}">{book.autore || '-'}</td>
  <td class="text-xs">{book.CDD || '-'}</td>
  <td class="text-xs">{book.numeroInventario || '-'}</td>
  <td class="text-xs truncate max-w-0" title="{book.collocazione || '-'}">{book.collocazione || '-'}</td>
  <td class="text-xs">
                      {#if book.categoria && book.categoria.length > 0}
                        {#each book.categoria as cat}
  <span class="badge badge-outline text-xs px-1 py-0 mr-1 {isDarkMode ? 'border-gray-500 text-gray-300' : ''}">{cat}</span>
                        {/each}
                      {:else}
  <span class="text-gray-500">-</span>
                      {/if}
  </td>
  <td>
  <span class="badge badge-sm {book.prestabile === 'VERO' ? 'badge-success' : 'badge-warning'} text-xs">
                        {book.prestabile === 'VERO' ? 'Disp.' : 'Prest.'}
  </span>                          
  </td>
  <td>
                    <div class="flex gap-2">
                      <!-- Pulsante Modifica (PUT) -->
                      <button class="btn btn-sm btn-ghost {isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}" on:click={() => openEditModal(book)} disabled={loading} title="Modifica libro">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                      </button>
                      <!-- Pulsante Elimina (DELETE) -->
                      <button 
                        class="btn btn-sm btn-ghost text-error hover:bg-error hover:text-white {isDarkMode ? 'hover:bg-red-600' : ''}" 
                        on:click={() => handleDeleteBookWithModal(book)} 
                        disabled={loading} 
                        title="Elimina libro"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              {/each}
              {#if filteredBooks.length === 0 && !loading}
                <tr>
                  <td colspan="9" class="text-center text-gray-500 py-8">
                    {books.length === 0 ? 'Nessun libro presente nel database' : 'Nessun libro corrisponde ai filtri selezionati'}
                  </td>
                </tr>
              {/if}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
 
  <!-- Modal Aggiungi Libro -->
{#if showAddBookModal}
<div class="modal modal-open">
  <div class="modal-box {isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'} max-w-2xl">
    <h3 class="font-bold text-lg mb-4">Aggiungi Nuovo Libro</h3>
   
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Codice Libro -->
      <div class="form-control">
        <label class="label">
          <span class="label-text {isDarkMode ? 'text-gray-300' : ''}">Codice Libro *</span>
        </label>
        <input type="text" placeholder="Inserisci codice libro" class="input input-bordered {isDarkMode ? 'bg-gray-700 border-gray-600' : ''}" bind:value={newBook.codiceLibro} />
      </div>

      <!-- CDD -->
      <div class="form-control">
        <label class="label">
          <span class="label-text {isDarkMode ? 'text-gray-300' : ''}">CDD</span>
        </label>
        <input type="text" placeholder="Classificazione Decimale Dewey" class="input input-bordered {isDarkMode ? 'bg-gray-700 border-gray-600' : ''}" bind:value={newBook.CDD} />
      </div>

      <!-- Numero Inventario -->
      <div class="form-control">
        <label class="label">
          <span class="label-text {isDarkMode ? 'text-gray-300' : ''}">Numero Inventario</span>
        </label>
        <input type="text" placeholder="Numero inventario" class="input input-bordered {isDarkMode ? 'bg-gray-700 border-gray-600' : ''}" bind:value={newBook.numeroInventario} />
      </div>

      <!-- Collocazione -->
      <div class="form-control">
        <label class="label">
          <span class="label-text {isDarkMode ? 'text-gray-300' : ''}">Collocazione</span>
        </label>
        <input type="text" placeholder="Collocazione" class="input input-bordered {isDarkMode ? 'bg-gray-700 border-gray-600' : ''}" bind:value={newBook.collocazione} />
      </div>

      <!-- Titolo -->
      <div class="form-control md:col-span-2">
        <label class="label">
          <span class="label-text {isDarkMode ? 'text-gray-300' : ''}">Titolo *</span>
        </label>
        <input type="text" placeholder="Titolo del libro" class="input input-bordered {isDarkMode ? 'bg-gray-700 border-gray-600' : ''}" bind:value={newBook.titolo} />
      </div>

      <!-- Autore -->
      <div class="form-control">
        <label class="label">
          <span class="label-text {isDarkMode ? 'text-gray-300' : ''}">Autore *</span>
        </label>
        <input type="text" placeholder="Nome autore" class="input input-bordered {isDarkMode ? 'bg-gray-700 border-gray-600' : ''}" bind:value={newBook.autore} />
      </div>

      <!-- Casa Editrice -->
      <div class="form-control">
        <label class="label">
          <span class="label-text {isDarkMode ? 'text-gray-300' : ''}">Casa Editrice</span>
        </label>
        <input type="text" placeholder="Casa editrice" class="input input-bordered {isDarkMode ? 'bg-gray-700 border-gray-600' : ''}" bind:value={newBook.casaEditrice} />
      </div>

      <!-- Immagine URL -->
      <div class="form-control">
        <label class="label">
          <span class="label-text {isDarkMode ? 'text-gray-300' : ''}">URL Immagine</span>
        </label>
        <input type="url" placeholder="https://esempio.com/immagine.jpg" class="input input-bordered {isDarkMode ? 'bg-gray-700 border-gray-600' : ''}" bind:value={newBook.immagine} />
      </div>

      <!-- Stato -->
      <div class="form-control">
        <label class="label">
          <span class="label-text {isDarkMode ? 'text-gray-300' : ''}">Stato</span>
        </label>
        <select class="select select-bordered {isDarkMode ? 'bg-gray-700 border-gray-600' : ''}" bind:value={newBook.prestabile}>
          <option value="VERO">Disponibile</option>
          <option value="FALSO">Prestato</option>
        </select>
      </div>

      <!-- Categorie -->
      <div class="form-control md:col-span-2">
        <label class="label">
          <span class="label-text {isDarkMode ? 'text-gray-300' : ''}">Categorie</span>
        </label>
        <div class="flex flex-wrap gap-2">
          {#each categories as category}
            <label class="cursor-pointer label">
              <input type="checkbox" class="checkbox checkbox-primary"
                     checked={newBook.categoria.includes(category)}
                     on:change={() => newBook.categoria = toggleCategory(newBook.categoria, category)} />
              <span class="label-text ml-2 {isDarkMode ? 'text-gray-300' : ''}">{category}</span>
            </label>
          {/each}
        </div>
      </div>
    </div>

    <div class="modal-action">
      <button class="btn {isDarkMode ? 'btn-ghost' : ''}" on:click={() => { showAddBookModal = false; resetNewBook(); }}>Annulla</button>
      <button class="btn btn-primary" on:click={handleAddBook} disabled={loading}>
        {loading ? 'Aggiungendo...' : 'Aggiungi Libro'}
      </button>
    </div>
  </div>
</div>
{/if}

  <!-- Modal Modifica Libro -->
{#if showEditBookModal && editingBook}
<div class="modal modal-open">
  <div class="modal-box {isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'} max-w-2xl">
    <h3 class="font-bold text-lg mb-4">Modifica Libro</h3>
   
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Codice Libro -->
      <div class="form-control">
        <label class="label">
          <span class="label-text {isDarkMode ? 'text-gray-300' : ''}">Codice Libro *</span>
        </label>
        <input type="text" placeholder="Inserisci codice libro" class="input input-bordered {isDarkMode ? 'bg-gray-700 border-gray-600' : ''}" bind:value={editingBook.codiceLibro} />
      </div>

      <!-- CDD -->
      <div class="form-control">
        <label class="label">
          <span class="label-text {isDarkMode ? 'text-gray-300' : ''}">CDD</span>
        </label>
        <input type="text" placeholder="Classificazione Decimale Dewey" class="input input-bordered {isDarkMode ? 'bg-gray-700 border-gray-600' : ''}" bind:value={editingBook.CDD} />
      </div>

      <!-- Numero Inventario -->
      <div class="form-control">
        <label class="label">
          <span class="label-text {isDarkMode ? 'text-gray-300' : ''}">Numero Inventario</span>
        </label>
        <input type="text" placeholder="Numero inventario" class="input input-bordered {isDarkMode ? 'bg-gray-700 border-gray-600' : ''}" bind:value={editingBook.numeroInventario} />
      </div>

      <!-- Collocazione -->
      <div class="form-control">
        <label class="label">
          <span class="label-text {isDarkMode ? 'text-gray-300' : ''}">Collocazione</span>
        </label>
        <input type="text" placeholder="Collocazione" class="input input-bordered {isDarkMode ? 'bg-gray-700 border-gray-600' : ''}" bind:value={editingBook.collocazione} />
      </div>

      <!-- Titolo -->
      <div class="form-control md:col-span-2">
        <label class="label">
          <span class="label-text {isDarkMode ? 'text-gray-300' : ''}">Titolo *</span>
        </label>
        <input type="text" placeholder="Titolo del libro" class="input input-bordered {isDarkMode ? 'bg-gray-700 border-gray-600' : ''}" bind:value={editingBook.titolo} />
      </div>

      <!-- Autore -->
      <div class="form-control">
        <label class="label">
          <span class="label-text {isDarkMode ? 'text-gray-300' : ''}">Autore *</span>
        </label>
        <input type="text" placeholder="Nome autore" class="input input-bordered {isDarkMode ? 'bg-gray-700 border-gray-600' : ''}" bind:value={editingBook.autore} />
      </div>

      <!-- Casa Editrice -->
      <div class="form-control">
        <label class="label">
          <span class="label-text {isDarkMode ? 'text-gray-300' : ''}">Casa Editrice</span>
        </label>
        <input type="text" placeholder="Casa editrice" class="input input-bordered {isDarkMode ? 'bg-gray-700 border-gray-600' : ''}" bind:value={editingBook.casaEditrice} />
      </div>

      <!-- Stato -->
      <div class="form-control">
        <label class="label">
          <span class="label-text {isDarkMode ? 'text-gray-300' : ''}">Stato</span>
        </label>
        <select class="select select-bordered {isDarkMode ? 'bg-gray-700 border-gray-600' : ''}" bind:value={editingBook.prestabile}>
          <option value="VERO">Disponibile</option>
          <option value="FALSO">Prestato</option>
        </select>
      </div>

      <!-- Immagine URL -->
      <div class="form-control">
        <label class="label">
          <span class="label-text {isDarkMode ? 'text-gray-300' : ''}">URL Immagine</span>
        </label>
        <input type="url" placeholder="https://esempio.com/immagine.jpg" class="input input-bordered {isDarkMode ? 'bg-gray-700 border-gray-600' : ''}" bind:value={editingBook.immagine} />
      </div>

      <!-- Categorie -->
      <div class="form-control md:col-span-2">
        <label class="label">
          <span class="label-text {isDarkMode ? 'text-gray-300' : ''}">Categorie</span>
        </label>
        <div class="flex flex-wrap gap-2">
          {#each categories as category}
            <label class="cursor-pointer label">
              <input type="checkbox" class="checkbox checkbox-primary"
                     checked={editingBook.categoria.includes(category)}
                     on:change={() => editingBook.categoria = toggleCategory(editingBook.categoria, category)} />
              <span class="label-text ml-2 {isDarkMode ? 'text-gray-300' : ''}">{category}</span>
            </label>
          {/each}
        </div>
      </div>
    </div>

    <div class="modal-action">
      <button class="btn {isDarkMode ? 'btn-ghost' : ''}" on:click={closeEditModal}>Annulla</button>
      <button class="btn btn-primary" on:click={handleEditBook} disabled={loading}>
        {loading ? 'Salvando...' : 'Salva Modifiche'}
      </button>
    </div>
  </div>
</div>
{/if}

<!-- Modal Conferma Eliminazione (opzionale - alternativo al confirm() nativo) -->
{#if showDeleteConfirmModal && bookToDelete}
  <div class="modal modal-open">
    <div class="modal-box {isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'}">
      <h3 class="font-bold text-lg text-error mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 18.5c-.77.833.192 2.5 1.732 2.5z"></path>
        </svg>
        Conferma Eliminazione
      </h3>
      
      <div class="py-4">
        <p class="text-lg mb-4">Sei sicuro di voler eliminare questo libro?</p>
        
        <div class="bg-gray-100 {isDarkMode ? 'bg-gray-700' : ''} p-4 rounded-lg">
          <p><strong>Titolo:</strong> {bookToDelete.titolo}</p>
          <p><strong>Autore:</strong> {bookToDelete.autore}</p>
          <p><strong>Codice:</strong> {bookToDelete.codiceLibro}</p>
          {#if bookToDelete.categoria && bookToDelete.categoria.length > 0}
            <p><strong>Categorie:</strong> {bookToDelete.categoria.join(', ')}</p>
          {/if}
        </div>
        
        <div class="alert alert-warning mt-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 18.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
          <span><strong>Attenzione:</strong> Questa azione non può essere annullata!</span>
        </div>
      </div>

      <div class="modal-action">
        <button class="btn {isDarkMode ? 'btn-ghost' : ''}" on:click={cancelDelete} disabled={loading}>
          Annulla
        </button>
        <button class="btn btn-error" on:click={confirmDelete} disabled={loading}>
          {loading ? 'Eliminando...' : 'Elimina Definitivamente'}
        </button>
      </div>
    </div>
  </div>
{/if}
 
 
  <Footer />
</div>