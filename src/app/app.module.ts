import { LayoutModule } from '@angular/cdk/layout';
import { registerLocaleData } from '@angular/common';
import localeEnGb from '@angular/common/locales/en-GB';
import { ErrorHandler, LOCALE_ID, NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ServiceWorkerModule } from '@angular/service-worker';
import { OAuthModule, OAuthStorage } from 'angular-oauth2-oidc';
import { HttpClientModule } from '@angular/common/http';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

import { environment } from '../environments/environment';
import { AddEntryComponent } from './add-entry/add-entry.component';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DayEntriesComponent } from './day-entries/day-entries.component';
import { EditEntryComponent } from './edit-entry/edit-entry.component';
import { EntriesTableComponent } from './entries-table/entries-table.component';
import { LogSliderComponent } from './log-slider/log-slider.component';
import { MainNavComponent } from './main-nav/main-nav.component';
import { MaterialModule } from './material.module';
import { ClockService, LoggingService } from './services';
import { GlobalErrorHandler } from './services/global-error.handler';
import { UpdateService } from './services/update.service';
import { SettingsComponent } from './settings/settings.component';
import { TodaysEntriesComponent } from './todays-entries/todays-entries.component';
import { reducers } from './store';
import { LocalDbModule } from './local-db/local-db.module';

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
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        LayoutModule,
        ReactiveFormsModule,
        ServiceWorkerModule.register('ngsw-worker.js', {
            enabled: environment.production,
            registrationStrategy: 'registerImmediately',
        }),
        MaterialModule,
        OAuthModule.forRoot({
            resourceServer: {
                allowedUrls: ['https://localhost:5001/api'],
                sendAccessToken: true,
            },
        }),
        LocalDbModule,
        EffectsModule.forRoot(),
        StoreModule.forRoot(reducers),
    ],
    providers: [
        ClockService,
        LoggingService,
        UpdateService,
        {
            provide: ErrorHandler,
            useClass: GlobalErrorHandler,
        },
        { provide: LOCALE_ID, useValue: 'en-GB' },
        { provide: OAuthStorage, useValue: localStorage }
    ],
    bootstrap: [AppComponent],
    entryComponents: [TodaysEntriesComponent],
})
export class AppModule {}
