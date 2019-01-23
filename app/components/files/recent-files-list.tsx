import React from 'react';
import { observer } from 'mobx-react/native';
import { SectionList, View } from 'react-native';
import SafeComponent from '../shared/safe-component';
import chatState from '../messaging/chat-state';
import ChatInfoSectionHeader from '../messaging/chat-info-section-header';
import RecentFileItem from './recent-file-item';
import FileActionSheet from './file-action-sheet';
import { tx } from '../utils/translator';

const INITIAL_LIST_SIZE = 25;

export interface RecentFilesListProps {
    collapsed?: boolean;
    toggleCollapsed?: OnPressResponder;
}

@observer
export default class RecentFilesList extends SafeComponent<RecentFilesListProps> {
    get sections() {
        return [
            { data: chatState.currentChat.recentFiles, key: tx('title_recentFiles') as string }
        ];
    }

    get hasData() {
        return chatState.currentChat.recentFiles.length;
    }

    item = ({ item }) => {
        const collapsible = chatState.currentChat.isChannel;
        const isCollapsed = !chatState.collapseFirstChannelInfoList;
        if (collapsible && isCollapsed) return null;
        if (!item) return null;
        // TODO: replace with getOrMake pattern
        // for event handler
        return (
            <RecentFileItem
                onMenu={() => FileActionSheet.show({ file: item })}
                key={item.fileId}
                file={item}
            />
        );
    };

    header = ({ section: { key } }: { section: { key?: string } }) => {
        const { collapsed, toggleCollapsed } = this.props;
        return (
            <ChatInfoSectionHeader
                key={key}
                title={key}
                collapsed={collapsed}
                toggleCollapsed={toggleCollapsed}
                hidden={!this.hasData}
            />
        );
    };

    filesListActionSheet = ref => {
        this.filesListActionSheet = ref;
    };

    renderThrow() {
        return (
            <View>
                <SectionList
                    initialNumToRender={INITIAL_LIST_SIZE}
                    sections={this.sections}
                    keyExtractor={file => file.fileId}
                    renderItem={this.item}
                    renderSectionHeader={this.header}
                    style={{ marginBottom: 8 }}
                />
            </View>
        );
    }
}
