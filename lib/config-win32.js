import path from 'path'
import WinReg from 'winreg'
import { parallel } from 'async'

var win32
var visualStudioVersion = '14.0' // todo: Support multiple versions eventually.
var wowNode = process.arch === 'x64'
  ? 'Wow6432Node'
  : ''

var VC = new WinReg({
  hive: WinReg.HKLM,
  key: '\\' + path.join('SOFTWARE', wowNode, 'Microsoft', 'VisualStudio', 'SxS', 'VC7')
})
var VS = new WinReg({
  hive: WinReg.HKLM,
  key: '\\' + path.join('SOFTWARE', wowNode, 'Microsoft', 'VisualStudio', 'SxS', 'VS7')
})
var SDK = new WinReg({
  hive: WinReg.HKLM,
  key: '\\' + path.join('SOFTWARE', wowNode, 'Microsoft', 'Windows Kits', 'Installed Roots')
})

function getSdk81Dir (callback) {
  SDK.get('KitsRoot81', function (err, result) {
    callback(err, result.value)
  })
}

function getSdk10Dir (callback) {
  SDK.get('KitsRoot10', function (err, result) {
    callback(err, result.value)
  })
}

function getVSInstallDir (callback) {
  VS.get(visualStudioVersion, function (err, result) {
    callback(err, result.value)
  })
}

function getVCInstallDir (callback) {
  VC.get(visualStudioVersion, function (err, result) {
    callback(err, result && result.value)
  })
}

function getFrameworkDir (callback) {
  var key = process.arch === 'x64'
    ? 'FrameworkDir64'
    : 'FrameworkDir32'
  VC.get(key, function (err, result) {
    callback(err, result.value)
  })
}

function getFrameworkVersion (callback) {
  var key = process.arch === 'x64'
    ? 'FrameworkVer64'
    : 'FrameworkVer32'
  VC.get(key, function (err, result) {
    callback(err, result.value)
  })
}

export function win32Config (callback) {
  if (win32) return callback(null, win32)

  var keys = [
    getSdk81Dir,
    getSdk10Dir,
    getVSInstallDir,
    getVCInstallDir,
    getFrameworkDir,
    getFrameworkVersion
  ]

  parallel(keys, function (err, results) {
    if (err) return callback(err)
    var sdk81Dir = results[0]
    var sdk10Dir = results[1]
    var vsInstallDir = results[2]
    var vcInstallDir = results[3]
    var frameworkDir = results[4]
    var frameworkVersion = results[5]
    var vcArchDir = process.arch === 'x64' ? 'amd64' : ''

    var PATH = process.env.PATH.split(path.delimiter)
    var INCLUDE = (process.env.INCLUDE || '').split(path.delimiter)
    var LIB = (process.env.LIB || '').split(path.delimiter)
    var LIBPATH = (process.env.LIBPATH || '').split(path.delimiter)

    PATH.unshift(path.join(sdk10Dir, 'bin', process.arch))
    PATH.unshift(path.join(sdk81Dir, 'bin', process.arch))
    PATH.unshift(path.join(frameworkDir, frameworkVersion))
    PATH.unshift(path.join(vsInstallDir, 'Common7', 'Tools'))
    PATH.unshift(path.join(vcInstallDir, 'BIN'))

    INCLUDE.unshift(path.join(sdk10Dir, 'Include', '10.0.10240.0', 'ucrt'))
    INCLUDE.unshift(path.join(sdk81Dir, 'Include', 'shared'))
    INCLUDE.unshift(path.join(sdk81Dir, 'Include', 'um'))
    INCLUDE.unshift(path.join(sdk81Dir, 'Include', 'wintrt'))
    INCLUDE.unshift(path.join(vcInstallDir, 'include'))

    LIB.unshift(path.join(sdk10Dir, 'Lib', '10.0.10240.0', 'ucrt', process.arch))
    LIB.unshift(path.join(sdk81Dir, 'Lib', 'winv6.3', 'um', process.arch))
    LIB.unshift(path.join(vcInstallDir, 'lib', vcArchDir))

    LIBPATH.unshift(path.join(vcInstallDir, 'lib', vcArchDir))

    win32 = {
      sdk81Dir: sdk81Dir,
      sdk10Dir: sdk10Dir,
      vsInstallDir: vsInstallDir,
      vcInstallDir: vcInstallDir,
      frameworkDir: frameworkDir,
      frameworkVersion: frameworkVersion,
      visualStudioVersion: visualStudioVersion,
      VS120COMNTOOLS: path.join(vsInstallDir, 'Common7', 'Tools'),
      PATH: PATH.join(path.delimiter),
      INCLUDE: INCLUDE.join(path.delimiter),
      LIB: LIB.join(path.delimiter),
      LIBPATH: LIBPATH.join(path.delimiter)
    }

    callback(null, win32)
  })
}
