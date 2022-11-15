const schedule = require('./schedule');

test('getSecUntilDepartures', () => {
    let now = new Date(1668481604000);
    expect(schedule.getSecUntilDepartures(now, ["10:07 PM"])).toStrictEqual([16]);
});
