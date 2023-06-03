// stations
const HOBOKEN = 'HOBOKEN';
const NEWPORT = 'NEWPORT';
const _33RD_ST = '_33RD_ST';
const WTC = 'WTC';
const JOURNAL_SQUARE = 'JOURNAL_SQUARE';
const NEWARK = 'NEWARK';
const HOBOKEN_FERRY = 'HOBOKEN_FERRY';

// routes
const HOBOKEN_TO_BROOKFIELD_FERRY = 'HOBOKEN_TO_BROOKFIELD_FERRY';

// methods
const SCHEDULE = 'SCHEDULE';
const MRAZZA_API = 'MRAZZA_API';
const RIDEPATH_API = 'RIDEPATH_API';


function isApi(method) {
    return method == MRAZZA_API || method == RIDEPATH_API;
}

function methodAbbrev(method) {
    return {
        [SCHEDULE]: 'SCH',
        [MRAZZA_API]: 'MAPI',
        [RIDEPATH_API]: 'RAPI',
    }[method];
}

export default {
    HOBOKEN,
    NEWPORT,
    _33RD_ST,
    WTC,
    JOURNAL_SQUARE,
    NEWARK,
    HOBOKEN_FERRY,
    HOBOKEN_TO_BROOKFIELD_FERRY,
    SCHEDULE,
    MRAZZA_API,
    RIDEPATH_API,
    isApi,
    methodAbbrev,
};