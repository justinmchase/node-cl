import path from 'path'
import fs from 'fs'
import util from 'util'
import { EventEmitter } from 'events'
import { model } from './model'

function Item (source, options) {
  this.source = source
  this.options = options
  this.isDirty = true
  this.objName = path.basename(source, path.extname(source)) + '.obj'
  this.output = options && options.tmpdir && path.join(model.resolve(options.tmpdir, options), this.objName) || ''
  this.watcher = fs.watch(this.source, onchange.bind(this))
}

function onchange () {
  var self = this
  fs.stat(this.source, function (err, stat) {
    if (err ||
      !stat ||
      !self.lastStat ||
      stat.size !== self.lastStat.size ||
      stat.atime.getTime() !== self.lastStat.atime.getTime() ||
      stat.mtime.getTime() !== self.lastStat.mtime.getTime() ||
      stat.ctime.getTime() !== self.lastStat.ctime.getTime() ||
      stat.birthtime.getTime() !== self.lastStat.birthtime.getTime()) {
      self.lastStat = stat
      self.isDirty = true
      self.emit('change', self)
    }
  })
}

function close () {
  if (this.watcher) {
    this.watcher.close()
    this.watcher = null
  }
  this.removeAllListeners()
}

util.inherits(Item, EventEmitter)
Item.prototype.close = close
module.exports = Item
