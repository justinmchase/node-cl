
import { eachOf } from 'async'
import debug from 'debug'
import path from 'path'
import { UnexpectedError } from './errors'
import { cp, ex } from './commands'

const log = debug('ncl')

function processCommand (args, key, callback) {
  switch (key) {
    case 'cp':
      return cp({ args, ...this }, callback)
    case 'ex':
      return ex({ args, ...this }, callback)
    default:
      throw new UnexpectedError('command', key)
  }
}

export function run (args, callback) {
  const { cmd } = args
  if (!cmd) return callback()
  eachOf(cmd, processCommand.bind(args), callback)
}
