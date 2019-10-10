/**
 * @fileoverview This file contains method for parsing comma separated
 * arguments present in queries.
 * @author alvin@omgimanerd.tech (Alvin Lin)
 */

const errors = require('./errors')

const RecoverableError = errors.RecoverableError

const VALID_COUNTRIES = [
  'ae', 'ar', 'at', 'au', 'be', 'bg', 'br', 'ca', 'ch', 'cn', 'co', 'cu', 'cz',
  'de', 'eg', 'fr', 'gb', 'gr', 'hk', 'hu', 'id', 'ie', 'il', 'in', 'it', 'jp',
  'kr', 'lt', 'lv', 'ma', 'mx', 'my', 'ng', 'nl', 'no', 'nz', 'ph', 'pl', 'pt',
  'ro', 'rs', 'ru', 'sa', 'se', 'sg', 'si', 'sk', 'th', 'tr', 'tw', 'ua', 'us',
  've', 'za'
]

const VALID_CATEGORIES = [
  'business', 'entertainment', 'general', 'health', 'science', 'sports',
  'technology'
]

const VALID_LANGUAGES = [
]

const VALID_ARGS = {
  'n': {
    description: 'number of results per page',
    parser: (arg, value) => {
      if (isNaN(value) || value === '') {
        throw new RecoverableError(
          `${value} is not a valid value for arg ${arg}.`)
      }
      const numeric = parseInt(value, 10)
      if (numeric <= 0 || numeric >= 100) {
        throw new RecoverableError(
          `Value for arg ${arg} must be in range (0, 100).`)
      }
      return numeric
    }
  },
  'p': {
    description: 'page number to fetch',
    parser: (arg, value) => {
      if (isNaN(value) || value === '') {
        throw new RecoverableError(
          `"${value}" is not a valid value for arg ${arg}.`)
      }
      const numeric = parseInt(value, 10)
      if (numeric <= 0) {
        throw new RecoverableError(`Value for arg ${arg} must be > 0.`)
      }
      return numeric
    }
  },
  'category': {
    description: 'news category to fetch',
    parser: (arg, value) => {
      if (VALID_CATEGORIES.includes(value)) {
        return value
      }
      throw new RecoverableError(`"${value}" is not a valid ${arg}.`)
    }
  },
  'language': {
    description: 'language to limit results to',
    parser: (arg, value) => {
      if (VALID_LANGUAGES.includes(value)) {
        return value
      }
      throw new RecoverableError(`"${value}" is not a valid ${arg}.`)
    }
  },
  'reverse': {
    description: 'display results in reverse chronological order',
    parser: (arg, value) => value !== 'false'
  },
  'nocolor': {
    description: 'display without color formatting',
    parser: (arg, value) => value !== 'false'
  }
}

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
  if (country === 'dev') {
    return null
  } else if (!VALID_COUNTRIES.includes(country)) {
    throw new RecoverableError(`${country} is not a valid country to query.`)
  }
  return country
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
      args.query = chunk.replace(/\+/g, ' ')
      return
    }
    const parts = chunk.split('=')
    const arg = parts[0]
    const argValid = VALID_ARGS[arg]
    if (argValid) {
      if (parts.length === 1) {
        args[arg] = argValid.parser(arg)
        return
      } else if (parts.length === 2) {
        args[arg] = argValid.parser(arg, parts[1])
        return
      }
    }
    if (arg !== '') {
      throw new RecoverableError(`Invalid arguments "${chunk}".`)
    }
    throw new RecoverableError(`Unable to parse "${chunk}".`)
  })
  return args
}

module.exports = exports = {
  VALID_COUNTRIES,
  VALID_CATEGORIES,
  VALID_LANGUAGES,
  VALID_ARGS,
  parseSubdomain,
  parseArgs
}
