import path from 'path'
import debug from 'debug'
import { exec, spawn } from 'child_process'
import { ExecError } from '../errors';

const log = debug('ncl')

export function ex({ cwd, env, executing, args }, callback) {
  const _args = path.resolve(cwd, args)  
  log(`> ex ${_args}`)
  executing(_args)
  const child = spawn(_args, [], {
    cwd,
    env,
    stdio: 'inherit',
    stderr: 'inherit'
  })
  child.on('close', (code) => {
    log(`> ex code: ${code}`)
    if (code === 0) return callback()
    callback(new ExecError('ex', code))
  })
}
