import { MappedCollection } from '../helpers/mapped-collection';

export default class ContactCollection extends MappedCollection {
    getKey(item) {
        return item.username;
    }
}
