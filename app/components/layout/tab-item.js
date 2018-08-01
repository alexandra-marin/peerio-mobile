import PropTypes from 'prop-types';
import React from 'react';
import { action, observable } from 'mobx';
import { observer } from 'mobx-react/native';
import { View, TouchableOpacity } from 'react-native';
import Text from '../controls/custom-text';
import SafeComponent from '../shared/safe-component';
import { vars } from '../../styles/styles';
import fileState from '../files/file-state';
import routerMain from '../routes/router-main';
import icons from '../helpers/icons';
import testLabel from '../helpers/test-label';
import uiState from './ui-state';

const actionCellStyle = {
    flex: 1,
    borderWidth: 1,
    borderColor: 'green',
    alignItems: 'center',
    height: vars.tabCellHeight,
    justifyContent: 'center'
};

const actionTextStyle = {
    color: vars.white
};

@observer
export default class TabItem extends SafeComponent {
    @observable layoutLoaded = false;

    @action.bound onPressTabItem() {
        const { route } = this.props;
        if (routerMain.route === route) {
            if (routerMain.route === 'files') {
                fileState.goToRoot();
            }
            if (uiState.currentScrollView.scrollTo) {
                uiState.currentScrollView.scrollTo(0);
            } else if (uiState.currentScrollView.scrollToIndex) {
                uiState.currentScrollView.scrollToIndex({ index: 0 });
            } else {
                uiState.currentScrollView.scrollToLocation(
                    {
                        itemIndex: 0,
                        sectionIndex: 0,
                        viewOffset: vars.contactListHeaderHeight,
                        viewPosition: 0
                    });
            }
        } else {
            routerMain[route]();
        }
    }

    setRef = ref => {
        this.viewRef = ref;
    };

    layout = () => {
        this.viewRef.measure(
            (frameX, frameY, frameWidth, frameHeight, pageX, pageY) => {
                console.log(`frameX: ${frameX}, frameY: ${frameY}, pageX: ${pageX}, ${pageY}`);
                this.pageX = pageX;
                this.pageY = pageY;
                this.layoutLoaded = true;
            });
    };

    renderThrow() {
        const { text, route, icon, bubble, highlightList } = this.props;
        let color = vars.tabsFg;
        if ((routerMain.route === route) || (highlightList && highlightList.includes(routerMain.route))) {
            color = vars.peerioBlue;
        }
        const indicator = bubble ? (
            <View style={{ position: 'absolute', right: -5, top: 0 }}>
                {icons.bubble('')}
            </View>
        ) : null;
        return (
            <TouchableOpacity
                {...testLabel(icon)}
                onPress={this.onPressTabItem}
                pressRetentionOffset={vars.retentionOffset}
                ref={this.setRef}
                style={actionCellStyle}>
                <View
                    onLayout={this.layout}
                    pointerEvents="none" style={{ alignItems: 'center' }}>
                    <View style={{ borderWidth: 1, borderColor: 'yellow' }}>
                        {icons.plain(icon, undefined, color)}
                    </View>
                    <Text style={[actionTextStyle, { color }]}>{text}</Text>
                    {indicator}
                </View>
            </TouchableOpacity>
        );
    }
}

TabItem.propTypes = {
    text: PropTypes.any,
    route: PropTypes.any,
    icon: PropTypes.any,
    bubble: PropTypes.any,
    highlightList: PropTypes.any
};
