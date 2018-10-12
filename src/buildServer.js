const http = require('http');
const Koa = require('koa');
const KoaBody = require('koa-body');
const staticFileMiddleware = require('./staticFileMiddleware');
const maskMiddleware = require('./maskMiddleware');
const websocketBroadcaster = require('./websocketBroadcaster');

const buildServer = ({rootPath, port = 3020, forwardPort = 3040, useWebsocket = false}) => {
  const app = new Koa();

  if (rootPath) {
    app.use(staticFileMiddleware({rootPath}));
    console.log('serving files from: ', rootPath);
  } else {
    app.use(KoaBody());
    app.use(maskMiddleware({forwardPort}));
  }

  const server = http.createServer(app.callback()).listen(port);
  console.log(`listening on port ${port}`);

  if (useWebsocket) {
    websocketBroadcaster({rootPath, server});
  }

  return app;
};

module.exports = buildServer;
