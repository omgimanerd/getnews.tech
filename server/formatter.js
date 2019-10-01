/**
 * @fileoverview This file contains methods which will format the
 * data fetched from the News API into a nice looking table.
 * @author alvin.lin.dev@gmail.com (Alvin Lin)
 */

// eslint-disable-next-line no-unused-vars
const colors = require('colors')
const moment = require('moment-timezone')
const Table = require('cli-table3')

const parser = require('./parser')

/**
 * The default number of characters for formatting the table width.
 * @const
 * @type {number}
 */
const DEFAULT_DISPLAY_WIDTH = 80

/**
 * This method returns the table footer that is appended to every output
 * Table.
 * @param {number} colSpan The number of columns the footer should span.
 * @return {Array<Object>}
 */
const getTableFooter = colSpan => [{
  colSpan: colSpan,
  content: 'Powered by the News API (https://newsapi.org).\n'.green +
      'Follow '.green + '@omgimanerd '.blue +
      'on Twitter and GitHub.\n'.green +
      'Open source contributions are welcome!\n'.green +
      'https://github.com/omgimanerd/getnews.tech'.underline.blue,
  hAlign: 'center'
}]

/**
 * This method takes a string of text and separates it into lines of text
 * all of which are shorter than a given maximum line length.
 * @param {string} text The text to format.
 * @param {number} maxLineLength The maximum length of each line.
 * @return {string}
 */
const formatTextWrap = (text, maxLineLength) => {
  const words = String(text).trim().replace(/[\s]+/g, ' ').split(' ')
  let lineLength = 0
  return words.reduce((result, word) => {
    if (lineLength + word.length >= maxLineLength) {
      lineLength = word.length
      return `${result}\n${word}`
    }
    lineLength += word.length + (result ? 1 : 0)
    return result ? `${result} ${word}` : `${word}`
  }, '')
}

/**
 * Formats a moment object into a string. Helper method for formatArticles().
 * @param {Object} date The moment object to format.
 * @return {string}
 */
const formatDate = date => {
  if (date && date.isValid()) {
    const day = date.format('MMM Do, YYYY')
    const time = date.format('h:mma z')
    return `Published on ${day} at ${time}`.trim()
  }
  return 'Publication date not available'
}

/**
 * This method formats and returns miscellaneous messages.
 * @param {boolean} message The message to display
 * @return {string}
 */
const formatMessage = message => {
  const table = new Table()
  table.push([{
    content: message,
    hAlign: 'center'
  }])
  table.push(getTableFooter(1))
  return `${table.toString()}\n`
}

/**
 * This function takes the array of article results returned from the News API
 * and formats it into a table for display in your terminal.
 * It assumes that the data has the fields outlined in the documentation
 * on the News API developer documentation, and that the url to the article
 * has also been shortened.
 * @param {Array<Object>} articles A list of articles returned by a query to
 *   the News API.
 * @param {string} timezone The timezone of the requesting IP address
 * @return {string}
 */
const formatArticles = (articles, timezone) => {
  const table = new Table({
    head: ['Articles'.bold],
    // Subtract 2 to account for table border
    colWidths: [DEFAULT_DISPLAY_WIDTH - 2]
  })
  articles.forEach(article => {
    /**
     * We subtract 4 when calculating the space formatting for the text to
     * account for the table border and padding.
     */
    const title = formatTextWrap(
      `${article.source.name} - ${article.title}`,
      DEFAULT_DISPLAY_WIDTH - 4).bold.cyan
    const date = formatDate(moment(article.publishedAt).tz(timezone)).cyan
    const description = formatTextWrap(
      article.description || 'No description available.',
      DEFAULT_DISPLAY_WIDTH - 4)
    const url = String(article.url).underline.green
    table.push([`${title}\n${date}\n${description}\n${url}`])
  })
  if (articles.length === 0) {
    table.push(['No articles found on this topic.'])
  }
  table.push(getTableFooter(1))
  return `${table.toString()}\n`
}

const formatHelp = () => {
  const table = new Table({
    head: ['Help'.bold],
    // Subtract 2 to account for table border
    colWidths: [DEFAULT_DISPLAY_WIDTH - 2],
  })
  const coloredQuery = `${'country'.blue}.getnews.tech/${'query'.green}`
  const usage = `\nUsage: curl ${coloredQuery},arg=value,arg=value\n\n`
  const countryString = parser.VALID_COUNTRIES.join(', ').blue
  const countries = formatTextWrap(`Valid countries: ${countryString}`,
                                   DEFAULT_DISPLAY_WIDTH - 4)
  table.push([usage + countries])
  table.push(getTableFooter(1))
  return `${table.toString()}\n`  
}

module.exports = exports = {
  formatMessage,
  formatArticles,
  formatHelp
}
