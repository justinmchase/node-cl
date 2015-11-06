var fs = require('fs');
var path = require('path');
var yaml = require('js-yaml');
var expect = require('chai').expect;
var targets = require('../lib/targets');

function test_target(name, expected) {
	var data = fs.readFileSync(path.join(__dirname, 'targets', `${name}.yml`), 'utf8');
	var parsed = yaml.load(data);
	var found = targets.find(parsed);

	expect(found).to.deep.equal(expected);
}

describe('targets: ', function () {

	describe('valid target files, ', function () {

		describe('with no config section', function () {

			it('should load with a single target', function () {
				test_target('single_target_no_config', [{target:'test', sources:[]}]);
			})
			it('should load multiple top level targets', function () {
				test_target('multiple_targets_no_config', [
					{target:'one'},
					{target:'two'}
				]);
			})
			it('should load a single nested target', function () {
				test_target('single_under_targets_no_config', [ {target: 'one' }]);
			})
			it('should load multiple nested targets', function () {
				test_target('multiple_under_targets_no_config', [
					{target:'one'},
					{target:'two'}
				])
			})
			it('should load an empty file', function () {
				test_target('empty', []);
			})
			it('should load a file empty targets section', function () {
				test_target('targets_only', []);
			})

		})

		describe('with a config section', function () {
			it('should load a file with only a config section', function () {
				test_target('config_only', []);
			})
			it('should load with a single top level target', function () {
				test_target('top_level_target_with_config', [{target:'one'}]);
			})
			
		})

	})

})