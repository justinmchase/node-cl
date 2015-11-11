var spawn = require('child_process').spawn;
var path = require('path');
var directory = require('./directory');
var Item = require('./item');
var model = require('./model');

function cl(args, output, callback) {

	var outDir = path.dirname(output[0].source);

	console.log('> clang-cl ' + args.join(' '));
	directory.create(outDir, function (err) {
		if (err) return callback(new Error('Unable to create output directory: ' + outDir));
		var p = spawn('clang-cl', args, {
			stdio: 'inherit'
		});
		p.on('close', function (code) {
			callback(code === 0 ? null : new Error('clang-cl exited with code ' + code), output);
		});
	});
}

function build_objs(items, options, callback) {

	var args = [];
	var output = [];
	function next(i) {
		if (items.length > i) {
			var item = items[i];
			var source = item.source;
			var sourceBaseName = path.basename(source, path.extname(source));
			var outputPath = path.join(model.resolve(options.tmpdir, options), sourceBaseName + '.obj');

			args.push(source);
			args.push('/c');
			args.push('-o');
			args.push(outputPath);

			var itemOutput = [new Item(outputPath)];

			cl(args, itemOutput, function (err) {
				if (err) return callback(err);
				output = output.concat(itemOutput);
				next(i + 1);
			});
		} else {
			callback(null, output);
		}
	}

	next(0);
}

function build_bin(items, options, callback) {

	var args = [];
	var output = [];

	for (var i = 0, n = items.length; i < n; i++) {
		args.push(items[i].source);
	}

	for (var i = 0, n = options.dependencies.length; i < n; i++) {
		var dependency = options.dependencies[i];
		for (var j = 0, m = dependency.output.length; j < m; j++) {
			args.push(dependency.output[j].source);
		}
	}

	if (options.LD) {
		args.push('/LD');
	}

	if (options.arch) {
		args.push('/arch');
		args.push(options.arch);
	}

	var outputPath = path.join(
		model.resolve(options.outdir, options), 
		model.resolve(options.target, options) + (options.LD ? '.dll' : '.exe'));

	args.push('-o');
	args.push(outputPath);
	output.push(new Item(outputPath));

	cl(args, output, callback);
}

function clang_cl(items, options, callback) {
	if (options.noLink) {
		build_objs(items, options, callback);
	} else {
		build_bin(items, options, callback);
	}
}

module.exports = clang_cl;