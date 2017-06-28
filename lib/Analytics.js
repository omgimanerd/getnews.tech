/**
 * @fileoverview The class handles the parsing of the server analytics log so
 *   that the client can render that data into graphs.
 * @author alvin@omgimanerd.tech (Alvin Lin)
 */

const fs = require('fs');

/**
 * Constructor for an Analytics object.
 * @constructor
 * @param {string} analyticsFile The path to the server analytics log
 */
function Analytics(analyticsFile) {
  this.analyticsFile = analyticsFile;
  this.cache = {};
}

/**
 * Milliseconds in a day
 * @const
 * @type {number}
 */
Analytics.CACHE_KEEP_TIME = 86400000;

/**
 * Factory method for an Analytics object.
 * @param {string} analyticsFile The path to the server analytics log
 * @return {Analytics}
 */
Analytics.create = function(analyticsFile) {
  return new Analytics(analyticsFile);
};

/**
 * Fetches analytics on recent site traffic and passes it to a callback.
 * Caches the results for a day.
 * @param {function()} callback The callback function to which the analytics
 *   are passed.
 * @return {?}
 */
Analytics.prototype.getAnalytics = function(callback) {
  /**
   * First check if we have analytics cached. If not, then we should fetch it
   * again.
   */
  var currentTime = (new Date()).getTime();
  if (this.cache.analytics && currentTime < this.cache.expires) {
    return callback(null, this.cache.analytics);
  }
  fs.readFile(this.analyticsFile, 'utf-8', function(error, data) {
    if (error) {
      return callback(error);
    }
    try {
      data = data.trim().split('\n').map(JSON.parse).map(function(entry) {
        entry.date = new Date(entry.date);
        return entry;
      });
    } catch (error) {
      return callback(error);
    }
    return callback(error, data);
  });
};

/**
 * This line is needed on the server side since this is loaded as a module
 * into the node server.
 */
module.exports = Analytics;
