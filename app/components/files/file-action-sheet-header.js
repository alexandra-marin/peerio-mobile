import React from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react/native';
import { View, TouchableOpacity, Dimensions } from 'react-native';
import { tx } from '../utils/translator';
import Text from '../controls/custom-text';
import SafeComponent from '../shared/safe-component';
import { vars } from '../../styles/styles';
import icons from '../helpers/icons';

const { width } = Dimensions.get('window');

const lineStyle = {
    height: 1,
    width: width - vars.spacing.small.midi2x * 2,
    backgroundColor: vars.actionSheetButtonBorderColor
};

const container = {
    backgroundColor: vars.actionSheetButtonColor,
    justifyContent: 'center',
    alignItems: 'center',
    height: vars.actionSheetOptionHeight,
    width: width - vars.spacing.small.midi2x * 2,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16
};

const infoIconStyle = {
    position: 'absolute',
    right: 16,
    top: 16,
    bottom: 8
};

const infoTextStyle = {
    fontSize: vars.font.size12,
    alignItems: 'center',
    textAlign: 'center',
    paddingHorizontal: vars.spacing.huge.mini2x,
    lineHeight: 16
};

@observer
export default class FileActionSheetHeader extends SafeComponent {
    // Android border color does not work with border radius
    get borderBottom() {
        return <View style={lineStyle} />;
    }

    renderThrow() {
        const { file, onPress } = this.props;
        if (!file) return null;
        return (
            <View style={[container, { backgroundColor: vars.lightGrayBg }]}>
                <TouchableOpacity
                    style={container}
                    onPress={onPress}
                    disabled={!onPress}
                    pressRetentionOffset={vars.retentionOffset}>
                    <View style={{ flex: 1, justifyContent: 'center' }}>
                        <Text style={infoTextStyle} numberOfLines={1} ellipsizeMode="middle">
                            {file.name} {file.isLegacy && tx('title_pending2')}
                        </Text>
                        <Text style={infoTextStyle} numberOfLines={1} ellipsizeMode="middle">
                            {file.sizeFormatted} {moment(file.uploadedAt).format('DD/MM/YYYY')}
                        </Text>
                    </View>
                    {onPress && icons.plaindark('info', vars.iconSize, infoIconStyle)}
                </TouchableOpacity>
                {this.borderBottom}
            </View>
        );
    }
}

FileActionSheetHeader.propTypes = {
    file: PropTypes.any,
    onPress: PropTypes.func
};
