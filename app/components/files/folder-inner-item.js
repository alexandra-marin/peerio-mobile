import PropTypes from 'prop-types';
import React from 'react';
import { observer } from 'mobx-react/native';
import { Text, View, TouchableOpacity } from 'react-native';
import moment from 'moment';
import SafeComponent from '../shared/safe-component';
import { vars, helpers } from '../../styles/styles';
import icons from '../helpers/icons';
import { tx } from '../utils/translator';

const height = vars.listItemHeight;
const itemContainerStyle = {
    flex: 1,
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: vars.darkBlueBackground05,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, .12)',
    height,
    borderWidth: 0,
    borderColor: 'red',
    paddingLeft: vars.spacing.medium.mini2x
};

const folderInfoContainerStyle = {
    flexGrow: 1,
    flexDirection: 'row'
};

@observer
export default class FolderInnerItem extends SafeComponent {
    onPress = () => this.props.onPress && this.props.onPress(this.props.folder);

    get radio() {
        if (!this.props.radio) return null;
        const outer = {
            width: vars.listItemHeight,
            height: vars.listItemHeight,
            alignItems: 'center',
            justifyContent: 'center',
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(0, 0, 0, .12)'
        };
        const s = [helpers.circle(20), {
            backgroundColor: vars.white,
            borderColor: vars.txtMedium,
            borderWidth: 2
        }];
        return (
            <TouchableOpacity
                onPress={this.props.onSelect}
                pressRetentionOffset={vars.pressRetentionOffset}>
                <View style={outer}>
                    <View style={s} />
                </View>
            </TouchableOpacity>
        );
    }

    renderThrow() {
        const { folder, onPress, onLongPress, onSelect, hideArrow } = this.props;
        const nameStyle = {
            color: vars.txtDark,
            fontSize: vars.font.size.normal,
            fontWeight: vars.font.weight.bold
        };
        const infoStyle = {
            color: vars.subtleText,
            fontSize: vars.font.size.smaller,
            fontWeight: vars.font.weight.regular
        };
        const loadingStyle = null;
        const arrow = hideArrow ? null : (
            <View style={{ flex: 0 }}>
                {icons.dark('keyboard-arrow-right', this.onPress)}
            </View>
        );
        return (
            <View style={{ backgroundColor: vars.chatItemPressedBackground }}>
                <TouchableOpacity
                    onLongPress={onLongPress}
                    onPress={hideArrow ? onSelect : onPress}
                    style={{ backgroundColor: vars.darkBlueBackground05 }}>
                    <View style={folderInfoContainerStyle}>
                        {this.radio}
                        <View style={itemContainerStyle}>
                            <View style={[loadingStyle, { flex: 0 }]}>
                                {icons.darkNoPadding('folder', null, null, vars.iconSize)}
                            </View>
                            <View style={{ flexGrow: 1, flexShrink: 1, marginLeft: vars.spacing.medium.maxi2x }}>
                                <Text style={nameStyle} numberOfLines={1} ellipsizeMode="tail">{folder.isRoot ? tx('title_files') : folder.name}</Text>
                                <Text style={infoStyle}>
                                    {folder.size ?
                                        <Text>{folder.sizeFormatted}</Text> :
                                        <Text>{tx('title_empty')}</Text>}
                                    &nbsp;&nbsp;
                                    {folder.createdAt && moment(folder.createdAt).format('DD/MM/YYYY')}
                                </Text>
                            </View>
                            {arrow}
                        </View>
                    </View>
                </TouchableOpacity>
            </View>
        );
    }
}

FolderInnerItem.propTypes = {
    onPress: PropTypes.func,
    onSelect: PropTypes.func,
    folder: PropTypes.any.isRequired,
    hideArrow: PropTypes.bool,
    radio: PropTypes.bool
};
