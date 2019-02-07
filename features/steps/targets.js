import fs from 'fs'
import path from 'path'
import yaml from 'js-yaml'
import { expect } from 'chai'
import { find } from '../../lib/target'
import { Given, Then } from 'cucumber'

const targetsDir = path.join(__dirname, '..', 'targets')

Given('the {word} target file', function (name, callback) {
  let p = path.join(targetsDir, `${name}.yml`)
  fs.readFile(p, 'utf8', (err, contents) => {
    if (err) return callback(err)
    this.targets = find(yaml.load(contents))
    callback()
  })
})

Then('it should have {word} target(s)', function (count) {
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

Then('the {word} target should be named {word}', function (index, name, callback) {
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
  callback()
})
