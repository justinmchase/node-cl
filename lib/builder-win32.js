var path = require('path');
var util = require('util');
var clang_cl = require('./clang-cl');
var llvm_lib = require('./llvm-lib');

function buildLib(target, options, callback) {

	var sources = target.sources;
	var objects = [];
	function next() {
		if (sources.length) {
			var source = sources.pop();
			var cl_opts = {
				noLink: true,
				outfile: path.join(options.tmpdir, path.basename(source, path.extname(source)) + '.obj'),
				sources: [source]
			};
			objects.push(cl_opts.outfile);
			clang_cl(cl_opts, function (err) {
				if (err) return callback(err);
				next();
			});
		} else {
			var lib_opts = {
				outfile: path.join(options.outdir, options.configuration, options.architecture, target.target + '.lib'),
				sources: objects,
			};
			// Then compile all .obj files into a .lib
			llvm_lib(lib_opts, callback);
		}
	}

	next();
}

function buildDll(target, options, callback) {
	// build all sources with clang-cl /LD into .dll
}

function buildExe(target, options, callback) {

	var cl_opts = {
		outfile: path.join(options.outdir, options.configuration, options.architecture, target.target + '.exe'),
		sources: target.sources,
		//arch: options.arch
	};

	if (target.dependencies && target.dependencies.length) {
		for (var i = 0, n = target.dependencies.length; i < n; i++) {
			var depname = target.dependencies[i];
			cl_opts.sources.push(path.join(options.outdir, options.configuration, options.architecture, depname + '.lib'));
		}
	}

	clang_cl(cl_opts, callback);
}



function build(target, options, callback) {
	switch(target.type) {
		case 'lib':
			buildLib(target, options, callback);
			break;
		case 'dll':
			buildDll(target, options, callback);
			break;
		case 'exe':
		default:
			buildExe(target, options, callback);
			break;
	}
}


module.exports = { build: build };