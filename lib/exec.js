var split = require('argv-split');
var spawn = require('child_process').spawn;
var path = require('path');

function run(cmd, env, callback) {
	if (!cmd) return callback();

	var args = split(cmd);
	var c = args.shift();
	var p = spawn(path.normalize(c), args, {
		env: env,
		stdio: 'inherit'
	});
	p.on('close', function (code) {
		if (code !== 0) return callback(new Error('Command failed', code, cmd));
		callback();
	});
}

module.exports = {
	run: run
};