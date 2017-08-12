/**
 * @fileoverview Class encapsulating loggable errors on the server for
 *   standardizing errors in Promises.
 * @author alvin@omgimanerd.tech (Alvin Lin)
 */

/**
 * Class encapsulating server errors and metadata.
 */
class ServerError extends Error {
  /**
   * Constructor for a ServerError
   * @param {string} message The human-readable message to display.
   * @param {?} data Miscellaneous metadata
   */
  constructor(message, data) {
    super(message)
    this.data = data instanceof Error ? data.message : data || {}
  }

  /**
   * Returns the loggable form of this error.
   * @return {string}
   */
  toString() {
    return `${JSON.stringify(this.data)}\n${this.stack}`
  }
}

module.exports = exports = ServerError
