import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { DropboxRoutingModule } from './dropbox-routing.module';
import { AuthComponent } from './auth/auth.component';
import { MaterialModule } from '../material.module';
import { DropboxAuthService } from './services/dropbox-auth.service';
import { DropboxSettingsComponent } from './dropbox-settings/dropbox-settings.component';

@NgModule({
    declarations: [AuthComponent, DropboxSettingsComponent],
    imports: [
        CommonModule,
        DropboxRoutingModule,
        MaterialModule,
        ReactiveFormsModule
    ],
    providers: [DropboxAuthService],
    exports: [DropboxSettingsComponent]
})
export class DropboxModule {}
