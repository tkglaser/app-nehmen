import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { DropboxRoutingModule } from './dropbox-routing.module';
import { AuthComponent } from './auth/auth.component';
import { DropboxTestComponent } from './dropbox-test/dropbox-test.component';
import { DropboxService } from './services/dropbox.service';
import { MaterialModule } from '../material.module';

@NgModule({
    declarations: [AuthComponent, DropboxTestComponent],
    imports: [CommonModule, DropboxRoutingModule, MaterialModule, ReactiveFormsModule],
    providers: [DropboxService]
})
export class DropboxModule {}
