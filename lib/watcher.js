var util = require('util');
var fs = require('fs');
var EventEmitter = require('events').EventEmitter;

function Watcher() {
	this.watcher = fs.watch('build.yml', onrebuild.bind(this));
	this.targets = [];
	this.state = 'waiting';
}

function doneBuilding() {
	switch(this.state) {
		case 'building':
			this.state = 'waiting';
			break;
		case 'rebuild':
			this.state = 'building';
			this.emit('rebuild', doneBuilding.bind(this));
			break;
		case 'build':
			this.state = 'building';
			this.emit('build', doneBuilding.bind(this));
			break;
	}
}

function onrebuild() {
	switch(this.state) {
		case 'waiting':
			this.state = 'building';
			this.emit('rebuild', doneBuilding.bind(this));
			break;
		default:
			this.state = 'rebuild';
			break;
	}
}

function onbuild() {
	switch(this.state) {
		case 'waiting':
			this.state = 'building';
			this.emit('build', doneBuilding.bind(this));
			break;
		case 'building':
			this.state = 'build';
			break;
	}
}

function watch(targets) {
	var self = this;
	this.targets.forEach(function (target) {
		target.close();
	});
	this.targets = targets;
	this.targets.forEach(function (target) {
		target.on('change', onbuild.bind(self));
	});
}

util.inherits(Watcher, EventEmitter);
Watcher.prototype.watch = watch;
module.exports = Watcher;