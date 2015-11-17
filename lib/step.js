var model = require('./model');

function Step(name, fn, options) {
	this.name = name;
	this.fn = fn;
	this.options = options || { };
}

function build(items, options, callback) {
	var self = this;
	var opts = model.merge(process.env, options, self.options);
	self.fn(items, opts, callback);
}

Step.prototype.build = build;
module.exports = Step;