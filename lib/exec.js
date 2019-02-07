
import { execFile } from 'child_process'
import debug from 'debug'
import path from 'path'

const log = debug('ncl')

function ExecError (cmd, code) {
  var temp = Error.apply(this, [])
  this.name = temp.name = 'ExecError'
  this.stack = temp.stack
  this.message = `Command "${cmd}" failed with code ${code}`
}

ExecError.prototype = Object.create(Error.prototype, {
  constructor: {
    value: ExecError,
    writable: true,
    configurable: true
  }
})

export function run (cmd, opts, callback) {
  if (!cmd) return callback()
  const { cwd, env } = opts
  const file = path.resolve(cwd, cmd)
  var p = execFile(file, {
    cwd,
    env
  })
  p.stdout.on('data', (data) => log(`$ ${data.trim()}`))
  p.stderr.on('data', (data) => log(`$ ${data.trim()}`))
  p.on('close', function (code) {
    if (code !== 0) return callback(new ExecError(cmd, code))
    callback()
  })
}
