require('babel-core/register')

var fs = require('fs')
var path = require('path')

var integrationDir = path.join(__dirname, '..', 'examples')
var specDirs = fs.readdirSync(integrationDir)

describe('integration:', () => {
  specDirs.forEach(spec => {
    it(spec, done => {
      // var argv = minimist(['-d', path.join(integrationDir, spec)])
      // var builder = new Builder(argv)
      // builder.on('done', code => {
      //   if (code !== 0) return done(`Build failed with code ${code}`)
      //   done()
      // })
      // builder.run()
      done()
    })
  })
})
