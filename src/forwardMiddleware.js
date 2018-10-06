const request = require('request');
const applyMask = require('./applyMask');

const responseIsJson = res => (
  contentType => contentType !== undefined && contentType.includes('/json')
)(res.headers['content-type']);

const responseHasContent = res => (
  contentLength => contentLength > 0
)(res.headers['content-length']);

const forwardMiddleware = ({ forwardPort }) => (req, res) => {
  const callback = (err, proxyResponse, body) => {
    if(err) {
      res.status(500).end(err.toString());
      return;
    }

    res.set(proxyResponse.headers);
    if(responseHasContent(proxyResponse) && responseIsJson(proxyResponse)) {
      const proxyConfig = res.locals.proxyConfig;
      console.log('PATH: ', req.path);
      console.log('BODY MASK ACTIVE: ', !!proxyConfig);
      console.log(`BODY: ${body.substring(0, 20)} \n`);
      const parsedBody = JSON.parse(body);
      const statusCode = proxyConfig.status || proxyResponse.statusCode;
      const maskedBody = proxyConfig.mask ?
        applyMask(parsedBody, proxyConfig.mask) : parsedBody;

      res.status(statusCode).json(maskedBody);
    } else {
      console.log(`PASSTHROUGH: ${req.path} \n`);
      res.status(proxyResponse.statusCode).end(body);
    }
  };
  req.pipe(request(`http://localhost:${forwardPort}${req.originalUrl}`, callback));
}

module.exports = forwardMiddleware;
