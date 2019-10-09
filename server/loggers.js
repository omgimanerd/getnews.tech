/**
 * @fileoverview This file exports loggers for the server.
 * @author alvin@omgimanerd.tech (Alvin Lin)
 */

const expressWinston = require('express-winston')
const winston = require('winston')
const util = require('util')

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
    devLoggerMiddleware: expressWinston.logger({
      transports: [
        new winston.transports.Console({ showLevel: false, timestamp: true })
      ],
      expressFormat: true,
      colorize: true,
      dynamicMeta: (request, response) => {
        ip: request.headers['x-forwarded-for'] || request.ip
      }
    }),
    logError: data => {
      const unpacked = util.inspect(data)
      errorLogger.error(unpacked)
    }
  }
}
