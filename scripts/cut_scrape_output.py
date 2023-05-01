#!/usr/bin/env python3
import argparse
import dateutil.parser
import datetime as dt
import csv
import sys
import itertools

argparser = argparse.ArgumentParser(description="snip out relevant segment of api_compare.py log file")
argparser.add_argument('--station')
argparser.add_argument('--head-sign')
argparser.add_argument('--scheduled-departure', type=dateutil.parser.parse, help='example: 2023-04-02T14:37:00-04:00')
argparser.add_argument('--door-close', type=dateutil.parser.parse, help='example: 2023-04-02T14:37:00-04:00')
argparser.add_argument('--look-behind-min', type=int, default=10)
argparser.add_argument('--look-ahead-min', type=int, default=25)
argparser.add_argument('in_file')
argparser.add_argument('out_file', default='-', nargs='?')


def remove_other_departures(rows, scheduled_departure):
    """
    Remove rows corresponding to departures other than the one we're trying to extract.
    """
    target_departure = scheduled_departure
    rows_by_api = {}
    for row in rows:
        rows_by_api.setdefault(row['api'], [])
        rows_by_api[row['api']].append(row)

    keep_rows = set()
    for api in rows_by_api:
        for _, group in itertools.groupby(rows_by_api[api], key=lambda row: row['fetch_time']):
            group = list(group)
            group.sort(key=lambda row: abs((dateutil.parser.parse(row['projected_arrival']) - target_departure).total_seconds()))
            keep_row = group[0]
            # TODO: Can do EWMA
            target_departure = dateutil.parser.parse(keep_row['projected_arrival'])
            keep_rows.add(tuple(keep_row.items()))

    return [row for row in rows if tuple(row.items()) in keep_rows]


def main(args):
    reader = csv.DictReader(open(args.in_file))
    out_rows = []
    # TODO can binary search for start position
    for row in reader:
        if args.station is not None and row['station'].lower() != args.station.lower():
            continue

        if args.head_sign is not None and row['head_sign'].lower() != args.head_sign.lower():
            continue

        projected_arrival = dateutil.parser.parse(row['projected_arrival'])
        if args.scheduled_departure is not None and projected_arrival < args.scheduled_departure - dt.timedelta(minutes=args.look_behind_min):
            continue

        if args.scheduled_departure is not None and projected_arrival > args.scheduled_departure + dt.timedelta(minutes=args.look_ahead_min):
            continue

        if 'door_close' not in row:
            row['door_close'] = args.door_close.isoformat()

        if 'scheduled_departure' not in row:
            row['scheduled_departure'] = args.scheduled_departure.isoformat()

        out_rows.append(row)

    scheduled_departure = args.scheduled_departure
    if scheduled_departure is None:
        scheduled_departure = dateutil.parser.parse(row['scheduled_departure'])

    out_rows = remove_other_departures(out_rows, scheduled_departure)

    out_file = sys.stdout
    if args.out_file != '-':
        out_file = open(args.out_file, 'w')

    out_fields = list(reader.fieldnames)
    if 'door_close' not in out_fields:
        out_fields.append('door_close')
    if 'scheduled_departure' not in out_fields:
        out_fields.append('scheduled_departure')

    writer = csv.DictWriter(out_file, out_fields, lineterminator='\n')
    writer.writeheader()
    for row in out_rows:
        # TODO can trim extra rows at the end
        writer.writerow(row)


if __name__ == '__main__' and not hasattr(sys, 'ps1'):
    main(argparser.parse_args())
