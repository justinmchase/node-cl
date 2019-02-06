require('@babel/register')({
  presets: [ '@babel/env' ]
})
require('@babel/polyfill')
require('require-dir')('./tasks')
