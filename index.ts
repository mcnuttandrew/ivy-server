import {MongoClient} from 'mongodb';
import express from 'express';
const app = express();
import bodyParser from 'body-parser';
import {fetch} from './src/utils';
import cors from 'cors';

const PORT = process.env.PORT || 5000;
const MONGO_URL = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const MONGO_DB = process.env.MONGODB || 'HYDRA_SERVER';

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cors());

app.get('/search', (req, res) => {
  const searchKey = req.query && req.query.search;
  console.log('search', req.query);
  const query = {
    $or: ['templateName', 'templateDescription', 'creator'].map(key => {
      return {[`template.${key}`]: {$regex: searchKey, $options: 'i'}};
    })
  };
  console.log(JSON.stringify(query, null, 2));
  fetch(req.app.locals.db, 'programs', query, 20).then((result: any) => {
    res.send(JSON.stringify(result));
  });
});

app.get('/recent', (req, res) => {
  console.log('recent');
  fetch(req.app.locals.db, 'programs', null, 20).then((result: any) => {
    console.log(result.length);
    res.send(JSON.stringify(result));
  });
});

app.get('/data-field', (req, res) => {
  console.log('data field');
  console.log(req);
  res.sendStatus(200);
});

app.use('/thumbnail', (req, res) => {
  const authorKey = req.query && req.query.author;
  const templateName = req.query && req.query.template;
  const query = {
    $and: [{templateName: {$eq: templateName}}, {authorKey: {$eq: authorKey}}]
  };
  fetch(req.app.locals.db, 'thumbnails', query).then((result: any) => {
    if (!result || !result.length) {
      console.log('nothing found for', authorKey, templateName, result);
      res.send('');
      return;
    }
    console.log('thumbnail for', authorKey, templateName);
    res.writeHead(200, {'Content-Type': 'image/jpeg'});
    res.end(result[0].templateImg, 'binary');
  });
});

app.post('/save-thumbnail', (req, res) => {
  const body = req.body;
  const {templateName, authorKey, templateImg} = body;
  const db = req.app.locals.db;
  console.log('save thumbnail for', templateName, authorKey);
  db.collection('thumbnails').updateOne(
    {_id: `${templateName}-${authorKey}`},
    {$set: {templateName, authorKey, templateImg}},
    {upsert: true}
  );

  res.sendStatus(200);
});

app.post('/publish', (req, res) => {
  const body = req.body;
  const {template} = body;
  const db = req.app.locals.db;
  db.collection('programs').insertOne({
    template,
    _id: `${template.templateName}-${template.templateAuthor}`
  });

  res.sendStatus(200);
});

app.get('/remove', (req, res) => {
  const templateAuthor = req.query && req.query.templateAuthor;
  const templateName = req.query && req.query.templateName;
  const userName = req.query && req.query.userName;
  console.log('delete', templateAuthor, templateName, userName);
  if (userName !== templateAuthor) {
    res.sendStatus(403);
    return;
  }
  const db = req.app.locals.db;
  const query = {_id: `${templateName}-${templateAuthor}`};
  // this should probably be atomic?
  Promise.all([
    db.collection('programs').deleteOne(query),
    db.collection('thumbnails').deleteOne(query)
  ]).then(() => {
    console.log('deletes successful');
    res.sendStatus(200);
  });
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
