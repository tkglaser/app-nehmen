import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { DropboxAuthService } from '../services/dropbox-auth.service';


@Component({
    selector: 'app-auth',
    templateUrl: './auth.component.html',
    styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit {
    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private dropboxService: DropboxAuthService
    ) {
        this.route.fragment.subscribe(f => this.onFragmentReceived(f));
    }

    ngOnInit() {}

    onFragmentReceived(fragment: string) {
        const kvps = (fragment || '').split('&').map(kvp => kvp.split('='));
        const accesstoken = kvps.find(kvp => kvp[0] === 'access_token')[1];
        this.dropboxService.login(accesstoken);
        this.router.navigate(['/dropbox/test']);
    }
}
