var http = require("http")
var fs   = require("fs")
var path = require("path")
var PORT = 4001

function writeError (res, err) {
  res.writeHead(404)
  res.end()
}

function sendFile (res, ext, data) {
  var mimeType = "text"

  if      (ext === ".js")  mimeType = "text/javascript"
  else if (ext === ".css") mimeType = "text/css"
  else if (ext === ".png") mimeType = "image/png"
  else if (ext === ".jpg") mimeType = "image/jpg"
  else if (ext === ".mp3") mimeType = "audio/mpeg3"
  else if (ext === ".ogg") mimeType = "audio/ogg"

  res.setHeader("Content-type", mimeType)
  res.write(data)
  res.end()
}

var server = http.createServer(function (req, res) {
  var filePath = "./public" + req.url
  var fileName = path.basename(filePath)
  var fileExt  = path.extname(fileName)
  var htmlPath = "./mandelbrot.html"

  fs.readFile(fileExt ? filePath : htmlPath, function (err, data) {
    if (err) return writeError(res, err)
    else     return sendFile(res, fileExt, data)
  })
})

server.listen(PORT)
