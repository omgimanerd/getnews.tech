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

const DEV_MODE = process.argv.includes('--dev');
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
if (!DEV_MODE) {
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

app.use('/public', express.static(__dirname + '/public'));
app.use('/robots.txt', express.static(__dirname + '/robots.txt'));
app.use('/favicon.ico',
    express.static(`${__dirname}/public/images/favicon.ico`));
app.use(function(request, response, next) {
  request.userAgent = request.headers['user-agent'] || '';
  request.isCurl = request.userAgent.includes('curl');
  next();
});

// Log general server information to the console.
app.use(morgan('dev'));
// Write more specific log information to the server log file.
app.use(morgan('combined', { stream: logFileStream }));
// Only write cURL requests to the analytics file.
app.use(morgan(function(tokens, request, response) {
  return JSON.stringify({
    date: (new Date()).toUTCString(),
    httpVersion: `${request.httpVersionMajor}.${request.httpVersionMinor}`,
    method: request.method,
    referrer: request.headers.referer || request.headers.referrer,
    ip: request.headers['x-forwarded-for'] || request.headers.ip,
    responseTime: parseFloat(tokens['response-time'](request, response)),
    status: response.statusCode,
    url: request.url || request.originalUrl
  });
}, {
  skip: function(request, response) {
    return !request.isCurl;
  },
  stream: analyticsFileStream
}));

app.get('/help', function(request, response) {
  if (request.isCurl) {
    response.send('Valid queries:\n'.red +
        ApiAccessor.SECTIONS.join('\n') + '\n');
  } else {
    response.render('index', {
      header: 'Valid sections to query:',
      listSections: true,
      sections: ApiAccessor.SECTIONS
    });
  }
});

app.get('/sources', function(request, response) {
  if (request.isCurl) {
    var callback = function(error, sources) {
      if (error) {
        console.error(error);
      } else {
        response.send(DataFormatter.formatSources(sources, request.query));
      }
    };
    apiAccessor.fetchSources(null, callback);
  }
});

app.get('/:source?', function(request, response, next) {
  // TODO: default to showing source types
  var source = request.params.source || 'the-next-web';
  var callback = function(error, results) {
    if (error) {
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
  if (!DEV_MODE) {
    apiAccessor.fetch(source, alert.errorHandler(callback));
  } else {
    apiAccessor.fetch(source, callback);
  }
});

app.get('/analytics', function(request, response) {
  response.render('analytics');
});

app.post('/analytics', function(request, response) {
  analytics.getAnalytics(function(error, data) {
    response.send(data);
  });
});

app.use(function(request, response) {
  if (request.isCurl) {
    response.send('Invalid query! Valid queries:\n'.red +
        ApiAccessor.SECTIONS.join('\n') + '\n');
  } else {
    response.render('index', {
      header: 'Invalid query! Valid sections to query:',
      listSections: true,
      sections: ApiAccessor.SECTIONS
    });
  }
});

// Starts the server.
server.listen(PORT, function() {
  console.log('STARTING SERVER ON PORT ' + PORT);
  if (DEV_MODE) {
    console.log('DEV_MODE ENABLED!');
  }
  if (!NEWS_API_KEY) {
    throw new Error('No NYTimes API key specified.');
  }
  if (!URL_SHORTENER_API_KEY) {
    throw new Error('No URL shortener API key specified.');
  }
  if (!DEV_MODE && !SENDGRID_API_KEY) {
    throw new Error('No SendGrid API key specified! Use --dev mode?');
  }
  if (!DEV_MODE && !ALERT_EMAIL) {
    throw new Error('No alert email specified! Use --dev mode?');
  }
});
