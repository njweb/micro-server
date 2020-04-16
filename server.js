const path = require('path');
const commander = require('commander');
const buildServer = require('./src/buildServer');

commander.version('0.1.0')
  .usage('[options] <rootpath>')
  .option('-p, --port [port]', 'Set the server port', 3020)
  .option('-f --forwardport [port]', 'The forwarding port for the mask middleware', 3040)
  .option('-s --websocket', 'Use the websocket broadcaster')
  .option('-h --html', 'serve html files without extension on url')
  .parse(process.argv);

const rootPath = commander.args[0] ? path.resolve(__dirname, commander.args[0]) : null;
const port = commander.port;
const forwardPort = commander.forwardport;
const useWebsocket = commander.websocket;
const serveHtml = commander.html;

buildServer({rootPath, port, forwardPort, useWebsocket, serveHtml});
