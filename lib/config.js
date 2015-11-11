var path = require('path');

function initialize(config, args) {

	if (!config) config = {};
	if (!args) args = {};

	var outdir = 
		config.outdir ||
		args.outdir ||
		'build/${platform}/${configuration}/${architecture}';

	var tmpdir = 
		config.tmpdir ||
		args.tmpdir ||
		'build/obj';

	var configuration =
		args.configuration ||
		args.config ||
		args.c ||
		(args.debug || args.d) ? 'debug' : null || 
		(args.release || args.r) ? 'release' : null ||
		'debug';

	var architecture =
		args.architecture ||
		args.arch ||
		args.a ||
		(args.x86 || args.ia32) ? 'x86' : null ||
		args.x64 ? 'x64' : null ||
		process.arch;

	var platform =
		args.platform ||
		args.plat ||
		args.p ||
		args.win32 ? 'win32' : null ||
		args.linux ? 'linux' : null ||
		args.darwin ? 'darwin': null ||
		process.platform;

	var watch = 
		args.watch ||
		args.w ||
		false;

	return {
		watch: watch,
		outdir: outdir,
		tmpdir: tmpdir,
		configuration: args.configuration || 'debug',
		architecture: architecture,
		platform: platform
	};

}

module.exports = {
	initialize: initialize
};