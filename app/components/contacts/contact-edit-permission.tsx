import React from 'react';
import { View, FlatList } from 'react-native';
import { action } from 'mobx';
import { observer } from 'mobx-react/native';
import SafeComponent from '../shared/safe-component';
import { tu } from '../utils/translator';
import icons from '../helpers/icons';
import { vars } from '../../styles/styles';
import Layout3 from '../layout/layout3';
import ContactEditPermissionItem from './contact-edit-permission-item';
import ModalHeader from '../shared/modal-header';
import { Volume } from '../../lib/peerio-icebear/models';

const INITIAL_LIST_SIZE = 10;
// const PAGE_SIZE = 2;

interface ContactEditPermissionProps {
    title: string;
    action: Function;
    onExit: Function;
    footer: JSX.Element;
    folder: Volume;
}
@observer
export default class ContactEditPermission extends SafeComponent<ContactEditPermissionProps> {
    @action.bound
    unshareFrom(contact) {
        // HINT: removing on layout animated listview causes side effects
        // we just collapse it inline
        this.props.folder.removeParticipants([contact]);
    }

    get unshareButton() {
        const extraWidth = 20;
        // TODO: can we ever get not isFolder here, @karim?
        const {
            folder: { isFolder, isShared }
        } = this.props;
        if (isFolder && isShared) {
            return icons.text(tu('button_unshare'), this.props.action, null, null, extraWidth);
        }
        return icons.disabledText(tu('button_unshare'), null, extraWidth);
    }

    exitRow() {
        const { title, onExit } = this.props;
        const leftIcon = icons.dark('close', onExit);
        /* TODO: show unshare button */
        const rightIcon = null; // this.unshareButton
        const fontSize = vars.font.size18;
        const outerStyle = { backgroundColor: 'transparent' };
        return <ModalHeader {...{ leftIcon, rightIcon, title, fontSize, outerStyle }} />;
    }

    item = ({ item }) => {
        const { folder } = this.props;
        return (
            <ContactEditPermissionItem
                contact={item}
                isOwner={item.username === folder.owner}
                onUnshare={this.unshareFrom}
            />
        );
    };

    keyExtractor = contact => contact.username;

    body() {
        return (
            <FlatList
                keyExtractor={this.keyExtractor}
                initialNumToRender={INITIAL_LIST_SIZE}
                // pageSize={PAGE_SIZE}
                data={this.props.folder.otherParticipants || []}
                renderItem={this.item}
            />
        );
    }

    renderThrow() {
        const { footer } = this.props;
        const header = <View style={{ flex: 0 }}>{this.exitRow()}</View>;
        const body = this.body();
        const layoutStyle = {
            backgroundColor: 'white'
        };
        return (
            <Layout3
                defaultBar
                body={body}
                header={header}
                noFitHeight
                footer={footer}
                style={layoutStyle}
            />
        );
    }
}
