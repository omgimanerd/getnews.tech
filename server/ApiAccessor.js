/**
 * @fileoverview This class handles the fetching and formatting of data from
 *   the News API.
 * @author alvin.lin.dev@gmail.com (Alvin Lin)
 */

const async = require('async');
const request = require('request');

/**
 * Constructor for an ApiAccessor.
 * @constructor
 * @param {string} news_api_key The API key for the News API.
 * @param {string} url_shortener_api_key The API key for Google's URL
 *   Shortener API.
 */
function ApiAccessor(news_api_key, url_shortener_api_key) {
  this.news_api_key = news_api_key;
  this.url_shortener_api_key = url_shortener_api_key;
  this.cache = {};
}

/**
 * @const
 * @type {string}
 */
ApiAccessor.ARTICLES_BASE_URL = 'https://newsapi.org/v1/articles';

/**
 * @const
 * @type {string}
 */
ApiAccessor.SOURCES_BASE_URL = 'https://newsapi.org/v1/sources';

/**
 * @const
 * @type {type}
 */
ApiAccessor.URL_SHORTENER_BASE_URL =
  'https://www.googleapis.com/urlshortener/v1/url';

/**
 * Milliseconds in 10 minutes
 * @const
 * @type {number}
 */
ApiAccessor.CACHE_KEEP_TIME = 600000;

/**
 * Factory method for an ApiAccessor.
 * @param {Object} options A JSON object containing the news API key and the
 *   the URL shortener API key.
 * @return {ApiAccessor}
 */
ApiAccessor.create = function(options) {
  if (!options.news_api_key) {
    throw new Error('No News API key specified.');
  } else if (!options.url_shortener_api_key) {
    throw new Error('No URL shortener API key specified.');
  }
  return new ApiAccessor(
      options.news_api_key,
      options.url_shortener_api_key
  );
};

/**
 * This method sends a request to Google's URL Shortener API to get
 * a shortened URL. Any errors will also propagate through the callback.
 * @param {string} url The URL to shorten.
 * @param {function()} callback The callback function to which the shortened
 *   URL is passed along with any errors.
 */
ApiAccessor.prototype.shortenUrl = function(url, callback) {
  request({
    url: ApiAccessor.URL_SHORTENER_BASE_URL,
    method: 'POST',
    headers: {
      // The Referer field is necessary because of the referrer limitation set
      // on the production API key.
      'Referer': 'getnews.tech',
      'Content-Type': 'application/json'
    },
    body: { longUrl: url },
    qs: { key: this.url_shortener_api_key },
    json: true
  }, function(error, response, body) {
    if (error) {
      return callback(error);
    } else if (body && body.id) {
      return callback(error, body.id);
    } else {
      return callback('An error occurred! Please try again later.');
    }
  });
};

/**
 * This method fetches article data from the News API and passes it into
 * a callback. It operates under the assumption that the section being passed
 * to it is a valid section to query and that the isValidSection() check has
 * passed. Any errors will be passed to the callback.
 * @param {string} source The News API source to query.
 * @param {function()} callback The callback function to which the articles
 *   are passed, along with any errors.
 */
ApiAccessor.prototype.fetchArticles = function(source, callback) {
  var context = this;
  request({
    url: ApiAccessor.ARTICLES_BASE_URL,
    qs: {
      'source': source,
      'apiKey': context.news_api_key
    },
    json: true
  }, function(error, response, body) {
    if (error) {
      return callback(error);
    } else if (response.statusCode === 401) {
      return callback('News API key error. Authorization failed.');
    } else if (!body || !body.articles) {
      return callback('No results were returned from the News API!');
    } else {
      return callback(null, body.articles);
    }
  });
};

/**
 * This method fetches article sources from the News API and passes it to
 * a callback. Any errors will be passed to the callback as well.
 * @param {Object} options Options for customizing the request
 * @param {function()} callback The callback function to which the sources
 *   are passed, along with any errors.
 * @return {function()}
 */
ApiAccessor.prototype.fetchSources = function(options, callback) {
  var context = this;
  request({
    url: ApiAccessor.SOURCES_BASE_URL,
    qs: {},
    json: true
  }, function(error, response, body) {
    if (error) {
      return callback(error);
    } else if (!body || !body.sources) {
      return callback('No sources were returned from the News API!');
    } else {
      return callback(null, body.sources);
    }
  })
};

/**
 * This method fetches article data from the News API and and passes it into a
 * callback. Any errors will be passed to the callback as well.
 * @param {string} source The News API source to query.
 * @param {function()} callback The callback function to which the articles are
 *   passed, along with any errors.
 * @return {function()}
 */
ApiAccessor.prototype.fetch = function(source, callback) {
  /**
   * We first check if the query has been cached within the last 10
   * minutes. If it has, then we return the cached data. If not, we then
   * fetch new data from the News API.
   */
  var currentTime = (new Date()).getTime();
  if (this.cache[source] && currentTime < this.cache[source].expires) {
    return callback(null, this.cache[source].results);
  }
  /**
   * If the section being requested was not cached, then we need to fetch the
   * data from the News API.
   * This asynchronous series call first sends a request to the News
   * API for a list of the top stories. It then iterates through
   * each article returned to generate a shortened version of each
   * article's URL. The resulting object is then cached and returned through
   * the callback.
   */
  var context = this;
  async.waterfall([
    function(innerCallback) {
      /**
       * This first asynchronous function sends a request to the News
       * API for the top stories, which we pass to the callback to
       * the next asynchronous function call.
       */
      context.fetchArticles(source, innerCallback);
    }, function(results, innerCallback) {
      /**
       * This inner asynchronous function iterates through
       * the list of results from the News API to generate a
       * shortened URL for each.
       */
      async.map(results, function(result, mappingCallback) {
        context.shortenUrl(result.url, function(error, shortenedUrl) {
          if (error) {
            return mappingCallback(error);
          }
          result.url = shortenedUrl;
          mappingCallback(null, result);
        });
      }, function(error, data) {
        if (error) {
          return innerCallback(error);
        }
        innerCallback(null, data);
      });
    }
  ], function(error, results) {
    /**
     * When we are done, we cache the data and send it back through the
     * callback unless there was an error.
     */
    if (error) {
      return callback(error);
    }
    context.cache[source] = {
      results: results,
      expires: (new Date()).getTime() + ApiAccessor.CACHE_KEEP_TIME
    };
    return callback(null, results);
  });
};

/**
 * This line is needed on the server side since this is loaded as a module
 * into the node server.
 */
module.exports = ApiAccessor;
