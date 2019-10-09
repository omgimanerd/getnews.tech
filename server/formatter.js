/**
 * @fileoverview This file contains methods which will format the
 * data fetched from the News API into nice looking tables for
 * output in terminal.
 * @author alvin.lin.dev@gmail.com (Alvin Lin)
 */

// eslint-disable-next-line no-unused-vars
const colors = require('colors')
const moment = require('moment-timezone')
const Table = require('cli-table3')

const errors = require('./errors')
const parser = require('./parser')

const RecoverableError = errors.RecoverableError

/**
 * The default number of characters for formatting the table width.
 * @const
 * @type {number}
 */
const DEFAULT_DISPLAY_WIDTH = 80

/**
 * This method takes a string of text and separates it into lines of text
 * all of which are shorter than a given maximum line length. This will
 * strip all whitespace from the text, including indents, to respace the
 * text.
 * @param {string} text The text to format.
 * @param {number} maxLineLength The maximum length of each line. Defaults to
 *   DEFAULT_DISPLAY_WIDTH - 4
 * @return {string}
 */
const formatTextWrap = (text, maxLineLength) => {
  /**
   * We subtract 4 when calculating the space formatting for the text to
   * account for the table border and padding. This assumes a single column
   * table where the text runs edge to edge.
   */
  if (!maxLineLength) {
    // eslint-disable-next-line no-param-reassign
    maxLineLength = DEFAULT_DISPLAY_WIDTH - 4
  }
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
 * @param {string} timezone The timezone to format the date in
 * @return {string}
 */
const formatDate = (date, timezone) => {
  let m = moment(date)
  if (timezone) {
    m = m.tz(timezone)
  }
  if (m.isValid()) {
    const day = m.format('MMM Do, YYYY')
    const time = m.format('h:mma z')
    return `Published on ${day} at ${time}`.trim()
  }
  return 'Publication date not available'
}

/**
 * Internal helper function to format content into a table for display.
 * @param {string} head The header string, if one is needed
 * @param {Function} fn A callback to invoke on the table to add content
 * @return {string}
 */
const formatTable = (head, fn) => {
  const table = new Table({
    head: head ? [head] : null,
    // Subtract 2 to account for table border
    colWidths: [DEFAULT_DISPLAY_WIDTH - 2]
  })
  fn(table)
  table.push([{
    content: 'Powered by the News API (https://newsapi.org).\n'.green +
      'Follow '.green + '@omgimanerd '.blue +
      'on Twitter and GitHub.\n'.green +
      'Open source contributions are welcome!\n'.green +
      'https://github.com/omgimanerd/getnews.tech'.underline.blue,
    hAlign: 'center'
  }])
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
  return formatTable('Articles'.bold, table => {
    articles.forEach(article => {
      const title = formatTextWrap(
        `${article.source.name} - ${article.title}`).bold.cyan
      const date = formatDate(article.publishedAt, timezone).cyan
      const description = formatTextWrap(
        article.description || 'No description available.')
      const url = String(article.url).underline.green
      table.push([`${title}\n${date}\n${description}\n${url}`])
    })
    if (articles.length === 0) {
      table.push(['No articles found on this topic.'])
    }
  })
}

/**
 * Formats a help prompt for output.
 * @return {string}
 */
const formatHelp = () => {
  return formatTable('Help'.bold, table => {
    table.push([[
      '',
      // Query syntax
      `Usage: curl ${'[country]'.cyan}.getnews.tech/` +
        `${'[query,]'.green}${'arg'.yellow}=value,${'arg'.yellow}=value`,
      '\n',
      // Valid countries
      formatTextWrap(
        `Valid countries: ${parser.VALID_COUNTRIES.join(', ').cyan}`),
      '\n',
      // Valid arguments
      'Valid arguments:',
      `    ${'n'.yellow}: number of results per page`,
      `    ${'page'.yellow}: page number to fetch`,
      `    ${'category'.yellow}: news category to fetch`,
      '\n',
      // Valid categories to query
      formatTextWrap(
        `Valid categories: ${parser.VALID_CATEGORIES.join(', ')}`),
      '\n',
      // Example queries
      'Example queries:',
      '    curl getnews.tech/trump',
      '    curl getnews.tech/mass+shooting,n=20',
      '    curl at.getnews.tech/category=business',
      '    curl us.getnews.tech/category=general,page=2',
      '',
      '    firefox getnews.tech/s/t8wAWZW0',
      ''
    ].join('\n')])
  })
}

/**
 * Formats an error for display.
 * @param {Error} error The error to display to the user
 * @return {string}
 */
const formatError = error => {
  let message = ''
  if (error instanceof RecoverableError) {
    message = error.message
  } else if (String(error.name).startsWith('NewsAPIError')) {
    message = formatTextWrap(error.message)
  } else {
    message = 'An error occurred on our end. Please try again later.'
  }
  const help = 'curl getnews.tech/:help'
  return formatTable(null, table => {
    table.push([{
      content: `\n${message}\n\n${help.red}\n`,
      hAlign: 'center'
    }])
  })
}

module.exports = exports = {
  formatTextWrap,
  formatDate,
  formatArticles,
  formatHelp,
  formatError
}
