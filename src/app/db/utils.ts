import { Cursor } from 'idb';

export async function forEach<T>(
    cursor: Cursor<T, any>,
    callback: (item: T) => void
) {
    while (cursor) {
        callback(cursor.value);
        cursor = await cursor.continue();
    }
}

export async function skip<T>(cursor: Cursor<T, any>, skipItems: number) {
    if (skipItems) {
        await cursor.advance(skipItems);
    }
}

export async function take<T>(
    cursor: Cursor<T, any>,
    takeitems: number,
    callback: (item: T) => void
) {
    let itemsLeft = takeitems;
    while (cursor && itemsLeft) {
        callback(cursor.value);
        --itemsLeft;
        cursor = await cursor.continue();
    }
}
