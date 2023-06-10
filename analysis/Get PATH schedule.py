# ---
# jupyter:
#   jupytext:
#     text_representation:
#       extension: .py
#       format_name: percent
#       format_version: '1.3'
#       jupytext_version: 1.14.5
#   kernelspec:
#     display_name: Python 3 (ipykernel)
#     language: python
#     name: python3
# ---

# %% [markdown]
# Gets the PATH train schedule by scraping the PATH website.

# %%
import pandas as pd
from bs4 import BeautifulSoup
import requests
import requests_cache
import json
from pandas.io.html import read_html
import time
from selenium import webdriver
import pickle
import os
import copy
import json

# %%
cache_file = 'path_schedule_cache.pkl'

if not os.path.exists(cache_file):
    driver = webdriver.Firefox()
    days = ['weekday', 'saturday', 'sunday']
    day_tables = {}
    for day in days:
        driver.get(f'https://www.panynj.gov/path/en/schedules-maps/{day}-schedules.html')
        time.sleep(3)
        day_tables[day] = pd.read_html(
            driver.find_element('tag name', 'body').get_attribute('innerHTML'),
            skiprows=1, header=0)

    with open(cache_file, 'wb') as f:
        pickle.dump(day_tables, f)

with open(cache_file, 'rb') as f:
    day_tables = pickle.load(f)

# %%
website_name_to_json = {
    'Newark': 'newark',
    'Harrison': 'harrison',
    'JSQ': 'journalSquare',
    'Grove St': 'groveStreet',
    'Grove St.': 'groveStreet',
    'Exchange': 'exchangePlace',
    'WTC': 'worldTradeCenter',
    '33 St': 'thirtyThirdStreet',
    'Newport': 'newport',
    'Chris St': 'christopherStreet',
    '9 St': 'ninthStreet',
    '14 St': 'fourteenthStreet',
    '23 St': 'twentyThirdStreet',
    '33 St': 'thirtyThirdStreet',
    'Hoboken': 'hoboken',
}

# %%
schedules = {}
routes = {}

def parse_header(header):
    if 'Departure' in header:
        try:
            return website_name_to_json[header.rsplit(' ', 1)[0].strip()]
        except KeyError:
            raise ValueError(f'Could not parse {header=}')
    elif 'Arrival' in header:
        try:
            return website_name_to_json[header.split(' ', 2)[-1].strip()]
        except KeyError:
            raise ValueError(f'Could not parse {header=}')
    else:
            raise ValueError(f'Could not parse {header=}')

for day, tables in day_tables.items():
    for table in tables:
        headers = list(table)
        stations = [parse_header(header) for header in headers]

        origin = stations[0]
        destination = stations[-1]

        route_name = f'{origin}To{destination[0].upper()}{destination[1:]}'
        if 'hoboken' in stations[1:-1]:
            route_name += 'ViaHoboken'

        routes[route_name] = stations

        for col in list(table)[:-1]:
            station = parse_header(col)
            schedules.setdefault(route_name, {}).setdefault(station, {})[day] = list(table[col])

# %%
# Sanity check
schedule_sizes = copy.deepcopy(schedules)
for route in schedule_sizes.values():
    for origin in route.values():
        for day, times in origin.items():
            origin[day] = len(times)

def schedule_sizes_by_origin(origin):
    ret = {}
    for route_name, route_data in schedule_sizes.items():
        for origin_name, origin_data in route_data.items():
            if origin_name == origin:
                ret[route_name] = origin_data

    return ret

schedule_sizes_by_origin('hoboken')

# %%
with open('pathTrainData.json', 'w') as f:
    json.dump({'routes': routes, 'schedules': schedules}, f, sort_keys=True, indent=2)
