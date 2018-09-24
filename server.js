const path = require('path');
const commander = require('commander');
const buildServer = require('./src/buildServer');

commander.version('0.1.0')
  .option('-p, --port [port]', 'Set the server port', 3020)
  .option('-f --forwardport [port]', 'The forwarding port for the mask middleware', 3040)
  .parse(process.argv);

const port = commander.port;
const forwardPort = commander.forwardport;

buildServer({port, forwardPort});
