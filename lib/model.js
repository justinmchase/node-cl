
function merge() {
	var result = {};
	for (var i = 0, n = arguments.length; i < n; i++) {
		var obj = arguments[i];
		Object.getOwnPropertyNames(obj).forEach(function (name) {
			result[name] = obj[name];
		});
	}
	return result;
}

var expansionRegex = /\${(\w+)}/

function resolve(input, options) {
	var processed = [];
	var output = input;
	while(true) {
		var m = output.match(expansionRegex);
		if (!m) break;

		var full = m[0];
		var name = m[1];
		if (!options[name]) throw new Error('Unknown variable referenced: ' + name);
		output = output.replace(full, options[name]);
	}
	return output;
}

module.exports = {
	merge: merge,
	resolve: resolve
}