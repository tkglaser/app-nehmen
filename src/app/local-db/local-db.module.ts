import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EffectsModule } from '@ngrx/effects';

import { ConfigEffects } from './store/config.effects';
import { EntriesEffects } from './store/entries.effects';

@NgModule({
    declarations: [],
    imports: [
        CommonModule,
        EffectsModule.forFeature([ConfigEffects, EntriesEffects]),
    ],
})
export class LocalDbModule {}
