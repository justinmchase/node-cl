require('babel-core/register')

var fs = require('fs')
var path = require('path')
var expect = require('chai').expect
var Builder = require('../lib/builder').Builder

var integrationdir = path.join(__dirname, '..', 'examples')
var outdir = path.join(__dirname, 'build', 'examples')
var specDirs = fs.readdirSync(integrationdir)

describe('integration:', () => {
  specDirs.forEach(spec => {
    it(spec, done => {
      var opts = {
        rootdir: path.join(integrationdir, spec),
        outdir: path.join(outdir, spec)
      }
      var builder = new Builder(opts)
      builder.on('error', err => console.error(err))
      builder.on('done', code => {
        expect(code).to.equal(0)
        done()
      })
      builder.run()
    })
  })
})
