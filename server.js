/**
 * @fileoverview This is the server app script.
 * @author alvin@omgimanerd.tech (Alvin Lin)
 */

const PORT = process.env.PORT || 5000
const NEWS_API_KEY = process.env.NEWS_API_KEY
const DB_URL = 'mongodb://localhost:27017'
const GITHUB_URL = 'https://github.com/omgimanerd/getnews.tech'

const INVALID_QUERY = '\nInvalid query!\n' +
  'Provide a keyword(s) to search for.\n' +
  'Ex: curl getnews.tech/american+politics\n'
const INTERNAL_ERROR = 'An error occurred! Please try again in a bit.\n'.red

// Dependencies.
// eslint-disable-next-line no-unused-vars
const colors = require('colors')
const express = require('express')
const moment = require('moment-timezone')
const mongodb = require('mongodb')
const iplocate = require('node-iplocate')
const newsapi = require('newsapi')
const path = require('path')

const analyticsFile = path.join(__dirname, 'logs/analytics.log')
const errorFile = path.join(__dirname, 'logs/error.log')

const formatter = require('./server/formatter')
const parser = require('./server/parser')
const loggers = require('./server/loggers')({ analyticsFile, errorFile })
const logError = loggers.logError
const urlShortener = require('./server/urlShortener')


// Server initialization
const client = new mongodb.MongoClient(DB_URL)
// eslint-disable-next-line new-cap
const api = new newsapi(NEWS_API_KEY)
const app = express()

app.set('port', PORT)
app.set('view engine', 'pug')

app.use('/dist', express.static(path.join(__dirname, '/dist')))
app.use('/robots.txt', express.static(path.join(__dirname, '/robots.txt')))
app.use('/favicon.ico', express.static(path.join(__dirname,
  '/client/favicon.ico')))

// Log general server information to the console.
app.use(loggers.devLoggerMiddleware)

// Write more specific log information to the server log file
app.use(loggers.analyticsLoggerMiddleware)

app.use(async(request, response, next) => {
  request.isCurl = (request.headers['user-agent'] || '').includes('curl')
  request.country = parser.parseSubdomain(request.subdomains)
  try {
    const locationData = await iplocate(request.headers['x-forwarded-for'])
    request.timezone = locationData.time_zone
  } catch (error) {
    request.timezone = moment.tz.guess()
  }
  next()
})

/**
 * Helper function to shorten the URLs in the articles returned from the
 * News API.
 * @param {Array<Object>} articles The articles with URLs to shorten
 * @return {Array<Object>}
 */
const shortenArticleUrls = async articles => {
  const sorted = articles.sort((a, b) => {
    return moment(a.publishedAt).diff(moment(b.publishedAt))
  })
  const shortenedUrls = await Promise.all(sorted.map(article => {
    return urlShortener.getShortenedUrl(client, article.url)
  }))
  return articles.map((article, i) => {
    article.url = shortenedUrls[i]
    return article
  })
}

/**
 * Given the API arguments to the News API, this helper function fetches
 * top headlines corresponding to those arguments and runs the URL shortener
 * and article formatter on them, returning the output table.
 * @param {string} country The country to query results for
 * @param {string} category The news category to query results for
 * @param {string} q The query string to search for results with
 * @param {number} pageSize The number of entries to show per page
 * @param {number} page The results page to return
 * @param {string} timezone The timezone to format the results with
 * @return {string}
 */
const getArticles = async(country, category, q, pageSize, page, timezone) => {
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
  const articles = await shortenArticleUrls(result.articles)
  return formatter.formatArticles(articles, timezone)
}

app.get('/', async(request, response, next) => {
  if (!request.isCurl) {
    next()
    return
  }
  try {
    const output = await getArticles(
      request.country, 'general', null, null, null, request.timezone)
    response.send(output)
  } catch (error) {
    logError(error)
    response.status(500).send(INTERNAL_ERROR)
  }
})

app.get('/:query', async(request, response, next) => {
  if (!request.isCurl) {
    next()
    return
  }
  const args = parser.parseArgs(request.params.query)
  if (args.query === ':help') {
    response.send(formatter.formatHelp())
    return
  }
  if (args.error) {
    response.status(401).send(formatter.formatMessage(args.error))
    return
  }
  try {
    const output = await getArticles(
      request.country, args.category, args.query, args.n, args.page,
      request.timezone)
    response.send(output)
  } catch (error) {
    logError(error)
    response.status(500).send(INTERNAL_ERROR)
  }
})

app.get('/s/:short', async(request, response, next) => {
  try {
    const url = await urlShortener.getOriginalUrl(client, request.params.short)
    if (url === null) {
      next()
    } else if (request.isCurl) {
      response.send(url)
    } else {
      response.redirect(url)
    }
  } catch (error) {
    logError(error)
    response.status(500).send(INTERNAL_ERROR)
  }
})

app.use((request, response) => {
  if (request.isCurl) {
    response.status(404).send(formatter.formatMessage(INVALID_QUERY.red))
  } else {
    response.redirect(GITHUB_URL)
  }
})

// eslint-disable-next-line no-unused-vars
app.use((error, request, response, next) => {
  logError(request)
  logError(error)
  if (request.isCurl) {
    response.status(500).send(INTERNAL_ERROR)
  } else {
    response.redirect(GITHUB_URL)
  }
})

// Starts the server.
client.connect(async error => {
  if (error) { throw error }
  await urlShortener.setup(client)
  await app.listen(PORT)
  /* eslint-disable no-console */
  console.log(`STARTING SERVER ON PORT ${PORT}`)
  /* eslint-enable no-console */
})
