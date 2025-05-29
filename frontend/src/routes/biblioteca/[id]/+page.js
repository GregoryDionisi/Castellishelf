export async function load({ params }) {
  // Configurazione API
  const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/$/, '');

// Funzione helper per evitare doppi slash
const apiCall = (endpoint) => {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${API_URL}${cleanEndpoint}`;
};

  let books = [];
  let libraries = [];
  let error = null;

  // Recupera i libri
  try {
    const response = await fetch(apiCall('books'));
    if (!response.ok) throw new Error(`Errore HTTP: ${response.status}`);

    const result = await response.json();
    books = result.map(book => ({
      codiceLibro: book["Codice libro"],
      CDD: book.CDD,
      numeroInventario: book["Numero inventario"],
      collocazione: book.Collocazione,
      autore: book.Autore,
      titolo: book.Titolo,
      casaEditrice: book["Casa editrice"],
      prestabile: book.Prestabile,
      categoria: Array.isArray(book.Categoria) ? book.Categoria : [book.Categoria],
      immagine: book.Immagine || null
    }));

    console.log('Libri caricati:', books.length);
  } catch (e) {
    error = `Errore nel caricamento dei libri: ${e.message}`;
    console.error(error);
  }

  // Recupera le biblioteche
  try {
    const response = await fetch(apiCall('libraries'));
    if (!response.ok) throw new Error(`Errore HTTP: ${response.status}`);

    const result = await response.json();
    libraries = result.data.map(lib => ({
      id: lib.library_id,
      name: lib.library_name,
      floor: lib.floor,
      xPercent: lib.x_percent,
      yPercent: lib.y_percent,
      books: Array.isArray(lib.books) ? lib.books : []
    }));

    console.log('Biblioteche caricate:', libraries);
  } catch (e) {
    error = `Errore nel caricamento delle biblioteche: ${e.message}`;
    console.error(error);
  }

  const libraryId = parseInt(params.id, 10);
  const library = libraries.find(lib => lib.id === libraryId) || null;

  // Mappa dei dettagli dei libri - AGGIUNTO tutti i campi necessari
  const bookDetails = {};
  books.forEach(book => {
    bookDetails[book.titolo] = {
      autore: book.autore,
      casaEditrice: book.casaEditrice,
      prestabile: book.prestabile,
      categoria: book.categoria,
      immagine: book.immagine,
      collocazione: book.collocazione,      
      codiceLibro: book.codiceLibro,         
      numeroInventario: book.numeroInventario, 
      CDD: book.CDD                           
    };
  });

  console.log('Library trovata:', library);
  console.log('BookDetails keys:', Object.keys(bookDetails));

  return {
    library,
    bookDetails,
    error
  };
}