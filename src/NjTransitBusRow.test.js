import { getDeparturesFromXml } from './NjTransitBusRow.js';

test('no departures', () => {
  let data = `
    <stop>
      <noPredictionMessage>No service scheduled</noPredictionMessage>
    </stop>`;
  expect(getDeparturesFromXml(data, 126))
    .toStrictEqual([]);
});

test('departures 1', () => {
  let data = `
    <stop>
      <pre>
        <pt>5</pt>
        <pu> MINUTES</pu>
        <mode>1</mode>
        <consist></consist>
        <cars></cars>
        <fd> 126 NEW YORK</fd>
        <zone></zone>
        <scheduled>false</scheduled>
        <nextbusminutes>0</nextbusminutes>
        <nextbusonroutetime>12:03 PM</nextbusonroutetime>
        <v>20827</v>
        <rn>126</rn> <rd>126</rd>
      </pre>
      <pre>
        <pt>10</pt>
        <pu> MINUTES</pu>
        <mode>1</mode>
        <consist></consist>
        <cars></cars>
        <fd> 22 NORTH HOBOKEN</fd>
        <zone></zone>
        <scheduled>false</scheduled>
        <nextbusminutes>0</nextbusminutes>
        <nextbusonroutetime>12:08 PM</nextbusonroutetime>
        <v>5865</v>
        <rn>22</rn>
        <rd>22</rd>
      </pre>
      <pre>
        <pt>35</pt>
        <pu> MINUTES</pu>
        <mode>1</mode>
        <consist></consist>
        <cars></cars>
        <fd> 126 NEW YORK</fd>
        <zone></zone>
        <scheduled>false</scheduled>
        <nextbusminutes>0</nextbusminutes>
        <nextbusonroutetime>12:33 PM</nextbusonroutetime>
        <v>5391</v>
        <rn>126</rn>
        <rd>126</rd>
      </pre>
    </stop>`;

  expect(getDeparturesFromXml(data, 126, new Date('2023-06-25T11:58:00-04:00')))
    .toStrictEqual([
      {
        departure: new Date('2023-06-25T12:03:00-04:00'),
        methodAbbrev: 'API',
      },
      {
        departure: new Date('2023-06-25T12:33:00-04:00'),
        methodAbbrev: 'API',
      }
    ]);
});

test('departures 2', () => {
  let data = `
    <?xml version="1.0"?>
    <stop>
      <pre>
        <pt>8</pt>
        <pu> MINUTES</pu>
        <mode>1</mode>
        <consist></consist>
        <cars></cars>
        <fd> 89 NORTH BERGEN  91ST STREET VIA PARK AVE</fd>
        <zone></zone>
        <scheduled>false</scheduled>
        <nextbusminutes>0</nextbusminutes>
        <nextbusonroutetime>11:27 PM</nextbusonroutetime>
        <v>5803</v>
        <rn>89</rn>
        <rd>89</rd>
      </pre>
      <pre>
        <pt>13</pt>
        <pu> MINUTES</pu>
        <mode>1</mode>
        <consist></consist>
        <cars></cars>
        <fd> 126 NEW YORK</fd>
        <zone></zone>
        <scheduled>false</scheduled>
        <nextbusminutes>0</nextbusminutes>
        <nextbusonroutetime>11:32 PM</nextbusonroutetime>
        <v>5266</v>
        <rn>126</rn>
        <rd>126</rd>
      </pre>
      <pre>
        <pt>43</pt>
        <pu> MINUTES</pu>
        <mode>1</mode>
        <consist></consist>
        <cars></cars>
        <fd> 126 NEW YORK</fd>
        <zone></zone>
        <scheduled>false</scheduled>
        <nextbusminutes>0</nextbusminutes>
        <nextbusonroutetime>12:02 AM</nextbusonroutetime>
        <v>5898</v>
        <rn>126</rn>
        <rd>126</rd>
      </pre>
    </stop>
  `;

  expect(getDeparturesFromXml(data, 126, new Date('2023-06-25T23:19:00-04:00')))
    .toStrictEqual([
      {
        departure: new Date('2023-06-25T23:32:00-04:00'),
        methodAbbrev: 'API',
      },
      {
        departure: new Date('2023-06-26T00:02:00-04:00'),
        methodAbbrev: 'API',
      }
    ]);
});

test('departures 3', () => {
  let data = `
    <stop>
      <pre>
        <pt>16</pt>
        <pu> MINUTES</pu>
        <mode>1</mode>
        <consist/>
        <cars/>
        <fd> 126 NEW YORK</fd>
        <zone/>
        <scheduled>false</scheduled>
        <nextbusminutes>0</nextbusminutes>
        <nextbusonroutetime>1:02 AM</nextbusonroutetime>
        <v>5249</v>
        <rn>126</rn>
        <rd>126</rd>
      </pre>
    </stop>
  `;

  expect(getDeparturesFromXml(data, 126, new Date('2023-06-25T00:46:00-04:00')))
    .toStrictEqual([
      {
        departure: new Date('2023-06-25T01:02:00-04:00'),
        methodAbbrev: 'API',
      },
    ]);
});
