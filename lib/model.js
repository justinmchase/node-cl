let expansionRegex = /\$?{(\w+)}/

export function resolve (input, options) {
  if (input == null) {
    return input
  } else if (Array.isArray(input)) {
    return input.map(i => resolve(i, options))
  } else if(typeof input === 'object') {
    return Object.entries(input).reduce((obj, [k,v]) => Object.assign(obj, { [k]: resolve(v, options) }), {})
  } else if (typeof input === 'string') {
    let output = input || ''
    while (output) {
      const m = output.match(expansionRegex)
      if (!m) break
      const full = m[0]
      const name = m[1]
      if (!options[name]) throw new Error('Unknown variable referenced: ' + name)
      output = output.replace(full, options[name])
    }
    return output
  } else {
    return input
  }
}
