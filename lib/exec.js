var spawn = require('child_process').spawn;

function run(cmd, env, callback) {
	if (!cmd) return callback();
	var p = spawn('sh', ['-c', cmd], {
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