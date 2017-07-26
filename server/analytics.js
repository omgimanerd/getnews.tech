/**
 * @fileoverview The class handles the parsing of the server analytics log so
 *   that the client can render that data into graphs.
 * @author alvin@omgimanerd.tech (Alvin Lin)
 */

const fs = require('fs-extra');
const geoip = require('geoip-native');

/**
 * Milliseconds in an hour, the duration which analytics data will be cached.
 * @type {number}
 */
const CACHE_KEEP_TIME = 3600000;

const cache = {};

/**
 * Fetches analytics on recent site traffic and returns a Promise
 * @return {Promise}
 */
const get = file => {
  /**
   * First check if we have analytics cached. If not, then we should fetch it
   * again.
   */
  const currentTime = Date.now();
  const entry = cache[file];
  if (entry && currentTime < entry.expires) {
    return Promise.resolve(entry.analytics);
  }
  return fs.readFile(file, 'utf8').then(data => {
    data = data.trim().split('\n').map(function(entry) {
      entry = JSON.parse(entry);
      entry.country = geoip.lookup(entry.ip).name;
      return entry;
    });
    cache[file] = {};
    cache[file].analytics = data;
    cache[file].expires = currentTime + CACHE_KEEP_TIME;
    return Promise.resolve(data);
  }).catch(error => {
    return Promise.reject({
      message: 'Analytics fetching failure',
      error: error
    });
  });
};

module.exports = exports = {
  get: get
};
