/**
 * @fileoverview This is the server app script.
 * @author alvin.lin.dev@gmail.com (Alvin Lin)
 */

// Constants
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

const Analytics = require('./lib/Analytics');
const ApiAccessor = require('./lib/ApiAccessor');
const DataFormatter = require('./lib/DataFormatter')

var analytics = Analytics.create(analyticsFile);
var apiAccessor = ApiAccessor.create({
  nytimes_api_key: process.env.NYTIMES_API_KEY,
  url_shortener_api_key: process.env.URL_SHORTENER_API_KEY
});
var app = express();
if (!DEV_MODE) {
  var alert = emailAlerts({
    fromEmail: process.env.ALERT_SENDER_EMAIL,
    toEmail: process.env.ALERT_RECEIVER_EMAIL,
    apiKey: process.env.SENDGRID_API_KEY,
    subject: 'Error - nycurl'
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
  request['userAgent'] = request.headers['user-agent'] || '';
  request['isCurl'] = request.userAgent.includes('curl');
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
    httpVersion:
        `${request['httpVersionMajor']}.${request['httpVersionMinor']}`,
    method: request['method'],
    referrer: request.headers['referer'] || request.headers['referrer'],
    ip: request.headers['x-forwarded-for'] || request.headers['ip'],
    responseTime: tokens['response-time'](request, response),
    status: response['statusCode'],
    url: request['url'] || request['originalUrl'],
    userAgent: request['userAgent']
  });
}, {
  skip: function(request, response) {
    return !request['isCurl'];
  },
  stream: analyticsFileStream
}));

app.get('/help', function(request, response) {
  if (request['isCurl']) {
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

app.get('/:section?', function(request, response, next) {
  var section = request.params.section || 'home';
  if (!ApiAccessor.isValidSection(section)) {
    return next();
  }
  var callback = function(error, results) {
    if (error) {
      if (request['isCurl']) {
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
      if (request['isCurl']) {
        response.send(DataFormatter.format(results, request.query));
      } else {
        response.render('index', {
          header: `nycurl.sytes.net/${section}`,
          listSections: false,
          data: results
        });
      }
    }
  };
  if (!DEV_MODE) {
    apiAccessor.fetch(section, alert.errorHandler(callback));
  } else {
    apiAccessor.fetch(section, callback);
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
  if (request['isCurl']) {
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
  if (!process.env.NYTIMES_API_KEY) {
    throw new Error('No NYTimes API key specified.');
  }
  if (!process.env.URL_SHORTENER_API_KEY) {
    throw new Error('No URL shortener API key specified.');
  }
  if (!DEV_MODE && !process.env.SENDGRID_API_KEY) {
    throw new Error('No SendGrid API key specified! Use --dev mode?');
  }
});
