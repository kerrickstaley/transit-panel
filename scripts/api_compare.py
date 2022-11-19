#!/usr/bin/env python3
import datetime
from dateutil import parser
import requests
import typing
import pytz

MRAZZA_URL = 'http://localhost:51051/v1/stations/hoboken/realtime'
OFFICIAL_URL = 'https://www.panynj.gov/bin/portauthority/ridepath.json'
TZ = pytz.timezone('America/New_York')


class Observation(typing.NamedTuple):
    api: str
    fetch_time: datetime.datetime
    station: str
    head_sign: str
    projected_arrival: datetime.datetime
    last_updated: datetime.datetime

    @property
    def sec_to_arrival(self):
        return (self.projected_arrival - self.fetch_time).total_seconds()

    @property
    def min_to_arrival(self):
        return self.sec_to_arrival / 60

    @staticmethod
    def _lt_helper(a, b):
        if a.fetch_time < b.fetch_time:
            return True

        if a.head_sign < b.head_sign:
            return True

        if a.sec_to_arrival < b.sec_to_arrival:
            return True

    def __lt__(self, other):
        if self.fetch_time < other.fetch_time:
            return True
        if self.fetch_time > other.fetch_time:
            return False

        if self.head_sign < other.head_sign:
            return True
        if self.head_sign > other.head_sign:
            return False

        if self.sec_to_arrival < other.sec_to_arrival:
            return True
        if self.sec_to_arrival > other.sec_to_arrival:
            return False

        return typing.NamedTuple.__lt__(self, other)

    def __eq__(self, other):
        return not (self < other or other < self)

    def __gt__(self, other):
        return other < self

    def __le__(self, other):
        return self < other or self == other

    def __ge__(self, other):
        return self > other or self == other

    def __ne__(self, other):
        return not (self == other)

    def short_repr(self):
        return f'{self.head_sign} - {self.min_to_arrival:5.2f}'


def short_repr(obj):
    return '[' + ', '.join([d.short_repr() for d in obj]) + ']'


def get_departures_mrazza():
    # For some reason like 1/2 the requests I send locally to the API hang :(
    while True:
        try:
            j = requests.get(MRAZZA_URL, timeout=0.5).json()
            break
        except requests.exceptions.ReadTimeout:
            pass

    fetch_time = datetime.datetime.now(TZ)
    ret = []
    for train in j['upcomingTrains']:
        projected_arrival = parser.parse(train['projectedArrival'])
        last_updated = parser.parse(train['lastUpdated'])
        obs = Observation(
            api='MRAZZA',
            fetch_time=fetch_time,
            station='HOB',
            head_sign=train['headsign'],
            projected_arrival=projected_arrival.astimezone(TZ),
            last_updated=last_updated.astimezone(TZ),
        )
        ret.append(obs)

    return sorted(ret)


def get_departures_official():
    j = requests.get(OFFICIAL_URL).json()
    for result in j['results']:
        if result['consideredStation'] == 'HOB':
            hob = result
            break
    else:
        raise Exception('Did not find Hoboken')

    fetch_time = datetime.datetime.now(TZ)
    ret = []
    for dest in hob['destinations']:
        for msg in dest['messages']:
            last_updated = parser.parse(msg['lastUpdated'])
            projected_arrival = last_updated + datetime.timedelta(seconds=int(msg['secondsToArrival']))
            obs = Observation(
                api='OFFICAL',
                fetch_time=fetch_time,
                station='HOB',
                head_sign=msg['headSign'],
                projected_arrival=projected_arrival.astimezone(TZ),
                last_updated=last_updated.astimezone(TZ),
            )
            ret.append(obs)

    return sorted(ret)


print('mrazza:   ', end='')
print(', '.join([d.short_repr() for d in get_departures_mrazza()]))
print('official: ', end='')
print(', '.join([d.short_repr() for d in get_departures_official()]))
