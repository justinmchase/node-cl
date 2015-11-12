var path = require('path');
var model = require('./model');

function initialize() {

	var config = model.merge.apply(this, arguments);
	
	var outdir = 
		config.outdir ||
		'build/${configuration}/${architecture}/${target}';

	var tmpdir =
		config.tmpdir ||
		'build/obj/${configuration}/${architecture}/${target}';

	var configuration =
		config.configuration ||
		config.config ||
		config.c ||
		(config.debug || config.d) ? 'debug' : null || 
		(config.release || config.r) ? 'release' : null ||
		'debug';

	var architecture =
		config.architecture ||
		config.arch ||
		config.a ||
		(config.x86 || config.ia32) ? 'x86' : null ||
		config.x64 ? 'x64' : null ||
		process.arch;

	var platform =
		config.platform ||
		config.plat ||
		config.p ||
		config.win32 ? 'win32' : null ||
		config.linux ? 'linux' : null ||
		config.darwin ? 'darwin': null ||
		process.platform;

	var watch = 
		config.watch ||
		config.w ||
		false;

	return {
		watch: watch,
		outdir: outdir,
		tmpdir: tmpdir,
		configuration: configuration,
		architecture: architecture,
		platform: platform
	};

}

module.exports = {
	initialize: initialize
};