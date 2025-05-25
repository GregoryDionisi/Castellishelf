const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const connectToDatabase = async () => {
    try {
        const client = await MongoClient.connect(process.env.MONGO_URI);
        console.log('Database is connected');
        return client.db('castellishelf');
    } catch (err) {
        console.log(err);
        process.exit(1);
    }
}

let database;

const startServer = async () => {
    database = await connectToDatabase();
    app.listen(process.env.PORT || 3001, () => {
        console.log(`Server is running on port ${process.env.PORT || 3001}`);
    });
}

startServer();

// Middleware per verificare la connessione al database
app.use((req, res, next) => {
    if (!database) {
        return res.status(500).json({ message: 'Database is not connected' });
    }
    next();
});

// Endpoint per le librerie
app.get('/libraries', async (req, res) => {
    try {
        const rawLibraries = await database.collection('biblioteche').find({}).toArray();
        
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
        
        const result = await database.collection('libri').find(query).toArray();
        res.json(result);
    } catch (err) {
        console.error('Error in /books:', err);
        res.status(500).json({ message: 'Error getting books' });
    }
});

// Endpoint per aggiungere un nuovo libro
app.post('/books', async (req, res) => {
    try {
        const newBook = req.body;
        
        // Validazione dei campi obbligatori
        if (!newBook.codice || !newBook.titolo || !newBook.autore) {
            return res.status(400).json({ 
                message: 'Codice, titolo e autore sono campi obbligatori' 
            });
        }

        // Verifica se il codice libro esiste già
        const existingBook = await database.collection('libri').findOne({ 
            codice: newBook.codice 
        });
        
        if (existingBook) {
            return res.status(400).json({ 
                message: 'Un libro con questo codice esiste già' 
            });
        }

        // Imposta valori predefiniti
        newBook.stato = newBook.stato || 'Disponibile';
        newBook.dataInserimento = new Date();
        newBook.categorie = newBook.categorie || [];

        const result = await database.collection('libri').insertOne(newBook);
        
        res.status(201).json({
            message: 'Libro aggiunto con successo',
            codice: newBook.codice,
            book: newBook
        });
    } catch (err) {
        console.error('Error in POST /books:', err);
        res.status(500).json({ message: 'Errore durante l\'aggiunta del libro' });
    }
});

// Endpoint per modificare un libro (per codice)
app.put('/books/:codice', async (req, res) => {
    try {
        const bookCode = req.params.codice;
        const updatedData = req.body;

        if (!bookCode) {
            return res.status(400).json({ message: 'Codice del libro mancante' });
        }

        // Escludi campi che non dovrebbero essere aggiornati
        delete updatedData._id;
        delete updatedData.codice;
        delete updatedData.dataInserimento;

        // Aggiungi data di modifica
        updatedData.dataModifica = new Date();

        const result = await database.collection('libri').updateOne(
            { codice: bookCode },
            { $set: updatedData }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'Libro non trovato' });
        }

        res.json({
            message: 'Libro aggiornato con successo',
            codice: bookCode,
            modifiedCount: result.modifiedCount
        });
    } catch (err) {
        console.error('Error in PUT /books/:codice:', err);
        res.status(500).json({ message: 'Errore durante l\'aggiornamento del libro' });
    }
});

// Endpoint per eliminare un libro (per codice)
app.delete('/books/:codice', async (req, res) => {
    try {
        const bookCode = req.params.codice;

        const result = await database.collection('libri').deleteOne(
            { codice: bookCode }
        );

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Libro non trovato' });
        }

        res.json({
            message: 'Libro eliminato con successo',
            codice: bookCode,
            deletedCount: result.deletedCount
        });
    } catch (err) {
        console.error('Error in DELETE /books/:codice:', err);
        res.status(500).json({ message: 'Errore durante l\'eliminazione del libro' });
    }
});

// Endpoint per ottenere le categorie dei libri
app.get('/categories', async (req, res) => {
    try {
        const categories = await database.collection('libri').distinct('categorie');
        res.json(categories.filter(cat => cat));
    } catch (err) {
        console.error('Error in GET /categories:', err);
        res.status(500).json({ message: 'Errore durante il recupero delle categorie' });
    }
});

// Endpoint per ottenere un singolo libro per codice
app.get('/books/:codice', async (req, res) => {
    try {
        const bookCode = req.params.codice;
        const book = await database.collection('libri').findOne({ codice: bookCode });

        if (!book) {
            return res.status(404).json({ message: 'Libro non trovato' });
        }

        res.json(book);
    } catch (err) {
        console.error('Error in GET /books/:codice:', err);
        res.status(500).json({ message: 'Errore durante il recupero del libro' });
    }
});