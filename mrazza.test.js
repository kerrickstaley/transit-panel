const mrazza = require('./mrazza');
const ids = require('./ids');
const fs = require('fs');

const json_hoboken_1 = JSON.parse(fs.readFileSync('test_data/mrazza_hoboken_1.json'));
const json_wtc_1 = JSON.parse(fs.readFileSync('test_data/mrazza_wtc_1.json'));

test('getDeparturesFromJson', () => {
    let now1 = new Date('2022-12-19T13:45:00Z');
    expect(mrazza.getDeparturesFromJson(json_hoboken_1, ids._33RD_ST, now1)).toStrictEqual([600, 1020]);

    let now2 = new Date('2022-12-19T23:49:00Z');
    expect(mrazza.getDeparturesFromJson(json_wtc_1, ids.NEWARK, now2)).toStrictEqual([240, 540]);
});
