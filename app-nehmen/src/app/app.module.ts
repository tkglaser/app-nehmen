import { BrowserModule } from '@angular/platform-browser';
import { NgModule, LOCALE_ID, ErrorHandler } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LayoutModule } from '@angular/cdk/layout';
import { ReactiveFormsModule } from '@angular/forms';
import localeEnGb from '@angular/common/locales/en-GB';
import { registerLocaleData } from '@angular/common';
import { ServiceWorkerModule } from '@angular/service-worker';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MainNavComponent } from './main-nav/main-nav.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AddEntryComponent } from './add-entry/add-entry.component';
import { environment } from '../environments/environment';
import { TodaysEntriesComponent } from './todays-entries/todays-entries.component';
import { EditEntryComponent } from './edit-entry/edit-entry.component';
import { LogSliderComponent } from './log-slider/log-slider.component';
import { SettingsComponent } from './settings/settings.component';
import { DayEntriesComponent } from './day-entries/day-entries.component';
import { EntriesTableComponent } from './entries-table/entries-table.component';
import { GlobalErrorHandler } from './services/global-error.handler';
import {
    EntryService,
    ConfigService,
    ClockService,
    UniqueIdService,
    LoggingService
} from './services';
import { MaterialModule } from './material.module';
import { DropboxModule } from './dropbox/dropbox.module';
import { UpdateComponent } from './update/update.component';

registerLocaleData(localeEnGb, 'en-GB');

@NgModule({
    declarations: [
        AppComponent,
        MainNavComponent,
        DashboardComponent,
        AddEntryComponent,
        TodaysEntriesComponent,
        EditEntryComponent,
        LogSliderComponent,
        SettingsComponent,
        DayEntriesComponent,
        EntriesTableComponent,
        UpdateComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        LayoutModule,
        ReactiveFormsModule,
        ServiceWorkerModule.register('ngsw-worker.js', {
            enabled: environment.production
        }),
        MaterialModule,
        DropboxModule
    ],
    providers: [
        EntryService,
        ConfigService,
        UniqueIdService,
        ClockService,
        LoggingService,
        {
            provide: ErrorHandler,
            useClass: GlobalErrorHandler
        },
        { provide: LOCALE_ID, useValue: 'en-GB' }
    ],
    bootstrap: [AppComponent],
    entryComponents: [TodaysEntriesComponent]
})
export class AppModule {}
