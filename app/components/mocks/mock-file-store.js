import randomWords from 'random-words';
import capitalize from 'capitalize';
import { observable } from 'mobx';
import fileState from '../files/file-state';

class MockFileStore {
    files = [];
    isEmpty = false;

    constructor() {
        for (let i = 0; i < 15; ++i) {
            this.files.push(this.createMock());
        }
    }

    bulk = {};

    get folderStore() {
        return {
            currentFolder: {
                get filesAndFoldersDefaultSorting() {
                    return fileState.store.files;
                }
            }
        };
    }

    createMock() {
        const id = `file:${randomWords({ min: 1, max: 4, join: '-' })}`;
        const fileId = id;
        const name = capitalize(`${randomWords({ min: 1, max: 2, join: '_' })}.png`);
        const sizeFormatted = '118 Kb';
        return observable({
            id,
            fileId,
            name,
            ext: 'png',
            sizeFormatted
        });
    }

    getById(id) {
        return this.files.find(f => f.id === id);
    }
}

export default MockFileStore;
