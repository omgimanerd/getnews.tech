/**
 * @fileoverview The class handles the parsing of the server analytics log so
 *   that the client can render that data into graphs.
 * @author alvin@omgimanerd.tech (Alvin Lin)
 */

const Promise = require('bluebird')

const fs = Promise.promisifyAll(require('fs'))
const geoip = require('geoip-native')

const ServerError = require('./ServerError')

/**
 * Milliseconds in an hour, the duration which analytics data will be cached.
 * @type {number}
 */
const CACHE_KEEP_TIME = 3600000

const cache = {}

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
      json.country = geoip.lookup(json.ip).name
      return json
    })
    cache[file] = {}
    cache[file].analytics = analytics
    cache[file].expires = currentTime + CACHE_KEEP_TIME
    return analytics
  }).catch(error => {
    throw new ServerError('AnalyticsError', error)
  })
}

module.exports = exports = { get }
