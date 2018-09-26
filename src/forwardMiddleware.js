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
    proxyResponse.pipe(res);
    res.set(proxyResponse.headers);
    
    if(responseHasContent(proxyResponse) && responseIsJson(proxyResponse)) {
      console.log('ROUTE MASK: ', res.locals.mask);
      const parsedBody = JSON.parse(body);
      console.log('BODY ', body.substring(0, 20));
      const maskedBody = res.locals.mask ? applyMask(parsedBody, res.locals.mask.bodyMask) : parsedBody;
      console.log('MASKED ', maskedBody);
      res.status(proxyResponse.statusCode).json(maskedBody);
    } else {
      res.status(proxyResponse.statusCode).end(body);
    }
  };
  req.pipe(request(`http://localhost:${forwardPort}${req.originalUrl}`, callback));
}

module.exports = forwardMiddleware;
