import debug from 'debug'
import { assign } from 'lodash'
import { EventEmitter } from 'events'
import { run } from './exec'
import { Step } from './step'
import { Item } from './item'
import { resolve as graphResolve } from './graph'
import { resolve as modelResolve } from './model'
import { cl } from './cl'
import { lib } from './lib'

var log = debug('ncl')

export class Target extends EventEmitter {

  constructor (info, index, options) {
    super()
    this.isDirty = true
    this.name = info.target
    this.type = info.type || 'lib'
    this.steps = []
    this.items = []
    this.dependencies = []
    this.output = []
    this.includes = info.includes || []
    this.libraries = info.libraries || []

    let opts = {
      target: this.name,
      type: this.type,
      dependencies: this.dependencies,
      includes: this.includes,
      libraries: this.libraries,
      before_build: info.before_build || [],
      after_build: info.after_build || []
    }

    this.options = assign({}, info[process.platform], options, opts)

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
        dep.on('change', this.onchange.bind(this))
        this.dependencies.push(dep)
      }
    }

    if (info.sources) {
      for (let i = 0, n = info.sources.length; i < n; i++) {
        let source = info.sources[i]
        let item = new Item(source, this.options)
        item.on('change', this.onchange.bind(this))
        this.items.push(item)
      }
    }
  }

  close () {
    this.items.forEach(item => {
      item.close()
    })
    this.items = []
    this.removeAllListeners()
  }

  onchange (item) {
    this.isDirty = true
    this.emit('change', this)
  }

  externalBuild (steps, callback) {
    if (!steps) return callback()
    var cmds = modelResolve(steps, this.options)
    if (!Array.isArray(cmds)) {
      cmds = [cmds]
    }

    let next = (i) => {
      if (cmds.length > i) {
        var cmd = cmds[i]
        var env = assign({}, process.env, this.options[process.platform])
        this.emit('executing', cmd)
        run(cmd, env, (err) => {
          if (err) return callback(err)
          next(i + 1)
        })
      } else {
        callback()
      }
    }
    next(0)
  }

  build (callback) {
    let next = (i, items) => {
      if (this.steps.length > i) {
        var step = this.steps[i]
        this.emit('step', { target: this, step: step })
        step.build(items, this.options, (err, results) => {
          if (err) return callback(err)
          this.items.forEach(item => {
            item.isDirty = false
          })
          next(i + 1, results)
        })
      } else {
        this.isDirty = false
        this.output = items
        this.externalBuild(this.options.after_build, callback)
      }
    }
    if (this.isDirty) {
      this.externalBuild(this.options.before_build, err => {
        if (err) return callback(err)
        next(0, this.items)
      })
    } else {
      callback()
    }
  }
}

export function find (data) {
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

export function resolve (data, options) {
  var found = find(data)
  var resolved = graphResolve(found)
  var targets = []
  var index = {}
  for (var i = 0, n = resolved.length; i < n; i++) {
    var target = new Target(resolved[i], index, options)
    index[target.name] = target
    targets.push(target)
  }

  return targets
}
