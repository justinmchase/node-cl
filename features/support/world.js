require('@babel/register')({
  presets: [ '@babel/env' ]
})
require('@babel/polyfill')

var path = require('path')
var os = require('os')
var del = require('del')
var uuid = require('uuid/v4')
var { AfterAll, BeforeAll, setWorldConstructor } = require('cucumber');

const tmpdir = path.join(os.tmpdir(), uuid())

class World {
  constructor({ attach, parameters }) {
    this.attach = attach
    this.parameters = parameters
    this.tmpdir = tmpdir
  }
}

AfterAll (function () {
  return del(tmpdir, { force: true })
})

setWorldConstructor(World)
