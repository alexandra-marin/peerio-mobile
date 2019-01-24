import PropTypes from 'prop-types';
import React from 'react';
import { observer } from 'mobx-react/native';
import { Dimensions, View } from 'react-native';
import moment from 'moment';
import Text from '../controls/custom-text';
import SafeComponent from '../shared/safe-component';
import { vars } from '../../styles/styles';
import icons from '../helpers/icons';
import FileTypeIcon from './file-type-icon';
import { fileHelpers } from '../../lib/icebear';

const { width } = Dimensions.get('window');
const height = 64;

const fileInfoContainerStyle = {
    flexGrow: 1,
    flexDirection: 'row'
};

@observer
export default class RecentFileItem extends SafeComponent {
    renderThrow() {
        const { file } = this.props;
        if (file.deleted) return null;
        const iconRight = icons.dark('more-vert', this.props.onMenu);
        const nameStyle = {
            color: vars.txtDark,
            fontSize: vars.font.size14
        };
        const infoStyle = {
            color: vars.extraSubtleText,
            fontSize: vars.font.size12
        };
        const itemContainerStyle = {
            flex: 1,
            flexGrow: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(0, 0, 0, .12)',
            height,
            width,
            paddingLeft: vars.spacing.medium.mini2x
        };
        const arrow = this.props.hideArrow ? null : <View style={{ flex: 0 }}>{iconRight}</View>;
        return (
            <View style={fileInfoContainerStyle}>
                <View style={[itemContainerStyle, { width }]}>
                    <View style={{ flex: 0, paddingRight: vars.fileInnerItemPaddingRight }}>
                        {<FileTypeIcon size="small" type={fileHelpers.getFileIconType(file.ext)} />}
                    </View>
                    <View
                        style={{
                            flexGrow: 1,
                            flexShrink: 1,
                            marginLeft: vars.spacing.medium.mini2x
                        }}>
                        <Text style={nameStyle} numberOfLines={1} ellipsizeMode="tail">
                            {file.name}
                        </Text>
                        <Text style={infoStyle}>
                            {moment(file.uploadedAt).format('DD/MM/YYYY')}
                            {' - '}
                            {file.fileOwner}
                        </Text>
                    </View>
                    {arrow}
                </View>
            </View>
        );
    }
}

RecentFileItem.propTypes = {
    file: PropTypes.any.isRequired,
    onMenu: PropTypes.func
};
