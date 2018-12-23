import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthComponent } from './auth/auth.component';
import { DropboxTestComponent } from './dropbox-test/dropbox-test.component';

const routes: Routes = [
    { path: 'dropbox/auth', component: AuthComponent, pathMatch: 'prefix' },
    { path: 'dropbox/test', component: DropboxTestComponent }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class DropboxRoutingModule {}
