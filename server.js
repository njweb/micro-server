const http = require('http');
const path = require('path');
const send = require('koa-send');
const Koa = require('koa');
const minimatch = require('minimatch');
const websocket = require('ws');
const chokidar = require('chokidar');

const buildServer = ({rootPath, port = 3020, useWebsocket = false}) => {
  const app = new Koa();

  const sendOpts = {root: rootPath};
  app.use(async (ctx) => {
    if (minimatch(ctx.path, '**/*.?(css|js|png|jpg|ttf)')) {
      await send(ctx, ctx.path, sendOpts);
    }
    else {
      await send(ctx, 'home.html', sendOpts);
    }
  });

  const server = http.createServer(app.callback()).listen(port);
// app.listen(port);
  console.log(`listening on port ${port}`);
  console.log('serving files from: ', sendOpts.root);

  if (useWebsocket) {
    console.log('setting up websocket broadcaster');

    const wsServer = new websocket.Server({server});

    wsServer.on('connection', () => console.log('client connected'));
    wsServer.on('error', err => {
      console.log('WSSERVER: ', err);
      if (err.code === 'ECONNREFUSED') {
        console.log('reconnecting');
        wsServer.reconnect(err);
      } else {
        console.error('Unrecoverable websocket error: ', err);
      }
    });

    const onSourceDirChanged = () => wsServer.clients.forEach(socket => {
      if (socket.readyState === websocket.OPEN) {
        socket.send('source-changed', err => {
          err ? console.err('There was a websocket error') : console.log('"source-changed" broadcasted');
        })
      }
    });

    const watcher = chokidar.watch(rootPath, {persistent: true});
    watcher.on('change', onSourceDirChanged);
  }
  return server;
};

module.exports = buildServer;
