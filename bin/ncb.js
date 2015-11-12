var argv = require('minimist')(process.argv.slice(2));
var Builder = require('../lib/builder');

require('colors');

var build = new Builder(argv);
build.on('error', onBuildError);
build.on('success', onSuccess);
build.on('done', onDone);
build.run();

function onBuildError(err) {
	console.log();
	console.error('Build ' + 'Error'.red + ':');
	console.error(err);
	console.log();
}

function onSuccess() {
	console.log();
	console.log('Build ' + 'Succeeded'.green + '.');
	console.log();
}

function onDone(code) {
	console.log();
	if (code !== 0) {
		console.log('Build ' + 'Failed'.red + '.');
	}
	process.exit(code);
}