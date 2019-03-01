/**
 * @fileoverview This is the server app script.
 * @author alvin@omgimanerd.tech (Alvin Lin)
 */

const PORT = process.env.PORT || 5000
const NEWS_API_KEY = process.env.NEWS_API_KEY
const DB_URL = 'mongodb://localhost:27017'
const GITHUB_URL = 'https://github.com/omgimanerd/getnews.tech'

const INVALID_QUERY = '\nInvalid query!\n'
const INTERNAL_ERROR = '\nAn error occurred! Please try again in a bit.\n'

// Dependencies.
// eslint-disable-next-line no-unused-vars
const colors = require('colors')
const express = require('express')
const iplocation = require('iplocation').default
const moment = require('moment-timezone')
const mongodb = require('mongodb')
const newsapi = require('newsapi')
const path = require('path')

const analyticsFile = path.join(__dirname, 'logs/analytics.log')
const errorFile = path.join(__dirname, 'logs/error.log')

const formatter = require('./server/formatter')
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

app.use((request, response, next) => {
  if (!(request.headers['user-agent'] || '').includes('curl')) {
    response.redirect(GITHUB_URL)
  } else {
    next()
  }
})

app.get('/s/:short', async(request, response) => {
  try {
    const url = await urlShortener.getOriginalUrl(client, request.params.short)
    response.redirect(url)
  } catch (error) {
    logError(error)
    response.status(500).send(INTERNAL_ERROR)
  }
})

app.get('/:query', async(request, response) => {
  try {
    const q = request.params.query.replace('+', ' ')
    const result = await api.v2.everything({ q })
    const articles = result.articles
    const shortenedUrls = await Promise.all(articles.map(article => {
      return urlShortener.getShortenedUrl(client, article.url)
    }))
    articles.forEach((article, i) => { article.url = shortenedUrls[i] })
    let timezone = null
    try {
      const locationData = await iplocation(request.headers['x-forwarded-for'])
      timezone = locationData.timezone
    } catch (error) {
      timezone = moment.tz.guess()
    }
    const output = formatter.formatArticles(articles, timezone)
    response.send(output)
  } catch (error) {
    logError(error)
    response.status(500).send(INTERNAL_ERROR)
  }
})

app.use((request, response) => {
  response.status(404).send(formatter.formatMessage(INVALID_QUERY.red))
})

// eslint-disable-next-line no-unused-vars
app.use((error, request, response, next) => {
  logError(request)
  logError(error)
  response.status(500).send(formatter.formatMessage(INTERNAL_ERROR.red))
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
