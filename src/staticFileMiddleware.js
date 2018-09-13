const http = require('http');
const send = require('koa-send');
const Koa = require('koa');
const minimatch = require('minimatch');
const websocket = require('ws');
const chokidar = require('chokidar');

module.exports = ({rootPath}) => {
  const sendOpts = {root: rootPath};

  return async (ctx, next) => {
    if (minimatch(ctx.path, '**/*.?(css|js|png|jpg|ttf)')) {
      await send(ctx, ctx.path, sendOpts);
    }
    else {
      await send(ctx, 'home.html', sendOpts);
    }
    return await next();
  }
};
