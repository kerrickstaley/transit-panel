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

# %%
import requests
import requests_cache
import bs4
import pandas as pd
import re
import json

# %%
requests_cache.install_cache()

# %%
resp = requests.get('https://www.nywaterway.com/ferryroutesschedules.aspx')
soup = bs4.BeautifulSoup(resp.text)
tables = soup.select('.schedule-table')
schedule_urls = []
for table in tables:
    for tr in table.select('tr'):
        tds = tr.select('td')

        if len(tds) == 0:
            continue

        if len(tds) != 4:
            raise ValueError(f'expected 4 columns in table row, found {len(tds)}: {tds}')

        anchors = tds[1].select('a')
        assert len(anchors) == 1
        href = anchors[0].attrs['href']
        url = f'https://www.nywaterway.com/{href}'
        schedule_urls.append(url)

schedule_urls

# %%
# TODO support all schedule URLs
schedule_urls = [
    'https://www.nywaterway.com/Hoboken14th-WFCRoute.aspx',
    'https://www.nywaterway.com/HobokenNJTT-WFCRoute.aspx',
    'https://www.nywaterway.com/PaulusHook-WTCRoute.aspx',
]

# %%
name_to_id = {
    'Brookfield Place Terminal': 'brookfield',
    'Hoboken / NJ Transit Terminal': 'hobokenSouth',
    'Hoboken / 14th St.': 'hobokenNorth',
    'Paulus Hook': 'paulusHook',
}


def extract_origin(schedule_df):
    header = list(schedule_df)[0]
    return name_to_id[re.search('^Departs (.*)$', header).group(1)]


result = {}
for url in schedule_urls:
    resp = requests.get(url)
    soup = bs4.BeautifulSoup(resp.text)
    tables = pd.read_html(resp.text)
    schedules = [t for t in tables if any('Departs' in header for header in list(t))]

    if 'WEEKDAY SCHEDULE' not in str(soup):
        raise ValueError(f'Did not find the string "WEEKDAY SCHEDULE" in the page: {url}')

    assert len(schedules) in [2, 4]

    if len(schedules) == 4:
        assert 'WEEKEND SCHEDULE' in str(soup)
        assert str(soup).index('WEEKDAY SCHEDULE') < str(soup).index('WEEKEND SCHEDULE')

    route = sorted(set(extract_origin(sch) for sch in schedules))

    assert len(route) == 2

    for i, sch in enumerate(schedules):
        if i < 2:
            day = 'weekday'
        else:
            day = 'weekend'

        origin = extract_origin(sch)
        destination = list(set(route) - {origin})[0]

        times = list(sch[list(sch)[0]])
        times = [t for t in times if 'Departs' not in t]

        result.setdefault(origin, {}).setdefault(destination, {})[day] = times

result

# %%
with open('nyWaterwayData.json', 'w') as f:
    json.dump({'schedules': result}, f, sort_keys=True, indent=2)

# %%
