import path from 'path'
import { expect } from 'chai'
import { Builder } from '../../builder'

const examplesDir = path.join(__dirname, '..', '..', '..', 'examples')

module.exports = function () {
  this.Given(/^The (\w+) example project$/, function (name) {
    let opts = {
      rootdir: path.join(examplesDir, name),
      outdir: path.join(this.tmpdir, name)
    }
    this.builder = new Builder(opts)
    this.builder.on('error', err => console.error(err))
  })

  this.When(/^it is built$/, function (callback) {
    this.builder.on('done', code => {
      this.code = code
      callback()
    })
    this.builder.run()
  })

  this.Then(/^it should succeed$/, function () {
    expect(this.code).to.equal(0)
  })
}
