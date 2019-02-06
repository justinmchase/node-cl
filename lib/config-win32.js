import path from 'path'
import WinReg from 'winreg'
import { parallel } from 'async'
import { exec } from 'child_process'

var win32
const visualStudioVersion = '15.0' // todo: Support multiple versions eventually.
const wowNode = process.arch === 'x64'
  ? 'Wow6432Node'
  : ''

const VS = new WinReg({
  hive: WinReg.HKLM,
  key: '\\' + path.join('SOFTWARE', wowNode, 'Microsoft', 'VisualStudio', 'SxS', 'VS7')
})
const SDK = new WinReg({
  hive: WinReg.HKLM,
  key: '\\' + path.join('SOFTWARE', wowNode, 'Microsoft', 'Windows Kits', 'Installed Roots')
})

function getSdk10Dir (callback) {
  SDK.get('KitsRoot10', function (err, result) {
    if (err) console.log(key)
    callback(err, result && result.value)
  })
}

function getVSInstallDir (callback) {
  VS.get(visualStudioVersion, function (err, result) {
    if (err) console.log(key)
    callback(err, result && path.resolve(result.value, '..'))
  })
}

class Win32ConfigError extends Error {
  constructor(err) {
    super(`Unable to read required registry keys, please ensure windows build tools are installed globally. (e.g. npm install --global --production windows-build-tools)`)
    this.innerError = err
  }
}

export function win32Config (callback) {
  if (win32) return callback(null, win32)

  const keys = [
    getVSInstallDir
  ]

  parallel(keys, function (err, results) {
    if (err) return callback(new Win32ConfigError(err))
    const vsInstallDir = results[0]
    const vsDevCmd = path.join(vsInstallDir, "BuildTools", "Common7", "Tools", "VsDevCmd.bat")
    const cmd = `"${vsDevCmd}" && set`
    exec(cmd, (err, stdout) => {
      if (err) return callback(err)
      const env = stdout
        .split(/\r?\n/g)
        .filter(line => line)
        .map(line => line.match(/([^=]+)=(.*)/))
        .filter(line => line)
        .reduce((obj, [, k, v]) => Object.assign(obj, { [k]: v }), {})

      // Current environment plus the VS cmd tools environment
      win32 = Object.assign({}, process.env, env)
      callback(null, win32)
    })
  })
}
