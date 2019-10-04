/**
 * @fileoverview This file contains method for parsing comma separated
 * arguments present in queries.
 * @author alvin@omgimanerd.tech (Alvin Lin)
 */

const errors = require('./errors')

const RecoverableError = errors.RecoverableError

const VALID_ARGS = [
  'page', 'pageSize', 'category'
]

const VALID_COUNTRIES = [
  'ae', 'ar', 'at', 'au', 'be', 'bg', 'br', 'ca', 'ch', 'cn', 'co', 'cu', 'cz',
  'de', 'eg', 'fr', 'gb', 'gr', 'hk', 'hu', 'id', 'ie', 'il', 'in', 'it', 'jp',
  'kr', 'lt', 'lv', 'ma', 'mx', 'my', 'ng', 'nl', 'no', 'nz', 'ph', 'pl', 'pt',
  'ro', 'rs', 'ru', 'sa', 'se', 'sg', 'si', 'sk', 'th', 'tr', 'tw', 'ua', 'us',
  've', 'za'
]

const VALID_CATEGORIES = [
]

/**
 * Given an array of subdomains from the express request context, this method
 * checks if there is a country specified, if it is valid, and returns the
 * country.
 * @param {Array<string>} subdomains The array of subdomains to parse
 * @return {string}
 */
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

const validateArgs = (arg, value) => {
  if (!VALID_ARGS.includes(arg)) {
    throw new RecoverableError(`"${arg}" is not a valid argument.`)
  }
}

/**
 * This method deconstructs an argument string into a JSON object containing
 * the argument data.
 * @param {string} argString The argument string to parse
 * @return {Object}
 */
const parseArgs = argString => {
  const args = {}
  argString.split(',').forEach((chunk, index) => {
    if (index === 0 && !chunk.includes('=')) {
      args.query = chunk.replace('+', ' ')
      return
    }
    const parts = chunk.split('=')
    const arg = parts[0]
    if (parts.length === 2) {
      const value = parts[1]
      validateArgs(arg, value)
      args[arg] = value
    } else {
      throw new RecoverableError(`Unable to parse ${chunk}`)
    }
  })
  return args
}

module.exports = exports = {
  VALID_COUNTRIES,
  VALID_CATEGORIES,
  parseSubdomain,
  parseArgs
}
