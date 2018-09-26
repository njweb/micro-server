const bodyParser = require('body-parser');

const isReqMask = req => Object.keys(req.query).includes('$mask');
const getStatusMaskFromReq = req => (
  (value => Number.isInteger(value) ? value : null)(req.query['$status'])
);
const getMethodMaskFromReq = req => (
  Object.keys(req.query).includes('$method') ? req.query['$method'].toUpperCase() : 'GET'
);
const getShouldMaskOverrideFromReq = req => (
  Object.keys(req.query).includes('$override')
);
const getMaskKeyFromReq = req => `${getMethodMaskFromReq(req)}|>${req.path}`;
const getTail = arr => arr && arr[arr.length - 1];

const maskMiddleware = () => {
  const masks = {};
  const jsonParser = bodyParser.json();

  return [
    (req, res, next) => {
      if(isReqMask(req)) return jsonParser(req, res, next);
      else return next();
    },
    (req, res, next) => {
      if(isReqMask(req)) {
        const maskKey = getMaskKeyFromReq(req); 
        const maskStack = masks[maskKey] || [];
        maskStack.push({ 
          bodyMask: req.body || {}, 
          statusMask: getStatusMaskFromReq(req),
          override: getShouldMaskOverrideFromReq(req)
        });
        masks[maskKey] = maskStack;

        res.json(masks);
      } else {
        console.log('METHOD: ', req.method);
        const maskKey = `${req.method}|>${req.path}`
        const mask  = getTail(masks[maskKey]);
        console.log('MASK KEY: ', maskKey);
        if(mask && mask.override) {
          res.json(mask.bodyMask);
        } else {
          res.locals.mask = mask;
          next();
        }
      }
    }
  ];
  //  return (req, res, next) => {
  //    if(Object.keys(req.query).includes('$mask')) {
  //      bodyParser.json()(req, res, (req, res) => {
  //        masks[req.path] = req.body || '';
  //        console.log('MASKS: ', masks);
  //        res.json(`MASK: ${JSON.stringify(masks)}`);
  //      });
  //    } else {
  //      res.locals.mask = masks[req.path];
  //      next();
  //    }
  //  };
}

module.exports = maskMiddleware;
