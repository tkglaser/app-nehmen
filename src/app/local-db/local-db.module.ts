import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EffectsModule } from '@ngrx/effects';

import { ConfigEffects } from './store/config.effects';

@NgModule({
    declarations: [],
    imports: [CommonModule, EffectsModule.forFeature([ConfigEffects])],
})
export class LocalDbModule {}
