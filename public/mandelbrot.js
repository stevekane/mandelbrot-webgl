var canvas   = document.getElementById("view")
var gl       = canvas.getContext("webgl")
var vSrc     = document.getElementById("vShader").text
var fSrc     = document.getElementById("fShader").text
var image    = document.getElementById("gradient")
var title    = document.getElementById("title")
var vShader  = new Shader(gl, gl.VERTEX_SHADER, vSrc)
var fShader  = new Shader(gl, gl.FRAGMENT_SHADER, fSrc)
var program  = new Program(gl, vShader, fShader)
var texture  = new Texture(gl)

var quadVerts = new Float32Array([
  1, 1, -1, 1, -1, -1,
  1, 1, -1, -1, 1, -1
])

function Location (x, y, scale, name) {
  this.x     = x
  this.y     = y
  this.scale = scale
  this.name  = name
}

function copy (obj) {
  var c = {}

  Object.keys(obj).forEach(function (key) {
    c[key] = obj[key] 
  })
  return c
}

function Scope (initialLocation) {
  this.location = copy(initialLocation)
  this.target = initialLocation

  Object.defineProperty(this, "scaleDiff", {
    get: function () { return this.target.scale - this.location.scale }
  })
  Object.defineProperty(this, "xDiff", {
    get: function () { return this.target.x - this.location.x }
  })
  Object.defineProperty(this, "yDiff", {
    get: function () { return this.target.y - this.location.y }
  })
}

var locations = {
  base: new Location(
    0,
    0,
    10,
    "Base"
  ),
  minibrot: new Location(
    -1.2561516034985423,
    0.3808247882043751,
    5.634342535442616e-2,
    "MiniBrot"
  ),
  spirals: new Location(
    0.28693186889504513,
    0.014286693904085048,
    10e-5,
    "Spirals"
  )
}

var scope = new Scope(locations.base)

var frames = [
  new Frame(2000, locations.base),
  new Frame(5000, locations.minibrot),
  new Frame(2000, locations.base),
  new Frame(5000, locations.spirals)
]

var timeline = new Timeline(frames)

function makeUpdate () {
  var newTime = Date.now()
  var oldTime = newTime
  var dT      = newTime - oldTime
  var scaleFactor = .05


  return function update () {
    oldTime = newTime
    newTime = Date.now()
    dT      = newTime - oldTime
          
    updateTimeline(dT, timeline)
    scope.target = timeline.currentFrame.data
    
    scope.location.scale += scope.scaleDiff * scaleFactor
    scope.location.x     += scope.xDiff * scaleFactor
    scope.location.y     += scope.yDiff * scaleFactor
  }
}


function makeRender () {
  var centerLoc     = program.uniforms.center
  var scaleLoc      = program.uniforms.scale
  var screenSizeLoc = program.uniforms.screenSize

  gl.enable(gl.BLEND)
  gl.enable(gl.CULL_FACE)
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
  gl.clearColor(1.0, 1.0, 1.0, 0.0)
  gl.colorMask(true, true, true, true)
  gl.useProgram(program.program)
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
  program.updateBuffer(gl, "a_position", 2, quadVerts)
  return function render () {
    title.textContent = scope.target.name
    gl.uniform2f(screenSizeLoc, gl.drawingBufferWidth, gl.drawingBufferHeight)
    gl.uniform2f(centerLoc, scope.location.x, scope.location.y)
    gl.uniform1f(scaleLoc, scope.location.scale)
    gl.drawArrays(gl.TRIANGLES, 0, 6)
    requestAnimationFrame(render) 
  }
}

function resize (width, height) {
  var size = width < height ? width : height

  canvas.width  = size
  canvas.height = size
  gl.viewport(0, 0, size, size)
}

document.addEventListener("DOMContentLoaded", function () {
  resize(window.innerWidth, window.innerHeight)
  requestAnimationFrame(makeRender())
  setInterval(makeUpdate(), 25)
})
window.addEventListener("resize", function () {
  resize(window.innerWidth, window.innerHeight)
})
