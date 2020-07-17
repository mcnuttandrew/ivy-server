import express from 'express';
const app = express();
import bodyParser from 'body-parser';
import cors from 'cors';
import {query} from './src/db';
const PORT = process.env.PORT || 5000;
// const MONGO_URL = process.env.MONGODB_URI || 'mongodb://localhost:27017';
// const MONGO_DB = process.env.MONGODB || 'IVY_SERVER';

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cors());

app.get('/recent', (req, res) => {
  console.log('recent');
  query('SELECT * FROM templates ORDER BY id LIMIT 50;').then(result => {
    res.send(JSON.stringify(result.rows));
  });
});

// this is get thumbnail for template
// need an additional route for getting thumbnail for instance
app.get('/thumbnail/:authorKey/:templateName', (req, res) => {
  //  USED REPLACE
  console.log('thumb');
  res.sendStatus(200);
  // roughly: pick most recent instance, lookup that ones thumnail, return

  // const authorKey = req.params.authorKey;
  // const templateName = req.params.templateName;
  // const query = {
  //   $and: [
  //     {
  //       templateName: {
  //         $eq: templateName
  //       }
  //     },
  //     {
  //       authorKey: {
  //         $eq: authorKey
  //       }
  //     }
  //   ]
  // };
  // fetch(req.app.locals.db, 'thumbnails', query).then((result: any) => {
  //   if (!result || !result.length) {
  //     console.log('nothing found for', authorKey, templateName, result);
  //     res.send('');
  //     return;
  //   }
  //   const img = result[0].templateImg;
  //   const base64Image = img.split(';base64,').pop();
  //   res.set('Content-Type', 'image/jpeg');
  //   res.send(new Buffer(base64Image, 'base64'));
  // });
});

app.get('/:authorKey/:templateName', (req, res) => {
  const authorKey = req.params.authorKey;
  const templateName = req.params.templateName;
  query('SELECT * FROM templates WHERE creator=$1 and name=$2 ORDER BY id;', [
    authorKey,
    templateName
  ]).then(result => {
    res.send(JSON.stringify(result.rows[0]));
  });
});

// app.post('/save-thumbnail', (req, res) => {
//   //  USED/ REMOVE
//   console.log('save thumb');
//   res.sendStatus(200);
//   // const body = req.body;
//   // const {templateName, authorKey, templateImg} = body;
//   // const db = req.app.locals.db;
//   // console.log('save thumbnail for', templateName, authorKey);
//   // db.collection('thumbnails').updateOne(
//   //   {_id: `${templateName}-${authorKey}`},
//   //   {$set: {templateName, authorKey, templateImg}},
//   //   {upsert: true}
//   // );

//   // res.sendStatus(200);
// });

app.post('/publish', (req, res) => {
  const body = req.body;
  const {template} = body;
  const {templateAuthor, templateName} = template;

  console.log('save template', templateName, templateAuthor);
  query(
    'INSERT INTO templates (template, name, creator) VALUES ($1, $2, $3);',
    [template, templateName, templateAuthor]
  )
    .then(() => res.sendStatus(200))
    .catch(e => {
      console.log(e);
      res.sendStatus(300);
    });
});

app.post('/publish-instance', (req, res) => {
  const body = req.body;
  const {template} = body;
  const {templateAuthor, templateName} = template;

  console.log('save template', templateName, templateAuthor);
  query(
    'INSERT INTO templates (template, name, creator) VALUES ($1, $2, $3);',
    [template, templateName, templateAuthor]
  )
    .then(() => res.sendStatus(200))
    .catch(e => {
      console.log(e);
      res.sendStatus(300);
    });
});

app.get('/remove', (req, res) => {
  //  USED REPLACE
  console.log('save template');
  res.sendStatus(200);

  // const templateAuthor = req.query && req.query.templateAuthor;
  // const templateName = req.query && req.query.templateName;
  // const userName = req.query && req.query.userName;
  // console.log('delete', templateAuthor, templateName, userName);
  // if (userName !== templateAuthor) {
  //   res.sendStatus(403);
  //   return;
  // }
  // const db = req.app.locals.db;
  // const query = {
  //   _id: `${templateName}-${templateAuthor}`
  // };
  // // this should probably be atomic?
  // Promise.all([
  //   db.collection('programs').deleteOne(query),
  //   db.collection('thumbnails').deleteOne(query)
  // ]).then(() => {
  //   console.log('deletes successful');
  //   res.sendStatus(200);
  // });
});

app.listen(PORT, () => {
  console.log(`Node.js app is listening at http://localhost:${PORT}`);
});
