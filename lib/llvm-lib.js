var spawn = require('child_process').spawn;
var path = require('path');
var directory = require('./directory');
var Item = require('./item');
var model = require('./model');

function llvm_lib(items, options, callback) {
	var args = [];

	for (var i = 0, n = items.length; i < n; i++) {
		var item = items[i];
		args.push(item);
	}

	var outputDir = model.resolve(options.outdir, options)
	var outputPath = path.join(outputDir, model.resolve(options.target, options) + '.lib')


	args.push('/out:' + outputPath);
	//console.log('> llvm-lib ' + args.join(' '));
	directory.create(outputDir, function (err) {
		if (err) return callback(new Error('Unable to create output directory: ' + outputDir));

		var p = spawn('llvm-lib', args, {
			stdio: 'inherit'
		});
		p.on('close', function (code) {
			callback(code === 0 ? null : new Error('llvm-lib exited with code ' + code), outputPath);
		});
	});
}

module.exports = llvm_lib;