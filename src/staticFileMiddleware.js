const http = require('http');
const send = require('koa-send');
const Koa = require('koa');
const minimatch = require('minimatch');
const websocket = require('ws');
const chokidar = require('chokidar');

module.exports = ({ rootPath, serveHtml }) => {
  const sendOpts = {
    root: rootPath,
    maxage: 1000,
  };

  return async (ctx, next) => {
    console.log('path ', ctx.path);
    if (minimatch(ctx.path, '**/*.?(html|css|js|json|map|png|jpg|svg|ttf|ico)')) {
      await send(ctx, ctx.path, sendOpts);
    } else if (serveHtml && minimatch(`${ctx.path}.html`, '**/*.html')) {
      await send(ctx, `${ctx.path}.html`, sendOpts);
    } else if (!ctx.path.match(/[^\/]+\.[^\/]*$/)) {
      await send(ctx, 'home.html', sendOpts);
    }
    return await next();
  }
};
