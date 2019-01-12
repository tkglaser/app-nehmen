import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthComponent } from './auth/auth.component';
import { SyncLogComponent } from './sync-log/sync-log.component';

const routes: Routes = [
    { path: 'dropbox/auth', component: AuthComponent, pathMatch: 'prefix' },
    { path: 'dropbox/sync-log', component: SyncLogComponent }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class DropboxRoutingModule {}
