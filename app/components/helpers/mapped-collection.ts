import { observable, action } from 'mobx';

export abstract class MappedCollection {
    abstract getKey(item: any): string;
    @observable items = [];
    @observable itemsMap = observable.map(null, { deep: false });
    findByItemKey(item) {
        return this.findByKey(this.getKey(item));
    }
    findByKey(key) {
        return this.items.filter(i => this.getKey(i) === key);
    }
    exists(item) {
        return !!this.findByKey(this.getKey(item)).length;
    }
    @action.bound
    add(item) {
        if (this.exists(item)) return;
        this.items.push(item);
        this.itemsMap.set(this.getKey(item), item);
    }
    @action.bound
    remove(item) {
        const existing = this.items.filter(i => this.getKey(i) === this.getKey(item));
        existing.forEach(e => {
            const i = this.items.indexOf(e);
            if (i === -1) return;
            this.items.splice(i, 1);
        });
        this.itemsMap.delete(this.getKey(item));
    }
    @action.bound
    toggle(c) {
        this.exists(c) ? this.remove(c) : this.add(c);
    }
    @action.bound
    clear() {
        this.items = [];
        this.itemsMap.clear();
    }
}
