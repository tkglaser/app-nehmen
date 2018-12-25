import { Component, OnInit } from '@angular/core';
import { SwUpdate, UpdateAvailableEvent } from '@angular/service-worker';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-update',
    templateUrl: './update.component.html',
    styleUrls: ['./update.component.scss']
})
export class UpdateComponent implements OnInit {
    enabled = false;
    available: Observable<UpdateAvailableEvent>;

    constructor(private swUpdate: SwUpdate) {}

    ngOnInit() {
        this.enabled = this.swUpdate.isEnabled;
        if (this.enabled) {
            this.available = this.swUpdate.available;
            this.swUpdate.checkForUpdate();
            console.log("CALLING CHECK 1234")
        }
    }

    onInstallUpdate() {}
}
