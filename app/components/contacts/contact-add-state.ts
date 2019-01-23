import { observable } from 'mobx';
import RoutedState from '../routes/routed-state';
import { tx } from '../utils/translator';

class ContactAddState extends RoutedState {
    @observable imported = [];

    get title() {
        if (this.routerMain.currentIndex === 0) return tx('title_addContacts');
        return '';
    }

    onTransition(/* active, contact */) {
        console.log('contact-add-state.js: contacts add on transition');
    }
}

const contactAddState = new ContactAddState();
export default contactAddState;
