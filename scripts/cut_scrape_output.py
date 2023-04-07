#!/usr/bin/env python3
import argparse
import dateutil.parser
import datetime as dt
import csv
import sys

argparser = argparse.ArgumentParser(description="snip out relevant segment of api_compare.py log file")
argparser.add_argument('--station')
argparser.add_argument('--head-sign')
argparser.add_argument('--scheduled-departure', type=dateutil.parser.parse, help='example: 2023-04-02T14:37:00-04:00')
argparser.add_argument('--door-close', type=dateutil.parser.parse, help='example: 2023-04-02T14:37:00-04:00')
argparser.add_argument('--look-behind-min', type=int, default=1)
argparser.add_argument('--look-ahead-min', type=int, default=12)
argparser.add_argument('in_file')


def main(args):
    additional_fields = ['door_close', 'scheduled_departure']
    reader = csv.DictReader(open(args.in_file))
    out_rows = []
    for row in reader:
        if row['station'].lower() != args.station.lower():
            continue

        if row['head_sign'].lower() != args.head_sign.lower():
            continue

        projected_arrival = dateutil.parser.parse(row['projected_arrival'])
        if projected_arrival < args.scheduled_departure - dt.timedelta(minutes=args.look_behind_min):
            continue

        if projected_arrival > args.scheduled_departure + dt.timedelta(minutes=args.look_ahead_min):
            continue

        row['door_close'] = args.door_close.isoformat()
        row['scheduled_departure'] = args.scheduled_departure.isoformat()
        out_rows.append(row)

    writer = csv.DictWriter(sys.stdout, reader.fieldnames + additional_fields)
    writer.writeheader()
    for row in out_rows:
        writer.writerow(row)


if __name__ == '__main__' and not hasattr(sys, 'ps1'):
    main(argparser.parse_args())
