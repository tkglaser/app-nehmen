import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CosmosClientService } from './services/cosmos-client.service';
import { CosmosDbService } from './services/cosmos-db.service';

@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
  providers:[CosmosClientService, CosmosDbService]
})
export class CosmosModule { }
