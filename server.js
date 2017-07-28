/**
 * @fileoverview This is the server app script.
 * @author alvin.lin.dev@gmail.com (Alvin Lin)
 */

const PROD_MODE = process.argv.includes('--prod')
const PORT = process.env.PORT || 5000
const GITHUB_PAGE = 'https://github.com/omgimanerd/getnews.tech'

const INTERNAL_ERROR = 'An error occurred! Please try again later.\n'

// Dependencies.
const colors = require('colors')
const express = require('express')
const fs = require('fs')
const http = require('http')
const path = require('path')

const analyticsFile = path.join(__dirname, 'logs/analytics.log')
const errorFile = path.join(__dirname, 'logs/error.log')

const analytics = require('./server/analytics')
const api = require('./server/api')
const formatter = require('./server/formatter')
const loggers = require('./server/loggers')({
  PROD_MODE: PROD_MODE,
  analyticsFile: analyticsFile,
  errorFile: errorFile
})
const logError = loggers.errorLogger.error

// Server initialization
var app = express()

app.set('port', PORT)
app.set('view engine', 'pug')
app.disable('etag')

app.use('/dist', express.static(__dirname + '/dist'))
app.use('/robots.txt', express.static(__dirname + '/robots.txt'))
app.use('/favicon.ico', express.static(__dirname + '/client/favicon.ico'))

// Log general server information to the console.
app.use(loggers.devLogger)

// Write more specific log information to the server log file
app.use(loggers.analyticsLogger)

app.use((request, response, next) => {
  request.isCurl = (request.headers['user-agent'] || '').includes('curl')
  next()
})

app.get('/analytics', (request, response) => {
  if (request.isCurl) {
    next()
  } else {
    response.status(201).render('analytics')
  }
})

app.post('/analytics', (request, response) => {
  analytics.get(analyticsFile).then(data => {
    response.status(201).send(data)
  }).catch(error => {
    logError(error)
    response.status(500).send(error)
  })
})

app.get('/sources', (request, response) => {
  api.fetchSources(request.query).then(sources => {
    if (request.isCurl) {
      response.send(formatter.formatSources(sources, request.query))
    } else {
      response.status(301).redirect(GITHUB_PAGE)
    }
  }).catch(error => {
    logError(error)
    response.status(500).send(formatter.ERROR)
  })
})

app.get('/:source?', (request, response, next) => {
  if (!request.isCurl) {
    response.status(301).redirect(GITHUB_PAGE)
    return
  }

  var source = request.params.source
  if (source === 'help') {
    response.send(formatter.formatHelp())
    return
  }
  api.fetchArticles(source).then(articles => {
    if (request.isCurl) {
      response.send(formatter.formatArticles(articles, request.query))
    } else {
      response.status(301).redirect(GITHUB_PAGE)
    }
  }).catch(error => {
    if (error.data.code === api.BAD_SOURCE) {
      response.status(400).send(formatter.formatHelp(true))
    } else {
      logError(error)
      response.status(500).send(INTERNAL_ERROR.red)
    }
  })
})

app.use((request, response) => {
  response.status(400).send(formatter.formatHelp())
})

app.use((error, request, response, next) => {
  logError(error)
  response.status(500).send(INTERNAL_ERROR.red)
})

// Starts the server.
http.Server(app).listen(PORT, () => {
  if (PROD_MODE) {
    console.log('STARTING PRODUCTION SERVER ON PORT ' + PORT)
  } else {
    console.log('STARTING DEV SERVER ON PORT ' + PORT)
  }
})
