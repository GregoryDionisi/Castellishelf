export async function load({ params }) {
  const API_URL = 'http://localhost:3001';

  let books = [];
  let libraries = [];
  let error = null;

  // Recupera i libri
  try {
    const response = await fetch(`${API_URL}/books`);
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
    const response = await fetch(`${API_URL}/libraries`);
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
      collocazione: book.collocazione,        // <- AGGIUNTO
      codiceLibro: book.codiceLibro,          // <- AGGIUNTO
      numeroInventario: book.numeroInventario, // <- AGGIUNTO
      CDD: book.CDD                           // <- AGGIUNTO
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