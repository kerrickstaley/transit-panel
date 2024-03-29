import mrazza from './mrazza.js';
const fs = require('fs');

const json_hoboken_1 = JSON.parse(fs.readFileSync('test_data/mrazza_hoboken_1.json'));
const json_wtc_1 = JSON.parse(fs.readFileSync('test_data/mrazza_wtc_1.json'));

test('getDeparturesFromJson', () => {
    expect(mrazza.getDeparturesFromJson(json_hoboken_1, ['hobokenToThirtyThirdStreet']))
        .toStrictEqual([
            {
                departure: new Date('2022-12-19T13:55:00.000Z'),
                methodAbbrev: 'API',
            },
            {
                departure: new Date('2022-12-19T14:02:00.000Z'),
                methodAbbrev: 'API',
            },
        ]);

    expect(mrazza.getDeparturesFromJson(json_wtc_1, ['worldTradeCenterToNewark']))
        .toStrictEqual([
            {
                departure: new Date('2022-12-19T23:48:00.000Z'),
                methodAbbrev: 'API',
            },
            {
                departure: new Date('2022-12-19T23:53:00.000Z'),
                methodAbbrev: 'API',
            },
            {
                departure: new Date('2022-12-19T23:58:00.000Z'),
                methodAbbrev: 'API',
            },
        ]);
});
