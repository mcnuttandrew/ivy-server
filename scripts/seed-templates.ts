const {
  getFile,
  executeCommandLineCmd,
  executePromisesInSeries
} = require('./combine-backups');

const folder = '/Users/amc/ivy-artifact/artifact/example-templates';
executeCommandLineCmd(`ls ${folder}`).then(({stdout}) => {
  const files = stdout.split('\n').filter(d => d);
  const promises = files.map(filename => () =>
    getFile(`${folder}/${filename}`)
      .then(x => JSON.stringify({template: JSON.parse(x)}))
      .then(file => {
        console.log('sending', filename);
        executeCommandLineCmd(
          `curl -d '${file}' -H 'Content-Type: application/json' http://localhost:5000/publish`
        );
        // executeCommandLineCmd(
        //   `curl -d '${file}' -H 'Content-Type: application/json' http://hydra-template-server.herokuapp.com/publish`
        // );
      })
  );
  executePromisesInSeries(promises);
});
