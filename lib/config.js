var path = require('path');
var model = require('./model');

function initialize(data, argv, callback) {

	var config = model.merge(data, argv);
	
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

	var platform = process.platform;

	var watch = 
		config.watch ||
		config.w ||
		false;

	var options = {
		watch: watch,
		outdir: outdir,
		tmpdir: tmpdir,
		configuration: configuration,
		architecture: architecture,
		platform: platform
	};

	if (process.platform === 'win32') {
		require('./config-win32').config(function (err, results) {
			if (err) return callback(err);
			options.win32 = results;
			callback(null, options);
		});
	} else {
		callback(new Error('Unsupported platform: ' + process.platform));
	}
}

module.exports = {
	initialize: initialize
};