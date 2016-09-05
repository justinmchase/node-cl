import util from 'util'
import { EventEmitter } from 'events'
import { exec } from './exec'
import { graph } from './graph'
import { Step } from './step'
import { Item } from './item'
import { model } from './model'
import { cl } from './cl'
import { lib } from './lib'

export function Target (info, index, options) {
  this.isDirty = true
  this.name = info.target
  this.type = info.type || 'lib'
  this.steps = []
  this.items = []
  this.dependencies = []
  this.output = []
  this.includes = info.includes || []
  this.libraries = info.libraries || []

  this.options = model.merge(options, {
    target: this.name,
    type: this.type,
    dependencies: this.dependencies,
    includes: this.includes,
    libraries: this.libraries,
    before_build: info.before_build || [],
    after_build: info.after_build || []
  })

  if (info[process.platform]) {
    // Merge platform specific options onto generic options.
    this.options = model.merge(this.options, info[process.platform])
  }

  // todo: Different clang steps for non-windows.
  switch (this.type) {
    case 'lib':
      this.steps.push(new Step('compile', cl, { noLink: true }))
      this.steps.push(new Step('lib', lib))
      break
    case 'dll':
      this.steps.push(new Step('compile', cl, { noLink: true }))
      this.steps.push(new Step('link', cl, { LD: true }))
      break
    case 'exe':
      this.steps.push(new Step('compile', cl, { noLink: true }))
      this.steps.push(new Step('link', cl))
      break
    default:
      throw new Error('Unknown target type: ' + info.type)
  }

  if (info.dependencies) {
    for (let i = 0, n = info.dependencies.length; i < n; i++) {
      let name = info.dependencies[i]
      let dep = index[name]
      dep.on('change', onchange.bind(this))
      this.dependencies.push(dep)
    }
  }

  if (info.sources) {
    for (let i = 0, n = info.sources.length; i < n; i++) {
      let source = info.sources[i]
      let item = new Item(source, this.options)
      item.on('change', onchange.bind(this))
      this.items.push(item)
    }
  }
}

function close () {
  this.items.forEach(function (item) {
    item.close()
  })
  this.items = []
  this.removeAllListeners()
}

function onchange (item) {
  this.isDirty = true
  this.emit('change', this)
}

function externalBuild (steps, callback) {
  if (!steps) return callback()
  var self = this
  var cmds = model.resolve(steps, self.options)
  if (!(cmds instanceof Array)) {
    cmds = [cmds]
  }

  function next (i) {
    if (cmds.length > i) {
      var cmd = cmds[i]
      var env = model.merge(process.env, self.options)
      exec.run(cmd, env, function (err) {
        if (err) return callback(err)
        next(i + 1)
      })
    } else {
      callback()
    }
  }
  next(0)
}

function build (callback) {
  var self = this
  function next (i, items) {
    if (self.steps.length > i) {
      var step = self.steps[i]
      self.emit('step', { target: self, step: step })
      step.build(items, self.options, function (err, results) {
        if (err) return callback(err)
        self.items.forEach(function (item) {
          item.isDirty = false
        })
        next(i + 1, results)
      })
    } else {
      self.isDirty = false
      self.output = items
      self.externalBuild(self.options.after_build, callback)
    }
  }
  if (this.isDirty) {
    self.externalBuild(self.options.before_build, function (err) {
      if (err) return callback(err)
      next(0, self.items)
    })
  } else {
    callback()
  }
}

function find (data) {
  if (!data) {
    return []
  }

  // If data is an object with targets, return the targets, e.g. { targets: [] }c
  if (data.targets) {
    return data.targets
  }

  if (data.targets === null) {
    return []
  }

  // if data is an array, return objects with a target property, e.g. [ { config: { } }, { target: name } ]
  if (data.length) {
    var targets = []
    for (var i = 0, n = data.length; i < n; i++) {
      if (data[i].target) {
        targets.push(data[i])
      }
    }
    return targets
  }

  // If data is a single target object, e.g. { target: name }
  if (data.target) {
    return [data]
  }

  return []
}

function resolve (data, options) {
  var found = find(data)
  var resolved = graph.resolve(found)
  var targets = []
  var index = {}
  for (var i = 0, n = resolved.length; i < n; i++) {
    var target = new Target(resolved[i], index, options)
    index[target.name] = target
    targets.push(target)
  }

  return targets
}

util.inherits(Target, EventEmitter)
Target.find = find
Target.resolve = resolve
Target.prototype.build = build
Target.prototype.externalBuild = externalBuild
Target.prototype.close = close
