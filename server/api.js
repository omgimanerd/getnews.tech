/**
 * @fileoverview This class handles the fetching and formatting of data from
 *   the News API.
 * @author alvin.lin.dev@gmail.com (Alvin Lin)
 */

const Promise = require('bluebird')
const request = require('request-promise')

const ServerError = require('./ServerError')

const NEWS_API_KEY = process.env.NEWS_API_KEY
if (!NEWS_API_KEY) {
  throw new Error('No News API key specified. Make sure you have ' +
    'NEWS_API_KEY in your environment variables.')
}

const URL_SHORTENER_API_KEY = process.env.URL_SHORTENER_API_KEY
if (!URL_SHORTENER_API_KEY) {
  throw new Error('No URL Shortener API key specified. Make sure you have ' +
    'URL_SHORTENER_API_KEY in your environment variables.')
}

/**
 * Base URL for the news API.
 * @type {string}
 */
const NEWS_API_BASE_URL = 'https://newsapi.org/v1'

/**
 * Base URL for the URL Shortener API.
 * @type {type}
 */
const URL_SHORTENER_BASE_URL = 'https://www.googleapis.com/urlshortener/v1/url'

/**
 * The error string returned when an invalid source is queried.
 * @type {string}
 */
const BAD_SOURCE = 'sourceDoesntExist'

/**
 * Milliseconds in 10 minutes, the duration which results will be cached.
 * @type {number}
 */
const CACHE_KEEP_TIME = 600000

const cache = {}

/**
 * This method sends a request to Google's URL Shortener API to get
 * a shortened URL and returns a Promise.
 * @param {string} url The URL to shorten.
 * @return {Promise}
 */
const shortenUrl = url => {
  return request({
    uri: URL_SHORTENER_BASE_URL,
    method: 'POST',
    headers: {
      /*
       * The Referer field is necessary because of the referrer limitation set
       * on the production API key.
       */
      Referer: 'getnews.tech',
      'Content-Type': 'application/json'
    },
    body: { longUrl: url },
    qs: { key: URL_SHORTENER_API_KEY },
    json: true
  }).then(data => data.id).catch(error => {
    throw new ServerError('Error shortening a URL', error)
  })
}

/**
 * This method fetches article sources from the News API and passes it to
 * a callback. Any errors will be passed to the callback as well.
 * @param {Object} options Options for customizing the request
 * @return {Promise}
 */
const fetchSources = options => {
  return request({
    uri: `${NEWS_API_BASE_URL}/sources`,
    qs: options,
    json: true
  }).then(data => data.sources).catch(error => {
    throw new ServerError('Error fetching sources', error)
  })
}

/**
 * This method fetches article data from the News API and returns a Promise.
 * @param {string} source The News API source to query.
 * @return {Promise}
 */
const fetchArticles = source => {
  /**
   * We first check if the query has been cached within the last 10
   * minutes. If it has, then we return the cached data. If not, we then
   * fetch new data from the News API.
   */
  const currentTime = Date.now()
  if (cache[source] && currentTime < cache[source].expires) {
    return Promise.resolve(cache[source].articles)
  }
  /**
   * If the section being requested was not cached, then we need to fetch the
   * data from the News API.
   */
  return request({
    url: `${NEWS_API_BASE_URL}/articles`,
    qs: {
      source: source,
      apiKey: NEWS_API_KEY
    },
    json: true
  }).catch(error => {
    throw new ServerError('Error fetching articles',
      error.error ? error.error : error)
  }).get('articles').map(article => {
    return shortenUrl(article.url).then(url => {
      article.url = url
      return article
    })
  }).then(articles => {
    const results = articles.sort((a, b) => a.title.localeCompare(b.title))
    /**
     * We cache the result and then return it in a resolved Promise.
     */
    cache[source] = {
      articles: results,
      expires: currentTime + CACHE_KEEP_TIME
    }
    return results
  }).catch(error => {
    if (error instanceof ServerError) {
      throw error
    }
    throw new ServerError('Error shortening article URLs', error)
  })
}

module.exports = exports = {
  BAD_SOURCE, shortenUrl, fetchSources, fetchArticles
}
