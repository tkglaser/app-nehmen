import { NgModule } from '@angular/core';
import {
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatSelectModule,
    MatListModule,
    MatCardModule,
    MatGridListModule,
    MatMenuModule,
    MatInputModule,
    MatRadioModule,
    MatSliderModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTableModule,
    MatSlideToggleModule,
    MatAutocompleteModule
} from '@angular/material';

@NgModule({
    declarations: [],
    imports: [
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
        MatSnackBarModule,
        MatProgressSpinnerModule
    ],
    exports: [
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
        MatSnackBarModule,
        MatProgressSpinnerModule
    ]
})
export class MaterialModule {}
