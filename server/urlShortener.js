/**
 * @fileoverview This file contains methods which will access and maintain
 * the MongoDB database for URL shortening.
 * @author alvin@omgimanerd.tech (Alvin Lin)
 */

const nanoid = require('nanoid')

const SHORT_LENGTH = 8

const DB_NAME = 'getnewstech'
const COLLECTION_NAME = 'shortlinks'
const EXPIRATION_TIME = 60 * 60 * 24 * 365

/**
 * Sets up the indexes on the collection on startup.
 * @param {MongoClient} client MongoDB client object
 */
const setup = async client => {
  const collection = client.db(DB_NAME).collection(COLLECTION_NAME)
  try {
    await collection.createIndex(
      { 'short': 1, url: 1 },
      { unique: true, expireAfterSeconds: EXPIRATION_TIME })
  } catch (error) {
    if (error.code === 85 && error.codeName === 'IndexOptionsConflict') {
      return
    }
    throw error
  }
}

/**
 * Given a URL, this method will return a shortened form of that URL.
 * Internally, this handles the generation of a shortened ID for the URL
 * and storing in into the MongoDB database. If a shortened URL already exists,
 * it will be returned.
 * @param {MongoClient} client MongoDB client object
 * @param {string} url The URL to shorten
 * @return {Promise}
 */
const getShortenedUrl = async(client, url) => {
  try {
    const collection = client.db(DB_NAME).collection(COLLECTION_NAME)
    const result = await collection.find({ url }).toArray()
    let short = null
    if (result.length === 0) {
      short = nanoid(SHORT_LENGTH)
      await collection.insertOne({ short, url })
    } else {
      short = result[0].short
    }
    return `http://getnews.tech/s/${short}`
  } catch (error) {
    throw error
  }
}

/**
 * Given a shortlink ID, this method will look up the original URL in the
 * database and return it. If no shortlink exists, this method will return null.
 * @param {MongoClient} client MongoDB client object
 * @param {string} short The URL shortlink ID
 * @return {Promise}
 */
const getOriginalUrl = async(client, short) => {
  try {
    const collection = client.db(DB_NAME).collection(COLLECTION_NAME)
    const result = await collection.find({ short }).toArray()
    if (result.length === 1) {
      return result[0].url
    }
    return null
  } catch (error) {
    throw error
  }
}

module.exports = { setup, getShortenedUrl, getOriginalUrl }
