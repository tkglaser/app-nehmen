import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DashboardComponent } from './dashboard/dashboard.component';
import { EditEntryComponent } from './edit-entry/edit-entry.component';
import { SettingsComponent } from './settings/settings.component';
import { DayEntriesComponent } from './day-entries/day-entries.component';

const routes: Routes = [
    {
        path: 'dashboard',
        component: DashboardComponent
    },
    {
        path: 'settings',
        component: SettingsComponent
    },
    { path: 'edit/:id', component: EditEntryComponent },
    { path: 'day/:id', component: DayEntriesComponent },
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {}
