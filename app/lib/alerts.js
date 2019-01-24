import { Alert } from 'react-native';

/**
 * This file provides native alerts (dialogs)
 */

function button(style, text, onPress) {
    return { style, text, onPress };
}

const cancel = onPress => button('cancel', 'Cancel', onPress);
const ok = onPress => button('default', 'OK', onPress);

function rnAlertYesNo(title, message) {
    return new Promise((resolve, reject) => {
        Alert.alert(title, message, [
            cancel(() => reject(new Error('user cancelled'))),
            ok(resolve)
        ]);
    });
}

function rnAlertYes(title, message) {
    return new Promise(resolve => {
        Alert.alert(title, message, [ok(resolve)]);
    });
}

module.exports = { rnAlertYesNo, rnAlertYes };
