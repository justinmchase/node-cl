var argv = require('minimist')(process.argv.slice(2));
var util = require('util');
var Builder = require('../lib/builder');

require('colors');

var build = new Builder(argv);
build.on('error', onBuildError);
build.on('success', onSuccess);
build.on('warning', onWarning);
build.on('info', onInfo);
build.on('done', onDone);
build.run();

function onBuildError(err) {
	console.log();
	console.error('[' + 'error'.red + ']: ');
	console.error(err.stack || err);
	console.log();
}

function onSuccess() {
	console.log();
	console.log('Build ' + 'Succeeded'.green + '.');
	console.log();
}

function onWarning(message) {
	console.log();
	console.log('[' + 'warning'.yellow + ']: ' + message);
}

function onInfo(message) {
	console.log('[' + 'info'.blue + ']: ' + message);
}

function onDone(code) {
	console.log();
	if (code !== 0) {
		console.log('Build ' + 'Failed'.red + '.');
	}
	process.exit(code);
}