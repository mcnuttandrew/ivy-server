const MongoClient = require("mongodb").MongoClient;
const express = require("express");
const app = express();
const bodyParser = require('body-parser');


const PORT = process.env.PORT || 5000;
const MONGO_URL = process.env.MONGODB_URI || "mongodb://localhost:27017";
const MONGO_DB = process.env.MONGODB || "HYDRA_SERVER";

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.get("/search", (req, res) => {
  console.log(req);
  res.sendStatus(200);
});

app.get("/recent", (req, res) => {
  console.log(req);
  res.sendStatus(200);
});

app.get('/data-field', (req, res) => {
  console.log(req);
  res.sendStatus(200);
});

function constructMetaData(template) {

}

app.post('/publish', (req, res) => {
  const body = req.body;
  const {template, templateImg, creator} = body;
  const metaData = constructMetaData(template);

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
