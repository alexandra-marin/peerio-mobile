const { Then } = require('cucumber');

Then('I have added contacts', async function() {
    await this.homePage.contactsTab.click();
    // New user doesn't have contact list
    await this.contactsPage.addContactButton.click();

    await this.addContactWithName(process.env.CHAT_RECIPIENT_USER);
    await this.addContactWithName(process.env.CREATE_DM_TEST_USER);
    await this.addContactWithName(process.env.CREATE_ROOM_TEST_USER);
});

Then('I add a contact from the contacts tab', async function() {
    await this.homePage.contactsTab.click();
    // New user doesn't have contact list
    await this.contactsPage.addContactButton.click();

    await this.addContactWithName(process.env.CHAT_RECIPIENT_USER);
    await this.homePage.contactsTab.click();
});

Then('they are in my contacts', async function() {
    await this.scrollToContact();
    await this.contactsPage.contactFound;
});

Then('I favorite someone', async function() {
    await this.favoriteContact();
});

Then('I unfavorite someone', async function() {
    await this.favoriteContact();
});

Then('I open the contacts picker', async function() {
    await this.openContactsPickerForDM();
});

Then('they show up first in the contacts picker', async function() {
    await this.contactSelectorPage.firstContact;
    await this.contactSelectorPage.closeButton.click();
});

Then('they are no longer at the top of the contacts picker', async function() {
    const isFirst = await this.contactSelectorPage.notFirstContact;
    isFirst.should.be.false; // eslint-disable-line
});

Then('I search for someone', async function() {
    await this.searchForRecipient(process.env.CHAT_RECIPIENT_USER);
});

Then('do not start a chat with them', async function() {
    await this.contactSelectorPage.closeButton.click();
});

Then('they are not in my contact list', async function() {
    await this.homePage.contactsTab.click();

    const contactVisible = await this.contactsPage.contactVisible;
    contactVisible.should.be.false; // eslint-disable-line
});

Then('I invite someone to join Peerio', async function() {
    await this.listener.request(`beaconState.dismissAll()`);
    await this.homePage.contactsTab.click();
    await this.contactsPage.addContactButton.click();
    this.invitationEmail = `${new Date().getTime()}@test.lan`;
    await this.inviteContactWithEmail(this.invitationEmail);
});
