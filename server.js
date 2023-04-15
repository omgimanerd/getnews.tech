/**
 * @fileoverview This is the server app script.
 * @author alvin@omgimanerd.tech (Alvin Lin)
 */

require('dotenv').config()

const PORT = process.env.PORT || 5000
const NEWS_API_KEY = process.env.NEWS_API_KEY
const PROD = process.env.PROD === 'true'
const GITHUB_URL = 'https://github.com/omgimanerd/getnews.tech'

if (NEWS_API_KEY === "") {
  console.error('Unable to find News API key, no .env file available')
  exit()
}

const REDIS_PREFIX = PROD ? 'prod' : 'dev'
const URL_SHORTENER_BASE_URL = PROD ? 'getnews.tech' : 'dev.getnews.tech'

// Dependencies.
const asyncHandler = require('express-async-handler')
// eslint-disable-next-line no-unused-vars
const colors = require('colors')
const express = require('express')
const moment = require('moment-timezone')
const iplocate = require('node-iplocate')
const path = require('path')

const NewsApi = require('newsapi')

const errorFile = path.join(__dirname, 'logs/error.log')

const errors = require('./server/errors')
const formatter = require('./server/formatter')
const parser = require('./server/parser')
const loggers = require('./server/loggers')({ errorFile })
const logError = loggers.logError

const URLShortener = require('./server/urlShortener')
const RecoverableError = errors.RecoverableError

// Server initialization
const api = new NewsApi(NEWS_API_KEY)
const app = express()
const urlShortener = new URLShortener(REDIS_PREFIX, URL_SHORTENER_BASE_URL)

app.set('port', PORT)
app.set('view engine', 'pug')

app.use('/robots.txt', express.static(path.join(__dirname, '/robots.txt')))

// Log general server information to the console.
app.use(loggers.devLoggerMiddleware)

app.use(asyncHandler(async(request, response, next) => {
  request.isCurl = (request.headers['user-agent'] || '').includes('curl')
  request.country = parser.parseSubdomain(request.subdomains)
  try {
    const locationData = await iplocate(request.headers['x-forwarded-for'])
    // eslint-disable-next-line require-atomic-updates
    request.timezone = locationData.time_zone
  } catch (error) {
    // eslint-disable-next-line require-atomic-updates
    request.timezone = moment.tz.guess()
  }
  next()
}))

/**
 * Given the API arguments to the News API, this helper function fetches
 * most relevant articles and returns them after shortening their URLs.
 * @param {string} country The country to query results for
 * @param {string} category The news category to query results for
 * @param {string} q The query string to search for results with
 * @param {number} pageSize The number of entries to show per page
 * @param {number} page The results page to return
 * @return {Array<Object>}
 */
const getArticles = async(country, category, q, pageSize, page) => {
  const result = await api.v2.topHeadlines({
    country: country ? country : '',
    category: category ? category : '',
    q: q ? q : '',
    pageSize: pageSize ? pageSize : 20,
    page: page ? page : 1
  })
  if (!result.articles) {
    return []
  }
  return Promise.all(result.articles.map(async article => {
    // eslint-disable-next-line require-atomic-updates
    article.url = await urlShortener.getShortenedUrl(article.url)
    return article
  }))
}

app.get('/', asyncHandler(async(request, response, next) => {
  if (!request.isCurl) {
    next()
    return
  }
  const articles = await getArticles(
    request.country, 'general', null, null, null)
  response.send(formatter.formatArticles(articles, request.timezone))
}))

app.get('/:query', asyncHandler(async(request, response, next) => {
  if (!request.isCurl) {
    next()
    return
  }
  const args = parser.parseArgs(request.params.query)
  if (args.query === ':help') {
    response.send(formatter.formatHelp())
    return
  }
  const articles = await getArticles(
    request.country, args.category, args.query, args.n, args.p)
  response.send(formatter.formatArticles(
    articles, request.timezone, args.nocolor, args.reverse))
}))

app.get('/s/:shortlink', asyncHandler(async(request, response) => {
  const shortlink = request.params.shortlink
  const url = await urlShortener.getOriginalUrl(shortlink)
  if (url === null) {
    throw new RecoverableError(
      `Could not find URL for shortlink /s/${shortlink}`)
  } else if (request.isCurl) {
    response.send(url)
  } else {
    response.redirect(url)
  }
}))

// eslint-disable-next-line no-unused-vars
app.use((error, request, response, next) => {
  logError(request)
  logError(error)
  if (request.isCurl) {
    response.send(formatter.formatError(error))
  } else {
    response.redirect(GITHUB_URL)
  }
})

app.listen(PORT, () => {
  /* eslint-disable no-console */
  console.log(`STARTING SERVER ON PORT ${PORT}`)
  if (!PROD) {
    console.log('THIS SERVER IS RUNNING IN DEVELOPMENT MODE')
  }
  /* eslint-enable no-console */
  urlShortener.setup()
})
