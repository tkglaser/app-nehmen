import { Entry } from '../models';

export class SetAllEntries {
    static readonly type = '[Entries] Set All';
    constructor(public entries: Entry[]) {}
}

export class AddEntry {
    static readonly type = '[Entries] Add One';
    constructor(public entry: Entry) {}
}

export class DeleteEntry {
    static readonly type = '[Entries] Delete One';
    constructor(public entryId: string) {}
}
