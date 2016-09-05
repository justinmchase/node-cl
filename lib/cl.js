import path from 'path'
import { merge } from 'lodash'
import { directory } from './directory'
import { resolve } from './model'
import { spawn } from 'child_process'

// minimal installs, win10:
// - npm install --global --production windows-build-tools

function spawnCl (args, env, outDir, output, callback) {
  console.info('> cl ' + args.join(' '))
  console.info()

  directory.create(outDir, function (err) {
    if (err) return callback(new Error('Unable to create output directory: ' + outDir))
    let p = spawn('cl', args, {
      stdio: 'inherit',
      env: merge(env, process.env)
    })
    p.on('close', function (code) {
      callback(code === 0 ? null : new Error('cl exited with code ' + code), output)
    })
  })
}

function buildObj (items, options, callback) {
  let args = []
  let output = []
  let objOutDir = path.join(resolve(options.tmpdir, options))
  let skip = true

  // https://msdn.microsoft.com/en-us/library/19z1t1wy.aspx
  args.push('/c') // Compiles without linking.
  args.push('/MDd') // Compiles to create a debug multithreaded DLL, by using MSVCRTD.lib.
  args.push('/Zi') // Generates complete debugging information.
  args.push('/Fo:' + objOutDir + path.sep) // Creates an object file.

  options.includes.forEach(function (inc) {
    args.push('/I')
    args.push(inc)
  })

  items.forEach(function (item) {
    if (item.isDirty) {
      args.push(item.source)
      skip = false
    }
    output.push(path.join(objOutDir, item.objName))
  })

  if (skip) {
    callback(null, output)
  } else {
    spawnCl(args, options[process.platform], objOutDir, output, callback)
  }
}

function buildBin (items, options, callback) {
  let args = []

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

  // args.push('/Fo:' + output)

  spawnCl(args, options[process.platform], outDir, [output], callback)
}

export function cl (items, options, callback) {
  if (options.noLink) {
    buildObj(items, options, callback)
  } else {
    buildBin(items, options, callback)
  }
}
