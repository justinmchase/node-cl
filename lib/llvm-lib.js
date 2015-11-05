var spawn = require('child_process').spawn;
var path = require('path');
var directory = require('./directory');

function llvm_lib(options, callback) {
	var args = [];

	if (options.sources) {
		for (var i = 0, n = options.sources.length; i < n; i++) {
			args.push(options.sources[i]);
		}
	}

	if (options.outfile) {
		args.push('/out:' + options.outfile);
	}

	directory.create(path.dirname(options.outfile), function (err) {
		if (err) return callback(new Error('Unable to create output directory: ' + path.dirname(options.outfile)));

		var p = spawn('llvm-lib', args, {
			stdio: 'inherit',
			//env: env
		});
		p.on('close', function (code) {
			callback(code === 0 ? null : new Error('llvm-lib exited with code ' + code));
		});
	});
}

module.exports = llvm_lib;