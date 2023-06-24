# Transit Panel app
[![CI](https://github.com/kerrickstaley/transit-panel/actions/workflows/npm-test.yaml/badge.svg)](https://github.com/kerrickstaley/transit-panel/actions/workflows/npm-test.yaml)

This web app displays nearby transit options, along with how soon you need to leave in order to catch the next train/bus/ferry/etc. You can run it on a tablet mounted on your wall so that you can always leave on time. [Here's a blog post](https://www.kerrickstaley.com/2022/02/25/transit-panel) about how I have it set up at my apartment.

[You can view the app live here.](https://www.kerrickstaley.com/transit-panel/?config=https://gist.githubusercontent.com/kerrickstaley/515920f7d552bc8027dc57eed4ec76b8/raw/8b8551887d9e6098511b22612af508f6a3c5240a/transit_panel_config.yaml)

The app currently supports these transit systems:
- [PATH](https://www.panynj.gov/path/en/index.html) (full support, including real-time departures)
- [NY Waterway](https://www.nywaterway.com/) (partial support, schedule-only)
- [NJ Transit](https://www.njtransit.com/) (very limited support, schedule-only)

## Setup
To create your own config, copy [my example config](https://gist.github.com/kerrickstaley/515920f7d552bc8027dc57eed4ec76b8) and modify appropriately. Host it on Gist (or anywhere you want, but keep in mind that [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) may prevent the Transit Panel app from accessing your config). Then load the page
```
https://www.kerrickstaley.com/transit-panel/?config=<your config url>
```
If using Gist, make sure to click the "Raw" link to get the raw URL.

In order to transfer the URL to a tablet, you may want to use a QR code generator like [this one](https://www.qr-code-generator.com/).
