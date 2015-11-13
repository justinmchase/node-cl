var spawn = require('child_process').spawn;
var path = require('path');
var directory = require('./directory');
var Item = require('./item');
var model = require('./model');

function cl(args, output, callback) {

	var outDir = path.dirname(output);

	console.log('> clang-cl ' + args.join(' '));
	console.log();
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

function build_obj(item, options, callback) {

	var args = [];
	var output = [];
	var source = item.source;
	var outputPath = item.output;

	// -target-cpu x86-64

	options.includes.forEach(function (inc) {
		args.push('/I');
		args.push(inc);
	});

	args.push('/c');
	args.push('-o');
	args.push(outputPath);
	args.push(source);

	cl(args, outputPath, callback);
}

function build_bin(items, options, callback) {

	var args = [];

	for (var i = 0, n = items.length; i < n; i++) {
		args.push(items[i]);
	}

	for (var i = 0, n = options.dependencies.length; i < n; i++) {
		var dependency = options.dependencies[i];
		args.push(dependency.output);
	}

	for (var i = 0, n = options.libraries.length; i < n; i++) {
		var lib = options.libraries[i];
		args.push(lib);
	}

	if (options.LD && options.debug) {
		args.push('/LDd');
	}

	if (options.LD && !options.debug) {
		args.push('/LD');
	}

	if (options.arch) {
		args.push('/arch');
		args.push(options.arch);
	}

	var output = path.join(
		model.resolve(options.outdir, options), 
		model.resolve(options.target, options) + (options.LD ? '.dll' : '.exe'));

	args.push('-o');
	args.push(output);

	cl(args, output, callback);
}

function clang_cl(items, options, callback) {
	if (options.noLink) {
		build_obj(items, options, callback);
	} else {
		build_bin(items, options, callback);
	}
}

module.exports = clang_cl;