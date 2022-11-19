#!/usr/bin/env python3
import datetime
from dateutil import parser
import requests

MRAZZA_URL = 'http://localhost:51051/v1/stations/hoboken/realtime'
OFFICIAL_URL = 'https://www.panynj.gov/bin/portauthority/ridepath.json'

def get_departures_mrazza():
    # For some reason like 1/2 the requests I send locally to the API hang :(
    while True:
        try:
            j = requests.get(MRAZZA_URL, timeout=0.5).json()
            break
        except requests.exceptions.ReadTimeout:
            pass

    ret = []
    for train in j['upcomingTrains']:
        arrival = parser.parse(train['projectedArrival'])
        now = datetime.datetime.now(datetime.timezone.utc)  # :(
        delta = arrival - now
        ret.append((train['headsign'], round(delta.seconds / 60, 2)))

    return sorted(ret)


def get_departures_official():
    j = requests.get(OFFICIAL_URL).json()
    for result in j['results']:
        if result['consideredStation'] == 'HOB':
            hob = result
            break
    else:
        raise Exception('Did not find Hoboken')

    ret = []
    for dest in hob['destinations']:
        for msg in dest['messages']:
            print(msg['lastUpdated'])
            ret.append((msg['headSign'], round(int(msg['secondsToArrival']) / 60, 2)))
    return sorted(ret)

print('mrazza:')
print(get_departures_mrazza())
print('official:')
print(get_departures_official())
