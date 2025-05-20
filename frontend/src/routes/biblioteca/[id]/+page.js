export function load({ params }) {
    const libraries = [
      {
        id: 1,
        name: 'Biblioteca Corridoio Verde Piano Terra',
        floor: 0,
        xPercent: 38,
        yPercent: 55,
        books: ['Dal Big Bang ai buchi neri'],
        description: 'Collezione specializzata in testi scientifici, manuali tecnici e riviste del settore.',
        favorites: 24,
        categories: ['Scienze']
      },
      {
        id: 2,
        name: 'Biblioteca Corridoio Blu Piano Terra',
        floor: 0,
        xPercent: 85,
        yPercent: 77,
        books: ['Enciclopedia italiana di scienze lettere ed arti - vol. XII - CROCE-DIR'],
        description: 'Ampia collezione di letteratura classica e contemporanea, saggi storici e filosofici.',
        favorites: 42,
        categories: ['Enciclopedia']
      },
      {
        id: 3,
        name: 'Biblioteca Corridoio Verde Primo Piano',
        floor: 1,
        xPercent: 38,
        yPercent: 55,
        books: ['Romeo and Juliet'],
        description: 'Testi in diverse lingue straniere, dizionari e materiale didattico per l\'apprendimento linguistico.',
        favorites: 18,
        categories: ['Lingue', 'Narrativa']
      },
      {
        id: 4,
        name: 'Biblioteca Corridoio Blu Primo Piano',
        floor: 1,
        xPercent: 85,
        yPercent: 77,
        books: ['La battaglia. Storia di Waterloo'],
        description: 'Risorse multimediali, film, audiolibri e software didattici.',
        favorites: 36,
        categories: ['Storia']
      },
      {
        id: 5,
        name: 'Biblioteca Corridoio Arancione Primo Piano',
        floor: 1,
        xPercent: 42,
        yPercent: 80,
        books: [],
        description: 'Risorse multimediali, film, audiolibri e software didattici.',
        favorites: 36,
        categories: []
      },
      {
        id: 6,
        name: 'Biblioteca Corridoio Verde Secondo Piano',
        floor: 2,
        xPercent: 38,
        yPercent: 55,
        books: ['Invention: A Life'],
        description: 'Risorse multimediali, film, audiolibri e software didattici.',
        favorites: 36,
        categories: ['Tecnologia']
      },
      {
        id: 7,
        name: 'Biblioteca Corridoio Blu Secondo Piano',
        floor: 2,
        xPercent: 85,
        yPercent: 77,
        books: [],
        description: 'Risorse multimediali, film, audiolibri e software didattici.',
        favorites: 36,
        categories: []
      }
    ];
  
    // Books data - normally this would come from an API or database
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
  
    // Parse the ID from the URL parameters
    const libraryId = parseInt(params.id, 10);
    
    // Find the library by ID
    const library = libraries.find(lib => lib.id === libraryId) || null;
    
    // Create a map of book details by title for easy lookup
    const bookDetails = {};
    books.forEach(book => {
      bookDetails[book.titolo] = {
        autore: book.autore,
        casaEditrice: book.casaEditrice,
        prestabile: book.prestabile,
        categoria: book.categoria
      };
    });
  
    // Return the data that will be available in the page component
    return {
      library,
      bookDetails
    };
  }