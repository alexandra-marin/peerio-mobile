import { Component } from 'react';
import { observer } from 'mobx-react/native';
import { observable } from 'mobx';

@observer
export default class ListItem extends Component {
    @observable contact;
    @observable phoneContactName;
    @observable selected;
    @observable visible;

    constructor(contact, phoneContactName, selected) {
        super();
        this.contact = contact;
        this.phoneContactName = phoneContactName;
        this.selected = selected;
    }
}
