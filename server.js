/**
 * @fileoverview This is the server app script.
 * @author alvin.lin.dev@gmail.com (Alvin Lin)
 */

const PROD_MODE = process.argv.includes('--prod');
const PORT = process.env.PORT || 5000;

const LOG_FILE = 'logs/server.log';
const ANALYTICS_FILE = 'logs/analytics.log';

const GITHUB_PAGE = 'https://github.com/omgimanerd/getnews.tech';

// Dependencies.
const colors = require('colors');
const express = require('express');
const fs = require('fs');
const http = require('http');
const morgan = require('morgan');
const path = require('path');

const logFile = path.join(__dirname, LOG_FILE);
const logFileStream = fs.createWriteStream(logFile, { flags: 'a' });
const analyticsFile = path.join(__dirname, ANALYTICS_FILE);
const analyticsFileStream = fs.createWriteStream(analyticsFile, { flags: 'a' });

const analytics = require('./server/analytics');
const api = require('./server/api');
const formatter = require('./server/formatter');

var app = express();

app.set('port', PORT);
app.set('view engine', 'pug');
app.disable('etag');

app.use('/dist', express.static(__dirname + '/dist'));
app.use('/robots.txt', express.static(__dirname + '/robots.txt'));
app.use('/favicon.ico', express.static(__dirname + '/client/favicon.ico'));

// Log general server information to the console.
app.use(morgan('dev'));

// Write more specific log information to the server log file.
app.use(morgan('combined', { stream: logFileStream }));

// Only write cURL requests to the analytics file.
app.use(morgan(function(tokens, request, response) {
  return JSON.stringify({
    date: new Date(),
    httpVersion: `${request.httpVersionMajor}.${request.httpVersionMinor}`,
    ip: request.headers['x-forwarded-for'] || request.headers.ip,
    method: request.method,
    referrer: request.headers.referer || request.headers.referrer,
    responseTime: parseFloat(tokens['response-time'](request, response)),
    status: response.statusCode,
    url: request.url || request.originalUrl,
    userAgent: tokens['user-agent'](request, response)
  });
}, {
  skip: function(request, response) {
    return response.statusCode != 200;
  },
  stream: analyticsFileStream
}));

app.use((request, response, next) => {
  request.isCurl = (request.headers['user-agent'] || '').includes('curl');
  next();
});

app.get('/sources', (request, response) => {
  api.fetchSources(request.query).then(sources => {
    if (request.isCurl) {
      response.send(formatter.formatSources(sources, request.query));
    } else {
      response.status(301).redirect(GITHUB_PAGE);
    }
  }).catch(error => {
    console.error(error);
  });
});

app.get('/:source?', (request, response, next) => {
  if (!request.isCurl) {
    response.status(301).redirect(GITHUB_PAGE);
    return;
  }

  var source = request.params.source;
  if (source === 'help') {
    response.send(formatter.formatHelp());
    return;
  }
  api.fetchArticles(source).then(articles => {
    if (request.isCurl) {
      response.send(formatter.formatArticles(articles, request.query));
    } else {
      response.status(301).redirect(GITHUB_PAGE);
    }
  }).catch(error => {
    console.error(error);
    response.send(null);
  });
});

app.get('/analytics', (request, response) => {
  if (request.isCurl) {
    next();
  } else {
    response.status(201).render('analytics');
  }
});

app.post('/analytics', (request, response) => {
  analytics.get(analyticsFile).then(data => {
    response.status(201).send(data);
  }).catch(error => {
    console.error(error);
  });
});

app.use((request, response) => {
  response.status(400).send(formatter.formatHelp());
});

app.use((error, request, response, next) => {
  response.status(500).send(formatter.ERROR);
})

// Starts the server.
http.Server(app).listen(PORT, () => {
  if (PROD_MODE) {
    console.log('STARTING PRODUCTION SERVER ON PORT ' + PORT);
  } else {
    console.log('STARTING DEV SERVER ON PORT ' + PORT);
  }
});
