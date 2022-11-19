const pathOfficial = require('./pathOfficial');
const ids = require('./ids');
const fs = require('fs');

const json1 = JSON.parse(fs.readFileSync('test_data/ridepath1.json'));
const json2 = JSON.parse(fs.readFileSync('test_data/ridepath2.json'));

test('getDeparturesFromJson', () => {
    // now1 is equal to lastUpdated so results will be the same as secondsToArrival
    let now1 = new Date('2022-11-13T14:08:12.956186-05:00');
    expect(pathOfficial.getDeparturesFromJson(json1, ids.HOBOKEN, ids._33RD_ST, now1)).toStrictEqual([417, 1087]);

    // now2 is 7.5 seconds after lastUpdated, so results will be 7 seconds less than secondsToArrival
    let now2 = new Date('2022-11-15T19:01:20.940771-05:00')
    // Newport has 4 different routes going through it in json2, 2 in each direction. Each has 1
    // departure time listed.
    expect(pathOfficial.getDeparturesFromJson(json2, ids.NEWPORT, ids.WTC, now2)).toStrictEqual([-5.5]);
    expect(pathOfficial.getDeparturesFromJson(json2, ids.NEWPORT, ids.HOBOKEN, now2)).toStrictEqual([492.5]);
    expect(pathOfficial.getDeparturesFromJson(json2, ids.NEWPORT, ids._33RD_ST, now2)).toStrictEqual([292.5]);
    expect(pathOfficial.getDeparturesFromJson(json2, ids.NEWPORT, ids.JOURNAL_SQUARE, now2)).toStrictEqual([107.5]);
});
