import { ActionReducerMap } from '@ngrx/store';

import * as ConfigStore from './config.reducer';
import * as EntriesStore from './entries.reducer';
import { EntryModel, AutoSuggestionModel } from '../models';

export interface AppState {
    config: ConfigStore.State;
    entries: EntriesStore.State;
}

export const reducers: ActionReducerMap<AppState> = {
    config: ConfigStore.reducer,
    entries: EntriesStore.reducer,
};

export const selectConfig = (state: AppState) => state.config;
export const selectEntriesByDay = (day: string) => (state: AppState) =>
    state.entries.filter((entry) => entry.day === day);
export const selectEntryById = (id: string) => (state: AppState) =>
    state.entries.find((entry) => entry.id === id);
export const selectHasEntriesOlderThan = (day: string) => (state: AppState) =>
    state.entries.some((entry) => entry.day <= day);
export const selectAutoSuggestions = (key: string) => ({
    entries,
}: AppState) => {
    const groupKey = (e: EntryModel): string =>
        `${e.description}#${e.calories}`;

    if (!key || !key.length) {
        return [];
    }

    const searchLower = key.toLowerCase();
    const groupedMatches = entries.reduce((result, entry) => {
        if ((entry.description || '').toLowerCase().includes(searchLower)) {
            if (!result.has(groupKey(entry))) {
                result.set(groupKey(entry), {
                    calories: entry.calories,
                    description: entry.description,
                    exercise: entry.exercise,
                    frequency: 1,
                });
            } else {
                const group = result.get(groupKey(entry));
                if (group) {
                    group.frequency++;
                }
            }
        }
        return result;
    }, new Map<string, AutoSuggestionModel>());

    return Array.from(groupedMatches.values())
        .sort(byFrequencyDescending)
        .slice(0, 4);
};

const byFrequencyDescending = (
    a: AutoSuggestionModel,
    b: AutoSuggestionModel
) => {
    if (a.frequency < b.frequency) {
        return 1;
    } else if (a.frequency > b.frequency) {
        return -1;
    } else {
        return 0;
    }
};
