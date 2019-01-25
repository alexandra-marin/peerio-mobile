import React from 'react';
import { FlatList } from 'react-native';
import { observer } from 'mobx-react/native';
import { action } from 'mobx';
import { vars } from '../../styles/styles';
import ListWithDrawer from './list-with-drawer';
import { setScrollHelperRef, setScrollHelperOnScroll } from '../helpers/test-helper';

@observer
export default class FlatListWithDrawer extends ListWithDrawer {
    scrollView: any;
    @action.bound
    scrollViewRef(sv) {
        this.props.setScrollViewRef && this.props.setScrollViewRef(sv);
        this.scrollView = sv;
        // avoid using more than one list in a view
        // to not confuse scrollHelper
        setScrollHelperRef(sv);
    }

    scrollDrawerOutOfView = animated => {
        this.scrollView &&
            this.scrollView.scrollToOffset({
                offset: vars.topDrawerHeight,
                animated
            });
    };

    scrollToStart = animated => {
        this.scrollView &&
            this.scrollView.scrollToOffset({
                offset: 0,
                animated
            });
    };

    renderThrow() {
        return (
            <FlatList
                scrollEventThrottle={1}
                {...this.props}
                data={this.props.data}
                renderItem={this.props.renderItem}
                onScroll={setScrollHelperOnScroll}
                ref={this.scrollViewRef}
                ListHeaderComponent={this.topDrawer}
            />
        );
    }
}
