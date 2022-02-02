const websocket = require('ws');
const chokidar = require('chokidar');
const _ = require('lodash');

module.exports = ({rootPath, server}) => {
  console.log('setting up websocket broadcaster');

  const wsServer = new websocket.Server({server});

  wsServer.on('connection', () => console.log('client connected'));
  wsServer.on('error', err => {
    console.log('WSSERVER: ', err);
    if (err.code === 'ECONNREFUSED') {
      console.log('reconnecting');
      onTimeout(() => wsServer.reconnect(err), 800);
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

  const handleChangeEvent = _.debounce(onSourceDirChanged, 250, { leading: false });

  const watcher = chokidar.watch(rootPath, {persistent: true});
  watcher.on('change', handleChangeEvent);

  return wsServer;
};
