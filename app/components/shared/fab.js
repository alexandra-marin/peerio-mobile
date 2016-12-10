import React, { Component } from 'react';
import {
    View, TouchableOpacity
} from 'react-native';
import { vars, helpers } from '../../styles/styles';
import icons from '../helpers/icons';

const fabStyle = {
    position: 'absolute',
    right: vars.fabRight,
    bottom: vars.fabBottom,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    backgroundColor: '#FF7D00'
};

export default class Fab extends Component {
    render() {
        const s = [fabStyle, helpers.circle(vars.fabSize)];
        return (
            <TouchableOpacity>
                <View style={s} pointerEvents="box-only">
                    {icons.white('add')}
                </View>
            </TouchableOpacity>
        );
    }
}
