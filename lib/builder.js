var util = require('util');
var EventEmitter = require('events').EventEmitter;
var fs = require('fs');
var yaml = require('js-yaml');
var config = require('./config');
var Target = require('./target');
var Watcher = require('./watcher');

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
			self.targets = Target.resolve(data, self.options);
		} catch (err) {
			return callback(util.inspect(err));
		}

		callback();
	});
}

function watch() {
	this.watcher = new Watcher();
	this.watcher.on('build', build.bind(this));
	this.watcher.on('rebuild', rebuild.bind(this));
	this.watcher.watch(this.targets);
}

function rebuild(callback) {
	var self = this;
	self.initialize(function (err) {
		if (err) return self.done(err);
		self.watcher.watch(self.targets);
		build(callback);
	})
}

function build(callback) {
	var self = this;
	function done(err) {
		if (err) self.emit('error', err);
		else self.emit('success');
		if (callback) callback(err);
	}
	function next(i) {
		if (self.targets.length > i) {
			var target = self.targets[i];
			target.build(function (err) {
				if (err) return done(err);
				next(i + 1);
			});
		} else {
			done();
		}
	}
	next(0);
}

function run() {
	var self = this;
	self.initialize(function (err) {
		if (err) return self.done(err);
		self.build(function (err) {
			if (err) return self.done(err);
			if (self.options.watch) {
				self.watch();
			} else {
				self.done();
			}
		})
	});
}

function done(err) {
	if (this.watcher) {
		this.watcher.close();
		this.watcher = null;
	}
	if (err) {
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