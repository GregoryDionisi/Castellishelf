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

app.get('/libraries', async (req, res) => {
  if (!database) {
    return res.status(500).json({ message: 'Database is not connected' });
  }
  try {
    const rawLibraries = await database.collection('biblioteche').find({}).toArray();
    
    const libraries = rawLibraries.map(lib => ({
      library_id: lib._id,
      library_name: lib.Nome,
      floor: lib.Floor,
      x_percent: lib.xPercent,
      y_percent: lib.yPercent,
      books: lib.Libri
    }));

    res.json({ data: libraries }); // frontend si aspetta .data
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Error get libraries' });
  }
});


// get all data
app.get('/books', async (req, res) => { 
  if (!database){
      return res.status(500).json({message: 'Database is not connected'});
  }
  try{
      const result = await database.collection('libri').find({}).toArray();
      res.json(result);
  }catch(err){
      console.log(err);
      res.status(500).json({message: 'Error get books'});
  }
})



