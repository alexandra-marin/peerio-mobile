const Page = require('../page');

class HomePage extends Page {
    get chatTab() {
        return this.getWhenVisible('~forum');
    }

    get filesTab() {
        return this.getWhenVisible('~folder');
    }

    get contactsTab() {
        return this.getWhenVisible('~people');
    }

    get settingsTab() {
        return this.getWhenVisible('~settings');
    }

    get isVisible() {
        return this.app.waitForVisible('~forum');
    }

    get gotItButton() {
        return this.getWhenVisible('~popupButton-gotIt');
    }
}

module.exports = HomePage;
