const request = require('request');
const applyMask = require('./applyMask');

const forwardMiddleware = ({ forwardPort }) => (req, res) => {
  const callback = (err, proxyResponse, body) => {
    proxyResponse.pipe(res);
    res.set(proxyResponse.headers);
    if(proxyResponse.headers['content-type'].includes('json')) {
      console.log('BMASK: ', res.locals.mask);
      const parsedBody = res.locals.mask ? 
        applyMask(JSON.parse(body), res.locals.mask.bodyMask) :
        JSON.parse(body);
      res.json(parsedBody);
    } else {
      res.end(body);
    }
  };
  req.pipe(request(`http://localhost:${forwardPort}${req.originalUrl}`, callback));
}

module.exports = forwardMiddleware;
