const path = require('path');
const commander = require('commander');
const buildServer = require('./src/buildServer');

const program = new commander.Command();

program.name('micro-server')
  .version('0.1.0')
  .usage('[options] <rootpath>')
  .argument('<rootpath>')
  .option('-p, --port [port]', 'Set the server port', 3020)
  .option('-f, --forwardport [port]', 'The forwarding port for the mask middleware', 3040)
  .option('-s, --websocket', 'Use the websocket broadcaster')
  .option('-h, --html', 'Serve html files without extension on url')
  .parse();

const options = program.opts();

const port = options.port;
const forwardPort = options.forwardport;
const useWebsocket = options.websocket;
const serveHtml = options.html;

const rootPath = program.args[0] ? path.resolve(__dirname, program.args[0]) : null;

buildServer({rootPath, port, forwardPort, useWebsocket, serveHtml});
