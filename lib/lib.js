import path from 'path'
import debug from 'debug'
import { assign } from 'lodash'
import { create } from './directory'
import { resolve } from './model'
import { spawn } from 'child_process'

var log = debug('node-cl')

export function lib (items, options, callback) {
  let args = []

  args.push('/nologo')

  for (let i = 0, n = items.length; i < n; i++) {
    let item = items[i]
    args.push(item)
  }

  let env = options[process.platform]
  let outputDir = resolve(options.outdir, options)
  let outputPath = path.join(outputDir, resolve(options.target, options) + '.lib')

  args.push('/out:' + outputPath)

  log()
  log('> lib ' + args.join(' '))
  create(outputDir, function (err) {
    if (err) return callback(new Error('Unable to create output directory: ' + outputDir))

    let p = spawn('lib', args, {
      stdio: log.enabled ? 'inherit' : 'ignore',
      env: assign({}, process.env, env)
    })
    p.on('close', function (code) {
      callback(code === 0 ? null : new Error('lib exited with code ' + code), outputPath)
    })
  })
}
