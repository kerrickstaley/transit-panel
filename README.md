# Transit Panel app
[![CI](https://github.com/kerrickstaley/transit-panel/actions/workflows/npm-test.yaml/badge.svg)](https://github.com/kerrickstaley/transit-panel/actions/workflows/npm-test.yaml)

This web app displays nearby transit options, along with how soon you need to leave in order to catch the next train/bus/ferry/etc. You can run it on a tablet mounted on your wall so that you can always leave on time. [Here's a blog post](https://www.kerrickstaley.com/2022/02/25/transit-panel) about how I have it set up at my apartment.

[You can view the app live here.](https://www.kerrickstaley.com/transit-panel/?config=https://gist.githubusercontent.com/kerrickstaley/515920f7d552bc8027dc57eed4ec76b8/raw)

The app currently supports these transit systems:
- [PATH](https://www.panynj.gov/path/en/index.html) (full support, including real-time departures)
- [NY Waterway](https://www.nywaterway.com/) (full support, schedule-only since there is no real-time data)
- [NJ Transit](https://www.njtransit.com/) (very limited support, schedule-only)
- [CitiBike](https://citibikenyc.com/) (real-time bike availability)

## Setup
To create your own config, copy [my example config](https://gist.github.com/kerrickstaley/515920f7d552bc8027dc57eed4ec76b8) and modify appropriately. Host it on Gist (or anywhere you want, but keep in mind that [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) may prevent the Transit Panel app from accessing your config). Then load the page
```
https://www.kerrickstaley.com/transit-panel/?config=<your config url>
```
If using Gist, make sure to click the "Raw" link to get the raw URL, and use [this URL format](https://stackoverflow.com/a/37997658/785404) if you want to get a raw link that stays up-to-date when you update the Gist.

In order to transfer the URL to a tablet, you may want to use a QR code generator like [this one](https://www.qr-code-generator.com/).

## NYC MTA Setup
### API Key
To use this app for the NYC MTA, you need an API key.

You can get your own key by following these steps:
1. Visit https://api.mta.info/
2. Sign up
3. Click "Access Key" at the top

Then, you can add a `secrets` section to your config:
```
secrets:
  nycMtaApiKey: "<put your key here>"
```

You can also pass an `&secrets=` URL parameter (which works similarly to the `&config=` param) if you don't want to put your API key directly in your config.

Don't share your MTA API key with anyone; the MTA likes to keep track of which account is making which requests. If you want to share your config for others to look at, you need to put your secrets in a separate file (see previous paragraph).

### stopId
You need to figure out which stopId corresponds to your local stop. You can get this from the first column of [this CSV](https://data.ny.gov/resource/39hk-dx4f.csv). You should append a "N", "S", "E", or "W" depending on which direction you're going. For example R17 is the stopId for the Herald Sq station serving the NQRW lines. If you want to take the train south from there, the stopId would be `R17S`. Note that Herald Sq also has the stopIds `D17N` and `D17S` which are relevant if you're taking one of the BDFM trains.
