import PropTypes from 'prop-types';
import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { observer } from 'mobx-react/native';
import { action } from 'mobx';
import SafeComponent from '../shared/safe-component';
import { vars } from '../../styles/styles';
import icons from '../helpers/icons';
import { fileStore, User } from '../../lib/icebear';
import { tx } from '../utils/translator';
import routes from '../routes/routes';
import FoldersActionSheet from './folder-action-sheet';
import Text from '../controls/custom-text';
import chatState from '../messaging/chat-state';
import BlueButtonText from '../buttons/blue-text-button';

const padding = 8;
const borderWidth = 1;

const container = {
    flex: 1,
    flexGrow: 1,
    borderColor: vars.lightGrayBg,
    borderWidth,
    borderRadius: 2,
    marginVertical: 4
};

const header = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
};

const infoStyle = {
    color: vars.textBlack54,
    fontSize: vars.font.size12
};

@observer
export default class FolderInlineContainer extends SafeComponent {
    get folder() {
        const { folderId } = this.props;
        return fileStore.folderStore.getById(folderId);
    }

    @action.bound
    press() {
        const { folder } = this;
        fileStore.folderStore.currentFolder = folder;
        routes.main.files();
    }

    get fileDetails() {
        const { folder } = this;
        const { name } = folder;
        const nameStyle = {
            flexGrow: 1,
            flexShrink: 1,
            color: vars.txtDark,
            fontSize: vars.font.size14,
            marginLeft: vars.spacing.small.midi2x
        };
        return (
            <Text numberOfLines={1} ellipsizeMode="tail" style={nameStyle}>
                {name}
            </Text>
        );
    }

    @action.bound
    onAction() {
        FoldersActionSheet.show(this.folder, true);
    }

    @action.bound
    reshare() {
        const { folder } = this;
        folder.isShared = true;
        folder.isJustUnshared = false;
    }

    get normalBody() {
        const { folder } = this;
        const { convertingToVolume, convertingFromFolder } = folder;
        const optionsIcon = (
            <View style={{ flex: 0 }}>
                {icons.dark(
                    'more-vert',
                    this.onAction,
                    null,
                    null,
                    null,
                    convertingToVolume || convertingFromFolder
                )}
            </View>
        );
        return (
            <View style={[header, { height: vars.inlineFolderContainerHeight }]}>
                {icons.darkNoPadding('folder-shared')}
                {this.fileDetails}
                {optionsIcon}
            </View>
        );
    }

    get unsharedBody() {
        const text = this.folder
            ? tx('title_folderNameUnshared', { folderName: this.folder.name })
            : tx('title_folderUnshared');
        return (
            <View style={container}>
                <View style={[header, { padding }]}>
                    {icons.darkNoPadding('folder', null, null, null, true)}
                    <View
                        style={{
                            flexGrow: 1,
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                        <View style={{ marginLeft: vars.spacing.small.midi2x }}>
                            <Text italic style={infoStyle}>
                                {text}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
        );
    }

    get reshareBody() {
        return (
            <View style={container}>
                <View style={[header, { padding }]}>
                    {icons.darkNoPadding('folder')}
                    <View
                        style={{
                            flexGrow: 1,
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                        <View style={{ marginLeft: vars.spacing.small.midi2x }}>
                            <Text style={infoStyle}>{tx('title_folderUnshared')}</Text>
                        </View>
                        <View>
                            <BlueButtonText text="button_reshare" onPress={this.reshare} />
                        </View>
                    </View>
                </View>
            </View>
        );
    }

    render() {
        const { folder } = this;
        const dmRecipient = chatState.currentChat.otherParticipants[0];
        if (!dmRecipient) return null;
        // TODO temporary solution until SDK supports "owner, editor, viewer" logic
        // If the folder has been unshared, we need to show appropriate UX feedback
        // Check that either the User or Recipient have lost access to the folder
        const showUnshareBody =
            !folder ||
            folder.allParticipants.filter(c => c.username === dmRecipient.username).length === 0 ||
            folder.allParticipants.filter(c => c.username === User.current.username).length === 0;
        if (showUnshareBody) return this.unsharedBody;

        const outer = {
            flex: 1,
            flexGrow: 1,
            paddingHorizontal: padding
        };

        return (
            <TouchableOpacity
                pressRetentionOffset={vars.retentionOffset}
                style={container}
                onPress={this.press}>
                <View style={outer} {...this.props}>
                    {!showUnshareBody ? this.normalBody : this.unsharedBody}
                </View>
            </TouchableOpacity>
        );
    }
}

FolderInlineContainer.propTypes = {
    file: PropTypes.any,
    onLayout: PropTypes.any,
    extraActionIcon: PropTypes.any,
    onAction: PropTypes.any,
    isImage: PropTypes.bool,
    isOpen: PropTypes.bool
};
