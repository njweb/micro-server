const http = require('http');
const express = require('express');
const configurationMiddleware = require('./configurationMiddleware');
const forwardMiddleware = require('./forwardMiddleware');
const chokidar = require('chokidar');

const buildServer = ({port = 3020, forwardPort = 3040, filepath} = {}) => {
  const app = express();
  app.use(configurationMiddleware({ filepath }));
  app.use(forwardMiddleware({ forwardPort }));
  app.listen(port, () => (
    console.log(`Proxy mask server listening on port ${port} > ${forwardPort}`))
  );

  return app;
}

module.exports = buildServer;
