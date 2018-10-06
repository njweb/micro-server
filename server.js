const path = require('path');
const commander = require('commander');
const buildServer = require('./src/buildServer');

commander.version('0.1.0')
  .option('-c, --config [filepath]', 'The route config filepath', './config.json')
  .option('-p, --port [port]', 'Set the server port', 3020)
  .option('-f --forwardport [port]', 'The forwarding port for the mask middleware', 3040)
  .parse(process.argv);

const port = commander.port;
const forwardPort = commander.forwardport;
const configFilepath = commander.config;
console.log('PATH ', configFilepath);

buildServer({port, forwardPort, filepath: configFilepath});
