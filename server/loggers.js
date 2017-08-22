/**
 * @fileoverview This file exports loggers for the server.
 * @author alvin@omgimanerd.tech (Alvin Lin)
 */

const expressWinston = require('express-winston')
const sendgrid = require('sendgrid')
const winston = require('winston')
const util = require('util')

// eslint-disable-next-line no-unused-vars, require-jsdoc
const dynamicMetaFunction = (request, response) => {
  return {
    ip: request.headers['x-forwarded-for'] || request.ip
  }
}

module.exports = exports = options => {
  const PROD_MODE = options.PROD_MODE
  const ALERT_EMAIL = process.env.ALERT_EMAIL
  const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY
  if (PROD_MODE && (!ALERT_EMAIL || !SENDGRID_API_KEY)) {
    throw new Error('Production configuration not provided!')
  }
  const sg = sendgrid(SENDGRID_API_KEY)

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
      if (PROD_MODE) {
        const request = sg.emptyRequest({
          method: 'POST',
          path: '/v3/mail/send',
          body: {
            personalizations: [{
              to: [{ email: ALERT_EMAIL }],
              subject: 'Error from getnews.tech'
            }],
            from: { email: 'alert@getnews.tech' },
            content: [{
              type: 'text/plain',
              value: unpacked
            }]
          }
        })
        sg.API(request).then(() => {
          errorLogger.info('Alert email successfully sent!')
        }).catch(() => {
          errorLogger.info('Alert email could not be sent!')
        })
      }
    }
  }
}
