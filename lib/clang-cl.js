var spawn = require('child_process').spawn;
var path = require('path');
var directory = require('./directory');
var Item = require('./item');
var model = require('./model');

// minimal installs, win10:
// - Windows Software Development Kit (SDK) for Windows 10
//   https://dev.windows.com/en-us/downloads/windows-10-sdk
//
// - Windows 10 Universal C Runtime
//   https://www.microsoft.com/en-us/download/details.aspx?id=48234
// 
// - VC redist
//   https://www.microsoft.com/en-us/download/details.aspx?id=40784

function cl(args, env, outDir, output, callback) {

	//console.info('> clang-cl ' + args.join(' '));
	//console.info();
	directory.create(outDir, function (err) {
		if (err) return callback(new Error('Unable to create output directory: ' + outDir));
		var p = spawn('clang-cl', args, {
			stdio: 'inherit',
			env: model.merge(process.env, env)
		});
		p.on('close', function (code) {
			callback(code === 0 ? null : new Error('clang-cl exited with code ' + code), output);
		});
	});
}

function build_obj(items, options, callback) {

	var args = [];
	var output = [];
	var objOutDir = path.join(model.resolve(options.tmpdir, options));
	var skip = true;

	// -target-cpu x86-64

	args.push('/c');
	args.push('/MDd');

	args.push('-o');
	args.push(objOutDir + path.sep);

	options.includes.forEach(function (inc) {
		args.push('/I');
		args.push(inc);
	});

	items.forEach(function (item) {
		if (item.isDirty) {
			args.push(item.source);
			skip = false;
		}
		output.push(path.join(objOutDir, item.objName));
	});

	if (skip) {
		callback(null, output);
	} else {
		cl(args, options[process.platform], objOutDir, output, callback);
	}
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

	args.push('/MDd');

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

	var outDir = path.join(model.resolve(options.outdir, options));

	var output = path.join(
		outDir,
		model.resolve(options.target, options) + (options.LD ? '.dll' : '.exe'));

	args.push('-o');
	args.push(output);

	cl(args, options[process.platform], outDir, [output], callback);
}

function clang_cl(items, options, callback) {
	if (options.noLink) {
		build_obj(items, options, callback);
	} else {
		build_bin(items, options, callback);
	}
}

module.exports = clang_cl;