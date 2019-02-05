import { execFile } from 'child_process'

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

export function run (cmd, env, callback) {
  if (!cmd) return callback()
  var p = execFile(cmd, {
    cwd: env.rootdir,
    env: env
  })
  p.stdout.on('data', (data) => process.stdout.write(data))
  p.stderr.on('data', (data) => process.stderr.write(data))
  p.on('close', function (code) {
    if (code !== 0) return callback(new ExecError(cmd, code))
    callback()
  })
}
