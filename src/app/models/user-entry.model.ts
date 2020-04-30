import { EntryModel } from './entry.model';

export interface UserEntryModel extends EntryModel {
    userId: string;
    type: 'caloriesEntry';
}
