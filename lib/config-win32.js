var path = require('path');
var util = require('util');
var async = require('async');
var WinReg = require('winreg');

var win32;
var visualStudioVersion = '12.0'; // todo: Support multiple versions eventually.
var windowsSdkVersion = 'v8.1';
var wowNode = process.arch === 'x64'
	? 'Wow6432Node'
	: '';

var VC7 = new WinReg({
	hive: WinReg.HKLM,
	key: '\\' + path.join('SOFTWARE', wowNode, 'Microsoft', 'VisualStudio', 'SxS', 'VC7')
});
var VS7 = new WinReg({
	hive: WinReg.HKLM,
	key: '\\' + path.join('SOFTWARE', wowNode, 'Microsoft', 'VisualStudio', 'SxS', 'VS7')
});
var SDK81 = new WinReg({
	hive: WinReg.HKLM,
	key: '\\' + path.join('SOFTWARE', wowNode, 'Microsoft', 'Microsoft SDKs', 'Windows', windowsSdkVersion)
});

function getSdkDir(callback) {
	SDK81.get('InstallationFolder', function (err, result) {
		callback(err, result.value);
	});
}

function getVSInstallDir(callback) {
	VS7.get(visualStudioVersion, function (err, result) {
		callback(err, result.value);
	});
}

function getVCInstallDir(callback) {
	VC7.get(visualStudioVersion, function (err, result) {
		callback(err, result && result.value);
	});
}

function getFrameworkDir(callback) {
	var key = process.arch === 'x64'
		? 'FrameworkDir64'
		: 'FrameworkDir32';
	VC7.get(key, function (err, result) {
		callback(err, result.value)
	});
}

function getFrameworkVersion(callback) {
	var key = process.arch === 'x64'
		? 'FrameworkVer64'
		: 'FrameworkVer32';
	VC7.get(key, function (err, result) {
		callback(err, result.value);
	});
}


function config(callback) {

	if (win32) return callback(null, win32);

	var framework40Version = 'v4.0';
	var extensionSdkDir = path.join(process.env['ProgramFiles(x86)'], 'Microsoft SDKs', 'Windows', windowsSdkVersion, 'ExtensionSDKs');
	var keys = [
		getSdkDir,
		getVSInstallDir,
		getVCInstallDir,
		getFrameworkDir,
		getFrameworkVersion
	];

	async.parallel(keys, function (err, results)  {
		if (err) return callback(err);
		var sdkDir = results[0];
		var vsInstallDir = results[1];
		var vcInstallDir = results[2];
		var frameworkDir = results[3];
		var frameworkVersion = results[4];
		var vcArchDir = process.arch === 'x64' ? 'amd64' : '';

		var PATH = process.env.PATH.split(path.delimiter);
		var INCLUDE = (process.env.INCLUDE || '').split(path.delimiter);
		var LIB = (process.env.LIB || '').split(path.delimiter);
		var LIBPATH = (process.env.LIBPATH || '').split(path.delimiter);

		PATH.unshift(path.join(sdkDir, 'bin', process.arch));
		PATH.unshift(path.join(vcInstallDir, 'VCPackages'));
		PATH.unshift(path.join(frameworkDir, framework40Version));
		PATH.unshift(path.join(frameworkDir, frameworkVersion));
		PATH.unshift(path.join(vsInstallDir, 'Common7', 'Tools'));
		PATH.unshift(path.join(vcInstallDir, 'BIN'));

		INCLUDE.unshift(path.join(sdkDir, 'include', 'shared'));
		INCLUDE.unshift(path.join(sdkDir, 'include', 'um'));
		INCLUDE.unshift(path.join(sdkDir, 'include', 'winrt'));
		INCLUDE.unshift(path.join(vcInstallDir, 'ATLMFC', 'INCLUDE'));
		INCLUDE.unshift(path.join(vcInstallDir, 'INCLUDE'));

		LIB.unshift(path.join(sdkDir, 'lib', 'winv6.3', 'um', process.arch));
		LIB.unshift(path.join(vcInstallDir, 'ATLMFC', 'LIB', vcArchDir));
		LIB.unshift(path.join(vcInstallDir, 'LIB', vcArchDir));

		LIBPATH.unshift(path.join(sdkDir, 'References', 'CommonConfiguration', 'Neutral'));
		LIBPATH.unshift(path.join(extensionSdkDir, 'Microsoft.VCLibs', '12.0', 'References', 'CommonConfiguration', 'neutral'));
		LIBPATH.unshift(path.join(vcInstallDir, 'ATLMFC', 'LIB', vcArchDir));
		LIBPATH.unshift(path.join(vcInstallDir, 'LIB', vcArchDir));

		win32 = {
			sdkDir: sdkDir,
			vsInstallDir: vsInstallDir,
			vcInstallDir: vcInstallDir,
			frameworkDir: frameworkDir,
			frameworkVersion: frameworkVersion,
			visualStudioVersion: visualStudioVersion,
			VS120COMNTOOLS: path.join(vsInstallDir, 'Common7', 'Tools'),
			PATH: PATH.join(path.delimiter),
			INCLUDE: INCLUDE.join(path.delimiter),
			LIB: LIB.join(path.delimiter),
			LIBPATH: LIBPATH.join(path.delimiter),
		};

		callback(null, win32);
	});
}

module.exports = { 
	config: config
};
