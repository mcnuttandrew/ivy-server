import {MongoClient}  from "mongodb";
import express  from "express";
const app = express();
import bodyParser  from 'body-parser';
import {fetch} from './src/utils';
import cors from 'cors';


const PORT = process.env.PORT || 5000;
const MONGO_URL = process.env.MONGODB_URI || "mongodb://localhost:27017";
const MONGO_DB = process.env.MONGODB || "HYDRA_SERVER";

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cors());
// app.use((req, res, next) => {
//   res.header('Access-Control-Allow-Origin', '*');
//   res.header(
//     'Access-Control-Allow-Headers',
//     'Origin, X-Requested-With, Content-Type, Accept'
//   );
//   next();
// });


app.get("/search", (req, res) => {
  console.log('search');
  const searchKey = 'test';
  const query = {$or: [
    ['templateName', 'templateDescription', 'creator'].map(key => {
     return {[`template.${key}`]: {$regex: searchKey, $options: "i"}} 
    })
  ]}
  fetch(req.app.locals.db, 'programs', query, 20).then((result: any) => {
    console.log('search', result.length);
    res.send(JSON.stringify(result));
  });
});

app.get("/recent", (req, res) => {
  console.log('recent');
  fetch(req.app.locals.db, 'programs', null, 20).then((result: any) => {
    console.log(result.length)
    res.send(JSON.stringify(result));
  });
});

app.get('/data-field', (req, res) => {
  console.log('data field');
  console.log(req);
  res.sendStatus(200);
});

app.get('/img-lookup', (req, res) => {
  console.log('img-lookup');
  console.log(req);
  res.sendStatus(200);
});


app.post('/publish', (req, res) => {
  const body = req.body;
  const {template, templateImg, creator} = body;
  const db = req.app.locals.db;
  db.collection('programs').insertOne({template, templateImg, creator});

  res.sendStatus(200);
});

MongoClient.connect(MONGO_URL, {}, (err, client) => {
  if (err) {
    console.log(`Failed to connect to the database. ${err.stack}`);
  }
  app.locals.db = client.db(MONGO_DB);
  app.listen(PORT, () => {
    console.log(`Node.js app is listening at http://localhost:${PORT}`);
  });
});
