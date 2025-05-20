<script>
    import { onMount } from 'svelte';
    import Header from '$lib/components/Header.svelte';
    import Footer from '$lib/components/Footer.svelte';
    import '$lib/styles/global.css';
  
    let books = [];
    let libraries = [];
    let selectedLibrary = null;
    let showAddBookModal = false;
    let showEditBookModal = false;
    let editingBook = null;
    let darkMode = false;
  
    let searchTerm = '';
    let selectedCategory = 'all';
    let categories = ['Storia', 'Narrativa', 'Scienze', 'Arte', 'Filosofia'];
  
    let newBook = {
      code: '',
      cdd: '',
      num_inventory: '',
      library: '',
      author: '',
      title: '',
      publishing_house: '',
      available: 'VERO',
      category: []
    };
  
    let stats = {
      totalBooks: 0,
      totalLibraries: 0,
      availableBooks: 0,
      borrowedBooks: 0
    };
  
    onMount(() => {
      loadData();
      updateStats();
      // Check for initial dark mode state
      darkMode = document.body.classList.contains('dark-mode');
    });

    // Handle dark mode changes from Header
    function handleDarkModeChange(event) {
      darkMode = event.detail.darkMode;
    }
  
    function updateStats() {
      const total = books.length;
      const available = books.filter(book => book.available.toLowerCase() === "vero").length;
      const borrowed = total - available;
  
      stats = {
        ...stats,
        totalBooks: total,
        availableBooks: available,
        borrowedBooks: borrowed,
        totalLibraries: libraries.length
      };
    }
  
    function loadData() {
      libraries = [
        { id: 1, name: 'Biblioteca Corridoio Blu Piano Terra', books: 320, color: 'blue' },
        { id: 2, name: 'Biblioteca Scienze', books: 245, color: 'green' },
        { id: 3, name: 'Biblioteca Storia', books: 189, color: 'red' },
        { id: 4, name: 'Biblioteca Informatica', books: 156, color: 'purple' },
        { id: 5, name: 'Biblioteca Arte', books: 134, color: 'orange' },
        { id: 6, name: 'Biblioteca Linguistica', books: 98, color: 'pink' },
        { id: 7, name: 'Biblioteca Filosofia', books: 88, color: 'yellow' }
      ];
  
      books = [
        { id: 1, title: 'La Divina Commedia', author: 'Dante Alighieri', code: 'LIB-001', cdd: '850', num_inventory: '001', library: 'Biblioteca Storia', available: 'VERO', category: ['Storia'] },
        { id: 2, title: 'Il Principe', author: 'Niccolò Machiavelli', code: 'LIB-002', cdd: '320', num_inventory: '002', library: 'Biblioteca Storia', available: 'FALSO', category: ['Storia'] }
      ];
    }
  
    function handleAddBook() {
        // Assicuriamoci che category sia un array, anche se è stata selezionata da un <select>
        if (typeof newBook.category === 'string') {
            newBook.category = [newBook.category];
        }

        books = [...books, { ...newBook, id: books.length + 1 }];
        updateStats();
        showAddBookModal = false;
        resetNewBook();
    }

  
    function handleEditBook() {
      if (!editingBook) return;
      books = books.map(book => book.id === editingBook.id ? { ...editingBook } : book);
      updateStats();
      showEditBookModal = false;
      editingBook = null;
    }
  
    function handleDeleteBook(bookId) {
      if (confirm('Sei sicuro di voler eliminare questo libro?')) {
        books = books.filter(book => book.id !== bookId);
        updateStats();
      }
    }
  
    function resetNewBook() {
      newBook = {
        code: '',
        cdd: '',
        num_inventory: '',
        library: '',
        author: '',
        title: '',
        publishing_house: '',
        available: 'VERO',
        category: []
      };
    }
  
    function openEditModal(book) {
      editingBook = { ...book };
      showEditBookModal = true;
    }
  
    $: filteredBooks = books.filter(book => {
      const matchesSearch =
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase());
  
      const matchesCategory =
        selectedCategory === 'all' || book.category.includes(selectedCategory);
  
      const matchesLibrary =
        !selectedLibrary || book.library === selectedLibrary.name;
  
      return matchesSearch && matchesCategory && matchesLibrary;
    });
  </script>
  
  
  <Header {darkMode} on:darkModeChange={handleDarkModeChange} />
  
  <div class="app-container min-h-screen" class:dark-mode={darkMode}>
    <!-- Hero Section -->
    <div class="primary-color text-white py-16">
      <div class="container mx-auto px-6">
        <h1 class="text-5xl font-bold mb-4">Dashboard Amministratore</h1>
        <p class="text-xl opacity-90">Gestisci la collezione di libri di CastelliShelf</p>
      </div>
    </div>
  
    <!-- Statistiche -->
    <div class="container mx-auto px-6 -mt-8">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div class="stat-card {darkMode ? 'bg-gray-800' : 'bg-gray-50'} rounded-lg shadow-md hover:shadow-lg transition flex items-center space-x-4">
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
            
            <div class="stat-card {darkMode ? 'bg-gray-800' : 'bg-gray-50'} rounded-lg shadow-md hover:shadow-lg transition flex items-center space-x-4">
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
            
            <div class="stat-card {darkMode ? 'bg-gray-800' : 'bg-gray-50'} rounded-lg shadow-md hover:shadow-lg transition flex items-center space-x-4">
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
            
            <div class="stat-card {darkMode ? 'bg-gray-800' : 'bg-gray-50'} rounded-lg shadow-md hover:shadow-lg transition flex items-center space-x-4">
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
      <div class="card {darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg mb-8">
        <div class="card-body">
          <div class="flex flex-wrap gap-4 items-center justify-between">
            <div class="flex flex-wrap gap-4 items-center">
              <!-- Ricerca -->
              <div class="form-control">
                <div class="input-group">
                  <input type="text" placeholder="Cerca libri..." class="input input-bordered {darkMode ? 'bg-gray-700 text-white border-gray-600' : ''}" bind:value={searchTerm} />
                  <button class="btn btn-square {darkMode ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' : ''}">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                  </button>
                </div>
              </div>
  
              <!-- Filtro Categoria -->
              <select class="select select-bordered {darkMode ? 'bg-gray-700 text-white border-gray-600' : ''}" bind:value={selectedCategory}>
                <option value="all">Tutte le categorie</option>
                {#each categories as category}
                  <option value={category}>{category}</option>
                {/each}
              </select>
  
              <!-- Filtro Biblioteca -->
              <select class="select select-bordered {darkMode ? 'bg-gray-700 text-white border-gray-600' : ''}" bind:value={selectedLibrary}>
                <option value="">Tutte le biblioteche</option>
                {#each libraries as library}
                  <option value={library.name}>{library.name}</option>
                {/each}
              </select>
            </div>
  
            <!-- Pulsante Aggiungi -->
            <button class="btn border-none outline-none primary-color text-white hover:bg-[var(--primary-color-darker)] transition-all duration-300 flex items-center gap-1" on:click={() => showAddBookModal = true}>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Aggiungi Libro
            </button>
          </div>
        </div>
      </div>
  
      <!-- Tabella Libri -->
      <div class="card {darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg">
        <div class="card-body">
          <h2 class="card-title text-2xl mb-6 {darkMode ? 'text-white' : ''}">Gestione Libri</h2>
          <div class="overflow-x-auto">
            <table class="table w-full {darkMode ? 'text-white' : ''}">
              <thead>
                <tr class="{darkMode ? 'text-gray-300' : ''}">
                    <th>Codice</th>
                    <th>Titolo</th>
                    <th>Autore</th>
                    <th>CDD</th>
                    <th>Num. Inventario</th>
                    <th>Biblioteca</th>
                    <th>Categorie</th>
                    <th>Stato</th>
                    <th>Azioni</th>
                </tr>
              </thead>
              <tbody>
                {#each filteredBooks as book}
                  <tr class="{darkMode ? 'hover:bg-gray-700' : ''}">
                    <td>{book.code}</td>
                    <td class="font-semibold">{book.title}</td>
                    <td>{book.author}</td>
                    <td>{book.cdd}</td>
                    <td>{book.num_inventory}</td>
                    <td>{book.library}</td>
                    <td>
                      {#each book.category as cat}
                        <span class="badge badge-outline mr-1 {darkMode ? 'border-gray-500 text-gray-300' : ''}">{cat}</span>
                      {/each}
                    </td>
                    <td>
                        <span class="badge {book.available === "VERO" ? 'badge-success' : 'badge-warning'}">
                            {book.available === "VERO" ? 'Disponibile' : 'Prestato'}
                        </span>                          
                    </td>
                    <td>
                      <div class="flex gap-2">
                        <button class="btn btn-sm btn-ghost {darkMode ? 'hover:bg-gray-600' : ''}" on:click={() => openEditModal(book)}>
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                          </svg>
                        </button>
                        <button class="btn btn-sm btn-ghost text-error {darkMode ? 'hover:bg-gray-600' : ''}" on:click={() => handleDeleteBook(book.id)}>
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
  
   <!-- Modal Aggiungi Libro -->
   {#if showAddBookModal}
   <div class="modal modal-open">
     <div class="modal-box {darkMode ? 'bg-gray-800 text-white' : ''}">
       <h3 class="font-bold text-lg">Aggiungi Nuovo Libro</h3>
       <div class="form-control gap-4 mt-4">
         <input type="text" placeholder="Codice" class="input input-bordered {darkMode ? 'bg-gray-700 text-white border-gray-600' : ''}" bind:value={newBook.code} />
         <input type="text" placeholder="Titolo" class="input input-bordered {darkMode ? 'bg-gray-700 text-white border-gray-600' : ''}" bind:value={newBook.title} />
         <input type="text" placeholder="Autore" class="input input-bordered {darkMode ? 'bg-gray-700 text-white border-gray-600' : ''}" bind:value={newBook.author} />
         <input type="text" placeholder="CDD" class="input input-bordered {darkMode ? 'bg-gray-700 text-white border-gray-600' : ''}" bind:value={newBook.cdd} />
         <input type="text" placeholder="Numero inventario" class="input input-bordered {darkMode ? 'bg-gray-700 text-white border-gray-600' : ''}" bind:value={newBook.num_inventory} />
         <select class="select select-bordered {darkMode ? 'bg-gray-700 text-white border-gray-600' : ''}" bind:value={newBook.library}>
           <option value="">Seleziona biblioteca</option>
           {#each libraries as library}
             <option value={library.name}>{library.name}</option>
           {/each}
         </select>
          <select class="select select-bordered {darkMode ? 'bg-gray-700 text-white border-gray-600' : ''}" bind:value={newBook.category}>
            <option value="">Seleziona categoria</option>
            {#each categories as category}
              <option value={category}>{category}</option>
            {/each}
          </select>
          <label class="label cursor-pointer">
            <span class="label-text {darkMode ? 'text-white' : ''}">Disponibile</span>
            <input type="checkbox" class="checkbox" bind:checked={newBook.available} />
          </label>
        </div>
        <div class="modal-action">
          <button class="btn {darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : ''}" on:click={() => showAddBookModal = false}>Annulla</button>
          <button class="btn border-none outline-none primary-color text-white hover:bg-[var(--primary-color-darker)] transition-all duration-300 flex items-center gap-1" on:click={handleAddBook}>Aggiungi</button>
        </div>
      </div>
    </div>
  {/if}
  
  <!-- Modal Modifica Libro -->
  {#if showEditBookModal && editingBook}
  <div class="modal modal-open">
    <div class="modal-box {darkMode ? 'bg-gray-800 text-white' : ''}">
      <h3 class="font-bold text-lg">Modifica Libro</h3>
      <div class="form-control gap-4 mt-4">
        <input type="text" placeholder="Codice" class="input input-bordered {darkMode ? 'bg-gray-700 text-white border-gray-600' : ''}" bind:value={editingBook.code} />
        <input type="text" placeholder="Titolo" class="input input-bordered {darkMode ? 'bg-gray-700 text-white border-gray-600' : ''}" bind:value={editingBook.title} />
        <input type="text" placeholder="Autore" class="input input-bordered {darkMode ? 'bg-gray-700 text-white border-gray-600' : ''}" bind:value={editingBook.author} />
        <input type="text" placeholder="CDD" class="input input-bordered {darkMode ? 'bg-gray-700 text-white border-gray-600' : ''}" bind:value={editingBook.cdd} />
        <input type="text" placeholder="Numero inventario" class="input input-bordered {darkMode ? 'bg-gray-700 text-white border-gray-600' : ''}" bind:value={editingBook.num_inventory} />
        <select class="select select-bordered {darkMode ? 'bg-gray-700 text-white border-gray-600' : ''}" bind:value={editingBook.library}>
          <option value="">Seleziona biblioteca</option>
          {#each libraries as library}
            <option value={library.name}>{library.name}</option>
          {/each}
        </select>
         <select class="select select-bordered {darkMode ? 'bg-gray-700 text-white border-gray-600' : ''}" bind:value={editingBook.category}>
           <option value="">Seleziona categoria</option>
           {#each categories as category}
             <option value={category}>{category}</option>
           {/each}
         </select>
          <label class="label cursor-pointer">
            <span class="label-text {darkMode ? 'text-white' : ''}">Disponibile</span>
            <input type="checkbox" class="checkbox" bind:checked={editingBook.available} />
          </label>
        </div>
        <div class="modal-action">
          <button class="btn {darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : ''}" on:click={() => showEditBookModal = false}>Annulla</button>
          <button class="btn border-none outline-none primary-color text-white hover:bg-[var(--primary-color-darker)] transition-all duration-300 flex items-center gap-1" on:click={handleEditBook}>Salva</button>
        </div>
      </div>
    </div>
  {/if}
  <Footer />