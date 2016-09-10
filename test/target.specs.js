// import fs from 'fs'
// import path from 'path'
// import yaml from 'js-yaml'
// import { expect } from 'chai'
// import { target } from '../lib/target'
require('babel-core/register')

var fs = require('fs')
var path = require('path')
var yaml = require('js-yaml')
var expect = require('chai').expect
var find = require('../lib/target').find

function testTarget (name, expected) {
  var data = fs.readFileSync(path.join(__dirname, 'targets', `${name}.yml`), 'utf8')
  var parsed = yaml.load(data)
  var found = find(parsed)

  expect(found).to.deep.equal(expected)
}

describe('targets: ', function () {
  describe('valid target files, ', function () {
    describe('with no config section', function () {
      it('should load with a single target', function () {
        testTarget('single_target_no_config', [{target: 'test', sources: []}])
      })
      it('should load multiple top level targets', function () {
        testTarget('multiple_targets_no_config', [
          {target: 'one'},
          {target: 'two'}
        ])
      })
      it('should load a single nested target', function () {
        testTarget('single_under_targets_no_config', [{ target: 'one' }])
      })
      it('should load multiple nested targets', function () {
        testTarget('multiple_under_targets_no_config', [
          {target: 'one'},
          {target: 'two'}
        ])
      })
      it('should load an empty file', function () {
        testTarget('empty', [])
      })
      it('should load a file empty targets section', function () {
        testTarget('targets_only', [])
      })
    })

    describe('with a config section', function () {
      it('should load a file with only a config section', function () {
        testTarget('config_only', [])
      })
      it('should load with a single top level target', function () {
        testTarget('top_level_target_with_config', [{target: 'one'}])
      })
    })
  })
})
