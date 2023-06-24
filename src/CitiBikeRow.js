import BikeshareRow from './BikeshareRow.js'
import {createElement} from 'react';

export default function CitiBikeRow(props) {
    let outProps = {
        stationStatusUrl: 'https://gbfs.citibikenyc.com/gbfs/es/station_status.json',
        // "core-ui-color-blue30-light" from CitiBike's website
        backgroundColor: '#869dff',
    };
    Object.assign(outProps, props);

    return createElement(BikeshareRow, outProps);
}
