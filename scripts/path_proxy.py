#!/usr/bin/env python3
import requests
import flask
import json

API_URL = 'https://www.panynj.gov/bin/portauthority/ridepath.json'

app = flask.Flask(__name__)

@app.route('/')
def index():
    upstream_resp = requests.get(API_URL)
    data = json.dumps(json.loads(upstream_resp.text))
    resp = flask.Response(data, mimetype='text/json')
    resp.headers['Access-Control-Allow-Origin'] = '*'
    return resp

if __name__ == '__main__':
    app.run(host='0.0.0.0')
