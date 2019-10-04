/**
 * @fileoverview This file contains error types that we will handle.
 * @author alvin@omgimanerd.tech (Alvin Lin)
 */

class RecoverableError extends Error {
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
