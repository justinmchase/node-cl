var util = require('util');
var EventEmitter = require('events').EventEmitter;
var exec = require('./exec');
var graph = require('./graph');
var builder = require('./builder');
var Step = require('./step');
var Item = require('./item');
var model = require('./model');

var clang_cl = require('./clang-cl');
var llvm_lib = require('./llvm-lib');

function Target(info, index, options) {
	this.isDirty = true;
	this.name = info.target;
	this.type = info.type || 'lib';
	this.steps = [];
	this.items = [];
	this.dependencies = [];
	this.output = [];
	this.includes = info.includes || [];
	this.libraries = info.libraries || [];

	this.options = model.merge(options, { 
		target: this.name, 
		type: this.type,
		dependencies: this.dependencies,
		includes: this.includes,
		libraries: this.libraries,
	});

	if (info[process.platform]) {
		// Merge platform specific options onto generic options.
		this.options = model.merge(this.options, info[process.platform]);
	}
	
	// todo: Different clang steps for non-windows.
	switch (this.type) {
		case 'lib':
			this.steps.push(new Step("compile", clang_cl, { noLink: true }));
			this.steps.push(new Step("lib", llvm_lib));
			break;
		case 'dll':
			this.steps.push(new Step("compile", clang_cl, { noLink: true }));
			this.steps.push(new Step("link", clang_cl, { LD: true }));
			break;
		case 'exe':
			this.steps.push(new Step("compile", clang_cl, { noLink: true }));
			this.steps.push(new Step("link", clang_cl));
			break;
		default:
			throw new Error('Unknown target type: ' + info.type);
	}

	if (info.dependencies) {
		for (var i = 0, n = info.dependencies.length; i < n; i++) {
			var name = info.dependencies[i];
			var dep = index[name];
			dep.on('change', onchange.bind(this));
			this.dependencies.push(dep);
		}
	}

	if (info.sources) {
		for (var i = 0, n = info.sources.length; i < n; i++) {
			var source = info.sources[i];
			var item = new Item(source, this.options);
			item.on('change', onchange.bind(this));
			this.items.push(item);
		}
	}
}

function close() {
	this.items.forEach(function (item) {
		item.close();
	})
	this.items = [];
	this.removeAllListeners();
}

function onchange(item) {
	this.isDirty = true;
	this.emit('change', this);
}

function after_build(callback) {
	var self = this;
	var cmds = model.resolve(self.options.after_build, self.options);
	if (!(cmds instanceof Array)) {
		cmds = [cmds];
	}

	function next(i) {
		if (cmds.length > i) {
			var cmd = cmds[i];
			var env = model.merge(process.env, self.options);
			exec.run(cmd, env, function (err) {
				if (err) return callback(err);
				next(i + 1);
			});
		} else {
			callback();
		}
	}
	next(0);
}

function build(callback) {
	var self = this;
	if (this.isDirty) {
		function next(i, items) {
			if (self.steps.length > i) {
				var step = self.steps[i];
				self.emit('step', { target: self, step: step });
				step.build(items, self.options, function (err, results) {
					if (err) return callback(err);
					self.items.forEach(function (item) {
						item.isDirty = false;
					});
					next(i + 1, results);
				});
			} else {
				self.isDirty = false;
				self.output = items;
				self.after_build(callback);
			}
		}

		next(0, this.items);
	} else {
		callback();
	}
}

function find(data) {

	if (!data) {
		return [];
	}

	// If data is an object with targets, return the targets, e.g. { targets: [] }c
	if (data.targets) {
		return data.targets;
	}

	if (data.targets === null) {
		return [];
	}

	// if data is an array, return objects with a target property, e.g. [ { config: { } }, { target: name } ]
	if (data.length) {
		var targets = [];
		for (var i = 0, n = data.length; i < n; i++) {
			if (data[i].target) {
				targets.push(data[i]);
			}
		}
		return targets;
	}

	// If data is a single target object, e.g. { target: name }
	if (data.target) {
		return [data];
	}

	return [];
}

function resolve(data, options) {
	var found = find(data);
	var resolved = graph.resolve(found);
	var targets = [];
	var index = {};
	for (var i = 0, n = resolved.length; i < n; i++) {
		var target = new Target(resolved[i], index, options);
		index[target.name] = target;
		targets.push(target);
	}

	return targets;
}

util.inherits(Target, EventEmitter);
Target.find = find;
Target.resolve = resolve;
Target.prototype.build = build;
Target.prototype.after_build = after_build;
Target.prototype.close = close;
module.exports = Target;