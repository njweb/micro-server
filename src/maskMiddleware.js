const request = require('request');

const queryKeyActive = ({ctx, queryKey}) => ctx.query[queryKey] !== undefined && ctx.query[queryKey] !== false;

const applyMask = (source, mask) => {
  if (!mask) return source;
  if (typeof source !== 'object' || typeof mask !== 'object') return mask;

  if (!Array.isArray(source)) {
    const maskedSource = Object.entries(mask).reduce((acc, [key, value]) => ({
      ...source,
      [key]: applyMask(source[key], value)
    }), source);
    return {...mask, ...maskedSource};
  } else if (!Array.isArray(mask)) {
    return source.map(item => applyMask(item, mask));
  } else {
    return source.map((item, index) => {
      const maskWithIndex = mask.find(maskItem => maskItem[0] === index);
      return maskWithIndex ? applyMask(item, maskWithIndex[1]) : item;
    })
  }
};

module.exports = ({forwardPort = 3040} = {}) => {
  let routeMasks = [];
  const forwardRequest = async ({ctx}) => {
    console.log('FORWARD: ', JSON.stringify(ctx.path));
    const mask = [...routeMasks].reverse().find(routeMask => routeMask.path === ctx.path && routeMask.method === ctx.method);
    console.log('MASK: ', mask);

    // const fetchConfig = {
    //   ...{
    //     method: ctx.method,
    //     headers: ctx.headers,
    //   }, ...(Object.keys(ctx.request.body).length > 0 ? {body: JSON.stringify(ctx.request.body)} : {})
    // };
    // console.log('FCONFIG: ', fetchConfig);
    // const rawResponse = await fetch(
    //   `http://localhost:${forwardPort}${ctx.originalUrl}`,
    //   fetchConfig
    // );

    // ctx.status = rawResponse.status;
    // rawResponse.headers.forEach(((headerValue, headerField) => {
    //   ctx.set(headerField, headerValue);
    // }));
    //
    // const forwardedJSON = await rawResponse.json();
    // console.log("FWD JSON: ", forwardedJSON);
    //
    // ctx.body = mask ? applyMask(forwardedJSON, mask.responseMask) : forwardedJSON;
    const reqOptions = {
      url: `http://localhost:${forwardPort}${ctx.originalUrl}`,
      headers: ctx.headers
    };

    await new Promise((res, rej) => {
      const callback = (err, response, body) => {
        if (err) {
          rej(err);
        } else {
          ctx.status = response && response.statusCode;
          Object.entries(response.headers).forEach(([key, value]) => {
            ctx.set(key, value);
          });
          try {
            const jsonBody = JSON.parse(body);
            ctx.body = mask ? applyMask(jsonBody, mask.responseMask) : jsonBody;
          } catch (e) {
            ctx.body = body;
          }
          res();
        }
      };
      request(reqOptions, callback);
    });
    return ctx;
  };
  const editMasks = ({ctx}) => {
    if (queryKeyActive({ctx, queryKey: 'pop'})) {
      routeMasks.pop();
      ctx.body = {maskCount: routeMasks.length};
      return;
    }
    if (queryKeyActive({ctx, queryKey: 'clear'})) {
      routeMasks = [];
      ctx.body = {maskCount: routeMasks.length};
      return;
    }
    console.log("MASK: ", ctx.request.body);

    const newMask = {
      path: ctx.path.substring(ctx.path.indexOf('_mask') + '_mask'.length),
      status: (value => !isNaN(value) ? value : null)(parseInt(ctx.query.status)),
      method: ctx.query.method || 'GET',
      responseMask: ctx.request.body,
      replace: ctx.query.replace !== undefined && ctx.query.replace !== false
    };

    routeMasks = [...routeMasks, newMask];
    ctx.body = newMask;
  };
  return async (ctx, next) => {
    const urlSegments = ctx.path.split('/');

    await urlSegments[1] === '_mask' ?
      editMasks({ctx}) :
      await forwardRequest({ctx});
    return await next();
  }
};