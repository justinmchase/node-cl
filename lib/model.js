let expansionRegex = /{(\w+)}/

export function resolve (input, options) {
  if (input instanceof Array) {
    return input.map(i => resolve(i, options))
  } else {
    let output = input || ''
    while (true) {
      let m = output.match(expansionRegex)
      if (!m) break

      let full = m[0]
      let name = m[1]
      if (!options[name]) throw new Error('Unknown variable referenced: ' + name)
      output = output.replace(full, options[name])
    }
    return output
  }
}
