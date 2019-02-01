const Page = require('../page');

class AlertsPage extends Page {
    async dismissNotificationsAlert() {
        try {
            await this.app.waitForExist('~Allow', 5000);
            await this.app.click('~Allow');
        } catch (e) {
            // No push alert present
        }
    }

    // These two functions have a different name but do the same thing
    // This is to specify which popup is intended to be dismissed and avoid confusion
    get peerioClosurePopup() {
        return this.getWhenVisible('~popupButton-ok');
    }

    get emailConfirmationPopup() {
        return this.getWhenVisible('~popupButton-ok');
    }
}

module.exports = AlertsPage;
