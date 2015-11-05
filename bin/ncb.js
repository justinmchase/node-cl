var path = require('path');
var util = require('util');
var fs = require('fs');
var spawn = require('child_process').spawn;
var yaml = require('js-yaml');
var builder = require('../lib/builder');

// These values should be overridable in a section in the build.yml file
var options = {
	outdir: path.resolve('build'),
	configuration: 'debug',
	arch: process.arch,
};

fs.readFile('build.yml', 'utf8', function (err, contents) {
	if (err) return console.log('Error: unable to find build.yaml in current directory.');

	var data = yaml.load(contents);

	if (data && data.length) {
		buildTargets(data);
	} else if (data) {
		buildTargets([data]);
	} else {
		console.log('Expected one or more targets at the top level of your build.yaml file.');
	}
});

function resolveBuildGraph(targets) {
	// Khan's algorithm for topographical sorting
	// L ← Empty list that will contain the sorted elements
	// S ← Set of all nodes with no incoming edges
	// while S is non-empty do
	//     remove a node n from S
	//     add n to tail of L
	//     for each node m with an edge e from n to m do
	//         remove edge e from the graph
	//         if m has no other incoming edges then
	//             insert m into S
	// if graph has edges then
	//     return error (graph has at least one cycle)
	// else 
	//     return L (a topologically sorted order)

	// note: 'no incoming edges' means no dependencies on.
	//       This means that edges is an index of what other targets depend on it.

	var index = {};
	var edges = {};
	var L = [];
	var S = [];

	// Generate index and edges
	targets.forEach(function (t) {
		index[t.target] = t;
		if (!edges[t.target]) edges[t.target] = [];
		if (t.dependencies) {
			t.dependencies.forEach(function (d) {
				if (!edges[d]) edges[d] = [];
				edges[d].push(t.target);
			})
		}
	});

	// Find targets with no incoming edges.
	for(var t in edges) {
		if (!edges[t].length) {
			delete edges[t];
			S.push(index[t]);
		}
	}

	// Slowly remove edges starting with nodes in S, when a node has no incoming edges insert into L.
	while (S.length) {
		var n = S.shift();
		L.push(n);
		if (n.dependencies) {
			n.dependencies.forEach(function (m) {
				var i = edges[m].indexOf(n);
				edges[m].splice(i, 1);
				if (!edges[m].length) {
					L.unshift(index[m]);
					delete edges[m];
				}
			});
		}
	}

	// If there are any remaining edges, there is a circular graph.
	if (Object.getOwnPropertyNames(edges).length) {
		throw new Error('No valid build target: Graph has at least one cycle.');
	}

	return L;
}

function buildTargets(targets) {
	var buildOrder = resolveBuildGraph(targets);
	function next() {
		if (buildOrder.length) {
			var target = buildOrder.shift();
			builder.build(target, options, function (err) {
				if (err) {
					console.error(err);
					process.exit(1);
				} else {
					next();
				}
			});
		} else {
			console.log();
			console.log('Success.');
			process.exit(0);
		}
	}

	next();
}