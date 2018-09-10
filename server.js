const path = require('path');
const commander = require('commander');
const buildServer = require('./src/buildServer');

commander.version('0.1.0')
  .usage('[options] <rootpath>')
  .option('-p, --port [port]', 'Set the server port', 3020)
  .option('-s --websocket', 'Use the websocket broadcaster')
  .option('-f --forwardport', 'The forwarding port for the mask middleware', 3040)
  .parse(process.argv);

const rootPath = commander.args[0] ? path.join(__dirname, commander.args[0]) : null;
const port = commander.port;
const useWebsocket = commander.websocket;
const forwardPort = commander.forwardport;

buildServer({rootPath, port, useWebsocket, forwardPort});