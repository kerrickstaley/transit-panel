# %%
import gtfs_kit
import os
from pathlib import Path
import dateutil
import datetime as dt

# %%
# Configurable options for BNTNM train route
zip_path = Path(os.environ['HOME']) / 'Downloads/rail_data.zip'
dist_units = 'mi'
route_short_name = 'BNTNM'
origin_stop_name = 'HOBOKEN'
destination_stop_name = 'NEWARK BROAD ST'
direction_id = 1
days_of_week = [5]  # Saturday

# %%
# Configurable options for 126 bus route
zip_path = Path(os.environ['HOME']) / 'Downloads/bus_data.zip'
dist_units = 'mi'
route_short_name = '126'
origin_stop_name = 'WASHINGTON ST AT 3RD ST'
destination_stop_name = None
direction_id = 1
days_of_week = [5]  # Saturday

# %%
feed = gtfs_kit.read_feed(zip_path, dist_units=dist_units)

# %%
week = feed.get_first_week()
dates = [week[i] for i in days_of_week]
dates

route_id = feed.routes.loc[feed.routes['route_short_name'] == route_short_name, 'route_id'].iat[0]

stop_ids = [
    feed.stops.loc[feed.stops.stop_name == origin_stop_name, 'stop_id'].iat[0],
]

if destination_stop_name is not None:
    stop_ids.append(
        feed.stops.loc[feed.stops.stop_name == destination_stop_name, 'stop_id'].iat[0])

route_timetable = feed.build_route_timetable(route_id, dates)

timetables = [
    route_timetable[(route_timetable.stop_id == stop_id) & (route_timetable.direction_id == direction_id)].copy()
    for stop_id in stop_ids]

drop_cols = ['route_id', 'stop_id', 'direction_id', 'shape_id', 'pickup_type', 'drop_off_type', 'shape_dist_traveled']
for timetable in timetables:
    timetable.drop(drop_cols, axis=1, inplace=True)
    timetable.reset_index(inplace=True, drop=True)

# %%
# Finding departure times from origin stop that go to destination stop
origin_timetable, destination_timetable = timetables

on = ['trip_id', 'service_id', 'trip_headsign', 'date']
merged = origin_timetable.merge(destination_timetable, left_on=on, right_on=on, suffixes=['_origin', '_destination']).copy()

# This check won't necessarily be satisified all the time, can comment it out
if len(origin_timetable) != len(merged):
    raise RuntimeError(f'{len(origin_timetable)=} and {len(merged)=} are different')

datetimes = []
for row in merged.itertuples():
    pieces = row.departure_time_origin.split(':')
    hour = int(pieces[0]) % 24
    minute = int(pieces[1])
    datetimes.append(dt.datetime(2023, 1, 1, hour, minute))

datetimes.sort()
for datetime in datetimes:
    print(f"'{datetime.strftime('%I:%M %p')}',")

# %%
# Route color
'#' + feed.routes.loc[feed.routes.route_id == route_id, 'route_color'].iat[0].lower()

# %%
# Finding stops
feed.stops[feed.stops.stop_name.str.contains('WASHINGTON.*3')]

# %%
# Listing all routes
feed.routes[feed.routes.route_short_name.str.contains('126')]

# %%
# All stops for route in timetable
feed.stops[feed.stops.stop_id.isin(route_timetable.stop_id.unique())]

# %%
