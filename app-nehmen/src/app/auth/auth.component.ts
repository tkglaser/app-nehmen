import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { DropboxService } from '../services';

@Component({
    selector: 'app-auth',
    templateUrl: './auth.component.html',
    styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit {
    constructor(
        private route: ActivatedRoute,
        private dropboxService: DropboxService
    ) {
        this.route.fragment.subscribe(f => this.onFragmentReceived(f));
    }

    ngOnInit() {}

    onFragmentReceived(fragment: string) {
        const kvps = (fragment || '').split('&').map(kvp => kvp.split('='));
        const accesstoken = kvps.find(kvp => kvp[0] === 'access_token')[1];
        this.dropboxService.doStuff(accesstoken);
    }
}
