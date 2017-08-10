/**
 * @fileoverview Class encapsulating loggable errors on the server for
 *   standardizing errors in Promises.
 * @author alvin@omgimanerd.tech (Alvin Lin)
 */

class ServerError extends Error {
  constructor (message, data) {
    super(message)
    this.data = data || {}
  }
}

module.exports = exports = ServerError
