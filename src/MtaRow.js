import Row from './Row.js';
import React from 'react';
import defaultIcon from './images/below_grade_train.png';

import GtfsRealtimeBindings from "gtfs-realtime-bindings";

async function getGtfsFeed(apiKey, feedId) {
    const response = await fetch("https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2F" + feedId, {
        headers: {
            "x-api-key": apiKey,
        },
    });
    if (!response.ok) {
        const error = new Error(`${response.url}: ${response.status} ${response.statusText}`);
        error.response = response;
        throw error;
    }
    const buffer = await response.arrayBuffer();
    const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(
        new Uint8Array(buffer)
    );
    return feed;
}

function routeIdToGroup(routeId) {
    // TODO handle SIR
    const groups = [
        'ace',
        'bdfm',
        'g',
        'jz',
        'nqrw',
        'l',
        '123',
        '456',
        '7',
    ];
    routeId = routeId.toLowerCase();
    for (const group of groups) {
        if (group.includes(routeId)) {
            return group;
        }
    }
    throw new Error(`Unknown routeId ${routeId}`);
}

// return a string like "gtfs-ace" or "gtfs-l" or "gtfs" based on the given routeId.
function routeIdToFeedId(routeId) {
    const group = routeIdToGroup(routeId);
    if (['123', '456', '7'].includes(group)) {
        return 'gtfs';
    }
    return 'gtfs-' + group;
}

function defaultRowColor(routeId) {
    // These were directly taken from https://new.mta.info/maps
    // TODO we may want to lighten some of these.
    const groupToRowColor = {
        'ace': '#006bb6',
        'bdfm': '#f89420',
        'g': '#a5ce3a',
        'jz': '#af742a',
        'nqrw': '#ffce06',
        'l': '#939598',
        '123': '#ef3c42',
        '456': '#00a65c',
        '7': '#b43c96',
    };
    const group = routeIdToGroup(routeId);
    return groupToRowColor[group];
}

function pumpDepartures(apiKey, routeId, stopId) {
    let feedId = routeIdToFeedId(routeId);

    return setDepartures => {
        let loopTimeoutId = null;

        function loop() {
            getGtfsFeed(apiKey, feedId).then(feed => {
                let departures = feed.entity.map(entity => {
                    let tu = entity.tripUpdate;
                    if (!tu) {
                        return [];
                    }

                    if (tu.trip.routeId !== routeId) {
                        return [];
                    }

                    return tu.stopTimeUpdate.filter(stu => stu.stopId === stopId).map(stu => stu.departure.time);
                }).flat().sort().map(t => ({
                    departure: new Date(t * 1000),
                    methodAbbrev: 'API',
                }));

                setDepartures(departures);
            });

            loopTimeoutId = setTimeout(loop, (40 + 5 * Math.random()) * 1000);
        }

        function cancel() {
            clearTimeout(loopTimeoutId);
        }

        loop();
        return cancel;
    };
}

export default function MtaRow(props) {
    let { routeId, stopId, secrets } = props;

    if (secrets === null) {
        return React.createElement(Row, {
            configError: `secrets file isn't configured (or hasn't finished loading). Please put secrets section in config file or secrets= in the URL.`
        });
    }

    if (secrets.nycMtaApiKey === undefined) {
        return React.createElement(Row, {
            configError: `nycMtaApiKey wasn't set in the secrets file. Please visit https://api.mta.info/#/landing, get an API key, and set it in the secrets file.`
        });
    }

    let retProps = {
        pumpDepartures: pumpDepartures(secrets.nycMtaApiKey, routeId, stopId),
        title: props.title ?? `${routeId} from ${stopId}`,
        icon: props.icon ?? defaultIcon,
        backgroundColor: props.backgroundColor ?? defaultRowColor(routeId),
        walkMinutes: props.walkMinutes,
    };

    return React.createElement(Row, retProps);
}
