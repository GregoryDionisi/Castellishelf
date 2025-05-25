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
 
// Endpoint per aggiungere un nuovo libro (POST)
app.post('/books', async (req, res) => {
    try {
        const { codiceLibro, titolo, autore, categoria, collocazione, prestabile } = req.body;
   
 
        const newBook = {
            Codice: codiceLibro,
            Titolo: titolo,
            Autore: autore,
            Categoria: Array.isArray(categoria) ? categoria : [categoria],
            Collocazione: collocazione || '',
            Pretabile: prestabile === 'VERO' ? 'Disponibile' : 'Prestato',
           
        };
 
        const result = await database.collection('libri').insertOne(newBook);
       
        res.status(201).json({
            message: 'Libro aggiunto con successo',
            Codice: newBook.Codice,
            Titolo: newBook.Titolo,
            Autore: newBook.Autore,
            Categoria: newBook.Categoria,
            Collocazione: newBook.Collocazione,
            Prestabile: prestable === 'VERO' ? 'VERO' : 'FALSO',
        });
    } catch (err) {
        console.error('Error in POST /books:', err);
        res.status(500).json({ message: 'Errore durante l\'aggiunta del libro' });
    }
});