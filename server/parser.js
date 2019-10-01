/**
 * @fileoverview This file contains method for parsing comma separated
 * arguments present in queries.
 * @author alvin@omgimanerd.tech (Alvin Lin)
 */

const VALID_ARGS = [
  'n', 'page', 'i'
]

const VALID_FLAGS = [
  'reverse'
]

const VALID_COUNTRIES = [
  'ae', 'ar', 'at', 'au', 'be', 'bg', 'br', 'ca', 'ch', 'cn', 'co', 'cu', 'cz',
  'de', 'eg', 'fr', 'gb', 'gr', 'hk', 'hu', 'id', 'ie', 'il', 'in', 'it', 'jp',
  'kr', 'lt', 'lv', 'ma', 'mx', 'my', 'ng', 'nl', 'no', 'nz', 'ph', 'pl', 'pt',
  'ro', 'rs', 'ru', 'sa', 'se', 'sg', 'si', 'sk', 'th', 'tr', 'tw', 'ua', 'us',
  've', 'za'
]

const parseSubdomain = subdomains => {
  if (subdomains.length === 0) {
    return null
  }
  const country = subdomains[subdomains.length - 1]
  if (VALID_COUNTRIES.includes(country)) {
    return country
  }
  return null
}

/**
 * This method deconstructs an argument string into a JSON object containing
 * the argument data.
 * @param {string} argString The argument string to parse
 * @return {Object}
 */
const parseArgs = argString => {
  const args = new Map()
  argString.split(',').forEach((chunk, index) => {
    if (index === 0 && !chunk.includes('=')) {
      args.set('query', chunk)
      return
    }
    const parts = chunk.split('=')
    const arg = parts[0]
    if (parts.length === 1) {
      if (!VALID_FLAGS.includes(arg)) {
        args.set('error', `"${arg}" is not a valid flag`)
        return
      }
      args.set(arg, true)
    } else if (parts.length === 2) {
      const value = parts[1]
      if (!VALID_ARGS.includes(arg)) {
        args.set('error', `"${arg}" is not a valid argument`)
        return
      }
      args.set(arg, value)
    } else {
      args.set('error', `Unable to parse ${chunk}`)
    }
  })
  return args
}

module.exports = exports = {
  parseSubdomain,
  parseArgs
}
