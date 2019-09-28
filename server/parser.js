/**
 * @fileoverview This file contains method for parsing comma separated
 * arguments present in queries.
 * @author alvin@omgimanerd.tech (Alvin Lin)
 */

const VALID_ARGS = [
  'n', 'w', 'i'
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
  if (subdomains.length == 0) {
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
  // const args = new Map()
  // argString.split(',').forEach((chunk, index) => {
  //   chunk = chunk.trim()
  //   if (index == 0) {
  //     args.set('query', chunk)
  //     return
  //   }
  //   const parts = chunk.split('=')
  //   let arg = parts[0]
  //   let value = null
  //   if (parts.length == 1) {
  //   } else if (parts.length == 2) {
  //   } else {
  //
  //   }
  //
  //
  //   if (parts.length != 2) {
  //       args.set('error', `Unable to parse ${chunk}`)
  //       return
  //     }
  //     const arg = parts[0]
  //     if (!VALID_ARGS.includes(arg)) {
  //       args.set('error', `${arg} is not a valid argument`)
  //     }
  //     const value = parts[1]
  //     const attemptParseValue = parseInt(value, 10)
  //     if (attemptParseValue == NaN) {
  //       args.set(arg, value)
  //     } else {
  //       args.set(arg, attemptParseValue)
  //     }
  //   } else {
  //     args.set(chunk, true)
  //   }
  // })
  // return args
}

module.exports = exports = {
  parseSubdomain,
  parseArgs
}
