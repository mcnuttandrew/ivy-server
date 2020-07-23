import express from 'express';
const app = express();
import bodyParser from 'body-parser';
import cors from 'cors';
import {query} from './src/db';
const PORT = process.env.PORT || 5000;

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cors());

const dedupQuery = `
SELECT innerA.*
  FROM templates as innerA
    INNER JOIN (
      SELECT MAX(id) AS target_id, creator, name
      FROM templates
      GROUP BY creator, name
    ) AS innerB
  ON  innerA.creator = innerB.creator
  AND innerA.name = innerB.name
  AND innerA.id = innerB.target_id
`;
app.get('/templates', (req, res) => {
  console.log('templates');
  // TODO make this deduplicate
  //   const queryString = `
  // SELECT DISTINCT name, creator
  // FROM templates
  // WHERE creator=$1 and name=$2;
  //     `;
  query(`${dedupQuery};`).then(result => {
    res.send(JSON.stringify(result.rows));
  });
});

app.get('/template-instances', (req, res) => {
  console.log('template instances');
  //   const queryInstances = `
  // SELECT
  //   a.name,
  //   a.creator,
  //   b.template_name,
  //   b.template_creator,
  //   b.name as instance_name,
  //   b.dataset,
  //   a.template->'templateDescription' as template_description,
  //   a.template->'templateLanguage' as template_language
  // FROM (
  //   SELECT innerA.*
  //   FROM templates as innerA
  //     INNER JOIN (
  //       SELECT MAX(id) AS target_id, creator, name
  //       FROM templates
  //       GROUP BY creator, name
  //     ) AS innerB
  //   ON  innerA.creator = innerB.creator
  //   AND innerA.name = innerB.name
  //   AND innerA.id = innerB.target_id
  // ) AS a
  // FULL JOIN template_instances AS b
  // ON a.name=b.template_name AND a.creator=b.template_creator;
  //   `;
  const queryInstances = `
SELECT 
  a.template->'templateDescription' as template_description,
  a.template->'templateLanguage' as template_language,
  b.*
FROM (${dedupQuery}) AS a
RIGHT JOIN template_instances AS b 
ON a.name=b.template_name AND a.creator=b.template_creator;
  `;
  //   const queryTemplates = `
  // SELECT creator, name
  // FROM templates
  // ORDER BY id LIMIT 50;
  //   `;
  query(queryInstances).then(result => {
    res.send(JSON.stringify(result.rows));
  });
});

app.get('/thumbnail/:authorKey/:templateName', (req, res) => {
  const authorKey = req.params.authorKey;
  const templateName = req.params.templateName;
  const variables = [templateName, authorKey];
  const queryForInstance = `
  SELECT thumbnail
  FROM template_instances 
  WHERE template_name=$1 and template_creator=$2 ORDER BY id DESC;
  `;
  query(queryForInstance, variables).then(result => {
    if (!result.rows.length) {
      res.send(null);
      return;
    }
    const img = result.rows[0].thumbnail;
    const base64Image = img.split(';base64,').pop();
    res.set('Content-Type', 'image/jpeg');
    res.send(new Buffer(base64Image, 'base64'));
  });
});

app.get('/thumbnail/:authorKey/:templateName/:templateInstance', (req, res) => {
  const authorKey = req.params.authorKey;
  const templateName = req.params.templateName;
  const templateInstance = req.params.templateInstance;
  const variables = [templateName, authorKey, templateInstance];
  const queryForInstance = `
  SELECT thumbnail
  FROM template_instances 
  WHERE template_name=$1 and template_creator=$2 and name=$3;
  `;
  query(queryForInstance, variables).then(result => {
    if (!result.rows.length) {
      res.send(null);
      return;
    }
    const img = result.rows[0].thumbnail;
    const base64Image = img.split(';base64,').pop();
    res.set('Content-Type', 'image/jpeg');
    res.send(new Buffer(base64Image, 'base64'));
  });
});

app.get('/:authorKey/:templateName', (req, res) => {
  const authorKey = req.params.authorKey;
  const templateName = req.params.templateName;
  console.log(`get ${authorKey} ${templateName}`);
  const queryString = `
  SELECT *
  FROM templates
  WHERE creator=$1 and name=$2
  ORDER BY created_at DESC;
  `;
  query(queryString, [authorKey, templateName]).then(result => {
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
WHERE template_name=$1 and template_creator=$2 and name=$3
ORDER BY created_at DESC;
`;
  query(queryForInstance, variables).then(result => {
    if (!result.rows.length) {
      res.send([]);
      return;
    }
    res.send(JSON.stringify(result.rows[0]));
  });
});

app.post('/publish', (req, res) => {
  const body = req.body;
  const {template} = body;
  const {templateAuthor, templateName} = template;

  console.log('save template', templateName, templateAuthor);
  // TODO should enable a upsert style rewrite
  const queryString = `
INSERT INTO templates 
(template, name, creator) 
VALUES ($1, $2, $3);
  `;
  query(queryString, [template, templateName, templateAuthor])
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
    dataset,
    thumbnail
  } = body;
  // TODOOOOOO
  // also publish-instance should allow for a upsert style rewrite
  console.log('save instance');
  const inputs = [
    templateAuthor,
    templateName,
    templateInstance,
    templateMap,
    dataset,
    thumbnail
  ];
  const queryString = `
INSERT INTO template_instances 
(template_creator, template_name, name, template_instance, dataset, thumbnail) 
VALUES ($1, $2, $3, $4, $5, $6);
  `;
  query(queryString, inputs)
    .then(() => res.sendStatus(200))
    .catch(e => {
      console.log(e);
      res.sendStatus(300);
    });
});

app.post('/remove', (req, res) => {
  //  USED REPLACE
  const body = req.body;
  const {templateAuthor, templateName, userName} = body;
  console.log('remove template', templateAuthor, templateName, userName);
  if (userName !== templateAuthor) {
    return res.sendStatus(500);
  }
  const queryString1 = `
DELETE FROM templates 
WHERE creator=$1 AND name=$2;
  `;
  const queryString2 = `
DELETE FROM template_instances
WHERE template_creator=$1 AND template_name=$2;
  `;
  const inputs = [templateAuthor, templateName];
  query(queryString1, inputs)
    .then(() => query(queryString2, inputs).then(() => res.sendStatus(200)))
    .catch(e => {
      console.log(e);
      res.sendStatus(300);
    });
  // res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`Node.js app is listening at http://localhost:${PORT}`);
});
