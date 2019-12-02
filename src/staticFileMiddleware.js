const http = require('http');
const send = require('koa-send');
const Koa = require('koa');
const minimatch = require('minimatch');
const websocket = require('ws');
const chokidar = require('chokidar');

module.exports = ({rootPath}) => {
  const sendOpts = {
    root: rootPath,
    maxage: 1000,
  };

  return async (ctx, next) => {
    console.log('path ', ctx.path);
    if (minimatch(ctx.path, '**/*.?(css|js|json|map|png|jpg|ttf|ico)')) {
      await send(ctx, ctx.path, sendOpts);
    } else if (minimatch(`${ctx.path}.html`, '**/*.html')) {
      await send(ctx, `${ctx.path}.html`, sendOpts);
    } else if (ctx.path === '/') {
      await send(ctx, 'home.html', sendOpts);
    }
    return await next();
  }
};
