// Given a list of pumpDepartures functions, merge them.
// The merged result list of departures will start with all the departures from the first fn.
// Then it will include all the departures from the second fn that are after the last departure
// from the first fn. And so on.
// This has the effect of always using the departure information from the first data source, unless
// it has no departures or all its departures are too soon to catch, in which case the second data
// source will be used, etc.
function pumpDeparturesWithFallback(fns) {
    return setDepartures => {
        let allDepartures = [];
        let cancels = [];

        function mergeDepartures() {
            let ret = [];
            for (let departures of allDepartures) {
                for (let departure of departures) {
                    if (ret.length === 0 || departure.departure > ret[ret.length - 1].departure) {
                        ret.push(departure);
                    }
                }
            }
            return ret;
        }

        for (let fn of fns) {
            let departures = [];
            allDepartures.push(departures)
            // Note: We update allDepartures[i] *in-place* in this method.
            let cancel = fn(newDepartures => {
                departures.splice(0, departures.length, ...newDepartures);
                setDepartures(mergeDepartures());
            });
            cancels.push(cancel);
        }

        return () => cancels.forEach(cancel => cancel());
    }
}

export default {
    pumpDeparturesWithFallback,
};
