var path = require('path');
var fs = require('fs');
var model = require('./model');

function Item(source, options) {
	this.source = source;
	this.options = options;
}

function basename() {
	return path.basename(this.source);
}

function objPath() {
	var basename = this.basename();
	return path.join(
		model.resolve(this.options.tmpdir, this.options),
		basename + '.obj');
}

function watch(callback) {
	fs.watchFile(this.source, { interval: 1000 }, function() {
		callback();
	});
}

function unwatch(callback) {
	fs.unwatchFile(this.source, callback);
}

Item.prototype.basename = basename;
Item.prototype.objPath = objPath;
Item.prototype.watch = watch;
Item.prototype.unwatch = unwatch;
module.exports = Item;