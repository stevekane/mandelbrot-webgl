function copy (obj) {
  var c = {}

  Object.keys(obj).forEach(function (key) {
    c[key] = obj[key] 
  })
  return c
}

function Mat3 () {
  var mat = new Float32Array(9)

  mat[0] = 1
  mat[4] = 1
  mat[8] = 1

  return mat
}
