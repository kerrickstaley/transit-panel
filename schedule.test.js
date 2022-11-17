const schedule = require('./schedule');
const ids = require('./ids');

test('getSecUntilDepartures', () => {
    let now = new Date(1668481604000);
    expect(schedule.getSecUntilDepartures(now, ["10:07 PM"])).toStrictEqual([16]);
});

test('getDepartures', () => {
    // 10:06 PM on a Monday
    // departures after this are 10:10 PM, 10:25 PM, 10:40 PM
    let now = new Date(1668481560000);
    let result = schedule.getDeparturesFromTime([[ids.HOBOKEN, ids._33RD_ST]], now, 3);
    expect(result).toStrictEqual([
        {
            station: 'HOBOKEN',
            route: '_33RD_ST',
            method: 'SCHEDULE',
            departures: [
                4 * 60,
                19 * 60,
                34 * 60,
            ],
        },
    ]);
});
