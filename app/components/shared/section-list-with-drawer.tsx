import React from 'react';
import { SectionList, Platform } from 'react-native';
import { observer } from 'mobx-react/native';
import { action } from 'mobx';
import { vars } from '../../styles/styles';
import ListWithDrawer from './list-with-drawer';
import { setScrollHelperRef, setScrollHelperOnScroll } from '../helpers/test-helper';

@observer
export default class SectionListWithDrawer extends ListWithDrawer {
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
        try {
            // TODO: undocumented react-native reference
            // subject to change
            const offset = vars.topDrawerHeight;
            if (Platform.OS === 'android') {
                this.scrollView.scrollToLocation({
                    sectionIndex: 0,
                    itemIndex: -1,
                    animated
                });
            } else {
                this.scrollView._wrapperListRef._listRef.scrollToOffset({
                    offset,
                    animated
                });
            }
        } catch (e) {
            console.error(e);
        }
    };

    scrollToStart = animated => {
        try {
            // TODO: undocumented react-native reference
            // subject to change
            if (Platform.OS === 'android') {
                this.scrollView.scrollToLocation({
                    sectionIndex: 0,
                    itemIndex: -1,
                    // android calculates offset of list header differently
                    viewOffset: this.topDrawer ? vars.topDrawerHeight : 0,
                    animated
                });
            } else {
                this.scrollView._wrapperListRef._listRef.scrollToOffset({
                    offset: 0,
                    animated
                });
            }
        } catch (e) {
            console.error(e);
        }
    };

    onScrollToIndexFailed = () => {
        console.debug(`section-list-with-drawer: on scroll to index failed`);
    };

    renderThrow() {
        return (
            <SectionList
                onScrollToIndexFailed={this.onScrollToIndexFailed}
                ref={this.scrollViewRef}
                scrollEventThrottle={1}
                {...this.props}
                sections={this.props.sections}
                onScroll={setScrollHelperOnScroll}
                ListHeaderComponent={this.topDrawer}
            />
        );
    }
}
