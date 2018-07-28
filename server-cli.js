const http = require('http');
const path = require('path');
const send = require('koa-send');
const Koa = require('koa');
const minimatch = require('minimatch');
const websocket = require('ws');
const commander = require('commander');
const chokidar = require('chokidar');
const buildServer = require('./server');


commander.version('0.1.0')
  .usage('[options] <rootpath>')
  .option('-p, --port [port]', 'Set the server port', 3020)
  .option('-s --websocket', 'Use the websocket broadcaster')
  .parse(process.argv);

const rootPath = path.join(__dirname, commander.args[0]);
const port = commander.port;
const useWebsocket = commander.websocket;

buildServer({rootPath, port, useWebsocket: commander.websocket});