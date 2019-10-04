# getnews.tech
Powered by the [News API](https://newsapi.org/)
```
omgimanerd:~$ curl getnews.tech/trump
┌────────────────────────────────────────────────────────────────────────┐
│ Articles                                                               │
├────────────────────────────────────────────────────────────────────────┤
│ Huawei, Saudi Arabia, India: Your Thursday Briefing                    │
│ Published on Feb 20th, 2019 at 2:41pm EST                              │
│ President Trump boarding Air Force One last week.                      │
│ http://getnews.tech/s/7TYAJvAH                                         │
├────────────────────────────────────────────────────────────────────────┤
│ Trump Organization shelves plans for two new US hotel chains           │
│ Published on Feb 14th, 2019 at 7:07pm EST                              │
│ The Trump Organization will not move forward with ambitious            │
│ expansion plans for two hotel chains across the US, citing a toxic     │
│ political climate for the Trump brand.                                 │
│ http://getnews.tech/s/DGVGiZTO                                         │
├────────────────────────────────────────────────────────────────────────┤
│ Trump Loves a Culture War                                              │
│ Published on Feb 6th, 2019 at 2:36pm EST                               │
│ The president lied about abortion in the State of the Union.           │
│ http://getnews.tech/s/UrIzR005                                         │
├────────────────────────────────────────────────────────────────────────┤
│ Trump Versus the Socialist Menace                                      │
│ Published on Feb 7th, 2019 at 7:05pm EST                               │
│ President Trump giving his State of the Union address on Tuesday.      │
│ http://getnews.tech/s/_1CQRCZd                                         │
├────────────────────────────────────────────────────────────────────────┤
│ Trump-Kim Meeting, Brexit, Pulwama: Your Wednesday Briefing            │
│ Published on Feb 26th, 2019 at 2:16pm EST                              │
│ President Trump arriving in Hanoi, Vietnam.                            │
│ http://getnews.tech/s/g1YFW5W5                                         │
├────────────────────────────────────────────────────────────────────────┤
│             Powered by the News API (https://newsapi.org).             │
│               Follow @omgimanerd on Twitter and GitHub.                │
│                 Open source contributions are welcome!                 │
│               https://github.com/omgimanerd/getnews.tech               │
└────────────────────────────────────────────────────────────────────────┘
```
This is a web server that formats the news (primarily US based) from various
sources on the web for display in the terminal. A link to each article is
included if you want to read the full article.

## Usage
You can fetch the latest news simply by typing  
```bash
curl getnews.tech
curl us.getnews.tech/trump
curl fr.getnews.tech/world+cup
curl gr.getnews.tech/category=business
```
For additional options:
```bash
curl getnews.tech/:help
```

## Contributing
Fork this repository and send me a pull request with any suggestions and
changes. Use [ESLint](https://http://eslint.org/) to format your JavaScript
using the provided `.eslintrc.js` file.

You will need to acquire an API Key from the [News API](https://newsapi.org/).
Add them to your .bashrc or other environment variable configuration:
```bash
export NEWS_API_KEY=YOUR_KEY_HERE
```

Install the project dependencies:
```
npm install
```

Run the server:
```
node server.js
```

## License
[Apache 2](https://github.com/omgimanerd/getnews.tech/blob/master/LICENSE)
