import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class LocalStorageService {

    get<T>(key: string, defaultVal: T): T {
        try {
            const valueStr = localStorage.getItem(key);
            if (valueStr) {
                return JSON.parse(valueStr);
            }
        } catch {}
        return defaultVal;
    }

    set<T>(key: string, value: T) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch {}
    }
}
