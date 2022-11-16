const fs = require('fs');

const json1 = JSON.parse(fs.readFileSync('test_data/ridepath1.json'));
const json2 = JSON.parse(fs.readFileSync('test_data/ridepath1.json'));

test('load data', () => {
    expect(json1.results.length).toBe(13);
    expect(json2.results.length).toBe(13);
});
