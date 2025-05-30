const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();

// Configurazione CORS
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://castellishelf.vercel.app']
        : ['http://localhost:5173', 'http://localhost:3001'],
    credentials: true
}));

app.use(bodyParser.json());

// Variabile globale per la connessione al database (caching per Vercel)
let cachedDb = null;

const connectToDatabase = async () => {
    if (cachedDb) {
        return cachedDb;
    }
    
    try {
        const client = await MongoClient.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Database is connected');
        cachedDb = client.db('castellishelf');
        return cachedDb;
    } catch (err) {
        console.error('Database connection error:', err);
        throw err;
    }
};

// Middleware per ottenere il database
const getDatabaseMiddleware = async (req, res, next) => {
    try {
        req.db = await connectToDatabase();
        next();
    } catch (error) {
        console.error('Database middleware error:', error);
        res.status(500).json({ message: 'Database connection failed' });
    }
};

// Applica il middleware a tutte le rotte
app.use(getDatabaseMiddleware);

// Route principale
app.get('/', (req, res) => {
    res.json({ message: 'Backend API is running!' });
});

// Route di health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

// Endpoint per le librerie
app.get('/libraries', async (req, res) => {
    try {
        const rawLibraries = await req.db.collection('biblioteche').find({}).toArray();
       
        const libraries = rawLibraries.map(lib => ({
            library_id: lib.id,
            library_name: lib.Nome,
            floor: lib.Floor,
            x_percent: lib.xPercent,
            y_percent: lib.yPercent,
            books: Array.isArray(lib.Libri) ? lib.Libri : []
        }));
 
        res.json({ data: libraries });
    } catch (err) {
        console.error('Error in /libraries:', err);
        res.status(500).json({ message: 'Error getting libraries' });
    }
});

// Endpoint per i libri con filtri
app.get('/books', async (req, res) => {
    try {
        const { search, category, library } = req.query;
        let query = {};
       
        if (search) {
            query.$or = [
                { titolo: { $regex: search, $options: 'i' } },
                { autore: { $regex: search, $options: 'i' } },
                { codice: { $regex: search, $options: 'i' } }
            ];
        }
       
        if (category && category !== 'Tutte le categorie') {
            query.categorie = category;
        }
       
        if (library && library !== 'Tutte le biblioteche') {
            query.collocazione = library;
        }
       
        const result = await req.db.collection('libri').find(query).toArray();
        res.json(result);
    } catch (err) {
        console.error('Error in /books:', err);
        res.status(500).json({ message: 'Error getting books' });
    }
});

// Endpoint per aggiungere un nuovo libro (POST)
app.post('/books', async (req, res) => {
    try {
        const { 
            codiceLibro, 
            CDD,
            numeroInventario,
            titolo, 
            autore, 
            categoria, 
            collocazione, 
            casaEditrice,
            prestabile,
            immagine
        } = req.body;

        const newBook = {
            "Codice libro": parseInt(codiceLibro) || codiceLibro,
            "CDD": CDD || '',
            "Numero inventario": parseInt(numeroInventario) || numeroInventario,
            "Titolo": titolo,
            "Autore": autore,
            "Categoria": Array.isArray(categoria) ? categoria : [categoria],
            "Collocazione": collocazione || '',
            "Casa editrice": casaEditrice || '',
            "Prestabile": prestabile === 'VERO' || prestabile === true ? 'VERO' : 'FALSO',
            "Immagine": immagine || null
        };

        const result = await req.db.collection('libri').insertOne(newBook);
        
        res.status(201).json({
            message: 'Libro aggiunto con successo',
            "Codice libro": newBook["Codice libro"],
            "CDD": newBook["CDD"],
            "Numero inventario": newBook["Numero inventario"],
            "Titolo": newBook["Titolo"],
            "Autore": newBook["Autore"],
            "Categoria": newBook["Categoria"],
            "Collocazione": newBook["Collocazione"],
            "Casa editrice": newBook["Casa editrice"],
            "Prestabile": newBook["Prestabile"],
            "Immagine": newBook["Immagine"]
        });
    } catch (err) {
        console.error('Error in POST /books:', err);
        res.status(500).json({ message: 'Errore durante l\'aggiunta del libro' });
    }
});

// Endpoint per modificare un libro esistente (PUT)
app.put('/books/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            codiceLibro, 
            cdd,
            numeroInventario,
            titolo, 
            autore, 
            categoria, 
            collocazione, 
            casaEditrice,
            prestabile,
            immagine
        } = req.body;

        // Prepara l'oggetto di aggiornamento
        const updateData = {
            "Codice libro": parseInt(codiceLibro) || codiceLibro,
            "CDD": cdd || '',
            "Numero inventario": parseInt(numeroInventario) || numeroInventario,
            "Titolo": titolo,
            "Autore": autore,
            "Categoria": Array.isArray(categoria) ? categoria : [categoria],
            "Collocazione": collocazione || '',
            "Casa editrice": casaEditrice || '',
            "Prestabile": prestabile === 'VERO' || prestabile === true ? 'VERO' : 'FALSO',
            "Immagine": immagine || null
        };

        let query;
        
        // Prova prima con ObjectId se l'ID sembra essere un ObjectId MongoDB
        if (ObjectId.isValid(id)) {
            query = { _id: new ObjectId(id) };
        } else {
            // Altrimenti cerca per Codice libro
            query = { "Codice libro": parseInt(id) || id };
        }

        const result = await req.db.collection('libri').updateOne(
            query,
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'Libro non trovato' });
        }

        if (result.modifiedCount === 0) {
            return res.status(200).json({ 
                message: 'Nessuna modifica necessaria - i dati sono già aggiornati',
                ...updateData
            });
        }

        res.status(200).json({
            message: 'Libro modificato con successo',
            "Codice libro": updateData["Codice libro"],
            "CDD": updateData["CDD"],
            "Numero inventario": updateData["Numero inventario"],
            "Titolo": updateData["Titolo"],
            "Autore": updateData["Autore"],
            "Categoria": updateData["Categoria"],
            "Collocazione": updateData["Collocazione"],
            "Casa editrice": updateData["Casa editrice"],
            "Prestabile": updateData["Prestabile"],
            "Immagine": updateData["Immagine"]
        });
    } catch (err) {
        console.error('Error in PUT /books/:id:', err);
        res.status(500).json({ message: 'Errore durante la modifica del libro' });
    }
});

// Endpoint per eliminare un libro (DELETE)
app.delete('/books/:id', async (req, res) => {
    try {
        const { id } = req.params;

        let query;
        let bookToDelete;
        
        // Prova prima con ObjectId se l'ID sembra essere un ObjectId MongoDB
        if (ObjectId.isValid(id)) {
            query = { _id: new ObjectId(id) };
        } else {
            // Altrimenti cerca per Codice libro
            query = { "Codice libro": parseInt(id) || id };
        }

        // Trova il libro prima di eliminarlo
        bookToDelete = await req.db.collection('libri').findOne(query);
        
        if (!bookToDelete) {
            return res.status(404).json({ message: 'Libro non trovato' });
        }

        // Elimina il libro
        const result = await req.db.collection('libri').deleteOne(query);

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Libro non trovato o già eliminato' });
        }

        res.status(200).json({
            message: 'Libro eliminato con successo',
            deletedBook: {
                "Codice libro": bookToDelete["Codice libro"],
                "Titolo": bookToDelete["Titolo"],
                "Autore": bookToDelete["Autore"],
                "CDD": bookToDelete["CDD"],
                "Numero inventario": bookToDelete["Numero inventario"],
                "Collocazione": bookToDelete["Collocazione"],
                "Casa editrice": bookToDelete["Casa editrice"],
                "Categoria": bookToDelete["Categoria"],
                "Prestabile": bookToDelete["Prestabile"],
                "Immagine": bookToDelete["Immagine"]
            }
        });
    } catch (err) {
        console.error('Error in DELETE /books/:id:', err);
        res.status(500).json({ message: 'Errore durante l\'eliminazione del libro' });
    }
});

// POST - Aggiungi un libro a una biblioteca specifica
app.post('/libraries/:id/books', async (req, res) => {
    try {
        const collection = req.db.collection('biblioteche');
        const libraryId = parseInt(req.params.id);
        const { bookTitle } = req.body;

        // Validazione ID biblioteca
        if (isNaN(libraryId)) {
            return res.status(400).json({ message: 'ID biblioteca non valido' });
        }

        // Validazione titolo libro
        if (!bookTitle || typeof bookTitle !== 'string' || bookTitle.trim() === '') {
            return res.status(400).json({ message: 'Titolo del libro mancante o non valido' });
        }

        // Trova la biblioteca
        const library = await collection.findOne({ id: libraryId });

        if (!library) {
            return res.status(404).json({ message: 'Biblioteca non trovata' });
        }

        // Verifica se il libro è già presente nella biblioteca
        const currentBooks = library.Libri || [];
        const bookTitleTrimmed = bookTitle.trim();

        if (currentBooks.includes(bookTitleTrimmed)) {
            return res.status(409).json({ 
                message: 'Il libro è già presente in questa biblioteca',
                bookTitle: bookTitleTrimmed,
                libraryName: library.Nome
            });
        }

        // Aggiungi il libro all'array Libri
        const result = await collection.updateOne(
            { id: libraryId },
            { 
                $push: { 
                    Libri: bookTitleTrimmed 
                } 
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'Biblioteca non trovata per l\'aggiornamento' });
        }

        // Recupera la biblioteca aggiornata
        const updatedLibrary = await collection.findOne({ id: libraryId });

        res.status(201).json({
            message: 'Libro aggiunto alla biblioteca con successo',
            bookTitle: bookTitleTrimmed,
            libraryId: libraryId,
            libraryName: library.Nome,
            totalBooks: updatedLibrary.Libri.length,
            books: updatedLibrary.Libri
        });

    } catch (error) {
        console.error('Error adding book to library:', error);
        res.status(500).json({ 
            message: 'Errore nell\'aggiunta del libro alla biblioteca', 
            error: error.message 
        });
    }
});

// DELETE - Rimuovi un libro da una biblioteca specifica
app.delete('/libraries/:id/books', async (req, res) => {
    try {
        const collection = req.db.collection('biblioteche');
        const libraryId = parseInt(req.params.id);
        const { bookTitle } = req.body;

        // Validazione ID biblioteca
        if (isNaN(libraryId)) {
            return res.status(400).json({ message: 'ID biblioteca non valido' });
        }

        // Validazione titolo libro
        if (!bookTitle || typeof bookTitle !== 'string' || bookTitle.trim() === '') {
            return res.status(400).json({ message: 'Titolo del libro mancante o non valido' });
        }

        const bookTitleTrimmed = bookTitle.trim();

        // Rimuovi il libro dall'array Libri
        const result = await collection.updateOne(
            { id: libraryId },
            { 
                $pull: { 
                    Libri: bookTitleTrimmed 
                } 
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'Biblioteca non trovata' });
        }

        if (result.modifiedCount === 0) {
            return res.status(404).json({ 
                message: 'Libro non trovato nella biblioteca specificata',
                bookTitle: bookTitleTrimmed
            });
        }

        res.json({
            message: 'Libro rimosso dalla biblioteca con successo',
            bookTitle: bookTitleTrimmed,
            libraryId: libraryId
        });

    } catch (error) {
        console.error('Error removing book from library:', error);
        res.status(500).json({ 
            message: 'Errore nella rimozione del libro dalla biblioteca', 
            error: error.message 
        });
    }
});

// PUT - Aggiorna il titolo di un libro in una biblioteca specifica
app.put('/libraries/:id/books/update-title', async (req, res) => {
    try {
        const collection = req.db.collection('biblioteche');
        const libraryId = parseInt(req.params.id);
        const { oldTitle, newTitle } = req.body;

        // Validazione ID biblioteca
        if (isNaN(libraryId)) {
            return res.status(400).json({ message: 'ID biblioteca non valido' });
        }

        // Validazione titoli
        if (!oldTitle || typeof oldTitle !== 'string' || oldTitle.trim() === '') {
            return res.status(400).json({ message: 'Titolo precedente del libro mancante o non valido' });
        }

        if (!newTitle || typeof newTitle !== 'string' || newTitle.trim() === '') {
            return res.status(400).json({ message: 'Nuovo titolo del libro mancante o non valido' });
        }

        const oldTitleTrimmed = oldTitle.trim();
        const newTitleTrimmed = newTitle.trim();

        // Trova la biblioteca
        const library = await collection.findOne({ id: libraryId });

        if (!library) {
            return res.status(404).json({ message: 'Biblioteca non trovata' });
        }

        // Verifica se il libro con il vecchio titolo esiste nella biblioteca
        const currentBooks = library.Libri || [];
        if (!currentBooks.includes(oldTitleTrimmed)) {
            return res.status(404).json({ 
                message: 'Libro con il titolo precedente non trovato nella biblioteca',
                oldTitle: oldTitleTrimmed,
                libraryName: library.Nome
            });
        }

        // Verifica se il nuovo titolo non esiste già (evita duplicati)
        if (oldTitleTrimmed !== newTitleTrimmed && currentBooks.includes(newTitleTrimmed)) {
            return res.status(409).json({ 
                message: 'Un libro con il nuovo titolo è già presente in questa biblioteca',
                newTitle: newTitleTrimmed,
                libraryName: library.Nome
            });
        }

        // Aggiorna il titolo nell'array Libri
        const result = await collection.updateOne(
            { id: libraryId },
            { 
                $set: { 
                    "Libri.$[element]": newTitleTrimmed 
                } 
            },
            {
                arrayFilters: [{ "element": oldTitleTrimmed }]
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'Biblioteca non trovata per l\'aggiornamento' });
        }

        if (result.modifiedCount === 0) {
            return res.status(404).json({ 
                message: 'Nessun libro aggiornato. Il titolo potrebbe non esistere nella biblioteca',
                oldTitle: oldTitleTrimmed
            });
        }

        // Recupera la biblioteca aggiornata
        const updatedLibrary = await collection.findOne({ id: libraryId });

        res.json({
            message: 'Titolo del libro aggiornato con successo nella biblioteca',
            oldTitle: oldTitleTrimmed,
            newTitle: newTitleTrimmed,
            libraryId: libraryId,
            libraryName: library.Nome,
            totalBooks: updatedLibrary.Libri.length,
            books: updatedLibrary.Libri
        });

    } catch (error) {
        console.error('Error updating book title in library:', error);
        res.status(500).json({ 
            message: 'Errore nell\'aggiornamento del titolo del libro nella biblioteca', 
            error: error.message 
        });
    }
});

// Per Vercel, esporta l'app
module.exports = app;

// Solo per sviluppo locale
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}