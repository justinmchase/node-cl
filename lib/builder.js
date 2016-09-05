import util from 'util'
import fs from 'fs'
import yaml from 'js-yaml'
import { EventEmitter } from 'events'
import { config } from './config'
import { Target } from './target'
import { Watcher } from './watcher'

export function Builder (argv) {
  this.argv = argv
  this.targets = null
  this.options = null
}

function initialize (callback) {
  var self = this
  fs.readFile('build.yml', 'utf8', function (err, contents) {
    if (err) return callback(err)
    try {
      // If the file fails to load we will use command line args until it succeeds.
      config(null, self.argv, function (err, options) {
        if (err) return callback(err)
        self.options = options

        var data = yaml.load(contents) || {}
        config(data, self.argv, function (err, options) {
          if (err) return callback(err)
          self.options = options
          self.targets = Target.resolve(data, options)
          self.targets.forEach(function (target) {
            target.on('step', onstep.bind(self))
          })
          callback()
        })
      })
    } catch (err) {
      return callback(err)
    }
  })
}

function onstep (event) {
  // var target = event.target
  var step = event.step
  this.emit('info', `  ${step.name}`)
}

function watch () {
  this.watcher = new Watcher()
  this.watcher.on('build', build.bind(this))
  this.watcher.on('rebuild', rebuild.bind(this))
  this.watcher.watch(this.targets)
}

function rebuild (callback) {
  var self = this
  self.initialize(function (err) {
    if (err) return self.done(err)
    self.watcher.watch(self.targets)
    self.build(callback)
  })
}

function build (callback) {
  var self = this
  function done (err) {
    if (err) self.emit('error', err)
    else self.emit('success')
    if (callback) callback(err)
  }
  function next (i) {
    if (self.targets.length > i) {
      var target = self.targets[i]
      self.emit('info', `target: ${target.name}`)
      target.build(function (err) {
        if (err) return done(err)
        next(i + 1)
      })
    } else {
      done()
    }
  }

  if (self.targets.length > 0) {
    self.emit('info', 'Build starting...')
    next(0)
  } else {
    self.emit('warning', 'No targets found.')
    done()
  }
}

function run () {
  var self = this
  self.initialize(function (err) {
    if (err) {
      self.emit('error', err)
      if (self.options && self.options.watch) {
        self.watch()
      } else {
        self.done(err)
      }
      return
    }
    self.build(function (err) {
      if (self.options.watch) {
        self.watch()
      } else {
        self.done(err)
      }
    })
  })
}

function done (err) {
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

util.inherits(Builder, EventEmitter)
Builder.prototype.initialize = initialize
Builder.prototype.watch = watch
Builder.prototype.build = build
Builder.prototype.done = done
Builder.prototype.run = run
