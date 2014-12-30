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

function Location (x, y, scale, theta, name) {
  this.x     = x
  this.y     = y
  this.scale = scale
  this.theta = theta
  this.name  = name
}

function Scope (initialLocation) {
  var zoomScale = Mat3()
  var rotation  = Mat3()
  var center    = Mat3()

  this.location = copy(initialLocation)
  this.target   = initialLocation

  Object.defineProperty(this, "zoomScale", {
    get: function () {
      zoomScale[0] = this.location.scale 
      zoomScale[4] = this.location.scale 
      return zoomScale
    }, 
  })

  Object.defineProperty(this, "rotation", {
    get: function () {
      var theta = this.location.theta
      var cos   = Math.cos(theta)
      var sin   = Math.sin(theta)

      rotation[0] = cos
      rotation[1] = -sin
      rotation[3] = sin
      rotation[4] = cos
      return rotation
    } 
  })

  Object.defineProperty(this, "center", {
    get: function () {
      center[6] = this.location.x     
      center[7] = this.location.y
      return center
    } 
  })

  Object.defineProperty(this, "scaleDiff", {
    get: function () { return this.target.scale - this.location.scale }
  })
  Object.defineProperty(this, "thetaDiff", {
    get: function () { return this.target.theta - this.location.theta }
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
    0,
    "Base"
  ),
  minibrot: new Location(
    -1.2561516034985423,
    0.3808247882043751,
    5.634342535442616e-2,
    Math.PI / 3,
    "MiniBrot"
  ),
  spirals: new Location(
    0.28693186889504513,
    0.014286693904085048,
    10e-5,
    Math.PI,
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
    scope.location.theta += scope.thetaDiff * scaleFactor
    scope.location.x     += scope.xDiff * scaleFactor
    scope.location.y     += scope.yDiff * scaleFactor
  }
}


function makeRender () {
  var screenSizeLoc = program.uniforms.screenSize
  var centerLoc     = program.uniforms.center
  var zoomScaleLoc  = program.uniforms.zoomScale
  var rotationLoc   = program.uniforms.rotation

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
    gl.uniformMatrix3fv(centerLoc, gl.FALSE, scope.center)
    gl.uniformMatrix3fv(zoomScaleLoc, gl.FALSE, scope.zoomScale)
    gl.uniformMatrix3fv(rotationLoc, gl.FALSE, scope.rotation)
    gl.drawArrays(gl.TRIANGLES, 0, 6)
    requestAnimationFrame(render) 
  }
}

function resize (width, height) {
  var ratio       = 1920 / 1080
  var targetRatio = width / height
  var useWidth    = ratio >= targetRatio
  var newWidth    = useWidth ? width : (height * ratio) 
  var newHeight   = useWidth ? (width / ratio) : height

  canvas.width  = newWidth 
  canvas.height = newHeight 
  gl.viewport(0, 0, newWidth, newHeight)
}

document.addEventListener("DOMContentLoaded", function () {
  resize(window.innerWidth, window.innerHeight)
  requestAnimationFrame(makeRender())
  setInterval(makeUpdate(), 25)
})
window.addEventListener("resize", function () {
  resize(window.innerWidth, window.innerHeight)
})
