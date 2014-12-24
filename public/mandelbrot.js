var canvas  = document.getElementById("view")
var gl      = canvas.getContext("webgl")
var vSrc    = document.getElementById("vShader").text
var fSrc    = document.getElementById("fShader").text
var vShader = new Shader(gl, gl.VERTEX_SHADER, vSrc)
var fShader = new Shader(gl, gl.FRAGMENT_SHADER, fSrc)
var program = new Program(gl, vShader, fShader)

var quadVerts = new Float32Array([
  1, 1,
  -1, 1,
  -1, -1,

  1, 1,
  -1, -1,
  1, -1
])

function resize (width, height) {
  var size = width < height ? width : height

  canvas.width  = size
  canvas.height = size
  gl.viewport(0, 0, size, size)
}

function makeRender () {
  var centerLoc = program.uniforms.center
  var scaleLoc  = program.uniforms.scale

  gl.enable(gl.BLEND)
  gl.enable(gl.CULL_FACE)
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
  gl.clearColor(1.0, 1.0, 1.0, 0.0)
  gl.colorMask(true, true, true, true)
  gl.useProgram(program.program)
  program.updateBuffer(gl, "a_position", 2, quadVerts)
  return function render () {
    gl.uniform2f(centerLoc, 2, 1)
    gl.uniform1f(scaleLoc, .005)
    gl.drawArrays(gl.TRIANGLES, 0, 6)
    requestAnimationFrame(render) 
  }
}

document.addEventListener("DOMContentLoaded", function () {
  resize(window.innerWidth, window.innerHeight)
  requestAnimationFrame(makeRender())
})
window.addEventListener("resize", function () {
  resize(window.innerWidth, window.innerHeight)
})
