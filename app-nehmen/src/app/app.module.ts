import { BrowserModule } from '@angular/platform-browser';
import { NgModule, LOCALE_ID } from '@angular/core';
import {
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatGridListModule,
    MatCardModule,
    MatMenuModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatTableModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatAutocompleteModule
} from '@angular/material';
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
import { EntryService } from './services/entry.service';
import { ConfigService } from './services/config.service';
import { environment } from '../environments/environment';
import { TodaysEntriesComponent } from './todays-entries/todays-entries.component';
import { UniqueIdService } from './services/unique-id.service';
import { EditEntryComponent } from './edit-entry/edit-entry.component';
import { LogSliderComponent } from './log-slider/log-slider.component';
import { SettingsComponent } from './settings/settings.component';

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
        SettingsComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        LayoutModule,

        MatToolbarModule,
        MatButtonModule,
        MatSidenavModule,
        MatIconModule,
        MatListModule,
        MatGridListModule,
        MatCardModule,
        MatMenuModule,
        MatInputModule,
        MatSelectModule,
        MatRadioModule,
        MatTableModule,
        MatSliderModule,
        MatSlideToggleModule,
        MatAutocompleteModule,

        ReactiveFormsModule,
        ServiceWorkerModule.register('ngsw-worker.js', {
            enabled: environment.production
        })
    ],
    providers: [
        EntryService,
        ConfigService,
        UniqueIdService,
        { provide: LOCALE_ID, useValue: 'en-GB' }
    ],
    bootstrap: [AppComponent],
    entryComponents: [TodaysEntriesComponent]
})
export class AppModule {}
