import React from 'react';
import { observer } from 'mobx-react/native';
import { observable, action } from 'mobx';
import { View, TouchableOpacity, Platform, TextStyle, ViewStyle } from 'react-native';
import Text from '../controls/custom-text';
import SafeComponent from './safe-component';
import { vars } from '../../styles/styles';
import icons from '../helpers/icons';
import FileTypeIcon from '../files/file-type-icon';
import Thumbnail from './thumbnail';
import { fileHelpers } from '../../lib/icebear';
import { transitionAnimation } from '../helpers/animations';

const height = 42;
// height minus borders
const innerHeight = height - 3;
const pbContainer = {
    backgroundColor: vars.white,
    borderColor: vars.lightGrayBg,
    borderBottomWidth: 1,
    borderTopWidth: 2
};
const pbProgress = {
    // these margins pull out the progress
    // bar background a bit to cover over
    // borders of the outer container
    marginTop: -1,
    marginBottom: -1,
    height: innerHeight,
    backgroundColor: vars.peerioBlueBackground15,
    borderWidth: 0,
    borderColor: 'red'
};
const row: ViewStyle = {
    // minus overlapping border
    height: innerHeight - 2,
    left: 0,
    right: 0,
    flexDirection: 'row',
    position: 'absolute',
    alignItems: 'center',
    marginLeft: 16
};
const titleText = {
    backgroundColor: 'transparent',
    color: vars.subtleText,
    marginLeft: 16,
    flexShrink: 1
};
const percentText: TextStyle = {
    backgroundColor: 'transparent',
    color: vars.extraSubtleText,
    fontStyle: 'italic',
    width: 44,
    marginLeft: 4
};
const iconStyle: ViewStyle = {
    position: 'absolute',
    top: 6,
    bottom: 0,
    right: 0
};

interface ProgressProps {
    value: number;
    max: number;
    hidden: boolean;
    title: string;
    onCancel: Function;
    path: string;
    file;
}

@observer
export default class Progress extends SafeComponent<ProgressProps> {
    @observable width = 0;
    @observable visible = false;
    hidden: any;

    get currentWidth() {
        const { value, max } = this.props;
        const { width } = this;
        if (!width || !max) return 0;
        return (width * value) / max;
    }

    @action.bound
    layout(evt) {
        this.width = evt.nativeEvent.layout.width;
    }

    componentWillUpdate() {
        // android may break on LayoutAnimation
        if (Platform.OS === 'android') return;
        transitionAnimation();
    }

    componentDidMount() {
        setTimeout(() => {
            this.visible = true;
        }, 0);
    }

    @action.bound
    cancel() {
        this.visible = false;
        this.props.onCancel && this.props.onCancel();
    }

    get previewImage() {
        const size = vars.fileType.small;
        const s = {
            width: size,
            height: size
        };
        return <Thumbnail path={this.props.path} style={s} />;
    }

    renderFileProgress() {
        const { file, value, max } = this.props;
        const animation = { height: this.visible ? height - 2 : 0 };
        let fileImagePlaceholder = null;
        const fileIconType = fileHelpers.getFileIconType(file.ext);
        if (fileIconType) {
            fileImagePlaceholder = <FileTypeIcon size="smaller" type={fileIconType} />;
        }
        if (fileHelpers.isImage(file.ext) && this.props.path) {
            fileImagePlaceholder = this.previewImage;
        }
        return (
            <View style={animation}>
                <View
                    style={[pbContainer, { opacity: this.hidden ? 0 : 1 }]}
                    onLayout={this.layout}>
                    <View style={[pbProgress, { width: this.currentWidth }]} />
                    <View style={row}>
                        {fileImagePlaceholder}
                        <Text style={titleText} numberOfLines={1} ellipsizeMode="middle">
                            {this.props.title}
                        </Text>
                        <Text style={[percentText, { marginRight: 56 }]} numberOfLines={1}>
                            ({Math.min(Math.ceil((100 * value) / max), 100)}%)
                        </Text>
                        <TouchableOpacity
                            style={iconStyle}
                            onPress={this.cancel}
                            pressRetentionOffset={vars.retentionOffset}>
                            {icons.plaindark('cancel', this.plus, {
                                paddingHorizontal: 16,
                                backgroundColor: 'transparent'
                            })}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    }
    plus(): React.ReactNode {
        throw new Error('Method not implemented.');
    }

    renderFolderProgress() {
        const { value, max } = this.props;
        const animation = { height: this.visible ? height - 2 : 0 };
        return (
            <View style={animation}>
                <View
                    style={[pbContainer, { opacity: this.hidden ? 0 : 1 }]}
                    onLayout={this.layout}>
                    <View style={[pbProgress, { width: this.currentWidth }]} />
                    <View style={row}>
                        {icons.plain('folder-shared', vars.iconSize, vars.subtleText)}
                        <Text style={titleText} numberOfLines={1} ellipsizeMode="middle">
                            {this.props.title}
                        </Text>
                        <Text style={percentText} numberOfLines={1}>
                            ({Math.min(Math.ceil((100 * value) / max), 100)}%)
                        </Text>
                    </View>
                </View>
            </View>
        );
    }

    renderThrow() {
        if (this.hidden) return null;
        const { max, file } = this.props;
        if (!max) return null;
        if (file.isFolder) return this.renderFolderProgress();
        return this.renderFileProgress();
    }
}
