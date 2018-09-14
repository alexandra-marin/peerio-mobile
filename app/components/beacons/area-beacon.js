import PropTypes from 'prop-types';
import React from 'react';
import { action, observable } from 'mobx';
import { observer } from 'mobx-react/native';
import { View, Dimensions, TouchableOpacity, LayoutAnimation, Image } from 'react-native';
import SafeComponent from '../shared/safe-component';
import { vars } from '../../styles/styles';
import Text from '../controls/custom-text';
import { User } from '../../lib/icebear';
import beaconState from './beacon-state';
import { tx } from '../utils/translator';

const pointerUpImg = require('../../assets/beacon-pointer-up.png');
const pointerDownImg = require('../../assets/beacon-pointer-down.png');
const pointerLeftImg = require('../../assets/beacon-pointer-left.png');
const pointerRightImg = require('../../assets/beacon-pointer-right.png');

const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;

const textStyle = {
    lineHeight: vars.beaconLineHeight,
    fontSize: vars.font.size.smaller,
    color: 'white'
};

@observer
export default class AreaBeacon extends SafeComponent {
    @observable descriptionTextHeight;

    componentWillMount() {
        LayoutAnimation.easeInEaseOut();
    }

    @action.bound onPress() {
        const { id } = this.props;
        beaconState.removeBeacon(id);

        User.current.beacons.set(id, true);
        // we are not waiting for saveBeacons because there's no visual feedback
        User.current.saveBeacons();
    }

    get beaconHeight() {
        const { headerText, descriptionText } = this.props;

        return (
            // Header height + its padding
            (headerText ? vars.beaconLineHeight + vars.beaconPadding : 0) +
            // Description text height (taken from onLayout); is equivalent to lineHeight * numberOfLines
            (descriptionText ? this.descriptionTextHeight : 0) +
            // Container padding
            (2 * vars.beaconPadding));
    }

    // Returns true if beacon is pointing to an element that is in the top half of the screen
    get isParentTop() {
        if (!this.props.position) return null;
        const { pageY: y } = this.props.position;
        return y <= windowHeight / 2;
    }

    // Returns true if beacon is pointing to an element that is in the left half of the screen
    get isParentLeft() {
        if (!this.props.position) return null;
        const { pageX: x } = this.props.position;
        return x <= windowWidth / 2;
    }

    get parentHorizontalPos() {
        return this.props.position.pageX;
    }

    get pointerImgSource() {
        const { sidePointer } = this.props;
        if (!sidePointer && this.isParentTop) return pointerUpImg;
        else if (!sidePointer && !this.isParentTop) return pointerDownImg;
        else if (sidePointer && this.isParentLeft) return pointerLeftImg;
        else if (sidePointer && !this.isParentLeft) return pointerRightImg;
        return null;
    }

    // Need to switch width and height when pointer is on the side
    get pointerHeight() {
        return !this.props.sidePointer ? vars.pointerHeight : vars.pointerWidth;
    }

    // Need to switch width and height when pointer is on the side
    get pointerWidth() {
        return !this.props.sidePointer ? vars.pointerWidth : vars.pointerHeight;
    }

    get pointerHorizontalLeftMost() {
        return {
            containerPositionX: { left: this.parentHorizontalPos - vars.pointerPadding },
            pointerPositionX: { left: vars.pointerPadding }
        };
    }

    get pointerHorizontalOneThird() {
        return {
            containerPositionX: { left: this.parentHorizontalPos - vars.beaconWidth / 3 },
            pointerPositionX: { left: vars.beaconWidth / 3 }
        };
    }

    get pointerHorizontalTwoThirds() {
        return {
            containerPositionX: { right: this.parentHorizontalPos - 2 * vars.beaconWidth / 3 },
            pointerPositionX: { right: vars.beaconWidth / 3 }
        };
    }

    get pointerHorizontalRightMost() {
        return {
            containerPositionX: { right: this.parentHorizontalPos - (vars.beaconWidth + vars.pointerPadding) },
            pointerPositionX: { right: vars.pointerPadding }
        };
    }

    // only have 4 positions for now, even though design wants them to be flexible
    // set beacon position X based on where content is with regards to the width of the screen
    get verticalPointerMeasures() {
        const { position } = this.props;
        if (!position) return null;

        const { pageX: x } = position;

        let measure = 'pointerHorizontalLeftMost';
        if (x >= windowWidth / 4) measure = 'pointerHorizontalOneThird';
        if (x >= windowWidth / 2) measure = 'pointerHorizontalTwoThirds';
        if (x >= windowWidth * 3 / 4) measure = 'pointerHorizontalRightMost';

        return this[measure];
    }

    // only have one position for now which is centered, even though design wants them to be flexible
    get horizontalPointerMeasures() {
        const { pageX, frameWidth } = this.props.position;

        return (this.isParentLeft ? {
            containerPositionX: { left: pageX + frameWidth },
            rectanglePositionX: { right: 0 },
            pointerPositionX: { left: 1 }
        } : {
            containerPositionX: { right: windowWidth - pageX },
            rectanglePositionX: { left: 0 },
            pointerPositionX: { right: 1 }
        });
    }

    get rectanglePositionY() {
        return this.isParentTop ? { bottom: 0 } : { top: 0 };
    }

    get pointerPositionY () {
        if (!this.props.sidePointer) return this.isParentTop ? { top: 1 } : { bottom: 1 };
        return { top: this.beaconHeight / 2 - this.pointerHeight / 2 };
    }

    get containerPositionY() {
        const { pageY, frameHeight } = this.props.position;

        if (!this.props.sidePointer) {
            return (this.isParentTop ?
                { top: pageY + frameHeight } :
                { bottom: windowHeight - (pageY + frameHeight) }
            );
        }
        return { top: pageY - this.beaconHeight / 2 + frameHeight / 2 };
    }

    @action.bound onDescriptionTextLayout(e) {
        const { height } = e.nativeEvent.layout;
        this.descriptionTextHeight = height;
    }

    renderThrow() {
        const { position, headerText, descriptionText } = this.props;

        if (!position || !headerText && !descriptionText) return null;

        let pointerMeasures;
        if (!this.props.sidePointer) pointerMeasures = this.verticalPointerMeasures;
        else if (this.props.sidePointer) pointerMeasures = this.horizontalPointerMeasures;

        const {
            containerPositionX,
            rectanglePositionX,
            pointerPositionX
        } = pointerMeasures;

        const container = [containerPositionX, this.containerPositionY, {
            position: 'absolute',
            width: vars.beaconWidth + (this.props.sidePointer ? vars.pointerHeight : 0),
            height: this.beaconHeight + (!this.props.sidePointer ? vars.pointerHeight : 0)
        }];

        const rectangle = [rectanglePositionX, this.rectanglePositionY, {
            position: 'absolute',
            width: vars.beaconWidth,
            height: this.beaconHeight,
            backgroundColor: vars.beaconBg,
            padding: vars.beaconPadding,
            borderRadius: 8
        }];

        const pointer = [pointerPositionX, this.pointerPositionY, {
            position: 'absolute',
            width: this.pointerWidth,
            height: this.pointerHeight
        }];

        return (
            <View style={container} pointerEvents="box-none">
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={this.onPress}
                    pressRetentionOffset={vars.pressRetentionOffset}
                    style={rectangle}>
                    {headerText && <Text bold style={[textStyle, { paddingBottom: vars.beaconPadding }]}>{tx(headerText)}</Text>}
                    {descriptionText && <Text semibold={!headerText} style={textStyle} onLayout={this.onDescriptionTextLayout}>{tx(descriptionText)}</Text>}
                </TouchableOpacity>
                <Image style={pointer} source={this.pointerImgSource} />
            </View>
        );
    }
}

AreaBeacon.propTypes = {
    id: PropTypes.any,
    position: PropTypes.any,
    headerText: PropTypes.any,
    descriptionText: PropTypes.any
};
