import { action, observable, computed } from 'mobx';
import _ from 'lodash';
import { User } from '../../lib/icebear';

const notSeen = id => !User.current.beacons.get(id);

class BeaconState {
    @observable beacons = [];
    @observable disabled = false;

    @computed
    get activeBeacon() {
        if (this.disabled) return null;
        return _.chain(this.beacons)
            .filter(b => notSeen(b.id))
            .filter(b => b.condition())
            .sortBy(b => b.priority)
            .first()
            .value();
    }

    requestBeacon(beacon) {
        if (!beacon) return;
        this.beacons.unshift(beacon);
    }

    @action.bound
    removeBeacon(idToRemove) {
        if (!idToRemove) return;
        this.beacons = this.beacons.filter(b => b.id !== idToRemove);
    }

    markSeen = ids => {
        ids.forEach(id => User.current.beacons.set(id, true));
        // we are not waiting for saveBeacons because there's no visual feedback
        User.current.saveBeacons();
    };

    // used for test purposes to disable beacons
    dismissAll = async () => {
        this.disabled = true;
        // let beacons disappear
        await new Promise(resolve => setTimeout(resolve, 500));
    };
}

const beaconState = new BeaconState();

// TODO: remove before merging
global.beaconState = beaconState;

export default beaconState;
