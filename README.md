# getnews.tech

This is a web server that formats the latest news from various sources on
the web. A link to each article is included if the user wants to read the full
article.

## Usage
You can fetch the latest news simply by typing  
```bash
curl getnews.tech
```
This application also accepts queries to the various sections of the NY Times.
```bash
curl getnews.tech/technology
curl getnews.tech/politics
```
Get a list of acceptable sections to query using:
```bash
curl getnews.tech/help
```
By default, getnews.tech will format the table to be a max of 72 characters
wide. If you would like to specify a custom width for your terminal, you do so
using:
```bash
curl getnews.tech?w=92
curl getnews.tech/technology?w=100
```
You can also limit the number of articles to display.
```bash
curl getnews.tech?n=10
curl getnews.tech?n=12\&w=95
```
Note that when combining the parameters on the command line as query parameters,
you must use `\&` to escape the ampersand character.

## Contributing
Fork this repository and send me a pull request with any suggestions and
changes. Use two-space indents and camel-cased variables.

You will need to acquire an API Key from the [News API](https://newsapi.org/)
and a URL Shortener API Key from
[Google Developers](https://console.developers.google.com).

Add them to your .bashrc or other environment variable configuration:
```bash
export NEWS_API_KEY=YOUR_KEY_HERE
export URL_SHORTENER_API_KEY=YOUR_KEY_HERE
```

Install the project dependencies:
```
npm install
bower install
```

Run the server in development node:
```
node server.js --dev
```
**IF YOU DON'T USE DEV MODE, YOU WON'T BE ABLE TO GET IT WORKING**

## License
[MIT](https://github.com/omgimanerd/getnews.tech/blob/master/LICENSE)
