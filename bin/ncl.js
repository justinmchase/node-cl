require('colors')
require('babel-core/register')({
  presets: [ 'es2015' ]
})

var argv = require('minimist')(process.argv.slice(2))
var Builder = require('../lib').Builder

var build = new Builder(argv)
build.on('warning', onwarning)
build.on('error', onerror)
build.on('start', onstart)
build.on('next', onnext)
build.on('success', onsuccess)
build.on('done', ondone)
build.run()

function onwarning (message) {
  console.log()
  console.log('[' + 'warning'.yellow + ']: ' + message)
}

function onerror (err) {
  console.log()
  console.log('[' + 'error'.red + ']: ' + err)
  console.log()
}

function onstart () {
  console.log('Build [' + 'starting'.blue + ']')
}

function onnext (event) {
  console.log('  building [' + event.target.name.magenta + ']...')
}

function onsuccess () {
  console.log()
  console.log('Build [' + 'success'.green + ']')
  console.log()
}

function ondone (code) {
  console.log()
  if (code !== 0) {
    console.log('Build [' + 'failed'.red + '].')
  }
  process.exit(code)
}
