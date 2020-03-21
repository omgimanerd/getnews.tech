/**
 * @fileoverview This file contains error types that we will handle.
 * @author alvin@omgimanerd.tech (Alvin Lin)
 */

/**
 * Encapsulates a class of error that we can gracefully handle and should
 * log for debugging.
 * @extends Error
 */
class RecoverableError extends Error {
  /**
   * Constructor for a Recoverable Error which stores useful information
   * in the internal message field.
   * @param {*} e Error or string representable object
   */
  constructor(e) {
    super()
    if (e instanceof Error) {
      this.message = e.message
    } else {
      this.message = e
    }
  }
}

module.exports = exports = {
  RecoverableError
}
