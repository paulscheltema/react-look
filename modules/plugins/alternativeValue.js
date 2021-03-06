import camelToDashCase from '../utils/camelToDashCase'

/**
 * Resolves alternative values provided as an Array
 */
export default function alternativeValue(styles, scopeArgs, config) {
  Object.keys(styles).forEach(property => {
    const value = styles[property]
    if (value instanceof Array) {
      styles[property] = value.join(`;${camelToDashCase(property)}:`)
    } else if (value instanceof Object) {
      styles[property] = alternativeValue(value, scopeArgs, config)
    }
  })

  return styles
}
