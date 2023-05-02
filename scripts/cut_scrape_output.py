#!/usr/bin/env python3
import argparse
import dateutil.parser
import datetime as dt
import csv
import sys
import itertools
import os

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


def binary_search_start(csv_reader, in_file, target_time, time_field='fetch_time'):
    """
    Seek to some point in the file such that time_field is slightly before target_time.
    """
    next(csv_reader)
    # https://stackoverflow.com/questions/29618936/how-to-solve-oserror-telling-position-disabled-by-next-call for why we need the next two lines
    in_file.seek(0)
    in_file.readline()
    lower_bound = in_file.tell()
    in_file.seek(0, os.SEEK_END)
    upper_bound = in_file.tell()

    while lower_bound < upper_bound:
        mid = (lower_bound + upper_bound) // 2
        in_file.seek(mid)
        while in_file.read(1) not in ['\n', '']:
            continue
        new_position = in_file.tell()

        if new_position == upper_bound:
            break

        row = next(csv_reader)
        if dateutil.parser.parse(row[time_field]) < target_time:
            lower_bound = new_position
        else:
            upper_bound = new_position

    in_file.seek(lower_bound)


def main(args):
    in_file = open(args.in_file)
    reader = csv.DictReader(in_file)
    out_rows = []

    binary_search_start(reader, in_file, args.scheduled_departure - dt.timedelta(minutes=args.look_behind_min + 30))
    for row in reader:
        fetch_time = dateutil.parser.parse(row['fetch_time'])
        if fetch_time > args.scheduled_departure + dt.timedelta(minutes=args.look_ahead_min):
            break

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
