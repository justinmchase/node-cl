var util = require('util');
var EventEmitter = require('events').EventEmitter;
var fs = require('fs');
var yaml = require('js-yaml');
var config = require('./config');
var Target = require('./target');

function Builder(argv) {
	this.argv = argv;
	this.targets = null;
	this.options = null;
}

function initialize(callback) {
	var self = this;
	fs.readFile('build.yml', 'utf8', function (err, contents) {
		if (err) return callback(err);
		try {
			var data = yaml.load(contents) || { };
			self.options = config.initialize(data, self.argv);
			self.targets = Target.resolve(data);
		} catch (err) {
			return callback(err);
		}

		callback();
	});
}

function watch() {
	this.emit('error', 'Not yet implemented.');
	this.emit('done', 1);
}

function build(callback) {
	var self = this;
	function next(i) {
		if (self.targets.length > i) {
			var target = self.targets[i];
			if (target.isDirty) {
				target.build(self.options, function (err) {
					if (err) return callback(err);
					next(i + 1);
				});
			} else {
				next(i + 1);
			}
		} else {
			callback();
		}
	}
	next(0);
}

function run() {
	var self = this;
	self.initialize(function (err) {
		if (err) return self.done(err);
		if (self.options.watch) {
			self.watch();
		} else {
			self.build(done.bind(self));
		}
	});
}

function done(err) {
	if (err) {
		this.emit('error', err);
		this.emit('done', err.code || 1);
	} else {
		this.emit('done', 0);
	}
}


util.inherits(Builder, EventEmitter);
Builder.prototype.initialize = initialize;
Builder.prototype.watch = watch;
Builder.prototype.build = build;
Builder.prototype.done = done;
Builder.prototype.run = run;
module.exports = Builder;