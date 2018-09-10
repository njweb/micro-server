const http = require('http');
const Koa = require('koa');
const staticFileMiddleware = require('./staticFileMiddleware');
const maskMiddleware = require('./maskMiddleware');

const buildServer = ({rootPath, port = 3020, forwardPort = 3040, useWebsocket = false}) => {
  const app = new Koa();

  if (rootPath) {
    app.use(staticFileMiddleware({rootPath, useWebsocket, koaApp: app}));
  } else {
    app.use(maskMiddleware({forwardPort}));
  }

// app.listen(port);
  console.log(`listening on port ${port}`);
  console.log('serving files from: ', rootPath);
  return app;
};

module.exports = buildServer;
