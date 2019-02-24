import path from 'path'
import fs from 'fs'
import debug from 'debug'

const log = debug('ncl')

export function cp({ cwd, env, args }, callback) {
  const { from, to } = args
  const _from = path.resolve(cwd, from)
  const _to = path.resolve(cwd, to)
  
  log(`> cp ${_from} ${_to}`)
  const rs = fs.createReadStream(_from)
  const ws = fs.createWriteStream(_to)
  rs
    .on('error', callback)
    .pipe(ws)
    .on('error', callback)
    .on('close', callback)
}
