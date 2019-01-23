import React from 'react';
import { observer } from 'mobx-react/native';
import { Dimensions, View, ViewStyle } from 'react-native';
import moment from 'moment';
import Text from '../controls/custom-text';
import SafeComponent from '../shared/safe-component';
import { vars } from '../../styles/styles';
import icons from '../helpers/icons';
import FileTypeIcon from './file-type-icon';
import { fileHelpers } from '../../lib/icebear';
import { File } from '../../lib/peerio-icebear/models';

const { width } = Dimensions.get('window');
const height = 64;

const fileInfoContainerStyle: ViewStyle = {
    flexGrow: 1,
    flexDirection: 'row'
};

export interface RecentFileItemProps {
    file?: File;
    onMenu?: Function;
    hideArrow?: boolean;
}

@observer
export default class RecentFileItem extends SafeComponent<RecentFileItemProps> {
    renderThrow() {
        const { file, onMenu, hideArrow } = this.props;
        if (file.deleted) return null;
        const iconRight = icons.dark('more-vert', onMenu);
        const nameStyle = {
            color: vars.txtDark,
            fontSize: vars.font.size14
        };
        const infoStyle = {
            color: vars.extraSubtleText,
            fontSize: vars.font.size12
        };
        const itemContainerStyle: ViewStyle = {
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
        const arrow = hideArrow ? null : <View style={{ flex: 0 }}>{iconRight}</View>;
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
