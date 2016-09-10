require('babel-core/register')({
  presets: [ 'es2015' ]
})

var os = require('os')
var del = require('del')

class World {
}

function BeforeEach (scenario, callback) {
  this.tmpdir = os.tmpdir()
  callback()
}

function AfterEach (callback) {
  del(this.tmpdir, callback)
}

module.exports = function () {
  this.World = World
  this.Before(BeforeEach)
  this.After(AfterEach)
}
