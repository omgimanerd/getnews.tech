/**
 * @fileoverview This is a class of static methods which will format the
 * data fetched from the News API into a nice looking table.
 * @author alvin.lin.dev@gmail.com (Alvin Lin)
 */

const colors = require('colors');
const Table = require('cli-table2');

/**
 * The default number of characters for formatting the table width.
 * @type {number}
 */
const DEFAULT_DISPLAY_WIDTH = 72;

/**
 * If the user specifies a width less than this, a warning will be displayed.
 * @type {number}
 */
const WIDTH_WARNING_THRESHOLD = 70;

/**
 * Default help text.
 * @type {string}
 */
const HELP = '\nTo find a list of sources to query, use: curl ' +
    'getnews.tech/help\n';

/**
 * Default warning text.
 * @type {string}
 */
const WARNING = 'Warning: Using too small of a width will cause ' +
    'unpredictable behavior!\n';

/**
 * The error to show when a user queries an invalid source.
 * @type {string}
 */
const INVALID_SOURCE = '\nYou queried an invalid source!\n';

/**
 * This method returns the table footer that is appended to every output
 * Table.
 * @return {Array<Object>}
 */
const getTableFooter = colSpan => {
  return [{
    colSpan: colSpan,
    content: 'Follow '.green + '@omgimanerd '.blue +
        'on Twitter and GitHub.\n'.green +
        'Open source contributions are welcome!\n'.green +
        'https://github.com/omgimanerd/nycurl'.underline.blue,
    hAlign: 'center'
  }];
};

/**
 * This method takes a string of text and separates it into lines of text
 * all of which are shorter than a given maximum line length.
 * @param {string} text The text to format.
 * @param {number} maxLineLength The maximum length of each line.
 * @return {string}
 */
const formatTextWrap = (text, maxLineLength) => {
  var words = text.replace(/[\r\n]+/g, ' ').split(' ');
  var lineLength = 0;
  var output = '';
  for (word of words) {
    if (lineLength + word.length >= maxLineLength) {
      output += `\n${word} `;
      lineLength = word.length + 1;
    } else {
      output += `${word} `;
      lineLength += word.length + 1;
    }
  }
  return output;
};

/**
 * This method formats and returns the help text.
 * @param {boolean} invalidSource Whether or not the invalid source warning.
 * @return {string}
 */
const formatHelp = (invalidSource) => {
  var table = new Table({ colWidth: [10, 60] });
  if (invalidSource) {
    table.push([{
      colSpan: 2,
      content: INVALID_SOURCE.bold.red,
      hAlign: 'center'
    }]);
  }
  table.push([{
    content: 'Route'.red.bold,
    hAlign: 'center'
  }, {
    content: 'Description'.red.bold,
    hAlign: 'center'
  }]);
  var routes = ['help', 'sources', '<source>'];
  var descriptions = {
    help: [
      'Show this help page. No options available.\n',
      'Example Usage:'.red.bold,
      'curl getnews.tech/help'.cyan
    ],
    sources: [
      'Show the available sources to query. Options:\n',
      'Set source category:',
      'category='.blue + '[business, entertainment, gaming, general,'.green,
      'music, politics, science-and-nature, sport, technology]\n'.green,
      'Set source language:',
      'language='.blue + '[en, de, fr]\n'.green,
      'Set source country:',
      'country='.blue + '[au, de, gb, in, it, us]\n'.green,
      'Example Usage:'.red.bold,
      'curl getnews.tech/sources?language=de'.cyan,
      'curl getnews.tech/sources?category=business\\&country=us'.cyan
    ],
    '<source>': [
      'Query for news from the specified source. Options:\n',
      'Set output width:',
      'w='.blue + 'WIDTH\n'.green,
      'Set article #:',
      'i='.blue + 'INDEX\n'.green,
      'Limit number of articles:',
      'n='.blue + 'NUMBER\n'.green,
      'Example Usage:'.red.bold,
      'curl getnews.tech/espn?w=100'.cyan,
      'curl getnews.tech/usa-today?i=5\\&n=10'.cyan
    ]
  };
  for (var route of routes) {
    table.push([
      `/${route}`.cyan.bold, descriptions[route].join('\n')
    ]);
  }
  table.push(getTableFooter(2));
  return table.toString() + '\n';
};

/**
 * This function formats the available sources into a table.
 * @param {Array<Object>} sources The source objects to format.
 * @param {?Object=} options Options for display.
 * @return {string}
 */
const formatSources = (sources, options) => {
  var maxWidth = parseInt(options['w'] || options['width']);
  if (isNaN(maxWidth) || maxWidth <= 0) {
    maxWidth = DEFAULT_DISPLAY_WIDTH;
  }

  /**
   * We first calculate the maximum width for the column containing the
   * source IDs, adding two to account for cell padding.
   */
  const maxIdWidth = Math.max(...sources.map(source =>
      source.id.length).concat('Source'.length)) + 2;
  /**
   * The remaining space is then allocated to the description, subtracting
   * 3 to account for the table borders.
   */
  const descriptionWidth = maxWidth - maxIdWidth - 3;
  var table = new Table({
    colWidths: [maxIdWidth, descriptionWidth]
  });
  table.push([{
    content: 'Source'.bold.red,
    hAlign: 'center'
  }, {
    content: 'Description'.red.bold,
    hAlign: 'center'
  }]);
  for (var source of sources) {
    var id = source.id.green;
    /**
    * We subtract 2 when calculating the space formatting for the text to
    * account for the padding at the edges of the table.
    */
    var name = formatTextWrap(source.name, descriptionWidth - 2).bold.cyan;
    var description = formatTextWrap(source.description, descriptionWidth - 2);
    var url = new String(source.url).underline.green;
    table.push([
      new String(source.id).green,
      [name, description, url].join('\n')
    ]);
  }
  table.push(getTableFooter(2));
  if (maxWidth < WIDTH_WARNING_THRESHOLD) {
    table.push([{
      colSpan: 2,
      content: formatTextWrap(WARNING, maxWidth).red,
      hAlign: 'center'
    }]);
  }
  return table.toString() + '\n';
};

/**
 * This function takes the array of article results returned from the News API
 * and formats it into a table for display in your terminal.
 * It assumes that the data has the fields outlined in the documentation
 * on the News API developer documentation, and that the url to the article
 * has also been shortened.
 * https://newsapi.org/#documentation
 * @param {Array<Object>} articles A list of articles returned by a query to
 *   the News API.
 * @param {?Object=} options A dictionary containing configuration options.
 * @return {string}
 */
const formatArticles = (articles, options) => {
  var maxWidth = parseInt(options['w'] || options['width']);
  if (isNaN(maxWidth) || maxWidth <= 0) {
    maxWidth = DEFAULT_DISPLAY_WIDTH;
  }
  var index = parseInt(options['i'] || options['index']);
  if (isNaN(index) || index < 0) {
    index = 0;
  }
  var number = parseInt(options['n'] || options['number']);
  if (isNaN(number) || number <= 0) {
    number = articles.length;
  }

  articles = articles.splice(index, number);
  /**
   * We first calculate how wide the column containing the article numbers
   * will be, adding two to account for the cell padding.
   */
  const maxNumbersWidth = (index + number).toString().length + 2;
  /**
   * The borders of the table take up 3 characters, so we allocate the rest of
   * the space to the articles column.
   */
  const articlesWidth = maxWidth - maxNumbersWidth - 3;
  var table = new Table({ colWidths: [maxNumbersWidth, articlesWidth] });
  table.push([{
    colSpan: 2,
    content: HELP.red,
    hAlign: 'center'
  }], ['#'.red, 'Article'.red]);
  for (var article of articles) {
    /**
     * We subtract 4 when calculating the space formatting for the text to
     * account for the table border and padding.
     */
    const title = formatTextWrap(article.title, articlesWidth - 4).bold.cyan;
    const description = formatTextWrap(article.description, articlesWidth - 4);
    const url = new String(article.url).underline.green;
    table.push([
      (index++).toString().blue,
      [title, description, url].join('\n')
    ]);
  }
  table.push(getTableFooter(2));
  if (maxWidth < WIDTH_WARNING_THRESHOLD) {
    table.push([{
      colSpan: 2,
      content: formatTextWrap(WARNING, maxWidth).red,
      hAlign: 'center'
    }]);
  }
  return table.toString() + '\n';
};

module.exports = exports = { formatHelp, formatSources, formatArticles };
