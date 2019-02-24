import path from 'path'
import { expect } from 'chai'
import { Builder } from '../../lib/builder'
import { Given, When, Then } from 'cucumber'

const examplesDir = path.resolve(__dirname, '..', '..', 'examples')

Given('The {word} example project', function (name) {
  let opts = {
    rootdir: path.join(examplesDir, name),
    outdir: path.join(this.tmpdir, name)
  }
  console.log('building:', opts)
  this.builder = new Builder(opts)
  this.builder.on('error', err => console.error(err))
})

When('it is built', function (callback) { 
  this.builder.on('done', code => {
    this.code = code
    callback()
  })
  this.builder.run()
})

Then('it should succeed', function () {
  expect(this.code).to.equal(0)
})
