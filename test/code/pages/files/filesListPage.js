const Page = require('../page');

class FilesListPage extends Page {
    get placeholder() {
        return this.getWhenVisible('~filesZeroState');
    }

    folderNamed(selector) {
        return this.getWhenVisible(`~${selector}`);
    }

    folderNamedVisible(selector) {
        return this.checkIfVisible(`~${selector}`);
    }

    get createFolderOption() {
        return this.getWhenVisible('~Create a folder');
    }

    get deleteOption() {
        return this.getWhenVisible('~Delete');
    }

    get moveOption() {
        return this.getWhenVisible('~Move');
    }

    get shareOption() {
        return this.getWhenVisible('~button_share');
    }

    get confirmDelete() {
        return this.getWhenVisible('~popupButton-confirm');
    }

    get folderNameInput() {
        return this.getWhenVisible('~Enter a folder name');
    }

    get fileNameInput() {
        return this.getWhenVisible('~title_name');
    }

    get fileUploadedPopup() {
        return this.getWhenVisible(`~popupButton-ok`);
    }

    get acceptFolderName() {
        return this.getWhenVisible(`~popupButton-ok`);
    }

    get fileSharePreviewPopup() {
        return this.getWhenVisible(`~popupButton-share`);
    }

    get uploadFileButtton() {
        return this.getWhenVisible('~buttonUploadFileToFiles');
    }

    get optionsButtton() {
        return this.getWhenVisible('~more-vert');
    }

    optionsButttonFor(selector) {
        return this.getElementInContainer(`~${selector}`, '~more-vert');
    }

    get buttonFolderBack() {
        return this.getWhenVisible('~buttonBackIcon');
    }

    get buttonFolderBackExists() {
        return this.checkIfPresent('~buttonBackIcon');
    }
}

module.exports = FilesListPage;
