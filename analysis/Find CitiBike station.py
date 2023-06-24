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
from haversine import haversine
import requests
import requests_cache

# %%
requests_cache.install_cache()

# %%
station_information = requests.get('https://gbfs.citibikenyc.com/gbfs/es/station_information.json').json()

# %%
station_information


# %%
def closest_station_to(lat, lon):
    sorted_stations = sorted(
        station_information['data']['stations'],
        key=lambda s: haversine((s['lat'], s['lon']), (lat, lon))
    )

    return sorted_stations[0]


closest_station_to(40.74097194352506, -74.02859948336616)


# %%
