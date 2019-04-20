import { EntryAddModel, EntryModel, EntryUpdateModel } from '../models';

export class SetAllEntries {
    static readonly type = '[Entries] Set All';
    constructor(public entries: EntryModel[]) {}
}

export class AddEntry {
    static readonly type = '[Entries] Add One';
    constructor(public entry: EntryAddModel) {}
}

export class UpdateEntry {
    static readonly type = '[Entries] Update One';
    constructor(public entryId: string, public updates: EntryUpdateModel) {}
}

export class DeleteEntry {
    static readonly type = '[Entries] Delete One';
    constructor(public entryId: string) {}
}
