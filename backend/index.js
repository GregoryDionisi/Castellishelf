const express = require(`express`);
const cors = require(`cors`);
const bodyParser = require(`body-parser`);
const {MongoClient} = require(`mongodb`);
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const connectToDatabase = async() => { //funzione per collegarsi tramite URI al nostro database, usando MongoClient
    try{
        const client = await MongoClient.connect(process.env.MONGO_URI);
        console.log('Database is connected');
        return client.db('castellishelf');
    }catch(err){
        console.log(err);
        process.exit(1);
    }
}


let database;

const startServer = async() => { //avvio server, in ascolto sulla porta 3000, definita in .env
    database = await connectToDatabase();
    app.listen(process.env.PORT, () => {
        console.log(`Server is running on port ${process.env.PORT}`);
    })
}

startServer(); //richiamo funzione avvio del server

//funzione per visualizzare il libro richiesto tramite ISBN : rotta --> GET /libri/:codice_libro

app.get('/libri/:Codice_libro', async (req, res) => {

    if (!database) {
        return res.status(500).json({message : 'Database not connected'})
    } 

    const codiceLibroDaTrovare = parseInt(req.params.Codice_libro, 10);

  try {
    const libro = await database.collection('libri').findOne({ Codice_libro: codiceLibroDaTrovare });

    if (!libro) {
      return res.status(404).json({ message: 'Libro non trovato' });
    }

    res.json(libro);

  } catch (error) {
    console.error('Errore nel recupero del libro:', error);
    res.status(500).json({ message: 'Errore del server' });
  }
});



app.get('/libri', async (req, res) => {

  if (!database) {
      return res.status(500).json({message : 'Database not connected'})
  } 

try {
  const libri = await database.collection('libri').find().toArray();
  res.json(libri);

} catch (error) {
  console.error('Errore nel recupero del libro:', error);
  res.status(500).json({ message: 'Errore del server' });
}
});



