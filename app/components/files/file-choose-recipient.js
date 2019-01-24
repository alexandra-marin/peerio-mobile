import React, { Component } from 'react';
import { observer } from 'mobx-react/native';
import ContactListModal from '../contacts/contact-list-modal';
import { t, tx } from '../utils/translator';
import routes from '../routes/routes';
import fileState from './file-state';

@observer
export default class FileChooseRecipient extends Component {
    render() {
        return (
            <ContactListModal
                rooms
                limit={1}
                onExit={() => routes.modal.discard()}
                action={selection => {
                    routes.modal.discard();
                    let chat = null,
                        contact = null;
                    if (selection.username) {
                        contact = selection;
                    } else {
                        chat = selection;
                        routes.main.chats(chat, true);
                    }
                    Object.assign(fileState.previewFile, { chat, contact });
                }}
                title={t('title_shareWith')}
                inputPlaceholder={tx('title_TryUsernameOrEmail')}
            />
        );
    }
}
