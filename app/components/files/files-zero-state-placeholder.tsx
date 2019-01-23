import React from 'react';
import { observer } from 'mobx-react/native';
import { View, Dimensions, Image, ViewStyle, TextStyle } from 'react-native';
import Text from '../controls/custom-text';
import SafeComponent from '../shared/safe-component';
import { tx } from '../utils/translator';
import { vars } from '../../styles/styles';
import ViewWithDrawer from '../shared/view-with-drawer';
import testLabel from '../helpers/test-label';

const fileUploadZeroState = require('../../assets/file-upload-zero-state.png');

const outerContainer: ViewStyle = {
    flexShrink: 1,
    width: Dimensions.get('window').width,
    justifyContent: 'center',
    padding: vars.spacing.huge.mini,
    paddingTop: vars.spacing.large.mini
};
const imageStyle = {
    width: Dimensions.get('window').width,
    height: 275
};
const headerStyle: TextStyle = {
    color: vars.textBlack87,
    textAlign: 'center',
    fontSize: vars.font.size20
};
const labelStyle: TextStyle = {
    marginVertical: vars.spacing.medium.midi,
    color: vars.textBlack87,
    textAlign: 'center',
    fontSize: vars.font.size14
};

export interface FilesPlaceholderProps {
    emptyFolder?: boolean;
}

@observer
export default class FilesPlaceholder extends SafeComponent<FilesPlaceholderProps> {
    get title() {
        if (this.props.emptyFolder) {
            return (
                <Text style={[headerStyle, { marginVertical: vars.spacing.large.midi }]} bold>
                    {tx('title_emptyFolder')}
                </Text>
            );
        }
        return (
            <View>
                <Text style={headerStyle} bold>
                    {tx('title_zeroFiles')}
                </Text>
                <Text style={labelStyle}>{tx('title_zeroFilesSubtitle')}</Text>
            </View>
        );
    }

    renderThrow() {
        return (
            <ViewWithDrawer {...testLabel('filesZeroState')}>
                <View style={outerContainer}>
                    {this.title}
                    <Image source={fileUploadZeroState} resizeMode="contain" style={imageStyle} />
                    <Text style={labelStyle}>{tx('description_empty_folder')}</Text>
                </View>
            </ViewWithDrawer>
        );
    }
}
