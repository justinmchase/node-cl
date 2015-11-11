var util = require('util');
var EventEmitter = require('events').EventEmitter;
var graph = require('./graph');
var builder = require('./builder');
var Step = require('./step');
var Item = require('./item');
var model = require('./model');

var clang_cl = require('./clang-cl');
var llvm_lib = require('./llvm-lib');

function Target(info, index) {
	this.isDirty = true;
	this.name = info.target;
	this.type = info.type || 'lib';
	this.steps = [];
	this.items = [];
	this.dependencies = [];
	this.output = [];
	
	// todo: Different clang steps for non-windows.
	switch (this.type) {
		case 'lib':
			this.steps.push(new Step(clang_cl, { noLink: true })); 	// noLink
			this.steps.push(new Step(llvm_lib)); 					//
			break;
		case 'dll':
			this.steps.push(new Step(clang_cl, { noLink: true })); 	// noLink
			this.steps.push(new Step(clang_cl, { LD: true })); 		// /LD
			break;
		case 'exe':
			this.steps.push(new Step(clang_cl, { noLink: true })); 	// noLink
			this.steps.push(new Step(clang_cl)); 					//
			break;
		default:
			throw new Error('Unknown target type: ' + info.type);
	}

	if (info.sources) {
		for (var i = 0, n = info.sources.length; i < n; i++) {
			var source = info.sources[i];
			this.items.push(new Item(source));
		}
	}

	if (info.dependencies) {
		for (var i = 0, n = info.dependencies.length; i < n; i++) {
			var name = info.dependencies[i];
			var dep = index[name];
			dep.on('dirty', onDependencyDirty.bind(this));
			this.dependencies.push(dep);
		}
	}
}

function onDependencyDirty(dependency) {
	this.isDirty = true;
	this.emit('dirty', this);
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

function resolve(data) {
	var found = find(data);
	var resolved = graph.resolve(found);
	var targets = [];
	var index = {};
	for (var i = 0, n = resolved.length; i < n; i++) {
		var target = new Target(resolved[i], index);
		index[target.name] = target;
		targets.push(target);
	}

	return targets;
}

function build(options, callback) {
	// for step in steps
	//   if step isDirty
	//     step.build
	var self = this;
	function next(i, items) {
		if (self.steps.length > i) {
			var step = self.steps[i];
			var opts = model.merge(options, { 
				target: self.name, 
				type: self.type,
				dependencies: self.dependencies
			});
			step.build(items, opts, function (err, results) {
				if (err) return callback(err);
				next(i + 1, results);
			});
		} else {
			self.output = items;
			callback();
		}
	}

	next(0, this.items);
}

util.inherits(Target, EventEmitter);
Target.find = find;
Target.resolve = resolve;
Target.prototype.build = build;
module.exports = Target;