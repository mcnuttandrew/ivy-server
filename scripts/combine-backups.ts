const {
  getFile,
  executeCommandLineCmd,
  executePromisesInSeries
} = require('hoopoe');

// const prefix = 'http://hydra-template-server.herokuapp.com';
const prefix = 'http://localhost:5000';
function rebuildInstances() {
  return Promise.resolve().then(() => {
    return executeCommandLineCmd(`ls backups`).then(({stdout}) => {
      const files = stdout.split('\n').filter(d => d);
      Promise.all(
        files.map(filename =>
          getFile(`backups/${filename}`)
            .then(x => JSON.parse(x))
            .then(({templateInstances: {rows}}) => rows)
        )
      ).then(instances => {
        const dedups = instances
          .reduce((acc, row) => acc.concat(row), [])
          .reduce((acc, row) => {
            const key = `${row.template_name} - ${row.template_creator} - ${row.name}`;
            acc[key] = row;
            return acc;
          }, {});

        const promises = Object.values(dedups).map(row => () => {
          const file = JSON.stringify({
            templateAuthor: row.template_creator,
            templateName: row.template_name,
            // templateMap: row.template_instance,
            // just a one time to thing to fix the instance collection
            templateMap: row.template_instance.paramValues
              ? row.template_instance
              : {
                  paramValues: row.template_instance,
                  systemValues: {viewsToMaterialize: {}, dataTransforms: []}
                },
            templateInstance: row.name,
            instanceCreator: row.instance_creator || 'Aquila-Volans-16',
            dataset: row.dataset,
            thumbnail: row.thumbnail
          });
          return executeCommandLineCmd(
            `curl -d '${file}' -H 'Content-Type: application/json' ${prefix}/publish-instance`
          );
        });
        return executePromisesInSeries(promises);
      });
    });
  });
}

function rebuildTemplates() {
  return Promise.resolve().then(() => {
    return executeCommandLineCmd(`ls backups`).then(({stdout}) => {
      const files = stdout.split('\n').filter(d => d);
      Promise.all(
        files.map(filename =>
          getFile(`backups/${filename}`)
            .then(x => JSON.parse(x))
            .then(({templates: {rows}}) => rows)
        )
      ).then(instances => {
        const dedups = instances
          .reduce((acc, row) => acc.concat(row), [])
          .reduce((acc, row) => {
            const key = `${row.name} - ${row.creator}`;
            acc[key] = row;
            return acc;
          }, {});

        const promises = Object.values(dedups).map(row => () => {
          const file = JSON.stringify({template: row.template});
          return executeCommandLineCmd(
            `curl -d '${file}' -H 'Content-Type: application/json' ${prefix}/publish`
          ).catch(e => console.log(e));
        });
        return executePromisesInSeries(promises);
      });
    });
  });
}

rebuildTemplates().then(() => rebuildInstances());
