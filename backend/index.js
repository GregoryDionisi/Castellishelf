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

        const result = await database.collection('libri').insertOne(newBook);
        
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

        // Trova e aggiorna il libro usando l'ID MongoDB
        const { ObjectId } = require('mongodb');
        let query;
        
        // Prova prima con ObjectId se l'ID sembra essere un ObjectId MongoDB
        if (ObjectId.isValid(id)) {
            query = { _id: new ObjectId(id) };
        } else {
            // Altrimenti cerca per Codice libro
            query = { "Codice libro": parseInt(id) || id };
        }

        const result = await database.collection('libri').updateOne(
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

        // Trova il libro prima di eliminarlo per restituire informazioni utili
        const { ObjectId } = require('mongodb');
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
        bookToDelete = await database.collection('libri').findOne(query);
        
        if (!bookToDelete) {
            return res.status(404).json({ message: 'Libro non trovato' });
        }

        // Elimina il libro
        const result = await database.collection('libri').deleteOne(query);

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