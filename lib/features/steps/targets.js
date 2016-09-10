import fs from 'fs'
import path from 'path'
import yaml from 'js-yaml'
import { expect } from 'chai'
import { find } from '../../target'

const targetsDir = path.join(__dirname, '..', 'targets')

module.exports = function () {
  this.Given(/^the (\w+) target file$/, function (name, callback) {
    let p = path.join(targetsDir, `${name}.yml`)
    fs.readFile(p, 'utf8', (err, contents) => {
      if (err) return callback(err)
      this.targets = find(yaml.load(contents))
      callback()
    })
  })

  this.Then(/^it should have (\w+) target[s]?$/, function (count) {
    switch (count.toLowerCase()) {
      case 'no':
      case 'zero':
        count = 0
        break
      case 'one':
        count = 1
        break
      case 'two':
        count = 2
        break
      case 'three':
        count = 3
        break
    }
    expect(this.targets.length).to.equal(count)
  })

  this.Then(/^the (\w+) target should be named '(\w+)'$/, function (index, name) {
    switch (index) {
      case 'first':
        index = 0
        break
      case 'second':
        index = 1
        break
      case 'third':
        index = 2
        break
    }
    expect(this.targets[index].target).to.equal(name)
  })
}
