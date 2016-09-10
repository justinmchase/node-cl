
import { merge } from 'lodash'
import { win32Config } from './config-win32'

export function config (options, callback) {
  var config = merge.apply(null, [{}].concat(options))

  let rootdir = config.rootdir ||
    process.cwd()

  let buildfile = config.buildfile ||
    'build.yml'

  let outdir = config.outdir ||
    'build'

  let bindir = config.bindir ||
    '{outdir}/bin/{configuration}/{architecture}/{target}'

  var tmpdir = config.tmpdir ||
    '{outdir}/obj/{configuration}/{architecture}/{target}'

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

  var opts = {
    debug: debug,
    watch: watch,
    rootdir: rootdir,
    outdir: outdir,
    bindir: bindir,
    tmpdir: tmpdir,
    buildfile: buildfile,
    configuration: configuration,
    architecture: architecture,
    platform: platform
  }

  if (process.platform === 'win32') {
    win32Config(function (err, results) {
      if (err) return callback(err)
      opts.win32 = results
      callback(null, opts)
    })
  } else {
    callback(new Error('Unsupported platform: ' + process.platform))
  }
}
