// Given a list of pumpLeaveUpdates functions, merge them.
// The merged result list of leaveUpdates will start with all the leaveUpdates from the first fn.
// Then it will include all the leaveUpdates from the second fn that are after the last leaveUpdate
// from the first fn. And so on.
// This has the effect of always using the departure information from the first data source, unless
// it has no departures or all its departures are too soon to catch, in which case the second data
// source will be used, etc.
function pumpLeaveUpdatesWithFallback(fns) {
    return setLeaveUpdates => {
        let allLeaveUpdates = [];
        let cancels = [];

        function mergeLeaveUpdates() {
            let ret = [];
            for (let leaveUpdates of allLeaveUpdates) {
                for (let leaveUpdate of leaveUpdates) {
                    if (ret.length === 0 || leaveUpdate.leaveTime > ret[ret.length - 1].leaveTime) {
                        ret.push(leaveUpdate);
                    }
                }
            }
            return ret;
        }

        for (let fn of fns) {
            let leaveUpdates = [];
            allLeaveUpdates.push(leaveUpdates)
            // Note: We update allLeaveUpdates[i] *in-place* in this method.
            let cancel = fn(newLeaveUpdates => {
                leaveUpdates.splice(0, leaveUpdates.length, ...newLeaveUpdates);
                setLeaveUpdates(mergeLeaveUpdates());
            });
            cancels.push(cancel);
        }

        return () => cancels.forEach(cancel => cancel());
    }
}

export default {
    pumpLeaveUpdatesWithFallback,
};
