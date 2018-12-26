import { dbNoUpgrade } from '../app/db/mini-db';
import { countUnsyncedEntries } from '../app/db/calory-store.sync';

async function doStuff() {
    const count = countUnsyncedEntries(dbNoUpgrade);
    console.log('THIS MANY TO SYNC ' + count);
}

doStuff();
