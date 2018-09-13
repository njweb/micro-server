const websocket = require('ws');
const chokidar = require('chokidar');

module.exports = ({rootPath, server}) => {
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

  return wsServer;
};
