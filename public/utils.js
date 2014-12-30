function copy (obj) {
  var c = {}

  Object.keys(obj).forEach(function (key) {
    c[key] = obj[key] 
  })
  return c
}
