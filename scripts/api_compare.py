#!/usr/bin/env python3
import datetime
import dateutil.parser
import requests
import typing
import pytz
import argparse
import enum
import sys

MRAZZA_URL_FMT = 'https://path.api.razza.dev/v1/stations/{station}/realtime'
OFFICIAL_URL = 'https://www.panynj.gov/bin/portauthority/ridepath.json'
TZ = pytz.timezone('America/New_York')

parser = argparse.ArgumentParser()
parser.add_argument('--csvfile', help='CSV file to write output to')
parser.add_argument('--stations', help='Comma-separated list of stations to scrape', default='hoboken')


class Station(enum.Enum):
    NEWARK = enum.auto()
    HARRISON = enum.auto()
    JOURNAL_SQUARE = enum.auto()
    GROVE_STREET = enum.auto()
    EXCHANGE_PLACE = enum.auto()
    WORLD_TRADE_CENTER = enum.auto()
    NEWPORT = enum.auto()
    HOBOKEN = enum.auto()
    CHRISTOPHER_STREET = enum.auto()
    NINTH_STREET = enum.auto()
    FOURTEENTH_STREET = enum.auto()
    TWENTY_THIRD_STREET = enum.auto()
    THIRTY_THIRD_STREET = enum.auto()


STATION_OFFICIAL_ABBREV = {
    Station.NEWARK: "NWK",
    Station.HARRISON: "HAR",
    Station.JOURNAL_SQUARE: "JSQ",
    Station.GROVE_STREET: "GRV",
    Station.EXCHANGE_PLACE: "EXP",
    Station.WORLD_TRADE_CENTER: "WTC",
    Station.NEWPORT: "NEW",
    Station.HOBOKEN: "HOB",
    Station.CHRISTOPHER_STREET: "CHR",
    Station.NINTH_STREET: "09S",
    Station.FOURTEENTH_STREET: "14S",
    Station.TWENTY_THIRD_STREET: "23S",
    Station.THIRTY_THIRD_STREET: "33S",
}


class Observation(typing.NamedTuple):
    api: str
    fetch_time: datetime.datetime
    station: Station
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
        return f'{self.head_sign}: {self.min_to_arrival:5.2f}'

    def csv_line(self):
        return ','.join([
            self.api,
            self.fetch_time.isoformat(),
            self.station.name,
            self.head_sign,
            self.projected_arrival.isoformat(),
            self.last_updated.isoformat(),
        ])


def short_repr(obj):
    return '[' + ', '.join([d.short_repr() for d in obj]) + ']'


def get_departures_mrazza(station):
    # For some reason like 1/2 the requests I send locally to the API hang :(
    # Probably not needed for the prod mrazza API?
    while True:
        try:
            j = requests.get(MRAZZA_URL_FMT.format(station=station.name.lower()), timeout=0.5).json()
            break
        except requests.exceptions.ReadTimeout:
            pass

    fetch_time = datetime.datetime.now(TZ)
    ret = []
    for train in j['upcomingTrains']:
        projected_arrival = dateutil.parser.parse(train['projectedArrival'])
        last_updated = dateutil.parser.parse(train['lastUpdated'])
        obs = Observation(
            api='MRAZZA',
            fetch_time=fetch_time,
            station=station,
            head_sign=train['headsign'],
            projected_arrival=projected_arrival.astimezone(TZ),
            last_updated=last_updated.astimezone(TZ),
        )
        ret.append(obs)

    return sorted(ret)


class GetDeparturesOfficial:
    def __call__(self, station):
        if not hasattr(self, 'resp_json'):
            self.fetch_time = datetime.datetime.now(TZ)
            self.resp_json = requests.get(OFFICIAL_URL).json()

        for result in self.resp_json['results']:
            if result['consideredStation'] == STATION_OFFICIAL_ABBREV[station]:
                station_json = result
                break
        else:
            raise Exception('Did not find Hoboken')

        ret = []
        for dest in station_json['destinations']:
            for msg in dest['messages']:
                last_updated = dateutil.parser.parse(msg['lastUpdated'])
                projected_arrival = last_updated + datetime.timedelta(seconds=int(msg['secondsToArrival']))
                obs = Observation(
                    api='OFFICIAL',
                    fetch_time=self.fetch_time,
                    station=station,
                    head_sign=msg['headSign'],
                    projected_arrival=projected_arrival.astimezone(TZ),
                    last_updated=last_updated.astimezone(TZ),
                )
                ret.append(obs)

        return sorted(ret)


def main(args):
    stations = [Station[s.upper()] for s in args.stations.split(',')]

    get_departures_official = GetDeparturesOfficial()

    if args.csvfile is not None:
        csvfile = open(args.csvfile, 'a')

    for station in stations:
        mrazza = get_departures_mrazza(station)
        official = get_departures_official(station)
        print('mrazza:  ', short_repr(mrazza))
        print('official:', short_repr(official))

        if args.csvfile is not None:
            for d in mrazza + official:
                print(d.csv_line(), file=csvfile)


if __name__ == '__main__' and not hasattr(sys, 'ps1'):
    main(parser.parse_args())
