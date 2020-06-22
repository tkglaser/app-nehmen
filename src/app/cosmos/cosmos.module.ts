import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EffectsModule } from '@ngrx/effects';

import { CosmosClientService } from './services/cosmos-client.service';
import { CosmosDbService } from './services/cosmos-db.service';
import { ConfigEffects } from './store/config.effects';
import { EntriesEffects } from './store/entries.effects';

@NgModule({
    declarations: [],
    imports: [CommonModule, EffectsModule.forFeature([ConfigEffects, EntriesEffects])],
    providers: [CosmosClientService, CosmosDbService],
})
export class CosmosModule {}
