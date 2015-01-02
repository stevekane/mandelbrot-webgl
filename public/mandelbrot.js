var canvas  = document.getElementById("view")
var gl      = canvas.getContext("webgl")
var vSrc    = document.getElementById("vShader").text
var fSrc    = document.getElementById("fShader").text
var locInfo = {
  name:     document.getElementById("name"),
  x:        document.getElementById("x-coord"),
  y:        document.getElementById("y-coord"),
  rotation: document.getElementById("rotation"),
  scale:    document.getElementById("scale")
}
var vShader = new Shader(gl, gl.VERTEX_SHADER, vSrc)
var fShader = new Shader(gl, gl.FRAGMENT_SHADER, fSrc)
var program = new Program(gl, vShader, fShader)
var texture = new Texture(gl)
var image

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

  computed(this, "zoomScale", function () {
    zoomScale[0] = this.location.scale 
    zoomScale[4] = this.location.scale 
    return zoomScale
  })

  computed(this, "rotation", function () {
    var theta = this.location.theta
    var cos   = Math.cos(theta)
    var sin   = Math.sin(theta)

    rotation[0] = cos
    rotation[1] = -sin
    rotation[3] = sin
    rotation[4] = cos
    return rotation
  })

  computed(this, "center", function () {
    center[6] = this.location.x     
    center[7] = this.location.y
    return center
  })

  computed(this, "scaleDiff", function () { 
    return this.target.scale - this.location.scale
  })
  computed(this, "thetaDiff", function () { 
    return this.target.theta - this.location.theta
  })
  computed(this, "xDiff", function () {
    return this.target.x - this.location.x
  })
  computed(this, "yDiff", function () { 
    return this.target.y - this.location.y
  })
}

var locations = {
  base:     new Location(0, 0, 10, 0, "Base"),
  minibrot: new Location(-1.256151, 0.38082, 5.63434e-2, Math.PI / 3, "MiniBrot"),
  seahorse: new Location(-0.75, 0.1, .1, Math.PI / 6, "Seahorse Valley"),
  scepter:  new Location(-1.36, 0.005, .1, Math.PI, "Sceptre Valley"),
  spirals:  new Location(0.28693, 0.01428, 10e-4, Math.PI, "Spirals")
}

var scope = new Scope(locations.base)

var frames = [
  new Frame(2000, linear, locations.base),

  new Frame(3000, linear, locations.minibrot),
  new Frame(2000, linear, locations.minibrot),

  new Frame(3000, linear, locations.base),
  new Frame(2000, linear, locations.base),

  new Frame(3000, linear, locations.seahorse),
  new Frame(2000, linear, locations.seahorse),

  new Frame(3000, linear, locations.base),
  new Frame(2000, linear, locations.base),

  new Frame(3000, linear, locations.scepter),
  new Frame(2000, linear, locations.scepter),

  new Frame(3000, linear, locations.base),
  new Frame(2000, linear, locations.base),
  
  new Frame(3000, linear, locations.spirals),
  new Frame(2000, linear, locations.spirals),

  new Frame(3000, linear, locations.base)
]

var timeline = new Timeline(frames)

function updateGUI (loc) {
  locInfo.name.textContent     = loc.name
  locInfo.x.textContent        = "x: " + loc.x.toPrecision(4)
  locInfo.y.textContent        = "y: " + loc.y.toPrecision(4)
  locInfo.rotation.textContent = "theta: " + loc.theta.toPrecision(4)
  locInfo.scale.textContent    = "scale: " + loc.scale.toPrecision(4)
}

function makeUpdate () {
  var newTime = Date.now()
  var oldTime = newTime
  var dT      = newTime - oldTime

  return function update () {
    var frame
    var oldFrame

    oldTime = newTime
    newTime = Date.now()
    dT      = newTime - oldTime
          
    updateTimeline(dT, timeline)

    frame    = timeline.currentFrame
    oldFrame = timeline.previousFrame

    scope.target = timeline.currentFrame.data
    
    var newScale = tweenTimeline(timeline, oldFrame.data.scale, frame.data.scale)
    var newTheta = tweenTimeline(timeline, oldFrame.data.theta, frame.data.theta)
    var newX     = tweenTimeline(timeline, oldFrame.data.x, frame.data.x)
    var newY     = tweenTimeline(timeline, oldFrame.data.y, frame.data.y)

    scope.location.scale = newScale
    scope.location.theta = newTheta
    scope.location.x     = newX
    scope.location.y     = newY
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
    updateGUI(scope.location)
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

function init () {
  loadImage("/tex.png", function (err, i) {
    image = i 
    requestAnimationFrame(makeRender())
    setInterval(makeUpdate(), 25)
  })
}

document.addEventListener("DOMContentLoaded", function () {
  resize(window.innerWidth, window.innerHeight)
  init()
})
window.addEventListener("resize", function () {
  resize(window.innerWidth, window.innerHeight)
})
