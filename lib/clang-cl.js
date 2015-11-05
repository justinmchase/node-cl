var spawn = require('child_process').spawn;
var path = require('path');
var directory = require('./directory');

function clang_cl(options, callback) {

	var args = [];

	if (options.type === 'dll') {
		args.push('/LD');
	}

	if (options.noLink) {
		args.push('/c');
	}

	if (options.arch) {
		args.push('/arch');
		args.push(options.arch);
	}

	if (options.sources && options.sources.length) {
		for (var i = 0, n = options.sources.length; i < n; i++) {
			args.push(options.sources[i]);
		}
	}

	if (options.outfile) {
		args.push('-o');
		args.push(options.outfile);
	}

	console.log('> clang-cl ' + args.join(' '));
	directory.create(path.dirname(options.outfile), function (err) {
		if (err) return callback(new Error('Unable to create output directory: ' + path.dirname(options.dirname)));

		var p = spawn('clang-cl', args, {
			stdio: 'inherit',
			//env: env
		});
		p.on('close', function (code) {
			callback(code === 0 ? null : new Error('clang-cl exited with code ' + code));
		});
	});
}

module.exports = clang_cl;