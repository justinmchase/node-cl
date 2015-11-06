var path = require('path');
var util = require('util');
var fs = require('fs');
var spawn = require('child_process').spawn;
var yaml = require('js-yaml');
var graph = require('../lib/graph');
var config = require('../lib/config');
var targets = require('../lib/targets');
var argv = require('minimist')(process.argv.slice(2));

fs.readFile('build.yml', 'utf8', function (err, contents) {
	if (err) return console.log('Error: unable to find build.yaml in current directory.');

	var data = yaml.load(contents) || { };
	var options = config.initialize(data, argv);
	var found = targets.find(data);

	targets.build(found, options, function (err) {
		if (err) {
			console.error(err);
			process.exit(1);
		} else {
			console.log();
			console.log('Build Succeeded.');
			process.exit(0);
		}
	});

});

function buildTargets(targets) {
}