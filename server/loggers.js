/**
 * @fileoverview This file exports loggers for the server.
 * @author alvin@omgimanerd.tech (Alvin Lin)
 */

const expressWinston = require('express-winston');
const winston = require('winston');
const winstonMail = require('winston-mail');

const ALERT_EMAIL = process.env.ALERT_EMAIL;
const USERNAME = process.env.USERNAME;
const PASSWORD = process.env.PASSWORD;
if (!USERNAME || !PASSWORD || !ALERT_EMAIL) {
  throw new Error('Production configuration not provided!');
}

const dynamicMetaFunction = (request, response) => {
  return {
    ip: request.headers['x-forwarded-for'] || request.ip
  };
};

module.exports = exports = (options) => {
  const PROD_MODE = options.PROD_MODE;
  const analyticsFile = options.analyticsFile;
  const errorFile = options.errorFile;

  const errorTransports = [
    new winston.transports.Console({
      prettyPrint: true,
      timestamp: true
    }),
    new winston.transports.File({
      filename: errorFile,
      timestamp: true
    })
  ];
  if (PROD_MODE) {
    errorTransports.push(new winston.transports.Mail({
      to: ALERT_EMAIL,
      host: 'smtp.gmail.com',
      username: USERNAME,
      password: PASSWORD,
      subject: 'NYCURL ERROR',
      ssl: true
    }));
  }

  return {
    analyticsLogger: expressWinston.logger({
      transports: [
        new winston.transports.File({
          json: true,
          filename: analyticsFile,
          showLevel: false,
          timestamp: true
        })
      ],
      skip: (request, response) => {
        return response.statusCode != 200;
      },
      dynamicMeta: dynamicMetaFunction
    }),
    devLogger: expressWinston.logger({
      transports: [
        new winston.transports.Console({ showLevel: false, timestamp: true })
      ],
      expressFormat: true,
      colorize: true,
      dynamicMeta: dynamicMetaFunction
    }),
    errorLogger: new winston.Logger({
      transports: errorTransports
    })
  };
};
