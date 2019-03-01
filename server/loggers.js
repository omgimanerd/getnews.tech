/**
 * @fileoverview This file exports loggers for the server.
 * @author alvin@omgimanerd.tech (Alvin Lin)
 */

const expressWinston = require('express-winston')
const winston = require('winston')
const util = require('util')

// eslint-disable-next-line no-unused-vars, require-jsdoc
const dynamicMetaFunction = (request, response) => {
  return {
    ip: request.headers['x-forwarded-for'] || request.ip
  }
}

module.exports = options => {
  const analyticsFile = options.analyticsFile
  const errorFile = options.errorFile

  const errorLogger = new winston.Logger({
    transports: [
      new winston.transports.Console({
        prettyPrint: true,
        timestamp: true
      }),
      new winston.transports.File({
        filename: errorFile,
        timestamp: true
      })
    ]
  })

  return {
    analyticsLoggerMiddleware: expressWinston.logger({
      transports: [
        new winston.transports.File({
          json: true,
          filename: analyticsFile,
          showLevel: false,
          timestamp: true
        })
      ],
      skip: (request, response) => response.statusCode !== 200,
      dynamicMeta: dynamicMetaFunction
    }),
    devLoggerMiddleware: expressWinston.logger({
      transports: [
        new winston.transports.Console({ showLevel: false, timestamp: true })
      ],
      expressFormat: true,
      colorize: true,
      dynamicMeta: dynamicMetaFunction
    }),
    logError: data => {
      const unpacked = util.inspect(data)
      errorLogger.error(unpacked)
    }
  }
}
