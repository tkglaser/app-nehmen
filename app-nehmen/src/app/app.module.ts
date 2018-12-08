import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
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
    MatRadioModule
} from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LayoutModule } from '@angular/cdk/layout';
import { ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MainNavComponent } from './main-nav/main-nav.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AddEntryComponent } from './add-entry/add-entry.component';
import { EntryService } from './services/entry.service';
import { ConfigService } from './services/config.service';
import { LocalStorageService } from './services/local-storage.service';

@NgModule({
    declarations: [
        AppComponent,
        MainNavComponent,
        DashboardComponent,
        AddEntryComponent
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
        ReactiveFormsModule
    ],
    providers: [EntryService, ConfigService, LocalStorageService],
    bootstrap: [AppComponent]
})
export class AppModule {}
