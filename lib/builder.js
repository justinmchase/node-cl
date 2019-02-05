import fs from 'fs'
import path from 'path'
import yaml from 'js-yaml'
import { EventEmitter } from 'events'
import { config } from './config'
import { resolve } from './target'
import { Watcher } from './watcher'

export class Builder extends EventEmitter {
  constructor (options) {
    super()
    this.options = options
  }

  initialize (callback) {
    config([this.options, process.env], (err, options) => {
      if (err) return callback(err)
      let buildfile = path.resolve(options.rootdir, options.buildfile)
      fs.readFile(buildfile, 'utf8', (err, contents) => {
        if (err) return callback(err)
        var data = yaml.load(contents) || {}
        config([this.options, process.env, data], (err, options) => {
          if (err) return callback(err)
          this.options = options
          this.targets = resolve(data, options)
          this.targets.forEach(target => {
            target.on('step', this.onstep.bind(this))
            target.on('executing', this.onexecuting.bind(this))
          })
          callback()
        })
      })
    })
  }

  onstep (event) {
    this.emit('step', event)
  }

  onexecuting (event) {
    this.emit('executing', event)
  }

  watch () {
    this.watcher = new Watcher()
    this.watcher.on('build', this.build.bind(this))
    this.watcher.on('rebuild', this.rebuild.bind(this))
    this.watcher.watch(this.targets)
  }

  rebuild (callback) {
    this.initialize(err => {
      if (err) return this.done(err)
      this.watcher.watch(this.targets)
      this.build(callback)
    })
  }

  build (callback) {
    let done = (err) => {
      if (err) this.emit('error', err)
      else this.emit('success')
      if (callback) callback(err)
    }
    let next = (i) => {
      if (this.targets.length > i) {
        var target = this.targets[i]
        this.emit('next', target)
        target.build(err => {
          if (err) return done(err)
          next(i + 1)
        })
      } else {
        done()
      }
    }

    if (this.targets.length > 0) {
      this.emit('start')
      next(0)
    } else {
      this.emit('warning', 'No targets found.')
      done()
    }
  }

  run () {
    this.initialize(err => {
      if (err) {
        this.emit('error', err)
        if (this.options && this.options.watch) {
          this.watch()
        } else {
          this.done(err)
        }
        return
      }

      this.build(err => {
        if (this.options.watch) {
          this.watch()
        } else {
          this.done(err)
        }
      })
    })
  }

  done (err) {
    if (this.watcher) {
      this.watcher.close()
      this.watcher = null
    }
    if (err) {
      this.emit('done', err.code || 1)
    } else {
      this.emit('done', 0)
    }
  }
}
