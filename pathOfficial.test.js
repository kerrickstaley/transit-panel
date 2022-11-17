const pathOfficial = require('./pathOfficial');
const ids = require('./ids');
const fs = require('fs');

const json1 = JSON.parse(fs.readFileSync('test_data/ridepath1.json'));
const json2 = JSON.parse(fs.readFileSync('test_data/ridepath2.json'));

test('getDeparturesFromJson', () => {
    expect(pathOfficial.getDeparturesFromJson(json1, ids.HOBOKEN, ids._33RD_ST)).toStrictEqual([417, 1087]);
    // Newport has 4 different routes going through it in json2, 2 in each direction. Each has 1
    // departure time listed.
    expect(pathOfficial.getDeparturesFromJson(json2, ids.NEWPORT, ids.WTC)).toStrictEqual([2]);
    expect(pathOfficial.getDeparturesFromJson(json2, ids.NEWPORT, ids.HOBOKEN)).toStrictEqual([500]);
    expect(pathOfficial.getDeparturesFromJson(json2, ids.NEWPORT, ids._33RD_ST)).toStrictEqual([300]);
    expect(pathOfficial.getDeparturesFromJson(json2, ids.NEWPORT, ids.JOURNAL_SQUARE)).toStrictEqual([115]);
});
