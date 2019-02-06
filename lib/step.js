const { assign } = Object;
export class Step {
  constructor (name, fn, options) {
    this.name = name
    this.fn = fn
    this.options = options || { }
  }

  build (items, options, callback) {
    var opts = assign({}, options, this.options)
    this.fn(items, opts, callback)
  }
}
