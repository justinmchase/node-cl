import { merge } from 'lodash'
import { win32Config } from './config-win32'

export function config (data, argv, callback) {
  var config = merge({}, data, argv)

  var outdir = config.outdir ||
    'build/{configuration}/{architecture}/{target}'

  var tmpdir = config.tmpdir ||
    'build/obj/{configuration}/{architecture}/{target}'

  var configuration = config.configuration ||
    config.config ||
    config.c ||
    (config.debug || config.d) ? 'debug' : null ||
    (config.release || config.r) ? 'release' : null ||
    'debug'

  var architecture = config.architecture ||
    config.arch ||
    config.a ||
    (config.x86 || config.ia32) ? 'x86' : null ||
    config.x64 ? 'x64' : null ||
    process.arch

  var platform = process.platform

  var watch = config.watch ||
    config.w ||
    false

  var debug = config.debug ||
    config.d ||
    false

  var options = {
    debug: debug,
    watch: watch,
    outdir: outdir,
    tmpdir: tmpdir,
    configuration: configuration,
    architecture: architecture,
    platform: platform
  }

  if (process.platform === 'win32') {
    win32Config(function (err, results) {
      if (err) return callback(err)
      options.win32 = results
      callback(null, options)
    })
  } else {
    callback(new Error('Unsupported platform: ' + process.platform))
  }
}
