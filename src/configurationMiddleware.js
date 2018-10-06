const express = require('express');
const fs = require('mz/fs');
const path = require('path');
const chokidar = require('chokidar');

const configurationMiddleware = ({filepath}) => {
  let routeConfigurations = {};

  const parseConfigurationsIntoProxyMasks = configurations => (
    Object.entries(configurations).reduce((maskAcc, [routePath, routeConfig]) => {
      const { method = 'GET' } = routeConfig;
      return {...maskAcc, [`${method}|>${routePath}`]: routeConfig}
    }, {})
  );

  const loadConfigurationFile = () => {
    console.log('Importing configurations');
    return fs.readFile(filepath, {encoding: 'utf-8'}).then(contents => {
      if(contents.length === 0) return;
      routeConfigurations = JSON.parse(contents);
    }).catch(err => {
      console.log('Could not parse configuration file: ', err);
    });
  };

  const watchConfigurationFile = () => {
    const watcher = chokidar.watch(path.resolve(__dirname, filepath));
    watcher.on('change', loadConfigurationFile);
    return watcher;
  };

  loadConfigurationFile();
  watchConfigurationFile();

  const router = express.Router();
  router.get('/_config', (req, res, next) => {
    res.json(routeConfigurations);
  });

  return [
    router, 
    (req, res, next) => {
      const routeKey = `${req.method}${req.path}`;
      const proxyConfig = routeConfigurations[routeKey];
      if(proxyConfig && proxyConfig.override) {
        console.log(`PATH OVERRIDEN: ${req.path} \n`);
        const { status = 200, mask = {} } = proxyConfig;
        res.status(status).json(mask);
        return;
      }

      res.locals.proxyConfig = proxyConfig;
      next();
    }
  ];
}

module.exports = configurationMiddleware;
