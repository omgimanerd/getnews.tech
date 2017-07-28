/**
 * Webpack config file.
 * @author alvin@omgimanerd.tech (Alvin Lin)
 */

const path = require('path');

module.exports = {
  entry: {
    analytics: './client/js/analytics.js'
  },
  output: {
    filename: '[name].bundle.js',
    path: path.join(__dirname, 'dist'),
    publicPath: '/dist/'
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader' }
        ]
      },
      {
        test: /\.scss$/,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader' },
          {
            loader: 'sass-loader',
            options: {
              includePaths: [path.resolve(__dirname, './client/scss')]
            }
          }
        ]
      },
      {
        test: /\.(ttf|woff|woff2|svg|eot)$/,
        use: {
          loader: 'file-loader',
          options: {
            name: '[name].[ext]'
          }
        }
      }
    ]
  },
  devtool: 'cheap-eval-source-map'
}
