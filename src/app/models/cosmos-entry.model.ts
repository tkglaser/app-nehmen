import { EntryModel } from './entry.model';

export interface CosmosEntryModel extends EntryModel {
    userId: string;
    type: 'caloriesEntry';
    pk: string; // Partition Key
}
