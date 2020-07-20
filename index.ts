import express from 'express';
const app = express();
import bodyParser from 'body-parser';
import cors from 'cors';
import {query} from './src/db';
const PORT = process.env.PORT || 5000;

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cors());

app.get('/recent', (req, res) => {
  console.log('recent');
  query('SELECT * FROM templates;').then(result => {
    res.send(JSON.stringify(result.rows));
  });
});

app.get('/recent-names', (req, res) => {
  console.log('recent names');
  const queryInstances = `
SELECT a.name, a.creator, b.template_name, b.template_creator, b.name as instance_name, b.dataset
FROM templates AS a 
FULL JOIN template_instances AS b 
ON a.name=b.template_name AND a.creator=b.template_creator;
  `;
  const queryTemplates = `
SELECT creator, name 
FROM templates 
ORDER BY id LIMIT 50;
  `;
  query(queryInstances).then(result => {
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
  console.log(`get ${authorKey} ${templateName}`);
  query('SELECT * FROM templates WHERE creator=$1 and name=$2;', [
    authorKey,
    templateName
  ]).then(result => {
    res.send(JSON.stringify(result.rows[0]));
  });
});

app.get('/:authorKey/:templateName/:instanceName', (req, res) => {
  const authorKey = req.params.authorKey;
  const templateName = req.params.templateName;
  const instanceName = req.params.instanceName;
  console.log(`get ${authorKey} ${templateName} ${instanceName}`);
  const variables = [templateName, authorKey, instanceName];
  const queryForInstance = `
SELECT * 
FROM template_instances 
WHERE template_name=$1 and template_creator=$2 and name=$3;
`;
  query(queryForInstance, variables).then(result => {
    if (!result.rows.length) {
      res.send([]);
      return;
    }
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
  // TODO should enable a upsert style rewrite
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
  const {
    templateAuthor,
    templateName,
    templateMap,
    templateInstance,
    dataset
  } = body;
  // TODOOOOOO
  // algo trigger a thumbnail build from here
  // also publish-instance should allow for a upsert style rewrite
  console.log('save instance');
  const inputs = [
    templateAuthor,
    templateName,
    templateInstance,
    templateMap,
    dataset
  ];
  query(
    'INSERT INTO template_instances (template_creator, template_name, name, template_instance, dataset) VALUES ($1, $2, $3, $4, $5);',
    inputs
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
