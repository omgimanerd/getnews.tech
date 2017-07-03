/**
 * @fileoverview This is a class of static methods which will format the
 * data fetched from the News API into a nice looking table.
 * @author alvin.lin.dev@gmail.com (Alvin Lin)
 */

const colors = require('colors');
const Table = require('cli-table2');

/**
 * Enpty constructor for a DataFormatter class.
 * @constructor
 */
function DataFormatter() {
  throw new Error('DataFormatter should not be instantiated!');
}

/**
 * @const
 * @type {number}
 */
DataFormatter.DEFAULT_DISPLAY_WIDTH = 72;

/**
 * @const
 * @type {number}
 */
DataFormatter.WIDTH_WARNING_THRESHOLD = 70;

/**
 * @const
 * @type {string}
 */
DataFormatter.HELP = '\nTo find a list of sources to query, use: ' +
    'curl getnews.tech/help\n';

/**
 * @const
 * @type {string}
 */
DataFormatter.SOCIAL_MEDIA_TEXT = 'Follow '.green + '@omgimanerd '.blue +
    'on Twitter and GitHub.\n'.green;

/**
 * @const
 * @type {string}
 */
DataFormatter.GITHUB_TEXT = 'Open source contributions are welcome!\n'.green;

/**
 * @const
 * @type {string}
 */
DataFormatter.GITHUB_LINK = 'https://github.com/omgimanerd/getnews.tech'.blue;

/**
 * @const
 * @type {string}
 */
DataFormatter.WARNING = 'Warning: Using too small of a width will cause ' +
    'unpredictable behavior!\n';

/**
 * This method takes a string of text and separates it into lines of text
 * all of which are shorter than a given maximum line length.
 * @param {string} text The text to format.
 * @param {number} maxLineLength The maximum length of each line.
 * @return {string}
 */
DataFormatter.formatTextWrap = function(text, maxLineLength) {
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

DataFormatter.formatHelp = function() {

}

DataFormatter.formatSources = function(sources, options) {
  var maxWidth = parseInt(options['w'] || options['width']);
  if (isNaN(maxWidth) || maxWidth <= 0) {
    maxWidth = DataFormatter.DEFAULT_DISPLAY_WIDTH;
  }

  /**
   * We first calculate the maximum width for the column containing the
   * source IDs, adding two to account for cell padding.
   */
  var maxIdWidth = Math.max.apply(null, sources.map((source) =>
      source.id.length).concat('Source'.length)) + 2;
  /**
   * The remaining space is then allocated to the description, subtracting
   * 3 to account for the table borders.
   */
  var descriptionWidth = maxWidth - maxIdWidth - 3;
  var table = new Table({
    colWidths: [maxIdWidth, descriptionWidth]
  });
  if (options.warning) {
    // TODO: warning message
  }
  table.push(
    [{
      content: 'Source'.bold.red,
      hAlign: 'center'
    }, {
      content: 'Description'.red.bold,
      hAlign: 'center'
    }]
  );
  for (var source of sources) {
    var id = source.id.green;
    /**
    * We subtract 2 when calculating the space formatting for the text to
    * account for the padding at the edges of the table.
    */
    var name = DataFormatter.formatTextWrap(
        source.name, descriptionWidth - 2).bold.cyan;
    var description = DataFormatter.formatTextWrap(
        source.description, descriptionWidth - 2);
    var url = new String(source.url).underline.green;
    table.push([
      new String(source.id).green,
      [name, description, url].join('\n')
    ]);
  }
  if (maxWidth < DataFormatter.WIDTH_WARNING_THRESHOLD) {
    table.push([{
      colSpan: 2,
      content: DataFormatter.formatTextWrap(
          DataFormatter.WARNING, maxWidth).red,
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
 * has also been shortened by ApiAccessor.
 * https://newsapi.org/#documentation
 * @param {Array<Object>} data The list of results returned by a query to the
 *   News API.
 * @param {?Object=} options A dictionary containing configuration options.
 *   Valid keys are:
 *   - w (width, defaults to DEFAULT_DISPLAY_WIDTH)
 *   - width (width, defaults to DEFAULT_DISPLAY_WIDTH)
 * @return {string}
 */
DataFormatter.formatArticles = function(data, options) {
  var maxWidth = parseInt(options['w'] || options['width']);
  if (isNaN(maxWidth) || maxWidth <= 0) {
    maxWidth = DataFormatter.DEFAULT_DISPLAY_WIDTH;
  }
  var index = parseInt(options['i'] || options['index']);
  if (isNaN(index) || index < 0) {
    index = 0;
  }
  var number = parseInt(options['n'] || options['number']);
  if (isNaN(number) || number <= 0) {
    number = Number.MAX_SAFE_INTEGER;
  }

  var articles = data.sort(function(a, b) {
    return a.title.localeCompare(b.section);
  }).slice(index, index + number);
  var table = new Table();
  table.push(
    [{
      hAlign: 'center',
      content: 'Articles'.bold.red
    }],
    [{
      hAlign: 'center',
      content: DataFormatter.formatTextWrap(DataFormatter.HELP, maxWidth).red
    }]
  );
  for (var article of articles) {
    /**
     * We subtract 4 when calculating the space formatting for the text to
     * account for the table border and padding.
     */
    var title = DataFormatter.formatTextWrap(
        article.title, maxWidth - 4).bold.underline.cyan;
    var description = DataFormatter.formatTextWrap(
        article.description, maxWidth - 4);
    var url = new String(article.url).underline.green;
    table.push([
      [title, description, url].join('\n')
    ]);
  }
  table.push([{
    hAlign: 'center',
    content: DataFormatter.SOCIAL_MEDIA_TEXT +
        DataFormatter.GITHUB_TEXT +
        DataFormatter.GITHUB_LINK
  }]);
  if (maxWidth < DataFormatter.WIDTH_WARNING_THRESHOLD) {
    table.push([{
      colSpan: 2,
      content: DataFormatter.formatTextWrap(
          DataFormatter.WARNING, maxWidth).red,
      hAlign: 'center'
    }]);
  }
  return table.toString() + '\n';
};

/**
 * This line is needed on the server side since this is loaded as a module
 * into the node server.
 */
module.exports = DataFormatter;
