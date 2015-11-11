var argv = require('minimist')(process.argv.slice(2));
var Builder = require('../lib/builder');

require('colors');

var build = new Builder(argv);
build.on('error', onBuildError);
build.on('done', onDone);
build.run();

function onBuildError(err) {
	console.error(err);
}

function onDone(code) {
	console.log();
	if (code === 0) {
		console.log('Build ' + 'Succeeded'.green + '.');
	} else {
		console.log('Build ' + 'Failed'.red + '.');
	}
	process.exit(code);
}