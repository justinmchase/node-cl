import path from 'path'
import fs from 'fs'

function create (directory, callback) {
  var parent = path.dirname(directory)
  if (!parent || parent === directory) return callback() // root, skip
  create(parent, function (error) { // create parent dir
    if (error && error.code !== 'EEXIST') return callback(error) // failed unexpectedly, exit
    fs.mkdir(directory, function (error) { // create the directory
      if (error && error.code !== 'EEXIST') return callback(error)
      callback()
    })
  })
}

module.exports = {
  create: create
}
