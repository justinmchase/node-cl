#!/usr/bin/env node
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
build.on('executing', onexecuting)
build.on('success', onsuccess)
build.on('done', ondone)
build.run()

function onwarning (message) {
  console.log('[' + 'warning'.yellow + ']: ' + message)
}

function onerror (err) {
  console.log('[' + 'error'.red + ']: ' + err)
}

function onstart () {
  console.log('Build [' + 'starting'.blue + ']')
}

function onnext (target) {
  console.log('  target [' + target.name.magenta + ']...')
}

function onexecuting (cmd) {
  console.log(`  executing [${cmd.magenta}]...`)
}

function onsuccess () {
  console.log('Build [' + 'success'.green + ']')
}

function ondone (code) {
  if (code !== 0) {
    console.log('Build [' + 'failed'.red + '].')
  }
  process.exit(code)
}
