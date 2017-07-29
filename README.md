# getnews.tech

This is a web server that formats the latest news from various sources on
the web. A link to each article is included if the user wants to read the full
article.

## Example output
```
sigma:~$ curl getnews.tech/ars-technica?n=3
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│   To find a list of sources to query, use: curl getnews.tech/help    │
│                                                                      │
├───┬──────────────────────────────────────────────────────────────────┤
│ # │ Article                                                          │
├───┼──────────────────────────────────────────────────────────────────┤
│ 0 │ 34 criminal cases tossed after body cam footage shows cop        │
│   │ planting drugs                                                   │
│   │ “It is incumbent upon us as prosecutors to be the ministers      │
│   │ of justice.”                                                     │
│   │ https://goo.gl/YEd8Ba                                            │
├───┼──────────────────────────────────────────────────────────────────┤
│ 1 │ Apollo 13 escape room at Houston Escape Hunt is absolutely       │
│   │ delightful                                                       │
│   │ And while we didn’t quite all survive, the joy was indeed in     │
│   │ the journey.                                                     │
│   │ https://goo.gl/asfTGc                                            │
├───┼──────────────────────────────────────────────────────────────────┤
│ 2 │ Broadcom chip bug opened 1 billion phones to a Wi-Fi-hopping     │
│   │ worm attack                                                      │
│   │ Wi-Fi chips used in iPhones and Android may revive worm          │
│   │ attacks of old.                                                  │
│   │ https://goo.gl/1JjFf7                                            │
├───┴──────────────────────────────────────────────────────────────────┤
│              Follow @omgimanerd on Twitter and GitHub.               │
│                Open source contributions are welcome!                │
│                 https://github.com/omgimanerd/nycurl                 │
└──────────────────────────────────────────────────────────────────────┘
```

## Usage
You can fetch the latest news simply by typing  
```bash
curl getnews.tech/espn
curl getnews.tech/daily-mail
curl getnews.tech/cnn
```

Get a list of acceptable sources to query using:
```bash
curl getnews.tech/sources
```

By default, getnews.tech will format the table to be a max of 72 characters
wide. If you would like to specify a custom width for your terminal, you do so
using:
```bash
curl getnews.tech/daily-mail?w=92
```
You can also limit the number of articles to display.
```bash
curl getnews.tech/cnbc?n=10
curl getnews.tech/buzzfeed?n=12\&w=95
```
Note that when combining the parameters on the command line as query parameters,
you must use `\&` to escape the ampersand character.

To see a full list of options, query:
```
curl getnews.tech/help
```

## Contributing
Fork this repository and send me a pull request with any suggestions and
changes. Use [StandardJS](https://standardjs.com/) to format your JavaScript.

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
yarn install # or npm install
```

Run the server:
```
node server.js
```

## License
[Apache 2](https://github.com/omgimanerd/getnews.tech/blob/master/LICENSE)
