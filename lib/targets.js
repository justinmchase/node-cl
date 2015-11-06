var graph = require('./graph');
var builder = require('./builder');

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

function build(targets, options, callback) {

	var buildOrder = graph.resolve(targets);
	function next() {
		if (buildOrder.length) {
			var target = buildOrder.shift();
			builder.build(target, options, function (err) {
				if (err) {
					callback(err);
				} else {
					next();
				}
			});
		} else {
			callback();
		}
	}

	next();
}

module.exports = {
	find: find,
	build: build,
};