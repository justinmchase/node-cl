var argv = require('minimist')(process.argv.slice(2))
var Builder = require('../lib').Builder

require('colors')

var build = new Builder(argv)
build.on('error', onBuildError)
build.on('success', onSuccess)
build.on('warning', onWarning)
build.on('info', onInfo)
build.on('done', onDone)
build.run()

function onBuildError (err) {
  console.log()
  console.log('[' + 'error'.red + ']: ' + err)
  console.log()
}

function onSuccess () {
  console.log()
  console.log('Build [' + 'succeeded'.green + '].')
  console.log()
}

function onWarning (message) {
  console.log()
  console.log('[' + 'warning'.yellow + ']: ' + message)
}

function onInfo (message) {
  console.log('[' + 'info'.blue + ']: ' + message)
}

function onDone (code) {
  console.log()
  if (code !== 0) {
    console.log('Build [' + 'failed'.red + '].')
  }
  process.exit(code)
}
