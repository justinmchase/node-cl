var path = require('path');
var fs = require('fs');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var model = require('./model');
var clang_cl = require('./clang-cl');

function Item(source, options) {
	this.source = source;
	this.options = options;
	this.isDirty = true;
	this.output = path.join(
		model.resolve(options.tmpdir, options),
		path.basename(source, path.extname(source)) + '.obj');

	console.log('watching: ' + this.source);
	this.watcher = fs.watch(this.source, {interval: 500}, onchange.bind(this));
}

function onchange() {
	var self = this;
	fs.stat(this.source, function (err, stat) {
		if (!stat ||
			!self.lastStat ||
			stat.size !== self.lastStat.size ||
			stat.atime.getTime() !== self.lastStat.atime.getTime() ||
			stat.mtime.getTime() !== self.lastStat.mtime.getTime() ||
			stat.ctime.getTime() !== self.lastStat.ctime.getTime() ||
			stat.birthtime.getTime() !== self.lastStat.birthtime.getTime()) {
			self.lastStat = stat;
			self.isDirty = true;
			self.emit('change', self);
		}
	});
}

function build(callback) {
	var self = this;
	if (self.isDirty) {
		clang_cl(self, model.merge(self.options, {noLink:true}), function (err, output) {
			if (err) return callback(err);
			self.isDirty = false;
			callback(null, output);
		})
	} else {
		callback(null, this.output);
	}
}

function close() {
	if (this.watcher) {
		this.watcher.stop();
		this.watcher = null;
	}
	this.removeAllListeners();
}

util.inherits(Item, EventEmitter);
Item.prototype.build = build;
Item.prototype.close = close;
module.exports = Item;