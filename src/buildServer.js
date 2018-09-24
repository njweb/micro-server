const http = require('http');
const express = require('express');
const maskMiddleware = require('./maskMiddleware');
const forwardMiddleware = require('./forwardMiddleware');

const buildServer = ({port = 3020, forwardPort = 3040} = {}) => {
  const app = express();
  app.use(maskMiddleware());
  app.use(forwardMiddleware({ forwardPort }));
  // app.get('/*', (req, res) => res.send("HI"));

  app.listen(port, () => console.log(`Mask server listening on port ${port}`));

  return app;
};

module.exports = buildServer;
