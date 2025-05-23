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

// Endpoint per le librerie - CORRETTO per il frontend Svelte
app.get('/libraries', async (req, res) => {
    if (!database) {
        return res.status(500).json({ message: 'Database is not connected' });
    }
    
    try {
        const rawLibraries = await database.collection('biblioteche').find({}).toArray();
        
        const libraries = rawLibraries.map(lib => ({
            library_id: lib._id.toString(), // Converti ObjectId in stringa
            library_name: lib.Nome,
            floor: lib.Floor,
            x_percent: lib.xPercent,
            y_percent: lib.yPercent,
            books: Array.isArray(lib.Libri) ? lib.Libri : [] // Assicurati che sia un array
        }));

        res.json({ data: libraries });
    } catch (err) {
        console.error('Error in /libraries:', err);
        res.status(500).json({ message: 'Error getting libraries' });
    }
});

// Endpoint per i libri - INVARIATO (già corretto)
app.get('/books', async (req, res) => {
    if (!database) {
        return res.status(500).json({ message: 'Database is not connected' });
    }
    
    try {
        const result = await database.collection('libri').find({}).toArray();
        res.json(result);
    } catch (err) {
        console.error('Error in /books:', err);
        res.status(500).json({ message: 'Error getting books' });
    }
});