function copy (obj) {
  var c = {}

  Object.keys(obj).forEach(function (key) {
    c[key] = obj[key] 
  })
  return c
}

function loadImage (path, cb) {
  var image = new Image

  image.onload  = function () { cb(null, image) }
  image.onerror = function (e) { cb(e) }
  image.src     = path
}

function Mat3 () {
  var mat = new Float32Array(9)

  mat[0] = 1
  mat[4] = 1
  mat[8] = 1

  return mat
}

function computed (obj, propName, fn) {
  Object.defineProperty(obj, propName, {get: fn}) 
}
