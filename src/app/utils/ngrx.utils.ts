import { Store } from '@ngrx/store';
import { take } from 'rxjs/operators';

export function snapshot<T>(store: Store, selector: (state: any) => T) {
    let result: T;
    store
        .select(selector)
        .pipe(take(1))
        .subscribe((value) => {
            result = value;
        });
    return result;
}
