import path from 'path'
import directory from './directory'
import model from './model'
import { spawn } from 'child_process'

export function lib (items, options, callback) {
  var args = []

  for (var i = 0, n = items.length; i < n; i++) {
    var item = items[i]
    args.push(item)
  }

  var env = options[process.platform]
  var outputDir = model.resolve(options.outdir, options)
  var outputPath = path.join(outputDir, model.resolve(options.target, options) + '.lib')

  args.push('/out:' + outputPath)

  console.log('> lib ' + args.join(' '))
  directory.create(outputDir, function (err) {
    if (err) return callback(new Error('Unable to create output directory: ' + outputDir))

    var p = spawn('lib', args, {
      stdio: 'inherit',
      env: model.merge(env, process.env)
    })
    p.on('close', function (code) {
      callback(code === 0 ? null : new Error('lib exited with code ' + code), outputPath)
    })
  })
}
