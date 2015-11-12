function item_obj(items, options, callback) {
	var output = [];
	function next(i) {
		if (items.length > i) {
			var item = items[i];
			item.build(function (err, itemOutput) {
				if (err) return callback(err);
				output.push(itemOutput);
				next(i + 1);
			})
		} else {
			callback(null, output);
		}
	}
	next(0);
}

module.exports = item_obj;