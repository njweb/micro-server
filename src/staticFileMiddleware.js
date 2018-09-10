const http = require('http');
const send = require('koa-send');
const Koa = require('koa');
const minimatch = require('minimatch');
const websocket = require('ws');
const chokidar = require('chokidar');

module.exports = ({rootPath, port = 3020, useWebsocket = false, koaApp}) => {
  const server = http.createServer(koaApp.callback()).listen(port);
  const sendOpts = {root: rootPath};

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

  return async (ctx) => {
    if (minimatch(ctx.path, '**/*.?(css|js|png|jpg|ttf)')) {
      await send(ctx, ctx.path, sendOpts);
    }
    else {
      await send(ctx, 'home.html', sendOpts);
    }
  }
};