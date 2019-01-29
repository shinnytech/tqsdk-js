const UnifyArrayStyle = (path, splitSymbol = '/') => {
  if (!Array.isArray(path)) path = path.split(splitSymbol)
  return path.filter(x => x !== '')
}

const IsEmptyObject = (obj) => {
  return Object.keys(obj).length === 0 ? true : false
}

const RandomStr = (len = 8) => {
  let charts = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".split('')
  let s = ''
  for (let i = 0; i < len; i++) s += charts[(Math.random() * 0x3e) | 0];
  return s;
}

export {
  UnifyArrayStyle,
  IsEmptyObject,
  RandomStr
}
