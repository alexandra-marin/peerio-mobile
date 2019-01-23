const webDriver = require('webdriverio');
const CreateAccountPage = require('./pages/login/createAccountPage');
const ChatListPage = require('./pages/messaging/chatListPage');
const ContactSelectorPage = require('./pages/messaging/contactSelectorPage');
const ChatPage = require('./pages/messaging/chatPage');
const RoomCreationPage = require('./pages/messaging/roomCreationPage');
const RoomInvitePage = require('./pages/messaging/roomInvitePage');
const FilesListPage = require('./pages/files/filesListPage');
const iOSFactory = require('./helpers/iOSFactory');
const AndroidFactory = require('./helpers/AndroidFactory');
const StartPage = require('./pages/start/startPage');
const LoginPage = require('./pages/login/loginPage');
const HomePage = require('./pages/start/homePage');
const TwoStepVerificationPage = require('./pages/settings/twoStepVerificationPage');
const TwoFactorAuthPrompt = require('./pages/popups/twoFactorAuthPrompt');
const SettingsPage = require('./pages/settings/settingsPage');
const ProfileSettingsPage = require('./pages/settings/profileSettingsPage');
const otplib = require('otplib');
const FileViewPage = require('./pages/files/fileViewPage');
const AlertsPage = require('./pages/popups/alertsPage');
const ContactsPage = require('./pages/contacts/contactsPage');
const ListenerServer = require('../listener/listener-server');

class World {
    constructor({ attach, parameters }) {
        this.attach = attach;
        this.context = parameters.platform === 'ios' ? iOSFactory : AndroidFactory;
        this.listener = ListenerServer.create(parameters.platform);
    }

    destroy() {
        ListenerServer.close();
        this.listener = null;
    }

    openApp() {
        this.app = webDriver.remote(this.context.platform);
        this.app.options.waitforTimeout = 30000;
        this.app.options.screenshotPath = 'test/screenshots';

        this.createPages();

        return this.app.init();
    }

    createPages() {
        this.startPage = new StartPage(this.app);
        this.loginPage = new LoginPage(this.app);
        this.createAccountPage = new CreateAccountPage(this.app);
        this.homePage = new HomePage(this.app);
        this.alertsPage = new AlertsPage(this.app);

        this.chatListPage = new ChatListPage(this.app);
        this.contactSelectorPage = new ContactSelectorPage(this.app);
        this.roomCreationPage = new RoomCreationPage(this.app);
        this.roomInvitePage = new RoomInvitePage(this.app);
        this.chatPage = new ChatPage(this.app);
        this.chatActionSheetPage = this.context.chatActionSheetPage(this.app);

        this.filesListPage = new FilesListPage(this.app);
        this.fileViewPage = new FileViewPage(this.app);
        this.fileUploadPage = this.context.fileUploadPage(this.app);

        this.contactsPage = new ContactsPage(this.app);

        this.settingsPage = this.context.settingsPage(this.app);
        this.twoStepVerificationPage = new TwoStepVerificationPage(this.app);
        this.twoFactorAuthPrompt = new TwoFactorAuthPrompt(this.app);
        this.profileSettingsPage = new ProfileSettingsPage(this.app);
    }

    closeApp() {
        return this.app
            .closeApp()
            .removeApp(this.context.bundleId) // remove app so it doesn't influence next test
            .end(); // end server session and close webdriver
    }

    async takeScreenshot() {
        const image = await this.app.saveScreenshot();
        this.attach(image, 'image/png');
    }

    async goTo2FASetup() {
        await this.homePage.settingsTab.click();

        await this.settingsPage.securityButton.click();
        await this.settingsPage.twoStepVerificationButton.click();

        this.secretKey = await this.twoStepVerificationPage.secretKey.getText();
        console.log('Account secret key', this.secretKey);
    }

    async tryEnterTokenInSettings() {
        const token = otplib.authenticator.generate(this.secretKey);
        console.log(`Trying for secret key ${this.secretKey}, token ${token}`);
        await this.twoStepVerificationPage.confirmationCode.setValue(token);
        await this.twoStepVerificationPage.hideKeyboardHelper();
        await this.twoStepVerificationPage.confirmButton.click();
    }

    async enterTokenInSettings() {
        // might be too slow to enter the correct code, trying several times
        for (let i = 0; i < 3; ++i) {
            try {
                await this.tryEnterTokenInSettings();
                // we successfully enabled 2fa
                if (await this.twoStepVerificationPage.backupCodesVisible) return;
                // possibly to regenerate the code in the next time frame
                await this.app.pause(5000);
            } catch (e) {
                console.log(e);
            }
        }
        throw new Error('Could not enable 2fa in settings');
    }

    async tryEnterTokenInPrompt() {
        const token = otplib.authenticator.generate(this.secretKey);
        console.log(`Trying with this token: ${token}`);
        await this.twoFactorAuthPrompt.tokenInput.setValue(token);
        await this.twoFactorAuthPrompt.hideKeyboardHelper();
        await this.twoFactorAuthPrompt.submitButton.click();
    }

    async enterTokenInPrompt() {
        await this.tryEnterTokenInPrompt();
        // wait for the token to be verified
        await this.app.pause(3000);
        if (await this.twoFactorAuthPrompt.tokenInputPresent) {
            // Retry if token was expired
            await this.tryEnterTokenInPrompt();
        }
    }

    async selectCreateAccount() {
        await this.alertsPage.dismissNotificationsAlert();
        if (await this.loginPage.backButtonVisible) await this.loginPage.backButton.click();
        await this.startPage.createAccountButton.click();
    }

    async typePersonalInfo() {
        this.username = new Date().getTime();
        const email = `${this.username}@test.lan`;
        console.log('Creating account with username', this.username);

        await this.createAccountPage.firstName.setValue('first');
        await this.createAccountPage.hideKeyboardHelper();
        await this.createAccountPage.lastName.setValue('last');
        await this.createAccountPage.hideKeyboardHelper();
        await this.createAccountPage.nextButton.click();

        await this.createAccountPage.username.setValue(this.username);
        await this.createAccountPage.hideKeyboardHelper();
        await this.createAccountPage.nextButton.click();

        await this.createAccountPage.email.setValue(email);
        await this.createAccountPage.hideKeyboardHelper();

        await this.createAccountPage.createButton.click();
    }

    async savePasscode() {
        await this.createAccountPage.passphrase.getText().then(innerText => {
            this.passphrase = innerText;
        });
        console.log('Creating account with passphrase', this.passphrase);
    }

    async acceptTerms() {
        await this.createAccountPage.copyButton.click();
        await this.createAccountPage.nextButton.click();

        await this.contactsPage.snackbar.click();

        await this.createAccountPage.acceptButton.click();
        await this.createAccountPage.shareButton.click();
    }

    async seeWelcomeScreen() {
        await this.homePage.isVisible;
        await this.homePage.chatTab.click();
    }

    async dismissEmailConfirmationPopup() {
        if (this.alertsPage.emailConfirmationPopup.isVisible()) {
            this.alertsPage.emailConfirmationPopup.click();
        }
    }

    async loginExistingAccount(username, passphrase) {
        await this.alertsPage.dismissNotificationsAlert();

        // Go back from "welcome back screen" to "welcome screen"
        if (await this.loginPage.backButtonVisible) {
            await this.loginPage.backButton.click();
        }
        await this.startPage.loginButton.click();

        await this.loginPage.username.setValue(username);
        await this.loginPage.hideKeyboardHelper();
        await this.loginPage.passphrase.setValue(passphrase);
        await this.loginPage.hideKeyboardHelper();
        await this.loginPage.submitButton.click();
    }

    async loginExistingAccountWithout2FA(username, passphrase) {
        await this.loginExistingAccount(username, passphrase);

        await this.dismissEmailConfirmationPopup();
        await this.seeWelcomeScreen();
    }

    async loginExistingAccountWith2FA(username, passphrase) {
        await this.loginExistingAccount(username, passphrase);

        await this.enterTokenInPrompt();

        await this.dismissEmailConfirmationPopup();
        await this.seeWelcomeScreen();
    }

    // username is optional
    async createNewAccount() {
        await this.selectCreateAccount();
        await this.typePersonalInfo();
        await this.savePasscode();
        await this.acceptTerms();
        await this.seeWelcomeScreen();
        await this.dismissEmailConfirmationPopup();
    }

    async createHelperAccount(params) {
        await this.selectCreateAccount();
        const { username, passphrase } = await this.listener.request(
            `signupState.testQuickSignup(${JSON.stringify(params || {})})`
        );
        Object.assign(this, { helperUsername: username, helperPassphrase: passphrase });
    }

    async callQuickSignup(params) {
        await this.selectCreateAccount();
        const result = await this.listener.request(
            `signupState.testQuickSignup(${JSON.stringify(params || {})})`
        );
        const { username, passphrase } = result;
        Object.assign(this, { username, passphrase });
        await this.seeWelcomeScreen();
    }

    async logout() {
        await this.homePage.settingsTab.click();
        await this.homePage.scrollDownHelper();
        await this.settingsPage.logoutButton.click();
        await this.settingsPage.lockButton.click();
        await this.loginPage.passphrase;
        await this.app.closeApp();
        await this.app.launch();
    }

    async scrollToChat() {
        await this.homePage.isVisible;

        // Wait for rooms to load, otherwise position will change
        await this.app.pause(5000);

        while (!(await this.chatListPage.chatWithTitleIsVisible(this.roomName))) {
            // eslint-disable-line
            await this.chatListPage.scrollDownHelper(); // eslint-disable-line
        }
    }

    async openContactsPickerForDM() {
        await this.homePage.chatTab.click();
        await this.chatListPage.buttonCreateNewChat.click();
        await this.chatActionSheetPage.newDmOption.click();
    }

    async searchForRecipient(recipientName) {
        await this.contactSelectorPage.textInput.setValue(recipientName);
        await this.contactSelectorPage.hideKeyboardHelper();
    }

    async scrollToContact() {
        await this.homePage.contactsTab.click();
        while (!(await this.contactsPage.contactVisible)) {
            // eslint-disable-line
            await this.contactsPage.scrollDownHelper(); // eslint-disable-line
        }
    }

    async favoriteContact() {
        await this.scrollToContact();
        await this.contactsPage.contactFound.click();
        await this.contactsPage.favoriteButton.click();
        await this.contactsPage.backButton.click();
    }

    async addContactWithName(name) {
        await this.contactsPage.searchContactInput.setValue(name);
        await this.contactsPage.hideKeyboardHelper();
        await this.contactsPage.searchContactButton.click();

        const snackbarMessage = await this.contactsPage.snackbar.getText();
        snackbarMessage.should.match(/has been added/);
    }

    async inviteContactWithEmail(email) {
        await this.contactsPage.searchContactInput.setValue(email);
        await this.contactsPage.hideKeyboardHelper();
        await this.contactsPage.searchContactButton.click();
        await this.contactsPage.inviteContactButton.click();
    }
}

module.exports = World;
