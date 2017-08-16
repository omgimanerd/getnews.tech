# getnews.tech

This is a web server that formats the latest news from various sources on
the web. A link to each article is included if the user wants to read the full
article.

## Example output
```
omgimanerd:~$ curl getnews.tech/ars-technica?n=4
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│  To find a list of sources to query, use: curl getnews.tech/sources  │
│                                                                      │
├───┬──────────────────────────────────────────────────────────────────┤
│ # │ Article                                                          │
├───┼──────────────────────────────────────────────────────────────────┤
│ 0 │ Deadly drug-resistant fungus sparks outbreaks in UK—and it’s     │
│   │ stalking US                                                      │
│   │ Published on Aug 16th, 2017 at 9:15am PDT                        │
│   │ It’s unusually good at lurking in hospitals, resisting drugs,    │
│   │ and killing vulnerable patients.                                 │
│   │ https://goo.gl/zZJZZ5                                            │
├───┼──────────────────────────────────────────────────────────────────┤
│ 1 │ Lawyers clash over an imaged hard drive as Waymo v. Uber         │
│   │ hurtles toward trial                                             │
│   │ Published on Aug 16th, 2017 at 10:36am PDT                       │
│   │ "He was ordered to come clean and did not come clean."           │
│   │ https://goo.gl/iJprfP                                            │
├───┼──────────────────────────────────────────────────────────────────┤
│ 2 │ Ukraine malware author turns witness in Russian DNC hacking      │
│   │ investigation                                                    │
│   │ Published on Aug 16th, 2017 at 11:56am PDT                       │
│   │ “Profexor” turns self in to Ukrainian authorities, assists FBI   │
│   │ in DNC hack investigation.                                       │
│   │ https://goo.gl/1M1YzM                                            │
├───┼──────────────────────────────────────────────────────────────────┤
│ 3 │ Bank-fraud malware not detected by any AV hosted in Chrome Web   │
│   │ Store. Twice                                                     │
│   │ Published on Aug 16th, 2017 at 12:04pm PDT                       │
│   │ Extension that surreptitiously steals bank passwords uploaded    │
│   │ twice in 17 days.                                                │
│   │ https://goo.gl/KmQt4X                                            │
├───┴──────────────────────────────────────────────────────────────────┤
│                       Powered by the News API.                       │
│              Follow @omgimanerd on Twitter and GitHub.               │
│                Open source contributions are welcome!                │
│              https://github.com/omgimanerd/getnews.tech              │
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
changes. Use [ESLint](https://http://eslint.org/) to format your JavaScript
using the `.eslintrc.js` file included in the repository.

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
