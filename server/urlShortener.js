/**
 * @fileoverview This file contains methods which access and update the
 * Redis database as a URL shortener.
 * @author alvin@omgimanerd.tech (Alvin Lin)
 */

const nanoid = require('nanoid')
const redis = require('redis')

const Mutex = require('async-mutex').Mutex
const Promise = require('bluebird')

const SHORT_LENGTH = 16
// One year expiration for all shortened URLs.
const EXPIRATION_TIME = 60 * 60 * 24 * 365

/**
 * The URLShortener class allows for URLs to be associated with a small
 * unique ID and retrieved later using the same unique ID.
 */
class URLShortener {
  /**
   * Constructor for a URLShortener class.
   * @param {string} prefix The prefix to prepend to all hashes.\
   * @param {string} baseUrl The base URL of this project, either
   *   dev.getnews.tech in dev mode or getnews.tech in production.
   */
  constructor(prefix, baseUrl) {
    this.prefix = prefix
    this.baseUrl = baseUrl

    this.client = redis.createClient()
    this.mutex = new Mutex()
  }

  /**
   * Initializes the URLShortener class and checks for an error in the
   * Redis client initialization.
   * @param {?Function=} onError callback for any Redis errors.
   */
  setup(onError) {
    if (onError) {
      this.client.on('error', onError)
    }

    this.redisGet = Promise.promisify(this.client.get, { context: this.client })
    this.redisSet = Promise.promisify(this.client.set, { context: this.client })
    this.redisExpire = Promise.promisify(this.client.expire,
      { context: this.client })
  }

  /**
   * Given a URL, this method checks if we already have a shortened form of a
   * URL in our Redis store, returning the shortened form if we already have
   * one. Otherwise, it generates a new short for the URL and stores the
   * mapping and reverse mapping in Redis.
   * @param {string} url The URL to shorten
   * @return {Promise}
   */
  async getShortenedUrl(url) {
    const release = await this.mutex.acquire()
    try {
      const existingShort = await this.redisGet(`${this.prefix}:url:${url}`)
      if (existingShort !== null) {
        return `${this.baseUrl}/s/${existingShort}`
      }
      let newShort = nanoid(SHORT_LENGTH)
      let exists = await this.redisGet(`${this.prefix}:short:${newShort}`)
      while (exists !== null) {
        newShort = nanoid(SHORT_LENGTH)
        exists = await this.redisGet(`${this.prefix}:short:${newShort}`)
      }
      const urlKey = `${this.prefix}:url:${url}`
      const shortKey = `${this.prefix}:short:${newShort}`
      await this.redisSet(urlKey, newShort)
      await this.redisSet(shortKey, url)
      await this.redisExpire(urlKey, EXPIRATION_TIME)
      await this.redisExpire(shortKey, EXPIRATION_TIME)
      return `${this.baseUrl}/s/${newShort}`
    } finally {
      release()
    }
  }

  /**
   * Given a shortened string, this methods returns the original URL mapped to
   * the shortened string, or null if we do not have a corresponding URL.
   * @param {string} short A shortened string to look up for a corresponding URL
   * @return {Promise}
   */
  getOriginalUrl(short) {
    return this.redisGet(`${this.prefix}:short:${short}`)
  }
}

module.exports = exports = URLShortener
