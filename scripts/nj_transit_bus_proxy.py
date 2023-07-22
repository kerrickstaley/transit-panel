#!/usr/bin/env python3
import argparse
import flask
import functools
import sys
import selenium.webdriver
import threading
import logging

argparser = argparse.ArgumentParser()
argparser.add_argument('--port', type=int, default=20390)

app = flask.Flask(__name__)

def log(s):
    print(s, file=sys.stderr)

class NjTransitBusApiGetter:
    API_URL = 'https://mybusnow.njtransit.com/bustime/eta/getStopPredictionsETA.jsp?stop={stop}'

    def __init__(self):
        if sys.platform == 'linux':
            log('Creating virtual display...')
            # https://stackoverflow.com/a/71497165/785404
            from pyvirtualdisplay import Display
            self.display = Display(visible=0, size=(800, 600))
            self.display.start()
            log('Done creating virtual display')
        
        log('Starting Chrome...')
        self.driver = selenium.webdriver.Chrome()
        log('Done starting Chrome')

        self.lock = threading.Lock()
    
    def get(self, stop: int):
        url = self.API_URL.format(stop=stop)

        with self.lock:
            self.driver.get(url)

            return self.driver.find_element(
                by=selenium.webdriver.common.by.By.ID,
                value="webkit-xml-viewer-source-xml").get_attribute('innerHTML')


@functools.lru_cache
def api_getter():
    return NjTransitBusApiGetter()

@app.route('/')
def index():
    stop = flask.request.args.get('stop')

    try:
        stop = int(stop)
    except (TypeError, ValueError):
        return 'invalid stop', 400

    data = api_getter().get(stop)
    resp = flask.Response(data, mimetype='text/xml')
    resp.headers['Access-Control-Allow-Origin'] = '*'
    return resp

if __name__ == '__main__':
    args = argparser.parse_args()
    app.run(host='0.0.0.0', port=args.port)
