import 'source-map-support/register'
import path from 'path'
import del from 'del'
import uuid from 'uuid/v4'
import debug from 'debug'
import { AfterAll, setWorldConstructor } from 'cucumber'

const tmpdir = path.resolve(path.join('build', 'tmp', uuid()))
const log = debug('ncl')

class World {
  constructor({ attach, parameters }) {
    this.attach = attach
    this.parameters = parameters
    this.tmpdir = tmpdir
  }
}

AfterAll(function () {
  if (!log.enabled) {
    return del([tmpdir], { force: true })
  } else {
    log('Test output:', tmpdir)
  }
})

setWorldConstructor(World)
