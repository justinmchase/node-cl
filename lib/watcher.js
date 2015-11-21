var util = require('util');
var fs = require('fs');
var Item = require('./item');
var EventEmitter = require('events').EventEmitter;

function Watcher() {
	this.watcher = new Item('build.yml');
	this.watcher.on('change', onrebuild.bind(this));
	this.targets = [];
	this.state = 'waiting';
	this.token = null;
}

function delayTransition() {
	var self = this;
	if (this.token) {
		clearTimeout(this.token);
		this.token = null;
	}

	this.token = setTimeout(function () {
		switch(self.state) {
			case 'rebuild':
				self.emit('rebuild', doneBuilding.bind(self));
				self.state = 'building';
				break;
			case 'build':
				self.emit('build', doneBuilding.bind(self));
				self.state = 'building';
				break;
			case 'building':
			default:
				break;
		}
	}, 500);
}

function doneBuilding() {
	switch(this.state) {
		case 'building':
			this.state = 'waiting';
			break;
		case 'rebuild':
			this.state = 'building';
			this.delayTransition();
			break;
		case 'build':
			this.state = 'building';
			this.delayTransition();
			break;
	}
}

function onrebuild() {
	switch(this.state) {
		case 'waiting':
			this.delayTransition();
			break;
	}

	this.state = 'rebuild';
}

function onbuild() {
	switch(this.state) {
		case 'waiting':
			this.state = 'build';
			this.delayTransition();
			break;
		case 'building':
			this.state = 'build';
			break;
		case 'rebuild':
			// cannot transition from rebuild to build
			break;
	}
}

function close() {
	if (this.watcher) {
		this.watcher.close();
		this.watcher = null;
	}
	this.targets.forEach(function (target) {
		target.close();
	});
	this.targets = [];
}

function watch(targets) {
	var self = this;
	this.targets.forEach(function (target) {
		target.close();
	});
	this.targets = targets || [];
	this.targets.forEach(function (target) {
		target.on('change', onbuild.bind(self));
	});
}

util.inherits(Watcher, EventEmitter);
Watcher.prototype.delayTransition = delayTransition;
Watcher.prototype.close = close;
Watcher.prototype.watch = watch;
module.exports = Watcher;