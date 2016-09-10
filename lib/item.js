import path from 'path'
import fs from 'fs'
import { EventEmitter } from 'events'
import { resolve } from './model'

export class Item extends EventEmitter {
  constructor (source, options) {
    super()
    this.source = source
    this.options = options
    this.isDirty = true
    this.watcher = options.watch ? fs.watch(this.source, this.onchange.bind(this)) : null
  }

  onchange () {
    fs.stat(this.source, function (err, stat) {
      if (err ||
        !stat ||
        !this.lastStat ||
        stat.size !== this.lastStat.size ||
        stat.atime.getTime() !== this.lastStat.atime.getTime() ||
        stat.mtime.getTime() !== this.lastStat.mtime.getTime() ||
        stat.ctime.getTime() !== this.lastStat.ctime.getTime() ||
        stat.birthtime.getTime() !== this.lastStat.birthtime.getTime()) {
        this.lastStat = stat
        this.isDirty = true
        this.emit('change', this)
      }
    })
  }

  close () {
    if (this.watcher) {
      this.watcher.close()
      this.watcher = null
    }
    this.removeAllListeners()
  }
}
