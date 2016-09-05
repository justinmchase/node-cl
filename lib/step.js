import model from './model'

export function Step (name, fn, options) {
  this.name = name
  this.fn = fn
  this.options = options || { }
}

Step.prototype.build = function build (items, options, callback) {
  var self = this
  var opts = model.merge(process.env, options, self.options)
  self.fn(items, opts, callback)
}
