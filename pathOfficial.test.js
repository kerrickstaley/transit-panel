const pathOfficial = require('./pathOfficial');
const stationsRoutes = require('./stationsRoutes')
const fs = require('fs');

const json1 = JSON.parse(fs.readFileSync('test_data/ridepath1.json'));
const json2 = JSON.parse(fs.readFileSync('test_data/ridepath2.json'));

test('load data', () => {
    expect(json1.results.length).toBe(13);
    expect(json2.results.length).toBe(13);
});

test('getDepartures', () => {
    expect(pathOfficial.getDepartures(json1, stationsRoutes.HOBOKEN, stationsRoutes.PATH_JSQ_TO_33RD_VIA_HOB)).toStrictEqual([417, 1087]);
    // Newport has 4 different routes going through it in json2, 2 in each direction. Each has 1
    // departure time listed.
    expect(pathOfficial.getDepartures(json2, stationsRoutes.NEWPORT, stationsRoutes.PATH_HOB_TO_WTC)).toStrictEqual([2]);
    expect(pathOfficial.getDepartures(json2, stationsRoutes.NEWPORT, stationsRoutes.PATH_WTC_TO_HOB)).toStrictEqual([500]);
    expect(pathOfficial.getDepartures(json2, stationsRoutes.NEWPORT, stationsRoutes.PATH_JSQ_TO_33RD)).toStrictEqual([300]);
    expect(pathOfficial.getDepartures(json2, stationsRoutes.NEWPORT, stationsRoutes.PATH_33RD_TO_JSQ)).toStrictEqual([115]);
});
