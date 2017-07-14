/**
 * @fileoverview This is the server app script.
 * @author alvin.lin.dev@gmail.com (Alvin Lin)
 */

// Constants
const NEWS_API_KEY = process.env.NEWS_API_KEY;
const URL_SHORTENER_API_KEY = process.env.URL_SHORTENER_API_KEY;

/**
 * This API key is only used in production to email Alvin Lin (@omgimanerd)
 * when the production server goes down. Run the server in --dev mode during
 * development
 * @type {string}
 */
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const ALERT_EMAIL = process.env.ALERT_EMAIL;

const PROD_MODE = process.argv.includes('--prod');
const PORT = process.env.PORT || 5000;

const LOG_FILE = 'logs/server.log';
const ANALYTICS_FILE = 'logs/analytics.log';

// Dependencies.
const colors = require('colors');
const emailAlerts = require('email-alerts');
const express = require('express');
const fs = require('fs');
const http = require('http');
const morgan = require('morgan');
const path = require('path');

const logFile = path.join(__dirname, LOG_FILE);
const logFileStream = fs.createWriteStream(logFile, { flags: 'a' });
const analyticsFile = path.join(__dirname, ANALYTICS_FILE);
const analyticsFileStream = fs.createWriteStream(analyticsFile, { flags: 'a' });

const Analytics = require('./server/Analytics');
const ApiAccessor = require('./server/ApiAccessor');
const DataFormatter = require('./server/DataFormatter')

var analytics = Analytics.create(analyticsFile);
var apiAccessor = ApiAccessor.create({
  news_api_key: NEWS_API_KEY,
  url_shortener_api_key: URL_SHORTENER_API_KEY
});
var app = express();
if (PROD_MODE) {
  var alert = emailAlerts({
    fromEmail: 'alert@getnews.tech',
    toEmail: ALERT_EMAIL,
    apiKey: SENDGRID_API_KEY,
    subject: 'Error - getnews.tech'
  });
}
var server = http.Server(app);

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

app.use(function(request, response, next) {
  request.isCurl = (request.headers['user-agent'] || '').includes('curl');
  next();
});

app.get('/help', function(request, response) {
  if (request.isCurl) {
    response.status(201).send(DataFormatter.formatHelp());
  } else {
    response.status(201).send("not yet available");
  }
});

app.get(/^\/sources$|^\/$/, function(request, response) {
  var callback = function(error, sources) {
    if (error) {
      console.error(error);
      if (request.isCurl) {
        response.status(500).send(
            'An error occurred. Please try again later. '.red +
            '(Most likely we hit our rate limit)\n'.red);
      } else {
        response.status(500).send('not available!');
      }
    } else {
      if (request.isCurl) {
        response.send(DataFormatter.formatSources(sources, request.query));
      } else {
        response.render('index', {
          header: 'Valid sections to query:',
          listSections: true,
          sections: sources
        });
      }
    }
  };
  if (PROD_MODE) {
    apiAccessor.fetchSources(request.query, alert.errorHandler(callback));
  } else {
    apiAccessor.fetchSources(request.query, callback);
  }
});

app.get('/:source?', function(request, response, next) {
  var source = request.params.source;
  var callback = function(error, results) {
    if (error) {
      console.error(error);
      if (request.isCurl) {
        response.status(500).send(
            'An error occurred. Please try again later. '.red +
            '(Most likely we hit our rate limit)\n'.red);
      } else {
        response.status(500).render('index', {
          header: 'An error occurred. Please try again later. ' +
            '(Most likely we hit our rate limit)'
        });
      }
    } else {
      if (request.isCurl) {
        response.send(DataFormatter.formatArticles(results, request.query));
      } else {
        response.render('index', {
          header: `getnews.tech/${section}`,
          listSections: false,
          data: results
        });
      }
    }
  };
  if (PROD_MODE) {
    apiAccessor.fetchArticles(source, alert.errorHandler(callback));
  } else {
    apiAccessor.fetchArticles(source, callback);
  }
});

app.get('/analytics', function(request, response) {
  response.status(201).render('analytics');
});

app.post('/analytics', function(request, response) {
  analytics.getAnalytics(function(error, data) {
    response.status(201).send(data);
  });
});

app.use(function(request, response) {
  if (request.isCurl) {
    response.status(400).send('Invalid query! Valid queries:\n'.red +
        ApiAccessor.SECTIONS.join('\n') + '\n');
  } else {
    response.status(400).render('index', {
      header: 'Invalid query! Valid sections to query:',
      listSections: true,
      sections: ApiAccessor.SECTIONS
    });
  }
});

// Starts the server.
server.listen(PORT, function() {
  if (PROD_MODE) {
    console.log('STARTING PRODUCTION SERVER ON PORT ' + PORT);
  } else {
    console.log('STARTING DEV SERVER ON PORT ' + PORT);
  }
  if (!NEWS_API_KEY) {
    throw new Error('No NYTimes API key specified.');
  }
  if (!URL_SHORTENER_API_KEY) {
    throw new Error('No URL shortener API key specified.');
  }
  if (PROD_MODE && !SENDGRID_API_KEY) {
    throw new Error('No SendGrid API key specified!');
  }
  if (PROD_MODE && !ALERT_EMAIL) {
    throw new Error('No alert email specified!');
  }
});
