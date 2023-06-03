# %%
import gtfs_kit
import os
from pathlib import Path
import dateutil
import datetime as dt

# %%
# Configurable options
zip_path = Path(os.environ['HOME']) / 'Downloads/rail_data.zip'
dist_units = 'mi'
route_short_name = 'BNTNM'
origin_stop_name = 'HOBOKEN'
destination_stop_name = 'NEWARK BROAD ST'
direction_id = 1
days_of_week = [5]  # Saturday

# %%
week = feed.get_first_week()
dates = [week[i] for i in days_of_week]
dates

route_id = feed.routes.loc[feed.routes['route_short_name'] == route_short_name, 'route_id'].iat[0]
origin_stop_id = feed.stops.loc[feed.stops.stop_name == origin_stop_name, 'stop_id'].iat[0]
destination_stop_id = feed.stops.loc[feed.stops.stop_name == destination_stop_name, 'stop_id'].iat[0]

timetable = feed.build_route_timetable(route_id, dates)

origin_timetable = timetable[(timetable.stop_id == origin_stop_id) & (timetable.direction_id == direction_id)].copy()
destination_timetable = timetable[(timetable.stop_id == destination_stop_id) & (timetable.direction_id == direction_id)].copy()

drop_cols = ['route_id', 'stop_id', 'direction_id', 'shape_id', 'pickup_type', 'drop_off_type', 'shape_dist_traveled']
for sub_timetable in [origin_timetable, destination_timetable]:
    sub_timetable.drop(drop_cols, axis=1, inplace=True)
    sub_timetable.reset_index(inplace=True, drop=True)

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
feed.stops[feed.stops.stop_name.str.contains('BROAD')]

# %%
# Listing all routes
feed.routes

# %%
# All stops in timetable
feed.stops[feed.stops.stop_id.isin(timetable.stop_id.unique())]

# %%
