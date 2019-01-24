import PropTypes from 'prop-types';
import React from 'react';
import { observer } from 'mobx-react/native';
import { View, FlatList } from 'react-native';
import SafeComponent from '../shared/safe-component';
import { vars } from '../../styles/styles';
import icons from '../helpers/icons';
import branding from '../../styles/branding';
import { tx } from '../utils/translator';
import Text from '../controls/custom-text';

const { bgGradient } = branding;

const container = {
    backgroundColor: vars.folderRemoveNotifBg,
    paddingVertical: vars.spacing.small.midi2x,
    paddingHorizontal: vars.spacing.medium.mini2x
};
const greenWarningLine = {
    height: 4,
    backgroundColor: bgGradient
};
const topTextStyle = {
    flex: 1,
    color: vars.subtleText,
    fontSize: vars.font.size14
};
const listTextStyle = {
    flex: 0.5,
    fontSize: vars.font.size14
};
const bottomTextStyle = {
    color: vars.subtleText,
    fontSize: vars.font.size14
};

@observer
export default class SharedFolderRemovalNotif extends SafeComponent {
    // TODO: Wire up
    dismiss() {
        console.log('Dismissed');
    }

    keyExtractor(item, index) {
        return `${item}-${index}`;
    }

    folderNameListItem = ({ item }) => {
        return (
            <Text semibold style={listTextStyle}>
                {`\u2022 ${item}`}
            </Text>
        );
    };

    get folderList() {
        const { folderNames } = this.props;
        return (
            <FlatList
                style={{ paddingVertical: vars.spacing.small.midi2x }}
                numColumns={2}
                data={folderNames}
                renderItem={this.folderNameListItem}
                keyExtractor={this.keyExtractor}
            />
        );
    }

    renderThrow() {
        const { folderNames } = this.props;
        if (!folderNames || folderNames.length === 0) return null;
        return (
            <View style={{ marginHorizontal: vars.spacing.medium.mini2x }}>
                <View style={greenWarningLine} />
                <View style={container}>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                        <Text style={topTextStyle}>
                            {folderNames.length === 1
                                ? tx('title_sharedFolderRemovalNotif', {
                                      folderName: folderNames[0]
                                  })
                                : tx('title_sharedFoldersRemovalNotif', {
                                      number: folderNames.length
                                  })}
                        </Text>
                        {icons.darkNoPadding('close', this.dismiss)}
                    </View>
                    {folderNames.length > 1 && this.folderList}
                    <Text style={bottomTextStyle}>
                        {folderNames.length === 1
                            ? tx('title_sharedFolderRemovalNotifDesc')
                            : tx('title_sharedFoldersRemovalNotifDesc')}
                    </Text>
                </View>
            </View>
        );
    }
}

SharedFolderRemovalNotif.propTypes = {
    folderNames: PropTypes.any.isRequired
};
