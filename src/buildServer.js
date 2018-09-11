const http = require('http');
const Koa = require('koa');
const KoaBody = require('koa-body');
const staticFileMiddleware = require('./staticFileMiddleware');
const maskMiddleware = require('./maskMiddleware');

const buildServer = ({rootPath, port = 3020, forwardPort = 3040, useWebsocket = false}) => {
  const app = new Koa();

  if (rootPath) {
    app.use(staticFileMiddleware({rootPath, useWebsocket, koaApp: app}));
    console.log('serving files from: ', rootPath);
  } else {
    app.use(KoaBody());
    app.use(maskMiddleware({forwardPort}));
  }

  app.listen(port);
  console.log(`listening on port ${port}`);
  return app;
};

module.exports = buildServer;
