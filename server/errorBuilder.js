/**
 * @fileoverview This file contains methods for error building.
 * @author alvin@omgimanerd.tech (Alvin Lin)
 */

const buildError = (name, data) => {
  const error = new Error()
  error.data = data || {}
  error.name = name
  return error
}

const promise = (name, data) => {
  return Promise.reject(buildError(name, data))
}

module.exports = exports = { promise }
