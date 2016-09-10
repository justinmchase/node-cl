import path from 'path'
import debug from 'debug'
import sha1 from 'sha1'
import { assign } from 'lodash'
import { create } from './directory'
import { resolve } from './model'
import { spawn } from 'child_process'

let log = debug('node-cl')

// minimal installs, win10:
// - npm install --global --production windows-build-tools

function spawnCl (args, env, outDir, output, callback) {
  console.info('> cl ' + args.join(' '))
  console.info()
  create(outDir, function (err) {
    if (err) return callback(new Error('Unable to create output directory: ' + outDir))
    let p = spawn('cl', args, {
      stdio: 'inherit',
      env: assign({}, process.env, env)
    })
    p.on('close', function (code) {
      callback(code === 0 ? null : new Error('cl exited with code ' + code), output)
    })
  })
}

function buildObj (items, options, callback) {
  let args = []
  let output = []
  let objOutDir = path.resolve(resolve(options.tmpdir, options))
  let skip = true

  // https://msdn.microsoft.com/en-us/library/19z1t1wy.aspx
  args.push('/nologo')
  args.push('/c') // Compiles without linking.

  options.includes.forEach(function (inc) {
    args.push('/I')
    args.push(inc)
  })

  items.forEach(function (item) {
    let src = path.resolve(resolve(options.rootdir, options), item.source)
    let tmp = sha1(src) + '.obj'
    let out = path.resolve(resolve(options.tmpdir, options), tmp)
    if (item.isDirty) {
      args.push('/Fo:' + out)
      args.push(src)
      skip = false
    }
    output.push(out)
  })

  if (skip) {
    callback(null, output)
  } else {
    spawnCl(args, options[process.platform], objOutDir, output, callback)
  }
}

function buildBin (items, options, callback) {
  let args = []

  args.push('/nologo')

  for (let i = 0, n = items.length; i < n; i++) {
    args.push(items[i])
  }

  for (let i = 0, n = options.dependencies.length; i < n; i++) {
    let dependency = options.dependencies[i]
    args.push(dependency.output)
  }

  for (let i = 0, n = options.libraries.length; i < n; i++) {
    let lib = options.libraries[i]
    args.push(lib)
  }

  if (options.LD && options.debug) {
    args.push('/LDd')
  }

  if (options.LD && !options.debug) {
    args.push('/LD')
  }

  args.push('/MDd')
  args.push('/Zi')

  if (options.arch) {
    args.push('/arch')
    args.push(options.arch)
  }

  let outDir = path.join(resolve(options.outdir, options))

  let output = path.join(
    outDir,
    resolve(options.target, options) + (options.LD ? '.dll' : '.exe'))

  args.push('/Fe:' + output)

  let env = options[process.platform]
  spawnCl(args, env, outDir, [output], callback)
}

export function cl (items, options, callback) {
  if (options.noLink) {
    buildObj(items, options, callback)
  } else {
    buildBin(items, options, callback)
  }
}
