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

module.exports = applyMask;
