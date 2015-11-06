var path = require('path');

function initialize(config, args) {

	if (!config) config = {};
	if (!args) args = {};

	var outdir = 
		config.outdir ||
		args.outdir ||
		'build';

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

	return {
		outdir: outdir,
		tmpdir: tmpdir,
		configuration: args.configuration || 'debug',
		architecture: architecture 
	};

}

module.exports = {
	initialize: initialize
};