import React from 'react';
import { View, ScrollView } from 'react-native';
import { observer } from 'mobx-react/native';
import { action, observable } from 'mobx';
import { vars } from '../../styles/styles';
import ListWithDrawer from './list-with-drawer';
import { setScrollHelperRef, setScrollHelperOnScroll } from '../helpers/test-helper';

@observer
export default class ViewWithDrawer extends ListWithDrawer {
    @observable layoutHeight;
    scrollView: ScrollView;

    @action.bound
    scrollViewRef(sv) {
        this.props.setScrollViewRef && this.props.setScrollViewRef(sv);
        this.scrollView = sv;
        setScrollHelperRef(sv);
    }

    scrollDrawerOutOfView = animated => {
        this.scrollView &&
            this.scrollView.scrollTo({
                y: vars.topDrawerHeight,
                animated
            });
    };

    scrollToStart = animated => {
        this.scrollView &&
            this.scrollView.scrollTo({
                y: 0,
                animated
            });
    };

    onLayout = event => {
        this.layoutHeight = event.nativeEvent.layout.height;
    };

    onScroll = event => {
        if (this.props.onScroll) this.props.onScroll(event);
        setScrollHelperOnScroll(event);
    };

    renderThrow() {
        const minHeight =
            this.layoutHeight + (this.androidExtraScrollingSpace ? vars.topDrawerHeight : 0);
        return (
            <ScrollView
                onLayout={this.onLayout}
                ref={this.scrollViewRef}
                scrollEventThrottle={1}
                {...this.props}
                onScroll={this.onScroll}>
                {this.topDrawer}
                <View style={{ minHeight }}>{this.props.children}</View>
            </ScrollView>
        );
    }
}
