/**
 * @fileoverview The class handles the parsing of the server analytics log so
 *   that the client can render that data into graphs.
 * @author alvin@omgimanerd.tech (Alvin Lin)
 */

const Promise = require('bluebird')

const fs = Promise.promisifyAll(require('fs'))
const maxmind = require('maxmind')

const ServerError = require('./ServerError')

/**
 * Milliseconds in an hour, the duration which analytics data will be cached.
 * @type {number}
 */
const CACHE_KEEP_TIME = 3600000

/**
 * Name of the MMDB file, which is assumed to be in the server directory.
 * @type {string}
 */
const MMDB_FILE = 'server/GeoLite2-City.mmdb'

const cache = {}

// eslint-disable-next-line no-sync
const maxmindDb = maxmind.openSync(MMDB_FILE)

/**
 * Looks up an IP address in the maxmind database.
 * @param {string} ip The IP address to look up.
 * @return {Object}
 */
const lookupIp = ip => {
  return maxmindDb.get(ip)
}

/**
 * Fetches analytics on recent site traffic and returns a Promise
 * @param {string} file file to fetch analytics data from.
 * @return {Promise}
 */
const get = file => {
  /**
   * First check if we have analytics cached. If not, then we should fetch it
   * again.
   */
  const currentTime = Date.now()
  const cacheEntry = cache[file]
  if (cacheEntry && currentTime < cacheEntry.expires) {
    return Promise.resolve(cacheEntry.analytics)
  }
  return fs.readFileAsync(file, 'utf8').then(data => {
    const analytics = data.trim().split('\n').map(entry => {
      const json = JSON.parse(entry)
      /*
       * Iterate through the entries and get a country name for each
       * IP address.
       */
      const locationData = lookupIp(json.ip)
      json.country = 'unknown'
      if (locationData) {
        json.country = locationData.country.names.en
      }
      return json
    })
    cache[file] = {
      analytics: analytics,
      expires: currentTime + CACHE_KEEP_TIME
    }
    return analytics
  }).catch(error => {
    throw new ServerError('AnalyticsError', error)
  })
}

module.exports = exports = { lookupIp, get }
